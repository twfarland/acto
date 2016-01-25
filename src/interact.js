// ---------- interact

// Stream A -> (A -> _) -> Stream A
function listen (s, f) {
	if (s.active) s.listeners.push(f)
	return s
}

// Stream A -> A -> Stream A
function send (s, v) {
	if (s.active) {
		s.value = v
		s.listeners.forEach(f => f(v))
	}
	return s
}

// ---------- export

const Interact = { 
	listen, send
}

export default Interact
