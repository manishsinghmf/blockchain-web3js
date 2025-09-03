import Web3 from 'web3';

// Connect to Sepolia testnet (Infura)
const web3 = new Web3('https://sepolia.infura.io/v3/b21b636304a34cd4a8bc5b889942654a');

// Your wallet address
const address = '0xAaa41c85B7306b8D43fA02B84A009244BBF33F3F';

async function main() {
    try {
        // getBalance now returns bigint in Web3 v2
        const balance: bigint = await web3.eth.getBalance(address);

        // Convert bigint to string for fromWei
        const ethBalance: string = web3.utils.fromWei(balance.toString(), 'ether');

        console.log(`ETH Balance of ${address}: ${ethBalance} ETH`);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

main();
