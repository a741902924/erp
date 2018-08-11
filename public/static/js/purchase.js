var pageInfo = {ajaxUrl:[],planId:0,groupId:0,isSave:true,isAllowAddGroup:true,proList:[]};
/**pageInfo.isSave 是否已经暂存采购计划 或者 订单  pageInfo.isAllowAddGroup 是否允许暂存采购订单 **/
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
			$('#confirmProPlanList tbody').append('<tr class="loading" data-purchase_price="'+pageInfo.proList[i].purchase_price+'"><td><input type="checkbox" name="product_id" value="'+pageInfo.proList[i].product_id+'"/></td><td>'+pageInfo.proList[i].product_sn+'/'+pageInfo.proList[i].brand_name+'/'+pageInfo.proList[i].cat_name+'/'+pageInfo.proList[i].pname+'/'+pageInfo.proList[i].attr+'</td><td>loading...</td></tr>'),$(this).parents('tr').remove(),ok++;
			ids += ','+pageInfo.proList[i].product_id;
		}
	});
	var msg = ok+'个货品添加成功';
	0 < err && ( msg += '，'+err+'个货品重复');
	0 < ok && ( $('select[name=ser_id]').attr('disabled',true),$('select[name=supply_id]').attr('disabled',true) );
	api.showPress({title:msg,duration:1500});
	if( '' !== ids ){
		$.ajax({
			beforeSend:function(){  },
			url: pageInfo.ajaxUrl.history,// 跳转到 action
			type: 'post',
			cache: false,
			async: false, /*true异步执行，false*/
			data: {'ids':ids.substr(1)},
			dataType: 'json',
			success:function(ret) {
				if(0 < ret.list.length){
					for(var i=0;i<ret.list.length;i++){
						$('#confirmProPlanList tbody tr.loading').each(function(index) {
							if( Number($(this).find('input[name=product_id]').val()) == Number(ret.list[i].product_id) ){
								$(this).find('td:last').html(ret.list[i].supply_name+'/'+ret.list[i].num+'/'+api.unixToDate(ret.list[i].ctime));
								$(this).removeClass('loading');
								return;
							}
						});
					}
				}
				$('#confirmProPlanList tbody tr.loading').each(function(index) {
					$(this).find('td:last').html('没有历史信息');
					$(this).removeClass('loading');
				});
			},
			error : function(xmlHttpRequest, error) {
				
			}
		});
	}
	
}

/**将商品->从商品确认表单中删除**/
function delProPlanList(){
	0 < $('#confirmProPlanList tbody input[name=product_id]:checked').length && ($('#confirmProPlanList thead input[name=chkAll]').prop('checked',false),$('select[name=ser_id]').attr('disabled',false),$('select[name=supply_id]').attr('disabled',false));
	$('#confirmProPlanList tbody input[name=product_id]:checked').each(function(index, element) {
		$(this).parents('tr').remove();
	});
}

