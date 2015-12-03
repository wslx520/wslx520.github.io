var dd,
// 这两个全局函数用于测试
$ = function (s) {return document.querySelector(s)},
$$ = function (s) {return document.querySelectorAll(s)},
// 正式函数开始
DD = dd = function (doc) {
    var 
    blank = /\s+/,
    camelCase = function (str) {
        return str.replace(/-([a-z])/g, function (m, $1) {
            return $1.toUpperCase();
        })
        // return str.replace(/-([a-z])/g, RegExp.$1.toUpperCase())
    },
    trim = function (str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    },
    // 字符串拆成数组
    splitString = function (clses) {
        return clses.split(blank);
    },

    // 直接添加
	addClass = function (elm,cls) {
		elm.className += ' '+cls;
	},
    // 只支持判断单个class
	hasClass = function (elm,cls) {
		console.log(' '+elm.className+' ', ' '+cls+' ')
        return (' '+elm.className+' ').indexOf(' '+cls+' ') !== -1;
	},
	removeClass = function (elm,cls) {
        cls = splitString(cls);
        for(var c = 0, cc; cc = cls[c++]; removeSingleClass(elm,cc));
	},
    removeSingleClass = function (elm, cc) {
        elm.className = elm.className.replace(RegExp('\\b'+cc+'\\b',"g"),'');
    },    
    remove = function  (elem) {
        elem.parentNode.removeChild(elem);
    };
    function DoDom (nodes) {
        this.nodes = nodes.tagName && nodes.nodeName ? [nodes] : nodes;
    }
    function nodesLoop (nodes, fn) {
    	for(var n = 0,  node;node = nodes[n++];) {
            fn(node, n);
        }
    }
    DoDom.prototype = {
        hasClass: function (clses) {
			clses = splitString(clses);
            var nodes = this.nodes, cl = clses.length;
            if(nodes.length === 1 && cl === 1) {
                // 一个元素，判断一个class
                return hasClass(nodes[0], clses[0]);
            }
            for(var n = 0,  node, hasAll, c;node = nodes[n++];) {
                hasall = 0;
                for(c = cl;c--;) {
                    if(hasClass(node,clses[c])) {
                        hasall += 1;
                    }
                }
                if(hasall === cl) return true;
            }			
			return false;
		},

		addClass : function (clses) {
            clses = splitString(clses);
            var c = cl = clses.length;	
            nodesLoop(this.nodes, function (node) {
            	for(c = cl;c--;) {
            		console.log(c,clses[c])
                    if(!hasClass(node,clses[c])) {
                        addClass(node, clses[c]);
                    }
                }
            })		       
            return this;
		},
		removeClass : function (clses) {              
			for(var nodes = this.nodes, nl = 0, node; node = nodes[nl++]; removeClass(node, clses));
            return this;
		},
		toggleClass: function (clses) {
            clses = splitString(clses);
            var nodes = this.nodes, cl = clses.length;          
            for(var n = 0,  node, c, cls;node = nodes[n++];) {
                for(c = cl;c--;) {
                    cls = clses[c];
                    if(hasClass(node,cls)) {
                        removeSingleClass(node, cls);
                    } else {
                        addClass(node, cls);
                    }
                }
            }  
            return this;
		},
        remove: function () {
            nodesLoop(this.nodes, remove);
        }
    }
    DoDom.contains = doc.body.contains ? function (par,chi) {
		return par.contains(chi);
	} : function (par,chi) {
		return !!(par.compareDocumentPosition(chi) & 16);
	};
    return function (nodes) {
        return new DoDom(nodes);
    };
}(document)