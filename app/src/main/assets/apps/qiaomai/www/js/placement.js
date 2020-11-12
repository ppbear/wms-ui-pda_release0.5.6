/**
 * @file            placement.js
 * @description     新增库位移动的放置页面js
 * @author          杨蕊宇
 * @version         0.3.3
 * @date            2017/12/5
 * @copyright       河南巧脉信息技术有限公司
 */
var userBasePath = qmpur.Configs.userBasePath;
/**
 * description 新建一个对象
 */
var currentDetailId="";
var currentDetailState="NEW";
var allData={};
var stockMoveId =qmpur.getQueryString("stockMoveId");
var _this = '';
var placementObj = {
	Configs: {
		getGoodsUrl:userBasePath+"stockMove/findByBarCode?stockMoveId="+stockMoveId,//条形码校验
		doPlacementUrl : userBasePath+"/stockMove/doPlacementCount",//放置
		unitUrl: qmpur.Configs.userBasePath + "stocktaking/pda/listUnits/",/*筛选单位*/
		stockCheckUrl : userBasePath+"storageLocation/checkLocationCodeRepeat", //目标库位校验
		nextMoveItem : userBasePath+"stockMove/nextPutMoveItem?moveOrderId="+stockMoveId,
	},
	/*更改目标库位*/
	changeLocation:function(){
		$("#changeLocation").on("tap",function(){
			$("#changeLocation").val("");
			setTimeout(function(){
				$("#changeLocation").focus();
				$("#changeLocation").click();
			},500);
		});
	},
	/*条形码校验*/
	barcodeCheck: function(){
		var barcode = $("#barcode").val().trim();
		if(!barcode){
			qmpur.toast(i18n_task_stockMove_msg_please_scan_barcode);
			$("#barcode").addClass("active");
			return false;
		}
		qmpur.ajax({
			url: placementObj.Configs.getGoodsUrl+"&barCode="+barcode,
			success: function(data) {
				console.log(data);
				allData = data;
				console.log(data);
				$("#goodsName").html("");
				if(data && data.length>0){
					setTimeout(function(){
						$("#goodsName").focus();
						$("#goodsName").click();
					},500);
					
					$("#barcode").removeClass("active");
					$(".barcodeImg").show();
					var len = data.length;
					if(len == 1){
						var obj = "";
						var goodsId = data[0].goodsInfo.id;
						placementObj.getUnitList(goodsId);
						var detailLen = data[0].stockMoveDetail.length;
						$(".unit").val(data[0].stockMoveDetail[detailLen-1].goodsInfo.unit);/*商品单位*/
						$("#goodsName").val(data[0].goodsInfo.name);/*商品名称*/
					} else {
						var obj = '<option value ="">'+ i18n_com_please_select_the_product +'</option>';
						$(".unit").val(""); /*商品单位*/
					}
					var goodsObj = {};
					for( var i = 0; i < len; i++){
						obj += "<option value ='"+ data[i].goodsInfo.id +":"+i+"' >"+ data[i].goodsInfo.name +"</option>";
					}
					$("#goodsName").html(obj);
					placementObj.goodsChange();
					if(len == 1){
						$("#goodsName").trigger("change");
					}
				}else{
					qmpur.toast(i18n_task_stockMove_msg_please_scan_right_barcode);
					$("#barcode").addClass("active");
				}
			}
		});
	},
	
	pickQuantityCheck:function(){
		$("#placementNum").removeClass("active");
		var val = $("#pickQuantity").val().trim();
		var havePickNum = $("#havePlacement").attr("realvalue")*1;/*已拣(最小单位数目)*/
		var stockQuantity = $("#pickNum").attr("realvalue")*1;/*库存(最小单位数目)*/
		var smallestCount= $("#goodsUnit option:selected").attr("data-unit");
		var realVal = qmpur.unitCalcu(val, smallestCount);/*本次拣货数目(最小单位数目)*/
		//havePickNum = $("#stockQuantity").attr("realvalue")
		//stockQuantity = qmpur.unitCalcu(stockQuantity, smallestCount);
		if(!val||val<=0){
			qmpur.toast(i18n_task_stockMove_msg_please_input_the_goods_quantity);
			$("#placementNum").addClass("active");
			return false;
		}else if(realVal + havePickNum > stockQuantity){
			qmpur.toast(i18n_task_stockMove_msg_pickNum_large_than_stock_quantity);
			$(this).val(stockQuantity-havePickNum);
			$("#placementNum").addClass("active");
			return false;
		}else{
			var unitTime = $("#goodsUnit option:selected").attr("data-unit")*1;
			$("#placementNum").attr("realvalue",realVal);
			return true;
		}
	},
	/*库位号改变*/
	targetLocationChange:function(){
		$("#targetLocation").blur(function(){
			var flag = placementObj.stockCheck();
			if(flag){
				setTimeout(function(){
					$("#placementNum").focus();
					$("#placementNum").click();
				},500);
			}
		})
	},
	
	/*目标库位校验 true 通过，false不通过*/
	stockCheck: function(){
		//$(".targetLocationImg").hide();
		$("#targetLocation").removeClass("active");
		var flag = false;
		var targetLocationCode = $("#targetLocation").val().trim();
		
		if(targetLocationCode!=null && targetLocationCode.length>0){
			qmpur.ajax({
				url: placementObj.Configs.stockCheckUrl+"?locationCode="+targetLocationCode,
				async:false,
				success: function(data) {
					flag = true;
					//$(".targetLocationImg").show();
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
		
		$("#pickNum").val(qmpur.unitCon($("#pickNum").attr("realvalue"),unitTime));
		$("#havePlacement").val(qmpur.unitCon($("#havePlacement").attr("realvalue"),unitTime));
		$("#placementNum").val(qmpur.unitCon($("#placementNum").attr("realvalue"),unitTime));
		if($("#placementNum").val()=="0"){
			$("#placementNum").val("");
		}
	},
	
	/**初始化页面事件*/
	pageInit:function(){
		/** 来源库位*/
		$("#sourceLocationCode").change(function(){
			placementObj.sourceLocationCodeCheck();
		});
		/** 目标库位*/
		$("#targetLocation").change(function(){
			placementObj.stockCheck();
		});
		/**条形码*/
		$("#barcode").change(function(){
			placementObj.barcodeCheck();
		});
		/** 捡货input*/
		$("#pickQuantity").change(function(){
			placementObj.pickQuantityCheck();
		});
		/*修改单位*/
		$("#goodsUnit").change(function(){
			placementObj.goodsUnitChange();
		});
	},
	/*获取单位列表*/
	getUnitList: function(goodsId){
		qmpur.ajax({
			url: placementObj.Configs.unitUrl + goodsId,
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
				placementObj.goodsUnitChange();
			}
		})
	},

	/*点击放置*/
	btnPlacement : function(){
		$(".btnPlacement").on("tap", function(){
			$("#content").css("top", "0px");
			if(!placementObj.stockCheck()){
				return false;//先校验目标库位
			}
			var detailId = $("#placementNum").attr("detailId");
			var targetLocationCode = $("#targetLocation").val().trim();
			
			var val = $("#placementNum").val().trim();
			var smallestCount= $("#goodsUnit option:selected").attr("data-unit");
			var realVal = qmpur.unitCalcu(val, smallestCount);/*本次拣货数目(最小单位数目)*/
			
			placementObj.barcodeCheck();
			qmpur.ajax({
				url: placementObj.Configs.doPlacementUrl+"?detailId="+detailId+"&tagrgetLocationCode="+targetLocationCode.trim()+"&moveCount="+realVal,
				success: function(data) {
					if(data){
						//currentDetailState = data.status;
						currentDetailState = "MOVE_OVER";
						$("#changeLocation").attr("disabled","disabled");//不能再改目标库位
						$("#targetLocation").attr("disabled","disabled").addClass("readonly");
						
						
						$("#havePlacement").val(data.moveCount); /*已放数量*/
						$("#placementNum").val(""); /*放置数量*/
						
						$("#havePlacement").attr("realvalue",data.moveCount);
						$("#placementNum").attr("realvalue","0");
						
						placementObj.goodsUnitChange();
						
//							$("#pickQuantity").attr("disabled","disabled").addClass("readonly");
//							$("#sourceLocationCode").attr("disabled","disabled").addClass("readonly");
//							$("#barcode").attr("disabled","disabled").addClass("readonly");
//							
//							$("#goodsUnit").attr("disabled","disabled").addClass("readonly");
						qmpur.toast(i18n_task_stockMove_msg_move_success);
					}
				}
			});
		});
	},
	/*生产日期改变,num是捡货数组，putNum是已放数组，detailId是记录ID*/
	productDateChange: function(num,putNum,detailId){
		$("#productDate").change(function(){
			var i = $(this).val();
			$("#pickNum").val(num[i]); /*拣货数量*/
			$("#havePlacement").val(putNum[i]); /*已放数量*/
			$("#placementNum").val(""); /*放置数量*/
			
			$("#placementNum").attr("detailId",detailId[i]);//放置
			
			$("#pickNum").attr("realvalue",num[i]); /*拣货数量*/
			$("#havePlacement").attr("realvalue",putNum[i]); /*已放数量*/
			
			placementObj.goodsUnitChange();
			setTimeout(function(){
				$("#targetLocation").focus();
				$("#targetLocation").click();
			},500);
		
		});
	},
	/*选择商品*/
	goodsChange:function(){
		$("#goodsName").change(function(){
			var val = $(this).val().split(":");
			var goodsId = val[0];
			placementObj.getUnitList(goodsId);
			//获取生产日期
			var j = val[1];
			var data = allData[j].stockMoveDetail;
			if(data && data.length>0){
				var obj;
				var len = data.length;
				if(len == 1){
					$("#productDate").val(data[0].productDate);/*商生产日期*/
					$("#pickNum").val(data[0].pickCount);/*拣货数量*/
					placementObj.goodsUnitChange();
				} else {
					obj = '<option value ="">'+ i18n_harvest_please_select_the_date_of_production +'</option>';
				}
				var num={};
				var putNum={};
				var detailId={};
				for( var i = 0; i < len; i++){
					obj += "<option value ='"+ i +"' >"+ data[i].productDate +"</option>";
					num[i] = data[i].pickCount;
					detailId[i] = data[i].id;
					putNum[i] = data[i].moveCount;
				}
				$("#productDate").html(obj);
				placementObj.productDateChange(num,putNum,detailId);
				if(len == 1){
					$("#productDate").trigger("change",num,putNum,detailId);
				}
				setTimeout(function(){
					$("#productDate").focus();
					$("#productDate").click();
				},500);
			}
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
			if("MOVE_OVER"!=currentDetailState){
				qmpur.toast(stockMove.please_finish_current_item_before_next);
				return false;
			}
			qmpur.ajax({
				url: placementObj.Configs.nextMoveItem,
				async:false,
				success: function(data) {
					if(data){
						qmpur.switchPage("placement.html?stockMoveId="+stockMoveId);
					}else{
						//TODO stockMove.finish_current_item_all
						qmpur.switchPage("stockMove.html");/*跳转到列表页面*/
					}
				}
			});
		});
	},
	/*结束*/
	btnEnd: function(){
		$(".btnEnd").on("tap", function(){
			$("#content").css("top", "0px");
			if("MOVE_OVER"!=currentDetailState){
				qmpur.toast(stockMove.please_finish_current_item_before_next);
				return false;
			}
			qmpur.ajax({
				url: placementObj.Configs.nextMoveItem,
				async:false,
				success: function(data) {
					if(data){
						qmpur.toast(i18n_task_stockMove.un_finish_current_item_all);
					}else{
						qmpur.switchPage("stockMove.html");/*跳转到列表页面*/
					}
				}
			});
		});
	},
	/*页面跳转*/
	skip: function(){
		$(".stockMoveList").on("tap", ".skip", function(){
			var orderId = $(this).attr("data-id");
			qmpur.switchPage("startstockMove.html?orderId="+orderId);
		});
	},
	/*页面返回,返回去拣货页面*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("createStockMoving.html?stockMoveId="+stockMoveId);
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
		setTimeout(function(){
			$("#barcode").focus();
		},500);
		this.changeLocation();
		this.pageInit();
		this.skip();
		this.btnPlacement();
		this.btnNext();
		this.mobileBack();
		this.keyUp();
		this.keyDown();
		this.btnEnd();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	placementObj.initialize();
});
