// ---------- interact

// Stream A -> (A -> _) -> Stream A
export function listen (s, f) {
	if (s.active) s.listeners.push(f)
	return s
}

// Stream A -> A -> Stream A
export function send (s, v) {
	if (s.active) {
		s.value = v
		s.listeners.forEach(f => f(v))
	}
	return s
}

module.exports = {
	listen,
	send
}