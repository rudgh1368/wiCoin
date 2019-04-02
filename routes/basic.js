var index = function (req, res) {
    console.log("index 접근");
    res.render('index.ejs');
}
var mainmenu = function (req, res) {
    console.log("mainmenu 접근");

    // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
    console.log('req.user 객체의 값');
    console.dir(req.user);

    // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/');
        return;
    }

    // 인증된 경우
    console.log('사용자 인증된 상태임.');
    if (Array.isArray(req.user)) {
        res.render('mainmenu.ejs', {user: req.user[0]._doc});
    } else {
        res.render('mainmenu.ejs', {user: req.user});
    }

}

module.exports.index = index;
module.exports.mainmenu = mainmenu;