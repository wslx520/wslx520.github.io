document.querySelectorAll = document.querySelectorAll || function(dom) {
// document.querySelectorAll = function(dom) {
    var
        html = dom.documentElement,
        body = dom.body,
        undif,
        justOne = /[^\s\,]/g,
        blank = /\s+/g,
        letterStr = '[A-Za-z]',
        routineStr = '[\\w-_]+',
        attrStr = '\\[([\\w-_]+)([\\!\\*\\^\\$\\~|]?\\=)?(\\w+)?\\]',
        // pseudoStr = '\\[([\\w-_]+)([\\!\\*\\^\\$\\~|]?\\=)?(\\w+)?\\]',
        characters = '',
        validNodeIndex = [],
        regexp = function(str, gi) {
            return new RegExp(str, gi || '');
        },
        // 只有一个选择器，如#id,.classes,div,div.classes
        simpleReg = /^([a-z1-6]+)?(#|\.)?([\w-_]+)$/i,
        selectorRegExp = /^([A-Za-z]+[1-6])?((#|\.)([w-]+))?(\[([\w-]+)([\!\*\^\$\~|]?\=)?(\.+)?\])?(\:(first-child|last-child))?/,
        selectorReg = {
            id: /#([\w-]+)/,
            // classes支持多个同时存在，其余均不支持
            classes: /\.([\w-]+)/g,
            tag: /([a-z](\w+)?)/i,
            // attr:/^\[([\w-_]+)([\!\*\^\$\~\|]?\=)?(\w+)?\]/,
            attr: /\[([\w-]+)([\!\*\^\$\~\|]?\=)?(\w+)?\]/,
            pseudo: /\:(first-child|last-child)+/
        },
        specialAttrs = {
            // 'for': 'htmlFor',
            // 'class': 'className'
        },
        nodesToArray = function(nodes) {
            for (var res = [], n = nodes.length; n--; res[n] = nodes[n]);
            return res;
        },
        byId = function(id) {
            return dom.getElementById(id);
        },
        byName = function(name) {
            return dom.getElementsByName(name)
        },
        byTag = function(tag, par) {
            return (par || dom).getElementsByTagName(tag);
        },
        byClass = function(cls, tag, par, attr) {
            var list = byTag(tag || '*', par),
                resultArr = [],
                g, i = 0, item, className,
                j = 0,
                ifattr = !!attr;
            // cls = trim(cls).split(blank);
            for (; item = list[i++];) {
                if (ifattr && !checkAttr(item, attr)) {
                    continue;
                }
                if(filterFns.classes(item, cls)) {
                    resultArr[j++] = item;
                }
            };
            return resultArr;
        },

        GET = {
            id: byId,
            tag: byTag,
            classes: byClass,
            name: byName
        },
        trim = function(str) {
            return str.replace(/^\s+/, '').replace(/\s+$/, '');
        },
        eachArr = function(arr, fn) {
            for (var l = arr.length, i = 0; i < l; i++) {
                fn(arr[i], i, arr);
            };
        },
        eachObj = function(obj, fn) {
            for (var o in obj) {
                if (fn(obj[o], o, obj) === false) break;
            }
        },
        // 关系符处理函数
        relativeFns = {
            ' ': function() {

            },
            '>': function() {

            },
            '~': function() {

            },
            '+': function() {

            }
        },
        filterFns = {
            id: function(elm, str) {
                return elm.getAttribute('id') === str;
            },
            classes: function(elm, str) {
                var eClasses = ' '+elm.className+' ',
                    // str = str.split(blank),
                    s = str.length;
                for (; s--;) {
                    if (!contains(eClasses, ' ' + str[s] + ' ')) {
                        return false;
                    }
                }
                return true;
            },
            tag: function(elm, str) {
                return elm.tagName === str.toUpperCase();
            },
            attr: checkAttr,
            'first-child': function(elm) {
                return elm === getFirstOrLast(elm.parentNode);
            },
            'first-child': function(elm) {
                var lastParent = null,
                    lastFirstChild = null;
                return function (elm) {
                    // 如果这次判断的节点的父元素，与上次的父元素是同一个元素，则不再去获取“父元素的第一个子元素”
                    // console.log(elm.parentNode === lastParent)
                    if(elm.parentNode !== lastParent) {
                        lastParent = elm.parentNode;
                        lastFirstChild = getFirstOrLast(lastParent);
                    }
                    return elm === lastFirstChild;
                }
                // return elm === getFirstOrLast(elm.parentNode);
            }(),
            'last-child': function(elm) {
                var lastParent = null,
                    lastLastChild = null;
                return function (elm) {
                    // 如果这次判断的节点的父元素，与上次的父元素是同一个元素，则不再去获取“父元素的最后一个子元素”
                    // console.log(elm.parentNode === lastParent)
                    if(elm.parentNode !== lastParent) {
                        lastParent = elm.parentNode;
                        lastLastChild = getFirstOrLast(lastParent, 'last');
                    }
                    return elm === lastLastChild;
                }
            }()
        };
        // console.log(selectorRegExp)
    // 获取兄弟节点（可前可后）
    function getNode(elem, dir) {
        dir = dir || 'nextSibling';
        var f, p;
        if (dir === 'all') {
            f = elem.parentNode.firstChild;
            dir = 'nextSibling';
            p = elem.parentNode.firstChild;
        } else {
            p = elem[dir];
        }
        while (p) {
            if (isNode(p)) {
                return p;
            }
            p = p[dir];
        }
        return null;
    }
    function getPrev (elem) {
        elem = elem.previousSibling;
        while(elem && elem.nodeType !== 1) {
            elem = elem.previousSibling;
        }
        return elem;
    }
    function getFirstOrLast(elem, fol) {
        var node = fol === 'last' ? elem.lastChild : elem.firstChild,
            sibling = fol === 'last' ? 'previousSibling' : 'nextSibling';
        while (node && node.nodeType !== 1) {
            node = node[sibling];
        }
        return node;
    }

    function isNode(el) {
        return (el.nodeType === 1) && el.tagName;
    }
    // 从属性字符串里分析出属性名，运算符，属性值
    function attrMatcher(str) {
        var m;
        if (m = selectorReg.attr.exec(str)) {
            return {
                name: m[1],
                operator: m[2],
                value: m[3]
            }
        }
    }
    var selectorTypes = {
        '.': 'classes',
        '#': 'id',
        '[': 'attr',
        ':': 'pseudo'
    }, typeArray = ['tag','id','classes','attr','pseudo'];
    function contains (str, substr) {
        return str.indexOf(substr) > -1;
    }
    // 快速判断出字符串里包含哪几种选择器
    // 返回一个最长5个字节的由数字组成的字符串（基于“以最小消耗存储数据”的原则）
    // 各数字对应：0tag,1id,2class,3attr,4pseudo
    function hasWhatSelectors (str) {
        var res = '',letter1 = str.charAt(0);
        if(!selectorTypes[letter1]) {
            res += '0';
        }
        if(contains(str, '#')) {
            res += '1'
        }
        if(contains(str, '.')) {
            res += '2'
        }
        if(contains(str, '[')) {
            res += '3'
        }
        if(contains(str, ':')) {
            res += '4'
        }
        return res;
    }
    // 
    function decorateProp (ct, prop, str) {
        var type = typeArray[ct],
            reg = selectorReg[type],
            execs,
            moreclass,
            i = 0;
        if(ct === 2) {
            moreclass = [];
            while(execs = reg.exec(str)) {
                // moreclass.push(execs[1]);
                moreclass[i++] = execs[1];
            }
            prop[type] = moreclass;
        } else {
            if(ct === 3) {
                prop[type] = attrMatcher(str);
            } else {
                prop[type] = reg.exec(str)[1];
            }           
        }
    }
    // 判断字符串匹配什么选择器
    function matcher(str, i, strArr) {
        var prop = {
                string: str
            },
            letter1 = str.charAt(0),
            types = hasWhatSelectors(str),
            t = types.length,
            res, classes, id, i;
        for(;t--;) {
            decorateProp(types.charAt(t)-0, prop, str);
        }        
        if(prop.attr && prop.attr.name==='name' && prop.attr.value) {
            prop.type = 'name';
        } else {
            prop.type = selectorTypes[letter1] || 'tag';
        }
        // console.log(prop);
        return prop;
    }
    // 根据字符串的类型等属性，生成元素验证函数
    function matchFilter(prop, checkType) {
        var fns = [],
            p, fp;
        for (p in prop) {
            // console.log(p, prop[p])
            if (p !== 'type' && p !== 'string' && prop[p]) {
                fp = p==='pseudo' ? filterFns[prop[p]] : filterFns[p];
                if(fp) {
                    fp.type = p;
                    fns.push(fp);    
                }                                
            }
        }
        // console.log(fns)
        return function(elm) {
            for (var f = fns.length; f--;) {
                // console.log(fns[f].type, fns[f](elm, prop[fns[f].type]), elm)
                if (false === fns[f](elm, prop[fns[f].type])) {
                    return false;
                }
            }
            return true;
        }
    }
    // 主函数
    function selector(str, par) {
        var
            selectorArr,
            oneGroup,
            results,
            simple;

        if (typeof str === 'string') {
            // 防止出现首尾空格
            // 防止出现多个连续空格的情况
            //防止出现 div>a 这种关系符前后无空格的情况
            str = trim(str).replace(blank, ' ').replace(/([\>\+\~])/g, ' $1 ');
        }
        // console.log(str);
        //针对单个选择器做特别优化
        if (simple = simpleReg.exec(str)) {
            // console.log(simple);
            var s2 = simple[2],
                s3 = simple[3];
            if ('#' === s2) {
                return byId(s3);
            } else if (undif === s2) {
                return byTag(s3);
            } else if ('.' === s2) {
                return byClass(s3, simple[1]);
            }
        }
        return simulateQuery(str);
    }
    //选择器函数 
    function simulateQuery(str) {
        // console.log(str)
        if(contains(str, ',')) {
            throw new Error('暂不支持多组选择器');
        }
        var res = [],
            selectorArr = str.split(/\s+/),
            last = selectorArr.pop(), 
            prop = matcher(last),
            types = hasWhatSelectors(last),
            tempPool;
        // console.log(last,prop)
        if (prop.id) {
            tempPool = byId(prop.id);
        } else if (prop.type === 'name') {
            // 针对name做特别处理
            tempPool = byName(prop.attr.value);
        } else if (prop.classes) {
            // 如果有tag，则byClass就会在返回前循环一遍以判断tag符合与否。
            // 如果此时除了tag和class外，还有attribute，就需要进一步过滤
            // 为提高效率，此时可以加入回调函数判断attribute，供循环时调用，进一步剔除不符合的元素
            // 此时不过滤，后面还是要循环过滤，但就多一次循环
            tempPool = byClass(prop.classes, prop.tag, doc, prop.attr);
        } else if (prop.tag) {
            tempPool = byTag(prop.tag);
        }
        // console.log(prop.attr)
        // 对节点集做预先过滤
        if(types.length > 1) {
            tempPool = checkList(tempPool, prop);
        }
        // 再往上级过滤
        if(selectorArr.length) {
            tempPool.validNodeIndex = {};
            res = filterElements(tempPool, selectorArr);    
        } else {
            res = tempPool;
        }
        
        return res;
    }

    function checkList(list, prop) {
        var
            type = prop.type,
            // 得到要检查的属性
            will = matchFilter(prop),
            i = 0,
            j = 0,
            l = list.length,
            res = [],
            ll;
        for (; i < l; i++) {
            ll = list[i];
            if(will(ll)) {
                // res.push(ll);
                res[j++] = ll;
            }
        }
        return res;
    }
    function checkAttr(elm, attr) {
        // attr is an Object, contains [name],[operator],[value]
        // 修复特殊属性名
        if(specialAttrs[attr.name]) {
            attr.name = specialAttrs[attr.name];
        }
        //先取出节点对应的属性值
        var result = elm.getAttribute(attr.name),
            operator = attr.operator,
            check = attr.value;
        // IE7 下，即使使用getAttribute,用来获取 diabled, checked 等属性时，依然会返回布尔值
        //看看属性值有木有！
        if (result == null) {
            //如果操作符是不等号，返回真，因为当前属性为空 是不等于任何值的
            return operator === "!=";
        }
        //如果没有操作符，那就直接通过规则了
        if (!operator) {
            // 在IE7 下，如果没有操作符，则认为用户希望选择相关属性为真的节点
            if(false === result) return false;
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
            operator === "*=" ? check && contains(result, check) :

            //如果是末尾相等，判断目标值是否在当前属性值的末尾
            operator === "$=" ? check && result.slice(-check.length) === check :

            //这样解释： lang~=en 匹配这样 <html lang="zh_CN en">的节点
            operator === "~=" ? contains(" " + result + " ", check) :

            //这样解释： lang=|en 匹配这样 <html lang="en-US">的节点
            operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
            //其他情况的操作符号表示不匹配
            false;

    }

    function filterElements(list, ss) {
        // console.log(ss)
        // 此时的ss是剩下的选择器字符串
        var str = ss.pop(),
            // 这样写比用正则或indexOf快得多
            operator = (str === '>' || str === '~' || str === '+') && str,
            // 如果取得的字符段是关系符，则再进一步取下一字符段
            str = operator ? ss.pop() : str,
            // 是否还需要继续过滤(再没有需要过滤的选择器字符串了，当然就停了)
            notcontinue = ss.length === 0,
            target = 'parentNode',
            justOne, //是否查找到一个元素就停止
            prop = matcher(str),
            fn = matchFilter(prop, true),
            res = [],
            l = 0,
            j = 0,
            ll = list.length,
            elm, par,
            validNodeIndex, vali,
            // 是否此次过滤全部失败
            allFailed = true;
        if (operator) {
            if (operator !== '>') {
                target = 'previousSibling';
            }
            justOne = operator !== '~';
        }
        validNodeIndex = list.validNodeIndex;
        for (; l < ll; l++) {
            if (validNodeIndex[l] !== false) {
                elm = list[l];
                par = elm[target];
                vali = false;
                // console.log(target,par,justOne)
                // 当是 previousSibling 时，可能nodeType就不是1了，会意外中断
                // while (par && par.nodeType == 1) {
                while (par && !vali) {
                    if (par === dom.body || par === html) {
                        break;
                    }
                    vali = fn(par);
                    if (justOne && par.nodeType === 1) {
                        break;
                    }
                    par = par[target];
                }
                validNodeIndex[l] = vali;
                if(vali) {
                    if (notcontinue) {
                        // res.push(elm);
                        res[j++] = elm;
                    }
                    allFailed && (allFailed = false);
                }
                // if (vali && allFailed) allFailed = false;
            }
        }
        // console.log(list.validNodeIndex)
        if (allFailed) return null;
        if (notcontinue) {
            // 直接使用 delete IE7报错
            list.validNodeIndex = undif;
            return res.length ? res : null;
        }
        return filterElements(list, ss);
    }
    return selector;
}(document);
