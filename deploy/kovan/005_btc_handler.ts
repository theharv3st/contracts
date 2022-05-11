import { hardhatArguments } from "hardhat";
import { deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const BTCVaultHandler = async (hre: HardhatRuntimeEnvironment) => {
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
            handlerContract = await deployments.get("WBTCVaultHandler");
        } catch (error) {
            try {
                let tcap = await deployments.get("TCAP");
                let BTCContract = await deployments.get("WBTC");
                let divisor = process.env.DIVISOR as string;
                let ratio = process.env.RATIO as string;
                let burnFee = process.env.BURN_FEE as string;
                let liquidationPenalty = process.env
                    .LIQUIDATION_PENALTY as string;
                let tcapOracle = await deployments.get("TCAPOracle");
                let priceFeedETH = await deployments.get("WETHOracle");
                let priceFeedBTC = await deployments.get("WBTCOracle");
                let nonce = await owner.getTransactionCount();
                const vaultAddress = ethers.utils.getContractAddress({
                    from: deployer,
                    nonce: nonce++,
                });
                const timelock = await deployments.get("Timelock");
                const deployResult = await deployments.deploy(
                    "WBTCVaultHandler",
                    {
                        from: deployer,
                        contract: "ERC20VaultHandler",
                        args: [
                            orchestrator.address,
                            divisor,
                            ratio,
                            burnFee,
                            liquidationPenalty,
                            tcapOracle.address,
                            tcap.address,
                            BTCContract.address,
                            priceFeedBTC.address,
                            priceFeedETH.address,
                            timelock.address,
                            "20000000000000000000",
                        ],
                    }
                );
                handlerContract = await deployments.get("WBTCVaultHandler");
                if (deployResult.newlyDeployed) {
                    log(
                        `WBTCVaultHandler deployed at ${handlerContract.address} for ${deployResult.receipt?.gasUsed}`
                    );
                }
            } catch (error) {
                log(error.message);
            }
        }
    }
};

export default BTCVaultHandler;
