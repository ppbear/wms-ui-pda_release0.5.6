/**
 * @file            startReplenishment.js
 * @description     补货上架js
 * @author          郝四海
 * @version         0.2.3
 * @date            2017/8/3
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var id = qmpur.getQueryString("orderId"); /*获取订单id*/
var _this = "";
var goodsList = 0;/*商品列表*/
/**
 * description 新建一个对象
 */

var startReplenishmentObj = {
	Configs: {
		replenishUrl: userBasePath + "replenish/nextReplenishDetail/" + id, /*获取补货商品信息接口*/
		doReplenishUrl: userBasePath + "replenish/doReplenish",/*退回提交接口*/
		doFinishUrl: userBasePath + "replenish/doFinish/" + id, /*结束提交*/
		storageLocationUrl: userBasePath + "replenish/checkStorageLocation?code=" /*获取库位信息*/
	},
	/*获取退货商品信息*/
	getGoodsInfo: function(){
		qmpur.ajax({
			url: startReplenishmentObj.Configs.replenishUrl,
			success: function(data) {
				goodsList = data;
				if(goodsList){
					$(".locationCode input").attr("placeholder", data.sourceStorageLocation.code); /*库位号*/
					$(".locationCode input").attr("data-id", data.sourceStorageLocation.id); /*库位id*/
					$(".barcode input").attr("placeholder", data.goodsInfo.barcode); /*条形码*/
					$(".barcode input").attr("data-id", data.id); /*订单id*/
					$(".name input").val(data.goodsInfo.name);/*商品名字*/
					$(".name input").attr("data-id", data.goodsInfo.id);/*商品id*/
					$(".productDate input").val(qmpur.formatDate(data.productDate)); /*生产日期*/
					$(".targetNum input").val(data.preReplenishCount);/*目标数量*/
					$(".unit").val(data.goodsInfo.unit);/*商品单位*/
				}
			}
		});
	},
	/*库位号验证*/
	locationCodeTest: function(){
		$(".locationCode").bind("input porpertychange", function(){
			var inputValue = $(".locationCode input").val(); /*库位号输入的内容*/
			var locationCode = $(".locationCode input").attr("placeholder"); /*获取占位符*/
			var len = inputValue.length;
			if(inputValue == locationCode){
				$(".locationImg").show();
				$("#barcode").focus();
			} else {
				 $(".locationCode input").focus();
				$(".locationImg").hide();
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_location_number);
				return;
			}
		});
	},
	/*条形码验证*/
	barcodeTest: function(){
		$(".barcode").bind("input porpertychange", function(){
			var inputValue = $(".barcode input").val(); /*库位号输入的内容*/
			var barcodeCode = $(".barcode input").attr("placeholder"); /*获取占位符*/
			var len = inputValue.length;
			if( inputValue == barcodeCode){
				$(".barcodeImg").show();
				$(".replenishmentNum input").focus();
			} else {
				$("#barcode").focus();
				$(".barcodeImg").hide();
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_bar_code);
				return;
			}
		});
	},
	/*scan扫码判断*/
	scanJudge: function(){
		$(document).keyup(function (event) {
	        var code = event.keyCode;
	        var locationCode = $(".locationCode input").val(); /*获取库位*/
	        var locationCodePlaceholder = $(".locationCode input").attr("placeholder");/*获取库位占位符*/
	       	var barcodeCode =  $(".barcode input").val(); /*获取条形码*/
       		var barcodeCodePlaceholder =  $(".barcode input").attr("placeholder");/*获取条形码占位符*/
	        if(code == 120){
	        	if(locationCode == locationCodePlaceholder){
	        		$(".locationImg").show();
	        	} else {
	        		$(".locationImg").hide();
	        	};
	        	if(barcodeCode == barcodeCodePlaceholder){
	        		$(".barcodeImg").show();
	        	} else {
	        		$(".barcodeImg").hide();
	        	}
	        } 
	    });
	},
	/*弹起软件盘*/
	keyUp: function(){
		$(".keyboardUp input").click(function(){
			_this = $(this);
	   		$("#content").css("top", "-250px");
	   	});
	},
	/*收起软件盘*/
	keyDown: function(){
		 $(".inputBox").not(_this).on("tap",function(){
	        $("#content").css("top", "0px");
	    });
	},
	/*获取目标库位id*/
	getLocationId: function(){
		$(".targetLocation").bind("input porpertychange", function(){
			var targetLocation = $(".targetLocation input").val(); /*目标库位*/
			var produceDate = $(".productDate input").val(); /*生产日期*/
			var goodsId = $(".name input").attr("data-id");/*商品id*/
			if(targetLocation){
				qmpur.ajax({
					url: startReplenishmentObj.Configs.storageLocationUrl + targetLocation + "&goodsId=" + goodsId + "&produceDate=" + produceDate,
					success: function(data) {
						if(data){
							$(".targetLocation input").attr("data-id", data.id);
						}
					},
					error: function() {
						$(".targetLocation input").val("");
						return;
					}
				});
			}
		});
	},
	/*确认提交*/
	confirm: function(){
		$(".confirm").on("tap", function(){
			$("#content").css("top", "0px");
			var targetNum =Number($(".targetNum input").val());/*目标数量*/
			var replenishmentNum = Number($(".replenishmentNum input").val()) ;/*补货数量*/
			var locationId = $(".targetLocation input").attr("data-id"); /*库区id*/
			var targetLocation = $(".locationCode input").val(); /*目标库区*/
			var orderInfoId = $(".barcode input").attr("data-id"); /*订单id*/
			if($(".locationImg").is(":hidden")){
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_location_number);
				return;
			};
			if($(".barcodeImg").is(":hidden") || !targetLocation){
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_bar_code);
				return;
			};
			if(!replenishmentNum){
				qmpur.toast(i18n_return_please_enter_an_integer_greater_than_zero);
				return;
			} else if (replenishmentNum != targetNum){
				qmpur.toast(i18n_replenishment_the_quantity_of_replenishment_must_be_the_same_as_the_number_of_targets);
				return;
			};
			var params = {
				"id": orderInfoId,
				"number": targetNum,
				"locationId": locationId
			}
			if(targetNum && targetNum == replenishmentNum && $(".barcodeImg").is(":visible") && $(".locationImg").is(":visible")){
				startReplenishmentObj.confirmSubmit(params);
			}
		});
	},
	/*提交*/
	confirmSubmit: function(params){
		qmpur.ajax({
			url: startReplenishmentObj.Configs.doReplenishUrl,
			type: "put",
			data: JSON.stringify(params),
			success: function(data) {
				startReplenishmentObj.disabledState();
			}
		});
	},
	/*成功之后设置商品信息的状态*/
	disabledState: function(){
		$(".goodsState input").prop("disabled", true); /*禁用状态*/
		$(".goodsState input").addClass("readonly"); /*禁用状态置灰*/
	},
	/*恢复商品信息初始化话状态*/
	initializeState: function(){
		$(".goodsState input").prop("disabled", false); /*启用状态*/
		$(".locationCode input").val(""); /*库位号*/
		$(".barcode input").val(""); /*条形码*/
		$(".replenishmentNum input").val(""); /*清空补货数量*/
		$(".targetLocation input").val(""); /*清空库位号*/
		$(".locationImg").hide();/*隐藏库位验证图片*/
		$(".barcodeImg").hide();/*隐藏条形码验证图片*/
		$(".goodsState input").removeClass("readonly"); /*关闭禁用状态*/
	},
	/*点击下一个*/
	continueReplenish: function(){
		$(".next").on("tap", function(){
			$("#content").css("top", "0px");
			if(!goodsList){
				qmpur.toast(i18n_replenishment_no_goods_to_be_replenished);
			} else {
				startReplenishmentObj.getGoodsInfo();
				startReplenishmentObj.initializeState();
			}
		})
	},
	/*结束补货*/
	finishReplenish: function(){
		$(".end").click(function(){
			$("#content").css("top", "0px");
			if(goodsList){
				qmpur.toast(i18n_replenishment_please_complete_the_replenishment_task_first);
			} else {
				$("#modelToast").show();  /*显示提示框*/
				$("#modelToast span").text(i18n_replenishment_complete);
				setTimeout(function(){
					$("#modelToast").hide();  /*隐藏提示框*/
					startReplenishmentObj.finishSubmit();
				},3000)
			}
		});
	},
	/*结束提交*/
	finishSubmit: function(){
		qmpur.ajax({
			url: startReplenishmentObj.Configs.doFinishUrl,
			success: function(data) {
				qmpur.switchPage("replenishmentShelves.html?orderId="+id);
			}
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			$(".end").click();
		};
	},
	/*页面初始化*/
	initialize: function(){
		this.getGoodsInfo();
		this.keyUp();
		this.keyDown();
		this.confirm();
		$(".locationCode input").focus(); /*库位号默认获取焦点*/
		this.locationCodeTest();
		this.barcodeTest();
		this.mobileBack();
		this.continueReplenish();
		this.finishReplenish();
		this.getLocationId();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	startReplenishmentObj.initialize();
})