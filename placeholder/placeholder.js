// 自己实现一个简单的placeholder兼容函数
var placeholders = function  (dom,udf) {
	var notsupport = function  () {
		var test = dom.createElement('input');
	    return test.placeholder===udf;	
	}()
	if(notsupport) {
		var 
		clsName = 'x-place-holder',clsReg = /\bx\-place\-holder\b/, color = '#aaa', alreadyStyle = alreadyEvent = 0,
		getPH = function  (target) {
			return target.getAttribute('placeholder')
		},
		createStyle = function  () {
			var style = dom.createElement('style');
			style.type = 'text/css';
			style.innerHTML = '.'+clsName+' {color:'+color+'}';
			dom.body.appendChild(style);
			alreadyStyle = 1;
		},
		focusHandle = function  (e) {
			e = e || window.event;
			var target = e.srcElement;
			handle(target,true)
		},
		blurHandle = function  (e) {
			e = e || window.event;
			var target = e.srcElement;
			handle(target)
		},
		handle = function  (target,isfocus) {
			if(target.value == '' && target.tagName === 'INPUT' && target.type !== 'checkbox' || target.type!=='radio' ) {
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
			if(ph!=null && ph!= '' && input.value ==='') {
				input.actualValue = input.value;
				input.className += ' '+clsName;
				input.value = ph;
				input.getValue = function  () {
					return this.value === ph ? '' : this.value;
				}
			}
		},
		init = function  (tag) {
			tag = tag || dom;
			if(!alreadyStyle) createStyle();
			if(!alreadyEvent) createEvent();
			if(tag.tagName === 'INPUT' && target.type !== 'checkbox' && target.type!=='radio') {
				initInput(tag);
			} else {
				var inputs = tag.getElementsByTagName('input');
				for(var i=0,l=inputs.length;i<l;i++) {
					var input = inputs[i];
					if(input.type == 'checkbox' || input.type=='radio') {continue;}
					initInput(input);
				}		
			}
		};
		init(dom);
		return init;
		
	}
}(document)
