// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;
import "forge-std/Test.sol";
import "../contracts/ETHVaultHandler.sol";
import "../contracts/Orchestrator.sol";
import "../contracts/oracles/ChainlinkOracle.sol";
import "../contracts/mocks/AggregatorInterfaceTCAP.sol";
import "../contracts/mocks/AggregatorInterface.sol";
import "../contracts/mocks/WETH.sol";
import "../contracts/mocks/DAI.sol";

contract VaultMigration is Test {
  // Setup
  ETHVaultHandler ethVault;

  Orchestrator orchestrator = new Orchestrator(address(this));
  TCAP tcap =
    new TCAP("Total Crypto Market Cap Token", "TCAP", 0, orchestrator);
  AggregatorInterfaceTCAP tcapAggregator = new AggregatorInterfaceTCAP();
  AggregatorInterface ethAggregator = new AggregatorInterface();
  ChainlinkOracle tcapOracle =
    new ChainlinkOracle(address(tcapAggregator), address(this));
  ChainlinkOracle ethOracle =
    new ChainlinkOracle(address(ethAggregator), address(this));
  WETH weth = new WETH();
  address user = address(0x1);
  address user2 = address(0x2);

  //// Params
  uint256 divisor = 10000000000;
  uint256 ratio = 110;
  uint256 burnFee = 50;
  uint256 liquidationPenalty = 5;
  address treasury = address(0x3);

  event NewMigrationVault(address indexed _owner, address _tresury);

  function setUp() public {
    ethVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );

    orchestrator.addTCAPVault(tcap, ethVault);

    vm.startPrank(user);
    vm.deal(user, 100 ether);
    ethVault.createVault();
    ethVault.addCollateralETH{value: 10 ether}();
    ethVault.mint(1 ether);
    vm.stopPrank();
  }

  /// TODO:
  /// should revert if migration is not enabled
  /// should revert if migration is to an invalid vault id
  /// should revert if params are not the same (TCAP, Oracles, Formula);
  /// should transfer assets and debt to new vault
  ///

  function testSetMigrationVault_ShouldRevert_WhenNotOwner(address _randomVault)
    public
  {
    //setUp
    vm.expectRevert("Ownable: caller is not the owner");
    //execution
    ethVault.setMigrationVault(_randomVault);
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenInvalidVault(
    address _randomVault
  ) public {
    //setUp
    if (_randomVault == address(ethVault)) return;
    vm.startPrank(address(orchestrator));
    vm.expectRevert();
    //execution
    ethVault.setMigrationVault(_randomVault);
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenDivisorNotTheSame() public {
    //setUp
    uint256 wrongValue = 100;
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      wrongValue,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenRatioNotTheSame() public {
    //setUp
    uint256 wrongValue = 200;
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      wrongValue,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenBurnFeeNotTheSame() public {
    //setUp
    uint256 wrongValue = 4;
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      wrongValue,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenLiquidationPenaltyNotTheSame()
    public
  {
    //setUp
    uint256 wrongValue = 4;
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      wrongValue,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenTCAPOracleNotTheSame()
    public
  {
    //setUp
    address wrongValue = address(0x04);
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      wrongValue,
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenTCAPNotTheSame() public {
    //setUp
    TCAP wrongValue = new TCAP(
      "Total Crypto Market Cap Token 2",
      "TCAP2",
      0,
      orchestrator
    );
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      wrongValue,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenCollateralNotTheSame()
    public
  {
    //setUp
    DAI wrongValue = new DAI();
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(wrongValue),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenCollateralOracleNotTheSame()
    public
  {
    //setUp
    address wrongValue = address(0x04);
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(wrongValue),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldRevert_WhenETHOracleNotTheSame() public {
    //setUp
    address wrongValue = address(0x04);
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(wrongValue),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault configuration doesn't match"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testMigrateVault_ShouldRevert_WhenVaultIsNotAdded() public {
    //setUp
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    vm.expectRevert(
      "VaultHandler::setMigrationVault: vault still not added as a Cryptex Vault"
    );
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(0));
  }

  function testSetMigrationVault_ShouldAddAVault_WhenParamsAreValid() public {
    //setUp
    vm.startPrank(address(orchestrator));
    ETHVaultHandler newVault;
    newVault = new ETHVaultHandler(
      orchestrator,
      divisor,
      ratio,
      burnFee,
      liquidationPenalty,
      address(tcapOracle),
      tcap,
      address(weth),
      address(ethOracle),
      address(ethOracle),
      treasury,
      1 ether
    );
    //execution
    tcap.addVaultHandler(address(newVault));
    vm.expectEmit(true, true, true, true);
    emit NewMigrationVault(address(orchestrator), address(newVault));
    ethVault.setMigrationVault(address(newVault));
    //assert
    assert(ethVault.migrationVault() == address(newVault));
  }

  function testMigrateVault_ShouldRevert_WhenMigrationNotActive() public {
    //setUp
    //execution
    //assert
  }

  function testMigrateVault_ShouldRevert_WhenUserWantsToMigrateToNotTheirVault()
    public
  {
    //setUp
    //execution
    //assert
  }

  function testMigrateVault_ShouldMigrateCollateral_WhenUserWantsToUpdate()
    public
  {
    //setUp
    //execution
    //assert
  }
}
