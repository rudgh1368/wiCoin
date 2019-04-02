var crypto = require('crypto');

var userSchema = {};

userSchema.createSchema = function(mongoose) {

    // 스키마 정의
    var UserSchema = mongoose.Schema({
        wallet_address: {type: String, required: true, 'default':''},
        wallet_password: {type: String, required: true, 'default': ''},
        accountEncryption: {type: Object, required: true, 'default': ''},
        id: {type: String, required: true, unique: true, 'default':''},
        hashed_password: {type: String, required: true, 'default':''},
        name: {type: String, index: 'hashed', 'default':''},
        tel: {type: Number, required: true, 'default':''},
        address: {type: String, required: true, 'default':''},
        mac: {type: String, 'default': ''},
        posts: [{ // 관련된 게시물의 Smart Contract Address 와 그 때의 역할
            smart_addr: {type: String},
            role: {type: Number} // 1: 시행사, 2: 투자자...
        }],
        salt: {type:String, required:true},
        created_at: {type: Date, index: {unique: false}, 'default': Date.now},
        updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
    });

    // password를 virtual 메소드로 정의 : MongoDB에 저장되지 않는 편리한 속성임. 특정 속성을 지정하고 set, get 메소드를 정의함
    UserSchema.virtual('password')
        .set(function(password) {
            // _password는 가상속성, 저장x
            this._password = password;
            this.salt = this.makeSalt();
            this.hashed_password = this.encryptPassword(password);
            console.log('virtual password 호출됨 : ' + this.hashed_password);
        })
        .get(function() { return this._password });

    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 비밀번호 암호화 메소드
    UserSchema.method('encryptPassword', function(plainText, inSalt) {
        if (inSalt) {
            return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
        } else {
            return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
        }
    });

    // salt 값 만들기 메소드, round : 반올림
    UserSchema.method('makeSalt', function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    });

    // 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴)
    UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
        if (inSalt) {
            console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText, inSalt), hashed_password);
            return this.encryptPassword(plainText, inSalt) === hashed_password;
        } else {
            console.log('authenticate 호출됨 : %s -> %s : %s', plainText, this.encryptPassword(plainText), this.hashed_password);
            return this.encryptPassword(plainText) === this.hashed_password;
        }
    });


    // posts 란 추가, 수정 위한 메소드
    // UserSchema.methods = {
    //     // savePost: function (callback){
    //     //     var self =
    //     // },
    //     savePost: function (callback) {
    //         var self = this;
    //
    //         this.validate(function (err) {
    //             if (err) return callback(err);
    //             self.save(callback);
    //         });
    //     }
    // }

    // 값이 유효한지 확인하는 함수 정의
    var validatePresenceOf = function(value) {
        return value && value.length;
    };

    // 저장 시의 트리거 함수 정의 (password 필드가 유효하지 않으면 에러 발생)
    UserSchema.pre('save', function(next) {
        if (!this.isNew) return next();

        if (!validatePresenceOf(this.password)) {
            next(new Error('유효하지 않은 password 필드입니다.'));
        } else {
            next();
        }
    })

    // 입력된 칼럼의 값이 있는지 확인
    UserSchema.path('wallet_address').validate(function (wallet_address) {
        return wallet_address.length;
    }, '지갑 주소를 입력해주세요.');

    UserSchema.path('id').validate(function (id) {
        return id.length;
    }, '아이디를 입력해주세요.');

    UserSchema.path('hashed_password').validate(function (hashed_password) {
        return hashed_password.length;
    }, '암호를 입력해주세요.');

    UserSchema.path('name').validate(function (name) {
        return name.length;
    }, '이름을 입력해주세요.');

    UserSchema.path('tel').validate(function (tel) {
        return tel.length;
    }, '전화번호를 입력해주세요.');

    UserSchema.path('address').validate(function (address) {
        return address.length;
    }, '주소를 입력해주세요.');


    // 모델 객체에서 사용할 수 있는 메소드 정의
    UserSchema.static('findById', function(id, callback) {
        return this.find({id:id}, callback);
    });

    UserSchema.static('findAll', function(callback) {
        return this.find({}, callback);
    });

    UserSchema.statics = {
        findById: function (id, callback) {
            return this.find({id: id}, callback);
        },
        // ID로 글 찾기
        edit_name: function (user, uname, callback) {
            this.update( {_id:user}, {$set :{name: uname} } )
                .exec(callback);
        },

        edit_tel: function (user, utel, callback) {
            this.update( {_id:user}, {$set :{tel: utel} } )
                .exec(callback);
        },

        edit_address: function (user, uaddress, callback) {
            this.update( {_id:user}, {$set :{address: uaddress} } )
                .exec(callback);
        },

        edit_mac: function (user, umac, callback) {
            this.update( {_id:user}, {$set :{mac: umac} } )
                .exec(callback);
        },

    }

    console.log('UserSchema 정의함.');

    return UserSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = userSchema;
