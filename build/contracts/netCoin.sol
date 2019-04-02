pragma solidity ^0.5.1;

import "./wiCoin_erc20.sol";
import "./ERC20Detailed.sol";
import "./Ownable.sol";
import "./Validator.sol";

contract wiCoin_test is ERC20, ERC20Detailed, Ownable, Validator{

    // Symbol
    uint256 totalToken = 100000;
    string private _name = "wiCoin";
    string private _symbol = "WFI";
    uint8 private _decimals = 0;

    uint256 private channelSerial;
    uint256 private fixedTime = 1 days;

    struct user {
        string[] userMac;
        mapping(string /*userMac*/ => uint256) myChannelSerial;
        bool register;
    }
    mapping(address=>user) userList;

    struct ap {
        uint256 startTime;
        uint256 endTime;
        bool state;			// 0 <- on : 0, off : 1
        bool register;
    }

    struct apOwner{
        mapping(string => ap) apList;

        // pc 끄면 최기화 -> serial

        mapping(string => uint256[]) myChannelSerial;
    }
    mapping(address=>apOwner) apOwnerList;

    struct channel {
        address consumerAddress;
        address publisherAddress;
        uint256 deposit;
        uint256 BP;
        uint256 duration;
        uint256 createTime;
        bool state;
    }
    mapping(uint256 /*channelSerial*/ => channel) private registeredChannel;

    constructor()
    ERC20Detailed(_name, _symbol, _decimals)
    public {
        _mint(owner(), totalToken /*totalSupply*/);
    }

    function registerUser(string memory _mac) public {
        require(userList[msg.sender].register==false);

        userList[msg.sender].userMac.push(_mac);
        userList[msg.sender].register == true;
    }

    function setAP(uint256 _startTime, uint256 _endTime) internal pure returns(ap memory){
        ap memory temp;

        require(temp.register == false);
        temp.startTime = _startTime;
        temp.endTime = _endTime;
        temp.register = true;

        return temp;
    }

    function registerAPMac(string memory _mac, uint256 _startTime, uint256 _endTime) public{
        apOwnerList[msg.sender].apList[_mac] = setAP(_startTime, _endTime);
    }

    function addUserMac(string memory _mac) public {
        require(userList[msg.sender].register==true);

        userList[msg.sender].userMac.push(_mac);
    }

    function onAP(string memory _mac) public {
        require(apOwnerList[msg.sender].apList[_mac].register == true);
        require(apOwnerList[msg.sender].apList[_mac].state == false);

        apOwnerList[msg.sender].apList[_mac].state = true;
    }

    function offAP(string memory _mac) public {
        require(apOwnerList[msg.sender].apList[_mac].register == true);
        require(apOwnerList[msg.sender].apList[_mac].state == true);

        // time check

        // deposit 정산
        // 목록 초기화

        apOwnerList[msg.sender].apList[_mac].state = false;
    }

    function setChannel(address _consumerAddress, address _publisherAddress, uint256 _deposit) internal returns(uint256){
        uint256 serial = channelSerial++;

        channel memory temp;

        temp.consumerAddress = _consumerAddress;
        temp.publisherAddress = _publisherAddress;
        temp.deposit = _deposit;
        temp.createTime = now;
        temp.duration = fixedTime;

        registeredChannel[serial] = temp;

        return serial;
    }

    function buyAP(address _apOwnerAddress, string memory _userMac, string memory _apMac, uint256 _deposit) public{
        require(userList[msg.sender].register ==true);
        require(apOwnerList[_apOwnerAddress].apList[_apMac].state ==true);
        require(userList[msg.sender].myChannelSerial[_userMac] == 0);

        deposit(msg.sender, _deposit);

        uint256 serial = setChannel(msg.sender, _apOwnerAddress, _deposit);

        userList[msg.sender].myChannelSerial[_userMac] = serial;
        apOwnerList[_apOwnerAddress].myChannelSerial[_apMac].push(serial);
    }

    function buyToken(uint256 _token) public{

        /*
        *   ether transfer require
        */

        //   require(userList[msg.sender].register == true);

        ownerTransfer(owner(), msg.sender, _token);
    }

    // deposit exceed
    function completeChannel(uint256 _channelSerial, bytes32 _balanceProof, uint8 v, bytes32 r, bytes32 s, uint256 _balance) public {
        require(checkBalanceProof(registeredChannel[_channelSerial].consumerAddress, _balanceProof, v, r, s));     // check balanceproof
        require(_balance == registeredChannel[_channelSerial].deposit);

        // deposit token refund
        complete(msg.sender, _balance);

        registeredChannel[_channelSerial].state = true;
    }

    // publisher
    // function completeChannel
    function publisherCompleteChannel(uint256 _channelSerial, bytes32 _balanceProof, uint8 v, bytes32 r, bytes32 s, uint256 _balance) public {
        require(checkBalanceProof(registeredChannel[_channelSerial].consumerAddress, _balanceProof, v, r, s));     // check balanceproof
        require(_balance <= registeredChannel[_channelSerial].deposit);
        require(now >= registeredChannel[_channelSerial].createTime + registeredChannel[_channelSerial].duration);

        // deposit token refund
        middleComplete(msg.sender, registeredChannel[_channelSerial].consumerAddress, _balance, registeredChannel[_channelSerial].deposit);

        registeredChannel[_channelSerial].state = true;
    }

    // publisher BP strore
    function publisherStoreBP (uint256 _channelSerial, bytes32 _balanceProof, uint8 v, bytes32 r, bytes32 s, uint256 _balance) public {
        require(checkBalanceProof(registeredChannel[_channelSerial].consumerAddress, _balanceProof, v, r, s));     // check balanceproof
        require(_balance <= registeredChannel[_channelSerial].deposit);

        registeredChannel[_channelSerial].BP = _balance;
    }

    // consumer compleChannel
    function consumerCompleteChannel(uint256 _channelSerial) public {
        require(registeredChannel[_channelSerial].BP != 0);

        // deposit token refund
        middleComplete(registeredChannel[_channelSerial].publisherAddress, msg.sender, registeredChannel[_channelSerial].BP, registeredChannel[_channelSerial].deposit);

        registeredChannel[_channelSerial].state = true;
    }


}


