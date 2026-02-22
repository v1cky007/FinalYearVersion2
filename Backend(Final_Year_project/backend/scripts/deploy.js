const hre = require("hardhat");

async function main() {
  const StegoRegistry = await hre.ethers.getContractFactory("StegoRegistry");
  const stego = await StegoRegistry.deploy();

  await stego.waitForDeployment();

  console.log("StegoRegistry deployed to:", await stego.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
