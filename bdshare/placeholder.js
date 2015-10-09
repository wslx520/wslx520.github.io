// 自己实现一个简单的placeholder兼容函数
var placeholders = function  (dom,udf) {
	var notsupport = function  () {
		var test = dom.createElement('input');
	    return test.placeholder===udf;	
	}()
	if(notsupport) {
		var 
		clsName = 'x-place-holder',clsReg = /\bx\-place\-holder\b/, color = '#aaa', alreadyStyle = alreadyEvent = 0,
		types = {text:1,search:1,url:1,tel:1,email:1,password:1,number:1},
		getPH = function  (target) {
			return target.getAttribute('placeholder')
		},
		createStyle = function  () {
			var style = dom.createElement('style');
			style.type = 'text/css';
			style.rel = "stylesheet";
			// style.innerHTML = '.'+clsName+' {color:'+color+'}'; //这句在IE8以下会报错
			style.styleSheet.cssText = '.'+clsName+' {color:'+color+'}';
			dom.body.appendChild(style);
			alreadyStyle = 1;
		},
		focusHandle = function  (e) {
			handle((e || window.event).srcElement,true)
		},
		blurHandle = function  (e) {
			handle((e || window.event).srcElement)
		},
		handle = function  (target,isfocus) {
			if(target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' && types[target.type]) {
				if(isfocus) {
					if(target.value == getPH(target)) {
						target.value = '';
						target.className = target.className.replace(clsReg,'');	
					}					
				} else {
					if(target.value =='') {
						target.className += ' '+clsName;
						target.value = getPH(target);
					}
				}
			}
		},
		createEvent = function  () {
			dom.attachEvent('onfocusin',focusHandle);
			dom.attachEvent('onfocusout',blurHandle);	
			alreadyEvent = 1;
		},
		initInput = function  (input) {
			var ph = getPH(input);
			if(ph!=null && ph!= '') {
				input.actualValue = input.value;
				input.className += ' '+clsName;
				input.value ==='' && (input.value = ph);
				input.getValue = function  () {
					return this.value === ph ? '' : this.value;
				}
			}
		},
		init = function  (tag) {
			tag = tag || dom;
			if(!alreadyStyle) createStyle();
			if(!alreadyEvent) createEvent();
			if(tag.tagName === 'TEXTAREA' || tag.tagName === 'INPUT' && types[tag.type]) {
				initInput(tag);
			} else {
				var inputs = tag.getElementsByTagName('input');
				var textareas = tag.getElementsByTagName('textarea');
				for(var i=inputs.length,input;i--;) {
					input = inputs[i];
					if(types[input.type]) initInput(input);					
				}		
				for(i=textareas.length;i--;initInput(textareas[i]));	
			}
		};
		init(dom);
		return init;
		
	}
}(document)
