<?php

namespace app\index\controller;

use app\index\Services\User;
use think\App;
use think\captcha\Captcha;
use think\Controller;
use think\facade\Log;
use think\Request;

class Signin extends Controller{



    public function __construct(App $app = null)
    {
        parent::__construct($app);

    }


    /**
     * 登录方法列表
     *
     * @return \think\Response
     *
     */
    public function index(){

        return $this->fetch();
    }



    /**
     * @param Request $request
     * 登录方法
     */
    public function login(Request $request){

            //接收前台数据
            $data = $request->param();
            $res = new User();
            //调用登录处理方法
            $result = $res->login($data);
            if($result['state']){
                return json(['state'=>true,'msg'=>$result['msg']]);
            }else{
                return json(['state'=>false,'msg'=>$result['msg']]);
            }
    }

    /**
     * @return \think\Response
     * 生成验证码方法
     */
    public function verify()
    {
        $captcha = new Captcha(config('captcha'));
        return $captcha->entry();
    }


}
