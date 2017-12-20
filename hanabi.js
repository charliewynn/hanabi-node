let val = 1;

module.exports.getVal = function()
{
	return val;
}

module.exports.inc = function(){
	val++;
	return val;
}
module.exports.test = function(){
	return 123;
}