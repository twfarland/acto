# acto
A signals library for functional reactive programming.
Author: [Tim Farland](https://github.com/twfarland)

- Inspired by [Elm](http://elm-lang.org) and [Bacon.js](https://baconjs.github.io).
- Written without the use of `this`, `new`, or `prototype` - only simple objects and functions.
- Miniscule size - ~2kb minified/gzipped.
- For modular use in node or browsers.
- Written in [Typescript](https://www.typescriptlang.org/).
- License: MIT.

## Install
```
	npm install --save acto
```
## Test
```
	npm test
```
## Importing
```typescript
	import { create, listen, send /* etc */ } from 'acto'	
```
## Api

### Signal interface

Signals are simple objects with the following interface:

```typescript
interface Signal<T> {
	listeners: Array<(T) => any>
	active:    boolean
	value:     T | null
	stop?:     Function
}
```

### Creating signals

#### fromDomEvent

Capture events on a dom node.

```typescript
// fromDomEvent (node: Node, eventName: string): Signal<Event>
const clicks = fromDomEvent(document.body, "click", evt => console.log(evt.target))
```

#### fromCallback

A signal that will emit one value, then terminate.

```typescript
// fromCallback<T> (f: Callback<T>): Signal<T>
const later = fromCallback(callback => setTimeout(() => callback("Finished"), 1000))
```

#### fromPromise

A signal that will emit one value or an error from a Promise, then terminate.

```typescript
// fromPromise (promise: Promise<any>): Signal<any>
const wait = fromPromise(new Promise(resolve => setTimeout(() => resolve("Finished"), 1000)))
```

#### fromAnimationFrames

```typescript
// fromAnimationFrames (): Signal<number>
const frames = fromAnimationFrames()
```
A signal that fires on every window.requestAnimationFrame. Useful in combination with `sampleOn`.

#### fromInterval

A signal that emits an integer count of millisecond intervals since it was started.

```typescript
// fromInterval (time: number): Signal<number>
const seconds = fromInterval(1000)
```

#### create

Low-level signal creation.

```typescript
// create<T> (initialValue?: T): Signal<T>
const rawSignal = create()
const rawSignalWithInitialValue = create(123)
```
### Interacting with signals

#### listen / unlisten

Subscribe / unsubscribe to values emitted by the signal.

```typescript
// listen<T> (s: Signal<T>, f: Listener<T>): Signal<T>
// unlisten<T> (s: Signal<T>, f: Listener<T>): Signal<T>
function logger (e) { console.log(e) }
listen(clicks, logger)
unlisten(clicks, logger)
```

#### send

Send a value to a signal.

```typescript
// send<T> (s: Signal<T>, v: T): Signal<T>
send(rawSignal, "value")
```

#### stop

Stop a signal - no more values will be emitted.

```typescript
// stop<T> (s: Signal<T>): Signal<T>
stop(rawSignal)
```

### Transforming signals

#### map

Map values of a signal

```typescript
// map<T> (f: Mapper<T>, signal: Signal<any>): Signal<T>
const values = map(evt => evt.target.value, fromDomEvent(input, "keydown"))
```

Map (zip) the latest value of multiple signals

```typescript
// map<T> (f: Mapper<T>, ...signals: Signal<any>[]): Signal<T>
const areas = map((x, y) => x * y, widthSignal, heightSignal)
```

#### filter

Filter a signal, will only emit event that pass the test

```typescript
// filter<T> (f: Filter<T>, s: Signal<T>): Signal<T>
const evens = filter(n => n % 2 === 0, numberSignal)
```

#### dropRepeats

Only emit if the current value is different to the previous (as compared by `===`). Not a full deduplication.

```typescript
// dropRepeats<T> (s: Signal<T>): Signal<T>
dropRepeats(numbers)
```

#### fold

Fold a signal over an initial seed value.

```typescript
// fold<T,U> (f: Folder<T,U>, seed: U, s: Signal<T>): Signal<U>
const sum = fold((a, b) => a + b, 0, numbersStream)
```

#### merge

Merge many signals into one that emits values from all.

```typescript
// merge (...signals: Signal<any>[]): Signal<any>
const events = merge(clicks, keypresses)
```

#### sampleOn

Take the last value of a signal when another signal emits.

```typescript
// sampleOn<T,U> (s: Signal<T>, s2: Signal<U>): Signal<T>
const mousePositionsBySeconds = sampleOn(mousePosition, fromInterval(1000))
```

#### slidingWindow

Emit an array of the last n values of a signal.

```typescript
// slidingWindow<T> (length: number, s: Signal<T>): Signal<T[]>
const trail = slidingWindow(5, mousePosition)
```

#### flatMap

Map values of a signal to a new signal, then flatten the results of all emitted into one signal.

```typescript
// flatMap<T,U> (lift: Lifter<T,U>, s: Signal<T>): Signal<U>
const responses = flatMap(evt => fromPromise(ajaxGet("/" + evt.target.value)), keyPresses)
```

#### flatMapLatest

The same as above, but only emits values from the latest child signal.

```typescript
// flatMap<T,U> (lift: Lifter<T,U>, s: Signal<T>): Signal<U>
flatMapLatest(v => fromPromise(promiseCreator(v)), valueSignal)
```

#### debounce

Debounce a signal by a millisecond interval.

```typescript
// debounce<T> (s: Signal<T>, quiet: number): Signal<T>
const debouncedClicks = debounce(mouseClicks, 1000)
```

### Error handling

To put a signal in an error state, send a native `Error` object to it, which will set it's value to the error, e.g: 

```typescript
const signal = create()
listen(signal, v => console.log(v))
send(signal, 1) // 1
send(signal, new Error("Disaster has struck")) // [Error: Disaster has struck]
```

So your listeners need to be handle the case that the the type of any signal value may also be an `Error`.

As errors are just values, they're propagated downstream by the same mechanism:

```typescript
const source = create()
const mapped = map(v => v > 1 ? new Error("I can't handle this") : v, source)
listen(mapped, v => console.log(v))
send(source, 1) // 1
send(source, 2) // [Error: I can't handle this]
```

Errors do not stop signals.

