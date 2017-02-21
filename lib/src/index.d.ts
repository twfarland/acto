/// <reference types="es6-promise" />
export interface Signal<T> {
    listeners: Listener<T>[];
    active: boolean;
    value: T | null;
    stop?: Function;
}
export interface Callback<T> {
    (f: (value: T) => void): void;
}
export interface Listener<T> {
    (value: T): any;
}
export interface Mapper<T> {
    (...n: any[]): T;
}
export interface Filter<T> {
    (value: T): boolean;
}
export interface Folder<T, U> {
    (value: T, accumulated: U): U;
}
export interface Lifter<T, U> {
    (value: T): Signal<U>;
}
export declare function create<T>(initialValue?: T): Signal<T>;
export declare function fromCallback<T>(f: Callback<T>): Signal<T>;
export declare function fromPromise(promise: Promise<any>): Signal<any>;
export declare function fromDomEvent(node: Node, eventName: string): Signal<Event>;
export declare function fromInterval(time: number): Signal<number>;
export declare function fromAnimationFrames(): Signal<number>;
export declare function listen<T>(s: Signal<T>, f: Listener<T>): Signal<T>;
export declare function unlisten<T>(s: Signal<T>, f: Listener<T>): Signal<T>;
export declare function send<T>(s: Signal<T>, v: T): Signal<T>;
export declare function stop<T>(s: Signal<T>): Signal<T>;
export declare function map<T>(f: Mapper<T>, ...signals: Signal<any>[]): Signal<T>;
export declare function filter<T>(f: Filter<T>, s: Signal<T>): Signal<T>;
export declare function dropRepeats<T>(s: Signal<T>): Signal<T>;
export declare function fold<T, U>(f: Folder<T, U>, seed: U, s: Signal<T>): Signal<U>;
export declare function merge(...signals: Signal<any>[]): Signal<any>;
export declare function sampleOn<T, U>(s: Signal<T>, s2: Signal<U>): Signal<T>;
export declare function slidingWindow<T>(length: number, s: Signal<T>): Signal<T[]>;
export declare function flatMap<T, U>(lift: Lifter<T, U>, s: Signal<T>): Signal<U>;
export declare function flatMapLatest<T, U>(lift: Lifter<T, U>, s: Signal<T>): Signal<U>;
export declare function debounce<T>(s: Signal<T>, quiet: number): Signal<T>;
