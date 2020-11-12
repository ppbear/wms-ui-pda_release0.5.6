/**
 * @file            startInventory.js
 * @description     收货界面
 * @author          郝四海
 * @version         0.1.8
 * @date            2017/7/10
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */
var type = 1;//已盘，2是新增
var startInventoryObj = {
	Configs: {
		defaultInfoUrl: qmpur.Configs.userBasePath + "stocktaking/pda/nextItem/"+ qmpur.getQueryString("id"), /*获取默认信息*/
		getGoodsUrl: qmpur.Configs.userBasePath + "stocktaking/pda/listMinGoods/", /*获取商品信息*/
		innventoryLocationUrl: qmpur.Configs.userBasePath + "stocktaking/pda/queryItem",/*库位盘点接口*/
		doInventoryUrl: qmpur.Configs.userBasePath + "stocktaking/pda/doInventory",/*盘点提交*/
		unitUrl: qmpur.Configs.userBasePath + "stocktaking/pda/listUnits/",/*筛选单位*/
		goodsId: qmpur.getQueryString("id"), /*分割商品id*/
		unitSum: 0,
		_this: ""
	},
	/*日期选择器*/
	pickerTime: function() {
		var result =  $("#result")[0];
		$(".produced").on('click', "button", function() {
			var now = new Date();
			var year = now.getFullYear(); /*获取当前年份*/
			var beginYear = year - 5; /*向前推5年*/
			var options = {
				"type": "date",
				"beginYear": beginYear,  /*开始年份*/
				"endYear": year          /*结束年份*/
			};
			var id = this.getAttribute('id');
			var picker = new mui.DtPicker(options);
			picker.show(function(rs) {
				result.innerText = rs.text; /*选择日期赋值*/
				picker.dispose();
			}, false);
		});
	},
	/*获取默认信息*/
	getDefaultInfo: function(flag){
		qmpur.ajax({
			url: startInventoryObj.Configs.defaultInfoUrl,
			success: function(data) {
				$(".goodsBarcode").text(data.barcode);/*头部条形码*/
				$(".name").text(data.goodName);/*头部商品名字*/
				$(".waitReceive").text(qmpur.changeValue(data.UNFINISH));/*待盘*/
				$(".receivePartCount").text(qmpur.changeValue(data.FINISH));/*已盘*/
				$(".completeReceive").text(qmpur.changeValue(data.NEW));/*新增*/
				$(".inventoryType").text(i18n_inventory_waiting_plate);/*待盘*/
				if(qmpur.changeValue(data.UNFINISH) != 0){
					$("#location").attr("placeholder", data.next);/*待盘*/
					$("#barcode").attr("placeholder", data.barcode);/*待盘商品条形码*/
				} else {
					$("#location").attr("placeholder", "");/*待盘*/
					$("#barcode").attr("placeholder", "");/*待盘商品条形码*/
				}
				if(flag!=undefined &&flag == 1){
					startInventoryObj.finish();
				}else{
					startInventoryObj.unfinish();
				}
			}
		});
	},
	/*库位号验证*/
	locationCodeTest: function(){
		$(".location input").change(function(){
			var storageLocationCode  = $("#location").val(); /*库位号输入的内容*/
			var detailId = startInventoryObj.Configs.goodsId;/*id*/
			var params = {
				"storageLocationCode" : storageLocationCode,
				"detailId" : detailId
			};
		    qmpur.ajax({
				data: JSON.stringify(params),
				url: startInventoryObj.Configs.innventoryLocationUrl,
				success: function(data) {
					if(data){
						$("#locationImg").show();
						type = 1;
						startInventoryObj.judgeStatus(data);
					} else {
						startInventoryObj.add();
						$("#location").attr("data-id", "");
						$("#locationImg").show();
					}
					$("#barcode").val($("#barcode").attr("placeholder")); /*条形码输*/
					startInventoryObj.barcodeTest();
				},
				error: function() {
					$("#locationImg").hide();
					$("#barcode").val("");
					var inputValue = "ntxt_" + new Date().getTime();
					startInventoryObj.getGoodsInfo(inputValue);
				}
			});
		});
	},
	/*判断状态*/
	judgeStatus: function(data){
		if(data.stockStatus == "UNFINISH"){
			startInventoryObj.unfinish();
			$("#location").attr("data-id", data.id);
		} else if(data.stockStatus == "FINISH") {
			startInventoryObj.finish();
			$("#location").attr("data-id", data.id);
		} else if(data.stockStatus == "NEW") {
			startInventoryObj.add();
			$("#location").attr("data-id", "");
		} 
	},
	/*条形码验证*/
	barcodeTest: function(){
		var inputValue = $("#barcode").val(); /*条形码输*/
		if(!$("#barcode").val()) {
		    return false;
		}
        if($("#barcode").attr("placeholder") && $("#barcode").attr("placeholder") != inputValue) {
            qmpur.toast();
            inputValue = "ntxt_" + new Date().getTime();
        }
        var barcodeCode = $(".goodsBarcode").text(); /*获取条形码*/
        startInventoryObj.getGoodsInfo(inputValue);
	},
	barcodeChange: function() {
	    startInventoryObj.barcodeTest();
	},
	/*获取商品数据*/
	getGoodsInfo: function(barcode){
		var sCode = $("#location").val().trim();
		qmpur.ajax({
				url: startInventoryObj.Configs.getGoodsUrl + barcode+"?storageCode="+sCode+"&type="+type,
				success: function(data) {
					$("#goodsName").html("");
					if(data && data.length>0){
						$("#barcodeImg").show();
						$("#barcode").removeClass("active");
						$("#goodsName").removeClass("active");
						var len = data.length;
						if(len == 1){
							var obj = "";
							var goodsId = data[0].id;
							startInventoryObj.getUnitList(goodsId,barcode);
							//$(".unit").val(data[0].unit);/*商品单位*/
						} else {
							var obj = '<option value ="">'+ i18n_com_please_select_the_product +'</option>';
							$(".unit").val(""); /*商品单位*/
						}
						var goodsObj = {};
						for( var i = 0; i < len; i++){
							obj += "<option value ='"+ data[i].id +"' >"+ data[i].name +"</option>";
						}
						$("#goodsName").html(obj);
					}else{
						$("#barcodeImg").hide();
						$("#barcode").addClass("active");
						$("#goodsName").html("");
						$("#goodsName").addClass("active");
					}
				}
			});
	},
	/*筛选名字*/
	goodsChange: function(){
		$("#goodsName").change(function(){
			var goodsId = $(this).val(); /*获取选中的商品Id*/ 
			startInventoryObj.getUnitList(goodsId);
		});
	},
	/*获取单位列表*/
	getUnitList: function(goodsId,selectBarcode){
		qmpur.ajax({
			url: startInventoryObj.Configs.unitUrl + goodsId,
			success: function(data){
				$("#goodsUnit").html("");
				if(data.length > 0){
					var len = data.length;
					var obj ="";
					$(".unit").val(data[0].unit);/*商品单位*/
					$(".unit").attr("data-unit", data[0].smallestCount)
					var selectUnit ;
					for(var i = 0; i < len; i++){
						if(selectBarcode && data[i].barcode ==selectBarcode){
							selectUnit =data[i].unit;
						}
						obj += "<option data-unit='"+ data[i].smallestCount +"' value ='"+ data[i].unit +"'>"+ data[i].unit +"</option>";
					}
					$("#goodsUnit").append(obj);
					if(selectBarcode && selectUnit){
						$(".unit").val(selectUnit);/*商品单位*/
						$("#goodsUnit").val(selectUnit);
					}
				} else {
					$(".unit").val("");/*商品单位*/
				}
			}
		})
	},
	/*单位筛选*/
	unitChange: function(){
		$("#goodsUnit").change(function(){
			var unit = $(this).val();
			$(".unit").val(unit);
			var goodsUnit = Number($("#goodsUnit option:selected").attr("data-unit"))
			$(".unit").attr("data-unit", goodsUnit);
			var receiveCount = Number($(".receiveCount input").val());
			if(receiveCount){
				var goodsCount=  Number(startInventoryObj.Configs.unitSum);
				$(".receiveCount input").val(qmpur.unitCon(goodsCount, goodsUnit));
			} else {
				$(".receiveCount input").val("");
			}
		});
	},
	/*待盘*/
	unfinish: function(){
		$(".inventoryType").text(i18n_inventory_waiting_plate);/*待盘*/
		$(".inventoryType").addClass("unfinish");/*待盘*/
	},
	/*已盘*/
	finish: function(){
		$(".inventoryType").text(i18n_inventory_has_a_disk);/*已盘*/
		$(".inventoryType").addClass("finish");/*已盘*/
	},
	/*新增*/
	add: function(){
		$(".inventoryType").text(i18n_inventory_add);/*新增*/
		$(".inventoryType").addClass("add");/*新增*/
		type = 2;
	},
	/*点击input调用日期*/
	inputPickerTime: function(){
		$("#result").on("tap", function(){
			$(".produced button").click();
		})
	},
	/*点击确认*/
	confirm: function(){
		$(".confirm").on("tap", function(){
			var detailId = startInventoryObj.Configs.goodsId; /*detailId*/
			var goodsId = $("#goodsName").val();/*商品id*/
			var id = $("#location").attr("data-id");
			var productDate = $("#result").text(); /*生产日期*/
			var storageLocationCode = $("#location").val(); /*库位号*/
			var num = $(".receiveNum input").val();/*获取输入数量*/
			var smallestCount = Number($("#goodsUnit option:checked").attr("data-unit"));
			var selectTime = productDate.replace(/-/g,'/');
		 	var oldTime = (new Date(selectTime)).getTime(); //得到毫秒数  
		 	var now = new Date().getTime();
		 	var barcode = $(".barcode input").val();
		 	var inventoryType = $(".inventoryType ").text(); /*库位类型*/
			if($("#locationImg").is(":hidden")){
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_location_number);
				return;
			};
			if(!barcode){
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_bar_code);
				return;
			};
			if($("#barcodeImg").is(":hidden") && inventoryType != i18n_inventory_waiting_plate){
				qmpur.toast(i18n_inventory_can_only_add_to_the_goods);
				return;
			};
			if(!goodsId){
				qmpur.toast(i18n_com_please_select_the_product);
				return;
			}
			if(!productDate){
				qmpur.toast(i18n_harvest_please_select_the_date_of_production);
				return;
			}
			if(oldTime > now){
		 		qmpur.toast(i18n_harvest_production_date_shall_not_be_more_than_today); /*生产日期与当前日期验证*/
		 		return false;
		 	}
			if(!num){
				qmpur.toast(i18n_putaway_please_input_the_goods_quantity);
				return;
			}
			var goodsCount = qmpur.unitCalcu(num, smallestCount);
			var params = {
				"detailId": detailId,
				"goodsId": goodsId,
				"id": id,
			    "productDate":productDate,
			    "storageLocationCode": storageLocationCode,
			    "goodsCount": goodsCount/*数量*/
			}
			startInventoryObj.confirmCommit(params);
		});
	},
	/*确认提交*/
	confirmCommit: function(params){
		qmpur.ajax({
			type:"post",
			data: JSON.stringify(params),
			url: startInventoryObj.Configs.doInventoryUrl,
			success: function(data) {
				startInventoryObj.finish();
				var receiveCount = Number($(".receiveCount input").val());
				if(receiveCount){
					$(".receiveCount input").val(receiveCount+Number($(".receiveNum input").val()));
				} else {
					$(".receiveCount input").val($(".receiveNum input").val());
				}
				$(".receiveNum input").val("");
				startInventoryObj.judgeStatus(data);
				startInventoryObj.disabled();
				$(".inventoryType").removeClass("unfinish");
				$(".inventoryType").removeClass("add");
				$("#barcode").removeClass("active");
				$("#location").attr("data-id", data.id);
				startInventoryObj.Configs.unitSum = data.goodsCount;
				startInventoryObj.getDefaultInfo(1);
			}
		});
	},
	/*确认提交置灰*/
	disabled: function(){
		$(".input").attr("disabled", true);
		$(".input").addClass("readonly");
	},
	/*清空数据*/
	clearData: function(){
		$(".input").attr("disabled", false);
		$(".input").removeClass("readonly");
		$("#location").val(""); /*库位*/
		$("#barcode").val("");/*条形码*/
		$("#goodsName").html("");/*商品名字*/
		$("#result").text("");/*生产日期*/
		$(".unit").text("");/*单位*/
		$(".receiveCount input").val("");/*已盘数量*/
		$("#goodsUnit").html("");/*单位*/
	},
	/*下一步*/
	nextTap: function(){
		$(".footerBtn .next").click(function(){
			var waitReceive = $('.waitReceive').text(); /*待盘库位*/
			startInventoryObj.clearData();
			$(".receiveNum input").val(""); /*盘货数量*/
			$(".testImg").hide();
			startInventoryObj.Configs.unitSum = 0;
			if(waitReceive == 0){
				$(".inventoryType").text(i18n_inventory_add);/*新增*/
				$(".inventoryType").addClass("add");/*新增*/
				$("#location").attr("data-id", "");
			} else {
				$(".inventoryType").removeClass("finish");
				$(".inventoryType").removeClass("add");
			}
			startInventoryObj.getDefaultInfo();
			setTimeout(function(){
                $("#location").focus();
            }, 200);
		})
	},
	/*结束收货退出*/
	finishExit: function(){
		$(".footerBtn .end").click(function(){
			var waitReceive = Number($(".waitReceive").text()); /*待盘*/
			if(waitReceive){
				mui.alert(i18n_inventory_please_complete_the_inventory_task);
			} else {
				qmpur.switchPage("inventory.html");
			}
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			$(".footerBtn .end").click();
		};
	},
	/*弹起软件盘*/
	keyUp: function(){
		$(".receiveNum input").click(function(){
			startInventoryObj.Configs._this = $(this);
	   		$("#content").css("top", "-250px");
	   	});
	},
	/*收起软件盘*/
	keyDown: function(){
		 $("body").not(startInventoryObj.Configs._this).on("tap",function(){
	        $("#content").css("top", "0px");
	    });
	},
	/*检测输入的*/
	checkInput: function(){
		$("#inventoryNum").bind("input porpertychange", function(){
			var inventoryNum = ($(this).val()).replace(/[^\d.]/g,'');
			var smallCount = $(this).parent().siblings(".inputBoxUnit").find("#goodsUnit option:selected").attr("data-unit");
			if(smallCount == 1 && (inventoryNum.indexOf(".") >= 0)) {
				$("#inventoryNum").val(parseInt(inventoryNum));
			}
		})
	},
	/*页面初始化*/
	initialize: function() {
		this.pickerTime();
		this.keyUp();
		this.keyDown();
		this.getDefaultInfo();
		this.locationCodeTest();
		this.barcodeChange();
		this.goodsChange();
		this.unitChange();
		this.confirm();
		this.nextTap();
		this.finishExit();
		this.mobileBack();
		this.checkInput();
	}
}

/**
 * description 页面初始化
 */
$(function() {
	startInventoryObj.initialize();
	setTimeout(function(){
	    $("#location").focus();
	}, 200);
})
