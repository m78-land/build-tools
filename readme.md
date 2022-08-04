> simple builder for M78 projects, which also contain several developer tools.

## usage

add `@m78/lib-build` package to your project.

### init(optional)

generate config via cli, ⚠️ this operation to be overwrite same name file.

```shell
npx m78-lib-build init
```

will create follow files:

```shell
.eslintignore
.eslintrc.cjs
.prettierignore
.prettierrc.cjs
jest.config.js
m78-lib.config.js
```

and edit pageage.json

```shell
{
  "scripts": {
    "lint:style": "prettier . --write --no-error-on-unmatched-pattern",
    "lint:script": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "lint": "npm run lint:script && npm run lint:style",
    "build": "m78-lib-build build",
    "postbuild":
      "copyfiles package.json dist && copyfiles -u 1 esm dist && copyfiles umd dist",
    "pub": "cd dist && npm publish --access public --registry https://registry.npmjs.org",
    "test": "jest",
    "clear": "rimraf ./esm ./umd",
  },
  "files": [
    "**"
  ]
}
```

### build

1. add `m78-lib.config.js` to project root.

```ts
import sass from "sass";
import { mkdir, writeFile } from "node:fs/promises";

export default {
  build: [
    {
      inpDir: "src",
      outDir: "esm",
      swcConfig: {
        module: {
          type: "es6",
        },
      },
      // All non js/ts/jsx/tsx files will be copied to outdir by default. You can compile them or do any other operations before copy.
      beforeCopy: async (meta) => {
        if (meta.suffix === ".scss") {
          const result = sass.compile(meta.filePath);

          await mkdir(meta.outDir, { recursive: true });
          await writeFile(meta.outPath.replace(/\.scss$/, ".css"), result.css);

          return true; // prevent default copy operation
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
};
```

2.run `npx m78-lib-build build`

### test config

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

### lint config

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
