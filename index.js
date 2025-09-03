const Web3 = require('web3').default;

// Connect to Sepolia testnet via  (Using infura node provider)
const web3 = new Web3('https://sepolia.infura.io/v3/b21b636304a34cd4a8bc5b889942654a');

// Your wallet address
const address = '0xAaa41c85B7306b8D43fA02B84A009244BBF33F3F';

async function main() {
    let balance = await web3.eth.getBalance(address);
    balance = web3.utils.fromWei(balance, 'ether'); // Convert Wei to ETH
    console.log(`ETH Balance of ${address}: ${balance} ETH`);
}

main();

