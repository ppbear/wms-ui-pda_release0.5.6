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
var reviewObj = {
	Configs: {
		orderList: userBasePath + "waveOrder/reviewList",  /*查询未完成复核的订单*/
		searchName: "",/*搜索名称*/
		pageNumber: 0,/*第1页*/
		size: 10,/*返回数据多少*/
		totalPages : 0,/*总页码*/
		startReviewUrl: userBasePath + "waveOrder/startCheck?orderNo=" /*开始复核*/
	},
	/*搜索订单*/
	searchOrder: function(){
		$("#content").bind('input porpertychange',function(){
			var searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(searchName){
				reviewObj.findOrderNo(searchName);
			} else {
				$(".listInput").hide(); /*隐藏模糊搜索的内容*/
			}
		})
	},
	/*订单搜索*/
	searchOrderList: function(){
		$(".searchInput").bind('input porpertychange',function(){
			reviewObj.Configs.searchName = $("input.searchName").val(); /*获取搜索输入的内容*/
			if(reviewObj.Configs.searchName){
				reviewObj.Configs.pageNumber = 0; /*默认返回第一页*/
				setTimeout(function() {
					mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
					mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
				}, 500);
				$(".orderList").html("");
				reviewObj.orderList();
			}
		})
	},
	/*清除搜索的内容*/
	clearSearchName: function(){
		$(".mui-icon-clear").on("tap", function(){
			$(".orderList").html("");
			reviewObj.orderList();
			reviewObj.Configs.pageNumber = 0; /*默认返回第一页*/
			reviewObj.Configs.searchName = "";
			setTimeout(function() {
				mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
				mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
			}, 500);
			$(".orderList").html("");
			reviewObj.orderList();
//			$(".listInput").hide(); /*隐藏模糊搜索的内容*/
		});
	},
	/*订单列表*/
	orderList: function(){
		reviewObj.getUserInfo();
		qmpur.ajax({
			url: reviewObj.Configs.orderList,
			data: {
				number: reviewObj.Configs.pageNumber,
				size: reviewObj.Configs.size,
				searchName: reviewObj.Configs.searchName
			},
			success: function(data) {
				var data = data.content;
				if(data.length){
					console.log(data);
					$(".mui-pull").show()
					reviewObj.Configs.totalPages = data.totalPages-1; /*总页码*/
					var len = data.length;
					var orderList = "";
					$(".noData").hide();
					for(var i = 0; i < len; i++){
						//orderList += '<li class="simulationA mui-table-view-cell" data-url="startPutaway.html?id='+data[i].id+'&type=PURCHASE&otherOrderNo='+data[i].otherOrderNo+'">';
						orderList += '<li class="simulationA mui-table-view-cell">';
						orderList += '<div>';
				    	orderList += '<span class="l blackCla">'+ data[i].orderNo +'</span>';	
				    	//3进行中2开始1继续
				    	var statue=0;
				    	if(data[i].shopId =='2'){//开始
				    		orderList += '<div class="r  myBtn" state="2" data-order-no='+data[i].orderNo+'>'+ i18n_com_begin +'</div>';
				    		statue=2;
				    	}else if(data[i].shopId =='3'){//进行中
				    		orderList += '<div class="r noActive " state="3" data-id='+data[i].id+'>'+ i18n_com_going +'</div>';
				    	 	statue=3;
				    	}else if(data[i].shopId =='1'){//继续
				    		orderList += '<div class="r myBtn" state="1" data-order-no='+data[i].orderNo+'>'+ i18n_picking_continue +'</div>';
				    	 	statue=1;
				    	}
				    	orderList += '</div><div></div>';
				    	
				    	if(data[i].catchStorage){
				    		for(var j = 0; j<data[i].catchStorage.length;j++){
				    			if(j%2==0){
				    				orderList += '<div>';
				    				orderList += '<span class="l noActiveCla">'+ data[i].catchStorage[j].code +'</span>';	
				    			}else{
				    				orderList += '<span class="r">'+ data[i].catchStorage[j].code +'</span>';	
				    				orderList += '</div>';
				    			}
				    		}
				    	}
				    	
				    	
				    	orderList += '</li>';
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
				if(type != 'cancel'){
					$(".searchInput").show(); /*显示模糊搜索的内容*/
				}else{
					$(".searchInput").hide(); /*隐藏模糊搜索的内容*/
				}
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
					callback: reviewObj.pullupRefresh/*上拉加载回调函数*/
				},
				down: {
					callback: reviewObj.pulldownRefresh
				},
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		reviewObj.Configs.pageNumber++;
		setTimeout(function(){
		   	reviewObj.orderList();
		   	mui('#refreshContainer').pullRefresh().endPullupToRefresh(reviewObj.Configs.totalPages <= reviewObj.Configs.pageNumber);
	     },300);
	},
	/*下拉加载*/
	pulldownRefresh: function(){
		setTimeout(function() {
			$(".orderList").html("");
			reviewObj.Configs.pageNumber = 0;
		   	reviewObj.orderList();
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
	/*点击开始，继续，进行中*/
	myBtn:function(){
		$(".orderList").on("tap", ".myBtn", function(){
			var state = $(this).attr("state");
			if(state =='1' || state =='2'){//开始 //继续
				var orderNo = $(this).attr("data-order-no");
				qmpur.ajax({
					url: reviewObj.Configs.startReviewUrl + orderNo,
					success: function(data) {
						var id = data.id; /*复核id*/
						qmpur.switchPage("startReview.html?id="+id +"&orderNo="+data.orderNo);/*跳转复核页面*/
					}
				});
	    	}else if(state =='3'){//进行中
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
	}
}

$(function(){
	reviewObj.initialize();
})