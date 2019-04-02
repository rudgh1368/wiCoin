var address;
var password;
var accountEncryption;

$(document).ready(function () {
    $.jsonRPC.setup({
        endPoint: 'http://localhost:3000/api',
        namespace: ''
    });
});

function newAccount() {
    password = $("#addressPassword").val();
    if(password == ""){
        $('#alertMessage').css('display', 'block');
        $('#alertMessage').html('password 입력하시오.');
        $('#alertMessage').addClass('alert-danger');
    }else{
        $('#alertMessage').css('display', 'block');
        $('#alertMessage').html('address 생성 완료.');
        $('#alertMessage').removeClass('alert-danger');
        $('#alertMessage').addClass('alert-success');
        var method = 'createAccount';
        var message = {password : password};

        $.jsonRPC.request(method, {
            id: 1001,
            params: [message],
            success: function(data) {
                console.log('정상 응답을 받았습니다.');
                console.log(data.result.accountEncryption);

                address = data.result.address;
                var privateKey = data.result.privateKey;
                accountEncryption = data.result.accountEncryption;
                $('#address').html('address :<br>' + address);
                $('#pk').html('privateKey :<br>' + privateKey);
                $('#comment').html('<br> privateKey는 서버에 저장되지 않습니다.&nbsp; local에 꼭 저장하셔야 됩니다.<br><br>');

            },
            error: function(data) {
                console.log('에러 응답을 받았습니다.');
                console.dir(data); //

                $('#alert').addClass('alert alert-dander');
                $('#alert').html('에러 응답을 받았습니다.' + data.err.message);
            }
        });
    }
}

function nextStep() {
    console.log($('#alertMessage').html())
    if($('#alertMessage').html() == "address 생성 완료."){
        var temp = $('#nextStep').html();

        var values = JSON.stringify(accountEncryption)

        $('#content').html(temp);
        $('#address').val(address);
        $('#accountEncryption').val(values);
        $('#walletPassword').val(password);

        var a =  $('#accountEncryption').val();
    }else{
        $('#alertMessage').css('display', 'block');
        $('#alertMessage').html('지갑을 생성하시오.');
        $('#alertMessage').addClass('alert-danger');
    }
};