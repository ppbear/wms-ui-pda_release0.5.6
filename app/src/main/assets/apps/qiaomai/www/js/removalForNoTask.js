/**
 * @file            removalForNoTask.js
 * @description     按单出库js
 * @author          杨蕊宇
 * @version         0.3.7
 * @date            2017/12/15
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */

var removalForNoTaskObj = {
	Configs: {
		outputUrl:qmpur.Configs.userBasePath +"waveOrder/orderForNoTaskOut",/*出库*/
		orderQueryUrl:  qmpur.Configs.userBasePath + "waveOrder/getOrderForNoTask", /*出库订单搜索接口*/
		locationQueryUrl: qmpur.Configs.userBasePath + "pdaSearch/locationQuery", /*库位搜索接口*/
		searchName: "", /*搜索内容*/
		pageNumber: 0,/*商品第一页*/
		totalPages: 0,/*总页码*/
		size: 10 /*每页返回的数据*/
	},
	/*待出库订单列表*/
	list: function(){
		qmpur.ajax({
			data: {
				number: removalForNoTaskObj.Configs.pageNumber,
				size: removalForNoTaskObj.Configs.size,
				searchName: removalForNoTaskObj.Configs.searchName,
				type:1
			},
			url: removalForNoTaskObj.Configs.orderQueryUrl,
			beforeSend: function(){
				var loading = "<div id='loading'>"+ i18n_com_loading  +"</div>";
				var len = $("#loading").length;
				if(len == 0){
					$("body").append(loading);
				}
				$("#loading").show();
			},
			success: function(data) {
				if(data.content.length > 0){
					console.log(data.content);
					var totalPages = data.totalPages-1; /*总页码*/
					mui('#refreshContainer').pullRefresh().endPullupToRefresh(totalPages <= removalForNoTaskObj.Configs.pageNumber);
					var result = data.content;
					var str = "";
					$(".noData").hide();
					$(".goodsList").html("");
					for(var i = 0; i < data.content.length; i++){
						if(i == 0 &&removalForNoTaskObj.Configs.pageNumber == 0){
							str += '<li class="mui-table-view-cell goodsInfoList simulationA first" >';
						}else{
							str += '<li class="mui-table-view-cell goodsInfoList simulationA" >';
						}
						str += '<div>';	
						str += '<span class="rightContent">'+ result[i].orderNo +'</span>';	
						if(result[i].status == 6){
							str += '<button class="r connect" data-id="'+result[i].id+'">'+ i18n_removal_hand_over +'</button>';	
						}else if(result[i].status >6){
							str += '<button style="border: 1px solid #3e3e3e; color:#3e3e3e;" disabled class="r connect" data-id="'+result[i].id+'">'+ i18n_removal_hand_overed +'</button>';	
						}
						
						var cs = data.content[i].catchStorage;
						if(cs!=null && cs.length>0){
							for(var j = 0 ;j<cs.length;j++){
								if(j%2 == 0){
									str += '<div>';	
									str += '<span class="l min">'+ cs[j].code+'</span>';	
								}else{
									str += '<span class="r min">'+ cs[j].code +'</span>';	
									str += '</div>';	
								}
							}
						}
						str += '</div>';
						str += '</li>';	
					}
					$(".goodsList").append(str);
				} else {
					$(".mui-pull").hide(); /*隐藏提示信息*/
					$(".noData").show();
				}
				var dLen = $(".goodsList .mui-table-view-cell").length;
				if(dLen > 0){
					$(".noData").hide();
//					$(".mui-pull").hide(); /*隐藏提示信息*/
				} else {
					$(".mui-pull").show(); /*显示提示信息*/
				}
			},
			complete: function(){
				$("#loading").hide();
				removalForNoTaskObj.output();
			}
		});
	},
	/*点击搜索*/
	search: function(){
		$(".searchBtn").on("tap", function(){
			removalForNoTaskObj.Configs.searchName =  $(".searchName").val(); /*输入搜索的内容*/
			window.localStorage.setItem("searchName", removalForNoTaskObj.Configs.searchName);
			$(".mui-scroll").css("transform","translate3d(0px, 0px, 0px) translateZ(0px)");
			removalForNoTaskObj.Configs.pageNumber = 0; /*默认返回第一页*/
			if(removalForNoTaskObj.Configs.searchName){
				setTimeout(function() {
					mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
					mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
				}, 500);
				$(".goodsList").html("");/*清空数据*/
				removalForNoTaskObj.list();
			}
		});
	},
	/*交接*/	
	output: function(){
		$(".connect").on("tap",function(){
			var waveOrderId =$(this).attr("data-id");
			qmpur.ajax({
				url: removalForNoTaskObj.Configs.outputUrl+"?waveOrderId="+waveOrderId,
				success: function(data) {
					qmpur.toast(i18n_removal_outbound_success);
					qmpur.switchPage("removalForNoTask.html");
				},
				error:function(){
					qmpur.switchPage("removalForNoTask.html");
				}
			});
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
					callback: removalForNoTaskObj.pullupRefresh/*上拉加载回调函数*/
				}
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		removalForNoTaskObj.Configs.pageNumber++;
		setTimeout(function(){
		   	removalForNoTaskObj.list();
	     },300);
	},
	/*返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("moveMain.html");
		};
	},
	/*页面初始化*/
	initialize: function(){
		$(".searchName").val(removalForNoTaskObj.Configs.searchName);/*搜索赋值*/
		this.initPullRefresh();
		this.search();
		this.list();
		this.mobileBack();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	removalForNoTaskObj.initialize();
})