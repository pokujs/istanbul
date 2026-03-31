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
