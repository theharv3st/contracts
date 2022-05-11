import { hardhatArguments } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
const WETHVaultHandler = async (hre: HardhatRuntimeEnvironment) => {
    if (hardhatArguments.network === "kovan") {
        const { log } = deployments;
        const namedAccounts = await hre.getNamedAccounts();
        const deployer = namedAccounts.deployer;
        const ethers = hre.ethers;

        const [owner] = await ethers.getSigners();

        let handlerContract;
        let orchestrator = await deployments.get("Orchestrator");
        let ctx = await deployments.get("Ctx");
        try {
            handlerContract = await deployments.get("WETHVaultHandler");
        } catch (error) {
            log(error.message);
            try {
                let tcap = await deployments.get("TCAP");

                let WETHContractAddress = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";

                let divisor = process.env.DIVISOR as string;
                let ratio = process.env.RATIO as string;
                let burnFee = process.env.BURN_FEE as string;
                let liquidationPenalty = process.env
                    .LIQUIDATION_PENALTY as string;

                let tcapOracle = await deployments.get("TCAPOracle");
                let priceFeedETH = await deployments.get("WETHOracle");
                let nonce = await owner.getTransactionCount();

                const vaultAddress = ethers.utils.getContractAddress({
                    from: deployer,
                    nonce: nonce++,
                });

                const rewardAddress = ethers.utils.getContractAddress({
                    from: deployer,
                    nonce: nonce++,
                });
                const timelock = await deployments.get("Timelock");
                const deployResult = await deployments.deploy(
                    "WETHVaultHandler",
                    {
                        from: deployer,
                        contract: "ETHVaultHandler",
                        args: [
                            orchestrator.address,
                            divisor,
                            ratio,
                            burnFee,
                            liquidationPenalty,
                            tcapOracle.address,
                            tcap.address,
                            WETHContractAddress,
                            priceFeedETH.address,
                            priceFeedETH.address,
                            timelock.address,
                            "20000000000000000000",
                        ],
                    }
                );
                handlerContract = await deployments.get("WETHVaultHandler");
                if (deployResult.newlyDeployed) {
                    log(
                        `WETHVaultHandler deployed at ${handlerContract.address} for ${deployResult.receipt?.gasUsed}`
                    );
                }
                const rewardDeployment = await deployments.deploy(
                    "WETHRewardHandler",
                    {
                        contract: "RewardHandler",
                        from: deployer,
                        args: [orchestrator.address, ctx.address, vaultAddress],
                    }
                );
                log(
                    `Reward Handler deployed at ${rewardDeployment.address} for ${rewardDeployment.receipt?.gasUsed}`
                );
            } catch (error) {
                log(error.message);
            }
        }
    }
};
export default WETHVaultHandler;
