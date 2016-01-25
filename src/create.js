// ---------- create

// _ -> Stream _
function create () {
	return {
		listeners: 	[],
		active: 	true,
		error: 		null,
		value:      null
	}
}

// Promise -> Stream _
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

// DomNode -> String -> Stream DomEvent
function fromDomEvent (node, eventName) {
	const s = create()
	node.addEventListener(eventName, evt => send(s, evt))
	return s
}

// Int -> Stream Int
function fromInterval (interval) {
	var count = 0
	const s = create()
	const i = setInterval(() => {
		send(s, count)
		count++
	}, interval)
	return s
}


// ---------- export

const Create = { 
	create, fromPromise, fromDomEvent, fromInterval
}

export default Create
