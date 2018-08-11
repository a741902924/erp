<?php

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018-08-10
 * Time: 12:28
 */
namespace app\index\behavior;

use think\Controller;
use think\facade\Session;

class LoginCheck extends Controller {


    public function run($params){
        // 行为逻辑

        $action = request()->controller();
        //echo Session::get('login');
        //echo $action;exit;
    }
}