/**
 * @file            startRemoval.js
 * @description     出库界面
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
/**
 * description 新建一个对象
 */

var startRemovalObj = {
	Configs: {
		orderInfoUrl: userBasePath + "waveTask/outboundInfos?waveId=" + id,
		outboundOrderUrl: userBasePath + "waveTask/outboundOrder?waveId=" + id + "&orderNo="
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
	/*scan扫码判断*/
	scanJudge: function(){
		$(document).keyup(function (event) {
	        var code = event.keyCode;
	        if(code == 120){
	            var barcode = $("#barcode").val();
	            $("#barcode").val("");
	            if(barcode) {
	        	    startRemovalObj.outboundOrder(barcode);
	            }
	        }
	    });
	},
	/*确认提交*/
	outboundOrder: function(barcode){
		qmpur.ajax({
			url: startRemovalObj.Configs.outboundOrderUrl + barcode,
			success: function(data) {
				startRemovalObj.getWaveOrderInfos();
			},
			error:function(){
				startRemovalObj.getWaveOrderInfos();
			}
		});
	},
	outboundOk: function() {
		$(".removalBtn").on("tap", function(){
			var forNum = $("em.forHandOver").find("span").html() * 1;
			if(forNum > 0) {
				//还有未完成的
				qmpur.toast(i18n_removal_please_outbound_all_order);
				return ;
			}
			$("#modelToast span").text(i18n_removal_outbound_success);
			$("#modelToast").show();
			setTimeout(function(){
				$("#modelToast").hide();  
				qmpur.switchPage("removal.html");
			},500);
		});
	},
	mobileBack: function() {
		oldback = mui.back;
		mui.back = function() {
			var forNum = $("em.forHandOver").find("span").html() * 1;
			if(forNum > 0) {
				//还有未完成的
				qmpur.toast(i18n_removal_please_finish_outbound);
				return ;
			}
			oldback();
		};
	},
	getWaveOrderInfos: function(){
		qmpur.ajax({
			url: startRemovalObj.Configs.orderInfoUrl,
			success: function(data) {
				console.log(data);
				var forHandOvers = data.forHandOvers;
				var handOvereds = data.handOvereds;
				var forNum = forHandOvers.length;
				var handNum = handOvereds.length;
				var initStr = "<li class='noOrder'>" + i18n_removal_has_not_orders + "</li>";
				$("em.forHandOver").find("span").html(forNum);
				if(forNum > 0) {
					$("em.forHandOver").show();
				}else {
					$("em.forHandOver").hide();
				}
				$("em.handOvered").find("span").html(handNum);
				if(handNum > 0) {
					$("em.handOvered").show();
				}else {
					$("em.handOvered").hide();
				}
				$("ul.forHandOver").html(initStr);
				var forStr = "";
				for(var i = 0; i < forNum; i++) {
					forStr += '<li><div><span class="waveOrderNo rightContent l">'
							+ forHandOvers[i] + '</span><button type="button" class="r button mui-btn handover">'+ i18n_removal_hand_over +'</button></div>';
					
					var cs = data.forHandCatchStorage[i];
					if(cs!=null && cs.length>0){
						for(var j = 0 ;j<cs.length;j++){
							var x= cs[j];
							if(j%2 == 0){
								forStr += '<div>';	
								forStr += '<span class="l min">'+ cs[j].code+'</span>';	
							}else{
								forStr += '<span class="r min">'+ cs[j].code +'</span>';	
								forStr += '</div>';	
							}
						}
					}
					forStr +='</li>';
					
					
				}
				if(forStr) {
					$("ul.forHandOver").html(forStr);
				}
				$("ul.handOvered").html(initStr);
				var handStr = "";
				for(var i = 0; i < handNum; i++) {
					handStr += '<li><div><span class="waveOrderNo">'
						+ handOvereds[i] + '</span></div>';
					
					var cs = data.handCatchStorage[i];
					if(cs!=null && cs.length>0){
						for(var j = 0 ;j<cs.length;j++){
							var x= cs[j];
							if(j%2 == 0){
								handStr += '<div>';	
								handStr += '<span class="l min">'+ cs[j].code+'</span>';	
							}else{
								handStr += '<span class="r min">'+ cs[j].code +'</span>';	
								handStr += '</div>';	
							}
						}
					}
					handStr +='</li>';
				}
				if(handStr) {
					$("ul.handOvered").html(handStr);
				}
			}
		});
	},
	/*交接*/
	handover: function(){
		$("ul.forHandOver").on("tap", "button.handover", function(event){
			var waveOrderNo = $(this).siblings(".waveOrderNo").text();
			startRemovalObj.outboundOrder(waveOrderNo);
		})
	},
	/*获取焦点*/
	getFocus: function(){
		$("body").on("tap",function(){
			$("#barcode").focus();
		});
	},
	/*页面初始化*/
	initialize: function() {
		this.tabChange();
		this.scanJudge();
		this.mobileBack();
		this.outboundOk();
		this.getWaveOrderInfos();
		this.getFocus();
		this.handover();
		$(".orderNum").text(orderNo); /*订单单号*/
	}
}

/**
 * description 页面初始化
 */
$(function() {
	startRemovalObj.initialize();
	$("#barcode").focus();
})