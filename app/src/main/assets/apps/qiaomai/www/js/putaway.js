/**
 * @file            putaway.js
 * @description     上架主页
 * @author          刘路阳
 * @version         0.1.8
 * @date            2017/7/10
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;

/**
 * description 新建一个对象
 */
var type="PURCHASE";
var userId ="";
var putawayObj = {
	Configs: {
		findOrderNoUrl: userBasePath + "putaway/getWaitPutawayOrders?searchName=",
		orderList: userBasePath + "putaway/findOrders",  /*查询所有的采购入库订单*/
		searchName: "",/*搜索名称*/
		pageNumber: 0,/*第1页*/
		size: 10,/*返回数据多少*/
		totalPages : 0,/*总页码*/
		startPutawayUrl: userBasePath + "putaway/startPutaway/"
	},
	/*搜索订单*/
	searchOrder: function(){
		$("#content").bind('input porpertychange',function(){
			var searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(searchName){
				putawayObj.findOrderNo(searchName);
			} else {
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
			}
		})
	},
	/*订单查询*/
	findOrderNo: function(searchName) {
		qmpur.ajax({
			url: putawayObj.Configs.findOrderNoUrl + searchName,
			success: function(data) {
				$(".listInput").html(""); /*清空模糊搜索的内容*/
				var len = data.length;
				if(len > 0) {
					if(len > 5) {
						len = 5;
					}
					var listInput = "";
					for(var i = 0; i < len; i++) {
						listInput += "<li>" + data[i] + "</li>";
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
	/*订单搜索*/
	searchOrderList: function(){
		$(".searchInput").bind('input porpertychange',function(){
			putawayObj.Configs.searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(putawayObj.Configs.searchName){
				putawayObj.Configs.pageNumber = 0; /*默认返回第一页*/
				setTimeout(function() {
					mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
					mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
				}, 500);
				$(".orderList").html("");
				putawayObj.orderList();
			}
		})
	},
	/*清除搜索的内容*/
	clearSearchName: function(){
		$(".mui-icon-clear").on("tap", function(){
			$(".orderList").html("");
			putawayObj.orderList();
			putawayObj.Configs.pageNumber = 0; /*默认返回第一页*/
			putawayObj.Configs.searchName = "";
			setTimeout(function() {
				mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
				mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
			}, 500);
			$(".orderList").html("");
			putawayObj.orderList();
//			$(".listInput").hide(); /*隐藏模糊搜索的内容*/
		});
	},
	/*订单列表*/
	orderList: function(){
		putawayObj.getUserInfo();

		qmpur.ajax({
			url: putawayObj.Configs.orderList,
			data: {
				number: putawayObj.Configs.pageNumber,
				size: putawayObj.Configs.size,
				searchName: putawayObj.Configs.searchName
			},
			beforeSend: function(){},
			success: function(data) {
				var data = data.content;
				if(data.length){
					console.log(data);
					$(".mui-pull").show()
					putawayObj.Configs.totalPages = data.totalPages-1; /*总页码*/
					var len = data.length;
					var orderList = "";
					$(".noData").hide();
					//如果有领取了任务的(3进行中2开始1继续)，则领取按钮置灰
					for(var i = 0; i < len; i++){
						var orderNo ='';
				    	if(data[i].roOtherOrderNo){
				    		orderNo = data[i].roOtherOrderNo;
				    	}else if(data[i].woId){
				    		orderNo = data[i].woOrderNo;
				    	}
						orderList += '<li class="simulationA mui-table-view-cell">';
						orderList += '<div>';
						orderList += '<span class="l min3">'+ orderNo +'</span>';	
				    	//继续，开始，进行中
				    	//上架状态 WAITPUT("未上架"),PUTING("正在上架"),PARTPUT("部分上架"),HAVEPUT("已上架");
				    	var statue=0;
				    	var id ='';
				    	if(data[i].roId){
				    		id = data[i].roId;
				    	}else if(data[i].woId){
				    		id = data[i].woId;
				    	}
				    	
				    	if(data[i].status =='1') {//继续
				    		orderList += '<div class="r myBtn" state="1" data-id='+id+'>'+ i18n_picking_continue +'</div>';
				    	 	statue=1;
				    	}else if(data[i].status =='2'){//开始
				    		orderList += '<div class="r  myBtn" state="2" data-id='+id+'>'+ i18n_com_begin +'</div>';
				    		statue=2;
				    	}else if(data[i].status =='3'){//进行中
				    		orderList += '<div class="r noActive " state="3" data-id='+id+'>'+ i18n_com_going +'</div>';
				    	 	statue=3;
				    	}
				    	
				    	orderList += '</div>';
				    	orderList += '<div>';
				    	if(data[i].type=='PURCHASE'){//类型（1：PURCHASE采购订单 2：RETURN销退订单, 3: CANCEL销单订单） 
				    		orderList += '<span class="l min2">'+ i18n_putaway_purchase_order +'</span>';	
				    	}else if(data[i].type=='RETURN'){
				    		orderList += '<span class="l min2">'+ i18n_putaway_return_order +'</span>';	
				    	}if(data[i].type=='CANCEL'){
				    		orderList += '<span class="l min2">'+ i18n_putaway_cancel_order +'</span>';	
				    	}

				    	//上架状态 WAITPUT("未上架"),PUTING(""),PARTPUT("部分上架"),HAVEPUT("已上架");
				    	if(statue ==1){// 继续 部分上架  
				    		orderList += '<span class="r min min2">'+ i18n_putaway_count_part +'</span>';
				    	}else if(statue ==2){//开始待上架
				    		orderList += '<span class="r min min2">'+ i18n_putaway_pre +'</span>';
				    	}else if(statue ==3){//进行中正在上架
				    		orderList += '<span class="r min min2">'+ i18n_putaway_ing +'</span>';
				    	}else if(data[i].putawayStatus =='HAVEPUT'){//已上架
				    		orderList += '<span class="r min">'+ i18n_putaway_count_haved +'</span>';
				    	}
				    	
				    	orderList += '</div>';
				    	orderList += '<div class="omit min1">'+ data[i].supplierName +'</div>';	
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
//				if(typea != 'CANCEL'){
//					$(".searchInput").show(); /*显示模糊搜索的内容*/
//				}else{
//					$(".searchInput").hide(); /*隐藏模糊搜索的内容*/
//				}
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
					callback: putawayObj.pullupRefresh/*上拉加载回调函数*/
				},
				down: {
					callback: putawayObj.pulldownRefresh
				},
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		putawayObj.Configs.pageNumber++;
		setTimeout(function(){
		   	putawayObj.orderList();
		   	mui('#refreshContainer').pullRefresh().endPullupToRefresh(putawayObj.Configs.totalPages <= putawayObj.Configs.pageNumber);
	     },300);
	},
	/*下拉加载*/
	pulldownRefresh: function(){
		setTimeout(function() {
			$(".orderList").html("");
			putawayObj.Configs.pageNumber = 0;
		   	putawayObj.orderList();
			mui('#refreshContainer').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 300);
	},
	/*选择模糊搜索的内容*/
	selectSearchName: function(){
		$(".listInput").on("tap", "li", function(){
			var searchName = $(this).text();/*获取选择的内容*/
			$("input.searchName").val(searchName);/*赋值给input*/
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
		});
	},
	/*开始上架*/
	startHarvset: function(){
		$(".harvest").on("tap", function(){
			var searchName = $("input.searchName").val();/*获取搜索的内容*/
			if(searchName){
				qmpur.ajax({
					url: putawayObj.Configs.startPutawayUrl+"?id=" +searchName,
					success: function(data) {
						var id = data; /*收货单id*/
						qmpur.switchPage("startPutaway.html?type="+ window.localStorage.getItem("putAwayType").toUpperCase() +"&id="+id);/*跳转收货页面*/
					}
				});
			} else {
				qmpur.toast(i18n_harvest_please_scan_or_enter_a_barcode);
			}
		});
	},
	/*点击开始，继续，进行中*/
	myBtn:function(){
		$(".orderList").on("tap", ".myBtn", function(){
			var receiveOrderId = $(this).attr("data-id");
			var state = $(this).attr("state");
			if(state =='1' || state =='2'){//开始 //继续
				qmpur.ajax({
					url: userBasePath+"putaway/start?receiveOrderId=" +receiveOrderId,
					success: function(data) {
						var id = data; /*收货单id*/
						qmpur.switchPage("startPutaway.html?type="+type+"&id="+data.id+"&otherOrderNo="+data.otherOrderNo);/*跳转收货页面*/
					},error:function(){
						putawayObj.pulldownRefresh();
					}
				});
	    	}else if(state =='3'){//进行中
	    	}else if(state =='4'){//完成
	    	}
		});
	},
    /*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("index.html");
		};
	},
	/*获取登录人信息*/
	getUserInfo:function(){
		qmpur.ajax({
			url: userBasePath+"login/user",
			success: function(data) {
				userId = data.id; 
			}
		});
	},
	initialize: function(){
		this.searchOrder(); 
		this.clearSearchName();
		this.selectSearchName();
		this.orderList();
		this.searchOrderList();
		this.initPullRefresh();
		this.mobileBack();
		this.myBtn();
		this.startHarvset();
	}
}

$(function(){
	putawayObj.initialize();
})