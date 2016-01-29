import { send } from './interact'

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

// Promise -> Signal A
function fromPromise (promise) {
	const s = create()
	promise
		.then(v => {
			send(s, v)
			s.active = false
		})
		.catch(error => {
			s.error = error
			send(s, error)
			s.active = false
		})
	return s	
}

// DomNode -> String -> Signal DomEvent
function fromDomEvent (node, eventName) {
	const s = create()
	node.addEventListener(eventName, evt => send(s, evt))
	return s
}

// Int -> Signal Int
function fromInterval (interval) {
	var count = 0
	const s = create()
	const i = setInterval(() => {
		send(s, count)
		count++
	}, interval)
	return s
}

module.exports = {
	create,
	fromPromise,
	fromDomEvent,
	fromInterval
}