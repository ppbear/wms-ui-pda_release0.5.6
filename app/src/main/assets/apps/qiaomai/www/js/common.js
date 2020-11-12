/**
 * @file            common.js
 * @description     公共配置JS
 * @author          郝四海
 * @version         1.0.0
 * @date            2017/03/14
 * @copyright       河南巧脉信息技术有限公司
 */
loadProperties();
curVersionName=window.localStorage.getItem("versionName");
var qmpur = (function() {
	var _configs = {
//		userBasePath: 'http://192.168.1.34:9091/wms/',
		userBasePath: 'http://wms.callmai.com/api/wms/',
//		userBasePath: 'http://test.wms.callmai.com/api/wms/',
//		userBasePath: 'http://192.168.1.54:9091/wms/',
		apkDownUrl: 'http://wms.pda.callmai.com/download/pda.apk',
		token: window.localStorage.getItem("token"),
		versionName:window.localStorage.getItem("versionName"),
		versionCode:window.localStorage.getItem("versionCode")
	};
	return {
		Configs: _configs,
		/*页面跳转的实现*/
		switchPage: function(url) {
			mui.openWindow({
				url: url,
				id: url,
				styles: {
					/*top:newpage-top-position, 新页面顶部位置
					bottom:newage-bottom-position, 新页面底部位置
					width:newpage-width, 新页面宽度，默认为100%
					height:newpage-height, 新页面高度，默认为100%
					......*/
				},
				extras: {
					selfName: i18n_com_hello
					/*.....自定义扩展参数，可以用来处理页面间传值*/
				},
				createNew: true,
				/*是否重复创建同样id的webview，默认为false:不重复创建，直接显示*/
				show: {
					autoShow: true,
					/*页面loaded事件发生后自动显示，默认为true*/
					aniShow: "slide-in-right",
					/*页面显示动画，默认为”slide-in-right“；*/
					duration: 100 /*页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒；*/
				},
				waiting: {
					autoShow: true,
					/*自动显示等待框，默认为true*/
					title: i18n_com_loading,
					/*等待对话框上显示的提示内容*/
					/*options:{
					  width:waiting-dialog-widht, 等待框背景区域宽度，默认根据内容自动计算合适宽度
					  height:waiting-dialog-height, 等待框背景区域高度，默认根据内容自动计算合适高度
					  ......
					}*/
				}
			});
			/*return false;*/
		},
		/*打开新页面，同时关闭旧页面*/
		switchPage_close: function(url, backFun) {
			if(typeof plus == "undefined") {
				qmpur.switchPage(url);
			} else {
				var thisWeb = plus.webview.currentWebview();
				if(url == thisWeb.id) {
					thisWeb.reload();
				} else {
					qmpur.switchPage(url);
					setTimeout(function(){
						thisWeb.close();
					},1000);
				};
			};
		},
		/*切割url*/
		getQueryString: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if(r != null) return unescape(r[2]);
			return null;
		},
		/*把图片地址转化为缩略图地址*/
		initImgUrl: function(url) {
			if(url && typeof(url) == "string") {
				return url + "!goodsthumb"; /*云服务器提供的缩略图片配置*/
			} else {
				return "";
			}
		},
		/*商品数量超过99，显示99+*/
		changeValue: function(value) {
			if(value > 99) {
				return "99+";
			} else {
				return value;
			}
		},
		/*调用扫码*/
		startScan: function(clkSelector, scanAreaId, callback, extendsFun) {
			document.addEventListener("plusready", function() {
				var e = document.getElementById("scan");
				e.removeAttribute("disabled");
			}, false);
			clkSelector.unbind();
			clkSelector.on("click", function() {
				if(extendsFun) {
					extendsFun();
				}
				$("#" + scanAreaId).show();
				scan = new plus.barcode.Barcode(scanAreaId);
				scan.onmarked = callback;
				scan.start();
			});
			clkSelector.click();
		},
		/*关闭扫码*/
		closeScan: function(scanAreaId, hideId) {
			scan = new plus.barcode.Barcode(scanAreaId);
			scan.close();
			$("#" + scanAreaId).hide();
			$("#" + hideId).hide();
		},

		/*获取当前网络是否为WiFi
              CONNECTION_UNKNOW: 网络连接状态未知  状态码0
              CONNECTION_NONE: 未连接网络 状态码1
              CONNECTION_ETHERNET: 有线网络 状态码2
              CONNECTION_WIFI: 无线WIFI网络 状态码3
              CONNECTION_CELL2G: 蜂窝移动2G网络 状态码4
              CONNECTION_CELL3G: 蜂窝移动3G网络 状态码5
              CONNECTION_CELL4G: 蜂窝移动4G网络 状态码6
		*/
		isWifi: function(){
		    var netType = window.plus.networkinfo.getCurrentType();
		    if(netType == 3){
		        return true;
		    }
		    return false;
		},
		/*判断是否为null*/
		isEmpty: function(parameter) {
			(parameter == null) ? parameter = "": parameter = parameter;
			return parameter;
		},
		/*封装日期*/
		formatDate: function(targetDate) {
			var targetDate = new Date(targetDate);
			var year = targetDate.getFullYear();
			var month = targetDate.getMonth() + 1;
			var day = targetDate.getDate();
			if(month < 10) {
				month = "0" + month;
			}
			if(day < 10) {
				day = "0" + day;
			}
			return(year + "-" + month + "-" + day);
		},
		/**
		 * 签退
		 */
		logout: function() {
            qmpur.ajax({
                url: qmpur.Configs.userBasePath + "signOut",
                contentType: 'application/json;charset=utf-8',
                success: function(result, status, xhr) {
                }
            });
            window.setTimeout(function(){
                window.localStorage.removeItem("token");
                qmpur.switchPage("login.html");
            }, 50);
        },
        /*双击退出*/
		dobuleLoginOut: function() {
			var first = null;
			mui.back = function() {
				if(!first) {
					first = new Date().getTime();
					qmpur.toast(i18n_com_press_againLogout);
					setTimeout(function() {
						first = null;
					}, 1000);
				} else {
					if(new Date().getTime() - first < 1000) {
						qmpur.logout();
						plus.runtime.quit();
					}
				}
			};
		},
		/*封装ajax*/
		ajax: function(_config) {
		    var _url = "";
			if(_config.url.indexOf("?") > -1) {
                _url = _config.url + "&token=" + qmpur.Configs.token;
                _config.url = _config.url + "&token=" + qmpur.Configs.token;
            } else {
                _url = _config.url + "?token=" + qmpur.Configs.token;
                _config.url = _config.url + "?token=" + qmpur.Configs.token;
            }
			var ajaxConfig = {
				dataType: 'json',
				type: 'GET',
				data: "",
				headers: {
					'Cache-Control': 'no-cache',
					'Content-Type': 'application/json;charset=utf-8'
				},
				beforeSend: function(){
					var loading = "<div id='loading'>"+ i18n_com_loading  +"</div>";
					var len = $("#loading").length;
					if(len == 0){
						$("body").append(loading);
					}
					$("#loading").show();
				},
				error: function(xhr, type, errorThrown) {
					console.log(type);
				},
				complete: function(){
					$("#loading").hide();
				}
			};
			if(_config) {
				if(_config.dataType && _config.dataType == "text") {
					_config.dataType = "json";
				}
				if(_config.success) {

					/* 处理包装后的数据结构 */
					var successFun = _config.success;
					var failFun = _config.error;
					_config.success = function(data) {
						if(data && data.code == 1) {
							/*返回成功，将data.data作为返回值处理*/
							successFun(data.data);
						} else if(data && (data.code != 1) && data.message) {
							if(data.code == 40002) {
								qmpur.switchPage("login.html");
								return ;
							}
							/*返回异常时，弹出异常信息*/
							if(failFun) {
								qmpur.toast(data.message);
							    failFun(data.message);
							}else {
							    qmpur.toast(data.message);
							}
						} else {
							/*没有返回值时，直接调用原来的处理方式*/
							successFun(data);
						}
					};
				}
				ajaxConfig = $.extend(ajaxConfig, _config);
			};
			/*如果是get请求，直接把参数拼接到url上面，否则不兼容最新的mui.js*/
			if((ajaxConfig.type == "GET" || ajaxConfig.type == "get") && ajaxConfig.data) {
				if(typeof ajaxConfig.data == "string") {
					ajaxConfig.data = JSON.parse(ajaxConfig.data);
				};
				for(var i in ajaxConfig.data) {
					_url += "&" + i + "=" + ajaxConfig.data[i];
					ajaxConfig.url += "&" + i + "=" + ajaxConfig.data[i];
				};
				ajaxConfig.data = "";
			};
			mui.ajax(_url, ajaxConfig);
		},
		/*从分页面返回进货首页*/
		backPurchaseIndex: function(evt) {
			if(evt) {
				var defaultEvent = evt;
			} else {
				var defaultEvent = "gohome";
			}
			var main = plus.webview.getWebviewById('header.html');
			if(main) {
				mui.fire(main, defaultEvent);
				setTimeout(function() {
					main.show();
				}, 500);

			} else {
				qmpur.switchPage("header.html");
				mui.back();
			}
		},
		/**
		 * 将带参数的国际化语句里的参数替换为需要的值
		 * @param {string}必填 i18n 国际化转换后的语句
		 * @param {string}必填 param 国际化语句中包含的参数
		 * @param {string}必填 key 要替换成的值
		 * @param {string}非必填 label 外面可能包含的标签
		 */
		replaceI18nParam: function(i18n, param, key, label) {
			var returnHtml = i18n;
			if(label) {
				returnHtml = returnHtml.replace(param, '<' + label + '>' + key + '</' + label + '>');
			} else {
				returnHtml = returnHtml.replace(param, key);
			};
			return returnHtml;
		},
		/**
		 * 将数字精确到两位小数，或者字符串数字转化为数字类型
		 * @param {string}必填 data 要转化的数字
		 * @param {number}非必填 tofixed 不填或者0：精确到两位小数； 1：转化为数字类型
		 */
		numberToFix:function(data,tofixed){
			var num= parseFloat(data);
			if(isNaN(num)) {
				num = 0;
			};
			if(tofixed){
				return Number(num.toFixed(2));
			}else{
				return num.toFixed(2);
			}
		},
		hasPermission: function(per) {
			if(!window.localStorage.getItem("permissions")) {
				return false;
			}
			var permissions = JSON.parse(window.localStorage.getItem("permissions"));
			var index = $.inArray(per, permissions);
			return index >= 0;
		},
        /**
         * description 版本检查更新
         */
          updateVersion: function(){
                var w = plus.nativeUI.showWaiting( "正在更新，请稍后。。。" );
                plus.pda.updateVersion(qmpur.Configs.apkDownUrl,
                     function(result) {
                        w.close();
                     },
                     function(result) {
                         w.close();
                         qmpur.toast(i18n_update_version_fail);
                     }
                );
          },
          /*
           * description 单位换算
          */
			unitCon: function(original ,smallestCount){
				if(original){
					var integer = parseInt(original/smallestCount);
					var residue = original%smallestCount/1000;
					return integer+residue;
				} else {
					return 0;
				}
			},
           /**
           * description 获取版本号
           */
           getVersionCode: function(){
                plus.pda.getVersionCode(
                      function(result) {
                          var curVersionCode = result[0];
                          curVersionName = result[1];
                          window.localStorage.setItem("versionCode", curVersionCode);
                          window.localStorage.setItem("versionName", curVersionName);
                          qmpur.compareVersion();
                      },
                      function(result) {
                          qmpur.toast("");
                      }
                  );
           },
           //比较版本
 		  needUpdate: function(curVer, serVer) {
                 if(curVer === serVer) {
                     return false;
                 }
                 var curVerArr = curVer.split(".");
                 var serVerArr = serVer.split(".");
                 if(curVerArr.length && serVerArr.length) {
                     var minlen = curVerArr.length;
                     if(serVerArr.length < minlen) {
                         minlen = serVerArr.length;
                     }
                     for(var i = 0; i < minlen; i++) {
                         if(parseInt(curVerArr[i]) < parseInt(serVerArr[i])) {
                             //当前版本小于服务器版本
                             return true;
                         }else if(parseInt(curVerArr[i]) > parseInt(serVerArr[i])) {
                             return false;
                         }
                     }
                     if(curVerArr.length < serVerArr.length) {
                         //前几位都相同，服务器版本位数更长，则返回true
                         return true;
                     }
                 }
                 return false;
           },
              //比较版本
           compareVersion:function () {
                 qmpur.ajax({
                    url:qmpur.Configs.userBasePath+"versionInfo/pdaNewVersion",
                 	beforeSend: function(){
						$("#maskModal").show();
					},
                    success: function(data) {
                         if(data!=null){
                             if(qmpur.needUpdate(curVersionName + "", data.versionNo + "")){
                                 //提示有新版本
                                 $("#versionModel").show();
                                 $(".versionInfo").html(data.content.replace(/\n/g, '<br/>'));
                                 $(".upgrade").on("tap",function(){
                                     $("#versionModel").hide();
                                     qmpur.updateVersion();
                                  });
                                 $("#versionModel .exit").on("tap",function(){
                                     $("#versionModel").hide();
                                     plus.runtime.quit();
                                  });
                             }
                         }
                    },
                    complete: function(){
                    	$("#maskModal").hide();
                    },
                 })
             },
			/*单位换算*/
			unitCon: function(original ,smallestCount){
				if(original){
					var integer = parseInt(original/smallestCount);
					var residue = original%smallestCount;
					if(residue){
						return integer+"."+residue;
					} else {
						return integer;
					}
				} else {
					return 0;
				}
			},
			/*单位换算计算数量*/
			unitCalcu: function(num ,smallestCount){
				var str = num.toString().split('.');
				var goodsCount = 0;
				if(typeof(str[1]) == "undefined"){
					goodsCount = Number(str[0])*smallestCount;/*数量*/
				} else {
					goodsCount = Number(str[0])*smallestCount + Number(str[1]);/*数量*/
				}
				return goodsCount;
			},
           /**
           * description 退出应用
           */
          quit: function(){
                plus.runtime.quit();
          },
          toast: function(msg, options) {
                options = $.extend({
            	        duration: 'short',
            	        type: 'div'
            	    }, options || {});
            	mui.toast(msg, options);
          }
	}
})();
/**
 * 给字符串增加一个模板处理方法
 * @param {Object}必填 obj 需要替换模板里面参数的对象
 * 模板里面的参数用$参数$包裹
 */
