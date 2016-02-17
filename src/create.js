var I = require('./interact')

// ---------- create

// _ -> Signal A
function create () {
	return {
		listeners: 	[],
		active: 	true,
		value:      null
	}
}

// (A -> _) -> Signal A
function fromCallback (f) {
	var s = create()
	f(function (v) {
		I.send(s, v)
		I.stop(s)
	})
	return s
}

// Promise -> Signal A
function fromPromise (promise) {
	var s = create()
	promise
		.then(function (v) {
			I.send(s, v)
			I.stop(s)
		})
		.catch(function (error) {
			I.send(s, error instanceof Error ? error : new Error(error))
		})
	return s	
}

// DomNode -> String -> Signal DomEvent
function fromDomEvent (node, eventName) {
	var s = create()
	s.dom = {
		node: node,
		eventName: eventName, 
		listener: function (evt) { I.send(s, evt) }
	}
	if (node.addEventListener) {
		node.addEventListener(eventName, s.dom.listener, false)
	} else {
		node.attachEvent(eventName, s.dom.listener)
	}
	return s
}

// Int -> Signal Int
function fromInterval (interval) {
	var count = 0
	var s = create()
	s.interval = setInterval(function () {
		I.send(s, count)
		count++
	}, interval)
	return s
}

module.exports = {
	create: create,
	fromCallback: fromCallback,
	fromPromise: fromPromise,
	fromDomEvent: fromDomEvent,
	fromInterval: fromInterval
}