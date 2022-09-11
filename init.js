import path from "path";
import glob from "glob";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function init() {
  const usrPkgPath = path.resolve(process.cwd(), "./package.json");

  let pkg = await readFile(usrPkgPath, "utf8");
  pkg = JSON.parse(pkg);

  // 添加命令
  const scripts = {
    "lint:prettier":
      "prettier ./src ./test --write --no-error-on-unmatched-pattern",
    "lint:script": "eslint ./src ./test --ext .js,.jsx,.ts,.tsx,.vue --fix",
    lint: "npm run lint:script && npm run lint:prettier",
    test: "jest",
    build: "m78-build-tools build",
    pub: "cd dist && npm publish --access public --registry https://registry.npmjs.org",
  };

  pkg.scripts = {
    ...pkg.scripts,
    ...scripts,
  };

  pkg.devDependencies = {
    ...pkg.devDependencies,
    "@m78/build-tools": "*",
  };

  pkg.files = ["**"];
  pkg.main = "index.js";
  pkg.type = "module";
  pkg.typings = "./";

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
