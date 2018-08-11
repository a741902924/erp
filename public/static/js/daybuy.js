/*查询产品*/
$urlSearchpro = "/Home/Search/warehousepro"; //查询产品
$('#showProPlan').on('click',function(){
	$('#oProductsPanel').removeClass('f-hide');
	0 === $('#vProductList tr').length && shearchPro(1,50);
	return false;
});
$('.panel-mask a.close').on('click',function(){
	$(this).parents('div.panel-mask').addClass('f-hide');
});

$('#autoBox').css({'width':($(window).width() - 80)+'px','overflow-x':'auto'});
$('#search').submit(function(){
	shearchPro(1,20);
	return false;
});
function shearchPro(page,size){
	var post = $('#search').serialize();
	post = $.parseJSON(api.formToJson(post));
	post.type = 'all';
	post.page = page;
	post.size = size;

	api.ajax($urlSearchpro,post,function(ret){
		console.log(ret);
		var str = '';
		var btnTitle;
		for(var i in ret.list ) {
			btnTitle = 0 < $('#eventProList tr[data-id='+ret.list[i].product_id+']').length ? '已选择':'添加';
			str += '<tr data-id="'+ret.list[i].product_id+'" data-warehouse_id="'+ret.list[i].warehouse_id+'" data-cost="'+ret.list[i].purchase_price+'" data-commision="'+ret.list[i].agent_price+'" title="'+ret.list[i].pname+'">' +
				'<td align="left">'+ret.list[i].product_sn+'<br/>'+ret.list[i].pname+' '+ret.list[i].attr+'</td>' +
				'<td>'+ret.list[i].price_1+'</td>' +
				'<td>'+ret.list[i].product_number+'</td>' +
				'<td>'+ret.list[i].fictitious_number+'</td>' +
				'<td><img src="'+ret.list[i].p_images+'" width="50"/></td>' +
				'<td><a class="comm-link add">'+btnTitle+'</a></td></tr>';
		}
		$('#vProductList').html(str);
	});
	return false;
}

function addTr( _json ){
	var str = '<tr data-id="'+_json.data_id+'">' +
		'<td><input type="hidden" value="'+_json.data_id+'" size="2" name="product_id[]"><input type="text" class="comm-input" value="50" size="2" maxlength="4" name="sort[]" required></td>' +
		'<td><div style="width: 100%; max-height:68px; overflow: hidden;">'+_json.describe+'</div></td>' +
		'<td><input type="text" class="comm-input" size="20" maxlength="100" name="title[]" value="'+_json.title+'" required></td>' +
		'<td><img src="'+_json.main_img+'" width="50"></td>' +
		'<td>'+_json.price+'</td>' +
		'<td>'+_json.product_number+'</td>' +
		'<td>'+_json.fictitious_number+'</td>' +
		'<input type="hidden" name="img[]" value="'+_json.main_img+'">' +
		'<td><input type="text" class="comm-input" size="6" maxlength="8" name="event_price[]" value="'+_json.price+'" required></td>' +
		'<td><input type="text" class="comm-input" size="6" maxlength="10" name="event_num[]" value="'+(_json.product_number+_json.fictitious_number)+'" required></td>' +
		'<td><input type="text" class="comm-input" size="6" maxlength="8" name="event_cost[]" value="'+_json.cost+'" required></td>' +
		'<td><input type="text" class="comm-input" size="6" maxlength="8" name="commission[]" value="'+_json.commision+'" required></td>' +
		'<td><input type="text" class="comm-input" size="6" maxlength="5" name="buy_max[]" value="1" required></td>' +
		'<td><a class="comm-link remove">删除</a></td>' +
		'</tr>';
	$('#eventProList').append(str);
}
$('#vProductList').on('click','a.add',function(){
	var tr = $(this).parents('tr:first');
	if( 1 === $('#eventProList tr[data-id='+tr.data('id')+']').length ) {
		return;
	}
	var add_json = {
		data_id: tr.data('id'),
		describe: tr.find('td:first').html(),
		main_img: tr.find('td:eq(4) img').attr('src'),
		title:tr.attr('title'),
		product_number:parseInt(tr.find('td:eq(2)').html()),
		fictitious_number:parseInt(tr.find('td:eq(3)').html()),
		price:tr.find('td:eq(1)').html(),
		cost:tr.data('cost'),
		commision:tr.data('commision'),
	}
	$(this).html('已选择');
	addTr( add_json );
});

$('#eventProList').on('click','tr a.remove',function(){
	var _this = $(this);
	$('#vProductList tr[data-id='+_this.data('id')+'] a.add').html('添加');
	_this.parents('tr:first').remove();
});

$('form[name=s_form]').submit(function(){
	var hasError = '',objError = null;
	$("#eventProList tr").each(function(){
		var tdArr = $('td',this);
		var available_number = (parseInt(tdArr.eq(5).text())||0)+(parseInt(tdArr.eq(8).find('input').val())||0);//商品实际库存
		var event_num = parseInt($(this).find('input[name="event_num[]"]').val())||0;
		if( 0 === event_num ) {
			hasError = "产品活动数量不能为0";
			objError = $(this).find('input[name="event_num[]"]');
			return false;
		}
		if( available_number < event_num ) {
			hasError = "产品活动数量不能超过总库存";
			objError = $(this).find('input[name="event_num[]"]');
			return false;
		}
		var event_price = parseFloat($(this).find('input[name="event_price[]"]').val())||0;
		if( 0 >= event_price ) {
			hasError = "产品活动价格错误";
			objError = $(this).find('input[name="event_price[]"]');
			return false;
		}
		var event_cost = parseFloat($(this).find('input[name="event_cost[]"]').val())||0;
		if( 0 > event_cost ) {
			hasError = "产品活动价格错误";
			objError = $(this).find('input[name="event_cost[]"]');
			return false;
		}
		var commission_price = parseFloat($(this).find('input[name="commission[]"]').val())||0;
		if( 0 > commission_price ) {
			hasError = "产品分佣错误";
			objError = $(this).find('input[name="commission[]"]');
			return false;
		}
	});
	if( '' !== hasError ) {
		api.showPress({title:hasError,duration:1500});
		objError.focus().select();
		return false;
	}
	var post = new FormData(document.getElementById('s_from'));
	api.showPress();
	api.app($(this).attr('action'),post);
	return false;
});