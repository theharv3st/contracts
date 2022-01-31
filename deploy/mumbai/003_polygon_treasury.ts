import hre, { deployments, hardhatArguments } from "hardhat";

module.exports = async ({ getNamedAccounts, deployments }: any) => {
	// exit if network != mumbai
	if (hardhatArguments.network !== "mumbai") return;

	const { deployIfDifferent, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const polygonMessengerDeployResult = await deployments.getOrNull("PolygonL2Messenger");
	const timelockAddress = "0xeCfaAE58487B64d777cDc8fb9f9e3B154f5563F1"; // Goerli Timelock

	if (!polygonMessengerDeployResult) {
		log(`PolygonL2Messenger needs to be deployed before deploying PolygonOrchestrator`);
		return process.exit(1);
	}

	const polygonTreasuryResult = await deployments.deploy("PolygonTreasury", {
		from: deployer,
		skipIfAlreadyDeployed: true,
		log: true,
		args: [timelockAddress, polygonMessengerDeployResult.address],
	});
	log(
		`PolygonTreasury deployed at ${polygonTreasuryResult.address} for ${polygonTreasuryResult.receipt?.gasUsed}`
	);
};

module.exports.tags = ["PolygonTreasury"];
module.exports.dependencies = ["PolygonL2Messenger"];
