/***
* 仓库 出库JS
view * 页面视图对象
* warehouse 当前仓库
***/
var view = {pageSize:10};
var warehouse = {}; //仓库

var order = []; //订单
var warehouse_out = {};

const o_sate = {
	
	payType:['微信支付','支付宝','货到付款','现货后款','余额支付','银行转账'],
	out_sate:['未接收','已接收','已拣货','已复核','已出库','已发货'], //入库单状态
}

/**
* 出库单详情
**/
view.warehouse_out = function(info){
	warehouse_out = info.out;
	var name = '',val='';
	$('#outInfo td[data-val=true]').each(function(index, element) {
		name = $(this).attr('name');
		val = eval('warehouse_out.'+name);
		if( 'state' == name ) {
			val = o_sate.out_sate[Number(val)] ? o_sate.out_sate[Number(val)] : '已取消';
		} else if( 'ctime' == name ) {
			val = api.unixToDate(val,true);
		}
		$(this).html(val);
	});
	
	switch(Number(warehouse_out.out_type)){
		case 0: //销售出库
			$('#outType caption').html('销售出库');
			$('#outType tbody').html('<tr><th>公司名：</th><td>'+info.inmode.company+'</td><th>订单号：</th><td>'+info.inmode.order_sn+'</td></tr><tr><th>收货人姓名：</th><td>'+info.inmode.recive_man+'</td><th>收货地址：</th><td>'+info.inmode.pro+' '+info.inmode.city+' '+info.inmode.area+' '+info.inmode.addr+'</td></tr><tr><th>指定物流：</th><td>'+info.inmode.express_way+'</td><th>收货人：</th><td>'+info.inmode.recive_man+'</td></tr><tr><th>订单付款方式：</th><td>'+o_sate.payType[info.inmode.pay_type]+'</td><th>收货人电话：</th><td>'+info.inmode.recive_mobile+'</td></tr><tr><th>客户备注：</th><td colspan="3">'+info.inmode.o_mark+'</td></tr></tr><tr><th>商务备注：</th><td colspan="3">'+info.inmode.a_mark+'</td></tr><tr><th>商务：</th><td></td><th>操作：</th><td>'+info.out.cuname+'</td></tr>');
			$('input[name=express_no]').val(info.inmode.express_no);
			$('#shipping_box').removeClass('f-hide');
			$('#batchButton button[name=print_send]').removeClass('f-hide');
			break;
		case 1: //调拔出库
			$('#outType caption').html('调拔出库');
			$('#outType tbody').html('<tr><th>调出仓：</th><td>'+warehouse_out.whname+'</td><th>调拔单号：</th><td>'+warehouse_out.in_sn+'</td></tr><tr><th>调入仓：</th><td>'+info.inmode.whname+'</td><th>商务：</th><td>'+warehouse_out.cuname+'</td></tr><tr><th>商务备注：</th><td colspan="3">'+warehouse_out.w_note+'</td></tr>');
			$('#shipping_box').addClass('f-hide');
			$('#batchButton button[name=print_send]').addClass('f-hide');
			break;
		case 2: //手动出库
			$('#outType caption').html('手动出库');
			$('#outType tbody').html('<tr><th>操作人：</th><td>'+warehouse_out.cuname+'</td><th></th><td></td></tr><tr><th>备注：</th><td colspan="3">'+warehouse_out.w_note+'</td></tr>');
			$('#shipping_box').addClass('f-hide');
			$('#batchButton button[name=print_send]').addClass('f-hide');
			break;
	}
	$('#outProducts tbody').html('');
	for(var i in info.products) {
		$('#outProducts tbody').append('<tr data-num="'+info.products[i].bespeak_num+'"><td><input type="checkbox" name="product_id" value="'+info.products[i].product_id+'_'+info.products[i].new_id+'"/></td><td>'+info.products[i].product_sn+'/'+info.products[i].ser_simple_name+'</td><td>'+info.products[i].standard_code+'</td><td>'+info.products[i].mode+'/'+info.products[i].brand_name+'/'+info.products[i].cat_name+'/'+info.products[i].pname+'/'+info.products[i].attr+'</td><td>'+info.products[i].bespeak_num+'/'+info.products[i].price+'</td><td><button class="comm-button" name="pick" '+(0 < info.products[i].yuid ? 'disabled' : '')+'> 拣货 </button></td><td><button class="comm-button" name="review" '+(0 < info.products[i].ruid ? 'disabled' : '')+'> 复核 </button></td></tr>');
		
	}
	var shipping_str = '<option value="0">选择物流公司</option>';
	var selected = '';
	for(var i in info.shipping ) {
		info.inmode.express_id && ( selected = info.shipping[i].shipping_id == info.inmode.express_id ? ' selected' : '');
		shipping_str += '<option value="'+info.shipping[i].shipping_id+'"'+selected+'>'+info.shipping[i].shipping_name+'</option>';
	}
	$('#batchButton select[name=shipping]').html(shipping_str);
}

