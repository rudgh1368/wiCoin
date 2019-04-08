// 로컬 인증 방식을 사용하는 패스포트 설정

var LocalStrategy = require('passport-local').Strategy;
var connectBC = require('../../connection/connect');

module.exports = new LocalStrategy({
    usernameField: 'id',
    passwordField: 'password',
    passReqToCallback: true // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달
}, function (req, id, password, done) {
    // 나머지 요청 파라미터 전부 확인
    var paramWallet = req.body.wallet_address || req.query.wallet_address;
    var paramName = req.body.name || req.query.name;
    var paramTel = req.body.tel || req.query.tel;
    var paramAddress = req.body.address || req.query.address;
    var paramMac_address = req.body.mac_addr || req.query.mac_addr;
    var paramWallet_pass = req.body.wallet_password || req.query.wallet_password;
    var paramAE = req.body.accountEncryption || req.query.accountEncryption;

    console.log('passport의 local-signup 호출됨 : ' + id + ', ' + password + ', '
        + paramWallet + ', ' + paramName + ', ' + paramTel + ', ' + paramAddress
        + ', ' + paramWallet_pass  + ', ' + paramAE);

    // findOne 메소드가 blocking 되지 않도록 하고 싶은 경우, async 방식으로 변경
    process.nextTick(function () {
        var database = req.app.get('database');
        database.UserModel.findOne({'id': id}, function (err, user) {
            // 에러 발생 시
            if (err) {
                return done(err);
            }

            // 기존에 사용자 정보가 있는 경우
            if (user) {
                console.log('기존 아이디가 있음');
                return done(null, false, req.flash('signupMessage', '이미 존재하는 아이디입니다.')); // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
            } else {
                // 모델 인스턴스 객체 만들어 저장
                var user = new database.UserModel({
                    'id': id,
                    'password': password,
                    'wallet_address': paramWallet,
                    'name': paramName,
                    'tel': paramTel,
                    'address': paramAddress,
                    'mac' : paramMac_address,
                    'wallet_password': paramWallet_pass,
                    'accountEncryption': paramAE
                });
                user.save(function (err) {
                    if (err) {
                        throw err;
                    }

                    console.log("사용자 데이터 추가함.");

                    connectBC.transferEther(paramWallet, function (transferResult) {
                        if(transferResult) {
                            console.log("Ether 전송완료");

                            return done(null, user);
                        }else { // 추후에 error 처리
                            console("transferEther error");

                            return done(null, user);
                        }
                    })
                });
            }
        });
    });
});