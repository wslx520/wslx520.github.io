var dd,
DD = dd = function (doc) {
	var 
	addClass = function (elm,cls) {
		// if(!hasClass(elm,cls)) {
			elm.className = __.trim(elm.className)+' '+cls;
		// }
	},
	hasClass: function (elm,cls) {
		cls = cls.split(/\s+/);
		for(var c=cls.length,ecls = ' '+elm.className+' ';c--;) {
			if(ecls.indexOf(' '+cls[c]+' ') == -1) {
				return false;
			}
		}
		return true;
	},
	removeClass = function (elm,cls) {
		cls = cls.split(/\s+/);
		cls.forEach(function  (cc,i) {
			elm.className = elm.className.replace(RegExp('\\b'+cc+'\\b',"g"),'');
		})
	};
    function DoDom (nodes) {
        this.nodes = nodes;
    }
    DoDom.prototype = {
        hasClass: function (elm,cls) {
			cls = cls.split(/\s+/);
			for(var c=cls.length,ecls = ' '+elm.className+' ';c--;) {
				if(ecls.indexOf(' '+cls[c]+' ') == -1) {
					return false;
				}
			}
			return true;
		},

		addClass = function (elm,cls) {
			// if(!hasClass(elm,cls)) {
				elm.className = __.trim(elm.className)+' '+cls;
			// }
		},
		removeClass = function (elm,cls) {
			cls = cls.split(/\s+/);
			cls.forEach(function  (cc,i) {
				elm.className = elm.className.replace(RegExp('\\b'+cc+'\\b',"g"),'');
			})
		},
		toggleClass: function (elm,cls) {
			if(hasClass(elm,cls)) {
				removeClass(elm,cls);
			} else {
				addClass(elm,cls);
			}
		},
    }
    DoDom.contains = body.contains ? function (par,chi) {
		return par.contains(chi);
	} : function (par,chi) {
		return !!(par.compareDocumentPosition(chi) & 16);
	},
    return DoDom;
}(document)