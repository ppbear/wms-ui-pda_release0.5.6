/**
 * @file            inventory.js
 * @description     盘点js
 * @author          郝四海
 * @version         0.3.6
 * @date            2017/9/22
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */

var inventoryObj = {
	Configs: {
		unfinishDetailsUrl: qmpur.Configs.userBasePath + "stocktaking/waitForPicking", /*盘点列表*/
		setPickerUrl: qmpur.Configs.userBasePath + "stocktaking/setPicker",/*领取任务*/
		clearPickerUrl: qmpur.Configs.userBasePath + "stocktaking/clearPicker?orderId=",/*退回领取的任务*/
	},
	/*获取退货或补货数据*/
	getUnfinishDetails: function(){
		qmpur.ajax({
			url: inventoryObj.Configs.unfinishDetailsUrl,
			success: function(data) {
				$(".goodsList").html("");
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
						"<span class='leftTitle'>" + i18n_inventory_single_number + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + _order.stocktakingOrder.stocktakingNo + "</span>" +
						"</div>" +
						"<div>" +
						"<span class='i18n leftTitle'>" + i18n_harvest_goods_code + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + _order.goodsInfo.barcode + "</span>" +
						"</div>" +
						"<div>" +
						"<span class='i18n leftTitle'>" + i18n_harvest_goods_name + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" + _order.goodsInfo.name+ "</span>" +
						"</div>" +
						"<div>" +
						"<span class='i18n leftTitle'>" + i18n_task_generate_time + "</span>&nbsp;" +
						"<span class='orderNum rightContent'>" +qmpur.dateTimeUtil.formatDateTimeM(_order.stocktakingOrder.createDate) + "</span>" +
						"</div>" +
						"<div>" +
						"<button type='button' data-id='" + _order.id + "' data-url='startInventory.html?id="+ _order.id +"' data-status ='" + _order.status + "' class='r simulationA button forbacks mui-btn' >" + ("HAS_SEL" == _order.detailStatus ? i18n_picking_start : i18n_picking_continue) + "</button>" +
						'<button type="button" data-id="' + _order.id + '" class="button i18n mui-btn r return" >' + i18n_review_return + '</button>' +
						"</div>" +
						"</li>";
					$(".goodsList").html(lis);
					if(data.orders[0].detailStatus == "HAS_SEL") {
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
		$(".goodsList").on("tap", ".return", function() {
			var id = $(this).attr("data-id");
			var btnArray = [i18n_com_confirm, i18n_com_cancel];
			mui.confirm(i18n_picking_are_you_sure_you_want_to_return_this_task, i18n_com_reminder, btnArray, function(e) {
				if (e.index != 1) {
					qmpur.ajax({
						url: inventoryObj.Configs.clearPickerUrl + id,
						success: function() {
							inventoryObj.getUnfinishDetails();
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
				url: inventoryObj.Configs.setPickerUrl,
				success: function() {
					inventoryObj.getUnfinishDetails();
				}
			})
		})
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("task.html");
		};
	},
	/*页面初始化*/
	initialize: function(){
		this.getUnfinishDetails();
		this.mobileBack();
		this.receiveTask();
		this.returnTask();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	inventoryObj.initialize();
})