import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployments, hardhatArguments } from "hardhat";
import "hardhat-deploy/dist/src/type-extensions";

const AggregatorInterfaceTCAP: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    if (hardhatArguments.network !== "arbitrumGoerli") {
    	return
    }
        const { log } = deployments;

        const namedAccounts = await hre.getNamedAccounts();
        const deployResult = await deployments.deploy(
						"AggregatorInterfaceTCAP",
						{
								from: namedAccounts.deployer,
								skipIfAlreadyDeployed: true,
								log: true,
						}
				);
				log(
						`AggregatorInterfaceTCAP deployed at ${deployResult.address} for ${deployResult.receipt?.gasUsed}`
				);
				const deployResultWETH = await deployments.deploy(
						"AggregatorInterfaceWETH",
						{
								contract: "AggregatorInterfaceTCAP",
								from: namedAccounts.deployer,
								skipIfAlreadyDeployed: true,
								log: true,
						}
				);
				log(
						`AggregatorInterfaceWETH deployed at ${deployResultWETH.address}
						for ${deployResultWETH.receipt?.gasUsed}`
				);
				const deployResultDAI = await deployments.deploy(
						"AggregatorInterfaceDAI",
						{
								contract: "AggregatorInterfaceTCAP",
								from: namedAccounts.deployer,
								skipIfAlreadyDeployed: true,
								log: true,
						}
				);
				log(
						`AggregatorInterfaceWETH deployed at ${deployResultDAI.address}
						for ${deployResultDAI.receipt?.gasUsed}`
				);
};

export default AggregatorInterfaceTCAP;
