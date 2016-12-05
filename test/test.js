"use strict";
var index_1 = require('../src/index');
var assert_1 = require('assert');
var es6_promise_1 = require('es6-promise');
var jsdom_1 = require('jsdom');
function record(s) {
    var seen = [];
    index_1.listen(s, function (v) { seen.push(v); });
    return seen;
}
var nums = index_1.create(0);
var nums2 = index_1.create(0);
var dubs = index_1.map(function (n) { return n * 2; }, nums);
var zipped = index_1.map(function (x, y) { return x * y; }, nums, nums2);
var evens = index_1.filter(function (n) { return n % 2 === 0; }, nums);
var sums = index_1.fold(function (a, b) { return a + b; }, 0, nums);
var dedup = index_1.dropRepeats(nums);
var merged = index_1.merge(nums, nums2);
var sampled = index_1.sampleOn(nums, nums2);
var slide = index_1.slidingWindow(3, nums);
var seenNums = record(nums);
var seenDubs = record(dubs);
var seenZipped = record(zipped);
var seenEvens = record(evens);
var seenSums = record(sums);
var seenDedups = record(dedup);
var seenMerged = record(merged);
var seenSampled = record(sampled);
var seenSliding = record(slide);
index_1.send(nums, 1);
index_1.send(nums, 1);
index_1.send(nums2, 10);
index_1.send(nums, 2);
index_1.send(nums, 2);
index_1.send(nums2, 10);
index_1.send(nums, 3);
index_1.send(nums, 3);
index_1.send(nums2, 10);
assert_1.deepEqual(seenNums, [1, 1, 2, 2, 3, 3]);
assert_1.deepEqual(seenDubs, [2, 2, 4, 4, 6, 6]);
assert_1.deepEqual(seenZipped, [0, 0, 10, 20, 20, 20, 30, 30, 30]);
assert_1.deepEqual(seenEvens, [2, 2]);
assert_1.deepEqual(seenSums, [1, 2, 4, 6, 9, 12]);
assert_1.deepEqual(seenDedups, [0, 1, 2, 3]);
assert_1.deepEqual(seenMerged, [1, 1, 10, 2, 2, 10, 3, 3, 10]);
assert_1.deepEqual(seenSampled, [0, 1, 2, 3]);
assert_1.deepEqual(seenSliding, [[1], [1, 1], [1, 1, 2], [1, 2, 2], [2, 2, 3], [2, 3, 3]]);
var later = index_1.fromCallback(function (res) {
    setTimeout(function () {
        return res(1);
    }, 100);
});
var promise = index_1.fromPromise(new es6_promise_1.Promise(function (res) {
    setTimeout(function () {
        return res(2);
    }, 100);
}));
var ticks = index_1.fromInterval(1);
index_1.listen(later, function (v) {
    assert_1.equal(v, 1);
});
index_1.listen(promise, function (v) {
    assert_1.equal(v, 2);
});
var tickList = [];
index_1.listen(ticks, function (v) {
    tickList.push(v);
    if (v >= 3) {
        index_1.stop(ticks);
        assert_1.deepEqual(tickList, [0, 1, 2, 3]);
    }
});
jsdom_1.env('<html><body></body></html>', function (err, window) {
    var domNode = window.document.createElement('div');
    var clicks = index_1.fromDomEvent(domNode, "keydown");
    var clickCount = 0;
    var clickString = index_1.fold(function (a, b) { return b + a.target.value; }, "", clicks);
    index_1.listen(clickString, function (str) {
        clickCount++;
        if (clickCount === 3) {
            index_1.stop(clicks);
            assert_1.deepEqual(str, "abc");
        }
    });
    domNode.dispatchEvent(new window["KeyboardEvent"]("keydown", { key: "a" })); //a
    domNode.dispatchEvent(new window["KeyboardEvent"]("keydown", { key: "b" })); //b
    domNode.dispatchEvent(new window["KeyboardEvent"]("keydown", { key: "c" })); //c
});
var ticks2 = index_1.fromInterval(10);
var flat = index_1.flatMap(function (c) {
    return index_1.fromCallback(function (res) {
        return setTimeout(function () {
            return res(c);
        }, 10);
    });
}, ticks2);
index_1.listen(flat, function (v) {
    if (v > 3) {
        index_1.stop(ticks2);
        assert_1.ok(true);
    }
});
var top = index_1.create();
var flat2 = index_1.flatMapLatest(function (c) {
    return index_1.fromCallback(function (res) {
        return setTimeout(function () {
            return res(c);
        }, 10);
    });
}, top);
index_1.listen(flat2, function (v) {
    assert_1.ok(v === 3);
});
index_1.send(top, 1);
index_1.send(top, 2);
index_1.send(top, 3);
// Todo: test debounce
// Error handling
var errSeen = 0;
var signal = index_1.create();
var signal2 = index_1.map(function (v) { return v; }, signal);
index_1.listen(signal2, function (v) {
    if (errSeen === 0)
        assert_1.ok(v === 1);
    if (errSeen > 0)
        assert_1.ok(v instanceof Error);
    errSeen++;
});
index_1.send(signal, 1);
index_1.send(signal, new Error("Disaster has struck"));
var errSeen2 = 0;
var source = index_1.create();
var mapped = index_1.map(function (v) {
    return v > 1 ? new Error("I can't handle this. My life is falling apart") : v;
}, source);
index_1.listen(mapped, function (v) {
    if (errSeen2 === 0)
        assert_1.ok(v === 1);
    if (errSeen2 > 0)
        assert_1.ok(v instanceof Error);
    errSeen2++;
});
index_1.send(source, 1); // 1
index_1.send(source, 2); // [Error: I can't handle this. My life is falling apart]
