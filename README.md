<div align="center">
<img height="180" alt="Poku's Logo" src="https://raw.githubusercontent.com/wellwelwel/poku/main/.github/assets/readme/poku.svg">

# @pokujs/istanbul

Enjoying **Poku**? [Give him a star to show your support](https://github.com/wellwelwel/poku) ⭐

</div>

---

📚 [**Documentation**](https://poku.io/docs/documentation/helpers/coverage/istanbul)

---

☔️ [**@pokujs/istanbul**](https://github.com/pokujs/istanbul) is a **Poku** plugin for **Istanbul** code coverage.

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
  // Reporters
  reporter: ['text', 'lcov'], // default: ['text']

  // File selection
  include: ['src/**'], // default: [] (all files)
  exclude: ['**/*.test.ts'], // default: []

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

---

## How It Works

- **`setup`** creates a temp directory and sets `NODE_V8_COVERAGE` — every test process spawned by **Poku** automatically writes **V8** coverage data
- **`teardown`** converts V8 coverage to Istanbul format using source maps, generates reports via Istanbul reporters, optionally checks thresholds, then cleans up
- No modification to test commands or runner configuration needed

---

## License

**MIT** © [**wellwelwel**](https://github.com/wellwelwel) and [**contributors**](https://github.com/pokujs/istanbul/graphs/contributors).
