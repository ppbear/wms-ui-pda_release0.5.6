/**
 * @file            return.js
 * @description     退货js
 * @author          郝四海
 * @version         0.2.3
 * @date            2017/8/3
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var goodsId = qmpur.getQueryString("goodsId"); /*获取订单id*/
var id = qmpur.getQueryString("id"); 
var type = qmpur.getQueryString("type"); /*获取订单*/
var orderNo = qmpur.getQueryString("orderNo"); /*订单单号*/
var _this = '';

/**
 * description 新建一个对象
 */

var returnObj = {
	Configs: {
		returnUrl: userBasePath + "checkFollowup/" + goodsId, /*获取退回商品信息接口*/
		returnSumbitUrl: userBasePath + "checkFollowup"/*退回提交接口*/
	},
	/*获取退货商品信息*/
	getGoodsInfo: function(){
		qmpur.ajax({
			url: returnObj.Configs.returnUrl,
			success: function(data) {
				$(".locationCode input").attr("placeholder", data.storageLocationCode); /*库位号*/
				$(".barcode input").attr("placeholder", data.goodsInfo.barcode); /*条形码*/
				$(".name input").val(data.goodsInfo.name);/*商品名字*/
				$(".productDate input").val(qmpur.formatDate(data.productDate)); /*生产日期*/
				$(".handleGoodsNum input").val(data.handleGoodsNum);/*预退回*/
				$(".hasHandleNum input").val(data.hasHandleNum);/*已退回*/
				$(".unit").val(data.goodsInfo.unit);/*商品单位*/
			}
		});
	},
	/*库位号验证*/
	locationCodeTest: function(){
		$(".locationCode").bind("input porpertychange", function(){
			var inputValue = $(".locationCode input").val(); /*库位号输入的内容*/
			var locationCode = $(".locationCode input").attr("placeholder"); /*获取占位符*/
			var len = inputValue.length;
			if( inputValue == locationCode){
				$(".locationImg").show();
				$(".barcode input").focus();
			} else {
				$(".locationImg").hide();
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
				$(".returnNum input").focus();
			} else {
				$(".barcodeImg").hide();
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
		$(".returnNum input").click(function(){
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
	/*确认提交*/
	confirm: function(){
		$(".confirm").on("tap", function(){
			$("#content").css("top", "0px");
			var returnNum =Number($(".returnNum input").val());/*退回数量*/
			var handleGoodsNum = Number($(".handleGoodsNum input").val()) ;/*预退回*/
			var hasHandleNum = Number($(".hasHandleNum input").val()) ;/*已退回*/
			if($(".locationImg").is(":hidden")){
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_location_number);
				return;
			};
			if($(".barcodeImg").is(":hidden")){
				qmpur.toast(i18n_com_please_scan_or_enter_the_correct_bar_code);
				return;
			};
			if(!returnNum){
				qmpur.toast(i18n_return_please_enter_an_integer_greater_than_zero);
				return;
			} else if (returnNum > handleGoodsNum){
				if (type == 1){
					qmpur.toast(i18n_return_the_number_of_returns_can_not_be_greater_than_the_number_of_preRefunds);
				} else if (type == 2) {
					qmpur.toast(i18n_replenishment_the_amount_of_replenishment_can_not_be_greater_than_the_number_of_replenishment);
				}
				return;
			};
			if(hasHandleNum == handleGoodsNum){
				qmpur.toast(i18n_com_no_more_goods_yet);
				return;
			}
			var params = {
				"id": goodsId,
				"handleGoodsNum": returnNum
			}
			if(returnNum && returnNum <= handleGoodsNum && $(".barcodeImg").is(":visible") && $(".locationImg").is(":visible")){
				returnObj.confirmSubmit(params);
			}
		});
	},
	/*提交*/
	confirmSubmit: function(params){
		qmpur.ajax({
			url: returnObj.Configs.returnSumbitUrl,
			type: "put",
			data: JSON.stringify(params),
			success: function(data) {
				returnObj.getGoodsInfo();
				var handleGoodsNum = Number($(".handleGoodsNum input").val()) ;/*预退回*/
				var hasHandleNum = params.handleGoodsNum;/*已退回*/
				$(".returnNum input").val("");/*清空退回数量*/
				if(handleGoodsNum == hasHandleNum){
					$(".locationCode input").prop("readonly", true); /*库位禁用*/
					$(".barcode input").prop("readonly", true);/*二维码禁用*/
					$(".returnNum input").prop("readonly", true);/*退回数量禁用*/
					$(".locationImg").show();
					$(".barcodeImg").show();
				} else {
					$(".locationCode input").val("");/*清空库位*/
					$(".barcode input").val("");/*清空库位*/
					$(".locationImg").hide();
					$(".barcodeImg").hide();
				}
			}
		});
	},
	/*返回*/
	backTrack: function(){
		$(".back").click(function(){
			$("#content").css("top", "0px");
			qmpur.switchPage("returnOrReplenishment.html?id=" + id + "&orderNo=" + orderNo);
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			$(".back").click();
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
		this.backTrack();
		this.mobileBack();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	returnObj.initialize();
})