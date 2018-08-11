/***
 * 仓库JS
 view * 页面视图对象
 * warehouse 当前仓库
 * group 当前订单
 * orders 当前采购订单同组订单
 * reserve 约仓单
 ***/
var view = {pageSize:10};
var warehouse = {}; //仓库
var district = []; //库区
var w_shelves = []; //库位
var group = {};
var orders = []; //订单组下子订单
var reserve = {}; //约仓单
var warehouse_in = {};
var district_opt = ''; //库区选择项

const o_sate = {
	shipping:['未确认未生成','已生成待约仓','已约仓待接收','已接收待验货','已验货待入库','已入库已完成','已退货待确认','已退货已确认'],
	order:['未确认','已确认','已挂起','已终止','已完成','已作废'],
	pay:['未对账未付款','未对账部分付款','已对账未付款','已对账部分付款','已对账已付款','未对账已退款','已对账已退款'],
	state:['暂存中','审批中','审批完成','付款截止','订单终止'],
	in_sate:['已约仓未验货','已验货','已入库','已取消'], //入库单状态
	in_type:['采购入库','调拔入库','手工入库','退货入库'],
	check_statu:['<span class="f_red">未质检</span>','全部通过','部分通过','<span class="f_red">不通过</span>'],
}
/**
 * 约仓详情视图
 **/
view.reserve = function(info){
	orders = info.orders;
	group = info.group;
	reserve = info.reserve;
	view.order_index = 0; //记录当前订单在订单组中的下标
	var selected = '',pro_num = 0;
	$('#ordersSelect select[name=warehouse_id] option').remove();
	for(var i in orders ) {
		if( orders[i].order_id == view.order_id ) {
			view.order_index = i;
			selected = ' selected';
		} else {
			selected = '';
		}
		pro_num += Number(orders[i].pro_num);
		$('#ordersSelect select[name=warehouse_id]').append('<option data-id="'+orders[i].order_id+'" value="'+orders[i].warehouse_id+'"'+selected+'>'+orders[i].whname+'</option>');
	}
	$('#ordersSelect input[name=order_sn]').val(orders[view.order_index].order_sn);

	$('#orderNote').html('订单号：'+group.group_sn+'，共为'+orders.length+'个仓库订购'+pro_num+'件商品，金额￥'+(Number(group.amount)+Number(group.freight))+'元。');
	view.reserve_pro(info.products);
	view.reserve_initbtn();
}
/**初始化约仓单**/
view.reserve_initbtn = function(){
	if( undefined == reserve.in_id ) {
		return;
	}
	if( 0 < reserve.in_id ) {
		$('#reserveState').html(o_sate.in_sate[Number(reserve.state)]);
		$('#inSn').html('　约仓单号：'+reserve.in_sn);
		$('#submitBox button[name=next]').prop('disabled',false);
		0 == Number(reserve.state) && $('#submitBox button[name=cancel]').attr('disabled',false);
	} else {
		$('#reserveState').html('未约仓');
		$('#inSn').html(' ');
		0 == reserve.in_id && $('#submitBox button[name=save]').attr('disabled',false);
	}
}
view.reserve_reset = function(){
	$('#ordersSelect select[name=warehouse_id] option').remove();
	$('#ordersSelect input[name=order_sn]').val('');
	$('#reserveState').html('');
	$('#inSn').html('');
	$('#submitBox button').prop('disabled',true);
	$('#orderNote').html('');
	$('#orderState').html('');
	$('#proList tbody').html('');
}
/**
 * 约仓详情视图 产品列表
 pro 产品
 **/
