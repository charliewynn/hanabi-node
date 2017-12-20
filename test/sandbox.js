const hanabi = require('../hanabi');

exports.doesInitWork = function(test){
	test.equal(123, hanabi.test(), "hanabi.test == 123");
	test.notEqual(456, hanabi.test(), "hanabi.test != 456")
	test.done();
}

exports.varTest = function(test){
	test.equal(1, hanabi.getVal(), "Colud get val");
	hanabi.inc();
	test.notEqual(1, hanabi.getVal(), "did inc");
	test.equal(2, hanabi.getVal(), "inc added 1");
	test.done();
}