/**
 * @file            goodsInfo.js
 * @description     商品详情js
 * @author          郝四海
 * @version         0.3.7
 * @date            2017/10/11
 * @copyright       河南巧脉信息技术有限公司
 */

/**
 * description 新建一个对象
 */

var goodsInfoObj = {
	Configs: {
		goodQueryUrl:  qmpur.Configs.userBasePath + "pdaSearch/goodQueryDetail/" /*商品详情接口*/	
	},
	/*获取商品信息*/
	getGoodsInfo: function(){
		qmpur.ajax({			
			url: goodsInfoObj.Configs.goodQueryUrl+ qmpur.getQueryString("id"),
			success: function(data) {
				var unitList ="";
				$(".goodsName").text(data.goods.name); /*商品名字*/
				$(".goodsUnit").text(data.goods.unit); /*商品单位*/
				$(".goodsStandard").text(data.goods.standard); /*商品规格*/
				$(".goodsSku").text(data.goods.skucode); /*商品sku*/
				$(".goodsBarcode").text(data.goods.barcode); /*商品条形码*/
				$(".locationNum").text(data.stocks.length); /*占用库位*/
				$(".goodsNum").text(data.goods.availableStock); /*商品数量*/
				var len = data.standords.length;
				for(var i = 0; i < len; i++){
					if(i == 0){
						unitList += '<span class="active change" data-name="'+ data.standords[i].name +'" data-standard="'+ data.standords[i].standard +'" data-unit="'+ data.standords[i].unit +'" data-skucode="'+ data.standords[i].skucode +'" data-smallestCount="'+ data.standords[i].smallestCount +'" data-availableStock="'+ data.goods.availableStock +'">'+ data.standords[i].unit +'</span>&nbsp;&nbsp;';
					} else {
						unitList += '<span class="change" data-name="'+ data.standords[i].name +'" data-standard="'+ data.standords[i].standard +'" data-unit="'+ data.standords[i].unit +'" data-skucode="'+ data.standords[i].skucode +'" data-smallestCount="'+ data.standords[i].smallestCount +'" data-availableStock="'+ data.goods.availableStock +'">'+ data.standords[i].unit +'</span>&nbsp;&nbsp;';
					}
				}
				$(".unitList").append(unitList);
				var locationList = "";
				var locationLen = data.stocks.length;
				for(var j = 0; j < locationLen; j++){
					locationList += '<li>';
					locationList += '<div class="l">'+ data.stocks[j].storageLocation.code +'</div>';
					locationList += '<div class="l center">'+ data.stocks[j].productDate+'</div>';
					locationList += '<div class="l right"><span class="unitChange" data-num="'+ data.stocks[j].availableStock +'">'+ data.stocks[j].availableStock +'</span><span>'+ data.goods.unit +'</span>  </div>';
					locationList += '<div class="l gray">'+ goodsInfoObj.locationType(data.stocks[j].storageLocation.type) +'</div>';
					locationList += '<div class="l gray center">'+ i18n_harvest_date_in_produced +'</div>';
					locationList += '<div class="l gray right">'+ i18n_com_stock +'</div>';
					locationList += '</li>';
				}
				$(".locationList ul").append(locationList);
			}
		});
	},
	/*单位切换*/
	unitCHange: function(){
		$(".unitList").on("tap", ".change", function(){
			$(this).addClass("active").siblings("span").removeClass("active");
			var name = $(this).attr("data-name"); /*商品名字*/
			var standard = $(this).attr("data-standard");/*商品规格*/
			var unit = $(this).attr("data-unit");/*商品单位*/
			var skucode = $(this).attr("data-skucode");/*商品sku*/
			var smallestCount = Number($(this).attr("data-smallestCount"));/*商品单位换算*/
			var availableStock = Number($(this).attr("data-availableStock"));/*商品库存*/
			$(".goodsName").text(name); /*商品名字*/
			$(".goodsUnit").text(unit); /*商品单位*/
			$(".goodsStandard").text(standard); /*商品规格*/
			$(".goodsSku").text(skucode); /*商品sku*/
			$(".goodsNum").text(qmpur.unitCon(availableStock, smallestCount));/*商品数量*/
			$(".locationList span.unitChange").each(function(k, v){
				var num = $(v).attr("data-num");
				$(v).text(qmpur.unitCon(num, smallestCount))
			})
		})
	},
	/*库位类型*/
	locationType: function(type){
		if(type == 1){
			type = i18n_com_pick_the_location; /*拣选库位*/
		} else if(type == 2){
			type = i18n_com_store_the_location; /*存储库位*/
		} else if(type == 3){
			type = i18n_com_warehouse_cache_location; /*入库缓存库位*/
		} else if(type == 4){
			type = i18n_com_outbound_the_location; /*出库缓存库位*/
		} 
		return type;
	},
	/*页面初始化*/
	initialize: function(){
		this.getGoodsInfo();
		this.unitCHange();
	}
}

/**
 * description 页面初始化
 */
$(function(){
	goodsInfoObj.initialize();
})