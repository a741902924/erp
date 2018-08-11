var view = {};
view.state = {
	pay_state:['未收款','部分收款','已收款'],
	express_statu:['<span class="f_ash">未确认未生成</span>','<span class="f_blue">已生成待接收</span>','<span class="f_blue">已接收待捡货</span>','<span class="f_blue">已捡货待复核</span>','<span class="f_green">已复核待出库</span>','<span class="f_orange">已出库待配送</span>','<span class="f_orange">已配送待收货</span>','<span class="f_green">已收货已完成</span>','<span class="f_red">已退货未入仓</span>','<span class="f_blue">已退货已入仓</span>'],
	o_statu:['<span class="f_ash">未确认</span>','<span class="f_blue">已确认</span>','<span class="f_red">已挂起</span>','<span class="f_red">已终止</span>','<span class="f_green">已完成</span>','<span class="f_red">已作废</span>'],
	stastatu:['未确认','已确认']
};
//ajax拉取数据
/**
* 付款单详情
**/
view.receiptInfo = function(info){
	var receipt = info.receipt,
		admins = info.admins,
		logs = info.logs;
	view.receipt_id = receipt.receipt_id; //付款单ID
	$('#receiptBox tr td[name=receipt_sn]').html(receipt.receipt_sn);
	$('#receiptBox tr td[name=ser_simple_name]').html();
	$('#receiptBox tr td[name=ctime]').html(api.unixToDate(receipt.ctime,true));
	$('#receiptBox tr td[name=check_sn]').html(receipt.check_sn);
	$('#receiptBox tr td[name=pay_state]').html(view.state.pay_state[Number(receipt.pay_state)]);
	$('#receiptBox tr td[name=stastatu]').html(view.state.stastatu[Number(receipt.stastatu)]);
	$('#receiptBox tr td[name=order_sn]').html(receipt.order_sn);
	$('#receiptBox tr td[name=express_no]').html(receipt.express_no);
	$('#receiptBox tr td[name=o_statu]').html(view.state.o_statu[Number(receipt.o_statu)]);
	$('#receiptBox tr td[name=express_statu]').html(view.state.express_statu[Number(receipt.express_statu)]);
	$('#receiptBox tr td[name=pay_fee]').html(receipt.pay_fee);
	var admin_str = '';
	for( i in admins ){
		admin_str += admins[i]['real_name'] +' '
	}
	$('#receiptBox tr td[name=admins]').html(admin_str);
	var time = '';
	for(var i=1;i<4;i++) {
		$('#receiptBox tr input[name=money_'+i+']').val(eval('receipt.money_'+i));
		$('#receiptBox tr input[name=receipt_time_'+i+']').val( eval('receipt.pay_time_'+i));
		$('#receiptBox tr input[name=voucher_'+i+']').val(eval('receipt.voucher_'+i));
		$('#receiptBox tr input[name=voucher_sn_'+i+']').val(eval('receipt.voucher_sn_'+i));
	}
	$('#receiptBox tr textarea[name=note]').val(receipt.note);
	3 == receipt.receipt_state && $('#receiptBox tr input[name=receipt_state]').prop('checked',true);
	2 == receipt.receipt_state && ( $('#receiptBox tr input[name=receipt_state]').prop('disabled',true),$('#receiptBox tr button[name=save]').prop('disabled',true));
	logs && view.logView(logs);
		
}

/**
日志视图
* @access public
* @return false
*/
view.logView = function(alog){
	$('#log tbody').html('');
	var $agoTime = 0;
	for(var i in alog ) {
		$user_time = 0 < $agoTime ? api.secondToTime(alog[i].ctime - $agoTime) : '';
		$agoTime = alog[i].ctime;
		$('#log tbody').append('<tr><td>'+api.unixToDate(alog[i].ctime,true)+'</td><td>'+$user_time+'</td><td>'+alog[i].job+':'+alog[i].real_name+'<br/>'+alog[i].mobile+'</td><td>'+alog[i].content+'</td></tr>');
	}
};