/**拣货**/
$('#outProducts tbody').on('click','button[name=pick]',function(){
	var _this = $(this);
		tr = _this.parents('tr'),
		product_id = tr.find('input[name=product_id]').val();

	api.ajax(view.pick_url,{out_id:view.out_id,values:[{product_id:product_id}]},function(ret){
		_this.prop('disabled',true);
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);
	});
	
});

/**批量 拣货**/
$('#batchButton tbody button[name=pick]').on('click',function(){
	var values = [];
	var _this = $(this);
	$('#outProducts tbody tr input[name=product_id]:checked').each(function(index, element) {
		values .push({
			product_id:$(this).val()
		});
	});
	if( 0 == values.length ) {
		api.showPress({title:'没有选择拣货产品',duration:1000});
		return false;	
	}
	api.ajax(view.pick_url,{out_id:view.out_id,values:values},function(ret){
		$('#outProducts tbody button[name=pick]').prop('disabled',true);
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);
	});
});

/**复核**/
$('#outProducts tbody').on('click','button[name=review]',function(){
	var _this = $(this);
	var product_id = _this.parents('tr').find('input[name=product_id]').val();
	api.ajax(view.review_url,{out_id:view.out_id,values:[{product_id:product_id}]},function(ret){
		_this.prop('disabled',true);
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);
	});
	
});

/**批量 复核**/
$('#batchButton tbody button[name=review]').on('click',function(){
	var values = [];
	$('#outProducts tbody tr input[name=product_id]:checked').each(function(index, element) {
		values .push({
			product_id:$(this).val()
		});
	});
	if( 0 == values.length ) {
		api.showPress({title:'没有选择复核产品',duration:1000});
		return false;	
	}
	api.ajax(view.review_url,{out_id:view.out_id,values:values},function(ret){
		$('#outProducts tbody button[name=review]').prop('disabled',true);
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);
	});
	
});
/**出库**/
$('#batchButton tbody button[name=export]').on('click',function(){
	api.ajax(view.out_url,{out_id:view.out_id},function(ret){
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);	
	});
});
/**发货**/
$('#batchButton tbody button[name=express]').on('click',function(){
	var express_no = $.trim($('#batchButton tbody input[name=express_no]').val()),
		shipping_id = Number($('#batchButton select[name=shipping]').val()),
		shipping_name = $('#batchButton select[name=shipping] option:selected').text(); 
	if( '' == express_no ) {
		$('#batchButton tbody input[name=express_no]').focus();
		return false;
	}
	if( 0 == shipping_id ) {
		api.showPress({title:'请选择物流公司',duration:1000});
		return false;	
	}
	api.ajax(view.express_url,{out_id:view.out_id,express_no:express_no,shipping_id:shipping_id,shipping_name:shipping_name},function(ret){
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);	
	});
});
/**打印拣货单**/
$('#batchButton tbody button[name=print_pick]').on('click',function(){
	if(0 == view.out_id) {
		return false;	
	}
	$('#outProducts tbody tr').removeClass('sel');
	api.ajax(view.print_pick_url,{out_id:view.out_id},function(ret){
		//$('#donwPick').html('<a href="'+ret.file_name.substr(1)+'" target="_blank">下载拣货单</a>');
		$('#outInfo td[name=state]').html(o_sate.out_sate[ret.out_state]);
		window.open(ret.file_name.substr(1));
	},function(ret){
		console.log(ret);
		if( 4000 == ret.error_no ) {
			var tr = null;
			for( var i in ret.error ) {
				tr = $('#outProducts tbody input[name=product_id][value='+ret.error[i].product_id+']').parents('tr');
				tr.addClass('sel');
				tr.attr('title','当前实际库存['+ret.error[i].product_number+']');
			}	
		}
	});
});