view.reserve_pro = function(pro){
	$('#orderState').html(o_sate.shipping[orders[view.order_index].shipping_state]);
	$('#proList tbody').html('');
	var t_surplus = 0; //总公剩余入库产品数量
	var html = '';
	for( var i in pro ) {
		null == pro[i].bespeak_num && ( pro[i].bespeak_num = 0 );
		surplus = Number(pro[i].num)-Number(pro[i].in_num);
		t_surplus += surplus;
		html += '<tr data-id="'+pro[i].product_id+'" data-price="'+pro[i].price+'"><td>'+pro[i].product_sn+'/'+pro[i].mode+'/'+pro[i].brand_name+'/'+pro[i].cat_name+'/'+pro[i].pname+'/'+pro[i].attr+'</td><td>'+pro[i].num+'</td><td>'+surplus+'</td><td><input class="comm-input" name="num" value="'+pro[i].num+'"/></td></tr>';
		/*$('#proList tbody').append('<tr data-id="'+pro[i].product_id+'" data-price="'+pro[i].price+'"><td>'+pro[i].product_sn+'/'+pro[i].mode+'/'+pro[i].brand_name+'/'+pro[i].cat_name+'/'+pro[i].pname+'/'+pro[i].attr+'</td><td>'+pro[i].num+'</td><td>'+surplus+'</td><td><input class="comm-input" name="num" value="'+pro[i].bespeak_num+'"/></td></tr>');*/

	}
	$('#proList tbody').html(html);
	0 == t_surplus && $('#submitBox button[name=next]').attr('disabled',true);
	null !== reserve.note && $('#proList textarea[name=note]').val(reserve.note);

}
/**
 * 入库单详情
 **/
view.warehouse_in = function(info){
	warehouse_in = info.in;
	view.location = info.location;
	var name = '',val='';
	$('#inInfo th[name=warehouse_name]').html(warehouse_in.whname);
	$('#inInfo td[data-val=true]').each(function(index, element) {
		name = $(this).attr('name');
		val = eval('warehouse_in.'+name);
		switch( name ) {
			case 'state':
				val = o_sate.in_sate[Number(val)];
				break;
			case 'ctime':
				val = api.unixToDate(val);
				break;
			case 'check_statu':
				val = o_sate.check_statu[Number(val)];
				break;
		}
		$(this).html(val);
	});

	switch(Number(warehouse_in.in_type)){
		case 0: //采购入库
			$('#inType caption').html('采购入库');
			var sw = '';
			for(var i in info.inmode.cdb) {
				sw += ' '+info.inmode.cdb[i].real_name;
			}
			$('#inType tbody').html('<tr><th>供应商：</th><td>'+info.inmode.supply_name+'</td><th>采购单号：</th><td>'+info.inmode.order_sn+'</td></tr><tr><th>采购：</th><td>'+info.inmode.admin_name+'</td><th>商务：</th><td>'+sw+'</td></tr>');
			break;
		case 1: //调拔入库
			$('#inType caption').html('调拔入库');
			$('#inType tbody').html('<tr><th>调入仓：</th><td>'+warehouse_in.whname+'</td><th>调出单号：</th><td>'+warehouse_in.out_sn+'</td></tr><tr><th>调出仓：</th><td>'+info.inmode.whname+'</td><th>商务：</th><td>'+warehouse_in.cuname+'</td></tr><tr><th>商务备注：</th><td colspan="3">'+warehouse_in.w_note+'</td></tr>');
			break;
		case 2: //手工入库
			$('#inType caption').html('手工入库');
			$('#inType tbody').html('<tr><th>操作：</th><td>'+warehouse_in.cuname+'</td><th>备注：</th><td>'+warehouse_in.w_note+'</td></tr>');
			break;
		case 3: //退货入库
			$('#inType caption').html('退货入库');
			$('#inType tbody').html('<tr><th>用户：</th><td>'+info.inmode.company+'</td><th>订单单号：</th><td>'+info.inmode.order_sn+'</td></tr><tr><th>销售：</th><td>'+info.inmode.salename+'</td><th>商务：</th><td>'+info.inmode.business+'</td></tr><tr><th>备注：</th><td colspan="3">'+warehouse_in.note+'</td></tr>');
			break;
	}
	$('#inProducts tbody').html('');
	district = info.district;
	//w_shelves = info.shelves;
	district_opt = '<option value="0">库区</option>';
	var selected = '';
	for( var i in district ) {
		district_opt += '<option value="'+district[i].district_id+'"'+selected+'>'+district[i].district_name+'</option>';
	}
	for(var i in info.products) {
		$('#inProducts tbody').append('<tr data-num="'+info.products[i].bespeak_num+'"><td><input type="checkbox" name="product_id" value="'+info.products[i].product_id+'"/></td><td>'+info.products[i].product_sn+'/'+info.products[i].ser_simple_name+'</td><td>'+info.products[i].standard_code+'</td><td>'+info.products[i].mode+'/'+info.products[i].brand_name+'/'+info.products[i].cat_name+'/'+info.products[i].pname+'/'+info.products[i].attr+'</td><td>'+info.products[i].bespeak_num+'/'+info.products[i].price+'</td><td><input type="text" class="comm-input" size="3" value="'+info.products[i].check_num+'" name="check_num"/> / <input type="text" class="comm-input" size="3" value="'+info.products[i].defective_num+'" name="defective_num"/> <button class="comm-button" name="check_num" '+(0 < info.products[i].yuid ? 'disabled' : '')+'> 验收 </button></td><td><button class="comm-button" name="actual_num" '+(0 < info.products[i].ruid ? 'disabled' : '')+'> 入库 </button></td><td> <button class="comm-button" name="put_on"> 上架 </button> '+(0 < info.products[i].utime ? '<span class="f_blue">已上</span>' : '<span class="f_ash">未上</span>')+' </td></tr>');
	}
	$('select[name=district]').html(district_opt);
	$('putOnPanel button.comm-submit').prop('disabled',0 < warehouse_in.utime);

}

