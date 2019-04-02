// 게시판을 위한 라우팅 함수 정의

// showpost.ejs 에서 사용함
var Entities = require('html-entities').AllHtmlEntities;
var connectBC = require('../connection/connect');

var addap = function (req, res) {
    console.log('ap 모듈 안에 있는 addap 호출됨.');

    if (!req.user) {
        console.log('ap: 사용자 인증 안된 상태임.');
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("먼저 로그인해주세요.");' +
            'location.href="/login"</script>');
        res.end();
    } else {
        var context = {};
        console.log('ap: 사용자 인증된 상태임.');
        console.log('회원정보 로드.');
        console.dir(req.user);
        context.login_success = true;
        context.user = req.user;

        req.app.render('addap', context, function (err, html) {

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
    console.log('ap 모듈 안에 있는 addap/write 호출됨.');

    var accountEncryption = req.user.accountEncryption;
    var walletPassword = req.user.wallet_password;

    var paramWallet = req.user.wallet_address;
    var paramWriter = req.user.id;
    var paramSsid = req.body.ssid || req.query.ssid;
    var paramStartTime = req.body.start_time || req.query.start_time;
    var paramEndTime = req.body.end_time || req.query.end_time;
    var paramContents = req.body.contents || req.query.contents;
    var paramMac = req.body.mac || req.query.mac;

    console.log('요청 파라미터 : ' + paramWallet + ', ' + paramWriter + ', '
        + paramSsid + ', ' + paramStartTime  + ', ' + paramEndTime
        + ', ' + paramContents + ', ' + paramMac);

    var startTime = paramStartTime.split(":");
    var endTime = paramStartTime.split(":");
    startTime = parseInt(startTime[0] + startTime[1]);
    endTime = parseInt(endTime[0] + endTime[1]);

    connectBC.registerAPMac(accountEncryption, walletPassword, paramMac, startTime, endTime, function (result) {
        if(result == true){
           console.log("AP 블록체인 등록 성공")

            var database = req.app.get('database');

            // 데이터베이스 객체가 초기화 된 경우
            if (database.db) {
                // 1. 아이디를 이용해 사용자 검색
                database.UserModel.findById(paramWriter, function (err, results) {
                    // findByIdAndUpdate({ query: { name: paramWriter },
                    // update: { $set: {posts: {title: paramTitle, role: 1}}}, new: true}, function (err, results) {
                    if (err) {
                        console.error('게시판 글 추가 중 에러 발생 : ' + err.stack);

                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("게시판 글 추가 중 에러 발생");' +
                            'location.href="/addap"</script>');
                        res.end();

                        return;
                    }

                    if (results == undefined || results.length < 1) {
                        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                        res.write('<script>alert("등록된 회원이 아닙니다.");' +
                            'location.href="/addap"</script>');
                        res.end();

                        return;
                    }

                    var userObjectId = results[0]._doc._id;

                    console.log('사용자 ObjectId : ' + paramWriter + ' -> ' + userObjectId);

                    // save()로 저장
                    // PostModel 인스턴스 생성
                    var ap = new database.ApModel({
                        dev_wallet: paramWallet,
                        writer: userObjectId,
                        ssid: paramSsid,
                        start_time : paramStartTime,
                        end_time : paramEndTime,
                        contents : paramContents,
                        mac : paramMac
                    });

                    ap.saveAp(function (err, result) {
                        if (err) {
                            if (err) {
                                console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                                res.write('<script>alert("응답 웹문서 생성 중 에러 발생");' +
                                    'location.href="/addap"</script>');
                                res.end();

                                return;
                            }
                        }

                        console.log("AP 데이터 추가함.");
                        console.log('ap 작성', 'AP 게시글을 생성했습니다. : ' + ap._id);

                        //return res.redirect('/listap');
                        return res.redirect('/mypage');
                    });
                });
            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("데이터베이스 연결 실패");' +
                    'location.href="/addap"</script>');
                res.end();
            }
        }else{
            console.log("AP 블록체인 등록 실패");
            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
            res.write('<script>alert(" 연결 실패");' +
                'location.href="/addap"</script>');
            res.end();
        }
    });
};

