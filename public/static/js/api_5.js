/*window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
   console.log("错误信息：" , errorMessage);
   console.log("出错文件：" , scriptURI);
   console.log("出错行号：" , lineNumber);
   console.log("出错列号：" , columnNumber);
   console.log("错误详情：" , errorObj);
   return true;
}*/
String.prototype.replaceAll = function(s1,s2) { 
    return this.replace(new RegExp(s1,"gm"),s2); 
}
/*常量*/
var TIMEOUTLIMIT = 8000;
var TIMEOUTTIPS = "连接超时";
var ERROR_SYS = "系统错误";
var api = {};
api.error_img = '/Public/Home/images/photo.gif';
api.ret = [];
api.extend = function(b,a) {
	for (var c in a) {
		b[c] = a[c]
	}
	return b
};
/**表单转JSON 字符串**/
api.formToJson = function (data) {
	data=data.replace(/"/g,'\\"');
	data=data.replace(/&/g,"\",\"");
	data=data.replace(/=/g,"\":\"");
	data=data.replaceAll("\r\n", "\\r\\n");
	data="{\""+data+"\"}";
	return data;
};
/**消息模块
**{
	title:'',//提示内容 默认是执行中的动画
	duration:0,//定时自动关闭；为0时不自动关闭；大于等于200时候为定时关闭
	url:'',
}
**/
api.showPress = function(_con){
	var config = {title:'<i></i><i></i><i></i><i></i>',duration:0,url:''};
	_con && ( config = api.extend(config, _con) );
    if(!document.getElementById('side-mask')){
        var d = document.createElement("div");
        d.id = 'side-mask';
        d.className = 'f-hide';
        document.body.appendChild(d);
    }
	var sidemask = document.getElementById('side-mask');
	sidemask.innerHTML = '<section>'+config.title+'</section>';
	sidemask.className = '';
	199<config.duration && setTimeout(function(){ '' !== config.url ? window.location.href = config.url : api.hidePress();},config.duration);
};
api.hidePress = function(){
    if( document.getElementById('side-mask') ){
		document.getElementById('side-mask').className = 'f-hide';
    }
}

/*
*单个按钮对话框
*/
api.alert = function(setting,_back){
	var config = {title: '提示',msg: '消息',buttons:['确定']};
	config = api.extend(config, setting);
	if(!document.getElementById('api-alert')){
        var d = document.createElement("div");
        d.id = 'api-alert';
        document.body.appendChild(d);
    }
	var obj = document.getElementById('api-alert');
	obj.style.display = "block";
	obj.innerHTML = '<section class="api-open fillet"><h5>'+config.title+'</h5><p>'+config.msg+'</p><div><button>'+config.buttons[0]+'</button></div></section>';
	obj.children[0].children[2].children[0].focus();
	var hide = function(){
		obj.children[0].className = obj.children[0].className.replaceAll('api-open','api-close');
		obj.children[0].addEventListener("webkitAnimationEnd", function(){
			obj.style.display = "none";
		});
		obj.children[0].addEventListener("animationend", function(){
			obj.style.display = "none";
		});	
	}
	obj.children[0].children[2].children[0].onclick = function(){
		hide();
		_back && _back({buttonIndex:1});
	};
}
/*
*两个按钮对话框
* {title: 'testtitle',msg: 'testmsg',buttons:['确定','取消']}
* return buttonIndex:1(确认)/2(取消)
*/
api.confirm = function(setting,_back){
	var config = {title: '确认',msg: '是否操作？',buttons:['确定','取消']};
	config = api.extend(config, setting);
	if(!document.getElementById('api-confirm')){
        var d = document.createElement("div");
        d.id = 'api-confirm';
        document.body.appendChild(d);
    }
	var obj = document.getElementById('api-confirm');
	obj.style.display = "block";
	obj.innerHTML = '<section class="api-open fillet"><h5>'+config.title+'</h5><p>'+config.msg+'</p><div><button>'+config.buttons[0]+'</button><button>'+config.buttons[1]+'</button></div></section>';
	obj.children[0].children[2].children[0].focus();
	var hide = function(){
		obj.children[0].className = obj.children[0].className.replaceAll('api-open','api-close');
		obj.children[0].addEventListener("webkitAnimationEnd", function(){
			obj.style.display = "none";
		});
		obj.children[0].addEventListener("animationend", function(){
			obj.style.display = "none";
		});	
	}
	obj.children[0].children[2].children[0].onclick = function(){
		hide();
		_back({buttonIndex:1,btn:1});
	};
	obj.children[0].children[2].children[1].onclick = function(){
		hide();
		_back({buttonIndex:2,btn:2});
	};
}
/*
*数据验证
*/
/**简易手机号码**/
api.regMobile = function(mobile){
	return (/^(1)\d{10}$/i.test(mobile))? true:false;
}
/**中文验证***/
api.regChinese = function(uname){
	return (/^[\u4E00-\u9FA5]+$/.test(uname))? true:false;
}
/**邮编***/
api.regZipCode = function(num){
	return (/^\d{6}$/i.test(num))? true:false;
}
/***是否包含特殊字符***/
api.illegalChar = function(str){
   return (/[`~!@#$%^&*()+<>?:"{},.\/;'[\]]/im.test(str))? true:false;
}
/***数字***/
api.regNnm = function(num){
   return (/^[0-9]*[1-9][0-9]*$/i.test(num))? true:false;
}
/***正整数****/
api.regParseInt = function(num){
	return (/^(0|[1-9]\d*)$/i.test(num))? true:false;
}
/***非负数****/
api.regFloat = function(num){
	return (/^\d+(\.{0,1}\d+){0,1}$/i.test(num))? true:false;
}

/***
 *key 主键cloname key1 关系字段cloname textkey idkey
 * */
function recursion(json,len,startClass,key,key1,val,rval,textkey,idkey){
    var newVal = [];
    if(startClass == len){
        return;
    }
    var block = "";
    for(var i = 0; i < startClass ; i++){
        block += "　";
    }
    var padding = startClass;
    var target = json[startClass];
	startClass ++;
    for(var i = 0; i < val.length; i++){
        for( x in target){
            if(target[x][key1] == val[i]){
                rows.push({text:block+target[x][textkey],id:target[x][idkey]})
                newVal.push(target[x][key]);
				recursion(json,len,startClass,key,key1,newVal,rval,textkey,idkey);
				newVal = [];
            }
        }
    }

}
/**unix日期转普通日期**/
api.unixToDate = function(unixTime, isFull, timeZone) {
	unixTime = Number(unixTime);
	if( isNaN(unixTime) || 0 === unixTime ) {
		return '无';
	}
	if (typeof (timeZone) == 'number') {
		unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
	}
	var time = new Date(unixTime * 1000);
	var ymdhis = "";
	ymdhis = isFull ? time.Format('YYYY-MM-DD HH:mm:ss') : time.Format('YYYY-MM-DD');
	return ymdhis;

}

Date.prototype.Format = function(formatStr) {   
    var str = formatStr;   
    var Week = ['日','一','二','三','四','五','六'];  
    str=str.replace(/yyyy|YYYY/,this.getFullYear());   
    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));   
  
    str=str.replace(/MM/,this.getMonth()>8?(this.getMonth()+1):'0' + (this.getMonth()+1));
    str=str.replace(/M/g,this.getMonth()+1);
  
    str=str.replace(/w|W/g,Week[this.getDay()]);
	
    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());   
    str=str.replace(/d|D/g,this.getDate());   
  
    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());   
    str=str.replace(/h|H/g,this.getHours());   
    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());   
    str=str.replace(/m/g,this.getMinutes());   
  
    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());   
    str=str.replace(/s|S/g,this.getSeconds());   
    return str;   
}   
/**
 * 秒转时间
 *
 * @access  public
 * @param (int)$second 秒
 * @return  00:00
 */
api.secondToTime = function($second){
	$hh = 0;
	$ii = Math.floor($second/60);
	$ss = $second%60;
	$hh = 0;
	$dd = 0;
	if( 60 < $ii ) {
		$hh = Math.floor($ii/60);
		$ii = $ii%60;
	}
	if( 24 < $hh ) {
		$dd = Math.floor($hh/24);	
		$hh = $hh%24;
	}
	return (0<$dd ? $dd+'天' : '')+(0<$hh ? $hh+'时' : '')+(0<$ii ? $ii+'分' : '')+$ss+'秒';
}
/*
*ajax拉取数据
_url 地址
_json 传递数据
_back 正确回调
_err 错误回调
_a 是否显示加载项目
*/
api.timer = null;
api.ajax = function(_url,_json,_back,_err,_a){
	api.showPress();
	$.ajax({
		beforeSend:function(){
		},
		url: _url,// 跳转到 action
		type: 'post',
		cache: false,
		async: true, /*true异步执行，false*/
		data: _json,
		dataType: 'json',
		timeout:TIMEOUTLIMIT,
		success:function(ret) {
			if( !ret ) {
				api.showPress({title:'返回格式错误',duration:1500});
				return false;
			}
			var url = ret.url ? ret.url : '';
			if( ret.state || 1 == ret.code ){
				_back && _back(ret);
				( ret.msg && '' !== ret.msg ) ? api.showPress({title:ret.msg,duration:2000,url:url}) : api.hidePress();
			} else {
				!ret.alert ? api.showPress({title:'提示：'+ret.msg,duration:1500}) : (api.hidePress(),api.alert({title:'提示',msg:ret.msg}));
				_err && _err(ret);
			}
		},
		error : function(xmlHttpRequest, error) {
			if( error=='timeout'){ //超时
				api.showPress({title:'网络太差',duration:1500});
			} else {
				api.showPress({title:'系统错误:'+error,duration:1500});
			}

		}
	});
}

api.app = function(_url,_json,_back,_err){
	$.ajax({
		beforeSend:function(){
		},
		url: _url,// 跳转到 action
		type: 'post',
		cache:false,
		async: true,
		contentType:false,
		processData:false,
		data: _json,
		dataType: 'json',
		timeout:TIMEOUTLIMIT,
		success:function(ret) {
			if( !ret ) {
				api.showPress({title:'返回格式错误',duration:1500});
				return false;
			}
			var url = ret.url ? ret.url : '';
			if( 200 == ret.code || true === ret.state ){
				( ret.msg && '' !== ret.msg ) ? api.showPress({title:ret.msg,duration:2000,url:url}) : api.hidePress();
				_back && _back(ret);
			} else {
				!ret.alert ? api.showPress({title:'提示：'+ret.msg,duration:1500}) : (api.hidePress(),api.alert({title:'提示',msg:ret.msg}));
			}
		},
		error : function(xmlHttpRequest, error) {
			if( error=='timeout'){ //超时
				api.showPress({title:'网络太差',duration:1500});
			} else {
				api.showPress({title:'系统错误:'+error,duration:1500});
			}

		}
	});
}

/**
日志视图 流转日志模版 Comm/log.htm
* @access public
* @return false
*/
api.logView = function(alog){
	$('#log tbody').html('');
	var $agoTime = 0;
	for(var i in alog ) {
		$user_time = 0 < $agoTime ? api.secondToTime(alog[i].ctime - $agoTime) : '';
		$agoTime = alog[i].ctime;
		$('#log tbody').append('<tr><td>'+api.unixToDate(alog[i].ctime,true)+'</td><td>'+$user_time+'</td><td>'+alog[i].job+':'+alog[i].real_name+'<br/>'+alog[i].mobile+'</td><td>'+alog[i].content+'</td></tr>');
	}
};
/**
* 判断json是否为空对象
* */
api.jsonEmpty = function (json){
    for( x in json){
      return true
    }
    return false;
};

api.page = {
	init:function(_obj,_c){
		var _this = api.extend({page:1,size:10,total:0},_c);
		_this.layout = ['first','prev','links','next','last','sep','refresh'];
		_this.numlen = 10;
		$(_obj).html('<table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td><a href="javascript:void(0)" class="l-btn l-btn-small l-btn-plain l-btn-disabled l-btn-plain-disabled" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text l-btn-empty">&nbsp;</span><span class="l-btn-icon pagination-first">&nbsp;</span></span></a></td><td><a href="javascript:void(0)" class="l-btn l-btn-small l-btn-plain l-btn-disabled l-btn-plain-disabled" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text l-btn-empty">&nbsp;</span><span class="l-btn-icon pagination-prev">&nbsp;</span></span></a></td><td class="pagination-links"><a class="pagination-link l-btn l-btn-small l-btn-plain l-btn-selected l-btn-plain-selected" href="javascript:void(0)" group="" id=""><span class="l-btn-left"><span class="l-btn-text">1</span></span></a></td><td><a href="javascript:void(0)" class="l-btn l-btn-small l-btn-plain l-btn-disabled l-btn-plain-disabled" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text l-btn-empty">&nbsp;</span><span class="l-btn-icon pagination-next">&nbsp;</span></span></a></td><td><a href="javascript:void(0)" class="l-btn l-btn-small l-btn-plain l-btn-disabled l-btn-plain-disabled" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text l-btn-empty">&nbsp;</span><span class="l-btn-icon pagination-last">&nbsp;</span></span></a></td><td><div class="pagination-btn-separator"></div></td><td><a href="javascript:void(0)" class="l-btn l-btn-small l-btn-plain" group="" id=""><span class="l-btn-left l-btn-icon-left"><span class="l-btn-text l-btn-empty">&nbsp;</span><span class="l-btn-icon pagination-load">&nbsp;</span></span></a></td></tr></tbody></table><div class="pagination-info">显示0到0,共0记录</div>');
		_this.setTotal = function(total){
			_this.total = total;
			_this.t_page = Math.ceil(_this.total / _this.size)||1;
			_this.set();
		}
		$(_obj).on('click','table a.l-btn-plain',function(){
			if( $(this).hasClass('l-btn-disabled') ) {
				return false;	
			}
			var td = $(this).parent(),
				idx = $('tr td',$(_obj)).index(td);
			switch(_this.layout[idx]) {
				case 'first':
					_this.page = 1;
					_this.onSelectPage && _this.onSelectPage(_this.page,_this.size);
					break;
				case 'prev':
					_this.page -= 1;
					!_this.page && (_this.page = 1);
					_this.onSelectPage && _this.onSelectPage(_this.page,_this.size);
					break;
				case 'links':
					_this.page = parseInt($('.l-btn-text',this).html());
					_this.onSelectPage && _this.onSelectPage(_this.page,_this.size);
					break;
				case 'next':
					_this.page += 1;
					_this.page > _this.t_page && (_this.page = _this.t_page);
					_this.onSelectPage && _this.onSelectPage(_this.page,_this.size);
					break;
				case 'last':
					_this.page = _this.t_page;
					_this.onSelectPage && _this.onSelectPage(_this.page,_this.size);
					break;
				case 'refresh':
					_this.onRefreshPage && _this.onRefreshPage(_this.page,_this.size);
					break;
				default:
					break;
			}
		});
		
		_this.set = function(){
			!_this.t_page && (_this.t_page = 1);
			_this.page > _this.t_page && (_this.page = _this.t_page);
			1 == Number(_this.page) ? $('.pagination-first,.pagination-prev' ,$(_obj)).parents('a').addClass('l-btn-disabled') : $('.pagination-first,.pagination-prev' ,$(_obj)).parents('a').removeClass('l-btn-disabled');
			_this.t_page == _this.page ? $('.pagination-last,.pagination-next' ,$(_obj)).parents('a').addClass('l-btn-disabled') : $('.pagination-last,.pagination-next' ,$(_obj)).parents('a').removeClass('l-btn-disabled');
			var links = '';
			for(var k in _this.layout) {
				if( 'links' == _this.layout[k] ) {
					var start = _this.page - Math.floor(_this.numlen/2);
					start < 1 && ( start = 1);
					if( _this.page < start ) {
						start = 1;	
					}
					var end = start+_this.numlen-1
					if( end > _this.t_page ) {
						end = _this.t_page;
					}
					for(var i=start; i<=end; i++){
						links += '<a class="pagination-link l-btn l-btn-small l-btn-plain '+(i==_this.page?' l-btn-plain-selected':'')+' " href="javascript:void(0)" group="" id=""><span class="l-btn-left"><span class="l-btn-text">'+i+'</span></span></a>';
					}
					$('table td:eq('+k+')',$(_obj)).html(links);
				}
			}
			$('.pagination-info',$(_obj)).html('显示'+((_this.page-1)*_this.size+1)+'到'+(_this.size*_this.page)+',共'+_this.total+'记录');
		}
		
		_this.setTotal(0);
		return _this;
	}
}
/*
* 图片上传
* 参数说名
* _input 文件上传对象
* _box 图片
* */
api.upload = {
	html:'<li class="diyUploadHover" data-name=""><div class="viewThumb"><img src=""/></div><div class="diyCancel"></div><div class="diySuccess"></div><div class="diyFileName"></div><div class="diyBar"><div class="diyProgress" style="width:0%;"></div><div class="diyProgressText">0%</div></div></li>',
	init:function(_input,_box){
		var _this = {
			input:_input,
			box:_box,
			files:[],
			selectTimes:0, /*累计选择图片个数*/
			percentage:0, /*进度百分比*/
			speed:1024*30, /*上传速度 B/秒*/
			length:0,
			processStep:0,
			timer:null
		};
		_this.input.on('change',function(){
			if( 0 === this.files.length ) {
				return false;
			}
			if (!this.value.match(/.jpg|.gif|.png|.jpeg/i)) {
				api.showPress({title:'您选择的图片格式不正确，请重新选择！',duration:1000});
				return false;
			}
			var has;
			for(var i=0; i<this.files.length;i++){
				has = false;
				for(var j in _this.files) {
					if( this.files[i].name === _this.files[j].name && this.files[i].size === _this.files[j].size ) {
						has = true;
						break;
					}
				}
				if( !has ) {
					_this.selectTimes += 1;
					var viewName = 'viewImgBox_'+_this.selectTimes;
					var html = api.upload.html;
					$('.parentFileBox .fileBoxUl',_this.box).append(html);
					$('.parentFileBox .fileBoxUl li:last',_this.box).attr('data-name',viewName);
					_this.files.push(this.files[i]);
					_this.length += 1;
					_this.readImg(this.files[i],$('.parentFileBox .fileBoxUl li[data-name='+viewName+']',_this.box));

				}

			}
		});
		_this.box.on('click','li .diyCancel',function(){
			var li = $(this).parents('li:first');
			var index = $('.parentFileBox .fileBoxUl li').index(li);
			_this.files.splice(index, 1);
			$(this).parent().remove();
		});
		/*清空选择的图片*/
		_this.cancelAll = function(){
			_this.files = [];
			$('.parentFileBox .fileBoxUl',_this.box).html('');
		};
		/*开始上传*/
		_this.start = function(){
			$('.diyBar',_this.box).css({'display':'block'});
			_this.percentage = 0;
			_this.processStep = 0;
			_this.process(Number(_this.files[0].size));
		};
		_this.process = function(size){
			null !== _this.timer && clearTimeout(_this.timer);
			var step = ((_this.speed/2)/size)*100;
			_this.percentage += step;
			size -= _this.speed;
			if( 100 < _this.percentage ) {
				if( _this.processStep == _this.length -1 ) {
					$('.diyUploadHover:eq('+_this.processStep+') .diyBar .diyProgress',_this.box).css({'width':'99%'});
					$('.diyUploadHover:eq('+_this.processStep+') .diyBar .diyProgressText',_this.box).html('99%');
				} else {
					$('.diyUploadHover:eq('+_this.processStep+') .diyBar .diyProgress',_this.box).css({'width':'100%'});
					$('.diyUploadHover:eq('+_this.processStep+') .diyBar .diyProgressText',_this.box).html('100%');

				}
				_this.processStep += 1;
				if( _this.processStep == _this.length ) {
					return;
				}
				size = Number(_this.files[_this.processStep].size);
			}
			_this.timer = setTimeout(function(){
				$('.diyUploadHover:eq('+_this.processStep+') .diyBar .diyProgress',_this.box).css({'width':_this.percentage.toFixed(2)+'%'});
				$('.diyUploadHover:eq('+_this.processStep+') .diyBar .diyProgressText',_this.box).html(_this.percentage.toFixed(2)+'%');
				_this.process(size);
			},500);
		};
		_this.collBack = function(){
			console.log('callback');
		};
		/*上传成功*/
		_this.success = function(_list){
			null !== _this.timer && clearTimeout(_this.timer);
			if( _this.processStep !== _this.length ) {
				var isEnd = false;
				$('.diyBar .diyProgress',_this.box).animate({'width':'100%'},500,'',function(){
					if( !isEnd ) {
						isEnd = true;
						_this.callback(_list);
					}
				});
				$('.diyBar .diyProgressText',_this.box).html('100%');
			} else {
				$('.diyBar .diyProgress',_this.box).css({'width':'100%'});
				$('.diyBar .diyProgressText',_this.box).html('100%');
				$('.diySuccess',_this.box).css({'display':'block'});
				_this.callback(_list);
				//$('.diyBar',_this.box).css({'display':'none'});
			}
			_this.input.val('');
			$('li.diyUploadHover',_this.box).addClass('diyUploadOk').removeClass('diyUploadHover');
			_this.files = [];
			_this.length = 0;
		};
		/*上传失败*/
		_this.fail = function(){
			null !== _this.timer && clearTimeout(_this.timer);
			$('.diyBar .diyProgress',_this.box).css({'width':'100%'});
			$('.diyBar .diyProgressText',_this.box).html('上传失败%');
		};
		/*上传*/
		_this.ajax = function(_url,_back){
			var form = new FormData();
			if( 0 ===_this.files.length ) {
				return;
			}
			for(var i in _this.files){
				form.append('file[]',_this.files[i]);
			}
			_this.start();
			$.ajax({
				beforeSend:function(){
				},
				url: _url,// 跳转到 action
				type: 'post',
				cache: false,
				async: true, /*true异步执行，false*/
				contentType:false,
				processData:false,
				data: form,
				dataType: 'json',
				timeout:80000,
				success:function(ret) {
					if( typeof _back === 'function' ) {
						_back(ret);
					} else {
						_this.success();
					}
				},
				error : function(xmlHttpRequest, error) {
					_this.fail();
					if( error=='timeout'){ //超时
						api.showPress({title:'网络太差',time:1500});
					} else {
						api.showPress({title:'系统错误:'+error,time:1500});
					}

				}
			});
		};
		_this.getAllFileSize = function(){
			var size = 0;
			for(var i in _this.files){
				size += Number(_this.files[i].size);
			}
			return size;
		};
		_this.readImg = function(file,obj){
			var reader = new FileReader();
			reader.onload = function(e) {
				obj.find('img').attr('src',e.target.result);
				obj.find('.diyFileName').html(file.name);
			};
			reader.onerror = function(){
				api.showPress({title:'图片载入失败',duration:1000});
				console.log('图片载入失败');
			};
			reader.onloadend = function(){
				console.log('图片已读取完');
			};
			reader.readAsDataURL(file);
			return reader;
		}
		return _this;
	}
}
/*全选设置*/
api.checkAll = function(all,input,body){
	!body && ( body = 'body');
	$(all).on('click',function(){
		$(input).prop('checked',$(this).prop('checked'));
	});
	$(body).on('click',input,function(){
		$(all).prop('checked',$(input).length === $(input+':checked').length);
	});
}
//订单状态
var SYS_STATE =  {
	customer:{
		cusStatu:['<span class="f_ash">待审</span>','正常','<span class="f_red">冻结</span>'],
		timeStatu:['<span class="f_ash">未认证</span>','已认证','<span class="f_red">已过期</span>'],
	},
	order:{
		oState:['<span class="f_ash">未确认</span>','<span class="f_blue">已确认</span>','<span class="f_red">已挂起</span>','<span class="f_red">已终止</span>','<span class="f_green">已完成</span>','<span class="f_red">已作废</span>'],
		payState:['<span class="f_ash">未确认未生成</span>','<span class="f_orange">未收款未对账</span>','<span class="f_blue">未收款已对账</span>','<span class="f_green">已对账已收款</span>','<span class="f_red">未对账已退款</span>','<span class="f_red">已对账已退款</span>','<span class="f_green">已收款未对账</span>'],
		expressStatu:['<span class="f_ash">未确认未生成</span>','<span class="f_blue">已生成待接收</span>','<span class="f_blue">已接收待捡货</span>','<span class="f_blue">已捡货待复核</span>','<span class="f_green">已复核待出库</span>','<span class="f_orange">已出库待配送</span>','<span class="f_orange">已配送待收货</span>','<span class="f_green">已收货已完成</span>','<span class="f_red">已退货未入仓</span>','<span class="f_blue">已退货已入仓</span>'],
		payType:['<span class="f_green">微信支付</span>','<span class="f_blue">支付宝</span>','<span class="f_orange">货到付款</span>','<span class="f_red">现货后款</span>','余额支付','<span class="f_orange">银行转账</span>'],
		innerWay:['<span class="f_orange">手动</span>','<span class="f_green">APP</span>','<span class="f_orange">微信</span>','<span class="f_green">PC</span>'],
		percentage:['<span class="f_orange">未结算</span>','<span class="f_green">已结算</span>']
	},
	purchase:{
		state:['暂存中','审批中','审批完成','付款截止','','订单终止'],
		order_state:['<span class="f_ash">未确认</span>','<span class="f_blue">已确认</span>','<span class="f_red">已挂起</span>','<span class="f_red">已终止</span>','<span class="f_green">已完成</span>','<span class="f_red">已作废</span>'],
		pay_state:['未对账未付款','未对账部分付款','已对账未付款','已对账部分付款','已对账已付款','未对账已退款','已对账已退款'],
		pay_type:['预付款','后付款'],
		wlstatu:['未约仓','部分约仓','全部收货','已退货']
	},
	warehouse_in:{
		state:['已约仓未验货','已验货','已入库','已取消'],
		checkStatu:['未质检','通过','部分通过','不通过'],
		inType:['采购入库','调拔入库','手工入库','退货入库']
	},
	service:{
		supplier_type:['自营','入驻','代销'],
		settle_method:['自营结算','入驻结算','代销结算'],
		supply_type:['生产企业','总经销','独家代理','一级代理','地区代理','进口商','其他'],
	}
};
