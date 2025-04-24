const { ethers } = require("hardhat");

async function main() {
  const Donation = await ethers.getContractFactory("DonationPlatform");
  const donation = await Donation.deploy();

  await donation.waitForDeployment();
  console.log("✅ Contract deployed to:", donation.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