/**选择仓库库位**/
$('#putOnPanel tbody,#batchButton tbody').on('change','select',function(){
	var opts = '';
	act = '';
	if( 'location' == $(this).attr('name') ) { //上架
		return false;
	} else if( 'shelves' == $(this).attr('name') ) {
		var location_ojb = $(this).siblings('select[name=location]');
		location_ojb.find('option:gt(0)').remove();
		var district_id = $(this).siblings('select[name=district]').val();
		if( 0 < $(this).val() ) {
			api.ajax(view.warehousedistrict_nums,{'act':2,warehouse_id:warehouse_in.warehouse_id,district_id:district_id,shelves_id:$(this).val()},function(ret){
				for(var i in ret.list) {
					location_ojb.append('<option value="'+ret.list[i].nums_id+'">'+ret.list[i].num_name+'</option>');
				}
			});
		}
	} else {
		$(this).siblings('select').find('option:gt(0)').remove();
		var shelves = $(this).siblings('select[name=shelves]');
		if( '' !== $(this).val() ) {
			api.ajax(view.warehousedistrict_nums,{'act':1,warehouse_id:warehouse_in.warehouse_id,district_id:$(this).val()},function(ret){
				for(var i in ret.list) {
					shelves.append('<option value="'+ret.list[i].shelves_id+'">'+ret.list[i].shelves_name+'</option>');
				}
			});
		}
	}

});
/**验收**/
$('#inProducts tbody').on('click','button[name=check_num]',function(){
	var num = $.trim($(this).siblings('input[name=check_num]').val()),
			defective_num = $.trim($(this).siblings('input[name=defective_num]').val()),
			tr = $(this).parents('tr'),
			maxnum = tr.data('num'),
			product_id = tr.find('input[name=product_id]').val();

	/*if( !api.regParseInt(num) || num > maxnum ) {
		api.showPress({title:'验收数量必须在0-'+maxnum+'之间',duration:2000});
		return false;
	}*/
	api.ajax(view.check_num_url,{in_id:view.in_id,values:[{product_id:product_id,check_num:num,defective_num:defective_num}]});

});

/**批量 验收**/
$('#batchButton tbody button[name=check_num]').on('click',function(){
	var values = [];
	var _this = $(this),
			num = 0,
			defective_num = 0,
			maxnum = 0,
			allnum = 0;
	$('#inProducts tbody tr').each(function(index, element) {
		num = $.trim($('input[name=check_num]',this).val());
		defective_num = $.trim($('input[name=defective_num]',this).val()),
				maxnum = $(this).data('num');
		if( $('input[name=product_id]',this).prop('checked') && api.regParseInt(num) && num <= maxnum ){
			allnum += num;
			values .push({
				product_id:$('input[name=product_id]',this).val(),
				check_num:num,
				defective_num:defective_num
			});
		}
	});

	if( 0 == values.length ) {
		api.showPress({title:'没有验收数据',duration:2000});
		return false;
	}
	api.ajax(view.check_num_url,{in_id:view.in_id,values:values});

});

/** 验收 确认**/
$('#batchButton tbody button[name=check_ok]').on('click',function(){
	api.ajax(view.check_ok_url,{in_id:view.in_id},function(){
		$('#inProducts tbody button[name=check_num]').prop('disabled',true);
	});

});

