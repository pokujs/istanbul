type KnownReporter =
  | 'clover'
  | 'cobertura'
  | 'html'
  | 'json'
  | 'json-summary'
  | 'lcov'
  | 'lcovonly'
  | 'none'
  | 'teamcity'
  | 'text'
  | 'text-lcov'
  | 'text-summary';

type Reporter = KnownReporter | (string & NonNullable<unknown>);

export type CoverageOptions = {
  /**
   * Path to a JSONC/JSON configuration file.
   *
   * - `string` — load that specific file
   * - `false` — disable config file discovery
   * - `undefined` (default) — auto-discover `.nycrc`, `.nycrc.json`,
   *   or `.nycrc.jsonc`, walking up from `cwd`.
   */
  config?: string | false;

  /**
   * Require the `--coverage` CLI flag to activate coverage collection.
   *
   * When `true`, coverage only runs if `--coverage` is passed to the CLI.
   * When `false`, coverage runs whenever the plugin is active.
   *
   * @default false
   */
  requireFlag?: boolean;

  /** Coverage reporters to use. */
  reporter?: Reporter | Reporter[];

  /** Directory where coverage reports are written. */
  reportsDirectory?: string;

  /**
   * Directory where V8 writes raw coverage JSON files.
   *
   * When provided, the directory is **not** auto-cleaned after report generation.
   */
  tempDirectory?: string;

  /** Glob patterns for source files to include (empty = all). */
  include?: string[];

  /** Glob patterns for source files to exclude. */
  exclude?: string[];

  /**
   * Include files that were never loaded by any test (reported as 0% coverage).
   *
   * Use `src` to control which directories are scanned.
   */
  all?: boolean;

  /** Directories to scan when `all` is `true`. */
  src?: string[];

  /** Delete previous coverage data before running. */
  clean?: boolean;

  /**
   * Enforce coverage thresholds.
   *
   * - `true` — check using individual `lines`, `branches`, `functions`, and `statements` values.
   * - `number` — set all thresholds to that value (e.g., `100` means 100% for all metrics).
   *
   * When a threshold is not met, `process.exitCode` is set to `1`.
   */
  checkCoverage?: boolean | number;

  /** Check thresholds per file instead of globally. */
  perFile?: boolean;

  /** Minimum line coverage percentage. */
  lines?: number;

  /** Minimum branch coverage percentage. */
  branches?: number;

  /** Minimum function coverage percentage. */
  functions?: number;

  /** Minimum statement coverage percentage. */
  statements?: number;

  /** Skip files with 100% coverage in the text report. */
  skipFull?: boolean;

  /** Custom watermark thresholds for report coloring. */
  watermarks?: Record<string, [number, number]>;
};
