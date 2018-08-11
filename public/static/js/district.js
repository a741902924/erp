/*
* 库区库位设置
*/
var bc = $('#depot-body'), /**显示内容**/
	NewDepot = $(".new-depot"); /**新增库存按钮**/
	
var district = {};
district.warehouse_id = 0;
//depot-box
district.ini = function(){
	district.NewA = '<tr data-name="Newone" data-id="0" data-key="0-0-0"><td><input type="text" class="comm-textbox" name="district" value="" size="6"/> <button class="comm-button td-delete-one"> 删 </button> <button class="comm-button app-rack"> 新增货架 </button></td><td><input type="text" class="comm-textbox" name="shelves" value="" size="6"/> <button class="comm-button td-delete-two"> 删 </button> <button class="comm-button td-erweima" onclick="district.erweima(this)"> 二维码 </button> <button class="comm-button app-place"> 新增货位 </button></td><td><input type="text" class="comm-textbox" name="nums" value="" size="6"/> <button class="comm-button td-delete-three"> 删 </button> <span data-name="showtext"></span></td><td><span data-name="hasnum"></span></td></tr>',
	district.NewB = '<tr data-name="Newtwo" data-id="0" data-key="0-0-0"><td></td><td><input type="text" class="comm-textbox" name="shelves" value="" size="6"/> <button class="comm-button td-delete-two"> 删 </button> <button class="comm-button td-erweima" onclick="district.erweima(this)"> 二维码 </button> <button class="comm-button app-place"> 新增货位 </button></td><td><input type="text" class="comm-textbox" name="nums" value="" size="6"/> <button class="comm-button td-delete-three"> 删 </button> <span data-name="showtext"></span></td><td><span data-name="hasnum"></span></td></tr>'
	district.NewC = '<tr data-name="Newthree" data-id="0" data-key="0-0-0"><td></td><td></td><td><input type="text" class="comm-textbox" name="nums" value="" size="6"/> <button class="comm-button td-delete-three"> 删 </button> <span data-name="showtext"></span></td><td><span data-name="hasnum"></span></td></tr>';
	
	NewDepot.on('click',function(){
		if( 0 == district.warehouse_id ) {
			api.showPress({title:'请选择仓库',duration:1000});
			return false;
		}
		bc.append(district.NewA);
	});
	bc.on('click','.app-rack',function(){
		if( 0 == district.warehouse_id ) {
			api.showPress({title:'请选择仓库',duration:1000});
			return false;	
		}
		var ttr = $(this).parents('tr');
		var isAppend = false;
		ttr.nextAll().each(function(index){
			if ('Newone' == $(this).data('name')) {
				$(this).before(district.NewB);
				isAppend = true;
				return false;
			}
		});
		if (!isAppend) {
			bc.append(district.NewB);
		}
	});
	bc.on('click','.app-place',function(){
		if( 0 == district.warehouse_id ) {
			api.showPress({title:'请选择仓库',duration:1000});
			return false;	
		}
		var ttr = $(this).parents('tr');               //tr 
		var isAppend = false;
		ttr.nextAll().each(function(index){            //tr下面的同级 遍历
			//    this 是 1或者 2
			if( 'Newtwo' == $(this).data('name') ||  'Newone' == $(this).data('name') ) {
				//    在 this的前面添加 
				$(this).before(district.NewC);
				isAppend = true;
				return false;
			}
		});
		if( !isAppend ) {
			bc.append(district.NewC);
		}
	});
	/**删除**/
	bc.on('click','.td-delete-one,.td-delete-two,.td-delete-three',function(){
		if( 0 == district.warehouse_id ) {
			api.showPress({title:'请选择仓库',duration:1000});
		}
		var tr = $(this).parents('tr:first');
		var num_ids = [];
		api.confirm({msg: '是否要删除？'},function(b){
			if( 1 == b.btn ) {
				var isdel = true,delObj = [];
				switch(tr.data('name')){
					case 'Newtwo':
						/**删除货架**/
						tr.nextAll('tr').each(function(){
							if( 'Newtwo' == $(this).data('name') ||  'Newone' == $(this).data('name') ) {
								return false;	
							}
							if( 0 < Number($('span[data-name=hasnum]',tr).html()) ) {
								isdel = false;
								return false;
							}
							0 < $(this).data('id') && num_ids.push($(this).data('id'));
							delObj.push($(this));
						});
						break;
					case 'Newone':
						/**删除库区**/
						tr.nextAll('tr').each(function(){
							if( 'Newone' == $(this).data('name') ) {
								return false;	
							}
							if( 0 < Number($('span[data-name=hasnum]',tr).html()) ) {
								isdel = false;
								return false;
							}
							0 < $(this).data('id') && num_ids.push($(this).data('id'));
							delObj.push($(this));
						});
						break;
				}
				if ( 0 < Number($('span[data-name=hasnum]',tr).html()) || !isdel ) {
					api.showPress({title:'不能删除，货位上存在货品',duration:1000});
					delObj = null;
					return false;
				}
				delObj.push(tr);
				0 < tr.data('id') && num_ids.push(tr.data('id'));
				if( 0 < num_ids.length ) {
					api.ajax(district.delUrl,{values:num_ids},function(ret){
						for( var i in delObj ) {
							delObj[i].remove();
						}	
					});
				} else {
					for( var i in delObj ) {
						delObj[i].remove();
					}
				}
					
			}
		});
		
	});
	/**选择仓库**/
	$('.depot-box a').on('click',function(){
		$('.depot-box a').removeClass('hover');
		$(this).addClass('hover');
		district.warehouse_id = $(this).data('id');
		api.ajax(district.getUrl,{warehouse_id:district.warehouse_id},function(ret){
			district.view(ret);
		});
	});
	/**保存仓库**/
	$('#save').on('click',function(){
		if( 0 == district.warehouse_id ) {
			api.showPress({title:'请选择仓库',duration:1000});
		}
		var values = [];
			ids = [0,0,0],
			t_ids = [0,0,0];
		$('tr',bc).each(function(index){
			ids = $(this).data('key').split('-');
			id = $(this).data('id');
			if( 0 < $('input[name=district]',$(this)).length ) {
				t_ids[0] = ids[0];
				values.push({
					'warehouse_id':district.warehouse_id,
					'district_id':ids[0],
					'district_name':$.trim($('input[name=district]',$(this)).val()),
					'shelves':[]
				});
			}
			last_d = values.length-1;
			if( 0 < $('input[name=shelves]',$(this)).length ) {
				t_ids[1] = ids[1];
				values[last_d].shelves.push({
					'shelves_name':$.trim($('input[name=shelves]',$(this)).val()),
					'nums':[]
				});
			}
			last_s = values[last_d].shelves.length-1;
			values[last_d].shelves[last_s].nums.push({
				'nums_id':id,
				'num_name':$.trim($('input[name=nums]',$(this)).val())
			});
		});
		console.log(values);
		if( 0 < values.length ) {
			api.ajax(district.saveUrl,{values:values},function(ret){
				district.view(ret);	
			});
		}
	});
	$('.panel-pop a.close').on('click',function(){
		$(this).parents('div.panel-mask').addClass('f-hide');
	});
}
/**库位视图**/
district.view = function(ret){
	bc.html('');
	var a = 0,
		b = 0,
		tmp = 'C';
	if( 0 == ret.nums.length && 0 < ret.shelves.length ) {
		/**处理以前额旧数据**/
		for( var i in ret.shelves ) {
			for( var j=0; j<ret.shelves[i].num; j++ ) {
				if( a !== ret.shelves[i].district_id ) {
					tmp = 'A';
					a = ret.shelves[i].district_id;
					b = ret.shelves[i].shelves_id;
				} else if( b !== ret.shelves[i].shelves_id ) {
					tmp = 'B';
					b = ret.shelves[i].shelves_id;
				} else {
					tmp = 'C';	
				}
				var str = eval('district.New'+tmp);
				bc.append(str);
				num = j+1;
				$('tr:last',bc).attr('data-id',0);
				$('tr:last',bc).attr('data-key',ret.shelves[i].district_id+'-'+ret.shelves[i].shelves_id+'-'+num);
				$('tr:last input[name=district]',bc).val(ret.shelves[i].district_name);
				$('tr:last input[name=shelves]',bc).val(ret.shelves[i].shelves_id);
				$('tr:last input[name=nums]',bc).val(num);
				$('tr:last span[data-name=showtext]',bc).html(ret.shelves[i].district_name+'-'+ret.shelves[i].shelves_id+'-'+num);
			}
		}
	} else {
		for(var i in ret.nums ) {
			if( a !== ret.nums[i].district_id ) {
				tmp = 'A';
				a = ret.nums[i].district_id;
				b = ret.nums[i].shelves_id;
			} else if( b !== ret.nums[i].shelves_id ) {
				tmp = 'B';
				b = ret.nums[i].shelves_id;
			} else {
				tmp = 'C';	
			}
			var str = eval('district.New'+tmp);
			bc.append(str);	
			$('tr:last',bc).attr('data-id',ret.nums[i].nums_id);
			$('tr:last',bc).attr('data-key',ret.nums[i].district_id+'-'+ret.nums[i].shelves_id+'-'+ret.nums[i].num_id);
			$('tr:last input[name=district]',bc).val(ret.nums[i].district_name);
			$('tr:last input[name=shelves]',bc).val(ret.nums[i].shelves_name);
			$('tr:last input[name=nums]',bc).val(ret.nums[i].num_name);
			$('tr:last span[data-name=showtext]',bc).html(ret.nums[i].district_name+'-'+ret.nums[i].shelves_name+'-'+ret.nums[i].num_name );
			$('tr:last span[data-name=hasnum]',bc).html( null !== ret.nums[i].hasnum ? ret.nums[i].hasnum : 0);
			
		}
	}	
}

/**生成二维码**/
district.erweima = function(_this){
	$('#erweimaPanel tr td').html('');
	var tr = $(_this).parents('tr:first');
	var id = tr.data('id');
	if( 0 == Number(id) ) {
		api.showPress({title:'货架未保存',duration:1500});
		return;
	}
	var _href = document.location.protocol+'//'+(document.domain||'www.heiyd.com')+'/Web/Warehouse/district/id/'+id;
	$('#erweimaPanel tr td:eq(0)').qrcode({width:300,height:300,text: encodeURI(_href)});
	//$('#erweimaPanel tr td:eq(1)').html('货架：'+tr.find('input[name=district]').val()+'-'+tr.find('input[name=shelves]').val());
	$('#erweimaPanel tr td:eq(1)').html('用手机扫一扫，可以查看货架产品信息');
	$('#erweimaPanel').removeClass('f-hide');
}