/**打印出库单**/
$('#batchButton tbody button[name=print_out]').on('click',function(){
	if(0 == view.out_id) {
		return false;	
	}
	api.ajax(view.print_out_url,{out_id:view.out_id},function(ret){
		//$('#downOut').html('<a href="'+ret.file_name.substr(1)+'" target="_blank">下载出库单</a>');
		window.open(ret.file_name.substr(1));
	});
});

/**打印发货单**/
$('#batchButton tbody button[name=print_send]').on('click',function(){
	if(0 == view.out_id) {
		return false;	
	}
	api.ajax(view.print_send_url,{out_id:view.out_id},function(ret){
		//$('#downSend').html('<a href="'+ret.file_name.substr(1)+'" target="_blank">下载发货单</a>');
		window.open(ret.file_name.substr(1));
	});
});
/*=======第一步========*/
/**将商品添加到->商品确认表单**/
function addProToConfirmPlan(){
	var ok = err = 0;
	var str = '',ids='';
	$('#proList tbody input[name=product_id]:checked').each(function(index, element) {
		var i = $(this).data('index');
		if( 0 < $('#confirmProPlanList tbody').find('input[name=product_id][value='+$(this).val()+']').length ) {
			err += 1;
		} else {
			$('#confirmProPlanList tbody').append('<tr><td><input type="checkbox" name="product_id" value="'+view.proList[i].product_id+'"/></td><td>'+view.proList[i].product_sn+'/'+view.proList[i].mode+'/'+view.proList[i].brand_name+'/'+view.proList[i].cat_name+'/'+view.proList[i].pname+'/'+view.proList[i].attr+'</td><td>'+view.proList[i].product_number+'</td><td>'+view.proList[i].purchase_price+'</td></tr>'),$(this).parents('tr').remove(),ok++;
		}
	});
	var msg = ok+'个货品添加成功';
	0 < err && ( msg += '，'+err+'个货品重复');
	0 < ok && $('select[name=warehouse_id]').attr('disabled',true);
	api.showPress({title:msg,duration:1500});
}

/**将商品->从商品确认表单中删除**/
function delProPlanList(){
	0 < $('#confirmProPlanList tbody input[name=product_id]:checked').length && ($('#confirmProPlanList thead input[name=chkAll]').prop('checked',false),$('select[name=warehouse_id]').attr('disabled',false));
	$('#confirmProPlanList tbody input[name=product_id]:checked').each(function(index, element) {
		$(this).parents('tr').remove();
	});
}

