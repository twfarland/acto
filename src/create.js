import { send, stop } from './interact'

// ---------- create

// _ -> Signal A
function create () {
	return {
		listeners: 	[],
		active: 	true,
		error: 		null,
		value:      null
	}
}

// (A -> _) -> Signal A
function fromCallback (f) {
	const s = create()
	f(v => {
		send(s, v)
		stop(s)
	})
	return s
}

// Promise -> Signal A
function fromPromise (promise) {
	const s = create()
	promise
		.then(v => {
			send(s, v)
			stop(s)
		})
		.catch(error => {
			s.error = error
			send(s, error)
			stop(s)
		})
	return s	
}

// DomNode -> String -> Signal DomEvent
function fromDomEvent (node, eventName) {
	const s = create()
	s.dom = {
		node,
		eventName, 
		listener(evt) { send(s, evt) }
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
	const s = create()
	s.interval = setInterval(() => {
		send(s, count)
		count++
	}, interval)
	return s
}

module.exports = {
	create,
	fromCallback,
	fromPromise,
	fromDomEvent,
	fromInterval
}