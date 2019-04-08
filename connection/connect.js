let fs = require("fs");
let Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const abi = fs.readFileSync(__dirname + '/wiCoin.json');
const bytecode = fs.readFileSync(__dirname + '/wiCoin.txt', 'utf8').toString();

var contract_address = "";

// wiCoin Setting
const wiCoin = new web3.eth.Contract(JSON.parse(abi));// abi (json)형식으로 가져와야한다.

// The transaction does not require a fee.
wiCoin.options.gasPrice = 0;
// HomeChain.options.gas = "";                           // 가스 limit

module.exports = {
    createAccount : function(password, callback){
        console.log('web3, create_account 접근');

        var newAccount = web3.eth.accounts.create();

        var address = newAccount.address;
        var privateKey = newAccount.privateKey;
        console.log("address : ", address);
        console.log("privateKey : ", privateKey);

        var accountEncryption = web3.eth.accounts.encrypt(privateKey, password);
        console.log("accountEncryption : ", accountEncryption);

        var result = {address : address, privateKey : privateKey, accountEncryption : accountEncryption};
        callback(result);
    },

    transferEther : function(address, callback){
        console.log('web3, transferEther 접근');
        // test를 위해 ether 전송
        Transfer(address, function (success) {
            if(success){
                callback(true);
            }
            else{
                callback(false);
            }
        });
    },


    registerAP : function(accountEncryption, password, mac, startTime, endTime, price, callback){
        console.log('web3, registerAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.registerAP(mac, startTime, endTime, price);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("registerAPMac error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    checkToken : function (accountEncryption, password, callback) {
        console.log('web3, checkToken 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;

        wiCoin.setProvider(web3.currentProvider);

        wiCoin.methods.balanceOf(address).call({
            from : address
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(err);
            }
            else {
                console.log('Token : ', result)
                callback(result)
            }
        })
    },

    buyToken : function (accountEncryption, password, tokenAmount, callback) {
        console.log('web3, buyToken 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.buyToken(tokenAmount);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("buyToken error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    buyAP : function(accountEncryption, password, apOwnerAddress, apMac, userMac, token, buyTime, callback) {
        console.log('web3, buyAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.buyAP(apOwnerAddress, apMac, userMac, token, buyTime);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            console.log("asdasd")
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("buyAP error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    // string memory _userMac, string memory _apMac
    useAP : function(accountEncryption, password, userMac, apMac, callback) {
        console.log('web3, useAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.useAP(userMac, apMac);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("useAP error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    // string memory _userMac, string memory _apMac
    stopAP : function(accountEncryption, password, userMac, apMac, callback) {
        console.log('web3, stopAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.stopAP(userMac, apMac);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("stopAP error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    // string memory _userMac, string memory _apMac
    endAP : function(accountEncryption, password, userMac, apMac, callback) {
        console.log('web3, endAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.endAP(userMac, apMac);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("endAP error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    // _mac
    onAP : function(accountEncryption, password, apMac, callback) {
        console.log('web3, onAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.onAP(apMac);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("onAP error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },

    //_mac
    offAP : function(accountEncryption, password, apMac, callback) {
        console.log('web3, offAP 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.offAP(apMac);
        var encodedABI = transfer.encodeABI();

        var tx = {
            from : address,
            to : contract_address,
            gas : 6721975,
            data : encodedABI
        };

        web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
            var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

            tran.catch(function (error) {
                console.log("offAP error");
                console.log(error);
                callback(false);
            });

            tran.on('confirmation', (confirmationNumber, receipt) => {
                console.log('confirmation: ' + confirmationNumber);
            });

            tran.on('transactionHash', hash => {
                console.log('hash');
                console.log(hash);
            });

            tran.on('receipt', receipt => {
                console.log('reciept');
                console.log(receipt);
                callback(true);
            });
        });
    },
};

// create SmartContract
function createSmartContract() {
    wiCoin.deploy({
        data:bytecode
    }).send({
        from: '0x5b7C0779F2241bdf429803F0aB63F6948B5aD095',
        gas: 6721975
    }).then(function (newContractInstance) {
        console.log("contract address : ", newContractInstance.options.address);
        contract_address = newContractInstance.options.address;
        wiCoin.options.address = contract_address;              // contract 주소
    })
}
// 스마트컨트랙트 배포
// createSmartContract();
contract_address = "0x65275e7e40d123563de2b6658c701e9bee3bc5c2";
wiCoin.options.address = '0x65275e7e40d123563de2b6658c701e9bee3bc5c2';

// 100토큰 전달
function Transfer(toAddress, callback){
    console.log(toAddress +"에게 ether 전달");
    web3.eth.sendTransaction({to:toAddress, from:"0x5b7C0779F2241bdf429803F0aB63F6948B5aD095", value:100000000000000000})
    callback(true)
}
