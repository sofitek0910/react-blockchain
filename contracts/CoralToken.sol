pragma solidity >=0.5.16;

contract CoralToken {
    //Name (like Bitcoin and Ethereum) optional in ERC20 standard but seen on an exchange
    string public name = "Coral Token";
    //Symbol (like BTC and ETH) optional in ERC20 standard but seen on an exchange
    string public symbol = "CRL";
    //Standard just gives you a version, not part of ERC20 standard
    string public standard = "Coral Token v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    //approve event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 indexed _value   
    );

    mapping(address => uint256) public balanceOf;
    //the following nested mapping says I account A (first address) approve account B (second address) to spend C (uint256) amount of tokens
    mapping(address => mapping(address => uint256)) public allowance;
    // Functions not allowed to have same name as contract, changed function from CoralToken to Coral_Token changed function to constructor
    constructor(uint256 _initialSupply) public {
    // TODO total supply is 28million
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        // allocate initial supply
    }
    //underscores like _initialSupply or _value represent local variables not global variables
    //Transfer function
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Exception if account doesn't have enough
        // Require checks if this is is true and if it is continue transaction, if false stop and throw an error message
        // here we check if the sender has enough tokens to send, if they do then the transaction continues and if false then throw error
        require(balanceOf[msg.sender] >= _value);
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // Transfer event to trigger events you must emit them in new solidity
        emit Transfer(msg.sender, _to, _value);

        // Return Boolean
        return true;
        

    }

    //Delegated transfer

    //Approve (Account A Approving B to spend C amount of tokens on A's behalf)

    function approve(address _spender, uint256 _value) public returns (bool success) {
        //allowance
        allowance[msg.sender][_spender] = _value;
        //approve event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }
    //transfer from. here there are 3 accounts, account B which calls the function, account A which is where we transfer from
    //and account C which we are transferring to
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        
        // require _from has enough tokens
        require(_value <= balanceOf[_from]);
        // require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);
        //change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        //update allowance
        allowance[_from][msg.sender] -=_value;
        //transfer event
        emit Transfer(_from, _to, _value);
        // return a boolean ERC 20 requirement
        return true;
    }
}