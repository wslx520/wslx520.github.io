// 把不标准的event变成标准的event，让其支持标准方法
var fixEvent = function  (evt) {
	var 
	html = document.documentElement,
	ie = /MSIE (\d)\.(\d)/.test(navigator.userAgent) ? RegExp.$1 : false;
	return function  (evt) {
		evt = evt || window.event;
		if(ie && ie<9) {
			evt.target = evt.srcElement;
			// IE8及以下，evt.button在按下鼠标中键时是4，(evt.button|1)则得到5，所幸的是很少用到按下鼠标中键的事件
			evt.which = evt.keyCode || (evt.button|1);
		  	evt.stopPropagation = function  () {evt.cancelBubble = true;}
		  	evt.preventDefault = function  () {evt.returnValue = false;}
		  	evt.pageX = evt.clientX + html.scrollLeft;
		  	evt.pageY = evt.clientY + html.scrollTop;
		}
		
		 // 自定义方法，会阻止默认行为，阻止冒泡，
		if(!evt.stop) {
		  	evt.stop = function  () {
		   		evt.preventDefault();
		   		evt.stopPropagation();
		  	}
		}
		return evt;
	}
 
}()
