var CoralToken = artifacts.require("./CoralToken.sol"); //chng customise
var CoralTokenSale = artifacts.require("./CoralTokenSale.sol"); //chng customise




module.exports = function (deployer) {
  deployer.deploy(CoralToken, 28000000).then(function() {
    //token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(CoralTokenSale, CoralToken.address, tokenPrice);//chng customise
  }); 
  
};