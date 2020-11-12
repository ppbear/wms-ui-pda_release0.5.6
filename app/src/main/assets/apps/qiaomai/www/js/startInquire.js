/**
 * @file            startInquire.js
 * @description     查询js
 * @author          郝四海
 * @version         0.3.7
 * @date            2017/10/10
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */

var startInquireObj = {
	Configs: {
		goodQueryUrl:  qmpur.Configs.userBasePath + "pdaSearch/goodQuery", /*商品搜索接口*/
		locationQueryUrl: qmpur.Configs.userBasePath + "pdaSearch/locationQuery", /*库位搜索接口*/
		searchName: window.localStorage.getItem("searchName"), /*搜索内容*/
		type: window.localStorage.getItem("type"), /*搜索类型*/
		pageNumber: 0,/*商品第一页*/
		totalPages: 0,/*总页码*/
		size: 10 /*每页返回的数据*/
	},
	/*商品或库位列表*/
	list: function(){
		var type = window.localStorage.getItem("type");
		var url = "";
		if(type == "goods"){
			url = startInquireObj.Configs.goodQueryUrl; /*商品接口*/
		} else if(type == "location"){
			url = startInquireObj.Configs.locationQueryUrl; /*库位接口*/
		}
		qmpur.ajax({
			data: {
				number: startInquireObj.Configs.pageNumber,
				size: startInquireObj.Configs.size,
				searchName: startInquireObj.Configs.searchName,
			},
			url: url ,
			beforeSend: function(){},
			success: function(data) {
				if(data.content.length > 0){
					var totalPages = data.totalPages-1; /*总页码*/
					mui('#refreshContainer').pullRefresh().endPullupToRefresh(totalPages <= startInquireObj.Configs.pageNumber);
					var result = data.content;
					var str = "";
					$(".noData").hide();
					for(var i = 0; i < data.content.length; i++){
						if(type == "goods"){
							str += '<li class="mui-table-view-cell goodsInfoList simulationA" data-url="goodsInfo.html?id='+result[i].id+'">';
							str += '<div class="omit" >';
							str += ' <span class="leftTitle goodsName l omit">'+ result[i].name +'</span>&nbsp;	';	
							str += '<span class="rightContent mui-icon mui-icon-arrowright r"></span>';	 
							str += '</div>';	 
							str += '<div>';	
							str += '<span class="leftTitle">'+ i18n_com_standard +'</span>&nbsp;';	
							str += '<span class="rightContent">'+ result[i].standard +'</span>';	
							str += '<span class="r goodsUnit">'+ result[i].unit +'</span>';	
							str += '<span class="r unit">'+ i18n_com_unit +'</span>';	
							str += '</div>';	
							str += '<div>';	
							str += '<span class="leftTitle">'+ i18n_com_bar_code +'</span>&nbsp;';	
							str += '<span class="rightContent">'+ result[i].barcode +'</span>';		
							str += '</div>';	
							str += '</div>';	
							str += '<span class="leftTitle">'+ i18n_com_sku +'</span>&nbsp;&nbsp;';		
							str += '<span class="rightContent">'+ result[i].skucode +'</span>';	
							str += '</div>';	
							str += '</li>';	
						} else if(type == "location"){
							if( result[i].empty){
								str += '<li class="emptyLocation locationList mui-table-view-cell">';
								str += '<img src="img/null.png">';
								str += '<div>';	
								str += '<span class="leftTitle goodsName">'+  result[i].code +'</span>';	
								str += '<span class="r goodsUnit">'+ result[i].userModeName +'</span>';	
								str += '</div>';	
								str += '</li>';	
							} else {
								var goodsList = result[i].goodsList;
								str += '<li class="locationList mui-table-view-cell">';
									str += '<div class="title">';	
									str += '<span class="leftTitle goodsName">'+  result[i].code +'</span>';	
									str += '<span class="r goodsUnit">'+ result[i].userModeName + '</span>';	
									str += '</div>';
									str += '<div class="line" style="height:7px"></div>';	
								for(var j = 0; j < goodsList.length; j++){
									if(j!=0){
										str += '<div class="line" style="height:7px"></div>';	
										str += '<div class="title"></div>';	
										str += '<div class="line" style="height:7px"></div>';	
									}
									str += '<div class="omit">'; 	
									str += ' <span class="leftTitle goodsName l omit">'+ goodsList[j].name +'</span>&nbsp;	';	
									str += '</div>';	 
									str += '<div>';	
									str += '<span class="leftTitle">'+ i18n_com_standard +'</span>&nbsp;';	
									str += '<span class="rightContent">'+ goodsList[j].standard +'</span>';	
									str += '<span class="r goodsUnit">'+ goodsList[j].availableStock + goodsList[j].unit +'</span>';	
									str += '<span class="r unit">'+ i18n_com_stock +'</span>';	
									str += '</div>';	
									str += '<div>'; 
									str += '<span class="leftTitle">'+ i18n_harvest_date_in_produced +'</span>&nbsp;';
									str += '<span class="leftTitle rightContent">'+ goodsList[j].productDate+'</span>&nbsp;';
									str += '</div>';	
									str += '<div>';
									str += '<span class="leftTitle">'+ i18n_com_bar_code +'</span>&nbsp;';	
									str += '<span class="rightContent">'+ goodsList[j].barcode +'</span>';		
									str += '</div>';	
									str += '<div>';	
									str += '<span class="leftTitle">'+ i18n_com_sku +'</span>&nbsp;';		
									str += '<span class="rightContent">'+ goodsList[j].skucode +'</span>';	
									str += '</div>';	
									
								}
								str += '</li>';	
							}
						}
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
			}
		});
	},
	/*点击搜索*/
	search: function(){
		$(".searchBtn").on("tap", function(){
			startInquireObj.Configs.searchName =  $(".searchName").val(); /*输入搜索的内容*/
			window.localStorage.setItem("searchName", startInquireObj.Configs.searchName);
			$(".mui-scroll").css("transform","translate3d(0px, 0px, 0px) translateZ(0px)");
			startInquireObj.Configs.pageNumber = 0; /*默认返回第一页*/
			if(startInquireObj.Configs.searchName){
				setTimeout(function() {
					mui('#refreshContainer').pullRefresh().refresh(true); /*重置上拉加载*/
					mui('#refreshContainer').pullRefresh().scrollTo(0, 0);
				}, 500);
				$(".goodsList").html("");/*清空数据*/
				startInquireObj.list();
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
					callback: startInquireObj.pullupRefresh/*上拉加载回调函数*/
				}
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		startInquireObj.Configs.pageNumber++;
		setTimeout(function(){
		   	startInquireObj.list();
	     },300);
	},
	/*返回*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("inquire.html");
		};
	},
	/*页面初始化*/
	initialize: function(){
		$(".searchName").val(startInquireObj.Configs.searchName);/*搜索赋值*/
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
	startInquireObj.initialize();
})