var listap = function (req, res) {
    console.log('ap 모듈 안에 있는 listap 호출됨.');

    var paramPage = req.body.page || req.query.page;
    var paramPerPage = req.body.perPage || req.query.perPage;

    console.log('요청 파라미터 : ' + paramPage + ', ' + paramPerPage);

    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        var options = {
            page: paramPage,
            perPage: paramPerPage
        }

        database.ApModel.list(options, function (err, results) {
            if (err) {
                console.error('게시판 글 목록 조회 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("게시판 글 목록 조회 중 에러 발생");' +
                    'location.href="/"</script>');
                res.end();

                return;
            }

            if (results) {
                console.dir(results);

                // 전체 문서 객체 수 확인
                database.ApModel.count().exec(function (err, count) {
                    // 뷰 템플레이트를 이용하여 렌더링한 후 전송=
                    var context = {
                        title: '글 목록',
                        aps: results,
                        page:  1, //parseInt(paramPage),
                        pageCount: 1, //Math.ceil(count / paramPerPage),
                        perPage: 10, //paramPerPage,
                        totalRecords: count,
                        size: paramPerPage
                    };
                    // var cp = context.posts;
                    // console.log("cp: " + cp);
                    // for (var i = 0; i < cp.size; i++){
                    //     var time = cp[i]._doc.created_at;
                    //     cp[i]._doc.created_at = time.substring(time.length - 20);
                    //     console.log(time);
                    // }
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

                    req.app.render('listap', context, function (err, html) {

                        if (err) {
                            console.error('응답 웹문서 생성 중 에러 발생 : ' + err.stack);

                            res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                            res.write('<script>alert("응답 웹문서 생성 중 에러 발생" + err.stack);' +
                                'location.href="/"</script>');
                            res.end();
                            return;
                        }

                        res.end(html);
                    });

                });

            } else {
                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<script>alert("글 목록 조회 실패" + err.stack);' +
                    'location.href="/"</script>');
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
        res.write('<script>alert("데이터베이스 연결 실패" + err.stack);' +
            'location.href="/"</script>');
        res.end();
    }

};


var showap = function (req, res) {
    console.log('ap 모듈 안에 있는 showap 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;

    console.log('요청 파라미터 : ' + paramId);


    var database = req.app.get('database');

    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {
        // 1. 글 리스트
        database.ApModel.load(paramId, function (err, results) {
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

                req.app.render('showap', context, function (err, html) {
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

};

var add_user = function (req, res) {
    console.log('ap 모듈 안에 있는 add_user 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramUser);

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

var add_comment = function (req, res) {
    console.log('ap 모듈 안에 있는 add_comment 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramComment = req.body.comment || req.query.comment || req.params.comment;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : ' + paramId + ', ' + paramComment + ', ' + paramUser);

    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.ApModel.add_comment(paramId, paramComment,paramUser,function (err, results) {
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


                return res.redirect('/showap/' + paramId);

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

var delete_comment = function (req, res) {
    console.log('ap 모듈 안에 있는 delete_comment 호출됨.');

    // URL 파라미터로 전달됨
    var paramId = req.body.id || req.query.id || req.params.id;
    var paramCreateTime = req.body.ctime || req.query.ctime || req.params.ctime;
    var paramUser = req.user._id;
    console.log('요청 파라미터 : ' + paramId + " ," + paramCreateTime);

    var database = req.app.get('database');

    if (database.db) {
        // 1. 글 리스트
        database.ApModel.delete_comment(paramId ,paramCreateTime, paramUser,function (err, results) {
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


                return res.redirect('/showap/' + paramId);

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

var like_ap = function (req, res) {
    console.log('ap 모듈 안에 있는 like_ap 호출됨.');

    // URL 파라미터로 전달됨
    var paramAp = req.body.id || req.query.id || req.params.id;
    var paramUser = req.user._id;

    console.log('요청 파라미터 : '+ paramAp + ' ,' + paramUser);

    var database = req.app.get('database');

    if (database.db) {


        database.ApModel.like_ap(paramAp,function (err, results) {
            if (err) {
                console.error('ap 업데이트 중 에러 발생 : ' + err.stack);

                res.writeHead('200', {'Content-Type': 'text/html;charset=utf8'});
                res.write('<h2>user 업데이트 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
                res.end();

                return;
            }

            if (results) {
                console.dir(results);
                console.log('ap 업데이트 성공');


                return res.redirect('/listap');

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



module.exports.addap = addap;
module.exports.listap = listap;
module.exports.write = write;
module.exports.showap = showap;
module.exports.add_user = add_user;
module.exports.add_comment = add_comment;
module.exports.delete_comment = delete_comment;
module.exports.like_ap = like_ap;