/*=======第二步========*/
/**确认以上商品进入库单**/
function addProToPlan(){
	var obj = $('#proPlanList'),
		tbody = obj.find('tbody'),
		thead = obj.find('thead'),
		str = '',
		len = $('#confirmProPlanList tbody tr').length;
	if( 0 == len ){
		api.showPress({title:'错误：没有货品',duration:1500});
		return false;	
	}
	tbody.find('tr.new').remove();
	var id = 0;
	$('#confirmProPlanList tbody tr').each(function(index, element) {
		id = $(this).find('input[name=product_id]').val();
		if( 0 == obj.find('tr.old[data-id='+id+']').length ) {
			str = '<tr class="new" data-id="'+id+'">';
			str += '<td>'+$(this).find('td:eq(1)').html()+'</td>';
			str += '<td>'+$(this).find('td:eq(2)').html()+'</td>';
			str += '<td><input type="text" class="comm-input" name="number" value="0"></td>';
			str += '<td><input type="hidden" class="comm-input" name="price" value="'+$(this).find('td:eq(3)').html()+'"></td>';
			tbody.append(str);
		}
	});
	view.isSave = false;
	$('div[data-step=first]').css({'display':'none'});
	$('div[data-step=second]').css({'display':'block'});
}
view.warehouse_outList=function (page,len,ext){
 var data={};
	  data.warehouse_id=$('#warehouse_id').combobox('getValue');
	  data.out_type=$('#out_type').combobox('getValue');
	  data.state=$('#state').combobox('getValue');
      data.out_sn=$('input[name=out_sn]').val();
	  data.amount=[];
	  $('input[name="amount[]"]').each(function (){
		  data.amount.push($.trim($(this).val()));
	  });
	  data.start_time=$('input[name=start_time]').val();
	  data.end_time=$('input[name=end_time]').val();
      if(ext){
		  data.type=ext;
	  }
	  data.page=page;
	  data.len=len;
	  api.ajax(view.warehouseOut_url,data,function (result){
		    if(result.total){
				$('#pager').pagination({total:result.total});
			}
		  var ret=result.data;
		  var outTypeList=['销售出库','调拨出库','手工出库'];
		  var state = ['未接收','已接受','已拣货','已复核','已出库','已配送'];
		//  'whname,out_sn,out_type,p_num,amount,dtime,duname,ytime,yuname,rtime,runame,utime,uuname,ttime,tuname'
		  $('.yd_data').html('');
		  var cur='';
		  for(var i in ret) {
			  cur += ' <tr><td>' + ret[i].whname + '</td><td><a href="/Home/Warehouse/out/out_id/'+ret[i].out_id+'"  target="_blank">'+ ret[i].out_sn + '</a></td><td>' +
				  (isNaN(ret[i].out_type)?'':outTypeList[ret[i].out_type]) + '</td><td>' +
				  ret[i].p_num+'/'+ret[i].amount + '</td><td>'+(state[ret[i].state]||'已取消')+'</td><td>' +
				  (ret[i].duname==null?'无':ret[i].duname)+'/'+(ret[i].dtime>0?api.unixToDate(ret[i].dtime)+'/'+api.secondToTime(ret[i].dtime-ret[i].ctime):'未执行') + '</td><td>' +
				  (ret[i].yuname==null?'无':ret[i].yuname)+'/'+(ret[i].ytime>0?api.unixToDate(ret[i].ytime)+'/'+api.secondToTime(ret[i].ytime-ret[i].dtime):'未执行') + '</td><td>' +
				  (ret[i].runame==null?'无':ret[i].runame)+'/'+(ret[i].r>0?api.unixToDate(ret[i].rtime)+'/'+api.secondToTime(ret[i].rtime-ret[i].ytime):'未执行') + '</td><td>' +
				  (ret[i].uname==null?'无':ret[i].uname)+'/'+(ret[i].utime>0?api.unixToDate(ret[i].utime)+'/'+api.secondToTime(ret[i].utime-ret[i].rtime):'未执行')+ '</td><td>'+
				  (ret[i].tuname==null?'无':ret[i].tuname)+'/'+(ret[i].ttime>0?api.unixToDate(ret[i].ttime)+'/'+api.secondToTime(ret[i].ttime-ret[i].utime):'未执行')+'</td></tr>';
		  }
		  $('.yd_data').html(cur);

	  });

}