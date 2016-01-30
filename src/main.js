var C = require('./create');
var I = require('./interact');
var T = require('./transform');

var Ecto = {};

[C,I,T].forEach(function (obj) {
	for (var p in obj) {
		if (obj.hasOwnProperty(p)) Ecto[p] = obj[p];
	}
})

module.exports = Ecto;
