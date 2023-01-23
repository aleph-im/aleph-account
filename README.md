# Aleph.im's Account management dApp 

This is the account management dApp for Aleph.im, available on https://account.aleph.im/

## Install the dependencies

Use Node 14.

```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## In a Docker container:

```bash
docker run --rm -ti -v (pwd):/mnt -w /mnt -p 8080:8080 node:14 yarn
docker run --rm -ti -v (pwd):/mnt -w /mnt -p 8080:8080 node:14 ./node_modules/@quasar/app/bin/quasar dev
```

## Feature flags

A feature flag, also known as a feature toggle, is a technique used in software development to enable or disable a certain feature or functionality of the application. 

Feature flags are defined in [quasar.conf.js](./quasar.conf.js) (in `build>env`) and injected in the [application store](./src/store/index.js) during build (nested under the `feature_enabled` property).

To enable a certain feature you'll have to set the according environment variable before building the assets. ex: `FEATURE_SOLANA=1 yarn dev` will launch a development server with the solana login enabled, and `FEATURE_SOLANA=1 npx quasar build` will build the application with the solana login. Valid values for feature flags are : `1` = enabled, `0` = disabled.

Calling the scripts with no environment variables will use the default value set in `quasar.conf.js`