import swc from "@swc/core";
import path from "path";
import glob from "glob";
import { writeFile, mkdir, copyFile, rm } from "node:fs/promises";
import _ from "lodash";
import { config } from "./config.js";

export async function build() {
  const res = await import(`${process.cwd()}/m78-lib.config.js`);

  const buildConf = res.default?.build;

  await Promise.all(buildConf.map(run));
}

async function run({
  inpDir,
  outDir,
  swcConfig,
  extensions = ["js", "ts", "jsx", "tsx"],
  ignore,
  copyfile = true,
  beforeCopy,
}) {
  const inpDirBase = path.resolve(process.cwd(), inpDir);
  const outDirBase = path.resolve(process.cwd(), outDir);
  const conf = _.defaultsDeep({}, swcConfig, config);

  const files = glob.sync(path.resolve(process.cwd(), `${inpDir}/**/*.*`), {
    ignore, // 忽略play和demo目录
    absolute: true,
    dot: true,
  });

  if (!files.length) {
    throw Error("no match files");
  }

  const copyList = [];
  const compileList = [];

  const suffixPattern = new RegExp(`.(${extensions.join("|")})$`);

  files.forEach((i) => {
    if (suffixPattern.test(i)) {
      compileList.push(i);
    } else {
      copyList.push(i);
    }
  });

  await rm(outDirBase, {
    recursive: true,
  }).catch(() => {});

  // 编译
  await outputFile({
    compileList,
    inpDirBase,
    outDirBase,
    conf,
  });

  // 复制文件
  if (copyfile) {
    await copyFileHandle({ copyList, inpDirBase, outDirBase, beforeCopy });
  }
}

async function outputFile({ compileList, inpDirBase, outDirBase, conf }) {
  const list = [];

  for (const filePath of compileList) {
    const outPath = filePath
      .replace(inpDirBase, outDirBase)
      .replace(/\.(js|jsx|ts|tsx)$/, ".js");

    await swc
      .transformFile(filePath, conf)
      .then((output) => {
        list.push([output, outPath]);
      })
      .catch((err) => {
        throw Error(err);
      });
  }

  const tasks = list.map(([output, outPath]) => {
    return (async () => {
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, output.code);

      if (output.map) {
        await writeFile(`${outPath}.map`, output.map);
      }
    })();
  });

  await Promise.all(tasks);

  console.log(`✨ compile completed.`);
}

async function copyFileHandle({
  copyList,
  inpDirBase,
  outDirBase,
  beforeCopy,
}) {
  for (const copyPath of copyList) {
    const outPath = copyPath.replace(inpDirBase, outDirBase);

    const meta = {
      outPath,
      outDir: path.dirname(outPath),
      filePath: copyPath,
      suffix: path.extname(outPath),
    };

    const isHandled = beforeCopy ? await beforeCopy(meta) : false;

    if (!isHandled) {
      await mkdir(path.dirname(outPath), { recursive: true });
      await copyFile(meta.filePath, outPath);
    }

    console.log(`✨ copy completed.`);
  }
}
