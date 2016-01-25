// ---------- transform

// (... _ -> B) -> ... Stream _ -> Stream B
function map (f, ...ss) {
	const s2 = create()
	ss.forEach(s3 =>
		listen(s3, () =>
			send(s2, f.apply(null, ss.map(s => s.value)))))
	return s2
}

// (A -> Bool) -> Stream A -> Stream A 
function filter (f, s) {
	const s2 = create()
	listen(s, v => {
		if (f(v)) send(s2, v)
	})
	return s2
}

// Signal A -> Signal A
function dropRepeats (s) {
	const s2 = create()
	listen(s, v => {
		if (v !== s.value) send(s2, v)
	})
	return s2
}

// (A -> B -> B) -> B -> Stream A -> Stream B
function fold (f, seed, s) {
	const s2 = create()
	listen(s, v => send(s2, seed = f(v, seed)))
	return s2
}

// [Stream _] -> Stream _
function merge (...ss) {
	const s2 = create()
	ss.forEach(s => listen(s, v => send(s2, v)))
	return s2
}

// Stream A -> Stream B -> Stream A
function sampleOn (s, s2) {
	const s3 = create()
	listen(s2, () => send(s3, s.value))
	return s3
}

// Int -> Stream A -> Stream [A]
function slidingWindow (length, s) {
	const s2 = create()
	const frame = []
	listen(s, v => {
		if (frame.length > length - 1) frame.shift()
		frame.push(v)
		send(s2, frame)
	})
	return s2
}

// ---------- export

const Transform = {
	map, filter, dropRepeats, fold, merge, sampleOn, slidingWindow 
}

export default Transform
