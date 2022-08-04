import path from "path";
import glob from "glob";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// import cPkg from "./package.json";

export async function init() {
  const usrPkgPath = path.resolve(process.cwd(), "./package.json");

  let pkg = await readFile(usrPkgPath, "utf8");
  pkg = JSON.parse(pkg);

  // 添加命令
  const scripts = {
    "lint:style": "prettier . --write --no-error-on-unmatched-pattern",
    "lint:script": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    lint: "npm run lint:script && npm run lint:style",
    build: "m78-lib-build build",
    postbuild:
      "copyfiles package.json dist && copyfiles -u 1 esm dist && copyfiles umd dist",
    pub: "cd dist && npm publish --access public --registry https://registry.npmjs.org",
    test: "jest",
    clear: "rimraf ./esm ./umd",
  };

  pkg.scripts = {
    ...pkg.scripts,
    ...scripts,
  };

  pkg.files = ["**"];

  await writeFile(usrPkgPath, JSON.stringify(pkg, null, 2));

  // 复制文件
  const copeFiles = [
    path.resolve(__dirname, "./.eslintignore"),
    path.resolve(__dirname, "./.prettierignore"),
    ...glob.sync(path.resolve(__dirname, "./_copy-files/**/*"), {
      absolute: true,
      dot: true,
    }),
  ];

  const copyTasks = copeFiles.map((filepath) =>
    copyFile(filepath, path.resolve(process.cwd(), path.basename(filepath)))
  );

  await Promise.all(copyTasks);
}
