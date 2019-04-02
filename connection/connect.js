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
        // var result = {address : address, privateKey : privateKey, accountEncryption : accountEncryption};
        // callback(result);

        // test를 위해 ether 전송
        Transfer(address, function (success) {
            if(success){
                var result = {address : address, privateKey : privateKey, accountEncryption : accountEncryption};
                callback(result);
            }
            else{
                callback(false);
            }
        });
    },

    registerAPMac : function(accountEncryption, password, mac, startTime, endTime, callback){
        console.log('web3, registerAPMac 접근');

        var accountDecryption = web3.eth.accounts.decrypt(accountEncryption, password);
        var address = accountDecryption.address;
        var privateKey = accountDecryption.privateKey;
        wiCoin.setProvider(web3.currentProvider);

        var transfer = wiCoin.methods.registerAPMac(mac, startTime, endTime);
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

    checkEther : function (toaddress, callback) {
        console.log('web3, checkEther 접근');

        wiCoin.methods.balanceOf(toaddress).call({
            from : toaddress
        }, function (err, result) {
            if(err) {
                console.log(err);
                callback(false);
            }
            else {
                console.log('balance : ', result);
                callback(result);
            }
        })
    },

    etherTransfer : function (toAddress, amount, callback) {
        console.log('web3, etherTransfer 접근');

        transfer(toAddress, amount, function (success) {
            callback(success);
        })
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
    }

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
createSmartContract();

// 100토큰 전달
function Transfer(toAddress, callback){
    web3.eth.sendTransaction({to:toAddress, from:"0x5b7C0779F2241bdf429803F0aB63F6948B5aD095", value:100000000000000000})
    callback(true)
}
