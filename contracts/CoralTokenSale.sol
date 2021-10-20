pragma solidity >=0.5.16;

import "./CoralToken.sol";

contract CoralTokenSale {
    // we dont want to tell the public who the admin is 
    // or to expose admin address which is why it is not set to public like the others
    address payable admin;
    CoralToken public tokenContract;
    uint256 public tokenPrice; 
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(CoralToken _tokenContract, uint256 _tokenPrice) public {
        // Assign an admin
       
        admin = msg.sender;
        // Assign Contract
        tokenContract = _tokenContract;
        // Token Price
        tokenPrice = _tokenPrice;
    }
    //multiply safely without causing problems in the contract code
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y== 0 || (z = x * y)/y == x);
    }

    //Buy tokens below
    //Public so that we can call the function on the client side on the website
    function buyTokens(uint256 _numberOfTokens) public payable {
        //Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        //Require that there are enough tokens in the contract
        require(tokenContract.balanceOf(address(this))>= _numberOfTokens);
        //Require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //Keep track of how many tokens are sold
        tokensSold += _numberOfTokens;
        //Trigger a sell event
        emit Sell(msg.sender, _numberOfTokens);

    }
    //Ending Token Sale CoralTokenSale
    function endSale() public {
        //Require that only admin can do this
        require(msg.sender == admin);
        //Transfer remaining amount of tokens in a sale back to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //Destroy contract
        admin.transfer(address(this).balance);
    }
}