/***
* 仓库JS
view * 页面视图对象
* warehouse 当前仓库 
***/
var view = {pageSize:10};
var warehouse = {}; //仓库
var district = []; //库区
var shelves = []; //库位
var products = [];

/*
* 库区库位列表 选择仓库
*/
view.changeWarehouse = function(sel){
	warehouse = sel;
	view.warehouse_id = sel.warehouse_id;
	view.ser_id = $('#ser_id').val();
	api.ajax(view.warehouse_url,{warehouse_id:view.warehouse_id,ser_id:view.ser_id,orderby:view.orderby,page:1,len:view.pageSize},function(ret){
		console.log(ret);
		district = ret.info.district;
		shelves = ret.info.shelves;
		products = ret.info.products;
		var district_str = '<option value="0"> 库区 </option>';
		if( district ) {
			for( var i in district ) {
				district_str += '<option value="'+district[i].district_id+'">'+district[i].district_name+'</option>';
			}
		}
		$('select[name=district]').html(district_str);
		$('#shelves_id').html('<option value="0"> 货架 </option>');
		$('#location_id').html('<option value="0"> 货位 </option>');
		$('#pager').pagination({total:ret.total}); //重置总数据量
		view.setLists(products);
	});
}
view.shearch = function(where,page,len){
	$('#pager').pagination({pageNumber:page});
	view.warehouse_id = $('#warehouse_id').val();
	if( 0 == view.warehouse_id ) {
		api.showPress({title:'请选这仓库',duration:1500});
		return false;	
	}
	if( '' == where ){
		view.ser_id = $('#ser_id').val();
		where = {};
		where.ser_id = view.ser_id;
		where.district_id = $('#district_id').val();
		where.shelves_id = $('#shelves_id').val();
		where.location_id = $('#location_id').val();
		where.product_sn = $.trim($('#searchBox input[name=product_sn]').val());
		where.key = $.trim($('#searchBox input[name=key]').val());
		where.is_on_sale = [];
		$('#searchBox input[name="is_on_sale[]"]:checked').each(function(index, element) {
			where.is_on_sale.push($(this).val());
		});
		where.age_start = $.trim($('#searchBox input[name=age_start]').val());
		where.age_end = $.trim($('#searchBox input[name=age_end]').val());
	}
	
	api.ajax(view.search_url,{warehouse_id:view.warehouse_id,values:where,orderby:view.orderby,page:page,len:view.pageSize},function(ret){
		products = ret.info.products;
		view.setLists(products);
		$('#pager').pagination({total:ret.total}); //重置总数据量
	});	
}
/*
*库区库位列表 视图
*/
view.setLists = function(pro){
	var str = '';
	$('#productList tbody').empty();
	$('#productList input[type=checkbox]').prop('checked',false);
	var district_opt = '<option value="0">库区</option>';
	for( var i in district ) {
		district_opt += '<option value="'+district[i].district_id+'">'+district[i].district_name+'</option>';
	}
	for(i in pro) {
		str = '<tr><td><input type="checkbox" name="id" value="'+pro[i].lo_id+'" data-ser="'+pro[i].ser_id+'"/></td><td>'+warehouse.whname+'</td><td data-name="location">'+pro[i].district_name+'/'+pro[i].shelves_name+'/'+pro[i].num_name+'</td><td><select name="district" class="comm-select">'+district_opt+'</select><select name="shelves" class="comm-select"><option value="0" data-num="0">货架</option></select><select name="location" class="comm-select"><option value="0">货位</option></select></td><td data-name="p_sn">'+pro[i].product_sn+'/'+pro[i].ser_simple_name+'/'+api.unixToDate(pro[i].ctime)+'</td><td data-name="p_name">'+pro[i].brand_name+'/'+pro[i].mode+'/'+pro[i].cat_name+'/'+pro[i].attr+'</td><td>'+(1 == pro[i].is_on_sale ? '上架' : '下架')+'/'+(0 < pro[i].on_sale_time ? api.unixToDate(pro[i].on_sale_time) : '无')+'</td><td>'+pro[i].max_number+'/'+pro[i].min_number+'</td><td data-name="p_num">'+pro[i].actual_num+'/'+pro[i].price+'</td><td data-name="p_age">'+api.secondToTime(pro[i].age)+'</td><td>'+pro[i].lastuname+'/'+(0 < pro[i].lasttime ? api.unixToDate(pro[i].lasttime) : '')+'</td></tr>';
		$('#productList tbody').append(str);
	}
}
/**选择仓库库位**/
$('#productList,#searchBox').on('change','select',function(){
	var opts = '';
	act = '';
	if( 'location' == $(this).attr('name') ) { //上架
		if( 0 == $(this).val() ) { return false;}
		if( undefined == $(this).attr('id') ) {
			var tr = $(this).parents('tr:first'),
				_post = {
					ids:[tr.find('input[name=id]').val()],
					nums_id:$(this).val()
				};
			api.ajax(view.move_url,_post,function(ret){
				tr.find('td[data-name=location]').html(ret.location);
			});
		}
		return false;
	} else if( 'shelves' == $(this).attr('name') ) {
		var location_ojb = $(this).siblings('select[name=location]');
		location_ojb.find('option:gt(0)').remove();
		var district_id = $(this).siblings('select[name=district]').val();
		if( 0 < $(this).val() ) {
			api.ajax(view.warehousedistrict_nums,{'act':2,warehouse_id:view.warehouse_id,district_id:district_id,shelves_id:$(this).val()},function(ret){
				for(var i in ret.list) {
					location_ojb.append('<option value="'+ret.list[i].nums_id+'">'+ret.list[i].num_name+'</option>');
				}
			});
		}
	} else {
		$(this).siblings('select').find('option:gt(0)').remove();
		var shelves = $(this).siblings('select[name=shelves]');
		if( '' !== $(this).val() ) {
			api.ajax(view.warehousedistrict_nums,{'act':1,warehouse_id:view.warehouse_id,district_id:$(this).val()},function(ret){
				for(var i in ret.list) {
					shelves.append('<option value="'+ret.list[i].shelves_id+'">'+ret.list[i].shelves_name+'</option>');
				}
			});
		}
	}
	return false;
});
/*
*批量移库
*/
$('#productList tfoot button[name=pro_move]').on('click',function(){
	var _post = {
		ids:[],
		nums_id:$('#location_id1').val()
	};

	var values = [];
	var ids = [];
	$('#productList input[name=id]:checked').each(function(index) {
		_post.ids.push( $(this).val() );
		values.push({in_id:ids[0],product_id:ids[1]});
	});
	if( 0 == _post.ids.length ) {
		api.showPress({title:'未选择要移库的货品',duration:1000});
		return false;	
	}

	if( 0 == _post.nums_id ) {
		api.showPress({title:'未选要移库的位置',duration:1000});
		return false;	
	}
	api.ajax(view.move_url,_post,function(ret){
		$('#productList tbody input[name=id]:checked').each(function(index) {
			$(this).parents('tr:first').find('td[data-name=location]').html(ret.location);
		});
	});
});

