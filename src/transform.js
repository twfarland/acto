var C = require('./create')
var I = require('./interact')

// ---------- transform

// (... _ -> B) -> ... Signal _ -> Signal B
function map () {
	var args = [].slice.call(arguments)
	var f    = args[0]
	var ss   = args.slice(1)
	var s2   = C.create()
	ss.forEach(function (s3) {
		I.listen(s3, function () {
			I.send(s2, f.apply(null, ss.map(function (s) { return s.value })))
		})
	})
	return s2
}

// (A -> Bool) -> Signal A -> Signal A 
function filter (f, s) {
	var s2 = C.create()
	I.listen(s, function (v) {
		if (f(v)) I.send(s2, v)
	})
	return s2
}

// Signal A -> Signal A
function dropRepeats (s) {
	var s2 = C.create()
	I.listen(s, function (v) {
		if (v !== s2.value) I.send(s2, v)
	})
	return s2
}

// (A -> B -> B) -> B -> Signal A -> Signal B
function fold (f, seed, s) {
	var s2 = C.create()
	I.listen(s, function (v) {
		I.send(s2, seed = f(v, seed))
	})
	return s2
}

// [Signal _] -> Signal _
function merge () {
	var ss = [].slice.call(arguments)
	var s2 = C.create()
	ss.forEach(function (s) {
		I.listen(s, function (v) {
			I.send(s2, v)
		})
	})
	return s2
}

// Signal A -> Signal B -> Signal A
function sampleOn (s, s2) {
	var s3 = C.create()
	I.listen(s2, function () {
		I.send(s3, s.value)
	})
	return s3
}

// Int -> Signal A -> Signal [A]
function slidingWindow (length, s) {
	var s2 = C.create()
	var frame = []
	I.listen(s, function (v) {
		if (frame.length > length - 1) frame.shift()
		frame.push(v)
		I.send(s2, frame.slice())
	})
	return s2
}

// (A -> Signal B) -> Signal A -> Signal B
function flatMap (lift, s) {
	var s2 = C.create()
	I.listen(s, function (v1) { 
		I.listen(lift(v1), function (v2) {
			I.send(s2, v2)
		})
	})
	return s2
}

// (A -> Signal B) -> Signal A -> Signal B
function flatMapLatest (lift, s) {
	var s2 = C.create()
	var s3
	I.listen(s, function (v1) {
		if (s3) I.stop(s3)
		s3 = lift(v1)
		I.listen(s3, function (v2) {
			I.send(s2, v2)
		})
	})
	return s2
}

module.exports = {
	map: map, 
	filter: filter, 
	dropRepeats: dropRepeats, 
	fold: fold, 
	merge: merge, 
	sampleOn: sampleOn, 
	slidingWindow: slidingWindow,
	flatMap: flatMap,
	flatMapLatest: flatMapLatest
}
