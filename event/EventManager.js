// 
var EventManager = function  (notIE) {
	var event_id = 1,
		fire_ie = function  (evt) {
			var returnValue = true;
			// grab the event object (IE uses a global event object)
			evt = evt || ((this.ownerDocument || this.document || this).parentWindow || window).event;
			// get a reference to the hash table of event handlers
			var handlers = this.events[event.type];
			// execute each event handler
			for (var i in handlers) {
				// this.$$handleEvent = handlers[i]; //修复this指向
				// if (this.$$handleEvent(evt) === false) {
				if (handlers[i].call(this,evt) === false) {
					returnValue = false;
				}
			}
			return returnValue;
		};
	return {
		add:notIE ? function  (el,type,handler) {
			el.addEventListener(type,handler,false);
		} : function  (el,type,handler) {
			if(!handler.$$eventid) handler.$$eventid=event_id+=1;
			if(!el.events) {el.events = {}};
			if(!el.events[type]) {el.events[type] = {}};
			var handlers = el.events[type];
			handlers[event_id] = handler;
			el['on'+type] = fire_ie;
		},
		remove : notIE ? function  (el,type,handler) {
			el.removeEventListener(type,handler,false);
		} : function  (el,type,handler) {
			if(el.events && el.events[type]) delete el.events[type][handler.$$eventid];			
		},
		fire : function (el,type,evt,doc) {
			doc = document;
			// 最优先针对 a.click()这种原生事件,但IE下typeof el[type] 是object，所以直接判断函数的apply是否存在
			if(el[type] && el[type].apply) {
				el[type]();
			}else if(doc.createEvent) {
				try {
					evt = new Event(type); // 现代浏览器
				}catch(e) {
					evt = doc.createEvent('HTMLEvents'); //IE9
					evt.initEvent(type,true,false);
				}
				el.dispatchEvent(evt);
			} else {//IE8及以下
				// el['on'+type] && el['on'+type]();
				if(el.events && el.events[type]) {
					var handlers = el.events[type];
					for(var i in handlers) handlers[i].call(el);
				}
			}	
		}
	}
}(!!document.addEventListener)

