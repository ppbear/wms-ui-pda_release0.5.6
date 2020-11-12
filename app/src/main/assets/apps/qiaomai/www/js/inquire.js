/**
 * @file            inquire.js
 * @description     查询js
 * @author          郝四海
 * @version         0.3.7
 * @date            2017/10/10
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */

var inquireObj = {
	Configs: {
		type: "goods", /*查询类型*/
	},
	/*头部导航切换*/
	changeTab: function() {
		$(".nav li").on("tap", function(){
			$(this).addClass("active").siblings("li").removeClass("active");
			inquireObj.Configs.type = $(this).attr("data-pda"); /*查询类型*/
			$(".searchName").addClass("active");/*获取焦点*/
			$(".searchName").val("");/*清空数据*/
			if(inquireObj.Configs.type == "goods"){
				$(".searchName").attr("placeholder", i18n_inquire_goods_condition);
			} else if(inquireObj.Configs.type == "location"){
				$("#content input").attr("placeholder", i18n_picking_location_code);
			}
            setTimeout(function(){
                $(".searchName").focus();
                $("#searchBtn").css("top", "-138px");
                $("#content").css("top", "-88px");
            }, 300);
		});
	},
	/*页面跳转*/
	pageJump: function(){
		$("#content button").on("tap", function(){
			var searchName = $("#content .searchName").val(); /*搜索内容*/
			var type = inquireObj.Configs.type; /*搜索类型*/
			if(searchName){
				qmpur.switchPage("startInquire.html");
				window.localStorage.setItem("searchName", searchName);
				window.localStorage.setItem("type", type);
			} else {
				qmpur.toast(i18n_com_please_enter_the_query_criteria);
			}
		})
	},
	/*监测input*/
	inputChange: function(){
		$("#content").bind('input porpertychange',function(){
			var searchName = $("#content input").val();
			if(searchName){
				$(".mui-icon-clear").show();
			} else {
				$(".mui-icon-clear").hide();
			}
		})
	},
	/*input失去焦点*/
	inputBlur: function(){
		$("#content inptut").blur(function(){
			$(".mui-icon-clear").hide();
			$("#content button").removeClass("active");
		})
	},
	/*返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("index.html");
		};
	},
	/*弹起软件盘*/
    keyUp: function(){
        $(".searchName").click(function(){
            _this = $(this);
            $("#searchBtn").css("top", "-138px");
            $("#content").css("top", "-88px");
        });
    },
    /*收起软件盘*/
    keyDown: function(){
         $("body").not(".searchName").on("tap",function(){
            $("#searchBtn").css("top", "0px");
            $("#content").css("top", "0px");
        });
    },
	/*页面初始化*/
	initialize: function(){
		this.keyUp();
		this.keyDown();
		this.changeTab();
		this.pageJump();
		this.mobileBack();
		this.inputChange();
		this.inputBlur();
		$("#content .searchName").val(""); /*清空内容*/
		if($("#content .searchName").val().length == 0){
			$(".mui-icon-clear").hide();
		} 
	}
}

/**
 * description 页面初始化
 */
$(function(){
	inquireObj.initialize();
	$(".searchName").focus();
})