var exec = require('child_process').exec,
    child;

var tempDB = require('./tempDB');

module.exports = {
    setting : function () {
        child = exec("iptables-restore < ./modules/backup.rules", function (error, stdout, stderr) {
            if (error !== null) {
                console.log('iptables setting 실패');
            }else{
                console.log('iptables setting 성공');
            }
        });
    },

    accept : function (userIP) {
        var command = "iptables -I FORWARD -p tcp --dport 80 -s " + userIP + " -j ACCEPT\n" +
            "iptables -I FORWARD -p tcp --dport 443 -s " + userIP + " -j ACCEPT";

        console.log(command);
        child = exec(command,
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('iptables aser Add 실패');
                }else{
                    console.log('iptables uesr add 성공');
                    tempDB.addUser(userIP);
                }
            });
    },

    drop : function (userIP) {
        var command = "iptables -D FORWARD -p tcp --dport 80 -s " + userIP + " -j ACCEPT\n" +
            "iptables -I FORWARD -D tcp --dport 443 -s " + userIP + " -j ACCEPT";

        console.log(command);
        child = exec(command,
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('iptables aser drop 실패');

                }else{
                    console.log('iptables uesr drop 성공');
                    tempDB.removeUser(userIP);
                }
            });
    }
}
