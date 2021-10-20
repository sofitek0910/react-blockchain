import React, { Component } from 'react';
import daiLogo from '../dai-logo.png';
import './App.css';
import Web3 from 'web3';
import DaiTokenMock from '../abis/DaiTokenMock.json'

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      //window.ethereum.request({method:'eth_requestAccounts'});
      console.log("Correct Browser Detected");
    }

    else if (window.web3) {
      console.log("Legacy Browser: Injected Web3 Detected");
      window.web3 = new Web3(window.web3.currentProvider)
     
    }

    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const daiTokenAddress = "0x9022b68E947A30136433ee624ccBD3490b0495Be" // Replace DAI Address Here
    const daiTokenMock = new web3.eth.Contract(DaiTokenMock.abi, daiTokenAddress)
    this.setState({ daiTokenMock: daiTokenMock })
    const balance = await daiTokenMock.methods.balanceOf(this.state.account).call()
    this.setState({ balance: web3.utils.fromWei(balance.toString(), 'Ether') })
    const transactions = await daiTokenMock.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { from: this.state.account } })
    const transactionsTo = await daiTokenMock.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { to: this.state.account } })

    this.setState({ transactions: transactions })
    this.setState({ transactionsTo: transactionsTo })
    //this next line will combine the from transactions and the to transactions into one but how do we order them according to the date created
    const allTransactions = await transactions.concat(transactionsTo)

    this.setState({ allTransactions: allTransactions })
    console.log("all transactions", allTransactions)
    console.log("transactions to", transactionsTo)
  }

  transfer(recipient, amount) {
    this.state.daiTokenMock.methods.transfer(recipient, amount).send({ from: this.state.account })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      daiTokenMock: null,
      balance: 0,
      transactionsTo: [],
      allTransactions: [],
      transactions: []
    }

    this.transfer = this.transfer.bind(this)
  }

  render() {
    return (
      <div>
   <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto" style={{ width: "90%;margin:0 auto" }}>
                
                <a
                  href="http://www.coralco.co.za"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={daiLogo} width="100" />
                </a>
                <h4>{this.state.balance} DAI</h4>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const recipient = this.recipient.value
                  const amount = window.web3.utils.toWei(this.amount.value, 'Ether')
                  this.transfer(recipient, amount)
                }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="recipient"
                      type="text"
                      ref={(input) => { this.recipient = input }}
                      className="form-control buy-input"
                      placeholder="Recipient Address"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="amount"
                      type="text"
                      ref={(input) => { this.amount = input }}
                      className="form-control buy-input"
                      placeholder="Amount"
                      required />
                  </div>
                  <button type="submit" className="btn clear-cart banner-btn badge2cart btn-primary btn-lg">Send</button>
                </form>
                <br/>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Sent To</th>
                      <th scope="col">Sent From</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.allTransactions.map((tx, key) => {
                      return (
                        <tr key={key} >
                          <td>{tx.returnValues.to ? tx.returnValues.to.substring(0,5): '0x0'}...{tx.returnValues.to ? tx.returnValues.to.substring(38,42): '0x0'}</td>
                          <td>{tx.returnValues.from ? tx.returnValues.from.substring(0,5): '0x0'}...{tx.returnValues.from ? tx.returnValues.from.substring(38,42): '0x0'}</td>
                          <td>{window.web3.utils.fromWei(tx.returnValues.value.toString(), 'Ether')}</td>
                        </tr>
                      )
                    }) }
                    
                  </tbody>
                  
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
