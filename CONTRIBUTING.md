# Contributing

If you're thinking of contributing, thank you, and _naturally_, please **be respectful** 🙋🏻‍♂️

## Issues

By opening an **Issue**, please describe the problem.<br />
If you can share a basic repro, it will be great.

---

## Pull Requests

By opening a **Pull Request**, please describe the proposed solution and what it solves.<br />
The final commit message will be generated from the _PR_ title by using "**Squash and Merge**".

---

## Developing

### ⚙️ Environment

You will need these tools installed on your system:

- [**Node.js**](https://nodejs.org/en/download/package-manager)

---

Fork this project, download your forked repository locally and create a new branch from `main`.<br />
Then run `npm ci` to clean install the _node_modules_:

```sh
npm ci
```

> Please, do not change the _package-lock.json_ manually.

### 🔧 Fixes

Where possible, provide an error test case that the fix covers.

### ❇️ Features

It's better to discuss an **API** before actually start implementing it. You can open an [**Issue on Github**](https://github.com/pokujs/istanbul/issues/new), so we can discuss the **API** design implementation ideas.

> Please ensure test cases to cover new features.

### 📘 Documentation

The documentation is held within the main [**Poku**](https://github.com/wellwelwel/poku/tree/main/website) repository.

---

## Testing

### 👩🏻‍🏭 General

```sh
npm test
```

- Run the test suite.

---

### 👔 Lint

```sh
npm run lint
```

> Also
>
> ```sh
> npm run lint:fix
> ```
>
> - Automatically repairs most lint errors.
