var payment = {ajaxUrl:[],apply_id:0};
payment.boxObj = $('#view');
//ajax拉取数据
/**
* 付款单详情
**/
payment.infoView = function(info){
	var payInfo = info.payment,
		adminsList = info.admins,
		logs = info.logs;
	payment.pay_id = payInfo.pay_id; //付款单ID
	payment.group_id = payInfo.group_id; //预付款订单ID //对账单ID串
	$('#payBox tr td[name=pay_sn]').html(payInfo.pay_sn);
	$('#payBox tr td[name=ser_simple_name]').html(payInfo.ser_simple_name);
	$('#payBox tr td[name=ctime]').html(api.unixToDate(payInfo.ctime,true));
	$('#payBox tr td[name=apply_name]').html(payInfo.apply_name);
	$('#payBox tr td[name=pay_state]').html(payment.pay_state[Number(payInfo.pay_state)]);
	$('#payBox tr td[name=apply_sn]').html(payInfo.apply_sn);
	$('#payBox tr td[name=payable_amount]').html(payInfo.payable_amount);
	var admin_str = '';
	for( i in adminsList ){
		admin_str += adminsList[i]['real_name'] +' '
	}
	$('#payBox tr td[name=admins]').html(admin_str);
	var time = '';
	for(var i=1;i<4;i++) {
		$('#payBox tr input[name=money_'+i+']').val(eval('payInfo.money_'+i));
		$('#payBox tr input[name=pay_time_'+i+']').val( eval('payInfo.pay_time_'+i));
		$('#payBox tr input[name=voucher_'+i+']').val(eval('payInfo.voucher_'+i));
		$('#payBox tr input[name=voucher_sn_'+i+']').val(eval('payInfo.voucher_sn_'+i));
		/*if( 0 < $('#payBox tr input[name=money_'+i+']').val() ){ //不允许修改下次
			$('#payBox tr input[name=money_'+i+']').attr('disabled',true);
			$('#payBox tr input[name=pay_time_'+i+']').attr('disabled',true);
			$('#payBox tr input[name=voucher_'+i+']').attr('disabled',true);
			$('#payBox tr input[name=voucher_sn_'+i+']').attr('disabled',true);
		}*/
	}
	$('#payBox tr textarea[name=note]').val(payInfo.note);
	3 == payInfo.pay_state && $('#payBox tr input[name=pay_state]').prop('checked',true);
	2 == payInfo.pay_state && ( $('#payBox tr input[name=pay_state]').prop('disabled',true),$('#payBox tr button[name=save]').prop('disabled',true));
	payment.logView(logs);
		
}

/**
日志视图
* @access public
* @return false
*/
payment.logView = function(alog){
	$('#log tbody').html('');
	var $agoTime = 0;
	for(var i in alog ) {
		$user_time = 0 < $agoTime ? api.secondToTime(alog[i].ctime - $agoTime) : '';
		$agoTime = alog[i].ctime;
		$('#log tbody').append('<tr><td>'+api.unixToDate(alog[i].ctime,true)+'</td><td>'+$user_time+'</td><td>'+alog[i].job+':'+alog[i].real_name+'<br/>'+alog[i].mobile+'</td><td>'+alog[i].content+'</td></tr>');
	}
};