/**
 * @file            sellLibrary.js
 * @description     销退入库
 * @author          郝四海
 * @version         0.3.0
 * @date            2017/9/12
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;

/**
 * description 新建一个对象
 */

var sellLibraryObj = {
	Configs: {
		findOrderNoUrl: userBasePath + "receiveOrder/findOrderNo?searchName=",  /*收货检索*/
		receiveUrl: userBasePath + "receiveOrder/canReceive/", /*判断是否正在收货*/
		startReceiveUrl:  userBasePath + "receiveOrder/startReceive?orderId=" /*开始收货*/
	},
	/*搜索订单*/
	searchOrder: function(){
		$("#content").bind('input porpertychange',function(){
			var searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(searchName){
				sellLibraryObj.findOrderNo(searchName);
			} else {
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
			}
		})
	},
	/*订单查询*/
	findOrderNo: function(searchName){
		qmpur.ajax({
			url: sellLibraryObj.Configs.findOrderNoUrl + searchName + "&type=2",
			success: function(data) {
				$(".listInput").html(""); /*清空模糊搜索的内容*/
					var len = data.length;
				if(len > 0){
					if(len > 5){
						len = 5;
					}
					var listInput = "";
					for(var i = 0; i < len; i++){
						listInput += "<li>"+ data[i] +"</li>" ;
					}
					$(".listInput").show(); /*显示模糊搜索的内容*/
					$(".listInput").append(listInput);
				} else {
					$(".listInput").hide(); /*显示模糊搜索的内容*/
					qmpur.toast(i18n_harvest_receipt_is_incorrect_please_enter_again);
				}
			}
		});
	},
	/*清除搜索的内容*/
	clearSearchName: function(){
		$(".mui-icon-clear").click(function(){
			$(".listInput").hide(); /*隐藏模糊搜索的内容*/
			return false;
		});
	},
	/*选择模糊搜索的内容*/
	selectSearchName: function(){
		$(".listInput").on("tap", "li", function(){
			var searchName = $(this).text();/*获取选择的内容*/
			$("input.searchName").val(searchName);/*赋值给input*/
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
		});
	},
	/*开始收货*/
	startHarvset: function(){
		$(".harvest").click(function(){
			var searchName = $("input.searchName").val();/*获取搜索的内容*/
			if(searchName){
				qmpur.ajax({
					url: sellLibraryObj.Configs.receiveUrl + searchName +"?type=2",
					success: function(data) {
						var id = data.id; /*收货id*/
						sellLibraryObj.startHarvsetState(id);
						qmpur.switchPage("startSellLibrary.html?id="+id+"&type=2");/*跳转收货页面*/
					}
				});
			} else {
				qmpur.toast(i18n_harvest_please_scan_or_enter_a_barcode)
			}
		});
	},
	/*scan扫码判断*/
	scanJudge: function(){
		$(document).keyup(function (event) {
	        var code = event.keyCode;
	        if(code == 120){
	        	$(".harvest").click();
	        } 
	    });
	},
	/*开启收货状态*/
	startHarvsetState: function(id){
		qmpur.ajax({
			url: sellLibraryObj.Configs.startReceiveUrl + id,
			success: function(data) {
			}
		});
	},
	/*弹起软件盘*/
    keyUp: function(){
        $(".searchName").click(function(){
            $("#content button").css("top", "-138px");
            $("#content").css("top", "-88px");
            return false;
        });
    },
    /*收起软件盘*/
    keyDown: function(){
         $("body").not(".searchName").on("click",function(){
            $("#content button").css("top", "0px");
            $("#content").css("top", "0px");
        });
    },
	initialize: function(){
	    this.keyUp();
        this.keyDown();
		this.searchOrder();
		this.clearSearchName();
		this.selectSearchName();
		this.startHarvset();
		this.scanJudge();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	sellLibraryObj.initialize();
	$(".searchName").focus();/*页面进入的时候获取 焦点*/
})