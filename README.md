# sig
A miniscule signals library by [Tim Farland](mailto:twfarland@gmail.com)


Inspired by [Elm](http://elm-lang.org).
Written without the use of `this`, `new`, or `prototype` - only simple objects and functions.
Miniscule size - ~1kb minified/gzipped.
Tests are Todo.


## Signal type

	Signal A :: {
		listeners: [(A -> _)],
		active: boolean,
		value: A || null,
		error: error || null
	}

## Creating signals

Capture events on a dom node.

	// DomNode -> String -> Signal DomEvent
	const clicks = fromDomEvent(document.body, "click", evt => console.log(evt.target))

A signal that will emit one value or an error, then terminate.

	// Promise A -> Signal A
	const wait = fromPromise(new Promise(resolve => setTimeout(() => resolve("Finished"), 1000)))

A signal that emits an integer count of millisecond intervals since it was started.

	// Int -> Signal Int
	const seconds = fromInterval(1000)

Low-level signal creation.

	// Signal A
	const rawSignal = create()

# Interacting with signals

Subscribe to values emitted by the signal.

	// Signal A -> (A -> _) -> Signal A
	listen(clicks, e => console.log(e))

Send a value to a signal.

	// Signal A -> A -> Signal A
	send(rawSignal, "value")

Stop a signal - no more values will be emitted.

	// Signal A -> Signal A
	stop(rawSignal)

# Transforming signals

Map values of a signal

	// (... _ -> B) -> ... Signal _ -> Signal B
	const values = map(evt => evt.target.value, fromDomEvent(input, "keydown"))

Map (zip) the latest value of multiple signals

	// (... _ -> B) -> ... Signal _ -> Signal B
	const areas = map((x, y) => x * y, widthSignal, heightSignal)

Filter a signal, will only emit event that pass the test

	// (A -> Bool) -> Signal A -> Signal A 
	const evens = filter(n => n % 2 === 0, numberSignal)

Only emit if the current value is different to the previous (as compared by `===`). Not a full deduplication.

	// Signal A -> Signal A
	dropRepeats(numbers)

Fold a signal over an initial seed value.

	// (A -> B -> B) -> B -> Signal A -> Signal B
	const sum = fold((a, b) => a + b, 0, numbersStream)

Merge many signals into one that emits values from all.

	// ... Signal _ -> Signal _
	const events = merge(clicks, keypresses)

Take the last value of a stream when another stream emits.

	// Signal A -> Signal B -> Signal A
	const mousePositionsBySeconds = sampleOn(mousePosition, fromInterval(1000))

Emit an array of the last n values of a signal.

	// Int -> Signal A -> Signal [A]
	const trail = slidingWindow(5, mousePosition)

Map values of a signal to a new signal, then flatten the results of all emitted into one signal.

	// (A -> Signal B) -> Signal A -> Signal B
	const responses = flatMap(evt => fromPromise(ajaxGet("/" + evt.target.value)), keyPresses)

The same as above, but only emits values from the latest child signal.

	// (A -> Signal B) -> Signal A -> Signal B
	flatMapLatest(v => fromPromise(promiseCreator(v)), valueSignal)


