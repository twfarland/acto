// ---------- interact

// Signal A -> (A -> _) -> Signal A
export function listen (s, f) {
	if (s.active) s.listeners.push(f)
	return s
}

// Signal A -> A -> Signal A
export function send (s, v) {
	if (s.active) {
		s.value = v
		s.listeners.forEach(f => f(v))
	}
	return s
}

// Signal A -> Signal A
export function stop (s) {

	s.listeners = []
	s.active = false
	s.value = null

	if (s.interval) {
		clearInterval(s.interval),
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
	listen,
	send,
	stop
}