/*=======第二步========*/
/**确认以上商品进入采购计划**/
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
	
	$('#confirmProPlanList tbody tr').each(function(index, element) {
		str = '<tr data-id="'+$(this).find('input[name=product_id]').val()+'">';
		str += '<td>'+$(this).find('td:eq(1)').html()+'</td>';
		thead.find('th[data-name=warehouse]').each(function(index, element) {
			str += '<td><input type="text" name="num" value="0" size="8"></td>';
		});
		str += '<td><input type="text" name="price" value="'+$(this).data('purchase_price')+'" size="8"></td>';
		str += '<td>0/0</td>';
		tbody.append(str);
	});
	
	pageInfo.isSave = false;
	$('div[data-step=first]').css({'display':'none'});
	$('div[data-step=second]').css({'display':'block'});
	
}
/**暂存采购计划**/
function savePlan(_this){
	if( pageInfo.isSave ) {
		api.showPress({title:'采购计划未变更',duration:1500});
		return false;
	}
	var plan = {};
	plan.ser_id = Number($('select[name=ser_id]').val()),
	plan.supply_id = Number($('#fromBox select[name=supply_id]').val()), //供应商
	plan.pro_num = 0,  //总数量
	plan.pro_price = 0, //总价格
	plan.pro_cat = 0; //品种
	if( isNaN(plan.ser_id) ){
		api.showPress({title:'错误：请设置服务主体',duration:1500});
		return false;
	}
	if( isNaN(plan.supply_id) ){
		api.showPress({title:'错误：请设置供应商',duration:1500});
		return false;
	}
	var planPro = [],err = false;
	$('#proPlanList tbody tr').each(function(index) {
		var tr = $(this),
			price = Number(tr.find('input[name=price]').val());
		if( 0 <  price) {
			plan.pro_cat += 1;
			err = true; //预先设置为数据错误
			$('#proPlanList thead th[data-name=warehouse]').each(function(index1) {
				var num = Number(tr.find('input[name=num]').eq(index1).val());
				if( 0 < num ) {
					err = false; //当有产品数量的情况下，取消数据错误
					plan.pro_num += num,plan.pro_price += price*num;
					planPro.push({
						plan_id:pageInfo.planId,
						product_id:tr.data('id'),
						warehouse_id:$(this).data('id'),
						price:price,
						num:num
					});
				}
			});
		} else {
			err = true;
			return false;	
		}
	});
	if( err ) {
		api.showPress({title:'错误：采购数量或价格未填写',duration:1500});
		return false;	
	}
	$.ajax({
		beforeSend:function(){  api.showPress(); },
		url: pageInfo.ajaxUrl.save,// 跳转到 action
		type: 'post',
		cache: false,
		async: false, /*true异步执行，false*/
		data: {'id':pageInfo.planId,'plan':plan,'plan_pro':planPro},
		dataType: 'json',
		success:function(ret) {
			if(ret.state){
				pageInfo.planId = ret.id;
				$('#planForm button[type=submit]').attr('disabled',true);
				pageInfo.isSave = true;
				api.showPress({title:ret.msg,duration:1500});
			} else {
				api.showPress({title:'错误：'+ret.msg,duration:1500});
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
	return false;
}
/*=======第三步========*/
/*
提交 终止 审批采购计划
*/
function confirmPlan(_state){
	if( !pageInfo.isSave || 0 == Number(pageInfo.planId) ) {
		api.showPress({title:'请先暂存采购计划',duration:1500});
		return false;
	}
	var note = $.trim($('input[name="note"]').val());
	if( 5 == _state && '' == note ){
		api.showPress({title:'请填写原因',duration:1000});
		$('input[name="note"]').focus();
		return false;
	}
	
	$.ajax({
		beforeSend:function(){  api.showPress(); },
		url: pageInfo.ajaxUrl.checked,// 跳转到 action
		type: 'post',
		cache: false,
		async: false, /*true异步执行，false*/
		data: {'id':pageInfo.planId,'state':_state, 'note':note},
		dataType: 'json',
		success:function(ret) {
			if(ret.state){
				api.showPress({title:ret.msg,duration:1500,url:ret.url});
			} else {
				api.showPress({title:'错误：'+ret.msg,duration:1500});
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
	return false;	
}

var propage = api.page.init('#proPage');
propage.onSelectPage = function(page,size){
	getProList(page,size);
}
propage.onRefreshPage = function(page,size){
	getProList(page,size);
}

/**查询产品**/
function getProList(page,len){
	var values = {type:'',page:page,len:len};
	values.ser_id = Number($('#fromBox select[name=ser_id]').val()),
	values.supply_id = Number($('#fromBox select[name=supply_id]').val()),
	values.key = $('#fromBox input[name=key]').val();
	values.cat_id = $('#fromBox select[name=cat_id]').val();
	values.is_pack = 0; //只允许非打包商品
	$('tbody','table#proList').html('');
	api.ajax(pageInfo.ajaxUrl.prolist,values,function(ret){
		pageInfo.proList = ret.list;
		for(var i=0;i<ret.list.length;i++){
			$('tbody','table#proList').append('<tr><td><input type="checkbox" name="product_id" data-index="'+i+'" value="'+ret.list[i].product_id+'"/></td><td>'+ret.list[i].product_sn+'/'+ret.list[i].brand_name+'/'+ret.list[i].cat_name+'/'+ret.list[i].pname+'/'+ret.list[i].attr+'</td></tr>');
		}
		propage.setTotal(ret.total);
		$('input[name=chkAll][type=checkbox]').prop('checked',false);
	});
	return false;	
}

/*
暂存采购订单
创建一个订单组为仓库订单归类
每个仓库对应一个仓库订单
一次计划中，上一次在采购未完成、未终止、作废的清空下不允许暂存新的采购订单
*/
function saveOrder(){
	if( pageInfo.isSave ) {
		api.showPress({title:'采购订单未变更',duration:1500});
		return false;
	}
	if( !pageInfo.isAllowAddGroup ) {
		api.showPress({title:'不允许暂存，请先完成上次采购',duration:2000});
		return false;
	}
	var pay_type = $('#orderGroupTotal input[name=pay_type]').prop('checked') ? 1 : 0,
		prepaid = parseFloat($('#orderGroupTotal input[name=prepaid]').val()),
		dtime = $('#orderGroupTotal input[name=dtime]').val();
	isNaN(prepaid) && (prepaid = 0);
	if( 0 == pay_type && 0 == prepaid ) {
		api.showPress({title:'未填写预付款',duration:1500});
		return false;
	}
	//var supply_id = 0 < $('select[name=supply_id]').length ? Number($('select[name=supply_id]').val()) : 0;
	var supply_id = Number($('select[name=supply_id]').val())||0;
	if( 0 < $('select[name=supply_id]').length && 0 === supply_id ) {
		api.showPress({title:'请选择供应商',duration:1500});
		return false;
	}
	var supply_name = $('select[name=supply_id] option:selected').data('name');
	
	var orderGroup = {plan_id:pageInfo.planId,prepaid:prepaid,amount:0,freight:0,pay_type:pay_type,dtime:dtime},
		order = [];
	//按仓库找产品
	$('#proPlanOrder thead th[data-name=warehouse]').each(function(index1) {
		var pro_num = 0,pro_price = 0,orderPro = [];
		$('#proPlanOrder tbody tr').each(function(index) {
			var price = Number($(this).find('input[name=price]').val());
			var obj = $(this).find('input[name=num]').eq(index1),
				number = parseInt(obj.data('number')), //剩余量
				num = parseInt(obj.val()); //当前采
			if( 0 < price && 0 < num ) {
				err = false; //当有产品数量的情况下，取消数据错误
				pro_num += num,pro_price += price*num;
				orderPro.push({
					order_id:0,
					product_id:$(this).data('id'),
					price:price,
					num:num
				});
			}
		});
		if( 0 < orderPro.length ){
			var freight = parseFloat($('#proPlanOrder tfoot tr input[name=freight]').eq(index1).val())
			orderGroup.amount += pro_price;
			orderGroup.freight += freight;
			order.push({
				group_id:pageInfo.groupId,
				warehouse_id:$(this).data('id'),
				supply_id:supply_id,
				supply_name:supply_name,
				pro_cat:orderPro.length,
				pro_num:pro_num,
				pro_price:pro_price,
				freight:freight,
				order_pro:orderPro
			});	
		}
	});
	if( 0 == order.length ){
		api.showPress({title:'采购货品设置存在问题',duration:1000});
		return false;
	}
	
	$.ajax({
		beforeSend:function(){  api.showPress(); },
		url: pageInfo.ajaxUrl.save,// 跳转到 action
		type: 'post',
		cache: false,
		async: false, /*true异步执行，false*/
		data: {'id':pageInfo.groupId,supply_id:supply_id,'group':orderGroup,'order':order},
		dataType: 'json',
		success:function(ret) {
			if(ret.state){
				pageInfo.groupId = ret.id;
				pageInfo.isSave = true;
				var msgJson = {title:ret.msg,duration:1500};
				ret.url && ( msgJson.url = ret.url );
				api.showPress(msgJson);
			} else {
				api.showPress({title:'错误：'+ret.msg,duration:1500});
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
	return false;
}
/*
提交采购订单
*/
function confirmOrder(){
	if( !pageInfo.isSave || 0 == Number(pageInfo.groupId) ) {
		api.showPress({title:'请先暂存采购订单',duration:1500});
		return false;
	}
	var supply_id = 0 < $('select[name=supply_id]').length ? Number($('select[name=supply_id]').val()) : 0;
	$.ajax({
		beforeSend:function(){  api.showPress(); },
		url: pageInfo.ajaxUrl.submit,//跳转到 action
		type: 'post',
		cache: false,
		async: false, /*true异步执行，false*/
		data: {'id':pageInfo.groupId,supply_id:supply_id},
		dataType: 'json',
		success:function(ret) {
			if(ret.state){
				$('#orderGroupTotal button[type=submit]').attr('disabled',true);
				pageInfo.isSave = true;
				var msgJson = {title:ret.msg,duration:1500};
				ret.url && ( msgJson.url = ret.url );
				api.showPress(msgJson);
			} else {
				api.showPress({title:'错误：'+ret.msg,duration:1500});
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
/**审批采购订单**/
function confirmProcess(_state,_id){
	var note = $.trim($('input[name="note"]').val());
	if( 5 == _state && '' == note ){
		api.showPress({title:'请填写原因',duration:1000});
		$('input[name="note"]').focus();
		return false;
	}
	$.ajax({
		beforeSend:function(){  api.showPress(); },
		url: pageInfo.ajaxUrl.checked,// 跳转到 action
		type: 'post',
		cache: false,
		async: false, /*true异步执行，false*/
		data: {'id':_id,'state':_state, 'note':note},
		dataType: 'json',
		success:function(ret) {
			if(ret.state){
				api.showPress({title:ret.msg,duration:1500,url:ret.url});
			} else {
				api.showPress({title:'错误：'+ret.msg,duration:1500});
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
	return false;	
}

/*计算订单总价*/
function countOrderTotal(){
	var proAmount = 0,totalFreight = 0;
	$('#proPlanOrder tbody tr').each(function(index) {
		proAmount += Number($(this).find('td:last').html().split('/')[1]);
	});
	$('#proPlanOrder tfoot input[name=freight]').each(function(index) {
		totalFreight += Number($(this).val());
	});
	$('#orderGroupTotal #amount').html((proAmount+totalFreight).toFixed(2));
	$('#orderGroupTotal #proAmount').html(proAmount.toFixed(2));
	$('#orderGroupTotal #totalFreight').html(totalFreight.toFixed(2));
}

$(document).ready(function() {
	$('input[name=chkAll][type=checkbox]').on('click',function(){
		$(this).parents('table').find('tbody input[type="checkbox"]').prop('checked',$(this).prop('checked'));
	});
	$('table#proList tbody,table#confirmProPlanList tbody').delegate('input[type=checkbox]','click',function(){
		var table = $(this).parents('table');
		var flag = table.find('tbody input[type="checkbox"]:checked').length == table.find('tbody input[type="checkbox"]').length;
		table.find('thead input[name=chkAll][type="checkbox"]').prop('checked',flag);
	});
	$('table#proPlanList tbody').on('blur','input',function(){
		var _this = $(this),
			tr = _this.parents('tr'),
			pro_num = 0,
			pro_price = 0,
			price = Number(tr.find('input[name=price]').val()),
			product_id = tr.data('id'),
			pro_max = _this.data('sy');
			isNaN(price) && (price = 0);
			
		if( undefined == pro_max ) {
			api.ajax(pageInfo.ajaxUrl.warning,{product_id:product_id},function(ret){
				if( ret.list ) {
					tr.data('max');
					$('#proPlanList thead th[data-name=warehouse]').each(function(index1) {
						var num = parseInt(tr.find('input[name=num]').eq(index1).val()),
							wh_id = $(this).data('id');
						isNaN(num) && (num = 0);	
						for(var i in ret.list ) {
							if( ret.list[i].warehouse_id == wh_id ) {
								tr.find('input[name=num]').eq(index1).attr('data-sy',ret.list[i].sy);
								if( num > ret.list[i].sy ) {
									tr.find('input[name=num]').eq(index1).addClass('f_red');
								} else {
									tr.find('input[name=num]').eq(index1).removeClass('f_red');	
								}
							}
						}
					});
				}
				
			},false,true);
		} else {
			if( _this.val() > pro_max ) {
				_this.addClass('f_red');
			} else {
				_this.removeClass('f_red');	
			}
		}
		
		$('#proPlanList thead th[data-name=warehouse]').each(function(index1) {
			var num = parseInt(tr.find('input[name=num]').eq(index1).val());
			isNaN(num) && (num = 0);
			pro_num += num;
			pro_price += price*num;
		});
	
		var oldValue = tr.find('td:last').html(),
			newValue = pro_num+'/'+ pro_price.toFixed(2);
		tr.find('td:last').html(pro_num+'/'+ pro_price.toFixed(2));
		var amount = 0;
		$('#proPlanList tbody tr').each(function(){
			key = $(this).find('td:last').html();
			if(  -1 < key.indexOf('/') ) {
				amount += Number(key.split('/')[1]);
			}
		});
		$('#amount').html( amount.toFixed(2) );
		oldValue !== newValue && ( pageInfo.isSave = false,$('#planForm button[type=submit]').attr('disabled',false) );
		
	});
	$('select[name=ser_id]').on('change',function(){
		$('tbody','table#proList').html('');
	});
	$('table#proPlanOrder tbody').delegate('input','blur',function(){
		if( undefined !== $(this).data('number') && $(this).data('number') < $(this).val() ) {
			$(this).val($(this).data('number'));
		}
		var tr = $(this).parents('tr'),
			pro_num = 0,
			pro_price = 0,
			price = Number(tr.find('input[name=price]').val());
		if( 0 <  price) {
			$('#proPlanOrder thead th[data-name=warehouse]').each(function(index1) {
				var num = parseInt(tr.find('input[name=num]').eq(index1).val());
				if( 0 < num ) {
					pro_num += num,pro_price += price*num;
				}
			});
		}
		var oldValue = tr.find('td:last').html(),
			newValue = pro_num+'/'+ pro_price.toFixed(2);
		tr.find('td:last').html(pro_num+'/'+ pro_price.toFixed(2));
		oldValue !== newValue && ( pageInfo.isSave = false,$('#orderGroupTotal button[type=submit]').attr('disabled',false) );
		countOrderTotal();
	});
	$('#proPlanOrder tfoot input[name=freight]').on('blur',function(){
		$(this).val() !== $(this).data('value') && ( pageInfo.isSave = false );
		countOrderTotal();
	});
	$('#orderGroupTotal input[name=pay_type]').on('click',function(){
		pageInfo.isSave = false;
		$(this).prop('checked') ? ($('#orderGroupTotal input[name=prepaid]').attr('disabled',true),$('#orderGroupTotal input[name=prepaid]').val(0)) : $('#orderGroupTotal input[name=prepaid]').attr('disabled',false);
	});
	$('#orderGroupTotal input[type=date],#orderGroupTotal input[type=text],select[name=supply_id]').on('change',function(){
		pageInfo.isSave = false;
	});

});