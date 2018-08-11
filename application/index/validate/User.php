<?php

namespace app\index\validate;

use think\Validate;

class User extends Validate
{
    /**
     * 定义验证规则
     * 格式：'字段名'	=>	['规则1','规则2'...]
     *
     * @var array
     */	
	protected $rule = [
        'uname'     => 'require|max:20',
        'password'  => 'require|max:16',
    ];
    
    /**
     * 定义错误信息
     * 格式：'字段名.规则名'	=>	'错误信息'
     *
     * @var array
     */	
    protected $message = [
        'uname.require'     => '请输入用户名',
        'uname.max'         => '用户名不能超过20个字符',
        'password.require'  => '请输入密码',
        'password.max'      => '密码不能超过16位'
    ];
}
