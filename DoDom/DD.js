var dd,
    // 这两个全局函数用于测试
    $ = function(s) {
        return document.querySelector(s)
    },
    $$ = function(s) {
        return document.querySelectorAll(s)
    },
    // 正式函数开始
    DD = dd = function(doc) {
        var
            html = doc.documentElement,
            blank = /\s+/,
            // 临时用的元素，用来判断浏览器是否支持某些原生方法
            tempEl = doc.createElement('div'),
            camelCase = function(str) {
                return str.replace(/-([a-z])/g, function(m, $1) {
                    return $1.toUpperCase();
                })
            },
            trim = function(str) {
                return str.replace(/^\s+/, '').replace(/\s+$/, '');
            },
            // 字符串拆成数组
            splitString = function(clses) {
                return clses.split(blank);
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
            addEvent = doc.addEventListener ? function(el, type, handler) {
                el.addEventListener(type, handler, false);
            } : function() {
                var event_id = 0,
                    fire_ie = function(evt) {
                        var returnValue = true;
                        // grab the event object (IE uses a global event object)
                        evt = evt || ((this.ownerDocument || this.document || this).parentWindow || window).event;
                        // get a reference to the hash table of event handlers
                        var handlers = this.events[event.type];
                        // execute each event handler
                        for (var i in handlers) {
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
                        var handlers = el.events[type];
                        for (var i in handlers) handlers[i].call(el);
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
                    var res;
                    var classes = ' ' + elem.className + ' ';
                    for (; res = reg.exec(type);) {
                        var match = res[0],
                            first = match.substr(0, 1);
                        if (first == '#') {
                            if (elem.getAttribute('id') != res[3]) return false;
                        } else if (first == '.') {
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
            closest = function(elm, fn, fina) {
                var isstring = typeof fn === 'string',
                    html = doc.documentElement,
                    body = doc.body;
                while (elm !== fina && elm !== body && elm != html) {
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
            getNext = function(elm) {
                while (elm = elm.nextSibling) {
                    if (elm.nodeType === 1) {
                        return elm;
                    }
                }
            },
            getPrev = function(elm) {
                while (elm = elm.previousSibling) {
                    if (elm.nodeType === 1) {
                        return elm;
                    }
                }
            },
            getSiblings = function(elm) {
                var siblings = [], first = elm.parentNode.firstChild;
                while (first) {
                    // console.log(first)
                    if (first.nodeType === 1) {
                        siblings.push(first);
                    }
                    first = first.nextSibling;
                }
                return siblings;
            },
            nodesToArray = function(nodes) {
                try {
                    nodes = Array.prototype.slice.call(nodes);
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
                var hasDuplicate = nodesSort(nodes);
                if (hasDuplicate) {
                    for (var i = 1; i < nodes.length; i++) {
                        if (nodes[i] === nodes[i - 1]) {
                            nodes.splice(i--, 1);
                        }
                    }
                }
                return nodes;
            };

        function DoDom(nodes) {
            this.nodes = nodes.tagName && nodes.nodeName ? [nodes] : nodes;
        }

        function nodesLoop(nodes, fn) {
            for (var n = 0, node; node = nodes[n++];) {
                fn(node, n - 1);
            }
        }
        DoDom.prototype = {
            hasClass: function(clses) {
                clses = splitString(clses);
                var nodes = this.nodes,
                    cl = clses.length;
                if (nodes.length === 1 && cl === 1) {
                    // 一个元素，判断一个class
                    return hasClass(nodes[0], clses[0]);
                }
                for (var n = 0, node, hasAll, c; node = nodes[n++];) {
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
                var c = cl = clses.length;
                nodesLoop(this.nodes, function(node) {
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
                    nodes = this.nodes,
                    nl = 0,
                    node;
                for (; node = nodes[nl++]; temp(node, clses));
                return this;
            },
            toggleClass: function(clses) {
                clses = splitString(clses);
                var c = cl = clses.length,
                    cls;
                nodesLoop(this.nodes, function(node) {
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
                nodesLoop(this.nodes, remove);
            },
            bind: function(type, fn) {
                nodesLoop(this.nodes, function(node) {
                    addEvent(node, type, fn);
                });
                return this;
            },
            unbind: function(type, fn) {
                nodesLoop(this.nodes, function(node) {
                    removeEvent(node, type, fn);
                });
                return this;
            },
            // 解除绑定的所有事件
            unbindAll: function() {
                var nodes = this.nodes;
                nodesLoop(this.nodes, function(node, n) {
                    var tempnode = node.cloneNode(true);
                    node.parentNode.replaceChild(tempnode, node);
                    nodes[n] = tempnode;
                });
                return this;
            },
            // 手动触发元素上绑定的某类事件，比click,mousedown
            fire: function(type) {
                nodesLoop(this.nodes, function(node) {
                    fireEvent(node, type);
                });
                return this;
            },
            next: function() {
                var nexts = [];
                getNext(this.nodes[0])
                nodesLoop(this.nodes, function(node) {
                    nexts.push(getNext(node));
                });
                return nexts;
            },
            prev: function() {
                var prevs = [];
                nodesLoop(this.nodes, function(node) {
                    prevs.push(getPrev(node));
                });
                return prevs;
            },
            // 
            siblings: function() {
                var allSiblings = [];
                nodesLoop(this.nodes, function (node) {
                    allSiblings = allSiblings.concat(getSiblings(node));
                });
                return nodesUniq(allSiblings);
            }
        }
        DoDom.contains = doc.body.contains ? function(par, chi) {
            return par.contains(chi);
        } : function(par, chi) {
            return !!(par.compareDocumentPosition(chi) & 16);
        };
        return function(nodes) {
            return new DoDom(nodes);
        };
    }(document)
