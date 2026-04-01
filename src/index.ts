import type { Profiler } from 'node:inspector';
import type { PokuPlugin } from 'poku/plugins';
import type { CoverageOptions } from './types.js';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export type { CoverageOptions } from './types.js';

const getSourcesFromCache = (
  cache: Record<string, { data?: unknown; lineLengths?: number[] }>,
  url: string
): { sourceMap?: { sourcemap: unknown }; source?: string } => {
  const entry = cache[url];
  if (!entry?.data) return Object.create(null);

  const sources: { sourceMap: { sourcemap: unknown }; source?: string } = {
    sourceMap: { sourcemap: entry.data },
  };

  if (entry.lineLengths) {
    sources.source = entry.lineLengths
      .map((length) => '.'.repeat(length))
      .join('\n');
  }

  return sources;
};

const minimatch = (path: string, pattern: string): boolean => {
  const regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '(.+/)?')
    .replace(/\*\*/g, '.*')
    .replace(/(?<!\.)(\*)/g, '[^/]*');

  return new RegExp(`^${regex}$`).test(path);
};

export const coverage = (
  options: CoverageOptions = Object.create(null)
): PokuPlugin => {
  let tempDir: string;
  let originalEnv: string | undefined;
  let userProvidedTempDir: boolean;

  return {
    name: '@pokujs/istanbul',

    setup(context) {
      if (context.runtime !== 'node')
        console.warn(
          `[@pokujs/istanbul] Istanbul coverage is only supported on Node.js (current runtime: ${context.runtime}). Coverage data may not be collected.`
        );

      originalEnv = process.env.NODE_V8_COVERAGE;
      userProvidedTempDir = typeof options.tempDirectory === 'string';

      tempDir = userProvidedTempDir
        ? options.tempDirectory!
        : mkdtempSync(join(tmpdir(), 'poku-istanbul-'));

      if (options.clean !== false) {
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Best-effort cleanup
        }
        mkdirSync(tempDir, { recursive: true });
      }

      process.env.NODE_V8_COVERAGE = tempDir;
    },

    async teardown(context) {
      originalEnv !== undefined
        ? (process.env.NODE_V8_COVERAGE = originalEnv)
        : delete process.env.NODE_V8_COVERAGE;

      const reporter = Array.isArray(options.reporter)
        ? options.reporter
        : [options.reporter ?? 'text'];

      const reportsDirectory = resolve(
        context.cwd,
        options.reportsDirectory ?? './coverage'
      );

      const { default: v8ToIstanbul } = await import('v8-to-istanbul');
      const { default: libCoverage } = await import('istanbul-lib-coverage');
      const { default: libReport } = await import('istanbul-lib-report');
      const { default: reports } = await import('istanbul-reports');

      const coverageMap = libCoverage.createCoverageMap(Object.create(null));

      const exclude = options.exclude ?? [];
      const include = options.include ?? [];

      const coverageFiles = readdirSync(tempDir).filter((f) =>
        f.endsWith('.json')
      );

      const sourceMapCache: Record<
        string,
        { data?: unknown; lineLengths?: number[] }
      > = Object.create(null);

      const processCovs: { result: Profiler.ScriptCoverage[] }[] = [];

      for (const file of coverageFiles) {
        const raw = JSON.parse(readFileSync(join(tempDir, file), 'utf8'));

        if (raw['source-map-cache'])
          Object.assign(sourceMapCache, raw['source-map-cache']);

        if (!Array.isArray(raw.result)) continue;

        const normalized: Profiler.ScriptCoverage[] = [];

        for (const entry of raw.result as Profiler.ScriptCoverage[]) {
          if (/^node:/.test(entry.url)) continue;

          if (entry.url.startsWith('file://')) {
            try {
              entry.url = fileURLToPath(entry.url);
            } catch {
              continue;
            }
          }

          if (isAbsolute(entry.url)) normalized.push(entry);
        }

        processCovs.push({ result: normalized });
      }

      const { mergeProcessCovs } = await import('@bcoe/v8-coverage');
      let merged = mergeProcessCovs(processCovs) as {
        result: Profiler.ScriptCoverage[];
      };

      if (options.all) {
        const coveredPaths = new Set(merged.result.map((r) => r.url));
        const srcDirs = options.src ?? [context.cwd];
        const emptyEntries: Profiler.ScriptCoverage[] = [];

        for (const srcDir of srcDirs) {
          const absDir = resolve(context.cwd, srcDir);
          let dirEntries: { name: string; isDirectory(): boolean }[];

          try {
            dirEntries = readdirSync(absDir, {
              withFileTypes: true,
              recursive: true,
            });
          } catch {
            continue;
          }

          for (const dirEntry of dirEntries) {
            if (dirEntry.isDirectory()) continue;

            const fullPath = join(
              (dirEntry as { parentPath?: string }).parentPath ??
                (dirEntry as unknown as { path: string }).path,
              dirEntry.name
            );

            if (fullPath.includes('/node_modules/')) continue;
            if (coveredPaths.has(fullPath)) continue;

            const relativePath = fullPath.startsWith(context.cwd)
              ? fullPath.slice(context.cwd.length + 1)
              : fullPath;

            if (include.length > 0) {
              if (!include.some((p) => minimatch(relativePath, p))) continue;
            }
            if (exclude.some((p) => minimatch(relativePath, p))) continue;

            try {
              const size = statSync(fullPath).size;
              emptyEntries.push({
                scriptId: '0',
                url: fullPath,
                functions: [
                  {
                    functionName: '(empty-report)',
                    ranges: [{ startOffset: 0, endOffset: size, count: 0 }],
                    isBlockCoverage: true,
                  },
                ],
              });
            } catch {
              // Skip inaccessible files
            }
          }
        }

        if (emptyEntries.length > 0) {
          merged = mergeProcessCovs([{ result: emptyEntries }, merged]) as {
            result: Profiler.ScriptCoverage[];
          };
        }
      }

      for (const entry of merged.result) {
        const scriptPath = entry.url;

        if (scriptPath.includes('/node_modules/')) continue;

        const relativePath = scriptPath.startsWith(context.cwd)
          ? scriptPath.slice(context.cwd.length + 1)
          : scriptPath;

        if (include.length > 0) {
          const matched = include.some((pattern) =>
            minimatch(relativePath, pattern)
          );

          if (!matched) continue;
        }

        if (exclude.some((pattern) => minimatch(relativePath, pattern)))
          continue;

        try {
          const sources = getSourcesFromCache(
            sourceMapCache,
            pathToFileURL(scriptPath).href
          );

          const converter = v8ToIstanbul(
            scriptPath,
            0,
            sources as Parameters<typeof v8ToIstanbul>[2]
          );

          await converter.load();
          converter.applyCoverage(entry.functions);
          coverageMap.merge(converter.toIstanbul());
        } catch {
          // Skip files that can't be converted
        }
      }

      const reportContext = libReport.createContext({
        dir: reportsDirectory,
        watermarks: options.watermarks,
        coverageMap,
      });

      for (const r of reporter) {
        reports
          .create(r as 'text', {
            skipFull: options.skipFull ?? false,
            maxCols: process.stdout.columns || 100,
          })
          .execute(reportContext);
      }

      if (options.checkCoverage) {
        const threshold =
          typeof options.checkCoverage === 'number'
            ? options.checkCoverage
            : undefined;

        const metricNames = [
          'lines',
          'branches',
          'functions',
          'statements',
        ] as const;

        const thresholds = Object.fromEntries(
          metricNames.map((m) => [m, threshold ?? options[m] ?? 0])
        ) as Record<(typeof metricNames)[number], number>;

        const checkThresholds = (
          summary: import('istanbul-lib-coverage').CoverageSummary,
          label: string
        ) => {
          for (const metric of metricNames) {
            if (summary[metric].pct >= thresholds[metric]) continue;

            process.exitCode = 1;
            console.error(
              `ERROR: Coverage for ${metric} (${summary[metric].pct}%) does not meet ${label} threshold (${thresholds[metric]}%)`
            );
          }
        };

        const summaries: [
          import('istanbul-lib-coverage').CoverageSummary,
          string,
        ][] = options.perFile
          ? coverageMap
              .files()
              .map((file) => [
                coverageMap.fileCoverageFor(file).toSummary(),
                file,
              ])
          : [[coverageMap.getCoverageSummary(), 'global']];

        for (const [summary, label] of summaries)
          checkThresholds(summary, label);
      }

      if (!userProvidedTempDir) {
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch {
          // Best-effort cleanup
        }
      }
    },
  };
};
