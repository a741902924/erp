<?php

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2018-08-10
 * Time: 13:06
 */
namespace app\index\Services;


use app\index\model\UserModel;
use think\Db;
use think\facade\Session;

class User{

    /**
     * @param $data
     * 登录验证处理方法
     */
    public function login($data){

        //$pwd = password_hash($data['password'],PASSWORD_DEFAULT);
        //$result = Db::name('user')->data(['username'=>$data['uname'],'pwd'=>$pwd])->insert();exit;

        //统计登录次数
        Session::set('login_num',Session::get('login_num')+1);

        if(Session::get('login_num') >= 3){
            if( !captcha_check($data['code'])) {
                // 验证失败
                return ['state'=>0,'msg'=> '验证码错误'];
            }
        }
        //验证器验证
        $validate = new \app\index\validate\User;
        if (!$validate->check($data)) {
            return ['state'=>0,'msg'=>$validate->getError()];
        }

        $result = Db::name('user')->where(array('username'=>$data['uname']))->find();
        if($result){
            if(!password_verify($data['password'],$result['pwd'])){
                return ['state'=>0,'msg'=>'密码错误'];
            }
        }else{
            return ['state'=>0,'msg'=>'用户名不正确'];
        }

        Session::set('login',true);
        //清空session
        Session::set('login_num',false);
        return ['state'=>1,'msg'=>'登录成功！'];
    }

}