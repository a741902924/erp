<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018-08-13
 * Time: 9:09
 */

return [

    //排除不需要登录验证的方法
    'index'  =>[
        'index/layout',
        'signin/login',
        'signin/index',
        'signin/verify',
    ]


];