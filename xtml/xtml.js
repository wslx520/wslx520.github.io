var str = '\
<div id="{{$a}}">\
<span>{{~$arr value,index}} <em>{{value}}</em> {{/for}} </span> <br/>\
<span>{{~$obj as value,index}} <em>{{value}}</em> {{/for}} </span>\
</div>\
\
';
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