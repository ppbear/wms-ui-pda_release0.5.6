package com.qiaomai.wms.wms_android.plugins;

import android.content.pm.PackageManager;
import android.util.Log;

import com.qiaomai.wms.wms_android.updateapp.UpdateAppVersion;

import org.json.JSONArray;

import io.dcloud.common.DHInterface.IWebview;
import io.dcloud.common.DHInterface.StandardFeature;
import io.dcloud.common.util.JSUtil;

/**
 * @Title: CPayPlugin.java
 * @Description: POS机支付插件。
 * @Params:
 * @Data: 2017-03-13
 * @Author: 杨朕开
 */
public class CPayPlugin extends StandardFeature {

    /**
     * @param params   参数：params[0]: 回调函数id
     * @Title: getVersionCode
     * @Description: 获取当前版本号
     * @Data: 2017/5/31 11:43
     * @Author: 李鹏鹏
     */
    public void getVersionCode(final IWebview pWebview, JSONArray params){
        final String callbackId = params.optString(0);
        try {
            int versionCode=getDPluginContext().getPackageManager().getPackageInfo(getDPluginContext().getPackageName(),0).versionCode;
            String versionName=getDPluginContext().getPackageManager().getPackageInfo(getDPluginContext().getPackageName(),0).versionName;
            JSONArray newArray = new JSONArray();
            newArray.put(versionCode);
            newArray.put(versionName);
            JSUtil.execCallback(pWebview, callbackId, newArray, JSUtil.OK, false);
        } catch (PackageManager.NameNotFoundException e) {
            Log.e("CPayPlugin", e.getMessage());
        }
    }

    /**
     * @param params   参数：params[0]: 回调函数id
     * @Title: updateVersion
     * @Description: 更新当前版本
     * @Data: 2017/5/31 11:43
     * @Author: 李鹏鹏
     */
    public void updateVersion(final IWebview pWebview, JSONArray params){
        Log.i("test","开始执行版本更新");
        final String callbackId = params.optString(0);
        final String apkDownUrl = params.optString(1);
        UpdateAppVersion updateAppVersion=new UpdateAppVersion(getDPluginContext(),apkDownUrl);
        updateAppVersion.downNewApp();
        JSUtil.execCallback(pWebview, callbackId, "apkDownUrl", JSUtil.OK, false);  //无需回传
    }

}
