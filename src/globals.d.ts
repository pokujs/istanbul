declare module '@bcoe/v8-coverage' {
  interface ProcessCov {
    result: import('node:inspector').Profiler.ScriptCoverage[];
  }

  function mergeProcessCovs(processCovs: ProcessCov[]): ProcessCov;
}
