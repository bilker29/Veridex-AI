const hre = require("hardhat");

async function main() {
  console.log("🚀 Memulai deployment VeridexRegistry ke jaringan:", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Akun Deployer:", deployer.address);

  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Saldo Akun:", hre.ethers.formatEther(balance), "MON / ETH");
  } catch (e) {
    // Local in-memory fallback
  }

  const VeridexRegistry = await hre.ethers.getContractFactory("VeridexRegistry");
  const contract = await VeridexRegistry.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("====================================================");
  console.log("✅ VeridexRegistry BERHASIL DITERBITKAN KE BLOCKCHAIN!");
  console.log("📍 Alamat Kontrak (Contract Address):", address);
  console.log("🔗 Monad Explorer:", `https://testnet.monadexplorer.com/address/${address}`);
  console.log("====================================================");
}

main().catch((error) => {
  console.error("❌ Error saat deploy:", error);
  process.exitCode = 1;
});
