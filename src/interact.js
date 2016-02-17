// ---------- interact

// Signal A -> (A -> _) -> Signal A
function listen (s, f) {
	if (s.active) s.listeners.push(f)
	return s
}

// Signal A -> A -> Signal A
function send (s, v) {
	if (s.active) {
		s.value = v
		s.listeners.forEach(function (f) { f(v) })
		if (v instanceof Error) stop(s)
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

module.exports = {
	listen: listen,
	send: send,
	stop: stop
}