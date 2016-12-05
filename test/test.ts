import {
    Signal,
    create,
    listen,
    unlisten,
    stop,
    send,
    map,
    filter,
    fold,
    dropRepeats,
    merge,
    sampleOn,
    slidingWindow,
    flatMap,
    flatMapLatest,
    fromPromise,
    fromCallback,
    fromDomEvent,
    fromInterval
}  from '../src/index'
import { ok, equal, deepEqual } from 'assert'
import { Promise } from 'es6-promise'
import { env } from 'jsdom'

function record (s) {
	const seen = []
	listen(s, v => { seen.push(v) })
	return seen
}

const nums = create(0)
const nums2 = create(0)
const dubs = map(n => n * 2, nums)
const zipped = map((x, y) => x * y, nums, nums2)
const evens = filter(n => n % 2 === 0, nums)
const sums  = fold((a, b) => a + b, 0, nums)
const dedup = dropRepeats(nums) 
const merged = merge(nums, nums2)
const sampled = sampleOn(nums, nums2)
const slide = slidingWindow(3, nums)

const seenNums = record(nums)
const seenDubs = record(dubs)
const seenZipped = record(zipped)
const seenEvens = record(evens)
const seenSums  = record(sums)
const seenDedups = record(dedup)
const seenMerged = record(merged)
const seenSampled = record(sampled)
const seenSliding = record(slide)


send(nums, 1)
send(nums, 1)
send(nums2, 10)
send(nums, 2)
send(nums, 2)
send(nums2, 10)
send(nums, 3)
send(nums, 3)
send(nums2, 10)

deepEqual(seenNums, [1,1,2,2,3,3])
deepEqual(seenDubs, [2,2,4,4,6,6])
deepEqual(seenZipped, [0,0,10,20,20,20,30,30,30])
deepEqual(seenEvens, [2,2])
deepEqual(seenSums, [1,2,4,6,9,12])
deepEqual(seenDedups, [1,2,3])
deepEqual(seenMerged, [1,1,10,2,2,10,3,3,10])
deepEqual(seenSampled, [1,2,3])
deepEqual(seenSliding, [[1], [1,1], [1,1,2], [1,2,2], [2,2,3], [2,3,3]])

const later = fromCallback(res => { 
					setTimeout(() => { 
						return res(1)
					}, 100)
				})

const promise = fromPromise(new Promise(res => {
					setTimeout(() => {
						return res(2)
					}, 100)
				}))

listen(later, (v) => {
	equal(v, 1)
})

listen(promise, (v) => {
	equal(v, 2)
})

env('<html><body></body></html>', (err, window) => {
    const domNode = window.document.createElement('div')
    const clicks = fromDomEvent(domNode, "keydown")
    var   clickCount = 0
    listen(clicks, function () {
        ok(true)
    })
    domNode.dispatchEvent(new window["KeyboardEvent"]("keydown"))
})

const ticks = fromInterval(1)
const tickList = []

listen(ticks, v => {
	tickList.push(v)
	if (v >= 3) {
		stop(ticks)
		deepEqual(tickList, [1,2,3])
	}
})

const ticks2 = fromInterval(10)
const flat = flatMap(c => {
				return fromCallback(res => {
					return setTimeout(() => {
						return res(c)
					}, 10)
				})
			}, ticks2)

listen(flat, v => {
	if (v > 3) {
		stop(ticks2)
		ok(true)
	}
})

const top = create()
const flat2 = flatMapLatest(c => {
					return fromCallback(res => {
						return setTimeout(() => {
							return res(c)
						}, 10)
					})
				}, top)

listen(flat2, v => {
	ok(v === 3)
}) 

send(top, 1)
send(top, 2)
send(top, 3)

// Todo: test debounce

// Error handling

var errSeen = 0
const signal = create()
const signal2 = map(v => v, signal)
listen(signal2, v => { 
	if (errSeen === 0) ok(v === 1)
	if (errSeen > 0) ok(v instanceof Error)
	errSeen++	
})

send(signal, 1)
send(signal, new Error("Disaster has struck")) 


var errSeen2 = 0
const source = create()
const mapped = map(v => {
	return v > 1 ? new Error("I can't handle this. My life is falling apart") : v
}, source)
listen(mapped, v => {
	if (errSeen2 === 0) ok(v === 1)
	if (errSeen2 > 0) ok(v instanceof Error)	
	errSeen2++	
})
send(source, 1) // 1
send(source, 2) // [Error: I can't handle this. My life is falling apart]
