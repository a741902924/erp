/**
 * Created by Administrator on 15-3-23.
 */
/*
 * replaceUrl 反馈上传的图片到页面上
 * fileElementId 定位需要上传的文件
 * past hidden 中的url
 * */
function upload(replaceUrl,fileElementId,past,my_href,must_none){
    $.ajaxFileUpload
    (
        {
            url:'/index.php?s=/Home/Supply/upload.html', //用于文件上传的服务器端请求地址
            secureuri: false, //一般设置为false
            fileElementId: fileElementId, //文件上传空间的id属性  <input type="file" id="file" name="file" />
            dataType: 'HTML', //返回值类型 一般设置为json
            success: function (data, status)  //服务器成功响应处理函数
            {
                data = $.parseJSON(data);
				if( data ) {
					$path = './Uploads/'+data.savepath+data.savename;
					$("#"+replaceUrl).attr('src',$path);
					$pastPath = $("#"+past).val();
					if($pastPath != ""){
						//删掉之前的照片
						delImage($pastPath);
					}
					$("#"+past).val($path);
					$("#"+my_href).attr('src','/Uploads/'+data.savepath+data.savename);
					$("#"+my_href).css('display','block');
					$("#"+must_none).html('');
				} else {
					$("#"+must_none).html('上传失败，文件太大');
				}
               
            },
            error: function (data, status, e)//服务器响应失败处理函数
            {
                alert(e);
            }
        }
    )
}

function delImage(path){

    $.post("/index.php?s=/Home/Supply/delImage.html",{
        path : path
    }, function(data, textStatus) {});

}