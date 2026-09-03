# Enclave.Web

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=EnsyInc_Enclave.Web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=EnsyInc_Enclave.Web)

Frontend for EnsyInc's Licensing + Monitoring platform. The backend lives in [EnsyInc/Enclave](https://github.com/EnsyInc/Enclave).

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

To execute end-to-end tests with [Playwright](https://playwright.dev/), use the following command:

```bash
npm run e2e
```

## Linting

To lint the project, use the following command:

```bash
ng lint
```

## Formatting

To format the codebase with [Prettier](https://prettier.io/), use the following command:

```bash
npx prettier --write .
```
