/***
* 盈亏JS
view * 页面视图对象 
***/
var view = {pageSize:10};
view.ProfitLoss = {};
/*盈亏列表*/
view.searchProfitLoss = function(page,size){
	var post = {key:$.trim($('form[name=search] input[name=key]').val()),ser_id:$('form[name=search] select[name=ser_id]').val(),warehuose_id:$('form[name=search] select[name=warehuose_id]').val(),page:page,len:size};
	api.ajax(view.list_url,post,function(ret){
		propage.setTotal(ret.total);
		view.list(ret.info);
	});	
}
/*盈亏列表*/
view.list = function(list){
	$('table#ProfitLoss tbody').html('');
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
			diffMoney = diffNum = '未盈亏';
		}
		$('table#ProfitLoss tbody').append('<tr><td>'+list[i].whname+'</td><td>'+list[i].ser_simple_name+'</td><td><a href="'+view.info_url+'/pal_id/'+list[i].pal_id+'">'+list[i].pal_sn+'/'+api.unixToDate(list[i].ctime)+'</a></td><td>'+oldTotal+'('+diffNum+'/'+diffMoney+')</td><td>'+(0<list[i].paltime ? list[i].paluname+'/'+api.unixToDate(list[i].paltime,true) : '')+'</td><td>'+(list[i].process ? list[i].process : '')+'</td></tr>');
	}
}
/*盈亏详情*/
view.infoProfitLoss = function(post){
	api.ajax(view.info_url,post,function(ret){
		view.info(ret.info);
	});
}
/*盈亏详情*/
view.info = function(info){
	view.pal_id = info.pal.pal_id;
	view.ProfitLoss = info.pal;
	$('#profitLoss tbody td[name=pal_sn]').html(info.pal.pal_sn);
	$('#profitLoss tbody td[name=pal_type]').html(0<info.pal.inv_id ? '盘点['+info.inventory.inv_sn+']' : '报损');
	$('#profitLoss tbody td[name=ctime]').html(api.unixToDate(info.pal.ctime,true));
	$('#profitLoss tbody td[name=paltime]').html(0<info.pal.paltime ? info.pal.paluname+'/'+api.unixToDate(info.pal.paltime,true) : '未操作');
	if( 0 < info.pal.statu ) {
		diffNum = info.pal.a_new_num - info.pal.a_old_num;
		diffMoney = info.pal.money - info.pal.old_money;
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
		var total = '未操作';		
	}
	$('#profitLoss tbody td[name=total]').html(total);
	0 < info.pal.state ? $('#profitLossProductList tfoot button').prop('disabled',true) : $('#profitLossProductList tfoot button').prop('disabled',false);
	view.setButton(info.pal.state);
	$('#profitLossProductList tbody').html('');
	var difference = 0,difference_html = '';
	for(var i in info.pro){
		if( 0 < info.pal.statu ) {
			difference = info.pro[i].new_num - info.pro[i].old_num;
			if( 0 == difference ) {
				difference_html = '<span class="f_green">相符</span>';
			} else if ( 0 < difference ) {
				difference_html = '<span class="f_blue">多 '+Math.abs(difference)+'/'+(Math.abs(difference)*info.pro[i].price).toFixed(2)+'</span>';
			} else {
				difference_html = '<span class="f_red">少 '+Math.abs(difference)+'/'+(Math.abs(difference)*info.pro[i].price).toFixed(2)+'</span>';	
			}
		} else {
			difference_html = '未盈亏';	
		}
		$('#profitLossProductList tbody').append('<tr data-id="'+info.pro[i].pro_id+'"><td>'+info.pro[i].product_sn+'/'+info.pro[i].ser_simple_name+'/'+api.unixToDate(info.pro[i].protime)+'</td><td>'+info.pro[i].brand_name+'/'+info.pro[i].mode+'/'+info.pro[i].cat_name+'/'+info.pro[i].attr+'</td><td>'+api.secondToTime(info.pro[i].age)+'</td><td>'+info.pro[i].district_name+'/'+info.pro[i].shelves_name+'/'+info.pro[i].num_name+'</td><td>'+info.pro[i].old_num+'/'+info.pro[i].price+'</td><td data-name="difference">'+difference_html+'</td><td><input type="text" name="new_num" value="'+info.pro[i].new_num+'" data-num="'+info.pro[i].old_num+'" data-price="'+info.pro[i].price+'" class="comm-input" size="5"/></td></tr>');
	}
	api.logView(info.log);
	switch(Number(info.pal.process_num)){
		case info.pal.process_num > 99:
			$('#processListState tbody tr').find('td:last span').html('已审');
			break;
		case 99:
			$('#processListState tbody tr:not(:last)').find('td:last span').html('已审');
			break;
		default:
			$('#processListState tbody tr:lt('+info.pal.process_num+')').find('td:last span').html('已审')
			break;
	}
	
}
view.setButton = function(state){
	switch(Number(state)){
		case 0:
			$('#profitLossProductList tfoot button').prop('disabled',false);
			0 < view.ProfitLoss.inv_id && $('#profitLossProductList tfoot button[name=save]').prop('disabled',true);
			$('#processBtns button').prop('disabled',true);
			break;
		case 1:
			$('#profitLossProductList tfoot button').prop('disabled',true);
			$('#processBtns button').prop('disabled',false);
			break;
		default:
			$('#profitLossProductList tfoot button').prop('disabled',true);
			$('#processBtns button').prop('disabled',true);
			break;
	}	
}
/*
*
* 暂存盈亏
*/
$('#profitLossProductList tfoot button[name=save]').on('click',function(){
	var post = {pal_id:view.pal_id,pro:[]};
	var pro_id = 0,new_num=0,old_num,price=0,err = false;
	$('#profitLossProductList tbody tr').each(function(index) {
		new_num = $.trim($('input[name=new_num]',this).val());
		old_num = $('input[name=new_num]',this).data('num');
		price = $('input[name=new_num]',this).data('price');
		if( !api.regParseInt(new_num) ){
			err = true;
			$('input[name=new_num]',this).focus().select();
			return false;	
		}
		post.pro.push({pro_id:$(this).data('id'),new_num:new_num,old_num:old_num,price:price});
	});
	if( err ) {
		api.showPress({title:'盈亏数量不合法',duration:1000});
		return false;
	}
		
	api.ajax(view.edit_save_url,post);	
});
/*
*
* 提交盈亏
*/
$('#profitLossProductList tfoot button[name=submit]').on('click',function(){
	api.confirm({title:'警告',msg: '确认要提交吗？'},function(btn){
		if( 1 == btn.buttonIndex ) {
			api.ajax(view.edit_submit_url,{pal_id:view.pal_id},function(ret){
				view.setButton(ret.info.state);
			});	
		}
	});	
});
/*
*
* 审批
*/
$('#processBtns button').on('click',function(){
	var type = $(this).attr('name');
	var note = $.trim($('#processBtns input[name=note]').val());
	if( 'nopass' == type &&  '' == note) {
		api.showPress({title:'请填写原因',duration:1000});
		$('#processBtns input[name=note]').focus();
		return false;
	}
	api.ajax(view.edit_process_url,{type:type,pal_id:view.pal_id,note:note},function(ret){
		view.setButton(ret.info.state);
	});
});

