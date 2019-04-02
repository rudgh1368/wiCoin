var connection = require('../connection/connect.js');

var createAccount = function (params, callback) {
    console.log("JSON-RPC createAccount 호출");
    console.log(params[0].password);

    connection.createAccount(params[0].password, function (result) {
        if(result!=false) {
            console.log("ether 전송 성공");
            callback(null, result);
        }
    })
};
module.exports = createAccount;