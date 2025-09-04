import { getBalance, sendEth, getTxDetails } from './utils/common';

async function main() {
    const receiver = process.env.RECEIVER_ADDRESS!;

    // 1. Check balance
    const balance = await getBalance(receiver);
    console.log(`Receiver balance: ${balance} ETH`);

    // 2. Send ETH
    // const txHash = await sendEth(receiver, '0.0001');
    // console.log(`Sent ETH! Tx hash: https://sepolia.etherscan.io/tx/${txHash}`);

    // 3. Get transaction details
    const details = await getTxDetails("0x24c56a9ac4a9181eed25d6ea822c3bcffb30484d34b48293d2f9e5ce990e89f2");
    console.log('Transaction details:', details);
}

main();
