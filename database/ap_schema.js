var utils = require('../utills/utils');
var apSchema = {};

apSchema.createSchema = function (mongoose) {

    // 스키마 정의
    var ApSchema = mongoose.Schema({
            dev_wallet: {type: String, required: true},
            writer: {type: mongoose.Schema.ObjectId, ref: 'users', required: true},
            ssid: {type: String, required: true, trim: true, 'default': ''},
            start_time: {type: String},
            end_time: {type: String},
            contents: {type: String},
            mac: {type: String},
            // likes: [{
            //     user: {type: mongoose.Schema.ObjectId, ref: 'users'},
            //     like: {type: Number, 'default' : 0}
            // }],
            likes: {type: Number, 'default': 0},
            userlist: [{
                user: {type: mongoose.Schema.ObjectId, ref: 'users'},
                using_at: {type: Date, 'default': Date.now}
            }],
            ap_condition: {type: String, 'default' : 'on'},
            comments: [{ // 댓글
                contents: {type: String, trim: true, 'default': ''},					// 댓글 내용
                writer: {type: mongoose.Schema.ObjectId, ref: 'users'},
                created_time: {type: Date, 'default': Date.now}
            }],
            created_at: {type: Date, index: {unique: false}, 'default': Date.now},
            updated_at: {type: Date, index: {unique: false}, 'default': Date.now}},
        {
            toObject: {virtuals: true} // virtual들을 object에서 보여주는 mongoose schema의 옵션
        }
    );

    // password를 virtual 메소드로 정의 : MongoDB에 저장되지 않는 편리한 속성임. 특정 속성을 지정하고 set, get 메소드를 정의함
    ApSchema.virtual('createdTime')
        .get(function () {
            return getDate(this.created_at) + " " + getTime(this.created_at)
        });
    ApSchema.virtual('updatedTime')
        .get(function () {
            return getDate(this.updated_at) + " " + getTime(this.updated_at)
        });

    // 시간 예쁘게 보여주기 위한 메소드
    function getDate(dateObj) {
        if (dateObj instanceof Date)
            return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
    }

    function getTime(dateObj) {
        if (dateObj instanceof Date)
            return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes()) + ":" + get2digits(dateObj.getSeconds());
    }

    function get2digits(num) {
        return ("0" + num).slice(-2);
    }

    // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
    // 필수 속성에 대한 required validation
    ApSchema.path('dev_wallet').required(true, '먼저 로그인 하세요.');
    ApSchema.path('writer').required(true, '먼저 로그인 하세요.');
    ApSchema.path('ssid').required(true, '제목을 입력해주세요.');
    //ApSchema.path('location').required(true, '지역을 선택해주세요.');

    // 스키마에 인스턴스 메소드 추가
    ApSchema.methods = {
        saveAp: function (callback) {
            var self = this;

            this.validate(function (err) {
                if (err) return callback(err);
                self.save(callback);
            });
        }
    }

    ApSchema.statics = {
        // ID로 글 찾기
        load: function (id, callback) {
            this.findOne({_id: id})
                .populate('writer', 'name provider id')
                .populate('comments.writer')
                .exec(callback);
        },
        list: function (options, callback) {
            var criteria = options.criteria || {};

            this.find({ap_condition:'on'})
                .populate('writer', 'name provider id')
                .sort({'created_at': -1})
                // .limit(Number(options.perPage))
                // .skip(options.perPage * options.page)
                .exec(callback);
        },

        mylist: function (id, callback) {
            // var criteria = options.criteria || {};

            this.find({writer:id})
                .populate('writer', 'name provider id')
                .populate('userlist.user')
                .exec(callback);
        },

        // ap on 클릭! //exec 문제 가능성,
        ap_on: function(paramId, callback) {
            this.update( {_id:paramId}, {$set :{ap_conditon: 'on'} } )
                .exec(callback);
        },

        // ap off 클릭!
        ap_off: function(paramId, callback) {
            this.update( {_id:paramId}, {$set :{ap_conditon: 'off'} } )
                .exec(callback);
        },

        add_user: function (id, user, callback) {
            this.update({_id: id}, {$push: {userlist: {user: user}}}, function (e) {
                console.log("ap 업데이트 됨");
            });
            return this.find({_id: id}, callback);
        },

        add_comment: function (id, comment ,user, callback) {
            this.update({_id: id}, {$push: {comments: {writer: user, contents: comment}}}, function (e) {
                console.log("댓글 업데이트 됨");
            });
            return this.find({_id: id}, callback);
        },
        delete_comment: function (id, ctime, user, callback) {		// 댓글 삭제
            this.update({_id: id}, {$pull: {comments: {writer: user, contents: ctime}}}, function (e) {
                console.log("댓글 삭제 됨");
            });
            return this.find({_id: id}, callback);
        },
        edit_ap: function (options, callback) {
            this.update( {_id: options.ap_id}, {$set :{dev_wallet:options.dev_wallet, ssid:options.ssid, start_time:options.start_time, end_time:options.end_time, contents:options.contents, mac:options.mac} }, function (e) {
                console.log("ap 수정됨");
            } );
            return this.find({_id: options.ap_id}, callback);
        },
        delete_ap: function(paramId, callback) {
            this.remove( {_id:paramId})
                .exec(callback);
            console.log("ap 삭제됨");
        },
        like_ap: function (id, callback) {
            this.update({_id: id}, {$inc: {likes: +1}}, function (e) {
                console.log("ap 업데이트 됨");
            });
            return this.find({_id: id}, callback);
        }


    }

    console.log('ApSchema 정의함.');

    return ApSchema;
};

// module.exports에 PostSchema 객체 직접 할당
module.exports = apSchema;