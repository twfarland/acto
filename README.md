# acto
A signals library for functional reactive programming.
Author: [Tim Farland](https://github.com/twfarland)

- Inspired by [Elm](http://elm-lang.org) and [Bacon.js](https://baconjs.github.io).
- Written without the use of `this`, `new`, or `prototype` - only simple objects and functions.
- Miniscule size - ~2kb minified/gzipped.
- For modular use in node or browsers.
- License: MIT.

## Install

	npm install --save acto

## Test

	npm test

## Importing

	import acto from 'acto'	// es6

	var acto = require('acto') // common

	define(['acto'] , function (acto) { }) // amd

	window.acto // no module system, just including a script tag

## Api

### Signal type

	Signal A :: {
		listeners: [(A -> _)],
		active: boolean,
		value: A || null
	}

### Creating signals

#### fromDomEvent

Capture events on a dom node.

```javascript
// DomNode -> String -> Signal DomEvent
const clicks = fromDomEvent(document.body, "click", evt => console.log(evt.target))
```

#### fromCallback

A signal that will emit one value, then terminate.

```javascript
// (A -> _) -> Signal A
const later = fromCallback(callback => setTimeout(() => callback("Finished"), 1000))
```

#### fromPromise

A signal that will emit one value or an error from a Promise, then terminate.

```javascript
// Promise A -> Signal A
const wait = fromPromise(new Promise(resolve => setTimeout(() => resolve("Finished"), 1000)))
```

#### fromAnimationFrames

```javascript
// _ -> Signal Number
const frames = fromAnimationFrames()
```
A signal that fires on every window.requestAnimationFrame. Useful in combination with `sampleOn`.

#### fromInterval

A signal that emits an integer count of millisecond intervals since it was started.

```javascript
// Int -> Signal Int
const seconds = fromInterval(1000)
```

#### create

Low-level signal creation.

```javascript
// Signal A
const rawSignal = create()
const rawSignalWithInitialValue = create(123)
```
### Interacting with signals

#### listen / unlisten

Subscribe / unsubscribe to values emitted by the signal.

```javascript
// Signal A -> (A -> _) -> Signal A
function logger (e) { console.log(e) }
listen(clicks, logger)
unlisten(clicks, logger)
```

#### send

Send a value to a signal.

```javascript
// Signal A -> A -> Signal A
send(rawSignal, "value")
```

#### stop

Stop a signal - no more values will be emitted.

```javascript
// Signal A -> Signal A
stop(rawSignal)
```

### Transforming signals

#### map

Map values of a signal

```javascript
// (... _ -> B) -> ... Signal _ -> Signal B
const values = map(evt => evt.target.value, fromDomEvent(input, "keydown"))
```

Map (zip) the latest value of multiple signals

```javascript
// (... _ -> B) -> ... Signal _ -> Signal B
const areas = map((x, y) => x * y, widthSignal, heightSignal)
```

#### filter

Filter a signal, will only emit event that pass the test

```javascript
// (A -> Bool) -> Signal A -> Signal A 
const evens = filter(n => n % 2 === 0, numberSignal)
```

#### dropRepeats

Only emit if the current value is different to the previous (as compared by `===`). Not a full deduplication.

```javascript
// Signal A -> Signal A
dropRepeats(numbers)
```

#### fold

Fold a signal over an initial seed value.

```javascript
// (A -> B -> B) -> B -> Signal A -> Signal B
const sum = fold((a, b) => a + b, 0, numbersStream)
```

#### merge

Merge many signals into one that emits values from all.

```javascript
// ... Signal _ -> Signal _
const events = merge(clicks, keypresses)
```

#### sampleOn

Take the last value of a signal when another signal emits.

```javascript
// Signal A -> Signal B -> Signal A
const mousePositionsBySeconds = sampleOn(mousePosition, fromInterval(1000))
```

#### slidingWindow

Emit an array of the last n values of a signal.

```javascript
// Int -> Signal A -> Signal [A]
const trail = slidingWindow(5, mousePosition)
```

#### flatMap

Map values of a signal to a new signal, then flatten the results of all emitted into one signal.

```javascript
// (A -> Signal B) -> Signal A -> Signal B
const responses = flatMap(evt => fromPromise(ajaxGet("/" + evt.target.value)), keyPresses)
```

#### flatMapLatest

The same as above, but only emits values from the latest child signal.

```javascript
// (A -> Signal B) -> Signal A -> Signal B
flatMapLatest(v => fromPromise(promiseCreator(v)), valueSignal)
```

#### debounce

Debounce a signal by a millisecond interval.

```javascript
// Signal A -> Int -> Signal A
const debouncedClicks = debounce(mouseClicks, 1000)
```

### Error handling

To put a signal in an error state, send a native `Error` object to it, which will set it's value to the error, e.g: 

```javascript
const signal = create()
listen(signal, v => console.log(v))
send(signal, 1) // 1
send(signal, new Error("Disaster has struck")) // [Error: Disaster has struck]
```

So your listeners need to be handle the case that the the type of any signal value may also be an `Error`.

As errors are just values, they're propagated downstream by the same mechanism:

```javascript
const source = create()
const mapped = map(v => v > 1 ? new Error("I can't handle this") : v, source)
listen(mapped, v => console.log(v))
send(source, 1) // 1
send(source, 2) // [Error: I can't handle this]
```

Errors do not stop signals.

