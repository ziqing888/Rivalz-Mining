require('colors');
const fs = require('fs');
const readlineSync = require('readline-sync');
const inquirer = require('inquirer');
const { displayHeader, checkBalance } = require('./src/utils');
const { createWallet, createContract } = require('./src/wallet');
const { claimFragmentz } = require('./src/claim');
const { RPC_URL } = require('./src/utils');
const { JsonRpcProvider, ethers } = require('ethers');
const moment = require('moment');
const { CronJob } = require('cron');
const CONTRACT_ADDRESS = '0xF0a66d18b46D4D5dd9947914ab3B2DDbdC19C2C0';

let recurringSettings = {};

// 处理私钥，确保其符合要求
function validateAndFixPrivateKey(privateKey) {
  if (typeof privateKey !== 'string') {
    throw new Error('私钥必须是字符串类型');
  }

  // 去除空格
  privateKey = privateKey.trim();

  // 确保私钥以 "0x" 开头
  if (!privateKey.startsWith('0x')) {
    privateKey = `0x${privateKey}`; // 添加缺失的 0x 前缀
  }

  // 截取私钥长度为 66 字符，如果超过则截取前 66 个字符
  if (privateKey.length > 66) {
    privateKey = privateKey.slice(0, 66);
  }

  // 确保内容是合法的十六进制字符
  if (!ethers.isHexString(privateKey)) {
    throw new Error(`私钥内容无效: ${privateKey}`);
  }

  return privateKey;
}

// 主处理函数：领取 Fragmentz
async function claimProcess(privateKeys, provider, numClaims) {
  for (const privateKey of privateKeys) {
    try {
      const fixedPrivateKey = validateAndFixPrivateKey(privateKey);
      const wallet = new ethers.Wallet(fixedPrivateKey, provider);
      const senderAddress = wallet.address;

      console.log(`正在处理地址: ${senderAddress}`.cyan);

      const contract = createContract(wallet, CONTRACT_ADDRESS);
      await claimFragmentz(contract, numClaims);
      console.log(
        `成功为地址 ${senderAddress} 领取 ${numClaims} 个 Fragmentz`.green
      );
    } catch (error) {
      console.error(`处理私钥时出错: ${error.message}`.red);
    }
  }
}

// 设置定时任务
async function setupRecurringClaim(privateKeys, provider, numClaims) {
  console.log('设置每12小时自动领取任务...'.green);

  const job = new CronJob('0 */12 * * *', async function () {
    await claimProcess(privateKeys, provider, numClaims);
    console.log(
      `[ ${moment().format('HH:mm:ss')} ] 定时任务已执行。`.green
    );
  });

  job.start();
  console.log('定时任务设置成功。'.green);
}

// 主逻辑
async function main() {
  displayHeader();

  const provider = new JsonRpcProvider(RPC_URL);

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择一个操作:',
        choices: [
          { name: '查看余额', value: '0' },
          { name: '领取 Fragmentz', value: '1' },
          { name: '退出', value: '2' },
        ],
      },
    ]);

    if (action === '2') {
      console.log('退出中...'.cyan);
      break;
    }

    try {
      if (action === '0') {
        const privateKeys = JSON.parse(
          fs.readFileSync('privateKeys.json', 'utf-8')
        );
        if (!Array.isArray(privateKeys) || privateKeys.length === 0) {
          throw new Error('privateKeys.json 文件未正确设置或为空'.red);
        }

        for (const privateKey of privateKeys) {
          try {
            const fixedPrivateKey = validateAndFixPrivateKey(privateKey);
            const wallet = new ethers.Wallet(fixedPrivateKey, provider);
            const senderAddress = wallet.address;

            const balance = await checkBalance(provider, senderAddress);
            console.log(
              `地址: ${senderAddress} - 余额: ${ethers.formatEther(balance)} ETH`
                .yellow
            );
          } catch (error) {
            console.error(`处理私钥时出错: ${error.message}`.red);
          }
        }
      } else if (action === '1') {
        const privateKeys = JSON.parse(
          fs.readFileSync('privateKeys.json', 'utf-8')
        );
        if (!Array.isArray(privateKeys) || privateKeys.length === 0) {
          throw new Error('privateKeys.json 文件未正确设置或为空'.red);
        }

        const numClaims = readlineSync.questionInt('您想领取多少个 Fragmentz? ');

        console.log('');

        await claimProcess(privateKeys, provider, numClaims);
        console.log('\n初次领取完成。'.green);

        const { claimOption } = await inquirer.prompt([
          {
            type: 'list',
            name: 'claimOption',
            message: '选择领取方式:',
            choices: [
              { name: '一次性领取', value: '1' },
              { name: '每12小时定时领取', value: '2' },
            ],
          },
        ]);

        if (claimOption === '2') {
          await setupRecurringClaim(privateKeys, provider, numClaims);
          console.log(
            '机器人已设置为每12小时运行一次领取任务。'.green
          );
          break;
        }
      }
    } catch (error) {
      console.log(
        `[ ${moment().format('HH:mm:ss')} ] 主循环出错: ${error.message}`.red
      );
    }
  }
}

main();
