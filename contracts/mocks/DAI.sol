// SPDX-License-Identifier: MIT
/** @notice this contract is for tests only */

pragma solidity 0.7.5;

import "../libraries/ERC20.sol";

contract DAI is ERC20 {
  constructor() ERC20("Mockup DAI", "mDAI") {
    _setupDecimals(18);
  }

  function mint(address _account, uint256 _amount) public {
    _mint(_account, _amount);
  }

  function burn(address _account, uint256 _amount) public {
    _burn(_account, _amount);
  }
}
