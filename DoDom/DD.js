var dd,
    // 这两个全局函数用于测试
    $ = function(s) {
        return document.querySelector(s)
    },
    $$ = function(s) {
        return document.querySelectorAll(s)
    },
    // 正式函数开始
    DD = dd = function(doc, undef) {
        var
            html = doc.documentElement,
            blank = /\s+/,
            // 临时用的元素，用来判断浏览器是否支持某些原生方法
            tempEl = doc.createElement('div'),
            isUndef = function (ii) {
                return ii === undef;
            },
            camelCase = function(str) {
                return str.replace(/-([a-z])/g, function(m, $1) {
                    return $1.toUpperCase();
                })
            },
            trim = function(str) {
                return str.replace(/^\s+/, '').replace(/\s+$/, '');
            },
            isString = function (o) {
            	return 'string' === typeof o;
            },
            // 字符串拆成数组
            splitString = function(clses) {
                return clses.split(blank);
            },
            // 字符串整洁化，去掉首尾空格，把多个空格替换为1个
            cleanString = function (str) {
                return trim(str.replace(/\s{2,}/,' '));
            },
            // 直接添加
            addClass = function(elm, cls) {
                elm.className += ' ' + cls;
            },
            // 只支持判断单个class
            hasClass = function(elm, cls) {
                return (' ' + elm.className + ' ').indexOf(' ' + cls + ' ') !== -1;
            },
            removeClass = function(elm, cls) {
                cls = splitString(cls);
                for (var c = 0, cc; cc = cls[c++]; removeSingleClass(elm, cc));
            },
            removeSingleClass = function(elm, cc) {
                elm.className = elm.className.replace(RegExp('\\b' + cc + '\\b', "g"), '');
            },
            remove = function(elem) {
                elem.parentNode.removeChild(elem);
            },
            getAttr = function (elem, attrname) {
            	return elem.getAttribute(attrname);
            },
            setAttr = function (elem, attr, val) {
            	elem.setAttribute(attr, val);
            },
            setAttrs = function (elem, attrs) {
            	for(var a in attrs) {
            		setAttr(elem, a, attrs[a]);
            	}
            },
            setProp = function (elem, prop, val) {
            	elem[prop] = val;
            },
            setProps = function (elem, props) {
            	for(var a in props) {
            		setProp(elem, a, props[a]);
            	}
            },
            getText = !isUndef(tempEl.innerText) ? function (elem) {
            	return elem.innerText;
            } : function (elem) {
            	return elem.textContent;
            },
            setText = function (elem, txt) {
            	elem.innerText = elem.textContent =  txt;
            },
            addEvent = doc.addEventListener ? function(el, type, handler) {
                el.addEventListener(type, handler, false);
            } : function() {
                var event_id = 0,
                    fire_ie = function(evt) {
                        var returnValue = true, handlers, i;
                        // grab the event object (IE uses a global event object)
                        evt = evt || ((this.ownerDocument || this.document || this).parentWindow || window).event;
                        // get a reference to the hash table of event handlers
                        handlers = this.events[event.type];
                        // execute each event handler
                        for (i in handlers) {
                            // this.$$handleEvent = handlers[i]; //修复this指向
                            // if (this.$$handleEvent(evt) === false) {
                            if (handlers[i].call(this, evt) === false) {
                                returnValue = false;
                            }
                        }
                        return returnValue;
                    };
                return function(el, type, handler) {
                    if (!handler.$$eventid) handler.$$eventid = event_id += 1;
                    if (!el.events) {
                        el.events = {}
                    };
                    if (!el.events[type]) {
                        el.events[type] = {}
                    };
                    var handlers = el.events[type];
                    handlers[event_id] = handler;
                    el['on' + type] = fire_ie;
                };
            }(),

            removeEvent = doc.addEventListener ? function(el, type, handler) {
                el.removeEventListener(type, handler, false);
            } : function(el, type, handler) {
                if (el.events && el.events[type]) delete el.events[type][handler.$$eventid];
            },
            fireEvent = function(el, type, evt) {
                // 最优先针对 a.click()这种原生事件,但IE下typeof a.click 是object，所以直接判断函数的apply是否存在
                if (el[type] && el[type].apply) {
                    el[type]();
                } else if (doc.createEvent) {
                    try {
                        evt = new Event(type); // 现代浏览器
                    } catch (e) {
                        evt = doc.createEvent('HTMLEvents'); //IE9
                        evt.initEvent(type, true, false);
                    }
                    el.dispatchEvent(evt);
                } else { //IE8及以下
                    // el['on'+type] && el['on'+type]();
                    if (el.events && el.events[type]) {
                        var handlers = el.events[type], i;
                        for (i in handlers) handlers[i].call(el);
                    }
                }
            },
            is = function() {
                var reg = /(^[A-Za-z]+\d?)|(\#|\.)([\w\d-]+)|\[([\w\-\:\d]+)([\!\|\^\$\~]?\=)?([^\s]+)?\]/g;

                function checkAttr(elm, attr) {
                    // attr is an Object, contains [name],[operator],[value]
                    //先取出节点对应的属性值
                    var result = elm.getAttribute(attr.name),
                        operator = attr.operator,
                        check = attr.value;

                    // console.log(attr,result)
                    //看看属性值有木有！
                    if (result == null) {
                        //如果操作符是不等号，返回真，因为当前属性为空 是不等于任何值的
                        return operator === "!=";
                    }
                    //如果没有操作符，那就直接通过规则了
                    if (!operator) {
                        return true;
                    }

                    //转成字符串
                    result += "";

                    // 以下代码摘自jQuery，解释摘自Aaron

                    //如果是等号，判断目标值跟当前属性值相等是否为真
                    return operator === "=" ? result === check :

                        //如果是不等号，判断目标值跟当前属性值不相等是否为真
                        operator === "!=" ? result !== check :

                        //如果是起始相等，判断目标值是否在当前属性值的头部
                        operator === "^=" ? check && result.indexOf(check) === 0 :

                        //这样解释： lang*=en 匹配这样 <html lang="xxxxenxxx">的节点
                        operator === "*=" ? check && result.indexOf(check) > -1 :

                        //如果是末尾相等，判断目标值是否在当前属性值的末尾
                        operator === "$=" ? check && result.slice(-check.length) === check :

                        //这样解释： lang~=en 匹配这样 <html lang="zh_CN en">的节点
                        operator === "~=" ? (" " + result + " ").indexOf(check) > -1 :

                        //这样解释： lang=|en 匹配这样 <html lang="en-US">的节点
                        operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
                        //其他情况的操作符号表示不匹配
                        false;

                }
                return function(elem, type) {
                    var res, classes, match, first;
                    for (; res = reg.exec(type);) {
                        match = res[0];
                        first = match.substr(0, 1);
                        if (first == '#') {
                            if (elem.getAttribute('id') != res[3]) return false;
                        } else if (first == '.') {
                            classes = ' ' + elem.className + ' ';
                            if (classes.indexOf(' ' + res[3] + ' ') < 0) return false;
                        } else if (first == '[') {
                            if (checkAttr(elem, {
                                    name: res[4],
                                    operator: res[5],
                                    value: res[6]
                                }) == false) return false;
                        } else {
                            if (elem.tagName !== match.toUpperCase()) return false;
                        }
                    }
                    return true;
                }
            }(),
            // fina = finally,即终止查找的元素
            closest = function(elm, fn, fina) {
                var isstring = isString(fn),
                    body = doc.body;
                while (elm) {
                	if(elm === fina || elm === body || elm === html) {
                		break;
                	}
                    if (isstring) {
                        if (is(elm, fn)) return elm;
                    } else {
                        if (fn(elm)) {
                            return elm;
                        }
                    }
                    elm = elm.parentNode
                }
            },
            getNext = isUndef(tempEl.nextElementSibling) ? function(elm) {
                while (elm = elm.nextSibling) {
                    if (elm.nodeType === 1) {
                        return elm;
                    }
                }
            } : function (elm) {
                return elm.nextElementSibling;
            },
            getPrev = isUndef(tempEl.previousElementSibling) ? function(elm) {
                while (elm = elm.previousSibling) {
                    if (elm.nodeType === 1) {
                        return elm;
                    }
                }
            } : function (elm) {
                return elm.previousElementSibling;
            },
            getSiblings = function(elm) {
                var siblings = [], first = elm.parentNode.firstChild;
                while (first) {
                    // console.log(first)
                    if (first.nodeType === 1 && first !== elm) {
                        siblings.push(first);
                    }
                    first = first.nextSibling;
                }
                return siblings;
            },
            changeDisable = function (elm, dis, cls) {
                elm.disabled = dis;
                // cls && (dis == true ? addClass : removeClass)(elm, cls);  
            },
            changeDisplay = function (elm, dis) {
                if(isUndef(dis)) {
                    dis = 'block';
                }
                elm.style.display = dis;
            },
            nodesToArray = function(nodes) {
                try {
                    return Array.prototype.slice.call(nodes);
                } catch (e) {
                    var res = [];
                    nodesLoop(nodes, function(node) {
                        res.push(node);
                    })
                    return res;
                }
            },
            nodesSort = function(nodes) {
                var sortOrder, hasDuplicate = false;
                if (html.compareDocumentPosition) {
                    sortOrder = function(a, b) {
                        if (a === b) {
                            hasDuplicate = true;
                            return 0;
                        }

                        if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                            return a.compareDocumentPosition ? -1 : 1;
                        }

                        return a.compareDocumentPosition(b) & 4 ? -1 : 1;
                    };

                } else {
                    sortOrder = function(a, b) {
                        // The nodes are identical, we can exit early
                        if (a === b) {
                            hasDuplicate = true;
                            return 0;

                            // Fallback to using sourceIndex (in IE) if it's available on both nodes
                        } else if (a.sourceIndex && b.sourceIndex) {
                            return a.sourceIndex - b.sourceIndex;
                        }

                    };
                }
                return function(nodes) {
                    hasDuplicate = false;
                    nodes.sort(sortOrder);
                    return hasDuplicate;
                }
            }(),
            nodesUniq = function(nodes) {
                var hasDuplicate = nodesSort(nodes), i;
                if (hasDuplicate) {
                    for (i = 1; i < nodes.length; i++) {
                        if (nodes[i] === nodes[i - 1]) {
                            nodes.splice(i--, 1);
                        }
                    }
                }
                return nodes;
            },
            tempArr = [],
            AP = Array.prototype;

        function nodesLoop(nodes, fn) {
            for (var n = 0, node; node = nodes[n++];) {
                fn(node, n - 1);
            }
        }
        function makeArray (arr) {
            if(typeof arr === 'object' && arr.splice) return arr;
            var ret = [], i;
            if( arr != null ){    
                i = arr.length;
                //单个元素，但window, string、 function有 'length'的属性，加其它的判断
                if( i == null || arr.split || arr.setInterval || arr.call ){
                    ret[0] = arr;
                }else{
                    try{
                        ret = Array.prototype.slice.call(arr)
                    }catch(e){
                        while( i ) ret[--i] = arr[i];//Clone数组
                    }
                }
            }
            return ret;
        }
        function DoDom(nodes) {
            // this.toArray(makeArray(nodes));
            this.length = 0;
            AP.push.apply(this, makeArray(nodes));
            return this;
        }
        DoDom.prototype = {
            constructor: DoDom,
            splice: tempArr.splice,
            hasClass: function(clses) {
                var  cl, singleClass = clses.indexOf(' ') === -1, n;
                // 只有一个class
                if(singleClass) {
                    // 节点集里只有一个节点时
                    if(this.length === 1) return hasClass(this[0], clses[0]);
                    for (n = 0, node; node = this[n++];) {
                        if (hasClass(node, clses)) {
                           return true;
                        }
                    }
                    return false;
                }
                clses = splitString(clses);                                
                cl = clses.length;
                for (n = 0, node, hasAll, c; node = this[n++];) {
                    hasall = 0;
                    for (c = cl; c--;) {
                        if (hasClass(node, clses[c])) {
                            hasall += 1;
                        }
                    }
                    if (hasall === cl) return true;
                }
                return false;
            },
            addClass: function(clses) {
                clses = splitString(clses);
                var c, cl = clses.length;
                nodesLoop(this, function(node) {
                    for (c = cl; c--;) {
                        // console.log(c,clses[c])
                        if (!hasClass(node, clses[c])) {
                            addClass(node, clses[c]);
                        }
                    }
                })
                return this;
            },
            removeClass: function(clses) {
                // temp，为移除单个样式时作性能优化（很常用,很必要）
                var temp = clses.indexOf(' ') === -1 ? removeSingleClass : removeClass,
                    nl = 0,
                    node;
                for (; node = this[nl++]; temp(node, clses));
                return this;
            },
            toggleClass: function(clses) {
                clses = splitString(clses);
                var c = cl = clses.length,
                    cls;
                nodesLoop(this, function(node) {
                    for (c = cl; c--;) {
                        cls = clses[c];
                        if (hasClass(node, cls)) {
                            removeSingleClass(node, cls);
                        } else {
                            addClass(node, cls);
                        }
                    }
                })
                return this;
            },
            remove: function() {
                nodesLoop(this, remove);
            },
            bind: function(type, fn) {
                nodesLoop(this, function(node) {
                    addEvent(node, type, fn);
                });
                return this;
            },
            unbind: function(type, fn) {
                nodesLoop(this, function(node) {
                    removeEvent(node, type, fn);
                });
                return this;
            },
            // 解除绑定的所有事件
            unbindAll: function() {
                var tempnode;
                nodesLoop(this, function(node, n) {
                    tempnode = node.cloneNode(true);
                    node.parentNode.replaceChild(tempnode, node);
                    this[n] = tempnode;
                });
                return this;
            },
            // 手动触发元素上绑定的某类事件，比click,mousedown
            fire: function(type) {
                nodesLoop(this, function(node) {
                    fireEvent(node, type);
                });
                return this;
            },
            next: function() {
                var nexts = [];
                nodesLoop(this, function(node) {
                    nexts.push(getNext(node));
                });
                return new DoDom(nexts);
            },
            prev: function() {
                var prevs = [];
                nodesLoop(this, function(node) {
                    prevs.push(getPrev(node));
                });
                return new DoDom(prevs);
            },
            // 
            siblings: function() {
                var allSiblings = [];
                nodesLoop(this, function (node) {
                    allSiblings = allSiblings.concat(getSiblings(node));
                });
                return nodesUniq(allSiblings);
            },
            removeAttr: function (attrname) {
            	nodesLoop(this, function (node) {
            		node.removeAttribute(attrname)
            	})
                return this;
            },
            attr: function (name, val) {
            	var temp;
            	if(isString(name)) {
            		if(isUndef(val)) { 
            			return getAttr(this[0], name);
            		}
            		temp = setAttr;
            	} else {
            		temp = setAttrs;
            	}            	
            	nodesLoop(this, function (node) {
            		temp(node, name, val);
            	})
                return this;
            },
            prop: function (name, val) {
            	var temp;
            	if(isString(name)) {
            		if(isUndef(val)) {
            			return this[0][name];
            		}
            		temp = setProp;
            	} else {
            		temp = setProps;
            	}
            	nodesLoop(this, function (node) {
            		temp(node, name, val);
            	})
                return this;
            },
            text: function (txt) {
            	if(isUndef(txt)) return getText(this[0]);
            	nodesLoop(this, function (node) {
            		setText(node, txt);
            	})
                return this;
            },
            html: function (html) {
            	if(isUndef(html)) return this[0].innerHTML;
            	nodesLoop(this, function (node) {
            		node.innerHTML = html;
            	})
                return this;
            },
            each: function (fn) {
            	nodesLoop(this, fn);
                return this;
            },
            index: function (elem) {
                var n, siblings;
            	if(elem) {
            		for(n=0,node;node = this[n++];) {
            			if(node === elem) {
            				return n-1;
            			}
            		}
            		return -1;
            	}
            	node = this[0];
            	siblings = node.parentNode.chilren, sl = siblings.length, s= 0;
            	for(; s< sl; s++) {
            		if(siblings[s] === node) {
            			return s;
            		}
            	}
            	return -1;
            },
            get: function (i) {
            	return isUndef(i) ? this : this[i];
            },
            getBy: function (fn, justOne) {
                var res = [], n=0, nl = this.length, node;
                for(;n<nl;n++) {
                    node = this[n];
                    if(fn(node) === true) {
                        if(justOne) return node;
                        res.push(node);
                    }
                }
                return res;
            },
            find: function (selector) {
                var res = [], temp, noid;
                nodesLoop(this, function (node, n) {
                    noid = false;
                    if(!node.id) {
                        noid = true;
                        node.id = '__DoDom__'+new Date().getTime();
                    }
                    temp = doc.querySelectorAll('#'+node.id + ' '+ selector);
                    temp = nodesToArray(temp);
                    res = res.concat(temp);
                    if(noid) setAttr(node, id, '');
                });
                return new DoDom(res);
            }
        }
        function Main(nodes) {
            return new DoDom(nodes);
        }
        Main.contains = tempEl.contains ? function(par, chi) {
            return par.contains(chi);
        } : function(par, chi) {
            return !!(par.compareDocumentPosition(chi) & 16);
        };
        Main.create = function (htmlstr, props) {
            var temp, p;
            if(htmlstr.indexOf('<') === 0) {
                temp = doc.createElement('div');
                temp.innerHTML = htmlstr;
                return temp.firstChild;
            } else {
                temp = doc.createElement(htmlstr);
                if(props) {
                    for(p in props) {
                        temp[p] = props[p];
                    }
                }
                return temp;
            }
        }
        return Main;
    }(document)
