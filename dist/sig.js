/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!*****************!*\
  !*** ./main.js ***!
  \*****************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _create = __webpack_require__(/*! ./create */ 1);
	
	var _interact = __webpack_require__(/*! ./interact */ 2);
	
	var _transform = __webpack_require__(/*! ./transform */ 3);
	
	module.exports = {
		create: _create.create, fromPromise: _create.fromPromise, fromDomEvent: _create.fromDomEvent, fromInterval: _create.fromInterval,
		listen: _interact.listen, send: _interact.send, stop: _interact.stop,
		map: _transform.map, filter: _transform.filter, dropRepeats: _transform.dropRepeats, fold: _transform.fold, merge: _transform.merge, sampleOn: _transform.sampleOn, slidingWindow: _transform.slidingWindow, flatMap: _transform.flatMap, flatMapLatest: _transform.flatMapLatest
	};

/***/ },
/* 1 */
/*!*******************!*\
  !*** ./create.js ***!
  \*******************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interact = __webpack_require__(/*! ./interact */ 2);
	
	// ---------- create
	
	// _ -> Signal A
	function create() {
		return {
			listeners: [],
			active: true,
			error: null,
			value: null
		};
	}
	
	// Promise -> Signal A
	function fromPromise(promise) {
		var s = create();
		promise.then(function (v) {
			(0, _interact.send)(s, v);
			s.active = false;
		}).catch(function (error) {
			s.error = error;
			(0, _interact.send)(s, error);
			s.active = false;
		});
		return s;
	}
	
	// DomNode -> String -> Signal DomEvent
	function fromDomEvent(node, eventName) {
		var s = create();
		node.addEventListener(eventName, function (evt) {
			return (0, _interact.send)(s, evt);
		});
		return s;
	}
	
	// Int -> Signal Int
	function fromInterval(interval) {
		var count = 0;
		var s = create();
		var i = setInterval(function () {
			(0, _interact.send)(s, count);
			count++;
		}, interval);
		return s;
	}
	
	module.exports = {
		create: create,
		fromPromise: fromPromise,
		fromDomEvent: fromDomEvent,
		fromInterval: fromInterval
	};

/***/ },
/* 2 */
/*!*********************!*\
  !*** ./interact.js ***!
  \*********************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.listen = listen;
	exports.send = send;
	exports.stop = stop;
	// ---------- interact
	
	// Signal A -> (A -> _) -> Signal A
	function listen(s, f) {
		if (s.active) s.listeners.push(f);
		return s;
	}
	
	// Signal A -> A -> Signal A
	function send(s, v) {
		if (s.active) {
			s.value = v;
			s.listeners.forEach(function (f) {
				return f(v);
			});
		}
		return s;
	}
	
	// Signal A -> Signal A
	function stop(s) {
		s.listeners = [];
		s.active = false;
		s.value = null;
		return s;
	}
	
	module.exports = {
		listen: listen,
		send: send,
		stop: stop
	};

/***/ },
/* 3 */
/*!**********************!*\
  !*** ./transform.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _create = __webpack_require__(/*! ./create */ 1);
	
	var _interact = __webpack_require__(/*! ./interact */ 2);
	
	// ---------- transform
	
	// (... _ -> B) -> ... Signal _ -> Signal B
	function map(f) {
		for (var _len = arguments.length, ss = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			ss[_key - 1] = arguments[_key];
		}
	
		var s2 = (0, _create.create)();
		ss.forEach(function (s3) {
			return (0, _interact.listen)(s3, function () {
				return (0, _interact.send)(s2, f.apply(null, ss.map(function (s) {
					return s.value;
				})));
			});
		});
		return s2;
	}
	
	// (A -> Bool) -> Signal A -> Signal A
	function filter(f, s) {
		var s2 = (0, _create.create)();
		(0, _interact.listen)(s, function (v) {
			if (f(v)) (0, _interact.send)(s2, v);
		});
		return s2;
	}
	
	// Signal A -> Signal A
	function dropRepeats(s, eq) {
		var s2 = (0, _create.create)();
		(0, _interact.listen)(s, function (v) {
			if (v !== s2.value) (0, _interact.send)(s2, v);
		});
		return s2;
	}
	
	// (A -> B -> B) -> B -> Signal A -> Signal B
	function fold(f, seed, s) {
		var s2 = (0, _create.create)();
		(0, _interact.listen)(s, function (v) {
			return (0, _interact.send)(s2, seed = f(v, seed));
		});
		return s2;
	}
	
	// [Signal _] -> Signal _
	function merge() {
		var s2 = (0, _create.create)();
	
		for (var _len2 = arguments.length, ss = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			ss[_key2] = arguments[_key2];
		}
	
		ss.forEach(function (s) {
			return (0, _interact.listen)(s, function (v) {
				return (0, _interact.send)(s2, v);
			});
		});
		return s2;
	}
	
	// Signal A -> Signal B -> Signal A
	function sampleOn(s, s2) {
		var s3 = (0, _create.create)();
		(0, _interact.listen)(s2, function () {
			return (0, _interact.send)(s3, s.value);
		});
		return s3;
	}
	
	// Int -> Signal A -> Signal [A]
	function slidingWindow(length, s) {
		var s2 = (0, _create.create)();
		var frame = [];
		(0, _interact.listen)(s, function (v) {
			if (frame.length > length - 1) frame.shift();
			frame.push(v);
			(0, _interact.send)(s2, frame);
		});
		return s2;
	}
	
	// (A -> Signal B) -> Signal A -> Signal B
	function flatMap(lift, s) {
		var s2 = (0, _create.create)();
		(0, _interact.listen)(s, function (v1) {
			return (0, _interact.listen)(lift(v1), function (v2) {
				return (0, _interact.send)(s2, v2);
			});
		});
		return s2;
	}
	
	// (A -> Signal B) -> Signal A -> Signal B
	function flatMapLatest(lift, s) {
		var s2 = (0, _create.create)();
		var s3;
		(0, _interact.listen)(s, function (v1) {
			if (s3) (0, _interact.stop)(s3);
			s3 = lift(v1);
			(0, _interact.listen)(s3, function (v2) {
				return (0, _interact.send)(s2, v2);
			});
		});
		return s2;
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
	};

/***/ }
/******/ ]);
//# sourceMappingURL=sig.js.map