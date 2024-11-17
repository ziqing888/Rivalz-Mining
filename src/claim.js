const moment = require('moment');
const { delay } = require('./utils');

async function claimFragmentz(contract, numClaims) {
  for (let i = 0; i < numClaims; i++) {
    try {
      const responseContract = await contract.claim();

      if (responseContract.hash) {
        console.log(
          `[ ${moment().format('HH:mm:ss')} ] 成功为地址 ${
            responseContract.from
          } 领取 Fragmentz`.green
        );
        console.log(
          `[ ${moment().format('HH:mm:ss')} ] 在这里查看交易哈希: https://rivalz2.explorer.caldera.xyz/tx/${
            responseContract.hash
          }`.green
        );
      }
      await delay(5000);
    } catch (error) {
      console.log(
        `[ ${moment().format('HH:mm:ss')} ] 领取 Fragmentz 时出错: ${
          error.message
        }`.red
      );
    }
  }
}

module.exports = {
  claimFragmentz,
};
