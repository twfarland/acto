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
	return s
}

module.exports = {
	listen,
	send,
	stop
}