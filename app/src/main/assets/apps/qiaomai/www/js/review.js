/**
 * @file            review.js
 * @description     复核主页
 * @author          郝四海
 * @version         0.1.8
 * @date            2017/7/26
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;

/**
 * description 新建一个对象
 */

var reviewObj = {
	Configs: {
		findOrderNoUrl: userBasePath + "waveOrder/findOrder?orderNo=",  /*复核检索*/
		startReviewUrl: userBasePath + "waveOrder/startCheck?orderNo=" /*开始复核*/
	},
	/*搜索订单*/
	searchOrder: function(){
		$("#content").bind('input porpertychange',function(){
			var searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(searchName){
				reviewObj.findOrderNo(searchName);
			} else {
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
			}
		})
	},
	/*订单查询*/
	findOrderNo: function(searchName){
		qmpur.ajax({
			url: reviewObj.Configs.findOrderNoUrl + searchName,
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
					qmpur.toast(i18n_review_receipt_is_incorrect_please_enter_again);
				}
			}
		});
	},
	/*清除搜索的内容*/
	clearSearchName: function(){
		$(".mui-icon-clear").on("tap", function(){
			$(".listInput").hide(); /*隐藏模糊搜索的内容*/
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
	/*开始复核*/
	startreview: function(){
		$(".harvest").click(function(){
			var searchName = $("input.searchName").val();/*获取搜索的内容*/
			if(searchName){
				qmpur.ajax({
					url: reviewObj.Configs.startReviewUrl + searchName,
					success: function(data) {
						var id = data.id; /*复核id*/
						qmpur.switchPage("startReview.html?id="+id +"&orderNo="+data.orderNo);/*跳转复核页面*/
					}
				});
			} else {
				qmpur.toast(i18n_review_please_scan_or_enter_a_barcode);
			}
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() startReviewUrl{
			qmpur.switchPage("index.html");
		};
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
	/*弹起软件盘*/
    keyUp: function(){
        $(".searchName").click(function(){
            $("#content button").css("top", "-125px");
            $("#content").css("top", "-88px");
        });
    },
    /*收起软件盘*/
    keyDown: function(){
         $("body").not(".searchName").on("tap",function(){
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
		this.startreview();
		this.scanJudge();
		this.mobileBack();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	reviewObj.initialize();
	$(".searchName").focus();/*页面进入的时候获取 焦点*/
})