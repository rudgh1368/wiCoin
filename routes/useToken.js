connectBC = require('../connection/connect');

var useToken = function (req, res) {
    console.log("useToken 접근");

    var paramApid = req.body.id || req.query.id || req.params.id;

    console.log('파라미터값 : ' + paramApid);

    var database = req.app.get('database');
    var context = {};
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

                context.aps = results;



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

                context.output = undefined;

                var encryptionWallet = req.user.accountEncryption;
                var walletPassword = req.user.wallet_password;

                connectBC.checkToken(encryptionWallet, walletPassword, function (result) {
                    context.token = result;
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
}

var use = function(req, res){
    console.log("useToken/use 접근");

    var apOwnerAddress = req.body.apOwnerAddress || req.query.apOwnerAddress || req.params.apOwnerAddress;
    var apMac = req.body.apMac || req.query.apMac || req.params.apMac;
    var buyTime = req.body.buyTime || req.query.buyTime || req.params.buyTime;
    var price = req.body.price || req.query.price || req.params.price;

    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;
    var paramId = req.body.ap_id || req.query.ap_id || req.params.ap_id;
    var paramUser = req.user._id;
    var paramUserMac = req.user.mac;

    var totalPrice = parseInt(buyTime) * parseInt(price);

    console.log('요청 파라미터 : ' + paramId + ', ' + paramUser);

    console.log('apOwnerAddress : ' + apOwnerAddress, 'UserMac : ' + paramUserMac,'apMac : ' + apMac, 'buyTime : ' + buyTime,
        'price : ' + price, 'accountEncryption : ' + accountEncryption, 'walletPassword : ' + walletPassword, 'totalPrice : ', totalPrice);



    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.ApModel.add_user(paramId, paramUser,function (err, results) {
            if (err) {
                console.error('ap 업데이트 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>ap 업데이트 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                console.dir(results);
                console.log('ap 업데이트 성공');
                //return res.redirect('/mypage');

            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>업데이트  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

    // 구매한 ap 업데이트

    if (database.db) {
        // 1. 글 리스트
        database.UserModel.add_ap(paramId, paramUser,function (err, results) {
            if (err) {
                console.error('user 업데이트 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>user 업데이트 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                console.dir(results);
                console.log('user 업데이트 성공');

                connectBC.buyAP(accountEncryption, walletPassword, apOwnerAddress, apMac, paramUserMac, totalPrice, buyTime, function (result) {
                    if (result) console.log("AP 구매완료");

                    return res.redirect('/mypage');

                });

            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>업데이트  실패</h2>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }


}
module.exports.useToken = useToken;
module.exports.use = use;