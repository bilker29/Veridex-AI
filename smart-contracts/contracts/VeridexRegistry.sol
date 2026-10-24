// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VeridexRegistry
 * @dev Ultra-lightweight on-chain Merkle Root Registry for Veridex Credentialing on Monad.
 * Saves Merkle Roots for certificate batches and tracks revocations with near-zero gas.
 */
contract VeridexRegistry {
    address public owner;
    
    // Mapping: batchId => merkleRoot
    mapping(string => bytes32) public batchRoots;
    // Mapping: certificateHash => isRevoked
    mapping(bytes32 => bool) public revokedCertificates;

    event BatchPublished(string batchId, bytes32 merkleRoot, uint256 timestamp);
    event CertificateRevoked(bytes32 certHash, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function publishBatchRoot(string memory batchId, bytes32 merkleRoot) external onlyOwner {
        batchRoots[batchId] = merkleRoot;
        emit BatchPublished(batchId, merkleRoot, block.timestamp);
    }

    function verifyCertificate(string memory batchId, bytes32 certHash, bytes32[] calldata proof) external view returns (bool) {
        if (revokedCertificates[certHash]) {
            return false;
        }
        bytes32 root = batchRoots[batchId];
        return verifyProof(proof, root, certHash);
    }

    function revokeCertificate(bytes32 certHash) external onlyOwner {
        revokedCertificates[certHash] = true;
        emit CertificateRevoked(certHash, block.timestamp);
    }

    // Inlined standard OpenZeppelin MerkleProof verification for standalone compilation
    function verifyProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }
}