/*
*批量打印移库单
*/
$('#productList tfoot button[name=print_move]').on('click',function(){
	var log_ids = [];
	$('#productList input[name=id]:checked').each(function(index) {
		log_ids.push($(this).val());
	});
	if( 0 == log_ids.length ) {
		api.showPress({title:'未选择要打印的货品',duration:1000});
		return false;	
	}
	api.ajax(view.move_print_url,{log_ids:log_ids},function(ret){
		window.open('/'+ret.file_name);
	});	
});
/*
* 库区库位列表
* 选择商品加入盘点表
**/
$('#productList tfoot button[name=add_inventory]').on('click',function(){
	var ids = '',has = false,tr = null,ser_id=0;
	$('#productList input[name=id]:checked').each(function(index) {
		tr = $(this).parents('tr');
		ser_id = $(this).data('ser');
		ids = $(this).val();
		has = false;
		$('#inventoryProductList tbody tr').each(function() {
			if( ids == $(this).data('id') ) {
				has = true;	
			}
		});
		if( !has ) {
			$('#inventoryProductList tbody').append('<tr data-id="'+ids+'" data-ser="'+ser_id+'"><td data-name="location">'+tr.find('td[data-name=location]').html()+'</td><td data-name="p_sn">'+tr.find('td[data-name=p_sn]').html()+'</td><td data-name="p_name">'+tr.find('td[data-name=p_name]').html()+'</td><td data-name="p_num">'+tr.find('td[data-name=p_num]').html()+'</td><td data-name="p_age">'+tr.find('td[data-name=p_age]').html()+'</td><td><a class="comm-link" onClick="view.delTr(this);">移除</a></td></tr>');	
		}
	});
});
/*
*库存商品列表
*选择商品加入盘点表
**/
$('#productList tfoot button[name=add_inventory_pro]').on('click',function(){
	var ids = '',tr = null,ntr = null,ser_id=0;
	$('#productList input[name=stock_id]:checked').each(function(index) {
		tr = $(this).parents('tr');
		ser_id = $(this).data('ser');
		tr.next().find('table tbody input[name=id]').each(function(index, element) {
			ntr = $(this).parents('tr');
			ids = $(this).val();
			if( 0 == $('#inventoryProductList tbody tr[data-id="'+ids+'"]').length ) {
				$('#inventoryProductList tbody').append('<tr data-id="'+ids+'" data-ser="'+ser_id+'"><td data-name="location">'+ntr.find('td[data-name=location]').html()+'</td><td data-name="p_sn">'+tr.find('td[data-name=p_sn]').html()+'</td><td data-name="p_name">'+tr.find('td[data-name=p_name]').html()+'</td><td data-name="p_num">'+ntr.find('td[data-name=p_num]').html()+'</td><td data-name="p_age">'+ntr.find('td[data-name=p_age]').html()+'</td><td><a class="comm-link" onClick="view.delTr(this);">移除</a></td></tr>');
			}
		});
		
	});
});

