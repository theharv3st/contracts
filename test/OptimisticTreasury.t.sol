// SPDX-License-Identifier: MIT
pragma solidity 0.7.5;

import "ds-test/test.sol";
import "../contracts/optimism/OptimisticTreasury.sol";

contract OVMl2CrossDomainMessenger {
	address public immutable xDomainMessageSender;

	constructor(address xd){
		xDomainMessageSender = xd;
	}

	function renounceOwnership(OptimisticTreasury ot) public {
		ot.renounceOwnership();
	}
}

interface Vm {
	// Set block.timestamp (newTimestamp)
	function warp(uint256) external;
	// Set block.height (newHeight)
	function roll(uint256) external;
	// Loads a storage slot from an address (who, slot)
	function load(address, bytes32) external returns (bytes32);
	// Stores a value to an address' storage slot, (who, slot, value)
	function store(address, bytes32, bytes32) external;
	// Signs data, (privateKey, digest) => (r, v, s)
	function sign(uint256, bytes32) external returns (uint8, bytes32, bytes32);
	// Gets address for a given private key, (privateKey) => (address)
	function addr(uint256) external returns (address);
	// Performs a foreign function call via terminal, (stringInputs) => (result)
	//	function ffi(string[] calldata) external returns (bytes memory);
	// Calls another contract with a specified `msg.sender`
	function prank(address) external;
	// Sets an address' balance, (who, newBalance)
	function deal(address, uint256) external;
	// Sets an address' code, (who, newCode)
	function etch(address, bytes calldata) external;
	// Expects an error on next call
	function expectRevert(bytes calldata) external;
}

contract OptimisticTreasuryTest is DSTest {
	OptimisticTreasury oTreasury;
	Vm vm;
	OVMl2CrossDomainMessenger ol2;

	function setUp() public {
		ol2 = new OVMl2CrossDomainMessenger(address(this));
		oTreasury = new OptimisticTreasury(address(this), address(ol2));
		vm = Vm(HEVM_ADDRESS);

	}

	function testSetParams() public {
		assertEq(address(oTreasury.ovmL2CrossDomainMessenger()), address(ol2));
		assertEq(oTreasury.owner(), address(this));
	}

	function testRenounceOwnership() public {
		vm.expectRevert("Ownable: caller is not the owner");
		oTreasury.renounceOwnership();
		emit log_address(ol2.xDomainMessageSender());
		ol2.renounceOwnership(oTreasury);
		assertEq(oTreasury.owner(), address(0));
	}

	function testRetrieveEth() public {
		vm.deal(address(oTreasury), 1 ether);
		assertEq(address(oTreasury).balance, 1 ether);
	}
}
