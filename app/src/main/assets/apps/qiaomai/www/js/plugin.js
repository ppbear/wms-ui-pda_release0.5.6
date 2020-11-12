/**
* 添加pos机支付插件。
*/
document.addEventListener("plusready", function() {
	window.plus.pda = {
        /**
        * 获取当前版本号
        */
        "getVersionCode": function(successCallback,errorCallback){
            var success = (typeof successCallback !== 'function') ? null : function(args) {
                                successCallback(args);
                            };
            var	fail = (typeof errorCallback !== 'function') ? null : function(code) {
                                errorCallback(code);
                            };
            var	callbackID = window.plus.bridge.callbackId(success, fail);
            return window.plus.bridge.execSync("pda", "getVersionCode", [callbackID]);
        },
        /**
         * 版本更新插件
         */
      "updateVersion": function(apkDownUrl,successCallback,errorCallback){
             var success = (typeof successCallback !== 'function') ? null : function(args) {
                                 successCallback(args);
                             };
             var	fail = (typeof errorCallback !== 'function') ? null : function(code) {
                                 errorCallback(code);
                             };
             var	callbackID = window.plus.bridge.callbackId(success, fail);
             return window.plus.bridge.execSync("pda", "updateVersion", [callbackID,apkDownUrl]);
         }
	};
}, true);