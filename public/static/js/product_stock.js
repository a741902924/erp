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
		products = ret.info.products;
		$('#packageProductList tbody').html('');
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
		$('#searchBox input[name="is_on_sale[]"]:checked').each(function() {
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
		str = '<tr class="stock"><td><input type="checkbox" name="stock_id" value="'+stock[j].product_id+'" data-index="'+j+'" data-ser="'+stock[j].ser_id+'"/></td><td>'+stock[j].whname+'</td><td data-name="p_sn">'+stock[j].product_sn+'/'+stock[j].ser_simple_name+'/'+api.unixToDate(stock[j].ctime)+'</td><td data-name="p_name">'+stock[j].brand_name+'/'+stock[j].mode+'/'+stock[j].cat_name+'/'+stock[j].attr+'</td><td>'+(1 == stock[j].is_on_sale ? '上架' : '下架')+'/'+(0 < stock[j].on_sale_time ? api.unixToDate(stock[j].on_sale_time) : '无')+'</td><td>'+stock[j].max_number+'/'+stock[j].min_number+'</td><td><span'+color+'>'+(stock[j].product_number-stock[j].lock_actual)+'</span>/'+stock[j].purchase_price+'</td><td></td></tr>';
		pro = stock[j]['location'];
		str += '<tr class="'+(0 < j ? 'close' : 'open')+'"><td colspan="8"><table class="yd_table_list" data-hover="false" cellpadding="1" cellspacing="1"><thead align="center"><tr><td>可用数量/金额</td><td>库龄</td><td>首次上架操作人/时间</td><td></td></tr></thead><tbody align="center">';
		for(var i in pro) {
			str += '<tr><td data-name="p_num">'+pro[i].available_num+'/'+pro[i].price+'</td><td data-name="p_age">'+api.secondToTime(pro[i].age)+'</td><td>'+pro[i].uname+'/'+api.unixToDate(pro[i].ctime,true)+'</td><td><a class="comm-link" onclick="view.splitPro(this,\''+stock[j].product_sn+'/'+stock[j].pname+'\','+pro[i].lo_id+','+stock[j].pcs+',\''+stock[j].unit_name+'\','+pro[i].available_num+','+stock[j].ser_id+')"> 拆 分 </a></td></tr>';
		}
		str += '</tbody></table></td></tr>';
		$('#productList tbody:eq(0)').append(str);
	}
}

$('.panel-mask a.close').on('click',function(){
	$(this).parents('.panel-mask:first').addClass('f-hide');
});

/*
 * 库区库位列表
 * 选择商品加
 **/
$('#productList tfoot button[name=addProduct]').on('click',function(){
	var ser_id = 0 === $('#packageProductList tbody tr').length ? 0 : $('#packageProductList tbody tr:eq(0)').date('ser');
	$('#productList input[name=stock_id]:checked').each(function() {
		var tr = $(this).parents('tr:first');
		var index = $(this).data('index');
		if( 0 === ser_id  ) {
			ser_id = $(this).data('ser')
		} else if( ser_id !== $(this).data('ser') ) {
			api.showPress({title:'存在不同供应商的商品',duration:1000});
			return false;
		}
		if( 0 === $('#packageProductList tbody tr[data-id='+$(this).val()+']').length ) {
			var num = products[index].product_number-products[index].lock_actual;
			$('#packageProductList tbody').append('<tr data-id="'+$(this).val()+'" data-ser="'+$(this).data('ser')+'"><td data-name="p_sn">'+tr.find('td[data-name=p_sn]').html()+'</td><td data-name="p_name">'+tr.find('td[data-name=p_name]').html()+'</td><td data-name="p_num">'+num+' <input type="number" value="1" name="radix" class="comm-input" min="1" max="'+num+'"/> </td><td><a class="comm-link" onClick="view.delTr(this);">移除</a></td></tr>');
		}
	});
});
var packageValues = null;
/*打包*/
$('#packageProductList tfoot button[name=package]').on('click',function(){
	packageValues = [];
	var max_package = 0;
	$('#packageProductList tbody tr').each(function() {
		var number = parseInt($('td[data-name=p_num]',this).text())||0,
			radix = parseInt($('input[name=radix]',this).val())||0;
		if( 0 < radix && radix <= number ) {
			var max = Math.floor(number / radix );
			( 0 === max_package || max < max_package ) && ( max_package = max );
			packageValues.push({product_id:$(this).data('id'),radix:radix});
		}
	});
	if( 2 > packageValues.length ) {
		api.showPress({title:'打包的商品数量不能小于2件',duration:1000});
		return false;
	}
	$('#packagePanel span.goods_num').html(packageValues.length);
	$('#packagePanel span.max_num').html(max_package);
	$('#packagePanel').removeClass('f-hide');
});
$('#packagePanel form').submit(function(){
	var values = decodeURIComponent($(this).serialize(),true);
	values = api.formToJson(values);
	values = $.parseJSON(values);
	values.warehouse_id = view.warehouse_id;
	values.package = packageValues;
	var maxPackage = parseInt($('span.max_num').html()) || 1;
	if( values.number > maxPackage ) {
		api.showPress({title:'最大打包数量为：'+maxPackage,duration:1000  });
		return false;
	}
	api.ajax($(this).attr('action'),values,function(r){
		if( r.isNew ) {
			$('#packagePanel .panel-pop').html('<a href="/Plugin/Goods/upGoodsInfo/skuID/'+r.data+'"> 去完善资料 </a>');
		} else {
			api.showPress({title:'打包成功，准备重置页面',duration:1500,url:window.location.href});
		}
	});
	return false;
});
/*拆分
 *_this
 *pro 产品名称，lo_id 位置ID，pcs 一箱多少，unit_name 单位，split_number 库存  */
view.splitPro = function(_this,pro,lo_id,pcs,unit_name,split_number,ser_id){
	$('#splitPanel span[data-name=pcs]').html('一'+unit_name+'='+pcs);
	$('#splitPanel span[data-name=product]').html(pro);
	$('#splitPanel span[data-name=stock]').html('当前库存：'+split_number);
	document.getElementById('form-pop-split').reset();
	$('#splitPanel input[name=lo_id]').val(lo_id);
	$('#splitPanel input[name=split_number]').attr('max',split_number).attr('data-pcs',pcs);
	$('#splitPanel input[name=number]').val(1*pcs);
	$('#splitPanel').removeClass('f-hide');
}
$('#splitPanel input[name=split_number]').on('blur',function(){
	var value = parseInt($(this).val());
	value > $(this).attr('max') && $(this).val($(this).attr('max'));
	value < 1 && $(this).val(1);
	$('#splitPanel input[name=number]').val($(this).val()*$(this).attr('data-pcs'));
});
$('#splitPanel form').submit(function(){
	var values = decodeURIComponent($(this).serialize(),true);
	values = api.formToJson(values);
	values = $.parseJSON(values);
	values.warehouse_id = view.warehouse_id;
	api.ajax($(this).attr('action'),values,function(r){
		if( r.isNew ) {
			$('#splitPanel .panel-pop').html('<a href="/Plugin/Goods/upGoodsInfo/skuID/'+r.data+'"> 去完善资料 </a>');
		} else {
			api.showPress({title:'拆分成功,准备重置页面',duration:1500,url:window.location.href});
		}
	});
	return false;
});