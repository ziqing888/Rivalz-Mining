require('colors');
const fs = require('fs');
const readlineSync = require('readline-sync');
const inquirer = require('inquirer');
const { displayHeader, checkBalance, RPC_URL, dynamicMessage } = require('./src/utils');
const { createWallet, createContract } = require('./src/wallet');
const { claimFragmentz } = require('./src/claim');
const { JsonRpcProvider, ethers } = require('ethers');
const { CronJob } = require('cron');
const moment = require('moment');
const config = require('./src/config');

const CONTRACT_ADDRESS = config.contractAddress; // 合约地址

let recurringSettings = {}; // 定期任务配置

/**
 * 处理领取任务
 */
const claimProcess = async (privateKeys, provider, numClaims) => {
  for (const privateKey of privateKeys) {
    try {
      const wallet = createWallet(privateKey, provider);
      const contract = createContract(wallet, CONTRACT_ADDRESS);
      console.log(`🎯 正在处理地址：${wallet.address}`.cyan.bold);
      await claimFragmentz(contract, numClaims);
      console.log(`✅ 地址 ${wallet.address} 成功领取 ${numClaims} 个 Fragmentz`.green.bold);
    } catch (error) {
      console.error(`❌ 地址 ${privateKey} 领取失败：${error.message}`.red.bold);
    }
  }
};

/**
 * 设置定期领取任务
 */
const setupRecurringClaim = async (privateKeys, provider, numClaims) => {
  console.log('🕒 正在设置每 12 小时的领取任务...'.magenta.bold);

  const job = new CronJob('0 */12 * * *', async () => {
    console.log(`🚀 执行自动领取任务！`.yellow.bold);
    await claimProcess(privateKeys, provider, numClaims);
  });

  job.start();
  console.log('✅ 定时任务设置完成！'.green.bold);
};

const main = async () => {
  displayHeader();
  const provider = new JsonRpcProvider(RPC_URL);

  while (true) {
    await dynamicMessage('欢迎进入 Rivalz Fragmentz 领取工具！\n', 'cyan', 80);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '✨ 请选择操作：'.magenta.bold,
        choices: [
          { name: '🔍 查看余额', value: '0' },
          { name: '💰 领取 Fragmentz', value: '1' },
          { name: '❌ 退出程序', value: '2' },
        ],
      },
    ]);

    if (action === '2') {
      await dynamicMessage('再见！祝你愉快！✨', 'green', 100);
      break;
    }

    try {
      if (action === '0') {
        const privateKeys = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
        for (const privateKey of privateKeys) {
          const wallet = createWallet(privateKey, provider);
          const balance = await checkBalance(provider, wallet.address);
          console.log(`💳 地址：${wallet.address}`.yellow.bold);
          console.log(`💰 余额：${ethers.formatEther(balance)} ETH`.cyan.bold);
        }
      } else if (action === '1') {
        const privateKeys = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));
        const numClaims = readlineSync.questionInt('请输入领取的 Fragmentz 数量：'.magenta);

        await claimProcess(privateKeys, provider, numClaims);

        const { isRecurring } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'isRecurring',
            message: '🔄 是否设置每 12 小时自动领取？'.yellow.bold,
          },
        ]);

        if (isRecurring) {
          await setupRecurringClaim(privateKeys, provider, numClaims);
        }
      }
    } catch (error) {
      console.error(`❌ 执行过程中发生错误：${error.message}`.red.bold);
    }
  }
};

main();
