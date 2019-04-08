const express = require('express')
    , http = require('http')
    , app = express()
    , port = 3000 || process.env.PORT
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , path = require('path')

    // 에러 핸들러 모듈 사용
    , expressErrorHandler = require('express-error-handler')

    // Session 미들웨어 불러오기
    , expressSession = require('express-session')

    //===== Passport 사용 =====//
    , passport = require('passport')
    , flash = require('connect-flash')

    // 모듈로 분리한 설정 파일 불러오기
    , config = require('./config/config')

    // 모듈로 분리한 데이터베이스 파일 불러오기
    , database = require('./database/database')

    // 모듈로 분리한 라우팅 파일 불러오기
    , route_loader = require('./routes/route_loader')

    // JSON-RPC 처리
    , handler_loader = require('./handlers/handler_loader')
    , jayson = require('jayson');

    // // 파일 업로드용 미들웨어
    // var multer = require('multer');
    var fs = require('fs');
    //
    //클라이언트에서 ajax로 요청 시 CORS(다중 서버 접속) 지원
    var cors = require('cors');


//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
console.log('뷰 엔진이 ejs로 설정되었습니다.');

console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// JSON-RPC 핸들러 정보를 읽어 들여 핸들러 경로 설정
var jsonrpc_api_path = config.jsonrpc_api_path || '/api';
handler_loader.init(jayson, app, jsonrpc_api_path);
console.log("JSON-RPC를 [" + jsonrpc_api_path + " ] 패스에서 사용하도록 설정함.");



//라우팅 정보를 읽어 들여 라우팅 설정
var router = express.Router();
route_loader.init(app, router);

// 패스포트 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// 패스포트 라우팅 설정
var userPassport = require('./routes/user_passport');
userPassport(router, passport);

// 홈 화면 - index.ejs 템플릿을 이용해 홈 화면이 보이도록 함
// router.route('/').get(function(req, res) {
//     console.log('/ 패스 요청됨.');
//     res.render('index.ejs');
// });

//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
    console.log('uncaughtException 발생함 : ' + err);
    console.log('서버 프로세스 종료하지 않고 유지함.');

    console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
    console.log("Express 서버 객체가 종료됩니다.");
    if (database.db) {
        database.db.close();
    }
});

// 시작된 서버 객체를 리턴받도록 합니다.
var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);
    console.log("Express Listening at http://localhost:" + port);

});
