const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const trustedForwarder = process.env.TRUSTED_FORWARDER;
  if (!trustedForwarder) {
    throw new Error("TRUSTED_FORWARDER address not set in .env file");
  }

  console.log("Deploying Voting contract...");

  const Voting = await hre.ethers.getContractFactory("Voting");
  const votingContract = await Voting.deploy(trustedForwarder);
  await votingContract.waitForDeployment();


  console.log("Voting contract deployed at:", await votingContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });