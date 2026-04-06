<div align="center">
<img height="180" alt="Poku's Logo" src="https://raw.githubusercontent.com/wellwelwel/poku/main/.github/assets/readme/poku.svg">

# @pokujs/istanbul

Enjoying **Poku**? [Give him a star to show your support](https://github.com/wellwelwel/poku) ⭐

</div>

---

📚 [**Documentation**](https://poku.io/docs/documentation/helpers/coverage/istanbul)

---

☔️ [**@pokujs/istanbul**](https://github.com/pokujs/istanbul) is a **Poku** plugin for **Istanbul** code coverage.

> [!TIP]
>
> **@pokujs/istanbul** supports **JSONC** config files (`.nycrc`, etc.) out of the box, allowing comments in your configuration. You can also use **JS** and **TS** by setting the options directly in the plugin.

---

## Quickstart

### Install

```bash
npm i -D @pokujs/istanbul
```

### Enable the Plugin

```js
// poku.config.js
import { coverage } from '@pokujs/istanbul';
import { defineConfig } from 'poku';

export default defineConfig({
  plugins: [coverage()],
});
```

That's it! Run `poku` and a coverage summary will be printed after your test results.

> [!IMPORTANT]
>
> This plugin relies on **Node.js**' built-in `NODE_V8_COVERAGE` environment variable to collect coverage data and **Istanbul** libraries to generate reports. **Bun** and **Deno** do not support this mechanism, so coverage data will not be collected when running tests with these runtimes.

---

## Options

```js
coverage({
  // Config file (.nycrc, .nycrc.json, .nycrc.jsonc)
  config: '.nycrc', // default: auto-discover

  // Activation
  requireFlag: true, // default: false

  // Reporters
  reporter: ['text', 'lcov'], // default: ['text']

  // File selection
  include: ['src/**'], // default: [] (all files)
  exclude: ['**/*.test.ts'], // default: []

  // Include untested files
  all: true, // default: false
  src: ['src'], // default: [cwd]

  // Thresholds
  checkCoverage: true, // default: false
  lines: 80, // default: 0
  branches: 80, // default: 0
  functions: 80, // default: 0
  statements: 80, // default: 0
  perFile: false, // default: false

  // Output
  reportsDirectory: './coverage', // default: './coverage'
  tempDirectory: '.v8-coverage', // default: auto (temp dir)
  skipFull: false, // default: false
  clean: true, // default: true

  // Report coloring
  watermarks: {
    lines: [80, 95],
    functions: [80, 95],
    branches: [80, 95],
    statements: [80, 95],
  },
});
```

---

## Examples

### Basic text coverage

```js
coverage({
  include: ['src/**'],
});
```

### Generate HTML and LCOV reports

```js
coverage({
  include: ['src/**'],
  reporter: ['text', 'html', 'lcov'],
});
```

### Enforce coverage thresholds

Set a single threshold for all metrics at once by passing a `number`:

```js
coverage({
  include: ['src/**'],
  checkCoverage: 100,
});
```

Or use `true` to set individual thresholds for each metric:

```js
coverage({
  include: ['src/**'],
  checkCoverage: true,
  lines: 95,
  branches: 90,
  functions: 85,
  statements: 95,
});
```

### Require `--coverage` flag

By default, coverage runs whenever the plugin is active. Use `requireFlag` to only collect coverage when `--coverage` is passed to the CLI, keeping watch mode, debugging, and filtered runs fast:

```js
coverage({
  include: ['src/**'],
  requireFlag: true,
});
```

```bash
# No coverage (plugin is a no-op)
poku test/

# With coverage
poku --coverage test/
```

### Using a config file

Reuse your existing `.nycrc` or any JSON/JSONC config file with comments:

```jsonc
// .nycrc
{
  // Only cover source files
  "include": ["src/**"],
  "reporter": ["text", "lcov"],
  "check-coverage": true,
  "lines": 90,
}
```

```js
coverage({
  config: '.nycrc', // or false to disable auto-discovery
});
```

When no `config` is specified, the plugin automatically searches for `.nycrc`, `.nycrc.json`, or `.nycrc.jsonc` in the working directory.

You can also specify the config path via CLI:

```bash
poku --coverage-config=.nycrc test/
```

> [!NOTE]
>
> **Priority order:**
>
> - For config file discovery: `--coverage-config` (CLI) > `config` (plugin option) > auto-discovery
> - For coverage options: plugin options > config file options

### Using with `@pokujs/multi-suite`

Place the `coverage` plugin at the **root level**, before `multiSuite`:

```js
import { coverage } from '@pokujs/istanbul';
import { multiSuite } from '@pokujs/multi-suite';
import { defineConfig } from 'poku';

export default defineConfig({
  plugins: [
    coverage({ include: ['src/**'] }),
    multiSuite([
      defineConfig({ include: ['test/unit'], concurrency: 8 }),
      defineConfig({ include: ['test/e2e'], sequential: true }),
    ]),
  ],
});
```

> Since `coverage` sets `NODE_V8_COVERAGE` during `setup`, every test process across all sub-suites writes to the same temp directory — `teardown` then merges everything into a single report.

---

## How It Works

- **`setup`** creates a temp directory and sets `NODE_V8_COVERAGE` — every test process spawned by **Poku** automatically writes **V8** coverage data
- **`teardown`** converts V8 coverage to Istanbul format using source maps, generates reports via Istanbul reporters, optionally checks thresholds, then cleans up
- No modification to test commands or runner configuration needed

---

## License

**MIT** © [**wellwelwel**](https://github.com/wellwelwel) and [**contributors**](https://github.com/pokujs/istanbul/graphs/contributors).
