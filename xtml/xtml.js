var str = '\
<div id="{{$a}}">\
<span>{{~$arr as value,index}} {{? (index > 2)  }}<em>{{value}}</em> {{/?}} {{/~}} </span> <br/>\
<span>{{~$obj in value,index}} <em>{{value}}</em> {{/~}} </span>\
</div>\
\
';
var trim = function (str) {
    return str.replace(/^\s+/,'').replace(/\s+$/, '');
}
function arrFor (obj, value, key) {
    return 'for (var $3 = 0, len = $1.length, $2; $3<len;$3++) { \n$2 = $1[$3];'.replace('$1', obj).replace('$2', value).replace('$3', key);
}
function objFor (obj, value, key) {
    return 'for (var $3 in $1) { \n$2 = $1[$3];'.replace('$1', obj).replace('$2', value).replace('$3', key);
}
var compiled = 'var out = \'' 
        + str
        .replace(/\{\{\/[\~\?]\}\}/g, '\'\n}\nout+=\'')
        .replace(/\{\{(\?{1,2})([\s\S]+?)\}\}/g, function (m, isif, condition, c) {
            condition = trim(condition);
            if(isif ==='?') {
                return '\'\nif(' + condition + '){\nout+=\''
            }
            return condition ? '\nelse if(' + condition + '){\nout+=\'' : 'else {\n';
            console.log(m, '---------',a, '---------',b, '---------',c)
        })
        /*.replace(/\~(\S+)\s+in\s+([\w\$]+)?,?([\w\$]+)?/, function (m, obj, value, key) {
            if (m.indexOf(' in ') > -1) {
                    m = objFor(obj, value, key);
                } else {
                    m = arrFor(obj, value, key);
                }
                return "\';\n"+ m.replace(/\$([\w\$]+)/g, 'it.$1') + "\nout+=\'";
        })*/
        .replace(/\{\{([\s\S]+?)\}\}/g, function (m, $1, $2) {
            console.log(m,'---------', $1,'---------', $2);
            $1 = trim($1);
            if($1.charAt(0) === '~') {
                var arr = $1.split(/\s+/);
                console.log(/\~(\S+)\s+as\s+([\w\$]+)?,?([\w\$]+)?/.test($1))
                if ($1.indexOf(' in ') > -1) {
                    console.log($1)
                    $1 = $1.replace(/\~(\S+)\s+in\s+([\w\$]+)?,?([\w\$]+)?/, 'for (var $3 in $1) { \n$2 = $1[$3];');
                    /*$1 = $1.replace(/\~(\S+)\s+in\s+([\w\$]+)?,?([\w\$]+)?/, function (m, obj, value, key) {
                        console.log(m, obj, value, key);
                        return 'for(var ' + key + ' in ' + obj + ') { ' + value + ' = ' + obj + '[' + key + '];';
                    });*/
                } else {
                    $1 = $1.replace(/\~(\S+)\s+as\s+([\w\$]+)?,?([\w\$]+)?/, 'for (var $3 = 0, len = $1.length, $2; $3<len;$3++) { \n$2 = $1[$3];');
                    /*$1 = $1.replace(/\~(\S+)\s+as\s+([\w\$]+)?,?([\w\$]+)?/, function (m, obj, value, key) {
                        return 'for (var '+ key +' = 0, '+ value +', len = '+obj+'.length; '+key+'<len;'+key+'++) {'+value+' = '+obj+'['+key+']; ';
                    });*/
                }
                return "\';\n"+ $1.replace(/\$([\w\$]+)/g, 'it.$1') + "\nout+=\'";
            }
            return "\' + " + $1.replace(/\$([\w\$]+)/g, 'it.$1') + "+ \'";
        })
        + '\';return out'
    
    // .replace(/\{\{\~(\S+)\s+as|in\s+([\w\$]+)?,?([\w\$]+)?\}\}/, function (m, $1, $2, $3) {
       
    // })
var srcdata = {
        a:'这是a',
        obj:{
            aaa:'aaa in obj',
            bbb:'bbb in obj'
        },
        arr:[11,22,33,44,77]
    };
var compileFn = new Function('it', compiled);
console.log(
    compileFn, compileFn(srcdata)
)
$('mb').innerHTML = str;
$('by').innerHTML = compiled;
$('result').innerHTML = compileFn(srcdata);
var xtml = function (str, data) {
	return 
}
xtml.codeBlock = {
	start:'{{',
	end:'}}'
}
var varReg = new RegExp('\\s('+ xtml.varSymbol +')[\\S]+');
xtml.varSymbol = '$';
function compile(str) {
	var fnStr = 'var result = \'\';';
	var lastIndex = 0;
	var reg = new RegExp(xtml.codeBlock.start+'([^}]+)'+xtml.codeBlock.end, 'g');
	var repStr = str.replace(reg, function (m, $1) {
		return m.replace(varReg, function (mm, $$1) {
			return 'it.';
		})
	})
	// 对象遍历
	.replace(/\{\{\~\s*(\S+)(as)?\s+(\S+),?(\S+)?/, function (m) {
		return
	})
}
function aa(it) {
	var result = '';
	result += '<div id="' + it.a + '">';
	result += '<span>';
	for(var value,key =0;key < it.arr.length;key++) {
		value = it.arr[key];
		result += '<em>' + value + '</em>';
	}
	result += '</span>';
	result += '</div>';
}