/**入库**/
$('#inProducts tbody').on('click','button[name=actual_num]',function(){
	var _this = $(this);
	var product_id = $(this).parents('tr').find('input[name=product_id]').val();
	api.ajax(view.actual_num_url,{in_id:view.in_id,values:[{product_id:product_id}]},function(ret){
		_this.prop('disabled',true);
	});

});

/**批量 入库**/
$('#batchButton tbody button[name=actual_num]').on('click',function(){
	var values = [];
	$('#inProducts tbody tr').each(function(index, element) {
		if( $('input[name=product_id]',this).prop('checked') ){
			values .push({
				product_id:$('input[name=product_id]',this).val()
			});
		}
	});
	if( 0 == values.length ) {
		api.showPress({title:'没有入库数据',duration:2000});
		return false;
	}
	api.ajax(view.actual_num_url,{in_id:view.in_id,values:values},function(ret){
		$('#inProducts tbody button[name=actual_num]').prop('disabled',true);
	});

});
/**上架**/
$('#putOnPanel .close').on('click',function(){
	$('#putOnPanel').addClass('f-hide');
});
$('#inProducts tbody').on('click','button[name=put_on]',function(){
	var _tr = $(this).parents('tr:first');
	var allNumber = Number(_tr.find('input[name=check_num]').val());
	var defective_num = Number(_tr.find('input[name=defective_num]').val());
	var product_id = $(this).parent().siblings('td:eq(0)').find('input').val();
	if( 0 == allNumber ) {
		api.ajax(view.up_url,{in_id:view.in_id,in_no:1,values:[{product_id:product_id,nums_id:0,actual_num:0,price:0}]},function(ret){
			$('#putOnPanel').addClass('f-hide');
			$('#inProducts tbody input[name=product_id][value='+product_id+']').parents('tr:first').find('span.f_ash').html('已上').addClass('f_blue').removeClass('f_ash');
		});
	} else {
		$('#putOnPanel span.product_sn').html(_tr.find('td:eq(1)').html());
		$('#putOnPanel span.check_num').html(allNumber);
		$('#putOnPanel span.defective_num').html(defective_num);
		$('#putOnPanel span.price').html($('td:eq(4)',_tr).html() ? $('td:eq(4)',_tr).html().split('/')[1] : 0.00);
		var tr = $('#putOnPanel table tbody tr:eq(0)').clone();
		$('#putOnPanel input[name=product_id]').val(product_id);
		$('#putOnPanel table tbody').html('');
		tr.find('select[name=district]').html(district_opt);
		tr.find('select[name=shelves]').html('<option value="0">货架</option>');
		tr.find('select[name=location]').html('<option value="0">货位</option>');
		tr.find('input[name=actual_num]').attr('value',0);
		if( null !== view.location ) {
			var has = false;
			/**已经上架，查询上架信息**/
			var html = '';
			for( var i in view.location ) {
				if(  product_id == view.location[i].product_id ) {
					tr.attr('data-id',view.location[i].nums_id);
					tr.find('select[name=district] option[value="'+view.location[i].district_id+'"]').prop('selected',true);
					tr.find('select[name=district]').html('<option value="'+view.location[i].district_id+'" selected>'+view.location[i].district_name+'</option>');
					tr.find('select[name=shelves]').html('<option value="'+view.location[i].shelves_id+'" selected>'+view.location[i].shelves_name+'</option>');
					tr.find('select[name=location]').html('<option value="'+view.location[i].nums_id+'" selected>'+view.location[i].num_name+'</option>');
					//tr.find('a[name=remove]').remove();
					html += '<tr data-id="'+view.location[i].nums_id+'">'+tr.html()+'</tr>';
					has = true;
				}
				$('#putOnPanel table tbody').html(html);
			}
			if( has ) {
				$('#putOnPanel button.comm-submit').prop('disabled',true);
			} else {
				$('#putOnPanel table tbody').append(tr);
				$('#putOnPanel button.comm-submit').prop('disabled',false);
			}
		} else {
			$('#putOnPanel table tbody').append(tr);
			$('#putOnPanel button.comm-submit').prop('disabled',false);
		}
		$('#putOnPanel').removeClass('f-hide');
	}
});
$('#putOnPanel').on('click','a.comm-link',function(){
	if( !$('#putOnPanel button.comm-submit').prop('disabled') ) {
		switch( $(this).attr('name') ) {
			case 'remove':
				1 < $('#putOnPanel table tbody tr').length && $(this).parents('tr:first').remove();
				break;
			case 'add':
				var tr = $('#putOnPanel table tbody tr:eq(0)').clone();
				tr.find('input[name=actual_num]').val('');
				$('#putOnPanel table tbody').append(tr);
				break;
		}

	}
});
$('#putOnPanel button').on('click',function(){
	var product_id = $('#putOnPanel input[name=product_id]').val();
	var values = [];
	var total = 0;
	var price = $('#putOnPanel table thead span.price').html();
	$('#putOnPanel table tbody tr').each(function(index, element) {
		actual_num = parseInt($('input[name=actual_num]',this).val());
		if( !isNaN(actual_num) && 0 < actual_num && 0 < $('select[name=location]',$(this)).val() ) {
			values.push({
				product_id:product_id,
				nums_id:$('select[name=location]',$(this)).val(),
				actual_num:actual_num,
				price:price
			});
			total += actual_num;
		}
	});
	var mustNum = parseInt($('#putOnPanel span.check_num').html());
	isNaN(mustNum) && (mustNum = 0);
	if( total !== mustNum ) {
		api.showPress({title:'上架数量跟验收数量不匹配',duration:1500});
		return false;
	}
	api.ajax(view.up_url,{in_id:view.in_id,values:values},function(ret){
		$('#putOnPanel').addClass('f-hide');
		$('#inProducts tbody input[name=product_id][value='+product_id+']').parents('tr:first').find('span.f_ash').html('已上').addClass('f_blue').removeClass('f_ash');
		view.location=ret.location;
	});
	return false;
});
/*$('#inProducts tbody').on('change','select[name=location]',function(){
 var location = {
 district_id:$(this).siblings('select[name=district]').val(),
 shelves_id:$(this).siblings('select[name=shelves]').val(),
 shelves_num:$(this).val()
 };
 var logtest = '区：'+$(this).siblings('select[name=district]').find('option:selected').text()+'，位：'+$(this).siblings('select[name=shelves]').find('option:selected').text()+'，架：'+$(this).find('option:selected').text();
 if( 0 == location.district_id || 0 == location.shelves_id ||  0 == location.shelves_num) {
 return false;
 }
 api.ajax(view.up_url,{in_id:view.in_id,location:location,values:[{product_id:$(this).parents('tr').find('input[name=product_id]').val()}],logtest:logtest});
 return false;
 })*/;
