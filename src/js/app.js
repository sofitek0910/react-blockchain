App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 21000000,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
	
	    let web3;
	    
	    if (typeof window.ethereum !=='undefined') {
		
		App.web3Provider = window.ethereum;
		web3 = new Web3(window.ethereum);
		//window.ethereum.enable(); instead of the deprecated ethereum.enable we use the following
		ethereum.request({method:'eth_requestAccounts'})
		
		//window.ethereum.enable();
	    //The following is for legacy browser
	    } else if(window.web3) {
		//Use Mist/Metamasks provider
		web3 = new Web3(window.web3.currentProvider);
		console.log("Legacy Browser: Injected Web3 Detected");
		resolve(web3);
		
	    } else {
	    	App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
	        web3 = new Web3(App.web3Provider);
		console.log("No web3 instance injected, using Local web3");
		resolve(web3);
	    }
	    return App.initContracts();
	
  },


  initContracts: function() {
    $.getJSON("../abis/CoralTokenSale.json", function(coralTokenSale) {
      App.contracts.CoralTokenSale = TruffleContract(coralTokenSale);
      App.contracts.CoralTokenSale.setProvider(App.web3Provider);
      App.contracts.CoralTokenSale.deployed().then(function(coralTokenSale) {
        console.log("Coral Token Sale Address:", coralTokenSale.address);
      });
    }).done(function() {
      $.getJSON("../abis/CoralToken.json", function(coralToken) {
        App.contracts.CoralToken = TruffleContract(coralToken);
        App.contracts.CoralToken.setProvider(App.web3Provider);
        App.contracts.CoralToken.deployed().then(function(coralToken) {
          console.log("Coral Token Address:", coralToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  //listenForEvents: function() {
    //App.contracts.CoralTokenSale.deployed().then(function(instance) {
      //instance.Sell({}, {
        //fromBlock: 0,
        //toBlock: 'latest',
      //}).watch(function(error, event) {
        //console.log("event triggered", event);
        //App.render();
      //})
    //})
  //},
listenForEvents: function() {
    App.contracts.CoralTokenSale.deployed().then(function(instance) {
	console.log("instance is", instance.Sell({}))
	ethereum.on(instance.Sell({}),()=> {
		console.log("event triggered", event);
        	App.render();
	})
  
     /* instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).on('message', function(event) { 
	console.log("event triggered", event);
        App.render();
	})*/
    })
  },
    

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('.loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    if (window.ethereum) {
	ethereum.request({method:'eth_requestAccounts'}).then(function(acc) {
		App.account = acc[0];
		$('#accountAddress').html("Your Account: " + App.account.substring(0,5) + "..." +App.account.substring(38,42));
		//console.log(App.account)
    	});
    }

	//after this consider using loader.hide(); content.show(); to show the content
	//and to hide the loader

    //this is getting the account that we are connected to so you can probably use getAccounts if its supported
    //web3.eth.getCoinbase(function(err, account) {
      //if(err === null) {
        //App.account = account;
	
        //$('#accountAddress').html("Your Account: " + account);
      //}
    //})

    // Load token sale contract
    App.contracts.CoralTokenSale.deployed().then(function(instance) {
      coralTokenSaleInstance = instance;
      return coralTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(myfromWei(App.tokenPrice, "ether"));
      return coralTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);
	
	//progress bar percentage
      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract. See the available balance of the connected account
      // Total amount will be shown when admin (AKA defalult first Ganache account) is connected
      // This is because we have not transfered any of the tokens to the sale yet 
      // Else available amount for connected account will be shown
      App.contracts.CoralToken.deployed().then(function(instance) {
        coralTokenInstance = instance;
        return coralTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.dapp-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

 //Buying the tokens
  buyTokens: function() {
    $('#content').hide();
    $('.loader').show();
    //number of tokens you want to buy
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.CoralTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event

	//Sell event was not triggered so just rendering the app 
	//as the purpose of waiting for sell event was just to update
	//the client that the purchase was successful and reloading the page
	//and render reloads the page. Consider adding an alert that executes before
	//app.render and notifies the user that it was a successful purchase
	App.render();
    });
  }
}
//remove the following start
//}
//}
//remove the following end

$(function() {
  $(window).on("load",function() {
    App.init();
  })
});