import { ethers } from 'ethers';

/**
 * Standard Merkle Tree implementation compatible with OpenZeppelin MerkleProof.sol
 */
export class VeridexMerkle {
  /**
   * Computes SHA-256 hash of a buffer or string as a 0x-prefixed 32-byte hex string
   */
  static sha256(data: Uint8Array | string): string {
    return ethers.sha256(typeof data === 'string' ? ethers.toUtf8Bytes(data) : data);
  }

  /**
   * Hashes a pair of nodes sorting them alphabetically (OpenZeppelin standard)
   */
  static combinedHash(a: string, b: string): string {
    const bigA = BigInt(a);
    const bigB = BigInt(b);
    
    // Sort pairs
    const [first, second] = bigA <= bigB ? [a, b] : [b, a];
    return ethers.keccak256(ethers.concat([first, second]));
  }

  /**
   * Builds the Merkle Tree from an array of leaves (each must be a 0x-prefixed 32-byte hex)
   */
  static buildTree(leaves: string[]): {
    root: string;
    getProof: (leaf: string) => string[];
    verify: (leaf: string, proof: string[], root: string) => boolean;
  } {
    if (leaves.length === 0) {
      return {
        root: ethers.ZeroHash,
        getProof: () => [],
        verify: () => false,
      };
    }

    // Normalize leaves to 32-byte hex
    const normalizedLeaves = leaves.map(l => (l.startsWith('0x') ? l : `0x${l}`));

    // If only 1 leaf, root is the leaf itself
    if (normalizedLeaves.length === 1) {
      const root = normalizedLeaves[0];
      return {
        root,
        getProof: () => [],
        verify: (leaf: string, proof: string[], expectedRoot: string) => {
          return leaf.toLowerCase() === expectedRoot.toLowerCase();
        },
      };
    }

    // Compute layers
    const layers: string[][] = [normalizedLeaves];

    while (layers[layers.length - 1].length > 1) {
      const currentLayer = layers[layers.length - 1];
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.combinedHash(currentLayer[i], currentLayer[i + 1]));
        } else {
          // If odd number of nodes, duplicate the last node or elevate it
          nextLayer.push(currentLayer[i]);
        }
      }
      layers.push(nextLayer);
    }

    const root = layers[layers.length - 1][0];

    const getProof = (targetLeaf: string): string[] => {
      const target = targetLeaf.startsWith('0x') ? targetLeaf.toLowerCase() : `0x${targetLeaf}`.toLowerCase();
      let index = normalizedLeaves.findIndex(l => l.toLowerCase() === target);
      if (index === -1) return [];

      const proof: string[] = [];
      for (let i = 0; i < layers.length - 1; i++) {
        const layer = layers[i];
        const isRightNode = index % 2 === 1;
        const pairIndex = isRightNode ? index - 1 : index + 1;

        if (pairIndex < layer.length) {
          proof.push(layer[pairIndex]);
        }
        index = Math.floor(index / 2);
      }
      return proof;
    };

    const verify = (leaf: string, proof: string[], expectedRoot: string): boolean => {
      let computed = leaf.startsWith('0x') ? leaf : `0x${leaf}`;
      for (const proofElement of proof) {
        computed = this.combinedHash(computed, proofElement);
      }
      return computed.toLowerCase() === expectedRoot.toLowerCase();
    };

    return {
      root,
      getProof,
      verify,
    };
  }

  /**
   * Standalone proof verification against root
   */
  static verifyProof(leaf: string, proof: string[], root: string): boolean {
    let computed = leaf.startsWith('0x') ? leaf : `0x${leaf}`;
    for (const proofElement of proof) {
      computed = this.combinedHash(computed, proofElement);
    }
    return computed.toLowerCase() === root.toLowerCase();
  }
}
