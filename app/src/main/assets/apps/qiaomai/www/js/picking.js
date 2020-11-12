/**
 * @file            picking.js
 * @description     拣货js
 * @author          郝四海
 * @version         0.1.8
 * @date            2017/7/18
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;
var waitPickSum = 0,
	havePickSum = 0;
var pickListStatus=0;//默认待捡货列表
var haveOrderFlag = false;
/**
 * description 新建一个对象
 */

var pickingObj = {
	Configs: {
		//waitForPickingUrl: userBasePath + "waveOrder/waitForPicking",/*待拣货列表*/
		waitForPickingUrl: userBasePath + "waveOrder/pickingList",/*拣货列表*/
		setPickerUrl: userBasePath + "waveOrder/setPicker",/*领取任务*/
		clearPickerUrl: userBasePath + "waveOrder/clearPicker?orderId=",/*退回领取的任务*/
		orderlist: userBasePath + "pickTask/getWaitPickOrder",
		createPickTask: userBasePath + "/pickTask/createPickTask",
		getPickCount: userBasePath + "/pickTask/getPickCount",
		pageNumber: 0,/*第1页*/
		size: 10,/*返回数据多少*/
		totalPages : 0/*总页码*/
	},
	/*获取拣货列表 status 0 待捡货，1已捡货*/
	pickList: function(status) {
		qmpur.ajax({
			url: pickingObj.Configs.waitForPickingUrl+"?number="+pickingObj.Configs.pageNumber+"&size="+pickingObj.Configs.size+"&status="+status+"&searchName=''",
			success: function(data) {
				console.log(data);
				pickingObj.Configs.totalPages = data.totalPages-1; /*总页码*/
				var lis = "";
				var len = data.content.length;
				$(".pickTitle button").removeClass("active");
				$(".pickTitle button").prop("disabled", true);
				if(len > 0) {
					$(".pickTitle div.l span").css("top", 0);
					$(".continueRe").show();
					//$(".waitCount").text(i18n_picking_complete_or_return);
					//如果有领取了任务的(4进行中3领取2开始1继续)，则领取按钮置灰
					if(haveOrderFlag==false && (data.content[0].shopId == 2 || data.content[0].shopId == 1)){
						haveOrderFlag = true;
					}
					for(var i=0;i<len;i++){
						var _order = data.content[i];
						lis = lis + "<li>" +
						"<div class='firstDiv'>" +
						"<span class='orderNum fontMax rightContent'>" + _order.orderNo + "</span>" ;
						
						////4进行中3领取2开始1继续
						if(_order.shopId == 4){
							lis = lis +"<button disabled='true' type='button' data-id='" + _order.id + "' data-status ='" + _order.shopId + "' class='button startPick i18n mui-btn r myBtn noActive' >" + i18n_com_going + "</button>" ;
						}else if(_order.shopId == 3){
							if((pickingObj.Configs.pageNumber!=0 || i!=0)&&　haveOrderFlag==true){
								//已经领取了任务不能再领取了
								lis = lis +"<button disabled type='button' data-id='" + _order.id + "' data-status ='" + _order.shopId + "' class='button startPick i18n mui-btn r noActive' >" + i18n_picking_receive + "</button>" ;
							}else{
								lis = lis +"<button type='button' data-id='" + _order.id + "' data-status ='" + _order.shopId + "' class='button startPick i18n mui-btn r getBtn myBtn' >" + i18n_picking_receive + "</button>" ;
							}
						}else if(_order.shopId == 5){
							lis = lis +"<button type='button' data-id='" + _order.id + "' data-status ='" + _order.shopId + "' class='button startPick i18n mui-btn r myBtn' >数据错误</button>" ;
						}else if(_order.shopId == 2){
							lis = lis +"<button type='button' data-id='" + _order.id + "' data-status ='" + _order.shopId + "' class='button startPick i18n mui-btn r myBtn startBtn' >" + (2 == _order.status ? i18n_picking_start : i18n_picking_continue) + "</button>" ;
						}else if(_order.shopId == 1){
							lis = lis +"<button type='button' data-id='" + _order.id + "' data-status ='" + _order.shopId + "' class='button startPick i18n mui-btn r myBtn startBtn' >" + (2 == _order.status ? i18n_picking_start : i18n_picking_continue) + "</button>";
						}
						if(status==0){
							lis = lis +"</div>" ;
						}
						lis = lis +"</div>" ;
						
						if( _order.waveTask!=null){
							lis = lis +"<div>" +
							//"<span class='i18n leftTitle'>" + i18n_picking_wave_num + "</span>&nbsp;" +
							"<span class='orderNum rightContent'>" + _order.waveTask.orderNo + "</span>" +
							"</div>" ;
						}
						lis = lis +"<div>" +
						"<span class='orderNum  graySpan'>" + qmpur.dateTimeUtil.formatDateTime(_order.createDate) + "</span>" ;
						if(_order.shopId == 2){
							lis = lis +'<button type="button" data-id="' + _order.id + '" class="button i18n mui-btn r backBtn" >' + i18n_review_return + '</button>' ;
						}
						lis = lis +"</div>" ;
						
						lis = lis +"</li>";
						lis = lis +"<p class='blankDiv'>&nbsp;</p>" ;
					}
					$(".waitPickList").append(lis);
					$(".pickingList").show();
				} else {
					$(".pickTitle div.l span").css("top", "10px");
					var waitCount = data.waitCount; /*待领任务数*/
					$(".continueRe").hide();
					if(!waitCount) {
						$(".pickTitle button").removeClass("active");
						$(".pickTitle button").prop("disabled", true);
						//$(".waitCount").text(i18n_picking_no_task_can_be_received);
					} else {
						$(".pickTitle button").addClass("active");
						$(".pickTitle button").prop("disabled", false);
						$(".waitCount").text(i18n_picking_pending_order_num + waitCount + i18n_com_one + "!");
					}
				}
			}
		})
	},
	/*点击开始，继续，进行中*/
	myBtn:function(){
		$(".waitPickList").on("tap",".myBtn", function(){
			var id = $(this).attr("data-id");
			var state = $(this).attr("data-status");
			//4进行中3领取2开始1继续
			if(state =='1' || state =='2'  ){//开始 //继续
				pickingObj.startPick(id);
	    	}else if(state =='3'){//领取
	    		qmpur.ajax({
					url: userBasePath+"waveOrder/doPickChack?id=" +id,
					success: function(data) {
						pickingObj.pulldownRefresh();
					},error:function(){
//						pickingObj.pulldownRefresh();
					}
				});
	    	}
		});
	},
	/*初始化上拉加载区域*/	
	initPullRefresh: function(){
		mui.init({
		  	pullRefresh : {
			    container:"#refreshContainer",/*待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等*/
				up: {
					auto:false,
					height: 50,/*可选.默认50.触发上拉加载拖动距离*/
				    contentrefresh : i18n_com_loading,/*可选，正在加载状态时，上拉加载控件上显示的标题内容*/
				    contentnomore: i18n_com_content_nomore,/*可选，请求完毕若没有更多数据时显示的提醒内容；*/
					callback: pickingObj.pullupRefresh/*上拉加载回调函数*/
				},
				down: {
					callback: pickingObj.pulldownRefresh
				},
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		pickingObj.Configs.pageNumber++;
		setTimeout(function(){
		   	pickingObj.pickList(pickListStatus);
		   	mui('#refreshContainer').pullRefresh().endPullupToRefresh(pickingObj.Configs.totalPages <= pickingObj.Configs.pageNumber);
	     },100);
	},
	/*下拉加载*/
	pulldownRefresh: function(){
		setTimeout(function() {
			$(".waitPickList").html("");
			pickingObj.Configs.pageNumber = 0;
		   	pickingObj.pickList(pickListStatus)
		   	//goodsObj.initPullRefresh();
		    setTimeout(function() {
		        mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
		        mui('#refreshContainer').pullRefresh().scrollTo(0,0);
		    }, 100);
		    //goodsObj.Configs.pageNumber = 0;/*第一页*/
		    //$(".goodsList").html(""); /*清空数据*/
		    
			mui('#refreshContainer').pullRefresh(); //refresh completed
		}, 100);
	},
	/*退回重新领取*/
	returnTask: function(){
		$(".waitPickList ").on("tap", ".backBtn", function() {
			var id = $(this).attr("data-id");
			var btnArray = [i18n_com_confirm, i18n_com_cancel];
			mui.confirm(i18n_picking_are_you_sure_you_want_to_return_this_task, i18n_com_reminder, btnArray, function(e) {
				if (e.index != 1) {
					qmpur.ajax({
						url: pickingObj.Configs.clearPickerUrl + id,
						success: function() {
							
							pickingObj.pulldownRefresh();
							haveOrderFlag=false;
						}
					})
				}
			});
		})
	},
	/*选项卡切换*/
	tabChange: function() {
		$(".nav li").on('tap', function() {
			$(this).addClass("active").siblings("li").removeClass("active");
			pickingObj.Configs.pageNumber = 0;
			$(".waitPickList").html("");
			if($(this).hasClass("navPicking")) {
				pickListStatus = 0;
				$('.pickTitle').show();
				pickingObj.pickList(pickListStatus);/*显示待拣货的列表*/
			} else {
				pickListStatus = 1;
				$('.pickTitle').hide();
				pickingObj.pickList(pickListStatus);/*显示已拣货的列表*/
			}
		})
	},
	/*添加开始拣货*/
	startPick: function(id) {
		qmpur.ajax({
			url: pickingObj.Configs.createPickTask + "?orderId=" + id,
			success: function(data) {
				qmpur.switchPage("pickingUp.html?orderId=" + id); /*跳转收货页面*/
			}
		});
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("index.html");
		};
	},
	/*获取拣货的数量*/
	pickingNum: function() {
		qmpur.ajax({
			url: pickingObj.Configs.getPickCount,
			success: function(data) {
				waitPickSum = data.waitTotal;
				havePickSum = data.finishtotal;
				var pickeNum = (waitPickSum > 99 ? "99+" : waitPickSum); /*获取待拣货的数量*/
				var pickedNum = havePickSum > 99 ? "99+" : havePickSum;; /*获取待拣货的数量*/
				$(".forPicking span").text(pickeNum)
				$(".picked span").text(pickedNum)
			}
		});
	
	},
	initialize: function() {
		this.myBtn();
		this.tabChange();
		this.mobileBack();
		this.pickList(0);
		this.returnTask();
		this.initPullRefresh();
		this.pickingNum();
	}
}

/**
 * description 页面初始化
 */
$(function() {
	pickingObj.initialize();
})