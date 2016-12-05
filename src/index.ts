import { Promise } from 'es6-promise'

// -------------------- INTERFACES

export interface Signal<T> {
    listeners: Listener<T>[]
    active:    boolean
    value:     T | null
    stop?:     Function
}

export interface Callback<T> {
    (T): any
}

export interface Listener<T> {
    (T): any
}

export interface Mapper<T> {
    (...n: any[]): T
}

export interface Filter<T> {
    (T): boolean
}

export interface Folder<T,U> {
    (T,U): U
}

export interface Lifter<T,U> {
    (T): Signal<U>
}

// -------------------- CREATE

export function create<T> (initialValue?: T): Signal<T> {
    return {
        listeners:  [],
        active:     true,
        value:      initialValue
    }
}

export function fromCallback<T> (f: Callback<T>): Signal<T> {
    const s = <Signal<T>>create()
    f(v => {
        send(s, v)
        stop(s)
    })
    return s
}

export function fromPromise (promise: Promise<any>): Signal<any> {
    const s = create()
    promise
        .then(v => {
            send(s, v)
            stop(s)
        })
        .catch(error => {
            send(s, error instanceof Error ? error : new Error(error))
        })
    return s    
}

export function fromDomEvent (node: Node, eventName: string): Signal<Event> {
    const s = <Signal<Event>>create()
    function listener (evt) { send(s, evt) }
    s.stop = () => {
        node.removeEventListener(eventName, listener, false)
    }
    node.addEventListener(eventName, listener, false)
    return s
}

export function fromInterval (time: number): Signal<number> {
    var count = 0
    const s = create(count)
    const interval = setInterval(() => {
        count++
        send(s, count)
    }, time)
    s.stop = () => {
        clearInterval(interval)
    }
    return s
}

export function fromAnimationFrames (): Signal<number> {
    const s = create(0)
    function step (time) {
        send(s, time)
        window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
    return s
}

// -------------------- INTERACT

export function listen<T> (s: Signal<T>, f: Listener<T>): Signal<T> {
    if (s.active) s.listeners.push(f)
    return s
}

export function unlisten<T> (s: Signal<T>, f: Listener<T>): Signal<T> {
    s.listeners = s.listeners.filter(listener => listener !== f)
    return s
}

export function send<T> (s: Signal<T>, v: T): Signal<T> {
    if (s.active) {
        s.value = v
        s.listeners.forEach(f => { f(v) })
    }
    return s
}

export function stop<T> (s: Signal<T>): Signal<T> {
    s.listeners = []
    s.active = false
    if (s.stop) s.stop()
    return s
}

// -------------------- TRANSFORM

export function map<T> (f: Mapper<T>, ...signals: Signal<any>[]): Signal<T> {
    const s2 = <Signal<T>>create()
    signals.forEach(s3 => {
        listen(s3, () => {
            const values = signals.map(s => s.value)
            send(s2, f.apply(null, values))
        })
    })
    return s2
}

export function filter<T> (f: Filter<T>, s: Signal<T>): Signal<T> {
    const s2 = <Signal<T>>create()
    listen(s, v => {
        if (f(v)) send(s2, v)
    })
    return s2
}

export function dropRepeats<T> (s: Signal<T>): Signal<T> {
    const s2 = <Signal<T>>create()
    if (s.value) send(s2, s.value)
    listen(s, v => {
        if (v !== s2.value) send(s2, v)
    })
    return s2
}

export function fold<T,U> (f: Folder<T,U>, seed: U, s: Signal<T>): Signal<U>  {
    const s2 = create(seed)
    listen(s, function (v) {
        send(s2, seed = f(v, seed))
    })
    return s2
}

export function merge (...signals: Signal<any>[]): Signal<any> {
    const s2 = create()
    signals.forEach(s => {
        listen(s, v => {
            send(s2, v)
        })
    })
    return s2
}

export function sampleOn<T,U> (s: Signal<T>, s2: Signal<U>): Signal<T> {
    const s3 = <Signal<T>>create()
    if (s.value) send(s3, s.value)
    listen(s2, () => {
        send(s3, s.value)
    })
    return s3
}

export function slidingWindow<T> (length: number, s: Signal<T>): Signal<T[]> {
    const s2 = <Signal<T[]>>create()
    const frame = []
    listen(s, v => {
        if (frame.length > length - 1) frame.shift()
        frame.push(v)
        send(s2, frame.slice())
    })
    return s2
}

export function flatMap<T,U> (lift: Lifter<T,U>, s: Signal<T>): Signal<U> {
    const s2 = <Signal<U>>create()
    listen(s, v1 => { 
        listen(lift(v1), v2 => {
            send(s2, v2)
        })
    })
    return s2
}

export function flatMapLatest<T,U> (lift: Lifter<T,U>, s: Signal<T>): Signal<U> {
    const s2 = <Signal<U>>create()
    var s3
    listen(s, v1 => {
        if (s3) stop(s3)
        s3 = lift(v1)
        listen(s3, v2 => {
            send(s2, v2)
        })
    })
    return s2
}

export function debounce<T> (s: Signal<T>, quiet: number): Signal<T> {
    return <Signal<T>>flatMapLatest(v => {
        return fromCallback(cback => {
            setTimeout(() => {
                cback(v)
            }, quiet)
        })
    }, s)
}
