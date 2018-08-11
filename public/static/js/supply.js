var view = {pagesize:10};

function submitForm(){
	if( '' == $.trim($('input[name="s_name"]').val()) ){
		api.showPress({title:'请填写公司名称。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_address"]').val()) ){
		api.showPress({title:'请填写公司地址。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_delive_house_one"]').val())  ){
		api.showPress({title:'请至少填写一个发货仓库。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_person"]').val()) ){
		api.showPress({title:'请填写公司负责人。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_per_num_one"]').val()) ){
		api.showPress({title:'请至少填写公司负责人-电话。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_moneier_one"]').val()) ){
		api.showPress({title:'请填写财务联系人。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_mon_num_one"]').val()) ){
		api.showPress({title:'请至少填写财务联系人-电话。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_exprer_one"]').val()) ){
		api.showPress({title:'请填写物流联系人。',duration:2000});
		return false;
	}
	if( '' == $.trim($('input[name="s_ex_num_one"]').val()) ){
		api.showPress({title:'请至少填写物流联系人-电话。',duration:2000});
		return false;
	}
	/*if( !api.regMobile($.trim($('input[name="s_per_num_one"]').val())) ) {
		api.showPress({title:'公司负责人-电话格式错误。',duration:2000});	
		$('input[name="s_per_num_one"]').focus().select();
		return false;
	}*/
	/*if( !api.regMobile($.trim($('input[name="s_mon_num_one"]').val())) ) {
		api.showPress({title:'财务联系人-电话格式错误。',duration:2000});	
		$('input[name="s_mon_num_one"]').focus().select();
		return false;
	}*/
	/*if( !api.regMobile($.trim($('input[name="s_ex_num_one"]').val())) ) {
		api.showPress({title:'物流联系人-电话格式错误。',duration:2000});	
		$('input[name="s_ex_num_one"]').focus().select();
		return false;
	}*/
	return true;
}
function clearForm(){
	$('#ff').form('clear');
}

function searchFun(){
	$('#pager').pagination({pageNumber:1});
	$('#dg').datagrid({data:getData(1,view.pagesize)}); //页面初始数据
}

//ajax拉取数据
function getData(_page,_len){
	var rows = [];
	var d_id = Number($('input[name=d_id]').val());
	isNaN(d_id) && ( d_id = 0);
	api.ajax(view.admin_url,{'d_id':$('input[name=d_id]').val(),'page':_page,'len':_len},function(ret){
		for(var i in ret.list) {
			
		 rows.push({
			user_name: ret.list[i].user_name,
			real_name: ret.list[i].real_name,
			role_name: ret.list[i].role_name,
			d_name: ret.list[i].d_name,
			sys_handle:'<a href="javascript:void(0);" class="easyui-linkbutton" onclick="testFn(this,\''+ret.list[i].real_name+'\','+ret.list[i].user_id+')">选择</a>'
			});
		}
		$('#pager').pagination({total:ret.total}); //重置总数据量
		return rows;
	});
	return rows;
}

var _lead_name = '';
function leeAddFn( obj ,lead_name ){
	0 == admin.list.length && admin.getAdminList();
	admin.cancelchecked();
	admin.show();
	$('.lee-add-mark').removeClass('checked');
	$(obj).parents('tr').find('.lee-add-mark').addClass('checked');
	_lead_name = lead_name;
}
admin.getAdmin = function(ret){
	0 == $('input[name="'+_lead_name+'[]"][value='+ret.user_id+']').length &&  __Html(ret.real_name,ret.user_id);
};
admin.getAdmins = function(ret){
	for(var i in ret) {
		0 == $('input[name="'+_lead_name+'[]"][value='+ret[i].user_id+']').length &&  __Html(ret[i].real_name,ret[i].user_id);
	}
};
function __Html(real_name,user_id){
	$('.lee-add-mark.checked').append('<label class="lee-label">'+ real_name +'<input type="hidden" value="'+real_name+'" name="'+_lead_name+'_name[]"/><input type="hidden" name="'+_lead_name+'[]" value="'+user_id+'"><cite class="c"></cite></label>'
	);
}

$('.lee-add-mark').on('click','cite.c',function(){
	$(this).parents('label.lee-label').remove();
})