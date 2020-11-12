/**
 * @file            stockMove.js
 * @description     库存移动列表页js
 * @author          刘路阳
 * @version         0.3.3
 * @date            2017/10/10
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
/**
 * description 新建一个对象
 */
var stockMoveObj = {
	Configs: {
		getWaitMoveListUrl : userBasePath+"stockMove/waitForPicking", /*获取代办接口*/
		doMoveUrl : userBasePath+"/pickTask/createPickTask",
		setPickerUrl: userBasePath + "stockMove/setPicker",/*领取任务*/
		clearPickerUrl: userBasePath + "stockMove/clearPicker?orderId=",/*退回领取的任务*/
		pickGoodsUrl: qmpur.Configs.userBasePath + "stockMove/pickTaskOfMove"/*拣货*/
	},
	/*添加开始移库*/
	doMoveInit:function(){
		$(".stockMoveList").on("tap", ".doMove", function(){
			var id = $(this).attr("data-id");
			var _status = $(this).attr("data-status");
			window.localStorage.setItem("STOCK_MOVING_ORDER_ID",id);
			qmpur.switchPage("stockMoving.html");/*跳转收货页面*/
		});
	},
	/*移库移动代办列表*/
	getWaitMoveList: function(){
		qmpur.ajax({
			url: stockMoveObj.Configs.getWaitMoveListUrl,
			success: function(data) {
				$(".stockMoveList").html("");
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
						"<span class='leftTitle'>" + i18n_task_move_order_num + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + _order.orderNo + "</span>" +
						"</div>" +
						"<div>" +
						"<span class='i18n leftTitle'>" + i18n_task_generate_time + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + qmpur.formatDate(_order.createDate) + "</span>" +
						"</div>" +
						"<div>" +
						"<button type='button' data-id='" + _order.id + "' data-status ='" + _order.status + "' class='button startPick i18n mui-btn skip r' >" + ("HAS_SEL" == _order.status ? i18n_picking_start : i18n_picking_continue) + "</button>" +
						'<button type="button" data-id="' + _order.id + '" class="button i18n mui-btn r return" >' + i18n_review_return + '</button>' +
						"</div>" +
						"</li>";
					$(".stockMoveList").html(lis);
					if(data.orders[0].status == "HAS_SEL") {
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
		});
	},
	/*退回重新领取*/
	returnTask: function(){
		$(".stockMoveList ").on("tap", ".return", function() {
			var id = $(this).attr("data-id");
			var btnArray = [i18n_com_confirm, i18n_com_cancel];
			mui.confirm(i18n_picking_are_you_sure_you_want_to_return_this_task, i18n_com_reminder, btnArray, function(e) {
				if (e.index != 1) {
					qmpur.ajax({
						url: stockMoveObj.Configs.clearPickerUrl + id,
						success: function() {
							stockMoveObj.getWaitMoveList();
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
				url: stockMoveObj.Configs.setPickerUrl,
				success: function() {
					stockMoveObj.getWaitMoveList();
				}
			})
		})
	},
	/*页面跳转*/
	skip: function(){
		$(".stockMoveList").on("tap", ".skip", function(){
			var id = $(this).attr("data-id");
			window.localStorage.setItem("STOCK_MOVING_ORDER_ID",id);
			qmpur.switchPage("stockMoving.html");/*跳转收货页面*/
		});
	},
	/*页面返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("task.html");
		};
	},
	/*新增库位移动任务 */
	createStockMove:function(){
		$("#createStockMove").on("tap",function(){
			var params={
				"pickCount":"0",
				"goodsStockId":"chackPdaCrate",
				"stockMoveId":"chackPdaCrate",
				"stockMoveDetailId":"chackPdaCrate"
			}
			qmpur.ajax({
				url: stockMoveObj.Configs.pickGoodsUrl,
				type:"post",
				data: JSON.stringify(params),
				success: function(data) {
					qmpur.switchPage("createStockMoving.html");/*跳转新增库位移动页面*/
				}
			});
		});
	},
	/*页面初始化*/
	initialize: function(){
		/*this.tabChange(); 选项卡切换*/
		this.doMoveInit();
		this.getWaitMoveList();
		this.skip();
		this.mobileBack();
		this.receiveTask();
		this.returnTask();
		this.createStockMove();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	stockMoveObj.initialize();
})