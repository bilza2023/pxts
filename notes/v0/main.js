!(function () {
    "use strict";
    var t,
        e = {
            359: function (t, e, n) {
                var r = n(311);
                function o(t, e, n, r, o, i, c) {
                    try {
                        var u = t[i](c),
                            a = u.value;
                    } catch (t) {
                        return void n(t);
                    }
                    u.done ? e(a) : Promise.resolve(a).then(r, o);
                }
                function i(t) {
                    return function () {
                        var e = this,
                            n = arguments;
                        return new Promise(function (r, i) {
                            var c = t.apply(e, n);
                            function u(t) {
                                o(c, r, i, u, a, "next", t);
                            }
                            function a(t) {
                                o(c, r, i, u, a, "throw", t);
                            }
                            u(void 0);
                        });
                    };
                }
                function c(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                var u = function (t, e) {
                        var n,
                            r,
                            o,
                            i,
                            c = {
                                label: 0,
                                sent: function () {
                                    if (1 & o[0]) throw o[1];
                                    return o[1];
                                },
                                trys: [],
                                ops: [],
                            };
                        return (
                            (i = { next: u(0), throw: u(1), return: u(2) }),
                            "function" == typeof Symbol &&
                                (i[Symbol.iterator] = function () {
                                    return this;
                                }),
                            i
                        );
                        function u(i) {
                            return function (u) {
                                return (function (i) {
                                    if (n) throw new TypeError("Generator is already executing.");
                                    for (; c; )
                                        try {
                                            if (
                                                ((n = 1),
                                                r &&
                                                    (o =
                                                        2 & i[0]
                                                            ? r.return
                                                            : i[0]
                                                            ? r.throw || ((o = r.return) && o.call(r), 0)
                                                            : r.next) &&
                                                    !(o = o.call(r, i[1])).done)
                                            )
                                                return o;
                                            switch (((r = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                                                case 0:
                                                case 1:
                                                    o = i;
                                                    break;
                                                case 4:
                                                    return c.label++, { value: i[1], done: !1 };
                                                case 5:
                                                    c.label++, (r = i[1]), (i = [0]);
                                                    continue;
                                                case 7:
                                                    (i = c.ops.pop()), c.trys.pop();
                                                    continue;
                                                default:
                                                    if (
                                                        !(
                                                            (o = (o = c.trys).length > 0 && o[o.length - 1]) ||
                                                            (6 !== i[0] && 2 !== i[0])
                                                        )
                                                    ) {
                                                        c = 0;
                                                        continue;
                                                    }
                                                    if (3 === i[0] && (!o || (i[1] > o[0] && i[1] < o[3]))) {
                                                        c.label = i[1];
                                                        break;
                                                    }
                                                    if (6 === i[0] && c.label < o[1]) {
                                                        (c.label = o[1]), (o = i);
                                                        break;
                                                    }
                                                    if (o && c.label < o[2]) {
                                                        (c.label = o[2]), c.ops.push(i);
                                                        break;
                                                    }
                                                    o[2] && c.ops.pop(), c.trys.pop();
                                                    continue;
                                            }
                                            i = e.call(t, c);
                                        } catch (t) {
                                            (i = [6, t]), (r = 0);
                                        } finally {
                                            n = o = 0;
                                        }
                                    if (5 & i[0]) throw i[1];
                                    return { value: i[0] ? i[1] : void 0, done: !0 };
                                })([i, u]);
                            };
                        }
                    },
                    a = (function () {
                        function t() {
                            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 600,
                                n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 300,
                                o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 13882323;
                            c(this, t),
                                r.P6Y.skipHello(),
                                (this.app = new r.MxU({ width: e, height: n, antialias: !0 })),
                                (this.app.stage.interactive = !0),
                                (this.app.renderer.backgroundColor = o),
                                document.body.appendChild(this.app.view);
                            var a = this;
                            window.onload = i(function () {
                                return u(this, function (t) {
                                    return f(a.app), [2];
                                });
                            });
                        }
                        var e = t.prototype;
                        return (
                            (e.add = function (t) {
                                this.app.stage.addChild(t);
                            }),
                            (e.drawRect = function (t, e, n, o, i) {
                                var c = new r.TCu();
                                return c.beginFill(i), c.drawRect(t, e, n, o), c.endFill(), c;
                            }),
                            t
                        );
                    })();
                function f(t) {
                    var e = function () {
                        t.renderer.resize(t.renderer.width, t.renderer.height);
                    };
                    window.addEventListener("resize", e), e();
                }
                var s = (function () {
                    function t() {
                        !(function (t, e) {
                            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                        })(this, t),
                            (this.pvtOffsetX = 0),
                            (this.pvtOffsetY = 0);
                    }
                    var e = t.prototype;
                    return (
                        (e.pivot = function () {
                            var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null,
                                e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                            null !== t && (this.pvtOffsetX = t), null !== e && (this.pvtOffsetY = e);
                        }),
                        (e.getPivotX = function (t) {
                            var e = 0;
                            switch (this.pvtOffsetX) {
                                case 0:
                                    e = 0;
                                    break;
                                case 1:
                                    e = t / 2;
                                    break;
                                case 2:
                                    e = t;
                            }
                            return e;
                        }),
                        (e.getPivotY = function (t) {
                            var e = 0;
                            switch (this.pvtOffsetY) {
                                case 0:
                                    e = 0;
                                    break;
                                case 1:
                                    e = t / 2;
                                    break;
                                case 2:
                                    e = t;
                            }
                            return e;
                        }),
                        t
                    );
                })();
                function l(t) {
                    return (
                        (l = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        l(t)
                    );
                }
                function h(t, e) {
                    return !e || ("object" !== d(e) && "function" != typeof e)
                        ? (function (t) {
                              if (void 0 === t)
                                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                              return t;
                          })(t)
                        : e;
                }
                function p(t, e) {
                    return (
                        (p =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        p(t, e)
                    );
                }
                var d = function (t) {
                    return t && "undefined" != typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t;
                };
                var y = (function (t) {
                    !(function (t, e) {
                        if ("function" != typeof e && null !== e)
                            throw new TypeError("Super expression must either be null or a function");
                        (t.prototype = Object.create(e && e.prototype, {
                            constructor: { value: t, writable: !0, configurable: !0 },
                        })),
                            e && p(t, e);
                    })(i, t);
                    var e,
                        n,
                        o =
                            ((e = i),
                            (n = (function () {
                                if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                                if (Reflect.construct.sham) return !1;
                                if ("function" == typeof Proxy) return !0;
                                try {
                                    return (
                                        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})),
                                        !0
                                    );
                                } catch (t) {
                                    return !1;
                                }
                            })()),
                            function () {
                                var t,
                                    r = l(e);
                                if (n) {
                                    var o = l(this).constructor;
                                    t = Reflect.construct(r, arguments, o);
                                } else t = r.apply(this, arguments);
                                return h(this, t);
                            });
                    function i(t, e, n, c, u) {
                        var a;
                        return (
                            (function (t, e) {
                                if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                            })(this, i),
                            ((a = o.call(this)).id = Math.random().toString(36).slice(2)),
                            (a.x = t),
                            (a.y = e),
                            (a.width = n),
                            (a.height = c),
                            (a.color = u),
                            (a.angle = 0),
                            (a.opacity = 100),
                            (a.graphics = new r.TCu()),
                            a
                        );
                    }
                    var c = i.prototype;
                    return (
                        (c.getDrawable = function () {
                            return this.graphics;
                        }),
                        (c.update = function () {
                            (this.graphics.width = this.width),
                                (this.graphics.height = this.height),
                                (this.graphics.angle = this.angle),
                                (this.graphics.alpha = this.opacity / 100),
                                (this.graphics.tint = this.color),
                                (this.graphics.pivot.x = this.getPivotX(this.width)),
                                (this.graphics.pivot.y = this.getPivotY(this.height)),
                                (this.graphics.x = this.x + this.getPivotX(this.width)),
                                (this.graphics.y = this.y + this.getPivotY(this.height));
                        }),
                        (c.init = function () {}),
                        i
                    );
                })(s);
                function v(t) {
                    return (
                        (v = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        v(t)
                    );
                }
                function b(t, e) {
                    return !e || ("object" !== w(e) && "function" != typeof e)
                        ? (function (t) {
                              if (void 0 === t)
                                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                              return t;
                          })(t)
                        : e;
                }
                function g(t, e) {
                    return (
                        (g =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        g(t, e)
                    );
                }
                var w = function (t) {
                    return t && "undefined" != typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t;
                };
                var O = (function (t) {
                    !(function (t, e) {
                        if ("function" != typeof e && null !== e)
                            throw new TypeError("Super expression must either be null or a function");
                        (t.prototype = Object.create(e && e.prototype, {
                            constructor: { value: t, writable: !0, configurable: !0 },
                        })),
                            e && g(t, e);
                    })(o, t);
                    var e,
                        n,
                        r =
                            ((e = o),
                            (n = (function () {
                                if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                                if (Reflect.construct.sham) return !1;
                                if ("function" == typeof Proxy) return !0;
                                try {
                                    return (
                                        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})),
                                        !0
                                    );
                                } catch (t) {
                                    return !1;
                                }
                            })()),
                            function () {
                                var t,
                                    r = v(e);
                                if (n) {
                                    var o = v(this).constructor;
                                    t = Reflect.construct(r, arguments, o);
                                } else t = r.apply(this, arguments);
                                return b(this, t);
                            });
                    function o(t, e, n, i, c) {
                        return (
                            (function (t, e) {
                                if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                            })(this, o),
                            r.call(this, t, e, n, i, c)
                        );
                    }
                    return (
                        (o.prototype.init = function () {
                            this.graphics.beginFill(16777215),
                                this.graphics.drawRect(0, 0, this.width, this.height),
                                this.graphics.endFill();
                        }),
                        o
                    );
                })(y);
                function m(t) {
                    return (
                        (m = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        m(t)
                    );
                }
                function _(t, e) {
                    return !e || ("object" !== j(e) && "function" != typeof e)
                        ? (function (t) {
                              if (void 0 === t)
                                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                              return t;
                          })(t)
                        : e;
                }
                function P(t, e) {
                    return (
                        (P =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        P(t, e)
                    );
                }
                var j = function (t) {
                    return t && "undefined" != typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t;
                };
                var R = (function (t) {
                    !(function (t, e) {
                        if ("function" != typeof e && null !== e)
                            throw new TypeError("Super expression must either be null or a function");
                        (t.prototype = Object.create(e && e.prototype, {
                            constructor: { value: t, writable: !0, configurable: !0 },
                        })),
                            e && P(t, e);
                    })(o, t);
                    var e,
                        n,
                        r =
                            ((e = o),
                            (n = (function () {
                                if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                                if (Reflect.construct.sham) return !1;
                                if ("function" == typeof Proxy) return !0;
                                try {
                                    return (
                                        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})),
                                        !0
                                    );
                                } catch (t) {
                                    return !1;
                                }
                            })()),
                            function () {
                                var t,
                                    r = m(e);
                                if (n) {
                                    var o = m(this).constructor;
                                    t = Reflect.construct(r, arguments, o);
                                } else t = r.apply(this, arguments);
                                return _(this, t);
                            });
                    function o(t, e, n, i, c) {
                        return (
                            (function (t, e) {
                                if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                            })(this, o),
                            r.call(this, t, e, n, i, c)
                        );
                    }
                    return (
                        (o.prototype.init = function () {
                            this.graphics.beginFill(16777215),
                                this.graphics.drawEllipse(0, 0, this.width, this.height),
                                this.graphics.endFill();
                        }),
                        o
                    );
                })(y);
                function x(t, e) {
                    if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function");
                }
                function S(t) {
                    return (
                        (S = Object.setPrototypeOf
                            ? Object.getPrototypeOf
                            : function (t) {
                                  return t.__proto__ || Object.getPrototypeOf(t);
                              }),
                        S(t)
                    );
                }
                function E(t, e) {
                    return !e || ("object" !== k(e) && "function" != typeof e)
                        ? (function (t) {
                              if (void 0 === t)
                                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                              return t;
                          })(t)
                        : e;
                }
                function T(t, e) {
                    return (
                        (T =
                            Object.setPrototypeOf ||
                            function (t, e) {
                                return (t.__proto__ = e), t;
                            }),
                        T(t, e)
                    );
                }
                var k = function (t) {
                    return t && "undefined" != typeof Symbol && t.constructor === Symbol ? "symbol" : typeof t;
                };
                var C = (function (t) {
                        !(function (t, e) {
                            if ("function" != typeof e && null !== e)
                                throw new TypeError("Super expression must either be null or a function");
                            (t.prototype = Object.create(e && e.prototype, {
                                constructor: { value: t, writable: !0, configurable: !0 },
                            })),
                                e && T(t, e);
                        })(o, t);
                        var e,
                            n,
                            r =
                                ((e = o),
                                (n = (function () {
                                    if ("undefined" == typeof Reflect || !Reflect.construct) return !1;
                                    if (Reflect.construct.sham) return !1;
                                    if ("function" == typeof Proxy) return !0;
                                    try {
                                        return (
                                            Boolean.prototype.valueOf.call(
                                                Reflect.construct(Boolean, [], function () {}),
                                            ),
                                            !0
                                        );
                                    } catch (t) {
                                        return !1;
                                    }
                                })()),
                                function () {
                                    var t,
                                        r = S(e);
                                    if (n) {
                                        var o = S(this).constructor;
                                        t = Reflect.construct(r, arguments, o);
                                    } else t = r.apply(this, arguments);
                                    return E(this, t);
                                });
                        function o(t, e, n, i, c) {
                            var u,
                                a = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : 10;
                            return x(this, o), ((u = r.call(this, t, e, n, i, c)).radius = a), u;
                        }
                        return (
                            (o.prototype.init = function () {
                                this.graphics.beginFill(16777215),
                                    this.graphics.drawRoundedRect(0, 0, this.width, this.height, this.radius),
                                    this.graphics.endFill();
                            }),
                            o
                        );
                    })(y),
                    F = n(376),
                    B = new a(800, 300, 11906924),
                    X = new O(400, 0, 1, 300, 65535);
                X.init(), X.update(), B.add(X.getDrawable());
                var Y = new O(0, 150, 800, 2, 65535);
                Y.init(), Y.update(), B.add(Y.getDrawable());
                var D = new O(400, 150, 100, 100, 65280);
                B.add(D.getDrawable()), D.init(), D.pivot(1, 1), D.update();
                var M = new R(0, 0, 50, 50, 65535);
                M.init(), B.add(M.getDrawable()), (M.x = 100), (M.y = 100), M.update();
                var z = new C(500, 20, 100, 50, 16711680, 10);
                z.init(),
                    B.add(z.getDrawable()),
                    (z.color = 255),
                    z.update(),
                    setInterval(function () {
                        D.update(), M.update(), z.update();
                    }, 20);
                var G = new F.XS(),
                    H = G.addFolder("Scale");
                H.add(M, "width", 1, 500).name("width"), H.add(M, "height", 1, 500).name("height"), H.open();
                var I = G.addFolder("Transition");
                I.add(M, "x", 0, 800).name("x"),
                    I.add(M, "y", 0, 300).name("y"),
                    G.add(M, "angle", 0, 360).name("rotate"),
                    G.addColor(M, "color")
                        .name("color")
                        .onChange(function () {
                            console.log("dat.gui..color changed");
                        });
            },
        },
        n = {};
    function r(t) {
        var o = n[t];
        if (void 0 !== o) return o.exports;
        var i = (n[t] = { id: t, loaded: !1, exports: {} });
        return e[t].call(i.exports, i, i.exports, r), (i.loaded = !0), i.exports;
    }
    (r.m = e),
        (t = []),
        (r.O = function (e, n, o, i) {
            if (!n) {
                var c = 1 / 0;
                for (s = 0; s < t.length; s++) {
                    (n = t[s][0]), (o = t[s][1]), (i = t[s][2]);
                    for (var u = !0, a = 0; a < n.length; a++)
                        (!1 & i || c >= i) &&
                        Object.keys(r.O).every(function (t) {
                            return r.O[t](n[a]);
                        })
                            ? n.splice(a--, 1)
                            : ((u = !1), i < c && (c = i));
                    if (u) {
                        t.splice(s--, 1);
                        var f = o();
                        void 0 !== f && (e = f);
                    }
                }
                return e;
            }
            i = i || 0;
            for (var s = t.length; s > 0 && t[s - 1][2] > i; s--) t[s] = t[s - 1];
            t[s] = [n, o, i];
        }),
        (r.d = function (t, e) {
            for (var n in e) r.o(e, n) && !r.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: e[n] });
        }),
        (r.g = (function () {
            if ("object" == typeof globalThis) return globalThis;
            try {
                return this || new Function("return this")();
            } catch (t) {
                if ("object" == typeof window) return window;
            }
        })()),
        (r.o = function (t, e) {
            return Object.prototype.hasOwnProperty.call(t, e);
        }),
        (r.r = function (t) {
            "undefined" != typeof Symbol &&
                Symbol.toStringTag &&
                Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
                Object.defineProperty(t, "__esModule", { value: !0 });
        }),
        (r.nmd = function (t) {
            return (t.paths = []), t.children || (t.children = []), t;
        }),
        (function () {
            var t = { 179: 0 };
            r.O.j = function (e) {
                return 0 === t[e];
            };
            var e = function (e, n) {
                    var o,
                        i,
                        c = n[0],
                        u = n[1],
                        a = n[2],
                        f = 0;
                    if (
                        c.some(function (e) {
                            return 0 !== t[e];
                        })
                    ) {
                        for (o in u) r.o(u, o) && (r.m[o] = u[o]);
                        if (a) var s = a(r);
                    }
                    for (e && e(n); f < c.length; f++) (i = c[f]), r.o(t, i) && t[i] && t[i][0](), (t[i] = 0);
                    return r.O(s);
                },
                n = (self.webpackChunkpxts = self.webpackChunkpxts || []);
            n.forEach(e.bind(null, 0)), (n.push = e.bind(null, n.push.bind(n)));
        })();
    var o = r.O(void 0, [845], function () {
        return r(359);
    });
    o = r.O(o);
})();
