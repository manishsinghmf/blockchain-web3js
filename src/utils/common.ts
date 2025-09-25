import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

const web3 = new Web3(`https://sepolia.infura.io/v3/${process.env.INFURA_ID}`);

const senderAddress = process.env.SENDER_ADDRESS!;
const privateKey = process.env.PRIVATE_KEY!;

/**
 * Get ETH balance of an address
 */
export async function getBalance(address: string): Promise<string> {
    const balance = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balance, 'ether');
}

/**
 * Send ETH using EIP-1559
 */
export async function sendEth(to: string, amountEth: string): Promise<string> {
    const nonce = await web3.eth.getTransactionCount(senderAddress, 'latest');

    // Latest block (for base fee)
    const latestBlock = await web3.eth.getBlock('latest');
    const baseFee = latestBlock.baseFeePerGas!;
    const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei'); // Tip
    const maxFeePerGas = (BigInt(baseFee) + BigInt(maxPriorityFeePerGas)).toString();

    const tx = {
        from: senderAddress,
        to,
        value: web3.utils.toWei(amountEth, 'ether'),
        gas: 21000,
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    if (!signedTx.rawTransaction) throw new Error('Failed to sign transaction');

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt.transactionHash.toString();
}

/**
 * Get transaction details and fee breakdown
 */
export async function getTxDetails(txHash: string) {
    const tx = await web3.eth.getTransaction(txHash);
    const receipt = await web3.eth.getTransactionReceipt(txHash);

    if (!tx || !receipt) {
        throw new Error('Transaction not found');
    }

    const gasUsed = receipt.gasUsed;
    const gasPrice = tx.gasPrice ? BigInt(tx.gasPrice) : 0n;
    const feePaid = gasUsed * gasPrice;

    return {
        from: tx.from,
        to: tx.to,
        valueEth: web3.utils.fromWei(tx.value, 'ether'),
        gasUsed,
        gasPriceGwei: web3.utils.fromWei(gasPrice.toString(), 'gwei'),
        totalFeeEth: web3.utils.fromWei(feePaid.toString(), 'ether'),
        status: receipt.status ? 'Success' : 'Failed',
    };
}
