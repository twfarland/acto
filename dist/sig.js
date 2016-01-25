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
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _create = __webpack_require__(/*! ./create */ 1);
	
	var _interact = __webpack_require__(/*! ./interact */ 2);
	
	var _transform = __webpack_require__(/*! ./transform */ 3);
	
	// ---------- export
	
	var Main = {
		create: _create.create, fromPromise: _create.fromPromise, fromDomEvent: _create.fromDomEvent, fromInterval: _create.fromInterval,
		listen: _interact.listen, send: _interact.send,
		map: _transform.map, filter: _transform.filter, dropRepeats: _transform.dropRepeats, fold: _transform.fold, merge: _transform.merge, sampleOn: _transform.sampleOn, slidingWindow: _transform.slidingWindow
	};
	
	exports.default = Main;

/***/ },
/* 1 */
/*!*******************!*\
  !*** ./create.js ***!
  \*******************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// ---------- create
	
	// _ -> Stream _
	function create() {
		return {
			listeners: [],
			active: true,
			error: null,
			value: null
		};
	}
	
	// Promise -> Stream _
	function fromPromise(promise) {
		var s = create();
		promise.then(function (v) {
			send(s, v);
			s.active = false;
		}).catch(function (error) {
			s.error = error;
			send(s, error);
			s.active = false;
		});
		return s;
	}
	
	// DomNode -> String -> Stream DomEvent
	function fromDomEvent(node, eventName) {
		var s = create();
		node.addEventListener(eventName, function (evt) {
			return send(s, evt);
		});
		return s;
	}
	
	// Int -> Stream Int
	function fromInterval(interval) {
		var count = 0;
		var s = create();
		var i = setInterval(function () {
			send(s, count);
			count++;
		}, interval);
		return s;
	}
	
	// ---------- export
	
	var Create = {
		create: create, fromPromise: fromPromise, fromDomEvent: fromDomEvent, fromInterval: fromInterval
	};
	
	exports.default = Create;

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
	// ---------- interact
	
	// Stream A -> (A -> _) -> Stream A
	function listen(s, f) {
		if (s.active) s.listeners.push(f);
		return s;
	}
	
	// Stream A -> A -> Stream A
	function send(s, v) {
		if (s.active) {
			s.value = v;
			s.listeners.forEach(function (f) {
				return f(v);
			});
		}
		return s;
	}
	
	// ---------- export
	
	var Interact = {
		listen: listen, send: send
	};
	
	exports.default = Interact;

/***/ },
/* 3 */
/*!**********************!*\
  !*** ./transform.js ***!
  \**********************/
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	// ---------- transform
	
	// (... _ -> B) -> ... Stream _ -> Stream B
	function map(f) {
		for (var _len = arguments.length, ss = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			ss[_key - 1] = arguments[_key];
		}
	
		var s2 = create();
		ss.forEach(function (s3) {
			return listen(s3, function () {
				return send(s2, f.apply(null, ss.map(function (s) {
					return s.value;
				})));
			});
		});
		return s2;
	}
	
	// (A -> Bool) -> Stream A -> Stream A
	function filter(f, s) {
		var s2 = create();
		listen(s, function (v) {
			if (f(v)) send(s2, v);
		});
		return s2;
	}
	
	// Signal A -> Signal A
	function dropRepeats(s) {
		var s2 = create();
		listen(s, function (v) {
			if (v !== s.value) send(s2, v);
		});
		return s2;
	}
	
	// (A -> B -> B) -> B -> Stream A -> Stream B
	function fold(f, seed, s) {
		var s2 = create();
		listen(s, function (v) {
			return send(s2, seed = f(v, seed));
		});
		return s2;
	}
	
	// [Stream _] -> Stream _
	function merge() {
		var s2 = create();
	
		for (var _len2 = arguments.length, ss = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			ss[_key2] = arguments[_key2];
		}
	
		ss.forEach(function (s) {
			return listen(s, function (v) {
				return send(s2, v);
			});
		});
		return s2;
	}
	
	// Stream A -> Stream B -> Stream A
	function sampleOn(s, s2) {
		var s3 = create();
		listen(s2, function () {
			return send(s3, s.value);
		});
		return s3;
	}
	
	// Int -> Stream A -> Stream [A]
	function slidingWindow(length, s) {
		var s2 = create();
		var frame = [];
		listen(s, function (v) {
			if (frame.length > length - 1) frame.shift();
			frame.push(v);
			send(s2, frame);
		});
		return s2;
	}
	
	// ---------- export
	
	var Transform = {
		map: map, filter: filter, dropRepeats: dropRepeats, fold: fold, merge: merge, sampleOn: sampleOn, slidingWindow: slidingWindow
	};
	
	exports.default = Transform;

/***/ }
/******/ ]);
//# sourceMappingURL=sig.js.map