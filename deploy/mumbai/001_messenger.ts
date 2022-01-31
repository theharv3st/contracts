import hre, { deployments, hardhatArguments } from "hardhat";

module.exports = async ({ getNamedAccounts, deployments }: any) => {
	// exit if network != mumbai
	if (hardhatArguments.network !== "mumbai") return;
	const fxchild = "0xCf73231F28B7331BBe3124B907840A94851f9f11";
	const { log } = deployments;
	const { deployer } = await getNamedAccounts();

	const messengerDeployResult = await deployments.deploy("PolygonL2Messenger", {
		from: deployer,
		skipIfAlreadyDeployed: true,
		log: true,
		args: [deployer, fxchild],
	});
	log(
		`PolygonL2Messenger deployed at ${messengerDeployResult.address} for ${messengerDeployResult.receipt?.gasUsed}`
	);
};

module.exports.tags = ["PolygonL2Messenger"];
