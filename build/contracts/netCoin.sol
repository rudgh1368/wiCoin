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


    // uint256 private fixedTime = 1 days;

    // struct user {
    //     mapping(string /** userMac */ => bool) userMac;
    //     mapping(string /** apMac */ => uint256) myChannelSerial;
    //     // bool register;
    // }
    // mapping(address=>user) userList;

    struct ap {
        address APOwner;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        bool state;			// 0 <- on : 0, off : 1
        bool register;
    }

    mapping(string /** apMac */ => ap) apList;
    mapping(string /** apMac */ => mapping(string /** userMac */ => channel)) myChannel;

    // struct apOwner{
    //     mapping(string /** apMac */ => ap) apList;
    //     mapping(string /** apMac */ => mapping(string /** userMac */ => channel)) myChannel;
    // }
    // mapping(address=>apOwner) apOwnerList;

    struct channel {
        address consumerAddress;
        address publisherAddress;
        // uint256 deposit;
        // uint256 BP;
        uint256 availableTime;     // minutes
        uint256 startTime;
        // uint256 createTime;     // use - setting
        bool state;                // buy?
    }
    constructor()
    ERC20Detailed(_name, _symbol, _decimals)
    public {
        _mint(owner(), totalToken /*totalSupply*/);
    }

    // function registerUserMac(string memory _mac) public {
    //     // require(userList[msg.sender].register==false);

    //     userList[msg.sender].userMac[_mac] = true;
    //     // userList[msg.sender].register == true;
    // }

    function registerAP(string memory _mac, uint256 _startTime, uint256 _endTime, uint256 _price) public{
        apList[_mac] = setAP(msg.sender, _startTime, _endTime, _price);
    }

    function setAP(address _APOwner, uint256 _startTime, uint256 _endTime, uint256 _price) internal pure returns(ap memory){
        ap memory temp;

        require(temp.register == false);
        temp.APOwner = _APOwner;
        temp.startTime = _startTime;
        temp.endTime = _endTime;
        temp.price = _price;
        temp.register = true;

        return temp;
    }

    // function addUserMac(string memory _mac) public {
    //     require(userList[msg.sender].register==true);

    //     userList[msg.sender].userMac.push(_mac);
    // }

    function setChannel(address _consumer, address _publisher, uint256 _buyTime) internal pure returns(channel memory){
        channel memory temp;

        temp.consumerAddress = _consumer;
        temp.publisherAddress = _publisher;
        temp.availableTime = _buyTime;
        temp.startTime = 0;
        temp.state = true;

        return temp;
    }

    function buyAP(address _apOwnerAddress, string memory _apMac, string memory _userMac, uint256 _token, uint256 _buyTime) public{
        // require(userList[msg.sender].register ==true);
        require(apList[_apMac].state ==true);
        require(apList[_apMac].APOwner ==_apOwnerAddress);

        // require(userList[msg.sender].myChannelSerial[_userMac] == 0);
        require(_token == apList[_apMac].price * _buyTime); // buyTime 10M = 1

        transfer(_apOwnerAddress, _token);

        myChannel[_apMac][_userMac] = setChannel(msg.sender, _apOwnerAddress, _buyTime);

        // userList[msg.sender].myChannelSerial[_apMac] = serial;
        // apOwnerList[_apOwnerAddress].myChannelSerial[_apMac].push(serial);
    }

    function buyToken(uint256 _token) public{

        /*
        *   ether transfer require
        */

        //   require(userList[msg.sender].register == true);

        ownerTransfer(owner(), msg.sender, _token);
    }

    function useAP(string memory _userMac, string memory _apMac) public {
        require(myChannel[_apMac][_userMac].state == true); // register check
        require(myChannel[_apMac][_userMac].consumerAddress == msg.sender);
        require(myChannel[_apMac][_userMac].availableTime>0);

        myChannel[_apMac][_userMac].startTime = now;

        // ap 구현 exceed time

    }

    function stopAP(string memory _userMac, string memory _apMac) public {
        require(myChannel[_apMac][_userMac].state == true);
        require(myChannel[_apMac][_userMac].consumerAddress == msg.sender);

        uint256 useTime = myChannel[_apMac][_userMac].startTime + (myChannel[_apMac][_userMac].availableTime) * 60;

        // availableTime check;
        require(now < useTime);

        uint256 remain = now - useTime;
        remain /= 60;

        myChannel[_apMac][_userMac].startTime = 0;
        myChannel[_apMac][_userMac].availableTime = remain;
    }

    function endAP(string memory _userMac, string memory _apMac) public {
        require(myChannel[_apMac][_userMac].state == true);
        require((msg.sender == myChannel[_apMac][_userMac].consumerAddress) || (msg.sender == myChannel[_apMac][_userMac].publisherAddress));

        // availableTime check;
        require(now >= (myChannel[_apMac][_userMac].startTime + (myChannel[_apMac][_userMac].availableTime) * 60));

        myChannel[_apMac][_userMac].state = false;
        myChannel[_apMac][_userMac].availableTime = 0;

    }

    function onAP(string memory _mac) public {
        require(apList[_mac].register == true);
        require(apList[_mac].state == false);
        require(apList[_mac].APOwner == msg.sender);

        apList[_mac].state = true;
    }

    function offAP(string memory _mac) public {
        require(apList[_mac].register == true);
        require(apList[_mac].state == true);
        require(apList[_mac].APOwner == msg.sender);

        // time check

        // deposit 정산
        // 목록 초기화

        apList[_mac].state = false;
    }


    // deposit exceed
    // function completeChannel(uint256 _channelSerial, bytes32 _balanceProof, uint8 v, bytes32 r, bytes32 s, uint256 _balance) public {
    //     require(checkBalanceProof(registeredChannel[_channelSerial].consumerAddress, _balanceProof, v, r, s));     // check balanceproof
    //     require(_balance == registeredChannel[_channelSerial].deposit);

    //     // deposit token refund
    //     complete(msg.sender, _balance);

    //     registeredChannel[_channelSerial].state = true;
    // }

    // publisher
    // function completeChannel
    // function publisherCompleteChannel(uint256 _channelSerial, bytes32 _balanceProof, uint8 v, bytes32 r, bytes32 s, uint256 _balance) public {
    //     require(checkBalanceProof(registeredChannel[_channelSerial].consumerAddress, _balanceProof, v, r, s));     // check balanceproof
    //     require(_balance <= registeredChannel[_channelSerial].deposit);
    //     require(now >= registeredChannel[_channelSerial].createTime + registeredChannel[_channelSerial].duration);

    //     // deposit token refund
    //     middleComplete(msg.sender, registeredChannel[_channelSerial].consumerAddress, _balance, registeredChannel[_channelSerial].deposit);

    //     registeredChannel[_channelSerial].state = true;
    // }

    // publisher BP strore
    // function publisherStoreBP (uint256 _channelSerial, bytes32 _balanceProof, uint8 v, bytes32 r, bytes32 s, uint256 _balance) public {
    //     require(checkBalanceProof(registeredChannel[_channelSerial].consumerAddress, _balanceProof, v, r, s));     // check balanceproof
    //     require(_balance <= registeredChannel[_channelSerial].deposit);

    //     registeredChannel[_channelSerial].BP = _balance;
    // }

    // consumer compleChannel
    // function consumerCompleteChannel(uint256 _channelSerial) public {
    //     require(registeredChannel[_channelSerial].BP != 0);

    //     // deposit token refund
    //     middleComplete(registeredChannel[_channelSerial].publisherAddress, msg.sender, registeredChannel[_channelSerial].BP, registeredChannel[_channelSerial].deposit);

    //     registeredChannel[_channelSerial].state = true;
    // }


}

