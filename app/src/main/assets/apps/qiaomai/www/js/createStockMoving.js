/**
 * @file            createStockMoving.js
 * @description     新增库位移动的拣货页面js
 * @author          杨蕊宇
 * @version         0.3.3
 * @date            2017/12/5
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
var _this = '';
var stockMoveId =qmpur.getQueryString("stockMoveId");
var allData={};
var detailID ="";
var createStockMovingObj = {
	Configs: {
		getLoactionUrl : userBasePath+"storageLocation/checkLocationCodeRepeat",//通过code获取库位信息
		getGoodsUrl: qmpur.Configs.userBasePath + "goodsStock/findStockByCodeAndBarcode", /*获取商品信息*/
		pickGoodsUrl: qmpur.Configs.userBasePath + "stockMove/pickTaskOfMove", /*拣货*/
		nextMoveItem : userBasePath+"stockMove/nextMoveItem?moveOrderId="+moveOrderId,
		doPickUrl : userBasePath+"/stockMove/doPick",
		doPlacementUrl : userBasePath+"/stockMove/doPlacement",
		unitUrl: qmpur.Configs.userBasePath + "stocktaking/pda/listUnits/",/*筛选单位*/
		stockCheckUrl : userBasePath+"stockMove/stockCheck" ,//目标库位校验
		getCheckNumUrl : userBasePath+"stockMove/getCheckNum" //获取已捡数量
	},

	/*条形码校验*/
	barcodeCheck: function(updateFlag){
		var flag = true;
		$("#barcode").removeClass("active");
		$(".barcodeImg").hide();
		var val = $("#barcode").val().trim();
		if(!val){
			qmpur.toast(i18n_task_stockMove_msg_please_scan_barcode);
			$("#barcode").addClass("active");
			return false;
		}
		return createStockMovingObj.getGoodsInfo(val,updateFlag);
		
	},
	/*获取商品数据*/
	getGoodsInfo: function(barcode,updateFlag){
		var flag = true;
		var val = $("#sourceLocationCode").val().trim();
		qmpur.ajax({
				url: createStockMovingObj.Configs.getGoodsUrl+"?barcode="+barcode+"&locationCode="+val,
				success: function(data) {
					allData = data;
					if(data && data.length>0){
						if(!updateFlag){
							$("#goodsName").html("");
							$("#goodsName").focus();
							$("#goodsName").click();
							flag = true;
							$(".barcodeImg").show();
							var len = data.length;
							if(len == 1){
								var obj = "";
								var goodsId = data[0].goodsInfo.id;
								createStockMovingObj.getUnitList(goodsId);
								var unitLens = data[0].goodsStock.length;
								$(".unit").val(data[0].goodsStock[unitLens-1].goodsInfo.unit);/*商品单位*/
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
							createStockMovingObj.goodsChange();
							if(len == 1){
								$("#goodsName").trigger("change");
							}
						}else{
							$(".barcodeImg").show();
						}
					}else{
						flag = false;
						$(".barcodeImg").hide();
						qmpur.toast(i18n_task_stockMove_msg_please_scan_right_barcode);
						$("#barcode").addClass("active");
					}
				}
			});
			return flag;
	},
	
	/*选择商品*/
	goodsChange:function(){
		$("#goodsName").change(function(){
			var val = $(this).val().split(":");
			var goodsId = val[0];
			createStockMovingObj.getUnitList(goodsId);
			//获取生产日期
			var j = val[1];
			var data = allData[j].goodsStock;
			var obj;
			if(data && data.length>0){
				var len = data.length;
				if(len == 1){
					$("#productDate").val(data[0].productDate);/*商生产日期*/
					$("#stockQuantity").val(data[0].availableStock);/*库存*/
					createStockMovingObj.goodsUnitChange();
				} else {
					obj = '<option value ="">'+ i18n_harvest_please_select_the_date_of_production +'</option>';
					$("#stockQuantity").val("");/*库存*/
				}
				var num={};
				var stockid={};
				for( var i = 0; i < len; i++){
					obj += "<option value ='"+ i +"' >"+ data[i].productDate +"</option>";
					num[i] = data[i].availableStock;
					stockid[i] = data[i].id;
				}
				$("#productDate").html(obj);
				createStockMovingObj.productDateChange(num,stockid);
				if(len == 1){
					$("#productDate").trigger("change",num,stockid);
				}
			}
		});
	},
	
	/*生产日期改变*/
	productDateChange: function(num,stockid){
		$("#productDate").change(function(){
			detailID = "";
			//获取已捡货数量
			var sourceLocationCode=$("#sourceLocationCode").val().trim();
			var barcode = $("#barcode").val().trim();
			var goodsName = $('#goodsName option:selected').text();
			var productDate =$('#productDate option:selected').text();
			var qurl =createStockMovingObj.Configs.getCheckNumUrl;
				qurl +="?barcode="+barcode+"&sourceLocationCode="+sourceLocationCode;
				qurl +="&goodsName="+goodsName+"&productDate="+productDate+"&stockMoveId="+stockMoveId;
			qmpur.ajax({
				url: qurl,
				async:false,
				success: function(data) {
					console.log(data);
					if(data!=null){
						detailID=data.id;
						$("#havePickQuantity").val(data.pickCount); /*已拣数量*/
						$("#havePickQuantity").attr("realvalue",data.pickCount); /*已拣数量*/
					}else{
						$("#havePickQuantity").val("0"); /*已拣数量*/
						$("#havePickQuantity").attr("realvalue",0); /*已拣数量*/
						//$("#havePickQuantity").attr("realvalue",num[i]); /*已拣数量*/
					}
				}
			});
			
			$("#pickQuantity").focus();
			$("#pickQuantity").click();
			
			var i = $(this).val();
			$("#stockQuantity").val(num[i]);
			$("#pickQuantity").val(""); /*拣货数量*/
			$("#stockQuantity").attr("stockId",stockid[i]);
			$("#stockQuantity").attr("realvalue",num[i]); /*库位库存数量*/
			//
			$("#pickQuantity").attr("realvalue","0"); /*拣货数量*/
			
			createStockMovingObj.goodsUnitChange();
		});
	},
	
	/*库位号校验*/
	sourceLocationCodeCheck: function(focusFlag){
		var flag = true;
		$("#sourceLocationCode").removeClass("active");
		$(".sourceLocationImg").hide();
		var val = $("#sourceLocationCode").val().trim();
		if(!val){
			qmpur.toast(i18n_task_stockMove_msg_please_scan_location_code);
			$("#sourceLocationCode").addClass("active");
			return false;
		}
		qmpur.ajax({
			url: createStockMovingObj.Configs.getLoactionUrl+"?locationCode="+val,
			success: function(data) {
				$(".sourceLocationImg").show();
				$("#sourceLocationCode").removeClass("active");
				if(!focusFlag){
					setTimeout(function(){
						$("#barcode").focus();
						$("#barcode").click();
					},500);
				}
			},
			error:function(){
				flag =false;
				$(".sourceLocationImg").hide();
				setTimeout(function(){
					$("#sourceLocationCode").addClass("active");
					$("#sourceLocationCode").focus();
					$("#sourceLocationCode").click();
				},500);
				
			}
		});
		return flag;
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
	
	goodsUnitChange:function(){
		var unitTime = $("#goodsUnit option:selected").attr("data-unit");
		$(".unit").val($("#goodsUnit option:selected").val());/*商品单位*/
		$("#stockQuantity").val(qmpur.unitCon($("#stockQuantity").attr("realvalue"),unitTime));
		$("#pickQuantity").val(qmpur.unitCon($("#pickQuantity").attr("realvalue"),unitTime));
		$("#havePickQuantity").val(qmpur.unitCon($("#havePickQuantity").attr("realvalue"),unitTime));
		if($("#pickQuantity").val()=="0"){
			$("#pickQuantity").val("");
		}
	},
	
	/**初始化页面事件*/
	pageInit:function(){
		/** 来源库位*/
		$("#sourceLocationCode").change(function(){
			createStockMovingObj.sourceLocationCodeCheck();
		});
		/**条形码*/
		$("#barcode").change(function(){
			createStockMovingObj.barcodeCheck();
		});
		/** 捡货input*/
		$("#pickQuantity").change(function(){
			createStockMovingObj.pickQuantityCheck();
		});
		/*修改单位*/
		$("#goodsUnit").change(function(){
			createStockMovingObj.goodsUnitChange();
		});
	},
	/*获取单位列表*/
	getUnitList: function(goodsId){
		qmpur.ajax({
			url: createStockMovingObj.Configs.unitUrl + goodsId,
			async:false,
			success: function(data){
				$("#goodsUnit").html("");
				if(data.length > 0){
					var len = data.length;
					var obj ="";
					var maxUnitId = data[0].id;
					var maxUnit = data[0].smallestCount;
					var currentUnitName =  data[0].unit;
					for(var i = len-1; i >0; i--){
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
				createStockMovingObj.goodsUnitChange();
			}
		})
	},
	
	/*点击捡货*/
	btnPick: function(){
		$(".btnPick").on("tap", function(){
			$("#content").css("top", "0px");
			var val = $("#pickQuantity").val().trim();
			var smallestCount= $("#goodsUnit option:selected").attr("data-unit");
			var realVal = qmpur.unitCalcu(val, smallestCount);/*本次拣货数目(最小单位数目)*/
			var checkFlag = createStockMovingObj.sourceLocationCodeCheck(true)&&createStockMovingObj.barcodeCheck(true)&&createStockMovingObj.pickQuantityCheck();
			if(checkFlag){
				var stockId = $("#stockQuantity").attr("stockId");
				var params={
					"pickCount":realVal,
					"goodsStockId":stockId,
					"stockMoveId":stockMoveId,
					"stockMoveDetailId":detailID
				}
				qmpur.ajax({
					url: createStockMovingObj.Configs.pickGoodsUrl,
					type:"post",
					data: JSON.stringify(params),
					success: function(data) {
						if(data){
							console.log(data);
							detailID= data.stockMoveDetailId;
							stockMoveId = data.stockMoveId;
							$("#havePickQuantity").attr("realvalue",data.pickCount);
							$("#pickQuantity").attr("realvalue","0");
							$("#havePickQuantity").val(data.pickCount);
							$("#pickQuantity").val("0");
							$("#goodsUnit").change();
						}
					}
				});
			}
		});
	},
	/*去放置*/
	btnPlacement : function(){
		$(".btnPlacement").on("tap", function(){
			$("#content").css("top", "0px");
			if(stockMoveId){
				qmpur.switchPage("placement.html?stockMoveId="+stockMoveId);
			}else{
				qmpur.toast(stockMove.please_do_pick_before_placement);
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
			qmpur.switchPage("createStockMoving.html?stockMoveId="+stockMoveId);
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
		setTimeout(function(){
			$("#sourceLocationCode").focus();
		},500);
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
	createStockMovingObj.initialize();
});
