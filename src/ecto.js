(function (root, name, definer){

	var obj = definer()

	if (typeof define === 'function'){ // AMD
		define(obj)

	} else if (typeof module !== 'undefined' && module.exports) { // Node.js
		module.exports = obj

	} else { // Browser
		if (root[name]) throw new Error(name + ' is already globally defined')
		root[name] = obj
	}

})(this, 'ectoSignals', function () {

// --------------------

var slice = Array.prototype.slice

// -------------------- CREATE

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
		send(s, v)
		stop(s)
	})
	return s
}

// Promise -> Signal A
function fromPromise (promise) {
	var s = create()
	promise
		.then(function (v) {
			send(s, v)
			stop(s)
		})
		.catch(function (error) {
			send(s, error instanceof Error ? error : new Error(error))
		})
	return s	
}

// DomNode -> String -> Signal DomEvent
function fromDomEvent (node, eventName) {
	var s = create()
	s.dom = {
		node: node,
		eventName: eventName, 
		listener: function (evt) { send(s, evt) }
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
		send(s, count)
		count++
	}, interval)
	return s
}

// _ -> Signal Number
function fromAnimationFrames () {
    const s = create()
    function step (time) {
        send(s, time)
        window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
    return s
}

// -------------------- INTERACT

// Signal A -> (A -> _) -> Signal A
function listen (s, f) {
	if (s.active) s.listeners.push(f)
	return s
}

// Signal A -> (A -> _) -> Signal A
function unlisten (s, f) {
	s.listeners = s.listeners.filter(function (listener) { return listener !== f })
	return s
}

// Signal A -> A -> Signal A
function send (s, v) {
	if (s.active) {
		s.value = v
		s.listeners.forEach(function (f) { f(v) })
	}
	return s
}

// Signal A -> Signal A
function stop (s) {

	s.listeners = []
	s.active = false

	if (s.interval) {
		clearInterval(s.interval)
		delete s.interval
	}

	if (s.dom) {
		if (s.dom.node.removeEventListener) {
			s.dom.node.removeEventListener(s.dom.eventName, s.dom.listener, false)
		} else {
			s.dom.node.detachEvent(s.dom.eventName, s.dom.listener)
		}
	}

	return s
}

// -------------------- TRANSFORM

// (... _ -> B) -> ... Signal _ -> Signal B
function map () {
	var args = [].slice.call(arguments)
	var f    = args[0]
	var ss   = args.slice(1)
	var s2   = create()
	ss.forEach(function (s3) {
		listen(s3, function () {
			send(s2, f.apply(null, ss.map(function (s) { return s.value })))
		})
	})
	return s2
}

// (A -> Bool) -> Signal A -> Signal A 
function filter (f, s) {
	var s2 = create()
	listen(s, function (v) {
		if (f(v)) send(s2, v)
	})
	return s2
}

// Signal A -> Signal A
function dropRepeats (s) {
	var s2 = create()
	listen(s, function (v) {
		if (v !== s2.value) send(s2, v)
	})
	return s2
}

// (A -> B -> B) -> B -> Signal A -> Signal B
function fold (f, seed, s) {
	var s2 = create()
	listen(s, function (v) {
		send(s2, seed = f(v, seed))
	})
	return s2
}

// [Signal _] -> Signal _
function merge () {
	var ss = [].slice.call(arguments)
	var s2 = create()
	ss.forEach(function (s) {
		listen(s, function (v) {
			send(s2, v)
		})
	})
	return s2
}

// Signal A -> Signal B -> Signal A
function sampleOn (s, s2) {
	var s3 = create()
	listen(s2, function () {
		send(s3, s.value)
	})
	return s3
}

// Int -> Signal A -> Signal [A]
function slidingWindow (length, s) {
	var s2 = create()
	var frame = []
	listen(s, function (v) {
		if (frame.length > length - 1) frame.shift()
		frame.push(v)
		send(s2, frame.slice())
	})
	return s2
}

// (A -> Signal B) -> Signal A -> Signal B
function flatMap (lift, s) {
	var s2 = create()
	listen(s, function (v1) { 
		listen(lift(v1), function (v2) {
			send(s2, v2)
		})
	})
	return s2
}

// (A -> Signal B) -> Signal A -> Signal B
function flatMapLatest (lift, s) {
	var s2 = create()
	var s3
	listen(s, function (v1) {
		if (s3) stop(s3)
		s3 = lift(v1)
		listen(s3, function (v2) {
			send(s2, v2)
		})
	})
	return s2
}

// Signal A -> Int -> Signal A
function debounce (s, quiet) {
	return flatMapLatest(function (v) {
		return fromCallback(function (cback) {
			setTimeout(function () {
				cback(v)
			}, quiet)
		})
	}, s)
}

// API --------------------

return {
	create: create,
	fromPromise: fromPromise,
	fromCallback: fromCallback,
	fromAnimationFrames: fromAnimationFrames,
	fromDomEvent: fromDomEvent,
	fromInterval: fromInterval,
	listen: listen,
	unlisten: unlisten,
	send: send,
	stop: stop,
	map: map,
	filter: filter,
	fold: fold,
	merge: merge,
	dropRepeats: dropRepeats,
	sampleOn: sampleOn,
	flatMap: flatMap,
	flatMapLatest: flatMapLatest,
	debounce: debounce,
	slidingWindow: slidingWindow
}

})
