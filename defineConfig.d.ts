import { Config as SwcConfig } from "@swc/core";

interface BeforeCopyMeta {
  /** 输出目录 */
  outDir: string;
  /** 输出路径 */
  outPath: string;
  /** 原文件路径 */
  filePath: string;
  /** 原文件后缀 */
  suffix: string;
}

type Config = {
  build: {
    /** 需要编译的目录 */
    inpDir: string;
    /** 输出目录 */
    outDir: string;
    /** swc配置 */
    swcConfig: SwcConfig;
    /** 要过滤的文件(通过glob匹配), 例如要排除play和demo目录 '**\/*(play|demo)/*' */
    ignore?: string[];
    /** 支持编译的文件后缀 */
    extensions?: string[];
    /** true| 是否直接复制不支持编译的文件 */
    copyfile?: boolean;
    /**
     * 执行复制操作之前, 会先经过此钩子, 可以在此对这些文件进行转换
     * - 如果返回true, 表示自行进行该文件的处理和复制操作, 内部不会再进行任何操作
     * */
    beforeCopy: (meta: BeforeCopyMeta) => Promise<boolean | void>;
  }[];
};

export function defineConfig(conf: Config): Config;
