import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getBalance, sendEth } from './utils/common';

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * API: Get balance
 */
app.get('/balance/:address', async (req, res) => {
    try {
        const balance = await getBalance(req.params.address);
        res.json({ address: req.params.address, balance });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

/**
 * API: Send ETH
 */
app.post('/send', async (req, res) => {
    try {
        const { to, amount } = req.body;
        if (!to || !amount) throw new Error('Receiver and amount are required');

        const txHash = await sendEth(to, amount);
        res.json({ txHash, explorer: `https://sepolia.etherscan.io/tx/${txHash}` });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
