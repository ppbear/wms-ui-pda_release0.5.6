/**
 * @file            startHarvset.js
 * @description     销退入库
 * @author          郝四海
 * @version         0.3.0
 * @date            2017/9/12
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var id = qmpur.getQueryString("id");
var type = qmpur.getQueryString("type");
var _this = '';
var name2goodsId={};/*商品下拉列表*/
var id2Obj={};/*收货单Id 和对象映射Map*/
/*------------提交数据-----------------------*/
var formReceiveDetailId ='' ;
var putCount = 0;
var isCompleted = false;
/*------------提交数据-----------------------*/
/**
 * description 新建一个对象
 */

var startHarvsetObj = {
	Configs: {
		receiveOrderUrl: userBasePath + "receiveOrder/getGoodsCount?orderId=" + id, /*获取收货单接口*/
		getReceiveDetailUrl: userBasePath + "receiveOrder/getReceiveDetail?orderId=" + id, /*获取收货单商品明细接口*/
		nextReceiveUrl: userBasePath + "receiveOrder/nextReceiveDetail?orderId=" + id,/*继续收货接口*/
		confirmCommitUrl: userBasePath + "receiveOrder", /*确认收货*/
		finishHarvsetUrl: userBasePath + "receiveOrder/endReceive?orderId=" + id+"&type="+type /*结束收货*/
	},
	/*获取已收货的种类*/
	getReceiveOrder: function(){
		qmpur.ajax({
			url: startHarvsetObj.Configs.receiveOrderUrl,
			success: function(data) {
				$(".waitReceive").text(data.forReceiveCount); /*待收货*/
				$(".receivePartCount").text(data.receivePartCount); /*部分收货*/
				$(".completeReceive").text(data.receiveAllCount); /*完成收货*/
				isCompleted = data.forReceiveCount == 0 &&  data.receivePartCount == 0 
			}
		});
	},
	/*条形码change*/
	getGoodsInfo: function(){
		$("#barcode").change(function(){
			var _code = $(this).val();
			if(null==_code || _code.trim().length==0){
				startHarvsetObj.clearGoods(); 
				return ;
			}
			qmpur.ajax({
				url: startHarvsetObj.Configs.getReceiveDetailUrl + "&barcode="+_code,
				success: function(data) {
					if(null == data || data.length == 0){
						qmpur.toast(i18n_putaway_please_first_harvest);
						$(".testImg").hide();
						return ;
					}
					$(".testImg").show();
					name2goodsId={};
					id2Obj={};
					var options ="" ;
					var len = data.length;
					if(len == 1){
						options ="" ;
					} else {
						options += "<option value=''>"+ i18n_com_please_select_the_product +"</option>";
					}
					for(var i= 0;i<len;i++){
						id2Obj[data[i].id]=data[i];
						if(!name2goodsId.hasOwnProperty(data[i].goodsInfo.id)){
							name2goodsId[data[i].goodsInfo.id] = {};
							name2goodsId[data[i].goodsInfo.id].productDates= [];
							options += "<option value='"+data[i].id+"'>"+data[i].goodsInfo.name+"</option>";
						}
						name2goodsId[data[i].goodsInfo.id].name = data[i].goodsInfo.name;
					}
					$("#goodsName").append(options);
					$("#goodsName").change();
				}
			});
		});
		/**
		 * 选择商品（不同规格)
		 */
		$("#goodsName").change(function(){
			var waitPut = id2Obj[$(this).val()];
			$(".unit").val(waitPut.goodsInfo.unit); /*单位*/
			var len = waitPut.productDates.length;
			var str = "";
			if(len == 1){
				str = "";
			} else {
				str += "<option value=''>"+ i18n_harvest_please_select_the_date_of_production +"</option>";
			}
			for(var i = 0; i < len; i++){
				if(waitPut.productDates[i]) {
					str += "<option value='"+waitPut.productDates[i]+"'>"+waitPut.productDates[i]+"</option>";
				}
			}
			$("#producedTime").append(str);
			$("#goodsNum").val(waitPut.goodsNum); /*采购数量*/
			$("#haveReciveCount").val(waitPut.haveReciveCount); /*采购数量*/
			formReceiveDetailId = waitPut.id;
		});
	},
	/*点击继续收获*/
	continueHarvset: function(){
		$(".next").on("tap", function(){
			$("#content").css("top", "0px");
			startHarvsetObj.clearGoods();
			if(isCompleted){
				qmpur.toast(i18n_harvest_all_the_goods);			
			}
			/*清空商品*/
//			qmpur.ajax({              /*点击继续收货获取商品信息*/
//				url: startHarvsetObj.Configs.nextReceiveUrl + "&barcode=6944649700157",    
//				success: function(data) {
//					startHarvsetObj.goodsInfo(data);
//				}
//			});
		});
	},
	/*商品详细信息*/
	goodsInfo: function(data){
		var receiveStatus = data.receiveStatus;
		if(receiveStatus == 4){
			qmpur.toast(i18n_harvest_all_the_goods);
		} else {
			$(".goodsName input").val(data.goodsName); /*商品名字*/
			$(".barcode input").val(data.barcode); /*商品条形码*/
			$(".purchaseAmount input").val(data.goodsNum); /*采购数量*/
			$(".unit").val(data.unit); /*商品单位*/
			$(".receiveCount input").val(data.receiveCount); /*已收数量*/
		}
	},
	/*清空商品信息*/
	clearGoods: function(){
		formReceiveDetailId = null;
		$("#goodsName").html(""); /*商品名字*/
		$(".testImg").hide();
		$("#producedTime").html(""); /*清空生产日期*/
		$(".barcode input").val(""); /*商品条形码*/
		$(".purchaseAmount input").val(""); /*采购数量*/
		$(".unit").val(""); /*商品单位*/
		$(".receiveCount input").val(""); /*已收数量*/
		setTimeout(function(){
            $(".barcode input").focus();
        }, 100);
	},
	/*确认收货*/
	confirmReceipt: function(){
		$(".footerBtn .confirm").on("tap", function(){
			$("#content").css("top", "0px");
			var barcode = $(".barcode input").val(); /*商品条形码*/
			var productDate = $("#producedTime").val(); /*生产日期*/
			var purchaseAmount = Number($(".purchaseAmount input").val()); /*收货数量*/
			var receiveCount = Number($(".receiveNum input").val()); /*收货数量*/
			var receivedAmount = Number($(".receiveCount input").val()); /*已收数量*/
			var collectNum = Number(purchaseAmount-receivedAmount); /*待收数量*/
			var selectTime = productDate.replace(/-/g,'/');
		 	var oldTime = (new Date(selectTime)).getTime(); //得到毫秒数  
		 	var now = new Date().getTime();
		 	if(oldTime > now){
		 		qmpur.toast(i18n_harvest_production_date_shall_not_be_more_than_today); /*生产日期与当前日期验证*/
		 		return false;
		 	}
			if(!barcode){
				qmpur.toast(i18n_harvest_please_commodity_bar_code); /*商品条形码验证*/
				return false;
			};
			if(!receiveCount){
				qmpur.toast(i18n_harvest_please_input_the_goods_quantity); /*收货数量验证*/
				return false;
			};
			if(!productDate){
				qmpur.toast(i18n_harvest_please_enter_the_date_of_production); /*生产日期验证*/
				return false;
			};
			if(receiveCount > collectNum){
				qmpur.toast(i18n_harvest_the_goods_quantity_is_not_greater_than_purchasing_quantity); /*收货数量与采购数量验证*/
				return false;
			}
			var params = {
				"id": formReceiveDetailId,
				"productDate": productDate,
				"receiveCount": receiveCount
			};
			if( receiveCount && productDate && barcode && receiveCount <= collectNum && oldTime <= now){
				startHarvsetObj.confirmCommit(params);
			};
		});
	},
	/*确认提交*/
	confirmCommit: function(params){
		qmpur.ajax({
			type:"post",
			data: JSON.stringify(params),
			url: startHarvsetObj.Configs.confirmCommitUrl,
			success: function(data) {
				startHarvsetObj.getReceiveOrder();
				formReceiveDetailId = data.id;
				id2Obj[params.id].haveReciveCount = data.haveReciveCount;
				$("#haveReciveCount").val(data.haveReciveCount);
				/*$("#result").text("");*/ /* 不再清空日期*/
				$(".receiveNum input").val(""); /*收货数量*/
			}
		});
	},
	/*结束收货退出*/
	finishHarvsetExit: function(){
		$(".footerBtn .end").click(function(){
			$("#content").css("top", "0px");
			var waitReceive = Number($(".waitReceive").text()); /*待收货*/
			var receivePartCount = Number($(".receivePartCount").text()); /*部分收货*/
			if(waitReceive != 0 || receivePartCount != 0){
				var btnArray = [i18n_com_confirm, i18n_com_cancel];
				mui.confirm(i18n_harvest_only_part_of_the_goods_confirm_from_receiving, i18n_com_reminder, btnArray, function(e) {
					if (e.index != 1) {
						startHarvsetObj.finishHarvset();
					}
				});
			} else {
				startHarvsetObj.finishHarvset();
			}
		});
	},
	/*结束收货*/
	finishHarvset: function(){
		qmpur.ajax({
			url: startHarvsetObj.Configs.finishHarvsetUrl,
			success: function(data) {
				qmpur.switchPage("index.html");
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
	/*页面初始化*/
	initialize: function() {
		this.getReceiveOrder();
		this.getGoodsInfo();
		this.continueHarvset();
		this.confirmReceipt();
		this.finishHarvsetExit();
		this.mobileBack();
		this.keyUp();
		this.keyDown();
	}
}

/**
 * description 页面初始化
 */
$(function() {
	startHarvsetObj.initialize();
	$(".barcode input").focus();	
})
