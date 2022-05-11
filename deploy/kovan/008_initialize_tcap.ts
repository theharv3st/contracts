import { ethers as ethershardhat, hardhatArguments } from "hardhat";
require("dotenv").config();

module.exports = async ({ deployments }: any) => {
    if (hardhatArguments.network === "kovan") {
        let DAIHandler = await deployments.get("DAIVaultHandler");
        let WETHHandler = await deployments.get("WETHVaultHandler");
        let WBTCHandler = await deployments.get("WBTCVaultHandler");
        let OrchestratorDeployment = await deployments.get("Orchestrator");
        let tcap = await deployments.get("TCAP");

        let orchestrator = await ethershardhat.getContractAt(
            "Orchestrator",
            OrchestratorDeployment.address
        );

        console.log("Adding vault Handlers");
        await orchestrator.addTCAPVault(tcap.address, DAIHandler.address);
        await orchestrator.addTCAPVault(tcap.address, WETHHandler.address);
				await orchestrator.addTCAPVault(tcap.address, WBTCHandler.address);
    }
};
module.exports.tags = ["Initialize"];