String.prototype.template = function(obj) {
	return this.replace(/\$\w+\$/gi, function(matchs) {
		var returns = obj[matchs.replace(/\$/g, "")];
		return(returns + "") == "undefined" ? "" : returns;
	});
};
/**
 * 载入I18N资源文件
 * @param lang 语言
 */

var initMessages;

function loadProperties(lang) {
	if(!lang) {
		lang = navigator.language ? navigator.language : "zh-CN";
	}
	jQuery.i18n.properties({
		name: 'Messages',
		path: 'i18n/',
		mode: 'both',
		language: lang,
		cache: true,
		encoding: 'UTF-8',
		callback: function() {
			$(".i18n").each(function() {
				if($(this).attr("message")) {
					$(this).text(jQuery.i18n.prop($(this).attr("message")));
				}
			});
			$(".i18n-input").each(function() {
				if($(this).attr("message")) {
					$(this).attr("placeholder", jQuery.i18n.prop($(this).attr("message")));
				}
				if($(this).attr("i18nMsg")) {
					$(this).attr("msg", jQuery.i18n.prop($(this).attr("i18nMsg")));
				}
				if($(this).attr("val")) {
					$(this).attr("value", jQuery.i18n.prop($(this).attr("i18nVal")));
				}
			});
			if(initMessages) {
				initMessages.call(window);
			}
		}
	});
}

