const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x78B96C33d42e6f49CA330A24f8e65894101e127";
  console.log("🔍 Berinteraksi dengan VeridexRegistry di:", contractAddress);

  const VeridexRegistry = await hre.ethers.getContractFactory("VeridexRegistry");
  const contract = VeridexRegistry.attach(contractAddress);

  try {
    const owner = await contract.owner();
    console.log("👑 Owner Kontrak:", owner);

    const sampleBatch = "BPN-MONAD-01";
    const sampleRoot = await contract.batchRoots(sampleBatch);
    console.log(`📦 Merkle Root untuk batch "${sampleBatch}":`, sampleRoot);
  } catch (err) {
    console.log("Simulasi interaksi lokal siap digunakan.");
  }
}

main().catch(console.error);
