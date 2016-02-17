var S = require("../src/main") 

var assert = require('assert')
var Promise = require('promise')

function record (s) {
	var seen = []
	S.listen(s, function (v) { seen.push(v) })
	return seen
}

var mockDomNode = {
	listeners: {},
	addEventListener: function (name, f) {
		if (!this.listeners[name]) {
			this.listeners[name] = [f]
		} else {
			this.listeners[name].push(f)
		}
	},
	removeEventListener: function (name, f) {
		if (!this.listeners[name]) {
			this.listeners[name] = this.listeners[name].filter(function (f2) { return f2 !== f  })
		}
	},
	dispatchEvent: function (name, v) {
		if (this.listeners[name]) {
			this.listeners[name].forEach(function (f) { f(v) })
		}
	}
}

var nums = S.create()
var nums2 = S.create()
var dubs = S.map(function (n) { return n * 2 }, nums)
var zipped = S.map(function (x, y) { return x * y }, nums, nums2)
var evens = S.filter(function (n) { return n % 2 === 0 }, nums)
var sums  = S.fold(function (a, b) { return a + b }, 0, nums)
var dedup = S.dropRepeats(nums) 
var merged = S.merge(nums, nums2)
var sampled = S.sampleOn(nums, nums2)
var slide = S.slidingWindow(3, nums)

var seenNums = record(nums)
var seenDubs = record(dubs)
var seenZipped = record(zipped)
var seenEvens = record(evens)
var seenSums  = record(sums)
var seenDedups = record(dedup)
var seenMerged = record(merged)
var seenSampled = record(sampled)
var seenSliding = record(slide)

S.send(nums, 1)
S.send(nums, 1)
S.send(nums2, 10)
S.send(nums, 2)
S.send(nums, 2)
S.send(nums2, 10)
S.send(nums, 3)
S.send(nums, 3)
S.send(nums2, 10)

assert.deepEqual(seenNums, [1,1,2,2,3,3])
assert.deepEqual(seenDubs, [2,2,4,4,6,6])
assert.deepEqual(seenZipped, [0,0,10,20,20,20,30,30,30])
assert.deepEqual(seenEvens, [2,2])
assert.deepEqual(seenSums, [1,2,4,6,9,12])
assert.deepEqual(seenDedups, [1,2,3])
assert.deepEqual(seenMerged, [1,1,10,2,2,10,3,3,10])
assert.deepEqual(seenSampled, [1,2,3])
assert.deepEqual(seenSliding, [[1], [1,1], [1,1,2], [1,2,2], [2,2,3], [2,3,3]])

var later = S.fromCallback(function (res) { 
					setTimeout(function () { 
						return res(1)
					}, 100)
				})

var promise = S.fromPromise(new Promise(function (res) {
					setTimeout(function () {
						return res(2)
					}, 100)
				}))

var ticks = S.fromInterval(1)
var clicks = S.fromDomEvent(mockDomNode, "keydown")

S.listen(later, function (v) {
	assert.equal(v, 1)
})

S.listen(promise, function (v) {
	assert.equal(v, 2)
})

var tickList = []

S.listen(ticks, function (v) {
	tickList.push(v)
	if (v >= 3) {
		S.stop(ticks)
		assert.deepEqual(tickList, [0,1,2,3])
	}
})

var clickCount = 0
var clickString = S.fold(function (a, b) { return b + a.target.value }, "", clicks)

S.listen(clickString, function (str) {
	clickCount++
	if (clickCount === 3) {
		S.stop(clicks)
		assert.deepEqual(str, "abc")
	}
})

mockDomNode.dispatchEvent("keydown", { target: { value: "a" } })
mockDomNode.dispatchEvent("keydown", { target: { value: "b" } })
mockDomNode.dispatchEvent("keydown", { target: { value: "c" } })

var ticks2 = S.fromInterval(10)
var flat = S.flatMap(function (c) {
				return S.fromCallback(function (res) {
					return setTimeout(function () {
						return res(c)
					}, 10)
				})
			}, ticks2)

S.listen(flat, function (v) {
	if (v > 3) {
		S.stop(ticks2)
		assert.ok(true)
	}
})

var top = S.create()
var flat2 = S.flatMapLatest(function (c) {
					return S.fromCallback(function (res) {
						return setTimeout(function () {
							return res(c)
						}, 10)
					})
				}, top)

S.listen(flat2, function (v) {
	assert.ok(v === 3)
}) 

S.send(top, 1)
S.send(top, 2)
S.send(top, 3)

// Todo: test debounce

// Error handling

var errSeen = 0
var signal = S.create()
var signal2 = S.map(function (v) { 
	return v 
}, signal)
S.listen(signal2, function (v) { 
	if (errSeen === 0) assert.ok(v === 1)
	if (errSeen > 0) assert.ok(v instanceof Error)
	errSeen++	
})

S.send(signal, 1)
S.send(signal, new Error("Disaster has struck")) 
S.send(signal, 1)


var errSeen2 = 0
var source = S.create()
var mapped = S.map(function (v) {
	return v > 1 ? new Error("I can't handle this. My life is falling apart") : v
}, source)
S.listen(mapped, function (v) {
	if (errSeen2 === 0) assert.ok(v === 1)
	if (errSeen2 > 0) assert.ok(v instanceof Error)	
	errSeen2++	
})
S.send(source, 1) // 1
S.send(source, 2) // [Error: I can't handle this. My life is falling apart]