$(function() {
	loadProperties();
    window.onload=function(){
            window.setTimeout(function(){
                qmpur.getVersionCode();//获取版本
            }, 3000);
    };

	/*页面跳转*/
	$("body").on("tap", ".simulationA", function() {

		/*if(window.localStorage.getItem("hasSign") != 'true') {
			qmpur.toast(i18n_index_please_signIn);
			return ;
		}*/
		var url = $(this).attr("data-url");
		var pasper = true;
		switch (url + '') {
		case 'harvest.html': /* 收货 */
			if(!qmpur.hasPermission("pda:receiving")) {
				pasper = false;
			}
			break;
		case 'picking.html': /* 拣货 */
			if(!qmpur.hasPermission("pda:picking")) {
				pasper = false;
			}
			break;
		case 'putaway.html': /* 上架 */
			if(!qmpur.hasPermission("pda:putaway")) {
				pasper = false;
			}
			break;
		case 'review.html': /* 复核 */
			if(!qmpur.hasPermission("pda:check")) {
				pasper = false;
			}
			break;
		case 'removal.html': /* 出库 */
			if(!qmpur.hasPermission("pda:outbound")) {
				pasper = false;
			}
			break;
		case 'task.html': /*仓内作业*/
			if(!(qmpur.hasPermission("warehouseOpration:replenish")
				|| qmpur.hasPermission("warehouseOpration:blockedStock")
				|| qmpur.hasPermission("warehouseOpration:stockMove"))) {
				pasper = false;
			}
			break;
		case 'check.html':  /*盘点*/
			if(!qmpur.hasPermission("pda:stockTaking")) {
				pasper = false;
			}
			break;
		}
		if(!pasper) {
			qmpur.toast(i18n_index_has_not_permissions);
			return ;
		}
		if(url) {
			qmpur.switchPage(url);
		}
	});
	$("#purchaseFooter").off().on("tap", ".simulationA", function() {
		var url = $(this).attr("data-url");
		if(url) {
			qmpur.switchPage_close(url);
		};
		return false;
	});
	if(!qmpur.Configs.token&&typeof isLogin=="undefined"){
		qmpur.switchPage_close("login.html");
	};
	/**
	 * 心跳定时器（防止超时）
	 */
	if(qmpur.Configs.token){
		var heartBeat = setInterval(function(){
			$.ajax({ 
				url: qmpur.Configs.userBasePath+"heartBeat?token="+qmpur.Configs.token,
				error: function(){
			        window.clearInterval(heartBeat);
			    }
			});
		},1000*60*25);//每个25分钟调用一下
	};
});