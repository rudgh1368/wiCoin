var Entities = require('html-entities').AllHtmlEntities;
var connectBC = require('../connection/connect');
var iptables = require('../modules/iptables');

var mypage = function (req, res) {
    console.log('mypage 모듈 안에 있는 mypage 호출됨.');


    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    }else {

        console.log('사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);

        // URL 파라미터로 전달됨
        var paramId = req.user._id;
        var paramWriter = req.user.id;

        console.log('요청 파라미터 : ' + paramId);


        var database = req.app.get('database');
        var context = {};

        // 여기서부터

        if (database.db) {
            database.UserModel.myaplist(paramWriter, function (err, user_results) {
                if (err) {
                    console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("게시판 글 추가 중 에러 발생");' +
                        'location.href="/listap"</script>');
                    res.end();

                    return;
                }
                if (user_results) {
                    console.dir('user result' + user_results);
                    context.cuser = user_results;
                }

                else {
                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("글 조회 실패" + err.stack);' +
                        'location.href="/listap"</script>');
                    res.end();
                }
            });
        }else {
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
                'location.href="/listap"</script>');
            res.end();
        }
        // 여기까지


        // 데이터베이스 객체가 초기화된 경우
        if (database.db) {
            // 1. 글 리스트
            database.ApModel.mylist(paramId, function (err, results) {
                if (err) {
                    console.error('게시판 글 조회 중 에러 발생 : ' + err.stack);

                    res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                    res.write('<script>alert("게시판 글 조회 중 에러 발생" + err.stack);' +
                        'location.href="/listap"</script>');
                    res.end();
                    return;
                }

                if (results) {
                    console.dir('ap result' + results);

                    // 전체 문서 객체 수 확인
                    database.ApModel.count().exec(function (err, count) {
                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});

                        // 뷰 템플레이트를 이용하여 렌더링한 후 전송 context.user = user_results;
                        context.aps = results;
                        context.Etities = Entities;

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

                        req.app.render('mypage', context, function (err, html) {
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

};
// ap on 버튼눌렀을때
var ap_on = function (req, res) {
    console.log('mypage 모듈 안에 있는 ap_on 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramApMac = req.body.mac || req.query.mac || req.params.mac;
    console.log('요청 파라미터 : ' + paramId);
    console.log('요청 paramApMac : ' + paramApMac);

    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;

    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.ApModel.ap_on(paramId, function (err, results) {
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

                // accountEncryption, password, apMac, callback
                connectBC.onAP(accountEncryption, walletPassword, paramApMac, function (result) {
                    if (result) console.log("ap on 완료");

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
};
// ap off 버튼 눌렀을때
var ap_off = function (req, res) {
    console.log('mypage 모듈 안에 있는 ap_off 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramApMac = req.body.mac || req.query.mac || req.params.mac;

    console.log('요청 파라미터 : ' + paramId);

    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;

    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.ApModel.ap_off(paramId, function (err, results) {
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

                connectBC.offAP(accountEncryption, walletPassword, paramApMac, function (result) {
                    if (result) {
                        console.log("ap off 완료");
                        iptables.setting();
                    }

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
};

// 내 정보 수정 했을때
var edit_name = function (req, res) {
    console.log('mypage 모듈 안에 있는 edit_name 호출됨.');

    // URL 파라미터로 전달됨
    var paramName = req.body.name || req.query.name || req.params.name;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : ' + paramName + ' , ' + paramUser);

    var database = req.app.get('database');

    if (database.db) {

        database.UserModel.edit_name(paramUser, paramName, function (err, results) {
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


                return res.redirect('/mypage');

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
};

var edit_tel = function (req, res) {
    console.log('mypage 모듈 안에 있는 edit_tel 호출됨.');

    // URL 파라미터로 전달됨
    var paramTel = req.body.tel || req.query.tel || req.params.tel;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : ' + paramTel + ' ,' + paramUser);

    var database = req.app.get('database');

    if (database.db) {

        database.UserModel.edit_tel(paramUser, paramTel,function (err, results) {
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


                return res.redirect('/mypage');

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
};

var edit_address = function (req, res) {
    console.log('mypage 모듈 안에 있는 edit_address 호출됨.');

    // URL 파라미터로 전달됨
    var paramAddress = req.body.address || req.query.address || req.params.address;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : ' + paramAddress + ' ,' + paramUser);

    var database = req.app.get('database');

    if (database.db) {

        database.UserModel.edit_address(paramUser, paramAddress,function (err, results) {
            if (err) {
                console.error('user 업데이트 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>ap 업데이트 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                console.dir(results);
                console.log('user 업데이트 성공');


                return res.redirect('/mypage');

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
};

var edit_mac = function (req, res) {
    console.log('mypage 모듈 안에 있는 edit_name 호출됨.');

    // URL 파라미터로 전달됨
    var paramMac = req.body.mac_addr || req.query.mac_addr || req.params.mac_addr;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : '+ paramMac + ' ,' + paramUser);

    var database = req.app.get('database');

    if (database.db) {


        database.UserModel.edit_mac(paramUser, paramMac,function (err, results) {
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


                return res.redirect('/mypage');

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
};

var edit_ap = function (req, res) {
    console.log('mypage 모듈 안에 있는 edit_ap 호출됨.');

    var paramId = req.body.ap_id || req.query.ap_id || req.params.ap_id;
    console.log('요청파라미터 :' + paramId);

    if (!req.user) {
        console.log('mypage: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {
        var context = {
            ap_id : paramId
        };
        console.log('mypage: 사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;

        req.app.render('edit_ap', context, function (err, html) {

            if (err) {
                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("응답 웹문서 생성 중 에러 발생");' +
                    'location.href="/"</script>');
                res.end();
                return;
            } else res.end(html);

        });
    }

}

var write = function (req, res) {
    console.log('mypage 모듈 안에 있는 edit_ap/write 호출됨.');

    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;
    var paramApId = req.body.ap_id || req.query.ap_id;
    var paramWallet = req.user.wallet_address;
    var paramSsid = req.body.ssid || req.query.ssid;
    var paramStartTime = req.body.start_time || req.query.start_time;
    var paramEndTime = req.body.end_time || req.query.end_time;
    var paramContents = req.body.contents || req.query.contents;
    var paramMac = req.body.mac || req.query.mac;

    console.log('요청 파라미터 : ' + paramWallet + ', '
        + paramSsid + ', ' + paramStartTime  + ', ' + paramEndTime
        + ', ' + paramContents + ', ' + paramMac + ', ' + paramApId);

    var startTime = paramStartTime.split(":");
    var endTime = paramStartTime.split(":");
    startTime = parseInt(startTime[0] + startTime[1]);
    endTime = parseInt(endTime[0] + endTime[1]);


    var database = req.app.get('database');

    if (database.db) {

        var options = {
            dev_wallet: paramWallet,
            ssid: paramSsid,
            start_time : paramStartTime,
            end_time : paramEndTime,
            contents : paramContents,
            mac : paramMac,
            ap_id : paramApId
        }

        database.ApModel.edit_ap(options,function (err, results) {
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


                return res.redirect('/mypage');

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

};

var delete_ap = function (req, res) {
    console.log('mypage 모듈 안에 있는 delete_ap 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;

    console.log('요청 파라미터 : ' + paramId);

    var database = req.app.get('database');

    if (database.db) {

        database.ApModel.delete_ap(paramId,function (err, results) {
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
                console.log('ap 삭제 성공');


                return res.redirect('/mypage');

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
};

// 구매자가 ap 사용버튼 눌렀을때
var ap_use = function (req, res) {
    console.log('mypage 모듈 안에 있는 ap_use 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramUid = req.user.id;
    var paramApMac = req.body.mac || req.query.mac || req.params.mac;
    var paramIPaddress = req.body.ipAddress || req.query.ipAddress || req.params.ipAddress;

    console.log('요청 파라미터 : ' + paramId);
    console.log('요청 paramIPaddress : ' + paramIPaddress);
    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;
    var userMac = req.user.mac;

    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.UserModel.ap_use(paramId, paramUid,function (err, results) {
            if (err) {
                console.error('user 업데이트 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>user 업데이트 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                console.dir("asdasd"+results);
                console.log('user 업데이트 성공');

                // useAP : function(accountEncryption, password, userMac, apMac, callback)
                console.log("userMac" , userMac)
                console.log("paramApMac" , paramApMac)
                console.log("paramIPaddress" , paramIPaddress)
                connectBC.useAP(accountEncryption, walletPassword, userMac, paramApMac, function (result) {
                    if (result) {
                        console.log("useAP 완료");

                        iptables.accept(paramIPaddress);

                        //     var timer = time * 60 * 1000;
                        //     setTimeout(function () {
                        //         console.log(time + "후에 IP DROP");
                        //         iptables.drop(ip);
                        //         connectBC.endAP(accountEncryption, walletPassword, userMac, paramApMac, function (result) {
                        //             if (result) {
                        //                 console.log("endAP 완료");
                        //             }else{
                        //                 console.log("endAP 실패");
                        //             }
                        //         });
                        //     }, timer);

                        return res.redirect('/mypage');
                    }
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
};
// 구매자가 ap 중단버튼 눌렀을때
var ap_stop = function (req, res) {
    console.log('mypage 모듈 안에 있는 ap_stop 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramUid = req.user.id;
    var paramApMac = req.body.mac || req.query.mac || req.params.mac;
    var paramIPaddress = req.body.ipAddress || req.query.ipAddress || req.params.ipAddress;

    console.log('요청 파라미터 : ' + paramId);

    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;
    var userMac = req.user.mac;

    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.UserModel.ap_stop(paramId, paramUid,function (err, results) {
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

                connectBC.stopAP(accountEncryption, walletPassword, userMac, paramApMac, function (result) {
                    if (result) {
                        console.log("stopAP 완료");

                        iptables.drop(paramIPaddress);
                    }

                    return res.redirect('/mypage');
                });
            }else {
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
};

module.exports.ap_use = ap_use;
module.exports.ap_stop = ap_stop;
module.exports.ap_on = ap_on;
module.exports.ap_off = ap_off;
module.exports.mypage = mypage;
module.exports.edit_name = edit_name;
module.exports.edit_tel = edit_tel;
module.exports.edit_address = edit_address;
module.exports.edit_mac = edit_mac;
module.exports.edit_ap = edit_ap;
module.exports.write = write;
module.exports.delete_ap = delete_ap;
