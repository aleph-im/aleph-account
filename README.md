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

## Contributing to this repository

We use [husky](https://typicode.github.io/husky/) to ensure that the code is properly linted before it is commited. Each time you'll try to commit, a git hook is triggered that will run the linter, if the code you're trying to commit is not properly linted the process will exit. 

In order to enable Husky on your system, run:
```shell
npx husky install
```

Although not reccomended you can still bypass the pre-commit hook by using the `--no-verify` option.
```shell
git commit -m 'message' --no-verify
```
