/**
 * @file            login.js
 * @description     登录界面
 * @author          师志强
 * @version         0.1.5
 * @date            2017/7/4
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */

var obj = new Object();
var token = "";

/**
 * description 全局变量
 */

var userBasePath = qmpur.Configs.userBasePath + "login";

/**
 * description 登录
 */

obj.login = function() {
	$("#loginBtn").on("tap", function() {
		var bodyWidth = $(document.body).width(); /*获取屏幕的宽度*/
		var that = this;
		var userName = $(this).siblings().find("input[type=text]").val();
		var passWord = $(this).siblings().find("input[type=password]").val();
		//warning
		if(!userName) {
			qmpur.toast(i18n_username_is_null);
		    return ;
		}
		if(!passWord) {
			qmpur.toast(i18n_password_is_null);
            return ;
        }
		var loginData = {
			"userName": userName,
			"password": passWord,
			"type": 3
		};
		qmpur.ajax({
			data: loginData,
			url: userBasePath,
			success: function(data) {
				if(data.token) {
				    var curVersionName = window.localStorage.getItem("versionName");
					window.localStorage.clear();
					window.localStorage.setItem("versionName", curVersionName);
					/*记住密码*/
					if($("#remember")[0].checked) {
						var sLoginData = encodeURIComponent(JSON.stringify(loginData));
						window.localStorage.setItem("loginInfo", sLoginData);
					} else {
						window.localStorage.removeItem("loginInfo");
					}
					token = data.token;
					qmpur.Configs.token=token;
					localStorage.setItem("token", token);
					localStorage.setItem("permissions", JSON.stringify(data.permissions));
					localStorage.setItem("userInfo", JSON.stringify(data));
					qmpur.switchPage("index.html?t=" + new Date().getTime());
				} else {
					qmpur.toast(i18n_com_login_error);
				}
			},
			fail: function(message) {
			    qmpur.toast(message);
			}
		});
	});
};

/**
 * description 初始化登录信息
 */
obj.initLoginInfo = function() {
	var loginInfo = window.localStorage.getItem("loginInfo");
	if(loginInfo) {
		var aloginInfo = JSON.parse(decodeURIComponent(loginInfo));
		$(".name").val(aloginInfo.userName);
		$(".password").val(aloginInfo.password);
	}
};

/**
 * description 登录返回退出app
 */
obj.logoutApp = function() {
	mui.back = function() {
		qmpur.logout();
		plus.runtime.quit();
	};
};

/**
 * description 页面初始化
 */
$(function() {
	obj.login();
	/*初始化登录信息*/
	obj.initLoginInfo();
	obj.logoutApp();
});