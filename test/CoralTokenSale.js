var CoralTokenSale = artifacts.require("./CoralTokenSale.sol"); //chng customise
var CoralToken = artifacts.require("./CoralToken.sol"); //chng customise

contract('CoralTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; //this token price is in wei (15 zeros 
    //wei is how we keep track of ether in solidity. its the smallest unit or subdivision of ether used in solidity so that we dont
    //use floats and we just use fixed points go to etherconverter.online
    //by setting it to this it means each of our tokens will cost about 0.001 ether
    var tokensAvailable = 21000000; //75% of 28 million (all tokens)
    var numberOfTokens;
    it('initialises the contract with the correct values', function(){
        return CoralTokenSale.deployed().then(function(instance) {
            tokenSaleInstance = instance;
            
            return tokenSaleInstance.address
        }).then(function(address) {
            assert.notEqual(address,0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address) {
            assert.notEqual(address, 0x0, 'has token contract address')
            return tokenSaleInstance.tokenPrice();
        }).then(function(price) {
            assert.equal(price, tokenPrice, 'token price is correct')
        });
    });

    it('facilitates token buying', function() {
        return CoralToken.deployed().then(function(instance) {
            // Grab token instance first
            tokenInstance = instance;
            return CoralTokenSale.deployed();
        }).then(function(instance) {
            // Then grab token sale instance
            tokenSaleInstance = instance;
            //provision 75% of all tokens to the token sale to start out with
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
        }).then(function(receipt) {
            numberOfTokens = 10;
            
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice})
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the Sell event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');

            return tokenSaleInstance.tokensSold();

        }).then(function(amount) {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), numberOfTokens)
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), tokensAvailable-numberOfTokens);
            // Try to buy tokens different from the ether value
            //below is checking if someone is using a value of 1 ether to buy tokens which would rip us off but we prevent against that
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1})
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert')>=0, 'msg.value must equal number of tokens in wei')
            return tokenSaleInstance.buyTokens(24000000, {from: buyer, value: numberOfTokens*tokenPrice})
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert')>=0, 'cannot purchase more tokens than available');
        });

    })
    it('ends token sale', function() {
        return CoralToken.deployed().then(function(instance) {
            //Grab token instance first
            tokenInstance = instance;
            return CoralTokenSale.deployed();
        }).then(function(instance) {
            //Then grab token sale instance
            tokenSaleInstance = instance;
            // Try to end sale from account other than admin
            return tokenSaleInstance.endSale({from:buyer});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert'>=0, 'mst be admin to end sale'));
            // End sale as admin
            return tokenSaleInstance.endSale({from: admin});
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 27999990, 'returns all unsold Tokens to admin')
            //Check that the token price has been reset when selfDestruct was called
            balance = web3.eth.getBalance(tokenSaleInstance.address).then(balance => {
                assert.equal(balance.toNumber(), 0)
                console.log(balance)
            }).catch(console.error);
            
            
        });
    });
});