/*生成盘点表*/
$('#inventoryProductList tfoot button[name=save_inventory]').on('click',function(){
	var values = [];
	var ids = [];
	$('#inventoryProductList tbody tr').each(function() {
		values.push({lo_id:$(this).data('id')});
	});
	if( 0 == values.length ) {
		api.showPress({title:'没有可盘点的货品',duration:1000});
		return false;
	}
	api.confirm({title:'提醒',msg: '确认要生成盘点表吗？'},function(btn){
		if( 1 == btn.buttonIndex ) {
			api.ajax(view.inventory_ad_url,{values:values,warehouse_id:view.warehouse_id},function(ret){
				$('#inventoryProductList tbody').html('');
			});
		}
	});
});
/*生成盈亏表*/
$('#inventoryProductList tfoot button[name=save_profit_loss]').on('click',function(){
	var values = [];
	var ids = [];
	var hasErr = false,ser_id = 0;
	$('#inventoryProductList tbody tr').each(function() {
		if( 0 == ser_id ) {
			ser_id = $(this).data('ser');	
		} else {
			if( ser_id !== $(this).data('ser') ) {
				hasErr = '存在不同主体的产品，不允许操作';
				return false;	
			}
		}
		values.push({lo_id:$(this).data('id')});
	});
	if( 0 == values.length ) {
		api.showPress({title:'没有可盘点的货品',duration:1000});
		return false;
	}
	if( hasErr ) {
		api.showPress({title:hasErr,duration:1000});
		return false;
	}
	api.confirm({title:'提醒',msg: '确认要生成盈亏表吗？'},function(btn){
		if( 1 == btn.buttonIndex ) {
			api.ajax(view.profitloss_ad_url,{values:values,ser_id:ser_id,warehouse_id:view.warehouse_id},function(ret){
				$('#inventoryProductList tbody').html('');
			});
		}
	});
});

//删除表格
view.delTr = function(_this){
	$(_this).parents('tr').remove();
}
//商品库存列表

