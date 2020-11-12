/**
 * @file            returnOrReplenishment.js
 * @description     退货或补货列表js
 * @author          郝四海
 * @version         0.2.3
 * @date            2017/8/3
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var id = qmpur.getQueryString("id"); /*获取订单id*/
var orderNo = qmpur.getQueryString("orderNo"); /*订单单号*/
/**
 * description 新建一个对象
 */

var returnOrReplenishmentObj = {
	Configs: {
		checkFollowupUrl: userBasePath + "checkFollowup?waveOrderId=" + id,
	},
	/*获取退货或补货数据*/
	getGoodsInfo: function(){
		qmpur.ajax({
			url: returnOrReplenishmentObj.Configs.checkFollowupUrl,
			success: function(data) {
				var returnList = ""; /*退货列表*/
				var repicksList = ""; /*补货列表*/
				$(".returnList").html("");
				$(".repicksList").html("");
				if(data){
					var returnLen = data.forbacks.length; /*退货*/
					$(".forPicking span").text(returnLen);/*退货数量*/
					returnLen > 0 ? $(".forPicking").show() : $(".forPicking").hide();
					var repicksLen = data.repicks.length; /*补货*/
					$(".picked span").text(repicksLen);/*补货数量*/
					repicksLen > 0 ? $(".picked").show() : $(".picked").hide();
					/*退货列表*/
					for(var i = 0; i < returnLen; i++){                 
						returnList += "<li>";
						returnList += "<div>";
						returnList += "<span class='leftTitle'>"+ i18n_harvest_goods_code +"</span>&nbsp;";
						returnList += "<span class='rightContent'>"+ data.forbacks[i].goodsInfo.barcode +"</span>";
						returnList += "</div>";
						returnList += "<div class='omit'>";
						returnList += "<span class='leftTitle'>"+ i18n_harvest_goods_name +"</span>&nbsp;";
						returnList += "<span class='rightContent'>"+ data.forbacks[i].goodsInfo.name +"</span>";
						returnList += "</div>";
						returnList += "<div>";
						returnList += "<span class='leftTitle'>"+ i18n_harvest_date_in_produced +"</span>&nbsp;";
						returnList += "<span class='rightContent'>"+ qmpur.formatDate(data.forbacks[i].productDate) +"</span>";
						returnList += "</div>";
						returnList += "<div>";
						returnList += "<span class='leftTitle'>"+ i18n_com_num +"</span>&nbsp;";
						returnList += "<span class='rightContent'>"+ data.forbacks[i].handleGoodsNum+"</span>";
						returnList += "<span class='rightContent'>"+ data.forbacks[i].goodsInfo.unit +"</span>";
						returnList += "</div>";
						returnList += "<div>";
						returnList += "<span class='leftTitle'>"+ i18n_picking_location_code +"</span>&nbsp;";
						returnList += "<span class='rightContent'>"+ data.forbacks[i].storageLocationCode +"</span>";
						returnList += "</div>";
						returnList += "<button data-id='"+ data.forbacks[i].id +"' type='button' class='button forbacks mui-btn'>"+ i18n_review_return +"</button>";
						returnList += "</li>";
					}
					$(".returnList").append(returnList);
					/*补货列表*/
					for(var j = 0; j < repicksLen; j++){
						repicksList += "<li>";
						repicksList += "<div>";
						repicksList += "<span class='leftTitle'>"+ i18n_harvest_goods_code +"</span>&nbsp;";
						repicksList += "<span class='rightContent'>"+ data.repicks[j].goodsInfo.barcode +"</span>";
						repicksList += "</div>";
						repicksList += "<div class='omit'>";
						repicksList += "<span class='leftTitle'>"+ i18n_harvest_goods_name +"</span>&nbsp;";
						repicksList += "<span class='rightContent'>"+ data.repicks[j].goodsInfo.name +"</span>";
						repicksList += "</div>";
						repicksList += "<div>";
						repicksList += "<span class='leftTitle'>"+ i18n_harvest_date_in_produced +"</span>&nbsp;";
						repicksList += "<span class='rightContent'>"+ qmpur.formatDate(data.repicks[j].productDate) +"</span>";
						repicksList += "</div>";
						repicksList += "<div>";
						repicksList += "<span class='leftTitle'>"+ i18n_com_num +"</span>&nbsp;";
						repicksList += "<span class='rightContent'>"+ data.repicks[j].handleGoodsNum+"</span>";
						repicksList += "<span class='rightContent'>"+ data.repicks[j].goodsInfo.unit +"</span>";
						repicksList += "</div>";
						repicksList += "<div>";
						repicksList += "<span class='leftTitle'>"+ i18n_picking_location_code +"</span>&nbsp;";
						repicksList += "<span class='rightContent'>"+ data.repicks[j].storageLocationCode +"</span>";
						repicksList += "</div>";
						repicksList += "<button data-id='"+ data.repicks[j].id +"' type='button' class='button repicks mui-btn'>"+ i18n_review_replenishment +"</button>";
						repicksList += "</li>";
					}
					$(".repicksList").append(repicksList);
					returnOrReplenishmentObj.pickingNum();
				}
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
	/*判断拣货的数量*/
	pickingNum: function(){
		var pickeNum = Number($(".forPicking span").text()); /*获取待拣货的数量*/
		var pickedNum = Number($(".picked span").text()); /*获取待拣货的数量*/
		if(pickeNum > 99){ 
			$(".forPicking span").text("99+")
		}
		if(pickedNum > 99){
			$(".picked span").text("99+")
		}
	},
	/*跳转补货或退货页面*/
	skipPage: function(){
		$("#content ul").on("tap", "button", function(){
			var _this = $(this);
			var goodsId = _this.attr("data-id"); /*获取退回的id*/
			if(_this.hasClass("forbacks")){
				qmpur.switchPage("return.html?id=" + id + "&goodsId=" + goodsId + "&type=1&orderNo="+orderNo); /*跳转到退货页面*/
			} else {
				qmpur.switchPage("replenishment.html?id=" + id + "&goodsId=" + goodsId + "&type=2&orderNo="+orderNo); /*跳转到退货页面*/
			}
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("startReview.html?id=" + id + "&orderNo="+orderNo);
		};
	},
	/*页面初始化*/
	initialize: function(){
		this.tabChange();
		this.getGoodsInfo();
		this.skipPage();
		this.mobileBack();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	returnOrReplenishmentObj.initialize();
})