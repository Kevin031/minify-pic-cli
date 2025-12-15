#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const readline = require("readline");
const { Command } = require("commander");

// 默认配置参数
const DEFAULT_CONFIG = {
  targetDir: process.cwd(), // 需要压缩的目录(可包含子目录)
  outputDir: path.join(process.cwd(), "output"), // 输出目录
  quality: 80, // 压缩质量 0 - 100
  gifColours: 128, // GIF调色板最大数量
  blackDirs: ["no"], // 排除的子文件夹名称
};

// 询问用户是否继续
function askUserToContinue() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(`当前目录路径为: ${process.cwd()}`);
    rl.question("是否需要压缩当前目录的所有图片？Y/N：", (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

// 获取文件大小（带单位，自动转换MB/KB）
function getFileSizeWithUnit(filePath) {
  const stats = fs.statSync(filePath);
  const sizeInBytes = stats.size;
  const sizeInMB = sizeInBytes / 1024 / 1024;
  if (sizeInMB >= 1) {
    return sizeInMB.toFixed(2) + "MB";
  } else {
    const sizeInKB = sizeInBytes / 1024;
    if (sizeInKB < 0.01 && sizeInBytes > 0) {
      return "<0.01KB";
    }
    return sizeInKB.toFixed(2) + "KB";
  }
}

// 压缩单张图片
async function compressImage(filePath, config, baseDir = config.targetDir) {
  const beforeSize = getFileSizeWithUnit(filePath);
  sharp.cache(false);

  const ext = path.extname(filePath).toLowerCase();
  let sharpInstance;

  switch (ext) {
    case ".png":
      sharpInstance = sharp(filePath).png({ quality: config.quality });
      break;
    case ".jpg":
    case ".jpeg":
      sharpInstance = sharp(filePath).jpeg({ quality: config.quality });
      break;
    case ".gif":
      sharpInstance = sharp(filePath, {
        animated: true,
        limitInputPixels: false,
      }).gif({ colours: config.gifColours });
      break;
    default:
      throw new Error(`不支持的文件类型: ${ext}`);
  }

  // 原地替换模式或输出到新目录
  let outputFilePath;
  let outputFileDir;
  
  if (config.replace) {
    // 原地替换：使用临时文件
    outputFilePath = filePath + '.tmp';
    outputFileDir = path.dirname(outputFilePath);
  } else {
    // 保持目录结构输出到新目录
    const relativePath = path.relative(baseDir, filePath);
    outputFilePath = path.join(config.outputDir, relativePath);
    outputFileDir = path.dirname(outputFilePath);
  }

  try {
    if (!fs.existsSync(outputFileDir)) {
      fs.mkdirSync(outputFileDir, { recursive: true });
    }
    const buffer = await sharpInstance.toBuffer();
    fs.writeFileSync(outputFilePath, buffer);
    fs.chmodSync(outputFilePath, 0o646);
    
    // 如果是原地替换模式，将临时文件重命名为原文件
    if (config.replace) {
      fs.unlinkSync(filePath);
      fs.renameSync(outputFilePath, filePath);
      const afterSize = getFileSizeWithUnit(filePath);
      console.log(
        `压缩完成 [大小变化: ${beforeSize} ---->>>> ${afterSize}] ${filePath}`
      );
    } else {
      const afterSize = getFileSizeWithUnit(outputFilePath);
      console.log(
        `压缩完成 [大小变化: ${beforeSize} ---->>>> ${afterSize}] ${outputFilePath}`
      );
    }
  } catch (error) {
    console.error(`压缩出错: ${config.replace ? filePath : outputFilePath}`, error);
    // 如果原地替换失败，清理临时文件
    if (config.replace && fs.existsSync(outputFilePath)) {
      fs.unlinkSync(outputFilePath);
    }
  }
}

// 递归压缩目录下所有图片
async function compressFiles(dir, config, baseDir = config.targetDir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // 跳过 output 目录（非原地替换模式）
    if (!config.replace && filePath === config.outputDir) {
      console.log(`跳过的目录: ${filePath}（为输出目录）`);
      continue;
    }

    if (stat.isDirectory()) {
      if (!config.blackDirs.includes(file)) {
        await compressFiles(filePath, config, baseDir);
      } else {
        console.log(`跳过的目录: ${filePath}`);
      }
    } else if (/\.(png|jpe?g|gif)$/i.test(filePath)) {
      await compressImage(filePath, config, baseDir);
    }
  }
}

// commander命令行包装
const program = new Command();

program
  .name("mpic")
  .description("图片批量压缩工具")
  .option("-d, --dir <dir>", "需要压缩的目录", DEFAULT_CONFIG.targetDir)
  .option("-o, --output <output>", "输出目录", DEFAULT_CONFIG.outputDir)
  .option("-q, --quality <quality>", "压缩质量(0-100)", String(DEFAULT_CONFIG.quality))
  .option("-g, --gif-colours <colours>", "GIF调色板最大数量(2-256)", String(DEFAULT_CONFIG.gifColours))
  .option("-b, --black-dirs <dirs>", "排除的子文件夹名称(逗号分隔)", val => val.split(","), DEFAULT_CONFIG.blackDirs)
  .option("-y, --yes", "跳过确认，直接开始压缩")
  .option("-r, --replace", "原地压缩替换原文件，不输出到新目录")
  .version(require('./package.json').version, '-v, --version', '显示版本号')
  .action(async (options) => {
    // 合并配置
    const config = {
      targetDir: path.resolve(process.cwd(), options.dir),
      outputDir: options.replace ? null : path.resolve(process.cwd(), options.output),
      quality: parseInt(options.quality, 10),
      gifColours: parseInt(options.gifColours, 10),
      blackDirs: Array.isArray(options.blackDirs) ? options.blackDirs : [options.blackDirs],
      replace: options.replace || false,
    };

    let shouldContinue = options.yes;
    if (!shouldContinue) {
      shouldContinue = await askUserToContinue();
    }
    if (!shouldContinue) {
      console.log("已取消操作。");
      process.exit(0);
    }

    const inputDir = config.targetDir;
    compressFiles(inputDir, config, inputDir)
      .then(() => {
        if (config.replace) {
          console.log("压缩任务全部完成，已原地替换所有图片");
        } else {
          console.log("压缩任务全部完成，已输出至", config.outputDir);
        }
      })
      .catch((err) => {
        console.error("压缩文件时出错:", err);
      });
  });

program.parse(process.argv);
