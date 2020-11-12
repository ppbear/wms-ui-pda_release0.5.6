/**
 * @file            removal.js
 * @description     出库主页
 * @author          师志强
 * @version         0.2.2
 * @date            2017/7/27
 * @copyright       河南巧脉信息技术有限公司
 */

var userBasePath = qmpur.Configs.userBasePath;

/**
 * description 新建一个对象
 */

var removalObj = {
	Configs: {
		findOrderUrl: userBasePath + "waveTask/removalList",  /*获取列表*/
		startRemovalUrl: userBasePath + "waveTask/startOutbound?orderNo=",/*开始出库*/
		searchName: "",/*搜索名称*/
		pageNumber: 0,/*第1页*/
		size: 10,/*返回数据多少*/
		totalPages : 0,/*总页码*/
	},
	/*scan扫码判断*/
	scanJudge: function(){
		$(document).keyup(function (event) {
	        var code = event.keyCode;
	        if(code == 120){
                //确实有该订单，则进入出库页面
                $(".harvest").click();
	        } 
	    });
	},
	/*弹起软件盘*/
    keyUp: function(){
        $(".searchName").click(function(){
            $("#content button").css("top", "-138px");
            $("#content").css("top", "-88px");
        });
    },
    /*收起软件盘*/
    keyDown: function(){
         $("body").not(".searchName").on("tap",function(){
            $("#content button").css("top", "0px");
            $("#content").css("top", "0px");
        });
    },
    
    /*订单列表*/
	orderList: function(){
		qmpur.ajax({
			url: removalObj.Configs.findOrderUrl,
			data: {
				number: removalObj.Configs.pageNumber,
				size: removalObj.Configs.size,
				searchName: removalObj.Configs.searchName
			},
			success: function(data) {
				var data = data.content;
				if(data.length){
					console.log(data);
					$(".mui-pull").show()
					removalObj.Configs.totalPages = data.totalPages-1; /*总页码*/
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
				    	if(data[i].tmsOrderNo =='2'){//开始
				    		orderList += '<div class="r  myBtn" state="2" data-order-no='+data[i].orderNo+'>'+ i18n_com_begin +'</div>';
				    		statue=2;
				    	}else if(data[i].tmsOrderNo =='3'){//进行中
				    		orderList += '<div class="r noActive " state="3" data-id='+data[i].id+'>'+ i18n_com_going +'</div>';
				    	 	statue=3;
				    	}else if(data[i].tmsOrderNo =='1'){//继续
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
					callback: removalObj.pullupRefresh/*上拉加载回调函数*/
				},
				down: {
					callback: removalObj.pulldownRefresh
				},
		  	}
		});
	},
	/*上拉加载*/
	pullupRefresh: function(){
		/*page++;*/
		removalObj.Configs.pageNumber++;
		setTimeout(function(){
		   	removalObj.orderList();
		   	mui('#refreshContainer').pullRefresh().endPullupToRefresh(removalObj.Configs.totalPages <= removalObj.Configs.pageNumber);
	     },300);
	},
	/*下拉加载*/
	pulldownRefresh: function(){
		setTimeout(function() {
			$(".orderList").html("");
			removalObj.Configs.pageNumber = 0;
		   	removalObj.orderList();
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
					url: removalObj.Configs.startRemovalUrl + orderNo,
					success: function(data) {
						var id = data.id; /*出库id*/
					qmpur.switchPage("startRemoval.html?id=" + id + "&orderNo="+data.orderNo);/*跳转出库页面*/
					}
				});
	    	}else if(state =='3'){//进行中
	    	}
		});
	},
    /*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			qmpur.switchPage("moveMain.html");
		};
	},
	initialize: function(){
		this.keyUp();
        this.keyDown();
		this.scanJudge();
		this.mobileBack();
		this.orderList();
		this.myBtn();
		this.initPullRefresh();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	removalObj.initialize();
	$(".searchName").focus();/*页面进入的时候获取 焦点*/
})