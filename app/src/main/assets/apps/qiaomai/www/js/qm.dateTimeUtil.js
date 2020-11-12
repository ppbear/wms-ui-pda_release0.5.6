
/**
 * @file            qm.datatime.js
 * @description     日期工具类
 * @author          刘梦凡
 * @version         2.0.2
 * @date            2017/03/21
 * @copyright       河南巧脉信息技术有限公司
 */
qmpur.dateTimeUtil = (function() {
	return {
		/**
		 * 默认日期格式化格式
		 */
		"defaultFormat" : "yyyy-MM-dd",
		
		/**
		 * 返回当前日期
		 */
		now : function(){
			return new Date();
		},
		
		/**
		 * 2位数字格式化：eg:3==>03
		 * @param {Object} num
		 */
		datePad:function(num){
			return  num < 10 ? "0" + num:num;
		},
		
		/**
		 * @description 格式化日期：yyyy-MM-dd
		 * @param {Object} targetDate 日期对象
		 */
		formatDate: function(targetDate) {
			return this.format(targetDate,"yyyy-MM-dd");
		},

		/**
		 * @description 格式化日期时间：yyyy-MM-dd HH:mm:ss
		 * @param {Object} targetDate 日期对象
		 */
		formatDateTime: function(targetDate) {
			return this.format(targetDate,"yyyy-MM-dd HH:mm:ss");
		},
		formatDateTimeM: function(targetDate) {
			return this.format(targetDate,"yyyy-MM-dd HH:mm");
		},
		formatDateTimeY: function(targetDate) {
			return this.format(targetDate,"yyyy");
		},
		/**
		 * @description 获得某月的天数 
		 * @param {Object} year 年(四位数字)
		 * @param {Object} month 月 (0 ~ 11)
		 */
		getMonthDays: function(year, month) {
			month = parseInt(month, 10);  
			var d= new Date(year, month+1, 0);  
			return d.getDate();  
		},

		/**
		 * 获得本周的开始日期
		 * @param {Object} targetDate 日期对象
		 */
		getWeekStartDate: function(targetDate) {
			var dayOfWeek = targetDate.getDay(); /*本周的第几天 */
			var day = targetDate.getDate(); /*当前日 */
			var month = targetDate.getMonth(); /*当前月 */
			var year = targetDate.getFullYear(); /*当前年*/

			var weekStartDate = new Date(year, month, day - dayOfWeek + 1);
			return this.formatDate(weekStartDate);
		},

		/**
		 * 获得本周的结束日期 
		 * @param {Object} targetDate 日期对象
		 */
		getWeekEndDate: function(targetDate) {
			var dayOfWeek = targetDate.getDay(); /*本周的第几天 */
			var day = targetDate.getDate(); /*当前日*/
			var month = targetDate.getMonth(); /*当前月 */
			var year = targetDate.getFullYear(); /*当前年*/

			var weekEndDate = new Date(year, month, day + (6 - dayOfWeek + 1));
			return this.formatDate(weekEndDate);
		},

		/**
		 * 获得本月的开始日期 
		 * @param {Object} targetDate 日期对象
		 */
		getMonthStartDate: function(targetDate) {
			var month = targetDate.getMonth(); /*当前月 */
			var year = targetDate.getFullYear(); /*当前年*/

			var monthStartDate = new Date(year, month, 1);
			return this.formatDate(monthStartDate);
		},

		/**
		 * 获得本月的结束日期 
		 * @param {Object} targetDate 日期对象
		 */
		getMonthEndDate: function(targetDate) {
			var month = targetDate.getMonth(); /*当前月*/
			var year = targetDate.getFullYear(); /*当前年*/

			var monthEndDate = new Date(year, month, this.getMonthDays(year, month));
			return this.formatDate(monthEndDate);
		},

		/**
		 * 通过时间戳获取Date对象
		 * @param {Object} timestamp 时间戳
		 */
		getDateFromTimestamp: function(timestamp) {
			var tempDate = new Date();
			tempDate.setTime(timestamp);

			return tempDate;
		},

		/**
		 * 比较日期大小
		 * @param {Object} beginDate 开始时间
		 * @param {Object} endDate 结束时间
		 */
		compareDateSize: function(beginDate, endDate) {
			var d1 = new Date(beginDate.replace(/\-/g, "\/"));
			var d2 = new Date(endDate.replace(/\-/g, "\/"));

			if(beginDate != "" && endDate != "" && d1 >= d2) {
				return false;
			} else {
				return true;
			}
		},
		
		/**
		 * 获取当前时间的前几天日期
		 * @param {Object} num
		 */
		getBeforeDate: function(num) {
			var num = num;
			var date = new Date();
			var year = date.getFullYear();
			var mon = date.getMonth() + 1;
			var day = date.getDate();
			if(day <= num) {
				if(mon > 1) {
					mon = mon - 1;
				} else {
					year = year - 1;
					mon = 12;
				}
			}
			date.setDate(date.getDate() - num);
			year = date.getFullYear();
			mon = date.getMonth() + 1;
			day = date.getDate();
			str = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
			return str;
		},
						
		/**
		 * 格式化日期
		 * @param {Object} date ：毫秒
		 * @param {Object} format
		 */
		format: function(date, format) {
			if(!date) {
				return "";
			}
			var d = new Date(date);
			var mask = format || this.defaultFormat;
			
			var zeroize = function(value, length) {
				if(!length) length = 2;
				value = String(value);
				for(var i = 0, zeros = ''; i < (length - value.length); i++) {
					zeros += '0';
				}
				return zeros + value;
			};

			return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function($0) {
				switch($0) {
					case 'd':
						return d.getDate();
					case 'dd':
						return zeroize(d.getDate());
					case 'ddd':
						return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
					case 'dddd':
						return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
					case 'M':
						return d.getMonth() + 1;
					case 'MM':
						return zeroize(d.getMonth() + 1);
					case 'MMM':
						return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
					case 'MMMM':
						return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()];
					case 'yy':
						return String(d.getFullYear()).substr(2);
					case 'yyyy':
						return d.getFullYear();
					case 'h':
						return d.getHours() % 12 || 12;
					case 'hh':
						return zeroize(d.getHours() % 12 || 12);
					case 'H':
						return d.getHours();
					case 'HH':
						return zeroize(d.getHours());
					case 'm':
						return d.getMinutes();
					case 'mm':
						return zeroize(d.getMinutes());
					case 's':
						return d.getSeconds();
					case 'ss':
						return zeroize(d.getSeconds());
					case 'l':
						return zeroize(d.getMilliseconds(), 3);
					case 'L':
						var m = d.getMilliseconds();
						if(m > 99) m = Math.round(m / 10);
						return zeroize(m);
					case 'tt':
						return d.getHours() < 12 ? 'am' : 'pm';
					case 'TT':
						return d.getHours() < 12 ? 'AM' : 'PM';
					case 'Z':
						return d.toUTCString().match(/[A-Z]+$/);
						// Return quoted strings with the surrounding quotes removed
					default:
						return $0.substr(1, $0.length - 2);
				}
			});
		}
	}
})();