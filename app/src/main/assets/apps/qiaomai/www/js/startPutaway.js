/**
 * @file            startPutaway.js
 * @description     上架
 * @author          刘路阳
 * @version         0.1.8
 * @date            2017/7/10
 * @copyright       河南巧脉信息技术有限公司
 */
var type = qmpur.getQueryString("type");
if(type == "return"){
	$(".title").text(i18n_putaway_return);
} else {
	if(qmpur.getQueryString("otherOrderNo")){
		$(".title").text(i18n_putaway+" "+ qmpur.getQueryString("otherOrderNo"));
	} else {
		$(".title").text(i18n_putaway);
	}
}
var userBasePath = qmpur.Configs.userBasePath+"putaway";
var id = qmpur.getQueryString("id");/*收货单Id*/
var name2goodsId={};/*商品下拉列表*/
var id2Obj={};/*上架单Id 和对象映射Map*/
/*------------提交数据-----------------------*/
var putAway={};/*待上架的上架详细*/
var locationId ;
var putCount = 0;
var _this = "";
/*------------提交数据-----------------------*/
/**
 * description 新建一个对象
 */

var putawayObj = {
	Configs: {
		queryForPutawayDetails: userBasePath + "/queryForPutawayDetails?orderId=" + id, /*获取收货单接口*/
		receiveOrderUrl: userBasePath + "/getPutawayCount?receiveOrderId=" + id, /*获取上架单接口*/
		checkStorageLocation: userBasePath + "/checkStorageLocation",/*库位校验*/
		findOneUrl: userBasePath + "/findOne/",
		confirmCommitUrl:userBasePath+"/doPut" /*上架*/
	},
	
	init:function(){
		$("#barcode").change(function(){
			var code = $(this).val();
			if(null==code || code.trim().length==0){
				this.clear(); 
				return ;
			}
			qmpur.ajax({
				url: putawayObj.Configs.queryForPutawayDetails + "&barCode="+code,
				success: function(data) {
					if(null == data || data.length == 0){
						qmpur.toast(i18n_putaway_please_first_harvest); 
						putawayObj.clear();
						return ;
					}
					name2goodsId={};
					id2Obj={};
					putAway={};
					var options ="" ;
					var len = data.length;
					for(var i= 0;i<len;i++){
						id2Obj[data[i].id]=data[i];
						if(!name2goodsId.hasOwnProperty(data[i].goods.id)){
							name2goodsId[data[i].goods.id] = {};
							name2goodsId[data[i].goods.id].productDates= [];
							options += "<option value='"+data[i].goods.id+"'  data-standard='"+ data[i].goods.standard +"'>"+data[i].goods.name+"</option>"
						}
						name2goodsId[data[i].goods.id].name = data[i].goods.name;
						var dateTmp = {"dateStr":qmpur.formatDate(data[i].productDate),"id":data[i].id};
						name2goodsId[data[i].goods.id].productDates.push(dateTmp);
					}
					$("#goodsName").html(options);
					$("#goodsName").change();
					if(len==1){
						options ="" ;
						$(".standard input").val(data[0].goods.standard); /*商品规格*/
					} else {
						options ="<option value=''>"+ i18n_com_please_select_the_product+ "</option>";
					}
				}
			});
		});
		/**
		 * 商品名称下拉列表选择事件
		 */
		$("#goodsName").change(function(){
			$("#producedate").html("");
			var goodsId = $(this).val();
			if(goodsId&&goodsId!=''){
				var productDateOptions = "";
				var len = name2goodsId[goodsId].productDates.length;
				if(len==1){
					productDateOptions = "";
				} else {
					productDateOptions += "<option value=''>"+i18n_harvest_please_select_the_date_of_production+"</option>"
				}
				for(var i =0 ;i<len;i++){
					var dateTmp =name2goodsId[goodsId].productDates[i];
					 productDateOptions += "<option value='"+dateTmp.id+"'>"+dateTmp.dateStr+"</option>"
				}
				var standard = $("#goodsName").find("option:selected").attr("data-standard");
				$(".standard input").val(standard); /*商品规格*/
				$("#producedate").html(productDateOptions);
				if($("#producedate").val()){
					$("#producedate").change();
					$("#storageLocationCode").focus();
					$("#storageLocationCode").click();
				}
			}
		});
		/**
		 * 生产日期下拉列表选择事件
		 */
		$("#producedate").change(function(){
			var waitPut = id2Obj[$(this).val()];
			$("#preCount").val(waitPut.prePutCount); /*预上架数量*/
            $("#havPutCount").val(waitPut.havPutCount); /*预上架数量*/
            $(".unit").val(waitPut.goods.unit); /*单位*/
            putAway = waitPut;
            if($("#producedate").val()){
				$("#storageLocationCode").focus();
				$("#storageLocationCode").click();
			}
           if("return" == type){
           	$("#storageLocationCode").attr("placeholder","");
				qmpur.ajax({
	                url: userBasePath+"/queryAdviseLocation?goodsId="+waitPut.goods.id+"&productDate="+qmpur.formatDate(waitPut.productDate),
	                success: function(data) {
						$("#storageLocationCode").attr("placeholder",data);
					}
                });          	
           }else {
                $("#storageLocationCode").focus();
           }
		});
		/**
		 * 库位编码
		 */
		$("#storageLocationCode").change(function() {
			var code = $(this).val();
			if(code && '' != code) {
				var checkUrl = putawayObj.Configs.checkStorageLocation + "?code=" + code;
				if(putAway && putAway.productDate) {
					checkUrl = checkUrl + "&goodsId=" + putAway.goods.id + "&produceDate=" + qmpur.formatDate(putAway.productDate);
				}
				qmpur.ajax({
					url: checkUrl,
					success: function(data) {
						locationId = data.id;
						$("#putCount").focus();
						return ;
					},
					error: function() {
						$("#storageLocationCode").val("");
						locationId = null;
					}
				});
			}
			$(this).focus();
		});
		/**
		 * 上架数目
		 */
		$("#putCount").change(function(){
			var _putCount = $(this).val()*1;
			var _havPutCount = $("#havPutCount").val()*1;
			var sumCount = _putCount + _havPutCount ;
			putCount = 0;
			if(sumCount <= putAway.prePutCount){
				putCount= _putCount;
			}else{
				$(this).val("");
				qmpur.toast(i18n_putaway_please_put_count_not_greater_harvest); 
			}
		});
		/**
		 * 库位更改按钮
		 */
		$(".change_location").click(function(){
			$("#storageLocationCode").val("");
			$("#storageLocationCode").focus();
		});
		
	},
	/*清空商品信息*/
	clear: function(){
		$("#producedate").html(""); /*生产日期*/
		$("#goodsName").html(""); /*商品名字*/
		$(".standard input").val(""); /*商品名字*/
		$(".barcode input").val(""); /*商品条形码*/
		$("#preCount").val(""); /*预上架数量*/
		$(".unit").val(""); /*商品单位*/
		$("#storageLocationCode").val(""); /*库位*/
		$("#havPutCount").val(""); /*已收上架*/
		$("#putCount").val(""); /*上架数量*/
		setTimeout(function(){
            $(".barcode input").focus();
        }, 100);
	},
	/*确认*/
	confirm: function(){
		$(".footerBtn .confirm").on("tap", function(){
			$("#content").css("top", "0px");
			$("#putCount").change();
			var barcode = $(".barcode input").val(); /*商品条形码*/
			if(!barcode){
				qmpur.toast(i18n_harvest_please_scan_the_container_number); /*商品条形码验证*/
				return false;
			}
			
			if(!locationId || '' == locationId){
				qmpur.toast(i18n_putaway_please_commodity_location_code); /*商品条形码验证*/
				return false;
			}
			$("#storageLocationCode").change();
			putAway.storageLocation = {id:locationId};
			if( putCount < 1 ){
				qmpur.toast(i18n_putaway_please_input_the_goods_quantity); /*商品条形码验证*/
				return false;
			};
			putAway.putCount = putCount;
			putawayObj.confirmCommit(putAway);
		});
	},
	/*点击继续*/
	next: function(){
		$(".next").click(function(){
			$("#content").css("top", "0px");
			qmpur.ajax({
				url: putawayObj.Configs.queryForPutawayDetails,
				success: function(data) {
					if(!data.length){
						qmpur.toast(i18n_removal_has_nothing_to_be_shelves);
					}
					putawayObj.clear();
				}
			});
		});
	},
	/*确认提交*/
	confirmCommit: function(params){
		qmpur.ajax({
			type:"PUT",
			data: {
				id :params.id,
				number:params.putCount,
				locationId:locationId
			},
			url: putawayObj.Configs.confirmCommitUrl,
			success: function(data) {
			    /*修改选项*/
				id2Obj[params.id].havPutCount = data.havPutCount;
				putAway = id2Obj[params.id];
				$("#havPutCount").val(putAway.havPutCount);
				$("#putCount").val("");
				$("#storageLocationCode").val("");
                locationId = null;
                putawayObj.getReceiveOrder();
                if($(".waitReceive ").text() == 0 && $(".receivePartCount ").text() == 0) {
                    /*上架完成*/
                   qmpur.toast(i18n_com_task_done);
                   putawayObj.pageBack();
                } else {
                	qmpur.toast(i18n_index_putaway_success);
                }
                if($("#preCount").val() == $("#havPutCount").val()){
                	$(".next").click();
                }
			}
		});
	},
	/*获取已收货的种类*/
	getReceiveOrder: function(){
		qmpur.ajax({
			url: putawayObj.Configs.receiveOrderUrl,
			success: function(data) {
				$(".waitReceive").text(data.forPutCount); /*待收货*/
				$(".receivePartCount").text(data.putPartCount); /*部分收货*/
				$(".completeReceive").text(data.putAllCount); /*完成收货*/
				var forPutDetailsLen = data.forPutDetails.length;
				var putPartDetailsLen = data.putPartDetails.length;
				var putAllDetailsLen = data.putAllDetails.length;
				var forPutDetailsList = "";
				var putPartDetailsList = "";
				var putAllDetailsLenList = "";
				/*待收货*/
				$(".forReceiveDetails").html("");
				for(var i = 0; i < forPutDetailsLen; i++){
					forPutDetailsList += '<li>';
					forPutDetailsList += '<div class="omit">'+ data.forPutDetails[i].goods.name +'</div>';
					forPutDetailsList += '<div>';
					forPutDetailsList += '<span class="l">';
					forPutDetailsList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					forPutDetailsList += '<span>'+ data.forPutDetails[i].goods.standard +'</span>';
					forPutDetailsList += '</span>';
					forPutDetailsList += '<span class="r">';
					forPutDetailsList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					forPutDetailsList += '<span>'+ data.forPutDetails[i].goods.barcode +'</span>';
					forPutDetailsList += '</span>';
					forPutDetailsList += '</div>';
					forPutDetailsList += '<div>';
					forPutDetailsList += '<span class="l">';
					forPutDetailsList += '<span class="gray">'+ i18n_putaway_count_pre +'</span>&nbsp;';
					forPutDetailsList += '<span>'+ data.forPutDetails[i].prePutCount+''+data.forPutDetails[i].goods.unit +'</span>';
					forPutDetailsList += '</span>';
					forPutDetailsList += '<span class="r">';
					forPutDetailsList += '<span class="gray">'+ i18n_harvest_date_in_produced +'</span>&nbsp;';
					forPutDetailsList += '<span class="">'+ data.forPutDetails[i].productDate+'</span>';
					forPutDetailsList += '</span>';
					forPutDetailsList += '</div>';
					forPutDetailsList += '<div>';
					forPutDetailsList += '<span class="l">';
					forPutDetailsList += '<span class="gray">'+ i18n_putaway_count_haved +'</span>&nbsp;';
					forPutDetailsList += '<span class="red">'+ data.forPutDetails[i].havPutCount+''+data.forPutDetails[i].goods.unit +'</span>';
					forPutDetailsList += '</span>';
					forPutDetailsList += '</div>';
					forPutDetailsList += '</li>';
				}
				$(".forReceiveDetails").append(forPutDetailsList);
				/*部分收货*/
				$(".receivePartDetails").html("");
				for(var i = 0; i < putPartDetailsLen; i++){
					putPartDetailsList += '<li>';
					putPartDetailsList += '<div class="omit">'+ data.putPartDetails[i].goods.name +'</div>';
					putPartDetailsList += '<div>';
					putPartDetailsList += '<span class="l">';
					putPartDetailsList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					putPartDetailsList += '<span>'+ data.putPartDetails[i].goods.standard +'</span>';
					putPartDetailsList += '</span>';
					putPartDetailsList += '<span class="r">';
					putPartDetailsList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					putPartDetailsList += '<span>'+ data.putPartDetails[i].goods.barcode +'</span>';
					putPartDetailsList += '</span>';
					putPartDetailsList += '</div>';
					putPartDetailsList += '<div>';
					putPartDetailsList += '<span class="l">';
					putPartDetailsList += '<span class="gray">'+ i18n_putaway_count_pre +'</span>&nbsp;';
					putPartDetailsList += '<span>'+ data.putPartDetails[i].prePutCount+''+data.putPartDetails[i].goods.unit +'</span>';
					putPartDetailsList += '</span>';
					putPartDetailsList += '<span class="r">';
					putPartDetailsList += '<span class="gray">'+ i18n_harvest_date_in_produced +'</span>&nbsp;';
					putPartDetailsList += '<span class="">'+ data.putPartDetails[i].productDate +'</span>';
					putPartDetailsList += '</span>';
					putPartDetailsList += '</div>';
					putPartDetailsList += '<div>';
					putPartDetailsList += '<span class="l">';
					putPartDetailsList += '<span class="gray">'+ i18n_putaway_count_haved +'</span>&nbsp;';
					putPartDetailsList += '<span class="red">'+ data.putPartDetails[i].havPutCount+''+data.putPartDetails[i].goods.unit +'</span>';
					putPartDetailsList += '</span>';
					putPartDetailsList += '</div>';
					putPartDetailsList += '</li>';
				}
				$(".receivePartDetails").append(putPartDetailsList);
				/*已收货*/
				$(".receiveAllDetails").html("");
				for(var i = 0; i < putAllDetailsLen; i++){
					putAllDetailsLenList += '<li>';
					putAllDetailsLenList += '<div class="omit">'+ data.putAllDetails[i].goods.name +'</div>';
					putAllDetailsLenList += '<div>';
					putAllDetailsLenList += '<span class="l">';
					putAllDetailsLenList += '<span class="gray">'+ i18n_com_standard +'</span>&nbsp;';
					putAllDetailsLenList += '<span>'+ data.putAllDetails[i].goods.standard +'</span>';
					putAllDetailsLenList += '</span>';
					putAllDetailsLenList += '<span class="r">';
					putAllDetailsLenList += '<span class="gray">'+ i18n_com_bar_code +'</span>&nbsp;';
					putAllDetailsLenList += '<span>'+ data.putAllDetails[i].goods.barcode +'</span>';
					putAllDetailsLenList += '</span>';
					putAllDetailsLenList += '</div>';
					putAllDetailsLenList += '<div>';
					putAllDetailsLenList += '<span class="l">';
					putAllDetailsLenList += '<span class="gray">'+ i18n_putaway_count_pre +'</span>&nbsp;';
					putAllDetailsLenList += '<span>'+ data.putAllDetails[i].prePutCount+''+data.putAllDetails[i].goods.unit +'</span>';
					putAllDetailsLenList += '</span>';
					putAllDetailsLenList += '<span class="r">';
					putAllDetailsLenList += '<span class="gray">'+ i18n_harvest_date_in_produced +'</span>&nbsp;';
					putAllDetailsLenList += '<span class="receivedKind">'+ data.putAllDetails[i].productDate+'</span>';
					putAllDetailsLenList += '</span>';
					putAllDetailsLenList += '</div>';
					putAllDetailsLenList += '<div>';
					putAllDetailsLenList += '<span class="l">';
					putAllDetailsLenList += '<span class="gray">'+ i18n_putaway_count_haved +'</span>&nbsp;';
					putAllDetailsLenList += '<span class="receivedKind">'+ data.putAllDetails[i].havPutCount+''+data.putAllDetails[i].goods.unit +'</span>';
					putAllDetailsLenList += '</span>';
					putAllDetailsLenList += '</div>';
					putAllDetailsLenList += '</li>';
				}
				$(".receiveAllDetails").append(putAllDetailsLenList);
			}
		});
	},
	/*头部导航切换*/
	navChange: function(){
		$(".headerNav li").on("tap", function(){
			var _index = $(this).index();
			var num = $(this).find(".harvestNum").text();
			$(".noInfo").text(i18n_putaway_no_data);
			if($(this).hasClass("active")){
				$(this).removeClass("active");
				$(".harvestInfo ul").hide();	
				$(".contentInfo").show();
				$(".noInfo").hide();
			} else {
				$(this).addClass("active").siblings("li").removeClass("active");
				$(".harvestInfo ul").hide();
				$(".contentInfo").hide();
				$(".harvestInfo").find("ul").eq(_index).show();
				if(	num == 0){
					$(".noInfo").show();
				} else {
					$(".noInfo").hide();
				}
			}
		})
	},
	/*弹起软件盘*/
	keyUp: function(){
		$("#putCount").click(function(){
			_this = $(this);
	   		$("#content").css("top", "-220px");
	   	});
	},
	/*收起软件盘*/
	keyDown: function(){
		 $("#content").not(_this).on("tap", function(){
		 	$("#content").css("top", "0px");
		 	
	    });
	},
	/*结束退出*/
	finishExit: function(){
		$(".footerBtn .end").click(function(){
			$("#content").css("top", "0px");
			putawayObj.pageBack();
		});
	},
	/*页面返回*/
	pageBack: function(){
		qmpur.switchPage("putaway.html");
	},
	/*点击库位*/
	taplocationCode: function(){
		$("#storageLocationCode").click(function(){
			$("#content").css("top", "-220px");
		})
	},
	/*失去焦点*/
	locationCodeBlur: function(){
		$("#storageLocationCode").blur(function(){
			$("#putCount").click();
			$("#putCount").focus();
		})
	},
	/*返回退出*/
	mobileBack: function() {
		mui.back = function() {
			$(".footerBtn .end").click();
		};
	},
	initialize: function() {
		this.init();
		this.confirm();
		this.next();
		this.finishExit();
		this.mobileBack();
		this.keyUp();
		this.keyDown();
		this.getReceiveOrder();
		this.navChange();
		this.taplocationCode();
		$("#barcode").focus();
		this.locationCodeBlur();
	}
}

/**
 * description 页面初始化
 */
$(function() {
	putawayObj.initialize();
})
