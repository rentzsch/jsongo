# Webpack Example

Demo of the ES modules (`target: 'web'`) and CommonJS (`target: 'node'`) bundles in Webpack.

## Usage

```sh
# Install dependencies
yarn
# Build for production (slower) ...
yarn build
# ...or for development (faster)
yarn build:dev
# Run browser bundle (memory DB)
yarn run:browser
# Run node bundle (fs DB)
yarn run:node
```

## Internal

```sh
# Build a prod bundle
yarn build
# Test tree-shaking in browser bundle
# NOTE: when target: 'node', webpack ignores "module" field
yarn test:tree-shaking
```
