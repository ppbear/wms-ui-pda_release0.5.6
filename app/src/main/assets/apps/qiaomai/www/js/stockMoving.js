/**
 * @file            stockMovint.js
 * @description     库存移动页js
 * @author          刘路阳
 * @version         0.3.3
 * @date            2017/10/10
 * @copyright       河南巧脉信息技术有限公司
 */
var userBasePath = qmpur.Configs.userBasePath;
/**
 * description 新建一个对象
 */
var moveOrderId = window.localStorage.getItem("STOCK_MOVING_ORDER_ID");
var currentDetailId="";
var currentDetailState="NEW";
var smallGoodsId="";
var productDate = "";
var _this = '';
var pickCount='0';
var stockMovingObj = {
	Configs: {
		nextMoveItem : userBasePath+"stockMove/nextMoveItem?moveOrderId="+moveOrderId,
		doPickUrl : userBasePath+"/stockMove/doPick",
		doPlacementUrl : userBasePath+"/stockMove/doPlacement",
		unitUrl: qmpur.Configs.userBasePath + "stocktaking/pda/listUnits/",/*筛选单位*/
		stockCheckUrl : userBasePath+"stockMove/stockCheck" //目标库位校验
	},
	/*移库移动代办列表*/
	initNextMoveItem: function(){
		currentDetailId="";
		pickCount = '0';
		stockMovingObj.clear();
		qmpur.ajax({
			url: stockMovingObj.Configs.nextMoveItem,
			async:false,
			success: function(data) {
				if(data){
					currentDetailState = data.status;
					currentDetailId = data.id;
					smallGoodsId = data.goodsInfo.id;
					productDate = data.productDate;
					$("#sourceLocationCode").attr("placeholder",data.sourceStockCode);
					$("#barcode").attr("placeholder",data.goodsInfo.barcode);
					$("#goodsName").val(data.goodsInfo.name);
					$("#productDate").val(data.productDate);
					
					$("#stockQuantity").val(data.sourceGoodsCount);
					$("#stockQuantity").attr("realvalue",data.sourceGoodsCount);
					
					$("#havePickQuantity").val(data.pickCount);
					$("#havePickQuantity").attr("realvalue",data.pickCount);
					
					$("#pickQuantity").val("");
					$("#pickQuantity").attr("realvalue",0);
					stockMovingObj.getUnitList(data.goodsInfo.id);
					setTimeout(function(){
					    $("#sourceLocationCode").focus();
					    $("#sourceLocationCode").click();
					}, 200);
				}else{
					//没有下一个库位
					qmpur.toast(i18n_task_stockMove_pick_all_item);
				}
			}
		});
	},
	
	barcodeCheck: function(){
		$("#barcode").removeClass("active");
		$(".barcodeImg").hide();
		
		var val = $("#barcode").val().trim();
		var barcode =  $("#barcode").attr("placeholder");
		if(!val){
			qmpur.toast(i18n_task_stockMove_msg_please_scan_barcode);
			$("#barcode").addClass("active");
			return false;
		}else if(val != barcode){
			qmpur.toast(i18n_task_stockMove_msg_please_scan_right_barcode);
			$("#barcode").addClass("active");
			return false;
		}else{
			$("#pickQuantity").focus();
			$(".barcodeImg").show();
			return true;
		}
	},
	sourceLocationCodeCheck: function(){
			$("#sourceLocationCode").removeClass("active");
			$(".sourceLocationImg").hide();
			var val = $("#sourceLocationCode").val().trim();
			var sourceLocationCode =  $("#sourceLocationCode").attr("placeholder");
			if(!val){
				qmpur.toast(i18n_task_stockMove_msg_please_scan_location_code);
				$("#sourceLocationCode").addClass("active");
				return false;
			}else if(val != sourceLocationCode){
				qmpur.toast(i18n_task_stockMove_msg_please_scan_right_location_code);
				$("#sourceLocationCode").addClass("active");
				return false;
			}else{
				$(".sourceLocationImg").show();
				return true;
			}
	},
	pickQuantityCheck:function(){
		$("#pickQuantity").removeClass("active");
		var val = $("#pickQuantity").val().trim();
		var havePickNum = $("#havePickQuantity").attr("realvalue")*1;/*已拣(最小单位数目)*/
		var stockQuantity = $("#stockQuantity").attr("realvalue")*1;/*库存(最小单位数目)*/
		var smallestCount= $("#goodsUnit option:selected").attr("data-unit");
		var realVal = qmpur.unitCalcu(val, smallestCount);/*本次拣货数目(最小单位数目)*/
		//havePickNum = $("#stockQuantity").attr("realvalue")
		//stockQuantity = qmpur.unitCalcu(stockQuantity, smallestCount);
		if(!val||val<=0){
			qmpur.toast(i18n_task_stockMove_msg_please_input_the_goods_quantity);
			$("#pickQuantity").addClass("active");
			return false;
		}else if(realVal + havePickNum > stockQuantity){
			qmpur.toast(i18n_task_stockMove_msg_pickNum_large_than_stock_quantity);
			$(this).val(stockQuantity-havePickNum);
			$("#pickQuantity").addClass("active");
			return false;
		}else{
			var unitTime = $("#goodsUnit option:selected").attr("data-unit")*1;
			$("#pickQuantity").attr("realvalue",realVal);
			return true;
		}
	},
	/*目标库位校验 true 通过，false不通过*/
	stockCheck: function(){
		$(".targetLocationImg").hide();
		$("#targetLocation").removeClass("active");
		var flag = false;
		var val = $("#sourceLocationCode").val().trim();
		var sourceLocationCode =  $("#sourceLocationCode").attr("placeholder");
		var targetLocationCode = $("#targetLocation").val().trim();
		
		if(targetLocationCode!=null && targetLocationCode.length>0){
			qmpur.ajax({
				url: stockMovingObj.Configs.stockCheckUrl+"?productDate=" + productDate + "&goodsInfoId=" + smallGoodsId + "&sourceStockCode="+sourceLocationCode+"&targetStockCode="+targetLocationCode,
				async:false,
				success: function(data) {
					flag = true;
					$(".targetLocationImg").show();
					 $("#content").css("top", "0px");
					return flag;
				},
				error:function(){
					$("#targetLocation").addClass("active");
					return flag;
				}
			});
			return flag;
			
		}else{
			qmpur.toast(i18n_task_stockMove_msg_please_scan_target_location_code);
			$("#targetLocation").addClass("active");
			return flag;
		}
	},
	goodsUnitChange:function(){
		var unitTime = $("#goodsUnit option:selected").attr("data-unit");
		$(".unit").val($("#goodsUnit option:selected").val());/*商品单位*/
		$("#stockQuantity").val(qmpur.unitCon($("#stockQuantity").attr("realvalue"),unitTime));
		$("#pickQuantity").val(qmpur.unitCon($("#pickQuantity").attr("realvalue"),unitTime));
		$("#havePickQuantity").val(qmpur.unitCon($("#havePickQuantity").attr("realvalue"),unitTime));
	},
	
	/**初始化页面事件*/
	pageInit:function(){
		/** 来源库位*/
		$("#sourceLocationCode").change(function(){
			stockMovingObj.sourceLocationCodeCheck();
		});
		/** 目标库位*/
		$("#targetLocation").change(function(){
			stockMovingObj.stockCheck();
		});
		/**条形码*/
		$("#barcode").change(function(){
			stockMovingObj.barcodeCheck();
		});
		/** 捡货input*/
		$("#pickQuantity").change(function(){
			stockMovingObj.pickQuantityCheck();
		});
		/*修改单位*/
		$("#goodsUnit").change(function(){
			stockMovingObj.goodsUnitChange();
		});
	},
	/*获取单位列表*/
	getUnitList: function(goodsId){
		qmpur.ajax({
			url: stockMovingObj.Configs.unitUrl + goodsId,
			async:false,
			success: function(data){
				$("#goodsUnit").html("");
				if(data.length > 0){
					var len = data.length;
					var obj ="";
					var maxUnitId = data[0].id;
					var maxUnit = data[0].smallestCount;
					var currentUnitName =  data[0].unit;
					for(var i = 0; i < len; i++){
						if(maxUnit<data[i].smallestCount){
							maxUnitId = data[i].id;
							maxUnit = data[i].smallestCount;
							currentUnitName =  data[i].unit;
						}
					}
					for(var i = 0; i < len; i++){
						obj += "<option data-unit='"+ data[i].smallestCount +"' "+(data[i].id == maxUnitId? "selected":"" )+" value ='"+ data[i].unit +"'>"+ data[i].unit+"</option>";;
					}
					$("#goodsUnit").append(obj);
					$(".unit").val(currentUnitName);/*商品单位*/
				} else {
					$(".unit").val("");/*商品单位*/
				}
				stockMovingObj.goodsUnitChange();
			}
		})
	},
	
	/*点击捡货*/
	btnPick: function(){
		$(".btnPick").on("tap", function(){
			$("#content").css("top", "0px");
			var detailId = currentDetailId;
			//var pickQuantity = $("#pickQuantity").attr("realvalue");
			var val = $("#pickQuantity").val().trim();
			var havePickNum = $("#havePickQuantity").attr("realvalue")*1;/*已拣(最小单位数目)*/
			var stockQuantity = $("#stockQuantity").attr("realvalue")*1;/*库存(最小单位数目)*/
			var smallestCount= $("#goodsUnit option:selected").attr("data-unit");
			var pickQuantity = qmpur.unitCalcu(val, smallestCount);/*本次拣货数目(最小单位数目)*/
			
			var checkFlag = stockMovingObj.sourceLocationCodeCheck()&&stockMovingObj.barcodeCheck()&&stockMovingObj.pickQuantityCheck();
			if(checkFlag){
				qmpur.ajax({
					url: stockMovingObj.Configs.doPickUrl+"?detailId="+detailId+"&pickCount="+ pickQuantity,
					success: function(data) {
						if(data){
							currentDetailState = data.status;
							pickCount = data.pickCount;
							$("#havePickQuantity").attr("realvalue",data.pickCount);
							$("#pickQuantity").attr("realvalue","0");
							$("#goodsUnit").change();
						}
					}
				});
			}
		});
	},
	/*点击放置*/
	btnPlacement : function(){
		$(".btnPlacement").on("tap", function(){
			$("#content").css("top", "0px");
			qmpur.switchPage("placement.html?stockMoveId="+moveOrderId);
		});
	},
	/*恢复初始状态*/
	clear:function(){
			$("#sourceLocationCode").removeAttr("disabled").removeClass("readonly").val("");
			$("#targetLocation").removeAttr("disabled").removeClass("readonly").val("");
			$("#barcode").removeAttr("disabled").removeClass("readonly").val("");
			$("#pickQuantity").removeAttr("disabled").removeClass("readonly").val("0");
			$("#goodsUnit").removeAttr("disabled").removeClass("readonly");
			$(".testImg").hide();
	},
	/*下一个*/
	btnNext: function(){
		$(".next").on("tap", function(){
			$("#content").css("top", "0px");
			if(pickCount=='0'){
				qmpur.toast(stockMove.please_finish_current_item_before_next);
				return false;
			}
//			if("MOVE_OVER"!=currentDetailState){
//			}
			stockMovingObj.initNextMoveItem();
			//qmpur.switchPage("stockMoving.html");
		});
	},
	/*页面跳转*/
	skip: function(){
		$(".stockMoveList").on("tap", ".skip", function(){
			var orderId = $(this).attr("data-id");
			qmpur.switchPage("startstockMove.html?orderId="+orderId);
		});
	},
	/*页面返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("stockMove.html");
		};
	},
	/*弹起软件盘*/
	keyUp: function(){
		$(".showKeyWord").click(function(){
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
	initialize: function(){
		this.initNextMoveItem();
		this.pageInit();
		this.skip();
		this.btnPick();
		this.btnPlacement();
		this.btnNext();
		this.mobileBack();
		this.keyUp();
		this.keyDown();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	stockMovingObj.initialize();
});
