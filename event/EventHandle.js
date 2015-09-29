var EventHandle = function  (notIE) {
	var HTMLEvents = {readystatechange:1,mouseenter:1,mouseleave:1,wheel:1,copy:1,cut:1,paste:1,beforescriptexecute:1,afterscriptexecute:1,abort:1,canplay:1,canplaythrough:1,change:1,click:1,contextmenu:1,dblclick:1,drag:1,dragend:1,dragenter:1,dragleave:1,dragover:1,dragstart:1,drop:1,duratichange:1,emptied:1,ended:1,input:1,invalid:1,keydown:1,keypress:1,keyup:1,loadeddata:1,loadedmetadata:1,loadstart:1,mousedown:1,mousemove:1,mouseout:1,mouseover:1,mouseup:1,pause:1,play:1,playing:1,progress:1,ratechange:1,reset:1,seeked:1,seeking:1,select:1,show:1,stalled:1,submit:1,suspend:1,timeupdate:1,volumechange:1,waiting:1,blur:1,error:1,focus:1,load:1,scroll:1};
	var prefix = 'custom-event'; //自定义事件的前缀
	return {
		add:notIE ? function  (el,type,handler) {
			el.addEventListener(type,handler,false);
		} : function  (el,type,handler) {
			if(HTMLEvents[type]) {
				el.attachEvent('on'+type,handler);
			} else {
				var customtype = prefix+type;
				if(!el[customtype]) el[customtype] = [];
				el[customtype].push(handler);
			}
		},
		remove : notIE ? function  (el,type,handler) {
			el.removeEventListener(type,handler,false);
		} : function  (el,type,handler) {
			if(HTMLEvents[type]) {
				el.detachEvent('on'+type,handler);
			} else {
				// el['custom-event'+type] = null;
				// console.log(el[prefix+type]);
				// delete el[prefix+type];
				var ctype = el[prefix+type];
				if(ctype && ctype.length) {
					for(var tp = ctype.length;tp--;) {
						if(ctype[tp]==handler) {
							ctype.splice(tp,1); break;
						};
					}
				}
			}				
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
				evt = doc.createEventObject();
				evt.eventType = type;
				if(HTMLEvents[type]) {
					el.fireEvent('on'+type,evt);
				} else {
					var ctype = el[prefix+type];
					if(ctype && ctype.length) {
						for(var tp = ctype.length;tp--;) {
							ctype[tp].call(el);
						}
					}
				}					
			}	
		}
	}
}(!!document.addEventListener)

