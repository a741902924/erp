var admin = {pagesize:6,page:1};
admin.pageer = api.page.init('#adminPage',{size:admin.pagesize});
admin.admin_url = '/Home/Admin/index';
admin.field = ['user_name','real_name','role_name','d_name'];
admin.box = $('#adminPanelSelect');
admin.body = $('#adminList tbody');
admin.list = []; //用列表
admin.selectindex = -1; //当前选择人
admin.getAdminList = function(){
	admin.body.html('');
	admin.list = [];
	d_id = admin.box.find('select[name=d_id]').val();
	isNaN(d_id) && ( d_id = 0);
	api.ajax(admin.admin_url,{'d_id':d_id,'page':admin.page,'len':admin.pagesize},function(ret){
		admin.list = ret.list;
		for(var i in ret.list) {
			admin.body.append('<tr><td><input type="checkbox" name="user_id" value="'+ret.list[i].user_id+'"/></td><td>'+ret.list[i].user_name+'</td><td>'+ret.list[i].real_name+'</td><td>'+ret.list[i].role_name+'</td><td>'+ret.list[i].d_name+'</td><td><a class="comm-link" onclick="admin.select('+i+')">选择</a></td></tr>');
		}
		admin.pageer.setTotal(ret.total);
	});
};
admin.box.find('select[name=d_id]').on('change',function(){
	admin.getAdminList();	
});
admin.box.find('a[name=selectChecked]').on('click',function(){
	var selAdmins = [];
	admin.body.find('input[name=user_id]').each(function(idx){
		if( $(this).prop('checked') )
			selAdmins.push(admin.list[idx]);
	});	
	admin.getAdmins && admin.getAdmins(selAdmins);
	admin.hide();
});
admin.box.find('a.close').on('click',function(){
	admin.hide();
});
admin.hide = function(){
	admin.box.addClass('f-hide');
};
admin.show = function(){
	admin.box.removeClass('f-hide');
};
admin.cancelchecked = function(){
	admin.box.find('input[type=checkbox]').prop('checked',false);
};
admin.select = function(idx){
	admin.getAdmin && admin.getAdmin(admin.list[idx]);
	admin.hide();
};

admin.pageer .onSelectPage = function(page,size){
	admin.page = page;
	admin.pagesize = size;
	admin.getAdminList();
};
admin.pageer .onRefreshPage = function(page,size){
	admin.page = page;
	admin.pagesize = size;
	admin.getAdminList();
};