/**批量 上架**/
$('#batchButton tbody button[name=pro_up]').on('click',function(){
	var values = [];
	var nums_id = $(this).siblings('select[name=location]').val();
	if( 0 == nums_id ) {
		api.showPress({title:'请选择货位',duration:1500});
		return false;
	}
	$('#inProducts tbody input[name=product_id]:checked').each(function(index, element) {
		values .push({
			product_id:$(this).val(),
			nums_id:nums_id,
			actual_num:$(this).parents('tr:first').find('input[name=check_num]').val()
		});

	});
	if( 0 == values.length ) {
		api.showPress({title:'请选择上架产品',duration:1500});
		return false;
	}
	api.ajax(view.up_url,{in_id:view.in_id,values:values},function(ret){
		$('#inProducts tbody input[name=product_id]:checked').each(function(index, element) {
			$(this).parents('tr:first').find('span.f_ash').html('已上').addClass('f_blue').removeClass('f_ash');
			$(this).prop('checked',false);
		});
		view.location=ret.location;
	});
});

/**打印验收单**/
$('#batchButton tbody button[name=print_check]').on('click',function(){
	if(0 == view.in_id) {
		return false;
	}
	api.ajax(view.print_check_url,{in_id:view.in_id},function(ret){
		$('#donwCheck').html('<a href="'+ret.file_name.substr(1)+'" target="_blank">下载验收单</a>');
	});
});

