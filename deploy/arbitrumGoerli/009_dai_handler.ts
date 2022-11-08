import { hardhatArguments } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
const DAIVaultHandler = async (hre: HardhatRuntimeEnvironment) => {
    if (hardhatArguments.network === "arbitrumGoerli") {
        const { log } = deployments;
        const namedAccounts = await hre.getNamedAccounts();
        const deployer = namedAccounts.deployer;
        const ethers = hre.ethers;

        const [owner] = await ethers.getSigners();

        let handlerContract;
        let orchestrator = await deployments.get("ArbitrumOrchestrator");
				let tcap = await deployments.get("TCAP");

				let DAIContract = await deployments.get("DAI");

				let divisor = process.env.DIVISOR as string;
				let ratio = process.env.RATIO as string;
				let burnFee = process.env.BURN_FEE as string;
				let liquidationPenalty = process.env
						.LIQUIDATION_PENALTY as string;

				let tcapOracle = await deployments.get("TCAPOracle");
				let l2MessageExecutor = await deployments.get("L2MessageExecutor");
				let priceFeedETH = await deployments.get("WETHOracle");
				let priceFeedDAI = await deployments.get("DAIOracle");
				let nonce = await owner.getTransactionCount();

				const deployResult = await deployments.deploy(
						"DAIVaultHandler",
						{
								from: deployer,
								contract: "ERC20VaultHandler",
								skipIfAlreadyDeployed: true,
								log: true,
								args: [
										orchestrator.address,
										divisor,
										ratio,
										burnFee,
										liquidationPenalty,
										tcapOracle.address,
										tcap.address,
										DAIContract.address,
										priceFeedDAI.address,
										priceFeedETH.address,
										l2MessageExecutor.address,
										"20000000000000000000"
								],
						}
				);
				handlerContract = await deployments.get("DAIVaultHandler");
				if (deployResult.newlyDeployed) {
						log(
								`DAIVaultHandler deployed at ${handlerContract.address}
								for ${deployResult.receipt?.gasUsed}`
						);
				}

    }
};
export default DAIVaultHandler;
