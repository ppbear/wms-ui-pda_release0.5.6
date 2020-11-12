/**
 * @file            picking.js
 * @description     拣货js
 * @author          刘路阳
 * @version         0.1.8
 * @date            2017/7/18
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var finalOrderId = qmpur.getQueryString("orderId");
var waitPickCounts = 0 , havePickCounts = 0;
var waitPickObj ;
var _this = "";

/**
 * description 新建一个对象
 */

var pickingObj = {
	Configs: {
		getPickTasks : userBasePath+"pickTask/getPickTasks?orderId="+finalOrderId,
		doPick : userBasePath+"/pickTask/doPick"
	},
	initOrderList: function(){
		qmpur.ajax({	
			url: pickingObj.Configs.getPickTasks ,
			success: function(data) {
				$("#locationCode").val("");
				$("#barcode").val("");
				$("#goodName").val("");
				$(".standard input").val("");
				$("#prePickNum").val("");
				$("#havPickNum").val("");
				$("#receiveNum").val("");
				$(".unit").val("");
				$("#locationCode").attr("placeholder","");
				$("#barcode").attr("placeholder","");
				$(".testImg").hide();
				$("#orderNumber").html(data.ORDER);
				waitPickCounts = data.WAITCOUNT;
				havePickCounts = data.DONECOUNT;
				$("#waitPickCounts").html(waitPickCounts);
				$("#havePickCounts").html(havePickCounts);
				if(data.WAIT.length > 0){
					waitPickObj = data.WAIT[0];
					$("#locationCode").attr("placeholder",waitPickObj.locationCode);
					$("#barcode").attr("placeholder",waitPickObj.barcode);
					$("#goodName").val(waitPickObj.goodName);
					$(".standard input").val(waitPickObj.standard);
					$(".unit").val(waitPickObj.unit);
					$("#prePickNum").val(waitPickObj.prePickNum);
					$("#havPickNum").val(waitPickObj.havPickNum);
				}
				setTimeout(function(){
				    $("#locationCode").focus();
				}, 200);
			}
		});
	},
	
	/*选项卡切换*/
	tabChange: function(){
		$(".nav li").on('tap',function(){
			$(this).addClass("active").siblings("li").removeClass("active");
			if($(this).hasClass("navPicking")){
				$(".pickingList").show(); /*显示待拣货的列表*/
				$(".pickedList").hide();  /*隐藏已拣货的列表*/
			} else {
				$(".pickedList").show();  /*显示已拣货的列表*/
				$(".pickingList").hide(); /*隐藏待拣货的列表*/
			}
		})
	},
	/**
	 * 库位编码
	 */
	locationCode:function(){
		$("#locationCode").blur(function(){
			var _code = $("#locationCode").val();
			if(_code == $("#locationCode").attr("placeholder")){
				$(".locationCodeTip").show();
				$("#barcode").focus();
				setTimeout(function(){
				    $("#barcode").focus();
				}, 200);
			}else{
				$(".locationCodeTip").hide();
				qmpur.toast(i18n_picking_plase_scan_right_location_code); 
			}
		});
	},
	/**
	 * 69码校验
	 */
	barcode:function(){
		$("#barcode").blur(function(){
			var _code = $("#barcode").val();
			if(_code == $("#barcode").attr("placeholder")){
				$(".barcodeTip").show();
				setTimeout(function(){
				    $("#receiveNum").focus();
				}, 200);
			}else{
				$(".barcodeTip").hide();
				qmpur.toast(i18n_picking_plase_scan_right_barcode); 
			}
		});
	},
	/*扫码*/
	scanJudge: function(){
		$(document).keyup(function (event) {
	        var code = event.keyCode;
	        if(code == 120){
	        } 
	    });
	},
	/* 收货数目校验*/
	receiveNum:function(){
		$("#receiveNum").bind('change',function(){
			var _num = $(this).val();
			if(!_num ){
				qmpur.toast(i18n_picking_plase_pickNum_is_null);
				return;
			}else if(_num < waitPickObj.prePickNum ){
				qmpur.toast(i18n_picking_plase_pickNum_is_not_enough);
				return;
			}else if(_num > waitPickObj.prePickNum ){
				qmpur.toast(i18n_picking_plase_pickNum_greater_pre);
				return;
			}
		});
	},
	/*确认*/
	confirm:function(){
		$(".confirm").click(function(){
			$("#content").css("top", "0px");
			var _locationCode = $("#locationCode").val();
			var _barcode = $("#barcode").val();
			var _num = $("#receiveNum").val();
			var prePickNum = $("#prePickNum").val(); /*目标数量*/
			if(!_locationCode || _locationCode !=waitPickObj.locationCode ){
				qmpur.toast(i18n_picking_plase_scan_right_location_code);
				return;
			}
			if(!_barcode || _barcode !=waitPickObj.barcode ){
				qmpur.toast(i18n_picking_plase_scan_right_barcode);
				return;
			}
			if(!_num ){
				qmpur.toast(i18n_picking_plase_pickNum_is_null);
				return;
			}else if(_num < waitPickObj.prePickNum ){
				qmpur.toast(i18n_picking_plase_pickNum_is_not_enough);
				return;
			}else if(_num > waitPickObj.prePickNum ){
				qmpur.toast(i18n_picking_plase_pickNum_greater_pre);
				return;
			}
			var params={
				id :waitPickObj.id,
				barcode:_barcode,
				locationCode:_locationCode,
				pickNum:_num
			};
			qmpur.ajax({	
				url: pickingObj.Configs.doPick ,
				type:'put',
				data: JSON.stringify(params),
				success: function(data) {
					$("#prePickNum").val(data.prePickNum);
					$("#havPickNum").val(data.havPickNum);
					waitPickCounts--;havePickCounts++;
					$("#waitPickCounts").html(waitPickCounts);
					$("#havePickCounts").html(havePickCounts);
					$("#receiveNum").val('');
					if(waitPickCounts == 0) {
					    $(".end").click();
					}else if(prePickNum == _num){
						$(".next").click();
					}
				}
			});
		});
	},
	/*判断拣货的数量*/
	pickingNum: function(){
		var pickeNum = (waitPickSum > 99 ? "99+" : waitPickSum); /*获取待拣货的数量*/
		var pickedNum = havePickSum>99?"99+":havePickSum;; /*获取待拣货的数量*/
		$(".forPicking span").text(pickeNum)
		$(".picked span").text(pickedNum)
	},
	/*下一个*/
	pickNext: function(){
		$(".next").click(function(){
			$("#content").css("top", "0px");
			pickingObj.initOrderList();
			if(waitPickCounts == 0){
				qmpur.toast(i18n_picking_task_is_completed);
				return;
			} else {
				setTimeout(function(){
	                $("#locationCode").focus();
	            }, 200);
			}
		});
	},
	/*结束*/
	pickEnd: function(){
		$(".end").on("tap", function(){
			$("#content").css("top", "0px");
			$("#maskModal").show();
		});
	},
	/*关闭遮罩层*/
	closeModal: function(){
		$("#maskModal").on("tap", function(){
			$("#maskModal").hide();
		})
	},
	/*弹起软件盘*/
	keyUp: function(){
		$("#receiveNum").click(function(){
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
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			//$(".end").click();
			if(waitPickCounts>0){
				qmpur.toast(i18n_picking_plase_complete_task);
				return;
			}else{
				qmpur.switchPage("picking.html");/*跳转收货页面*/
			}
		};
	},
	/*结束任务或者开始下一个*/
	startNext: function(){
		$("#maskModal li").on("tap", function(event){
			event.stopPropagation();
			if($(this).hasClass("endPut")){
				if(waitPickCounts>0){
					qmpur.toast(i18n_picking_plase_complete_task);
					return;
				}
				qmpur.switchPage("picking.html");/*跳转收货页面*/
			} else {
				qmpur.switchPage("pickStorage.html?orderId="+finalOrderId);/*跳转收货页面*/
			}
		})
	},
	initialize: function(){
		this.tabChange();
		this.initOrderList();
		this.locationCode();
		this.barcode();
		this.receiveNum();
		this.confirm();
		this.pickNext();
		this.pickEnd();
		this.mobileBack();
		this.scanJudge();
		this.keyUp();
		this.keyDown();
		this.closeModal();
		this.startNext();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	pickingObj.initialize();
	setTimeout(function(){
        $("#locationCode").focus();
    }, 200);
})