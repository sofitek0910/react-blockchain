App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
	//Web3 "Usage" on github, copy code and paste
	//part of original if statement start
    //if (typeof web3 !== 'undefined') {
	//part of original if statement end

      // If a web3 instance is already provided by Meta Mask.

	//const Web3 = require('web3');
		// web3 lib instance
	//const web3 = new Web3(window.ethereum);
		// get all accounts
	//const accounts = await web3.eth.getAccounts();
	
	//original
     	//App.web3Provider = web3.currentProvider;
     	//web3 = new Web3(web3.currentProvider);
	//original end

	window.ethereum.enable();
    } else {
      // Specify default instance if no web3 instance provided
      //App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      //web3 = new Web3(App.web3Provider);
	const Web3 = require('web3');

	let web3 = new Web3('ws://localhost:7545');
	web3.setProvider('ws://localhost:7545');
	web3.eth.getAccounts().then(console.log);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("CoralTokenSale.json", function(coralTokenSale) {
      App.contracts.CoralTokenSale = TruffleContract(coralTokenSale);
      App.contracts.CoralTokenSale.setProvider(App.web3Provider);
      App.contracts.CoralTokenSale.deployed().then(function(coralTokenSale) {
        console.log("Coral Token Sale Address:", coralTokenSale.address);
      });
    })
/*.done(function() {
      $.getJSON("DappToken.json", function(dappToken) {
        App.contracts.DappToken = TruffleContract(dappToken);
        App.contracts.DappToken.setProvider(App.web3Provider);
        App.contracts.DappToken.deployed().then(function(dappToken) {
          console.log("Dapp Token Address:", dappToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.DappTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.DappTokenSale.deployed().then(function(instance) {
      dappTokenSaleInstance = instance;
      return dappTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return dappTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.DappToken.deployed().then(function(instance) {
        dappTokenInstance = instance;
        return dappTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.DappTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}*/
//remove the following start
}
}
//remove the following end

$(function() {
  $(window).load(function() {
    App.init();
  })
});