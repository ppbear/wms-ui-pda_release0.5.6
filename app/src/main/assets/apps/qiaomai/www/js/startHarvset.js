/**
 * @file            startHarvset.js
 * @description     收货界面
 * @author          郝四海
 * @version         0.1.8
 * @date            2017/7/10
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var id = qmpur.getQueryString("id");
var type = qmpur.getQueryString("type");
var otherOrderNo = qmpur.getQueryString("otherOrderNo");
if(otherOrderNo){
	$(".title").text(i18n_harvest+otherOrderNo);
} else {
	$(".title").text(i18n_harvest);
}
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
		finishHarvsetUrl: userBasePath + "receiveOrder/endReceive?orderId=" + id, /*结束收货*/
		orderType: 1
	},
	/*日期选择器*/
	pickerTime: function() {
		var result =  $("#result")[0];
		$(".produced").on('click', "button", function() {
			var now = new Date();
			var year = now.getFullYear(); /*获取当前年份*/
			var beginYear = year - 5; /*向前推5年*/
 			var today = new Date();
			var options = {
				"type": "date",
				"beginYear": beginYear,  /*开始年份*/
				'endDate': new Date(today.getFullYear(), today.getMonth(), today.getDate())          /*结束年份*/
			};
			var id = this.getAttribute('id');
			var picker = new mui.DtPicker(options);
			picker.show(function(rs) {
				result.innerText = rs.text; /*选择日期赋值*/
				picker.dispose();
				$(".receiveNum input").focus();
				setTimeout(function(){
					$(".receiveNum input").click();
				},100)
			}, false);
		});
	},
	/*点击input调用日期*/
	inputPickerTime: function(){
		$("#result").on("tap", function(){
			$(".produced button").click();
		})
	},
	/*获取已收货的种类*/
	getReceiveOrder: function(){
		qmpur.ajax({
			url: startHarvsetObj.Configs.receiveOrderUrl,
			success: function(data) {
				if(data.receiveOrder){
					startHarvsetObj.orderType = data.receiveOrder.type;
				}
				$(".waitReceive").text(data.forReceiveCount); /*待收货*/
				$(".receivePartCount").text(data.receivePartCount); /*部分收货*/
				$(".completeReceive").text(data.receiveAllCount); /*完成收货*/
				isCompleted = data.forReceiveCount == 0 &&  data.receivePartCount == 0;
				var forReceiveDetailsLen = data.forReceiveDetails.length;
				var receivePartDetailsLen = data.receivePartDetails.length;
				var receiveAllDetailsLen = data.receiveAllDetails.length;
				var forReceiveDetailsList = "";
				var receivePartDetailsList = "";
				var receiveAllDetailsLenList = "";
				/*待收货*/
				$(".forReceiveDetails").html("");
				for(var i = 0; i < forReceiveDetailsLen; i++){
					forReceiveDetailsList += '<li>';
					forReceiveDetailsList += '<div class="omit">'+ data.forReceiveDetails[i].goodsInfo.name +'</div>';
					forReceiveDetailsList += '<div>';
					forReceiveDetailsList += '<span class="l">';
					forReceiveDetailsList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					forReceiveDetailsList += '<span>'+ data.forReceiveDetails[i].goodsInfo.standard +'</span>';
					forReceiveDetailsList += '</span>';
					forReceiveDetailsList += '<span class="r">';
					forReceiveDetailsList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					forReceiveDetailsList += '<span>'+ data.forReceiveDetails[i].goodsInfo.barcode +'</span>';
					forReceiveDetailsList += '</span>';
					forReceiveDetailsList += '</div>';
					forReceiveDetailsList += '<div>';
					forReceiveDetailsList += '<span class="l">';
					forReceiveDetailsList += '<span class="gray">'+ i18n_index_purchase +'</span>&nbsp;';
					forReceiveDetailsList += '<span>'+ data.forReceiveDetails[i].goodsNum+''+data.forReceiveDetails[i].goodsInfo.unit +'</span>';
					forReceiveDetailsList += '</span>';
					forReceiveDetailsList += '<span class="r">';
					forReceiveDetailsList += '<span class="gray">'+ i18n_harvest_received +'</span>&nbsp;';
					forReceiveDetailsList += '<span class="red">'+ data.forReceiveDetails[i].haveReciveCount+''+data.forReceiveDetails[i].goodsInfo.unit +'</span>';
					forReceiveDetailsList += '</span>';
					forReceiveDetailsList += '</div>';
					forReceiveDetailsList += '</li>';
				}
				$(".forReceiveDetails").append(forReceiveDetailsList);
				/*部分收货*/
				$(".receivePartDetails").html("");
				for(var i = 0; i < receivePartDetailsLen; i++){
					receivePartDetailsList += '<li>';
					receivePartDetailsList += '<div class="omit">'+ data.receivePartDetails[i].goodsInfo.name +'</div>';
					receivePartDetailsList += '<div>';
					receivePartDetailsList += '<span class="l">';
					receivePartDetailsList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					receivePartDetailsList += '<span>'+ data.receivePartDetails[i].goodsInfo.standard +'</span>';
					receivePartDetailsList += '</span>';
					receivePartDetailsList += '<span class="r">';
					receivePartDetailsList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					receivePartDetailsList += '<span>'+ data.receivePartDetails[i].goodsInfo.barcode +'</span>';
					receivePartDetailsList += '</span>';
					receivePartDetailsList += '</div>';
					receivePartDetailsList += '<div>';
					receivePartDetailsList += '<span class="l">';
					receivePartDetailsList += '<span class="gray">'+ i18n_index_purchase +'</span>&nbsp;';
					receivePartDetailsList += '<span>'+ data.receivePartDetails[i].goodsNum+''+data.receivePartDetails[i].goodsInfo.unit +'</span>';
					receivePartDetailsList += '</span>';
					receivePartDetailsList += '<span class="r">';
					receivePartDetailsList += '<span class="gray">'+ i18n_harvest_received +'</span>&nbsp;';
					receivePartDetailsList += '<span class="red">'+ data.receivePartDetails[i].haveReciveCount+''+data.receivePartDetails[i].goodsInfo.unit +'</span>';
					receivePartDetailsList += '</span>';
					receivePartDetailsList += '</div>';
					receivePartDetailsList += '</li>';
				}
				$(".receivePartDetails").append(receivePartDetailsList);
				/*已收货*/
				$(".receiveAllDetails").html("");
				for(var i = 0; i < receiveAllDetailsLen; i++){
					receiveAllDetailsLenList += '<li>';
					receiveAllDetailsLenList += '<div class="omit">'+ data.receiveAllDetails[i].goodsInfo.name +'</div>';
					receiveAllDetailsLenList += '<div>';
					receiveAllDetailsLenList += '<span class="l">';
					receiveAllDetailsLenList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					receiveAllDetailsLenList += '<span>'+ data.receiveAllDetails[i].goodsInfo.standard +'</span>';
					receiveAllDetailsLenList += '</span>';
					receiveAllDetailsLenList += '<span class="r">';
					receiveAllDetailsLenList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					receiveAllDetailsLenList += '<span>'+ data.receiveAllDetails[i].goodsInfo.barcode +'</span>';
					receiveAllDetailsLenList += '</span>';
					receiveAllDetailsLenList += '</div>';
					receiveAllDetailsLenList += '<div>';
					receiveAllDetailsLenList += '<span class="l">';
					receiveAllDetailsLenList += '<span class="gray">'+ i18n_index_purchase +'</span>&nbsp;';
					receiveAllDetailsLenList += '<span>'+ data.receiveAllDetails[i].goodsNum+''+data.receiveAllDetails[i].goodsInfo.unit +'</span>';
					receiveAllDetailsLenList += '</span>';
					receiveAllDetailsLenList += '<span class="r">';
					receiveAllDetailsLenList += '<span class="gray">'+ i18n_harvest_received +'</span>&nbsp;';
					receiveAllDetailsLenList += '<span class="receivedKind">'+ data.receiveAllDetails[i].haveReciveCount+''+data.receiveAllDetails[i].goodsInfo.unit +'</span>';
					receiveAllDetailsLenList += '</span>';
					receiveAllDetailsLenList += '</div>';
					receiveAllDetailsLenList += '</li>';
				}
				$(".receiveAllDetails").append(receiveAllDetailsLenList);
			}
		});
	},
	/*头部导航切换*/
	navChange: function(){
		$(".headerNav li").on("tap", function(){
			var _index = $(this).index();
			var num = $(this).find(".harvestNum").text();
			$(".noInfo").text(i18n_harvest_no_data);
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
					if(null != data ){
						var flag = 1;
						for(var i = 0 ;i<data.length;i++){
							if(data[i].receiveStatus!=4){
								flag = 0;
								break;
							}
						}
						if(flag == 1){
							qmpur.toast(i18n_harvest_have_all_the_goods);
							$(".testImg").hide();
							return ;
						}
					}
					$(".testImg").show();
					name2goodsId={};
					id2Obj={};
					var len = data.length;
					var options ="" ;
					if(len==1){
						options ="" ;
						$(".standard input").val(data[0].goodsInfo.standard); /*商品规格*/
					} else {
						options ="<option value=''>"+ i18n_com_please_select_the_product+ "</option>";
					}
					for(var i= 0;i<len;i++){
						id2Obj[data[i].id]=data[i];
						if(!name2goodsId.hasOwnProperty(data[i].goodsInfo.id) && data[i].receiveStatus!=4){
							name2goodsId[data[i].goodsInfo.id] = {};
							name2goodsId[data[i].goodsInfo.id].productDates= [];
							options += "<option value='"+data[i].id+"' data-standard='"+ data[i].goodsInfo.standard +"'>"+data[i].goodsInfo.name+"</option>";
							name2goodsId[data[i].goodsInfo.id].name = data[i].goodsInfo.name;
						}
						
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
			if(waitPut!=null){
				$(".unit").val(waitPut.goodsInfo.unit); /*单位*/
				// $(".purchaseAmount input").val(""); /*同下：采购数量*/
				$("#goodsNum").val(waitPut.goodsNum); /*采购数量*/
				$("#haveReciveCount").val(waitPut.haveReciveCount); /*采购数量*/
				var standard = $("#goodsName").find("option:selected").attr("data-standard");
				$(".standard input").val(standard); /*商品规格*/
				formReceiveDetailId = waitPut.id;	
			}
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
			if(data.barcode){
				$(".testImg").show();
			} else {
				$(".testImg").hide();
			}
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
		$(".standard input").val(""); /*商品规格*/
		$(".testImg").hide();
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
			var productDate = $("#result").text(); /*生产日期*/
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
				if(!id2Obj[data.id]) {
                	id2Obj[data.id] = data;
                }
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
			url: startHarvsetObj.Configs.finishHarvsetUrl+"&type="+startHarvsetObj.orderType,
			success: function(data) {
				qmpur.switchPage("harvest.html");
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
		this.pickerTime();
		this.getReceiveOrder();
		this.getGoodsInfo();
		this.continueHarvset();
		this.confirmReceipt();
		this.finishHarvsetExit();
		this.mobileBack();
		this.inputPickerTime();
		this.keyUp();
		this.keyDown();
		this.navChange();
	}
}

/**
 * description 页面初始化
 */
$(function() {
	startHarvsetObj.initialize();
	$(".barcode input").focus();	
	
    
})