/**打印入库单**/
$('#batchButton tbody button[name=print_in]').on('click',function(){
	if(0 == view.in_id) {
		return false;
	}
	api.ajax(view.print_in_url,{in_id:view.in_id},function(ret){
		$('#downIn').html('<a href="'+ret.file_name.substr(1)+'" target="_blank">下载入库单</a>');
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
			$('#confirmProPlanList tbody').append('<tr><td><input type="checkbox" name="product_id" value="'+view.proList[i].product_id+'"/></td><td>'+view.proList[i].product_sn+'/'+view.proList[i].mode+'/'+view.proList[i].brand_name+'/'+view.proList[i].cat_name+'/'+view.proList[i].pname+'/'+view.proList[i].attr+'</td></tr>'),$(this).parents('tr').remove(),ok++;
		}
	});
	var msg = ok+'个货品添加成功';
	0 < err && ( msg += '，'+err+'个货品重复');
	0 < ok && $('select[name=ser_id]').attr('disabled',true);
	api.showPress({title:msg,duration:1500});
}

/**将商品->从商品确认表单中删除**/
function delProPlanList(){
	0 < $('#confirmProPlanList tbody input[name=product_id]:checked').length && ($('#confirmProPlanList thead input[name=chkAll]').prop('checked',false),$('select[name=ser_id]').attr('disabled',false));
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
			str += '<td><input type="text" class="comm-input" name="number" value="0"></td>';
			str += '<td><input type="hidden" class="comm-input" name="price" value="0.00"></td>';
			tbody.append(str);
		}
	});
	view.isSave = false;
	$('div[data-step=first]').css({'display':'none'});
	$('div[data-step=second]').css({'display':'block'});

}

/**入库单列表查询*/
view.warehouse_inList = function(pageNumber,pageSize,_this,ext){
	var values = {};
	values.warehouse_id = $('#warehouse_id').combobox('getValue');
	values.ser_id = $('#ser_id').combobox('getValue');
	values.in_sn = $('input[name=in_sn]',_this).val();
	values.state = $('select[name=state]',_this).val();
	values.check_statu = $('select[name=check_statu]',_this).val();
	values.utime = [];
	values.lastuser=$('input[name=lastuser]',_this).val();
	$('input[name="utime[]"]:checked',_this).each(function(index, element) {
		values.utime.push($(this).val());
	});
	values.page=pageNumber;
	values.len=pageSize;
	values.amount = [];
	$('input[name="amount[]"]',_this).each(function(index, element) {
		api.regFloat($.trim($(this).val())) && values.amount.push($.trim($(this).val()));
	});

	values.start_time = $('#start_time').datetimebox("getValue");
	values.end_time = $('#end_time').datetimebox("getValue");
	if(ext){
		values.type=ext;
	}
	api.ajax(view.search_url,values,function(ret){
		view.commonSuccess(ret);

	});
}

view.commonSuccess = function(result){
	var cur='';
	$('#pager').pagination({total:result.totalNum});
	var ret=result.data;
	for(var i in ret) {
		cur += ' <tr><td>' + (ret[i].simple_name||'') + '</td><td>' + ret[i].whname + '</td><td><a href="'+view.warehouse_in_url+'/in_id/'+ret[i].in_id+'"  target="_blank">'+ ret[i].in_sn + '</a></td><td>' +
				o_sate.in_type[ret[i].in_type] + '</td><td>' +
				ret[i].p_num+'/'+ret[i].amount + '</td><td>'+o_sate.in_sate[ret[i].state]+'</td><td>'+o_sate.check_statu[ret[i].check_statu]+'</td><td>' +
				(ret[i].user_name==null?'无':ret[i].user_name)+'/'+api.unixToDate(ret[i].ctime) + '</td><td>' +
				(ret[i].yname==null?'无':ret[i].yname)+'/'+(ret[i].ytime>0?api.unixToDate(ret[i].ytime)+'/'+api.secondToTime(ret[i].ytime-ret[i].ctime):'未执行') + '</td><td>' +
				(ret[i].rname==null?'无':ret[i].rname)+'/'+(ret[i].rtime>0?api.unixToDate(ret[i].rtime)+'/'+api.secondToTime(ret[i].rtime-ret[i].ytime):'未执行') + '</td><td>' +
				(ret[i].uname==null?'无':ret[i].uname)+'/'+(ret[i].utime>0?api.unixToDate(ret[i].utime)+'/'+api.secondToTime(ret[i].utime-ret[i].rtime):'未执行')+ '</td></tr>';
	}
	$('.yd_data').html(cur);
}
