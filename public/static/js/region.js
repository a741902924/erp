/*常量*/
var region = {};
region.url = null;
region.box = $('#regionPanelSelect');
region.selectbox = ['selNation','selProvinces','selCitys','selAreas'];
region.values = {nation:[],province:[],city:[],area:[]};

region.set = function(_region_id,_select){
	region.resetSelect(_select);
	_region_id = parseInt(_region_id)
	if( null === region.url || isNaN(_region_id) ){ return false; }
	api.ajax(region.url,{'parent_id':_region_id},function(ret){
		for( var i=0;i<ret.list.length;i++ ){
			$("#"+_select).append('<option value="'+ret.list[i].region_id+'">'+ret.list[i].region_name+'</option>');
		}	
	});
}


region.box.find('a.close').on('click',function(){
	region.hide();
});
region.hide = function(){
	region.box.addClass('f-hide');
};
region.show = function(){
	region.box.removeClass('f-hide');
};
/*
* 重置选择框
*/
region.resetSelect = function(_select){
	$("#"+_select+" option:gt(0)").remove();
}
/*
* 不允许选择
* (array)ids : 不可用对象的ID
*/
region.setDisabled = function(ids){
	for(var i in ids) {
		$('#'+ids[i]).prop('disabled',true);	
	}
}
/*
* 设置为多选
*/
region.setMultiple = function(ids){
	for(var i in region.selectbox) {
		$('#'+region.selectbox[i]).prop('multiple','multiple');	
	}
}
region.setValues = function(name,val,text){
	switch(name){
		case 'nation':
			region.values.nation = {id:val,text:text};
			region.values.province = null;
			region.values.city = null;
			region.values.area = null;
			break;
		case 'province':
			region.values.province = {id:val,text:text};
			region.values.city = null;
			region.values.area = null;
			break;
		case 'city':
			region.values.city = {id:val,text:text};
			region.values.area = null;
			break;
		case 'area':
			region.values.area = {id:val,text:text};
			break;
	}
}
region.box.find('select').on('change',function(){
	var id = $(this).val();
	var prevTd = $(this).parent().prevAll();
	if( 0 < prevTd.length ) {
		/*循环后面的*/
		prevTd.each(function(index) {
			$(this).find('select option:selected:gt(0)').prop('selected',false);
		});
	}
	var nextTd = $(this).parent().nextAll();
	if( 0 < nextTd.length ) {
		/*循环后面的*/
		nextTd.each(function(index) {
			if( 0 == index ) {
				( 0 < id ) && region.set(id,$(this).find('select').attr('id'));	
			} else {
				region.resetSelect($(this).find('select').attr('id'));
			}
			$(this).find('select option').prop('selected',false);
		});	
	}
});

region.box.find('a[name=submitSelect]').on('click',function(){
	region.values = {nation:null,province:null,city:null,area:null};
	var val = [],
		text = [];
	region.box.find('select').each(function(index){
		val = [],text = [];
		if( 0 == $('option:gt(0):selected',this).length ){
			return false;
		}
		$('option:gt(0):selected',this).each(function(){
			val.push($(this).attr('value'));
			text.push($(this).text());
		});
		switch (index){
			case 0:
				//国家
				region.values.nation = {id:val,text:text};
				break;
			case 1:
				//省
				region.values.province = {id:val,text:text};
				break;
			case 2:
				//市
				region.values.city = {id:val,text:text};
				break;
			case 3:
				//地区
				region.values.area = {id:val,text:text};
				break;
		}
	});
	region.selected && region.selected(region.values);
	region.hide();
});