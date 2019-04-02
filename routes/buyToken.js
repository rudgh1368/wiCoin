connectBC = require('../connection/connect');

var buyToken = function (req, res) {
    console.log("buyToken 접근");

    if(!req.user){
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else{
        var context = {}
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        context.output = undefined;

        var encryptionWallet = req.user.accountEncryption;
        var walletPassword = req.user.wallet_password;
        connectBC.checkToken(encryptionWallet, walletPassword, function (result) {
            context.token = result;
            res.render('buyToken.ejs', context);
        });
    };
}

var buy = function(req,res){
    console.log("/buyToken/buy 접근");


    if(!req.user){
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else{
        var context = {}
        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;
        context.output = undefined;

        var encryptionWallet = req.user.accountEncryption;
        var walletPassword = req.user.wallet_password;
        var tokenAmount = parseInt(req.body.Token);

        console.log("Token : ", tokenAmount);

        connectBC.buyToken(encryptionWallet, walletPassword, tokenAmount, function (result) {
            if(result) {
                connectBC.checkToken(encryptionWallet, walletPassword, function (ownToken) {
                    context.token = ownToken;
                    res.render('buyToken.ejs', context);
                })
            }
        });
    };

}

module.exports.buyToken = buyToken;
module.exports.buy = buy;