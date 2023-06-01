# Identicons

identicons service

## Preparation
This repo rely on spritejs, which rely on node-canvas-webgl. If you are running this repo on MacOS, you should install python2 first.

> Just follow the instruction to install python2: https://stackoverflow.com/questions/70098133/npm-error-cant-find-python-executable-in-macos-big-sur

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## browser access http://127.0.0.1:22000/identicon/{param}

For example: http://127.0.0.1:22000/identicon/helloworld.bit

## pm2 deployment
```bash
npm run start:pm2
```
