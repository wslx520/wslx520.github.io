// 判断DOM节点是否符合指定判断条件
var is = function  () {
	var reg = /(^[A-Za-z]+\d?)|(\#|\.)([\w\d-]+)|\[([\w\-\:\d]+)([\!\|\^\$\~]?\=)?([^\s]+)?\]/g;
	function checkAttr (elm,attr) {
		// attr is an Object, contains [name],[operator],[value]
		 //先取出节点对应的属性值
	    var result = elm.getAttribute(attr.name),
	    	operator = attr.operator,
	    	check = attr.value;
	 
		// console.log(attr,result)
	    //看看属性值有木有！
	    if ( result == null ) {
	      //如果操作符是不等号，返回真，因为当前属性为空 是不等于任何值的
	      return operator === "!=";
	    }
	    //如果没有操作符，那就直接通过规则了
	    if ( !operator ) {
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
	      operator === "^=" ? check && result.indexOf( check ) === 0 :
	 
	      //这样解释： lang*=en 匹配这样 <html lang="xxxxenxxx">的节点
	      operator === "*=" ? check && result.indexOf( check ) > -1 :
	 
	      //如果是末尾相等，判断目标值是否在当前属性值的末尾
	      operator === "$=" ? check && result.slice( -check.length ) === check :
	 
	      //这样解释： lang~=en 匹配这样 <html lang="zh_CN en">的节点
	      operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
	 
	      //这样解释： lang=|en 匹配这样 <html lang="en-US">的节点
	      operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
	      //其他情况的操作符号表示不匹配
	      false;
	 
	}
	return function  (elem,type) {
		var res;			
		var classes = ' '+elem.className+' ';
		for(;res = reg.exec(type);) {
			var match = res[0],first = match.substr(0,1);
			if(first=='#') {
				if(elem.getAttribute('id') != res[3]) return false;
			} else if(first=='.') {
				if(classes.indexOf(' '+res[3]+' ') <0 ) return false;
			} else if(first=='[') {
				if(checkAttr(elem,{name:res[4],operator:res[5],value:res[6]})==false) return false;
			} else {
				if(elem.tagName !== match.toUpperCase()) return false;
			}
		}
		return true;
	}
}();
