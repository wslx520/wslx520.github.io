/*
xPagenation - 分页导航组件。
作者：十年灯 - http://jo2.org
Git: https://github.com/wslx520/wslx520.github.io/tree/master/pagination
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
    var hasClass = function (elm, cls) {
            var ecls = ' ' + elm.className + ' ';
            return ecls.indexOf(' ' + cls + ' ') > -1;
        },
        addClass = function (elm, cls) {
            elm.className += ' ' + cls;
        },
        removeClass = function (elm, cls) {
            elm.className = elm.className.replace(new RegExp('\\b' + cls + '\\b', "g"), '');
        },
        create = function (classes, tag) {
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
        extend = function (old, newo) {
            for (var o in newo) {
                old[o] = newo[o];
            }
            return old;
        },
        // 隐藏某元素
        hide = function (elm, f) {
            elm.style.display = f === undefined ? 'none' : f;
        },
        pageActive = 'page-item-active',
        pageItem = 'page-item',
        pageHover = 'page-item-hover',
        pageDisable = 'disable',
        setPages = function () {
            var root = this,
                Options = root.options,
                items = Options.items-=0,
                pages = Options.pages-=0,
                max = Options.max-=0,
                lis = [],
                i,
                pageList = root.pageList,
                elli;
            Options.size -= 0;    
            if (items) {
                pages = Options.pages = Math.ceil(items / Options.size);
            }
            pageList.innerHTML = '';
            max = Math.min(max, pages);
            lis.push('<li class="' + pageItem + '" ui-page="first">1</li>');
            for (i = 2; i < max; i++) {
                lis.push('<li class="' + pageItem + '" ui-page="' + i + '">' + i + '</li>');
            }
            if (max > 1) {
                lis.push('<li class="' + pageItem + '" ui-page="last">' + pages + '</li>');
            }
            if (pages > max) {
                elli = '<li class="page-ellipsis" ui-page="ellipsis">...</li>';
                lis.splice(1, 0, elli);
                lis.splice(lis.length - 1, 0, elli);
            }
            if (Options.prev) {
                lis.unshift('<li class="page-btn-prev" ui-page="prev">' + Options.prev + '</li>');
            }
            if (Options.next) {
                lis.push('<li class="page-btn-next" ui-page="next">' + Options.next + '</li>');
            }
            // console.log(pageList, lis);
            pageList.innerHTML = lis.join('');
            root.hasEllipsis = pages > max;
        },
        Pagination = function (el, options) {
            this.options = extend({}, defaults);
            extend(this.options, options);
            var root = this,
                Options = root.options,
                pages = (Options.pages-=0),
                curr = (Options.curr -=0),
                max = Options.max-=0,
                temp,
                items = [],
                pi,
                jumpinput,
                jumpbt,
                pp,
                page,
                li,
                i,
                elli,
                pageCodes = {
                    last: function () {
                        return Options.pages;
                    },
                    first: 1,
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
            if (!hasClass(temp, 'page-list-wrap')) {
                addClass(temp, 'page-list-wrap');
            }
            this.pageList = el;
            // 生成页码
            setPages.call(this);
            if (Options.onpagination) root.onpagination = Options.onpagination;
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
                	li = event.target || event.srcElement;
                    if(li.tagName !== 'LI') return;
                    if (!hasClass(li, pageHover)) {
                        var num = +li.innerHTML;
                        root.options.size = num;
                        if (Options.items) {
                            setPages.call(root);
                        }
                        // root.onpagination && root.onpagination(Options.curr, num);                        
                        root.go(Options.curr);
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
                if('function' === typeof Options.info) {
                    pi.innerHTML = Options.info(Options);
                } else if (Options.items){
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
                    e = e || window.event;
                    if(e.which === undefined) {
                        e.which = e.keyCode || e.button;
                    }
                    var input = this.getElementsByTagName('input')[0],
                        value = parseInt(input.value, 10);
                    if (!isNaN(value) && (e.which === 13)) {
                        root.go(value);
                    }
                };
                root.jump = root.meta.appendChild(jumpbt);
                root.jump.onclick = function () {
                    page = this.previousSibling.getElementsByTagName('input')[0].value;
                    page = parseInt(page, 10);
                    if (!isNaN(page) && page !== '') {
                        root.go(page);
                    }
                };
            }
            el.onclick = function (event) {
                curr = Options.curr;
                //console.log(curr)
                event = event || window.event;
                li = event.target || event.srcElement;
                if(li.tagName !== 'LI') return;
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
        
        Pagination.prototype.go = function (page) {
            var root = this,
                Options = root.options,
                pageList = root.pageList.children,
                ellipsis = root.ellipsis,
                pl = pageList.length,
                max = Options.max,
                half = max / 2,
                pages = Options.pages,
                // start = pageCalc(page, Options.pages, Options.max),
                li,
                i,
                num,
                showPages = 'center',
                first = pageList.first, 
                last = pageList.last,
                prev = Options.prev;
            // console.log(page)    
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
                var pg, d = /\d+/, li, 
                    // 是否是第一个省略
                    isBefore = true,
                    tohide;
                // console.log(start, pl);
                for (i = 0; i < pl; i++) {
                    li = pageList[i];
                    pg = li.getAttribute('ui-page');
                    // console.log(li,i, start, pg)
                    if(d.test(pg)) {
                        if(pg != start) {
                            li.innerHTML = start;
                            li.setAttribute('ui-page', start);
                        }                        
                        if (start === page) {
                            setActive(li);
                        }   
                        start++; 
                    } else {
                        if((pg === 'first' && page === 1) || (pg === 'last' && page === pages)) {
                            setActive(li);
                        } else if(pg === 'ellipsis') {
                            if(isBefore) {
                                isBefore = false;
                                tohide = (page <= Math.ceil(half)) ? undefined : '';
                                hide(li, tohide);
                            } else {
                                tohide = (page >= Math.ceil(pages - half)) ? undefined : '';
                                hide(li, tohide);
                            }
                        }
                    }
                }
            }
            // console.log(start,page)
            if (!root.hasEllipsis) {
                setActive(pageList[page - (prev ? 0 : 1)]);
            } else {
                // 默认假设页码居中
                var start = page - (Math.ceil(half-1) - 1);
                if (page <= Math.ceil(half)) {
                    // 页码靠前
                    start = 2;
                } else if (page >= Math.ceil(pages - half)) {
                    // 页码靠后
                    start = Math.floor(pages - half);
                }
                setPageNumbers(start);
            }
            if(prev) {
                (page == 1 ? addClass : removeClass)(pageList[0], pageDisable);
            }
            if(Options.next) {
                (page == pages ? addClass : removeClass)(pageList[pl - 1], pageDisable);
            }
            
            if (root.jump) {
                root.jump.previousSibling.getElementsByTagName('input')[0].value = page;
            }
            if('function' === typeof Options.info) {
                root.info.innerHTML = Options.info(Options);
            }
            // console.log(page,start,root.currPageElement)
        }
    return function (pagediv,options) {
        return new Pagination(pagediv, options);
    }
}(document);
