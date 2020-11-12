package com.qiaomai.wms.wms_android.updateapp;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.FileProvider;
import android.util.Log;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * @param：
 * @Class: UpdateAppVersion
 * @Description: 更新app工具类
 * @Data:
 * @Author: 李鹏鹏
 */
public class UpdateAppVersion {
    private static ProgressDialog progressDialog;
    private static final String DIRECTORY_NAME = "/newApp";
    private static final String File_NAME = "NewVersion.apk";
    private static final String TAG = "updateAppUtil";
    private static Context context;
    private static String apkDownUrl;

    public UpdateAppVersion(Context context,String apkDownUrl) {
        this.context = context;
        this.apkDownUrl=apkDownUrl;
    }

    /**
     * @param：
     * @Title: getDirectory
     * @Description: 获取外部存储目录
     * @Data:
     * @Author: 李鹏鹏
     */
    public static File getDirectory() {

        File file = new File(Environment.getExternalStorageDirectory() + DIRECTORY_NAME);
        //如果该路径不存在，则创建文件夹
        if (!file.exists()) {
            file.mkdir();
        }
        return file;
    }

    /**
     * @param： root:文件根目录
     * @Title: getAllFiles
     * @Description: 获取目标路径下的文件
     * @Data:
     * @Author: 李鹏鹏
     */
    public static void getAllFiles(File root) {
        File files[] = root.listFiles();
        if (files != null)
            for (File f : files) {
                if (f.isDirectory()) {
                    getAllFiles(f);
                } else {
                    Log.d(TAG, f.getName());
                }
            }
    }

    /**
     * @param： path: apk下载位置，mProgressDialog: 下载进度条
     * @Title: downNewApp
     * @Description: 下载新版本的APP
     * @Data:
     * @Author: 李鹏鹏
     */
    public static void downNewApp() {
        Log.i("test",apkDownUrl);
      /*  progressDialog = new ProgressDialog(context);
        progressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        progressDialog.setCancelable(true);
        progressDialog.setCanceledOnTouchOutside(false);
        progressDialog.show();*/
        new Thread() {
            public void run() {
                URL url = null;
                FileOutputStream fos = null;
                BufferedInputStream bis = null;
                HttpURLConnection connection = null;
                try {
                    url = new URL(apkDownUrl);
                    connection = (HttpURLConnection) url.openConnection();

                    //不能获取服务器响应
                    if (HttpURLConnection.HTTP_OK != connection.getResponseCode()) {
                        Message message = Message.obtain();
                        message.what = 1;
                        handler.sendMessage(message);
                    }
                    //不存在sd卡
                    else if (Environment.getExternalStorageState()
                            .equals(Environment.MEDIA_UNMOUNTED)) {
                        Message message = Message.obtain();
                        message.what = 2;
                        handler.sendMessage(message);
                    }
                    //满足上两个条件
                    else {
                        //获取网络输入流
                        bis = new BufferedInputStream(connection.getInputStream());
                        //文件大小
                        int length = connection.getContentLength();
                       // progressDialog.setMax((int) length);
                        //缓冲区大小
                        byte[] buf = new byte[1024];
                        int size = 0;

                        //获取存储文件的路径，在该路径下新建一个文件为写入流作准备
                        File cfile = new File(getDirectory().getPath(), File_NAME);
                        //如果不存在则新建文件
                        if (!cfile.exists()) {
                            cfile.createNewFile();
                        }
                        //将流与文件绑定
                        fos = new FileOutputStream(cfile);

                        //记录进度条
                        int count = 0;
                        //保存文件
                        while ((size = bis.read(buf)) != -1) {
                            fos.write(buf, 0, size);
                            count += size;
                            if (length > 0) {
                             //   progressDialog.setProgress(count);
                            }
                        }
                        Log.d("test", count + "");
                        Log.d("test", "HAHA" + cfile.getAbsolutePath() + cfile.getName());
                        Bundle bundle = new Bundle();
                        Message message = Message.obtain();
                        message.what = 3;
                        bundle.putString("msg", cfile.getAbsolutePath());
                        message.setData(bundle);
                        handler.sendMessage(message);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    try {
                        if (fos != null) {
                            fos.close();
                        }
                        if (bis != null) {
                            bis.close();
                        }
                        if (connection != null) {
                            connection.disconnect();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        }.start();

    }

    /**
     * @param：
     * @Title:
     * @Description: 初始化Handler
     * @Data:
     * @Author: 李鹏鹏
     */
    private static Handler handler = new Handler() {
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 1:
                    Toast.makeText(context, "网络状态不可用", Toast.LENGTH_SHORT).show();
                    Log.d(TAG, "网络不通");
                    break;
                case 2:
                    Toast.makeText(context, "请插入SD卡", Toast.LENGTH_SHORT).show();
                    Log.d(TAG, "没有sd卡");
                    break;
                case 3:
                    Bundle bundle = msg.getData();
                    String fileName = bundle.getString("msg");
                    installAPK(fileName, context);
                   /* if(isWifi()){
                        installAPK(fileName, context);
                    }else {
                        redmineFlow(fileName);
                    }*/
                    Log.d(TAG, "已经下载");
                    break;
                default:
                    break;
            }
        }
    };

    /**
     * @param： fileName:要打开的apk文件的名字 context:上下文
     * @Title: installAPK
     * @Description: 安装APP
     * @Data:
     * @Author: 李鹏鹏
     */
    private static void installAPK(String fileName, Context context) {
        File file = new File(fileName);
        if (!file.exists()) {
            return;
        }
        Intent intent = new Intent();
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.N) {
            /**Android 7.0以上的方式：请求获取写入权限，这一步报错**/
            Uri uri= FileProvider.getUriForFile(context,"com.qiaomai.ppi.fileprovider",file);
            intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.setAction(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
        } else {
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            intent.setAction(Intent.ACTION_VIEW);
            Log.d(TAG, "AA" + "file://" + file.toString());
            //"file://"+file.toString()下载的app的路径
            intent.setDataAndType(Uri.parse("file://" + file.toString()), "application/vnd.android.package-archive");
        }
        context.startActivity(intent);
    }
    
    /**
     * @param：
     * @Title:  isWifi
     * @Description: 判断当前网络是否为WiFi
     * @Data:
     * @Author: 李鹏鹏
     */
    private static boolean isWifi(){
        ConnectivityManager connectivityManager= (ConnectivityManager) context.getSystemService(context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo=connectivityManager.getActiveNetworkInfo();
        if(networkInfo!=null&&networkInfo.getType()==connectivityManager.TYPE_WIFI){
            Log.i("test","当前为WiFi网络");
            return true;
        }
            return false;
    }

    /**
     * @param： fileName
     * @Title: redmineFlow
     * @Description: 流量提醒
     * @Data:
     * @Author: 李鹏鹏
     */
    private static void redmineFlow(final String fileName){
        AlertDialog.Builder builder=new AlertDialog.Builder(context)
                .setTitle("流量提醒")
                .setMessage("您当前的网络状态为用户流量，确认继续更新吗？")
                .setPositiveButton("确认", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        installAPK(fileName,context);
                    }
                })
                .setNegativeButton("取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                });
        builder.create().show();
    }
}
