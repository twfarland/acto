"use strict";
// -------------------- CREATE
function create(initialValue) {
    return {
        listeners: [],
        active: true,
        value: initialValue
    };
}
function fromCallback(f) {
    var s = create();
    f(function (v) {
        send(s, v);
        stop(s);
    });
    return s;
}
function fromPromise(promise) {
    var s = create();
    promise
        .then(function (v) {
        send(s, v);
        stop(s);
    })
        .catch(function (error) {
        send(s, error instanceof Error ? error : new Error(error));
    });
    return s;
}
function fromDomEvent(node, eventName) {
    var s = create();
    function listener(evt) { send(s, evt); }
    s.stop = function () {
        node.removeEventListener(eventName, listener, false);
    };
    node.addEventListener(eventName, listener, false);
    return s;
}
function fromInterval(time) {
    var count = 0;
    var s = create(count);
    var interval = setInterval(function () {
        count++;
        send(s, count);
    }, time);
    s.stop = function () {
        clearInterval(interval);
    };
    return s;
}
function fromAnimationFrames() {
    var s = create(0);
    function step(time) {
        send(s, time);
        window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
    return s;
}
// -------------------- INTERACT
function listen(s, f) {
    if (s.active)
        s.listeners.push(f);
    return s;
}
function unlisten(s, f) {
    s.listeners = s.listeners.filter(function (listener) { return listener !== f; });
    return s;
}
function send(s, v) {
    if (s.active) {
        s.value = v;
        s.listeners.forEach(function (f) { f(v); });
    }
    return s;
}
function stop(s) {
    s.listeners = [];
    s.active = false;
    if (s.stop)
        s.stop();
    return s;
}
// -------------------- TRANSFORM
function map(f) {
    var signals = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        signals[_i - 1] = arguments[_i];
    }
    var s2 = create();
    signals.forEach(function (s3) {
        listen(s3, function () {
            send(s2, f.apply(null, signals.map(function (s) { return s.value; })));
        });
    });
    return s2;
}
function filter(f, s) {
    var s2 = create();
    listen(s, function (v) {
        if (f(v))
            send(s2, v);
    });
    return s2;
}
function dropRepeats(s) {
    var s2 = create();
    if (s.value)
        send(s2, s.value);
    listen(s, function (v) {
        if (v !== s2.value)
            send(s2, v);
    });
    return s2;
}
function fold(f, seed, s) {
    var s2 = create(seed);
    listen(s, function (v) {
        send(s2, seed = f(v, seed));
    });
    return s2;
}
function merge() {
    var signals = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        signals[_i - 0] = arguments[_i];
    }
    var s2 = create();
    signals.forEach(function (s) {
        listen(s, function (v) {
            send(s2, v);
        });
    });
    return s2;
}
function sampleOn(s, s2) {
    var s3 = create();
    if (s.value)
        send(s3, s.value);
    listen(s2, function () {
        send(s3, s.value);
    });
    return s3;
}
function slidingWindow(length, s) {
    var s2 = create();
    var frame = [];
    listen(s, function (v) {
        if (frame.length > length - 1)
            frame.shift();
        frame.push(v);
        send(s2, frame.slice());
    });
    return s2;
}
function flatMap(lift, s) {
    var s2 = create();
    listen(s, function (v1) {
        listen(lift(v1), function (v2) {
            send(s2, v2);
        });
    });
    return s2;
}
function flatMapLatest(lift, s) {
    var s2 = create();
    var s3;
    listen(s, function (v1) {
        if (s3)
            stop(s3);
        s3 = lift(v1);
        listen(s3, function (v2) {
            send(s2, v2);
        });
    });
    return s2;
}
function debounce(s, quiet) {
    return flatMapLatest(function (v) {
        return fromCallback(function (cback) {
            setTimeout(function () {
                cback(v);
            }, quiet);
        });
    }, s);
}
exports.__esModule = true;
exports["default"] = {
    create: create,
    fromCallback: fromCallback,
    fromPromise: fromPromise,
    fromDomEvent: fromDomEvent,
    fromInterval: fromInterval,
    fromAnimationFrames: fromAnimationFrames,
    listen: listen,
    unlisten: unlisten,
    send: send,
    stop: stop,
    map: map,
    filter: filter,
    dropRepeats: dropRepeats,
    fold: fold,
    merge: merge,
    sampleOn: sampleOn,
    slidingWindow: slidingWindow,
    flatMap: flatMap,
    flatMapLatest: flatMapLatest,
    debounce: debounce
};
