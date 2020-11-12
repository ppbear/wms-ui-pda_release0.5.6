/**
 * @file            harvset.js
 * @description     收货主页
 * @author          郝四海
 * @version         0.1.8
 * @date            2017/7/10
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;

/**
 * description 新建一个对象
 */
var haveOrderFlag = false;
var harvsetObj = {
	Configs: {
		findOrderNoUrl: userBasePath + "receiveOrder/findOrderNo?searchName=",  /*收货检索*/
		orderList: userBasePath + "receiveOrder/findOrders",  /*查询所有的采购入库订单*/
		searchName: "",/*搜索名称*/
		pageNumber: 0,/*第1页*/
		size: 10,/*返回数据多少*/
		totalPages : 0,/*总页码*/
		receiveUrl: userBasePath + "receiveOrder/canReceive/", /*判断是否正在收货*/
		startReceiveUrl:  userBasePath + "receiveOrder/startReceive?orderId=" /*开始收货*/
	},
	/*搜索订单*/
	searchOrder: function(){
		$("#content").bind('input porpertychange',function(){
			var searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(searchName){
				harvsetObj.findOrderNo(searchName);
			} else {
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
			}
		})
	},
	/*订单查询*/
	findOrderNo: function(searchName){
		qmpur.ajax({
			url: harvsetObj.Configs.findOrderNoUrl + searchName + "&type=1",
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
	/*订单列表*/
	orderList: function(){
		qmpur.ajax({
			url: harvsetObj.Configs.orderList,
			data: {
				number: harvsetObj.Configs.pageNumber,
				size: harvsetObj.Configs.size,
				searchName: harvsetObj.Configs.searchName,
				type: '1'
			},
			beforeSend: function(){},
			success: function(data) {
				var data = data.content;
				if(data.length){
					$(".mui-pull").show()
					harvsetObj.Configs.totalPages = data.totalPages-1; /*总页码*/
					var len = data.length;
					var orderList = "";
					$(".noData").hide();
					//如果有了继续的任务的(3进行中2开始1继续)，则其他开始按钮置灰
					if((data[0].receiverId == 1 &&　harvsetObj.Configs.pageNumber==0) ||haveOrderFlag){
						haveOrderFlag = true;
					}
					
					for(var i = 0; i < len; i++){
				    	orderList += '<li class="simulationA mui-table-view-cell" >';
				    	orderList += '<div>';
				    	//orderList += '<span class="l min3">'+ data[i].orderNo +'</span>';
				    	if(data[i].otherOrderNo){
				    		orderList += '<span class="l min3">'+ data[i].otherOrderNo +'</span>';	
				    	}else{
				    		orderList += '<span class="l min3"> </span>';	
				    	}

				    	var statue=0;
				    	if(data[i].receiverId =='1') {//继续
				    		orderList += '<div class="r myBtn" state="1" data-id='+data[i].id+'>'+ i18n_picking_continue +'</div>';
				    	 	statue=1;
				    	}else if(data[i].receiverId =='2'){//开始
				    		orderList += '<div class="r  myBtn" state="2" data-id='+data[i].id+'>'+ i18n_com_begin +'</div>';
				    		statue=2;
				    	}else if(data[i].receiverId =='3'){//进行中
				    		orderList += '<div class="r noActive " state="3" data-id='+data[i].id+'>'+ i18n_com_going +'</div>';
				    	 	statue=3;
				    	}
				    	orderList += '</div>';	
				    	orderList += '<div>';
//				    	if(data[i].otherOrderNo){
//				    		orderList += '<span>'+ data[i].otherOrderNo +'</span>';	
//				    	}
						if(data[i].type==1){//类型（1：采购订单 2：销退订单, 3: 调拨入库）
				    		orderList += '<span class="l min2">'+ i18n_putaway_purchase_order +'</span>';	
				    	}else if(data[i].type==2){
				    		orderList += '<span class="l min2">'+ i18n_putaway_return_order +'</span>';	
				    	}if(data[i].type==3){
				    		orderList += '<span class="l min2">'+ i18n_putaway_cancel_order +'</span>';	
				    	}
				    	if(statue ==1){////继续,部分收货
				    		orderList += '<span class="r min min2">'+ i18n_harvest_receive_order_part_harvesting +'</span>';
				    	}else if(statue ==2){//开始，待收货
				    		orderList += '<span class="r min min2">'+ i18n_harvest_wait_for_receiving +'</span>';
				    	}else if(statue ==3){//进行中，正在收货
				    		orderList += '<span class="r min min2">'+ i18n_harvest_receive_order_is_running +'</span>';
				    	}
				    	
				    	orderList += '</div>';
				    	if(data[i].supplier){
				    		orderList += '<div class="omit min1">'+ data[i].supplier.name +'</div>';
				    	}else{
				    		orderList += '<div class="omit min1"> </div>';
				    	}
				    		
				    	orderList += '</li>';
				    	orderList = orderList +"<p class='blankDiv'>&nbsp;</p>" ;
					}
					$(".orderList").append(orderList);
				} else {
					var dataLen = $("#refreshContainer li").length;
					$(".mui-pull").hide();
					if(dataLen){
						$(".noData").hide();
					} else {
						$(".noData").show();
					}
				}
			}
		});
	},
	/*订单搜索*/
	searchOrderList: function(){
		$(".searchInput").bind('input porpertychange',function(){
			harvsetObj.Configs.searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(harvsetObj.Configs.searchName){
				harvsetObj.Configs.pageNumber = 0; /*默认返回第一页*/
				setTimeout(function() {
					mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
					mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
				}, 500);
				$(".orderList").html("");
				harvsetObj.orderList();
			}
		})
	},
	/*清除搜索的内容*/
	clearSearchName: function(){
		$(".mui-icon-clear").on("tap", function(){
			$(".orderList").html("");
			harvsetObj.orderList();
			harvsetObj.Configs.pageNumber = 0; /*默认返回第一页*/
			harvsetObj.Configs.searchName = "";
			setTimeout(function() {
				mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
				mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
			}, 500);
			$(".orderList").html("");
			harvsetObj.orderList();
//			$(".listInput").hide(); /*隐藏模糊搜索的内容*/
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
					url: harvsetObj.Configs.receiveUrl + searchName + "?type=1",
					success: function(data) {
						if(data){
							var id = data.id; /*收货id*/
							harvsetObj.startHarvsetState(id);
							qmpur.switchPage("startHarvset.html?id="+id+"&type=1");/*跳转收货页面*/
						}else{
							alert(1);
						}
						
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
			url: harvsetObj.Configs.startReceiveUrl + id,
			success: function(data) {
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
					callback: harvsetObj.pullupRefresh/*上拉加载回调函数*/
				},
				down: {
					callback: harvsetObj.pulldownRefresh
				},
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		harvsetObj.Configs.pageNumber++;
		setTimeout(function(){
		   	harvsetObj.orderList();
		   	mui('#refreshContainer').pullRefresh().endPullupToRefresh(harvsetObj.Configs.totalPages <= harvsetObj.Configs.pageNumber);
	     },300);
	},
	/*下拉加载*/
	pulldownRefresh: function(){
		setTimeout(function() {
			$(".orderList").html("");
			harvsetObj.Configs.pageNumber = 0;
		   	harvsetObj.orderList();
			mui('#refreshContainer').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 300);
	},
	/*页面出事化*/
	/*弹起软件盘*/
    keyUp: function(){
        /*$(".searchName").click(function(){
            $("#content button").css("top", "-138px");
            $("#content").css("top", "-88px");
            return false;
        });*/
    },
    /*收起软件盘*/
    keyDown: function(){
        /* $("body").not(".searchName").on("click",function(){
            $("#content button").css("top", "0px");
            $("#content").css("top", "0px");
        });*/
    },
    /*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("index.html");
		};
	},
	/*点击开始，继续，进行中*/
	myBtn:function(){
		$(".orderList").on("tap", ".myBtn", function(){
			var receiveOrderId = $(this).attr("data-id");
			var state = $(this).attr("state");
			if(state =='1' || state =='2'){//开始 //继续
				qmpur.ajax({
					url: userBasePath+"receiveOrder/startReceiveChack?orderId=" +receiveOrderId,
					success: function(data) {
						if(data){
							var id = data.id; /*收货单id*/
							qmpur.switchPage("startHarvset.html?type=1&id="+data.id);/*跳转收货页面*/
						}else{
							harvsetObj.searchOrder();
						}
					},
					error:function(){
						harvsetObj.pulldownRefresh();
					}
				});
	    	}else if(state =='3'){//进行中
	    	}else if(state =='4'){//完成
	    	}
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
		this.orderList();
		this.searchOrderList();
		this.initPullRefresh();
		this.mobileBack();
		this.myBtn();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	harvsetObj.initialize();
})