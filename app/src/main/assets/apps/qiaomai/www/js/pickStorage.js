/**
 * @file            pickStorageO.js
 * @description     拣货放置缓存区
 * @author          郝四海
 * @version         0.3.7
 * @date            2017/10/10
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */
var pickId = qmpur.getQueryString("orderId");
var preCode = "";
var pickStorageObj = {
	Configs: {
		putUrl:  qmpur.Configs.userBasePath + "pickStorage/put", /*放置URL*/
		cancelUrl: qmpur.Configs.userBasePath + "pickStorage/conclePut", /*取消接口*/
		getAllCodeUrl: qmpur.Configs.userBasePath + "pickStorage/getCode?pickId="+pickId, /*获取所有code*/
		searchName: window.localStorage.getItem("searchName"), /*搜索内容*/
		pageNumber: 0,/*商品第一页*/
		totalPages: 0,/*总页码*/
		size: 6 /*每页返回的数据*/
	},
	/*code列表*/
	list: function(){
		qmpur.ajax({
			async: false,
			url: pickStorageObj.Configs.getAllCodeUrl ,
			beforeSend: function(){
				var loading = "<div id='loading'>"+ i18n_com_loading  +"</div>";
				var len = $("#loading").length;
				if(len == 0){
					$("body").append(loading);
				}
				$("#loading").show();
			},
			success: function(data) {
				if(data.length > 0){
					var result = data;
					var str = "";
					for(var i = 0; i < data.length; i++){
						if(i == 0){
							str += '<li class="goodsInfoList first">';	
						} else {
							str += '<li class="goodsInfoList">';	
						}
						str += ' <span class="leftTitle l omit">'+ result[i].code +'</span>&nbsp;	';	
						str += ' <span class="r red cancelBtn" data-code="'+result[i].code+'">'+ i18n_com_cancel +'</span>';	 
						str += '</li>';	
					}
					$(".goodsList").append(str);
					pickStorageObj.cancelBtn();
				} else {
					$(".mui-pull").hide(); /*隐藏提示信息*/
				}
				pickStorageObj.endPutEnuseable();
				setTimeout(function() {
					$(".searchName").focus();
				}, 300);
			},
			complete: function(){
				$("#loading").hide();
			}
		});
	},
	/*输入框内容改变*/
	contentChange:function(){
		$(".searchName").change(function(){
			var searchName =  $(".searchName").val(); /*输入的内容*/
			var preLen = preCode.length;
			var nowLen = searchName.length;
			if(nowLen - preLen >1){
				pickStorageObj.putBtn();
			}
			preCode = searchName;
		})
	},
	/*点击确定*/
	putBtn: function(){
		$(".putBtn").on("tap", function(){
			var searchName =  $(".searchName").val(); /*输入的内容*/
			window.localStorage.setItem("searchName", searchName);
			$(".mui-scroll").css("transform","translate3d(0px, 0px, 0px) translateZ(0px)");
			pickStorageObj.Configs.pageNumber = 0; /*默认返回第一页*/
			if(searchName){
				qmpur.ajax({
					async: false,
					url: pickStorageObj.Configs.putUrl+"?pickId="+pickId+"&code="+searchName ,
					success: function(data) {
						$(".goodsList").html("");/*清空数据*/
						pickStorageObj.list();
						$(".searchName").val("");
					}
				})
			}
		});
	},
	/*点击取消*/
	cancelBtn: function(){
		$(".cancelBtn").on("tap", function(){
			var code = $(this).attr("data-code");
			$(".mui-scroll").css("transform","translate3d(0px, 0px, 0px) translateZ(0px)");
			//pickStorageObj.Configs.pageNumber = 0; /*默认返回第一页*/
			if(code){
				qmpur.ajax({
					async: false,
					url: pickStorageObj.Configs.cancelUrl+"?pickId="+pickId+"&code="+code ,
					success: function(data) {
						$(".goodsList").html("");/*清空数据*/
						pickStorageObj.list();
					}
				})
			}
		});
	},
	/*结束放置*/
	endPutBtn: function(){
		$(".endPutBtn").on("tap", function(){
			qmpur.switchPage("picking.html");/*跳转拣货页面*/
		});
	},
	/*返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("picking.html");
		};
	},
	/*判断结束放置是否可用*/
	endPutEnuseable:function(){
		var len = document.getElementById("goodsList").getElementsByTagName("li").length;
		if(len>0){
			//可用
			$('.endPutBtn').removeAttr('disabled');
			$(".endPutBtn").css({"background":"#0013E7"});
		}else{
			$('.endPutBtn').attr('disabled',"true")
			$(".endPutBtn").css({"background":"#3E3E3E"});
		}
	},
	/*页面初始化*/
	initialize: function(){
		this.endPutEnuseable();
		this.putBtn();
		this.list();
		this.mobileBack();
		this.endPutBtn();
		this.contentChange();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	pickStorageObj.initialize();
})