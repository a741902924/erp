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

        $action = strtolower(request()->controller().'/'.request()->action());
      //  echo $action;
      //  dump(config('login.index'));
      //  dump(!in_array($action,config('login.index'))); exit;

        if(!Session::get('login.id')){

            if(!in_array($action,config('login.index'))){

              return $this->error('请登录','Signin/index');
            }
        }

    }
}