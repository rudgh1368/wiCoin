connectBC = require('../connection/connect');

var useToken = function (req, res) {
    console.log("useToken 접근");

    var paramApid = req.body.id || req.query.id;

    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        database.ApModel.load(paramApid, function (err, results) {
            if (err) {
                console.error('게시판 글 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("게시판 글 조회 중 에러 발생" + err.stack);' +
                    'location.href="/listap"</script>');
                res.end();
                return;
            }

            if (results) {
                console.dir(results);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});

                // 뷰 템플레이트를 이용하여 렌더링한 후 전송
                var context = {
                    aps: results,
                    Entities: Entities,
                };

                if (!req.user) {
                    console.log('ap: 사용자 인증 안된 상태임.');
                    context.login_success = false;
                } else {
                    console.log('ap: 사용자 인증된 상태임.');
                    console.log('회원정보 로드.');
                    console.dir(req.user);
                    context.login_success = true;
                    context.user = req.user;
                }

                req.app.render('useToken', context, function (err, html) {
                    if (err) {
                        console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                            'location.href="/listap"</script>');
                        res.end();
                        return;
                    }

                    res.end(html);
                });

            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("글 조회 실패" + err.stack);' +
                    'location.href="/listap"</script>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
            'location.href="/listap"</script>');
        res.end();
    }





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
        var time = parseInt(req.body.time);

        console.log("time : ", time);
        
        
        connectBC.checkToken(encryptionWallet, walletPassword, function (result) {
            context.token = result;
            res.render('useToken.ejs', context);
        });
    }

}

var use = function(req, res){
    console.log("useToken/use 접근");

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
        var time = parseInt(req.body.time);

        console.log("time : ", time);
        
        
        connectBC.buyAP(encryptionWallet, walletPassword, function (result) {
            context.token = result;
            res.render('useToken.ejs', context);
        });
    }
}

module.exports.useToken = useToken;
module.exports.use = use;