const RPC_URL = 'https://rivalz2.rpc.caldera.xyz/infra-partner-http';

function displayHeader() {
  console.clear();
  console.log('========================================'.cyan);
  console.log('=     Rivalz Mining    领取工具        ='.cyan);
  console.log('=     开发者：qklxsqf                  ='.cyan);
  console.log('=     Telegram: https://t.me/ksqxszq   ='.cyan);
  console.log('========================================'.cyan);
}

async function checkBalance(provider, address) {
  return provider.getBalance(address);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const dynamicMessage = async (message, color = 'green', delayTime = 50) => {
  for (const char of message) {
    process.stdout.write(char[color]);
    await delay(delayTime);
  }
  console.log();
};

module.exports = {
  RPC_URL,
  displayHeader,
  checkBalance,
  dynamicMessage,
  delay,
};