/*
* 库区库位列表 选择仓库
*/
view.changeWarehouseStock = function(sel){
	warehouse = sel;
	view.warehouse_id = sel.warehouse_id;
	view.ser_id = $('#ser_id').val();
	api.ajax(view.warehouse_url,{warehouse_id:view.warehouse_id,ser_id:view.ser_id,orderby:view.orderby,page:1,len:view.pageSize},function(ret){
		district = ret.info.district;
		//shelves = ret.info.shelves;
		products = ret.info.products;
		if( district ) {
			var combData = district;
			combData.splice(0,0,{district_id:0,district_name:'库区'});
		} else {
			combData = [{district_id:0,district_name:'库区'}];
		}
		$('#pager').pagination({total:ret.total}); //重置总数据量
		view.setListsStock(products);
	});
}
view.shearchStock = function(where,page,len){
	$('#pager').pagination({pageNumber:page});
	view.warehouse_id = $('#warehouse_id').val();
	if( 0 == view.warehouse_id ) {
		api.showPress({title:'请选这仓库',duration:1500});
		return false;	
	}
	if( '' == where ){
		where = {};
		where.ser_id = $('#ser_id').val();
		where.product_sn = $.trim($('#searchBox input[name=product_sn]').val());
		where.is_on_sale = [];
		where.key = $.trim($('#searchBox input[name=key]').val());
		$('#searchBox input[name="is_on_sale[]"]:checked').each(function(index, element) {
			where.is_on_sale.push($(this).val());
		});
	}
	api.ajax(view.search_url,{warehouse_id:view.warehouse_id,values:where,orderby:view.orderby,page:page,len:view.pageSize},function(ret){
		products = ret.info.products;
		view.setListsStock(products);
		$('#pager').pagination({total:ret.total}); //重置总数据量
	});	
}

/*
*商品库存列表 视图
*/
view.setListsStock = function(stock){
	var str = '';
	$('#productList tbody').empty();
	$('#productList input[type=checkbox]').prop('checked',false);
	var district_opt = '';
	for( var i in district ) {
		district_opt += '<option value="'+district[i].district_id+'">'+district[i].district_name+'</option>';
	}
	var pro = null,color = null;
	for(j in stock) {
		color = Number(stock[j].min_number) >= Number(stock[j].product_number) ? ' class="f_red" title="已到下限'+stock[j].min_number+'"' : ( Number(stock[j].max_number) <= Number(stock[j].product_number) ? ' class="f_blue" title="已到上限'+stock[j].max_number+'"' : '');
		str = '<tr class="stock"><td><input type="checkbox" name="stock_id" value="'+stock[j].product_id+'" data-ser="'+stock[j].ser_id+'"/></td><td>'+stock[j].whname+'</td><td data-name="p_sn">'+stock[j].product_sn+'/'+stock[j].ser_simple_name+'/'+api.unixToDate(stock[j].ctime)+'</td><td data-name="p_name">'+stock[j].brand_name+'/'+stock[j].mode+'/'+stock[j].cat_name+'/'+stock[j].attr+'</td><td>'+(1 == stock[j].is_on_sale ? '上架' : '下架')+'/'+(0 < stock[j].on_sale_time ? api.unixToDate(stock[j].on_sale_time) : '无')+'</td><td>'+stock[j].max_number+'/'+stock[j].min_number+'</td><td><span'+color+'>'+stock[j].product_number+'</span>/'+stock[j].purchase_price+'</td><td>'+stock[j].lastuname+'/'+(0 < stock[j].lasttime ? api.unixToDate(stock[j].lasttime) : '')+'</td></tr>';
		pro = stock[j]['location'];
		str += '<tr class="'+(0 < j ? 'close' : 'open')+'"><td colspan="8"><table class="yd_table_list" data-hover="false" cellpadding="1" cellspacing="1"><thead align="center"><tr><td width="30"><input type="checkbox" name="chkAllSub"/></td><td>库区货架货位</td><td>移库操作</td><td>数量/金额</td><td>库龄</td><td>首次上架操作人/时间</td><td>最后操作人/时间</td></tr></thead><tbody align="center">';
		for(var i in pro) {
			str += '<tr><td><input type="checkbox" name="id" value="'+pro[i].lo_id+'"/></td><td data-name="location">'+pro[i].district_name+'/'+pro[i].shelves_name+'/'+pro[i].num_name+'</td><td><select name="district" class="comm-select">'+district_opt+'</select><select name="shelves" class="comm-select"><option value="0" data-num="0">货架</option></select><select name="location" class="comm-select"><option value="0">货位</option></select></td><td data-name="p_num">'+pro[i].actual_num+'/'+pro[i].price+'</td><td data-name="p_age">'+api.secondToTime(pro[i].age)+'</td><td>'+pro[i].uname+'/'+api.unixToDate(pro[i].ctime)+'</td><td>'+pro[i].lastuname+'/'+(0 < pro[i].lasttime ? api.unixToDate(pro[i].lasttime) : '')+'</td></tr>';
		}
		str += '</tbody></table></td></tr>';
		$('#productList tbody:eq(0)').append(str);
	}
	$('select#district_id1').html(district_opt);
}