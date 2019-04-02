module.exports={
    server_port: 3000,
    db_url: 'mongodb://localhost:27017/local',
    jsonrpc_api_path : '/api',
    db_schemas: [
        {file:'./user_schema', collection:'users', schemaName:'UserSchema', modelName:'UserModel'},
        {file:'./ap_schema', collection:'aps', schemaName:'ApSchema', modelName:'ApModel'}
    ],
    route_info: [
        //===== basic =====//
        {file:'./basic', path:'/', method:'index', type:'get'},
        {file:'./basic', path:'/mainmenu', method:'mainmenu', type:'get'},

        //===== User =====//
        {file:'./user', path:'/process/login', method:'login', type:'post'},		    // user.login
        // ,{file:'./user', path:'/process/adduser', method:'adduser', type:'post'}				// user.adduser
        // ,{file:'./user', path:'/process/listuser', method:'listuser', type:'post'}		    	// user.listuser
        
        //===== ap =====//
        {file:'./ap', path:'/addap', method:'addap', type:'get'},
        {file:'./ap', path:'/addap/write', method:'write', type:'post'},
        {file:'./ap', path:'/showap/:id', method:'showap', type:'get'},
        {file:'./ap', path:'/listap', method:'listap', type:'post'},
        {file:'./ap', path:'/listap', method:'listap', type:'get'},
        {file:'./ap', path:'/add_user/:id', method:'add_user', type:'get'},
        {file:'./ap', path:'/add_comment/:id', method:'add_comment', type:'get'},
        {file:'./ap', path:'/add_comment', method:'add_comment', type:'post'},
        {file:'./ap', path:'/delete_comment', method:'delete_comment', type:'get'},
        {file:'./ap', path:'/like_ap/:id', method:'like_ap', type:'get'},
        
        //===== mypage =====//
        {file:'./mypage', path:'/mypage', method:'mypage', type:'get'},
        {file:'./mypage', path:'/mypage', method:'mypage', type:'post'},
        {file:'./mypage', path:'/ap_on/:id', method:'ap_on', type:'get'},
        {file:'./mypage', path:'/ap_off/:id', method:'ap_off', type:'get'},
        {file:'./mypage', path:'/edit_name', method:'edit_name', type:'post'},
        {file:'./mypage', path:'/edit_tel', method:'edit_tel', type:'post'},
        {file:'./mypage', path:'/edit_address', method:'edit_address', type:'post'},
        {file:'./mypage', path:'/edit_mac', method:'edit_mac', type:'post'},
        {file:'./mypage', path:'/edit_ap', method:'edit_ap', type:'get'},
        {file:'./mypage', path:'/edit_ap/write', method:'write', type:'post'},
        {file:'./mypage', path:'/delete_ap/:id', method:'delete_ap', type:'get'},

        {file:'./useToken', path:'/useToken/:id', method:'useToken', type:'get'},
        {file:'./useToken', path:'/useToken/use', method:'use', type:'post'},
        {file:'./buyToken', path:'/buyToken', method:'buyToken', type:'get'},
        {file:'./buyToken', path:'/buyToken/buy', method:'buy', type:'post'}


    ]
}