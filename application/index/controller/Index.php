<?php

namespace app\index\controller;

use think\Controller;
use think\facade\Session;
use think\Request;

class Index extends Controller
{
    /**
     * 显示首页
     *
     * @return \think\Response
     */
    public function index()
    {

        return $this->fetch();
    }


    /**
     * 退出登录方法
     */
    public function layout(){

       // echo '666';exit;
        Session::set('login',false);
        return $this->redirect('Signin/index');
    }





}
