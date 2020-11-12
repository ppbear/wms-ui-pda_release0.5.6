/**
 * @file            startReview.js
 * @description     复核界面
 * @author          郝四海
 * @version         0.2.2
 * @date            2017/7/26
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var id = qmpur.getQueryString("id"); /*订单id*/
var orderNo = qmpur.getQueryString("orderNo"); /*订单单号*/
var goodsList = [];/*存储商品的数组*/
var orderInfoId = "";
var goodsId = "";/*商品id*/
var orderDetailId = "";
var _this = '';

/**
 * description 新建一个对象
 */

var startReviewObj = {
	Configs: {
		reviewOrderUrl: userBasePath + "waveOrder/getCheckNum?orderId=" + id, /*获取复核单接口*/
		reviewOrderGoodsUrl: userBasePath + "waveOrder/getDetailByBarcode?orderId=" + id, /*条形码查询商品信息*/
		toCheckUrl: userBasePath + "waveOrder/toCheck",  /*复核核对接口*/
		backOrRepickUrl: userBasePath + "checkFollowup", /*复核退回或补货接口*/
		findByBarcodeUrl: userBasePath + "goodsInfo/findByBarcode?barcode=", /*复核错误查询商品接口*/
		findStockDetailsUrl: userBasePath + "goodsStock/findStockDetails?goodsInfoId=",  /*通过商品id回现商品日期*/
		returnUrl: userBasePath + "checkFollowup/errorBack"  /*退回提交*/
	},
	/*获取复核的种类*/
	getReviewOrder: function(){
		qmpur.ajax({
			url: startReviewObj.Configs.reviewOrderUrl,
			success: function(data) {
				if(data){
					$(".awaitCheckNum").text(data.awaitCheckNum); /*待复核*/
					$(".isCheckedNum").text(data.isCheckedNum); /*已复核*/
					var abnormalReview = data.backOrRepickNum; /*退回和补货数量*/
					if(0 < abnormalReview && abnormalReview <= 9){
						$(".abnormalReview span").text(abnormalReview);/*退货或退回的数量*/
						$(".abnormalReview").show();
					} else if (abnormalReview > 9){
						$(".abnormalReview span").text("9+");/*退货或退回的数量*/
					} else {
						$(".abnormalReview").hide();
					}
					var forReceiveDetailsLen = data.awaitCheckDetails.length;
				var receivePartDetailsLen = data.isCheckedDetails.length;
				var forReceiveDetailsList = "";
				var receivePartDetailsList = "";
				/*待收货*/
				$(".forReceiveDetails").html("");
				for(var i = 0; i < forReceiveDetailsLen; i++){
					forReceiveDetailsList += '<li>';
					forReceiveDetailsList += '<div class="omit">'+ data.awaitCheckDetails[i].goodsInfo.name +'</div>';
					forReceiveDetailsList += '<div>';
					forReceiveDetailsList += '<span class="l">';
					forReceiveDetailsList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					forReceiveDetailsList += '<span>'+ data.awaitCheckDetails[i].goodsInfo.standard +'</span>';
					forReceiveDetailsList += '</span>';
					forReceiveDetailsList += '<span class="r">';
					forReceiveDetailsList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					forReceiveDetailsList += '<span>'+ data.awaitCheckDetails[i].goodsInfo.barcode +'</span>';
					forReceiveDetailsList += '</span>';
					forReceiveDetailsList += '</div>';
					forReceiveDetailsList += '</li>';
				}
				$(".forReceiveDetails").append(forReceiveDetailsList);
				/*部分收货*/
				$(".receivePartDetails").html("");
				for(var i = 0; i < receivePartDetailsLen; i++){
					receivePartDetailsList += '<li>';
					receivePartDetailsList += '<div class="omit">'+ data.isCheckedDetails[i].goodsInfo.name +'</div>';
					receivePartDetailsList += '<div>';
					receivePartDetailsList += '<span class="l">';
					receivePartDetailsList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					receivePartDetailsList += '<span>'+ data.isCheckedDetails[i].goodsInfo.standard +'</span>';
					receivePartDetailsList += '</span>';
					receivePartDetailsList += '<span class="r">';
					receivePartDetailsList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					receivePartDetailsList += '<span>'+ data.isCheckedDetails[i].goodsInfo.barcode +'</span>';
					receivePartDetailsList += '</span>';
					receivePartDetailsList += '</div>';
					receivePartDetailsList += '</li>';
				}
				$(".receivePartDetails").append(receivePartDetailsList);
				}
			}
		});
	},
	/*搜索订单*/
	searchOrder: function(){
		$(".barcode input").change(function(){
			var searchName = $(".barcode input").val(); /*获取搜索输入的内容*/
			if(searchName){
				startReviewObj.getGoodsInfo(searchName);
			}
		})
	},
	/*头部导航切换*/
	navChange: function(){
		$(".headerNav li").on("tap", function(){
			var _index = $(this).index();
			var num = $(this).find(".harvestNum").text();
			$(".noInfo").text(i18n_review_no_data);
			if($(this).hasClass("active")){
				$(this).removeClass("active");
				$(".harvestInfo ul").hide();	
				$(".contentInfo").show();
				$(".noInfo").hide();
			} else {
				$(this).addClass("active").siblings("li").removeClass("active");
				$(".harvestInfo ul").hide();
				$(".contentInfo").hide();
				$(".harvestInfo").find("ul").eq(_index).show();
				if(	num == 0){
					$(".noInfo").show();
				} else {
					$(".noInfo").hide();
				}
			}
		})
	},
	/*scan扫码判断*/
	scanJudge: function(){
		$(document).keyup(function (event) {
	        var code = event.keyCode;
	        var searchName = $(".barcode input").val(); /*获取搜索输入的内容*/
	        if(code == 120){
//	        	startReviewObj.getGoodsInfo(searchName);
//				startReviewObj.searchOrder();
	        } 
	    });
	},
	/*商品条形码查询*/
	getGoodsInfo: function(searchName){
		qmpur.ajax({
			url: startReviewObj.Configs.reviewOrderGoodsUrl + "&barcode=" + searchName,
			success: function(data) {
				if(data.length > 0){
					$(".goodList").html(""); /*清空数据*/
					var len = data.length;
					var obj = "";
					if(len == 1){
						var obj = "";
						var standard = data[0].goodsInfo.standard;
					} else {
						var obj = '<option>'+ i18n_com_please_select_the_product +'</option>';
						var standard = "";
					}
					$(".standard input").val(standard); /*规格*/
					var goodsObj = {};
					$(".testImg").show(); /*显示验证条形码验证图片*/
					for( var i = 0; i < len; i++){
						obj += "<option data-id ='"+ data[i].id +"' value ='" + data[i].goodsInfo.id + "' data-goodsStandard = '"+ data[i].goodsInfo.standard +"'>"+ data[i].goodsInfo.name +"</option>";
						goodsObj.goodsId = data[i].goodsInfo.id; /*商品id*/
						goodsObj.unit = data[i].goodsInfo.unit;  /*商品单位*/
						goodsObj.goodsNum = data[i].goodsNum;  /*商品采购数量*/
						goodsList.push(goodsObj);
//						$(".purchaseCount input").val(data[0].goodsNum); /*商品采购数量*/
						$(".unit").val(data[0].goodsInfo.unit); /*商品单位*/
						orderInfoId = data[0].waveOrder.id; /*获取订单商品id*/
						orderDetailId = data[0].id; 
					}
					$(".goodList").append(obj); /*追加商品*/
				} else {
					if($(".mui-popup").length == 0){
						var btnArray = [i18n_review_saul_was_wrong, i18n_review_pick_the_wrong];
						mui.confirm(i18n_review_not_find_the_goods, i18n_com_reminder, btnArray, function(e) {
							if (e.index == 1) {
								$(".mui-popup").hide();
								$(".mui-popup").remove();
								$(".returnNum").val(""); /*清空退回数量*/
								var  goodsBrcode = $(".barcode input").val(); /*商品条形码*/
								var result = startReviewObj.pickWrong(goodsBrcode);
								if(result) {
									$("#returnModel").show(); /*显示拣错模态框*/
								}else {
									$(".barcode input").val("");
									qmpur.toast(i18n_com_please_scan_or_enter_the_correct_bar_code);
								}
							} else {
								$(".barcode input").val(""); /*清空条形码*/
							}
						});
					}
				};
			}
		});
	},
	/*拣错商品商品名字回现*/
	pickWrong: function(goodsBrcode){
	    var result = false;
        qmpur.ajax({
            url: startReviewObj.Configs.findByBarcodeUrl + goodsBrcode,
            async:false,
            success: function(data) {
                if(data && data.length){
                    var len = data.length;
                    var pickWrongGoods = "";
                    $(".pickWrongGoods").html(""); /*清空商品名字*/
                    var goodsId = data[0].id; /*第一个商品的id*/
                    for(var i = 0; i < len; i++){
                        pickWrongGoods += "<option value='"+ data[i].id +"' data-unit='"+ data[i].unit +"'>"+ data[i].name +"</option>";
                    }
                    $(".pickWrongGoods").append(pickWrongGoods);
                    $(".pickUnit").val(data[0].unit);  /*拣错商品单位*/
                    startReviewObj.pickWrongGoodsDate(goodsId);
                    result = true;
                }else {
                    result = false;
                }
            }
        });
        return result;
    },
	/*拣错商品对进行日期筛选*/
	pickWrongGoodsChange: function(){
		$(".pickWrongGoods").change(function(){
			var goodsId = $(this).val(); /*选中商品的id*/
			$(".pickUnit").val($(this).attr("data-unit"));  /*拣错商品单位*/
			startReviewObj.pickWrongGoodsDate(goodsId);
		});
	},
	/*拣错商品日期接口数据回现*/
	pickWrongGoodsDate: function(goodsId){
		qmpur.ajax({
			url: startReviewObj.Configs.findStockDetailsUrl + goodsId,
			async:false,
			success: function(data) {
				if(data){
					var len = data.length;
					var goodsDate = "";
					$(".goodsDate").html(""); /*清空商品日期*/
					for(var i = 0; i < len; i++){
						goodsDate += "<option value='"+ data[i].id +"'>"+ qmpur.formatDate(data[i].productDate) +"</option>";
					}
					$(".goodsDate").append(goodsDate);
				}
			},
		});
	},
	/*退回确定*/
	returnConfirm: function(){
		$(".returnConfirm").on("tap", function(){
			var goodsInfoId = $(".pickWrongGoods").val(); /*选择的商品id*/
			var goodsStockId = $(".goodsDate").val(); /*商品库存id*/
			var handleGoodsNum = Number($(".returnNum").val());/*要退回的商品数量*/
			var params = {
				'waveOrderId': id,
				"goodsInfoId": goodsInfoId, /*选择的商品id*/
				"goodsStockId": goodsStockId, /*商品库存id*/
				"handleGoodsNum": handleGoodsNum,  /*要退回的商品数量*/
				"type":"BACK"  /*类型为退回*/
			};
			if (handleGoodsNum){
				startReviewObj.returnSubmit(params);
			} else {
				qmpur.toast(i18n_return_please_enter_an_integer_greater_than_zero);
			};
		});
	},
	/*退回提交*/
	returnSubmit: function(params){
		qmpur.ajax({
			url: startReviewObj.Configs.returnUrl,
			type: "post",
			data: JSON.stringify(params),
			success: function(data) {
				$("#returnModel").hide();
				startReviewObj.getReviewOrder();
				$(".barcode input").val(""); /*清空条形码*/
			},
		});
	},
	/*退回取消*/
	returnCancel: function(){
		$(".returnCancel").on("tap", function(){
			$("#returnModel").hide();
		});
	},
	/*商品名字筛选*/
	goodsChange: function(){
		$(".goodList").change(function(){
			goodsId = $(this).val(); /*获取选中的商品Id*/
			var len = goodsList.length;
			orderDetailId = $(this).find("option:selected").attr("data-id"); /*获取订单商品id*/
			var standard = $(this).find("option:selected").attr("data-goodsStandard"); /*获取订单商品规格*/
			$(".standard input").val(standard);
			for(var i = 0; i < len; i++){
				if(goodsId == goodsList[i].goodsId){
//					$(".purchaseCount input").val(goodsList[i].goodsNum); /*商品采购数量*/
					$(".unit").val(goodsList[i].unit); /*商品单位*/
				} else {
//					$(".purchaseCount input").val(""); /*商品采购数量*/
					$(".unit").val(""); /*商品单位*/
				}
			}
		})
	},
	/*确认收货*/
	confirmReceipt: function(){
		$(".footerBtn .confirmBtn").on("tap", function(){
			$("#content").css("top", "0px");
			var barcode = $(".barcode input").val(); /*商品条形码*/
			var reviewCount = Number($(".reviewCount input").val()); /*复核数量*/
			var purchaseCount = Number($(".purchaseCount input").val()); /*采购数量*/
			if(!barcode){
				qmpur.toast(i18n_harvest_please_commodity_bar_code); /*商品条形码验证*/
				return false;
			};
			if(!reviewCount){
				qmpur.toast(i18n_review_please_input_the_goods_quantity); /*复核数量验证*/
				return false;
			};
			var params = {
				"id": orderDetailId,
				"goodsNum": reviewCount
			};
			if( barcode && reviewCount){
				startReviewObj.confirmCommit(params, reviewCount);
			};
		});
	},
	/*确认提交*/
	confirmCommit: function(params, reviewCount){
		qmpur.ajax({
			type:"post",
			data: JSON.stringify(params),
			url: startReviewObj.Configs.toCheckUrl,
			success: function(data) {
				if(data > 0){
					var btnArray = [i18n_review_wait_for_return, i18n_review_re_check];
					mui.confirm(i18n_review_more_than_the_number_of_purchases, i18n_com_reminder, btnArray, function(e) {
						if (e.index == 1) {
							$(".reviewCount input").val(""); /*清空复核数量*/
							$(".reviewCount input").focus(); /*获取焦点*/
							startReviewObj.inputDisable();
						} else {
							startReviewObj.inputDisabled();
							var goodsId = $(".goodList").val();
							var goodsParams = {
								"waveOrderId": orderInfoId, /*订单id*/
								"goodsInfoId": goodsId, /*商品id*/
								"type": "BACK",   /*退换货类型*/
								"handleGoodsNum": data
							};
							startReviewObj.backOrRepick(goodsParams);
						}
					});
				} else if(data < 0) {
					var btnArray = [i18n_review_wait_for_replenishment, i18n_review_re_check];
					mui.confirm(i18n_review_less_than_the_number_of_purchases, i18n_com_reminder, btnArray, function(e) {
						if (e.index == 1) {
							$(".reviewCount input").val(""); /*清空复核数量*/
							$(".reviewCount input").focus(); /*获取焦点*/
							startReviewObj.inputDisable();
						} else {
							startReviewObj.inputDisabled();
							var goodsId = $(".goodList").val();
							var goodsParams = {
								"waveOrderId": orderInfoId, /*订单id*/
								"goodsInfoId": goodsId, /*商品id*/
								"type": "REPICK",   /*退换货类型*/
								"handleGoodsNum": -data
							};
							startReviewObj.backOrRepick(goodsParams);
						}
					});
				} else {
					$(".purchaseCount input").val(reviewCount);
					startReviewObj.getReviewOrder();
					$("#modelToast").show();  /*显示提示框*/
					$("#modelToast span").text(i18n_review_the_number_of_consistent);
					startReviewObj.inputDisabled();
					setTimeout(function(){
						$("#modelToast").hide();  /*隐藏提示框*/
						$(".footerBtn .nextBtn").click();
					},3000)
				}
			}
		});
	},
	/*继续复核*/
	continueReview: function(){
		$(".footerBtn .nextBtn").click(function(){
			$("#content").css("top", "0px");
			$(".barcode input").val(""); /*商品条形码*/
			awaitCheckNu = Number($(".awaitCheckNum").text()); /*待复核种类*/
			if(awaitCheckNu == 0){
				qmpur.toast(i18n_review_the_order_has_been_reviewed);
			}
			startReviewObj.clearGoods();
			startReviewObj.getReviewOrder();
			startReviewObj.inputDisable();
		});
	},
	/*置灰输入框*/
	inputDisabled: function(){
		$(".reviewCount input").prop("disabled", true); /*复核数量不可输入*/
		$(".barcode input").prop("disabled", true); /*条形码不可输入*/
		$(".goodList").prop("disabled", true); /*下拉框不可选*/
	},
	/*解禁输入框*/
	inputDisable: function(){
		$(".reviewCount input").prop("disabled", false); /*复核数量不可输入*/
		$(".barcode input").prop("disabled", false); /*条形码不可输入*/
		$(".goodList").prop("disabled", false); /*下拉框不可选*/
	},
	/*清空商品信息*/
	clearGoods: function(){
		$(".standard input").val("");/*清空单位*/
		$(".goodList").html(""); /*默认第一个被选中*/
//		$(".barcode input").val(""); /*商品条形码*/
		$(".testImg").hide();
		$(".purchaseCount input").val(""); /*采购数量*/
		$(".unit").val(""); /*商品单位*/
		$(".reviewCount input").val(""); /*已收数量*/
	},
	/*结束复核*/
	endReview: function(){
		$(".footerBtn .end").click(function(){
			$("#content").css("top", "0px");
			var awaitCheckNum = Number($(".awaitCheckNum").text()); /*带负荷数量*/
			if(awaitCheckNum){
				qmpur.toast(i18n_review_please_complete_the_review_of_all_the_goods);
			} else {
				$("#modelToast").show();  /*显示提示框*/
				$("#modelToast span").text(i18n_review_order_complete);
				startReviewObj.inputDisabled();
				setTimeout(function(){
					$("#modelToast").hide();  /*隐藏提示框*/
					qmpur.switchPage("review2.html");
				},650)
			}
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			$(".footerBtn .end").click();
		};
	},
	/*退回或补货接口*/
	backOrRepick: function(goodsParams){
		qmpur.ajax({
			url: startReviewObj.Configs.backOrRepickUrl,
			type: "post",
			data: JSON.stringify(goodsParams),
			success: function() {
				$("#modelToast").hide(); /*隐藏提示框*/
				startReviewObj.getReviewOrder();
			}
		});
	},
	/*跳转到退货和补货列表*/
	skipReturnOrRep: function(){
		$(".returnOrRep").on("tap",function(){
			$("#content").css("top", "0px");
			qmpur.switchPage("returnOrReplenishment.html?id="+ id+"&orderNo="+orderNo);
		});
	},
	/*弹起软件盘*/
	keyUp: function(){
		$(".reviewCount  input").click(function(){
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
		this.getReviewOrder();
		this.searchOrder();
		this.goodsChange();
		$(".orderNum").text(orderNo); /*订单单号*/
		this.confirmReceipt();
		this.continueReview();
		this.scanJudge();
		this.endReview();
		this.mobileBack();
		this.skipReturnOrRep();
		this.pickWrongGoodsChange();
		this.returnConfirm();
		this.returnCancel();
		this.navChange();
		this.keyUp();
		this.keyDown();
	}
}

/**
 * description 页面初始化
 */
$(function() {
	startReviewObj.initialize();
	$(".barcode input").focus();	
})