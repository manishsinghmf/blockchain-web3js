import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Provider: connect to Sepolia via Infura
const provider = new ethers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${process.env.INFURA_ID}`
);

// Wallet (signer) from private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Sender address
const senderAddress = wallet.address;

/**
 * Get ETH balance of an address
 */
export async function getEtherBalance(address: string): Promise<string> {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
}

/**
 * Send ETH using EIP-1559
 */
export async function sendEtherEth(to: string, amountEth: string): Promise<string> {
    const tx = {
        to,
        value: ethers.parseEther(amountEth),
        gasLimit: 21000n, // fixed for ETH transfer
        maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
        maxFeePerGas: (await provider.getBlock("latest"))!.baseFeePerGas! +
            ethers.parseUnits("2", "gwei"), // baseFee + tip
    };

    const sentTx = await wallet.sendTransaction(tx);
    await sentTx.wait(); // wait for confirmation
    return sentTx.hash;
}

/**
 * Get transaction details and fee breakdown
 */
export async function getEtherTxDetails(txHash: string) {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!tx || !receipt) {
        throw new Error("Transaction not found");
    }

    const gasUsed = receipt.gasUsed;

    // Handle both legacy (gasPrice) & EIP-1559 (effectiveGasPrice)
    const gasPrice = "effectiveGasPrice" in receipt
        ? (receipt as any).effectiveGasPrice as bigint
        : tx.gasPrice ?? 0n;

    const feePaid = gasUsed * gasPrice;

    // Fetch block for timestamp
    const block = await provider.getBlock(receipt.blockNumber!);

    // Get latest block for confirmations
    const latestBlock = await provider.getBlockNumber();
    const confirmations = latestBlock - receipt.blockNumber!;

    return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        valueEth: ethers.formatEther(tx.value),
        gasUsed: gasUsed.toString(),
        gasPriceGwei: ethers.formatUnits(gasPrice, "gwei"),
        totalFeeEth: ethers.formatEther(feePaid),
        status: receipt.status === 1 ? "Success" : "Failed",
        blockNumber: receipt.blockNumber,
        confirmations,
        timestamp: block ? new Date(block.timestamp * 1000).toLocaleString() : "",
    };
}
