const RPC_URL = 'https://rivalz2.rpc.caldera.xyz/infra-partner-http';

function displayHeader() {
  console.clear();
  console.log('✨ 欢迎使用 Rivalz Fragmentz 领取工具 ✨'.rainbow.bold);
  console.log('💻 作者: @qklxsqf'.green);
  console.log('🔗 Telegram: https://t.me/ksqxszq'.blue.underline);
  console.log('========================================'.magenta.bold);
}

async function checkBalance(provider, address) {
  return provider.getBalance(address);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  RPC_URL,
  displayHeader,
  checkBalance,
  delay,
};
