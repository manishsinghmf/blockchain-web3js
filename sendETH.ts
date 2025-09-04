import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// Infura endpoint using env variable
const infuraId = process.env.INFURA_ID;
if (!infuraId) throw new Error('Missing INFURA_ID in .env');

const web3 = new Web3(`https://sepolia.infura.io/v3/${infuraId}`);

// Wallets and private key from env
const senderAddress = process.env.SENDER_ADDRESS || "";
const receiverAddress = process.env.RECEIVER_ADDRESS || "";
const privateKey = process.env.PRIVATE_KEY || "";

if (!senderAddress || !receiverAddress || !privateKey) {
    throw new Error('Missing wallet address or private key in .env');
}

// Amount to send in ETH
const amountInEth = '0.0001';

// Check current gas price
async function checkGasPrice() {
    const gasPrice = await web3.eth.getGasPrice(); // returns bigint (Wei)
    console.log('Current Gas Price (Wei):', gasPrice.toString());
    console.log('Gas Price in Gwei:', web3.utils.fromWei(gasPrice.toString(), 'gwei'), 'gwei');
}

// checkGasPrice();

async function estimateGas() {
    const tx = {
        from: senderAddress,
        to: receiverAddress,
        value: web3.utils.toWei(amountInEth, 'ether'),
    };

    const gasEstimate = await web3.eth.estimateGas(tx);
    console.log('Estimated Gas:', gasEstimate);
}

// estimateGas();


async function sendETH() {
    try {
        // Get nonce
        const nonce: bigint = await web3.eth.getTransactionCount(senderAddress, 'latest');
        const latestBlock = await web3.eth.getBlock('latest');
        const baseFee = latestBlock.baseFeePerGas!;
        const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei'); // Tip for miners
        const maxFeePerGas = (BigInt(baseFee) + BigInt(maxPriorityFeePerGas)).toString();

        // Build transaction
        const tx = {
            from: senderAddress,
            to: receiverAddress,
            value: web3.utils.toWei(amountInEth, 'ether'),
            gas: 21000,
            nonce: nonce,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            maxFeePerGas: maxFeePerGas,
        };

        // Sign transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

        if (!signedTx.rawTransaction) throw new Error('Failed to sign transaction');

        // Send signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        const transaction = await web3.eth.getTransaction(receipt.transactionHash);

        console.log('Transaction:', transaction);
    } catch (error) {
        console.error('Error sending ETH:', error);
    }
}

sendETH();
