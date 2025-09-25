import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getBalance, sendEth } from './utils/common';
import { getEtherBalance, getEtherTxDetails, sendEtherEth } from './utils/ethersCommon';
import path from 'path';


const app = express();
app.use(cors());
app.use(bodyParser.json());


// Serve blockchain.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'blockchain.html'));
});

/**
 * API: Get balance (Web3.js)
 */
app.get('/web3/balance/:address', async (req, res) => {
    try {
        const balance = await getBalance(req.params.address);  // Web3.js helper
        res.json({ type: 'web3', address: req.params.address, balance });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * API: Get balance (Ethers.js)
 */
app.get('/ethers/balance/:address', async (req, res) => {
    try {
        const balance = await getEtherBalance(req.params.address);  // Ethers.js helper
        res.json({ type: 'ethers', address: req.params.address, balance });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * API: Send ETH (Web3.js)
 */
app.post('/web3/send', async (req, res) => {
    try {
        const { to, amount } = req.body;
        if (!to || !amount) throw new Error('Receiver and amount are required');

        const txHash = await sendEth(to, amount);  // Web3.js helper
        res.json({ type: 'web3', txHash, explorer: `https://sepolia.etherscan.io/tx/${txHash}` });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * API: Send ETH (Ethers.js)
 */
app.post('/ethers/send', async (req, res) => {
    try {
        const { to, amount } = req.body;
        if (!to || !amount) throw new Error('Receiver and amount are required');

        const txHash = await sendEtherEth(to, amount);  // Ethers.js helper
        const txDetails = await getEtherTxDetails(txHash); // Fetch transaction details
        res.json({ type: 'ethers', txHash, explorer: `https://sepolia.etherscan.io/tx/${txHash}`, details: txDetails });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
