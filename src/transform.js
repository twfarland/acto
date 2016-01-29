import { create } from './create'
import { send, listen, stop } from './interact'

// ---------- transform

// (... _ -> B) -> ... Signal _ -> Signal B
function map (f, ...ss) {
	const s2 = create()
	ss.forEach(s3 =>
		listen(s3, () =>
			send(s2, f.apply(null, ss.map(s => s.value)))))
	return s2
}

// (A -> Bool) -> Signal A -> Signal A 
function filter (f, s) {
	const s2 = create()
	listen(s, v => {
		if (f(v)) send(s2, v)
	})
	return s2
}

// Signal A -> Signal A
function dropRepeats (s, eq) {
	const s2 = create()
	listen(s, v => {
		if (v !== s2.value) send(s2, v)
	})
	return s2
}

// (A -> B -> B) -> B -> Signal A -> Signal B
function fold (f, seed, s) {
	const s2 = create()
	listen(s, v => send(s2, seed = f(v, seed)))
	return s2
}

// [Signal _] -> Signal _
function merge (...ss) {
	const s2 = create()
	ss.forEach(s => listen(s, v => send(s2, v)))
	return s2
}

// Signal A -> Signal B -> Signal A
function sampleOn (s, s2) {
	const s3 = create()
	listen(s2, () => send(s3, s.value))
	return s3
}

// Int -> Signal A -> Signal [A]
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

// (A -> Signal B) -> Signal A -> Signal B
function flatMap (lift, s) {
	const s2 = create()
	listen(s, v1 => 
		listen(lift(v1), v2 => send(s2, v2)))
	return s2
}

// (A -> Signal B) -> Signal A -> Signal B
function flatMapLatest (lift, s) {
	const s2 = create()
	var s3
	listen(s, v1 => {
		if (s3) stop(s3)
		s3 = lift(v1)
		listen(s3, v2 => send(s2, v2))
	})
	return s2
}

module.exports = {
	map, 
	filter, 
	dropRepeats, 
	fold, 
	merge, 
	sampleOn, 
	slidingWindow,
	flatMap,
	flatMapLatest
}
