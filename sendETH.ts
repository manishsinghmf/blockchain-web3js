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

async function sendETH() {
    try {
        // Get nonce
        const nonce: bigint = await web3.eth.getTransactionCount(senderAddress, 'latest');

        // Build transaction
        const tx = {
            from: senderAddress,
            to: receiverAddress,
            value: web3.utils.toWei(amountInEth, 'ether'),
            gas: 21000,
            nonce: nonce,
        };

        // Sign transaction
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

        if (!signedTx.rawTransaction) throw new Error('Failed to sign transaction');

        // Send signed transaction
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('Transaction successful!');
        console.log(`TX Hash: ${receipt.transactionHash}`);
    } catch (error) {
        console.error('Error sending ETH:', error);
    }
}

sendETH();
