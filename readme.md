> simple builder for M78 projects, which also contain several developer tools.

## usage

### auto inject config

generate config via cli, ⚠️ this operation will be overwrite same name file and change package.json

```shell
npx m78-build-tools init
```

will create below files:

```shell
.eslintrc.cjs
.npmrc
.prettierrc.cjs
jest.config.js
m78-lib.config.js
tsconfig.json
```

and edit pageage.json

```shell
{
  "scripts": {
    "lint:prettier": "prettier ./src ./test --write --no-error-on-unmatched-pattern",
    "lint:script": "eslint ./src ./test --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "lint": "npm run lint:script && npm run lint:prettier",
    "test": "jest",
    "build": "m78-build-tools build",
    "pub": "cd dist && npm publish --access public --registry https://registry.npmjs.org",
  },
  "files": [
    "**"
  ],
  "main": "index.js",
  "type": "module",
  "typings": "./",
  "devDependencies": {
    "@m78/build-tools": "*",
  }
}
```

### manual

#### build

1. add `m78-lib.config.js` to project root.

```ts
import sass from "sass";
import { mkdir, writeFile } from "node:fs/promises";
import { defineConfig } from "@m78/build-tools/defineConfig.js";

export default defineConfig({
  build: [
    {
      inpDir: "src",
      outDir: "esm",
      swcConfig: {
        module: {
          type: "es6",
        },
      },
      beforeCopy: async (meta) => {
        if (meta.suffix === ".scss") {
          const result = sass.compile(meta.filePath);

          await mkdir(meta.outDir, { recursive: true });
          await writeFile(meta.outPath.replace(/\.scss$/, ".css"), result.css);

          return true;
        }
      },
    },
    {
      inpDir: "src",
      outDir: "umd",
      swcConfig: {
        module: {
          type: "umd",
        },
      },
    },
  ],
});
```

2.run `npx m78-build-tools build`

#### test

built-in test by `jest` and `@testing-library/react`.

1. add `jest.config.js` to project root.

```ts
export { default } from "@m78/lib-build/jest.config.js";
```

2. write test code

3. run test

```shell
npx jest
```

#### lint

provide eslint and prettier base config, usage by follow:

1. add config

.eslintrc.cjs

```js
module.exports = {
  extends: [require.resolve("@m78/lib-build/.eslintrc.cjs")],
  rules: {},
};
```

.prettierrc.cjs

```js
const config = require("@m78/lib-build/.prettierrc.cjs");

module.exports = {
  ...config,
};
```
