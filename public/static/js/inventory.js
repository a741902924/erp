/***
* 仓库JS
view * 页面视图对象
* warehouse 当前仓库 
***/
var view = {pageSize:10};
/*盘点列表*/
view.searchInventory = function(page,size){
	var post = {inv_sn:$.trim($('form[name=search] input[name=key]').val()),invuname:$.trim($('form[name=search] input[name=invuname]').val()),checkuname:$.trim($('form[name=search] input[name=checkuname]').val()),inv_type:$('form[name=search] select[name=inv_type]').val(),page:page,len:size};
	api.ajax(view.list_url,post,function(ret){
		propage.setTotal(ret.total);
		view.list(ret.info);
	});	
}
/*盘点列表*/
view.list = function(list){
	$('table#inventory tbody').html('');
	var diffNum = '',diffMoney,oldTotal = '';
	for(var i in list) {
		if( 0 < list[i].stime ) {
			oldTotal = list[i].a_old_num+'/'+list[i].old_money;
		} else {
			oldTotal = '未开始';
		}

		if( 0 < list[i].statu ) {
			diffNum = list[i].a_new_num - list[i].a_old_num;
			diffMoney = list[i].money - list[i].old_money;
			if( diffNum>0 ) {
				diffNum = '<span class="f_blue">'+diffNum+'</span>';
			} else if( diffNum<0 ){
				diffNum = '<span class="f_red">'+diffNum+'</span>';
			} else {
				diffNum = '<span class="f_green">相符</span>';
			}
			if( diffMoney>0 ) {
				diffMoney = '<span class="f_blue">'+diffMoney+'</span>';
			} else if( diffMoney<0 ){
				diffMoney = '<span class="f_red">'+diffMoney+'</span>';
			} else {
				diffMoney = '<span class="f_green">相符</span>';
			}
		} else {
			diffMoney = diffNum = '未盘点';
		}
		$('table#inventory tbody').append('<tr><td>'+list[i].whname+'</td><td><a href="'+view.info_url+'/inv_id/'+list[i].inv_id+'">'+list[i].inv_sn+'/'+api.unixToDate(list[i].ctime)+'</a></td><td>'+oldTotal+'</td><td>'+diffNum+'/'+diffMoney+'</td><td>'+(0<list[i].invtime ? list[i].invuname+'/'+api.unixToDate(list[i].invtime,true) : '未盘点')+'</td><td>'+(0<list[i].checktime ? list[i].checkuname+'/'+api.unixToDate(list[i].checktime,true) : '未复核')+'</td></tr>');
	}
}
/*盘点详情*/
view.infoInventory = function(post){
	api.ajax(view.info_url,post,function(ret){
		view.info(ret.info);
	});
}
/*盘点详情*/
view.info = function(info){
	view.inv_id = info.inventory.inv_id;
	view.inventory = info.inventory;
	$('#inventory tbody td[name=inv_sn]').html(info.inventory.inv_sn);
	$('#inventory tbody td[name=ctime]').html(api.unixToDate(info.inventory.ctime,true));
	$('#inventory tbody td[name=stime]').html(0<info.inventory.stime ? api.unixToDate(info.inventory.stime,true) : '<button name="start" onClick="view.startInventory(this)" class="comm-button">开始</button>');
	if( 0 < info.inventory.statu ) {
		diffNum = info.inventory.a_new_num - info.inventory.a_old_num;
		diffMoney = info.inventory.money - info.inventory.old_money;
		if( diffNum>0 ) {
			diffNum = '<span class="f_blue">'+diffNum+'</span>';
		} else if( diffNum<0 ){
			diffNum = '<span class="f_red">'+diffNum+'</span>';
		} else {
			diffNum = '<span class="f_green">相符</span>';
		}
		if( diffMoney>0 ) {
			diffMoney = '<span class="f_blue">'+diffMoney+'</span>';
		} else if( diffMoney<0 ){
			diffMoney = '<span class="f_red">'+diffMoney+'</span>';
		} else {
			diffMoney = '<span class="f_green">相符</span>';
		}
		var total = diffNum + '/' + diffMoney;
	} else {
		var total = '未盘点';		
	}
	$('#inventory tbody td[name=total]').html(total);
	$('#inventory tbody td[name=invuname]').html(info.inventory.invuname);
	$('#inventory tbody td[name=invtime]').html((0<info.inventory.invtime ? api.unixToDate(info.inventory.invtime,true) : '未盘点'));
	$('#inventory tbody td[name=checkuname]').html(info.inventory.checkuname);
	$('#inventory tbody td[name=checktime]').html((0<info.inventory.checktime ? api.unixToDate(info.inventory.checktime,true) : '未复核'));
	
	$('#inventoryProductList tbody').html('');
	var difference = 0,difference_html = '';
	for(var i in info.pro){
		if( 0 < info.inventory.statu ) {
			difference = info.pro[i].new_num - info.pro[i].old_num;
			if( 0 == difference ) {
				difference_html = '<span class="f_green">相符</span>';
			} else if ( 0 < difference ) {
				difference_html = '<span class="f_blue">多 '+Math.abs(difference)+'/'+(Math.abs(difference)*info.pro[i].price).toFixed(2)+'</span>';
			} else {
				difference_html = '<span class="f_red">少 '+Math.abs(difference)+'/'+(Math.abs(difference)*info.pro[i].price).toFixed(2)+'</span>';	
			}
		} else {
			difference_html = '未盘点';	
		}
		$('#inventoryProductList tbody').append('<tr data-id="'+info.pro[i].lo_id+','+info.pro[i].ser_id+'"><td>'+info.pro[i].product_sn+'/'+info.pro[i].ser_simple_name+'/'+api.unixToDate(info.pro[i].protime)+'</td><td>'+info.pro[i].brand_name+'/'+info.pro[i].mode+'/'+info.pro[i].cat_name+'/'+info.pro[i].attr+'</td><td>'+api.secondToTime(info.pro[i].age)+'</td><td>'+info.pro[i].district_name+'/'+info.pro[i].shelves_name+'/'+info.pro[i].num_name+'</td><td>'+(0<info.inventory.stime ? info.pro[i].old_num : info.pro[i].actual_num)+'/'+info.pro[i].price+'</td><td data-name="difference">'+difference_html+'</td><td><input type="text" name="new_num" value="'+info.pro[i].new_num+'" data-num="'+info.pro[i].old_num+'" data-price="'+info.pro[i].price+'" class="comm-input" size="5"/></td></tr>');
	}
}
/*
*
* 开始盘点
*/
view.startInventory = function(_this){
	api.ajax(view.edit_start_url,{inv_id:view.inv_id},function(ret){
		view.inventory.stime = ret.stime;
		$(_this).parent().html(api.unixToDate(view.inventory.stime,true));
	});	
}
/*
*
* 提交盘点
*/
$('#inventoryProductList tfoot button[name=submit]').on('click',function(){
	var post = {uname:$.trim($('#inventoryProductList tfoot input[name=s_uname]').val()),password:$.trim($('#inventoryProductList tfoot input[name=s_password]').val()),inv_id:view.inv_id,pro:[]};
	if( '' == post.uname || '' == post.password ) {
		api.showPress({title:'请输入帐号和密码',duration:1000});
		return false;
	}
	var ids = '',new_num=0,old_num,price=0,err = false;
	$('#inventoryProductList tbody tr').each(function(index) {
		new_num = $.trim($('input[name=new_num]',this).val());
		old_num = $('input[name=new_num]',this).data('num');
		price = $('input[name=new_num]',this).data('price');
		if( !api.regParseInt(new_num) ){
			err = true;
			$('input[name=new_num]',this).focus().select();
			return false;	
		}
		ids = $(this).data('id').split(',');
		post.pro.push({lo_id:ids[0],ser_id:ids[1],new_num:new_num,old_num:old_num,price:price});
	});
	if( err ) {
		api.showPress({title:'盘点数量不合法',duration:1000});
		return false;
	}
	api.confirm({title:'警告',msg: '确认要操作吗？'},function(btn){
		if( 1 == btn.buttonIndex ) {
			api.ajax(view.edit_submit_url,post,function(ret){
				view.info(ret.info);
				$('#inventoryProductList tfoot input[name=s_uname],inventoryProductList tfoot input[name=s_password]').val('');
			});	
		}
	});	
});
/*
*
* 复核盘点
*/
$('#inventoryProductList tfoot button[name=check]').on('click',function(){
	var post = {uname:$.trim($('#inventoryProductList tfoot input[name=c_uname]').val()),password:$.trim($('#inventoryProductList tfoot input[name=c_password]').val()),inv_id:view.inv_id};
	if( '' == post.uname || '' == post.password ) {
		api.showPress({title:'请输入帐号和密码',duration:1000});
		return false;
	}
	api.confirm({title:'警告',msg: '确认要操作吗？'},function(btn){
		if( 1 == btn.buttonIndex ) {
			api.ajax(view.edit_check_url,post,function(ret){
				$('#inventory tbody td[name=checkuname]').html(ret.info.checkuname);
				$('#inventory tbody td[name=checktime]').html(api.unixToDate(ret.info.checktime,true));
			});	
		}
	});	
});

/*
*
* 打印盘点表
*/
$('#inventoryProductList tfoot button[name=print]').on('click',function(){
	if(0 == view.inv_id) {
		return false;	
	}
	api.ajax(view.info_url,{inv_id:view.inv_id,print:true},function(ret){
		$('#downInventory').html('<a href="'+ret.file_name.substr(1)+'" target="_blank">下载盘点表</a>');
	});	
});

