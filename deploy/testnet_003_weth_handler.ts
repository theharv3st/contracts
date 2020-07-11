import {buidlerArguments} from "@nomiclabs/buidler";
module.exports = async ({getNamedAccounts, deployments}: any) => {
	if (
		buidlerArguments.network === "goerli" ||
		buidlerArguments.network === "ganache" ||
		buidlerArguments.network === "buidlerevm"
	) {
		const {deployIfDifferent, log} = deployments;
		const {deployer} = await getNamedAccounts();

		let handlerContract;
		try {
			handlerContract = await deployments.get("WETHTokenHandler");
		} catch (error) {
			log(error.message);
			try {
				const deployResult = await deployIfDifferent(
					["data"],
					"WETHTokenHandler",
					{from: deployer, gas: 5000000},
					"WETHTokenHandler"
				);
				handlerContract = await deployments.get("WETHTokenHandler");
				if (deployResult.newlyDeployed) {
					log(
						`WETHTokenHandler deployed at ${handlerContract.address} for ${deployResult.receipt.gasUsed}`
					);
				}
			} catch (error) {
				log(error.message);
			}
		}
	}
};
module.exports.tags = ["WETHTokenHandler"];
