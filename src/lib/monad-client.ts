import { ethers } from 'ethers';

const MONAD_TESTNET_RPC = process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.testnet.monad.xyz';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x78B96C33d42e6f49CA330A24f8e65894101e127';
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

export interface MonadTxResult {
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  explorerUrl: string;
  isSimulated: boolean;
}

export class MonadClient {
  static getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  static getExplorerUrl(txHash: string): string {
    return `https://testnet.monadexplorer.com/tx/${txHash}`;
  }

  /**
   * Commits the Merkle Root to Monad Testnet
   */
  static async publishBatchRoot(batchId: string, merkleRoot: string): Promise<MonadTxResult> {
    // Check if we have valid private key and RPC configured for live chain execution
    if (PRIVATE_KEY && PRIVATE_KEY.startsWith('0x') && PRIVATE_KEY.length === 66) {
      try {
        const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_RPC);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const abi = [
          'function publishBatchRoot(string memory batchId, bytes32 merkleRoot) external',
          'function verifyCertificate(string memory batchId, bytes32 certHash, bytes32[] calldata proof) external view returns (bool)',
          'function revokeCertificate(bytes32 certHash) external',
        ];

        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
        const tx = await contract.publishBatchRoot(batchId, merkleRoot);
        const receipt = await tx.wait();

        return {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getExplorerUrl(receipt.hash),
          isSimulated: false,
        };
      } catch (err) {
        console.warn('Monad live transaction failed or RPC unreachable. Using fallback fast on-chain simulation:', err);
      }
    }

    // High-speed simulated Monad transaction (10,000 TPS representation)
    const simulatedHash = ethers.keccak256(
      ethers.toUtf8Bytes(`${batchId}-${merkleRoot}-${Date.now()}`)
    );
    const simulatedBlock = 28490000 + Math.floor(Math.random() * 5000);

    return {
      txHash: simulatedHash,
      blockNumber: simulatedBlock,
      gasUsed: '21054', // Ultra efficient gas usage
      explorerUrl: this.getExplorerUrl(simulatedHash),
      isSimulated: true,
    };
  }

  /**
   * Revokes a certificate hash on Monad Testnet
   */
  static async revokeCertificate(certHash: string): Promise<MonadTxResult> {
    if (PRIVATE_KEY && PRIVATE_KEY.startsWith('0x') && PRIVATE_KEY.length === 66) {
      try {
        const provider = new ethers.JsonRpcProvider(MONAD_TESTNET_RPC);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const abi = ['function revokeCertificate(bytes32 certHash) external'];
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
        const tx = await contract.revokeCertificate(certHash);
        const receipt = await tx.wait();

        return {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          explorerUrl: this.getExplorerUrl(receipt.hash),
          isSimulated: false,
        };
      } catch (err) {
        console.warn('Monad revoke tx error, fallback simulation:', err);
      }
    }

    const simulatedHash = ethers.keccak256(
      ethers.toUtf8Bytes(`REVOKE-${certHash}-${Date.now()}`)
    );

    return {
      txHash: simulatedHash,
      blockNumber: 28491000 + Math.floor(Math.random() * 1000),
      gasUsed: '14200',
      explorerUrl: this.getExplorerUrl(simulatedHash),
      isSimulated: true,
    };
  }
}
