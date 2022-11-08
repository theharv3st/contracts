import { deployments, hardhatArguments } from "hardhat";
require("dotenv").config();
module.exports = async ({ getNamedAccounts, deployments }: any) => {
    if (hardhatArguments.network === "arbitrumGoerli") {
        const { deployIfDifferent, log } = deployments;
        const { deployer } = await getNamedAccounts();

        let TCAPOracle, WETHOracle, DAIOracle;

        const l2MessageExecutor = await deployments.get("L2MessageExecutor");
        const tcapAggregator = await deployments.getOrNull(
            "AggregatorInterfaceTCAP"
        );
        const wETHAggregator = await deployments.getOrNull(
            "AggregatorInterfaceWETH"
        );
        const daiAggregator = await deployments.getOrNull(
            "AggregatorInterfaceDAI"
        );

        let deployResult = await deployments.deploy(
						"TCAPOracle",
						{
								from: deployer,
								contract: "ChainlinkOracle",
								skipIfAlreadyDeployed: true,
								log: true,
								args: [tcapAggregator.address, l2MessageExecutor.address]
						}
				);

				TCAPOracle = await deployments.get("TCAPOracle");
				if (deployResult.newlyDeployed) {
						log(
								`Oracle deployed at ${TCAPOracle.address} for ${deployResult.receipt.gasUsed}`
						);
				}

				deployResult = await deployments.deploy(
						"WETHOracle",
						{
								from: deployer,
								contract: "ChainlinkOracle",
								skipIfAlreadyDeployed: true,
								log: true,
								args: [wETHAggregator.address, l2MessageExecutor.address]
						}
				);
				WETHOracle = await deployments.get("WETHOracle");
				if (deployResult.newlyDeployed) {
						log(
								`Price Feed Oracle deployed at ${WETHOracle.address} for ${deployResult.receipt.gasUsed}`
						);
				}

				deployResult = await deployments.deploy(
						"DAIOracle",
						{
								from: deployer,
								contract: "ChainlinkOracle",
								skipIfAlreadyDeployed: true,
								log: true,
								args: [daiAggregator.address, l2MessageExecutor.address]
						}
				);
				DAIOracle = await deployments.get("DAIOracle");
				if (deployResult.newlyDeployed) {
						log(
								`Price Feed Oracle deployed at ${DAIOracle.address} for ${deployResult.receipt.gasUsed}`
						);
				}

    }
};
module.exports.tags = ["Oracle", "ChainlinkOracle"];
