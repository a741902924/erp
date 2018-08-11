<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

Route::get('think', function () {
    return 'hello,ThinkPHP5!';
});

Route::get('hello/:name', 'index/hello');



//后台路由
Route::group('index',function(){

    Route::get('/index', 'index/Index/index');            //后台首页
    Route::get('/signin','index/Signin/index');           //登录首页
    Route::get('/setting','index/Setting/index');         //设置首页

});


Route::get('verify','Signin/verify');

return [

];
