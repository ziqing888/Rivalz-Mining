const moment = require('moment');
const { delay } = require('./utils');
const config = require('./config');

async function claimFragmentz(contract, numClaims) {
  for (let i = 0; i < numClaims; i++) {
    try {
      const tx = await contract.claim();
      const explorerUrl = `${config.explorerUrl}/tx/${tx.hash}`;
      console.log(`[ ${moment().format('HH:mm:ss')} ] 成功领取，交易哈希：${explorerUrl}`.green);
      await delay(config.claimDelay || 5000);
    } catch (error) {
      console.error(`[ ${moment().format('HH:mm:ss')} ] 领取失败：${error.message}`.red);
    }
  }
}

module.exports = {
  claimFragmentz,
};
