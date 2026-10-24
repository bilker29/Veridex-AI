const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeridexRegistry Smart Contract", function () {
  let veridexRegistry;
  let owner;
  let officer;
  let attacker;

  beforeEach(async function () {
    [owner, officer, attacker] = await ethers.getSigners();
    const VeridexRegistry = await ethers.getContractFactory("VeridexRegistry");
    veridexRegistry = await VeridexRegistry.deploy();
    await veridexRegistry.waitForDeployment();
  });

  describe("Deployment & Ownership", function () {
    it("Harus menetapkan deployer sebagai owner sah kontrak", async function () {
      expect(await veridexRegistry.owner()).to.equal(owner.address);
    });
  });

  describe("Penerbitan Batch Root (publishBatchRoot)", function () {
    it("Owner dapat menerbitkan Merkle Root batch sertifikat tanah ke blockchain", async function () {
      const batchId = "BPN-JAKSEL-BATCH-001";
      const sampleRoot = ethers.keccak256(ethers.toUtf8Bytes("ROOT_SAMPLE_001"));

      const tx = await veridexRegistry.publishBatchRoot(batchId, sampleRoot);
      await tx.wait();

      expect(await veridexRegistry.batchRoots(batchId)).to.equal(sampleRoot);
    });

    it("Harus memancarkan event BatchPublished saat batch baru didaftarkan", async function () {
      const batchId = "BPN-JAKSEL-BATCH-002";
      const sampleRoot = ethers.keccak256(ethers.toUtf8Bytes("ROOT_SAMPLE_002"));

      await expect(veridexRegistry.publishBatchRoot(batchId, sampleRoot))
        .to.emit(veridexRegistry, "BatchPublished");
    });

    it("Menolak pihak luar (non-owner) yang mencoba menerbitkan batch", async function () {
      const batchId = "FAKE-BATCH";
      const fakeRoot = ethers.keccak256(ethers.toUtf8Bytes("FAKE"));

      await expect(
        veridexRegistry.connect(attacker).publishBatchRoot(batchId, fakeRoot)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Verifikasi Kriptografis (verifyCertificate)", function () {
    let batchId;
    let leaf1;
    let leaf2;
    let merkleRoot;
    let proofForLeaf1;

    beforeEach(async function () {
      batchId = "BPN-SUKABUMI-CISARUA";
      
      // Buat 2 dokumen hash (contoh: Akte Tanah Cisarua dan Sertifikat SHM)
      const h1 = ethers.keccak256(ethers.toUtf8Bytes("AKTE_TANAH_OOK_HIDAYAT_SYAMSUL_FALAH"));
      const h2 = ethers.keccak256(ethers.toUtf8Bytes("SHM_BUDI_SANTOSO_MENTENG"));

      // Urutkan pasangan leaf sesuai logika Merkle Tree OpenZeppelin (lexicographical)
      if (h1.toLowerCase() <= h2.toLowerCase()) {
        leaf1 = h1;
        leaf2 = h2;
      } else {
        leaf1 = h2;
        leaf2 = h1;
      }

      // Root = keccak256(leaf1 + leaf2)
      merkleRoot = ethers.solidityPackedKeccak256(["bytes32", "bytes32"], [leaf1, leaf2]);
      proofForLeaf1 = [leaf2];

      // Daftarkan root ke smart contract
      await veridexRegistry.publishBatchRoot(batchId, merkleRoot);
    });

    it("Harus mengembalikan TRUE untuk sertifikat asli dengan bukti Merkle sah", async function () {
      const isValid = await veridexRegistry.verifyCertificate(batchId, leaf1, proofForLeaf1);
      expect(isValid).to.be.true;
    });

    it("Harus mengembalikan FALSE jika dokumen dipalsukan / hash berbeda", async function () {
      const forgedLeaf = ethers.keccak256(ethers.toUtf8Bytes("DOKUMEN_PALSU_MANIPULASI_LUAS_TANAH"));
      const isValid = await veridexRegistry.verifyCertificate(batchId, forgedLeaf, proofForLeaf1);
      expect(isValid).to.be.false;
    });

    it("Harus mengembalikan FALSE jika proof tidak valid", async function () {
      const invalidProof = [ethers.keccak256(ethers.toUtf8Bytes("INVALID_PROOF_ELEMENT"))];
      const isValid = await veridexRegistry.verifyCertificate(batchId, leaf1, invalidProof);
      expect(isValid).to.be.false;
    });
  });

  describe("Pencabutan Dokumen Sengketa (revokeCertificate)", function () {
    let batchId;
    let certHash;
    let proof;

    beforeEach(async function () {
      batchId = "BPN-REVOKE-TEST";
      certHash = ethers.keccak256(ethers.toUtf8Bytes("SHGB_PT_SINAR_PROPERTI"));
      const root = certHash; // 1 leaf tree -> root is leaf
      proof = [];

      await veridexRegistry.publishBatchRoot(batchId, root);
    });

    it("Dokumen sah sebelum dicabut", async function () {
      expect(await veridexRegistry.verifyCertificate(batchId, certHash, proof)).to.be.true;
    });

    it("Setelah dicabut oleh BPN, verifyCertificate harus mengembalikan FALSE", async function () {
      // Cabut dokumen
      await veridexRegistry.revokeCertificate(certHash);

      expect(await veridexRegistry.revokedCertificates(certHash)).to.be.true;
      expect(await veridexRegistry.verifyCertificate(batchId, certHash, proof)).to.be.false;
    });

    it("Menolak pihak non-owner yang mencoba mencabut sertifikat", async function () {
      await expect(
        veridexRegistry.connect(attacker).revokeCertificate(certHash)
      ).to.be.revertedWith("Not authorized");
    });
  });
});
