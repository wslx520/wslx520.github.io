/*
xPagenation - 分页导航组件。
支持设置的选项：
max : 最多同时显示好多页
curr : 当前页码
size : 每页显示多少条，默认15。可以是15,30,50的任一个，如果传为false，则不显示切换每页显示条数的标签
pages : 总好多页。可以不传而只传items，则会由items和size计算出pages
items : 总数据条数。
onpagination : 函数，在页码跳转时触发，此函数执行时会自动传入两个参数：page（当前页）, size（当前页显示条数）
info : 是否显示页码信息，默认true，会加入一个page-text用来显示“共N页，当前是第n页”这样的信息
jump : 是否允许输入页码跳页，默认true,会加入一个页码输入框和确定按钮
prev ：上一页按钮显示的文字，设为false则不显示上一页按钮，下同
next ：下一页按钮显示的文字，同上
last ：末页按钮显示的文字，同上；默认false (2015/12/14 去掉此选项，因为页码算法的改变，页码在任何时候，都会显示第一页和最后一页的页码，用不着用按钮来跳了)
first ：首页按钮显示的文字，同上；默认false (2015/12/14 去掉此选项)
showSize : 是否显示左侧的切换每页多少条，默认false。如果设为true，则会显示当前页码分别乘以1,2,3的size切换；如果设为一个数组如[20,40,80]，则会以此数组生成对应的size切换
属性：
options : 对象，上面列出的静态设置选项
currPageElement : 当前页码的node
pageList : Node数组，页码node的列表
*/
var xPagination = function (doc) {
    var 
        hasClass = function (elm, cls) {
            var c, ecls;
            cls = cls.split(/\s+/);
            for (c = cls.length, ecls = ' ' + elm.className + ' '; c--; ) {
                if(ecls.indexOf(' '+cls[c]+' ') == -1) {
                    return false;
                }
            }
            return true;
        },
        addClass = function (elm,cls) {
            elm.className += ' '+cls;
        },
        removeClass = function (elm,cls) {
            cls = cls.split(/\s+/);
            cls.forEach(function  (cc,i) {
                elm.className = elm.className.replace(RegExp('\\b'+cc+'\\b',"g"),'');
            })
        },
        create = function  (classes, tag) {
            tag = tag || 'DIV';
            var elem = doc.createElement(tag);
            elem.className = classes;
            return elem;
        },
        defaults = {
            prev: '&lt;',
            next: '&gt;',
            size: 15,
            max: 8,
            pages: 0,
            items: 0,
            curr: 1,
            info: true,
            jump: true
        },
        // 找到符合条件的最近的父级元素
        closet = function (elm, fn) {
            while (elm) {
                if (fn(elm)) {
                    return elm;
                }
                elm = elm.parentNode;
            }
        },
        extend = function  (old,newo) {
            for(var o in newo) {
                old[o] = newo[o];
            }
            return old;
        },
        // 隐藏某元素
        hide = function (elm, f) {
            elm.style.display = f === undefined ? 'none' : f;
        },
        // 根据当前页，总数页，最多显示页计算出应显示的页码
        pageCalc = function (curr, pages, max) {
            //console.log('curr,pages,max',curr,pages,max)
            var start = 1,
                // var end = max;
                //var truehalf = max / 2;
                half = Math.floor(max / 2),
                maxLength = Math.min(pages, max) - 1;
            // if (pages < end) {
            //     end  = pages;
            // }
            //console.log('start,half,max',start,half,max)
            //如果当前页大于最多显示页的一半，当前页放中间
            if (pages > max && curr >= half) {
                start = curr - half;
                // end =  (curr + half) > pages ? pages : curr + half;
                if (curr === pages - 1) {
                    // start = curr - half -(half<truehalf ? 1 : 2);
                    start = curr - (half + 1);
                }
                if (curr === pages) {
                    start = curr - maxLength;
                    start = start || 1;
                }
            }
            if (start + maxLength > pages) {
                start = pages - maxLength;
            }
            start = start > 0 ? start : 1;
            return start;
        },
        pageActive = 'page-item-active',
        pageItem = 'page-item',
        pageHover = 'page-item-hover',
        pageDisable = 'disable',
        Pagination = function (el, options) {
            this.options = extend({}, defaults);
            extend(this.options, options);
            var root = this,
                Options = root.options,                
                pages = Options.pages-=0,
                curr = Options.curr-=0,
                max = Options.max-=0,
                temp,
                items = [],
                start,
                end,
                pi,
                jumpinput,
                jumpbt,
                noNext,
                list,
                pp,
                page,
                target,
                li,
                plStart = 0,
                plEnd = 0,
                i,
                pageList,
                elli,
                pageCodes = {
                    next: function () {
                        return Options.curr >= pages ? pages : Options.curr + 1;
                    },
                    prev: function () {
                        return Options.curr <= 1 ? 1 : Options.curr - 1;
                    }
                };
            temp = el;
            el = create('page-list', 'UL');
            temp.appendChild(el);
            if(!hasClass(temp, 'page-list-wrap')) {
            	addClass(temp, 'page-list-wrap');
            }
            this.pageList = el;
            // 生成页码
            setPages.call(this);        
            if(Options.onpagination) root.onpagination = Options.onpagination;
            if (Options.showSize) {
                Options.size -= 0;
                var ul = create('page-list page-size', 'ul'),
                    sizesIndex = {},
                    sizes = Options.showSize,
                    allLis = '';
                if(!sizes.splice) {
                    sizes = [Options.size, Options.size*2, Options.size*3 ]
                }    
                for(var a = 0;a<sizes.length;a++) {
                    allLis += '<li class="page-item">'+sizes[a]+'</li>';
                    sizesIndex[sizes[a]] = a;
                }
                ul.innerHTML = allLis;
                temp.insertBefore(ul, el);
                addClass(ul.children[sizesIndex[Options.size]], pageHover);
                ul.onclick = function (event) {
                	event = event || window.event;
                	target = event.target || event.srcElement;
                    li = target.tagName === 'LI' ? target : closet(target, function (elm) {
                        return elm.tagName === 'LI';
                    });
                    if (!hasClass(li, pageHover)) {
                        var num = +li.innerHTML;
                        root.options.size = num;
                        root.onpagination && root.onpagination(Options.curr, num);                        
                        for (i = 0; i < 3; i++) {
                            removeClass(ul.children[i], pageHover);
                        }
                        addClass(li, pageHover);
                    }
                };
            }
            if (Options.info) {
                if(!root.meta) {
                    root.meta = el.parentNode.appendChild(create('page-list page-meta', 'ul'));
                }
                pi = create('page-text', 'li');
                if (Options.items) {
                    pi.innerHTML = '共' + Options.items + '条';
                } else {
                    pi.innerHTML = '共' + pages + '页';
                }
                root.info = root.meta.appendChild(pi);
            }
            if (Options.jump) {
                if(!root.meta) {
                    root.meta = el.parentNode.appendChild(create('page-list page-meta', 'ul'));
                }
                jumpinput = create('page-text page-input', 'li');
                jumpinput.innerHTML = '到第<span class="mid-helper"></span><input type="text" class="mid-text page-position">页';
                jumpbt = create('page-btn', 'li');
                jumpbt.innerHTML = '<button>确定</button>';
                root.meta.appendChild(jumpinput);
                jumpinput.onkeydown = function (e) {
                    e = core.wrapEvent(e);
                    var input = this.getElementsByTagName('input')[0],
                        value = +input.value;
                    if (!isNaN(value) && value != '' && (e.which === 13)) {
                        root.go(+value);
                    }
                };
                root.jump = root.meta.appendChild(jumpbt);
                root.jump.onclick = function () {
                    page = this.previousSibling.getElementsByTagName('input')[0].value;
                    if (!isNaN(+page)  && page !== '') {
                        root.go(+page);
                    }
                };
            }
            el.onclick = function (event) {
                curr = Options.curr;
                //console.log(curr)
                event = event || window.event;
                target = event.target || event.srcElement;
                li = target.tagName === 'LI' ? target : closet(target, function (elm) {
                    return elm.tagName === 'LI';
                });
                page = li.getAttribute('ui-page');
                if (page && page !== 'ellipsis') {
                    if (pageCodes[page]) {
                        pp = pageCodes[page];
                        page = 'function' === typeof pp ? pp() : pp;
                    }
                    if (curr !== page) {
                        root.go(+page);
                    }
                }
            };
            root.go(Options.curr);
        };
        function setPages() {
            var root = this,
                Options = root.options,
                pages = Options.pages-=0,
                curr = Options.curr-=0,
                max = Options.max-=0,
                temp,
                items = [],
                start,
                end,
                pi,
                jumpinput,
                jumpbt,
                noNext,
                list,
                pp,
                page,
                target,
                li,
                plStart = 0,
                plEnd = 0,
                i,
                pageList,
                elli;
            if (pages === 0) {
                pages = Options.pages = Math.ceil(Options.items / Options.size);
            }
            this.pageList.innerHTML = '';
            // items.push('<li class="' + pageItem +'" ui-page="1">1</li>');
            // start = pageCalc(curr, pages, max);
            // end = start + (max - 1);
            // if (end > pages) {
            //     end = pages;
            // }
            max = Math.min(max, pages);
            for (i = 1; i <= max; i++) {
                items.push('<li class="' + pageItem + '" ui-page="' + i + '">' + i + '</li>');
            }
            if(pages > max) {
                elli = '<li class="page-ellipsis" ui-page="ellipsis">...</li>';
                items.splice(1, 0, elli);
                items.splice(items.length - 1, 0, elli);
                items[items.length - 1] = '<li class="' + pageItem + '" ui-page="' + pages + '">' + pages + '</li>';    
            }
            
            if (Options.prev) {
                plStart += 1;
                items.unshift('<li class="page-btn-prev" ui-page="prev">' + Options.prev + '</li>');
            }
            if (Options.next) {
                plEnd += 1;
                items.push('<li class="page-btn-next" ui-page="next">' + Options.next + '</li>');
            }
            // console.log(pageList, items);
            this.pageList.innerHTML = items.join('');
            if(pages > max) {
                root.ellipsis = [root.pageList.children[Options.prev ? 2 : 1]];
                root.ellipsis.push(root.pageList.children[root.pageList.children.length - (Options.next ? 2 : 1)]);    
            }    
            
        }
        Pagination.prototype.go = function (page) {
            var root = this,
                pageList = root.pageList.children,
                ellipsis = root.ellipsis,
                pl = pageList.length,
                Options = root.options,
                max = Options.max,
                pages = Options.pages,
                // start = pageCalc(page, Options.pages, Options.max),
                li,
                i,
                num,
                showPages = 'center',
                prev = Options.prev ? pageList[0] : null,
                next = Options.next ? pageList[pl - 1].nextSibling : null;
            // 容错。防止有人通过JS直接跳转不存在的页
            page = page > Options.pages ? Options.pages : (page < 1 ? 1 : page);
            Options.curr = page;
            if (root.currPageElement) {
                removeClass(root.currPageElement, pageActive);
            }
            root.currPageElement = null;
            if (root.onpagination && root.onpagination(page, Options.size) === false) return;
            function setActive(li) {
                addClass(li, pageActive);
                root.currPageElement = li;
            }

            function setPageNumbers(start) {
                // console.log(start);
                if (start > pages - max + 1) {
                    start = pages - max + 2;
                }

                console.log(start, pl);
                for (i = 0; i < pl - 1; i++) {
                    li = pageList[i];
                    console.log(li)
                    if(/\d+/.test(li.getAttribute('ui-page'))) {
                        num = start;
                        li.innerHTML = num;
                        li.setAttribute('ui-page', num);
                        if (num === page) {
                            setActive(li);
                        }   
                        start++; 
                    }                    
                }
            }
            // console.log(start,page)
            if (pages <= max) {
                setActive(pageList[page - 1]);
                // hide(ellipsis[0]);
                // hide(ellipsis[1]);
            } else {
                if (page <= Math.ceil(max / 2)) {
                    showPages = 'start';
                } else if (page >= Math.ceil(pages - max / 2)) {
                    showPages = 'end';
                }
                if (showPages === 'center') {
                    hide(ellipsis[0], '');
                    hide(ellipsis[1], '');
                    setPageNumbers(page - (Math.ceil(max/2-1) - 1));
                } else if (showPages === 'start') {
                    hide(ellipsis[0]);
                    hide(ellipsis[1], '');
                    setPageNumbers(1);
                } else {
                    hide(ellipsis[0], '');
                    hide(ellipsis[1]);
                    setPageNumbers(Math.floor(pages - max / 2));
                }
            }

            if (page === 1) {
                setActive(pageList[0]);
                prev && addClass(prev, pageDisable);
            } else {
                prev && removeClass(prev, pageDisable);
            }
            if (page === pages) {
                setActive(pageList[pl - 1]);
                next && addClass(next, pageDisable);
            } else {
                next && removeClass(next, pageDisable);
            }
            if (root.jump) {
                root.jump.previousSibling.getElementsByTagName('input')[0].value = page;
            }
            // console.log(page,start,root.currPageElement)
        }
    return function (pagediv,options) {
        return new Pagination(pagediv, options);
    }
}(document);
