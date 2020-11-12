/**
 * @file            replenishment.js
 * @description     拣货js
 * @author          郝四海
 * @version         0.1.8
 * @date            2017/7/18
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var waitPickSum =0 , havePickSum= 0;
/**
 * description 新建一个对象
 */

var replenishmentObj = {
	Configs: {
		orderlist : userBasePath+"pickTask/getWaitPickOrder",
		createPickTask : userBasePath+"/pickTask/createPickTask",
		waitReplenishListUrl: userBasePath+ "replenish/waitForPicking", /*补货上架未完成接口*/
		setPickerUrl: userBasePath + "replenish/setPicker",/*领取任务*/
		clearPickerUrl: userBasePath + "replenish/clearPicker?orderId=",/*退回领取的任务*/
	},
	/*选项卡切换*/
	tabChange: function(){
		$(".nav li").on('tap',function(){
			$(this).addClass("active").siblings("li").removeClass("active");
			if($(this).hasClass("navreplenishment")){
				$(".replenishmentList").show(); /*显示待拣货的列表*/
				$(".pickedList").hide();  /*隐藏已拣货的列表*/
			} else {
				$(".pickedList").show();  /*显示已拣货的列表*/
				$(".replenishmentList").hide(); /*隐藏待拣货的列表*/
			}
		})
	},
	/*判断拣货的数量*/
	replenishmentNum: function(){
		if(waitPickSum > 0){
			var pickeNum = (waitPickSum > 99 ? "99+" : waitPickSum); /*获取待拣货的数量*/
			var pickedNum = havePickSum>99?"99+":havePickSum;; /*获取待拣货的数量*/
			$(".forreplenishment span").text(pickeNum)
			$(".picked span").text(pickedNum)
		} else {
//			$("#header").css("border","none")
//			$(".navreplenishment").hide();
		}
	},
	/*补货上架未完成列表*/
	getWaitReplenishList: function(){
		qmpur.ajax({
			url: replenishmentObj.Configs.waitReplenishListUrl,
			success: function(data) {
				$(".replenishmentList ").html("");
				var lis = "";
				var len = data.orders.length;
				$(".pickTitle button").removeClass("active");
				$(".pickTitle button").prop("disabled", true);
				if(len > 0) {
					$(".pickTitle div.l span").css("top", 0);
					$(".continueRe").show();
					$(".waitCount").text(i18n_picking_complete_or_return);
					var _order = data.orders[0];
					lis = lis + "<li>" +
						"<div>" +
						"<span class='leftTitle'>" + i18n_task_replenishment_num + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + _order.orderNo + "</span>" +
						"</div>" +
						"<div>" +
						"<span class='i18n leftTitle'>" + i18n_task_generate_time + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + qmpur.formatDate(_order.createDate) + "</span>" +
						"</div>" +
						"<div>" +
						"<button type='button' data-id='" + _order.id + "' data-status ='" + _order.status + "' class='button startPick i18n mui-btn r skip' >" + ("GEN_TASK" == _order.status ? i18n_picking_start : i18n_picking_continue) + "</button>" +
						'<button type="button" data-id="' + _order.id + '" class="button i18n mui-btn r return" >' + i18n_review_return + '</button>' +
						"</div>" +
						"</li>";
					$(".replenishmentList").html(lis);
					if(data.orders[0].status == "GEN_TASK") {
						$(".return").show();
					} else {
						$(".return").hide();
					}
				} else {
					$(".pickTitle div.l span").css("top", "10px");
					var waitCount = data.waitCount; /*待领任务数*/
					$(".continueRe").hide();
					if(!waitCount) {
						$(".pickTitle button").removeClass("active");
						$(".pickTitle button").prop("disabled", true);
						$(".waitCount").text(i18n_picking_no_task_can_be_received);
					} else {
						$(".pickTitle button").addClass("active");
						$(".pickTitle button").prop("disabled", false);
						$(".waitCount").text(i18n_picking_pending_order_num + waitCount + i18n_com_one + "!");
					}
				}
			}
		})
	},
	/*退回重新领取*/
	returnTask: function(){
		$(".replenishmentList ").on("tap", ".return", function() {
			var id = $(this).attr("data-id");
			var btnArray = [i18n_com_confirm, i18n_com_cancel];
			mui.confirm(i18n_picking_are_you_sure_you_want_to_return_this_task, i18n_com_reminder, btnArray, function(e) {
				if (e.index != 1) {
					qmpur.ajax({
						url: replenishmentObj.Configs.clearPickerUrl + id,
						success: function() {
							replenishmentObj.getWaitReplenishList();
						}
					})
				}
			});
		})
	},
	/*领取拣货任务*/
	receiveTask: function() {
		$(".pickTitle").on("tap", "button", function() {
			qmpur.ajax({
				url: replenishmentObj.Configs.setPickerUrl,
				success: function() {
					replenishmentObj.getWaitReplenishList();
				}
			})
		})
	},
	/*页面跳转*/
	skip: function(){
		$(".replenishmentList").on("tap", ".skip", function(){
			var orderId = $(this).attr("data-id");
			qmpur.switchPage("startReplenishment.html?orderId="+orderId);
		});
	},
	/*页面返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("task.html");
		};
	},
	/*页面初始化*/
	initialize: function(){
		/*this.tabChange(); 选项卡切换*/
		this.getWaitReplenishList();
		this.skip();
		this.mobileBack();
		this.receiveTask();
		this.returnTask();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	replenishmentObj.initialize();
})