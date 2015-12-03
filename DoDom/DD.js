var dd,
DD = dd = function (doc) {
    var 
    camelCase = function (str) {
        return str.replace(/-([a-z])/g, function (m, $1) {
            return $1.toUpperCase();
        })
        // return str.replace(/-([a-z])/g, RegExp.$1.toUpperCase())
    };
    console.log(camelCase('i-dont-like-it'))
    function DoDom (nodes) {
        this.nodes = nodes;
    }
    DoDom.prototype = {        
        hasClass = function (elm,cls) {
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
    }

    return DoDom;
}(document)