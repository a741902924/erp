var order = {ajaxUrl:[],warehuose_id:0},
	userInfo = {cus_id:0},
	orderInfo = {order_id:0,o_statu:0,d_statu:0,express_statu:0},
	extList = [],
	areaList = [],
	addressList = [];
order.innerWay = ['<span class="f_orange">手动</span>','<span class="f_green">APP</span>','<span>微信</span>','<span>PC</span>'];
/**
* 列表视图
* @access public
* @return false
*/
order.setTableView = function(list){
	var str= '';
	for(var i=0; i<list.length; i++){
		str = '<tr>';
		str += '<td><input type="checkbox" name="id" value="'+list[i].order_id+'"></td>';
		str += '<td>'+list[i].whname+'</td>';
		str += '<td>'+list[i].ser_simple_name+'/'+SYS_STATE.service.settle_method[list[i].settle_method]+'</td>';
		str += '<td>'+list[i].recive_man+'/'+list[i].recive_mobile+'</td>';
		str += '<td>'+list[i].order_sn+'/'+api.unixToDate(list[i].ctime,true)+'</td>';
		str += '<td>'+list[i].g_kind+'</td>';
		str += '<td>'+list[i].g_num+'</td>';
		str += '<td>'+list[i].g_fee+'</td>';
		str += '<td>'+SYS_STATE.order.innerWay[Number(list[i].inner_way)]+'</td>';
		str += '<td>'+SYS_STATE.order.oState[Number(list[i].o_statu)]+'</td>';
		str += '<td>'+SYS_STATE.order.expressStatu[Number(list[i].express_statu)]+'</td>';
		str += '<td>'+SYS_STATE.order.payState[Number(list[i].d_statu)]+'</td>';
		str += '<td>'+SYS_STATE.order.payType[Number(list[i].pay_type)]+'</td>';
		str += '<td><a href="'+order.ajaxUrl.info+'/order_id/'+list[i].order_id+'" target="_blank" class="comm-link">订单详情</a></td></tr>';
		$('table#view tbody#orderList').append(str);
	}
}
