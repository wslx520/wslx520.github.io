// 判断元素是否符合指定条件
var is = function  (elem,type) {
	var reg = /([a-z]+\d?)|(\#|\.)([\w\d-]+)|\[([\w\-\:\d]+)([\!\|\^\$\~]?\=)?([^\s]+)?\]/g;
	var res;
	while(res = reg.exec(type)) {
		console.log(res);
	}
	console.log(type.match(reg))
}
