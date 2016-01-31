# ecto-signals
A signals library for functional reactive programming.
Author: [Tim Farland](https://github.com/twfarland)

Inspired by [Elm](http://elm-lang.org) and [Bacon.js](https://baconjs.github.io).
Written without the use of `this`, `new`, or `prototype` - only simple objects and functions.
Miniscule size - ~1kb minified/gzipped.
License: MIT

## Install

	npm install --save ecto-signals

## Test

	npm test

## Api

### Signal type

	Signal A :: {
		listeners: [(A -> _)],
		active: boolean,
		value: A || null,
		error: error || null
	}

### Creating signals

Capture events on a dom node.

```javascript
// DomNode -> String -> Signal DomEvent
const clicks = fromDomEvent(document.body, "click", evt => console.log(evt.target))
```

A signal that will emit one value, then terminate.

```javascript
// (A -> _) -> Signal A
const later = fromCallback(callback => setTimeout(() => callback("Finished"), 1000))
```

A signal that will emit one value or an error from a Promise, then terminate.

```javascript
// Promise A -> Signal A
const wait = fromPromise(new Promise(resolve => setTimeout(() => resolve("Finished"), 1000)))
```
A signal that emits an integer count of millisecond intervals since it was started.

```javascript
// Int -> Signal Int
const seconds = fromInterval(1000)
```
Low-level signal creation.

```javascript
// Signal A
const rawSignal = create()
```
### Interacting with signals

Subscribe to values emitted by the signal.

```javascript
// Signal A -> (A -> _) -> Signal A
listen(clicks, e => console.log(e))
```
Send a value to a signal.

```javascript
// Signal A -> A -> Signal A
send(rawSignal, "value")
```
Stop a signal - no more values will be emitted.

```javascript
// Signal A -> Signal A
stop(rawSignal)
```
### Transforming signals

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
Filter a signal, will only emit event that pass the test

```javascript
// (A -> Bool) -> Signal A -> Signal A 
const evens = filter(n => n % 2 === 0, numberSignal)
```
Only emit if the current value is different to the previous (as compared by `===`). Not a full deduplication.

```javascript
// Signal A -> Signal A
dropRepeats(numbers)
```
Fold a signal over an initial seed value.

```javascript
// (A -> B -> B) -> B -> Signal A -> Signal B
const sum = fold((a, b) => a + b, 0, numbersStream)
```
Merge many signals into one that emits values from all.

```javascript
// ... Signal _ -> Signal _
const events = merge(clicks, keypresses)
```
Take the last value of a stream when another stream emits.

```javascript
// Signal A -> Signal B -> Signal A
const mousePositionsBySeconds = sampleOn(mousePosition, fromInterval(1000))
```
Emit an array of the last n values of a signal.

```javascript
// Int -> Signal A -> Signal [A]
const trail = slidingWindow(5, mousePosition)
```
Map values of a signal to a new signal, then flatten the results of all emitted into one signal.

```javascript
// (A -> Signal B) -> Signal A -> Signal B
const responses = flatMap(evt => fromPromise(ajaxGet("/" + evt.target.value)), keyPresses)
```
The same as above, but only emits values from the latest child signal.

```javascript
// (A -> Signal B) -> Signal A -> Signal B
flatMapLatest(v => fromPromise(promiseCreator(v)), valueSignal)
```

