import { 
	create, fromCallback, fromPromise, fromDomEvent, fromInterval,
	listen, send, stop,
	map, filter, fold, dropRepeats, merge, sampleOn, slidingWindow, flatMap, flatMapLatest
} from '../src/main.js'

import assert from 'assert'
import Promise from 'promise'

function record(s) {
	const seen = []
	listen(s, v => 
		seen.push(v))
	return seen
}

const mockDomNode = {
	listeners: {},
	addEventListener(name, f) {
		if (!this.listeners[name]) {
			this.listeners[name] = [f]
		} else {
			this.listeners[name].push(f)
		}
	},
	removeEventListener(name, f) {
		if (!this.listeners[name]) {
			this.listeners[name] = this.listeners[name].filter(f2 => f2 !== f)
		}
	},
	dispatchEvent(name, v) {
		if (this.listeners[name]) {
			this.listeners[name].forEach(f => f(v))
		}
	}
}

const nums = create()
const nums2 = create()
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

assert.deepEqual(seenNums, [1,1,2,2,3,3])
assert.deepEqual(seenDubs, [2,2,4,4,6,6])
assert.deepEqual(seenZipped, [0,0,10,20,20,20,30,30,30])
assert.deepEqual(seenEvens, [2,2])
assert.deepEqual(seenSums, [1,2,4,6,9,12])
assert.deepEqual(seenDedups, [1,2,3])
assert.deepEqual(seenMerged, [1,1,10,2,2,10,3,3,10])
assert.deepEqual(seenSampled, [1,2,3])
assert.deepEqual(seenSliding, [[1], [1,1], [1,1,2], [1,2,2], [2,2,3], [2,3,3]])

const later = fromCallback(res => setTimeout(() => res(1), 100))
const promise = fromPromise(new Promise(res => setTimeout(() => res(2), 100)))
const ticks = fromInterval(1)
const clicks = fromDomEvent(mockDomNode, "keydown")

listen(later, v => {
	assert.equal(v, 1)
})

listen(promise, v => {
	assert.equal(v, 2)
})

var tickList = []

listen(ticks, v => {
	tickList.push(v)
	if (v >= 3) {
		stop(ticks)
		assert.deepEqual(tickList, [0,1,2,3])
	}
})

var clickCount = 0
const clickString = fold((a, b) => b + a.target.value, "", clicks)

listen(clickString, str => {
	clickCount++
	if (clickCount === 3) {
		stop(clicks)
		assert.deepEqual(str, "abc")
	}
})

mockDomNode.dispatchEvent("keydown", { target: { value: "a" } })
mockDomNode.dispatchEvent("keydown", { target: { value: "b" } })
mockDomNode.dispatchEvent("keydown", { target: { value: "c" } })

const ticks2 = fromInterval(10)
const flat = flatMap(c => fromCallback(res => setTimeout(() => res(c), 10)), ticks2)

listen(flat, v => {
	if (v > 3) {
		stop(ticks2)
		assert.ok(true)
	}
})

const top = create()
const flat2 = flatMapLatest(c => fromCallback(res => setTimeout(() => res(c), 10)), top)

listen(flat2, v => assert.ok(v === 3)) 

send(top, 1)
send(top, 2)
send(top, 3)

