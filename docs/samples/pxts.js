var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function finallyConstructor(callback) {
  var constructor = this.constructor;
  return this.then(
    function(value) {
      return constructor.resolve(callback()).then(function() {
        return value;
      });
    },
    function(reason) {
      return constructor.resolve(callback()).then(function() {
        return constructor.reject(reason);
      });
    }
  );
}
function allSettled(arr) {
  var P = this;
  return new P(function(resolve2, reject2) {
    if (!(arr && typeof arr.length !== "undefined")) {
      return reject2(
        new TypeError(
          typeof arr + " " + arr + " is not iterable(cannot read property Symbol(Symbol.iterator))"
        )
      );
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0)
      return resolve2([]);
    var remaining = args.length;
    function res(i2, val) {
      if (val && (typeof val === "object" || typeof val === "function")) {
        var then = val.then;
        if (typeof then === "function") {
          then.call(
            val,
            function(val2) {
              res(i2, val2);
            },
            function(e) {
              args[i2] = { status: "rejected", reason: e };
              if (--remaining === 0) {
                resolve2(args);
              }
            }
          );
          return;
        }
      }
      args[i2] = { status: "fulfilled", value: val };
      if (--remaining === 0) {
        resolve2(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
}
var setTimeoutFunc = setTimeout;
function isArray(x) {
  return Boolean(x && typeof x.length !== "undefined");
}
function noop() {
}
function bind(fn, thisArg) {
  return function() {
    fn.apply(thisArg, arguments);
  };
}
function Promise$1(fn) {
  if (!(this instanceof Promise$1))
    throw new TypeError("Promises must be constructed via new");
  if (typeof fn !== "function")
    throw new TypeError("not a function");
  this._state = 0;
  this._handled = false;
  this._value = void 0;
  this._deferreds = [];
  doResolve(fn, this);
}
function handle(self2, deferred) {
  while (self2._state === 3) {
    self2 = self2._value;
  }
  if (self2._state === 0) {
    self2._deferreds.push(deferred);
    return;
  }
  self2._handled = true;
  Promise$1._immediateFn(function() {
    var cb = self2._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      (self2._state === 1 ? resolve$1 : reject)(deferred.promise, self2._value);
      return;
    }
    var ret;
    try {
      ret = cb(self2._value);
    } catch (e) {
      reject(deferred.promise, e);
      return;
    }
    resolve$1(deferred.promise, ret);
  });
}
function resolve$1(self2, newValue) {
  try {
    if (newValue === self2)
      throw new TypeError("A promise cannot be resolved with itself.");
    if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
      var then = newValue.then;
      if (newValue instanceof Promise$1) {
        self2._state = 3;
        self2._value = newValue;
        finale(self2);
        return;
      } else if (typeof then === "function") {
        doResolve(bind(then, newValue), self2);
        return;
      }
    }
    self2._state = 1;
    self2._value = newValue;
    finale(self2);
  } catch (e) {
    reject(self2, e);
  }
}
function reject(self2, newValue) {
  self2._state = 2;
  self2._value = newValue;
  finale(self2);
}
function finale(self2) {
  if (self2._state === 2 && self2._deferreds.length === 0) {
    Promise$1._immediateFn(function() {
      if (!self2._handled) {
        Promise$1._unhandledRejectionFn(self2._value);
      }
    });
  }
  for (var i = 0, len = self2._deferreds.length; i < len; i++) {
    handle(self2, self2._deferreds[i]);
  }
  self2._deferreds = null;
}
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.promise = promise;
}
function doResolve(fn, self2) {
  var done = false;
  try {
    fn(
      function(value) {
        if (done)
          return;
        done = true;
        resolve$1(self2, value);
      },
      function(reason) {
        if (done)
          return;
        done = true;
        reject(self2, reason);
      }
    );
  } catch (ex) {
    if (done)
      return;
    done = true;
    reject(self2, ex);
  }
}
Promise$1.prototype["catch"] = function(onRejected) {
  return this.then(null, onRejected);
};
Promise$1.prototype.then = function(onFulfilled, onRejected) {
  var prom = new this.constructor(noop);
  handle(this, new Handler(onFulfilled, onRejected, prom));
  return prom;
};
Promise$1.prototype["finally"] = finallyConstructor;
Promise$1.all = function(arr) {
  return new Promise$1(function(resolve2, reject2) {
    if (!isArray(arr)) {
      return reject2(new TypeError("Promise.all accepts an array"));
    }
    var args = Array.prototype.slice.call(arr);
    if (args.length === 0)
      return resolve2([]);
    var remaining = args.length;
    function res(i2, val) {
      try {
        if (val && (typeof val === "object" || typeof val === "function")) {
          var then = val.then;
          if (typeof then === "function") {
            then.call(
              val,
              function(val2) {
                res(i2, val2);
              },
              reject2
            );
            return;
          }
        }
        args[i2] = val;
        if (--remaining === 0) {
          resolve2(args);
        }
      } catch (ex) {
        reject2(ex);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};
Promise$1.allSettled = allSettled;
Promise$1.resolve = function(value) {
  if (value && typeof value === "object" && value.constructor === Promise$1) {
    return value;
  }
  return new Promise$1(function(resolve2) {
    resolve2(value);
  });
};
Promise$1.reject = function(value) {
  return new Promise$1(function(resolve2, reject2) {
    reject2(value);
  });
};
Promise$1.race = function(arr) {
  return new Promise$1(function(resolve2, reject2) {
    if (!isArray(arr)) {
      return reject2(new TypeError("Promise.race accepts an array"));
    }
    for (var i = 0, len = arr.length; i < len; i++) {
      Promise$1.resolve(arr[i]).then(resolve2, reject2);
    }
  });
};
Promise$1._immediateFn = typeof setImmediate === "function" && function(fn) {
  setImmediate(fn);
} || function(fn) {
  setTimeoutFunc(fn, 0);
};
Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== "undefined" && console) {
    console.warn("Possible Unhandled Promise Rejection:", err);
  }
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === void 0) {
    throw new TypeError("Object.assign cannot be called with null or undefined");
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }
    var test1 = new String("abc");
    test1[5] = "de";
    if (Object.getOwnPropertyNames(test1)[0] === "5") {
      return false;
    }
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2["_" + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join("") !== "0123456789") {
      return false;
    }
    var test3 = {};
    "abcdefghijklmnopqrst".split("").forEach(function(letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
var objectAssign = shouldUseNative() ? Object.assign : function(target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty$1.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};
if (typeof globalThis === "undefined") {
  if (typeof self !== "undefined") {
    self.globalThis = self;
  } else if (typeof global !== "undefined") {
    global.globalThis = global;
  }
}
if (!globalThis.Promise) {
  globalThis.Promise = Promise$1;
}
if (!Object.assign) {
  Object.assign = objectAssign;
}
var ONE_FRAME_TIME = 16;
if (!(Date.now && Date.prototype.getTime)) {
  Date.now = function now() {
    return new Date().getTime();
  };
}
if (!(globalThis.performance && globalThis.performance.now)) {
  var startTime_1 = Date.now();
  if (!globalThis.performance) {
    globalThis.performance = {};
  }
  globalThis.performance.now = function() {
    return Date.now() - startTime_1;
  };
}
var lastTime = Date.now();
var vendors$1 = ["ms", "moz", "webkit", "o"];
for (var x = 0; x < vendors$1.length && !globalThis.requestAnimationFrame; ++x) {
  var p = vendors$1[x];
  globalThis.requestAnimationFrame = globalThis[p + "RequestAnimationFrame"];
  globalThis.cancelAnimationFrame = globalThis[p + "CancelAnimationFrame"] || globalThis[p + "CancelRequestAnimationFrame"];
}
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = function(callback) {
    if (typeof callback !== "function") {
      throw new TypeError(callback + "is not a function");
    }
    var currentTime = Date.now();
    var delay = ONE_FRAME_TIME + lastTime - currentTime;
    if (delay < 0) {
      delay = 0;
    }
    lastTime = currentTime;
    return globalThis.self.setTimeout(function() {
      lastTime = Date.now();
      callback(performance.now());
    }, delay);
  };
}
if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = function(id) {
    return clearTimeout(id);
  };
}
if (!Math.sign) {
  Math.sign = function mathSign(x) {
    x = Number(x);
    if (x === 0 || isNaN(x)) {
      return x;
    }
    return x > 0 ? 1 : -1;
  };
}
if (!Number.isInteger) {
  Number.isInteger = function numberIsInteger(value) {
    return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
  };
}
if (!globalThis.ArrayBuffer) {
  globalThis.ArrayBuffer = Array;
}
if (!globalThis.Float32Array) {
  globalThis.Float32Array = Array;
}
if (!globalThis.Uint32Array) {
  globalThis.Uint32Array = Array;
}
if (!globalThis.Uint16Array) {
  globalThis.Uint16Array = Array;
}
if (!globalThis.Uint8Array) {
  globalThis.Uint8Array = Array;
}
if (!globalThis.Int32Array) {
  globalThis.Int32Array = Array;
}
var ENV;
(function(ENV2) {
  ENV2[ENV2["WEBGL_LEGACY"] = 0] = "WEBGL_LEGACY";
  ENV2[ENV2["WEBGL"] = 1] = "WEBGL";
  ENV2[ENV2["WEBGL2"] = 2] = "WEBGL2";
})(ENV || (ENV = {}));
var RENDERER_TYPE;
(function(RENDERER_TYPE2) {
  RENDERER_TYPE2[RENDERER_TYPE2["UNKNOWN"] = 0] = "UNKNOWN";
  RENDERER_TYPE2[RENDERER_TYPE2["WEBGL"] = 1] = "WEBGL";
  RENDERER_TYPE2[RENDERER_TYPE2["CANVAS"] = 2] = "CANVAS";
})(RENDERER_TYPE || (RENDERER_TYPE = {}));
var BUFFER_BITS;
(function(BUFFER_BITS2) {
  BUFFER_BITS2[BUFFER_BITS2["COLOR"] = 16384] = "COLOR";
  BUFFER_BITS2[BUFFER_BITS2["DEPTH"] = 256] = "DEPTH";
  BUFFER_BITS2[BUFFER_BITS2["STENCIL"] = 1024] = "STENCIL";
})(BUFFER_BITS || (BUFFER_BITS = {}));
var BLEND_MODES;
(function(BLEND_MODES2) {
  BLEND_MODES2[BLEND_MODES2["NORMAL"] = 0] = "NORMAL";
  BLEND_MODES2[BLEND_MODES2["ADD"] = 1] = "ADD";
  BLEND_MODES2[BLEND_MODES2["MULTIPLY"] = 2] = "MULTIPLY";
  BLEND_MODES2[BLEND_MODES2["SCREEN"] = 3] = "SCREEN";
  BLEND_MODES2[BLEND_MODES2["OVERLAY"] = 4] = "OVERLAY";
  BLEND_MODES2[BLEND_MODES2["DARKEN"] = 5] = "DARKEN";
  BLEND_MODES2[BLEND_MODES2["LIGHTEN"] = 6] = "LIGHTEN";
  BLEND_MODES2[BLEND_MODES2["COLOR_DODGE"] = 7] = "COLOR_DODGE";
  BLEND_MODES2[BLEND_MODES2["COLOR_BURN"] = 8] = "COLOR_BURN";
  BLEND_MODES2[BLEND_MODES2["HARD_LIGHT"] = 9] = "HARD_LIGHT";
  BLEND_MODES2[BLEND_MODES2["SOFT_LIGHT"] = 10] = "SOFT_LIGHT";
  BLEND_MODES2[BLEND_MODES2["DIFFERENCE"] = 11] = "DIFFERENCE";
  BLEND_MODES2[BLEND_MODES2["EXCLUSION"] = 12] = "EXCLUSION";
  BLEND_MODES2[BLEND_MODES2["HUE"] = 13] = "HUE";
  BLEND_MODES2[BLEND_MODES2["SATURATION"] = 14] = "SATURATION";
  BLEND_MODES2[BLEND_MODES2["COLOR"] = 15] = "COLOR";
  BLEND_MODES2[BLEND_MODES2["LUMINOSITY"] = 16] = "LUMINOSITY";
  BLEND_MODES2[BLEND_MODES2["NORMAL_NPM"] = 17] = "NORMAL_NPM";
  BLEND_MODES2[BLEND_MODES2["ADD_NPM"] = 18] = "ADD_NPM";
  BLEND_MODES2[BLEND_MODES2["SCREEN_NPM"] = 19] = "SCREEN_NPM";
  BLEND_MODES2[BLEND_MODES2["NONE"] = 20] = "NONE";
  BLEND_MODES2[BLEND_MODES2["SRC_OVER"] = 0] = "SRC_OVER";
  BLEND_MODES2[BLEND_MODES2["SRC_IN"] = 21] = "SRC_IN";
  BLEND_MODES2[BLEND_MODES2["SRC_OUT"] = 22] = "SRC_OUT";
  BLEND_MODES2[BLEND_MODES2["SRC_ATOP"] = 23] = "SRC_ATOP";
  BLEND_MODES2[BLEND_MODES2["DST_OVER"] = 24] = "DST_OVER";
  BLEND_MODES2[BLEND_MODES2["DST_IN"] = 25] = "DST_IN";
  BLEND_MODES2[BLEND_MODES2["DST_OUT"] = 26] = "DST_OUT";
  BLEND_MODES2[BLEND_MODES2["DST_ATOP"] = 27] = "DST_ATOP";
  BLEND_MODES2[BLEND_MODES2["ERASE"] = 26] = "ERASE";
  BLEND_MODES2[BLEND_MODES2["SUBTRACT"] = 28] = "SUBTRACT";
  BLEND_MODES2[BLEND_MODES2["XOR"] = 29] = "XOR";
})(BLEND_MODES || (BLEND_MODES = {}));
var DRAW_MODES;
(function(DRAW_MODES2) {
  DRAW_MODES2[DRAW_MODES2["POINTS"] = 0] = "POINTS";
  DRAW_MODES2[DRAW_MODES2["LINES"] = 1] = "LINES";
  DRAW_MODES2[DRAW_MODES2["LINE_LOOP"] = 2] = "LINE_LOOP";
  DRAW_MODES2[DRAW_MODES2["LINE_STRIP"] = 3] = "LINE_STRIP";
  DRAW_MODES2[DRAW_MODES2["TRIANGLES"] = 4] = "TRIANGLES";
  DRAW_MODES2[DRAW_MODES2["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
  DRAW_MODES2[DRAW_MODES2["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
})(DRAW_MODES || (DRAW_MODES = {}));
var FORMATS;
(function(FORMATS2) {
  FORMATS2[FORMATS2["RGBA"] = 6408] = "RGBA";
  FORMATS2[FORMATS2["RGB"] = 6407] = "RGB";
  FORMATS2[FORMATS2["RG"] = 33319] = "RG";
  FORMATS2[FORMATS2["RED"] = 6403] = "RED";
  FORMATS2[FORMATS2["RGBA_INTEGER"] = 36249] = "RGBA_INTEGER";
  FORMATS2[FORMATS2["RGB_INTEGER"] = 36248] = "RGB_INTEGER";
  FORMATS2[FORMATS2["RG_INTEGER"] = 33320] = "RG_INTEGER";
  FORMATS2[FORMATS2["RED_INTEGER"] = 36244] = "RED_INTEGER";
  FORMATS2[FORMATS2["ALPHA"] = 6406] = "ALPHA";
  FORMATS2[FORMATS2["LUMINANCE"] = 6409] = "LUMINANCE";
  FORMATS2[FORMATS2["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
  FORMATS2[FORMATS2["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
  FORMATS2[FORMATS2["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
})(FORMATS || (FORMATS = {}));
var TARGETS;
(function(TARGETS2) {
  TARGETS2[TARGETS2["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
  TARGETS2[TARGETS2["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
  TARGETS2[TARGETS2["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
})(TARGETS || (TARGETS = {}));
var TYPES;
(function(TYPES2) {
  TYPES2[TYPES2["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
  TYPES2[TYPES2["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
  TYPES2[TYPES2["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
  TYPES2[TYPES2["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
  TYPES2[TYPES2["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
  TYPES2[TYPES2["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
  TYPES2[TYPES2["UNSIGNED_INT_10F_11F_11F_REV"] = 35899] = "UNSIGNED_INT_10F_11F_11F_REV";
  TYPES2[TYPES2["UNSIGNED_INT_2_10_10_10_REV"] = 33640] = "UNSIGNED_INT_2_10_10_10_REV";
  TYPES2[TYPES2["UNSIGNED_INT_24_8"] = 34042] = "UNSIGNED_INT_24_8";
  TYPES2[TYPES2["UNSIGNED_INT_5_9_9_9_REV"] = 35902] = "UNSIGNED_INT_5_9_9_9_REV";
  TYPES2[TYPES2["BYTE"] = 5120] = "BYTE";
  TYPES2[TYPES2["SHORT"] = 5122] = "SHORT";
  TYPES2[TYPES2["INT"] = 5124] = "INT";
  TYPES2[TYPES2["FLOAT"] = 5126] = "FLOAT";
  TYPES2[TYPES2["FLOAT_32_UNSIGNED_INT_24_8_REV"] = 36269] = "FLOAT_32_UNSIGNED_INT_24_8_REV";
  TYPES2[TYPES2["HALF_FLOAT"] = 36193] = "HALF_FLOAT";
})(TYPES || (TYPES = {}));
var SAMPLER_TYPES;
(function(SAMPLER_TYPES2) {
  SAMPLER_TYPES2[SAMPLER_TYPES2["FLOAT"] = 0] = "FLOAT";
  SAMPLER_TYPES2[SAMPLER_TYPES2["INT"] = 1] = "INT";
  SAMPLER_TYPES2[SAMPLER_TYPES2["UINT"] = 2] = "UINT";
})(SAMPLER_TYPES || (SAMPLER_TYPES = {}));
var SCALE_MODES;
(function(SCALE_MODES2) {
  SCALE_MODES2[SCALE_MODES2["NEAREST"] = 0] = "NEAREST";
  SCALE_MODES2[SCALE_MODES2["LINEAR"] = 1] = "LINEAR";
})(SCALE_MODES || (SCALE_MODES = {}));
var WRAP_MODES;
(function(WRAP_MODES2) {
  WRAP_MODES2[WRAP_MODES2["CLAMP"] = 33071] = "CLAMP";
  WRAP_MODES2[WRAP_MODES2["REPEAT"] = 10497] = "REPEAT";
  WRAP_MODES2[WRAP_MODES2["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
})(WRAP_MODES || (WRAP_MODES = {}));
var MIPMAP_MODES;
(function(MIPMAP_MODES2) {
  MIPMAP_MODES2[MIPMAP_MODES2["OFF"] = 0] = "OFF";
  MIPMAP_MODES2[MIPMAP_MODES2["POW2"] = 1] = "POW2";
  MIPMAP_MODES2[MIPMAP_MODES2["ON"] = 2] = "ON";
  MIPMAP_MODES2[MIPMAP_MODES2["ON_MANUAL"] = 3] = "ON_MANUAL";
})(MIPMAP_MODES || (MIPMAP_MODES = {}));
var ALPHA_MODES;
(function(ALPHA_MODES2) {
  ALPHA_MODES2[ALPHA_MODES2["NPM"] = 0] = "NPM";
  ALPHA_MODES2[ALPHA_MODES2["UNPACK"] = 1] = "UNPACK";
  ALPHA_MODES2[ALPHA_MODES2["PMA"] = 2] = "PMA";
  ALPHA_MODES2[ALPHA_MODES2["NO_PREMULTIPLIED_ALPHA"] = 0] = "NO_PREMULTIPLIED_ALPHA";
  ALPHA_MODES2[ALPHA_MODES2["PREMULTIPLY_ON_UPLOAD"] = 1] = "PREMULTIPLY_ON_UPLOAD";
  ALPHA_MODES2[ALPHA_MODES2["PREMULTIPLY_ALPHA"] = 2] = "PREMULTIPLY_ALPHA";
  ALPHA_MODES2[ALPHA_MODES2["PREMULTIPLIED_ALPHA"] = 2] = "PREMULTIPLIED_ALPHA";
})(ALPHA_MODES || (ALPHA_MODES = {}));
var CLEAR_MODES;
(function(CLEAR_MODES2) {
  CLEAR_MODES2[CLEAR_MODES2["NO"] = 0] = "NO";
  CLEAR_MODES2[CLEAR_MODES2["YES"] = 1] = "YES";
  CLEAR_MODES2[CLEAR_MODES2["AUTO"] = 2] = "AUTO";
  CLEAR_MODES2[CLEAR_MODES2["BLEND"] = 0] = "BLEND";
  CLEAR_MODES2[CLEAR_MODES2["CLEAR"] = 1] = "CLEAR";
  CLEAR_MODES2[CLEAR_MODES2["BLIT"] = 2] = "BLIT";
})(CLEAR_MODES || (CLEAR_MODES = {}));
var GC_MODES;
(function(GC_MODES2) {
  GC_MODES2[GC_MODES2["AUTO"] = 0] = "AUTO";
  GC_MODES2[GC_MODES2["MANUAL"] = 1] = "MANUAL";
})(GC_MODES || (GC_MODES = {}));
var PRECISION;
(function(PRECISION2) {
  PRECISION2["LOW"] = "lowp";
  PRECISION2["MEDIUM"] = "mediump";
  PRECISION2["HIGH"] = "highp";
})(PRECISION || (PRECISION = {}));
var MASK_TYPES;
(function(MASK_TYPES2) {
  MASK_TYPES2[MASK_TYPES2["NONE"] = 0] = "NONE";
  MASK_TYPES2[MASK_TYPES2["SCISSOR"] = 1] = "SCISSOR";
  MASK_TYPES2[MASK_TYPES2["STENCIL"] = 2] = "STENCIL";
  MASK_TYPES2[MASK_TYPES2["SPRITE"] = 3] = "SPRITE";
  MASK_TYPES2[MASK_TYPES2["COLOR"] = 4] = "COLOR";
})(MASK_TYPES || (MASK_TYPES = {}));
var COLOR_MASK_BITS;
(function(COLOR_MASK_BITS2) {
  COLOR_MASK_BITS2[COLOR_MASK_BITS2["RED"] = 1] = "RED";
  COLOR_MASK_BITS2[COLOR_MASK_BITS2["GREEN"] = 2] = "GREEN";
  COLOR_MASK_BITS2[COLOR_MASK_BITS2["BLUE"] = 4] = "BLUE";
  COLOR_MASK_BITS2[COLOR_MASK_BITS2["ALPHA"] = 8] = "ALPHA";
})(COLOR_MASK_BITS || (COLOR_MASK_BITS = {}));
var MSAA_QUALITY;
(function(MSAA_QUALITY2) {
  MSAA_QUALITY2[MSAA_QUALITY2["NONE"] = 0] = "NONE";
  MSAA_QUALITY2[MSAA_QUALITY2["LOW"] = 2] = "LOW";
  MSAA_QUALITY2[MSAA_QUALITY2["MEDIUM"] = 4] = "MEDIUM";
  MSAA_QUALITY2[MSAA_QUALITY2["HIGH"] = 8] = "HIGH";
})(MSAA_QUALITY || (MSAA_QUALITY = {}));
var BUFFER_TYPE;
(function(BUFFER_TYPE2) {
  BUFFER_TYPE2[BUFFER_TYPE2["ELEMENT_ARRAY_BUFFER"] = 34963] = "ELEMENT_ARRAY_BUFFER";
  BUFFER_TYPE2[BUFFER_TYPE2["ARRAY_BUFFER"] = 34962] = "ARRAY_BUFFER";
  BUFFER_TYPE2[BUFFER_TYPE2["UNIFORM_BUFFER"] = 35345] = "UNIFORM_BUFFER";
})(BUFFER_TYPE || (BUFFER_TYPE = {}));
var BrowserAdapter = {
  createCanvas: function(width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },
  getWebGLRenderingContext: function() {
    return WebGLRenderingContext;
  },
  getNavigator: function() {
    return navigator;
  },
  getBaseUrl: function() {
    var _a2;
    return (_a2 = document.baseURI) !== null && _a2 !== void 0 ? _a2 : window.location.href;
  },
  fetch: function(url2, options) {
    return fetch(url2, options);
  }
};
var appleIphone = /iPhone/i;
var appleIpod = /iPod/i;
var appleTablet = /iPad/i;
var appleUniversal = /\biOS-universal(?:.+)Mac\b/i;
var androidPhone = /\bAndroid(?:.+)Mobile\b/i;
var androidTablet = /Android/i;
var amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i;
var amazonTablet = /Silk/i;
var windowsPhone = /Windows Phone/i;
var windowsTablet = /\bWindows(?:.+)ARM\b/i;
var otherBlackBerry = /BlackBerry/i;
var otherBlackBerry10 = /BB10/i;
var otherOpera = /Opera Mini/i;
var otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
var otherFirefox = /Mobile(?:.+)Firefox\b/i;
var isAppleTabletOnIos13 = function(navigator2) {
  return typeof navigator2 !== "undefined" && navigator2.platform === "MacIntel" && typeof navigator2.maxTouchPoints === "number" && navigator2.maxTouchPoints > 1 && typeof MSStream === "undefined";
};
function createMatch(userAgent) {
  return function(regex) {
    return regex.test(userAgent);
  };
}
function isMobile$1(param) {
  var nav = {
    userAgent: "",
    platform: "",
    maxTouchPoints: 0
  };
  if (!param && typeof navigator !== "undefined") {
    nav = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  } else if (typeof param === "string") {
    nav.userAgent = param;
  } else if (param && param.userAgent) {
    nav = {
      userAgent: param.userAgent,
      platform: param.platform,
      maxTouchPoints: param.maxTouchPoints || 0
    };
  }
  var userAgent = nav.userAgent;
  var tmp = userAgent.split("[FBAN");
  if (typeof tmp[1] !== "undefined") {
    userAgent = tmp[0];
  }
  tmp = userAgent.split("Twitter");
  if (typeof tmp[1] !== "undefined") {
    userAgent = tmp[0];
  }
  var match = createMatch(userAgent);
  var result2 = {
    apple: {
      phone: match(appleIphone) && !match(windowsPhone),
      ipod: match(appleIpod),
      tablet: !match(appleIphone) && (match(appleTablet) || isAppleTabletOnIos13(nav)) && !match(windowsPhone),
      universal: match(appleUniversal),
      device: (match(appleIphone) || match(appleIpod) || match(appleTablet) || match(appleUniversal) || isAppleTabletOnIos13(nav)) && !match(windowsPhone)
    },
    amazon: {
      phone: match(amazonPhone),
      tablet: !match(amazonPhone) && match(amazonTablet),
      device: match(amazonPhone) || match(amazonTablet)
    },
    android: {
      phone: !match(windowsPhone) && match(amazonPhone) || !match(windowsPhone) && match(androidPhone),
      tablet: !match(windowsPhone) && !match(amazonPhone) && !match(androidPhone) && (match(amazonTablet) || match(androidTablet)),
      device: !match(windowsPhone) && (match(amazonPhone) || match(amazonTablet) || match(androidPhone) || match(androidTablet)) || match(/\bokhttp\b/i)
    },
    windows: {
      phone: match(windowsPhone),
      tablet: match(windowsTablet),
      device: match(windowsPhone) || match(windowsTablet)
    },
    other: {
      blackberry: match(otherBlackBerry),
      blackberry10: match(otherBlackBerry10),
      opera: match(otherOpera),
      firefox: match(otherFirefox),
      chrome: match(otherChrome),
      device: match(otherBlackBerry) || match(otherBlackBerry10) || match(otherOpera) || match(otherFirefox) || match(otherChrome)
    },
    any: false,
    phone: false,
    tablet: false
  };
  result2.any = result2.apple.device || result2.android.device || result2.windows.device || result2.other.device;
  result2.phone = result2.apple.phone || result2.android.phone || result2.windows.phone;
  result2.tablet = result2.apple.tablet || result2.android.tablet || result2.windows.tablet;
  return result2;
}
var isMobile = isMobile$1(globalThis.navigator);
function canUploadSameBuffer() {
  return !isMobile.apple.device;
}
function maxRecommendedTextures(max) {
  var allowMax = true;
  if (isMobile.tablet || isMobile.phone) {
    if (isMobile.apple.device) {
      var match = navigator.userAgent.match(/OS (\d+)_(\d+)?/);
      if (match) {
        var majorVersion = parseInt(match[1], 10);
        if (majorVersion < 11) {
          allowMax = false;
        }
      }
    }
    if (isMobile.android.device) {
      var match = navigator.userAgent.match(/Android\s([0-9.]*)/);
      if (match) {
        var majorVersion = parseInt(match[1], 10);
        if (majorVersion < 7) {
          allowMax = false;
        }
      }
    }
  }
  return allowMax ? max : 4;
}
var settings = {
  ADAPTER: BrowserAdapter,
  MIPMAP_TEXTURES: MIPMAP_MODES.POW2,
  ANISOTROPIC_LEVEL: 0,
  RESOLUTION: 1,
  FILTER_RESOLUTION: 1,
  FILTER_MULTISAMPLE: MSAA_QUALITY.NONE,
  SPRITE_MAX_TEXTURES: maxRecommendedTextures(32),
  SPRITE_BATCH_SIZE: 4096,
  RENDER_OPTIONS: {
    view: null,
    antialias: false,
    autoDensity: false,
    backgroundColor: 0,
    backgroundAlpha: 1,
    useContextAlpha: true,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    width: 800,
    height: 600,
    legacy: false
  },
  GC_MODE: GC_MODES.AUTO,
  GC_MAX_IDLE: 60 * 60,
  GC_MAX_CHECK_COUNT: 60 * 10,
  WRAP_MODE: WRAP_MODES.CLAMP,
  SCALE_MODE: SCALE_MODES.LINEAR,
  PRECISION_VERTEX: PRECISION.HIGH,
  PRECISION_FRAGMENT: isMobile.apple.device ? PRECISION.HIGH : PRECISION.MEDIUM,
  CAN_UPLOAD_SAME_BUFFER: canUploadSameBuffer(),
  CREATE_IMAGE_BITMAP: false,
  ROUND_PIXELS: false
};
var eventemitter3 = { exports: {} };
(function(module) {
  var has = Object.prototype.hasOwnProperty, prefix = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = /* @__PURE__ */ Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context2, once) {
    this.fn = fn;
    this.context = context2;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context2, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context2 || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events();
    else
      delete emitter._events[evt];
  }
  function EventEmitter2() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter2.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events) {
      if (has.call(events, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };
  EventEmitter2.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [handlers.fn];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }
    return ee;
  };
  EventEmitter2.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter2.prototype.on = function on(event, fn, context2) {
    return addListener(this, event, fn, context2, false);
  };
  EventEmitter2.prototype.once = function once(event, fn, context2) {
    return addListener(this, event, fn, context2, true);
  };
  EventEmitter2.prototype.removeListener = function removeListener(event, fn, context2, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context2 || listeners.context === context2)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context2 && listeners[i].context !== context2) {
          events.push(listeners[i]);
        }
      }
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
  EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
  EventEmitter2.prefixed = prefix;
  EventEmitter2.EventEmitter = EventEmitter2;
  {
    module.exports = EventEmitter2;
  }
})(eventemitter3);
const EventEmitter = eventemitter3.exports;
var earcut$1 = { exports: {} };
earcut$1.exports = earcut;
earcut$1.exports.default = earcut;
function earcut(data, holeIndices, dim) {
  dim = dim || 2;
  var hasHoles = holeIndices && holeIndices.length, outerLen = hasHoles ? holeIndices[0] * dim : data.length, outerNode = linkedList(data, 0, outerLen, dim, true), triangles = [];
  if (!outerNode || outerNode.next === outerNode.prev)
    return triangles;
  var minX, minY, maxX, maxY, x, y, invSize;
  if (hasHoles)
    outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
  if (data.length > 80 * dim) {
    minX = maxX = data[0];
    minY = maxY = data[1];
    for (var i = dim; i < outerLen; i += dim) {
      x = data[i];
      y = data[i + 1];
      if (x < minX)
        minX = x;
      if (y < minY)
        minY = y;
      if (x > maxX)
        maxX = x;
      if (y > maxY)
        maxY = y;
    }
    invSize = Math.max(maxX - minX, maxY - minY);
    invSize = invSize !== 0 ? 32767 / invSize : 0;
  }
  earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
  return triangles;
}
function linkedList(data, start, end, dim, clockwise) {
  var i, last;
  if (clockwise === signedArea(data, start, end, dim) > 0) {
    for (i = start; i < end; i += dim)
      last = insertNode(i, data[i], data[i + 1], last);
  } else {
    for (i = end - dim; i >= start; i -= dim)
      last = insertNode(i, data[i], data[i + 1], last);
  }
  if (last && equals(last, last.next)) {
    removeNode(last);
    last = last.next;
  }
  return last;
}
function filterPoints(start, end) {
  if (!start)
    return start;
  if (!end)
    end = start;
  var p = start, again;
  do {
    again = false;
    if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
      removeNode(p);
      p = end = p.prev;
      if (p === p.next)
        break;
      again = true;
    } else {
      p = p.next;
    }
  } while (again || p !== end);
  return end;
}
function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
  if (!ear)
    return;
  if (!pass && invSize)
    indexCurve(ear, minX, minY, invSize);
  var stop = ear, prev, next;
  while (ear.prev !== ear.next) {
    prev = ear.prev;
    next = ear.next;
    if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
      triangles.push(prev.i / dim | 0);
      triangles.push(ear.i / dim | 0);
      triangles.push(next.i / dim | 0);
      removeNode(ear);
      ear = next.next;
      stop = next.next;
      continue;
    }
    ear = next;
    if (ear === stop) {
      if (!pass) {
        earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
      } else if (pass === 1) {
        ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
        earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
      } else if (pass === 2) {
        splitEarcut(ear, triangles, dim, minX, minY, invSize);
      }
      break;
    }
  }
}
function isEar(ear) {
  var a = ear.prev, b = ear, c = ear.next;
  if (area(a, b, c) >= 0)
    return false;
  var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
  var x0 = ax < bx ? ax < cx ? ax : cx : bx < cx ? bx : cx, y0 = ay < by ? ay < cy ? ay : cy : by < cy ? by : cy, x1 = ax > bx ? ax > cx ? ax : cx : bx > cx ? bx : cx, y1 = ay > by ? ay > cy ? ay : cy : by > cy ? by : cy;
  var p = c.next;
  while (p !== a) {
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
      return false;
    p = p.next;
  }
  return true;
}
function isEarHashed(ear, minX, minY, invSize) {
  var a = ear.prev, b = ear, c = ear.next;
  if (area(a, b, c) >= 0)
    return false;
  var ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
  var x0 = ax < bx ? ax < cx ? ax : cx : bx < cx ? bx : cx, y0 = ay < by ? ay < cy ? ay : cy : by < cy ? by : cy, x1 = ax > bx ? ax > cx ? ax : cx : bx > cx ? bx : cx, y1 = ay > by ? ay > cy ? ay : cy : by > cy ? by : cy;
  var minZ = zOrder(x0, y0, minX, minY, invSize), maxZ = zOrder(x1, y1, minX, minY, invSize);
  var p = ear.prevZ, n = ear.nextZ;
  while (p && p.z >= minZ && n && n.z <= maxZ) {
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
      return false;
    p = p.prevZ;
    if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0)
      return false;
    n = n.nextZ;
  }
  while (p && p.z >= minZ) {
    if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c && pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0)
      return false;
    p = p.prevZ;
  }
  while (n && n.z <= maxZ) {
    if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c && pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0)
      return false;
    n = n.nextZ;
  }
  return true;
}
function cureLocalIntersections(start, triangles, dim) {
  var p = start;
  do {
    var a = p.prev, b = p.next.next;
    if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
      triangles.push(a.i / dim | 0);
      triangles.push(p.i / dim | 0);
      triangles.push(b.i / dim | 0);
      removeNode(p);
      removeNode(p.next);
      p = start = b;
    }
    p = p.next;
  } while (p !== start);
  return filterPoints(p);
}
function splitEarcut(start, triangles, dim, minX, minY, invSize) {
  var a = start;
  do {
    var b = a.next.next;
    while (b !== a.prev) {
      if (a.i !== b.i && isValidDiagonal(a, b)) {
        var c = splitPolygon(a, b);
        a = filterPoints(a, a.next);
        c = filterPoints(c, c.next);
        earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
        earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
        return;
      }
      b = b.next;
    }
    a = a.next;
  } while (a !== start);
}
function eliminateHoles(data, holeIndices, outerNode, dim) {
  var queue = [], i, len, start, end, list;
  for (i = 0, len = holeIndices.length; i < len; i++) {
    start = holeIndices[i] * dim;
    end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
    list = linkedList(data, start, end, dim, false);
    if (list === list.next)
      list.steiner = true;
    queue.push(getLeftmost(list));
  }
  queue.sort(compareX);
  for (i = 0; i < queue.length; i++) {
    outerNode = eliminateHole(queue[i], outerNode);
  }
  return outerNode;
}
function compareX(a, b) {
  return a.x - b.x;
}
function eliminateHole(hole, outerNode) {
  var bridge = findHoleBridge(hole, outerNode);
  if (!bridge) {
    return outerNode;
  }
  var bridgeReverse = splitPolygon(bridge, hole);
  filterPoints(bridgeReverse, bridgeReverse.next);
  return filterPoints(bridge, bridge.next);
}
function findHoleBridge(hole, outerNode) {
  var p = outerNode, hx = hole.x, hy = hole.y, qx = -Infinity, m;
  do {
    if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
      var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
      if (x <= hx && x > qx) {
        qx = x;
        m = p.x < p.next.x ? p : p.next;
        if (x === hx)
          return m;
      }
    }
    p = p.next;
  } while (p !== outerNode);
  if (!m)
    return null;
  var stop = m, mx = m.x, my = m.y, tanMin = Infinity, tan2;
  p = m;
  do {
    if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
      tan2 = Math.abs(hy - p.y) / (hx - p.x);
      if (locallyInside(p, hole) && (tan2 < tanMin || tan2 === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
        m = p;
        tanMin = tan2;
      }
    }
    p = p.next;
  } while (p !== stop);
  return m;
}
function sectorContainsSector(m, p) {
  return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
}
function indexCurve(start, minX, minY, invSize) {
  var p = start;
  do {
    if (p.z === 0)
      p.z = zOrder(p.x, p.y, minX, minY, invSize);
    p.prevZ = p.prev;
    p.nextZ = p.next;
    p = p.next;
  } while (p !== start);
  p.prevZ.nextZ = null;
  p.prevZ = null;
  sortLinked(p);
}
function sortLinked(list) {
  var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
  do {
    p = list;
    list = null;
    tail = null;
    numMerges = 0;
    while (p) {
      numMerges++;
      q = p;
      pSize = 0;
      for (i = 0; i < inSize; i++) {
        pSize++;
        q = q.nextZ;
        if (!q)
          break;
      }
      qSize = inSize;
      while (pSize > 0 || qSize > 0 && q) {
        if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
          e = p;
          p = p.nextZ;
          pSize--;
        } else {
          e = q;
          q = q.nextZ;
          qSize--;
        }
        if (tail)
          tail.nextZ = e;
        else
          list = e;
        e.prevZ = tail;
        tail = e;
      }
      p = q;
    }
    tail.nextZ = null;
    inSize *= 2;
  } while (numMerges > 1);
  return list;
}
function zOrder(x, y, minX, minY, invSize) {
  x = (x - minX) * invSize | 0;
  y = (y - minY) * invSize | 0;
  x = (x | x << 8) & 16711935;
  x = (x | x << 4) & 252645135;
  x = (x | x << 2) & 858993459;
  x = (x | x << 1) & 1431655765;
  y = (y | y << 8) & 16711935;
  y = (y | y << 4) & 252645135;
  y = (y | y << 2) & 858993459;
  y = (y | y << 1) & 1431655765;
  return x | y << 1;
}
function getLeftmost(start) {
  var p = start, leftmost = start;
  do {
    if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y)
      leftmost = p;
    p = p.next;
  } while (p !== start);
  return leftmost;
}
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
  return (cx - px) * (ay - py) >= (ax - px) * (cy - py) && (ax - px) * (by - py) >= (bx - px) * (ay - py) && (bx - px) * (cy - py) >= (cx - px) * (by - py);
}
function isValidDiagonal(a, b) {
  return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && (area(a.prev, a, b.prev) || area(a, b.prev, b)) || equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
}
function area(p, q, r) {
  return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}
function equals(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}
function intersects(p1, q1, p2, q2) {
  var o1 = sign$1(area(p1, q1, p2));
  var o2 = sign$1(area(p1, q1, q2));
  var o3 = sign$1(area(p2, q2, p1));
  var o4 = sign$1(area(p2, q2, q1));
  if (o1 !== o2 && o3 !== o4)
    return true;
  if (o1 === 0 && onSegment(p1, p2, q1))
    return true;
  if (o2 === 0 && onSegment(p1, q2, q1))
    return true;
  if (o3 === 0 && onSegment(p2, p1, q2))
    return true;
  if (o4 === 0 && onSegment(p2, q1, q2))
    return true;
  return false;
}
function onSegment(p, q, r) {
  return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
}
function sign$1(num) {
  return num > 0 ? 1 : num < 0 ? -1 : 0;
}
function intersectsPolygon(a, b) {
  var p = a;
  do {
    if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b))
      return true;
    p = p.next;
  } while (p !== a);
  return false;
}
function locallyInside(a, b) {
  return area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}
function middleInside(a, b) {
  var p = a, inside = false, px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
  do {
    if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)
      inside = !inside;
    p = p.next;
  } while (p !== a);
  return inside;
}
function splitPolygon(a, b) {
  var a2 = new Node(a.i, a.x, a.y), b2 = new Node(b.i, b.x, b.y), an = a.next, bp = b.prev;
  a.next = b;
  b.prev = a;
  a2.next = an;
  an.prev = a2;
  b2.next = a2;
  a2.prev = b2;
  bp.next = b2;
  b2.prev = bp;
  return b2;
}
function insertNode(i, x, y, last) {
  var p = new Node(i, x, y);
  if (!last) {
    p.prev = p;
    p.next = p;
  } else {
    p.next = last.next;
    p.prev = last;
    last.next.prev = p;
    last.next = p;
  }
  return p;
}
function removeNode(p) {
  p.next.prev = p.prev;
  p.prev.next = p.next;
  if (p.prevZ)
    p.prevZ.nextZ = p.nextZ;
  if (p.nextZ)
    p.nextZ.prevZ = p.prevZ;
}
function Node(i, x, y) {
  this.i = i;
  this.x = x;
  this.y = y;
  this.prev = null;
  this.next = null;
  this.z = 0;
  this.prevZ = null;
  this.nextZ = null;
  this.steiner = false;
}
earcut.deviation = function(data, holeIndices, dim, triangles) {
  var hasHoles = holeIndices && holeIndices.length;
  var outerLen = hasHoles ? holeIndices[0] * dim : data.length;
  var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
  if (hasHoles) {
    for (var i = 0, len = holeIndices.length; i < len; i++) {
      var start = holeIndices[i] * dim;
      var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
      polygonArea -= Math.abs(signedArea(data, start, end, dim));
    }
  }
  var trianglesArea = 0;
  for (i = 0; i < triangles.length; i += 3) {
    var a = triangles[i] * dim;
    var b = triangles[i + 1] * dim;
    var c = triangles[i + 2] * dim;
    trianglesArea += Math.abs(
      (data[a] - data[c]) * (data[b + 1] - data[a + 1]) - (data[a] - data[b]) * (data[c + 1] - data[a + 1])
    );
  }
  return polygonArea === 0 && trianglesArea === 0 ? 0 : Math.abs((trianglesArea - polygonArea) / polygonArea);
};
function signedArea(data, start, end, dim) {
  var sum = 0;
  for (var i = start, j = end - dim; i < end; i += dim) {
    sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
    j = i;
  }
  return sum;
}
earcut.flatten = function(data) {
  var dim = data[0][0].length, result2 = { vertices: [], holes: [], dimensions: dim }, holeIndex = 0;
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].length; j++) {
      for (var d = 0; d < dim; d++)
        result2.vertices.push(data[i][j][d]);
    }
    if (i > 0) {
      holeIndex += data[i - 1].length;
      result2.holes.push(holeIndex);
    }
  }
  return result2;
};
var punycode$1 = { exports: {} };
(function(module, exports) {
  (function(root) {
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = module && !module.nodeType && module;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal;
    if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
      root = freeGlobal;
    }
    var punycode2, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
      "overflow": "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, key;
    function error(type) {
      throw RangeError(errors[type]);
    }
    function map2(array, fn) {
      var length = array.length;
      var result2 = [];
      while (length--) {
        result2[length] = fn(array[length]);
      }
      return result2;
    }
    function mapDomain(string, fn) {
      var parts = string.split("@");
      var result2 = "";
      if (parts.length > 1) {
        result2 = parts[0] + "@";
        string = parts[1];
      }
      string = string.replace(regexSeparators, ".");
      var labels = string.split(".");
      var encoded = map2(labels, fn).join(".");
      return result2 + encoded;
    }
    function ucs2decode(string) {
      var output = [], counter = 0, length = string.length, value, extra;
      while (counter < length) {
        value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    function ucs2encode(array) {
      return map2(array, function(value) {
        var output = "";
        if (value > 65535) {
          value -= 65536;
          output += stringFromCharCode(value >>> 10 & 1023 | 55296);
          value = 56320 | value & 1023;
        }
        output += stringFromCharCode(value);
        return output;
      }).join("");
    }
    function basicToDigit(codePoint) {
      if (codePoint - 48 < 10) {
        return codePoint - 22;
      }
      if (codePoint - 65 < 26) {
        return codePoint - 65;
      }
      if (codePoint - 97 < 26) {
        return codePoint - 97;
      }
      return base;
    }
    function digitToBasic(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    }
    function adapt(delta, numPoints, firstTime) {
      var k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (; delta > baseMinusTMin * tMax >> 1; k += base) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    }
    function decode2(input) {
      var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index2, oldi, w, k, digit, t, baseMinusT;
      basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (index2 = basic > 0 ? basic + 1 : 0; index2 < inputLength; ) {
        for (oldi = i, w = 1, k = base; ; k += base) {
          if (index2 >= inputLength) {
            error("invalid-input");
          }
          digit = basicToDigit(input.charCodeAt(index2++));
          if (digit >= base || digit > floor((maxInt - i) / w)) {
            error("overflow");
          }
          i += digit * w;
          t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error("overflow");
          }
          w *= baseMinusT;
        }
        out = output.length + 1;
        bias = adapt(i - oldi, out, oldi == 0);
        if (floor(i / out) > maxInt - n) {
          error("overflow");
        }
        n += floor(i / out);
        i %= out;
        output.splice(i++, 0, n);
      }
      return ucs2encode(output);
    }
    function encode2(input) {
      var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
      input = ucs2decode(input);
      inputLength = input.length;
      n = initialN;
      delta = 0;
      bias = initialBias;
      for (j = 0; j < inputLength; ++j) {
        currentValue = input[j];
        if (currentValue < 128) {
          output.push(stringFromCharCode(currentValue));
        }
      }
      handledCPCount = basicLength = output.length;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        for (m = maxInt, j = 0; j < inputLength; ++j) {
          currentValue = input[j];
          if (currentValue >= n && currentValue < m) {
            m = currentValue;
          }
        }
        handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (j = 0; j < inputLength; ++j) {
          currentValue = input[j];
          if (currentValue < n && ++delta > maxInt) {
            error("overflow");
          }
          if (currentValue == n) {
            for (q = delta, k = base; ; k += base) {
              t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (q < t) {
                break;
              }
              qMinusT = q - t;
              baseMinusT = base - t;
              output.push(
                stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
              );
              q = floor(qMinusT / baseMinusT);
            }
            output.push(stringFromCharCode(digitToBasic(q, 0)));
            bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
            delta = 0;
            ++handledCPCount;
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    }
    function toUnicode(input) {
      return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode2(string.slice(4).toLowerCase()) : string;
      });
    }
    function toASCII(input) {
      return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
      });
    }
    punycode2 = {
      "version": "1.3.2",
      "ucs2": {
        "decode": ucs2decode,
        "encode": ucs2encode
      },
      "decode": decode2,
      "encode": encode2,
      "toASCII": toASCII,
      "toUnicode": toUnicode
    };
    if (freeExports && freeModule) {
      if (module.exports == freeExports) {
        freeModule.exports = punycode2;
      } else {
        for (key in punycode2) {
          punycode2.hasOwnProperty(key) && (freeExports[key] = punycode2[key]);
        }
      }
    } else {
      root.punycode = punycode2;
    }
  })(commonjsGlobal);
})(punycode$1, punycode$1.exports);
var util$1 = {
  isString: function(arg) {
    return typeof arg === "string";
  },
  isObject: function(arg) {
    return typeof arg === "object" && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};
var querystring$1 = {};
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
var decode = function(qs, sep, eq, options) {
  sep = sep || "&";
  eq = eq || "=";
  var obj = {};
  if (typeof qs !== "string" || qs.length === 0) {
    return obj;
  }
  var regexp = /\+/g;
  qs = qs.split(sep);
  var maxKeys = 1e3;
  if (options && typeof options.maxKeys === "number") {
    maxKeys = options.maxKeys;
  }
  var len = qs.length;
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }
  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, "%20"), idx = x.indexOf(eq), kstr, vstr, k, v;
    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = "";
    }
    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);
    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }
  return obj;
};
var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case "string":
      return v;
    case "boolean":
      return v ? "true" : "false";
    case "number":
      return isFinite(v) ? v : "";
    default:
      return "";
  }
};
var encode = function(obj, sep, eq, name) {
  sep = sep || "&";
  eq = eq || "=";
  if (obj === null) {
    obj = void 0;
  }
  if (typeof obj === "object") {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);
  }
  if (!name)
    return "";
  return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
};
querystring$1.decode = querystring$1.parse = decode;
querystring$1.encode = querystring$1.stringify = encode;
var punycode = punycode$1.exports;
var util = util$1;
var parse = urlParse;
var resolve = urlResolve;
var format = urlFormat;
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}
var protocolPattern = /^([a-z0-9.+-]+:)/i, portPattern = /:[0-9]*$/, simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"], unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims), autoEscape = ["'"].concat(unwise), nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape), hostEndingChars = ["/", "?", "#"], hostnameMaxLen = 255, hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/, hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, unsafeProtocol = {
  "javascript": true,
  "javascript:": true
}, hostlessProtocol = {
  "javascript": true,
  "javascript:": true
}, slashedProtocol = {
  "http": true,
  "https": true,
  "ftp": true,
  "gopher": true,
  "file": true,
  "http:": true,
  "https:": true,
  "ftp:": true,
  "gopher:": true,
  "file:": true
}, querystring = querystring$1;
function urlParse(url2, parseQueryString, slashesDenoteHost) {
  if (url2 && util.isObject(url2) && url2 instanceof Url)
    return url2;
  var u = new Url();
  u.parse(url2, parseQueryString, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url2, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url2)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url2);
  }
  var queryIndex = url2.indexOf("?"), splitter = queryIndex !== -1 && queryIndex < url2.indexOf("#") ? "?" : "#", uSplit = url2.split(splitter), slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, "/");
  url2 = uSplit.join(splitter);
  var rest = url2;
  rest = rest.trim();
  if (!slashesDenoteHost && url2.split("#").length === 1) {
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = "";
        this.query = {};
      }
      return this;
    }
  }
  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === "//";
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    var auth, atSign;
    if (hostEnd === -1) {
      atSign = rest.lastIndexOf("@");
    } else {
      atSign = rest.lastIndexOf("@", hostEnd);
    }
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    if (hostEnd === -1)
      hostEnd = rest.length;
    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost();
    this.hostname = this.hostname || "";
    var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part)
          continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = "";
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              newpart += "x";
            } else {
              newpart += part[j];
            }
          }
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = "/" + notHost.join(".") + rest;
            }
            this.hostname = validParts.join(".");
            break;
          }
        }
      }
    }
    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = "";
    } else {
      this.hostname = this.hostname.toLowerCase();
    }
    if (!ipv6Hostname) {
      this.hostname = punycode.toASCII(this.hostname);
    }
    var p = this.port ? ":" + this.port : "";
    var h = this.hostname || "";
    this.host = h + p;
    this.href += this.host;
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== "/") {
        rest = "/" + rest;
      }
    }
  }
  if (!unsafeProtocol[lowerProto]) {
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }
  var hash = rest.indexOf("#");
  if (hash !== -1) {
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf("?");
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    this.search = "";
    this.query = {};
  }
  if (rest)
    this.pathname = rest;
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = "/";
  }
  if (this.pathname || this.search) {
    var p = this.pathname || "";
    var s = this.search || "";
    this.path = p + s;
  }
  this.href = this.format();
  return this;
};
function urlFormat(obj) {
  if (util.isString(obj))
    obj = urlParse(obj);
  if (!(obj instanceof Url))
    return Url.prototype.format.call(obj);
  return obj.format();
}
Url.prototype.format = function() {
  var auth = this.auth || "";
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ":");
    auth += "@";
  }
  var protocol = this.protocol || "", pathname = this.pathname || "", hash = this.hash || "", host = false, query = "";
  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]");
    if (this.port) {
      host += ":" + this.port;
    }
  }
  if (this.query && util.isObject(this.query) && Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }
  var search = this.search || query && "?" + query || "";
  if (protocol && protocol.substr(-1) !== ":")
    protocol += ":";
  if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = "//" + (host || "");
    if (pathname && pathname.charAt(0) !== "/")
      pathname = "/" + pathname;
  } else if (!host) {
    host = "";
  }
  if (hash && hash.charAt(0) !== "#")
    hash = "#" + hash;
  if (search && search.charAt(0) !== "?")
    search = "?" + search;
  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace("#", "%23");
  return protocol + host + pathname + search + hash;
};
function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}
Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};
Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }
  var result2 = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result2[tkey] = this[tkey];
  }
  result2.hash = relative.hash;
  if (relative.href === "") {
    result2.href = result2.format();
    return result2;
  }
  if (relative.slashes && !relative.protocol) {
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== "protocol")
        result2[rkey] = relative[rkey];
    }
    if (slashedProtocol[result2.protocol] && result2.hostname && !result2.pathname) {
      result2.path = result2.pathname = "/";
    }
    result2.href = result2.format();
    return result2;
  }
  if (relative.protocol && relative.protocol !== result2.protocol) {
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result2[k] = relative[k];
      }
      result2.href = result2.format();
      return result2;
    }
    result2.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || "").split("/");
      while (relPath.length && !(relative.host = relPath.shift()))
        ;
      if (!relative.host)
        relative.host = "";
      if (!relative.hostname)
        relative.hostname = "";
      if (relPath[0] !== "")
        relPath.unshift("");
      if (relPath.length < 2)
        relPath.unshift("");
      result2.pathname = relPath.join("/");
    } else {
      result2.pathname = relative.pathname;
    }
    result2.search = relative.search;
    result2.query = relative.query;
    result2.host = relative.host || "";
    result2.auth = relative.auth;
    result2.hostname = relative.hostname || relative.host;
    result2.port = relative.port;
    if (result2.pathname || result2.search) {
      var p = result2.pathname || "";
      var s = result2.search || "";
      result2.path = p + s;
    }
    result2.slashes = result2.slashes || relative.slashes;
    result2.href = result2.format();
    return result2;
  }
  var isSourceAbs = result2.pathname && result2.pathname.charAt(0) === "/", isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === "/", mustEndAbs = isRelAbs || isSourceAbs || result2.host && relative.pathname, removeAllDots = mustEndAbs, srcPath = result2.pathname && result2.pathname.split("/") || [], relPath = relative.pathname && relative.pathname.split("/") || [], psychotic = result2.protocol && !slashedProtocol[result2.protocol];
  if (psychotic) {
    result2.hostname = "";
    result2.port = null;
    if (result2.host) {
      if (srcPath[0] === "")
        srcPath[0] = result2.host;
      else
        srcPath.unshift(result2.host);
    }
    result2.host = "";
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === "")
          relPath[0] = relative.host;
        else
          relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === "" || srcPath[0] === "");
  }
  if (isRelAbs) {
    result2.host = relative.host || relative.host === "" ? relative.host : result2.host;
    result2.hostname = relative.hostname || relative.hostname === "" ? relative.hostname : result2.hostname;
    result2.search = relative.search;
    result2.query = relative.query;
    srcPath = relPath;
  } else if (relPath.length) {
    if (!srcPath)
      srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result2.search = relative.search;
    result2.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    if (psychotic) {
      result2.hostname = result2.host = srcPath.shift();
      var authInHost = result2.host && result2.host.indexOf("@") > 0 ? result2.host.split("@") : false;
      if (authInHost) {
        result2.auth = authInHost.shift();
        result2.host = result2.hostname = authInHost.shift();
      }
    }
    result2.search = relative.search;
    result2.query = relative.query;
    if (!util.isNull(result2.pathname) || !util.isNull(result2.search)) {
      result2.path = (result2.pathname ? result2.pathname : "") + (result2.search ? result2.search : "");
    }
    result2.href = result2.format();
    return result2;
  }
  if (!srcPath.length) {
    result2.pathname = null;
    if (result2.search) {
      result2.path = "/" + result2.search;
    } else {
      result2.path = null;
    }
    result2.href = result2.format();
    return result2;
  }
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (result2.host || relative.host || srcPath.length > 1) && (last === "." || last === "..") || last === "";
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === ".") {
      srcPath.splice(i, 1);
    } else if (last === "..") {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift("..");
    }
  }
  if (mustEndAbs && srcPath[0] !== "" && (!srcPath[0] || srcPath[0].charAt(0) !== "/")) {
    srcPath.unshift("");
  }
  if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/") {
    srcPath.push("");
  }
  var isAbsolute = srcPath[0] === "" || srcPath[0] && srcPath[0].charAt(0) === "/";
  if (psychotic) {
    result2.hostname = result2.host = isAbsolute ? "" : srcPath.length ? srcPath.shift() : "";
    var authInHost = result2.host && result2.host.indexOf("@") > 0 ? result2.host.split("@") : false;
    if (authInHost) {
      result2.auth = authInHost.shift();
      result2.host = result2.hostname = authInHost.shift();
    }
  }
  mustEndAbs = mustEndAbs || result2.host && srcPath.length;
  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift("");
  }
  if (!srcPath.length) {
    result2.pathname = null;
    result2.path = null;
  } else {
    result2.pathname = srcPath.join("/");
  }
  if (!util.isNull(result2.pathname) || !util.isNull(result2.search)) {
    result2.path = (result2.pathname ? result2.pathname : "") + (result2.search ? result2.search : "");
  }
  result2.auth = relative.auth || result2.auth;
  result2.slashes = result2.slashes || relative.slashes;
  result2.href = result2.format();
  return result2;
};
Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ":") {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host)
    this.hostname = host;
};
var url = {
  parse,
  format,
  resolve
};
function assertPath(path2) {
  if (typeof path2 !== "string") {
    throw new TypeError("Path must be a string. Received " + JSON.stringify(path2));
  }
}
function removeUrlParams(url2) {
  var re = url2.split("?")[0];
  return re.split("#")[0];
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}
function normalizeStringPosix(path2, allowAboveRoot) {
  var res = "";
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path2.length; ++i) {
    if (i < path2.length) {
      code = path2.charCodeAt(i);
    } else if (code === 47) {
      break;
    } else {
      code = 47;
    }
    if (code === 47) {
      if (lastSlash === i - 1 || dots === 1)
        ;
      else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0) {
            res += "/..";
          } else {
            res = "..";
          }
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += "/" + path2.slice(lastSlash + 1, i);
        } else {
          res = path2.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
var path = {
  toPosix: function(path2) {
    return replaceAll(path2, "\\", "/");
  },
  isUrl: function(path2) {
    return /^https?:/.test(this.toPosix(path2));
  },
  isDataUrl: function(path2) {
    return /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i.test(path2);
  },
  hasProtocol: function(path2) {
    return /^[^/:]+:\//.test(this.toPosix(path2));
  },
  getProtocol: function(path2) {
    assertPath(path2);
    path2 = this.toPosix(path2);
    var protocol = "";
    var isFile = /^file:\/\/\//.exec(path2);
    var isHttp = /^[^/:]+:\/\//.exec(path2);
    var isWindows = /^[^/:]+:\//.exec(path2);
    if (isFile || isHttp || isWindows) {
      var arr = (isFile === null || isFile === void 0 ? void 0 : isFile[0]) || (isHttp === null || isHttp === void 0 ? void 0 : isHttp[0]) || (isWindows === null || isWindows === void 0 ? void 0 : isWindows[0]);
      protocol = arr;
      path2 = path2.slice(arr.length);
    }
    return protocol;
  },
  toAbsolute: function(url2, customBaseUrl, customRootUrl) {
    if (this.isDataUrl(url2)) {
      return url2;
    }
    var baseUrl = removeUrlParams(this.toPosix(customBaseUrl !== null && customBaseUrl !== void 0 ? customBaseUrl : settings.ADAPTER.getBaseUrl()));
    var rootUrl = removeUrlParams(this.toPosix(customRootUrl !== null && customRootUrl !== void 0 ? customRootUrl : this.rootname(baseUrl)));
    assertPath(url2);
    url2 = this.toPosix(url2);
    if (url2.startsWith("/")) {
      return path.join(rootUrl, url2.slice(1));
    }
    var absolutePath = this.isAbsolute(url2) ? url2 : this.join(baseUrl, url2);
    return absolutePath;
  },
  normalize: function(path2) {
    path2 = this.toPosix(path2);
    assertPath(path2);
    if (path2.length === 0) {
      return ".";
    }
    var protocol = "";
    var isAbsolute = path2.startsWith("/");
    if (this.hasProtocol(path2)) {
      protocol = this.rootname(path2);
      path2 = path2.slice(protocol.length);
    }
    var trailingSeparator = path2.endsWith("/");
    path2 = normalizeStringPosix(path2, false);
    if (path2.length > 0 && trailingSeparator) {
      path2 += "/";
    }
    if (isAbsolute) {
      return "/" + path2;
    }
    return protocol + path2;
  },
  isAbsolute: function(path2) {
    assertPath(path2);
    path2 = this.toPosix(path2);
    if (this.hasProtocol(path2)) {
      return true;
    }
    return path2.startsWith("/");
  },
  join: function() {
    var arguments$1 = arguments;
    var _a2;
    var segments = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      segments[_i] = arguments$1[_i];
    }
    if (segments.length === 0) {
      return ".";
    }
    var joined;
    for (var i = 0; i < segments.length; ++i) {
      var arg = segments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === void 0) {
          joined = arg;
        } else {
          var prevArg = (_a2 = segments[i - 1]) !== null && _a2 !== void 0 ? _a2 : "";
          if (this.extname(prevArg)) {
            joined += "/../" + arg;
          } else {
            joined += "/" + arg;
          }
        }
      }
    }
    if (joined === void 0) {
      return ".";
    }
    return this.normalize(joined);
  },
  dirname: function(path2) {
    assertPath(path2);
    if (path2.length === 0) {
      return ".";
    }
    path2 = this.toPosix(path2);
    var code = path2.charCodeAt(0);
    var hasRoot = code === 47;
    var end = -1;
    var matchedSlash = true;
    var proto = this.getProtocol(path2);
    var origpath = path2;
    path2 = path2.slice(proto.length);
    for (var i = path2.length - 1; i >= 1; --i) {
      code = path2.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }
    if (end === -1) {
      return hasRoot ? "/" : this.isUrl(origpath) ? proto + path2 : proto;
    }
    if (hasRoot && end === 1) {
      return "//";
    }
    return proto + path2.slice(0, end);
  },
  rootname: function(path2) {
    assertPath(path2);
    path2 = this.toPosix(path2);
    var root = "";
    if (path2.startsWith("/")) {
      root = "/";
    } else {
      root = this.getProtocol(path2);
    }
    if (this.isUrl(path2)) {
      var index2 = path2.indexOf("/", root.length);
      if (index2 !== -1) {
        root = path2.slice(0, index2);
      } else {
        root = path2;
      }
      if (!root.endsWith("/")) {
        root += "/";
      }
    }
    return root;
  },
  basename: function(path2, ext) {
    assertPath(path2);
    if (ext) {
      assertPath(ext);
    }
    path2 = this.toPosix(path2);
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;
    if (ext !== void 0 && ext.length > 0 && ext.length <= path2.length) {
      if (ext.length === path2.length && ext === path2) {
        return "";
      }
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path2.length - 1; i >= 0; --i) {
        var code = path2.charCodeAt(i);
        if (code === 47) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                end = i;
              }
            } else {
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }
      if (start === end) {
        end = firstNonSlashEnd;
      } else if (end === -1) {
        end = path2.length;
      }
      return path2.slice(start, end);
    }
    for (i = path2.length - 1; i >= 0; --i) {
      if (path2.charCodeAt(i) === 47) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
    }
    if (end === -1) {
      return "";
    }
    return path2.slice(start, end);
  },
  extname: function(path2) {
    assertPath(path2);
    path2 = this.toPosix(path2);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var preDotState = 0;
    for (var i = path2.length - 1; i >= 0; --i) {
      var code = path2.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46) {
        if (startDot === -1) {
          startDot = i;
        } else if (preDotState !== 1) {
          preDotState = 1;
        }
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return "";
    }
    return path2.slice(startDot, end);
  },
  parse: function(path2) {
    assertPath(path2);
    var ret = { root: "", dir: "", base: "", ext: "", name: "" };
    if (path2.length === 0) {
      return ret;
    }
    path2 = this.toPosix(path2);
    var code = path2.charCodeAt(0);
    var isAbsolute = this.isAbsolute(path2);
    var start;
    ret.root = this.rootname(path2);
    if (isAbsolute || this.hasProtocol(path2)) {
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path2.length - 1;
    var preDotState = 0;
    for (; i >= start; --i) {
      code = path2.charCodeAt(i);
      if (code === 47) {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46) {
        if (startDot === -1) {
          startDot = i;
        } else if (preDotState !== 1) {
          preDotState = 1;
        }
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) {
          ret.base = ret.name = path2.slice(1, end);
        } else {
          ret.base = ret.name = path2.slice(startPart, end);
        }
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path2.slice(1, startDot);
        ret.base = path2.slice(1, end);
      } else {
        ret.name = path2.slice(startPart, startDot);
        ret.base = path2.slice(startPart, end);
      }
      ret.ext = path2.slice(startDot, end);
    }
    ret.dir = this.dirname(path2);
    return ret;
  },
  sep: "/",
  delimiter: ":"
};
settings.RETINA_PREFIX = /@([0-9\.]+)x/;
settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
var saidHello = false;
var VERSION$1 = "6.5.8";
function skipHello() {
  saidHello = true;
}
function sayHello(type) {
  var _a2;
  if (saidHello) {
    return;
  }
  if (settings.ADAPTER.getNavigator().userAgent.toLowerCase().indexOf("chrome") > -1) {
    var args = [
      "\n %c %c %c PixiJS " + VERSION$1 + " - ✰ " + type + " ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n",
      "background: #ff66a5; padding:5px 0;",
      "background: #ff66a5; padding:5px 0;",
      "color: #ff66a5; background: #030307; padding:5px 0;",
      "background: #ff66a5; padding:5px 0;",
      "background: #ffc3dc; padding:5px 0;",
      "background: #ff66a5; padding:5px 0;",
      "color: #ff2424; background: #fff; padding:5px 0;",
      "color: #ff2424; background: #fff; padding:5px 0;",
      "color: #ff2424; background: #fff; padding:5px 0;"
    ];
    (_a2 = globalThis.console).log.apply(_a2, args);
  } else if (globalThis.console) {
    globalThis.console.log("PixiJS " + VERSION$1 + " - " + type + " - http://www.pixijs.com/");
  }
  saidHello = true;
}
var supported;
function isWebGLSupported() {
  if (typeof supported === "undefined") {
    supported = function supported2() {
      var contextOptions = {
        stencil: true,
        failIfMajorPerformanceCaveat: settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT
      };
      try {
        if (!settings.ADAPTER.getWebGLRenderingContext()) {
          return false;
        }
        var canvas = settings.ADAPTER.createCanvas();
        var gl = canvas.getContext("webgl", contextOptions) || canvas.getContext("experimental-webgl", contextOptions);
        var success = !!(gl && gl.getContextAttributes().stencil);
        if (gl) {
          var loseContext = gl.getExtension("WEBGL_lose_context");
          if (loseContext) {
            loseContext.loseContext();
          }
        }
        gl = null;
        return success;
      } catch (e) {
        return false;
      }
    }();
  }
  return supported;
}
var aliceblue = "#f0f8ff";
var antiquewhite = "#faebd7";
var aqua = "#00ffff";
var aquamarine = "#7fffd4";
var azure = "#f0ffff";
var beige = "#f5f5dc";
var bisque = "#ffe4c4";
var black = "#000000";
var blanchedalmond = "#ffebcd";
var blue = "#0000ff";
var blueviolet = "#8a2be2";
var brown = "#a52a2a";
var burlywood = "#deb887";
var cadetblue = "#5f9ea0";
var chartreuse = "#7fff00";
var chocolate = "#d2691e";
var coral = "#ff7f50";
var cornflowerblue = "#6495ed";
var cornsilk = "#fff8dc";
var crimson = "#dc143c";
var cyan = "#00ffff";
var darkblue = "#00008b";
var darkcyan = "#008b8b";
var darkgoldenrod = "#b8860b";
var darkgray = "#a9a9a9";
var darkgreen = "#006400";
var darkgrey = "#a9a9a9";
var darkkhaki = "#bdb76b";
var darkmagenta = "#8b008b";
var darkolivegreen = "#556b2f";
var darkorange = "#ff8c00";
var darkorchid = "#9932cc";
var darkred = "#8b0000";
var darksalmon = "#e9967a";
var darkseagreen = "#8fbc8f";
var darkslateblue = "#483d8b";
var darkslategray = "#2f4f4f";
var darkslategrey = "#2f4f4f";
var darkturquoise = "#00ced1";
var darkviolet = "#9400d3";
var deeppink = "#ff1493";
var deepskyblue = "#00bfff";
var dimgray = "#696969";
var dimgrey = "#696969";
var dodgerblue = "#1e90ff";
var firebrick = "#b22222";
var floralwhite = "#fffaf0";
var forestgreen = "#228b22";
var fuchsia = "#ff00ff";
var gainsboro = "#dcdcdc";
var ghostwhite = "#f8f8ff";
var goldenrod = "#daa520";
var gold = "#ffd700";
var gray = "#808080";
var green = "#008000";
var greenyellow = "#adff2f";
var grey = "#808080";
var honeydew = "#f0fff0";
var hotpink = "#ff69b4";
var indianred = "#cd5c5c";
var indigo = "#4b0082";
var ivory = "#fffff0";
var khaki = "#f0e68c";
var lavenderblush = "#fff0f5";
var lavender = "#e6e6fa";
var lawngreen = "#7cfc00";
var lemonchiffon = "#fffacd";
var lightblue = "#add8e6";
var lightcoral = "#f08080";
var lightcyan = "#e0ffff";
var lightgoldenrodyellow = "#fafad2";
var lightgray = "#d3d3d3";
var lightgreen = "#90ee90";
var lightgrey = "#d3d3d3";
var lightpink = "#ffb6c1";
var lightsalmon = "#ffa07a";
var lightseagreen = "#20b2aa";
var lightskyblue = "#87cefa";
var lightslategray = "#778899";
var lightslategrey = "#778899";
var lightsteelblue = "#b0c4de";
var lightyellow = "#ffffe0";
var lime = "#00ff00";
var limegreen = "#32cd32";
var linen = "#faf0e6";
var magenta = "#ff00ff";
var maroon = "#800000";
var mediumaquamarine = "#66cdaa";
var mediumblue = "#0000cd";
var mediumorchid = "#ba55d3";
var mediumpurple = "#9370db";
var mediumseagreen = "#3cb371";
var mediumslateblue = "#7b68ee";
var mediumspringgreen = "#00fa9a";
var mediumturquoise = "#48d1cc";
var mediumvioletred = "#c71585";
var midnightblue = "#191970";
var mintcream = "#f5fffa";
var mistyrose = "#ffe4e1";
var moccasin = "#ffe4b5";
var navajowhite = "#ffdead";
var navy = "#000080";
var oldlace = "#fdf5e6";
var olive = "#808000";
var olivedrab = "#6b8e23";
var orange = "#ffa500";
var orangered = "#ff4500";
var orchid = "#da70d6";
var palegoldenrod = "#eee8aa";
var palegreen = "#98fb98";
var paleturquoise = "#afeeee";
var palevioletred = "#db7093";
var papayawhip = "#ffefd5";
var peachpuff = "#ffdab9";
var peru = "#cd853f";
var pink = "#ffc0cb";
var plum = "#dda0dd";
var powderblue = "#b0e0e6";
var purple = "#800080";
var rebeccapurple = "#663399";
var red = "#ff0000";
var rosybrown = "#bc8f8f";
var royalblue = "#4169e1";
var saddlebrown = "#8b4513";
var salmon = "#fa8072";
var sandybrown = "#f4a460";
var seagreen = "#2e8b57";
var seashell = "#fff5ee";
var sienna = "#a0522d";
var silver = "#c0c0c0";
var skyblue = "#87ceeb";
var slateblue = "#6a5acd";
var slategray = "#708090";
var slategrey = "#708090";
var snow = "#fffafa";
var springgreen = "#00ff7f";
var steelblue = "#4682b4";
var tan = "#d2b48c";
var teal = "#008080";
var thistle = "#d8bfd8";
var tomato = "#ff6347";
var turquoise = "#40e0d0";
var violet = "#ee82ee";
var wheat = "#f5deb3";
var white = "#ffffff";
var whitesmoke = "#f5f5f5";
var yellow = "#ffff00";
var yellowgreen = "#9acd32";
var cssColorNames = {
  aliceblue,
  antiquewhite,
  aqua,
  aquamarine,
  azure,
  beige,
  bisque,
  black,
  blanchedalmond,
  blue,
  blueviolet,
  brown,
  burlywood,
  cadetblue,
  chartreuse,
  chocolate,
  coral,
  cornflowerblue,
  cornsilk,
  crimson,
  cyan,
  darkblue,
  darkcyan,
  darkgoldenrod,
  darkgray,
  darkgreen,
  darkgrey,
  darkkhaki,
  darkmagenta,
  darkolivegreen,
  darkorange,
  darkorchid,
  darkred,
  darksalmon,
  darkseagreen,
  darkslateblue,
  darkslategray,
  darkslategrey,
  darkturquoise,
  darkviolet,
  deeppink,
  deepskyblue,
  dimgray,
  dimgrey,
  dodgerblue,
  firebrick,
  floralwhite,
  forestgreen,
  fuchsia,
  gainsboro,
  ghostwhite,
  goldenrod,
  gold,
  gray,
  green,
  greenyellow,
  grey,
  honeydew,
  hotpink,
  indianred,
  indigo,
  ivory,
  khaki,
  lavenderblush,
  lavender,
  lawngreen,
  lemonchiffon,
  lightblue,
  lightcoral,
  lightcyan,
  lightgoldenrodyellow,
  lightgray,
  lightgreen,
  lightgrey,
  lightpink,
  lightsalmon,
  lightseagreen,
  lightskyblue,
  lightslategray,
  lightslategrey,
  lightsteelblue,
  lightyellow,
  lime,
  limegreen,
  linen,
  magenta,
  maroon,
  mediumaquamarine,
  mediumblue,
  mediumorchid,
  mediumpurple,
  mediumseagreen,
  mediumslateblue,
  mediumspringgreen,
  mediumturquoise,
  mediumvioletred,
  midnightblue,
  mintcream,
  mistyrose,
  moccasin,
  navajowhite,
  navy,
  oldlace,
  olive,
  olivedrab,
  orange,
  orangered,
  orchid,
  palegoldenrod,
  palegreen,
  paleturquoise,
  palevioletred,
  papayawhip,
  peachpuff,
  peru,
  pink,
  plum,
  powderblue,
  purple,
  rebeccapurple,
  red,
  rosybrown,
  royalblue,
  saddlebrown,
  salmon,
  sandybrown,
  seagreen,
  seashell,
  sienna,
  silver,
  skyblue,
  slateblue,
  slategray,
  slategrey,
  snow,
  springgreen,
  steelblue,
  tan,
  teal,
  thistle,
  tomato,
  turquoise,
  violet,
  wheat,
  white,
  whitesmoke,
  yellow,
  yellowgreen
};
function hex2rgb(hex, out) {
  if (out === void 0) {
    out = [];
  }
  out[0] = (hex >> 16 & 255) / 255;
  out[1] = (hex >> 8 & 255) / 255;
  out[2] = (hex & 255) / 255;
  return out;
}
function hex2string(hex) {
  var hexString = hex.toString(16);
  hexString = "000000".substring(0, 6 - hexString.length) + hexString;
  return "#" + hexString;
}
function string2hex(string) {
  if (typeof string === "string") {
    string = cssColorNames[string.toLowerCase()] || string;
    if (string[0] === "#") {
      string = string.slice(1);
    }
  }
  return parseInt(string, 16);
}
function rgb2hex(rgb) {
  return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + (rgb[2] * 255 | 0);
}
function mapPremultipliedBlendModes() {
  var pm = [];
  var npm = [];
  for (var i = 0; i < 32; i++) {
    pm[i] = i;
    npm[i] = i;
  }
  pm[BLEND_MODES.NORMAL_NPM] = BLEND_MODES.NORMAL;
  pm[BLEND_MODES.ADD_NPM] = BLEND_MODES.ADD;
  pm[BLEND_MODES.SCREEN_NPM] = BLEND_MODES.SCREEN;
  npm[BLEND_MODES.NORMAL] = BLEND_MODES.NORMAL_NPM;
  npm[BLEND_MODES.ADD] = BLEND_MODES.ADD_NPM;
  npm[BLEND_MODES.SCREEN] = BLEND_MODES.SCREEN_NPM;
  var array = [];
  array.push(npm);
  array.push(pm);
  return array;
}
var premultiplyBlendMode = mapPremultipliedBlendModes();
function correctBlendMode(blendMode, premultiplied) {
  return premultiplyBlendMode[premultiplied ? 1 : 0][blendMode];
}
function premultiplyRgba(rgb, alpha, out, premultiply) {
  out = out || new Float32Array(4);
  if (premultiply || premultiply === void 0) {
    out[0] = rgb[0] * alpha;
    out[1] = rgb[1] * alpha;
    out[2] = rgb[2] * alpha;
  } else {
    out[0] = rgb[0];
    out[1] = rgb[1];
    out[2] = rgb[2];
  }
  out[3] = alpha;
  return out;
}
function premultiplyTint(tint, alpha) {
  if (alpha === 1) {
    return (alpha * 255 << 24) + tint;
  }
  if (alpha === 0) {
    return 0;
  }
  var R = tint >> 16 & 255;
  var G = tint >> 8 & 255;
  var B = tint & 255;
  R = R * alpha + 0.5 | 0;
  G = G * alpha + 0.5 | 0;
  B = B * alpha + 0.5 | 0;
  return (alpha * 255 << 24) + (R << 16) + (G << 8) + B;
}
function premultiplyTintToRgba(tint, alpha, out, premultiply) {
  out = out || new Float32Array(4);
  out[0] = (tint >> 16 & 255) / 255;
  out[1] = (tint >> 8 & 255) / 255;
  out[2] = (tint & 255) / 255;
  if (premultiply || premultiply === void 0) {
    out[0] *= alpha;
    out[1] *= alpha;
    out[2] *= alpha;
  }
  out[3] = alpha;
  return out;
}
function createIndicesForQuads(size, outBuffer) {
  if (outBuffer === void 0) {
    outBuffer = null;
  }
  var totalIndices = size * 6;
  outBuffer = outBuffer || new Uint16Array(totalIndices);
  if (outBuffer.length !== totalIndices) {
    throw new Error("Out buffer length is incorrect, got " + outBuffer.length + " and expected " + totalIndices);
  }
  for (var i = 0, j = 0; i < totalIndices; i += 6, j += 4) {
    outBuffer[i + 0] = j + 0;
    outBuffer[i + 1] = j + 1;
    outBuffer[i + 2] = j + 2;
    outBuffer[i + 3] = j + 0;
    outBuffer[i + 4] = j + 2;
    outBuffer[i + 5] = j + 3;
  }
  return outBuffer;
}
function getBufferType(array) {
  if (array.BYTES_PER_ELEMENT === 4) {
    if (array instanceof Float32Array) {
      return "Float32Array";
    } else if (array instanceof Uint32Array) {
      return "Uint32Array";
    }
    return "Int32Array";
  } else if (array.BYTES_PER_ELEMENT === 2) {
    if (array instanceof Uint16Array) {
      return "Uint16Array";
    }
  } else if (array.BYTES_PER_ELEMENT === 1) {
    if (array instanceof Uint8Array) {
      return "Uint8Array";
    }
  }
  return null;
}
var map$3 = { Float32Array, Uint32Array, Int32Array, Uint8Array };
function interleaveTypedArrays$1(arrays, sizes) {
  var outSize = 0;
  var stride = 0;
  var views = {};
  for (var i = 0; i < arrays.length; i++) {
    stride += sizes[i];
    outSize += arrays[i].length;
  }
  var buffer = new ArrayBuffer(outSize * 4);
  var out = null;
  var littleOffset = 0;
  for (var i = 0; i < arrays.length; i++) {
    var size = sizes[i];
    var array = arrays[i];
    var type = getBufferType(array);
    if (!views[type]) {
      views[type] = new map$3[type](buffer);
    }
    out = views[type];
    for (var j = 0; j < array.length; j++) {
      var indexStart = (j / size | 0) * stride + littleOffset;
      var index2 = j % size;
      out[indexStart + index2] = array[j];
    }
    littleOffset += size;
  }
  return new Float32Array(buffer);
}
function nextPow2(v) {
  v += v === 0 ? 1 : 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}
function isPow2(v) {
  return !(v & v - 1) && !!v;
}
function log2(v) {
  var r = (v > 65535 ? 1 : 0) << 4;
  v >>>= r;
  var shift = (v > 255 ? 1 : 0) << 3;
  v >>>= shift;
  r |= shift;
  shift = (v > 15 ? 1 : 0) << 2;
  v >>>= shift;
  r |= shift;
  shift = (v > 3 ? 1 : 0) << 1;
  v >>>= shift;
  r |= shift;
  return r | v >> 1;
}
function removeItems(arr, startIdx, removeCount) {
  var length = arr.length;
  var i;
  if (startIdx >= length || removeCount === 0) {
    return;
  }
  removeCount = startIdx + removeCount > length ? length - startIdx : removeCount;
  var len = length - removeCount;
  for (i = startIdx; i < len; ++i) {
    arr[i] = arr[i + removeCount];
  }
  arr.length = len;
}
function sign(n) {
  if (n === 0) {
    return 0;
  }
  return n < 0 ? -1 : 1;
}
var nextUid = 0;
function uid() {
  return ++nextUid;
}
var warnings = {};
function deprecation(version, message, ignoreDepth) {
  if (ignoreDepth === void 0) {
    ignoreDepth = 3;
  }
  if (warnings[message]) {
    return;
  }
  var stack = new Error().stack;
  if (typeof stack === "undefined") {
    console.warn("PixiJS Deprecation Warning: ", message + "\nDeprecated since v" + version);
  } else {
    stack = stack.split("\n").splice(ignoreDepth).join("\n");
    if (console.groupCollapsed) {
      console.groupCollapsed("%cPixiJS Deprecation Warning: %c%s", "color:#614108;background:#fffbe6", "font-weight:normal;color:#614108;background:#fffbe6", message + "\nDeprecated since v" + version);
      console.warn(stack);
      console.groupEnd();
    } else {
      console.warn("PixiJS Deprecation Warning: ", message + "\nDeprecated since v" + version);
      console.warn(stack);
    }
  }
  warnings[message] = true;
}
var ProgramCache = {};
var TextureCache = /* @__PURE__ */ Object.create(null);
var BaseTextureCache = /* @__PURE__ */ Object.create(null);
function destroyTextureCache() {
  var key;
  for (key in TextureCache) {
    TextureCache[key].destroy();
  }
  for (key in BaseTextureCache) {
    BaseTextureCache[key].destroy();
  }
}
function clearTextureCache() {
  var key;
  for (key in TextureCache) {
    delete TextureCache[key];
  }
  for (key in BaseTextureCache) {
    delete BaseTextureCache[key];
  }
}
var CanvasRenderTarget = function() {
  function CanvasRenderTarget2(width, height, resolution) {
    this.canvas = settings.ADAPTER.createCanvas();
    this.context = this.canvas.getContext("2d");
    this.resolution = resolution || settings.RESOLUTION;
    this.resize(width, height);
  }
  CanvasRenderTarget2.prototype.clear = function() {
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  CanvasRenderTarget2.prototype.resize = function(desiredWidth, desiredHeight) {
    this.canvas.width = Math.round(desiredWidth * this.resolution);
    this.canvas.height = Math.round(desiredHeight * this.resolution);
  };
  CanvasRenderTarget2.prototype.destroy = function() {
    this.context = null;
    this.canvas = null;
  };
  Object.defineProperty(CanvasRenderTarget2.prototype, "width", {
    get: function() {
      return this.canvas.width;
    },
    set: function(val) {
      this.canvas.width = Math.round(val);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(CanvasRenderTarget2.prototype, "height", {
    get: function() {
      return this.canvas.height;
    },
    set: function(val) {
      this.canvas.height = Math.round(val);
    },
    enumerable: false,
    configurable: true
  });
  return CanvasRenderTarget2;
}();
function trimCanvas(canvas) {
  var width = canvas.width;
  var height = canvas.height;
  var context2 = canvas.getContext("2d", {
    willReadFrequently: true
  });
  var imageData = context2.getImageData(0, 0, width, height);
  var pixels = imageData.data;
  var len = pixels.length;
  var bound = {
    top: null,
    left: null,
    right: null,
    bottom: null
  };
  var data = null;
  var i;
  var x;
  var y;
  for (i = 0; i < len; i += 4) {
    if (pixels[i + 3] !== 0) {
      x = i / 4 % width;
      y = ~~(i / 4 / width);
      if (bound.top === null) {
        bound.top = y;
      }
      if (bound.left === null) {
        bound.left = x;
      } else if (x < bound.left) {
        bound.left = x;
      }
      if (bound.right === null) {
        bound.right = x + 1;
      } else if (bound.right < x) {
        bound.right = x + 1;
      }
      if (bound.bottom === null) {
        bound.bottom = y;
      } else if (bound.bottom < y) {
        bound.bottom = y;
      }
    }
  }
  if (bound.top !== null) {
    width = bound.right - bound.left;
    height = bound.bottom - bound.top + 1;
    data = context2.getImageData(bound.left, bound.top, width, height);
  }
  return {
    height,
    width,
    data
  };
}
var DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;
function decomposeDataUri(dataUri) {
  var dataUriMatch = DATA_URI.exec(dataUri);
  if (dataUriMatch) {
    return {
      mediaType: dataUriMatch[1] ? dataUriMatch[1].toLowerCase() : void 0,
      subType: dataUriMatch[2] ? dataUriMatch[2].toLowerCase() : void 0,
      charset: dataUriMatch[3] ? dataUriMatch[3].toLowerCase() : void 0,
      encoding: dataUriMatch[4] ? dataUriMatch[4].toLowerCase() : void 0,
      data: dataUriMatch[5]
    };
  }
  return void 0;
}
var tempAnchor$1;
function determineCrossOrigin(url$1, loc) {
  if (loc === void 0) {
    loc = globalThis.location;
  }
  if (url$1.indexOf("data:") === 0) {
    return "";
  }
  loc = loc || globalThis.location;
  if (!tempAnchor$1) {
    tempAnchor$1 = document.createElement("a");
  }
  tempAnchor$1.href = url$1;
  var parsedUrl = url.parse(tempAnchor$1.href);
  var samePort = !parsedUrl.port && loc.port === "" || parsedUrl.port === loc.port;
  if (parsedUrl.hostname !== loc.hostname || !samePort || parsedUrl.protocol !== loc.protocol) {
    return "anonymous";
  }
  return "";
}
function getResolutionOfUrl(url2, defaultValue2) {
  var resolution = settings.RETINA_PREFIX.exec(url2);
  if (resolution) {
    return parseFloat(resolution[1]);
  }
  return defaultValue2 !== void 0 ? defaultValue2 : 1;
}
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaseTextureCache,
  CanvasRenderTarget,
  DATA_URI,
  ProgramCache,
  TextureCache,
  clearTextureCache,
  correctBlendMode,
  createIndicesForQuads,
  decomposeDataUri,
  deprecation,
  destroyTextureCache,
  determineCrossOrigin,
  getBufferType,
  getResolutionOfUrl,
  hex2rgb,
  hex2string,
  interleaveTypedArrays: interleaveTypedArrays$1,
  isPow2,
  isWebGLSupported,
  log2,
  nextPow2,
  path,
  premultiplyBlendMode,
  premultiplyRgba,
  premultiplyTint,
  premultiplyTintToRgba,
  removeItems,
  rgb2hex,
  sayHello,
  sign,
  skipHello,
  string2hex,
  trimCanvas,
  uid,
  url,
  isMobile,
  EventEmitter,
  earcut: earcut$1.exports
}, Symbol.toStringTag, { value: "Module" }));
var PI_2 = Math.PI * 2;
var RAD_TO_DEG = 180 / Math.PI;
var DEG_TO_RAD = Math.PI / 180;
var SHAPES;
(function(SHAPES2) {
  SHAPES2[SHAPES2["POLY"] = 0] = "POLY";
  SHAPES2[SHAPES2["RECT"] = 1] = "RECT";
  SHAPES2[SHAPES2["CIRC"] = 2] = "CIRC";
  SHAPES2[SHAPES2["ELIP"] = 3] = "ELIP";
  SHAPES2[SHAPES2["RREC"] = 4] = "RREC";
})(SHAPES || (SHAPES = {}));
var Point = function() {
  function Point2(x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    this.x = 0;
    this.y = 0;
    this.x = x;
    this.y = y;
  }
  Point2.prototype.clone = function() {
    return new Point2(this.x, this.y);
  };
  Point2.prototype.copyFrom = function(p) {
    this.set(p.x, p.y);
    return this;
  };
  Point2.prototype.copyTo = function(p) {
    p.set(this.x, this.y);
    return p;
  };
  Point2.prototype.equals = function(p) {
    return p.x === this.x && p.y === this.y;
  };
  Point2.prototype.set = function(x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = x;
    }
    this.x = x;
    this.y = y;
    return this;
  };
  Point2.prototype.toString = function() {
    return "[@pixi/math:Point x=" + this.x + " y=" + this.y + "]";
  };
  return Point2;
}();
var tempPoints$1 = [new Point(), new Point(), new Point(), new Point()];
var Rectangle = function() {
  function Rectangle2(x, y, width, height) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    this.x = Number(x);
    this.y = Number(y);
    this.width = Number(width);
    this.height = Number(height);
    this.type = SHAPES.RECT;
  }
  Object.defineProperty(Rectangle2.prototype, "left", {
    get: function() {
      return this.x;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Rectangle2.prototype, "right", {
    get: function() {
      return this.x + this.width;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Rectangle2.prototype, "top", {
    get: function() {
      return this.y;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Rectangle2.prototype, "bottom", {
    get: function() {
      return this.y + this.height;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Rectangle2, "EMPTY", {
    get: function() {
      return new Rectangle2(0, 0, 0, 0);
    },
    enumerable: false,
    configurable: true
  });
  Rectangle2.prototype.clone = function() {
    return new Rectangle2(this.x, this.y, this.width, this.height);
  };
  Rectangle2.prototype.copyFrom = function(rectangle) {
    this.x = rectangle.x;
    this.y = rectangle.y;
    this.width = rectangle.width;
    this.height = rectangle.height;
    return this;
  };
  Rectangle2.prototype.copyTo = function(rectangle) {
    rectangle.x = this.x;
    rectangle.y = this.y;
    rectangle.width = this.width;
    rectangle.height = this.height;
    return rectangle;
  };
  Rectangle2.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }
    if (x >= this.x && x < this.x + this.width) {
      if (y >= this.y && y < this.y + this.height) {
        return true;
      }
    }
    return false;
  };
  Rectangle2.prototype.intersects = function(other, transform) {
    if (!transform) {
      var x0_1 = this.x < other.x ? other.x : this.x;
      var x1_1 = this.right > other.right ? other.right : this.right;
      if (x1_1 <= x0_1) {
        return false;
      }
      var y0_1 = this.y < other.y ? other.y : this.y;
      var y1_1 = this.bottom > other.bottom ? other.bottom : this.bottom;
      return y1_1 > y0_1;
    }
    var x0 = this.left;
    var x1 = this.right;
    var y0 = this.top;
    var y1 = this.bottom;
    if (x1 <= x0 || y1 <= y0) {
      return false;
    }
    var lt = tempPoints$1[0].set(other.left, other.top);
    var lb = tempPoints$1[1].set(other.left, other.bottom);
    var rt = tempPoints$1[2].set(other.right, other.top);
    var rb = tempPoints$1[3].set(other.right, other.bottom);
    if (rt.x <= lt.x || lb.y <= lt.y) {
      return false;
    }
    var s = Math.sign(transform.a * transform.d - transform.b * transform.c);
    if (s === 0) {
      return false;
    }
    transform.apply(lt, lt);
    transform.apply(lb, lb);
    transform.apply(rt, rt);
    transform.apply(rb, rb);
    if (Math.max(lt.x, lb.x, rt.x, rb.x) <= x0 || Math.min(lt.x, lb.x, rt.x, rb.x) >= x1 || Math.max(lt.y, lb.y, rt.y, rb.y) <= y0 || Math.min(lt.y, lb.y, rt.y, rb.y) >= y1) {
      return false;
    }
    var nx = s * (lb.y - lt.y);
    var ny = s * (lt.x - lb.x);
    var n00 = nx * x0 + ny * y0;
    var n10 = nx * x1 + ny * y0;
    var n01 = nx * x0 + ny * y1;
    var n11 = nx * x1 + ny * y1;
    if (Math.max(n00, n10, n01, n11) <= nx * lt.x + ny * lt.y || Math.min(n00, n10, n01, n11) >= nx * rb.x + ny * rb.y) {
      return false;
    }
    var mx = s * (lt.y - rt.y);
    var my = s * (rt.x - lt.x);
    var m00 = mx * x0 + my * y0;
    var m10 = mx * x1 + my * y0;
    var m01 = mx * x0 + my * y1;
    var m11 = mx * x1 + my * y1;
    if (Math.max(m00, m10, m01, m11) <= mx * lt.x + my * lt.y || Math.min(m00, m10, m01, m11) >= mx * rb.x + my * rb.y) {
      return false;
    }
    return true;
  };
  Rectangle2.prototype.pad = function(paddingX, paddingY) {
    if (paddingX === void 0) {
      paddingX = 0;
    }
    if (paddingY === void 0) {
      paddingY = paddingX;
    }
    this.x -= paddingX;
    this.y -= paddingY;
    this.width += paddingX * 2;
    this.height += paddingY * 2;
    return this;
  };
  Rectangle2.prototype.fit = function(rectangle) {
    var x1 = Math.max(this.x, rectangle.x);
    var x2 = Math.min(this.x + this.width, rectangle.x + rectangle.width);
    var y1 = Math.max(this.y, rectangle.y);
    var y2 = Math.min(this.y + this.height, rectangle.y + rectangle.height);
    this.x = x1;
    this.width = Math.max(x2 - x1, 0);
    this.y = y1;
    this.height = Math.max(y2 - y1, 0);
    return this;
  };
  Rectangle2.prototype.ceil = function(resolution, eps) {
    if (resolution === void 0) {
      resolution = 1;
    }
    if (eps === void 0) {
      eps = 1e-3;
    }
    var x2 = Math.ceil((this.x + this.width - eps) * resolution) / resolution;
    var y2 = Math.ceil((this.y + this.height - eps) * resolution) / resolution;
    this.x = Math.floor((this.x + eps) * resolution) / resolution;
    this.y = Math.floor((this.y + eps) * resolution) / resolution;
    this.width = x2 - this.x;
    this.height = y2 - this.y;
    return this;
  };
  Rectangle2.prototype.enlarge = function(rectangle) {
    var x1 = Math.min(this.x, rectangle.x);
    var x2 = Math.max(this.x + this.width, rectangle.x + rectangle.width);
    var y1 = Math.min(this.y, rectangle.y);
    var y2 = Math.max(this.y + this.height, rectangle.y + rectangle.height);
    this.x = x1;
    this.width = x2 - x1;
    this.y = y1;
    this.height = y2 - y1;
    return this;
  };
  Rectangle2.prototype.toString = function() {
    return "[@pixi/math:Rectangle x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + "]";
  };
  return Rectangle2;
}();
var Circle = function() {
  function Circle2(x, y, radius) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (radius === void 0) {
      radius = 0;
    }
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = SHAPES.CIRC;
  }
  Circle2.prototype.clone = function() {
    return new Circle2(this.x, this.y, this.radius);
  };
  Circle2.prototype.contains = function(x, y) {
    if (this.radius <= 0) {
      return false;
    }
    var r2 = this.radius * this.radius;
    var dx = this.x - x;
    var dy = this.y - y;
    dx *= dx;
    dy *= dy;
    return dx + dy <= r2;
  };
  Circle2.prototype.getBounds = function() {
    return new Rectangle(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  };
  Circle2.prototype.toString = function() {
    return "[@pixi/math:Circle x=" + this.x + " y=" + this.y + " radius=" + this.radius + "]";
  };
  return Circle2;
}();
var Ellipse = function() {
  function Ellipse2(x, y, halfWidth, halfHeight) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (halfWidth === void 0) {
      halfWidth = 0;
    }
    if (halfHeight === void 0) {
      halfHeight = 0;
    }
    this.x = x;
    this.y = y;
    this.width = halfWidth;
    this.height = halfHeight;
    this.type = SHAPES.ELIP;
  }
  Ellipse2.prototype.clone = function() {
    return new Ellipse2(this.x, this.y, this.width, this.height);
  };
  Ellipse2.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }
    var normx = (x - this.x) / this.width;
    var normy = (y - this.y) / this.height;
    normx *= normx;
    normy *= normy;
    return normx + normy <= 1;
  };
  Ellipse2.prototype.getBounds = function() {
    return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
  };
  Ellipse2.prototype.toString = function() {
    return "[@pixi/math:Ellipse x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + "]";
  };
  return Ellipse2;
}();
var Polygon$1 = function() {
  function Polygon2() {
    var arguments$1 = arguments;
    var points = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      points[_i] = arguments$1[_i];
    }
    var flat = Array.isArray(points[0]) ? points[0] : points;
    if (typeof flat[0] !== "number") {
      var p = [];
      for (var i = 0, il = flat.length; i < il; i++) {
        p.push(flat[i].x, flat[i].y);
      }
      flat = p;
    }
    this.points = flat;
    this.type = SHAPES.POLY;
    this.closeStroke = true;
  }
  Polygon2.prototype.clone = function() {
    var points = this.points.slice();
    var polygon = new Polygon2(points);
    polygon.closeStroke = this.closeStroke;
    return polygon;
  };
  Polygon2.prototype.contains = function(x, y) {
    var inside = false;
    var length = this.points.length / 2;
    for (var i = 0, j = length - 1; i < length; j = i++) {
      var xi = this.points[i * 2];
      var yi = this.points[i * 2 + 1];
      var xj = this.points[j * 2];
      var yj = this.points[j * 2 + 1];
      var intersect = yi > y !== yj > y && x < (xj - xi) * ((y - yi) / (yj - yi)) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  };
  Polygon2.prototype.toString = function() {
    return "[@pixi/math:Polygon" + ("closeStroke=" + this.closeStroke) + ("points=" + this.points.reduce(function(pointsDesc, currentPoint) {
      return pointsDesc + ", " + currentPoint;
    }, "") + "]");
  };
  return Polygon2;
}();
var RoundedRectangle = function() {
  function RoundedRectangle2(x, y, width, height, radius) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    if (radius === void 0) {
      radius = 20;
    }
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.type = SHAPES.RREC;
  }
  RoundedRectangle2.prototype.clone = function() {
    return new RoundedRectangle2(this.x, this.y, this.width, this.height, this.radius);
  };
  RoundedRectangle2.prototype.contains = function(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }
    if (x >= this.x && x <= this.x + this.width) {
      if (y >= this.y && y <= this.y + this.height) {
        var radius = Math.max(0, Math.min(this.radius, Math.min(this.width, this.height) / 2));
        if (y >= this.y + radius && y <= this.y + this.height - radius || x >= this.x + radius && x <= this.x + this.width - radius) {
          return true;
        }
        var dx = x - (this.x + radius);
        var dy = y - (this.y + radius);
        var radius2 = radius * radius;
        if (dx * dx + dy * dy <= radius2) {
          return true;
        }
        dx = x - (this.x + this.width - radius);
        if (dx * dx + dy * dy <= radius2) {
          return true;
        }
        dy = y - (this.y + this.height - radius);
        if (dx * dx + dy * dy <= radius2) {
          return true;
        }
        dx = x - (this.x + radius);
        if (dx * dx + dy * dy <= radius2) {
          return true;
        }
      }
    }
    return false;
  };
  RoundedRectangle2.prototype.toString = function() {
    return "[@pixi/math:RoundedRectangle x=" + this.x + " y=" + this.y + ("width=" + this.width + " height=" + this.height + " radius=" + this.radius + "]");
  };
  return RoundedRectangle2;
}();
var ObservablePoint = function() {
  function ObservablePoint2(cb, scope, x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    this._x = x;
    this._y = y;
    this.cb = cb;
    this.scope = scope;
  }
  ObservablePoint2.prototype.clone = function(cb, scope) {
    if (cb === void 0) {
      cb = this.cb;
    }
    if (scope === void 0) {
      scope = this.scope;
    }
    return new ObservablePoint2(cb, scope, this._x, this._y);
  };
  ObservablePoint2.prototype.set = function(x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = x;
    }
    if (this._x !== x || this._y !== y) {
      this._x = x;
      this._y = y;
      this.cb.call(this.scope);
    }
    return this;
  };
  ObservablePoint2.prototype.copyFrom = function(p) {
    if (this._x !== p.x || this._y !== p.y) {
      this._x = p.x;
      this._y = p.y;
      this.cb.call(this.scope);
    }
    return this;
  };
  ObservablePoint2.prototype.copyTo = function(p) {
    p.set(this._x, this._y);
    return p;
  };
  ObservablePoint2.prototype.equals = function(p) {
    return p.x === this._x && p.y === this._y;
  };
  ObservablePoint2.prototype.toString = function() {
    return "[@pixi/math:ObservablePoint x=" + 0 + " y=" + 0 + " scope=" + this.scope + "]";
  };
  Object.defineProperty(ObservablePoint2.prototype, "x", {
    get: function() {
      return this._x;
    },
    set: function(value) {
      if (this._x !== value) {
        this._x = value;
        this.cb.call(this.scope);
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ObservablePoint2.prototype, "y", {
    get: function() {
      return this._y;
    },
    set: function(value) {
      if (this._y !== value) {
        this._y = value;
        this.cb.call(this.scope);
      }
    },
    enumerable: false,
    configurable: true
  });
  return ObservablePoint2;
}();
var Matrix = function() {
  function Matrix2(a, b, c, d, tx, ty) {
    if (a === void 0) {
      a = 1;
    }
    if (b === void 0) {
      b = 0;
    }
    if (c === void 0) {
      c = 0;
    }
    if (d === void 0) {
      d = 1;
    }
    if (tx === void 0) {
      tx = 0;
    }
    if (ty === void 0) {
      ty = 0;
    }
    this.array = null;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }
  Matrix2.prototype.fromArray = function(array) {
    this.a = array[0];
    this.b = array[1];
    this.c = array[3];
    this.d = array[4];
    this.tx = array[2];
    this.ty = array[5];
  };
  Matrix2.prototype.set = function(a, b, c, d, tx, ty) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
    return this;
  };
  Matrix2.prototype.toArray = function(transpose, out) {
    if (!this.array) {
      this.array = new Float32Array(9);
    }
    var array = out || this.array;
    if (transpose) {
      array[0] = this.a;
      array[1] = this.b;
      array[2] = 0;
      array[3] = this.c;
      array[4] = this.d;
      array[5] = 0;
      array[6] = this.tx;
      array[7] = this.ty;
      array[8] = 1;
    } else {
      array[0] = this.a;
      array[1] = this.c;
      array[2] = this.tx;
      array[3] = this.b;
      array[4] = this.d;
      array[5] = this.ty;
      array[6] = 0;
      array[7] = 0;
      array[8] = 1;
    }
    return array;
  };
  Matrix2.prototype.apply = function(pos, newPos) {
    newPos = newPos || new Point();
    var x = pos.x;
    var y = pos.y;
    newPos.x = this.a * x + this.c * y + this.tx;
    newPos.y = this.b * x + this.d * y + this.ty;
    return newPos;
  };
  Matrix2.prototype.applyInverse = function(pos, newPos) {
    newPos = newPos || new Point();
    var id = 1 / (this.a * this.d + this.c * -this.b);
    var x = pos.x;
    var y = pos.y;
    newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
    newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;
    return newPos;
  };
  Matrix2.prototype.translate = function(x, y) {
    this.tx += x;
    this.ty += y;
    return this;
  };
  Matrix2.prototype.scale = function(x, y) {
    this.a *= x;
    this.d *= y;
    this.c *= x;
    this.b *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
  };
  Matrix2.prototype.rotate = function(angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;
    this.a = a1 * cos - this.b * sin;
    this.b = a1 * sin + this.b * cos;
    this.c = c1 * cos - this.d * sin;
    this.d = c1 * sin + this.d * cos;
    this.tx = tx1 * cos - this.ty * sin;
    this.ty = tx1 * sin + this.ty * cos;
    return this;
  };
  Matrix2.prototype.append = function(matrix) {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    this.a = matrix.a * a1 + matrix.b * c1;
    this.b = matrix.a * b1 + matrix.b * d1;
    this.c = matrix.c * a1 + matrix.d * c1;
    this.d = matrix.c * b1 + matrix.d * d1;
    this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
    this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;
    return this;
  };
  Matrix2.prototype.setTransform = function(x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY) {
    this.a = Math.cos(rotation + skewY) * scaleX;
    this.b = Math.sin(rotation + skewY) * scaleX;
    this.c = -Math.sin(rotation - skewX) * scaleY;
    this.d = Math.cos(rotation - skewX) * scaleY;
    this.tx = x - (pivotX * this.a + pivotY * this.c);
    this.ty = y - (pivotX * this.b + pivotY * this.d);
    return this;
  };
  Matrix2.prototype.prepend = function(matrix) {
    var tx1 = this.tx;
    if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
      var a1 = this.a;
      var c1 = this.c;
      this.a = a1 * matrix.a + this.b * matrix.c;
      this.b = a1 * matrix.b + this.b * matrix.d;
      this.c = c1 * matrix.a + this.d * matrix.c;
      this.d = c1 * matrix.b + this.d * matrix.d;
    }
    this.tx = tx1 * matrix.a + this.ty * matrix.c + matrix.tx;
    this.ty = tx1 * matrix.b + this.ty * matrix.d + matrix.ty;
    return this;
  };
  Matrix2.prototype.decompose = function(transform) {
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var pivot = transform.pivot;
    var skewX = -Math.atan2(-c, d);
    var skewY = Math.atan2(b, a);
    var delta = Math.abs(skewX + skewY);
    if (delta < 1e-5 || Math.abs(PI_2 - delta) < 1e-5) {
      transform.rotation = skewY;
      transform.skew.x = transform.skew.y = 0;
    } else {
      transform.rotation = 0;
      transform.skew.x = skewX;
      transform.skew.y = skewY;
    }
    transform.scale.x = Math.sqrt(a * a + b * b);
    transform.scale.y = Math.sqrt(c * c + d * d);
    transform.position.x = this.tx + (pivot.x * a + pivot.y * c);
    transform.position.y = this.ty + (pivot.x * b + pivot.y * d);
    return transform;
  };
  Matrix2.prototype.invert = function() {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var n = a1 * d1 - b1 * c1;
    this.a = d1 / n;
    this.b = -b1 / n;
    this.c = -c1 / n;
    this.d = a1 / n;
    this.tx = (c1 * this.ty - d1 * tx1) / n;
    this.ty = -(a1 * this.ty - b1 * tx1) / n;
    return this;
  };
  Matrix2.prototype.identity = function() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
    return this;
  };
  Matrix2.prototype.clone = function() {
    var matrix = new Matrix2();
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;
    return matrix;
  };
  Matrix2.prototype.copyTo = function(matrix) {
    matrix.a = this.a;
    matrix.b = this.b;
    matrix.c = this.c;
    matrix.d = this.d;
    matrix.tx = this.tx;
    matrix.ty = this.ty;
    return matrix;
  };
  Matrix2.prototype.copyFrom = function(matrix) {
    this.a = matrix.a;
    this.b = matrix.b;
    this.c = matrix.c;
    this.d = matrix.d;
    this.tx = matrix.tx;
    this.ty = matrix.ty;
    return this;
  };
  Matrix2.prototype.toString = function() {
    return "[@pixi/math:Matrix a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + "]";
  };
  Object.defineProperty(Matrix2, "IDENTITY", {
    get: function() {
      return new Matrix2();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Matrix2, "TEMP_MATRIX", {
    get: function() {
      return new Matrix2();
    },
    enumerable: false,
    configurable: true
  });
  return Matrix2;
}();
var ux = [1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1, 0, 1];
var uy = [0, 1, 1, 1, 0, -1, -1, -1, 0, 1, 1, 1, 0, -1, -1, -1];
var vx = [0, -1, -1, -1, 0, 1, 1, 1, 0, 1, 1, 1, 0, -1, -1, -1];
var vy = [1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, 1, 1, 1, 0, -1];
var rotationCayley = [];
var rotationMatrices = [];
var signum = Math.sign;
function init() {
  for (var i = 0; i < 16; i++) {
    var row = [];
    rotationCayley.push(row);
    for (var j = 0; j < 16; j++) {
      var _ux = signum(ux[i] * ux[j] + vx[i] * uy[j]);
      var _uy = signum(uy[i] * ux[j] + vy[i] * uy[j]);
      var _vx = signum(ux[i] * vx[j] + vx[i] * vy[j]);
      var _vy = signum(uy[i] * vx[j] + vy[i] * vy[j]);
      for (var k = 0; k < 16; k++) {
        if (ux[k] === _ux && uy[k] === _uy && vx[k] === _vx && vy[k] === _vy) {
          row.push(k);
          break;
        }
      }
    }
  }
  for (var i = 0; i < 16; i++) {
    var mat = new Matrix();
    mat.set(ux[i], uy[i], vx[i], vy[i], 0, 0);
    rotationMatrices.push(mat);
  }
}
init();
var groupD8 = {
  E: 0,
  SE: 1,
  S: 2,
  SW: 3,
  W: 4,
  NW: 5,
  N: 6,
  NE: 7,
  MIRROR_VERTICAL: 8,
  MAIN_DIAGONAL: 10,
  MIRROR_HORIZONTAL: 12,
  REVERSE_DIAGONAL: 14,
  uX: function(ind) {
    return ux[ind];
  },
  uY: function(ind) {
    return uy[ind];
  },
  vX: function(ind) {
    return vx[ind];
  },
  vY: function(ind) {
    return vy[ind];
  },
  inv: function(rotation) {
    if (rotation & 8) {
      return rotation & 15;
    }
    return -rotation & 7;
  },
  add: function(rotationSecond, rotationFirst) {
    return rotationCayley[rotationSecond][rotationFirst];
  },
  sub: function(rotationSecond, rotationFirst) {
    return rotationCayley[rotationSecond][groupD8.inv(rotationFirst)];
  },
  rotate180: function(rotation) {
    return rotation ^ 4;
  },
  isVertical: function(rotation) {
    return (rotation & 3) === 2;
  },
  byDirection: function(dx, dy) {
    if (Math.abs(dx) * 2 <= Math.abs(dy)) {
      if (dy >= 0) {
        return groupD8.S;
      }
      return groupD8.N;
    } else if (Math.abs(dy) * 2 <= Math.abs(dx)) {
      if (dx > 0) {
        return groupD8.E;
      }
      return groupD8.W;
    } else if (dy > 0) {
      if (dx > 0) {
        return groupD8.SE;
      }
      return groupD8.SW;
    } else if (dx > 0) {
      return groupD8.NE;
    }
    return groupD8.NW;
  },
  matrixAppendRotationInv: function(matrix, rotation, tx, ty) {
    if (tx === void 0) {
      tx = 0;
    }
    if (ty === void 0) {
      ty = 0;
    }
    var mat = rotationMatrices[groupD8.inv(rotation)];
    mat.tx = tx;
    mat.ty = ty;
    matrix.append(mat);
  }
};
var Transform = function() {
  function Transform2() {
    this.worldTransform = new Matrix();
    this.localTransform = new Matrix();
    this.position = new ObservablePoint(this.onChange, this, 0, 0);
    this.scale = new ObservablePoint(this.onChange, this, 1, 1);
    this.pivot = new ObservablePoint(this.onChange, this, 0, 0);
    this.skew = new ObservablePoint(this.updateSkew, this, 0, 0);
    this._rotation = 0;
    this._cx = 1;
    this._sx = 0;
    this._cy = 0;
    this._sy = 1;
    this._localID = 0;
    this._currentLocalID = 0;
    this._worldID = 0;
    this._parentID = 0;
  }
  Transform2.prototype.onChange = function() {
    this._localID++;
  };
  Transform2.prototype.updateSkew = function() {
    this._cx = Math.cos(this._rotation + this.skew.y);
    this._sx = Math.sin(this._rotation + this.skew.y);
    this._cy = -Math.sin(this._rotation - this.skew.x);
    this._sy = Math.cos(this._rotation - this.skew.x);
    this._localID++;
  };
  Transform2.prototype.toString = function() {
    return "[@pixi/math:Transform " + ("position=(" + this.position.x + ", " + this.position.y + ") ") + ("rotation=" + this.rotation + " ") + ("scale=(" + this.scale.x + ", " + this.scale.y + ") ") + ("skew=(" + this.skew.x + ", " + this.skew.y + ") ") + "]";
  };
  Transform2.prototype.updateLocalTransform = function() {
    var lt = this.localTransform;
    if (this._localID !== this._currentLocalID) {
      lt.a = this._cx * this.scale.x;
      lt.b = this._sx * this.scale.x;
      lt.c = this._cy * this.scale.y;
      lt.d = this._sy * this.scale.y;
      lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
      lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);
      this._currentLocalID = this._localID;
      this._parentID = -1;
    }
  };
  Transform2.prototype.updateTransform = function(parentTransform) {
    var lt = this.localTransform;
    if (this._localID !== this._currentLocalID) {
      lt.a = this._cx * this.scale.x;
      lt.b = this._sx * this.scale.x;
      lt.c = this._cy * this.scale.y;
      lt.d = this._sy * this.scale.y;
      lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
      lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);
      this._currentLocalID = this._localID;
      this._parentID = -1;
    }
    if (this._parentID !== parentTransform._worldID) {
      var pt = parentTransform.worldTransform;
      var wt = this.worldTransform;
      wt.a = lt.a * pt.a + lt.b * pt.c;
      wt.b = lt.a * pt.b + lt.b * pt.d;
      wt.c = lt.c * pt.a + lt.d * pt.c;
      wt.d = lt.c * pt.b + lt.d * pt.d;
      wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
      wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
      this._parentID = parentTransform._worldID;
      this._worldID++;
    }
  };
  Transform2.prototype.setFromMatrix = function(matrix) {
    matrix.decompose(this);
    this._localID++;
  };
  Object.defineProperty(Transform2.prototype, "rotation", {
    get: function() {
      return this._rotation;
    },
    set: function(value) {
      if (this._rotation !== value) {
        this._rotation = value;
        this.updateSkew();
      }
    },
    enumerable: false,
    configurable: true
  });
  Transform2.IDENTITY = new Transform2();
  return Transform2;
}();
settings.SORTABLE_CHILDREN = false;
var Bounds = function() {
  function Bounds2() {
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
    this.rect = null;
    this.updateID = -1;
  }
  Bounds2.prototype.isEmpty = function() {
    return this.minX > this.maxX || this.minY > this.maxY;
  };
  Bounds2.prototype.clear = function() {
    this.minX = Infinity;
    this.minY = Infinity;
    this.maxX = -Infinity;
    this.maxY = -Infinity;
  };
  Bounds2.prototype.getRectangle = function(rect) {
    if (this.minX > this.maxX || this.minY > this.maxY) {
      return Rectangle.EMPTY;
    }
    rect = rect || new Rectangle(0, 0, 1, 1);
    rect.x = this.minX;
    rect.y = this.minY;
    rect.width = this.maxX - this.minX;
    rect.height = this.maxY - this.minY;
    return rect;
  };
  Bounds2.prototype.addPoint = function(point) {
    this.minX = Math.min(this.minX, point.x);
    this.maxX = Math.max(this.maxX, point.x);
    this.minY = Math.min(this.minY, point.y);
    this.maxY = Math.max(this.maxY, point.y);
  };
  Bounds2.prototype.addPointMatrix = function(matrix, point) {
    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d, tx = matrix.tx, ty = matrix.ty;
    var x = a * point.x + c * point.y + tx;
    var y = b * point.x + d * point.y + ty;
    this.minX = Math.min(this.minX, x);
    this.maxX = Math.max(this.maxX, x);
    this.minY = Math.min(this.minY, y);
    this.maxY = Math.max(this.maxY, y);
  };
  Bounds2.prototype.addQuad = function(vertices) {
    var minX = this.minX;
    var minY = this.minY;
    var maxX = this.maxX;
    var maxY = this.maxY;
    var x = vertices[0];
    var y = vertices[1];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    x = vertices[2];
    y = vertices[3];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    x = vertices[4];
    y = vertices[5];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    x = vertices[6];
    y = vertices[7];
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  };
  Bounds2.prototype.addFrame = function(transform, x0, y0, x1, y1) {
    this.addFrameMatrix(transform.worldTransform, x0, y0, x1, y1);
  };
  Bounds2.prototype.addFrameMatrix = function(matrix, x0, y0, x1, y1) {
    var a = matrix.a;
    var b = matrix.b;
    var c = matrix.c;
    var d = matrix.d;
    var tx = matrix.tx;
    var ty = matrix.ty;
    var minX = this.minX;
    var minY = this.minY;
    var maxX = this.maxX;
    var maxY = this.maxY;
    var x = a * x0 + c * y0 + tx;
    var y = b * x0 + d * y0 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    x = a * x1 + c * y0 + tx;
    y = b * x1 + d * y0 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    x = a * x0 + c * y1 + tx;
    y = b * x0 + d * y1 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    x = a * x1 + c * y1 + tx;
    y = b * x1 + d * y1 + ty;
    minX = x < minX ? x : minX;
    minY = y < minY ? y : minY;
    maxX = x > maxX ? x : maxX;
    maxY = y > maxY ? y : maxY;
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  };
  Bounds2.prototype.addVertexData = function(vertexData, beginOffset, endOffset) {
    var minX = this.minX;
    var minY = this.minY;
    var maxX = this.maxX;
    var maxY = this.maxY;
    for (var i = beginOffset; i < endOffset; i += 2) {
      var x = vertexData[i];
      var y = vertexData[i + 1];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
    }
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  };
  Bounds2.prototype.addVertices = function(transform, vertices, beginOffset, endOffset) {
    this.addVerticesMatrix(transform.worldTransform, vertices, beginOffset, endOffset);
  };
  Bounds2.prototype.addVerticesMatrix = function(matrix, vertices, beginOffset, endOffset, padX, padY) {
    if (padX === void 0) {
      padX = 0;
    }
    if (padY === void 0) {
      padY = padX;
    }
    var a = matrix.a;
    var b = matrix.b;
    var c = matrix.c;
    var d = matrix.d;
    var tx = matrix.tx;
    var ty = matrix.ty;
    var minX = this.minX;
    var minY = this.minY;
    var maxX = this.maxX;
    var maxY = this.maxY;
    for (var i = beginOffset; i < endOffset; i += 2) {
      var rawX = vertices[i];
      var rawY = vertices[i + 1];
      var x = a * rawX + c * rawY + tx;
      var y = d * rawY + b * rawX + ty;
      minX = Math.min(minX, x - padX);
      maxX = Math.max(maxX, x + padX);
      minY = Math.min(minY, y - padY);
      maxY = Math.max(maxY, y + padY);
    }
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  };
  Bounds2.prototype.addBounds = function(bounds) {
    var minX = this.minX;
    var minY = this.minY;
    var maxX = this.maxX;
    var maxY = this.maxY;
    this.minX = bounds.minX < minX ? bounds.minX : minX;
    this.minY = bounds.minY < minY ? bounds.minY : minY;
    this.maxX = bounds.maxX > maxX ? bounds.maxX : maxX;
    this.maxY = bounds.maxY > maxY ? bounds.maxY : maxY;
  };
  Bounds2.prototype.addBoundsMask = function(bounds, mask) {
    var _minX = bounds.minX > mask.minX ? bounds.minX : mask.minX;
    var _minY = bounds.minY > mask.minY ? bounds.minY : mask.minY;
    var _maxX = bounds.maxX < mask.maxX ? bounds.maxX : mask.maxX;
    var _maxY = bounds.maxY < mask.maxY ? bounds.maxY : mask.maxY;
    if (_minX <= _maxX && _minY <= _maxY) {
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      this.minX = _minX < minX ? _minX : minX;
      this.minY = _minY < minY ? _minY : minY;
      this.maxX = _maxX > maxX ? _maxX : maxX;
      this.maxY = _maxY > maxY ? _maxY : maxY;
    }
  };
  Bounds2.prototype.addBoundsMatrix = function(bounds, matrix) {
    this.addFrameMatrix(matrix, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
  };
  Bounds2.prototype.addBoundsArea = function(bounds, area2) {
    var _minX = bounds.minX > area2.x ? bounds.minX : area2.x;
    var _minY = bounds.minY > area2.y ? bounds.minY : area2.y;
    var _maxX = bounds.maxX < area2.x + area2.width ? bounds.maxX : area2.x + area2.width;
    var _maxY = bounds.maxY < area2.y + area2.height ? bounds.maxY : area2.y + area2.height;
    if (_minX <= _maxX && _minY <= _maxY) {
      var minX = this.minX;
      var minY = this.minY;
      var maxX = this.maxX;
      var maxY = this.maxY;
      this.minX = _minX < minX ? _minX : minX;
      this.minY = _minY < minY ? _minY : minY;
      this.maxX = _maxX > maxX ? _maxX : maxX;
      this.maxY = _maxY > maxY ? _maxY : maxY;
    }
  };
  Bounds2.prototype.pad = function(paddingX, paddingY) {
    if (paddingX === void 0) {
      paddingX = 0;
    }
    if (paddingY === void 0) {
      paddingY = paddingX;
    }
    if (!this.isEmpty()) {
      this.minX -= paddingX;
      this.maxX += paddingX;
      this.minY -= paddingY;
      this.maxY += paddingY;
    }
  };
  Bounds2.prototype.addFramePad = function(x0, y0, x1, y1, padX, padY) {
    x0 -= padX;
    y0 -= padY;
    x1 += padX;
    y1 += padY;
    this.minX = this.minX < x0 ? this.minX : x0;
    this.maxX = this.maxX > x1 ? this.maxX : x1;
    this.minY = this.minY < y0 ? this.minY : y0;
    this.maxY = this.maxY > y1 ? this.maxY : y1;
  };
  return Bounds2;
}();
var extendStatics$j = function(d, b) {
  extendStatics$j = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$j(d, b);
};
function __extends$j(d, b) {
  extendStatics$j(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var DisplayObject = function(_super) {
  __extends$j(DisplayObject2, _super);
  function DisplayObject2() {
    var _this = _super.call(this) || this;
    _this.tempDisplayObjectParent = null;
    _this.transform = new Transform();
    _this.alpha = 1;
    _this.visible = true;
    _this.renderable = true;
    _this.cullable = false;
    _this.cullArea = null;
    _this.parent = null;
    _this.worldAlpha = 1;
    _this._lastSortedIndex = 0;
    _this._zIndex = 0;
    _this.filterArea = null;
    _this.filters = null;
    _this._enabledFilters = null;
    _this._bounds = new Bounds();
    _this._localBounds = null;
    _this._boundsID = 0;
    _this._boundsRect = null;
    _this._localBoundsRect = null;
    _this._mask = null;
    _this._maskRefCount = 0;
    _this._destroyed = false;
    _this.isSprite = false;
    _this.isMask = false;
    return _this;
  }
  DisplayObject2.mixin = function(source) {
    var keys = Object.keys(source);
    for (var i = 0; i < keys.length; ++i) {
      var propertyName = keys[i];
      Object.defineProperty(DisplayObject2.prototype, propertyName, Object.getOwnPropertyDescriptor(source, propertyName));
    }
  };
  Object.defineProperty(DisplayObject2.prototype, "destroyed", {
    get: function() {
      return this._destroyed;
    },
    enumerable: false,
    configurable: true
  });
  DisplayObject2.prototype._recursivePostUpdateTransform = function() {
    if (this.parent) {
      this.parent._recursivePostUpdateTransform();
      this.transform.updateTransform(this.parent.transform);
    } else {
      this.transform.updateTransform(this._tempDisplayObjectParent.transform);
    }
  };
  DisplayObject2.prototype.updateTransform = function() {
    this._boundsID++;
    this.transform.updateTransform(this.parent.transform);
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
  };
  DisplayObject2.prototype.getBounds = function(skipUpdate, rect) {
    if (!skipUpdate) {
      if (!this.parent) {
        this.parent = this._tempDisplayObjectParent;
        this.updateTransform();
        this.parent = null;
      } else {
        this._recursivePostUpdateTransform();
        this.updateTransform();
      }
    }
    if (this._bounds.updateID !== this._boundsID) {
      this.calculateBounds();
      this._bounds.updateID = this._boundsID;
    }
    if (!rect) {
      if (!this._boundsRect) {
        this._boundsRect = new Rectangle();
      }
      rect = this._boundsRect;
    }
    return this._bounds.getRectangle(rect);
  };
  DisplayObject2.prototype.getLocalBounds = function(rect) {
    if (!rect) {
      if (!this._localBoundsRect) {
        this._localBoundsRect = new Rectangle();
      }
      rect = this._localBoundsRect;
    }
    if (!this._localBounds) {
      this._localBounds = new Bounds();
    }
    var transformRef = this.transform;
    var parentRef = this.parent;
    this.parent = null;
    this.transform = this._tempDisplayObjectParent.transform;
    var worldBounds = this._bounds;
    var worldBoundsID = this._boundsID;
    this._bounds = this._localBounds;
    var bounds = this.getBounds(false, rect);
    this.parent = parentRef;
    this.transform = transformRef;
    this._bounds = worldBounds;
    this._bounds.updateID += this._boundsID - worldBoundsID;
    return bounds;
  };
  DisplayObject2.prototype.toGlobal = function(position, point, skipUpdate) {
    if (skipUpdate === void 0) {
      skipUpdate = false;
    }
    if (!skipUpdate) {
      this._recursivePostUpdateTransform();
      if (!this.parent) {
        this.parent = this._tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
      } else {
        this.displayObjectUpdateTransform();
      }
    }
    return this.worldTransform.apply(position, point);
  };
  DisplayObject2.prototype.toLocal = function(position, from, point, skipUpdate) {
    if (from) {
      position = from.toGlobal(position, point, skipUpdate);
    }
    if (!skipUpdate) {
      this._recursivePostUpdateTransform();
      if (!this.parent) {
        this.parent = this._tempDisplayObjectParent;
        this.displayObjectUpdateTransform();
        this.parent = null;
      } else {
        this.displayObjectUpdateTransform();
      }
    }
    return this.worldTransform.applyInverse(position, point);
  };
  DisplayObject2.prototype.setParent = function(container) {
    if (!container || !container.addChild) {
      throw new Error("setParent: Argument must be a Container");
    }
    container.addChild(this);
    return container;
  };
  DisplayObject2.prototype.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (scaleX === void 0) {
      scaleX = 1;
    }
    if (scaleY === void 0) {
      scaleY = 1;
    }
    if (rotation === void 0) {
      rotation = 0;
    }
    if (skewX === void 0) {
      skewX = 0;
    }
    if (skewY === void 0) {
      skewY = 0;
    }
    if (pivotX === void 0) {
      pivotX = 0;
    }
    if (pivotY === void 0) {
      pivotY = 0;
    }
    this.position.x = x;
    this.position.y = y;
    this.scale.x = !scaleX ? 1 : scaleX;
    this.scale.y = !scaleY ? 1 : scaleY;
    this.rotation = rotation;
    this.skew.x = skewX;
    this.skew.y = skewY;
    this.pivot.x = pivotX;
    this.pivot.y = pivotY;
    return this;
  };
  DisplayObject2.prototype.destroy = function(_options) {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this._destroyed = true;
    this.transform = null;
    this.parent = null;
    this._bounds = null;
    this.mask = null;
    this.cullArea = null;
    this.filters = null;
    this.filterArea = null;
    this.hitArea = null;
    this.interactive = false;
    this.interactiveChildren = false;
    this.emit("destroyed");
    this.removeAllListeners();
  };
  Object.defineProperty(DisplayObject2.prototype, "_tempDisplayObjectParent", {
    get: function() {
      if (this.tempDisplayObjectParent === null) {
        this.tempDisplayObjectParent = new TemporaryDisplayObject();
      }
      return this.tempDisplayObjectParent;
    },
    enumerable: false,
    configurable: true
  });
  DisplayObject2.prototype.enableTempParent = function() {
    var myParent = this.parent;
    this.parent = this._tempDisplayObjectParent;
    return myParent;
  };
  DisplayObject2.prototype.disableTempParent = function(cacheParent) {
    this.parent = cacheParent;
  };
  Object.defineProperty(DisplayObject2.prototype, "x", {
    get: function() {
      return this.position.x;
    },
    set: function(value) {
      this.transform.position.x = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "y", {
    get: function() {
      return this.position.y;
    },
    set: function(value) {
      this.transform.position.y = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "worldTransform", {
    get: function() {
      return this.transform.worldTransform;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "localTransform", {
    get: function() {
      return this.transform.localTransform;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "position", {
    get: function() {
      return this.transform.position;
    },
    set: function(value) {
      this.transform.position.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "scale", {
    get: function() {
      return this.transform.scale;
    },
    set: function(value) {
      this.transform.scale.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "pivot", {
    get: function() {
      return this.transform.pivot;
    },
    set: function(value) {
      this.transform.pivot.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "skew", {
    get: function() {
      return this.transform.skew;
    },
    set: function(value) {
      this.transform.skew.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "rotation", {
    get: function() {
      return this.transform.rotation;
    },
    set: function(value) {
      this.transform.rotation = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "angle", {
    get: function() {
      return this.transform.rotation * RAD_TO_DEG;
    },
    set: function(value) {
      this.transform.rotation = value * DEG_TO_RAD;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "zIndex", {
    get: function() {
      return this._zIndex;
    },
    set: function(value) {
      this._zIndex = value;
      if (this.parent) {
        this.parent.sortDirty = true;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "worldVisible", {
    get: function() {
      var item = this;
      do {
        if (!item.visible) {
          return false;
        }
        item = item.parent;
      } while (item);
      return true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(DisplayObject2.prototype, "mask", {
    get: function() {
      return this._mask;
    },
    set: function(value) {
      if (this._mask === value) {
        return;
      }
      if (this._mask) {
        var maskObject = this._mask.isMaskData ? this._mask.maskObject : this._mask;
        if (maskObject) {
          maskObject._maskRefCount--;
          if (maskObject._maskRefCount === 0) {
            maskObject.renderable = true;
            maskObject.isMask = false;
          }
        }
      }
      this._mask = value;
      if (this._mask) {
        var maskObject = this._mask.isMaskData ? this._mask.maskObject : this._mask;
        if (maskObject) {
          if (maskObject._maskRefCount === 0) {
            maskObject.renderable = false;
            maskObject.isMask = true;
          }
          maskObject._maskRefCount++;
        }
      }
    },
    enumerable: false,
    configurable: true
  });
  return DisplayObject2;
}(EventEmitter);
var TemporaryDisplayObject = function(_super) {
  __extends$j(TemporaryDisplayObject2, _super);
  function TemporaryDisplayObject2() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.sortDirty = null;
    return _this;
  }
  return TemporaryDisplayObject2;
}(DisplayObject);
DisplayObject.prototype.displayObjectUpdateTransform = DisplayObject.prototype.updateTransform;
function sortChildren(a, b) {
  if (a.zIndex === b.zIndex) {
    return a._lastSortedIndex - b._lastSortedIndex;
  }
  return a.zIndex - b.zIndex;
}
var Container = function(_super) {
  __extends$j(Container2, _super);
  function Container2() {
    var _this = _super.call(this) || this;
    _this.children = [];
    _this.sortableChildren = settings.SORTABLE_CHILDREN;
    _this.sortDirty = false;
    return _this;
  }
  Container2.prototype.onChildrenChange = function(_length) {
  };
  Container2.prototype.addChild = function() {
    var arguments$1 = arguments;
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      children[_i] = arguments$1[_i];
    }
    if (children.length > 1) {
      for (var i = 0; i < children.length; i++) {
        this.addChild(children[i]);
      }
    } else {
      var child = children[0];
      if (child.parent) {
        child.parent.removeChild(child);
      }
      child.parent = this;
      this.sortDirty = true;
      child.transform._parentID = -1;
      this.children.push(child);
      this._boundsID++;
      this.onChildrenChange(this.children.length - 1);
      this.emit("childAdded", child, this, this.children.length - 1);
      child.emit("added", this);
    }
    return children[0];
  };
  Container2.prototype.addChildAt = function(child, index2) {
    if (index2 < 0 || index2 > this.children.length) {
      throw new Error(child + "addChildAt: The index " + index2 + " supplied is out of bounds " + this.children.length);
    }
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.sortDirty = true;
    child.transform._parentID = -1;
    this.children.splice(index2, 0, child);
    this._boundsID++;
    this.onChildrenChange(index2);
    child.emit("added", this);
    this.emit("childAdded", child, this, index2);
    return child;
  };
  Container2.prototype.swapChildren = function(child, child2) {
    if (child === child2) {
      return;
    }
    var index1 = this.getChildIndex(child);
    var index2 = this.getChildIndex(child2);
    this.children[index1] = child2;
    this.children[index2] = child;
    this.onChildrenChange(index1 < index2 ? index1 : index2);
  };
  Container2.prototype.getChildIndex = function(child) {
    var index2 = this.children.indexOf(child);
    if (index2 === -1) {
      throw new Error("The supplied DisplayObject must be a child of the caller");
    }
    return index2;
  };
  Container2.prototype.setChildIndex = function(child, index2) {
    if (index2 < 0 || index2 >= this.children.length) {
      throw new Error("The index " + index2 + " supplied is out of bounds " + this.children.length);
    }
    var currentIndex = this.getChildIndex(child);
    removeItems(this.children, currentIndex, 1);
    this.children.splice(index2, 0, child);
    this.onChildrenChange(index2);
  };
  Container2.prototype.getChildAt = function(index2) {
    if (index2 < 0 || index2 >= this.children.length) {
      throw new Error("getChildAt: Index (" + index2 + ") does not exist.");
    }
    return this.children[index2];
  };
  Container2.prototype.removeChild = function() {
    var arguments$1 = arguments;
    var children = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      children[_i] = arguments$1[_i];
    }
    if (children.length > 1) {
      for (var i = 0; i < children.length; i++) {
        this.removeChild(children[i]);
      }
    } else {
      var child = children[0];
      var index2 = this.children.indexOf(child);
      if (index2 === -1) {
        return null;
      }
      child.parent = null;
      child.transform._parentID = -1;
      removeItems(this.children, index2, 1);
      this._boundsID++;
      this.onChildrenChange(index2);
      child.emit("removed", this);
      this.emit("childRemoved", child, this, index2);
    }
    return children[0];
  };
  Container2.prototype.removeChildAt = function(index2) {
    var child = this.getChildAt(index2);
    child.parent = null;
    child.transform._parentID = -1;
    removeItems(this.children, index2, 1);
    this._boundsID++;
    this.onChildrenChange(index2);
    child.emit("removed", this);
    this.emit("childRemoved", child, this, index2);
    return child;
  };
  Container2.prototype.removeChildren = function(beginIndex, endIndex) {
    if (beginIndex === void 0) {
      beginIndex = 0;
    }
    if (endIndex === void 0) {
      endIndex = this.children.length;
    }
    var begin = beginIndex;
    var end = endIndex;
    var range = end - begin;
    var removed;
    if (range > 0 && range <= end) {
      removed = this.children.splice(begin, range);
      for (var i = 0; i < removed.length; ++i) {
        removed[i].parent = null;
        if (removed[i].transform) {
          removed[i].transform._parentID = -1;
        }
      }
      this._boundsID++;
      this.onChildrenChange(beginIndex);
      for (var i = 0; i < removed.length; ++i) {
        removed[i].emit("removed", this);
        this.emit("childRemoved", removed[i], this, i);
      }
      return removed;
    } else if (range === 0 && this.children.length === 0) {
      return [];
    }
    throw new RangeError("removeChildren: numeric values are outside the acceptable range.");
  };
  Container2.prototype.sortChildren = function() {
    var sortRequired = false;
    for (var i = 0, j = this.children.length; i < j; ++i) {
      var child = this.children[i];
      child._lastSortedIndex = i;
      if (!sortRequired && child.zIndex !== 0) {
        sortRequired = true;
      }
    }
    if (sortRequired && this.children.length > 1) {
      this.children.sort(sortChildren);
    }
    this.sortDirty = false;
  };
  Container2.prototype.updateTransform = function() {
    if (this.sortableChildren && this.sortDirty) {
      this.sortChildren();
    }
    this._boundsID++;
    this.transform.updateTransform(this.parent.transform);
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
    for (var i = 0, j = this.children.length; i < j; ++i) {
      var child = this.children[i];
      if (child.visible) {
        child.updateTransform();
      }
    }
  };
  Container2.prototype.calculateBounds = function() {
    this._bounds.clear();
    this._calculateBounds();
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      if (!child.visible || !child.renderable) {
        continue;
      }
      child.calculateBounds();
      if (child._mask) {
        var maskObject = child._mask.isMaskData ? child._mask.maskObject : child._mask;
        if (maskObject) {
          maskObject.calculateBounds();
          this._bounds.addBoundsMask(child._bounds, maskObject._bounds);
        } else {
          this._bounds.addBounds(child._bounds);
        }
      } else if (child.filterArea) {
        this._bounds.addBoundsArea(child._bounds, child.filterArea);
      } else {
        this._bounds.addBounds(child._bounds);
      }
    }
    this._bounds.updateID = this._boundsID;
  };
  Container2.prototype.getLocalBounds = function(rect, skipChildrenUpdate) {
    if (skipChildrenUpdate === void 0) {
      skipChildrenUpdate = false;
    }
    var result2 = _super.prototype.getLocalBounds.call(this, rect);
    if (!skipChildrenUpdate) {
      for (var i = 0, j = this.children.length; i < j; ++i) {
        var child = this.children[i];
        if (child.visible) {
          child.updateTransform();
        }
      }
    }
    return result2;
  };
  Container2.prototype._calculateBounds = function() {
  };
  Container2.prototype._renderWithCulling = function(renderer) {
    var sourceFrame = renderer.renderTexture.sourceFrame;
    if (!(sourceFrame.width > 0 && sourceFrame.height > 0)) {
      return;
    }
    var bounds;
    var transform;
    if (this.cullArea) {
      bounds = this.cullArea;
      transform = this.worldTransform;
    } else if (this._render !== Container2.prototype._render) {
      bounds = this.getBounds(true);
    }
    if (bounds && sourceFrame.intersects(bounds, transform)) {
      this._render(renderer);
    } else if (this.cullArea) {
      return;
    }
    for (var i = 0, j = this.children.length; i < j; ++i) {
      var child = this.children[i];
      var childCullable = child.cullable;
      child.cullable = childCullable || !this.cullArea;
      child.render(renderer);
      child.cullable = childCullable;
    }
  };
  Container2.prototype.render = function(renderer) {
    if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
      return;
    }
    if (this._mask || this.filters && this.filters.length) {
      this.renderAdvanced(renderer);
    } else if (this.cullable) {
      this._renderWithCulling(renderer);
    } else {
      this._render(renderer);
      for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].render(renderer);
      }
    }
  };
  Container2.prototype.renderAdvanced = function(renderer) {
    var filters2 = this.filters;
    var mask = this._mask;
    if (filters2) {
      if (!this._enabledFilters) {
        this._enabledFilters = [];
      }
      this._enabledFilters.length = 0;
      for (var i = 0; i < filters2.length; i++) {
        if (filters2[i].enabled) {
          this._enabledFilters.push(filters2[i]);
        }
      }
    }
    var flush = filters2 && this._enabledFilters && this._enabledFilters.length || mask && (!mask.isMaskData || mask.enabled && (mask.autoDetect || mask.type !== MASK_TYPES.NONE));
    if (flush) {
      renderer.batch.flush();
    }
    if (filters2 && this._enabledFilters && this._enabledFilters.length) {
      renderer.filter.push(this, this._enabledFilters);
    }
    if (mask) {
      renderer.mask.push(this, this._mask);
    }
    if (this.cullable) {
      this._renderWithCulling(renderer);
    } else {
      this._render(renderer);
      for (var i = 0, j = this.children.length; i < j; ++i) {
        this.children[i].render(renderer);
      }
    }
    if (flush) {
      renderer.batch.flush();
    }
    if (mask) {
      renderer.mask.pop(this);
    }
    if (filters2 && this._enabledFilters && this._enabledFilters.length) {
      renderer.filter.pop();
    }
  };
  Container2.prototype._render = function(_renderer) {
  };
  Container2.prototype.destroy = function(options) {
    _super.prototype.destroy.call(this);
    this.sortDirty = false;
    var destroyChildren = typeof options === "boolean" ? options : options && options.children;
    var oldChildren = this.removeChildren(0, this.children.length);
    if (destroyChildren) {
      for (var i = 0; i < oldChildren.length; ++i) {
        oldChildren[i].destroy(options);
      }
    }
  };
  Object.defineProperty(Container2.prototype, "width", {
    get: function() {
      return this.scale.x * this.getLocalBounds().width;
    },
    set: function(value) {
      var width = this.getLocalBounds().width;
      if (width !== 0) {
        this.scale.x = value / width;
      } else {
        this.scale.x = 1;
      }
      this._width = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Container2.prototype, "height", {
    get: function() {
      return this.scale.y * this.getLocalBounds().height;
    },
    set: function(value) {
      var height = this.getLocalBounds().height;
      if (height !== 0) {
        this.scale.y = value / height;
      } else {
        this.scale.y = 1;
      }
      this._height = value;
    },
    enumerable: false,
    configurable: true
  });
  return Container2;
}(DisplayObject);
Container.prototype.containerUpdateTransform = Container.prototype.updateTransform;
var __assign$1 = function() {
  __assign$1 = Object.assign || function __assign2(t) {
    var arguments$1 = arguments;
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments$1[i];
      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) {
          t[p] = s[p];
        }
      }
    }
    return t;
  };
  return __assign$1.apply(this, arguments);
};
var ExtensionType;
(function(ExtensionType2) {
  ExtensionType2["Application"] = "application";
  ExtensionType2["RendererPlugin"] = "renderer-webgl-plugin";
  ExtensionType2["CanvasRendererPlugin"] = "renderer-canvas-plugin";
  ExtensionType2["Loader"] = "loader";
  ExtensionType2["LoadParser"] = "load-parser";
  ExtensionType2["ResolveParser"] = "resolve-parser";
  ExtensionType2["CacheParser"] = "cache-parser";
  ExtensionType2["DetectionParser"] = "detection-parser";
})(ExtensionType || (ExtensionType = {}));
var normalizeExtension = function(ext) {
  if (typeof ext === "function" || typeof ext === "object" && ext.extension) {
    if (!ext.extension) {
      throw new Error("Extension class must have an extension object");
    }
    var metadata = typeof ext.extension !== "object" ? { type: ext.extension } : ext.extension;
    ext = __assign$1(__assign$1({}, metadata), { ref: ext });
  }
  if (typeof ext === "object") {
    ext = __assign$1({}, ext);
  } else {
    throw new Error("Invalid extension type");
  }
  if (typeof ext.type === "string") {
    ext.type = [ext.type];
  }
  return ext;
};
var extensions = {
  _addHandlers: null,
  _removeHandlers: null,
  _queue: {},
  remove: function() {
    var arguments$1 = arguments;
    var _this = this;
    var extensions2 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      extensions2[_i] = arguments$1[_i];
    }
    extensions2.map(normalizeExtension).forEach(function(ext) {
      ext.type.forEach(function(type) {
        var _a2, _b2;
        return (_b2 = (_a2 = _this._removeHandlers)[type]) === null || _b2 === void 0 ? void 0 : _b2.call(_a2, ext);
      });
    });
    return this;
  },
  add: function() {
    var arguments$1 = arguments;
    var _this = this;
    var extensions2 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      extensions2[_i] = arguments$1[_i];
    }
    extensions2.map(normalizeExtension).forEach(function(ext) {
      ext.type.forEach(function(type) {
        var handlers = _this._addHandlers;
        var queue = _this._queue;
        if (!handlers[type]) {
          queue[type] = queue[type] || [];
          queue[type].push(ext);
        } else {
          handlers[type](ext);
        }
      });
    });
    return this;
  },
  handle: function(type, onAdd, onRemove) {
    var addHandlers = this._addHandlers = this._addHandlers || {};
    var removeHandlers = this._removeHandlers = this._removeHandlers || {};
    if (addHandlers[type] || removeHandlers[type]) {
      throw new Error("Extension type " + type + " already has a handler");
    }
    addHandlers[type] = onAdd;
    removeHandlers[type] = onRemove;
    var queue = this._queue;
    if (queue[type]) {
      queue[type].forEach(function(ext) {
        return onAdd(ext);
      });
      delete queue[type];
    }
    return this;
  },
  handleByMap: function(type, map2) {
    return this.handle(type, function(extension) {
      map2[extension.name] = extension.ref;
    }, function(extension) {
      delete map2[extension.name];
    });
  },
  handleByList: function(type, list) {
    return this.handle(type, function(extension) {
      var _a2, _b2;
      list.push(extension.ref);
      if (type === ExtensionType.Loader) {
        (_b2 = (_a2 = extension.ref).add) === null || _b2 === void 0 ? void 0 : _b2.call(_a2);
      }
    }, function(extension) {
      var index2 = list.indexOf(extension.ref);
      if (index2 !== -1) {
        list.splice(index2, 1);
      }
    });
  }
};
var Runner = function() {
  function Runner2(name) {
    this.items = [];
    this._name = name;
    this._aliasCount = 0;
  }
  Runner2.prototype.emit = function(a0, a1, a2, a3, a4, a5, a6, a7) {
    if (arguments.length > 8) {
      throw new Error("max arguments reached");
    }
    var _a2 = this, name = _a2.name, items = _a2.items;
    this._aliasCount++;
    for (var i = 0, len = items.length; i < len; i++) {
      items[i][name](a0, a1, a2, a3, a4, a5, a6, a7);
    }
    if (items === this.items) {
      this._aliasCount--;
    }
    return this;
  };
  Runner2.prototype.ensureNonAliasedItems = function() {
    if (this._aliasCount > 0 && this.items.length > 1) {
      this._aliasCount = 0;
      this.items = this.items.slice(0);
    }
  };
  Runner2.prototype.add = function(item) {
    if (item[this._name]) {
      this.ensureNonAliasedItems();
      this.remove(item);
      this.items.push(item);
    }
    return this;
  };
  Runner2.prototype.remove = function(item) {
    var index2 = this.items.indexOf(item);
    if (index2 !== -1) {
      this.ensureNonAliasedItems();
      this.items.splice(index2, 1);
    }
    return this;
  };
  Runner2.prototype.contains = function(item) {
    return this.items.indexOf(item) !== -1;
  };
  Runner2.prototype.removeAll = function() {
    this.ensureNonAliasedItems();
    this.items.length = 0;
    return this;
  };
  Runner2.prototype.destroy = function() {
    this.removeAll();
    this.items = null;
    this._name = null;
  };
  Object.defineProperty(Runner2.prototype, "empty", {
    get: function() {
      return this.items.length === 0;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Runner2.prototype, "name", {
    get: function() {
      return this._name;
    },
    enumerable: false,
    configurable: true
  });
  return Runner2;
}();
Object.defineProperties(Runner.prototype, {
  dispatch: { value: Runner.prototype.emit },
  run: { value: Runner.prototype.emit }
});
settings.TARGET_FPMS = 0.06;
var UPDATE_PRIORITY;
(function(UPDATE_PRIORITY2) {
  UPDATE_PRIORITY2[UPDATE_PRIORITY2["INTERACTION"] = 50] = "INTERACTION";
  UPDATE_PRIORITY2[UPDATE_PRIORITY2["HIGH"] = 25] = "HIGH";
  UPDATE_PRIORITY2[UPDATE_PRIORITY2["NORMAL"] = 0] = "NORMAL";
  UPDATE_PRIORITY2[UPDATE_PRIORITY2["LOW"] = -25] = "LOW";
  UPDATE_PRIORITY2[UPDATE_PRIORITY2["UTILITY"] = -50] = "UTILITY";
})(UPDATE_PRIORITY || (UPDATE_PRIORITY = {}));
var TickerListener = function() {
  function TickerListener2(fn, context2, priority, once) {
    if (context2 === void 0) {
      context2 = null;
    }
    if (priority === void 0) {
      priority = 0;
    }
    if (once === void 0) {
      once = false;
    }
    this.next = null;
    this.previous = null;
    this._destroyed = false;
    this.fn = fn;
    this.context = context2;
    this.priority = priority;
    this.once = once;
  }
  TickerListener2.prototype.match = function(fn, context2) {
    if (context2 === void 0) {
      context2 = null;
    }
    return this.fn === fn && this.context === context2;
  };
  TickerListener2.prototype.emit = function(deltaTime) {
    if (this.fn) {
      if (this.context) {
        this.fn.call(this.context, deltaTime);
      } else {
        this.fn(deltaTime);
      }
    }
    var redirect = this.next;
    if (this.once) {
      this.destroy(true);
    }
    if (this._destroyed) {
      this.next = null;
    }
    return redirect;
  };
  TickerListener2.prototype.connect = function(previous) {
    this.previous = previous;
    if (previous.next) {
      previous.next.previous = this;
    }
    this.next = previous.next;
    previous.next = this;
  };
  TickerListener2.prototype.destroy = function(hard) {
    if (hard === void 0) {
      hard = false;
    }
    this._destroyed = true;
    this.fn = null;
    this.context = null;
    if (this.previous) {
      this.previous.next = this.next;
    }
    if (this.next) {
      this.next.previous = this.previous;
    }
    var redirect = this.next;
    this.next = hard ? null : redirect;
    this.previous = null;
    return redirect;
  };
  return TickerListener2;
}();
var Ticker = function() {
  function Ticker2() {
    var _this = this;
    this.autoStart = false;
    this.deltaTime = 1;
    this.lastTime = -1;
    this.speed = 1;
    this.started = false;
    this._requestId = null;
    this._maxElapsedMS = 100;
    this._minElapsedMS = 0;
    this._protected = false;
    this._lastFrame = -1;
    this._head = new TickerListener(null, null, Infinity);
    this.deltaMS = 1 / settings.TARGET_FPMS;
    this.elapsedMS = 1 / settings.TARGET_FPMS;
    this._tick = function(time) {
      _this._requestId = null;
      if (_this.started) {
        _this.update(time);
        if (_this.started && _this._requestId === null && _this._head.next) {
          _this._requestId = requestAnimationFrame(_this._tick);
        }
      }
    };
  }
  Ticker2.prototype._requestIfNeeded = function() {
    if (this._requestId === null && this._head.next) {
      this.lastTime = performance.now();
      this._lastFrame = this.lastTime;
      this._requestId = requestAnimationFrame(this._tick);
    }
  };
  Ticker2.prototype._cancelIfNeeded = function() {
    if (this._requestId !== null) {
      cancelAnimationFrame(this._requestId);
      this._requestId = null;
    }
  };
  Ticker2.prototype._startIfPossible = function() {
    if (this.started) {
      this._requestIfNeeded();
    } else if (this.autoStart) {
      this.start();
    }
  };
  Ticker2.prototype.add = function(fn, context2, priority) {
    if (priority === void 0) {
      priority = UPDATE_PRIORITY.NORMAL;
    }
    return this._addListener(new TickerListener(fn, context2, priority));
  };
  Ticker2.prototype.addOnce = function(fn, context2, priority) {
    if (priority === void 0) {
      priority = UPDATE_PRIORITY.NORMAL;
    }
    return this._addListener(new TickerListener(fn, context2, priority, true));
  };
  Ticker2.prototype._addListener = function(listener) {
    var current = this._head.next;
    var previous = this._head;
    if (!current) {
      listener.connect(previous);
    } else {
      while (current) {
        if (listener.priority > current.priority) {
          listener.connect(previous);
          break;
        }
        previous = current;
        current = current.next;
      }
      if (!listener.previous) {
        listener.connect(previous);
      }
    }
    this._startIfPossible();
    return this;
  };
  Ticker2.prototype.remove = function(fn, context2) {
    var listener = this._head.next;
    while (listener) {
      if (listener.match(fn, context2)) {
        listener = listener.destroy();
      } else {
        listener = listener.next;
      }
    }
    if (!this._head.next) {
      this._cancelIfNeeded();
    }
    return this;
  };
  Object.defineProperty(Ticker2.prototype, "count", {
    get: function() {
      if (!this._head) {
        return 0;
      }
      var count = 0;
      var current = this._head;
      while (current = current.next) {
        count++;
      }
      return count;
    },
    enumerable: false,
    configurable: true
  });
  Ticker2.prototype.start = function() {
    if (!this.started) {
      this.started = true;
      this._requestIfNeeded();
    }
  };
  Ticker2.prototype.stop = function() {
    if (this.started) {
      this.started = false;
      this._cancelIfNeeded();
    }
  };
  Ticker2.prototype.destroy = function() {
    if (!this._protected) {
      this.stop();
      var listener = this._head.next;
      while (listener) {
        listener = listener.destroy(true);
      }
      this._head.destroy();
      this._head = null;
    }
  };
  Ticker2.prototype.update = function(currentTime) {
    if (currentTime === void 0) {
      currentTime = performance.now();
    }
    var elapsedMS;
    if (currentTime > this.lastTime) {
      elapsedMS = this.elapsedMS = currentTime - this.lastTime;
      if (elapsedMS > this._maxElapsedMS) {
        elapsedMS = this._maxElapsedMS;
      }
      elapsedMS *= this.speed;
      if (this._minElapsedMS) {
        var delta = currentTime - this._lastFrame | 0;
        if (delta < this._minElapsedMS) {
          return;
        }
        this._lastFrame = currentTime - delta % this._minElapsedMS;
      }
      this.deltaMS = elapsedMS;
      this.deltaTime = this.deltaMS * settings.TARGET_FPMS;
      var head = this._head;
      var listener = head.next;
      while (listener) {
        listener = listener.emit(this.deltaTime);
      }
      if (!head.next) {
        this._cancelIfNeeded();
      }
    } else {
      this.deltaTime = this.deltaMS = this.elapsedMS = 0;
    }
    this.lastTime = currentTime;
  };
  Object.defineProperty(Ticker2.prototype, "FPS", {
    get: function() {
      return 1e3 / this.elapsedMS;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Ticker2.prototype, "minFPS", {
    get: function() {
      return 1e3 / this._maxElapsedMS;
    },
    set: function(fps) {
      var minFPS = Math.min(this.maxFPS, fps);
      var minFPMS = Math.min(Math.max(0, minFPS) / 1e3, settings.TARGET_FPMS);
      this._maxElapsedMS = 1 / minFPMS;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Ticker2.prototype, "maxFPS", {
    get: function() {
      if (this._minElapsedMS) {
        return Math.round(1e3 / this._minElapsedMS);
      }
      return 0;
    },
    set: function(fps) {
      if (fps === 0) {
        this._minElapsedMS = 0;
      } else {
        var maxFPS = Math.max(this.minFPS, fps);
        this._minElapsedMS = 1 / (maxFPS / 1e3);
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Ticker2, "shared", {
    get: function() {
      if (!Ticker2._shared) {
        var shared = Ticker2._shared = new Ticker2();
        shared.autoStart = true;
        shared._protected = true;
      }
      return Ticker2._shared;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Ticker2, "system", {
    get: function() {
      if (!Ticker2._system) {
        var system = Ticker2._system = new Ticker2();
        system.autoStart = true;
        system._protected = true;
      }
      return Ticker2._system;
    },
    enumerable: false,
    configurable: true
  });
  return Ticker2;
}();
var TickerPlugin = function() {
  function TickerPlugin2() {
  }
  TickerPlugin2.init = function(options) {
    var _this = this;
    options = Object.assign({
      autoStart: true,
      sharedTicker: false
    }, options);
    Object.defineProperty(this, "ticker", {
      set: function(ticker) {
        if (this._ticker) {
          this._ticker.remove(this.render, this);
        }
        this._ticker = ticker;
        if (ticker) {
          ticker.add(this.render, this, UPDATE_PRIORITY.LOW);
        }
      },
      get: function() {
        return this._ticker;
      }
    });
    this.stop = function() {
      _this._ticker.stop();
    };
    this.start = function() {
      _this._ticker.start();
    };
    this._ticker = null;
    this.ticker = options.sharedTicker ? Ticker.shared : new Ticker();
    if (options.autoStart) {
      this.start();
    }
  };
  TickerPlugin2.destroy = function() {
    if (this._ticker) {
      var oldTicker = this._ticker;
      this.ticker = null;
      oldTicker.destroy();
    }
  };
  TickerPlugin2.extension = ExtensionType.Application;
  return TickerPlugin2;
}();
settings.PREFER_ENV = isMobile.any ? ENV.WEBGL : ENV.WEBGL2;
settings.STRICT_TEXTURE_CACHE = false;
var INSTALLED = [];
function autoDetectResource(source, options) {
  if (!source) {
    return null;
  }
  var extension = "";
  if (typeof source === "string") {
    var result2 = /\.(\w{3,4})(?:$|\?|#)/i.exec(source);
    if (result2) {
      extension = result2[1].toLowerCase();
    }
  }
  for (var i = INSTALLED.length - 1; i >= 0; --i) {
    var ResourcePlugin = INSTALLED[i];
    if (ResourcePlugin.test && ResourcePlugin.test(source, extension)) {
      return new ResourcePlugin(source, options);
    }
  }
  throw new Error("Unrecognized source type to auto-detect Resource");
}
var extendStatics$i = function(d, b) {
  extendStatics$i = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$i(d, b);
};
function __extends$i(d, b) {
  extendStatics$i(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    var arguments$1 = arguments;
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments$1[i];
      for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p)) {
          t[p] = s[p];
        }
      }
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) {
      t[p] = s[p];
    }
  }
  if (s != null && typeof Object.getOwnPropertySymbols === "function") {
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) {
        t[p[i]] = s[p[i]];
      }
    }
  }
  return t;
}
var Resource = function() {
  function Resource2(width, height) {
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    this._width = width;
    this._height = height;
    this.destroyed = false;
    this.internal = false;
    this.onResize = new Runner("setRealSize");
    this.onUpdate = new Runner("update");
    this.onError = new Runner("onError");
  }
  Resource2.prototype.bind = function(baseTexture) {
    this.onResize.add(baseTexture);
    this.onUpdate.add(baseTexture);
    this.onError.add(baseTexture);
    if (this._width || this._height) {
      this.onResize.emit(this._width, this._height);
    }
  };
  Resource2.prototype.unbind = function(baseTexture) {
    this.onResize.remove(baseTexture);
    this.onUpdate.remove(baseTexture);
    this.onError.remove(baseTexture);
  };
  Resource2.prototype.resize = function(width, height) {
    if (width !== this._width || height !== this._height) {
      this._width = width;
      this._height = height;
      this.onResize.emit(width, height);
    }
  };
  Object.defineProperty(Resource2.prototype, "valid", {
    get: function() {
      return !!this._width && !!this._height;
    },
    enumerable: false,
    configurable: true
  });
  Resource2.prototype.update = function() {
    if (!this.destroyed) {
      this.onUpdate.emit();
    }
  };
  Resource2.prototype.load = function() {
    return Promise.resolve(this);
  };
  Object.defineProperty(Resource2.prototype, "width", {
    get: function() {
      return this._width;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Resource2.prototype, "height", {
    get: function() {
      return this._height;
    },
    enumerable: false,
    configurable: true
  });
  Resource2.prototype.style = function(_renderer, _baseTexture, _glTexture) {
    return false;
  };
  Resource2.prototype.dispose = function() {
  };
  Resource2.prototype.destroy = function() {
    if (!this.destroyed) {
      this.destroyed = true;
      this.dispose();
      this.onError.removeAll();
      this.onError = null;
      this.onResize.removeAll();
      this.onResize = null;
      this.onUpdate.removeAll();
      this.onUpdate = null;
    }
  };
  Resource2.test = function(_source, _extension) {
    return false;
  };
  return Resource2;
}();
var BufferResource = function(_super) {
  __extends$i(BufferResource2, _super);
  function BufferResource2(source, options) {
    var _this = this;
    var _a2 = options || {}, width = _a2.width, height = _a2.height;
    if (!width || !height) {
      throw new Error("BufferResource width or height invalid");
    }
    _this = _super.call(this, width, height) || this;
    _this.data = source;
    return _this;
  }
  BufferResource2.prototype.upload = function(renderer, baseTexture, glTexture) {
    var gl = renderer.gl;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);
    var width = baseTexture.realWidth;
    var height = baseTexture.realHeight;
    if (glTexture.width === width && glTexture.height === height) {
      gl.texSubImage2D(baseTexture.target, 0, 0, 0, width, height, baseTexture.format, glTexture.type, this.data);
    } else {
      glTexture.width = width;
      glTexture.height = height;
      gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, width, height, 0, baseTexture.format, glTexture.type, this.data);
    }
    return true;
  };
  BufferResource2.prototype.dispose = function() {
    this.data = null;
  };
  BufferResource2.test = function(source) {
    return source instanceof Float32Array || source instanceof Uint8Array || source instanceof Uint32Array;
  };
  return BufferResource2;
}(Resource);
var defaultBufferOptions = {
  scaleMode: SCALE_MODES.NEAREST,
  format: FORMATS.RGBA,
  alphaMode: ALPHA_MODES.NPM
};
var BaseTexture = function(_super) {
  __extends$i(BaseTexture2, _super);
  function BaseTexture2(resource, options) {
    if (resource === void 0) {
      resource = null;
    }
    if (options === void 0) {
      options = null;
    }
    var _this = _super.call(this) || this;
    options = options || {};
    var alphaMode = options.alphaMode, mipmap = options.mipmap, anisotropicLevel = options.anisotropicLevel, scaleMode = options.scaleMode, width = options.width, height = options.height, wrapMode = options.wrapMode, format2 = options.format, type = options.type, target = options.target, resolution = options.resolution, resourceOptions = options.resourceOptions;
    if (resource && !(resource instanceof Resource)) {
      resource = autoDetectResource(resource, resourceOptions);
      resource.internal = true;
    }
    _this.resolution = resolution || settings.RESOLUTION;
    _this.width = Math.round((width || 0) * _this.resolution) / _this.resolution;
    _this.height = Math.round((height || 0) * _this.resolution) / _this.resolution;
    _this._mipmap = mipmap !== void 0 ? mipmap : settings.MIPMAP_TEXTURES;
    _this.anisotropicLevel = anisotropicLevel !== void 0 ? anisotropicLevel : settings.ANISOTROPIC_LEVEL;
    _this._wrapMode = wrapMode || settings.WRAP_MODE;
    _this._scaleMode = scaleMode !== void 0 ? scaleMode : settings.SCALE_MODE;
    _this.format = format2 || FORMATS.RGBA;
    _this.type = type || TYPES.UNSIGNED_BYTE;
    _this.target = target || TARGETS.TEXTURE_2D;
    _this.alphaMode = alphaMode !== void 0 ? alphaMode : ALPHA_MODES.UNPACK;
    _this.uid = uid();
    _this.touched = 0;
    _this.isPowerOfTwo = false;
    _this._refreshPOT();
    _this._glTextures = {};
    _this.dirtyId = 0;
    _this.dirtyStyleId = 0;
    _this.cacheId = null;
    _this.valid = width > 0 && height > 0;
    _this.textureCacheIds = [];
    _this.destroyed = false;
    _this.resource = null;
    _this._batchEnabled = 0;
    _this._batchLocation = 0;
    _this.parentTextureArray = null;
    _this.setResource(resource);
    return _this;
  }
  Object.defineProperty(BaseTexture2.prototype, "realWidth", {
    get: function() {
      return Math.round(this.width * this.resolution);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BaseTexture2.prototype, "realHeight", {
    get: function() {
      return Math.round(this.height * this.resolution);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BaseTexture2.prototype, "mipmap", {
    get: function() {
      return this._mipmap;
    },
    set: function(value) {
      if (this._mipmap !== value) {
        this._mipmap = value;
        this.dirtyStyleId++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BaseTexture2.prototype, "scaleMode", {
    get: function() {
      return this._scaleMode;
    },
    set: function(value) {
      if (this._scaleMode !== value) {
        this._scaleMode = value;
        this.dirtyStyleId++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BaseTexture2.prototype, "wrapMode", {
    get: function() {
      return this._wrapMode;
    },
    set: function(value) {
      if (this._wrapMode !== value) {
        this._wrapMode = value;
        this.dirtyStyleId++;
      }
    },
    enumerable: false,
    configurable: true
  });
  BaseTexture2.prototype.setStyle = function(scaleMode, mipmap) {
    var dirty;
    if (scaleMode !== void 0 && scaleMode !== this.scaleMode) {
      this.scaleMode = scaleMode;
      dirty = true;
    }
    if (mipmap !== void 0 && mipmap !== this.mipmap) {
      this.mipmap = mipmap;
      dirty = true;
    }
    if (dirty) {
      this.dirtyStyleId++;
    }
    return this;
  };
  BaseTexture2.prototype.setSize = function(desiredWidth, desiredHeight, resolution) {
    resolution = resolution || this.resolution;
    return this.setRealSize(desiredWidth * resolution, desiredHeight * resolution, resolution);
  };
  BaseTexture2.prototype.setRealSize = function(realWidth, realHeight, resolution) {
    this.resolution = resolution || this.resolution;
    this.width = Math.round(realWidth) / this.resolution;
    this.height = Math.round(realHeight) / this.resolution;
    this._refreshPOT();
    this.update();
    return this;
  };
  BaseTexture2.prototype._refreshPOT = function() {
    this.isPowerOfTwo = isPow2(this.realWidth) && isPow2(this.realHeight);
  };
  BaseTexture2.prototype.setResolution = function(resolution) {
    var oldResolution = this.resolution;
    if (oldResolution === resolution) {
      return this;
    }
    this.resolution = resolution;
    if (this.valid) {
      this.width = Math.round(this.width * oldResolution) / resolution;
      this.height = Math.round(this.height * oldResolution) / resolution;
      this.emit("update", this);
    }
    this._refreshPOT();
    return this;
  };
  BaseTexture2.prototype.setResource = function(resource) {
    if (this.resource === resource) {
      return this;
    }
    if (this.resource) {
      throw new Error("Resource can be set only once");
    }
    resource.bind(this);
    this.resource = resource;
    return this;
  };
  BaseTexture2.prototype.update = function() {
    if (!this.valid) {
      if (this.width > 0 && this.height > 0) {
        this.valid = true;
        this.emit("loaded", this);
        this.emit("update", this);
      }
    } else {
      this.dirtyId++;
      this.dirtyStyleId++;
      this.emit("update", this);
    }
  };
  BaseTexture2.prototype.onError = function(event) {
    this.emit("error", this, event);
  };
  BaseTexture2.prototype.destroy = function() {
    if (this.resource) {
      this.resource.unbind(this);
      if (this.resource.internal) {
        this.resource.destroy();
      }
      this.resource = null;
    }
    if (this.cacheId) {
      delete BaseTextureCache[this.cacheId];
      delete TextureCache[this.cacheId];
      this.cacheId = null;
    }
    this.dispose();
    BaseTexture2.removeFromCache(this);
    this.textureCacheIds = null;
    this.destroyed = true;
  };
  BaseTexture2.prototype.dispose = function() {
    this.emit("dispose", this);
  };
  BaseTexture2.prototype.castToBaseTexture = function() {
    return this;
  };
  BaseTexture2.from = function(source, options, strict) {
    if (strict === void 0) {
      strict = settings.STRICT_TEXTURE_CACHE;
    }
    var isFrame = typeof source === "string";
    var cacheId = null;
    if (isFrame) {
      cacheId = source;
    } else {
      if (!source._pixiId) {
        var prefix = options && options.pixiIdPrefix || "pixiid";
        source._pixiId = prefix + "_" + uid();
      }
      cacheId = source._pixiId;
    }
    var baseTexture = BaseTextureCache[cacheId];
    if (isFrame && strict && !baseTexture) {
      throw new Error('The cacheId "' + cacheId + '" does not exist in BaseTextureCache.');
    }
    if (!baseTexture) {
      baseTexture = new BaseTexture2(source, options);
      baseTexture.cacheId = cacheId;
      BaseTexture2.addToCache(baseTexture, cacheId);
    }
    return baseTexture;
  };
  BaseTexture2.fromBuffer = function(buffer, width, height, options) {
    buffer = buffer || new Float32Array(width * height * 4);
    var resource = new BufferResource(buffer, { width, height });
    var type = buffer instanceof Float32Array ? TYPES.FLOAT : TYPES.UNSIGNED_BYTE;
    return new BaseTexture2(resource, Object.assign({}, defaultBufferOptions, options || { width, height, type }));
  };
  BaseTexture2.addToCache = function(baseTexture, id) {
    if (id) {
      if (baseTexture.textureCacheIds.indexOf(id) === -1) {
        baseTexture.textureCacheIds.push(id);
      }
      if (BaseTextureCache[id]) {
        console.warn("BaseTexture added to the cache with an id [" + id + "] that already had an entry");
      }
      BaseTextureCache[id] = baseTexture;
    }
  };
  BaseTexture2.removeFromCache = function(baseTexture) {
    if (typeof baseTexture === "string") {
      var baseTextureFromCache = BaseTextureCache[baseTexture];
      if (baseTextureFromCache) {
        var index2 = baseTextureFromCache.textureCacheIds.indexOf(baseTexture);
        if (index2 > -1) {
          baseTextureFromCache.textureCacheIds.splice(index2, 1);
        }
        delete BaseTextureCache[baseTexture];
        return baseTextureFromCache;
      }
    } else if (baseTexture && baseTexture.textureCacheIds) {
      for (var i = 0; i < baseTexture.textureCacheIds.length; ++i) {
        delete BaseTextureCache[baseTexture.textureCacheIds[i]];
      }
      baseTexture.textureCacheIds.length = 0;
      return baseTexture;
    }
    return null;
  };
  BaseTexture2._globalBatch = 0;
  return BaseTexture2;
}(EventEmitter);
var AbstractMultiResource = function(_super) {
  __extends$i(AbstractMultiResource2, _super);
  function AbstractMultiResource2(length, options) {
    var _this = this;
    var _a2 = options || {}, width = _a2.width, height = _a2.height;
    _this = _super.call(this, width, height) || this;
    _this.items = [];
    _this.itemDirtyIds = [];
    for (var i = 0; i < length; i++) {
      var partTexture = new BaseTexture();
      _this.items.push(partTexture);
      _this.itemDirtyIds.push(-2);
    }
    _this.length = length;
    _this._load = null;
    _this.baseTexture = null;
    return _this;
  }
  AbstractMultiResource2.prototype.initFromArray = function(resources2, options) {
    for (var i = 0; i < this.length; i++) {
      if (!resources2[i]) {
        continue;
      }
      if (resources2[i].castToBaseTexture) {
        this.addBaseTextureAt(resources2[i].castToBaseTexture(), i);
      } else if (resources2[i] instanceof Resource) {
        this.addResourceAt(resources2[i], i);
      } else {
        this.addResourceAt(autoDetectResource(resources2[i], options), i);
      }
    }
  };
  AbstractMultiResource2.prototype.dispose = function() {
    for (var i = 0, len = this.length; i < len; i++) {
      this.items[i].destroy();
    }
    this.items = null;
    this.itemDirtyIds = null;
    this._load = null;
  };
  AbstractMultiResource2.prototype.addResourceAt = function(resource, index2) {
    if (!this.items[index2]) {
      throw new Error("Index " + index2 + " is out of bounds");
    }
    if (resource.valid && !this.valid) {
      this.resize(resource.width, resource.height);
    }
    this.items[index2].setResource(resource);
    return this;
  };
  AbstractMultiResource2.prototype.bind = function(baseTexture) {
    if (this.baseTexture !== null) {
      throw new Error("Only one base texture per TextureArray is allowed");
    }
    _super.prototype.bind.call(this, baseTexture);
    for (var i = 0; i < this.length; i++) {
      this.items[i].parentTextureArray = baseTexture;
      this.items[i].on("update", baseTexture.update, baseTexture);
    }
  };
  AbstractMultiResource2.prototype.unbind = function(baseTexture) {
    _super.prototype.unbind.call(this, baseTexture);
    for (var i = 0; i < this.length; i++) {
      this.items[i].parentTextureArray = null;
      this.items[i].off("update", baseTexture.update, baseTexture);
    }
  };
  AbstractMultiResource2.prototype.load = function() {
    var _this = this;
    if (this._load) {
      return this._load;
    }
    var resources2 = this.items.map(function(item) {
      return item.resource;
    }).filter(function(item) {
      return item;
    });
    var promises = resources2.map(function(item) {
      return item.load();
    });
    this._load = Promise.all(promises).then(function() {
      var _a2 = _this.items[0], realWidth = _a2.realWidth, realHeight = _a2.realHeight;
      _this.resize(realWidth, realHeight);
      return Promise.resolve(_this);
    });
    return this._load;
  };
  return AbstractMultiResource2;
}(Resource);
var ArrayResource = function(_super) {
  __extends$i(ArrayResource2, _super);
  function ArrayResource2(source, options) {
    var _this = this;
    var _a2 = options || {}, width = _a2.width, height = _a2.height;
    var urls;
    var length;
    if (Array.isArray(source)) {
      urls = source;
      length = source.length;
    } else {
      length = source;
    }
    _this = _super.call(this, length, { width, height }) || this;
    if (urls) {
      _this.initFromArray(urls, options);
    }
    return _this;
  }
  ArrayResource2.prototype.addBaseTextureAt = function(baseTexture, index2) {
    if (baseTexture.resource) {
      this.addResourceAt(baseTexture.resource, index2);
    } else {
      throw new Error("ArrayResource does not support RenderTexture");
    }
    return this;
  };
  ArrayResource2.prototype.bind = function(baseTexture) {
    _super.prototype.bind.call(this, baseTexture);
    baseTexture.target = TARGETS.TEXTURE_2D_ARRAY;
  };
  ArrayResource2.prototype.upload = function(renderer, texture, glTexture) {
    var _a2 = this, length = _a2.length, itemDirtyIds = _a2.itemDirtyIds, items = _a2.items;
    var gl = renderer.gl;
    if (glTexture.dirtyId < 0) {
      gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, glTexture.internalFormat, this._width, this._height, length, 0, texture.format, glTexture.type, null);
    }
    for (var i = 0; i < length; i++) {
      var item = items[i];
      if (itemDirtyIds[i] < item.dirtyId) {
        itemDirtyIds[i] = item.dirtyId;
        if (item.valid) {
          gl.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,
            0,
            0,
            i,
            item.resource.width,
            item.resource.height,
            1,
            texture.format,
            glTexture.type,
            item.resource.source
          );
        }
      }
    }
    return true;
  };
  return ArrayResource2;
}(AbstractMultiResource);
var BaseImageResource = function(_super) {
  __extends$i(BaseImageResource2, _super);
  function BaseImageResource2(source) {
    var _this = this;
    var sourceAny = source;
    var width = sourceAny.naturalWidth || sourceAny.videoWidth || sourceAny.width;
    var height = sourceAny.naturalHeight || sourceAny.videoHeight || sourceAny.height;
    _this = _super.call(this, width, height) || this;
    _this.source = source;
    _this.noSubImage = false;
    return _this;
  }
  BaseImageResource2.crossOrigin = function(element, url2, crossorigin) {
    if (crossorigin === void 0 && url2.indexOf("data:") !== 0) {
      element.crossOrigin = determineCrossOrigin(url2);
    } else if (crossorigin !== false) {
      element.crossOrigin = typeof crossorigin === "string" ? crossorigin : "anonymous";
    }
  };
  BaseImageResource2.prototype.upload = function(renderer, baseTexture, glTexture, source) {
    var gl = renderer.gl;
    var width = baseTexture.realWidth;
    var height = baseTexture.realHeight;
    source = source || this.source;
    if (source instanceof HTMLImageElement) {
      if (!source.complete || source.naturalWidth === 0) {
        return false;
      }
    } else if (source instanceof HTMLVideoElement) {
      if (source.readyState <= 1) {
        return false;
      }
    }
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);
    if (!this.noSubImage && baseTexture.target === gl.TEXTURE_2D && glTexture.width === width && glTexture.height === height) {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, baseTexture.format, glTexture.type, source);
    } else {
      glTexture.width = width;
      glTexture.height = height;
      gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, baseTexture.format, glTexture.type, source);
    }
    return true;
  };
  BaseImageResource2.prototype.update = function() {
    if (this.destroyed) {
      return;
    }
    var source = this.source;
    var width = source.naturalWidth || source.videoWidth || source.width;
    var height = source.naturalHeight || source.videoHeight || source.height;
    this.resize(width, height);
    _super.prototype.update.call(this);
  };
  BaseImageResource2.prototype.dispose = function() {
    this.source = null;
  };
  return BaseImageResource2;
}(Resource);
var CanvasResource = function(_super) {
  __extends$i(CanvasResource2, _super);
  function CanvasResource2(source) {
    return _super.call(this, source) || this;
  }
  CanvasResource2.test = function(source) {
    var OffscreenCanvas2 = globalThis.OffscreenCanvas;
    if (OffscreenCanvas2 && source instanceof OffscreenCanvas2) {
      return true;
    }
    return globalThis.HTMLCanvasElement && source instanceof HTMLCanvasElement;
  };
  return CanvasResource2;
}(BaseImageResource);
var CubeResource = function(_super) {
  __extends$i(CubeResource2, _super);
  function CubeResource2(source, options) {
    var _this = this;
    var _a2 = options || {}, width = _a2.width, height = _a2.height, autoLoad = _a2.autoLoad, linkBaseTexture = _a2.linkBaseTexture;
    if (source && source.length !== CubeResource2.SIDES) {
      throw new Error("Invalid length. Got " + source.length + ", expected 6");
    }
    _this = _super.call(this, 6, { width, height }) || this;
    for (var i = 0; i < CubeResource2.SIDES; i++) {
      _this.items[i].target = TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    }
    _this.linkBaseTexture = linkBaseTexture !== false;
    if (source) {
      _this.initFromArray(source, options);
    }
    if (autoLoad !== false) {
      _this.load();
    }
    return _this;
  }
  CubeResource2.prototype.bind = function(baseTexture) {
    _super.prototype.bind.call(this, baseTexture);
    baseTexture.target = TARGETS.TEXTURE_CUBE_MAP;
  };
  CubeResource2.prototype.addBaseTextureAt = function(baseTexture, index2, linkBaseTexture) {
    if (!this.items[index2]) {
      throw new Error("Index " + index2 + " is out of bounds");
    }
    if (!this.linkBaseTexture || baseTexture.parentTextureArray || Object.keys(baseTexture._glTextures).length > 0) {
      if (baseTexture.resource) {
        this.addResourceAt(baseTexture.resource, index2);
      } else {
        throw new Error("CubeResource does not support copying of renderTexture.");
      }
    } else {
      baseTexture.target = TARGETS.TEXTURE_CUBE_MAP_POSITIVE_X + index2;
      baseTexture.parentTextureArray = this.baseTexture;
      this.items[index2] = baseTexture;
    }
    if (baseTexture.valid && !this.valid) {
      this.resize(baseTexture.realWidth, baseTexture.realHeight);
    }
    this.items[index2] = baseTexture;
    return this;
  };
  CubeResource2.prototype.upload = function(renderer, _baseTexture, glTexture) {
    var dirty = this.itemDirtyIds;
    for (var i = 0; i < CubeResource2.SIDES; i++) {
      var side = this.items[i];
      if (dirty[i] < side.dirtyId || glTexture.dirtyId < _baseTexture.dirtyId) {
        if (side.valid && side.resource) {
          side.resource.upload(renderer, side, glTexture);
          dirty[i] = side.dirtyId;
        } else if (dirty[i] < -1) {
          renderer.gl.texImage2D(side.target, 0, glTexture.internalFormat, _baseTexture.realWidth, _baseTexture.realHeight, 0, _baseTexture.format, glTexture.type, null);
          dirty[i] = -1;
        }
      }
    }
    return true;
  };
  CubeResource2.test = function(source) {
    return Array.isArray(source) && source.length === CubeResource2.SIDES;
  };
  CubeResource2.SIDES = 6;
  return CubeResource2;
}(AbstractMultiResource);
var ImageResource = function(_super) {
  __extends$i(ImageResource2, _super);
  function ImageResource2(source, options) {
    var _this = this;
    options = options || {};
    if (!(source instanceof HTMLImageElement)) {
      var imageElement = new Image();
      BaseImageResource.crossOrigin(imageElement, source, options.crossorigin);
      imageElement.src = source;
      source = imageElement;
    }
    _this = _super.call(this, source) || this;
    if (!source.complete && !!_this._width && !!_this._height) {
      _this._width = 0;
      _this._height = 0;
    }
    _this.url = source.src;
    _this._process = null;
    _this.preserveBitmap = false;
    _this.createBitmap = (options.createBitmap !== void 0 ? options.createBitmap : settings.CREATE_IMAGE_BITMAP) && !!globalThis.createImageBitmap;
    _this.alphaMode = typeof options.alphaMode === "number" ? options.alphaMode : null;
    _this.bitmap = null;
    _this._load = null;
    if (options.autoLoad !== false) {
      _this.load();
    }
    return _this;
  }
  ImageResource2.prototype.load = function(createBitmap) {
    var _this = this;
    if (this._load) {
      return this._load;
    }
    if (createBitmap !== void 0) {
      this.createBitmap = createBitmap;
    }
    this._load = new Promise(function(resolve2, reject2) {
      var source = _this.source;
      _this.url = source.src;
      var completed = function() {
        if (_this.destroyed) {
          return;
        }
        source.onload = null;
        source.onerror = null;
        _this.resize(source.width, source.height);
        _this._load = null;
        if (_this.createBitmap) {
          resolve2(_this.process());
        } else {
          resolve2(_this);
        }
      };
      if (source.complete && source.src) {
        completed();
      } else {
        source.onload = completed;
        source.onerror = function(event) {
          reject2(event);
          _this.onError.emit(event);
        };
      }
    });
    return this._load;
  };
  ImageResource2.prototype.process = function() {
    var _this = this;
    var source = this.source;
    if (this._process !== null) {
      return this._process;
    }
    if (this.bitmap !== null || !globalThis.createImageBitmap) {
      return Promise.resolve(this);
    }
    var createImageBitmap = globalThis.createImageBitmap;
    var cors = !source.crossOrigin || source.crossOrigin === "anonymous";
    this._process = fetch(source.src, {
      mode: cors ? "cors" : "no-cors"
    }).then(function(r) {
      return r.blob();
    }).then(function(blob) {
      return createImageBitmap(blob, 0, 0, source.width, source.height, {
        premultiplyAlpha: _this.alphaMode === null || _this.alphaMode === ALPHA_MODES.UNPACK ? "premultiply" : "none"
      });
    }).then(function(bitmap) {
      if (_this.destroyed) {
        return Promise.reject();
      }
      _this.bitmap = bitmap;
      _this.update();
      _this._process = null;
      return Promise.resolve(_this);
    });
    return this._process;
  };
  ImageResource2.prototype.upload = function(renderer, baseTexture, glTexture) {
    if (typeof this.alphaMode === "number") {
      baseTexture.alphaMode = this.alphaMode;
    }
    if (!this.createBitmap) {
      return _super.prototype.upload.call(this, renderer, baseTexture, glTexture);
    }
    if (!this.bitmap) {
      this.process();
      if (!this.bitmap) {
        return false;
      }
    }
    _super.prototype.upload.call(this, renderer, baseTexture, glTexture, this.bitmap);
    if (!this.preserveBitmap) {
      var flag = true;
      var glTextures = baseTexture._glTextures;
      for (var key in glTextures) {
        var otherTex = glTextures[key];
        if (otherTex !== glTexture && otherTex.dirtyId !== baseTexture.dirtyId) {
          flag = false;
          break;
        }
      }
      if (flag) {
        if (this.bitmap.close) {
          this.bitmap.close();
        }
        this.bitmap = null;
      }
    }
    return true;
  };
  ImageResource2.prototype.dispose = function() {
    this.source.onload = null;
    this.source.onerror = null;
    _super.prototype.dispose.call(this);
    if (this.bitmap) {
      this.bitmap.close();
      this.bitmap = null;
    }
    this._process = null;
    this._load = null;
  };
  ImageResource2.test = function(source) {
    return typeof source === "string" || source instanceof HTMLImageElement;
  };
  return ImageResource2;
}(BaseImageResource);
var SVGResource = function(_super) {
  __extends$i(SVGResource2, _super);
  function SVGResource2(sourceBase64, options) {
    var _this = this;
    options = options || {};
    _this = _super.call(this, settings.ADAPTER.createCanvas()) || this;
    _this._width = 0;
    _this._height = 0;
    _this.svg = sourceBase64;
    _this.scale = options.scale || 1;
    _this._overrideWidth = options.width;
    _this._overrideHeight = options.height;
    _this._resolve = null;
    _this._crossorigin = options.crossorigin;
    _this._load = null;
    if (options.autoLoad !== false) {
      _this.load();
    }
    return _this;
  }
  SVGResource2.prototype.load = function() {
    var _this = this;
    if (this._load) {
      return this._load;
    }
    this._load = new Promise(function(resolve2) {
      _this._resolve = function() {
        _this.resize(_this.source.width, _this.source.height);
        resolve2(_this);
      };
      if (SVGResource2.SVG_XML.test(_this.svg.trim())) {
        if (!btoa) {
          throw new Error("Your browser doesn't support base64 conversions.");
        }
        _this.svg = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(_this.svg)));
      }
      _this._loadSvg();
    });
    return this._load;
  };
  SVGResource2.prototype._loadSvg = function() {
    var _this = this;
    var tempImage = new Image();
    BaseImageResource.crossOrigin(tempImage, this.svg, this._crossorigin);
    tempImage.src = this.svg;
    tempImage.onerror = function(event) {
      if (!_this._resolve) {
        return;
      }
      tempImage.onerror = null;
      _this.onError.emit(event);
    };
    tempImage.onload = function() {
      if (!_this._resolve) {
        return;
      }
      var svgWidth = tempImage.width;
      var svgHeight = tempImage.height;
      if (!svgWidth || !svgHeight) {
        throw new Error("The SVG image must have width and height defined (in pixels), canvas API needs them.");
      }
      var width = svgWidth * _this.scale;
      var height = svgHeight * _this.scale;
      if (_this._overrideWidth || _this._overrideHeight) {
        width = _this._overrideWidth || _this._overrideHeight / svgHeight * svgWidth;
        height = _this._overrideHeight || _this._overrideWidth / svgWidth * svgHeight;
      }
      width = Math.round(width);
      height = Math.round(height);
      var canvas = _this.source;
      canvas.width = width;
      canvas.height = height;
      canvas._pixiId = "canvas_" + uid();
      canvas.getContext("2d").drawImage(tempImage, 0, 0, svgWidth, svgHeight, 0, 0, width, height);
      _this._resolve();
      _this._resolve = null;
    };
  };
  SVGResource2.getSize = function(svgString) {
    var sizeMatch = SVGResource2.SVG_SIZE.exec(svgString);
    var size = {};
    if (sizeMatch) {
      size[sizeMatch[1]] = Math.round(parseFloat(sizeMatch[3]));
      size[sizeMatch[5]] = Math.round(parseFloat(sizeMatch[7]));
    }
    return size;
  };
  SVGResource2.prototype.dispose = function() {
    _super.prototype.dispose.call(this);
    this._resolve = null;
    this._crossorigin = null;
  };
  SVGResource2.test = function(source, extension) {
    return extension === "svg" || typeof source === "string" && source.startsWith("data:image/svg+xml") || typeof source === "string" && SVGResource2.SVG_XML.test(source);
  };
  SVGResource2.SVG_XML = /^(<\?xml[^?]+\?>)?\s*(<!--[^(-->)]*-->)?\s*\<svg/m;
  SVGResource2.SVG_SIZE = /<svg[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*(?:\s(width|height)=('|")(\d*(?:\.\d+)?)(?:px)?('|"))[^>]*>/i;
  return SVGResource2;
}(BaseImageResource);
var VideoResource = function(_super) {
  __extends$i(VideoResource2, _super);
  function VideoResource2(source, options) {
    var _this = this;
    options = options || {};
    if (!(source instanceof HTMLVideoElement)) {
      var videoElement = document.createElement("video");
      videoElement.setAttribute("preload", "auto");
      videoElement.setAttribute("webkit-playsinline", "");
      videoElement.setAttribute("playsinline", "");
      if (typeof source === "string") {
        source = [source];
      }
      var firstSrc = source[0].src || source[0];
      BaseImageResource.crossOrigin(videoElement, firstSrc, options.crossorigin);
      for (var i = 0; i < source.length; ++i) {
        var sourceElement = document.createElement("source");
        var _a2 = source[i], src = _a2.src, mime = _a2.mime;
        src = src || source[i];
        var baseSrc = src.split("?").shift().toLowerCase();
        var ext = baseSrc.slice(baseSrc.lastIndexOf(".") + 1);
        mime = mime || VideoResource2.MIME_TYPES[ext] || "video/" + ext;
        sourceElement.src = src;
        sourceElement.type = mime;
        videoElement.appendChild(sourceElement);
      }
      source = videoElement;
    }
    _this = _super.call(this, source) || this;
    _this.noSubImage = true;
    _this._autoUpdate = true;
    _this._isConnectedToTicker = false;
    _this._updateFPS = options.updateFPS || 0;
    _this._msToNextUpdate = 0;
    _this.autoPlay = options.autoPlay !== false;
    _this._load = null;
    _this._resolve = null;
    _this._onCanPlay = _this._onCanPlay.bind(_this);
    _this._onError = _this._onError.bind(_this);
    if (options.autoLoad !== false) {
      _this.load();
    }
    return _this;
  }
  VideoResource2.prototype.update = function(_deltaTime) {
    if (!this.destroyed) {
      var elapsedMS = Ticker.shared.elapsedMS * this.source.playbackRate;
      this._msToNextUpdate = Math.floor(this._msToNextUpdate - elapsedMS);
      if (!this._updateFPS || this._msToNextUpdate <= 0) {
        _super.prototype.update.call(this);
        this._msToNextUpdate = this._updateFPS ? Math.floor(1e3 / this._updateFPS) : 0;
      }
    }
  };
  VideoResource2.prototype.load = function() {
    var _this = this;
    if (this._load) {
      return this._load;
    }
    var source = this.source;
    if ((source.readyState === source.HAVE_ENOUGH_DATA || source.readyState === source.HAVE_FUTURE_DATA) && source.width && source.height) {
      source.complete = true;
    }
    source.addEventListener("play", this._onPlayStart.bind(this));
    source.addEventListener("pause", this._onPlayStop.bind(this));
    if (!this._isSourceReady()) {
      source.addEventListener("canplay", this._onCanPlay);
      source.addEventListener("canplaythrough", this._onCanPlay);
      source.addEventListener("error", this._onError, true);
    } else {
      this._onCanPlay();
    }
    this._load = new Promise(function(resolve2) {
      if (_this.valid) {
        resolve2(_this);
      } else {
        _this._resolve = resolve2;
        source.load();
      }
    });
    return this._load;
  };
  VideoResource2.prototype._onError = function(event) {
    this.source.removeEventListener("error", this._onError, true);
    this.onError.emit(event);
  };
  VideoResource2.prototype._isSourcePlaying = function() {
    var source = this.source;
    return !source.paused && !source.ended && this._isSourceReady();
  };
  VideoResource2.prototype._isSourceReady = function() {
    var source = this.source;
    return source.readyState > 2;
  };
  VideoResource2.prototype._onPlayStart = function() {
    if (!this.valid) {
      this._onCanPlay();
    }
    if (this.autoUpdate && !this._isConnectedToTicker) {
      Ticker.shared.add(this.update, this);
      this._isConnectedToTicker = true;
    }
  };
  VideoResource2.prototype._onPlayStop = function() {
    if (this._isConnectedToTicker) {
      Ticker.shared.remove(this.update, this);
      this._isConnectedToTicker = false;
    }
  };
  VideoResource2.prototype._onCanPlay = function() {
    var source = this.source;
    source.removeEventListener("canplay", this._onCanPlay);
    source.removeEventListener("canplaythrough", this._onCanPlay);
    var valid = this.valid;
    this.resize(source.videoWidth, source.videoHeight);
    if (!valid && this._resolve) {
      this._resolve(this);
      this._resolve = null;
    }
    if (this._isSourcePlaying()) {
      this._onPlayStart();
    } else if (this.autoPlay) {
      source.play();
    }
  };
  VideoResource2.prototype.dispose = function() {
    if (this._isConnectedToTicker) {
      Ticker.shared.remove(this.update, this);
      this._isConnectedToTicker = false;
    }
    var source = this.source;
    if (source) {
      source.removeEventListener("error", this._onError, true);
      source.pause();
      source.src = "";
      source.load();
    }
    _super.prototype.dispose.call(this);
  };
  Object.defineProperty(VideoResource2.prototype, "autoUpdate", {
    get: function() {
      return this._autoUpdate;
    },
    set: function(value) {
      if (value !== this._autoUpdate) {
        this._autoUpdate = value;
        if (!this._autoUpdate && this._isConnectedToTicker) {
          Ticker.shared.remove(this.update, this);
          this._isConnectedToTicker = false;
        } else if (this._autoUpdate && !this._isConnectedToTicker && this._isSourcePlaying()) {
          Ticker.shared.add(this.update, this);
          this._isConnectedToTicker = true;
        }
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(VideoResource2.prototype, "updateFPS", {
    get: function() {
      return this._updateFPS;
    },
    set: function(value) {
      if (value !== this._updateFPS) {
        this._updateFPS = value;
      }
    },
    enumerable: false,
    configurable: true
  });
  VideoResource2.test = function(source, extension) {
    return globalThis.HTMLVideoElement && source instanceof HTMLVideoElement || VideoResource2.TYPES.indexOf(extension) > -1;
  };
  VideoResource2.TYPES = ["mp4", "m4v", "webm", "ogg", "ogv", "h264", "avi", "mov"];
  VideoResource2.MIME_TYPES = {
    ogv: "video/ogg",
    mov: "video/quicktime",
    m4v: "video/mp4"
  };
  return VideoResource2;
}(BaseImageResource);
var ImageBitmapResource = function(_super) {
  __extends$i(ImageBitmapResource2, _super);
  function ImageBitmapResource2(source) {
    return _super.call(this, source) || this;
  }
  ImageBitmapResource2.test = function(source) {
    return !!globalThis.createImageBitmap && typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap;
  };
  return ImageBitmapResource2;
}(BaseImageResource);
INSTALLED.push(ImageResource, ImageBitmapResource, CanvasResource, VideoResource, SVGResource, BufferResource, CubeResource, ArrayResource);
var _resources = {
  __proto__: null,
  Resource,
  BaseImageResource,
  INSTALLED,
  autoDetectResource,
  AbstractMultiResource,
  ArrayResource,
  BufferResource,
  CanvasResource,
  CubeResource,
  ImageResource,
  SVGResource,
  VideoResource,
  ImageBitmapResource
};
var DepthResource = function(_super) {
  __extends$i(DepthResource2, _super);
  function DepthResource2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  DepthResource2.prototype.upload = function(renderer, baseTexture, glTexture) {
    var gl = renderer.gl;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, baseTexture.alphaMode === ALPHA_MODES.UNPACK);
    var width = baseTexture.realWidth;
    var height = baseTexture.realHeight;
    if (glTexture.width === width && glTexture.height === height) {
      gl.texSubImage2D(baseTexture.target, 0, 0, 0, width, height, baseTexture.format, glTexture.type, this.data);
    } else {
      glTexture.width = width;
      glTexture.height = height;
      gl.texImage2D(baseTexture.target, 0, glTexture.internalFormat, width, height, 0, baseTexture.format, glTexture.type, this.data);
    }
    return true;
  };
  return DepthResource2;
}(BufferResource);
var Framebuffer = function() {
  function Framebuffer2(width, height) {
    this.width = Math.round(width || 100);
    this.height = Math.round(height || 100);
    this.stencil = false;
    this.depth = false;
    this.dirtyId = 0;
    this.dirtyFormat = 0;
    this.dirtySize = 0;
    this.depthTexture = null;
    this.colorTextures = [];
    this.glFramebuffers = {};
    this.disposeRunner = new Runner("disposeFramebuffer");
    this.multisample = MSAA_QUALITY.NONE;
  }
  Object.defineProperty(Framebuffer2.prototype, "colorTexture", {
    get: function() {
      return this.colorTextures[0];
    },
    enumerable: false,
    configurable: true
  });
  Framebuffer2.prototype.addColorTexture = function(index2, texture) {
    if (index2 === void 0) {
      index2 = 0;
    }
    this.colorTextures[index2] = texture || new BaseTexture(null, {
      scaleMode: SCALE_MODES.NEAREST,
      resolution: 1,
      mipmap: MIPMAP_MODES.OFF,
      width: this.width,
      height: this.height
    });
    this.dirtyId++;
    this.dirtyFormat++;
    return this;
  };
  Framebuffer2.prototype.addDepthTexture = function(texture) {
    this.depthTexture = texture || new BaseTexture(new DepthResource(null, { width: this.width, height: this.height }), {
      scaleMode: SCALE_MODES.NEAREST,
      resolution: 1,
      width: this.width,
      height: this.height,
      mipmap: MIPMAP_MODES.OFF,
      format: FORMATS.DEPTH_COMPONENT,
      type: TYPES.UNSIGNED_SHORT
    });
    this.dirtyId++;
    this.dirtyFormat++;
    return this;
  };
  Framebuffer2.prototype.enableDepth = function() {
    this.depth = true;
    this.dirtyId++;
    this.dirtyFormat++;
    return this;
  };
  Framebuffer2.prototype.enableStencil = function() {
    this.stencil = true;
    this.dirtyId++;
    this.dirtyFormat++;
    return this;
  };
  Framebuffer2.prototype.resize = function(width, height) {
    width = Math.round(width);
    height = Math.round(height);
    if (width === this.width && height === this.height) {
      return;
    }
    this.width = width;
    this.height = height;
    this.dirtyId++;
    this.dirtySize++;
    for (var i = 0; i < this.colorTextures.length; i++) {
      var texture = this.colorTextures[i];
      var resolution = texture.resolution;
      texture.setSize(width / resolution, height / resolution);
    }
    if (this.depthTexture) {
      var resolution = this.depthTexture.resolution;
      this.depthTexture.setSize(width / resolution, height / resolution);
    }
  };
  Framebuffer2.prototype.dispose = function() {
    this.disposeRunner.emit(this, false);
  };
  Framebuffer2.prototype.destroyDepthTexture = function() {
    if (this.depthTexture) {
      this.depthTexture.destroy();
      this.depthTexture = null;
      ++this.dirtyId;
      ++this.dirtyFormat;
    }
  };
  return Framebuffer2;
}();
var BaseRenderTexture = function(_super) {
  __extends$i(BaseRenderTexture2, _super);
  function BaseRenderTexture2(options) {
    if (options === void 0) {
      options = {};
    }
    var _this = this;
    if (typeof options === "number") {
      var width = arguments[0];
      var height = arguments[1];
      var scaleMode = arguments[2];
      var resolution = arguments[3];
      options = { width, height, scaleMode, resolution };
    }
    options.width = options.width || 100;
    options.height = options.height || 100;
    options.multisample = options.multisample !== void 0 ? options.multisample : MSAA_QUALITY.NONE;
    _this = _super.call(this, null, options) || this;
    _this.mipmap = MIPMAP_MODES.OFF;
    _this.valid = true;
    _this.clearColor = [0, 0, 0, 0];
    _this.framebuffer = new Framebuffer(_this.realWidth, _this.realHeight).addColorTexture(0, _this);
    _this.framebuffer.multisample = options.multisample;
    _this.maskStack = [];
    _this.filterStack = [{}];
    return _this;
  }
  BaseRenderTexture2.prototype.resize = function(desiredWidth, desiredHeight) {
    this.framebuffer.resize(desiredWidth * this.resolution, desiredHeight * this.resolution);
    this.setRealSize(this.framebuffer.width, this.framebuffer.height);
  };
  BaseRenderTexture2.prototype.dispose = function() {
    this.framebuffer.dispose();
    _super.prototype.dispose.call(this);
  };
  BaseRenderTexture2.prototype.destroy = function() {
    _super.prototype.destroy.call(this);
    this.framebuffer.destroyDepthTexture();
    this.framebuffer = null;
  };
  return BaseRenderTexture2;
}(BaseTexture);
var TextureUvs = function() {
  function TextureUvs2() {
    this.x0 = 0;
    this.y0 = 0;
    this.x1 = 1;
    this.y1 = 0;
    this.x2 = 1;
    this.y2 = 1;
    this.x3 = 0;
    this.y3 = 1;
    this.uvsFloat32 = new Float32Array(8);
  }
  TextureUvs2.prototype.set = function(frame, baseFrame, rotate) {
    var tw = baseFrame.width;
    var th = baseFrame.height;
    if (rotate) {
      var w2 = frame.width / 2 / tw;
      var h2 = frame.height / 2 / th;
      var cX = frame.x / tw + w2;
      var cY = frame.y / th + h2;
      rotate = groupD8.add(rotate, groupD8.NW);
      this.x0 = cX + w2 * groupD8.uX(rotate);
      this.y0 = cY + h2 * groupD8.uY(rotate);
      rotate = groupD8.add(rotate, 2);
      this.x1 = cX + w2 * groupD8.uX(rotate);
      this.y1 = cY + h2 * groupD8.uY(rotate);
      rotate = groupD8.add(rotate, 2);
      this.x2 = cX + w2 * groupD8.uX(rotate);
      this.y2 = cY + h2 * groupD8.uY(rotate);
      rotate = groupD8.add(rotate, 2);
      this.x3 = cX + w2 * groupD8.uX(rotate);
      this.y3 = cY + h2 * groupD8.uY(rotate);
    } else {
      this.x0 = frame.x / tw;
      this.y0 = frame.y / th;
      this.x1 = (frame.x + frame.width) / tw;
      this.y1 = frame.y / th;
      this.x2 = (frame.x + frame.width) / tw;
      this.y2 = (frame.y + frame.height) / th;
      this.x3 = frame.x / tw;
      this.y3 = (frame.y + frame.height) / th;
    }
    this.uvsFloat32[0] = this.x0;
    this.uvsFloat32[1] = this.y0;
    this.uvsFloat32[2] = this.x1;
    this.uvsFloat32[3] = this.y1;
    this.uvsFloat32[4] = this.x2;
    this.uvsFloat32[5] = this.y2;
    this.uvsFloat32[6] = this.x3;
    this.uvsFloat32[7] = this.y3;
  };
  TextureUvs2.prototype.toString = function() {
    return "[@pixi/core:TextureUvs " + ("x0=" + this.x0 + " y0=" + this.y0 + " ") + ("x1=" + this.x1 + " y1=" + this.y1 + " x2=" + this.x2 + " ") + ("y2=" + this.y2 + " x3=" + this.x3 + " y3=" + this.y3) + "]";
  };
  return TextureUvs2;
}();
var DEFAULT_UVS = new TextureUvs();
function removeAllHandlers(tex) {
  tex.destroy = function _emptyDestroy() {
  };
  tex.on = function _emptyOn() {
  };
  tex.once = function _emptyOnce() {
  };
  tex.emit = function _emptyEmit() {
  };
}
var Texture = function(_super) {
  __extends$i(Texture2, _super);
  function Texture2(baseTexture, frame, orig, trim, rotate, anchor) {
    var _this = _super.call(this) || this;
    _this.noFrame = false;
    if (!frame) {
      _this.noFrame = true;
      frame = new Rectangle(0, 0, 1, 1);
    }
    if (baseTexture instanceof Texture2) {
      baseTexture = baseTexture.baseTexture;
    }
    _this.baseTexture = baseTexture;
    _this._frame = frame;
    _this.trim = trim;
    _this.valid = false;
    _this._uvs = DEFAULT_UVS;
    _this.uvMatrix = null;
    _this.orig = orig || frame;
    _this._rotate = Number(rotate || 0);
    if (rotate === true) {
      _this._rotate = 2;
    } else if (_this._rotate % 2 !== 0) {
      throw new Error("attempt to use diamond-shaped UVs. If you are sure, set rotation manually");
    }
    _this.defaultAnchor = anchor ? new Point(anchor.x, anchor.y) : new Point(0, 0);
    _this._updateID = 0;
    _this.textureCacheIds = [];
    if (!baseTexture.valid) {
      baseTexture.once("loaded", _this.onBaseTextureUpdated, _this);
    } else if (_this.noFrame) {
      if (baseTexture.valid) {
        _this.onBaseTextureUpdated(baseTexture);
      }
    } else {
      _this.frame = frame;
    }
    if (_this.noFrame) {
      baseTexture.on("update", _this.onBaseTextureUpdated, _this);
    }
    return _this;
  }
  Texture2.prototype.update = function() {
    if (this.baseTexture.resource) {
      this.baseTexture.resource.update();
    }
  };
  Texture2.prototype.onBaseTextureUpdated = function(baseTexture) {
    if (this.noFrame) {
      if (!this.baseTexture.valid) {
        return;
      }
      this._frame.width = baseTexture.width;
      this._frame.height = baseTexture.height;
      this.valid = true;
      this.updateUvs();
    } else {
      this.frame = this._frame;
    }
    this.emit("update", this);
  };
  Texture2.prototype.destroy = function(destroyBase) {
    if (this.baseTexture) {
      if (destroyBase) {
        var resource = this.baseTexture.resource;
        if (resource && resource.url && TextureCache[resource.url]) {
          Texture2.removeFromCache(resource.url);
        }
        this.baseTexture.destroy();
      }
      this.baseTexture.off("loaded", this.onBaseTextureUpdated, this);
      this.baseTexture.off("update", this.onBaseTextureUpdated, this);
      this.baseTexture = null;
    }
    this._frame = null;
    this._uvs = null;
    this.trim = null;
    this.orig = null;
    this.valid = false;
    Texture2.removeFromCache(this);
    this.textureCacheIds = null;
  };
  Texture2.prototype.clone = function() {
    var clonedFrame = this._frame.clone();
    var clonedOrig = this._frame === this.orig ? clonedFrame : this.orig.clone();
    var clonedTexture = new Texture2(this.baseTexture, !this.noFrame && clonedFrame, clonedOrig, this.trim && this.trim.clone(), this.rotate, this.defaultAnchor);
    if (this.noFrame) {
      clonedTexture._frame = clonedFrame;
    }
    return clonedTexture;
  };
  Texture2.prototype.updateUvs = function() {
    if (this._uvs === DEFAULT_UVS) {
      this._uvs = new TextureUvs();
    }
    this._uvs.set(this._frame, this.baseTexture, this.rotate);
    this._updateID++;
  };
  Texture2.from = function(source, options, strict) {
    if (options === void 0) {
      options = {};
    }
    if (strict === void 0) {
      strict = settings.STRICT_TEXTURE_CACHE;
    }
    var isFrame = typeof source === "string";
    var cacheId = null;
    if (isFrame) {
      cacheId = source;
    } else if (source instanceof BaseTexture) {
      if (!source.cacheId) {
        var prefix = options && options.pixiIdPrefix || "pixiid";
        source.cacheId = prefix + "-" + uid();
        BaseTexture.addToCache(source, source.cacheId);
      }
      cacheId = source.cacheId;
    } else {
      if (!source._pixiId) {
        var prefix = options && options.pixiIdPrefix || "pixiid";
        source._pixiId = prefix + "_" + uid();
      }
      cacheId = source._pixiId;
    }
    var texture = TextureCache[cacheId];
    if (isFrame && strict && !texture) {
      throw new Error('The cacheId "' + cacheId + '" does not exist in TextureCache.');
    }
    if (!texture && !(source instanceof BaseTexture)) {
      if (!options.resolution) {
        options.resolution = getResolutionOfUrl(source);
      }
      texture = new Texture2(new BaseTexture(source, options));
      texture.baseTexture.cacheId = cacheId;
      BaseTexture.addToCache(texture.baseTexture, cacheId);
      Texture2.addToCache(texture, cacheId);
    } else if (!texture && source instanceof BaseTexture) {
      texture = new Texture2(source);
      Texture2.addToCache(texture, cacheId);
    }
    return texture;
  };
  Texture2.fromURL = function(url2, options) {
    var resourceOptions = Object.assign({ autoLoad: false }, options === null || options === void 0 ? void 0 : options.resourceOptions);
    var texture = Texture2.from(url2, Object.assign({ resourceOptions }, options), false);
    var resource = texture.baseTexture.resource;
    if (texture.baseTexture.valid) {
      return Promise.resolve(texture);
    }
    return resource.load().then(function() {
      return Promise.resolve(texture);
    });
  };
  Texture2.fromBuffer = function(buffer, width, height, options) {
    return new Texture2(BaseTexture.fromBuffer(buffer, width, height, options));
  };
  Texture2.fromLoader = function(source, imageUrl, name, options) {
    var baseTexture = new BaseTexture(source, Object.assign({
      scaleMode: settings.SCALE_MODE,
      resolution: getResolutionOfUrl(imageUrl)
    }, options));
    var resource = baseTexture.resource;
    if (resource instanceof ImageResource) {
      resource.url = imageUrl;
    }
    var texture = new Texture2(baseTexture);
    if (!name) {
      name = imageUrl;
    }
    BaseTexture.addToCache(texture.baseTexture, name);
    Texture2.addToCache(texture, name);
    if (name !== imageUrl) {
      BaseTexture.addToCache(texture.baseTexture, imageUrl);
      Texture2.addToCache(texture, imageUrl);
    }
    if (texture.baseTexture.valid) {
      return Promise.resolve(texture);
    }
    return new Promise(function(resolve2) {
      texture.baseTexture.once("loaded", function() {
        return resolve2(texture);
      });
    });
  };
  Texture2.addToCache = function(texture, id) {
    if (id) {
      if (texture.textureCacheIds.indexOf(id) === -1) {
        texture.textureCacheIds.push(id);
      }
      if (TextureCache[id]) {
        console.warn("Texture added to the cache with an id [" + id + "] that already had an entry");
      }
      TextureCache[id] = texture;
    }
  };
  Texture2.removeFromCache = function(texture) {
    if (typeof texture === "string") {
      var textureFromCache = TextureCache[texture];
      if (textureFromCache) {
        var index2 = textureFromCache.textureCacheIds.indexOf(texture);
        if (index2 > -1) {
          textureFromCache.textureCacheIds.splice(index2, 1);
        }
        delete TextureCache[texture];
        return textureFromCache;
      }
    } else if (texture && texture.textureCacheIds) {
      for (var i = 0; i < texture.textureCacheIds.length; ++i) {
        if (TextureCache[texture.textureCacheIds[i]] === texture) {
          delete TextureCache[texture.textureCacheIds[i]];
        }
      }
      texture.textureCacheIds.length = 0;
      return texture;
    }
    return null;
  };
  Object.defineProperty(Texture2.prototype, "resolution", {
    get: function() {
      return this.baseTexture.resolution;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Texture2.prototype, "frame", {
    get: function() {
      return this._frame;
    },
    set: function(frame) {
      this._frame = frame;
      this.noFrame = false;
      var x = frame.x, y = frame.y, width = frame.width, height = frame.height;
      var xNotFit = x + width > this.baseTexture.width;
      var yNotFit = y + height > this.baseTexture.height;
      if (xNotFit || yNotFit) {
        var relationship = xNotFit && yNotFit ? "and" : "or";
        var errorX = "X: " + x + " + " + width + " = " + (x + width) + " > " + this.baseTexture.width;
        var errorY = "Y: " + y + " + " + height + " = " + (y + height) + " > " + this.baseTexture.height;
        throw new Error("Texture Error: frame does not fit inside the base Texture dimensions: " + (errorX + " " + relationship + " " + errorY));
      }
      this.valid = width && height && this.baseTexture.valid;
      if (!this.trim && !this.rotate) {
        this.orig = frame;
      }
      if (this.valid) {
        this.updateUvs();
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Texture2.prototype, "rotate", {
    get: function() {
      return this._rotate;
    },
    set: function(rotate) {
      this._rotate = rotate;
      if (this.valid) {
        this.updateUvs();
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Texture2.prototype, "width", {
    get: function() {
      return this.orig.width;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Texture2.prototype, "height", {
    get: function() {
      return this.orig.height;
    },
    enumerable: false,
    configurable: true
  });
  Texture2.prototype.castToBaseTexture = function() {
    return this.baseTexture;
  };
  Object.defineProperty(Texture2, "EMPTY", {
    get: function() {
      if (!Texture2._EMPTY) {
        Texture2._EMPTY = new Texture2(new BaseTexture());
        removeAllHandlers(Texture2._EMPTY);
        removeAllHandlers(Texture2._EMPTY.baseTexture);
      }
      return Texture2._EMPTY;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Texture2, "WHITE", {
    get: function() {
      if (!Texture2._WHITE) {
        var canvas = settings.ADAPTER.createCanvas(16, 16);
        var context2 = canvas.getContext("2d");
        canvas.width = 16;
        canvas.height = 16;
        context2.fillStyle = "white";
        context2.fillRect(0, 0, 16, 16);
        Texture2._WHITE = new Texture2(BaseTexture.from(canvas));
        removeAllHandlers(Texture2._WHITE);
        removeAllHandlers(Texture2._WHITE.baseTexture);
      }
      return Texture2._WHITE;
    },
    enumerable: false,
    configurable: true
  });
  return Texture2;
}(EventEmitter);
var RenderTexture = function(_super) {
  __extends$i(RenderTexture2, _super);
  function RenderTexture2(baseRenderTexture, frame) {
    var _this = _super.call(this, baseRenderTexture, frame) || this;
    _this.valid = true;
    _this.filterFrame = null;
    _this.filterPoolKey = null;
    _this.updateUvs();
    return _this;
  }
  Object.defineProperty(RenderTexture2.prototype, "framebuffer", {
    get: function() {
      return this.baseTexture.framebuffer;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(RenderTexture2.prototype, "multisample", {
    get: function() {
      return this.framebuffer.multisample;
    },
    set: function(value) {
      this.framebuffer.multisample = value;
    },
    enumerable: false,
    configurable: true
  });
  RenderTexture2.prototype.resize = function(desiredWidth, desiredHeight, resizeBaseTexture) {
    if (resizeBaseTexture === void 0) {
      resizeBaseTexture = true;
    }
    var resolution = this.baseTexture.resolution;
    var width = Math.round(desiredWidth * resolution) / resolution;
    var height = Math.round(desiredHeight * resolution) / resolution;
    this.valid = width > 0 && height > 0;
    this._frame.width = this.orig.width = width;
    this._frame.height = this.orig.height = height;
    if (resizeBaseTexture) {
      this.baseTexture.resize(width, height);
    }
    this.updateUvs();
  };
  RenderTexture2.prototype.setResolution = function(resolution) {
    var baseTexture = this.baseTexture;
    if (baseTexture.resolution === resolution) {
      return;
    }
    baseTexture.setResolution(resolution);
    this.resize(baseTexture.width, baseTexture.height, false);
  };
  RenderTexture2.create = function(options) {
    var arguments$1 = arguments;
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      rest[_i - 1] = arguments$1[_i];
    }
    if (typeof options === "number") {
      deprecation("6.0.0", "Arguments (width, height, scaleMode, resolution) have been deprecated.");
      options = {
        width: options,
        height: rest[0],
        scaleMode: rest[1],
        resolution: rest[2]
      };
    }
    return new RenderTexture2(new BaseRenderTexture(options));
  };
  return RenderTexture2;
}(Texture);
var RenderTexturePool = function() {
  function RenderTexturePool2(textureOptions) {
    this.texturePool = {};
    this.textureOptions = textureOptions || {};
    this.enableFullScreen = false;
    this._pixelsWidth = 0;
    this._pixelsHeight = 0;
  }
  RenderTexturePool2.prototype.createTexture = function(realWidth, realHeight, multisample) {
    if (multisample === void 0) {
      multisample = MSAA_QUALITY.NONE;
    }
    var baseRenderTexture = new BaseRenderTexture(Object.assign({
      width: realWidth,
      height: realHeight,
      resolution: 1,
      multisample
    }, this.textureOptions));
    return new RenderTexture(baseRenderTexture);
  };
  RenderTexturePool2.prototype.getOptimalTexture = function(minWidth, minHeight, resolution, multisample) {
    if (resolution === void 0) {
      resolution = 1;
    }
    if (multisample === void 0) {
      multisample = MSAA_QUALITY.NONE;
    }
    var key;
    minWidth = Math.ceil(minWidth * resolution - 1e-6);
    minHeight = Math.ceil(minHeight * resolution - 1e-6);
    if (!this.enableFullScreen || minWidth !== this._pixelsWidth || minHeight !== this._pixelsHeight) {
      minWidth = nextPow2(minWidth);
      minHeight = nextPow2(minHeight);
      key = ((minWidth & 65535) << 16 | minHeight & 65535) >>> 0;
      if (multisample > 1) {
        key += multisample * 4294967296;
      }
    } else {
      key = multisample > 1 ? -multisample : -1;
    }
    if (!this.texturePool[key]) {
      this.texturePool[key] = [];
    }
    var renderTexture = this.texturePool[key].pop();
    if (!renderTexture) {
      renderTexture = this.createTexture(minWidth, minHeight, multisample);
    }
    renderTexture.filterPoolKey = key;
    renderTexture.setResolution(resolution);
    return renderTexture;
  };
  RenderTexturePool2.prototype.getFilterTexture = function(input, resolution, multisample) {
    var filterTexture = this.getOptimalTexture(input.width, input.height, resolution || input.resolution, multisample || MSAA_QUALITY.NONE);
    filterTexture.filterFrame = input.filterFrame;
    return filterTexture;
  };
  RenderTexturePool2.prototype.returnTexture = function(renderTexture) {
    var key = renderTexture.filterPoolKey;
    renderTexture.filterFrame = null;
    this.texturePool[key].push(renderTexture);
  };
  RenderTexturePool2.prototype.returnFilterTexture = function(renderTexture) {
    this.returnTexture(renderTexture);
  };
  RenderTexturePool2.prototype.clear = function(destroyTextures) {
    destroyTextures = destroyTextures !== false;
    if (destroyTextures) {
      for (var i in this.texturePool) {
        var textures = this.texturePool[i];
        if (textures) {
          for (var j = 0; j < textures.length; j++) {
            textures[j].destroy(true);
          }
        }
      }
    }
    this.texturePool = {};
  };
  RenderTexturePool2.prototype.setScreenSize = function(size) {
    if (size.width === this._pixelsWidth && size.height === this._pixelsHeight) {
      return;
    }
    this.enableFullScreen = size.width > 0 && size.height > 0;
    for (var i in this.texturePool) {
      if (!(Number(i) < 0)) {
        continue;
      }
      var textures = this.texturePool[i];
      if (textures) {
        for (var j = 0; j < textures.length; j++) {
          textures[j].destroy(true);
        }
      }
      this.texturePool[i] = [];
    }
    this._pixelsWidth = size.width;
    this._pixelsHeight = size.height;
  };
  RenderTexturePool2.SCREEN_KEY = -1;
  return RenderTexturePool2;
}();
var Attribute = function() {
  function Attribute2(buffer, size, normalized, type, stride, start, instance) {
    if (size === void 0) {
      size = 0;
    }
    if (normalized === void 0) {
      normalized = false;
    }
    if (type === void 0) {
      type = TYPES.FLOAT;
    }
    this.buffer = buffer;
    this.size = size;
    this.normalized = normalized;
    this.type = type;
    this.stride = stride;
    this.start = start;
    this.instance = instance;
  }
  Attribute2.prototype.destroy = function() {
    this.buffer = null;
  };
  Attribute2.from = function(buffer, size, normalized, type, stride) {
    return new Attribute2(buffer, size, normalized, type, stride);
  };
  return Attribute2;
}();
var UID$4 = 0;
var Buffer2 = function() {
  function Buffer3(data, _static, index2) {
    if (_static === void 0) {
      _static = true;
    }
    if (index2 === void 0) {
      index2 = false;
    }
    this.data = data || new Float32Array(1);
    this._glBuffers = {};
    this._updateID = 0;
    this.index = index2;
    this.static = _static;
    this.id = UID$4++;
    this.disposeRunner = new Runner("disposeBuffer");
  }
  Buffer3.prototype.update = function(data) {
    if (data instanceof Array) {
      data = new Float32Array(data);
    }
    this.data = data || this.data;
    this._updateID++;
  };
  Buffer3.prototype.dispose = function() {
    this.disposeRunner.emit(this, false);
  };
  Buffer3.prototype.destroy = function() {
    this.dispose();
    this.data = null;
  };
  Object.defineProperty(Buffer3.prototype, "index", {
    get: function() {
      return this.type === BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
    },
    set: function(value) {
      this.type = value ? BUFFER_TYPE.ELEMENT_ARRAY_BUFFER : BUFFER_TYPE.ARRAY_BUFFER;
    },
    enumerable: false,
    configurable: true
  });
  Buffer3.from = function(data) {
    if (data instanceof Array) {
      data = new Float32Array(data);
    }
    return new Buffer3(data);
  };
  return Buffer3;
}();
var map$1 = {
  Float32Array,
  Uint32Array,
  Int32Array,
  Uint8Array
};
function interleaveTypedArrays(arrays, sizes) {
  var outSize = 0;
  var stride = 0;
  var views = {};
  for (var i = 0; i < arrays.length; i++) {
    stride += sizes[i];
    outSize += arrays[i].length;
  }
  var buffer = new ArrayBuffer(outSize * 4);
  var out = null;
  var littleOffset = 0;
  for (var i = 0; i < arrays.length; i++) {
    var size = sizes[i];
    var array = arrays[i];
    var type = getBufferType(array);
    if (!views[type]) {
      views[type] = new map$1[type](buffer);
    }
    out = views[type];
    for (var j = 0; j < array.length; j++) {
      var indexStart = (j / size | 0) * stride + littleOffset;
      var index2 = j % size;
      out[indexStart + index2] = array[j];
    }
    littleOffset += size;
  }
  return new Float32Array(buffer);
}
var byteSizeMap$1 = { 5126: 4, 5123: 2, 5121: 1 };
var UID$3 = 0;
var map$2 = {
  Float32Array,
  Uint32Array,
  Int32Array,
  Uint8Array,
  Uint16Array
};
var Geometry = function() {
  function Geometry2(buffers, attributes) {
    if (buffers === void 0) {
      buffers = [];
    }
    if (attributes === void 0) {
      attributes = {};
    }
    this.buffers = buffers;
    this.indexBuffer = null;
    this.attributes = attributes;
    this.glVertexArrayObjects = {};
    this.id = UID$3++;
    this.instanced = false;
    this.instanceCount = 1;
    this.disposeRunner = new Runner("disposeGeometry");
    this.refCount = 0;
  }
  Geometry2.prototype.addAttribute = function(id, buffer, size, normalized, type, stride, start, instance) {
    if (size === void 0) {
      size = 0;
    }
    if (normalized === void 0) {
      normalized = false;
    }
    if (instance === void 0) {
      instance = false;
    }
    if (!buffer) {
      throw new Error("You must pass a buffer when creating an attribute");
    }
    if (!(buffer instanceof Buffer2)) {
      if (buffer instanceof Array) {
        buffer = new Float32Array(buffer);
      }
      buffer = new Buffer2(buffer);
    }
    var ids = id.split("|");
    if (ids.length > 1) {
      for (var i = 0; i < ids.length; i++) {
        this.addAttribute(ids[i], buffer, size, normalized, type);
      }
      return this;
    }
    var bufferIndex = this.buffers.indexOf(buffer);
    if (bufferIndex === -1) {
      this.buffers.push(buffer);
      bufferIndex = this.buffers.length - 1;
    }
    this.attributes[id] = new Attribute(bufferIndex, size, normalized, type, stride, start, instance);
    this.instanced = this.instanced || instance;
    return this;
  };
  Geometry2.prototype.getAttribute = function(id) {
    return this.attributes[id];
  };
  Geometry2.prototype.getBuffer = function(id) {
    return this.buffers[this.getAttribute(id).buffer];
  };
  Geometry2.prototype.addIndex = function(buffer) {
    if (!(buffer instanceof Buffer2)) {
      if (buffer instanceof Array) {
        buffer = new Uint16Array(buffer);
      }
      buffer = new Buffer2(buffer);
    }
    buffer.type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
    this.indexBuffer = buffer;
    if (this.buffers.indexOf(buffer) === -1) {
      this.buffers.push(buffer);
    }
    return this;
  };
  Geometry2.prototype.getIndex = function() {
    return this.indexBuffer;
  };
  Geometry2.prototype.interleave = function() {
    if (this.buffers.length === 1 || this.buffers.length === 2 && this.indexBuffer) {
      return this;
    }
    var arrays = [];
    var sizes = [];
    var interleavedBuffer = new Buffer2();
    var i;
    for (i in this.attributes) {
      var attribute = this.attributes[i];
      var buffer = this.buffers[attribute.buffer];
      arrays.push(buffer.data);
      sizes.push(attribute.size * byteSizeMap$1[attribute.type] / 4);
      attribute.buffer = 0;
    }
    interleavedBuffer.data = interleaveTypedArrays(arrays, sizes);
    for (i = 0; i < this.buffers.length; i++) {
      if (this.buffers[i] !== this.indexBuffer) {
        this.buffers[i].destroy();
      }
    }
    this.buffers = [interleavedBuffer];
    if (this.indexBuffer) {
      this.buffers.push(this.indexBuffer);
    }
    return this;
  };
  Geometry2.prototype.getSize = function() {
    for (var i in this.attributes) {
      var attribute = this.attributes[i];
      var buffer = this.buffers[attribute.buffer];
      return buffer.data.length / (attribute.stride / 4 || attribute.size);
    }
    return 0;
  };
  Geometry2.prototype.dispose = function() {
    this.disposeRunner.emit(this, false);
  };
  Geometry2.prototype.destroy = function() {
    this.dispose();
    this.buffers = null;
    this.indexBuffer = null;
    this.attributes = null;
  };
  Geometry2.prototype.clone = function() {
    var geometry = new Geometry2();
    for (var i = 0; i < this.buffers.length; i++) {
      geometry.buffers[i] = new Buffer2(this.buffers[i].data.slice(0));
    }
    for (var i in this.attributes) {
      var attrib = this.attributes[i];
      geometry.attributes[i] = new Attribute(attrib.buffer, attrib.size, attrib.normalized, attrib.type, attrib.stride, attrib.start, attrib.instance);
    }
    if (this.indexBuffer) {
      geometry.indexBuffer = geometry.buffers[this.buffers.indexOf(this.indexBuffer)];
      geometry.indexBuffer.type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
    }
    return geometry;
  };
  Geometry2.merge = function(geometries) {
    var geometryOut = new Geometry2();
    var arrays = [];
    var sizes = [];
    var offsets = [];
    var geometry;
    for (var i = 0; i < geometries.length; i++) {
      geometry = geometries[i];
      for (var j = 0; j < geometry.buffers.length; j++) {
        sizes[j] = sizes[j] || 0;
        sizes[j] += geometry.buffers[j].data.length;
        offsets[j] = 0;
      }
    }
    for (var i = 0; i < geometry.buffers.length; i++) {
      arrays[i] = new map$2[getBufferType(geometry.buffers[i].data)](sizes[i]);
      geometryOut.buffers[i] = new Buffer2(arrays[i]);
    }
    for (var i = 0; i < geometries.length; i++) {
      geometry = geometries[i];
      for (var j = 0; j < geometry.buffers.length; j++) {
        arrays[j].set(geometry.buffers[j].data, offsets[j]);
        offsets[j] += geometry.buffers[j].data.length;
      }
    }
    geometryOut.attributes = geometry.attributes;
    if (geometry.indexBuffer) {
      geometryOut.indexBuffer = geometryOut.buffers[geometry.buffers.indexOf(geometry.indexBuffer)];
      geometryOut.indexBuffer.type = BUFFER_TYPE.ELEMENT_ARRAY_BUFFER;
      var offset = 0;
      var stride = 0;
      var offset2 = 0;
      var bufferIndexToCount = 0;
      for (var i = 0; i < geometry.buffers.length; i++) {
        if (geometry.buffers[i] !== geometry.indexBuffer) {
          bufferIndexToCount = i;
          break;
        }
      }
      for (var i in geometry.attributes) {
        var attribute = geometry.attributes[i];
        if ((attribute.buffer | 0) === bufferIndexToCount) {
          stride += attribute.size * byteSizeMap$1[attribute.type] / 4;
        }
      }
      for (var i = 0; i < geometries.length; i++) {
        var indexBufferData = geometries[i].indexBuffer.data;
        for (var j = 0; j < indexBufferData.length; j++) {
          geometryOut.indexBuffer.data[j + offset2] += offset;
        }
        offset += geometries[i].buffers[bufferIndexToCount].data.length / stride;
        offset2 += indexBufferData.length;
      }
    }
    return geometryOut;
  };
  return Geometry2;
}();
var Quad = function(_super) {
  __extends$i(Quad2, _super);
  function Quad2() {
    var _this = _super.call(this) || this;
    _this.addAttribute("aVertexPosition", new Float32Array([
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1
    ])).addIndex([0, 1, 3, 2]);
    return _this;
  }
  return Quad2;
}(Geometry);
var QuadUv = function(_super) {
  __extends$i(QuadUv2, _super);
  function QuadUv2() {
    var _this = _super.call(this) || this;
    _this.vertices = new Float32Array([
      -1,
      -1,
      1,
      -1,
      1,
      1,
      -1,
      1
    ]);
    _this.uvs = new Float32Array([
      0,
      0,
      1,
      0,
      1,
      1,
      0,
      1
    ]);
    _this.vertexBuffer = new Buffer2(_this.vertices);
    _this.uvBuffer = new Buffer2(_this.uvs);
    _this.addAttribute("aVertexPosition", _this.vertexBuffer).addAttribute("aTextureCoord", _this.uvBuffer).addIndex([0, 1, 2, 0, 2, 3]);
    return _this;
  }
  QuadUv2.prototype.map = function(targetTextureFrame, destinationFrame) {
    var x = 0;
    var y = 0;
    this.uvs[0] = x;
    this.uvs[1] = y;
    this.uvs[2] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[3] = y;
    this.uvs[4] = x + destinationFrame.width / targetTextureFrame.width;
    this.uvs[5] = y + destinationFrame.height / targetTextureFrame.height;
    this.uvs[6] = x;
    this.uvs[7] = y + destinationFrame.height / targetTextureFrame.height;
    x = destinationFrame.x;
    y = destinationFrame.y;
    this.vertices[0] = x;
    this.vertices[1] = y;
    this.vertices[2] = x + destinationFrame.width;
    this.vertices[3] = y;
    this.vertices[4] = x + destinationFrame.width;
    this.vertices[5] = y + destinationFrame.height;
    this.vertices[6] = x;
    this.vertices[7] = y + destinationFrame.height;
    this.invalidate();
    return this;
  };
  QuadUv2.prototype.invalidate = function() {
    this.vertexBuffer._updateID++;
    this.uvBuffer._updateID++;
    return this;
  };
  return QuadUv2;
}(Geometry);
var UID$2 = 0;
var UniformGroup = function() {
  function UniformGroup2(uniforms, isStatic, isUbo) {
    this.group = true;
    this.syncUniforms = {};
    this.dirtyId = 0;
    this.id = UID$2++;
    this.static = !!isStatic;
    this.ubo = !!isUbo;
    if (uniforms instanceof Buffer2) {
      this.buffer = uniforms;
      this.buffer.type = BUFFER_TYPE.UNIFORM_BUFFER;
      this.autoManage = false;
      this.ubo = true;
    } else {
      this.uniforms = uniforms;
      if (this.ubo) {
        this.buffer = new Buffer2(new Float32Array(1));
        this.buffer.type = BUFFER_TYPE.UNIFORM_BUFFER;
        this.autoManage = true;
      }
    }
  }
  UniformGroup2.prototype.update = function() {
    this.dirtyId++;
    if (!this.autoManage && this.buffer) {
      this.buffer.update();
    }
  };
  UniformGroup2.prototype.add = function(name, uniforms, _static) {
    if (!this.ubo) {
      this.uniforms[name] = new UniformGroup2(uniforms, _static);
    } else {
      throw new Error("[UniformGroup] uniform groups in ubo mode cannot be modified, or have uniform groups nested in them");
    }
  };
  UniformGroup2.from = function(uniforms, _static, _ubo) {
    return new UniformGroup2(uniforms, _static, _ubo);
  };
  UniformGroup2.uboFrom = function(uniforms, _static) {
    return new UniformGroup2(uniforms, _static !== null && _static !== void 0 ? _static : true, true);
  };
  return UniformGroup2;
}();
var FilterState = function() {
  function FilterState2() {
    this.renderTexture = null;
    this.target = null;
    this.legacy = false;
    this.resolution = 1;
    this.multisample = MSAA_QUALITY.NONE;
    this.sourceFrame = new Rectangle();
    this.destinationFrame = new Rectangle();
    this.bindingSourceFrame = new Rectangle();
    this.bindingDestinationFrame = new Rectangle();
    this.filters = [];
    this.transform = null;
  }
  FilterState2.prototype.clear = function() {
    this.target = null;
    this.filters = null;
    this.renderTexture = null;
  };
  return FilterState2;
}();
var tempPoints = [new Point(), new Point(), new Point(), new Point()];
var tempMatrix$2 = new Matrix();
var FilterSystem = function() {
  function FilterSystem2(renderer) {
    this.renderer = renderer;
    this.defaultFilterStack = [{}];
    this.texturePool = new RenderTexturePool();
    this.texturePool.setScreenSize(renderer.view);
    this.statePool = [];
    this.quad = new Quad();
    this.quadUv = new QuadUv();
    this.tempRect = new Rectangle();
    this.activeState = {};
    this.globalUniforms = new UniformGroup({
      outputFrame: new Rectangle(),
      inputSize: new Float32Array(4),
      inputPixel: new Float32Array(4),
      inputClamp: new Float32Array(4),
      resolution: 1,
      filterArea: new Float32Array(4),
      filterClamp: new Float32Array(4)
    }, true);
    this.forceClear = false;
    this.useMaxPadding = false;
  }
  FilterSystem2.prototype.push = function(target, filters2) {
    var _a2, _b2;
    var renderer = this.renderer;
    var filterStack = this.defaultFilterStack;
    var state = this.statePool.pop() || new FilterState();
    var renderTextureSystem = this.renderer.renderTexture;
    var resolution = filters2[0].resolution;
    var multisample = filters2[0].multisample;
    var padding = filters2[0].padding;
    var autoFit = filters2[0].autoFit;
    var legacy = (_a2 = filters2[0].legacy) !== null && _a2 !== void 0 ? _a2 : true;
    for (var i = 1; i < filters2.length; i++) {
      var filter = filters2[i];
      resolution = Math.min(resolution, filter.resolution);
      multisample = Math.min(multisample, filter.multisample);
      padding = this.useMaxPadding ? Math.max(padding, filter.padding) : padding + filter.padding;
      autoFit = autoFit && filter.autoFit;
      legacy = legacy || ((_b2 = filter.legacy) !== null && _b2 !== void 0 ? _b2 : true);
    }
    if (filterStack.length === 1) {
      this.defaultFilterStack[0].renderTexture = renderTextureSystem.current;
    }
    filterStack.push(state);
    state.resolution = resolution;
    state.multisample = multisample;
    state.legacy = legacy;
    state.target = target;
    state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));
    state.sourceFrame.pad(padding);
    var sourceFrameProjected = this.tempRect.copyFrom(renderTextureSystem.sourceFrame);
    if (renderer.projection.transform) {
      this.transformAABB(tempMatrix$2.copyFrom(renderer.projection.transform).invert(), sourceFrameProjected);
    }
    if (autoFit) {
      state.sourceFrame.fit(sourceFrameProjected);
      if (state.sourceFrame.width <= 0 || state.sourceFrame.height <= 0) {
        state.sourceFrame.width = 0;
        state.sourceFrame.height = 0;
      }
    } else if (!state.sourceFrame.intersects(sourceFrameProjected)) {
      state.sourceFrame.width = 0;
      state.sourceFrame.height = 0;
    }
    this.roundFrame(state.sourceFrame, renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame, renderer.projection.transform);
    state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution, multisample);
    state.filters = filters2;
    state.destinationFrame.width = state.renderTexture.width;
    state.destinationFrame.height = state.renderTexture.height;
    var destinationFrame = this.tempRect;
    destinationFrame.x = 0;
    destinationFrame.y = 0;
    destinationFrame.width = state.sourceFrame.width;
    destinationFrame.height = state.sourceFrame.height;
    state.renderTexture.filterFrame = state.sourceFrame;
    state.bindingSourceFrame.copyFrom(renderTextureSystem.sourceFrame);
    state.bindingDestinationFrame.copyFrom(renderTextureSystem.destinationFrame);
    state.transform = renderer.projection.transform;
    renderer.projection.transform = null;
    renderTextureSystem.bind(state.renderTexture, state.sourceFrame, destinationFrame);
    renderer.framebuffer.clear(0, 0, 0, 0);
  };
  FilterSystem2.prototype.pop = function() {
    var filterStack = this.defaultFilterStack;
    var state = filterStack.pop();
    var filters2 = state.filters;
    this.activeState = state;
    var globalUniforms = this.globalUniforms.uniforms;
    globalUniforms.outputFrame = state.sourceFrame;
    globalUniforms.resolution = state.resolution;
    var inputSize = globalUniforms.inputSize;
    var inputPixel = globalUniforms.inputPixel;
    var inputClamp = globalUniforms.inputClamp;
    inputSize[0] = state.destinationFrame.width;
    inputSize[1] = state.destinationFrame.height;
    inputSize[2] = 1 / inputSize[0];
    inputSize[3] = 1 / inputSize[1];
    inputPixel[0] = Math.round(inputSize[0] * state.resolution);
    inputPixel[1] = Math.round(inputSize[1] * state.resolution);
    inputPixel[2] = 1 / inputPixel[0];
    inputPixel[3] = 1 / inputPixel[1];
    inputClamp[0] = 0.5 * inputPixel[2];
    inputClamp[1] = 0.5 * inputPixel[3];
    inputClamp[2] = state.sourceFrame.width * inputSize[2] - 0.5 * inputPixel[2];
    inputClamp[3] = state.sourceFrame.height * inputSize[3] - 0.5 * inputPixel[3];
    if (state.legacy) {
      var filterArea = globalUniforms.filterArea;
      filterArea[0] = state.destinationFrame.width;
      filterArea[1] = state.destinationFrame.height;
      filterArea[2] = state.sourceFrame.x;
      filterArea[3] = state.sourceFrame.y;
      globalUniforms.filterClamp = globalUniforms.inputClamp;
    }
    this.globalUniforms.update();
    var lastState = filterStack[filterStack.length - 1];
    this.renderer.framebuffer.blit();
    if (filters2.length === 1) {
      filters2[0].apply(this, state.renderTexture, lastState.renderTexture, CLEAR_MODES.BLEND, state);
      this.returnFilterTexture(state.renderTexture);
    } else {
      var flip = state.renderTexture;
      var flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
      flop.filterFrame = flip.filterFrame;
      var i = 0;
      for (i = 0; i < filters2.length - 1; ++i) {
        if (i === 1 && state.multisample > 1) {
          flop = this.getOptimalFilterTexture(flip.width, flip.height, state.resolution);
          flop.filterFrame = flip.filterFrame;
        }
        filters2[i].apply(this, flip, flop, CLEAR_MODES.CLEAR, state);
        var t = flip;
        flip = flop;
        flop = t;
      }
      filters2[i].apply(this, flip, lastState.renderTexture, CLEAR_MODES.BLEND, state);
      if (i > 1 && state.multisample > 1) {
        this.returnFilterTexture(state.renderTexture);
      }
      this.returnFilterTexture(flip);
      this.returnFilterTexture(flop);
    }
    state.clear();
    this.statePool.push(state);
  };
  FilterSystem2.prototype.bindAndClear = function(filterTexture, clearMode) {
    if (clearMode === void 0) {
      clearMode = CLEAR_MODES.CLEAR;
    }
    var _a2 = this.renderer, renderTextureSystem = _a2.renderTexture, stateSystem = _a2.state;
    if (filterTexture === this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture) {
      this.renderer.projection.transform = this.activeState.transform;
    } else {
      this.renderer.projection.transform = null;
    }
    if (filterTexture && filterTexture.filterFrame) {
      var destinationFrame = this.tempRect;
      destinationFrame.x = 0;
      destinationFrame.y = 0;
      destinationFrame.width = filterTexture.filterFrame.width;
      destinationFrame.height = filterTexture.filterFrame.height;
      renderTextureSystem.bind(filterTexture, filterTexture.filterFrame, destinationFrame);
    } else if (filterTexture !== this.defaultFilterStack[this.defaultFilterStack.length - 1].renderTexture) {
      renderTextureSystem.bind(filterTexture);
    } else {
      this.renderer.renderTexture.bind(filterTexture, this.activeState.bindingSourceFrame, this.activeState.bindingDestinationFrame);
    }
    var autoClear = stateSystem.stateId & 1 || this.forceClear;
    if (clearMode === CLEAR_MODES.CLEAR || clearMode === CLEAR_MODES.BLIT && autoClear) {
      this.renderer.framebuffer.clear(0, 0, 0, 0);
    }
  };
  FilterSystem2.prototype.applyFilter = function(filter, input, output, clearMode) {
    var renderer = this.renderer;
    renderer.state.set(filter.state);
    this.bindAndClear(output, clearMode);
    filter.uniforms.uSampler = input;
    filter.uniforms.filterGlobals = this.globalUniforms;
    renderer.shader.bind(filter);
    filter.legacy = !!filter.program.attributeData.aTextureCoord;
    if (filter.legacy) {
      this.quadUv.map(input._frame, input.filterFrame);
      renderer.geometry.bind(this.quadUv);
      renderer.geometry.draw(DRAW_MODES.TRIANGLES);
    } else {
      renderer.geometry.bind(this.quad);
      renderer.geometry.draw(DRAW_MODES.TRIANGLE_STRIP);
    }
  };
  FilterSystem2.prototype.calculateSpriteMatrix = function(outputMatrix, sprite) {
    var _a2 = this.activeState, sourceFrame = _a2.sourceFrame, destinationFrame = _a2.destinationFrame;
    var orig = sprite._texture.orig;
    var mappedMatrix = outputMatrix.set(destinationFrame.width, 0, 0, destinationFrame.height, sourceFrame.x, sourceFrame.y);
    var worldTransform = sprite.worldTransform.copyTo(Matrix.TEMP_MATRIX);
    worldTransform.invert();
    mappedMatrix.prepend(worldTransform);
    mappedMatrix.scale(1 / orig.width, 1 / orig.height);
    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);
    return mappedMatrix;
  };
  FilterSystem2.prototype.destroy = function() {
    this.renderer = null;
    this.texturePool.clear(false);
  };
  FilterSystem2.prototype.getOptimalFilterTexture = function(minWidth, minHeight, resolution, multisample) {
    if (resolution === void 0) {
      resolution = 1;
    }
    if (multisample === void 0) {
      multisample = MSAA_QUALITY.NONE;
    }
    return this.texturePool.getOptimalTexture(minWidth, minHeight, resolution, multisample);
  };
  FilterSystem2.prototype.getFilterTexture = function(input, resolution, multisample) {
    if (typeof input === "number") {
      var swap = input;
      input = resolution;
      resolution = swap;
    }
    input = input || this.activeState.renderTexture;
    var filterTexture = this.texturePool.getOptimalTexture(input.width, input.height, resolution || input.resolution, multisample || MSAA_QUALITY.NONE);
    filterTexture.filterFrame = input.filterFrame;
    return filterTexture;
  };
  FilterSystem2.prototype.returnFilterTexture = function(renderTexture) {
    this.texturePool.returnTexture(renderTexture);
  };
  FilterSystem2.prototype.emptyPool = function() {
    this.texturePool.clear(true);
  };
  FilterSystem2.prototype.resize = function() {
    this.texturePool.setScreenSize(this.renderer.view);
  };
  FilterSystem2.prototype.transformAABB = function(matrix, rect) {
    var lt = tempPoints[0];
    var lb = tempPoints[1];
    var rt = tempPoints[2];
    var rb = tempPoints[3];
    lt.set(rect.left, rect.top);
    lb.set(rect.left, rect.bottom);
    rt.set(rect.right, rect.top);
    rb.set(rect.right, rect.bottom);
    matrix.apply(lt, lt);
    matrix.apply(lb, lb);
    matrix.apply(rt, rt);
    matrix.apply(rb, rb);
    var x0 = Math.min(lt.x, lb.x, rt.x, rb.x);
    var y0 = Math.min(lt.y, lb.y, rt.y, rb.y);
    var x1 = Math.max(lt.x, lb.x, rt.x, rb.x);
    var y1 = Math.max(lt.y, lb.y, rt.y, rb.y);
    rect.x = x0;
    rect.y = y0;
    rect.width = x1 - x0;
    rect.height = y1 - y0;
  };
  FilterSystem2.prototype.roundFrame = function(frame, resolution, bindingSourceFrame, bindingDestinationFrame, transform) {
    if (frame.width <= 0 || frame.height <= 0 || bindingSourceFrame.width <= 0 || bindingSourceFrame.height <= 0) {
      return;
    }
    if (transform) {
      var a = transform.a, b = transform.b, c = transform.c, d = transform.d;
      if ((Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4) && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4)) {
        return;
      }
    }
    transform = transform ? tempMatrix$2.copyFrom(transform) : tempMatrix$2.identity();
    transform.translate(-bindingSourceFrame.x, -bindingSourceFrame.y).scale(bindingDestinationFrame.width / bindingSourceFrame.width, bindingDestinationFrame.height / bindingSourceFrame.height).translate(bindingDestinationFrame.x, bindingDestinationFrame.y);
    this.transformAABB(transform, frame);
    frame.ceil(resolution);
    this.transformAABB(transform.invert(), frame);
  };
  return FilterSystem2;
}();
var ObjectRenderer = function() {
  function ObjectRenderer2(renderer) {
    this.renderer = renderer;
  }
  ObjectRenderer2.prototype.flush = function() {
  };
  ObjectRenderer2.prototype.destroy = function() {
    this.renderer = null;
  };
  ObjectRenderer2.prototype.start = function() {
  };
  ObjectRenderer2.prototype.stop = function() {
    this.flush();
  };
  ObjectRenderer2.prototype.render = function(_object) {
  };
  return ObjectRenderer2;
}();
var BatchSystem = function() {
  function BatchSystem2(renderer) {
    this.renderer = renderer;
    this.emptyRenderer = new ObjectRenderer(renderer);
    this.currentRenderer = this.emptyRenderer;
  }
  BatchSystem2.prototype.setObjectRenderer = function(objectRenderer) {
    if (this.currentRenderer === objectRenderer) {
      return;
    }
    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
  };
  BatchSystem2.prototype.flush = function() {
    this.setObjectRenderer(this.emptyRenderer);
  };
  BatchSystem2.prototype.reset = function() {
    this.setObjectRenderer(this.emptyRenderer);
  };
  BatchSystem2.prototype.copyBoundTextures = function(arr, maxTextures) {
    var boundTextures = this.renderer.texture.boundTextures;
    for (var i = maxTextures - 1; i >= 0; --i) {
      arr[i] = boundTextures[i] || null;
      if (arr[i]) {
        arr[i]._batchLocation = i;
      }
    }
  };
  BatchSystem2.prototype.boundArray = function(texArray, boundTextures, batchId, maxTextures) {
    var elements = texArray.elements, ids = texArray.ids, count = texArray.count;
    var j = 0;
    for (var i = 0; i < count; i++) {
      var tex = elements[i];
      var loc = tex._batchLocation;
      if (loc >= 0 && loc < maxTextures && boundTextures[loc] === tex) {
        ids[i] = loc;
        continue;
      }
      while (j < maxTextures) {
        var bound = boundTextures[j];
        if (bound && bound._batchEnabled === batchId && bound._batchLocation === j) {
          j++;
          continue;
        }
        ids[i] = j;
        tex._batchLocation = j;
        boundTextures[j] = tex;
        break;
      }
    }
  };
  BatchSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return BatchSystem2;
}();
var CONTEXT_UID_COUNTER = 0;
var ContextSystem = function() {
  function ContextSystem2(renderer) {
    this.renderer = renderer;
    this.webGLVersion = 1;
    this.extensions = {};
    this.supports = {
      uint32Indices: false
    };
    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);
    renderer.view.addEventListener("webglcontextlost", this.handleContextLost, false);
    renderer.view.addEventListener("webglcontextrestored", this.handleContextRestored, false);
  }
  Object.defineProperty(ContextSystem2.prototype, "isLost", {
    get: function() {
      return !this.gl || this.gl.isContextLost();
    },
    enumerable: false,
    configurable: true
  });
  ContextSystem2.prototype.contextChange = function(gl) {
    this.gl = gl;
    this.renderer.gl = gl;
    this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
    if (gl.isContextLost() && gl.getExtension("WEBGL_lose_context")) {
      gl.getExtension("WEBGL_lose_context").restoreContext();
    }
  };
  ContextSystem2.prototype.initFromContext = function(gl) {
    this.gl = gl;
    this.validateContext(gl);
    this.renderer.gl = gl;
    this.renderer.CONTEXT_UID = CONTEXT_UID_COUNTER++;
    this.renderer.runners.contextChange.emit(gl);
  };
  ContextSystem2.prototype.initFromOptions = function(options) {
    var gl = this.createContext(this.renderer.view, options);
    this.initFromContext(gl);
  };
  ContextSystem2.prototype.createContext = function(canvas, options) {
    var gl;
    if (settings.PREFER_ENV >= ENV.WEBGL2) {
      gl = canvas.getContext("webgl2", options);
    }
    if (gl) {
      this.webGLVersion = 2;
    } else {
      this.webGLVersion = 1;
      gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
      if (!gl) {
        throw new Error("This browser does not support WebGL. Try using the canvas renderer");
      }
    }
    this.gl = gl;
    this.getExtensions();
    return this.gl;
  };
  ContextSystem2.prototype.getExtensions = function() {
    var gl = this.gl;
    var common = {
      anisotropicFiltering: gl.getExtension("EXT_texture_filter_anisotropic"),
      floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
      s3tc: gl.getExtension("WEBGL_compressed_texture_s3tc"),
      s3tc_sRGB: gl.getExtension("WEBGL_compressed_texture_s3tc_srgb"),
      etc: gl.getExtension("WEBGL_compressed_texture_etc"),
      etc1: gl.getExtension("WEBGL_compressed_texture_etc1"),
      pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
      atc: gl.getExtension("WEBGL_compressed_texture_atc"),
      astc: gl.getExtension("WEBGL_compressed_texture_astc")
    };
    if (this.webGLVersion === 1) {
      Object.assign(this.extensions, common, {
        drawBuffers: gl.getExtension("WEBGL_draw_buffers"),
        depthTexture: gl.getExtension("WEBGL_depth_texture"),
        loseContext: gl.getExtension("WEBGL_lose_context"),
        vertexArrayObject: gl.getExtension("OES_vertex_array_object") || gl.getExtension("MOZ_OES_vertex_array_object") || gl.getExtension("WEBKIT_OES_vertex_array_object"),
        uint32ElementIndex: gl.getExtension("OES_element_index_uint"),
        floatTexture: gl.getExtension("OES_texture_float"),
        floatTextureLinear: gl.getExtension("OES_texture_float_linear"),
        textureHalfFloat: gl.getExtension("OES_texture_half_float"),
        textureHalfFloatLinear: gl.getExtension("OES_texture_half_float_linear")
      });
    } else if (this.webGLVersion === 2) {
      Object.assign(this.extensions, common, {
        colorBufferFloat: gl.getExtension("EXT_color_buffer_float")
      });
    }
  };
  ContextSystem2.prototype.handleContextLost = function(event) {
    event.preventDefault();
  };
  ContextSystem2.prototype.handleContextRestored = function() {
    this.renderer.runners.contextChange.emit(this.gl);
  };
  ContextSystem2.prototype.destroy = function() {
    var view = this.renderer.view;
    this.renderer = null;
    view.removeEventListener("webglcontextlost", this.handleContextLost);
    view.removeEventListener("webglcontextrestored", this.handleContextRestored);
    this.gl.useProgram(null);
    if (this.extensions.loseContext) {
      this.extensions.loseContext.loseContext();
    }
  };
  ContextSystem2.prototype.postrender = function() {
    if (this.renderer.renderingToScreen) {
      this.gl.flush();
    }
  };
  ContextSystem2.prototype.validateContext = function(gl) {
    var attributes = gl.getContextAttributes();
    var isWebGl2 = "WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext;
    if (isWebGl2) {
      this.webGLVersion = 2;
    }
    if (attributes && !attributes.stencil) {
      console.warn("Provided WebGL context does not have a stencil buffer, masks may not render correctly");
    }
    var hasuint32 = isWebGl2 || !!gl.getExtension("OES_element_index_uint");
    this.supports.uint32Indices = hasuint32;
    if (!hasuint32) {
      console.warn("Provided WebGL context does not support 32 index buffer, complex graphics may not render correctly");
    }
  };
  return ContextSystem2;
}();
var GLFramebuffer = function() {
  function GLFramebuffer2(framebuffer) {
    this.framebuffer = framebuffer;
    this.stencil = null;
    this.dirtyId = -1;
    this.dirtyFormat = -1;
    this.dirtySize = -1;
    this.multisample = MSAA_QUALITY.NONE;
    this.msaaBuffer = null;
    this.blitFramebuffer = null;
    this.mipLevel = 0;
  }
  return GLFramebuffer2;
}();
var tempRectangle = new Rectangle();
var FramebufferSystem = function() {
  function FramebufferSystem2(renderer) {
    this.renderer = renderer;
    this.managedFramebuffers = [];
    this.unknownFramebuffer = new Framebuffer(10, 10);
    this.msaaSamples = null;
  }
  FramebufferSystem2.prototype.contextChange = function() {
    var gl = this.gl = this.renderer.gl;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    this.current = this.unknownFramebuffer;
    this.viewport = new Rectangle();
    this.hasMRT = true;
    this.writeDepthTexture = true;
    this.disposeAll(true);
    if (this.renderer.context.webGLVersion === 1) {
      var nativeDrawBuffersExtension_1 = this.renderer.context.extensions.drawBuffers;
      var nativeDepthTextureExtension = this.renderer.context.extensions.depthTexture;
      if (settings.PREFER_ENV === ENV.WEBGL_LEGACY) {
        nativeDrawBuffersExtension_1 = null;
        nativeDepthTextureExtension = null;
      }
      if (nativeDrawBuffersExtension_1) {
        gl.drawBuffers = function(activeTextures) {
          return nativeDrawBuffersExtension_1.drawBuffersWEBGL(activeTextures);
        };
      } else {
        this.hasMRT = false;
        gl.drawBuffers = function() {
        };
      }
      if (!nativeDepthTextureExtension) {
        this.writeDepthTexture = false;
      }
    } else {
      this.msaaSamples = gl.getInternalformatParameter(gl.RENDERBUFFER, gl.RGBA8, gl.SAMPLES);
    }
  };
  FramebufferSystem2.prototype.bind = function(framebuffer, frame, mipLevel) {
    if (mipLevel === void 0) {
      mipLevel = 0;
    }
    var gl = this.gl;
    if (framebuffer) {
      var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID] || this.initFramebuffer(framebuffer);
      if (this.current !== framebuffer) {
        this.current = framebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
      }
      if (fbo.mipLevel !== mipLevel) {
        framebuffer.dirtyId++;
        framebuffer.dirtyFormat++;
        fbo.mipLevel = mipLevel;
      }
      if (fbo.dirtyId !== framebuffer.dirtyId) {
        fbo.dirtyId = framebuffer.dirtyId;
        if (fbo.dirtyFormat !== framebuffer.dirtyFormat) {
          fbo.dirtyFormat = framebuffer.dirtyFormat;
          fbo.dirtySize = framebuffer.dirtySize;
          this.updateFramebuffer(framebuffer, mipLevel);
        } else if (fbo.dirtySize !== framebuffer.dirtySize) {
          fbo.dirtySize = framebuffer.dirtySize;
          this.resizeFramebuffer(framebuffer);
        }
      }
      for (var i = 0; i < framebuffer.colorTextures.length; i++) {
        var tex = framebuffer.colorTextures[i];
        this.renderer.texture.unbind(tex.parentTextureArray || tex);
      }
      if (framebuffer.depthTexture) {
        this.renderer.texture.unbind(framebuffer.depthTexture);
      }
      if (frame) {
        var mipWidth = frame.width >> mipLevel;
        var mipHeight = frame.height >> mipLevel;
        var scale = mipWidth / frame.width;
        this.setViewport(frame.x * scale, frame.y * scale, mipWidth, mipHeight);
      } else {
        var mipWidth = framebuffer.width >> mipLevel;
        var mipHeight = framebuffer.height >> mipLevel;
        this.setViewport(0, 0, mipWidth, mipHeight);
      }
    } else {
      if (this.current) {
        this.current = null;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      if (frame) {
        this.setViewport(frame.x, frame.y, frame.width, frame.height);
      } else {
        this.setViewport(0, 0, this.renderer.width, this.renderer.height);
      }
    }
  };
  FramebufferSystem2.prototype.setViewport = function(x, y, width, height) {
    var v = this.viewport;
    x = Math.round(x);
    y = Math.round(y);
    width = Math.round(width);
    height = Math.round(height);
    if (v.width !== width || v.height !== height || v.x !== x || v.y !== y) {
      v.x = x;
      v.y = y;
      v.width = width;
      v.height = height;
      this.gl.viewport(x, y, width, height);
    }
  };
  Object.defineProperty(FramebufferSystem2.prototype, "size", {
    get: function() {
      if (this.current) {
        return { x: 0, y: 0, width: this.current.width, height: this.current.height };
      }
      return { x: 0, y: 0, width: this.renderer.width, height: this.renderer.height };
    },
    enumerable: false,
    configurable: true
  });
  FramebufferSystem2.prototype.clear = function(r, g, b, a, mask) {
    if (mask === void 0) {
      mask = BUFFER_BITS.COLOR | BUFFER_BITS.DEPTH;
    }
    var gl = this.gl;
    gl.clearColor(r, g, b, a);
    gl.clear(mask);
  };
  FramebufferSystem2.prototype.initFramebuffer = function(framebuffer) {
    var gl = this.gl;
    var fbo = new GLFramebuffer(gl.createFramebuffer());
    fbo.multisample = this.detectSamples(framebuffer.multisample);
    framebuffer.glFramebuffers[this.CONTEXT_UID] = fbo;
    this.managedFramebuffers.push(framebuffer);
    framebuffer.disposeRunner.add(this);
    return fbo;
  };
  FramebufferSystem2.prototype.resizeFramebuffer = function(framebuffer) {
    var gl = this.gl;
    var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
    if (fbo.msaaBuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, gl.RGBA8, framebuffer.width, framebuffer.height);
    }
    if (fbo.stencil) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
      if (fbo.msaaBuffer) {
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, gl.DEPTH24_STENCIL8, framebuffer.width, framebuffer.height);
      } else {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
      }
    }
    var colorTextures = framebuffer.colorTextures;
    var count = colorTextures.length;
    if (!gl.drawBuffers) {
      count = Math.min(count, 1);
    }
    for (var i = 0; i < count; i++) {
      var texture = colorTextures[i];
      var parentTexture = texture.parentTextureArray || texture;
      this.renderer.texture.bind(parentTexture, 0);
    }
    if (framebuffer.depthTexture && this.writeDepthTexture) {
      this.renderer.texture.bind(framebuffer.depthTexture, 0);
    }
  };
  FramebufferSystem2.prototype.updateFramebuffer = function(framebuffer, mipLevel) {
    var gl = this.gl;
    var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
    var colorTextures = framebuffer.colorTextures;
    var count = colorTextures.length;
    if (!gl.drawBuffers) {
      count = Math.min(count, 1);
    }
    if (fbo.multisample > 1 && this.canMultisampleFramebuffer(framebuffer)) {
      fbo.msaaBuffer = fbo.msaaBuffer || gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.msaaBuffer);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, gl.RGBA8, framebuffer.width, framebuffer.height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, fbo.msaaBuffer);
    } else if (fbo.msaaBuffer) {
      gl.deleteRenderbuffer(fbo.msaaBuffer);
      fbo.msaaBuffer = null;
      if (fbo.blitFramebuffer) {
        fbo.blitFramebuffer.dispose();
        fbo.blitFramebuffer = null;
      }
    }
    var activeTextures = [];
    for (var i = 0; i < count; i++) {
      var texture = colorTextures[i];
      var parentTexture = texture.parentTextureArray || texture;
      this.renderer.texture.bind(parentTexture, 0);
      if (i === 0 && fbo.msaaBuffer) {
        continue;
      }
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, texture.target, parentTexture._glTextures[this.CONTEXT_UID].texture, mipLevel);
      activeTextures.push(gl.COLOR_ATTACHMENT0 + i);
    }
    if (activeTextures.length > 1) {
      gl.drawBuffers(activeTextures);
    }
    if (framebuffer.depthTexture) {
      var writeDepthTexture = this.writeDepthTexture;
      if (writeDepthTexture) {
        var depthTexture = framebuffer.depthTexture;
        this.renderer.texture.bind(depthTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture._glTextures[this.CONTEXT_UID].texture, mipLevel);
      }
    }
    if ((framebuffer.stencil || framebuffer.depth) && !(framebuffer.depthTexture && this.writeDepthTexture)) {
      fbo.stencil = fbo.stencil || gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.stencil);
      if (fbo.msaaBuffer) {
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, gl.DEPTH24_STENCIL8, framebuffer.width, framebuffer.height);
      } else {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, framebuffer.width, framebuffer.height);
      }
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fbo.stencil);
    } else if (fbo.stencil) {
      gl.deleteRenderbuffer(fbo.stencil);
      fbo.stencil = null;
    }
  };
  FramebufferSystem2.prototype.canMultisampleFramebuffer = function(framebuffer) {
    return this.renderer.context.webGLVersion !== 1 && framebuffer.colorTextures.length <= 1 && !framebuffer.depthTexture;
  };
  FramebufferSystem2.prototype.detectSamples = function(samples) {
    var msaaSamples = this.msaaSamples;
    var res = MSAA_QUALITY.NONE;
    if (samples <= 1 || msaaSamples === null) {
      return res;
    }
    for (var i = 0; i < msaaSamples.length; i++) {
      if (msaaSamples[i] <= samples) {
        res = msaaSamples[i];
        break;
      }
    }
    if (res === 1) {
      res = MSAA_QUALITY.NONE;
    }
    return res;
  };
  FramebufferSystem2.prototype.blit = function(framebuffer, sourcePixels, destPixels) {
    var _a2 = this, current = _a2.current, renderer = _a2.renderer, gl = _a2.gl, CONTEXT_UID = _a2.CONTEXT_UID;
    if (renderer.context.webGLVersion !== 2) {
      return;
    }
    if (!current) {
      return;
    }
    var fbo = current.glFramebuffers[CONTEXT_UID];
    if (!fbo) {
      return;
    }
    if (!framebuffer) {
      if (!fbo.msaaBuffer) {
        return;
      }
      var colorTexture = current.colorTextures[0];
      if (!colorTexture) {
        return;
      }
      if (!fbo.blitFramebuffer) {
        fbo.blitFramebuffer = new Framebuffer(current.width, current.height);
        fbo.blitFramebuffer.addColorTexture(0, colorTexture);
      }
      framebuffer = fbo.blitFramebuffer;
      if (framebuffer.colorTextures[0] !== colorTexture) {
        framebuffer.colorTextures[0] = colorTexture;
        framebuffer.dirtyId++;
        framebuffer.dirtyFormat++;
      }
      if (framebuffer.width !== current.width || framebuffer.height !== current.height) {
        framebuffer.width = current.width;
        framebuffer.height = current.height;
        framebuffer.dirtyId++;
        framebuffer.dirtySize++;
      }
    }
    if (!sourcePixels) {
      sourcePixels = tempRectangle;
      sourcePixels.width = current.width;
      sourcePixels.height = current.height;
    }
    if (!destPixels) {
      destPixels = sourcePixels;
    }
    var sameSize = sourcePixels.width === destPixels.width && sourcePixels.height === destPixels.height;
    this.bind(framebuffer);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo.framebuffer);
    gl.blitFramebuffer(sourcePixels.left, sourcePixels.top, sourcePixels.right, sourcePixels.bottom, destPixels.left, destPixels.top, destPixels.right, destPixels.bottom, gl.COLOR_BUFFER_BIT, sameSize ? gl.NEAREST : gl.LINEAR);
  };
  FramebufferSystem2.prototype.disposeFramebuffer = function(framebuffer, contextLost) {
    var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
    var gl = this.gl;
    if (!fbo) {
      return;
    }
    delete framebuffer.glFramebuffers[this.CONTEXT_UID];
    var index2 = this.managedFramebuffers.indexOf(framebuffer);
    if (index2 >= 0) {
      this.managedFramebuffers.splice(index2, 1);
    }
    framebuffer.disposeRunner.remove(this);
    if (!contextLost) {
      gl.deleteFramebuffer(fbo.framebuffer);
      if (fbo.msaaBuffer) {
        gl.deleteRenderbuffer(fbo.msaaBuffer);
      }
      if (fbo.stencil) {
        gl.deleteRenderbuffer(fbo.stencil);
      }
    }
    if (fbo.blitFramebuffer) {
      fbo.blitFramebuffer.dispose();
    }
  };
  FramebufferSystem2.prototype.disposeAll = function(contextLost) {
    var list = this.managedFramebuffers;
    this.managedFramebuffers = [];
    for (var i = 0; i < list.length; i++) {
      this.disposeFramebuffer(list[i], contextLost);
    }
  };
  FramebufferSystem2.prototype.forceStencil = function() {
    var framebuffer = this.current;
    if (!framebuffer) {
      return;
    }
    var fbo = framebuffer.glFramebuffers[this.CONTEXT_UID];
    if (!fbo || fbo.stencil) {
      return;
    }
    framebuffer.stencil = true;
    var w = framebuffer.width;
    var h = framebuffer.height;
    var gl = this.gl;
    var stencil = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
    if (fbo.msaaBuffer) {
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, fbo.multisample, gl.DEPTH24_STENCIL8, w, h);
    } else {
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);
    }
    fbo.stencil = stencil;
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, stencil);
  };
  FramebufferSystem2.prototype.reset = function() {
    this.current = this.unknownFramebuffer;
    this.viewport = new Rectangle();
  };
  FramebufferSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return FramebufferSystem2;
}();
var byteSizeMap = { 5126: 4, 5123: 2, 5121: 1 };
var GeometrySystem = function() {
  function GeometrySystem2(renderer) {
    this.renderer = renderer;
    this._activeGeometry = null;
    this._activeVao = null;
    this.hasVao = true;
    this.hasInstance = true;
    this.canUseUInt32ElementIndex = false;
    this.managedGeometries = {};
  }
  GeometrySystem2.prototype.contextChange = function() {
    this.disposeAll(true);
    var gl = this.gl = this.renderer.gl;
    var context2 = this.renderer.context;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    if (context2.webGLVersion !== 2) {
      var nativeVaoExtension_1 = this.renderer.context.extensions.vertexArrayObject;
      if (settings.PREFER_ENV === ENV.WEBGL_LEGACY) {
        nativeVaoExtension_1 = null;
      }
      if (nativeVaoExtension_1) {
        gl.createVertexArray = function() {
          return nativeVaoExtension_1.createVertexArrayOES();
        };
        gl.bindVertexArray = function(vao) {
          return nativeVaoExtension_1.bindVertexArrayOES(vao);
        };
        gl.deleteVertexArray = function(vao) {
          return nativeVaoExtension_1.deleteVertexArrayOES(vao);
        };
      } else {
        this.hasVao = false;
        gl.createVertexArray = function() {
          return null;
        };
        gl.bindVertexArray = function() {
          return null;
        };
        gl.deleteVertexArray = function() {
          return null;
        };
      }
    }
    if (context2.webGLVersion !== 2) {
      var instanceExt_1 = gl.getExtension("ANGLE_instanced_arrays");
      if (instanceExt_1) {
        gl.vertexAttribDivisor = function(a, b) {
          return instanceExt_1.vertexAttribDivisorANGLE(a, b);
        };
        gl.drawElementsInstanced = function(a, b, c, d, e) {
          return instanceExt_1.drawElementsInstancedANGLE(a, b, c, d, e);
        };
        gl.drawArraysInstanced = function(a, b, c, d) {
          return instanceExt_1.drawArraysInstancedANGLE(a, b, c, d);
        };
      } else {
        this.hasInstance = false;
      }
    }
    this.canUseUInt32ElementIndex = context2.webGLVersion === 2 || !!context2.extensions.uint32ElementIndex;
  };
  GeometrySystem2.prototype.bind = function(geometry, shader) {
    shader = shader || this.renderer.shader.shader;
    var gl = this.gl;
    var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
    var incRefCount = false;
    if (!vaos) {
      this.managedGeometries[geometry.id] = geometry;
      geometry.disposeRunner.add(this);
      geometry.glVertexArrayObjects[this.CONTEXT_UID] = vaos = {};
      incRefCount = true;
    }
    var vao = vaos[shader.program.id] || this.initGeometryVao(geometry, shader, incRefCount);
    this._activeGeometry = geometry;
    if (this._activeVao !== vao) {
      this._activeVao = vao;
      if (this.hasVao) {
        gl.bindVertexArray(vao);
      } else {
        this.activateVao(geometry, shader.program);
      }
    }
    this.updateBuffers();
  };
  GeometrySystem2.prototype.reset = function() {
    this.unbind();
  };
  GeometrySystem2.prototype.updateBuffers = function() {
    var geometry = this._activeGeometry;
    var bufferSystem = this.renderer.buffer;
    for (var i = 0; i < geometry.buffers.length; i++) {
      var buffer = geometry.buffers[i];
      bufferSystem.update(buffer);
    }
  };
  GeometrySystem2.prototype.checkCompatibility = function(geometry, program) {
    var geometryAttributes = geometry.attributes;
    var shaderAttributes = program.attributeData;
    for (var j in shaderAttributes) {
      if (!geometryAttributes[j]) {
        throw new Error('shader and geometry incompatible, geometry missing the "' + j + '" attribute');
      }
    }
  };
  GeometrySystem2.prototype.getSignature = function(geometry, program) {
    var attribs = geometry.attributes;
    var shaderAttributes = program.attributeData;
    var strings = ["g", geometry.id];
    for (var i in attribs) {
      if (shaderAttributes[i]) {
        strings.push(i, shaderAttributes[i].location);
      }
    }
    return strings.join("-");
  };
  GeometrySystem2.prototype.initGeometryVao = function(geometry, shader, incRefCount) {
    if (incRefCount === void 0) {
      incRefCount = true;
    }
    var gl = this.gl;
    var CONTEXT_UID = this.CONTEXT_UID;
    var bufferSystem = this.renderer.buffer;
    var program = shader.program;
    if (!program.glPrograms[CONTEXT_UID]) {
      this.renderer.shader.generateProgram(shader);
    }
    this.checkCompatibility(geometry, program);
    var signature = this.getSignature(geometry, program);
    var vaoObjectHash = geometry.glVertexArrayObjects[this.CONTEXT_UID];
    var vao = vaoObjectHash[signature];
    if (vao) {
      vaoObjectHash[program.id] = vao;
      return vao;
    }
    var buffers = geometry.buffers;
    var attributes = geometry.attributes;
    var tempStride = {};
    var tempStart = {};
    for (var j in buffers) {
      tempStride[j] = 0;
      tempStart[j] = 0;
    }
    for (var j in attributes) {
      if (!attributes[j].size && program.attributeData[j]) {
        attributes[j].size = program.attributeData[j].size;
      } else if (!attributes[j].size) {
        console.warn("PIXI Geometry attribute '" + j + "' size cannot be determined (likely the bound shader does not have the attribute)");
      }
      tempStride[attributes[j].buffer] += attributes[j].size * byteSizeMap[attributes[j].type];
    }
    for (var j in attributes) {
      var attribute = attributes[j];
      var attribSize = attribute.size;
      if (attribute.stride === void 0) {
        if (tempStride[attribute.buffer] === attribSize * byteSizeMap[attribute.type]) {
          attribute.stride = 0;
        } else {
          attribute.stride = tempStride[attribute.buffer];
        }
      }
      if (attribute.start === void 0) {
        attribute.start = tempStart[attribute.buffer];
        tempStart[attribute.buffer] += attribSize * byteSizeMap[attribute.type];
      }
    }
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    for (var i = 0; i < buffers.length; i++) {
      var buffer = buffers[i];
      bufferSystem.bind(buffer);
      if (incRefCount) {
        buffer._glBuffers[CONTEXT_UID].refCount++;
      }
    }
    this.activateVao(geometry, program);
    this._activeVao = vao;
    vaoObjectHash[program.id] = vao;
    vaoObjectHash[signature] = vao;
    return vao;
  };
  GeometrySystem2.prototype.disposeGeometry = function(geometry, contextLost) {
    var _a2;
    if (!this.managedGeometries[geometry.id]) {
      return;
    }
    delete this.managedGeometries[geometry.id];
    var vaos = geometry.glVertexArrayObjects[this.CONTEXT_UID];
    var gl = this.gl;
    var buffers = geometry.buffers;
    var bufferSystem = (_a2 = this.renderer) === null || _a2 === void 0 ? void 0 : _a2.buffer;
    geometry.disposeRunner.remove(this);
    if (!vaos) {
      return;
    }
    if (bufferSystem) {
      for (var i = 0; i < buffers.length; i++) {
        var buf = buffers[i]._glBuffers[this.CONTEXT_UID];
        if (buf) {
          buf.refCount--;
          if (buf.refCount === 0 && !contextLost) {
            bufferSystem.dispose(buffers[i], contextLost);
          }
        }
      }
    }
    if (!contextLost) {
      for (var vaoId in vaos) {
        if (vaoId[0] === "g") {
          var vao = vaos[vaoId];
          if (this._activeVao === vao) {
            this.unbind();
          }
          gl.deleteVertexArray(vao);
        }
      }
    }
    delete geometry.glVertexArrayObjects[this.CONTEXT_UID];
  };
  GeometrySystem2.prototype.disposeAll = function(contextLost) {
    var all = Object.keys(this.managedGeometries);
    for (var i = 0; i < all.length; i++) {
      this.disposeGeometry(this.managedGeometries[all[i]], contextLost);
    }
  };
  GeometrySystem2.prototype.activateVao = function(geometry, program) {
    var gl = this.gl;
    var CONTEXT_UID = this.CONTEXT_UID;
    var bufferSystem = this.renderer.buffer;
    var buffers = geometry.buffers;
    var attributes = geometry.attributes;
    if (geometry.indexBuffer) {
      bufferSystem.bind(geometry.indexBuffer);
    }
    var lastBuffer = null;
    for (var j in attributes) {
      var attribute = attributes[j];
      var buffer = buffers[attribute.buffer];
      var glBuffer = buffer._glBuffers[CONTEXT_UID];
      if (program.attributeData[j]) {
        if (lastBuffer !== glBuffer) {
          bufferSystem.bind(buffer);
          lastBuffer = glBuffer;
        }
        var location = program.attributeData[j].location;
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, attribute.size, attribute.type || gl.FLOAT, attribute.normalized, attribute.stride, attribute.start);
        if (attribute.instance) {
          if (this.hasInstance) {
            gl.vertexAttribDivisor(location, 1);
          } else {
            throw new Error("geometry error, GPU Instancing is not supported on this device");
          }
        }
      }
    }
  };
  GeometrySystem2.prototype.draw = function(type, size, start, instanceCount) {
    var gl = this.gl;
    var geometry = this._activeGeometry;
    if (geometry.indexBuffer) {
      var byteSize = geometry.indexBuffer.data.BYTES_PER_ELEMENT;
      var glType = byteSize === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
      if (byteSize === 2 || byteSize === 4 && this.canUseUInt32ElementIndex) {
        if (geometry.instanced) {
          gl.drawElementsInstanced(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize, instanceCount || 1);
        } else {
          gl.drawElements(type, size || geometry.indexBuffer.data.length, glType, (start || 0) * byteSize);
        }
      } else {
        console.warn("unsupported index buffer type: uint32");
      }
    } else if (geometry.instanced) {
      gl.drawArraysInstanced(type, start, size || geometry.getSize(), instanceCount || 1);
    } else {
      gl.drawArrays(type, start, size || geometry.getSize());
    }
    return this;
  };
  GeometrySystem2.prototype.unbind = function() {
    this.gl.bindVertexArray(null);
    this._activeVao = null;
    this._activeGeometry = null;
  };
  GeometrySystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return GeometrySystem2;
}();
var MaskData = function() {
  function MaskData2(maskObject) {
    if (maskObject === void 0) {
      maskObject = null;
    }
    this.type = MASK_TYPES.NONE;
    this.autoDetect = true;
    this.maskObject = maskObject || null;
    this.pooled = false;
    this.isMaskData = true;
    this.resolution = null;
    this.multisample = settings.FILTER_MULTISAMPLE;
    this.enabled = true;
    this.colorMask = 15;
    this._filters = null;
    this._stencilCounter = 0;
    this._scissorCounter = 0;
    this._scissorRect = null;
    this._scissorRectLocal = null;
    this._colorMask = 15;
    this._target = null;
  }
  Object.defineProperty(MaskData2.prototype, "filter", {
    get: function() {
      return this._filters ? this._filters[0] : null;
    },
    set: function(value) {
      if (value) {
        if (this._filters) {
          this._filters[0] = value;
        } else {
          this._filters = [value];
        }
      } else {
        this._filters = null;
      }
    },
    enumerable: false,
    configurable: true
  });
  MaskData2.prototype.reset = function() {
    if (this.pooled) {
      this.maskObject = null;
      this.type = MASK_TYPES.NONE;
      this.autoDetect = true;
    }
    this._target = null;
    this._scissorRectLocal = null;
  };
  MaskData2.prototype.copyCountersOrReset = function(maskAbove) {
    if (maskAbove) {
      this._stencilCounter = maskAbove._stencilCounter;
      this._scissorCounter = maskAbove._scissorCounter;
      this._scissorRect = maskAbove._scissorRect;
    } else {
      this._stencilCounter = 0;
      this._scissorCounter = 0;
      this._scissorRect = null;
    }
  };
  return MaskData2;
}();
function compileShader(gl, type, src) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}
function logPrettyShaderError(gl, shader) {
  var shaderSrc = gl.getShaderSource(shader).split("\n").map(function(line, index2) {
    return index2 + ": " + line;
  });
  var shaderLog = gl.getShaderInfoLog(shader);
  var splitShader = shaderLog.split("\n");
  var dedupe = {};
  var lineNumbers = splitShader.map(function(line) {
    return parseFloat(line.replace(/^ERROR\: 0\:([\d]+)\:.*$/, "$1"));
  }).filter(function(n) {
    if (n && !dedupe[n]) {
      dedupe[n] = true;
      return true;
    }
    return false;
  });
  var logArgs = [""];
  lineNumbers.forEach(function(number) {
    shaderSrc[number - 1] = "%c" + shaderSrc[number - 1] + "%c";
    logArgs.push("background: #FF0000; color:#FFFFFF; font-size: 10px", "font-size: 10px");
  });
  var fragmentSourceToLog = shaderSrc.join("\n");
  logArgs[0] = fragmentSourceToLog;
  console.error(shaderLog);
  console.groupCollapsed("click to view full shader code");
  console.warn.apply(console, logArgs);
  console.groupEnd();
}
function logProgramError(gl, program, vertexShader, fragmentShader) {
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      logPrettyShaderError(gl, vertexShader);
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      logPrettyShaderError(gl, fragmentShader);
    }
    console.error("PixiJS Error: Could not initialize shader.");
    if (gl.getProgramInfoLog(program) !== "") {
      console.warn("PixiJS Warning: gl.getProgramInfoLog()", gl.getProgramInfoLog(program));
    }
  }
}
function booleanArray(size) {
  var array = new Array(size);
  for (var i = 0; i < array.length; i++) {
    array[i] = false;
  }
  return array;
}
function defaultValue(type, size) {
  switch (type) {
    case "float":
      return 0;
    case "vec2":
      return new Float32Array(2 * size);
    case "vec3":
      return new Float32Array(3 * size);
    case "vec4":
      return new Float32Array(4 * size);
    case "int":
    case "uint":
    case "sampler2D":
    case "sampler2DArray":
      return 0;
    case "ivec2":
      return new Int32Array(2 * size);
    case "ivec3":
      return new Int32Array(3 * size);
    case "ivec4":
      return new Int32Array(4 * size);
    case "uvec2":
      return new Uint32Array(2 * size);
    case "uvec3":
      return new Uint32Array(3 * size);
    case "uvec4":
      return new Uint32Array(4 * size);
    case "bool":
      return false;
    case "bvec2":
      return booleanArray(2 * size);
    case "bvec3":
      return booleanArray(3 * size);
    case "bvec4":
      return booleanArray(4 * size);
    case "mat2":
      return new Float32Array([
        1,
        0,
        0,
        1
      ]);
    case "mat3":
      return new Float32Array([
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]);
    case "mat4":
      return new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ]);
  }
  return null;
}
var unknownContext = {};
var context = unknownContext;
function getTestContext() {
  if (context === unknownContext || context && context.isContextLost()) {
    var canvas = settings.ADAPTER.createCanvas();
    var gl = void 0;
    if (settings.PREFER_ENV >= ENV.WEBGL2) {
      gl = canvas.getContext("webgl2", {});
    }
    if (!gl) {
      gl = canvas.getContext("webgl", {}) || canvas.getContext("experimental-webgl", {});
      if (!gl) {
        gl = null;
      } else {
        gl.getExtension("WEBGL_draw_buffers");
      }
    }
    context = gl;
  }
  return context;
}
var maxFragmentPrecision;
function getMaxFragmentPrecision() {
  if (!maxFragmentPrecision) {
    maxFragmentPrecision = PRECISION.MEDIUM;
    var gl = getTestContext();
    if (gl) {
      if (gl.getShaderPrecisionFormat) {
        var shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        maxFragmentPrecision = shaderFragment.precision ? PRECISION.HIGH : PRECISION.MEDIUM;
      }
    }
  }
  return maxFragmentPrecision;
}
function setPrecision(src, requestedPrecision, maxSupportedPrecision) {
  if (src.substring(0, 9) !== "precision") {
    var precision = requestedPrecision;
    if (requestedPrecision === PRECISION.HIGH && maxSupportedPrecision !== PRECISION.HIGH) {
      precision = PRECISION.MEDIUM;
    }
    return "precision " + precision + " float;\n" + src;
  } else if (maxSupportedPrecision !== PRECISION.HIGH && src.substring(0, 15) === "precision highp") {
    return src.replace("precision highp", "precision mediump");
  }
  return src;
}
var GLSL_TO_SIZE = {
  float: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  int: 1,
  ivec2: 2,
  ivec3: 3,
  ivec4: 4,
  uint: 1,
  uvec2: 2,
  uvec3: 3,
  uvec4: 4,
  bool: 1,
  bvec2: 2,
  bvec3: 3,
  bvec4: 4,
  mat2: 4,
  mat3: 9,
  mat4: 16,
  sampler2D: 1
};
function mapSize(type) {
  return GLSL_TO_SIZE[type];
}
var GL_TABLE = null;
var GL_TO_GLSL_TYPES = {
  FLOAT: "float",
  FLOAT_VEC2: "vec2",
  FLOAT_VEC3: "vec3",
  FLOAT_VEC4: "vec4",
  INT: "int",
  INT_VEC2: "ivec2",
  INT_VEC3: "ivec3",
  INT_VEC4: "ivec4",
  UNSIGNED_INT: "uint",
  UNSIGNED_INT_VEC2: "uvec2",
  UNSIGNED_INT_VEC3: "uvec3",
  UNSIGNED_INT_VEC4: "uvec4",
  BOOL: "bool",
  BOOL_VEC2: "bvec2",
  BOOL_VEC3: "bvec3",
  BOOL_VEC4: "bvec4",
  FLOAT_MAT2: "mat2",
  FLOAT_MAT3: "mat3",
  FLOAT_MAT4: "mat4",
  SAMPLER_2D: "sampler2D",
  INT_SAMPLER_2D: "sampler2D",
  UNSIGNED_INT_SAMPLER_2D: "sampler2D",
  SAMPLER_CUBE: "samplerCube",
  INT_SAMPLER_CUBE: "samplerCube",
  UNSIGNED_INT_SAMPLER_CUBE: "samplerCube",
  SAMPLER_2D_ARRAY: "sampler2DArray",
  INT_SAMPLER_2D_ARRAY: "sampler2DArray",
  UNSIGNED_INT_SAMPLER_2D_ARRAY: "sampler2DArray"
};
function mapType(gl, type) {
  if (!GL_TABLE) {
    var typeNames = Object.keys(GL_TO_GLSL_TYPES);
    GL_TABLE = {};
    for (var i = 0; i < typeNames.length; ++i) {
      var tn = typeNames[i];
      GL_TABLE[gl[tn]] = GL_TO_GLSL_TYPES[tn];
    }
  }
  return GL_TABLE[type];
}
var uniformParsers = [
  {
    test: function(data) {
      return data.type === "float" && data.size === 1 && !data.isArray;
    },
    code: function(name) {
      return '\n            if(uv["' + name + '"] !== ud["' + name + '"].value)\n            {\n                ud["' + name + '"].value = uv["' + name + '"]\n                gl.uniform1f(ud["' + name + '"].location, uv["' + name + '"])\n            }\n            ';
    }
  },
  {
    test: function(data, uniform) {
      return (data.type === "sampler2D" || data.type === "samplerCube" || data.type === "sampler2DArray") && data.size === 1 && !data.isArray && (uniform == null || uniform.castToBaseTexture !== void 0);
    },
    code: function(name) {
      return 't = syncData.textureCount++;\n\n            renderer.texture.bind(uv["' + name + '"], t);\n\n            if(ud["' + name + '"].value !== t)\n            {\n                ud["' + name + '"].value = t;\n                gl.uniform1i(ud["' + name + '"].location, t);\n; // eslint-disable-line max-len\n            }';
    }
  },
  {
    test: function(data, uniform) {
      return data.type === "mat3" && data.size === 1 && !data.isArray && uniform.a !== void 0;
    },
    code: function(name) {
      return '\n            gl.uniformMatrix3fv(ud["' + name + '"].location, false, uv["' + name + '"].toArray(true));\n            ';
    },
    codeUbo: function(name) {
      return "\n                var " + name + "_matrix = uv." + name + ".toArray(true);\n\n                data[offset] = " + name + "_matrix[0];\n                data[offset+1] = " + name + "_matrix[1];\n                data[offset+2] = " + name + "_matrix[2];\n        \n                data[offset + 4] = " + name + "_matrix[3];\n                data[offset + 5] = " + name + "_matrix[4];\n                data[offset + 6] = " + name + "_matrix[5];\n        \n                data[offset + 8] = " + name + "_matrix[6];\n                data[offset + 9] = " + name + "_matrix[7];\n                data[offset + 10] = " + name + "_matrix[8];\n            ";
    }
  },
  {
    test: function(data, uniform) {
      return data.type === "vec2" && data.size === 1 && !data.isArray && uniform.x !== void 0;
    },
    code: function(name) {
      return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v.x || cv[1] !== v.y)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    gl.uniform2f(ud["' + name + '"].location, v.x, v.y);\n                }';
    },
    codeUbo: function(name) {
      return "\n                v = uv." + name + ";\n\n                data[offset] = v.x;\n                data[offset+1] = v.y;\n            ";
    }
  },
  {
    test: function(data) {
      return data.type === "vec2" && data.size === 1 && !data.isArray;
    },
    code: function(name) {
      return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v[0] || cv[1] !== v[1])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    gl.uniform2f(ud["' + name + '"].location, v[0], v[1]);\n                }\n            ';
    }
  },
  {
    test: function(data, uniform) {
      return data.type === "vec4" && data.size === 1 && !data.isArray && uniform.width !== void 0;
    },
    code: function(name) {
      return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height)\n                {\n                    cv[0] = v.x;\n                    cv[1] = v.y;\n                    cv[2] = v.width;\n                    cv[3] = v.height;\n                    gl.uniform4f(ud["' + name + '"].location, v.x, v.y, v.width, v.height)\n                }';
    },
    codeUbo: function(name) {
      return "\n                    v = uv." + name + ";\n\n                    data[offset] = v.x;\n                    data[offset+1] = v.y;\n                    data[offset+2] = v.width;\n                    data[offset+3] = v.height;\n                ";
    }
  },
  {
    test: function(data) {
      return data.type === "vec4" && data.size === 1 && !data.isArray;
    },
    code: function(name) {
      return '\n                cv = ud["' + name + '"].value;\n                v = uv["' + name + '"];\n\n                if(cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n                {\n                    cv[0] = v[0];\n                    cv[1] = v[1];\n                    cv[2] = v[2];\n                    cv[3] = v[3];\n\n                    gl.uniform4f(ud["' + name + '"].location, v[0], v[1], v[2], v[3])\n                }';
    }
  }
];
var GLSL_TO_SINGLE_SETTERS_CACHED = {
  float: "\n    if (cv !== v)\n    {\n        cu.value = v;\n        gl.uniform1f(location, v);\n    }",
  vec2: "\n    if (cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n\n        gl.uniform2f(location, v[0], v[1])\n    }",
  vec3: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3f(location, v[0], v[1], v[2])\n    }",
  vec4: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n        cv[3] = v[3];\n\n        gl.uniform4f(location, v[0], v[1], v[2], v[3]);\n    }",
  int: "\n    if (cv !== v)\n    {\n        cu.value = v;\n\n        gl.uniform1i(location, v);\n    }",
  ivec2: "\n    if (cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n\n        gl.uniform2i(location, v[0], v[1]);\n    }",
  ivec3: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3i(location, v[0], v[1], v[2]);\n    }",
  ivec4: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n        cv[3] = v[3];\n\n        gl.uniform4i(location, v[0], v[1], v[2], v[3]);\n    }",
  uint: "\n    if (cv !== v)\n    {\n        cu.value = v;\n\n        gl.uniform1ui(location, v);\n    }",
  uvec2: "\n    if (cv[0] !== v[0] || cv[1] !== v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n\n        gl.uniform2ui(location, v[0], v[1]);\n    }",
  uvec3: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3ui(location, v[0], v[1], v[2]);\n    }",
  uvec4: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n        cv[3] = v[3];\n\n        gl.uniform4ui(location, v[0], v[1], v[2], v[3]);\n    }",
  bool: "\n    if (cv !== v)\n    {\n        cu.value = v;\n        gl.uniform1i(location, v);\n    }",
  bvec2: "\n    if (cv[0] != v[0] || cv[1] != v[1])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n\n        gl.uniform2i(location, v[0], v[1]);\n    }",
  bvec3: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n\n        gl.uniform3i(location, v[0], v[1], v[2]);\n    }",
  bvec4: "\n    if (cv[0] !== v[0] || cv[1] !== v[1] || cv[2] !== v[2] || cv[3] !== v[3])\n    {\n        cv[0] = v[0];\n        cv[1] = v[1];\n        cv[2] = v[2];\n        cv[3] = v[3];\n\n        gl.uniform4i(location, v[0], v[1], v[2], v[3]);\n    }",
  mat2: "gl.uniformMatrix2fv(location, false, v)",
  mat3: "gl.uniformMatrix3fv(location, false, v)",
  mat4: "gl.uniformMatrix4fv(location, false, v)",
  sampler2D: "\n    if (cv !== v)\n    {\n        cu.value = v;\n\n        gl.uniform1i(location, v);\n    }",
  samplerCube: "\n    if (cv !== v)\n    {\n        cu.value = v;\n\n        gl.uniform1i(location, v);\n    }",
  sampler2DArray: "\n    if (cv !== v)\n    {\n        cu.value = v;\n\n        gl.uniform1i(location, v);\n    }"
};
var GLSL_TO_ARRAY_SETTERS = {
  float: "gl.uniform1fv(location, v)",
  vec2: "gl.uniform2fv(location, v)",
  vec3: "gl.uniform3fv(location, v)",
  vec4: "gl.uniform4fv(location, v)",
  mat4: "gl.uniformMatrix4fv(location, false, v)",
  mat3: "gl.uniformMatrix3fv(location, false, v)",
  mat2: "gl.uniformMatrix2fv(location, false, v)",
  int: "gl.uniform1iv(location, v)",
  ivec2: "gl.uniform2iv(location, v)",
  ivec3: "gl.uniform3iv(location, v)",
  ivec4: "gl.uniform4iv(location, v)",
  uint: "gl.uniform1uiv(location, v)",
  uvec2: "gl.uniform2uiv(location, v)",
  uvec3: "gl.uniform3uiv(location, v)",
  uvec4: "gl.uniform4uiv(location, v)",
  bool: "gl.uniform1iv(location, v)",
  bvec2: "gl.uniform2iv(location, v)",
  bvec3: "gl.uniform3iv(location, v)",
  bvec4: "gl.uniform4iv(location, v)",
  sampler2D: "gl.uniform1iv(location, v)",
  samplerCube: "gl.uniform1iv(location, v)",
  sampler2DArray: "gl.uniform1iv(location, v)"
};
function generateUniformsSync(group, uniformData) {
  var _a2;
  var funcFragments = ["\n        var v = null;\n        var cv = null;\n        var cu = null;\n        var t = 0;\n        var gl = renderer.gl;\n    "];
  for (var i in group.uniforms) {
    var data = uniformData[i];
    if (!data) {
      if ((_a2 = group.uniforms[i]) === null || _a2 === void 0 ? void 0 : _a2.group) {
        if (group.uniforms[i].ubo) {
          funcFragments.push("\n                        renderer.shader.syncUniformBufferGroup(uv." + i + ", '" + i + "');\n                    ");
        } else {
          funcFragments.push("\n                        renderer.shader.syncUniformGroup(uv." + i + ", syncData);\n                    ");
        }
      }
      continue;
    }
    var uniform = group.uniforms[i];
    var parsed = false;
    for (var j = 0; j < uniformParsers.length; j++) {
      if (uniformParsers[j].test(data, uniform)) {
        funcFragments.push(uniformParsers[j].code(i, uniform));
        parsed = true;
        break;
      }
    }
    if (!parsed) {
      var templateType = data.size === 1 && !data.isArray ? GLSL_TO_SINGLE_SETTERS_CACHED : GLSL_TO_ARRAY_SETTERS;
      var template = templateType[data.type].replace("location", 'ud["' + i + '"].location');
      funcFragments.push('\n            cu = ud["' + i + '"];\n            cv = cu.value;\n            v = uv["' + i + '"];\n            ' + template + ";");
    }
  }
  return new Function("ud", "uv", "renderer", "syncData", funcFragments.join("\n"));
}
var fragTemplate$1 = [
  "precision mediump float;",
  "void main(void){",
  "float test = 0.1;",
  "%forloop%",
  "gl_FragColor = vec4(0.0);",
  "}"
].join("\n");
function generateIfTestSrc(maxIfs) {
  var src = "";
  for (var i = 0; i < maxIfs; ++i) {
    if (i > 0) {
      src += "\nelse ";
    }
    if (i < maxIfs - 1) {
      src += "if(test == " + i + ".0){}";
    }
  }
  return src;
}
function checkMaxIfStatementsInShader(maxIfs, gl) {
  if (maxIfs === 0) {
    throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");
  }
  var shader = gl.createShader(gl.FRAGMENT_SHADER);
  while (true) {
    var fragmentSrc = fragTemplate$1.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));
    gl.shaderSource(shader, fragmentSrc);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      maxIfs = maxIfs / 2 | 0;
    } else {
      break;
    }
  }
  return maxIfs;
}
var unsafeEval;
function unsafeEvalSupported() {
  if (typeof unsafeEval === "boolean") {
    return unsafeEval;
  }
  try {
    var func = new Function("param1", "param2", "param3", "return param1[param2] === param3;");
    unsafeEval = func({ a: "b" }, "a", "b") === true;
  } catch (e) {
    unsafeEval = false;
  }
  return unsafeEval;
}
var defaultFragment$2 = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void){\n   gl_FragColor *= texture2D(uSampler, vTextureCoord);\n}";
var defaultVertex$3 = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void){\n   gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n}\n";
var UID$1 = 0;
var nameCache = {};
var Program = function() {
  function Program2(vertexSrc, fragmentSrc, name) {
    if (name === void 0) {
      name = "pixi-shader";
    }
    this.id = UID$1++;
    this.vertexSrc = vertexSrc || Program2.defaultVertexSrc;
    this.fragmentSrc = fragmentSrc || Program2.defaultFragmentSrc;
    this.vertexSrc = this.vertexSrc.trim();
    this.fragmentSrc = this.fragmentSrc.trim();
    if (this.vertexSrc.substring(0, 8) !== "#version") {
      name = name.replace(/\s+/g, "-");
      if (nameCache[name]) {
        nameCache[name]++;
        name += "-" + nameCache[name];
      } else {
        nameCache[name] = 1;
      }
      this.vertexSrc = "#define SHADER_NAME " + name + "\n" + this.vertexSrc;
      this.fragmentSrc = "#define SHADER_NAME " + name + "\n" + this.fragmentSrc;
      this.vertexSrc = setPrecision(this.vertexSrc, settings.PRECISION_VERTEX, PRECISION.HIGH);
      this.fragmentSrc = setPrecision(this.fragmentSrc, settings.PRECISION_FRAGMENT, getMaxFragmentPrecision());
    }
    this.glPrograms = {};
    this.syncUniforms = null;
  }
  Object.defineProperty(Program2, "defaultVertexSrc", {
    get: function() {
      return defaultVertex$3;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Program2, "defaultFragmentSrc", {
    get: function() {
      return defaultFragment$2;
    },
    enumerable: false,
    configurable: true
  });
  Program2.from = function(vertexSrc, fragmentSrc, name) {
    var key = vertexSrc + fragmentSrc;
    var program = ProgramCache[key];
    if (!program) {
      ProgramCache[key] = program = new Program2(vertexSrc, fragmentSrc, name);
    }
    return program;
  };
  return Program2;
}();
var Shader = function() {
  function Shader2(program, uniforms) {
    this.uniformBindCount = 0;
    this.program = program;
    if (uniforms) {
      if (uniforms instanceof UniformGroup) {
        this.uniformGroup = uniforms;
      } else {
        this.uniformGroup = new UniformGroup(uniforms);
      }
    } else {
      this.uniformGroup = new UniformGroup({});
    }
    this.disposeRunner = new Runner("disposeShader");
  }
  Shader2.prototype.checkUniformExists = function(name, group) {
    if (group.uniforms[name]) {
      return true;
    }
    for (var i in group.uniforms) {
      var uniform = group.uniforms[i];
      if (uniform.group) {
        if (this.checkUniformExists(name, uniform)) {
          return true;
        }
      }
    }
    return false;
  };
  Shader2.prototype.destroy = function() {
    this.uniformGroup = null;
    this.disposeRunner.emit(this);
    this.disposeRunner.destroy();
  };
  Object.defineProperty(Shader2.prototype, "uniforms", {
    get: function() {
      return this.uniformGroup.uniforms;
    },
    enumerable: false,
    configurable: true
  });
  Shader2.from = function(vertexSrc, fragmentSrc, uniforms) {
    var program = Program.from(vertexSrc, fragmentSrc);
    return new Shader2(program, uniforms);
  };
  return Shader2;
}();
var BLEND$1 = 0;
var OFFSET$1 = 1;
var CULLING$1 = 2;
var DEPTH_TEST$1 = 3;
var WINDING$1 = 4;
var DEPTH_MASK$1 = 5;
var State = function() {
  function State2() {
    this.data = 0;
    this.blendMode = BLEND_MODES.NORMAL;
    this.polygonOffset = 0;
    this.blend = true;
    this.depthMask = true;
  }
  Object.defineProperty(State2.prototype, "blend", {
    get: function() {
      return !!(this.data & 1 << BLEND$1);
    },
    set: function(value) {
      if (!!(this.data & 1 << BLEND$1) !== value) {
        this.data ^= 1 << BLEND$1;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "offsets", {
    get: function() {
      return !!(this.data & 1 << OFFSET$1);
    },
    set: function(value) {
      if (!!(this.data & 1 << OFFSET$1) !== value) {
        this.data ^= 1 << OFFSET$1;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "culling", {
    get: function() {
      return !!(this.data & 1 << CULLING$1);
    },
    set: function(value) {
      if (!!(this.data & 1 << CULLING$1) !== value) {
        this.data ^= 1 << CULLING$1;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "depthTest", {
    get: function() {
      return !!(this.data & 1 << DEPTH_TEST$1);
    },
    set: function(value) {
      if (!!(this.data & 1 << DEPTH_TEST$1) !== value) {
        this.data ^= 1 << DEPTH_TEST$1;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "depthMask", {
    get: function() {
      return !!(this.data & 1 << DEPTH_MASK$1);
    },
    set: function(value) {
      if (!!(this.data & 1 << DEPTH_MASK$1) !== value) {
        this.data ^= 1 << DEPTH_MASK$1;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "clockwiseFrontFace", {
    get: function() {
      return !!(this.data & 1 << WINDING$1);
    },
    set: function(value) {
      if (!!(this.data & 1 << WINDING$1) !== value) {
        this.data ^= 1 << WINDING$1;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "blendMode", {
    get: function() {
      return this._blendMode;
    },
    set: function(value) {
      this.blend = value !== BLEND_MODES.NONE;
      this._blendMode = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(State2.prototype, "polygonOffset", {
    get: function() {
      return this._polygonOffset;
    },
    set: function(value) {
      this.offsets = !!value;
      this._polygonOffset = value;
    },
    enumerable: false,
    configurable: true
  });
  State2.prototype.toString = function() {
    return "[@pixi/core:State " + ("blendMode=" + this.blendMode + " ") + ("clockwiseFrontFace=" + this.clockwiseFrontFace + " ") + ("culling=" + this.culling + " ") + ("depthMask=" + this.depthMask + " ") + ("polygonOffset=" + this.polygonOffset) + "]";
  };
  State2.for2d = function() {
    var state = new State2();
    state.depthTest = false;
    state.blend = true;
    return state;
  };
  return State2;
}();
var defaultFragment$1 = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void){\n   gl_FragColor = texture2D(uSampler, vTextureCoord);\n}\n";
var defaultVertex$2 = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n";
var Filter = function(_super) {
  __extends$i(Filter2, _super);
  function Filter2(vertexSrc, fragmentSrc, uniforms) {
    var _this = this;
    var program = Program.from(vertexSrc || Filter2.defaultVertexSrc, fragmentSrc || Filter2.defaultFragmentSrc);
    _this = _super.call(this, program, uniforms) || this;
    _this.padding = 0;
    _this.resolution = settings.FILTER_RESOLUTION;
    _this.multisample = settings.FILTER_MULTISAMPLE;
    _this.enabled = true;
    _this.autoFit = true;
    _this.state = new State();
    return _this;
  }
  Filter2.prototype.apply = function(filterManager, input, output, clearMode, _currentState) {
    filterManager.applyFilter(this, input, output, clearMode);
  };
  Object.defineProperty(Filter2.prototype, "blendMode", {
    get: function() {
      return this.state.blendMode;
    },
    set: function(value) {
      this.state.blendMode = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Filter2.prototype, "resolution", {
    get: function() {
      return this._resolution;
    },
    set: function(value) {
      this._resolution = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Filter2, "defaultVertexSrc", {
    get: function() {
      return defaultVertex$2;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Filter2, "defaultFragmentSrc", {
    get: function() {
      return defaultFragment$1;
    },
    enumerable: false,
    configurable: true
  });
  return Filter2;
}(Shader);
var vertex$4 = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 otherMatrix;\n\nvarying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vMaskCoord = ( otherMatrix * vec3( aTextureCoord, 1.0)  ).xy;\n}\n";
var fragment$7 = "varying vec2 vMaskCoord;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform sampler2D mask;\nuniform float alpha;\nuniform float npmAlpha;\nuniform vec4 maskClamp;\n\nvoid main(void)\n{\n    float clip = step(3.5,\n        step(maskClamp.x, vMaskCoord.x) +\n        step(maskClamp.y, vMaskCoord.y) +\n        step(vMaskCoord.x, maskClamp.z) +\n        step(vMaskCoord.y, maskClamp.w));\n\n    vec4 original = texture2D(uSampler, vTextureCoord);\n    vec4 masky = texture2D(mask, vMaskCoord);\n    float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);\n\n    original *= (alphaMul * masky.r * alpha * clip);\n\n    gl_FragColor = original;\n}\n";
var tempMat$1 = new Matrix();
var TextureMatrix = function() {
  function TextureMatrix2(texture, clampMargin) {
    this._texture = texture;
    this.mapCoord = new Matrix();
    this.uClampFrame = new Float32Array(4);
    this.uClampOffset = new Float32Array(2);
    this._textureID = -1;
    this._updateID = 0;
    this.clampOffset = 0;
    this.clampMargin = typeof clampMargin === "undefined" ? 0.5 : clampMargin;
    this.isSimple = false;
  }
  Object.defineProperty(TextureMatrix2.prototype, "texture", {
    get: function() {
      return this._texture;
    },
    set: function(value) {
      this._texture = value;
      this._textureID = -1;
    },
    enumerable: false,
    configurable: true
  });
  TextureMatrix2.prototype.multiplyUvs = function(uvs, out) {
    if (out === void 0) {
      out = uvs;
    }
    var mat = this.mapCoord;
    for (var i = 0; i < uvs.length; i += 2) {
      var x = uvs[i];
      var y = uvs[i + 1];
      out[i] = x * mat.a + y * mat.c + mat.tx;
      out[i + 1] = x * mat.b + y * mat.d + mat.ty;
    }
    return out;
  };
  TextureMatrix2.prototype.update = function(forceUpdate) {
    var tex = this._texture;
    if (!tex || !tex.valid) {
      return false;
    }
    if (!forceUpdate && this._textureID === tex._updateID) {
      return false;
    }
    this._textureID = tex._updateID;
    this._updateID++;
    var uvs = tex._uvs;
    this.mapCoord.set(uvs.x1 - uvs.x0, uvs.y1 - uvs.y0, uvs.x3 - uvs.x0, uvs.y3 - uvs.y0, uvs.x0, uvs.y0);
    var orig = tex.orig;
    var trim = tex.trim;
    if (trim) {
      tempMat$1.set(orig.width / trim.width, 0, 0, orig.height / trim.height, -trim.x / trim.width, -trim.y / trim.height);
      this.mapCoord.append(tempMat$1);
    }
    var texBase = tex.baseTexture;
    var frame = this.uClampFrame;
    var margin = this.clampMargin / texBase.resolution;
    var offset = this.clampOffset;
    frame[0] = (tex._frame.x + margin + offset) / texBase.width;
    frame[1] = (tex._frame.y + margin + offset) / texBase.height;
    frame[2] = (tex._frame.x + tex._frame.width - margin + offset) / texBase.width;
    frame[3] = (tex._frame.y + tex._frame.height - margin + offset) / texBase.height;
    this.uClampOffset[0] = offset / texBase.realWidth;
    this.uClampOffset[1] = offset / texBase.realHeight;
    this.isSimple = tex._frame.width === texBase.width && tex._frame.height === texBase.height && tex.rotate === 0;
    return true;
  };
  return TextureMatrix2;
}();
var SpriteMaskFilter = function(_super) {
  __extends$i(SpriteMaskFilter2, _super);
  function SpriteMaskFilter2(vertexSrc, fragmentSrc, uniforms) {
    var _this = this;
    var sprite = null;
    if (typeof vertexSrc !== "string" && fragmentSrc === void 0 && uniforms === void 0) {
      sprite = vertexSrc;
      vertexSrc = void 0;
      fragmentSrc = void 0;
      uniforms = void 0;
    }
    _this = _super.call(this, vertexSrc || vertex$4, fragmentSrc || fragment$7, uniforms) || this;
    _this.maskSprite = sprite;
    _this.maskMatrix = new Matrix();
    return _this;
  }
  Object.defineProperty(SpriteMaskFilter2.prototype, "maskSprite", {
    get: function() {
      return this._maskSprite;
    },
    set: function(value) {
      this._maskSprite = value;
      if (this._maskSprite) {
        this._maskSprite.renderable = false;
      }
    },
    enumerable: false,
    configurable: true
  });
  SpriteMaskFilter2.prototype.apply = function(filterManager, input, output, clearMode) {
    var maskSprite = this._maskSprite;
    var tex = maskSprite._texture;
    if (!tex.valid) {
      return;
    }
    if (!tex.uvMatrix) {
      tex.uvMatrix = new TextureMatrix(tex, 0);
    }
    tex.uvMatrix.update();
    this.uniforms.npmAlpha = tex.baseTexture.alphaMode ? 0 : 1;
    this.uniforms.mask = tex;
    this.uniforms.otherMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, maskSprite).prepend(tex.uvMatrix.mapCoord);
    this.uniforms.alpha = maskSprite.worldAlpha;
    this.uniforms.maskClamp = tex.uvMatrix.uClampFrame;
    filterManager.applyFilter(this, input, output, clearMode);
  };
  return SpriteMaskFilter2;
}(Filter);
var MaskSystem = function() {
  function MaskSystem2(renderer) {
    this.renderer = renderer;
    this.enableScissor = true;
    this.alphaMaskPool = [];
    this.maskDataPool = [];
    this.maskStack = [];
    this.alphaMaskIndex = 0;
  }
  MaskSystem2.prototype.setMaskStack = function(maskStack) {
    this.maskStack = maskStack;
    this.renderer.scissor.setMaskStack(maskStack);
    this.renderer.stencil.setMaskStack(maskStack);
  };
  MaskSystem2.prototype.push = function(target, maskDataOrTarget) {
    var maskData = maskDataOrTarget;
    if (!maskData.isMaskData) {
      var d = this.maskDataPool.pop() || new MaskData();
      d.pooled = true;
      d.maskObject = maskDataOrTarget;
      maskData = d;
    }
    var maskAbove = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null;
    maskData.copyCountersOrReset(maskAbove);
    maskData._colorMask = maskAbove ? maskAbove._colorMask : 15;
    if (maskData.autoDetect) {
      this.detect(maskData);
    }
    maskData._target = target;
    if (maskData.type !== MASK_TYPES.SPRITE) {
      this.maskStack.push(maskData);
    }
    if (maskData.enabled) {
      switch (maskData.type) {
        case MASK_TYPES.SCISSOR:
          this.renderer.scissor.push(maskData);
          break;
        case MASK_TYPES.STENCIL:
          this.renderer.stencil.push(maskData);
          break;
        case MASK_TYPES.SPRITE:
          maskData.copyCountersOrReset(null);
          this.pushSpriteMask(maskData);
          break;
        case MASK_TYPES.COLOR:
          this.pushColorMask(maskData);
          break;
      }
    }
    if (maskData.type === MASK_TYPES.SPRITE) {
      this.maskStack.push(maskData);
    }
  };
  MaskSystem2.prototype.pop = function(target) {
    var maskData = this.maskStack.pop();
    if (!maskData || maskData._target !== target) {
      return;
    }
    if (maskData.enabled) {
      switch (maskData.type) {
        case MASK_TYPES.SCISSOR:
          this.renderer.scissor.pop(maskData);
          break;
        case MASK_TYPES.STENCIL:
          this.renderer.stencil.pop(maskData.maskObject);
          break;
        case MASK_TYPES.SPRITE:
          this.popSpriteMask(maskData);
          break;
        case MASK_TYPES.COLOR:
          this.popColorMask(maskData);
          break;
      }
    }
    maskData.reset();
    if (maskData.pooled) {
      this.maskDataPool.push(maskData);
    }
    if (this.maskStack.length !== 0) {
      var maskCurrent = this.maskStack[this.maskStack.length - 1];
      if (maskCurrent.type === MASK_TYPES.SPRITE && maskCurrent._filters) {
        maskCurrent._filters[0].maskSprite = maskCurrent.maskObject;
      }
    }
  };
  MaskSystem2.prototype.detect = function(maskData) {
    var maskObject = maskData.maskObject;
    if (!maskObject) {
      maskData.type = MASK_TYPES.COLOR;
    } else if (maskObject.isSprite) {
      maskData.type = MASK_TYPES.SPRITE;
    } else if (this.enableScissor && this.renderer.scissor.testScissor(maskData)) {
      maskData.type = MASK_TYPES.SCISSOR;
    } else {
      maskData.type = MASK_TYPES.STENCIL;
    }
  };
  MaskSystem2.prototype.pushSpriteMask = function(maskData) {
    var _a2, _b2;
    var maskObject = maskData.maskObject;
    var target = maskData._target;
    var alphaMaskFilter = maskData._filters;
    if (!alphaMaskFilter) {
      alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex];
      if (!alphaMaskFilter) {
        alphaMaskFilter = this.alphaMaskPool[this.alphaMaskIndex] = [new SpriteMaskFilter()];
      }
    }
    var renderer = this.renderer;
    var renderTextureSystem = renderer.renderTexture;
    var resolution;
    var multisample;
    if (renderTextureSystem.current) {
      var renderTexture = renderTextureSystem.current;
      resolution = maskData.resolution || renderTexture.resolution;
      multisample = (_a2 = maskData.multisample) !== null && _a2 !== void 0 ? _a2 : renderTexture.multisample;
    } else {
      resolution = maskData.resolution || renderer.resolution;
      multisample = (_b2 = maskData.multisample) !== null && _b2 !== void 0 ? _b2 : renderer.multisample;
    }
    alphaMaskFilter[0].resolution = resolution;
    alphaMaskFilter[0].multisample = multisample;
    alphaMaskFilter[0].maskSprite = maskObject;
    var stashFilterArea = target.filterArea;
    target.filterArea = maskObject.getBounds(true);
    renderer.filter.push(target, alphaMaskFilter);
    target.filterArea = stashFilterArea;
    if (!maskData._filters) {
      this.alphaMaskIndex++;
    }
  };
  MaskSystem2.prototype.popSpriteMask = function(maskData) {
    this.renderer.filter.pop();
    if (maskData._filters) {
      maskData._filters[0].maskSprite = null;
    } else {
      this.alphaMaskIndex--;
      this.alphaMaskPool[this.alphaMaskIndex][0].maskSprite = null;
    }
  };
  MaskSystem2.prototype.pushColorMask = function(maskData) {
    var currColorMask = maskData._colorMask;
    var nextColorMask = maskData._colorMask = currColorMask & maskData.colorMask;
    if (nextColorMask !== currColorMask) {
      this.renderer.gl.colorMask((nextColorMask & 1) !== 0, (nextColorMask & 2) !== 0, (nextColorMask & 4) !== 0, (nextColorMask & 8) !== 0);
    }
  };
  MaskSystem2.prototype.popColorMask = function(maskData) {
    var currColorMask = maskData._colorMask;
    var nextColorMask = this.maskStack.length > 0 ? this.maskStack[this.maskStack.length - 1]._colorMask : 15;
    if (nextColorMask !== currColorMask) {
      this.renderer.gl.colorMask((nextColorMask & 1) !== 0, (nextColorMask & 2) !== 0, (nextColorMask & 4) !== 0, (nextColorMask & 8) !== 0);
    }
  };
  MaskSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return MaskSystem2;
}();
var AbstractMaskSystem = function() {
  function AbstractMaskSystem2(renderer) {
    this.renderer = renderer;
    this.maskStack = [];
    this.glConst = 0;
  }
  AbstractMaskSystem2.prototype.getStackLength = function() {
    return this.maskStack.length;
  };
  AbstractMaskSystem2.prototype.setMaskStack = function(maskStack) {
    var gl = this.renderer.gl;
    var curStackLen = this.getStackLength();
    this.maskStack = maskStack;
    var newStackLen = this.getStackLength();
    if (newStackLen !== curStackLen) {
      if (newStackLen === 0) {
        gl.disable(this.glConst);
      } else {
        gl.enable(this.glConst);
        this._useCurrent();
      }
    }
  };
  AbstractMaskSystem2.prototype._useCurrent = function() {
  };
  AbstractMaskSystem2.prototype.destroy = function() {
    this.renderer = null;
    this.maskStack = null;
  };
  return AbstractMaskSystem2;
}();
var tempMatrix$1 = new Matrix();
var rectPool = [];
var ScissorSystem = function(_super) {
  __extends$i(ScissorSystem2, _super);
  function ScissorSystem2(renderer) {
    var _this = _super.call(this, renderer) || this;
    _this.glConst = settings.ADAPTER.getWebGLRenderingContext().SCISSOR_TEST;
    return _this;
  }
  ScissorSystem2.prototype.getStackLength = function() {
    var maskData = this.maskStack[this.maskStack.length - 1];
    if (maskData) {
      return maskData._scissorCounter;
    }
    return 0;
  };
  ScissorSystem2.prototype.calcScissorRect = function(maskData) {
    var _a2;
    if (maskData._scissorRectLocal) {
      return;
    }
    var prevData = maskData._scissorRect;
    var maskObject = maskData.maskObject;
    var renderer = this.renderer;
    var renderTextureSystem = renderer.renderTexture;
    var rect = maskObject.getBounds(true, (_a2 = rectPool.pop()) !== null && _a2 !== void 0 ? _a2 : new Rectangle());
    this.roundFrameToPixels(rect, renderTextureSystem.current ? renderTextureSystem.current.resolution : renderer.resolution, renderTextureSystem.sourceFrame, renderTextureSystem.destinationFrame, renderer.projection.transform);
    if (prevData) {
      rect.fit(prevData);
    }
    maskData._scissorRectLocal = rect;
  };
  ScissorSystem2.isMatrixRotated = function(matrix) {
    if (!matrix) {
      return false;
    }
    var a = matrix.a, b = matrix.b, c = matrix.c, d = matrix.d;
    return (Math.abs(b) > 1e-4 || Math.abs(c) > 1e-4) && (Math.abs(a) > 1e-4 || Math.abs(d) > 1e-4);
  };
  ScissorSystem2.prototype.testScissor = function(maskData) {
    var maskObject = maskData.maskObject;
    if (!maskObject.isFastRect || !maskObject.isFastRect()) {
      return false;
    }
    if (ScissorSystem2.isMatrixRotated(maskObject.worldTransform)) {
      return false;
    }
    if (ScissorSystem2.isMatrixRotated(this.renderer.projection.transform)) {
      return false;
    }
    this.calcScissorRect(maskData);
    var rect = maskData._scissorRectLocal;
    return rect.width > 0 && rect.height > 0;
  };
  ScissorSystem2.prototype.roundFrameToPixels = function(frame, resolution, bindingSourceFrame, bindingDestinationFrame, transform) {
    if (ScissorSystem2.isMatrixRotated(transform)) {
      return;
    }
    transform = transform ? tempMatrix$1.copyFrom(transform) : tempMatrix$1.identity();
    transform.translate(-bindingSourceFrame.x, -bindingSourceFrame.y).scale(bindingDestinationFrame.width / bindingSourceFrame.width, bindingDestinationFrame.height / bindingSourceFrame.height).translate(bindingDestinationFrame.x, bindingDestinationFrame.y);
    this.renderer.filter.transformAABB(transform, frame);
    frame.fit(bindingDestinationFrame);
    frame.x = Math.round(frame.x * resolution);
    frame.y = Math.round(frame.y * resolution);
    frame.width = Math.round(frame.width * resolution);
    frame.height = Math.round(frame.height * resolution);
  };
  ScissorSystem2.prototype.push = function(maskData) {
    if (!maskData._scissorRectLocal) {
      this.calcScissorRect(maskData);
    }
    var gl = this.renderer.gl;
    if (!maskData._scissorRect) {
      gl.enable(gl.SCISSOR_TEST);
    }
    maskData._scissorCounter++;
    maskData._scissorRect = maskData._scissorRectLocal;
    this._useCurrent();
  };
  ScissorSystem2.prototype.pop = function(maskData) {
    var gl = this.renderer.gl;
    if (maskData) {
      rectPool.push(maskData._scissorRectLocal);
    }
    if (this.getStackLength() > 0) {
      this._useCurrent();
    } else {
      gl.disable(gl.SCISSOR_TEST);
    }
  };
  ScissorSystem2.prototype._useCurrent = function() {
    var rect = this.maskStack[this.maskStack.length - 1]._scissorRect;
    var y;
    if (this.renderer.renderTexture.current) {
      y = rect.y;
    } else {
      y = this.renderer.height - rect.height - rect.y;
    }
    this.renderer.gl.scissor(rect.x, y, rect.width, rect.height);
  };
  return ScissorSystem2;
}(AbstractMaskSystem);
var StencilSystem = function(_super) {
  __extends$i(StencilSystem2, _super);
  function StencilSystem2(renderer) {
    var _this = _super.call(this, renderer) || this;
    _this.glConst = settings.ADAPTER.getWebGLRenderingContext().STENCIL_TEST;
    return _this;
  }
  StencilSystem2.prototype.getStackLength = function() {
    var maskData = this.maskStack[this.maskStack.length - 1];
    if (maskData) {
      return maskData._stencilCounter;
    }
    return 0;
  };
  StencilSystem2.prototype.push = function(maskData) {
    var maskObject = maskData.maskObject;
    var gl = this.renderer.gl;
    var prevMaskCount = maskData._stencilCounter;
    if (prevMaskCount === 0) {
      this.renderer.framebuffer.forceStencil();
      gl.clearStencil(0);
      gl.clear(gl.STENCIL_BUFFER_BIT);
      gl.enable(gl.STENCIL_TEST);
    }
    maskData._stencilCounter++;
    var colorMask = maskData._colorMask;
    if (colorMask !== 0) {
      maskData._colorMask = 0;
      gl.colorMask(false, false, false, false);
    }
    gl.stencilFunc(gl.EQUAL, prevMaskCount, 4294967295);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
    maskObject.renderable = true;
    maskObject.render(this.renderer);
    this.renderer.batch.flush();
    maskObject.renderable = false;
    if (colorMask !== 0) {
      maskData._colorMask = colorMask;
      gl.colorMask((colorMask & 1) !== 0, (colorMask & 2) !== 0, (colorMask & 4) !== 0, (colorMask & 8) !== 0);
    }
    this._useCurrent();
  };
  StencilSystem2.prototype.pop = function(maskObject) {
    var gl = this.renderer.gl;
    if (this.getStackLength() === 0) {
      gl.disable(gl.STENCIL_TEST);
    } else {
      var maskData = this.maskStack.length !== 0 ? this.maskStack[this.maskStack.length - 1] : null;
      var colorMask = maskData ? maskData._colorMask : 15;
      if (colorMask !== 0) {
        maskData._colorMask = 0;
        gl.colorMask(false, false, false, false);
      }
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
      maskObject.renderable = true;
      maskObject.render(this.renderer);
      this.renderer.batch.flush();
      maskObject.renderable = false;
      if (colorMask !== 0) {
        maskData._colorMask = colorMask;
        gl.colorMask((colorMask & 1) !== 0, (colorMask & 2) !== 0, (colorMask & 4) !== 0, (colorMask & 8) !== 0);
      }
      this._useCurrent();
    }
  };
  StencilSystem2.prototype._useCurrent = function() {
    var gl = this.renderer.gl;
    gl.stencilFunc(gl.EQUAL, this.getStackLength(), 4294967295);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  };
  return StencilSystem2;
}(AbstractMaskSystem);
var ProjectionSystem = function() {
  function ProjectionSystem2(renderer) {
    this.renderer = renderer;
    this.destinationFrame = null;
    this.sourceFrame = null;
    this.defaultFrame = null;
    this.projectionMatrix = new Matrix();
    this.transform = null;
  }
  ProjectionSystem2.prototype.update = function(destinationFrame, sourceFrame, resolution, root) {
    this.destinationFrame = destinationFrame || this.destinationFrame || this.defaultFrame;
    this.sourceFrame = sourceFrame || this.sourceFrame || destinationFrame;
    this.calculateProjection(this.destinationFrame, this.sourceFrame, resolution, root);
    if (this.transform) {
      this.projectionMatrix.append(this.transform);
    }
    var renderer = this.renderer;
    renderer.globalUniforms.uniforms.projectionMatrix = this.projectionMatrix;
    renderer.globalUniforms.update();
    if (renderer.shader.shader) {
      renderer.shader.syncUniformGroup(renderer.shader.shader.uniforms.globals);
    }
  };
  ProjectionSystem2.prototype.calculateProjection = function(_destinationFrame, sourceFrame, _resolution, root) {
    var pm = this.projectionMatrix;
    var sign2 = !root ? 1 : -1;
    pm.identity();
    pm.a = 1 / sourceFrame.width * 2;
    pm.d = sign2 * (1 / sourceFrame.height * 2);
    pm.tx = -1 - sourceFrame.x * pm.a;
    pm.ty = -sign2 - sourceFrame.y * pm.d;
  };
  ProjectionSystem2.prototype.setTransform = function(_matrix) {
  };
  ProjectionSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return ProjectionSystem2;
}();
var tempRect = new Rectangle();
var tempRect2 = new Rectangle();
var RenderTextureSystem = function() {
  function RenderTextureSystem2(renderer) {
    this.renderer = renderer;
    this.clearColor = renderer._backgroundColorRgba;
    this.defaultMaskStack = [];
    this.current = null;
    this.sourceFrame = new Rectangle();
    this.destinationFrame = new Rectangle();
    this.viewportFrame = new Rectangle();
  }
  RenderTextureSystem2.prototype.bind = function(renderTexture, sourceFrame, destinationFrame) {
    if (renderTexture === void 0) {
      renderTexture = null;
    }
    var renderer = this.renderer;
    this.current = renderTexture;
    var baseTexture;
    var framebuffer;
    var resolution;
    if (renderTexture) {
      baseTexture = renderTexture.baseTexture;
      resolution = baseTexture.resolution;
      if (!sourceFrame) {
        tempRect.width = renderTexture.frame.width;
        tempRect.height = renderTexture.frame.height;
        sourceFrame = tempRect;
      }
      if (!destinationFrame) {
        tempRect2.x = renderTexture.frame.x;
        tempRect2.y = renderTexture.frame.y;
        tempRect2.width = sourceFrame.width;
        tempRect2.height = sourceFrame.height;
        destinationFrame = tempRect2;
      }
      framebuffer = baseTexture.framebuffer;
    } else {
      resolution = renderer.resolution;
      if (!sourceFrame) {
        tempRect.width = renderer.screen.width;
        tempRect.height = renderer.screen.height;
        sourceFrame = tempRect;
      }
      if (!destinationFrame) {
        destinationFrame = tempRect;
        destinationFrame.width = sourceFrame.width;
        destinationFrame.height = sourceFrame.height;
      }
    }
    var viewportFrame = this.viewportFrame;
    viewportFrame.x = destinationFrame.x * resolution;
    viewportFrame.y = destinationFrame.y * resolution;
    viewportFrame.width = destinationFrame.width * resolution;
    viewportFrame.height = destinationFrame.height * resolution;
    if (!renderTexture) {
      viewportFrame.y = renderer.view.height - (viewportFrame.y + viewportFrame.height);
    }
    viewportFrame.ceil();
    this.renderer.framebuffer.bind(framebuffer, viewportFrame);
    this.renderer.projection.update(destinationFrame, sourceFrame, resolution, !framebuffer);
    if (renderTexture) {
      this.renderer.mask.setMaskStack(baseTexture.maskStack);
    } else {
      this.renderer.mask.setMaskStack(this.defaultMaskStack);
    }
    this.sourceFrame.copyFrom(sourceFrame);
    this.destinationFrame.copyFrom(destinationFrame);
  };
  RenderTextureSystem2.prototype.clear = function(clearColor, mask) {
    if (this.current) {
      clearColor = clearColor || this.current.baseTexture.clearColor;
    } else {
      clearColor = clearColor || this.clearColor;
    }
    var destinationFrame = this.destinationFrame;
    var baseFrame = this.current ? this.current.baseTexture : this.renderer.screen;
    var clearMask = destinationFrame.width !== baseFrame.width || destinationFrame.height !== baseFrame.height;
    if (clearMask) {
      var _a2 = this.viewportFrame, x = _a2.x, y = _a2.y, width = _a2.width, height = _a2.height;
      x = Math.round(x);
      y = Math.round(y);
      width = Math.round(width);
      height = Math.round(height);
      this.renderer.gl.enable(this.renderer.gl.SCISSOR_TEST);
      this.renderer.gl.scissor(x, y, width, height);
    }
    this.renderer.framebuffer.clear(clearColor[0], clearColor[1], clearColor[2], clearColor[3], mask);
    if (clearMask) {
      this.renderer.scissor.pop();
    }
  };
  RenderTextureSystem2.prototype.resize = function() {
    this.bind(null);
  };
  RenderTextureSystem2.prototype.reset = function() {
    this.bind(null);
  };
  RenderTextureSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return RenderTextureSystem2;
}();
function uboUpdate(_ud, _uv, _renderer, _syncData, buffer) {
  _renderer.buffer.update(buffer);
}
var UBO_TO_SINGLE_SETTERS = {
  float: "\n        data[offset] = v;\n    ",
  vec2: "\n        data[offset] = v[0];\n        data[offset+1] = v[1];\n    ",
  vec3: "\n        data[offset] = v[0];\n        data[offset+1] = v[1];\n        data[offset+2] = v[2];\n\n    ",
  vec4: "\n        data[offset] = v[0];\n        data[offset+1] = v[1];\n        data[offset+2] = v[2];\n        data[offset+3] = v[3];\n    ",
  mat2: "\n        data[offset] = v[0];\n        data[offset+1] = v[1];\n\n        data[offset+4] = v[2];\n        data[offset+5] = v[3];\n    ",
  mat3: "\n        data[offset] = v[0];\n        data[offset+1] = v[1];\n        data[offset+2] = v[2];\n\n        data[offset + 4] = v[3];\n        data[offset + 5] = v[4];\n        data[offset + 6] = v[5];\n\n        data[offset + 8] = v[6];\n        data[offset + 9] = v[7];\n        data[offset + 10] = v[8];\n    ",
  mat4: "\n        for(var i = 0; i < 16; i++)\n        {\n            data[offset + i] = v[i];\n        }\n    "
};
var GLSL_TO_STD40_SIZE = {
  float: 4,
  vec2: 8,
  vec3: 12,
  vec4: 16,
  int: 4,
  ivec2: 8,
  ivec3: 12,
  ivec4: 16,
  uint: 4,
  uvec2: 8,
  uvec3: 12,
  uvec4: 16,
  bool: 4,
  bvec2: 8,
  bvec3: 12,
  bvec4: 16,
  mat2: 16 * 2,
  mat3: 16 * 3,
  mat4: 16 * 4
};
function createUBOElements(uniformData) {
  var uboElements = uniformData.map(function(data) {
    return {
      data,
      offset: 0,
      dataLen: 0,
      dirty: 0
    };
  });
  var size = 0;
  var chunkSize = 0;
  var offset = 0;
  for (var i = 0; i < uboElements.length; i++) {
    var uboElement = uboElements[i];
    size = GLSL_TO_STD40_SIZE[uboElement.data.type];
    if (uboElement.data.size > 1) {
      size = Math.max(size, 16) * uboElement.data.size;
    }
    uboElement.dataLen = size;
    if (chunkSize % size !== 0 && chunkSize < 16) {
      var lineUpValue = chunkSize % size % 16;
      chunkSize += lineUpValue;
      offset += lineUpValue;
    }
    if (chunkSize + size > 16) {
      offset = Math.ceil(offset / 16) * 16;
      uboElement.offset = offset;
      offset += size;
      chunkSize = size;
    } else {
      uboElement.offset = offset;
      chunkSize += size;
      offset += size;
    }
  }
  offset = Math.ceil(offset / 16) * 16;
  return { uboElements, size: offset };
}
function getUBOData(uniforms, uniformData) {
  var usedUniformDatas = [];
  for (var i in uniforms) {
    if (uniformData[i]) {
      usedUniformDatas.push(uniformData[i]);
    }
  }
  usedUniformDatas.sort(function(a, b) {
    return a.index - b.index;
  });
  return usedUniformDatas;
}
function generateUniformBufferSync(group, uniformData) {
  if (!group.autoManage) {
    return { size: 0, syncFunc: uboUpdate };
  }
  var usedUniformDatas = getUBOData(group.uniforms, uniformData);
  var _a2 = createUBOElements(usedUniformDatas), uboElements = _a2.uboElements, size = _a2.size;
  var funcFragments = ["\n    var v = null;\n    var v2 = null;\n    var cv = null;\n    var t = 0;\n    var gl = renderer.gl\n    var index = 0;\n    var data = buffer.data;\n    "];
  for (var i = 0; i < uboElements.length; i++) {
    var uboElement = uboElements[i];
    var uniform = group.uniforms[uboElement.data.name];
    var name = uboElement.data.name;
    var parsed = false;
    for (var j = 0; j < uniformParsers.length; j++) {
      var uniformParser = uniformParsers[j];
      if (uniformParser.codeUbo && uniformParser.test(uboElement.data, uniform)) {
        funcFragments.push("offset = " + uboElement.offset / 4 + ";", uniformParsers[j].codeUbo(uboElement.data.name, uniform));
        parsed = true;
        break;
      }
    }
    if (!parsed) {
      if (uboElement.data.size > 1) {
        var size_1 = mapSize(uboElement.data.type);
        var rowSize = Math.max(GLSL_TO_STD40_SIZE[uboElement.data.type] / 16, 1);
        var elementSize = size_1 / rowSize;
        var remainder = (4 - elementSize % 4) % 4;
        funcFragments.push("\n                cv = ud." + name + ".value;\n                v = uv." + name + ";\n                offset = " + uboElement.offset / 4 + ";\n\n                t = 0;\n\n                for(var i=0; i < " + uboElement.data.size * rowSize + "; i++)\n                {\n                    for(var j = 0; j < " + elementSize + "; j++)\n                    {\n                        data[offset++] = v[t++];\n                    }\n                    offset += " + remainder + ";\n                }\n\n                ");
      } else {
        var template = UBO_TO_SINGLE_SETTERS[uboElement.data.type];
        funcFragments.push("\n                cv = ud." + name + ".value;\n                v = uv." + name + ";\n                offset = " + uboElement.offset / 4 + ";\n                " + template + ";\n                ");
      }
    }
  }
  funcFragments.push("\n       renderer.buffer.update(buffer);\n    ");
  return {
    size,
    syncFunc: new Function("ud", "uv", "renderer", "syncData", "buffer", funcFragments.join("\n"))
  };
}
var IGLUniformData = function() {
  function IGLUniformData2() {
  }
  return IGLUniformData2;
}();
var GLProgram = function() {
  function GLProgram2(program, uniformData) {
    this.program = program;
    this.uniformData = uniformData;
    this.uniformGroups = {};
    this.uniformDirtyGroups = {};
    this.uniformBufferBindings = {};
  }
  GLProgram2.prototype.destroy = function() {
    this.uniformData = null;
    this.uniformGroups = null;
    this.uniformDirtyGroups = null;
    this.uniformBufferBindings = null;
    this.program = null;
  };
  return GLProgram2;
}();
function getAttributeData(program, gl) {
  var attributes = {};
  var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (var i = 0; i < totalAttributes; i++) {
    var attribData = gl.getActiveAttrib(program, i);
    if (attribData.name.indexOf("gl_") === 0) {
      continue;
    }
    var type = mapType(gl, attribData.type);
    var data = {
      type,
      name: attribData.name,
      size: mapSize(type),
      location: gl.getAttribLocation(program, attribData.name)
    };
    attributes[attribData.name] = data;
  }
  return attributes;
}
function getUniformData(program, gl) {
  var uniforms = {};
  var totalUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < totalUniforms; i++) {
    var uniformData = gl.getActiveUniform(program, i);
    var name = uniformData.name.replace(/\[.*?\]$/, "");
    var isArray2 = !!uniformData.name.match(/\[.*?\]$/);
    var type = mapType(gl, uniformData.type);
    uniforms[name] = {
      name,
      index: i,
      type,
      size: uniformData.size,
      isArray: isArray2,
      value: defaultValue(type, uniformData.size)
    };
  }
  return uniforms;
}
function generateProgram(gl, program) {
  var glVertShader = compileShader(gl, gl.VERTEX_SHADER, program.vertexSrc);
  var glFragShader = compileShader(gl, gl.FRAGMENT_SHADER, program.fragmentSrc);
  var webGLProgram = gl.createProgram();
  gl.attachShader(webGLProgram, glVertShader);
  gl.attachShader(webGLProgram, glFragShader);
  gl.linkProgram(webGLProgram);
  if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS)) {
    logProgramError(gl, webGLProgram, glVertShader, glFragShader);
  }
  program.attributeData = getAttributeData(webGLProgram, gl);
  program.uniformData = getUniformData(webGLProgram, gl);
  if (!/^[ \t]*#[ \t]*version[ \t]+300[ \t]+es[ \t]*$/m.test(program.vertexSrc)) {
    var keys = Object.keys(program.attributeData);
    keys.sort(function(a, b) {
      return a > b ? 1 : -1;
    });
    for (var i = 0; i < keys.length; i++) {
      program.attributeData[keys[i]].location = i;
      gl.bindAttribLocation(webGLProgram, i, keys[i]);
    }
    gl.linkProgram(webGLProgram);
  }
  gl.deleteShader(glVertShader);
  gl.deleteShader(glFragShader);
  var uniformData = {};
  for (var i in program.uniformData) {
    var data = program.uniformData[i];
    uniformData[i] = {
      location: gl.getUniformLocation(webGLProgram, i),
      value: defaultValue(data.type, data.size)
    };
  }
  var glProgram = new GLProgram(webGLProgram, uniformData);
  return glProgram;
}
var UID = 0;
var defaultSyncData = { textureCount: 0, uboCount: 0 };
var ShaderSystem = function() {
  function ShaderSystem2(renderer) {
    this.destroyed = false;
    this.renderer = renderer;
    this.systemCheck();
    this.gl = null;
    this.shader = null;
    this.program = null;
    this.cache = {};
    this._uboCache = {};
    this.id = UID++;
  }
  ShaderSystem2.prototype.systemCheck = function() {
    if (!unsafeEvalSupported()) {
      throw new Error("Current environment does not allow unsafe-eval, please use @pixi/unsafe-eval module to enable support.");
    }
  };
  ShaderSystem2.prototype.contextChange = function(gl) {
    this.gl = gl;
    this.reset();
  };
  ShaderSystem2.prototype.bind = function(shader, dontSync) {
    shader.disposeRunner.add(this);
    shader.uniforms.globals = this.renderer.globalUniforms;
    var program = shader.program;
    var glProgram = program.glPrograms[this.renderer.CONTEXT_UID] || this.generateProgram(shader);
    this.shader = shader;
    if (this.program !== program) {
      this.program = program;
      this.gl.useProgram(glProgram.program);
    }
    if (!dontSync) {
      defaultSyncData.textureCount = 0;
      defaultSyncData.uboCount = 0;
      this.syncUniformGroup(shader.uniformGroup, defaultSyncData);
    }
    return glProgram;
  };
  ShaderSystem2.prototype.setUniforms = function(uniforms) {
    var shader = this.shader.program;
    var glProgram = shader.glPrograms[this.renderer.CONTEXT_UID];
    shader.syncUniforms(glProgram.uniformData, uniforms, this.renderer);
  };
  ShaderSystem2.prototype.syncUniformGroup = function(group, syncData) {
    var glProgram = this.getGlProgram();
    if (!group.static || group.dirtyId !== glProgram.uniformDirtyGroups[group.id]) {
      glProgram.uniformDirtyGroups[group.id] = group.dirtyId;
      this.syncUniforms(group, glProgram, syncData);
    }
  };
  ShaderSystem2.prototype.syncUniforms = function(group, glProgram, syncData) {
    var syncFunc = group.syncUniforms[this.shader.program.id] || this.createSyncGroups(group);
    syncFunc(glProgram.uniformData, group.uniforms, this.renderer, syncData);
  };
  ShaderSystem2.prototype.createSyncGroups = function(group) {
    var id = this.getSignature(group, this.shader.program.uniformData, "u");
    if (!this.cache[id]) {
      this.cache[id] = generateUniformsSync(group, this.shader.program.uniformData);
    }
    group.syncUniforms[this.shader.program.id] = this.cache[id];
    return group.syncUniforms[this.shader.program.id];
  };
  ShaderSystem2.prototype.syncUniformBufferGroup = function(group, name) {
    var glProgram = this.getGlProgram();
    if (!group.static || group.dirtyId !== 0 || !glProgram.uniformGroups[group.id]) {
      group.dirtyId = 0;
      var syncFunc = glProgram.uniformGroups[group.id] || this.createSyncBufferGroup(group, glProgram, name);
      group.buffer.update();
      syncFunc(glProgram.uniformData, group.uniforms, this.renderer, defaultSyncData, group.buffer);
    }
    this.renderer.buffer.bindBufferBase(group.buffer, glProgram.uniformBufferBindings[name]);
  };
  ShaderSystem2.prototype.createSyncBufferGroup = function(group, glProgram, name) {
    var gl = this.renderer.gl;
    this.renderer.buffer.bind(group.buffer);
    var uniformBlockIndex = this.gl.getUniformBlockIndex(glProgram.program, name);
    glProgram.uniformBufferBindings[name] = this.shader.uniformBindCount;
    gl.uniformBlockBinding(glProgram.program, uniformBlockIndex, this.shader.uniformBindCount);
    this.shader.uniformBindCount++;
    var id = this.getSignature(group, this.shader.program.uniformData, "ubo");
    var uboData = this._uboCache[id];
    if (!uboData) {
      uboData = this._uboCache[id] = generateUniformBufferSync(group, this.shader.program.uniformData);
    }
    if (group.autoManage) {
      var data = new Float32Array(uboData.size / 4);
      group.buffer.update(data);
    }
    glProgram.uniformGroups[group.id] = uboData.syncFunc;
    return glProgram.uniformGroups[group.id];
  };
  ShaderSystem2.prototype.getSignature = function(group, uniformData, preFix) {
    var uniforms = group.uniforms;
    var strings = [preFix + "-"];
    for (var i in uniforms) {
      strings.push(i);
      if (uniformData[i]) {
        strings.push(uniformData[i].type);
      }
    }
    return strings.join("-");
  };
  ShaderSystem2.prototype.getGlProgram = function() {
    if (this.shader) {
      return this.shader.program.glPrograms[this.renderer.CONTEXT_UID];
    }
    return null;
  };
  ShaderSystem2.prototype.generateProgram = function(shader) {
    var gl = this.gl;
    var program = shader.program;
    var glProgram = generateProgram(gl, program);
    program.glPrograms[this.renderer.CONTEXT_UID] = glProgram;
    return glProgram;
  };
  ShaderSystem2.prototype.reset = function() {
    this.program = null;
    this.shader = null;
  };
  ShaderSystem2.prototype.disposeShader = function(shader) {
    if (this.shader === shader) {
      this.shader = null;
    }
  };
  ShaderSystem2.prototype.destroy = function() {
    this.renderer = null;
    this.destroyed = true;
  };
  return ShaderSystem2;
}();
function mapWebGLBlendModesToPixi(gl, array) {
  if (array === void 0) {
    array = [];
  }
  array[BLEND_MODES.NORMAL] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.ADD] = [gl.ONE, gl.ONE];
  array[BLEND_MODES.MULTIPLY] = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.SCREEN] = [gl.ONE, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.OVERLAY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.DARKEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.LIGHTEN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.COLOR_DODGE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.COLOR_BURN] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.HARD_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.SOFT_LIGHT] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.DIFFERENCE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.EXCLUSION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.HUE] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.SATURATION] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.COLOR] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.LUMINOSITY] = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.NONE] = [0, 0];
  array[BLEND_MODES.NORMAL_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.ADD_NPM] = [gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE];
  array[BLEND_MODES.SCREEN_NPM] = [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.SRC_IN] = [gl.DST_ALPHA, gl.ZERO];
  array[BLEND_MODES.SRC_OUT] = [gl.ONE_MINUS_DST_ALPHA, gl.ZERO];
  array[BLEND_MODES.SRC_ATOP] = [gl.DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.DST_OVER] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE];
  array[BLEND_MODES.DST_IN] = [gl.ZERO, gl.SRC_ALPHA];
  array[BLEND_MODES.DST_OUT] = [gl.ZERO, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.DST_ATOP] = [gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA];
  array[BLEND_MODES.XOR] = [gl.ONE_MINUS_DST_ALPHA, gl.ONE_MINUS_SRC_ALPHA];
  array[BLEND_MODES.SUBTRACT] = [gl.ONE, gl.ONE, gl.ONE, gl.ONE, gl.FUNC_REVERSE_SUBTRACT, gl.FUNC_ADD];
  return array;
}
var BLEND = 0;
var OFFSET = 1;
var CULLING = 2;
var DEPTH_TEST = 3;
var WINDING = 4;
var DEPTH_MASK = 5;
var StateSystem = function() {
  function StateSystem2() {
    this.gl = null;
    this.stateId = 0;
    this.polygonOffset = 0;
    this.blendMode = BLEND_MODES.NONE;
    this._blendEq = false;
    this.map = [];
    this.map[BLEND] = this.setBlend;
    this.map[OFFSET] = this.setOffset;
    this.map[CULLING] = this.setCullFace;
    this.map[DEPTH_TEST] = this.setDepthTest;
    this.map[WINDING] = this.setFrontFace;
    this.map[DEPTH_MASK] = this.setDepthMask;
    this.checks = [];
    this.defaultState = new State();
    this.defaultState.blend = true;
  }
  StateSystem2.prototype.contextChange = function(gl) {
    this.gl = gl;
    this.blendModes = mapWebGLBlendModesToPixi(gl);
    this.set(this.defaultState);
    this.reset();
  };
  StateSystem2.prototype.set = function(state) {
    state = state || this.defaultState;
    if (this.stateId !== state.data) {
      var diff = this.stateId ^ state.data;
      var i = 0;
      while (diff) {
        if (diff & 1) {
          this.map[i].call(this, !!(state.data & 1 << i));
        }
        diff = diff >> 1;
        i++;
      }
      this.stateId = state.data;
    }
    for (var i = 0; i < this.checks.length; i++) {
      this.checks[i](this, state);
    }
  };
  StateSystem2.prototype.forceState = function(state) {
    state = state || this.defaultState;
    for (var i = 0; i < this.map.length; i++) {
      this.map[i].call(this, !!(state.data & 1 << i));
    }
    for (var i = 0; i < this.checks.length; i++) {
      this.checks[i](this, state);
    }
    this.stateId = state.data;
  };
  StateSystem2.prototype.setBlend = function(value) {
    this.updateCheck(StateSystem2.checkBlendMode, value);
    this.gl[value ? "enable" : "disable"](this.gl.BLEND);
  };
  StateSystem2.prototype.setOffset = function(value) {
    this.updateCheck(StateSystem2.checkPolygonOffset, value);
    this.gl[value ? "enable" : "disable"](this.gl.POLYGON_OFFSET_FILL);
  };
  StateSystem2.prototype.setDepthTest = function(value) {
    this.gl[value ? "enable" : "disable"](this.gl.DEPTH_TEST);
  };
  StateSystem2.prototype.setDepthMask = function(value) {
    this.gl.depthMask(value);
  };
  StateSystem2.prototype.setCullFace = function(value) {
    this.gl[value ? "enable" : "disable"](this.gl.CULL_FACE);
  };
  StateSystem2.prototype.setFrontFace = function(value) {
    this.gl.frontFace(this.gl[value ? "CW" : "CCW"]);
  };
  StateSystem2.prototype.setBlendMode = function(value) {
    if (value === this.blendMode) {
      return;
    }
    this.blendMode = value;
    var mode = this.blendModes[value];
    var gl = this.gl;
    if (mode.length === 2) {
      gl.blendFunc(mode[0], mode[1]);
    } else {
      gl.blendFuncSeparate(mode[0], mode[1], mode[2], mode[3]);
    }
    if (mode.length === 6) {
      this._blendEq = true;
      gl.blendEquationSeparate(mode[4], mode[5]);
    } else if (this._blendEq) {
      this._blendEq = false;
      gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
    }
  };
  StateSystem2.prototype.setPolygonOffset = function(value, scale) {
    this.gl.polygonOffset(value, scale);
  };
  StateSystem2.prototype.reset = function() {
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
    this.forceState(this.defaultState);
    this._blendEq = true;
    this.blendMode = -1;
    this.setBlendMode(0);
  };
  StateSystem2.prototype.updateCheck = function(func, value) {
    var index2 = this.checks.indexOf(func);
    if (value && index2 === -1) {
      this.checks.push(func);
    } else if (!value && index2 !== -1) {
      this.checks.splice(index2, 1);
    }
  };
  StateSystem2.checkBlendMode = function(system, state) {
    system.setBlendMode(state.blendMode);
  };
  StateSystem2.checkPolygonOffset = function(system, state) {
    system.setPolygonOffset(1, state.polygonOffset);
  };
  StateSystem2.prototype.destroy = function() {
    this.gl = null;
  };
  return StateSystem2;
}();
var TextureGCSystem = function() {
  function TextureGCSystem2(renderer) {
    this.renderer = renderer;
    this.count = 0;
    this.checkCount = 0;
    this.maxIdle = settings.GC_MAX_IDLE;
    this.checkCountMax = settings.GC_MAX_CHECK_COUNT;
    this.mode = settings.GC_MODE;
  }
  TextureGCSystem2.prototype.postrender = function() {
    if (!this.renderer.renderingToScreen) {
      return;
    }
    this.count++;
    if (this.mode === GC_MODES.MANUAL) {
      return;
    }
    this.checkCount++;
    if (this.checkCount > this.checkCountMax) {
      this.checkCount = 0;
      this.run();
    }
  };
  TextureGCSystem2.prototype.run = function() {
    var tm = this.renderer.texture;
    var managedTextures = tm.managedTextures;
    var wasRemoved = false;
    for (var i = 0; i < managedTextures.length; i++) {
      var texture = managedTextures[i];
      if (!texture.framebuffer && this.count - texture.touched > this.maxIdle) {
        tm.destroyTexture(texture, true);
        managedTextures[i] = null;
        wasRemoved = true;
      }
    }
    if (wasRemoved) {
      var j = 0;
      for (var i = 0; i < managedTextures.length; i++) {
        if (managedTextures[i] !== null) {
          managedTextures[j++] = managedTextures[i];
        }
      }
      managedTextures.length = j;
    }
  };
  TextureGCSystem2.prototype.unload = function(displayObject) {
    var tm = this.renderer.texture;
    var texture = displayObject._texture;
    if (texture && !texture.framebuffer) {
      tm.destroyTexture(texture);
    }
    for (var i = displayObject.children.length - 1; i >= 0; i--) {
      this.unload(displayObject.children[i]);
    }
  };
  TextureGCSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return TextureGCSystem2;
}();
function mapTypeAndFormatToInternalFormat(gl) {
  var _a2, _b2, _c2, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
  var table;
  if ("WebGL2RenderingContext" in globalThis && gl instanceof globalThis.WebGL2RenderingContext) {
    table = (_a2 = {}, _a2[TYPES.UNSIGNED_BYTE] = (_b2 = {}, _b2[FORMATS.RGBA] = gl.RGBA8, _b2[FORMATS.RGB] = gl.RGB8, _b2[FORMATS.RG] = gl.RG8, _b2[FORMATS.RED] = gl.R8, _b2[FORMATS.RGBA_INTEGER] = gl.RGBA8UI, _b2[FORMATS.RGB_INTEGER] = gl.RGB8UI, _b2[FORMATS.RG_INTEGER] = gl.RG8UI, _b2[FORMATS.RED_INTEGER] = gl.R8UI, _b2[FORMATS.ALPHA] = gl.ALPHA, _b2[FORMATS.LUMINANCE] = gl.LUMINANCE, _b2[FORMATS.LUMINANCE_ALPHA] = gl.LUMINANCE_ALPHA, _b2), _a2[TYPES.BYTE] = (_c2 = {}, _c2[FORMATS.RGBA] = gl.RGBA8_SNORM, _c2[FORMATS.RGB] = gl.RGB8_SNORM, _c2[FORMATS.RG] = gl.RG8_SNORM, _c2[FORMATS.RED] = gl.R8_SNORM, _c2[FORMATS.RGBA_INTEGER] = gl.RGBA8I, _c2[FORMATS.RGB_INTEGER] = gl.RGB8I, _c2[FORMATS.RG_INTEGER] = gl.RG8I, _c2[FORMATS.RED_INTEGER] = gl.R8I, _c2), _a2[TYPES.UNSIGNED_SHORT] = (_d = {}, _d[FORMATS.RGBA_INTEGER] = gl.RGBA16UI, _d[FORMATS.RGB_INTEGER] = gl.RGB16UI, _d[FORMATS.RG_INTEGER] = gl.RG16UI, _d[FORMATS.RED_INTEGER] = gl.R16UI, _d[FORMATS.DEPTH_COMPONENT] = gl.DEPTH_COMPONENT16, _d), _a2[TYPES.SHORT] = (_e = {}, _e[FORMATS.RGBA_INTEGER] = gl.RGBA16I, _e[FORMATS.RGB_INTEGER] = gl.RGB16I, _e[FORMATS.RG_INTEGER] = gl.RG16I, _e[FORMATS.RED_INTEGER] = gl.R16I, _e), _a2[TYPES.UNSIGNED_INT] = (_f = {}, _f[FORMATS.RGBA_INTEGER] = gl.RGBA32UI, _f[FORMATS.RGB_INTEGER] = gl.RGB32UI, _f[FORMATS.RG_INTEGER] = gl.RG32UI, _f[FORMATS.RED_INTEGER] = gl.R32UI, _f[FORMATS.DEPTH_COMPONENT] = gl.DEPTH_COMPONENT24, _f), _a2[TYPES.INT] = (_g = {}, _g[FORMATS.RGBA_INTEGER] = gl.RGBA32I, _g[FORMATS.RGB_INTEGER] = gl.RGB32I, _g[FORMATS.RG_INTEGER] = gl.RG32I, _g[FORMATS.RED_INTEGER] = gl.R32I, _g), _a2[TYPES.FLOAT] = (_h = {}, _h[FORMATS.RGBA] = gl.RGBA32F, _h[FORMATS.RGB] = gl.RGB32F, _h[FORMATS.RG] = gl.RG32F, _h[FORMATS.RED] = gl.R32F, _h[FORMATS.DEPTH_COMPONENT] = gl.DEPTH_COMPONENT32F, _h), _a2[TYPES.HALF_FLOAT] = (_j = {}, _j[FORMATS.RGBA] = gl.RGBA16F, _j[FORMATS.RGB] = gl.RGB16F, _j[FORMATS.RG] = gl.RG16F, _j[FORMATS.RED] = gl.R16F, _j), _a2[TYPES.UNSIGNED_SHORT_5_6_5] = (_k = {}, _k[FORMATS.RGB] = gl.RGB565, _k), _a2[TYPES.UNSIGNED_SHORT_4_4_4_4] = (_l = {}, _l[FORMATS.RGBA] = gl.RGBA4, _l), _a2[TYPES.UNSIGNED_SHORT_5_5_5_1] = (_m = {}, _m[FORMATS.RGBA] = gl.RGB5_A1, _m), _a2[TYPES.UNSIGNED_INT_2_10_10_10_REV] = (_o = {}, _o[FORMATS.RGBA] = gl.RGB10_A2, _o[FORMATS.RGBA_INTEGER] = gl.RGB10_A2UI, _o), _a2[TYPES.UNSIGNED_INT_10F_11F_11F_REV] = (_p = {}, _p[FORMATS.RGB] = gl.R11F_G11F_B10F, _p), _a2[TYPES.UNSIGNED_INT_5_9_9_9_REV] = (_q = {}, _q[FORMATS.RGB] = gl.RGB9_E5, _q), _a2[TYPES.UNSIGNED_INT_24_8] = (_r = {}, _r[FORMATS.DEPTH_STENCIL] = gl.DEPTH24_STENCIL8, _r), _a2[TYPES.FLOAT_32_UNSIGNED_INT_24_8_REV] = (_s = {}, _s[FORMATS.DEPTH_STENCIL] = gl.DEPTH32F_STENCIL8, _s), _a2);
  } else {
    table = (_t = {}, _t[TYPES.UNSIGNED_BYTE] = (_u = {}, _u[FORMATS.RGBA] = gl.RGBA, _u[FORMATS.RGB] = gl.RGB, _u[FORMATS.ALPHA] = gl.ALPHA, _u[FORMATS.LUMINANCE] = gl.LUMINANCE, _u[FORMATS.LUMINANCE_ALPHA] = gl.LUMINANCE_ALPHA, _u), _t[TYPES.UNSIGNED_SHORT_5_6_5] = (_v = {}, _v[FORMATS.RGB] = gl.RGB, _v), _t[TYPES.UNSIGNED_SHORT_4_4_4_4] = (_w = {}, _w[FORMATS.RGBA] = gl.RGBA, _w), _t[TYPES.UNSIGNED_SHORT_5_5_5_1] = (_x = {}, _x[FORMATS.RGBA] = gl.RGBA, _x), _t);
  }
  return table;
}
var GLTexture = function() {
  function GLTexture2(texture) {
    this.texture = texture;
    this.width = -1;
    this.height = -1;
    this.dirtyId = -1;
    this.dirtyStyleId = -1;
    this.mipmap = false;
    this.wrapMode = 33071;
    this.type = TYPES.UNSIGNED_BYTE;
    this.internalFormat = FORMATS.RGBA;
    this.samplerType = 0;
  }
  return GLTexture2;
}();
var TextureSystem = function() {
  function TextureSystem2(renderer) {
    this.renderer = renderer;
    this.boundTextures = [];
    this.currentLocation = -1;
    this.managedTextures = [];
    this._unknownBoundTextures = false;
    this.unknownTexture = new BaseTexture();
    this.hasIntegerTextures = false;
  }
  TextureSystem2.prototype.contextChange = function() {
    var gl = this.gl = this.renderer.gl;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID;
    this.webGLVersion = this.renderer.context.webGLVersion;
    this.internalFormats = mapTypeAndFormatToInternalFormat(gl);
    var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.boundTextures.length = maxTextures;
    for (var i = 0; i < maxTextures; i++) {
      this.boundTextures[i] = null;
    }
    this.emptyTextures = {};
    var emptyTexture2D = new GLTexture(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D, emptyTexture2D.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    this.emptyTextures[gl.TEXTURE_2D] = emptyTexture2D;
    this.emptyTextures[gl.TEXTURE_CUBE_MAP] = new GLTexture(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.emptyTextures[gl.TEXTURE_CUBE_MAP].texture);
    for (var i = 0; i < 6; i++) {
      gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    for (var i = 0; i < this.boundTextures.length; i++) {
      this.bind(null, i);
    }
  };
  TextureSystem2.prototype.bind = function(texture, location) {
    if (location === void 0) {
      location = 0;
    }
    var gl = this.gl;
    texture = texture === null || texture === void 0 ? void 0 : texture.castToBaseTexture();
    if (texture && texture.valid && !texture.parentTextureArray) {
      texture.touched = this.renderer.textureGC.count;
      var glTexture = texture._glTextures[this.CONTEXT_UID] || this.initTexture(texture);
      if (this.boundTextures[location] !== texture) {
        if (this.currentLocation !== location) {
          this.currentLocation = location;
          gl.activeTexture(gl.TEXTURE0 + location);
        }
        gl.bindTexture(texture.target, glTexture.texture);
      }
      if (glTexture.dirtyId !== texture.dirtyId) {
        if (this.currentLocation !== location) {
          this.currentLocation = location;
          gl.activeTexture(gl.TEXTURE0 + location);
        }
        this.updateTexture(texture);
      } else if (glTexture.dirtyStyleId !== texture.dirtyStyleId) {
        this.updateTextureStyle(texture);
      }
      this.boundTextures[location] = texture;
    } else {
      if (this.currentLocation !== location) {
        this.currentLocation = location;
        gl.activeTexture(gl.TEXTURE0 + location);
      }
      gl.bindTexture(gl.TEXTURE_2D, this.emptyTextures[gl.TEXTURE_2D].texture);
      this.boundTextures[location] = null;
    }
  };
  TextureSystem2.prototype.reset = function() {
    this._unknownBoundTextures = true;
    this.hasIntegerTextures = false;
    this.currentLocation = -1;
    for (var i = 0; i < this.boundTextures.length; i++) {
      this.boundTextures[i] = this.unknownTexture;
    }
  };
  TextureSystem2.prototype.unbind = function(texture) {
    var _a2 = this, gl = _a2.gl, boundTextures = _a2.boundTextures;
    if (this._unknownBoundTextures) {
      this._unknownBoundTextures = false;
      for (var i = 0; i < boundTextures.length; i++) {
        if (boundTextures[i] === this.unknownTexture) {
          this.bind(null, i);
        }
      }
    }
    for (var i = 0; i < boundTextures.length; i++) {
      if (boundTextures[i] === texture) {
        if (this.currentLocation !== i) {
          gl.activeTexture(gl.TEXTURE0 + i);
          this.currentLocation = i;
        }
        gl.bindTexture(texture.target, this.emptyTextures[texture.target].texture);
        boundTextures[i] = null;
      }
    }
  };
  TextureSystem2.prototype.ensureSamplerType = function(maxTextures) {
    var _a2 = this, boundTextures = _a2.boundTextures, hasIntegerTextures = _a2.hasIntegerTextures, CONTEXT_UID = _a2.CONTEXT_UID;
    if (!hasIntegerTextures) {
      return;
    }
    for (var i = maxTextures - 1; i >= 0; --i) {
      var tex = boundTextures[i];
      if (tex) {
        var glTexture = tex._glTextures[CONTEXT_UID];
        if (glTexture.samplerType !== SAMPLER_TYPES.FLOAT) {
          this.renderer.texture.unbind(tex);
        }
      }
    }
  };
  TextureSystem2.prototype.initTexture = function(texture) {
    var glTexture = new GLTexture(this.gl.createTexture());
    glTexture.dirtyId = -1;
    texture._glTextures[this.CONTEXT_UID] = glTexture;
    this.managedTextures.push(texture);
    texture.on("dispose", this.destroyTexture, this);
    return glTexture;
  };
  TextureSystem2.prototype.initTextureType = function(texture, glTexture) {
    var _a2, _b2;
    glTexture.internalFormat = (_b2 = (_a2 = this.internalFormats[texture.type]) === null || _a2 === void 0 ? void 0 : _a2[texture.format]) !== null && _b2 !== void 0 ? _b2 : texture.format;
    if (this.webGLVersion === 2 && texture.type === TYPES.HALF_FLOAT) {
      glTexture.type = this.gl.HALF_FLOAT;
    } else {
      glTexture.type = texture.type;
    }
  };
  TextureSystem2.prototype.updateTexture = function(texture) {
    var glTexture = texture._glTextures[this.CONTEXT_UID];
    if (!glTexture) {
      return;
    }
    var renderer = this.renderer;
    this.initTextureType(texture, glTexture);
    if (texture.resource && texture.resource.upload(renderer, texture, glTexture)) {
      if (glTexture.samplerType !== SAMPLER_TYPES.FLOAT) {
        this.hasIntegerTextures = true;
      }
    } else {
      var width = texture.realWidth;
      var height = texture.realHeight;
      var gl = renderer.gl;
      if (glTexture.width !== width || glTexture.height !== height || glTexture.dirtyId < 0) {
        glTexture.width = width;
        glTexture.height = height;
        gl.texImage2D(texture.target, 0, glTexture.internalFormat, width, height, 0, texture.format, glTexture.type, null);
      }
    }
    if (texture.dirtyStyleId !== glTexture.dirtyStyleId) {
      this.updateTextureStyle(texture);
    }
    glTexture.dirtyId = texture.dirtyId;
  };
  TextureSystem2.prototype.destroyTexture = function(texture, skipRemove) {
    var gl = this.gl;
    texture = texture.castToBaseTexture();
    if (texture._glTextures[this.CONTEXT_UID]) {
      this.unbind(texture);
      gl.deleteTexture(texture._glTextures[this.CONTEXT_UID].texture);
      texture.off("dispose", this.destroyTexture, this);
      delete texture._glTextures[this.CONTEXT_UID];
      if (!skipRemove) {
        var i = this.managedTextures.indexOf(texture);
        if (i !== -1) {
          removeItems(this.managedTextures, i, 1);
        }
      }
    }
  };
  TextureSystem2.prototype.updateTextureStyle = function(texture) {
    var glTexture = texture._glTextures[this.CONTEXT_UID];
    if (!glTexture) {
      return;
    }
    if ((texture.mipmap === MIPMAP_MODES.POW2 || this.webGLVersion !== 2) && !texture.isPowerOfTwo) {
      glTexture.mipmap = false;
    } else {
      glTexture.mipmap = texture.mipmap >= 1;
    }
    if (this.webGLVersion !== 2 && !texture.isPowerOfTwo) {
      glTexture.wrapMode = WRAP_MODES.CLAMP;
    } else {
      glTexture.wrapMode = texture.wrapMode;
    }
    if (texture.resource && texture.resource.style(this.renderer, texture, glTexture))
      ;
    else {
      this.setStyle(texture, glTexture);
    }
    glTexture.dirtyStyleId = texture.dirtyStyleId;
  };
  TextureSystem2.prototype.setStyle = function(texture, glTexture) {
    var gl = this.gl;
    if (glTexture.mipmap && texture.mipmap !== MIPMAP_MODES.ON_MANUAL) {
      gl.generateMipmap(texture.target);
    }
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, glTexture.wrapMode);
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, glTexture.wrapMode);
    if (glTexture.mipmap) {
      gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === SCALE_MODES.LINEAR ? gl.LINEAR_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
      var anisotropicExt = this.renderer.context.extensions.anisotropicFiltering;
      if (anisotropicExt && texture.anisotropicLevel > 0 && texture.scaleMode === SCALE_MODES.LINEAR) {
        var level = Math.min(texture.anisotropicLevel, gl.getParameter(anisotropicExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT));
        gl.texParameterf(texture.target, anisotropicExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
      }
    } else {
      gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, texture.scaleMode === SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
    }
    gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, texture.scaleMode === SCALE_MODES.LINEAR ? gl.LINEAR : gl.NEAREST);
  };
  TextureSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  return TextureSystem2;
}();
var _systems = {
  __proto__: null,
  FilterSystem,
  BatchSystem,
  ContextSystem,
  FramebufferSystem,
  GeometrySystem,
  MaskSystem,
  ScissorSystem,
  StencilSystem,
  ProjectionSystem,
  RenderTextureSystem,
  ShaderSystem,
  StateSystem,
  TextureGCSystem,
  TextureSystem
};
var tempMatrix = new Matrix();
var AbstractRenderer = function(_super) {
  __extends$i(AbstractRenderer2, _super);
  function AbstractRenderer2(type, options) {
    if (type === void 0) {
      type = RENDERER_TYPE.UNKNOWN;
    }
    var _this = _super.call(this) || this;
    options = Object.assign({}, settings.RENDER_OPTIONS, options);
    _this.options = options;
    _this.type = type;
    _this.screen = new Rectangle(0, 0, options.width, options.height);
    _this.view = options.view || settings.ADAPTER.createCanvas();
    _this.resolution = options.resolution || settings.RESOLUTION;
    _this.useContextAlpha = options.useContextAlpha;
    _this.autoDensity = !!options.autoDensity;
    _this.preserveDrawingBuffer = options.preserveDrawingBuffer;
    _this.clearBeforeRender = options.clearBeforeRender;
    _this._backgroundColor = 0;
    _this._backgroundColorRgba = [0, 0, 0, 1];
    _this._backgroundColorString = "#000000";
    _this.backgroundColor = options.backgroundColor || _this._backgroundColor;
    _this.backgroundAlpha = options.backgroundAlpha;
    if (options.transparent !== void 0) {
      deprecation("6.0.0", "Option transparent is deprecated, please use backgroundAlpha instead.");
      _this.useContextAlpha = options.transparent;
      _this.backgroundAlpha = options.transparent ? 0 : 1;
    }
    _this._lastObjectRendered = null;
    _this.plugins = {};
    return _this;
  }
  AbstractRenderer2.prototype.initPlugins = function(staticMap) {
    for (var o in staticMap) {
      this.plugins[o] = new staticMap[o](this);
    }
  };
  Object.defineProperty(AbstractRenderer2.prototype, "width", {
    get: function() {
      return this.view.width;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AbstractRenderer2.prototype, "height", {
    get: function() {
      return this.view.height;
    },
    enumerable: false,
    configurable: true
  });
  AbstractRenderer2.prototype.resize = function(desiredScreenWidth, desiredScreenHeight) {
    this.view.width = Math.round(desiredScreenWidth * this.resolution);
    this.view.height = Math.round(desiredScreenHeight * this.resolution);
    var screenWidth = this.view.width / this.resolution;
    var screenHeight = this.view.height / this.resolution;
    this.screen.width = screenWidth;
    this.screen.height = screenHeight;
    if (this.autoDensity) {
      this.view.style.width = screenWidth + "px";
      this.view.style.height = screenHeight + "px";
    }
    this.emit("resize", screenWidth, screenHeight);
  };
  AbstractRenderer2.prototype.generateTexture = function(displayObject, options, resolution, region) {
    if (options === void 0) {
      options = {};
    }
    if (typeof options === "number") {
      deprecation("6.1.0", "generateTexture options (scaleMode, resolution, region) are now object options.");
      options = { scaleMode: options, resolution, region };
    }
    var manualRegion = options.region, textureOptions = __rest(options, ["region"]);
    region = manualRegion || displayObject.getLocalBounds(null, true);
    if (region.width === 0) {
      region.width = 1;
    }
    if (region.height === 0) {
      region.height = 1;
    }
    var renderTexture = RenderTexture.create(__assign({ width: region.width, height: region.height }, textureOptions));
    tempMatrix.tx = -region.x;
    tempMatrix.ty = -region.y;
    this.render(displayObject, {
      renderTexture,
      clear: false,
      transform: tempMatrix,
      skipUpdateTransform: !!displayObject.parent
    });
    return renderTexture;
  };
  AbstractRenderer2.prototype.destroy = function(removeView) {
    for (var o in this.plugins) {
      this.plugins[o].destroy();
      this.plugins[o] = null;
    }
    if (removeView && this.view.parentNode) {
      this.view.parentNode.removeChild(this.view);
    }
    var thisAny = this;
    thisAny.plugins = null;
    thisAny.type = RENDERER_TYPE.UNKNOWN;
    thisAny.view = null;
    thisAny.screen = null;
    thisAny._tempDisplayObjectParent = null;
    thisAny.options = null;
    this._backgroundColorRgba = null;
    this._backgroundColorString = null;
    this._lastObjectRendered = null;
  };
  Object.defineProperty(AbstractRenderer2.prototype, "backgroundColor", {
    get: function() {
      return this._backgroundColor;
    },
    set: function(value) {
      this._backgroundColor = value;
      this._backgroundColorString = hex2string(value);
      hex2rgb(value, this._backgroundColorRgba);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AbstractRenderer2.prototype, "backgroundAlpha", {
    get: function() {
      return this._backgroundColorRgba[3];
    },
    set: function(value) {
      this._backgroundColorRgba[3] = value;
    },
    enumerable: false,
    configurable: true
  });
  return AbstractRenderer2;
}(EventEmitter);
var GLBuffer = function() {
  function GLBuffer2(buffer) {
    this.buffer = buffer || null;
    this.updateID = -1;
    this.byteLength = -1;
    this.refCount = 0;
  }
  return GLBuffer2;
}();
var BufferSystem = function() {
  function BufferSystem2(renderer) {
    this.renderer = renderer;
    this.managedBuffers = {};
    this.boundBufferBases = {};
  }
  BufferSystem2.prototype.destroy = function() {
    this.renderer = null;
  };
  BufferSystem2.prototype.contextChange = function() {
    this.disposeAll(true);
    this.gl = this.renderer.gl;
    this.CONTEXT_UID = this.renderer.CONTEXT_UID;
  };
  BufferSystem2.prototype.bind = function(buffer) {
    var _a2 = this, gl = _a2.gl, CONTEXT_UID = _a2.CONTEXT_UID;
    var glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
    gl.bindBuffer(buffer.type, glBuffer.buffer);
  };
  BufferSystem2.prototype.bindBufferBase = function(buffer, index2) {
    var _a2 = this, gl = _a2.gl, CONTEXT_UID = _a2.CONTEXT_UID;
    if (this.boundBufferBases[index2] !== buffer) {
      var glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
      this.boundBufferBases[index2] = buffer;
      gl.bindBufferBase(gl.UNIFORM_BUFFER, index2, glBuffer.buffer);
    }
  };
  BufferSystem2.prototype.bindBufferRange = function(buffer, index2, offset) {
    var _a2 = this, gl = _a2.gl, CONTEXT_UID = _a2.CONTEXT_UID;
    offset = offset || 0;
    var glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);
    gl.bindBufferRange(gl.UNIFORM_BUFFER, index2 || 0, glBuffer.buffer, offset * 256, 256);
  };
  BufferSystem2.prototype.update = function(buffer) {
    var _a2 = this, gl = _a2.gl, CONTEXT_UID = _a2.CONTEXT_UID;
    var glBuffer = buffer._glBuffers[CONTEXT_UID];
    if (buffer._updateID === glBuffer.updateID) {
      return;
    }
    glBuffer.updateID = buffer._updateID;
    gl.bindBuffer(buffer.type, glBuffer.buffer);
    if (glBuffer.byteLength >= buffer.data.byteLength) {
      gl.bufferSubData(buffer.type, 0, buffer.data);
    } else {
      var drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
      glBuffer.byteLength = buffer.data.byteLength;
      gl.bufferData(buffer.type, buffer.data, drawType);
    }
  };
  BufferSystem2.prototype.dispose = function(buffer, contextLost) {
    if (!this.managedBuffers[buffer.id]) {
      return;
    }
    delete this.managedBuffers[buffer.id];
    var glBuffer = buffer._glBuffers[this.CONTEXT_UID];
    var gl = this.gl;
    buffer.disposeRunner.remove(this);
    if (!glBuffer) {
      return;
    }
    if (!contextLost) {
      gl.deleteBuffer(glBuffer.buffer);
    }
    delete buffer._glBuffers[this.CONTEXT_UID];
  };
  BufferSystem2.prototype.disposeAll = function(contextLost) {
    var all = Object.keys(this.managedBuffers);
    for (var i = 0; i < all.length; i++) {
      this.dispose(this.managedBuffers[all[i]], contextLost);
    }
  };
  BufferSystem2.prototype.createGLBuffer = function(buffer) {
    var _a2 = this, CONTEXT_UID = _a2.CONTEXT_UID, gl = _a2.gl;
    buffer._glBuffers[CONTEXT_UID] = new GLBuffer(gl.createBuffer());
    this.managedBuffers[buffer.id] = buffer;
    buffer.disposeRunner.add(this);
    return buffer._glBuffers[CONTEXT_UID];
  };
  return BufferSystem2;
}();
var Renderer = function(_super) {
  __extends$i(Renderer2, _super);
  function Renderer2(options) {
    var _this = _super.call(this, RENDERER_TYPE.WEBGL, options) || this;
    options = _this.options;
    _this.gl = null;
    _this.CONTEXT_UID = 0;
    _this.runners = {
      destroy: new Runner("destroy"),
      contextChange: new Runner("contextChange"),
      reset: new Runner("reset"),
      update: new Runner("update"),
      postrender: new Runner("postrender"),
      prerender: new Runner("prerender"),
      resize: new Runner("resize")
    };
    _this.runners.contextChange.add(_this);
    _this.globalUniforms = new UniformGroup({
      projectionMatrix: new Matrix()
    }, true);
    _this.addSystem(MaskSystem, "mask").addSystem(ContextSystem, "context").addSystem(StateSystem, "state").addSystem(ShaderSystem, "shader").addSystem(TextureSystem, "texture").addSystem(BufferSystem, "buffer").addSystem(GeometrySystem, "geometry").addSystem(FramebufferSystem, "framebuffer").addSystem(ScissorSystem, "scissor").addSystem(StencilSystem, "stencil").addSystem(ProjectionSystem, "projection").addSystem(TextureGCSystem, "textureGC").addSystem(FilterSystem, "filter").addSystem(RenderTextureSystem, "renderTexture").addSystem(BatchSystem, "batch");
    _this.initPlugins(Renderer2.__plugins);
    _this.multisample = void 0;
    if (options.context) {
      _this.context.initFromContext(options.context);
    } else {
      _this.context.initFromOptions({
        alpha: !!_this.useContextAlpha,
        antialias: options.antialias,
        premultipliedAlpha: _this.useContextAlpha && _this.useContextAlpha !== "notMultiplied",
        stencil: true,
        preserveDrawingBuffer: options.preserveDrawingBuffer,
        powerPreference: _this.options.powerPreference
      });
    }
    _this.renderingToScreen = true;
    sayHello(_this.context.webGLVersion === 2 ? "WebGL 2" : "WebGL 1");
    _this.resize(_this.options.width, _this.options.height);
    return _this;
  }
  Renderer2.create = function(options) {
    if (isWebGLSupported()) {
      return new Renderer2(options);
    }
    throw new Error('WebGL unsupported in this browser, use "pixi.js-legacy" for fallback canvas2d support.');
  };
  Renderer2.prototype.contextChange = function() {
    var gl = this.gl;
    var samples;
    if (this.context.webGLVersion === 1) {
      var framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      samples = gl.getParameter(gl.SAMPLES);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    } else {
      var framebuffer = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      samples = gl.getParameter(gl.SAMPLES);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, framebuffer);
    }
    if (samples >= MSAA_QUALITY.HIGH) {
      this.multisample = MSAA_QUALITY.HIGH;
    } else if (samples >= MSAA_QUALITY.MEDIUM) {
      this.multisample = MSAA_QUALITY.MEDIUM;
    } else if (samples >= MSAA_QUALITY.LOW) {
      this.multisample = MSAA_QUALITY.LOW;
    } else {
      this.multisample = MSAA_QUALITY.NONE;
    }
  };
  Renderer2.prototype.addSystem = function(ClassRef, name) {
    var system = new ClassRef(this);
    if (this[name]) {
      throw new Error('Whoops! The name "' + name + '" is already in use');
    }
    this[name] = system;
    for (var i in this.runners) {
      this.runners[i].add(system);
    }
    return this;
  };
  Renderer2.prototype.render = function(displayObject, options) {
    var renderTexture;
    var clear;
    var transform;
    var skipUpdateTransform;
    if (options) {
      if (options instanceof RenderTexture) {
        deprecation("6.0.0", "Renderer#render arguments changed, use options instead.");
        renderTexture = options;
        clear = arguments[2];
        transform = arguments[3];
        skipUpdateTransform = arguments[4];
      } else {
        renderTexture = options.renderTexture;
        clear = options.clear;
        transform = options.transform;
        skipUpdateTransform = options.skipUpdateTransform;
      }
    }
    this.renderingToScreen = !renderTexture;
    this.runners.prerender.emit();
    this.emit("prerender");
    this.projection.transform = transform;
    if (this.context.isLost) {
      return;
    }
    if (!renderTexture) {
      this._lastObjectRendered = displayObject;
    }
    if (!skipUpdateTransform) {
      var cacheParent = displayObject.enableTempParent();
      displayObject.updateTransform();
      displayObject.disableTempParent(cacheParent);
    }
    this.renderTexture.bind(renderTexture);
    this.batch.currentRenderer.start();
    if (clear !== void 0 ? clear : this.clearBeforeRender) {
      this.renderTexture.clear();
    }
    displayObject.render(this);
    this.batch.currentRenderer.flush();
    if (renderTexture) {
      renderTexture.baseTexture.update();
    }
    this.runners.postrender.emit();
    this.projection.transform = null;
    this.emit("postrender");
  };
  Renderer2.prototype.generateTexture = function(displayObject, options, resolution, region) {
    if (options === void 0) {
      options = {};
    }
    var renderTexture = _super.prototype.generateTexture.call(this, displayObject, options, resolution, region);
    this.framebuffer.blit();
    return renderTexture;
  };
  Renderer2.prototype.resize = function(desiredScreenWidth, desiredScreenHeight) {
    _super.prototype.resize.call(this, desiredScreenWidth, desiredScreenHeight);
    this.runners.resize.emit(this.screen.height, this.screen.width);
  };
  Renderer2.prototype.reset = function() {
    this.runners.reset.emit();
    return this;
  };
  Renderer2.prototype.clear = function() {
    this.renderTexture.bind();
    this.renderTexture.clear();
  };
  Renderer2.prototype.destroy = function(removeView) {
    this.runners.destroy.emit();
    for (var r in this.runners) {
      this.runners[r].destroy();
    }
    _super.prototype.destroy.call(this, removeView);
    this.gl = null;
  };
  Object.defineProperty(Renderer2.prototype, "extract", {
    get: function() {
      deprecation("6.0.0", "Renderer#extract has been deprecated, please use Renderer#plugins.extract instead.");
      return this.plugins.extract;
    },
    enumerable: false,
    configurable: true
  });
  Renderer2.registerPlugin = function(pluginName, ctor) {
    deprecation("6.5.0", "Renderer.registerPlugin() has been deprecated, please use extensions.add() instead.");
    extensions.add({
      name: pluginName,
      type: ExtensionType.RendererPlugin,
      ref: ctor
    });
  };
  Renderer2.__plugins = {};
  return Renderer2;
}(AbstractRenderer);
extensions.handleByMap(ExtensionType.RendererPlugin, Renderer.__plugins);
function autoDetectRenderer(options) {
  return Renderer.create(options);
}
var $defaultVertex = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}";
var $defaultFilterVertex = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n    gl_Position = filterVertexPosition();\n    vTextureCoord = filterTextureCoord();\n}\n";
var defaultVertex$1 = $defaultVertex;
var defaultFilterVertex = $defaultFilterVertex;
var System = function() {
  function System2(renderer) {
    deprecation("6.1.0", "System class is deprecated, implemement ISystem interface instead.");
    this.renderer = renderer;
  }
  System2.prototype.destroy = function() {
    this.renderer = null;
  };
  return System2;
}();
var BatchDrawCall = function() {
  function BatchDrawCall2() {
    this.texArray = null;
    this.blend = 0;
    this.type = DRAW_MODES.TRIANGLES;
    this.start = 0;
    this.size = 0;
    this.data = null;
  }
  return BatchDrawCall2;
}();
var BatchTextureArray = function() {
  function BatchTextureArray2() {
    this.elements = [];
    this.ids = [];
    this.count = 0;
  }
  BatchTextureArray2.prototype.clear = function() {
    for (var i = 0; i < this.count; i++) {
      this.elements[i] = null;
    }
    this.count = 0;
  };
  return BatchTextureArray2;
}();
var ViewableBuffer = function() {
  function ViewableBuffer2(sizeOrBuffer) {
    if (typeof sizeOrBuffer === "number") {
      this.rawBinaryData = new ArrayBuffer(sizeOrBuffer);
    } else if (sizeOrBuffer instanceof Uint8Array) {
      this.rawBinaryData = sizeOrBuffer.buffer;
    } else {
      this.rawBinaryData = sizeOrBuffer;
    }
    this.uint32View = new Uint32Array(this.rawBinaryData);
    this.float32View = new Float32Array(this.rawBinaryData);
  }
  Object.defineProperty(ViewableBuffer2.prototype, "int8View", {
    get: function() {
      if (!this._int8View) {
        this._int8View = new Int8Array(this.rawBinaryData);
      }
      return this._int8View;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ViewableBuffer2.prototype, "uint8View", {
    get: function() {
      if (!this._uint8View) {
        this._uint8View = new Uint8Array(this.rawBinaryData);
      }
      return this._uint8View;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ViewableBuffer2.prototype, "int16View", {
    get: function() {
      if (!this._int16View) {
        this._int16View = new Int16Array(this.rawBinaryData);
      }
      return this._int16View;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ViewableBuffer2.prototype, "uint16View", {
    get: function() {
      if (!this._uint16View) {
        this._uint16View = new Uint16Array(this.rawBinaryData);
      }
      return this._uint16View;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ViewableBuffer2.prototype, "int32View", {
    get: function() {
      if (!this._int32View) {
        this._int32View = new Int32Array(this.rawBinaryData);
      }
      return this._int32View;
    },
    enumerable: false,
    configurable: true
  });
  ViewableBuffer2.prototype.view = function(type) {
    return this[type + "View"];
  };
  ViewableBuffer2.prototype.destroy = function() {
    this.rawBinaryData = null;
    this._int8View = null;
    this._uint8View = null;
    this._int16View = null;
    this._uint16View = null;
    this._int32View = null;
    this.uint32View = null;
    this.float32View = null;
  };
  ViewableBuffer2.sizeOf = function(type) {
    switch (type) {
      case "int8":
      case "uint8":
        return 1;
      case "int16":
      case "uint16":
        return 2;
      case "int32":
      case "uint32":
      case "float32":
        return 4;
      default:
        throw new Error(type + " isn't a valid view type");
    }
  };
  return ViewableBuffer2;
}();
var AbstractBatchRenderer = function(_super) {
  __extends$i(AbstractBatchRenderer2, _super);
  function AbstractBatchRenderer2(renderer) {
    var _this = _super.call(this, renderer) || this;
    _this.shaderGenerator = null;
    _this.geometryClass = null;
    _this.vertexSize = null;
    _this.state = State.for2d();
    _this.size = settings.SPRITE_BATCH_SIZE * 4;
    _this._vertexCount = 0;
    _this._indexCount = 0;
    _this._bufferedElements = [];
    _this._bufferedTextures = [];
    _this._bufferSize = 0;
    _this._shader = null;
    _this._packedGeometries = [];
    _this._packedGeometryPoolSize = 2;
    _this._flushId = 0;
    _this._aBuffers = {};
    _this._iBuffers = {};
    _this.MAX_TEXTURES = 1;
    _this.renderer.on("prerender", _this.onPrerender, _this);
    renderer.runners.contextChange.add(_this);
    _this._dcIndex = 0;
    _this._aIndex = 0;
    _this._iIndex = 0;
    _this._attributeBuffer = null;
    _this._indexBuffer = null;
    _this._tempBoundTextures = [];
    return _this;
  }
  AbstractBatchRenderer2.prototype.contextChange = function() {
    var gl = this.renderer.gl;
    if (settings.PREFER_ENV === ENV.WEBGL_LEGACY) {
      this.MAX_TEXTURES = 1;
    } else {
      this.MAX_TEXTURES = Math.min(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), settings.SPRITE_MAX_TEXTURES);
      this.MAX_TEXTURES = checkMaxIfStatementsInShader(this.MAX_TEXTURES, gl);
    }
    this._shader = this.shaderGenerator.generateShader(this.MAX_TEXTURES);
    for (var i = 0; i < this._packedGeometryPoolSize; i++) {
      this._packedGeometries[i] = new this.geometryClass();
    }
    this.initFlushBuffers();
  };
  AbstractBatchRenderer2.prototype.initFlushBuffers = function() {
    var _drawCallPool = AbstractBatchRenderer2._drawCallPool, _textureArrayPool = AbstractBatchRenderer2._textureArrayPool;
    var MAX_SPRITES = this.size / 4;
    var MAX_TA = Math.floor(MAX_SPRITES / this.MAX_TEXTURES) + 1;
    while (_drawCallPool.length < MAX_SPRITES) {
      _drawCallPool.push(new BatchDrawCall());
    }
    while (_textureArrayPool.length < MAX_TA) {
      _textureArrayPool.push(new BatchTextureArray());
    }
    for (var i = 0; i < this.MAX_TEXTURES; i++) {
      this._tempBoundTextures[i] = null;
    }
  };
  AbstractBatchRenderer2.prototype.onPrerender = function() {
    this._flushId = 0;
  };
  AbstractBatchRenderer2.prototype.render = function(element) {
    if (!element._texture.valid) {
      return;
    }
    if (this._vertexCount + element.vertexData.length / 2 > this.size) {
      this.flush();
    }
    this._vertexCount += element.vertexData.length / 2;
    this._indexCount += element.indices.length;
    this._bufferedTextures[this._bufferSize] = element._texture.baseTexture;
    this._bufferedElements[this._bufferSize++] = element;
  };
  AbstractBatchRenderer2.prototype.buildTexturesAndDrawCalls = function() {
    var _a2 = this, textures = _a2._bufferedTextures, MAX_TEXTURES = _a2.MAX_TEXTURES;
    var textureArrays = AbstractBatchRenderer2._textureArrayPool;
    var batch = this.renderer.batch;
    var boundTextures = this._tempBoundTextures;
    var touch = this.renderer.textureGC.count;
    var TICK = ++BaseTexture._globalBatch;
    var countTexArrays = 0;
    var texArray = textureArrays[0];
    var start = 0;
    batch.copyBoundTextures(boundTextures, MAX_TEXTURES);
    for (var i = 0; i < this._bufferSize; ++i) {
      var tex = textures[i];
      textures[i] = null;
      if (tex._batchEnabled === TICK) {
        continue;
      }
      if (texArray.count >= MAX_TEXTURES) {
        batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
        this.buildDrawCalls(texArray, start, i);
        start = i;
        texArray = textureArrays[++countTexArrays];
        ++TICK;
      }
      tex._batchEnabled = TICK;
      tex.touched = touch;
      texArray.elements[texArray.count++] = tex;
    }
    if (texArray.count > 0) {
      batch.boundArray(texArray, boundTextures, TICK, MAX_TEXTURES);
      this.buildDrawCalls(texArray, start, this._bufferSize);
      ++countTexArrays;
      ++TICK;
    }
    for (var i = 0; i < boundTextures.length; i++) {
      boundTextures[i] = null;
    }
    BaseTexture._globalBatch = TICK;
  };
  AbstractBatchRenderer2.prototype.buildDrawCalls = function(texArray, start, finish) {
    var _a2 = this, elements = _a2._bufferedElements, _attributeBuffer = _a2._attributeBuffer, _indexBuffer = _a2._indexBuffer, vertexSize = _a2.vertexSize;
    var drawCalls = AbstractBatchRenderer2._drawCallPool;
    var dcIndex = this._dcIndex;
    var aIndex = this._aIndex;
    var iIndex = this._iIndex;
    var drawCall = drawCalls[dcIndex];
    drawCall.start = this._iIndex;
    drawCall.texArray = texArray;
    for (var i = start; i < finish; ++i) {
      var sprite = elements[i];
      var tex = sprite._texture.baseTexture;
      var spriteBlendMode = premultiplyBlendMode[tex.alphaMode ? 1 : 0][sprite.blendMode];
      elements[i] = null;
      if (start < i && drawCall.blend !== spriteBlendMode) {
        drawCall.size = iIndex - drawCall.start;
        start = i;
        drawCall = drawCalls[++dcIndex];
        drawCall.texArray = texArray;
        drawCall.start = iIndex;
      }
      this.packInterleavedGeometry(sprite, _attributeBuffer, _indexBuffer, aIndex, iIndex);
      aIndex += sprite.vertexData.length / 2 * vertexSize;
      iIndex += sprite.indices.length;
      drawCall.blend = spriteBlendMode;
    }
    if (start < finish) {
      drawCall.size = iIndex - drawCall.start;
      ++dcIndex;
    }
    this._dcIndex = dcIndex;
    this._aIndex = aIndex;
    this._iIndex = iIndex;
  };
  AbstractBatchRenderer2.prototype.bindAndClearTexArray = function(texArray) {
    var textureSystem = this.renderer.texture;
    for (var j = 0; j < texArray.count; j++) {
      textureSystem.bind(texArray.elements[j], texArray.ids[j]);
      texArray.elements[j] = null;
    }
    texArray.count = 0;
  };
  AbstractBatchRenderer2.prototype.updateGeometry = function() {
    var _a2 = this, packedGeometries = _a2._packedGeometries, attributeBuffer = _a2._attributeBuffer, indexBuffer = _a2._indexBuffer;
    if (!settings.CAN_UPLOAD_SAME_BUFFER) {
      if (this._packedGeometryPoolSize <= this._flushId) {
        this._packedGeometryPoolSize++;
        packedGeometries[this._flushId] = new this.geometryClass();
      }
      packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
      packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);
      this.renderer.geometry.bind(packedGeometries[this._flushId]);
      this.renderer.geometry.updateBuffers();
      this._flushId++;
    } else {
      packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
      packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);
      this.renderer.geometry.updateBuffers();
    }
  };
  AbstractBatchRenderer2.prototype.drawBatches = function() {
    var dcCount = this._dcIndex;
    var _a2 = this.renderer, gl = _a2.gl, stateSystem = _a2.state;
    var drawCalls = AbstractBatchRenderer2._drawCallPool;
    var curTexArray = null;
    for (var i = 0; i < dcCount; i++) {
      var _b2 = drawCalls[i], texArray = _b2.texArray, type = _b2.type, size = _b2.size, start = _b2.start, blend = _b2.blend;
      if (curTexArray !== texArray) {
        curTexArray = texArray;
        this.bindAndClearTexArray(texArray);
      }
      this.state.blendMode = blend;
      stateSystem.set(this.state);
      gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
    }
  };
  AbstractBatchRenderer2.prototype.flush = function() {
    if (this._vertexCount === 0) {
      return;
    }
    this._attributeBuffer = this.getAttributeBuffer(this._vertexCount);
    this._indexBuffer = this.getIndexBuffer(this._indexCount);
    this._aIndex = 0;
    this._iIndex = 0;
    this._dcIndex = 0;
    this.buildTexturesAndDrawCalls();
    this.updateGeometry();
    this.drawBatches();
    this._bufferSize = 0;
    this._vertexCount = 0;
    this._indexCount = 0;
  };
  AbstractBatchRenderer2.prototype.start = function() {
    this.renderer.state.set(this.state);
    this.renderer.texture.ensureSamplerType(this.MAX_TEXTURES);
    this.renderer.shader.bind(this._shader);
    if (settings.CAN_UPLOAD_SAME_BUFFER) {
      this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
    }
  };
  AbstractBatchRenderer2.prototype.stop = function() {
    this.flush();
  };
  AbstractBatchRenderer2.prototype.destroy = function() {
    for (var i = 0; i < this._packedGeometryPoolSize; i++) {
      if (this._packedGeometries[i]) {
        this._packedGeometries[i].destroy();
      }
    }
    this.renderer.off("prerender", this.onPrerender, this);
    this._aBuffers = null;
    this._iBuffers = null;
    this._packedGeometries = null;
    this._attributeBuffer = null;
    this._indexBuffer = null;
    if (this._shader) {
      this._shader.destroy();
      this._shader = null;
    }
    _super.prototype.destroy.call(this);
  };
  AbstractBatchRenderer2.prototype.getAttributeBuffer = function(size) {
    var roundedP2 = nextPow2(Math.ceil(size / 8));
    var roundedSizeIndex = log2(roundedP2);
    var roundedSize = roundedP2 * 8;
    if (this._aBuffers.length <= roundedSizeIndex) {
      this._iBuffers.length = roundedSizeIndex + 1;
    }
    var buffer = this._aBuffers[roundedSize];
    if (!buffer) {
      this._aBuffers[roundedSize] = buffer = new ViewableBuffer(roundedSize * this.vertexSize * 4);
    }
    return buffer;
  };
  AbstractBatchRenderer2.prototype.getIndexBuffer = function(size) {
    var roundedP2 = nextPow2(Math.ceil(size / 12));
    var roundedSizeIndex = log2(roundedP2);
    var roundedSize = roundedP2 * 12;
    if (this._iBuffers.length <= roundedSizeIndex) {
      this._iBuffers.length = roundedSizeIndex + 1;
    }
    var buffer = this._iBuffers[roundedSizeIndex];
    if (!buffer) {
      this._iBuffers[roundedSizeIndex] = buffer = new Uint16Array(roundedSize);
    }
    return buffer;
  };
  AbstractBatchRenderer2.prototype.packInterleavedGeometry = function(element, attributeBuffer, indexBuffer, aIndex, iIndex) {
    var uint32View = attributeBuffer.uint32View, float32View = attributeBuffer.float32View;
    var packedVertices = aIndex / this.vertexSize;
    var uvs = element.uvs;
    var indicies = element.indices;
    var vertexData = element.vertexData;
    var textureId = element._texture.baseTexture._batchLocation;
    var alpha = Math.min(element.worldAlpha, 1);
    var argb = alpha < 1 && element._texture.baseTexture.alphaMode ? premultiplyTint(element._tintRGB, alpha) : element._tintRGB + (alpha * 255 << 24);
    for (var i = 0; i < vertexData.length; i += 2) {
      float32View[aIndex++] = vertexData[i];
      float32View[aIndex++] = vertexData[i + 1];
      float32View[aIndex++] = uvs[i];
      float32View[aIndex++] = uvs[i + 1];
      uint32View[aIndex++] = argb;
      float32View[aIndex++] = textureId;
    }
    for (var i = 0; i < indicies.length; i++) {
      indexBuffer[iIndex++] = packedVertices + indicies[i];
    }
  };
  AbstractBatchRenderer2._drawCallPool = [];
  AbstractBatchRenderer2._textureArrayPool = [];
  return AbstractBatchRenderer2;
}(ObjectRenderer);
var BatchShaderGenerator = function() {
  function BatchShaderGenerator2(vertexSrc, fragTemplate2) {
    this.vertexSrc = vertexSrc;
    this.fragTemplate = fragTemplate2;
    this.programCache = {};
    this.defaultGroupCache = {};
    if (fragTemplate2.indexOf("%count%") < 0) {
      throw new Error('Fragment template must contain "%count%".');
    }
    if (fragTemplate2.indexOf("%forloop%") < 0) {
      throw new Error('Fragment template must contain "%forloop%".');
    }
  }
  BatchShaderGenerator2.prototype.generateShader = function(maxTextures) {
    if (!this.programCache[maxTextures]) {
      var sampleValues = new Int32Array(maxTextures);
      for (var i = 0; i < maxTextures; i++) {
        sampleValues[i] = i;
      }
      this.defaultGroupCache[maxTextures] = UniformGroup.from({ uSamplers: sampleValues }, true);
      var fragmentSrc = this.fragTemplate;
      fragmentSrc = fragmentSrc.replace(/%count%/gi, "" + maxTextures);
      fragmentSrc = fragmentSrc.replace(/%forloop%/gi, this.generateSampleSrc(maxTextures));
      this.programCache[maxTextures] = new Program(this.vertexSrc, fragmentSrc);
    }
    var uniforms = {
      tint: new Float32Array([1, 1, 1, 1]),
      translationMatrix: new Matrix(),
      default: this.defaultGroupCache[maxTextures]
    };
    return new Shader(this.programCache[maxTextures], uniforms);
  };
  BatchShaderGenerator2.prototype.generateSampleSrc = function(maxTextures) {
    var src = "";
    src += "\n";
    src += "\n";
    for (var i = 0; i < maxTextures; i++) {
      if (i > 0) {
        src += "\nelse ";
      }
      if (i < maxTextures - 1) {
        src += "if(vTextureId < " + i + ".5)";
      }
      src += "\n{";
      src += "\n	color = texture2D(uSamplers[" + i + "], vTextureCoord);";
      src += "\n}";
    }
    src += "\n";
    src += "\n";
    return src;
  };
  return BatchShaderGenerator2;
}();
var BatchGeometry = function(_super) {
  __extends$i(BatchGeometry2, _super);
  function BatchGeometry2(_static) {
    if (_static === void 0) {
      _static = false;
    }
    var _this = _super.call(this) || this;
    _this._buffer = new Buffer2(null, _static, false);
    _this._indexBuffer = new Buffer2(null, _static, true);
    _this.addAttribute("aVertexPosition", _this._buffer, 2, false, TYPES.FLOAT).addAttribute("aTextureCoord", _this._buffer, 2, false, TYPES.FLOAT).addAttribute("aColor", _this._buffer, 4, true, TYPES.UNSIGNED_BYTE).addAttribute("aTextureId", _this._buffer, 1, true, TYPES.FLOAT).addIndex(_this._indexBuffer);
    return _this;
  }
  return BatchGeometry2;
}(Geometry);
var defaultVertex = "precision highp float;\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\nattribute float aTextureId;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform vec4 tint;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\n\nvoid main(void){\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vTextureId = aTextureId;\n    vColor = aColor * tint;\n}\n";
var defaultFragment = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\nvarying float vTextureId;\nuniform sampler2D uSamplers[%count%];\n\nvoid main(void){\n    vec4 color;\n    %forloop%\n    gl_FragColor = color * vColor;\n}\n";
var BatchPluginFactory = function() {
  function BatchPluginFactory2() {
  }
  BatchPluginFactory2.create = function(options) {
    var _a2 = Object.assign({
      vertex: defaultVertex,
      fragment: defaultFragment,
      geometryClass: BatchGeometry,
      vertexSize: 6
    }, options), vertex2 = _a2.vertex, fragment2 = _a2.fragment, vertexSize = _a2.vertexSize, geometryClass = _a2.geometryClass;
    return function(_super) {
      __extends$i(BatchPlugin, _super);
      function BatchPlugin(renderer) {
        var _this = _super.call(this, renderer) || this;
        _this.shaderGenerator = new BatchShaderGenerator(vertex2, fragment2);
        _this.geometryClass = geometryClass;
        _this.vertexSize = vertexSize;
        return _this;
      }
      return BatchPlugin;
    }(AbstractBatchRenderer);
  };
  Object.defineProperty(BatchPluginFactory2, "defaultVertexSrc", {
    get: function() {
      return defaultVertex;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BatchPluginFactory2, "defaultFragmentTemplate", {
    get: function() {
      return defaultFragment;
    },
    enumerable: false,
    configurable: true
  });
  return BatchPluginFactory2;
}();
var BatchRenderer = BatchPluginFactory.create();
Object.assign(BatchRenderer, {
  extension: {
    name: "batch",
    type: ExtensionType.RendererPlugin
  }
});
var resources = {};
var _loop_1 = function(name) {
  Object.defineProperty(resources, name, {
    get: function() {
      deprecation("6.0.0", "PIXI.systems." + name + " has moved to PIXI." + name);
      return _resources[name];
    }
  });
};
for (var name in _resources) {
  _loop_1(name);
}
var systems = {};
var _loop_2 = function(name) {
  Object.defineProperty(systems, name, {
    get: function() {
      deprecation("6.0.0", "PIXI.resources." + name + " has moved to PIXI." + name);
      return _systems[name];
    }
  });
};
for (var name in _systems) {
  _loop_2(name);
}
var VERSION = "6.5.8";
var accessibleTarget = {
  accessible: false,
  accessibleTitle: null,
  accessibleHint: null,
  tabIndex: 0,
  _accessibleActive: false,
  _accessibleDiv: null,
  accessibleType: "button",
  accessiblePointerEvents: "auto",
  accessibleChildren: true,
  renderId: -1
};
DisplayObject.mixin(accessibleTarget);
var KEY_CODE_TAB = 9;
var DIV_TOUCH_SIZE = 100;
var DIV_TOUCH_POS_X = 0;
var DIV_TOUCH_POS_Y = 0;
var DIV_TOUCH_ZINDEX = 2;
var DIV_HOOK_SIZE = 1;
var DIV_HOOK_POS_X = -1e3;
var DIV_HOOK_POS_Y = -1e3;
var DIV_HOOK_ZINDEX = 2;
var AccessibilityManager = function() {
  function AccessibilityManager2(renderer) {
    this.debug = false;
    this._isActive = false;
    this._isMobileAccessibility = false;
    this.pool = [];
    this.renderId = 0;
    this.children = [];
    this.androidUpdateCount = 0;
    this.androidUpdateFrequency = 500;
    this._hookDiv = null;
    if (isMobile.tablet || isMobile.phone) {
      this.createTouchHook();
    }
    var div = document.createElement("div");
    div.style.width = DIV_TOUCH_SIZE + "px";
    div.style.height = DIV_TOUCH_SIZE + "px";
    div.style.position = "absolute";
    div.style.top = DIV_TOUCH_POS_X + "px";
    div.style.left = DIV_TOUCH_POS_Y + "px";
    div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
    this.div = div;
    this.renderer = renderer;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    globalThis.addEventListener("keydown", this._onKeyDown, false);
  }
  Object.defineProperty(AccessibilityManager2.prototype, "isActive", {
    get: function() {
      return this._isActive;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AccessibilityManager2.prototype, "isMobileAccessibility", {
    get: function() {
      return this._isMobileAccessibility;
    },
    enumerable: false,
    configurable: true
  });
  AccessibilityManager2.prototype.createTouchHook = function() {
    var _this = this;
    var hookDiv = document.createElement("button");
    hookDiv.style.width = DIV_HOOK_SIZE + "px";
    hookDiv.style.height = DIV_HOOK_SIZE + "px";
    hookDiv.style.position = "absolute";
    hookDiv.style.top = DIV_HOOK_POS_X + "px";
    hookDiv.style.left = DIV_HOOK_POS_Y + "px";
    hookDiv.style.zIndex = DIV_HOOK_ZINDEX.toString();
    hookDiv.style.backgroundColor = "#FF0000";
    hookDiv.title = "select to enable accessibility for this content";
    hookDiv.addEventListener("focus", function() {
      _this._isMobileAccessibility = true;
      _this.activate();
      _this.destroyTouchHook();
    });
    document.body.appendChild(hookDiv);
    this._hookDiv = hookDiv;
  };
  AccessibilityManager2.prototype.destroyTouchHook = function() {
    if (!this._hookDiv) {
      return;
    }
    document.body.removeChild(this._hookDiv);
    this._hookDiv = null;
  };
  AccessibilityManager2.prototype.activate = function() {
    var _a2;
    if (this._isActive) {
      return;
    }
    this._isActive = true;
    globalThis.document.addEventListener("mousemove", this._onMouseMove, true);
    globalThis.removeEventListener("keydown", this._onKeyDown, false);
    this.renderer.on("postrender", this.update, this);
    (_a2 = this.renderer.view.parentNode) === null || _a2 === void 0 ? void 0 : _a2.appendChild(this.div);
  };
  AccessibilityManager2.prototype.deactivate = function() {
    var _a2;
    if (!this._isActive || this._isMobileAccessibility) {
      return;
    }
    this._isActive = false;
    globalThis.document.removeEventListener("mousemove", this._onMouseMove, true);
    globalThis.addEventListener("keydown", this._onKeyDown, false);
    this.renderer.off("postrender", this.update);
    (_a2 = this.div.parentNode) === null || _a2 === void 0 ? void 0 : _a2.removeChild(this.div);
  };
  AccessibilityManager2.prototype.updateAccessibleObjects = function(displayObject) {
    if (!displayObject.visible || !displayObject.accessibleChildren) {
      return;
    }
    if (displayObject.accessible && displayObject.interactive) {
      if (!displayObject._accessibleActive) {
        this.addChild(displayObject);
      }
      displayObject.renderId = this.renderId;
    }
    var children = displayObject.children;
    if (children) {
      for (var i = 0; i < children.length; i++) {
        this.updateAccessibleObjects(children[i]);
      }
    }
  };
  AccessibilityManager2.prototype.update = function() {
    var now = performance.now();
    if (isMobile.android.device && now < this.androidUpdateCount) {
      return;
    }
    this.androidUpdateCount = now + this.androidUpdateFrequency;
    if (!this.renderer.renderingToScreen) {
      return;
    }
    if (this.renderer._lastObjectRendered) {
      this.updateAccessibleObjects(this.renderer._lastObjectRendered);
    }
    var _a2 = this.renderer.view.getBoundingClientRect(), left = _a2.left, top = _a2.top, width = _a2.width, height = _a2.height;
    var _b2 = this.renderer, viewWidth = _b2.width, viewHeight = _b2.height, resolution = _b2.resolution;
    var sx = width / viewWidth * resolution;
    var sy = height / viewHeight * resolution;
    var div = this.div;
    div.style.left = left + "px";
    div.style.top = top + "px";
    div.style.width = viewWidth + "px";
    div.style.height = viewHeight + "px";
    for (var i = 0; i < this.children.length; i++) {
      var child = this.children[i];
      if (child.renderId !== this.renderId) {
        child._accessibleActive = false;
        removeItems(this.children, i, 1);
        this.div.removeChild(child._accessibleDiv);
        this.pool.push(child._accessibleDiv);
        child._accessibleDiv = null;
        i--;
      } else {
        div = child._accessibleDiv;
        var hitArea = child.hitArea;
        var wt = child.worldTransform;
        if (child.hitArea) {
          div.style.left = (wt.tx + hitArea.x * wt.a) * sx + "px";
          div.style.top = (wt.ty + hitArea.y * wt.d) * sy + "px";
          div.style.width = hitArea.width * wt.a * sx + "px";
          div.style.height = hitArea.height * wt.d * sy + "px";
        } else {
          hitArea = child.getBounds();
          this.capHitArea(hitArea);
          div.style.left = hitArea.x * sx + "px";
          div.style.top = hitArea.y * sy + "px";
          div.style.width = hitArea.width * sx + "px";
          div.style.height = hitArea.height * sy + "px";
          if (div.title !== child.accessibleTitle && child.accessibleTitle !== null) {
            div.title = child.accessibleTitle;
          }
          if (div.getAttribute("aria-label") !== child.accessibleHint && child.accessibleHint !== null) {
            div.setAttribute("aria-label", child.accessibleHint);
          }
        }
        if (child.accessibleTitle !== div.title || child.tabIndex !== div.tabIndex) {
          div.title = child.accessibleTitle;
          div.tabIndex = child.tabIndex;
          if (this.debug) {
            this.updateDebugHTML(div);
          }
        }
      }
    }
    this.renderId++;
  };
  AccessibilityManager2.prototype.updateDebugHTML = function(div) {
    div.innerHTML = "type: " + div.type + "</br> title : " + div.title + "</br> tabIndex: " + div.tabIndex;
  };
  AccessibilityManager2.prototype.capHitArea = function(hitArea) {
    if (hitArea.x < 0) {
      hitArea.width += hitArea.x;
      hitArea.x = 0;
    }
    if (hitArea.y < 0) {
      hitArea.height += hitArea.y;
      hitArea.y = 0;
    }
    var _a2 = this.renderer, viewWidth = _a2.width, viewHeight = _a2.height;
    if (hitArea.x + hitArea.width > viewWidth) {
      hitArea.width = viewWidth - hitArea.x;
    }
    if (hitArea.y + hitArea.height > viewHeight) {
      hitArea.height = viewHeight - hitArea.y;
    }
  };
  AccessibilityManager2.prototype.addChild = function(displayObject) {
    var div = this.pool.pop();
    if (!div) {
      div = document.createElement("button");
      div.style.width = DIV_TOUCH_SIZE + "px";
      div.style.height = DIV_TOUCH_SIZE + "px";
      div.style.backgroundColor = this.debug ? "rgba(255,255,255,0.5)" : "transparent";
      div.style.position = "absolute";
      div.style.zIndex = DIV_TOUCH_ZINDEX.toString();
      div.style.borderStyle = "none";
      if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
        div.setAttribute("aria-live", "off");
      } else {
        div.setAttribute("aria-live", "polite");
      }
      if (navigator.userAgent.match(/rv:.*Gecko\//)) {
        div.setAttribute("aria-relevant", "additions");
      } else {
        div.setAttribute("aria-relevant", "text");
      }
      div.addEventListener("click", this._onClick.bind(this));
      div.addEventListener("focus", this._onFocus.bind(this));
      div.addEventListener("focusout", this._onFocusOut.bind(this));
    }
    div.style.pointerEvents = displayObject.accessiblePointerEvents;
    div.type = displayObject.accessibleType;
    if (displayObject.accessibleTitle && displayObject.accessibleTitle !== null) {
      div.title = displayObject.accessibleTitle;
    } else if (!displayObject.accessibleHint || displayObject.accessibleHint === null) {
      div.title = "displayObject " + displayObject.tabIndex;
    }
    if (displayObject.accessibleHint && displayObject.accessibleHint !== null) {
      div.setAttribute("aria-label", displayObject.accessibleHint);
    }
    if (this.debug) {
      this.updateDebugHTML(div);
    }
    displayObject._accessibleActive = true;
    displayObject._accessibleDiv = div;
    div.displayObject = displayObject;
    this.children.push(displayObject);
    this.div.appendChild(displayObject._accessibleDiv);
    displayObject._accessibleDiv.tabIndex = displayObject.tabIndex;
  };
  AccessibilityManager2.prototype._onClick = function(e) {
    var interactionManager = this.renderer.plugins.interaction;
    var displayObject = e.target.displayObject;
    var eventData = interactionManager.eventData;
    interactionManager.dispatchEvent(displayObject, "click", eventData);
    interactionManager.dispatchEvent(displayObject, "pointertap", eventData);
    interactionManager.dispatchEvent(displayObject, "tap", eventData);
  };
  AccessibilityManager2.prototype._onFocus = function(e) {
    if (!e.target.getAttribute("aria-live")) {
      e.target.setAttribute("aria-live", "assertive");
    }
    var interactionManager = this.renderer.plugins.interaction;
    var displayObject = e.target.displayObject;
    var eventData = interactionManager.eventData;
    interactionManager.dispatchEvent(displayObject, "mouseover", eventData);
  };
  AccessibilityManager2.prototype._onFocusOut = function(e) {
    if (!e.target.getAttribute("aria-live")) {
      e.target.setAttribute("aria-live", "polite");
    }
    var interactionManager = this.renderer.plugins.interaction;
    var displayObject = e.target.displayObject;
    var eventData = interactionManager.eventData;
    interactionManager.dispatchEvent(displayObject, "mouseout", eventData);
  };
  AccessibilityManager2.prototype._onKeyDown = function(e) {
    if (e.keyCode !== KEY_CODE_TAB) {
      return;
    }
    this.activate();
  };
  AccessibilityManager2.prototype._onMouseMove = function(e) {
    if (e.movementX === 0 && e.movementY === 0) {
      return;
    }
    this.deactivate();
  };
  AccessibilityManager2.prototype.destroy = function() {
    this.destroyTouchHook();
    this.div = null;
    globalThis.document.removeEventListener("mousemove", this._onMouseMove, true);
    globalThis.removeEventListener("keydown", this._onKeyDown);
    this.pool = null;
    this.children = null;
    this.renderer = null;
  };
  AccessibilityManager2.extension = {
    name: "accessibility",
    type: [
      ExtensionType.RendererPlugin,
      ExtensionType.CanvasRendererPlugin
    ]
  };
  return AccessibilityManager2;
}();
var InteractionData = function() {
  function InteractionData2() {
    this.pressure = 0;
    this.rotationAngle = 0;
    this.twist = 0;
    this.tangentialPressure = 0;
    this.global = new Point();
    this.target = null;
    this.originalEvent = null;
    this.identifier = null;
    this.isPrimary = false;
    this.button = 0;
    this.buttons = 0;
    this.width = 0;
    this.height = 0;
    this.tiltX = 0;
    this.tiltY = 0;
    this.pointerType = null;
    this.pressure = 0;
    this.rotationAngle = 0;
    this.twist = 0;
    this.tangentialPressure = 0;
  }
  Object.defineProperty(InteractionData2.prototype, "pointerId", {
    get: function() {
      return this.identifier;
    },
    enumerable: false,
    configurable: true
  });
  InteractionData2.prototype.getLocalPosition = function(displayObject, point, globalPos) {
    return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
  };
  InteractionData2.prototype.copyEvent = function(event) {
    if ("isPrimary" in event && event.isPrimary) {
      this.isPrimary = true;
    }
    this.button = "button" in event && event.button;
    var buttons = "buttons" in event && event.buttons;
    this.buttons = Number.isInteger(buttons) ? buttons : "which" in event && event.which;
    this.width = "width" in event && event.width;
    this.height = "height" in event && event.height;
    this.tiltX = "tiltX" in event && event.tiltX;
    this.tiltY = "tiltY" in event && event.tiltY;
    this.pointerType = "pointerType" in event && event.pointerType;
    this.pressure = "pressure" in event && event.pressure;
    this.rotationAngle = "rotationAngle" in event && event.rotationAngle;
    this.twist = "twist" in event && event.twist || 0;
    this.tangentialPressure = "tangentialPressure" in event && event.tangentialPressure || 0;
  };
  InteractionData2.prototype.reset = function() {
    this.isPrimary = false;
  };
  return InteractionData2;
}();
var extendStatics$h = function(d, b) {
  extendStatics$h = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$h(d, b);
};
function __extends$h(d, b) {
  extendStatics$h(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var InteractionEvent = function() {
  function InteractionEvent2() {
    this.stopped = false;
    this.stopsPropagatingAt = null;
    this.stopPropagationHint = false;
    this.target = null;
    this.currentTarget = null;
    this.type = null;
    this.data = null;
  }
  InteractionEvent2.prototype.stopPropagation = function() {
    this.stopped = true;
    this.stopPropagationHint = true;
    this.stopsPropagatingAt = this.currentTarget;
  };
  InteractionEvent2.prototype.reset = function() {
    this.stopped = false;
    this.stopsPropagatingAt = null;
    this.stopPropagationHint = false;
    this.currentTarget = null;
    this.target = null;
  };
  return InteractionEvent2;
}();
var InteractionTrackingData = function() {
  function InteractionTrackingData2(pointerId) {
    this._pointerId = pointerId;
    this._flags = InteractionTrackingData2.FLAGS.NONE;
  }
  InteractionTrackingData2.prototype._doSet = function(flag, yn) {
    if (yn) {
      this._flags = this._flags | flag;
    } else {
      this._flags = this._flags & ~flag;
    }
  };
  Object.defineProperty(InteractionTrackingData2.prototype, "pointerId", {
    get: function() {
      return this._pointerId;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(InteractionTrackingData2.prototype, "flags", {
    get: function() {
      return this._flags;
    },
    set: function(flags) {
      this._flags = flags;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(InteractionTrackingData2.prototype, "none", {
    get: function() {
      return this._flags === InteractionTrackingData2.FLAGS.NONE;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(InteractionTrackingData2.prototype, "over", {
    get: function() {
      return (this._flags & InteractionTrackingData2.FLAGS.OVER) !== 0;
    },
    set: function(yn) {
      this._doSet(InteractionTrackingData2.FLAGS.OVER, yn);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(InteractionTrackingData2.prototype, "rightDown", {
    get: function() {
      return (this._flags & InteractionTrackingData2.FLAGS.RIGHT_DOWN) !== 0;
    },
    set: function(yn) {
      this._doSet(InteractionTrackingData2.FLAGS.RIGHT_DOWN, yn);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(InteractionTrackingData2.prototype, "leftDown", {
    get: function() {
      return (this._flags & InteractionTrackingData2.FLAGS.LEFT_DOWN) !== 0;
    },
    set: function(yn) {
      this._doSet(InteractionTrackingData2.FLAGS.LEFT_DOWN, yn);
    },
    enumerable: false,
    configurable: true
  });
  InteractionTrackingData2.FLAGS = Object.freeze({
    NONE: 0,
    OVER: 1 << 0,
    LEFT_DOWN: 1 << 1,
    RIGHT_DOWN: 1 << 2
  });
  return InteractionTrackingData2;
}();
var TreeSearch = function() {
  function TreeSearch2() {
    this._tempPoint = new Point();
  }
  TreeSearch2.prototype.recursiveFindHit = function(interactionEvent, displayObject, func, hitTest, interactive) {
    var _a2;
    if (!displayObject || !displayObject.visible) {
      return false;
    }
    var point = interactionEvent.data.global;
    interactive = displayObject.interactive || interactive;
    var hit = false;
    var interactiveParent = interactive;
    var hitTestChildren = true;
    if (displayObject.hitArea) {
      if (hitTest) {
        displayObject.worldTransform.applyInverse(point, this._tempPoint);
        if (!displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
          hitTest = false;
          hitTestChildren = false;
        } else {
          hit = true;
        }
      }
      interactiveParent = false;
    } else if (displayObject._mask) {
      if (hitTest) {
        var maskObject = displayObject._mask.isMaskData ? displayObject._mask.maskObject : displayObject._mask;
        if (maskObject && !((_a2 = maskObject.containsPoint) === null || _a2 === void 0 ? void 0 : _a2.call(maskObject, point))) {
          hitTest = false;
        }
      }
    }
    if (hitTestChildren && displayObject.interactiveChildren && displayObject.children) {
      var children = displayObject.children;
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        var childHit = this.recursiveFindHit(interactionEvent, child, func, hitTest, interactiveParent);
        if (childHit) {
          if (!child.parent) {
            continue;
          }
          interactiveParent = false;
          if (childHit) {
            if (interactionEvent.target) {
              hitTest = false;
            }
            hit = true;
          }
        }
      }
    }
    if (interactive) {
      if (hitTest && !interactionEvent.target) {
        if (!displayObject.hitArea && displayObject.containsPoint) {
          if (displayObject.containsPoint(point)) {
            hit = true;
          }
        }
      }
      if (displayObject.interactive) {
        if (hit && !interactionEvent.target) {
          interactionEvent.target = displayObject;
        }
        if (func) {
          func(interactionEvent, displayObject, !!hit);
        }
      }
    }
    return hit;
  };
  TreeSearch2.prototype.findHit = function(interactionEvent, displayObject, func, hitTest) {
    this.recursiveFindHit(interactionEvent, displayObject, func, hitTest, false);
  };
  return TreeSearch2;
}();
var interactiveTarget = {
  interactive: false,
  interactiveChildren: true,
  hitArea: null,
  get buttonMode() {
    return this.cursor === "pointer";
  },
  set buttonMode(value) {
    if (value) {
      this.cursor = "pointer";
    } else if (this.cursor === "pointer") {
      this.cursor = null;
    }
  },
  cursor: null,
  get trackedPointers() {
    if (this._trackedPointers === void 0) {
      this._trackedPointers = {};
    }
    return this._trackedPointers;
  },
  _trackedPointers: void 0
};
DisplayObject.mixin(interactiveTarget);
var MOUSE_POINTER_ID = 1;
var hitTestEvent = {
  target: null,
  data: {
    global: null
  }
};
var InteractionManager = function(_super) {
  __extends$h(InteractionManager2, _super);
  function InteractionManager2(renderer, options) {
    var _this = _super.call(this) || this;
    options = options || {};
    _this.renderer = renderer;
    _this.autoPreventDefault = options.autoPreventDefault !== void 0 ? options.autoPreventDefault : true;
    _this.interactionFrequency = options.interactionFrequency || 10;
    _this.mouse = new InteractionData();
    _this.mouse.identifier = MOUSE_POINTER_ID;
    _this.mouse.global.set(-999999);
    _this.activeInteractionData = {};
    _this.activeInteractionData[MOUSE_POINTER_ID] = _this.mouse;
    _this.interactionDataPool = [];
    _this.eventData = new InteractionEvent();
    _this.interactionDOMElement = null;
    _this.moveWhenInside = false;
    _this.eventsAdded = false;
    _this.tickerAdded = false;
    _this.mouseOverRenderer = !("PointerEvent" in globalThis);
    _this.supportsTouchEvents = "ontouchstart" in globalThis;
    _this.supportsPointerEvents = !!globalThis.PointerEvent;
    _this.onPointerUp = _this.onPointerUp.bind(_this);
    _this.processPointerUp = _this.processPointerUp.bind(_this);
    _this.onPointerCancel = _this.onPointerCancel.bind(_this);
    _this.processPointerCancel = _this.processPointerCancel.bind(_this);
    _this.onPointerDown = _this.onPointerDown.bind(_this);
    _this.processPointerDown = _this.processPointerDown.bind(_this);
    _this.onPointerMove = _this.onPointerMove.bind(_this);
    _this.processPointerMove = _this.processPointerMove.bind(_this);
    _this.onPointerOut = _this.onPointerOut.bind(_this);
    _this.processPointerOverOut = _this.processPointerOverOut.bind(_this);
    _this.onPointerOver = _this.onPointerOver.bind(_this);
    _this.cursorStyles = {
      default: "inherit",
      pointer: "pointer"
    };
    _this.currentCursorMode = null;
    _this.cursor = null;
    _this.resolution = 1;
    _this.delayedEvents = [];
    _this.search = new TreeSearch();
    _this._tempDisplayObject = new TemporaryDisplayObject();
    _this._eventListenerOptions = { capture: true, passive: false };
    _this._useSystemTicker = options.useSystemTicker !== void 0 ? options.useSystemTicker : true;
    _this.setTargetElement(_this.renderer.view, _this.renderer.resolution);
    return _this;
  }
  Object.defineProperty(InteractionManager2.prototype, "useSystemTicker", {
    get: function() {
      return this._useSystemTicker;
    },
    set: function(useSystemTicker) {
      this._useSystemTicker = useSystemTicker;
      if (useSystemTicker) {
        this.addTickerListener();
      } else {
        this.removeTickerListener();
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(InteractionManager2.prototype, "lastObjectRendered", {
    get: function() {
      return this.renderer._lastObjectRendered || this._tempDisplayObject;
    },
    enumerable: false,
    configurable: true
  });
  InteractionManager2.prototype.hitTest = function(globalPoint, root) {
    hitTestEvent.target = null;
    hitTestEvent.data.global = globalPoint;
    if (!root) {
      root = this.lastObjectRendered;
    }
    this.processInteractive(hitTestEvent, root, null, true);
    return hitTestEvent.target;
  };
  InteractionManager2.prototype.setTargetElement = function(element, resolution) {
    if (resolution === void 0) {
      resolution = 1;
    }
    this.removeTickerListener();
    this.removeEvents();
    this.interactionDOMElement = element;
    this.resolution = resolution;
    this.addEvents();
    this.addTickerListener();
  };
  InteractionManager2.prototype.addTickerListener = function() {
    if (this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker) {
      return;
    }
    Ticker.system.add(this.tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);
    this.tickerAdded = true;
  };
  InteractionManager2.prototype.removeTickerListener = function() {
    if (!this.tickerAdded) {
      return;
    }
    Ticker.system.remove(this.tickerUpdate, this);
    this.tickerAdded = false;
  };
  InteractionManager2.prototype.addEvents = function() {
    if (this.eventsAdded || !this.interactionDOMElement) {
      return;
    }
    var style = this.interactionDOMElement.style;
    if (globalThis.navigator.msPointerEnabled) {
      style.msContentZooming = "none";
      style.msTouchAction = "none";
    } else if (this.supportsPointerEvents) {
      style.touchAction = "none";
    }
    if (this.supportsPointerEvents) {
      globalThis.document.addEventListener("pointermove", this.onPointerMove, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("pointerdown", this.onPointerDown, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("pointerleave", this.onPointerOut, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("pointerover", this.onPointerOver, this._eventListenerOptions);
      globalThis.addEventListener("pointercancel", this.onPointerCancel, this._eventListenerOptions);
      globalThis.addEventListener("pointerup", this.onPointerUp, this._eventListenerOptions);
    } else {
      globalThis.document.addEventListener("mousemove", this.onPointerMove, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("mousedown", this.onPointerDown, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("mouseout", this.onPointerOut, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("mouseover", this.onPointerOver, this._eventListenerOptions);
      globalThis.addEventListener("mouseup", this.onPointerUp, this._eventListenerOptions);
    }
    if (this.supportsTouchEvents) {
      this.interactionDOMElement.addEventListener("touchstart", this.onPointerDown, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("touchcancel", this.onPointerCancel, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("touchend", this.onPointerUp, this._eventListenerOptions);
      this.interactionDOMElement.addEventListener("touchmove", this.onPointerMove, this._eventListenerOptions);
    }
    this.eventsAdded = true;
  };
  InteractionManager2.prototype.removeEvents = function() {
    if (!this.eventsAdded || !this.interactionDOMElement) {
      return;
    }
    var style = this.interactionDOMElement.style;
    if (globalThis.navigator.msPointerEnabled) {
      style.msContentZooming = "";
      style.msTouchAction = "";
    } else if (this.supportsPointerEvents) {
      style.touchAction = "";
    }
    if (this.supportsPointerEvents) {
      globalThis.document.removeEventListener("pointermove", this.onPointerMove, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("pointerdown", this.onPointerDown, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("pointerleave", this.onPointerOut, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("pointerover", this.onPointerOver, this._eventListenerOptions);
      globalThis.removeEventListener("pointercancel", this.onPointerCancel, this._eventListenerOptions);
      globalThis.removeEventListener("pointerup", this.onPointerUp, this._eventListenerOptions);
    } else {
      globalThis.document.removeEventListener("mousemove", this.onPointerMove, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("mousedown", this.onPointerDown, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("mouseout", this.onPointerOut, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("mouseover", this.onPointerOver, this._eventListenerOptions);
      globalThis.removeEventListener("mouseup", this.onPointerUp, this._eventListenerOptions);
    }
    if (this.supportsTouchEvents) {
      this.interactionDOMElement.removeEventListener("touchstart", this.onPointerDown, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("touchcancel", this.onPointerCancel, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("touchend", this.onPointerUp, this._eventListenerOptions);
      this.interactionDOMElement.removeEventListener("touchmove", this.onPointerMove, this._eventListenerOptions);
    }
    this.interactionDOMElement = null;
    this.eventsAdded = false;
  };
  InteractionManager2.prototype.tickerUpdate = function(deltaTime) {
    this._deltaTime += deltaTime;
    if (this._deltaTime < this.interactionFrequency) {
      return;
    }
    this._deltaTime = 0;
    this.update();
  };
  InteractionManager2.prototype.update = function() {
    if (!this.interactionDOMElement) {
      return;
    }
    if (this._didMove) {
      this._didMove = false;
      return;
    }
    this.cursor = null;
    for (var k in this.activeInteractionData) {
      if (this.activeInteractionData.hasOwnProperty(k)) {
        var interactionData = this.activeInteractionData[k];
        if (interactionData.originalEvent && interactionData.pointerType !== "touch") {
          var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);
          this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, true);
        }
      }
    }
    this.setCursorMode(this.cursor);
  };
  InteractionManager2.prototype.setCursorMode = function(mode) {
    mode = mode || "default";
    var applyStyles = true;
    if (globalThis.OffscreenCanvas && this.interactionDOMElement instanceof OffscreenCanvas) {
      applyStyles = false;
    }
    if (this.currentCursorMode === mode) {
      return;
    }
    this.currentCursorMode = mode;
    var style = this.cursorStyles[mode];
    if (style) {
      switch (typeof style) {
        case "string":
          if (applyStyles) {
            this.interactionDOMElement.style.cursor = style;
          }
          break;
        case "function":
          style(mode);
          break;
        case "object":
          if (applyStyles) {
            Object.assign(this.interactionDOMElement.style, style);
          }
          break;
      }
    } else if (applyStyles && typeof mode === "string" && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
      this.interactionDOMElement.style.cursor = mode;
    }
  };
  InteractionManager2.prototype.dispatchEvent = function(displayObject, eventString, eventData) {
    if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt) {
      eventData.currentTarget = displayObject;
      eventData.type = eventString;
      displayObject.emit(eventString, eventData);
      if (displayObject[eventString]) {
        displayObject[eventString](eventData);
      }
    }
  };
  InteractionManager2.prototype.delayDispatchEvent = function(displayObject, eventString, eventData) {
    this.delayedEvents.push({ displayObject, eventString, eventData });
  };
  InteractionManager2.prototype.mapPositionToPoint = function(point, x, y) {
    var rect;
    if (!this.interactionDOMElement.parentElement) {
      rect = {
        x: 0,
        y: 0,
        width: this.interactionDOMElement.width,
        height: this.interactionDOMElement.height,
        left: 0,
        top: 0
      };
    } else {
      rect = this.interactionDOMElement.getBoundingClientRect();
    }
    var resolutionMultiplier = 1 / this.resolution;
    point.x = (x - rect.left) * (this.interactionDOMElement.width / rect.width) * resolutionMultiplier;
    point.y = (y - rect.top) * (this.interactionDOMElement.height / rect.height) * resolutionMultiplier;
  };
  InteractionManager2.prototype.processInteractive = function(interactionEvent, displayObject, func, hitTest) {
    var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);
    var delayedEvents = this.delayedEvents;
    if (!delayedEvents.length) {
      return hit;
    }
    interactionEvent.stopPropagationHint = false;
    var delayedLen = delayedEvents.length;
    this.delayedEvents = [];
    for (var i = 0; i < delayedLen; i++) {
      var _a2 = delayedEvents[i], displayObject_1 = _a2.displayObject, eventString = _a2.eventString, eventData = _a2.eventData;
      if (eventData.stopsPropagatingAt === displayObject_1) {
        eventData.stopPropagationHint = true;
      }
      this.dispatchEvent(displayObject_1, eventString, eventData);
    }
    return hit;
  };
  InteractionManager2.prototype.onPointerDown = function(originalEvent) {
    if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
      return;
    }
    var events = this.normalizeToPointerData(originalEvent);
    if (this.autoPreventDefault && events[0].isNormalized) {
      var cancelable = originalEvent.cancelable || !("cancelable" in originalEvent);
      if (cancelable) {
        originalEvent.preventDefault();
      }
    }
    var eventLen = events.length;
    for (var i = 0; i < eventLen; i++) {
      var event = events[i];
      var interactionData = this.getInteractionDataForPointerId(event);
      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
      interactionEvent.data.originalEvent = originalEvent;
      this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);
      this.emit("pointerdown", interactionEvent);
      if (event.pointerType === "touch") {
        this.emit("touchstart", interactionEvent);
      } else if (event.pointerType === "mouse" || event.pointerType === "pen") {
        var isRightButton = event.button === 2;
        this.emit(isRightButton ? "rightdown" : "mousedown", this.eventData);
      }
    }
  };
  InteractionManager2.prototype.processPointerDown = function(interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    if (hit) {
      if (!displayObject.trackedPointers[id]) {
        displayObject.trackedPointers[id] = new InteractionTrackingData(id);
      }
      this.dispatchEvent(displayObject, "pointerdown", interactionEvent);
      if (data.pointerType === "touch") {
        this.dispatchEvent(displayObject, "touchstart", interactionEvent);
      } else if (data.pointerType === "mouse" || data.pointerType === "pen") {
        var isRightButton = data.button === 2;
        if (isRightButton) {
          displayObject.trackedPointers[id].rightDown = true;
        } else {
          displayObject.trackedPointers[id].leftDown = true;
        }
        this.dispatchEvent(displayObject, isRightButton ? "rightdown" : "mousedown", interactionEvent);
      }
    }
  };
  InteractionManager2.prototype.onPointerComplete = function(originalEvent, cancelled, func) {
    var events = this.normalizeToPointerData(originalEvent);
    var eventLen = events.length;
    var target = originalEvent.target;
    if (originalEvent.composedPath && originalEvent.composedPath().length > 0) {
      target = originalEvent.composedPath()[0];
    }
    var eventAppend = target !== this.interactionDOMElement ? "outside" : "";
    for (var i = 0; i < eventLen; i++) {
      var event = events[i];
      var interactionData = this.getInteractionDataForPointerId(event);
      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
      interactionEvent.data.originalEvent = originalEvent;
      this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);
      this.emit(cancelled ? "pointercancel" : "pointerup" + eventAppend, interactionEvent);
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        var isRightButton = event.button === 2;
        this.emit(isRightButton ? "rightup" + eventAppend : "mouseup" + eventAppend, interactionEvent);
      } else if (event.pointerType === "touch") {
        this.emit(cancelled ? "touchcancel" : "touchend" + eventAppend, interactionEvent);
        this.releaseInteractionDataForPointerId(event.pointerId);
      }
    }
  };
  InteractionManager2.prototype.onPointerCancel = function(event) {
    if (this.supportsTouchEvents && event.pointerType === "touch") {
      return;
    }
    this.onPointerComplete(event, true, this.processPointerCancel);
  };
  InteractionManager2.prototype.processPointerCancel = function(interactionEvent, displayObject) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    if (displayObject.trackedPointers[id] !== void 0) {
      delete displayObject.trackedPointers[id];
      this.dispatchEvent(displayObject, "pointercancel", interactionEvent);
      if (data.pointerType === "touch") {
        this.dispatchEvent(displayObject, "touchcancel", interactionEvent);
      }
    }
  };
  InteractionManager2.prototype.onPointerUp = function(event) {
    if (this.supportsTouchEvents && event.pointerType === "touch") {
      return;
    }
    this.onPointerComplete(event, false, this.processPointerUp);
  };
  InteractionManager2.prototype.processPointerUp = function(interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    var trackingData = displayObject.trackedPointers[id];
    var isTouch = data.pointerType === "touch";
    var isMouse = data.pointerType === "mouse" || data.pointerType === "pen";
    var isMouseTap = false;
    if (isMouse) {
      var isRightButton = data.button === 2;
      var flags = InteractionTrackingData.FLAGS;
      var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
      var isDown = trackingData !== void 0 && trackingData.flags & test;
      if (hit) {
        this.dispatchEvent(displayObject, isRightButton ? "rightup" : "mouseup", interactionEvent);
        if (isDown) {
          this.dispatchEvent(displayObject, isRightButton ? "rightclick" : "click", interactionEvent);
          isMouseTap = true;
        }
      } else if (isDown) {
        this.dispatchEvent(displayObject, isRightButton ? "rightupoutside" : "mouseupoutside", interactionEvent);
      }
      if (trackingData) {
        if (isRightButton) {
          trackingData.rightDown = false;
        } else {
          trackingData.leftDown = false;
        }
      }
    }
    if (hit) {
      this.dispatchEvent(displayObject, "pointerup", interactionEvent);
      if (isTouch) {
        this.dispatchEvent(displayObject, "touchend", interactionEvent);
      }
      if (trackingData) {
        if (!isMouse || isMouseTap) {
          this.dispatchEvent(displayObject, "pointertap", interactionEvent);
        }
        if (isTouch) {
          this.dispatchEvent(displayObject, "tap", interactionEvent);
          trackingData.over = false;
        }
      }
    } else if (trackingData) {
      this.dispatchEvent(displayObject, "pointerupoutside", interactionEvent);
      if (isTouch) {
        this.dispatchEvent(displayObject, "touchendoutside", interactionEvent);
      }
    }
    if (trackingData && trackingData.none) {
      delete displayObject.trackedPointers[id];
    }
  };
  InteractionManager2.prototype.onPointerMove = function(originalEvent) {
    if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
      return;
    }
    var events = this.normalizeToPointerData(originalEvent);
    if (events[0].pointerType === "mouse" || events[0].pointerType === "pen") {
      this._didMove = true;
      this.cursor = null;
    }
    var eventLen = events.length;
    for (var i = 0; i < eventLen; i++) {
      var event = events[i];
      var interactionData = this.getInteractionDataForPointerId(event);
      var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
      interactionEvent.data.originalEvent = originalEvent;
      this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true);
      this.emit("pointermove", interactionEvent);
      if (event.pointerType === "touch") {
        this.emit("touchmove", interactionEvent);
      }
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        this.emit("mousemove", interactionEvent);
      }
    }
    if (events[0].pointerType === "mouse") {
      this.setCursorMode(this.cursor);
    }
  };
  InteractionManager2.prototype.processPointerMove = function(interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var isTouch = data.pointerType === "touch";
    var isMouse = data.pointerType === "mouse" || data.pointerType === "pen";
    if (isMouse) {
      this.processPointerOverOut(interactionEvent, displayObject, hit);
    }
    if (!this.moveWhenInside || hit) {
      this.dispatchEvent(displayObject, "pointermove", interactionEvent);
      if (isTouch) {
        this.dispatchEvent(displayObject, "touchmove", interactionEvent);
      }
      if (isMouse) {
        this.dispatchEvent(displayObject, "mousemove", interactionEvent);
      }
    }
  };
  InteractionManager2.prototype.onPointerOut = function(originalEvent) {
    if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
      return;
    }
    var events = this.normalizeToPointerData(originalEvent);
    var event = events[0];
    if (event.pointerType === "mouse") {
      this.mouseOverRenderer = false;
      this.setCursorMode(null);
    }
    var interactionData = this.getInteractionDataForPointerId(event);
    var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
    interactionEvent.data.originalEvent = event;
    this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, false);
    this.emit("pointerout", interactionEvent);
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      this.emit("mouseout", interactionEvent);
    } else {
      this.releaseInteractionDataForPointerId(interactionData.identifier);
    }
  };
  InteractionManager2.prototype.processPointerOverOut = function(interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;
    var isMouse = data.pointerType === "mouse" || data.pointerType === "pen";
    var trackingData = displayObject.trackedPointers[id];
    if (hit && !trackingData) {
      trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
    }
    if (trackingData === void 0) {
      return;
    }
    if (hit && this.mouseOverRenderer) {
      if (!trackingData.over) {
        trackingData.over = true;
        this.delayDispatchEvent(displayObject, "pointerover", interactionEvent);
        if (isMouse) {
          this.delayDispatchEvent(displayObject, "mouseover", interactionEvent);
        }
      }
      if (isMouse && this.cursor === null) {
        this.cursor = displayObject.cursor;
      }
    } else if (trackingData.over) {
      trackingData.over = false;
      this.dispatchEvent(displayObject, "pointerout", this.eventData);
      if (isMouse) {
        this.dispatchEvent(displayObject, "mouseout", interactionEvent);
      }
      if (trackingData.none) {
        delete displayObject.trackedPointers[id];
      }
    }
  };
  InteractionManager2.prototype.onPointerOver = function(originalEvent) {
    if (this.supportsTouchEvents && originalEvent.pointerType === "touch") {
      return;
    }
    var events = this.normalizeToPointerData(originalEvent);
    var event = events[0];
    var interactionData = this.getInteractionDataForPointerId(event);
    var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
    interactionEvent.data.originalEvent = event;
    if (event.pointerType === "mouse") {
      this.mouseOverRenderer = true;
    }
    this.emit("pointerover", interactionEvent);
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      this.emit("mouseover", interactionEvent);
    }
  };
  InteractionManager2.prototype.getInteractionDataForPointerId = function(event) {
    var pointerId = event.pointerId;
    var interactionData;
    if (pointerId === MOUSE_POINTER_ID || event.pointerType === "mouse") {
      interactionData = this.mouse;
    } else if (this.activeInteractionData[pointerId]) {
      interactionData = this.activeInteractionData[pointerId];
    } else {
      interactionData = this.interactionDataPool.pop() || new InteractionData();
      interactionData.identifier = pointerId;
      this.activeInteractionData[pointerId] = interactionData;
    }
    interactionData.copyEvent(event);
    return interactionData;
  };
  InteractionManager2.prototype.releaseInteractionDataForPointerId = function(pointerId) {
    var interactionData = this.activeInteractionData[pointerId];
    if (interactionData) {
      delete this.activeInteractionData[pointerId];
      interactionData.reset();
      this.interactionDataPool.push(interactionData);
    }
  };
  InteractionManager2.prototype.configureInteractionEventForDOMEvent = function(interactionEvent, pointerEvent, interactionData) {
    interactionEvent.data = interactionData;
    this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);
    if (pointerEvent.pointerType === "touch") {
      pointerEvent.globalX = interactionData.global.x;
      pointerEvent.globalY = interactionData.global.y;
    }
    interactionData.originalEvent = pointerEvent;
    interactionEvent.reset();
    return interactionEvent;
  };
  InteractionManager2.prototype.normalizeToPointerData = function(event) {
    var normalizedEvents = [];
    if (this.supportsTouchEvents && event instanceof TouchEvent) {
      for (var i = 0, li = event.changedTouches.length; i < li; i++) {
        var touch = event.changedTouches[i];
        if (typeof touch.button === "undefined") {
          touch.button = event.touches.length ? 1 : 0;
        }
        if (typeof touch.buttons === "undefined") {
          touch.buttons = event.touches.length ? 1 : 0;
        }
        if (typeof touch.isPrimary === "undefined") {
          touch.isPrimary = event.touches.length === 1 && event.type === "touchstart";
        }
        if (typeof touch.width === "undefined") {
          touch.width = touch.radiusX || 1;
        }
        if (typeof touch.height === "undefined") {
          touch.height = touch.radiusY || 1;
        }
        if (typeof touch.tiltX === "undefined") {
          touch.tiltX = 0;
        }
        if (typeof touch.tiltY === "undefined") {
          touch.tiltY = 0;
        }
        if (typeof touch.pointerType === "undefined") {
          touch.pointerType = "touch";
        }
        if (typeof touch.pointerId === "undefined") {
          touch.pointerId = touch.identifier || 0;
        }
        if (typeof touch.pressure === "undefined") {
          touch.pressure = touch.force || 0.5;
        }
        if (typeof touch.twist === "undefined") {
          touch.twist = 0;
        }
        if (typeof touch.tangentialPressure === "undefined") {
          touch.tangentialPressure = 0;
        }
        if (typeof touch.layerX === "undefined") {
          touch.layerX = touch.offsetX = touch.clientX;
        }
        if (typeof touch.layerY === "undefined") {
          touch.layerY = touch.offsetY = touch.clientY;
        }
        touch.isNormalized = true;
        normalizedEvents.push(touch);
      }
    } else if (!globalThis.MouseEvent || event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof globalThis.PointerEvent))) {
      var tempEvent = event;
      if (typeof tempEvent.isPrimary === "undefined") {
        tempEvent.isPrimary = true;
      }
      if (typeof tempEvent.width === "undefined") {
        tempEvent.width = 1;
      }
      if (typeof tempEvent.height === "undefined") {
        tempEvent.height = 1;
      }
      if (typeof tempEvent.tiltX === "undefined") {
        tempEvent.tiltX = 0;
      }
      if (typeof tempEvent.tiltY === "undefined") {
        tempEvent.tiltY = 0;
      }
      if (typeof tempEvent.pointerType === "undefined") {
        tempEvent.pointerType = "mouse";
      }
      if (typeof tempEvent.pointerId === "undefined") {
        tempEvent.pointerId = MOUSE_POINTER_ID;
      }
      if (typeof tempEvent.pressure === "undefined") {
        tempEvent.pressure = 0.5;
      }
      if (typeof tempEvent.twist === "undefined") {
        tempEvent.twist = 0;
      }
      if (typeof tempEvent.tangentialPressure === "undefined") {
        tempEvent.tangentialPressure = 0;
      }
      tempEvent.isNormalized = true;
      normalizedEvents.push(tempEvent);
    } else {
      normalizedEvents.push(event);
    }
    return normalizedEvents;
  };
  InteractionManager2.prototype.destroy = function() {
    this.removeEvents();
    this.removeTickerListener();
    this.removeAllListeners();
    this.renderer = null;
    this.mouse = null;
    this.eventData = null;
    this.interactionDOMElement = null;
    this.onPointerDown = null;
    this.processPointerDown = null;
    this.onPointerUp = null;
    this.processPointerUp = null;
    this.onPointerCancel = null;
    this.processPointerCancel = null;
    this.onPointerMove = null;
    this.processPointerMove = null;
    this.onPointerOut = null;
    this.processPointerOverOut = null;
    this.onPointerOver = null;
    this.search = null;
  };
  InteractionManager2.extension = {
    name: "interaction",
    type: [
      ExtensionType.RendererPlugin,
      ExtensionType.CanvasRendererPlugin
    ]
  };
  return InteractionManager2;
}(EventEmitter);
var TEMP_RECT = new Rectangle();
var BYTES_PER_PIXEL = 4;
var Extract = function() {
  function Extract2(renderer) {
    this.renderer = renderer;
  }
  Extract2.prototype.image = function(target, format2, quality) {
    var image = new Image();
    image.src = this.base64(target, format2, quality);
    return image;
  };
  Extract2.prototype.base64 = function(target, format2, quality) {
    return this.canvas(target).toDataURL(format2, quality);
  };
  Extract2.prototype.canvas = function(target, frame) {
    var renderer = this.renderer;
    var resolution;
    var flipY = false;
    var renderTexture;
    var generated = false;
    if (target) {
      if (target instanceof RenderTexture) {
        renderTexture = target;
      } else {
        renderTexture = this.renderer.generateTexture(target);
        generated = true;
      }
    }
    if (renderTexture) {
      resolution = renderTexture.baseTexture.resolution;
      frame = frame !== null && frame !== void 0 ? frame : renderTexture.frame;
      flipY = false;
      renderer.renderTexture.bind(renderTexture);
    } else {
      resolution = renderer.resolution;
      if (!frame) {
        frame = TEMP_RECT;
        frame.width = renderer.width;
        frame.height = renderer.height;
      }
      flipY = true;
      renderer.renderTexture.bind(null);
    }
    var width = Math.round(frame.width * resolution);
    var height = Math.round(frame.height * resolution);
    var canvasBuffer = new CanvasRenderTarget(width, height, 1);
    var webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);
    var gl = renderer.gl;
    gl.readPixels(Math.round(frame.x * resolution), Math.round(frame.y * resolution), width, height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);
    var canvasData = canvasBuffer.context.getImageData(0, 0, width, height);
    Extract2.arrayPostDivide(webglPixels, canvasData.data);
    canvasBuffer.context.putImageData(canvasData, 0, 0);
    if (flipY) {
      var target_1 = new CanvasRenderTarget(canvasBuffer.width, canvasBuffer.height, 1);
      target_1.context.scale(1, -1);
      target_1.context.drawImage(canvasBuffer.canvas, 0, -height);
      canvasBuffer.destroy();
      canvasBuffer = target_1;
    }
    if (generated) {
      renderTexture.destroy(true);
    }
    return canvasBuffer.canvas;
  };
  Extract2.prototype.pixels = function(target, frame) {
    var renderer = this.renderer;
    var resolution;
    var renderTexture;
    var generated = false;
    if (target) {
      if (target instanceof RenderTexture) {
        renderTexture = target;
      } else {
        renderTexture = this.renderer.generateTexture(target);
        generated = true;
      }
    }
    if (renderTexture) {
      resolution = renderTexture.baseTexture.resolution;
      frame = frame !== null && frame !== void 0 ? frame : renderTexture.frame;
      renderer.renderTexture.bind(renderTexture);
    } else {
      resolution = renderer.resolution;
      if (!frame) {
        frame = TEMP_RECT;
        frame.width = renderer.width;
        frame.height = renderer.height;
      }
      renderer.renderTexture.bind(null);
    }
    var width = Math.round(frame.width * resolution);
    var height = Math.round(frame.height * resolution);
    var webglPixels = new Uint8Array(BYTES_PER_PIXEL * width * height);
    var gl = renderer.gl;
    gl.readPixels(Math.round(frame.x * resolution), Math.round(frame.y * resolution), width, height, gl.RGBA, gl.UNSIGNED_BYTE, webglPixels);
    if (generated) {
      renderTexture.destroy(true);
    }
    Extract2.arrayPostDivide(webglPixels, webglPixels);
    return webglPixels;
  };
  Extract2.prototype.destroy = function() {
    this.renderer = null;
  };
  Extract2.arrayPostDivide = function(pixels, out) {
    for (var i = 0; i < pixels.length; i += 4) {
      var alpha = out[i + 3] = pixels[i + 3];
      if (alpha !== 0) {
        out[i] = Math.round(Math.min(pixels[i] * 255 / alpha, 255));
        out[i + 1] = Math.round(Math.min(pixels[i + 1] * 255 / alpha, 255));
        out[i + 2] = Math.round(Math.min(pixels[i + 2] * 255 / alpha, 255));
      } else {
        out[i] = pixels[i];
        out[i + 1] = pixels[i + 1];
        out[i + 2] = pixels[i + 2];
      }
    }
  };
  Extract2.extension = {
    name: "extract",
    type: ExtensionType.RendererPlugin
  };
  return Extract2;
}();
var SignalBinding = function() {
  function SignalBinding2(fn, once, thisArg) {
    if (once === void 0) {
      once = false;
    }
    this._fn = fn;
    this._once = once;
    this._thisArg = thisArg;
    this._next = this._prev = this._owner = null;
  }
  SignalBinding2.prototype.detach = function() {
    if (this._owner === null) {
      return false;
    }
    this._owner.detach(this);
    return true;
  };
  return SignalBinding2;
}();
function _addSignalBinding(self2, node) {
  if (!self2._head) {
    self2._head = node;
    self2._tail = node;
  } else {
    self2._tail._next = node;
    node._prev = self2._tail;
    self2._tail = node;
  }
  node._owner = self2;
  return node;
}
var Signal = function() {
  function Signal2() {
    this._head = this._tail = void 0;
  }
  Signal2.prototype.handlers = function(exists) {
    if (exists === void 0) {
      exists = false;
    }
    var node = this._head;
    if (exists) {
      return !!node;
    }
    var ee = [];
    while (node) {
      ee.push(node);
      node = node._next;
    }
    return ee;
  };
  Signal2.prototype.has = function(node) {
    if (!(node instanceof SignalBinding)) {
      throw new Error("MiniSignal#has(): First arg must be a SignalBinding object.");
    }
    return node._owner === this;
  };
  Signal2.prototype.dispatch = function() {
    var arguments$1 = arguments;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments$1[_i];
    }
    var node = this._head;
    if (!node) {
      return false;
    }
    while (node) {
      if (node._once) {
        this.detach(node);
      }
      node._fn.apply(node._thisArg, args);
      node = node._next;
    }
    return true;
  };
  Signal2.prototype.add = function(fn, thisArg) {
    if (thisArg === void 0) {
      thisArg = null;
    }
    if (typeof fn !== "function") {
      throw new Error("MiniSignal#add(): First arg must be a Function.");
    }
    return _addSignalBinding(this, new SignalBinding(fn, false, thisArg));
  };
  Signal2.prototype.once = function(fn, thisArg) {
    if (thisArg === void 0) {
      thisArg = null;
    }
    if (typeof fn !== "function") {
      throw new Error("MiniSignal#once(): First arg must be a Function.");
    }
    return _addSignalBinding(this, new SignalBinding(fn, true, thisArg));
  };
  Signal2.prototype.detach = function(node) {
    if (!(node instanceof SignalBinding)) {
      throw new Error("MiniSignal#detach(): First arg must be a SignalBinding object.");
    }
    if (node._owner !== this) {
      return this;
    }
    if (node._prev) {
      node._prev._next = node._next;
    }
    if (node._next) {
      node._next._prev = node._prev;
    }
    if (node === this._head) {
      this._head = node._next;
      if (node._next === null) {
        this._tail = null;
      }
    } else if (node === this._tail) {
      this._tail = node._prev;
      this._tail._next = null;
    }
    node._owner = null;
    return this;
  };
  Signal2.prototype.detachAll = function() {
    var node = this._head;
    if (!node) {
      return this;
    }
    this._head = this._tail = null;
    while (node) {
      node._owner = null;
      node = node._next;
    }
    return this;
  };
  return Signal2;
}();
function parseUri(str, opts) {
  opts = opts || {};
  var o = {
    key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };
  var m = o.parser[opts.strictMode ? "strict" : "loose"].exec(str);
  var uri = {};
  var i = 14;
  while (i--) {
    uri[o.key[i]] = m[i] || "";
  }
  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function(_t0, t1, t2) {
    if (t1) {
      uri[o.q.name][t1] = t2;
    }
  });
  return uri;
}
var useXdr;
var tempAnchor = null;
var STATUS_NONE = 0;
var STATUS_OK = 200;
var STATUS_EMPTY = 204;
var STATUS_IE_BUG_EMPTY = 1223;
var STATUS_TYPE_OK = 2;
function _noop$1() {
}
function setExtMap(map2, extname, val) {
  if (extname && extname.indexOf(".") === 0) {
    extname = extname.substring(1);
  }
  if (!extname) {
    return;
  }
  map2[extname] = val;
}
function reqType(xhr) {
  return xhr.toString().replace("object ", "");
}
var LoaderResource = function() {
  function LoaderResource2(name, url2, options) {
    this._dequeue = _noop$1;
    this._onLoadBinding = null;
    this._elementTimer = 0;
    this._boundComplete = null;
    this._boundOnError = null;
    this._boundOnProgress = null;
    this._boundOnTimeout = null;
    this._boundXhrOnError = null;
    this._boundXhrOnTimeout = null;
    this._boundXhrOnAbort = null;
    this._boundXhrOnLoad = null;
    if (typeof name !== "string" || typeof url2 !== "string") {
      throw new Error("Both name and url are required for constructing a resource.");
    }
    options = options || {};
    this._flags = 0;
    this._setFlag(LoaderResource2.STATUS_FLAGS.DATA_URL, url2.indexOf("data:") === 0);
    this.name = name;
    this.url = url2;
    this.extension = this._getExtension();
    this.data = null;
    this.crossOrigin = options.crossOrigin === true ? "anonymous" : options.crossOrigin;
    this.timeout = options.timeout || 0;
    this.loadType = options.loadType || this._determineLoadType();
    this.xhrType = options.xhrType;
    this.metadata = options.metadata || {};
    this.error = null;
    this.xhr = null;
    this.children = [];
    this.type = LoaderResource2.TYPE.UNKNOWN;
    this.progressChunk = 0;
    this._dequeue = _noop$1;
    this._onLoadBinding = null;
    this._elementTimer = 0;
    this._boundComplete = this.complete.bind(this);
    this._boundOnError = this._onError.bind(this);
    this._boundOnProgress = this._onProgress.bind(this);
    this._boundOnTimeout = this._onTimeout.bind(this);
    this._boundXhrOnError = this._xhrOnError.bind(this);
    this._boundXhrOnTimeout = this._xhrOnTimeout.bind(this);
    this._boundXhrOnAbort = this._xhrOnAbort.bind(this);
    this._boundXhrOnLoad = this._xhrOnLoad.bind(this);
    this.onStart = new Signal();
    this.onProgress = new Signal();
    this.onComplete = new Signal();
    this.onAfterMiddleware = new Signal();
  }
  LoaderResource2.setExtensionLoadType = function(extname, loadType) {
    setExtMap(LoaderResource2._loadTypeMap, extname, loadType);
  };
  LoaderResource2.setExtensionXhrType = function(extname, xhrType) {
    setExtMap(LoaderResource2._xhrTypeMap, extname, xhrType);
  };
  Object.defineProperty(LoaderResource2.prototype, "isDataUrl", {
    get: function() {
      return this._hasFlag(LoaderResource2.STATUS_FLAGS.DATA_URL);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(LoaderResource2.prototype, "isComplete", {
    get: function() {
      return this._hasFlag(LoaderResource2.STATUS_FLAGS.COMPLETE);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(LoaderResource2.prototype, "isLoading", {
    get: function() {
      return this._hasFlag(LoaderResource2.STATUS_FLAGS.LOADING);
    },
    enumerable: false,
    configurable: true
  });
  LoaderResource2.prototype.complete = function() {
    this._clearEvents();
    this._finish();
  };
  LoaderResource2.prototype.abort = function(message) {
    if (this.error) {
      return;
    }
    this.error = new Error(message);
    this._clearEvents();
    if (this.xhr) {
      this.xhr.abort();
    } else if (this.xdr) {
      this.xdr.abort();
    } else if (this.data) {
      if (this.data.src) {
        this.data.src = LoaderResource2.EMPTY_GIF;
      } else {
        while (this.data.firstChild) {
          this.data.removeChild(this.data.firstChild);
        }
      }
    }
    this._finish();
  };
  LoaderResource2.prototype.load = function(cb) {
    var _this = this;
    if (this.isLoading) {
      return;
    }
    if (this.isComplete) {
      if (cb) {
        setTimeout(function() {
          return cb(_this);
        }, 1);
      }
      return;
    } else if (cb) {
      this.onComplete.once(cb);
    }
    this._setFlag(LoaderResource2.STATUS_FLAGS.LOADING, true);
    this.onStart.dispatch(this);
    if (this.crossOrigin === false || typeof this.crossOrigin !== "string") {
      this.crossOrigin = this._determineCrossOrigin(this.url);
    }
    switch (this.loadType) {
      case LoaderResource2.LOAD_TYPE.IMAGE:
        this.type = LoaderResource2.TYPE.IMAGE;
        this._loadElement("image");
        break;
      case LoaderResource2.LOAD_TYPE.AUDIO:
        this.type = LoaderResource2.TYPE.AUDIO;
        this._loadSourceElement("audio");
        break;
      case LoaderResource2.LOAD_TYPE.VIDEO:
        this.type = LoaderResource2.TYPE.VIDEO;
        this._loadSourceElement("video");
        break;
      case LoaderResource2.LOAD_TYPE.XHR:
      default:
        if (typeof useXdr === "undefined") {
          useXdr = !!(globalThis.XDomainRequest && !("withCredentials" in new XMLHttpRequest()));
        }
        if (useXdr && this.crossOrigin) {
          this._loadXdr();
        } else {
          this._loadXhr();
        }
        break;
    }
  };
  LoaderResource2.prototype._hasFlag = function(flag) {
    return (this._flags & flag) !== 0;
  };
  LoaderResource2.prototype._setFlag = function(flag, value) {
    this._flags = value ? this._flags | flag : this._flags & ~flag;
  };
  LoaderResource2.prototype._clearEvents = function() {
    clearTimeout(this._elementTimer);
    if (this.data && this.data.removeEventListener) {
      this.data.removeEventListener("error", this._boundOnError, false);
      this.data.removeEventListener("load", this._boundComplete, false);
      this.data.removeEventListener("progress", this._boundOnProgress, false);
      this.data.removeEventListener("canplaythrough", this._boundComplete, false);
    }
    if (this.xhr) {
      if (this.xhr.removeEventListener) {
        this.xhr.removeEventListener("error", this._boundXhrOnError, false);
        this.xhr.removeEventListener("timeout", this._boundXhrOnTimeout, false);
        this.xhr.removeEventListener("abort", this._boundXhrOnAbort, false);
        this.xhr.removeEventListener("progress", this._boundOnProgress, false);
        this.xhr.removeEventListener("load", this._boundXhrOnLoad, false);
      } else {
        this.xhr.onerror = null;
        this.xhr.ontimeout = null;
        this.xhr.onprogress = null;
        this.xhr.onload = null;
      }
    }
  };
  LoaderResource2.prototype._finish = function() {
    if (this.isComplete) {
      throw new Error("Complete called again for an already completed resource.");
    }
    this._setFlag(LoaderResource2.STATUS_FLAGS.COMPLETE, true);
    this._setFlag(LoaderResource2.STATUS_FLAGS.LOADING, false);
    this.onComplete.dispatch(this);
  };
  LoaderResource2.prototype._loadElement = function(type) {
    if (this.metadata.loadElement) {
      this.data = this.metadata.loadElement;
    } else if (type === "image" && typeof globalThis.Image !== "undefined") {
      this.data = new Image();
    } else {
      this.data = document.createElement(type);
    }
    if (this.crossOrigin) {
      this.data.crossOrigin = this.crossOrigin;
    }
    if (!this.metadata.skipSource) {
      this.data.src = this.url;
    }
    this.data.addEventListener("error", this._boundOnError, false);
    this.data.addEventListener("load", this._boundComplete, false);
    this.data.addEventListener("progress", this._boundOnProgress, false);
    if (this.timeout) {
      this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
    }
  };
  LoaderResource2.prototype._loadSourceElement = function(type) {
    if (this.metadata.loadElement) {
      this.data = this.metadata.loadElement;
    } else if (type === "audio" && typeof globalThis.Audio !== "undefined") {
      this.data = new Audio();
    } else {
      this.data = document.createElement(type);
    }
    if (this.data === null) {
      this.abort("Unsupported element: " + type);
      return;
    }
    if (this.crossOrigin) {
      this.data.crossOrigin = this.crossOrigin;
    }
    if (!this.metadata.skipSource) {
      if (navigator.isCocoonJS) {
        this.data.src = Array.isArray(this.url) ? this.url[0] : this.url;
      } else if (Array.isArray(this.url)) {
        var mimeTypes = this.metadata.mimeType;
        for (var i = 0; i < this.url.length; ++i) {
          this.data.appendChild(this._createSource(type, this.url[i], Array.isArray(mimeTypes) ? mimeTypes[i] : mimeTypes));
        }
      } else {
        var mimeTypes = this.metadata.mimeType;
        this.data.appendChild(this._createSource(type, this.url, Array.isArray(mimeTypes) ? mimeTypes[0] : mimeTypes));
      }
    }
    this.data.addEventListener("error", this._boundOnError, false);
    this.data.addEventListener("load", this._boundComplete, false);
    this.data.addEventListener("progress", this._boundOnProgress, false);
    this.data.addEventListener("canplaythrough", this._boundComplete, false);
    this.data.load();
    if (this.timeout) {
      this._elementTimer = setTimeout(this._boundOnTimeout, this.timeout);
    }
  };
  LoaderResource2.prototype._loadXhr = function() {
    if (typeof this.xhrType !== "string") {
      this.xhrType = this._determineXhrType();
    }
    var xhr = this.xhr = new XMLHttpRequest();
    if (this.crossOrigin === "use-credentials") {
      xhr.withCredentials = true;
    }
    xhr.open("GET", this.url, true);
    xhr.timeout = this.timeout;
    if (this.xhrType === LoaderResource2.XHR_RESPONSE_TYPE.JSON || this.xhrType === LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT) {
      xhr.responseType = LoaderResource2.XHR_RESPONSE_TYPE.TEXT;
    } else {
      xhr.responseType = this.xhrType;
    }
    xhr.addEventListener("error", this._boundXhrOnError, false);
    xhr.addEventListener("timeout", this._boundXhrOnTimeout, false);
    xhr.addEventListener("abort", this._boundXhrOnAbort, false);
    xhr.addEventListener("progress", this._boundOnProgress, false);
    xhr.addEventListener("load", this._boundXhrOnLoad, false);
    xhr.send();
  };
  LoaderResource2.prototype._loadXdr = function() {
    if (typeof this.xhrType !== "string") {
      this.xhrType = this._determineXhrType();
    }
    var xdr = this.xhr = new globalThis.XDomainRequest();
    xdr.timeout = this.timeout || 5e3;
    xdr.onerror = this._boundXhrOnError;
    xdr.ontimeout = this._boundXhrOnTimeout;
    xdr.onprogress = this._boundOnProgress;
    xdr.onload = this._boundXhrOnLoad;
    xdr.open("GET", this.url, true);
    setTimeout(function() {
      return xdr.send();
    }, 1);
  };
  LoaderResource2.prototype._createSource = function(type, url2, mime) {
    if (!mime) {
      mime = type + "/" + this._getExtension(url2);
    }
    var source = document.createElement("source");
    source.src = url2;
    source.type = mime;
    return source;
  };
  LoaderResource2.prototype._onError = function(event) {
    this.abort("Failed to load element using: " + event.target.nodeName);
  };
  LoaderResource2.prototype._onProgress = function(event) {
    if (event && event.lengthComputable) {
      this.onProgress.dispatch(this, event.loaded / event.total);
    }
  };
  LoaderResource2.prototype._onTimeout = function() {
    this.abort("Load timed out.");
  };
  LoaderResource2.prototype._xhrOnError = function() {
    var xhr = this.xhr;
    this.abort(reqType(xhr) + " Request failed. Status: " + xhr.status + ', text: "' + xhr.statusText + '"');
  };
  LoaderResource2.prototype._xhrOnTimeout = function() {
    var xhr = this.xhr;
    this.abort(reqType(xhr) + " Request timed out.");
  };
  LoaderResource2.prototype._xhrOnAbort = function() {
    var xhr = this.xhr;
    this.abort(reqType(xhr) + " Request was aborted by the user.");
  };
  LoaderResource2.prototype._xhrOnLoad = function() {
    var xhr = this.xhr;
    var text = "";
    var status = typeof xhr.status === "undefined" ? STATUS_OK : xhr.status;
    if (xhr.responseType === "" || xhr.responseType === "text" || typeof xhr.responseType === "undefined") {
      text = xhr.responseText;
    }
    if (status === STATUS_NONE && (text.length > 0 || xhr.responseType === LoaderResource2.XHR_RESPONSE_TYPE.BUFFER)) {
      status = STATUS_OK;
    } else if (status === STATUS_IE_BUG_EMPTY) {
      status = STATUS_EMPTY;
    }
    var statusType = status / 100 | 0;
    if (statusType === STATUS_TYPE_OK) {
      if (this.xhrType === LoaderResource2.XHR_RESPONSE_TYPE.TEXT) {
        this.data = text;
        this.type = LoaderResource2.TYPE.TEXT;
      } else if (this.xhrType === LoaderResource2.XHR_RESPONSE_TYPE.JSON) {
        try {
          this.data = JSON.parse(text);
          this.type = LoaderResource2.TYPE.JSON;
        } catch (e) {
          this.abort("Error trying to parse loaded json: " + e);
          return;
        }
      } else if (this.xhrType === LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT) {
        try {
          if (globalThis.DOMParser) {
            var domparser = new DOMParser();
            this.data = domparser.parseFromString(text, "text/xml");
          } else {
            var div = document.createElement("div");
            div.innerHTML = text;
            this.data = div;
          }
          this.type = LoaderResource2.TYPE.XML;
        } catch (e$1) {
          this.abort("Error trying to parse loaded xml: " + e$1);
          return;
        }
      } else {
        this.data = xhr.response || text;
      }
    } else {
      this.abort("[" + xhr.status + "] " + xhr.statusText + ": " + xhr.responseURL);
      return;
    }
    this.complete();
  };
  LoaderResource2.prototype._determineCrossOrigin = function(url2, loc) {
    if (url2.indexOf("data:") === 0) {
      return "";
    }
    if (globalThis.origin !== globalThis.location.origin) {
      return "anonymous";
    }
    loc = loc || globalThis.location;
    if (!tempAnchor) {
      tempAnchor = document.createElement("a");
    }
    tempAnchor.href = url2;
    var parsedUrl = parseUri(tempAnchor.href, { strictMode: true });
    var samePort = !parsedUrl.port && loc.port === "" || parsedUrl.port === loc.port;
    var protocol = parsedUrl.protocol ? parsedUrl.protocol + ":" : "";
    if (parsedUrl.host !== loc.hostname || !samePort || protocol !== loc.protocol) {
      return "anonymous";
    }
    return "";
  };
  LoaderResource2.prototype._determineXhrType = function() {
    return LoaderResource2._xhrTypeMap[this.extension] || LoaderResource2.XHR_RESPONSE_TYPE.TEXT;
  };
  LoaderResource2.prototype._determineLoadType = function() {
    return LoaderResource2._loadTypeMap[this.extension] || LoaderResource2.LOAD_TYPE.XHR;
  };
  LoaderResource2.prototype._getExtension = function(url2) {
    if (url2 === void 0) {
      url2 = this.url;
    }
    var ext = "";
    if (this.isDataUrl) {
      var slashIndex = url2.indexOf("/");
      ext = url2.substring(slashIndex + 1, url2.indexOf(";", slashIndex));
    } else {
      var queryStart = url2.indexOf("?");
      var hashStart = url2.indexOf("#");
      var index2 = Math.min(queryStart > -1 ? queryStart : url2.length, hashStart > -1 ? hashStart : url2.length);
      url2 = url2.substring(0, index2);
      ext = url2.substring(url2.lastIndexOf(".") + 1);
    }
    return ext.toLowerCase();
  };
  LoaderResource2.prototype._getMimeFromXhrType = function(type) {
    switch (type) {
      case LoaderResource2.XHR_RESPONSE_TYPE.BUFFER:
        return "application/octet-binary";
      case LoaderResource2.XHR_RESPONSE_TYPE.BLOB:
        return "application/blob";
      case LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT:
        return "application/xml";
      case LoaderResource2.XHR_RESPONSE_TYPE.JSON:
        return "application/json";
      case LoaderResource2.XHR_RESPONSE_TYPE.DEFAULT:
      case LoaderResource2.XHR_RESPONSE_TYPE.TEXT:
      default:
        return "text/plain";
    }
  };
  return LoaderResource2;
}();
(function(LoaderResource2) {
  (function(STATUS_FLAGS) {
    STATUS_FLAGS[STATUS_FLAGS["NONE"] = 0] = "NONE";
    STATUS_FLAGS[STATUS_FLAGS["DATA_URL"] = 1] = "DATA_URL";
    STATUS_FLAGS[STATUS_FLAGS["COMPLETE"] = 2] = "COMPLETE";
    STATUS_FLAGS[STATUS_FLAGS["LOADING"] = 4] = "LOADING";
  })(LoaderResource2.STATUS_FLAGS || (LoaderResource2.STATUS_FLAGS = {}));
  (function(TYPE) {
    TYPE[TYPE["UNKNOWN"] = 0] = "UNKNOWN";
    TYPE[TYPE["JSON"] = 1] = "JSON";
    TYPE[TYPE["XML"] = 2] = "XML";
    TYPE[TYPE["IMAGE"] = 3] = "IMAGE";
    TYPE[TYPE["AUDIO"] = 4] = "AUDIO";
    TYPE[TYPE["VIDEO"] = 5] = "VIDEO";
    TYPE[TYPE["TEXT"] = 6] = "TEXT";
  })(LoaderResource2.TYPE || (LoaderResource2.TYPE = {}));
  (function(LOAD_TYPE) {
    LOAD_TYPE[LOAD_TYPE["XHR"] = 1] = "XHR";
    LOAD_TYPE[LOAD_TYPE["IMAGE"] = 2] = "IMAGE";
    LOAD_TYPE[LOAD_TYPE["AUDIO"] = 3] = "AUDIO";
    LOAD_TYPE[LOAD_TYPE["VIDEO"] = 4] = "VIDEO";
  })(LoaderResource2.LOAD_TYPE || (LoaderResource2.LOAD_TYPE = {}));
  (function(XHR_RESPONSE_TYPE) {
    XHR_RESPONSE_TYPE["DEFAULT"] = "text";
    XHR_RESPONSE_TYPE["BUFFER"] = "arraybuffer";
    XHR_RESPONSE_TYPE["BLOB"] = "blob";
    XHR_RESPONSE_TYPE["DOCUMENT"] = "document";
    XHR_RESPONSE_TYPE["JSON"] = "json";
    XHR_RESPONSE_TYPE["TEXT"] = "text";
  })(LoaderResource2.XHR_RESPONSE_TYPE || (LoaderResource2.XHR_RESPONSE_TYPE = {}));
  LoaderResource2._loadTypeMap = {
    gif: LoaderResource2.LOAD_TYPE.IMAGE,
    png: LoaderResource2.LOAD_TYPE.IMAGE,
    bmp: LoaderResource2.LOAD_TYPE.IMAGE,
    jpg: LoaderResource2.LOAD_TYPE.IMAGE,
    jpeg: LoaderResource2.LOAD_TYPE.IMAGE,
    tif: LoaderResource2.LOAD_TYPE.IMAGE,
    tiff: LoaderResource2.LOAD_TYPE.IMAGE,
    webp: LoaderResource2.LOAD_TYPE.IMAGE,
    tga: LoaderResource2.LOAD_TYPE.IMAGE,
    avif: LoaderResource2.LOAD_TYPE.IMAGE,
    svg: LoaderResource2.LOAD_TYPE.IMAGE,
    "svg+xml": LoaderResource2.LOAD_TYPE.IMAGE,
    mp3: LoaderResource2.LOAD_TYPE.AUDIO,
    ogg: LoaderResource2.LOAD_TYPE.AUDIO,
    wav: LoaderResource2.LOAD_TYPE.AUDIO,
    mp4: LoaderResource2.LOAD_TYPE.VIDEO,
    webm: LoaderResource2.LOAD_TYPE.VIDEO
  };
  LoaderResource2._xhrTypeMap = {
    xhtml: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    html: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    htm: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    xml: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    tmx: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    svg: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    tsx: LoaderResource2.XHR_RESPONSE_TYPE.DOCUMENT,
    gif: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    png: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    bmp: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    jpg: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    jpeg: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    tif: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    tiff: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    webp: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    tga: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    avif: LoaderResource2.XHR_RESPONSE_TYPE.BLOB,
    json: LoaderResource2.XHR_RESPONSE_TYPE.JSON,
    text: LoaderResource2.XHR_RESPONSE_TYPE.TEXT,
    txt: LoaderResource2.XHR_RESPONSE_TYPE.TEXT,
    ttf: LoaderResource2.XHR_RESPONSE_TYPE.BUFFER,
    otf: LoaderResource2.XHR_RESPONSE_TYPE.BUFFER
  };
  LoaderResource2.EMPTY_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
})(LoaderResource || (LoaderResource = {}));
function _noop() {
}
function onlyOnce(fn) {
  return function onceWrapper() {
    var arguments$1 = arguments;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments$1[_i];
    }
    if (fn === null) {
      throw new Error("Callback was already called.");
    }
    var callFn = fn;
    fn = null;
    callFn.apply(this, args);
  };
}
var AsyncQueueItem = function() {
  function AsyncQueueItem2(data, callback) {
    this.data = data;
    this.callback = callback;
  }
  return AsyncQueueItem2;
}();
var AsyncQueue = function() {
  function AsyncQueue2(worker, concurrency) {
    var _this = this;
    if (concurrency === void 0) {
      concurrency = 1;
    }
    this.workers = 0;
    this.saturated = _noop;
    this.unsaturated = _noop;
    this.empty = _noop;
    this.drain = _noop;
    this.error = _noop;
    this.started = false;
    this.paused = false;
    this._tasks = [];
    this._insert = function(data, insertAtFront, callback) {
      if (callback && typeof callback !== "function") {
        throw new Error("task callback must be a function");
      }
      _this.started = true;
      if (data == null && _this.idle()) {
        setTimeout(function() {
          return _this.drain();
        }, 1);
        return;
      }
      var item = new AsyncQueueItem(data, typeof callback === "function" ? callback : _noop);
      if (insertAtFront) {
        _this._tasks.unshift(item);
      } else {
        _this._tasks.push(item);
      }
      setTimeout(_this.process, 1);
    };
    this.process = function() {
      while (!_this.paused && _this.workers < _this.concurrency && _this._tasks.length) {
        var task = _this._tasks.shift();
        if (_this._tasks.length === 0) {
          _this.empty();
        }
        _this.workers += 1;
        if (_this.workers === _this.concurrency) {
          _this.saturated();
        }
        _this._worker(task.data, onlyOnce(_this._next(task)));
      }
    };
    this._worker = worker;
    if (concurrency === 0) {
      throw new Error("Concurrency must not be zero");
    }
    this.concurrency = concurrency;
    this.buffer = concurrency / 4;
  }
  AsyncQueue2.prototype._next = function(task) {
    var _this = this;
    return function() {
      var arguments$1 = arguments;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments$1[_i];
      }
      _this.workers -= 1;
      task.callback.apply(task, args);
      if (args[0] != null) {
        _this.error(args[0], task.data);
      }
      if (_this.workers <= _this.concurrency - _this.buffer) {
        _this.unsaturated();
      }
      if (_this.idle()) {
        _this.drain();
      }
      _this.process();
    };
  };
  AsyncQueue2.prototype.push = function(data, callback) {
    this._insert(data, false, callback);
  };
  AsyncQueue2.prototype.kill = function() {
    this.workers = 0;
    this.drain = _noop;
    this.started = false;
    this._tasks = [];
  };
  AsyncQueue2.prototype.unshift = function(data, callback) {
    this._insert(data, true, callback);
  };
  AsyncQueue2.prototype.length = function() {
    return this._tasks.length;
  };
  AsyncQueue2.prototype.running = function() {
    return this.workers;
  };
  AsyncQueue2.prototype.idle = function() {
    return this._tasks.length + this.workers === 0;
  };
  AsyncQueue2.prototype.pause = function() {
    if (this.paused === true) {
      return;
    }
    this.paused = true;
  };
  AsyncQueue2.prototype.resume = function() {
    if (this.paused === false) {
      return;
    }
    this.paused = false;
    for (var w = 1; w <= this.concurrency; w++) {
      this.process();
    }
  };
  AsyncQueue2.eachSeries = function(array, iterator, callback, deferNext) {
    var i = 0;
    var len = array.length;
    function next(err) {
      if (err || i === len) {
        if (callback) {
          callback(err);
        }
        return;
      }
      if (deferNext) {
        setTimeout(function() {
          iterator(array[i++], next);
        }, 1);
      } else {
        iterator(array[i++], next);
      }
    }
    next();
  };
  AsyncQueue2.queue = function(worker, concurrency) {
    return new AsyncQueue2(worker, concurrency);
  };
  return AsyncQueue2;
}();
var MAX_PROGRESS = 100;
var rgxExtractUrlHash = /(#[\w-]+)?$/;
var Loader = function() {
  function Loader2(baseUrl, concurrency) {
    var _this = this;
    if (baseUrl === void 0) {
      baseUrl = "";
    }
    if (concurrency === void 0) {
      concurrency = 10;
    }
    this.progress = 0;
    this.loading = false;
    this.defaultQueryString = "";
    this._beforeMiddleware = [];
    this._afterMiddleware = [];
    this._resourcesParsing = [];
    this._boundLoadResource = function(r, d) {
      return _this._loadResource(r, d);
    };
    this.resources = {};
    this.baseUrl = baseUrl;
    this._beforeMiddleware = [];
    this._afterMiddleware = [];
    this._resourcesParsing = [];
    this._boundLoadResource = function(r, d) {
      return _this._loadResource(r, d);
    };
    this._queue = AsyncQueue.queue(this._boundLoadResource, concurrency);
    this._queue.pause();
    this.resources = {};
    this.onProgress = new Signal();
    this.onError = new Signal();
    this.onLoad = new Signal();
    this.onStart = new Signal();
    this.onComplete = new Signal();
    for (var i = 0; i < Loader2._plugins.length; ++i) {
      var plugin = Loader2._plugins[i];
      var pre = plugin.pre, use = plugin.use;
      if (pre) {
        this.pre(pre);
      }
      if (use) {
        this.use(use);
      }
    }
    this._protected = false;
  }
  Loader2.prototype._add = function(name, url2, options, callback) {
    if (this.loading && (!options || !options.parentResource)) {
      throw new Error("Cannot add resources while the loader is running.");
    }
    if (this.resources[name]) {
      throw new Error('Resource named "' + name + '" already exists.');
    }
    url2 = this._prepareUrl(url2);
    this.resources[name] = new LoaderResource(name, url2, options);
    if (typeof callback === "function") {
      this.resources[name].onAfterMiddleware.once(callback);
    }
    if (this.loading) {
      var parent = options.parentResource;
      var incompleteChildren = [];
      for (var i = 0; i < parent.children.length; ++i) {
        if (!parent.children[i].isComplete) {
          incompleteChildren.push(parent.children[i]);
        }
      }
      var fullChunk = parent.progressChunk * (incompleteChildren.length + 1);
      var eachChunk = fullChunk / (incompleteChildren.length + 2);
      parent.children.push(this.resources[name]);
      parent.progressChunk = eachChunk;
      for (var i = 0; i < incompleteChildren.length; ++i) {
        incompleteChildren[i].progressChunk = eachChunk;
      }
      this.resources[name].progressChunk = eachChunk;
    }
    this._queue.push(this.resources[name]);
    return this;
  };
  Loader2.prototype.pre = function(fn) {
    this._beforeMiddleware.push(fn);
    return this;
  };
  Loader2.prototype.use = function(fn) {
    this._afterMiddleware.push(fn);
    return this;
  };
  Loader2.prototype.reset = function() {
    this.progress = 0;
    this.loading = false;
    this._queue.kill();
    this._queue.pause();
    for (var k in this.resources) {
      var res = this.resources[k];
      if (res._onLoadBinding) {
        res._onLoadBinding.detach();
      }
      if (res.isLoading) {
        res.abort("loader reset");
      }
    }
    this.resources = {};
    return this;
  };
  Loader2.prototype.load = function(cb) {
    deprecation("6.5.0", "@pixi/loaders is being replaced with @pixi/assets in the next major release.");
    if (typeof cb === "function") {
      this.onComplete.once(cb);
    }
    if (this.loading) {
      return this;
    }
    if (this._queue.idle()) {
      this._onStart();
      this._onComplete();
    } else {
      var numTasks = this._queue._tasks.length;
      var chunk = MAX_PROGRESS / numTasks;
      for (var i = 0; i < this._queue._tasks.length; ++i) {
        this._queue._tasks[i].data.progressChunk = chunk;
      }
      this._onStart();
      this._queue.resume();
    }
    return this;
  };
  Object.defineProperty(Loader2.prototype, "concurrency", {
    get: function() {
      return this._queue.concurrency;
    },
    set: function(concurrency) {
      this._queue.concurrency = concurrency;
    },
    enumerable: false,
    configurable: true
  });
  Loader2.prototype._prepareUrl = function(url2) {
    var parsedUrl = parseUri(url2, { strictMode: true });
    var result2;
    if (parsedUrl.protocol || !parsedUrl.path || url2.indexOf("//") === 0) {
      result2 = url2;
    } else if (this.baseUrl.length && this.baseUrl.lastIndexOf("/") !== this.baseUrl.length - 1 && url2.charAt(0) !== "/") {
      result2 = this.baseUrl + "/" + url2;
    } else {
      result2 = this.baseUrl + url2;
    }
    if (this.defaultQueryString) {
      var hash = rgxExtractUrlHash.exec(result2)[0];
      result2 = result2.slice(0, result2.length - hash.length);
      if (result2.indexOf("?") !== -1) {
        result2 += "&" + this.defaultQueryString;
      } else {
        result2 += "?" + this.defaultQueryString;
      }
      result2 += hash;
    }
    return result2;
  };
  Loader2.prototype._loadResource = function(resource, dequeue) {
    var _this = this;
    resource._dequeue = dequeue;
    AsyncQueue.eachSeries(this._beforeMiddleware, function(fn, next) {
      fn.call(_this, resource, function() {
        next(resource.isComplete ? {} : null);
      });
    }, function() {
      if (resource.isComplete) {
        _this._onLoad(resource);
      } else {
        resource._onLoadBinding = resource.onComplete.once(_this._onLoad, _this);
        resource.load();
      }
    }, true);
  };
  Loader2.prototype._onStart = function() {
    this.progress = 0;
    this.loading = true;
    this.onStart.dispatch(this);
  };
  Loader2.prototype._onComplete = function() {
    this.progress = MAX_PROGRESS;
    this.loading = false;
    this.onComplete.dispatch(this, this.resources);
  };
  Loader2.prototype._onLoad = function(resource) {
    var _this = this;
    resource._onLoadBinding = null;
    this._resourcesParsing.push(resource);
    resource._dequeue();
    AsyncQueue.eachSeries(this._afterMiddleware, function(fn, next) {
      fn.call(_this, resource, next);
    }, function() {
      resource.onAfterMiddleware.dispatch(resource);
      _this.progress = Math.min(MAX_PROGRESS, _this.progress + resource.progressChunk);
      _this.onProgress.dispatch(_this, resource);
      if (resource.error) {
        _this.onError.dispatch(resource.error, _this, resource);
      } else {
        _this.onLoad.dispatch(_this, resource);
      }
      _this._resourcesParsing.splice(_this._resourcesParsing.indexOf(resource), 1);
      if (_this._queue.idle() && _this._resourcesParsing.length === 0) {
        _this._onComplete();
      }
    }, true);
  };
  Loader2.prototype.destroy = function() {
    if (!this._protected) {
      this.reset();
    }
  };
  Object.defineProperty(Loader2, "shared", {
    get: function() {
      var shared = Loader2._shared;
      if (!shared) {
        shared = new Loader2();
        shared._protected = true;
        Loader2._shared = shared;
      }
      return shared;
    },
    enumerable: false,
    configurable: true
  });
  Loader2.registerPlugin = function(plugin) {
    deprecation("6.5.0", "Loader.registerPlugin() is deprecated, use extensions.add() instead.");
    extensions.add({
      type: ExtensionType.Loader,
      ref: plugin
    });
    return Loader2;
  };
  Loader2._plugins = [];
  return Loader2;
}();
extensions.handleByList(ExtensionType.Loader, Loader._plugins);
Loader.prototype.add = function add(name, url2, options, callback) {
  if (Array.isArray(name)) {
    for (var i = 0; i < name.length; ++i) {
      this.add(name[i]);
    }
    return this;
  }
  if (typeof name === "object") {
    options = name;
    callback = url2 || options.callback || options.onComplete;
    url2 = options.url;
    name = options.name || options.key || options.url;
  }
  if (typeof url2 !== "string") {
    callback = options;
    options = url2;
    url2 = name;
  }
  if (typeof url2 !== "string") {
    throw new Error("No url passed to add resource to loader.");
  }
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  return this._add(name, url2, options, callback);
};
var AppLoaderPlugin = function() {
  function AppLoaderPlugin2() {
  }
  AppLoaderPlugin2.init = function(options) {
    options = Object.assign({
      sharedLoader: false
    }, options);
    this.loader = options.sharedLoader ? Loader.shared : new Loader();
  };
  AppLoaderPlugin2.destroy = function() {
    if (this.loader) {
      this.loader.destroy();
      this.loader = null;
    }
  };
  AppLoaderPlugin2.extension = ExtensionType.Application;
  return AppLoaderPlugin2;
}();
var TextureLoader = function() {
  function TextureLoader2() {
  }
  TextureLoader2.add = function() {
    LoaderResource.setExtensionLoadType("svg", LoaderResource.LOAD_TYPE.XHR);
    LoaderResource.setExtensionXhrType("svg", LoaderResource.XHR_RESPONSE_TYPE.TEXT);
  };
  TextureLoader2.use = function(resource, next) {
    if (resource.data && (resource.type === LoaderResource.TYPE.IMAGE || resource.extension === "svg")) {
      var data = resource.data, url2 = resource.url, name = resource.name, metadata = resource.metadata;
      Texture.fromLoader(data, url2, name, metadata).then(function(texture) {
        resource.texture = texture;
        next();
      }).catch(next);
    } else {
      next();
    }
  };
  TextureLoader2.extension = ExtensionType.Loader;
  return TextureLoader2;
}();
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function encodeBinary(input) {
  var output = "";
  var inx = 0;
  while (inx < input.length) {
    var bytebuffer = [0, 0, 0];
    var encodedCharIndexes = [0, 0, 0, 0];
    for (var jnx = 0; jnx < bytebuffer.length; ++jnx) {
      if (inx < input.length) {
        bytebuffer[jnx] = input.charCodeAt(inx++) & 255;
      } else {
        bytebuffer[jnx] = 0;
      }
    }
    encodedCharIndexes[0] = bytebuffer[0] >> 2;
    encodedCharIndexes[1] = (bytebuffer[0] & 3) << 4 | bytebuffer[1] >> 4;
    encodedCharIndexes[2] = (bytebuffer[1] & 15) << 2 | bytebuffer[2] >> 6;
    encodedCharIndexes[3] = bytebuffer[2] & 63;
    var paddingBytes = inx - (input.length - 1);
    switch (paddingBytes) {
      case 2:
        encodedCharIndexes[3] = 64;
        encodedCharIndexes[2] = 64;
        break;
      case 1:
        encodedCharIndexes[3] = 64;
        break;
    }
    for (var jnx = 0; jnx < encodedCharIndexes.length; ++jnx) {
      output += _keyStr.charAt(encodedCharIndexes[jnx]);
    }
  }
  return output;
}
function parsing(resource, next) {
  if (!resource.data) {
    next();
    return;
  }
  if (resource.xhr && resource.xhrType === LoaderResource.XHR_RESPONSE_TYPE.BLOB) {
    if (!self.Blob || typeof resource.data === "string") {
      var type = resource.xhr.getResponseHeader("content-type");
      if (type && type.indexOf("image") === 0) {
        resource.data = new Image();
        resource.data.src = "data:" + type + ";base64," + encodeBinary(resource.xhr.responseText);
        resource.type = LoaderResource.TYPE.IMAGE;
        resource.data.onload = function() {
          resource.data.onload = null;
          next();
        };
        return;
      }
    } else if (resource.data.type.indexOf("image") === 0) {
      var Url_1 = globalThis.URL || globalThis.webkitURL;
      var src_1 = Url_1.createObjectURL(resource.data);
      resource.blob = resource.data;
      resource.data = new Image();
      resource.data.src = src_1;
      resource.type = LoaderResource.TYPE.IMAGE;
      resource.data.onload = function() {
        Url_1.revokeObjectURL(src_1);
        resource.data.onload = null;
        next();
      };
      return;
    }
  }
  next();
}
var ParsingLoader = function() {
  function ParsingLoader2() {
  }
  ParsingLoader2.extension = ExtensionType.Loader;
  ParsingLoader2.use = parsing;
  return ParsingLoader2;
}();
extensions.add(TextureLoader, ParsingLoader);
var _a$2;
var INTERNAL_FORMATS;
(function(INTERNAL_FORMATS2) {
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB_S3TC_DXT1_EXT"] = 33776] = "COMPRESSED_RGB_S3TC_DXT1_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_S3TC_DXT1_EXT"] = 33777] = "COMPRESSED_RGBA_S3TC_DXT1_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_S3TC_DXT3_EXT"] = 33778] = "COMPRESSED_RGBA_S3TC_DXT3_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_S3TC_DXT5_EXT"] = 33779] = "COMPRESSED_RGBA_S3TC_DXT5_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT"] = 35917] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT"] = 35918] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT"] = 35919] = "COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB_S3TC_DXT1_EXT"] = 35916] = "COMPRESSED_SRGB_S3TC_DXT1_EXT";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_R11_EAC"] = 37488] = "COMPRESSED_R11_EAC";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SIGNED_R11_EAC"] = 37489] = "COMPRESSED_SIGNED_R11_EAC";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RG11_EAC"] = 37490] = "COMPRESSED_RG11_EAC";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SIGNED_RG11_EAC"] = 37491] = "COMPRESSED_SIGNED_RG11_EAC";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB8_ETC2"] = 37492] = "COMPRESSED_RGB8_ETC2";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA8_ETC2_EAC"] = 37496] = "COMPRESSED_RGBA8_ETC2_EAC";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB8_ETC2"] = 37493] = "COMPRESSED_SRGB8_ETC2";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB8_ALPHA8_ETC2_EAC"] = 37497] = "COMPRESSED_SRGB8_ALPHA8_ETC2_EAC";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37494] = "COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2"] = 37495] = "COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB_PVRTC_4BPPV1_IMG"] = 35840] = "COMPRESSED_RGB_PVRTC_4BPPV1_IMG";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_PVRTC_4BPPV1_IMG"] = 35842] = "COMPRESSED_RGBA_PVRTC_4BPPV1_IMG";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB_PVRTC_2BPPV1_IMG"] = 35841] = "COMPRESSED_RGB_PVRTC_2BPPV1_IMG";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_PVRTC_2BPPV1_IMG"] = 35843] = "COMPRESSED_RGBA_PVRTC_2BPPV1_IMG";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB_ETC1_WEBGL"] = 36196] = "COMPRESSED_RGB_ETC1_WEBGL";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGB_ATC_WEBGL"] = 35986] = "COMPRESSED_RGB_ATC_WEBGL";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL"] = 35986] = "COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL"] = 34798] = "COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL";
  INTERNAL_FORMATS2[INTERNAL_FORMATS2["COMPRESSED_RGBA_ASTC_4x4_KHR"] = 37808] = "COMPRESSED_RGBA_ASTC_4x4_KHR";
})(INTERNAL_FORMATS || (INTERNAL_FORMATS = {}));
var INTERNAL_FORMAT_TO_BYTES_PER_PIXEL = (_a$2 = {}, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB_S3TC_DXT1_EXT] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB_S3TC_DXT1_EXT] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_R11_EAC] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_SIGNED_R11_EAC] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RG11_EAC] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_SIGNED_RG11_EAC] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB8_ETC2] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA8_ETC2_EAC] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB8_ETC2] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_4BPPV1_IMG] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB_PVRTC_2BPPV1_IMG] = 0.25, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG] = 0.25, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB_ETC1_WEBGL] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGB_ATC_WEBGL] = 0.5, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL] = 1, _a$2[INTERNAL_FORMATS.COMPRESSED_RGBA_ASTC_4x4_KHR] = 1, _a$2);
var extendStatics$g = function(d, b) {
  extendStatics$g = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$g(d, b);
};
function __extends$g(d, b) {
  extendStatics$g(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve2) {
      resolve2(value);
    });
  }
  return new (P || (P = Promise))(function(resolve2, reject2) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject2(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject2(e);
      }
    }
    function step(result2) {
      result2.done ? resolve2(result2.value) : adopt(result2.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1) {
      throw t[1];
    }
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) {
      throw new TypeError("Generator is already executing.");
    }
    while (_) {
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) {
          return t;
        }
        if (y = 0, t) {
          op = [op[0] & 2, t.value];
        }
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) {
              _.ops.pop();
            }
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    }
    if (op[0] & 5) {
      throw op[1];
    }
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
var BlobResource = function(_super) {
  __extends$g(BlobResource2, _super);
  function BlobResource2(source, options) {
    if (options === void 0) {
      options = { width: 1, height: 1, autoLoad: true };
    }
    var _this = this;
    var origin;
    var data;
    if (typeof source === "string") {
      origin = source;
      data = new Uint8Array();
    } else {
      origin = null;
      data = source;
    }
    _this = _super.call(this, data, options) || this;
    _this.origin = origin;
    _this.buffer = data ? new ViewableBuffer(data) : null;
    if (_this.origin && options.autoLoad !== false) {
      _this.load();
    }
    if (data && data.length) {
      _this.loaded = true;
      _this.onBlobLoaded(_this.buffer.rawBinaryData);
    }
    return _this;
  }
  BlobResource2.prototype.onBlobLoaded = function(_data) {
  };
  BlobResource2.prototype.load = function() {
    return __awaiter(this, void 0, Promise, function() {
      var response, blob, arrayBuffer;
      return __generator(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            return [4, fetch(this.origin)];
          case 1:
            response = _a2.sent();
            return [4, response.blob()];
          case 2:
            blob = _a2.sent();
            return [4, blob.arrayBuffer()];
          case 3:
            arrayBuffer = _a2.sent();
            this.data = new Uint32Array(arrayBuffer);
            this.buffer = new ViewableBuffer(arrayBuffer);
            this.loaded = true;
            this.onBlobLoaded(arrayBuffer);
            this.update();
            return [2, this];
        }
      });
    });
  };
  return BlobResource2;
}(BufferResource);
var CompressedTextureResource = function(_super) {
  __extends$g(CompressedTextureResource2, _super);
  function CompressedTextureResource2(source, options) {
    var _this = _super.call(this, source, options) || this;
    _this.format = options.format;
    _this.levels = options.levels || 1;
    _this._width = options.width;
    _this._height = options.height;
    _this._extension = CompressedTextureResource2._formatToExtension(_this.format);
    if (options.levelBuffers || _this.buffer) {
      _this._levelBuffers = options.levelBuffers || CompressedTextureResource2._createLevelBuffers(
        source instanceof Uint8Array ? source : _this.buffer.uint8View,
        _this.format,
        _this.levels,
        4,
        4,
        _this.width,
        _this.height
      );
    }
    return _this;
  }
  CompressedTextureResource2.prototype.upload = function(renderer, _texture, _glTexture) {
    var gl = renderer.gl;
    var extension = renderer.context.extensions[this._extension];
    if (!extension) {
      throw new Error(this._extension + " textures are not supported on the current machine");
    }
    if (!this._levelBuffers) {
      return false;
    }
    for (var i = 0, j = this.levels; i < j; i++) {
      var _a2 = this._levelBuffers[i], levelID = _a2.levelID, levelWidth = _a2.levelWidth, levelHeight = _a2.levelHeight, levelBuffer = _a2.levelBuffer;
      gl.compressedTexImage2D(gl.TEXTURE_2D, levelID, this.format, levelWidth, levelHeight, 0, levelBuffer);
    }
    return true;
  };
  CompressedTextureResource2.prototype.onBlobLoaded = function() {
    this._levelBuffers = CompressedTextureResource2._createLevelBuffers(
      this.buffer.uint8View,
      this.format,
      this.levels,
      4,
      4,
      this.width,
      this.height
    );
  };
  CompressedTextureResource2._formatToExtension = function(format2) {
    if (format2 >= 33776 && format2 <= 33779) {
      return "s3tc";
    } else if (format2 >= 37488 && format2 <= 37497) {
      return "etc";
    } else if (format2 >= 35840 && format2 <= 35843) {
      return "pvrtc";
    } else if (format2 >= 36196) {
      return "etc1";
    } else if (format2 >= 35986 && format2 <= 34798) {
      return "atc";
    }
    throw new Error("Invalid (compressed) texture format given!");
  };
  CompressedTextureResource2._createLevelBuffers = function(buffer, format2, levels, blockWidth, blockHeight, imageWidth, imageHeight) {
    var buffers = new Array(levels);
    var offset = buffer.byteOffset;
    var levelWidth = imageWidth;
    var levelHeight = imageHeight;
    var alignedLevelWidth = levelWidth + blockWidth - 1 & ~(blockWidth - 1);
    var alignedLevelHeight = levelHeight + blockHeight - 1 & ~(blockHeight - 1);
    var levelSize = alignedLevelWidth * alignedLevelHeight * INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[format2];
    for (var i = 0; i < levels; i++) {
      buffers[i] = {
        levelID: i,
        levelWidth: levels > 1 ? levelWidth : alignedLevelWidth,
        levelHeight: levels > 1 ? levelHeight : alignedLevelHeight,
        levelBuffer: new Uint8Array(buffer.buffer, offset, levelSize)
      };
      offset += levelSize;
      levelWidth = levelWidth >> 1 || 1;
      levelHeight = levelHeight >> 1 || 1;
      alignedLevelWidth = levelWidth + blockWidth - 1 & ~(blockWidth - 1);
      alignedLevelHeight = levelHeight + blockHeight - 1 & ~(blockHeight - 1);
      levelSize = alignedLevelWidth * alignedLevelHeight * INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[format2];
    }
    return buffers;
  };
  return CompressedTextureResource2;
}(BlobResource);
var CompressedTextureLoader = function() {
  function CompressedTextureLoader2() {
  }
  CompressedTextureLoader2.use = function(resource, next) {
    var data = resource.data;
    var loader = this;
    if (resource.type === LoaderResource.TYPE.JSON && data && data.cacheID && data.textures) {
      var textures = data.textures;
      var textureURL = void 0;
      var fallbackURL = void 0;
      for (var i = 0, j = textures.length; i < j; i++) {
        var texture = textures[i];
        var url_1 = texture.src;
        var format2 = texture.format;
        if (!format2) {
          fallbackURL = url_1;
        }
        if (CompressedTextureLoader2.textureFormats[format2]) {
          textureURL = url_1;
          break;
        }
      }
      textureURL = textureURL || fallbackURL;
      if (!textureURL) {
        next(new Error("Cannot load compressed-textures in " + resource.url + ", make sure you provide a fallback"));
        return;
      }
      if (textureURL === resource.url) {
        next(new Error("URL of compressed texture cannot be the same as the manifest's URL"));
        return;
      }
      var loadOptions = {
        crossOrigin: resource.crossOrigin,
        metadata: resource.metadata.imageMetadata,
        parentResource: resource
      };
      var resourcePath = url.resolve(resource.url.replace(loader.baseUrl, ""), textureURL);
      var resourceName = data.cacheID;
      loader.add(resourceName, resourcePath, loadOptions, function(res) {
        if (res.error) {
          next(res.error);
          return;
        }
        var _a2 = res.texture, texture2 = _a2 === void 0 ? null : _a2, _b2 = res.textures, textures2 = _b2 === void 0 ? {} : _b2;
        Object.assign(resource, { texture: texture2, textures: textures2 });
        next();
      });
    } else {
      next();
    }
  };
  Object.defineProperty(CompressedTextureLoader2, "textureExtensions", {
    get: function() {
      if (!CompressedTextureLoader2._textureExtensions) {
        var canvas = settings.ADAPTER.createCanvas();
        var gl = canvas.getContext("webgl");
        if (!gl) {
          console.warn("WebGL not available for compressed textures. Silently failing.");
          return {};
        }
        var extensions2 = {
          s3tc: gl.getExtension("WEBGL_compressed_texture_s3tc"),
          s3tc_sRGB: gl.getExtension("WEBGL_compressed_texture_s3tc_srgb"),
          etc: gl.getExtension("WEBGL_compressed_texture_etc"),
          etc1: gl.getExtension("WEBGL_compressed_texture_etc1"),
          pvrtc: gl.getExtension("WEBGL_compressed_texture_pvrtc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc"),
          atc: gl.getExtension("WEBGL_compressed_texture_atc"),
          astc: gl.getExtension("WEBGL_compressed_texture_astc")
        };
        CompressedTextureLoader2._textureExtensions = extensions2;
      }
      return CompressedTextureLoader2._textureExtensions;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(CompressedTextureLoader2, "textureFormats", {
    get: function() {
      if (!CompressedTextureLoader2._textureFormats) {
        var extensions2 = CompressedTextureLoader2.textureExtensions;
        CompressedTextureLoader2._textureFormats = {};
        for (var extensionName in extensions2) {
          var extension = extensions2[extensionName];
          if (!extension) {
            continue;
          }
          Object.assign(CompressedTextureLoader2._textureFormats, Object.getPrototypeOf(extension));
        }
      }
      return CompressedTextureLoader2._textureFormats;
    },
    enumerable: false,
    configurable: true
  });
  CompressedTextureLoader2.extension = ExtensionType.Loader;
  return CompressedTextureLoader2;
}();
function registerCompressedTextures(url2, resources2, metadata) {
  var result2 = {
    textures: {},
    texture: null
  };
  if (!resources2) {
    return result2;
  }
  var textures = resources2.map(function(resource) {
    return new Texture(new BaseTexture(resource, Object.assign({
      mipmap: MIPMAP_MODES.OFF,
      alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
    }, metadata)));
  });
  textures.forEach(function(texture, i) {
    var baseTexture = texture.baseTexture;
    var cacheID = url2 + "-" + (i + 1);
    BaseTexture.addToCache(baseTexture, cacheID);
    Texture.addToCache(texture, cacheID);
    if (i === 0) {
      BaseTexture.addToCache(baseTexture, url2);
      Texture.addToCache(texture, url2);
      result2.texture = texture;
    }
    result2.textures[cacheID] = texture;
  });
  return result2;
}
var _a$1, _b$1;
var DDS_MAGIC_SIZE = 4;
var DDS_HEADER_SIZE = 124;
var DDS_HEADER_PF_SIZE = 32;
var DDS_HEADER_DX10_SIZE = 20;
var DDS_MAGIC = 542327876;
var DDS_FIELDS = {
  SIZE: 1,
  FLAGS: 2,
  HEIGHT: 3,
  WIDTH: 4,
  MIPMAP_COUNT: 7,
  PIXEL_FORMAT: 19
};
var DDS_PF_FIELDS = {
  SIZE: 0,
  FLAGS: 1,
  FOURCC: 2,
  RGB_BITCOUNT: 3,
  R_BIT_MASK: 4,
  G_BIT_MASK: 5,
  B_BIT_MASK: 6,
  A_BIT_MASK: 7
};
var DDS_DX10_FIELDS = {
  DXGI_FORMAT: 0,
  RESOURCE_DIMENSION: 1,
  MISC_FLAG: 2,
  ARRAY_SIZE: 3,
  MISC_FLAGS2: 4
};
var DXGI_FORMAT;
(function(DXGI_FORMAT2) {
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_UNKNOWN"] = 0] = "DXGI_FORMAT_UNKNOWN";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32A32_TYPELESS"] = 1] = "DXGI_FORMAT_R32G32B32A32_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32A32_FLOAT"] = 2] = "DXGI_FORMAT_R32G32B32A32_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32A32_UINT"] = 3] = "DXGI_FORMAT_R32G32B32A32_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32A32_SINT"] = 4] = "DXGI_FORMAT_R32G32B32A32_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32_TYPELESS"] = 5] = "DXGI_FORMAT_R32G32B32_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32_FLOAT"] = 6] = "DXGI_FORMAT_R32G32B32_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32_UINT"] = 7] = "DXGI_FORMAT_R32G32B32_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32B32_SINT"] = 8] = "DXGI_FORMAT_R32G32B32_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16B16A16_TYPELESS"] = 9] = "DXGI_FORMAT_R16G16B16A16_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16B16A16_FLOAT"] = 10] = "DXGI_FORMAT_R16G16B16A16_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16B16A16_UNORM"] = 11] = "DXGI_FORMAT_R16G16B16A16_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16B16A16_UINT"] = 12] = "DXGI_FORMAT_R16G16B16A16_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16B16A16_SNORM"] = 13] = "DXGI_FORMAT_R16G16B16A16_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16B16A16_SINT"] = 14] = "DXGI_FORMAT_R16G16B16A16_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32_TYPELESS"] = 15] = "DXGI_FORMAT_R32G32_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32_FLOAT"] = 16] = "DXGI_FORMAT_R32G32_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32_UINT"] = 17] = "DXGI_FORMAT_R32G32_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G32_SINT"] = 18] = "DXGI_FORMAT_R32G32_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32G8X24_TYPELESS"] = 19] = "DXGI_FORMAT_R32G8X24_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_D32_FLOAT_S8X24_UINT"] = 20] = "DXGI_FORMAT_D32_FLOAT_S8X24_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32_FLOAT_X8X24_TYPELESS"] = 21] = "DXGI_FORMAT_R32_FLOAT_X8X24_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_X32_TYPELESS_G8X24_UINT"] = 22] = "DXGI_FORMAT_X32_TYPELESS_G8X24_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R10G10B10A2_TYPELESS"] = 23] = "DXGI_FORMAT_R10G10B10A2_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R10G10B10A2_UNORM"] = 24] = "DXGI_FORMAT_R10G10B10A2_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R10G10B10A2_UINT"] = 25] = "DXGI_FORMAT_R10G10B10A2_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R11G11B10_FLOAT"] = 26] = "DXGI_FORMAT_R11G11B10_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8B8A8_TYPELESS"] = 27] = "DXGI_FORMAT_R8G8B8A8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8B8A8_UNORM"] = 28] = "DXGI_FORMAT_R8G8B8A8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8B8A8_UNORM_SRGB"] = 29] = "DXGI_FORMAT_R8G8B8A8_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8B8A8_UINT"] = 30] = "DXGI_FORMAT_R8G8B8A8_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8B8A8_SNORM"] = 31] = "DXGI_FORMAT_R8G8B8A8_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8B8A8_SINT"] = 32] = "DXGI_FORMAT_R8G8B8A8_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16_TYPELESS"] = 33] = "DXGI_FORMAT_R16G16_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16_FLOAT"] = 34] = "DXGI_FORMAT_R16G16_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16_UNORM"] = 35] = "DXGI_FORMAT_R16G16_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16_UINT"] = 36] = "DXGI_FORMAT_R16G16_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16_SNORM"] = 37] = "DXGI_FORMAT_R16G16_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16G16_SINT"] = 38] = "DXGI_FORMAT_R16G16_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32_TYPELESS"] = 39] = "DXGI_FORMAT_R32_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_D32_FLOAT"] = 40] = "DXGI_FORMAT_D32_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32_FLOAT"] = 41] = "DXGI_FORMAT_R32_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32_UINT"] = 42] = "DXGI_FORMAT_R32_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R32_SINT"] = 43] = "DXGI_FORMAT_R32_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R24G8_TYPELESS"] = 44] = "DXGI_FORMAT_R24G8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_D24_UNORM_S8_UINT"] = 45] = "DXGI_FORMAT_D24_UNORM_S8_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R24_UNORM_X8_TYPELESS"] = 46] = "DXGI_FORMAT_R24_UNORM_X8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_X24_TYPELESS_G8_UINT"] = 47] = "DXGI_FORMAT_X24_TYPELESS_G8_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8_TYPELESS"] = 48] = "DXGI_FORMAT_R8G8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8_UNORM"] = 49] = "DXGI_FORMAT_R8G8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8_UINT"] = 50] = "DXGI_FORMAT_R8G8_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8_SNORM"] = 51] = "DXGI_FORMAT_R8G8_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8_SINT"] = 52] = "DXGI_FORMAT_R8G8_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16_TYPELESS"] = 53] = "DXGI_FORMAT_R16_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16_FLOAT"] = 54] = "DXGI_FORMAT_R16_FLOAT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_D16_UNORM"] = 55] = "DXGI_FORMAT_D16_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16_UNORM"] = 56] = "DXGI_FORMAT_R16_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16_UINT"] = 57] = "DXGI_FORMAT_R16_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16_SNORM"] = 58] = "DXGI_FORMAT_R16_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R16_SINT"] = 59] = "DXGI_FORMAT_R16_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8_TYPELESS"] = 60] = "DXGI_FORMAT_R8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8_UNORM"] = 61] = "DXGI_FORMAT_R8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8_UINT"] = 62] = "DXGI_FORMAT_R8_UINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8_SNORM"] = 63] = "DXGI_FORMAT_R8_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8_SINT"] = 64] = "DXGI_FORMAT_R8_SINT";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_A8_UNORM"] = 65] = "DXGI_FORMAT_A8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R1_UNORM"] = 66] = "DXGI_FORMAT_R1_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R9G9B9E5_SHAREDEXP"] = 67] = "DXGI_FORMAT_R9G9B9E5_SHAREDEXP";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R8G8_B8G8_UNORM"] = 68] = "DXGI_FORMAT_R8G8_B8G8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_G8R8_G8B8_UNORM"] = 69] = "DXGI_FORMAT_G8R8_G8B8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC1_TYPELESS"] = 70] = "DXGI_FORMAT_BC1_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC1_UNORM"] = 71] = "DXGI_FORMAT_BC1_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC1_UNORM_SRGB"] = 72] = "DXGI_FORMAT_BC1_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC2_TYPELESS"] = 73] = "DXGI_FORMAT_BC2_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC2_UNORM"] = 74] = "DXGI_FORMAT_BC2_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC2_UNORM_SRGB"] = 75] = "DXGI_FORMAT_BC2_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC3_TYPELESS"] = 76] = "DXGI_FORMAT_BC3_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC3_UNORM"] = 77] = "DXGI_FORMAT_BC3_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC3_UNORM_SRGB"] = 78] = "DXGI_FORMAT_BC3_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC4_TYPELESS"] = 79] = "DXGI_FORMAT_BC4_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC4_UNORM"] = 80] = "DXGI_FORMAT_BC4_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC4_SNORM"] = 81] = "DXGI_FORMAT_BC4_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC5_TYPELESS"] = 82] = "DXGI_FORMAT_BC5_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC5_UNORM"] = 83] = "DXGI_FORMAT_BC5_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC5_SNORM"] = 84] = "DXGI_FORMAT_BC5_SNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B5G6R5_UNORM"] = 85] = "DXGI_FORMAT_B5G6R5_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B5G5R5A1_UNORM"] = 86] = "DXGI_FORMAT_B5G5R5A1_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B8G8R8A8_UNORM"] = 87] = "DXGI_FORMAT_B8G8R8A8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B8G8R8X8_UNORM"] = 88] = "DXGI_FORMAT_B8G8R8X8_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_R10G10B10_XR_BIAS_A2_UNORM"] = 89] = "DXGI_FORMAT_R10G10B10_XR_BIAS_A2_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B8G8R8A8_TYPELESS"] = 90] = "DXGI_FORMAT_B8G8R8A8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B8G8R8A8_UNORM_SRGB"] = 91] = "DXGI_FORMAT_B8G8R8A8_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B8G8R8X8_TYPELESS"] = 92] = "DXGI_FORMAT_B8G8R8X8_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B8G8R8X8_UNORM_SRGB"] = 93] = "DXGI_FORMAT_B8G8R8X8_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC6H_TYPELESS"] = 94] = "DXGI_FORMAT_BC6H_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC6H_UF16"] = 95] = "DXGI_FORMAT_BC6H_UF16";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC6H_SF16"] = 96] = "DXGI_FORMAT_BC6H_SF16";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC7_TYPELESS"] = 97] = "DXGI_FORMAT_BC7_TYPELESS";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC7_UNORM"] = 98] = "DXGI_FORMAT_BC7_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_BC7_UNORM_SRGB"] = 99] = "DXGI_FORMAT_BC7_UNORM_SRGB";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_AYUV"] = 100] = "DXGI_FORMAT_AYUV";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_Y410"] = 101] = "DXGI_FORMAT_Y410";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_Y416"] = 102] = "DXGI_FORMAT_Y416";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_NV12"] = 103] = "DXGI_FORMAT_NV12";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_P010"] = 104] = "DXGI_FORMAT_P010";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_P016"] = 105] = "DXGI_FORMAT_P016";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_420_OPAQUE"] = 106] = "DXGI_FORMAT_420_OPAQUE";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_YUY2"] = 107] = "DXGI_FORMAT_YUY2";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_Y210"] = 108] = "DXGI_FORMAT_Y210";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_Y216"] = 109] = "DXGI_FORMAT_Y216";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_NV11"] = 110] = "DXGI_FORMAT_NV11";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_AI44"] = 111] = "DXGI_FORMAT_AI44";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_IA44"] = 112] = "DXGI_FORMAT_IA44";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_P8"] = 113] = "DXGI_FORMAT_P8";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_A8P8"] = 114] = "DXGI_FORMAT_A8P8";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_B4G4R4A4_UNORM"] = 115] = "DXGI_FORMAT_B4G4R4A4_UNORM";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_P208"] = 116] = "DXGI_FORMAT_P208";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_V208"] = 117] = "DXGI_FORMAT_V208";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_V408"] = 118] = "DXGI_FORMAT_V408";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_SAMPLER_FEEDBACK_MIN_MIP_OPAQUE"] = 119] = "DXGI_FORMAT_SAMPLER_FEEDBACK_MIN_MIP_OPAQUE";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_SAMPLER_FEEDBACK_MIP_REGION_USED_OPAQUE"] = 120] = "DXGI_FORMAT_SAMPLER_FEEDBACK_MIP_REGION_USED_OPAQUE";
  DXGI_FORMAT2[DXGI_FORMAT2["DXGI_FORMAT_FORCE_UINT"] = 121] = "DXGI_FORMAT_FORCE_UINT";
})(DXGI_FORMAT || (DXGI_FORMAT = {}));
var D3D10_RESOURCE_DIMENSION;
(function(D3D10_RESOURCE_DIMENSION2) {
  D3D10_RESOURCE_DIMENSION2[D3D10_RESOURCE_DIMENSION2["DDS_DIMENSION_TEXTURE1D"] = 2] = "DDS_DIMENSION_TEXTURE1D";
  D3D10_RESOURCE_DIMENSION2[D3D10_RESOURCE_DIMENSION2["DDS_DIMENSION_TEXTURE2D"] = 3] = "DDS_DIMENSION_TEXTURE2D";
  D3D10_RESOURCE_DIMENSION2[D3D10_RESOURCE_DIMENSION2["DDS_DIMENSION_TEXTURE3D"] = 6] = "DDS_DIMENSION_TEXTURE3D";
})(D3D10_RESOURCE_DIMENSION || (D3D10_RESOURCE_DIMENSION = {}));
var PF_FLAGS = 1;
var DDPF_ALPHA = 2;
var DDPF_FOURCC = 4;
var DDPF_RGB = 64;
var DDPF_YUV = 512;
var DDPF_LUMINANCE = 131072;
var FOURCC_DXT1 = 827611204;
var FOURCC_DXT3 = 861165636;
var FOURCC_DXT5 = 894720068;
var FOURCC_DX10 = 808540228;
var DDS_RESOURCE_MISC_TEXTURECUBE = 4;
var FOURCC_TO_FORMAT = (_a$1 = {}, _a$1[FOURCC_DXT1] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT, _a$1[FOURCC_DXT3] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT, _a$1[FOURCC_DXT5] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT, _a$1);
var DXGI_TO_FORMAT = (_b$1 = {}, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC1_TYPELESS] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC1_UNORM] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT1_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC2_TYPELESS] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC2_UNORM] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT3_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC3_TYPELESS] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC3_UNORM] = INTERNAL_FORMATS.COMPRESSED_RGBA_S3TC_DXT5_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC1_UNORM_SRGB] = INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC2_UNORM_SRGB] = INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT, _b$1[DXGI_FORMAT.DXGI_FORMAT_BC3_UNORM_SRGB] = INTERNAL_FORMATS.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT, _b$1);
function parseDDS(arrayBuffer) {
  var data = new Uint32Array(arrayBuffer);
  var magicWord = data[0];
  if (magicWord !== DDS_MAGIC) {
    throw new Error("Invalid DDS file magic word");
  }
  var header = new Uint32Array(arrayBuffer, 0, DDS_HEADER_SIZE / Uint32Array.BYTES_PER_ELEMENT);
  var height = header[DDS_FIELDS.HEIGHT];
  var width = header[DDS_FIELDS.WIDTH];
  var mipmapCount = header[DDS_FIELDS.MIPMAP_COUNT];
  var pixelFormat = new Uint32Array(arrayBuffer, DDS_FIELDS.PIXEL_FORMAT * Uint32Array.BYTES_PER_ELEMENT, DDS_HEADER_PF_SIZE / Uint32Array.BYTES_PER_ELEMENT);
  var formatFlags = pixelFormat[PF_FLAGS];
  if (formatFlags & DDPF_FOURCC) {
    var fourCC = pixelFormat[DDS_PF_FIELDS.FOURCC];
    if (fourCC !== FOURCC_DX10) {
      var internalFormat_1 = FOURCC_TO_FORMAT[fourCC];
      var dataOffset_1 = DDS_MAGIC_SIZE + DDS_HEADER_SIZE;
      var texData = new Uint8Array(arrayBuffer, dataOffset_1);
      var resource = new CompressedTextureResource(texData, {
        format: internalFormat_1,
        width,
        height,
        levels: mipmapCount
      });
      return [resource];
    }
    var dx10Offset = DDS_MAGIC_SIZE + DDS_HEADER_SIZE;
    var dx10Header = new Uint32Array(data.buffer, dx10Offset, DDS_HEADER_DX10_SIZE / Uint32Array.BYTES_PER_ELEMENT);
    var dxgiFormat = dx10Header[DDS_DX10_FIELDS.DXGI_FORMAT];
    var resourceDimension = dx10Header[DDS_DX10_FIELDS.RESOURCE_DIMENSION];
    var miscFlag = dx10Header[DDS_DX10_FIELDS.MISC_FLAG];
    var arraySize = dx10Header[DDS_DX10_FIELDS.ARRAY_SIZE];
    var internalFormat_2 = DXGI_TO_FORMAT[dxgiFormat];
    if (internalFormat_2 === void 0) {
      throw new Error("DDSParser cannot parse texture data with DXGI format " + dxgiFormat);
    }
    if (miscFlag === DDS_RESOURCE_MISC_TEXTURECUBE) {
      throw new Error("DDSParser does not support cubemap textures");
    }
    if (resourceDimension === D3D10_RESOURCE_DIMENSION.DDS_DIMENSION_TEXTURE3D) {
      throw new Error("DDSParser does not supported 3D texture data");
    }
    var imageBuffers = new Array();
    var dataOffset = DDS_MAGIC_SIZE + DDS_HEADER_SIZE + DDS_HEADER_DX10_SIZE;
    if (arraySize === 1) {
      imageBuffers.push(new Uint8Array(arrayBuffer, dataOffset));
    } else {
      var pixelSize = INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[internalFormat_2];
      var imageSize = 0;
      var levelWidth = width;
      var levelHeight = height;
      for (var i = 0; i < mipmapCount; i++) {
        var alignedLevelWidth = Math.max(1, levelWidth + 3 & ~3);
        var alignedLevelHeight = Math.max(1, levelHeight + 3 & ~3);
        var levelSize = alignedLevelWidth * alignedLevelHeight * pixelSize;
        imageSize += levelSize;
        levelWidth = levelWidth >>> 1;
        levelHeight = levelHeight >>> 1;
      }
      var imageOffset = dataOffset;
      for (var i = 0; i < arraySize; i++) {
        imageBuffers.push(new Uint8Array(arrayBuffer, imageOffset, imageSize));
        imageOffset += imageSize;
      }
    }
    return imageBuffers.map(function(buffer) {
      return new CompressedTextureResource(buffer, {
        format: internalFormat_2,
        width,
        height,
        levels: mipmapCount
      });
    });
  }
  if (formatFlags & DDPF_RGB) {
    throw new Error("DDSParser does not support uncompressed texture data.");
  }
  if (formatFlags & DDPF_YUV) {
    throw new Error("DDSParser does not supported YUV uncompressed texture data.");
  }
  if (formatFlags & DDPF_LUMINANCE) {
    throw new Error("DDSParser does not support single-channel (lumninance) texture data!");
  }
  if (formatFlags & DDPF_ALPHA) {
    throw new Error("DDSParser does not support single-channel (alpha) texture data!");
  }
  throw new Error("DDSParser failed to load a texture file due to an unknown reason!");
}
var _a$3, _b, _c;
var FILE_IDENTIFIER = [171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10];
var ENDIANNESS = 67305985;
var KTX_FIELDS = {
  FILE_IDENTIFIER: 0,
  ENDIANNESS: 12,
  GL_TYPE: 16,
  GL_TYPE_SIZE: 20,
  GL_FORMAT: 24,
  GL_INTERNAL_FORMAT: 28,
  GL_BASE_INTERNAL_FORMAT: 32,
  PIXEL_WIDTH: 36,
  PIXEL_HEIGHT: 40,
  PIXEL_DEPTH: 44,
  NUMBER_OF_ARRAY_ELEMENTS: 48,
  NUMBER_OF_FACES: 52,
  NUMBER_OF_MIPMAP_LEVELS: 56,
  BYTES_OF_KEY_VALUE_DATA: 60
};
var FILE_HEADER_SIZE = 64;
var TYPES_TO_BYTES_PER_COMPONENT = (_a$3 = {}, _a$3[TYPES.UNSIGNED_BYTE] = 1, _a$3[TYPES.UNSIGNED_SHORT] = 2, _a$3[TYPES.INT] = 4, _a$3[TYPES.UNSIGNED_INT] = 4, _a$3[TYPES.FLOAT] = 4, _a$3[TYPES.HALF_FLOAT] = 8, _a$3);
var FORMATS_TO_COMPONENTS = (_b = {}, _b[FORMATS.RGBA] = 4, _b[FORMATS.RGB] = 3, _b[FORMATS.RG] = 2, _b[FORMATS.RED] = 1, _b[FORMATS.LUMINANCE] = 1, _b[FORMATS.LUMINANCE_ALPHA] = 2, _b[FORMATS.ALPHA] = 1, _b);
var TYPES_TO_BYTES_PER_PIXEL = (_c = {}, _c[TYPES.UNSIGNED_SHORT_4_4_4_4] = 2, _c[TYPES.UNSIGNED_SHORT_5_5_5_1] = 2, _c[TYPES.UNSIGNED_SHORT_5_6_5] = 2, _c);
function parseKTX(url2, arrayBuffer, loadKeyValueData) {
  if (loadKeyValueData === void 0) {
    loadKeyValueData = false;
  }
  var dataView = new DataView(arrayBuffer);
  if (!validate(url2, dataView)) {
    return null;
  }
  var littleEndian = dataView.getUint32(KTX_FIELDS.ENDIANNESS, true) === ENDIANNESS;
  var glType = dataView.getUint32(KTX_FIELDS.GL_TYPE, littleEndian);
  var glFormat = dataView.getUint32(KTX_FIELDS.GL_FORMAT, littleEndian);
  var glInternalFormat = dataView.getUint32(KTX_FIELDS.GL_INTERNAL_FORMAT, littleEndian);
  var pixelWidth = dataView.getUint32(KTX_FIELDS.PIXEL_WIDTH, littleEndian);
  var pixelHeight = dataView.getUint32(KTX_FIELDS.PIXEL_HEIGHT, littleEndian) || 1;
  var pixelDepth = dataView.getUint32(KTX_FIELDS.PIXEL_DEPTH, littleEndian) || 1;
  var numberOfArrayElements = dataView.getUint32(KTX_FIELDS.NUMBER_OF_ARRAY_ELEMENTS, littleEndian) || 1;
  var numberOfFaces = dataView.getUint32(KTX_FIELDS.NUMBER_OF_FACES, littleEndian);
  var numberOfMipmapLevels = dataView.getUint32(KTX_FIELDS.NUMBER_OF_MIPMAP_LEVELS, littleEndian);
  var bytesOfKeyValueData = dataView.getUint32(KTX_FIELDS.BYTES_OF_KEY_VALUE_DATA, littleEndian);
  if (pixelHeight === 0 || pixelDepth !== 1) {
    throw new Error("Only 2D textures are supported");
  }
  if (numberOfFaces !== 1) {
    throw new Error("CubeTextures are not supported by KTXLoader yet!");
  }
  if (numberOfArrayElements !== 1) {
    throw new Error("WebGL does not support array textures");
  }
  var blockWidth = 4;
  var blockHeight = 4;
  var alignedWidth = pixelWidth + 3 & ~3;
  var alignedHeight = pixelHeight + 3 & ~3;
  var imageBuffers = new Array(numberOfArrayElements);
  var imagePixels = pixelWidth * pixelHeight;
  if (glType === 0) {
    imagePixels = alignedWidth * alignedHeight;
  }
  var imagePixelByteSize;
  if (glType !== 0) {
    if (TYPES_TO_BYTES_PER_COMPONENT[glType]) {
      imagePixelByteSize = TYPES_TO_BYTES_PER_COMPONENT[glType] * FORMATS_TO_COMPONENTS[glFormat];
    } else {
      imagePixelByteSize = TYPES_TO_BYTES_PER_PIXEL[glType];
    }
  } else {
    imagePixelByteSize = INTERNAL_FORMAT_TO_BYTES_PER_PIXEL[glInternalFormat];
  }
  if (imagePixelByteSize === void 0) {
    throw new Error("Unable to resolve the pixel format stored in the *.ktx file!");
  }
  var kvData = loadKeyValueData ? parseKvData(dataView, bytesOfKeyValueData, littleEndian) : null;
  var imageByteSize = imagePixels * imagePixelByteSize;
  var mipByteSize = imageByteSize;
  var mipWidth = pixelWidth;
  var mipHeight = pixelHeight;
  var alignedMipWidth = alignedWidth;
  var alignedMipHeight = alignedHeight;
  var imageOffset = FILE_HEADER_SIZE + bytesOfKeyValueData;
  for (var mipmapLevel = 0; mipmapLevel < numberOfMipmapLevels; mipmapLevel++) {
    var imageSize = dataView.getUint32(imageOffset, littleEndian);
    var elementOffset = imageOffset + 4;
    for (var arrayElement = 0; arrayElement < numberOfArrayElements; arrayElement++) {
      var mips = imageBuffers[arrayElement];
      if (!mips) {
        mips = imageBuffers[arrayElement] = new Array(numberOfMipmapLevels);
      }
      mips[mipmapLevel] = {
        levelID: mipmapLevel,
        levelWidth: numberOfMipmapLevels > 1 || glType !== 0 ? mipWidth : alignedMipWidth,
        levelHeight: numberOfMipmapLevels > 1 || glType !== 0 ? mipHeight : alignedMipHeight,
        levelBuffer: new Uint8Array(arrayBuffer, elementOffset, mipByteSize)
      };
      elementOffset += mipByteSize;
    }
    imageOffset += imageSize + 4;
    imageOffset = imageOffset % 4 !== 0 ? imageOffset + 4 - imageOffset % 4 : imageOffset;
    mipWidth = mipWidth >> 1 || 1;
    mipHeight = mipHeight >> 1 || 1;
    alignedMipWidth = mipWidth + blockWidth - 1 & ~(blockWidth - 1);
    alignedMipHeight = mipHeight + blockHeight - 1 & ~(blockHeight - 1);
    mipByteSize = alignedMipWidth * alignedMipHeight * imagePixelByteSize;
  }
  if (glType !== 0) {
    return {
      uncompressed: imageBuffers.map(function(levelBuffers) {
        var buffer = levelBuffers[0].levelBuffer;
        var convertToInt = false;
        if (glType === TYPES.FLOAT) {
          buffer = new Float32Array(levelBuffers[0].levelBuffer.buffer, levelBuffers[0].levelBuffer.byteOffset, levelBuffers[0].levelBuffer.byteLength / 4);
        } else if (glType === TYPES.UNSIGNED_INT) {
          convertToInt = true;
          buffer = new Uint32Array(levelBuffers[0].levelBuffer.buffer, levelBuffers[0].levelBuffer.byteOffset, levelBuffers[0].levelBuffer.byteLength / 4);
        } else if (glType === TYPES.INT) {
          convertToInt = true;
          buffer = new Int32Array(levelBuffers[0].levelBuffer.buffer, levelBuffers[0].levelBuffer.byteOffset, levelBuffers[0].levelBuffer.byteLength / 4);
        }
        return {
          resource: new BufferResource(buffer, {
            width: levelBuffers[0].levelWidth,
            height: levelBuffers[0].levelHeight
          }),
          type: glType,
          format: convertToInt ? convertFormatToInteger(glFormat) : glFormat
        };
      }),
      kvData
    };
  }
  return {
    compressed: imageBuffers.map(function(levelBuffers) {
      return new CompressedTextureResource(null, {
        format: glInternalFormat,
        width: pixelWidth,
        height: pixelHeight,
        levels: numberOfMipmapLevels,
        levelBuffers
      });
    }),
    kvData
  };
}
function validate(url2, dataView) {
  for (var i = 0; i < FILE_IDENTIFIER.length; i++) {
    if (dataView.getUint8(i) !== FILE_IDENTIFIER[i]) {
      console.error(url2 + " is not a valid *.ktx file!");
      return false;
    }
  }
  return true;
}
function convertFormatToInteger(format2) {
  switch (format2) {
    case FORMATS.RGBA:
      return FORMATS.RGBA_INTEGER;
    case FORMATS.RGB:
      return FORMATS.RGB_INTEGER;
    case FORMATS.RG:
      return FORMATS.RG_INTEGER;
    case FORMATS.RED:
      return FORMATS.RED_INTEGER;
    default:
      return format2;
  }
}
function parseKvData(dataView, bytesOfKeyValueData, littleEndian) {
  var kvData = /* @__PURE__ */ new Map();
  var bytesIntoKeyValueData = 0;
  while (bytesIntoKeyValueData < bytesOfKeyValueData) {
    var keyAndValueByteSize = dataView.getUint32(FILE_HEADER_SIZE + bytesIntoKeyValueData, littleEndian);
    var keyAndValueByteOffset = FILE_HEADER_SIZE + bytesIntoKeyValueData + 4;
    var valuePadding = 3 - (keyAndValueByteSize + 3) % 4;
    if (keyAndValueByteSize === 0 || keyAndValueByteSize > bytesOfKeyValueData - bytesIntoKeyValueData) {
      console.error("KTXLoader: keyAndValueByteSize out of bounds");
      break;
    }
    var keyNulByte = 0;
    for (; keyNulByte < keyAndValueByteSize; keyNulByte++) {
      if (dataView.getUint8(keyAndValueByteOffset + keyNulByte) === 0) {
        break;
      }
    }
    if (keyNulByte === -1) {
      console.error("KTXLoader: Failed to find null byte terminating kvData key");
      break;
    }
    var key = new TextDecoder().decode(new Uint8Array(dataView.buffer, keyAndValueByteOffset, keyNulByte));
    var value = new DataView(dataView.buffer, keyAndValueByteOffset + keyNulByte + 1, keyAndValueByteSize - keyNulByte - 1);
    kvData.set(key, value);
    bytesIntoKeyValueData += 4 + keyAndValueByteSize + valuePadding;
  }
  return kvData;
}
LoaderResource.setExtensionXhrType("dds", LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
var DDSLoader = function() {
  function DDSLoader2() {
  }
  DDSLoader2.use = function(resource, next) {
    if (resource.extension === "dds" && resource.data) {
      try {
        Object.assign(resource, registerCompressedTextures(resource.name || resource.url, parseDDS(resource.data), resource.metadata));
      } catch (err) {
        next(err);
        return;
      }
    }
    next();
  };
  DDSLoader2.extension = ExtensionType.Loader;
  return DDSLoader2;
}();
LoaderResource.setExtensionXhrType("ktx", LoaderResource.XHR_RESPONSE_TYPE.BUFFER);
var KTXLoader = function() {
  function KTXLoader2() {
  }
  KTXLoader2.use = function(resource, next) {
    if (resource.extension === "ktx" && resource.data) {
      try {
        var url_1 = resource.name || resource.url;
        var _a2 = parseKTX(url_1, resource.data, this.loadKeyValueData), compressed = _a2.compressed, uncompressed = _a2.uncompressed, kvData_1 = _a2.kvData;
        if (compressed) {
          var result2 = registerCompressedTextures(url_1, compressed, resource.metadata);
          if (kvData_1 && result2.textures) {
            for (var textureId in result2.textures) {
              result2.textures[textureId].baseTexture.ktxKeyValueData = kvData_1;
            }
          }
          Object.assign(resource, result2);
        } else if (uncompressed) {
          var textures_1 = {};
          uncompressed.forEach(function(image, i) {
            var texture = new Texture(new BaseTexture(image.resource, {
              mipmap: MIPMAP_MODES.OFF,
              alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
              type: image.type,
              format: image.format
            }));
            var cacheID = url_1 + "-" + (i + 1);
            if (kvData_1) {
              texture.baseTexture.ktxKeyValueData = kvData_1;
            }
            BaseTexture.addToCache(texture.baseTexture, cacheID);
            Texture.addToCache(texture, cacheID);
            if (i === 0) {
              textures_1[url_1] = texture;
              BaseTexture.addToCache(texture.baseTexture, url_1);
              Texture.addToCache(texture, url_1);
            }
            textures_1[cacheID] = texture;
          });
          Object.assign(resource, { textures: textures_1 });
        }
      } catch (err) {
        next(err);
        return;
      }
    }
    next();
  };
  KTXLoader2.extension = ExtensionType.Loader;
  KTXLoader2.loadKeyValueData = false;
  return KTXLoader2;
}();
var extendStatics$f = function(d, b) {
  extendStatics$f = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$f(d, b);
};
function __extends$f(d, b) {
  extendStatics$f(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var ParticleContainer = function(_super) {
  __extends$f(ParticleContainer2, _super);
  function ParticleContainer2(maxSize, properties, batchSize, autoResize) {
    if (maxSize === void 0) {
      maxSize = 1500;
    }
    if (batchSize === void 0) {
      batchSize = 16384;
    }
    if (autoResize === void 0) {
      autoResize = false;
    }
    var _this = _super.call(this) || this;
    var maxBatchSize = 16384;
    if (batchSize > maxBatchSize) {
      batchSize = maxBatchSize;
    }
    _this._properties = [false, true, false, false, false];
    _this._maxSize = maxSize;
    _this._batchSize = batchSize;
    _this._buffers = null;
    _this._bufferUpdateIDs = [];
    _this._updateID = 0;
    _this.interactiveChildren = false;
    _this.blendMode = BLEND_MODES.NORMAL;
    _this.autoResize = autoResize;
    _this.roundPixels = true;
    _this.baseTexture = null;
    _this.setProperties(properties);
    _this._tint = 0;
    _this.tintRgb = new Float32Array(4);
    _this.tint = 16777215;
    return _this;
  }
  ParticleContainer2.prototype.setProperties = function(properties) {
    if (properties) {
      this._properties[0] = "vertices" in properties || "scale" in properties ? !!properties.vertices || !!properties.scale : this._properties[0];
      this._properties[1] = "position" in properties ? !!properties.position : this._properties[1];
      this._properties[2] = "rotation" in properties ? !!properties.rotation : this._properties[2];
      this._properties[3] = "uvs" in properties ? !!properties.uvs : this._properties[3];
      this._properties[4] = "tint" in properties || "alpha" in properties ? !!properties.tint || !!properties.alpha : this._properties[4];
    }
  };
  ParticleContainer2.prototype.updateTransform = function() {
    this.displayObjectUpdateTransform();
  };
  Object.defineProperty(ParticleContainer2.prototype, "tint", {
    get: function() {
      return this._tint;
    },
    set: function(value) {
      this._tint = value;
      hex2rgb(value, this.tintRgb);
    },
    enumerable: false,
    configurable: true
  });
  ParticleContainer2.prototype.render = function(renderer) {
    var _this = this;
    if (!this.visible || this.worldAlpha <= 0 || !this.children.length || !this.renderable) {
      return;
    }
    if (!this.baseTexture) {
      this.baseTexture = this.children[0]._texture.baseTexture;
      if (!this.baseTexture.valid) {
        this.baseTexture.once("update", function() {
          return _this.onChildrenChange(0);
        });
      }
    }
    renderer.batch.setObjectRenderer(renderer.plugins.particle);
    renderer.plugins.particle.render(this);
  };
  ParticleContainer2.prototype.onChildrenChange = function(smallestChildIndex) {
    var bufferIndex = Math.floor(smallestChildIndex / this._batchSize);
    while (this._bufferUpdateIDs.length < bufferIndex) {
      this._bufferUpdateIDs.push(0);
    }
    this._bufferUpdateIDs[bufferIndex] = ++this._updateID;
  };
  ParticleContainer2.prototype.dispose = function() {
    if (this._buffers) {
      for (var i = 0; i < this._buffers.length; ++i) {
        this._buffers[i].destroy();
      }
      this._buffers = null;
    }
  };
  ParticleContainer2.prototype.destroy = function(options) {
    _super.prototype.destroy.call(this, options);
    this.dispose();
    this._properties = null;
    this._buffers = null;
    this._bufferUpdateIDs = null;
  };
  return ParticleContainer2;
}(Container);
var ParticleBuffer = function() {
  function ParticleBuffer2(properties, dynamicPropertyFlags, size) {
    this.geometry = new Geometry();
    this.indexBuffer = null;
    this.size = size;
    this.dynamicProperties = [];
    this.staticProperties = [];
    for (var i = 0; i < properties.length; ++i) {
      var property = properties[i];
      property = {
        attributeName: property.attributeName,
        size: property.size,
        uploadFunction: property.uploadFunction,
        type: property.type || TYPES.FLOAT,
        offset: property.offset
      };
      if (dynamicPropertyFlags[i]) {
        this.dynamicProperties.push(property);
      } else {
        this.staticProperties.push(property);
      }
    }
    this.staticStride = 0;
    this.staticBuffer = null;
    this.staticData = null;
    this.staticDataUint32 = null;
    this.dynamicStride = 0;
    this.dynamicBuffer = null;
    this.dynamicData = null;
    this.dynamicDataUint32 = null;
    this._updateID = 0;
    this.initBuffers();
  }
  ParticleBuffer2.prototype.initBuffers = function() {
    var geometry = this.geometry;
    var dynamicOffset = 0;
    this.indexBuffer = new Buffer2(createIndicesForQuads(this.size), true, true);
    geometry.addIndex(this.indexBuffer);
    this.dynamicStride = 0;
    for (var i = 0; i < this.dynamicProperties.length; ++i) {
      var property = this.dynamicProperties[i];
      property.offset = dynamicOffset;
      dynamicOffset += property.size;
      this.dynamicStride += property.size;
    }
    var dynBuffer = new ArrayBuffer(this.size * this.dynamicStride * 4 * 4);
    this.dynamicData = new Float32Array(dynBuffer);
    this.dynamicDataUint32 = new Uint32Array(dynBuffer);
    this.dynamicBuffer = new Buffer2(this.dynamicData, false, false);
    var staticOffset = 0;
    this.staticStride = 0;
    for (var i = 0; i < this.staticProperties.length; ++i) {
      var property = this.staticProperties[i];
      property.offset = staticOffset;
      staticOffset += property.size;
      this.staticStride += property.size;
    }
    var statBuffer = new ArrayBuffer(this.size * this.staticStride * 4 * 4);
    this.staticData = new Float32Array(statBuffer);
    this.staticDataUint32 = new Uint32Array(statBuffer);
    this.staticBuffer = new Buffer2(this.staticData, true, false);
    for (var i = 0; i < this.dynamicProperties.length; ++i) {
      var property = this.dynamicProperties[i];
      geometry.addAttribute(property.attributeName, this.dynamicBuffer, 0, property.type === TYPES.UNSIGNED_BYTE, property.type, this.dynamicStride * 4, property.offset * 4);
    }
    for (var i = 0; i < this.staticProperties.length; ++i) {
      var property = this.staticProperties[i];
      geometry.addAttribute(property.attributeName, this.staticBuffer, 0, property.type === TYPES.UNSIGNED_BYTE, property.type, this.staticStride * 4, property.offset * 4);
    }
  };
  ParticleBuffer2.prototype.uploadDynamic = function(children, startIndex, amount) {
    for (var i = 0; i < this.dynamicProperties.length; i++) {
      var property = this.dynamicProperties[i];
      property.uploadFunction(children, startIndex, amount, property.type === TYPES.UNSIGNED_BYTE ? this.dynamicDataUint32 : this.dynamicData, this.dynamicStride, property.offset);
    }
    this.dynamicBuffer._updateID++;
  };
  ParticleBuffer2.prototype.uploadStatic = function(children, startIndex, amount) {
    for (var i = 0; i < this.staticProperties.length; i++) {
      var property = this.staticProperties[i];
      property.uploadFunction(children, startIndex, amount, property.type === TYPES.UNSIGNED_BYTE ? this.staticDataUint32 : this.staticData, this.staticStride, property.offset);
    }
    this.staticBuffer._updateID++;
  };
  ParticleBuffer2.prototype.destroy = function() {
    this.indexBuffer = null;
    this.dynamicProperties = null;
    this.dynamicBuffer = null;
    this.dynamicData = null;
    this.dynamicDataUint32 = null;
    this.staticProperties = null;
    this.staticBuffer = null;
    this.staticData = null;
    this.staticDataUint32 = null;
    this.geometry.destroy();
  };
  return ParticleBuffer2;
}();
var fragment$6 = "varying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void){\n    vec4 color = texture2D(uSampler, vTextureCoord) * vColor;\n    gl_FragColor = color;\n}";
var vertex$3 = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec4 aColor;\n\nattribute vec2 aPositionCoord;\nattribute float aRotation;\n\nuniform mat3 translationMatrix;\nuniform vec4 uColor;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nvoid main(void){\n    float x = (aVertexPosition.x) * cos(aRotation) - (aVertexPosition.y) * sin(aRotation);\n    float y = (aVertexPosition.x) * sin(aRotation) + (aVertexPosition.y) * cos(aRotation);\n\n    vec2 v = vec2(x, y);\n    v = v + aPositionCoord;\n\n    gl_Position = vec4((translationMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = aTextureCoord;\n    vColor = aColor * uColor;\n}\n";
var ParticleRenderer = function(_super) {
  __extends$f(ParticleRenderer2, _super);
  function ParticleRenderer2(renderer) {
    var _this = _super.call(this, renderer) || this;
    _this.shader = null;
    _this.properties = null;
    _this.tempMatrix = new Matrix();
    _this.properties = [
      {
        attributeName: "aVertexPosition",
        size: 2,
        uploadFunction: _this.uploadVertices,
        offset: 0
      },
      {
        attributeName: "aPositionCoord",
        size: 2,
        uploadFunction: _this.uploadPosition,
        offset: 0
      },
      {
        attributeName: "aRotation",
        size: 1,
        uploadFunction: _this.uploadRotation,
        offset: 0
      },
      {
        attributeName: "aTextureCoord",
        size: 2,
        uploadFunction: _this.uploadUvs,
        offset: 0
      },
      {
        attributeName: "aColor",
        size: 1,
        type: TYPES.UNSIGNED_BYTE,
        uploadFunction: _this.uploadTint,
        offset: 0
      }
    ];
    _this.shader = Shader.from(vertex$3, fragment$6, {});
    _this.state = State.for2d();
    return _this;
  }
  ParticleRenderer2.prototype.render = function(container) {
    var children = container.children;
    var maxSize = container._maxSize;
    var batchSize = container._batchSize;
    var renderer = this.renderer;
    var totalChildren = children.length;
    if (totalChildren === 0) {
      return;
    } else if (totalChildren > maxSize && !container.autoResize) {
      totalChildren = maxSize;
    }
    var buffers = container._buffers;
    if (!buffers) {
      buffers = container._buffers = this.generateBuffers(container);
    }
    var baseTexture = children[0]._texture.baseTexture;
    var premultiplied = baseTexture.alphaMode > 0;
    this.state.blendMode = correctBlendMode(container.blendMode, premultiplied);
    renderer.state.set(this.state);
    var gl = renderer.gl;
    var m = container.worldTransform.copyTo(this.tempMatrix);
    m.prepend(renderer.globalUniforms.uniforms.projectionMatrix);
    this.shader.uniforms.translationMatrix = m.toArray(true);
    this.shader.uniforms.uColor = premultiplyRgba(container.tintRgb, container.worldAlpha, this.shader.uniforms.uColor, premultiplied);
    this.shader.uniforms.uSampler = baseTexture;
    this.renderer.shader.bind(this.shader);
    var updateStatic = false;
    for (var i = 0, j = 0; i < totalChildren; i += batchSize, j += 1) {
      var amount = totalChildren - i;
      if (amount > batchSize) {
        amount = batchSize;
      }
      if (j >= buffers.length) {
        buffers.push(this._generateOneMoreBuffer(container));
      }
      var buffer = buffers[j];
      buffer.uploadDynamic(children, i, amount);
      var bid = container._bufferUpdateIDs[j] || 0;
      updateStatic = updateStatic || buffer._updateID < bid;
      if (updateStatic) {
        buffer._updateID = container._updateID;
        buffer.uploadStatic(children, i, amount);
      }
      renderer.geometry.bind(buffer.geometry);
      gl.drawElements(gl.TRIANGLES, amount * 6, gl.UNSIGNED_SHORT, 0);
    }
  };
  ParticleRenderer2.prototype.generateBuffers = function(container) {
    var buffers = [];
    var size = container._maxSize;
    var batchSize = container._batchSize;
    var dynamicPropertyFlags = container._properties;
    for (var i = 0; i < size; i += batchSize) {
      buffers.push(new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize));
    }
    return buffers;
  };
  ParticleRenderer2.prototype._generateOneMoreBuffer = function(container) {
    var batchSize = container._batchSize;
    var dynamicPropertyFlags = container._properties;
    return new ParticleBuffer(this.properties, dynamicPropertyFlags, batchSize);
  };
  ParticleRenderer2.prototype.uploadVertices = function(children, startIndex, amount, array, stride, offset) {
    var w0 = 0;
    var w1 = 0;
    var h0 = 0;
    var h1 = 0;
    for (var i = 0; i < amount; ++i) {
      var sprite = children[startIndex + i];
      var texture = sprite._texture;
      var sx = sprite.scale.x;
      var sy = sprite.scale.y;
      var trim = texture.trim;
      var orig = texture.orig;
      if (trim) {
        w1 = trim.x - sprite.anchor.x * orig.width;
        w0 = w1 + trim.width;
        h1 = trim.y - sprite.anchor.y * orig.height;
        h0 = h1 + trim.height;
      } else {
        w0 = orig.width * (1 - sprite.anchor.x);
        w1 = orig.width * -sprite.anchor.x;
        h0 = orig.height * (1 - sprite.anchor.y);
        h1 = orig.height * -sprite.anchor.y;
      }
      array[offset] = w1 * sx;
      array[offset + 1] = h1 * sy;
      array[offset + stride] = w0 * sx;
      array[offset + stride + 1] = h1 * sy;
      array[offset + stride * 2] = w0 * sx;
      array[offset + stride * 2 + 1] = h0 * sy;
      array[offset + stride * 3] = w1 * sx;
      array[offset + stride * 3 + 1] = h0 * sy;
      offset += stride * 4;
    }
  };
  ParticleRenderer2.prototype.uploadPosition = function(children, startIndex, amount, array, stride, offset) {
    for (var i = 0; i < amount; i++) {
      var spritePosition = children[startIndex + i].position;
      array[offset] = spritePosition.x;
      array[offset + 1] = spritePosition.y;
      array[offset + stride] = spritePosition.x;
      array[offset + stride + 1] = spritePosition.y;
      array[offset + stride * 2] = spritePosition.x;
      array[offset + stride * 2 + 1] = spritePosition.y;
      array[offset + stride * 3] = spritePosition.x;
      array[offset + stride * 3 + 1] = spritePosition.y;
      offset += stride * 4;
    }
  };
  ParticleRenderer2.prototype.uploadRotation = function(children, startIndex, amount, array, stride, offset) {
    for (var i = 0; i < amount; i++) {
      var spriteRotation = children[startIndex + i].rotation;
      array[offset] = spriteRotation;
      array[offset + stride] = spriteRotation;
      array[offset + stride * 2] = spriteRotation;
      array[offset + stride * 3] = spriteRotation;
      offset += stride * 4;
    }
  };
  ParticleRenderer2.prototype.uploadUvs = function(children, startIndex, amount, array, stride, offset) {
    for (var i = 0; i < amount; ++i) {
      var textureUvs = children[startIndex + i]._texture._uvs;
      if (textureUvs) {
        array[offset] = textureUvs.x0;
        array[offset + 1] = textureUvs.y0;
        array[offset + stride] = textureUvs.x1;
        array[offset + stride + 1] = textureUvs.y1;
        array[offset + stride * 2] = textureUvs.x2;
        array[offset + stride * 2 + 1] = textureUvs.y2;
        array[offset + stride * 3] = textureUvs.x3;
        array[offset + stride * 3 + 1] = textureUvs.y3;
        offset += stride * 4;
      } else {
        array[offset] = 0;
        array[offset + 1] = 0;
        array[offset + stride] = 0;
        array[offset + stride + 1] = 0;
        array[offset + stride * 2] = 0;
        array[offset + stride * 2 + 1] = 0;
        array[offset + stride * 3] = 0;
        array[offset + stride * 3 + 1] = 0;
        offset += stride * 4;
      }
    }
  };
  ParticleRenderer2.prototype.uploadTint = function(children, startIndex, amount, array, stride, offset) {
    for (var i = 0; i < amount; ++i) {
      var sprite = children[startIndex + i];
      var premultiplied = sprite._texture.baseTexture.alphaMode > 0;
      var alpha = sprite.alpha;
      var argb = alpha < 1 && premultiplied ? premultiplyTint(sprite._tintRGB, alpha) : sprite._tintRGB + (alpha * 255 << 24);
      array[offset] = argb;
      array[offset + stride] = argb;
      array[offset + stride * 2] = argb;
      array[offset + stride * 3] = argb;
      offset += stride * 4;
    }
  };
  ParticleRenderer2.prototype.destroy = function() {
    _super.prototype.destroy.call(this);
    if (this.shader) {
      this.shader.destroy();
      this.shader = null;
    }
    this.tempMatrix = null;
  };
  ParticleRenderer2.extension = {
    name: "particle",
    type: ExtensionType.RendererPlugin
  };
  return ParticleRenderer2;
}(ObjectRenderer);
var LINE_JOIN;
(function(LINE_JOIN2) {
  LINE_JOIN2["MITER"] = "miter";
  LINE_JOIN2["BEVEL"] = "bevel";
  LINE_JOIN2["ROUND"] = "round";
})(LINE_JOIN || (LINE_JOIN = {}));
var LINE_CAP;
(function(LINE_CAP2) {
  LINE_CAP2["BUTT"] = "butt";
  LINE_CAP2["ROUND"] = "round";
  LINE_CAP2["SQUARE"] = "square";
})(LINE_CAP || (LINE_CAP = {}));
var GRAPHICS_CURVES = {
  adaptive: true,
  maxLength: 10,
  minSegments: 8,
  maxSegments: 2048,
  epsilon: 1e-4,
  _segmentsCount: function(length, defaultSegments) {
    if (defaultSegments === void 0) {
      defaultSegments = 20;
    }
    if (!this.adaptive || !length || isNaN(length)) {
      return defaultSegments;
    }
    var result2 = Math.ceil(length / this.maxLength);
    if (result2 < this.minSegments) {
      result2 = this.minSegments;
    } else if (result2 > this.maxSegments) {
      result2 = this.maxSegments;
    }
    return result2;
  }
};
var FillStyle = function() {
  function FillStyle2() {
    this.color = 16777215;
    this.alpha = 1;
    this.texture = Texture.WHITE;
    this.matrix = null;
    this.visible = false;
    this.reset();
  }
  FillStyle2.prototype.clone = function() {
    var obj = new FillStyle2();
    obj.color = this.color;
    obj.alpha = this.alpha;
    obj.texture = this.texture;
    obj.matrix = this.matrix;
    obj.visible = this.visible;
    return obj;
  };
  FillStyle2.prototype.reset = function() {
    this.color = 16777215;
    this.alpha = 1;
    this.texture = Texture.WHITE;
    this.matrix = null;
    this.visible = false;
  };
  FillStyle2.prototype.destroy = function() {
    this.texture = null;
    this.matrix = null;
  };
  return FillStyle2;
}();
var extendStatics$e = function(d, b) {
  extendStatics$e = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$e(d, b);
};
function __extends$e(d, b) {
  extendStatics$e(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function fixOrientation(points, hole) {
  var _a2, _b2;
  if (hole === void 0) {
    hole = false;
  }
  var m = points.length;
  if (m < 6) {
    return;
  }
  var area2 = 0;
  for (var i = 0, x1 = points[m - 2], y1 = points[m - 1]; i < m; i += 2) {
    var x2 = points[i];
    var y2 = points[i + 1];
    area2 += (x2 - x1) * (y2 + y1);
    x1 = x2;
    y1 = y2;
  }
  if (!hole && area2 > 0 || hole && area2 <= 0) {
    var n = m / 2;
    for (var i = n + n % 2; i < m; i += 2) {
      var i1 = m - i - 2;
      var i2 = m - i - 1;
      var i3 = i;
      var i4 = i + 1;
      _a2 = [points[i3], points[i1]], points[i1] = _a2[0], points[i3] = _a2[1];
      _b2 = [points[i4], points[i2]], points[i2] = _b2[0], points[i4] = _b2[1];
    }
  }
}
var buildPoly = {
  build: function(graphicsData) {
    graphicsData.points = graphicsData.shape.points.slice();
  },
  triangulate: function(graphicsData, graphicsGeometry) {
    var points = graphicsData.points;
    var holes = graphicsData.holes;
    var verts = graphicsGeometry.points;
    var indices2 = graphicsGeometry.indices;
    if (points.length >= 6) {
      fixOrientation(points, false);
      var holeArray = [];
      for (var i = 0; i < holes.length; i++) {
        var hole = holes[i];
        fixOrientation(hole.points, true);
        holeArray.push(points.length / 2);
        points = points.concat(hole.points);
      }
      var triangles = earcut$1.exports(points, holeArray, 2);
      if (!triangles) {
        return;
      }
      var vertPos = verts.length / 2;
      for (var i = 0; i < triangles.length; i += 3) {
        indices2.push(triangles[i] + vertPos);
        indices2.push(triangles[i + 1] + vertPos);
        indices2.push(triangles[i + 2] + vertPos);
      }
      for (var i = 0; i < points.length; i++) {
        verts.push(points[i]);
      }
    }
  }
};
var buildCircle = {
  build: function(graphicsData) {
    var points = graphicsData.points;
    var x;
    var y;
    var dx;
    var dy;
    var rx;
    var ry;
    if (graphicsData.type === SHAPES.CIRC) {
      var circle = graphicsData.shape;
      x = circle.x;
      y = circle.y;
      rx = ry = circle.radius;
      dx = dy = 0;
    } else if (graphicsData.type === SHAPES.ELIP) {
      var ellipse = graphicsData.shape;
      x = ellipse.x;
      y = ellipse.y;
      rx = ellipse.width;
      ry = ellipse.height;
      dx = dy = 0;
    } else {
      var roundedRect = graphicsData.shape;
      var halfWidth = roundedRect.width / 2;
      var halfHeight = roundedRect.height / 2;
      x = roundedRect.x + halfWidth;
      y = roundedRect.y + halfHeight;
      rx = ry = Math.max(0, Math.min(roundedRect.radius, Math.min(halfWidth, halfHeight)));
      dx = halfWidth - rx;
      dy = halfHeight - ry;
    }
    if (!(rx >= 0 && ry >= 0 && dx >= 0 && dy >= 0)) {
      points.length = 0;
      return;
    }
    var n = Math.ceil(2.3 * Math.sqrt(rx + ry));
    var m = n * 8 + (dx ? 4 : 0) + (dy ? 4 : 0);
    points.length = m;
    if (m === 0) {
      return;
    }
    if (n === 0) {
      points.length = 8;
      points[0] = points[6] = x + dx;
      points[1] = points[3] = y + dy;
      points[2] = points[4] = x - dx;
      points[5] = points[7] = y - dy;
      return;
    }
    var j1 = 0;
    var j2 = n * 4 + (dx ? 2 : 0) + 2;
    var j3 = j2;
    var j4 = m;
    {
      var x0 = dx + rx;
      var y0 = dy;
      var x1 = x + x0;
      var x2 = x - x0;
      var y1 = y + y0;
      points[j1++] = x1;
      points[j1++] = y1;
      points[--j2] = y1;
      points[--j2] = x2;
      if (dy) {
        var y2 = y - y0;
        points[j3++] = x2;
        points[j3++] = y2;
        points[--j4] = y2;
        points[--j4] = x1;
      }
    }
    for (var i = 1; i < n; i++) {
      var a = Math.PI / 2 * (i / n);
      var x0 = dx + Math.cos(a) * rx;
      var y0 = dy + Math.sin(a) * ry;
      var x1 = x + x0;
      var x2 = x - x0;
      var y1 = y + y0;
      var y2 = y - y0;
      points[j1++] = x1;
      points[j1++] = y1;
      points[--j2] = y1;
      points[--j2] = x2;
      points[j3++] = x2;
      points[j3++] = y2;
      points[--j4] = y2;
      points[--j4] = x1;
    }
    {
      var x0 = dx;
      var y0 = dy + ry;
      var x1 = x + x0;
      var x2 = x - x0;
      var y1 = y + y0;
      var y2 = y - y0;
      points[j1++] = x1;
      points[j1++] = y1;
      points[--j4] = y2;
      points[--j4] = x1;
      if (dx) {
        points[j1++] = x2;
        points[j1++] = y1;
        points[--j4] = y2;
        points[--j4] = x2;
      }
    }
  },
  triangulate: function(graphicsData, graphicsGeometry) {
    var points = graphicsData.points;
    var verts = graphicsGeometry.points;
    var indices2 = graphicsGeometry.indices;
    if (points.length === 0) {
      return;
    }
    var vertPos = verts.length / 2;
    var center = vertPos;
    var x;
    var y;
    if (graphicsData.type !== SHAPES.RREC) {
      var circle = graphicsData.shape;
      x = circle.x;
      y = circle.y;
    } else {
      var roundedRect = graphicsData.shape;
      x = roundedRect.x + roundedRect.width / 2;
      y = roundedRect.y + roundedRect.height / 2;
    }
    var matrix = graphicsData.matrix;
    verts.push(graphicsData.matrix ? matrix.a * x + matrix.c * y + matrix.tx : x, graphicsData.matrix ? matrix.b * x + matrix.d * y + matrix.ty : y);
    vertPos++;
    verts.push(points[0], points[1]);
    for (var i = 2; i < points.length; i += 2) {
      verts.push(points[i], points[i + 1]);
      indices2.push(vertPos++, center, vertPos);
    }
    indices2.push(center + 1, center, vertPos);
  }
};
var buildRectangle = {
  build: function(graphicsData) {
    var rectData = graphicsData.shape;
    var x = rectData.x;
    var y = rectData.y;
    var width = rectData.width;
    var height = rectData.height;
    var points = graphicsData.points;
    points.length = 0;
    points.push(x, y, x + width, y, x + width, y + height, x, y + height);
  },
  triangulate: function(graphicsData, graphicsGeometry) {
    var points = graphicsData.points;
    var verts = graphicsGeometry.points;
    var vertPos = verts.length / 2;
    verts.push(points[0], points[1], points[2], points[3], points[6], points[7], points[4], points[5]);
    graphicsGeometry.indices.push(vertPos, vertPos + 1, vertPos + 2, vertPos + 1, vertPos + 2, vertPos + 3);
  }
};
function getPt(n1, n2, perc) {
  var diff = n2 - n1;
  return n1 + diff * perc;
}
function quadraticBezierCurve(fromX, fromY, cpX, cpY, toX, toY, out) {
  if (out === void 0) {
    out = [];
  }
  var n = 20;
  var points = out;
  var xa = 0;
  var ya = 0;
  var xb = 0;
  var yb = 0;
  var x = 0;
  var y = 0;
  for (var i = 0, j = 0; i <= n; ++i) {
    j = i / n;
    xa = getPt(fromX, cpX, j);
    ya = getPt(fromY, cpY, j);
    xb = getPt(cpX, toX, j);
    yb = getPt(cpY, toY, j);
    x = getPt(xa, xb, j);
    y = getPt(ya, yb, j);
    if (i === 0 && points[points.length - 2] === x && points[points.length - 1] === y) {
      continue;
    }
    points.push(x, y);
  }
  return points;
}
var buildRoundedRectangle = {
  build: function(graphicsData) {
    if (Graphics.nextRoundedRectBehavior) {
      buildCircle.build(graphicsData);
      return;
    }
    var rrectData = graphicsData.shape;
    var points = graphicsData.points;
    var x = rrectData.x;
    var y = rrectData.y;
    var width = rrectData.width;
    var height = rrectData.height;
    var radius = Math.max(0, Math.min(rrectData.radius, Math.min(width, height) / 2));
    points.length = 0;
    if (!radius) {
      points.push(x, y, x + width, y, x + width, y + height, x, y + height);
    } else {
      quadraticBezierCurve(x, y + radius, x, y, x + radius, y, points);
      quadraticBezierCurve(x + width - radius, y, x + width, y, x + width, y + radius, points);
      quadraticBezierCurve(x + width, y + height - radius, x + width, y + height, x + width - radius, y + height, points);
      quadraticBezierCurve(x + radius, y + height, x, y + height, x, y + height - radius, points);
    }
  },
  triangulate: function(graphicsData, graphicsGeometry) {
    if (Graphics.nextRoundedRectBehavior) {
      buildCircle.triangulate(graphicsData, graphicsGeometry);
      return;
    }
    var points = graphicsData.points;
    var verts = graphicsGeometry.points;
    var indices2 = graphicsGeometry.indices;
    var vecPos = verts.length / 2;
    var triangles = earcut$1.exports(points, null, 2);
    for (var i = 0, j = triangles.length; i < j; i += 3) {
      indices2.push(triangles[i] + vecPos);
      indices2.push(triangles[i + 1] + vecPos);
      indices2.push(triangles[i + 2] + vecPos);
    }
    for (var i = 0, j = points.length; i < j; i++) {
      verts.push(points[i], points[++i]);
    }
  }
};
function square(x, y, nx, ny, innerWeight, outerWeight, clockwise, verts) {
  var ix = x - nx * innerWeight;
  var iy = y - ny * innerWeight;
  var ox = x + nx * outerWeight;
  var oy = y + ny * outerWeight;
  var exx;
  var eyy;
  if (clockwise) {
    exx = ny;
    eyy = -nx;
  } else {
    exx = -ny;
    eyy = nx;
  }
  var eix = ix + exx;
  var eiy = iy + eyy;
  var eox = ox + exx;
  var eoy = oy + eyy;
  verts.push(eix, eiy);
  verts.push(eox, eoy);
  return 2;
}
function round(cx, cy, sx, sy, ex, ey, verts, clockwise) {
  var cx2p0x = sx - cx;
  var cy2p0y = sy - cy;
  var angle0 = Math.atan2(cx2p0x, cy2p0y);
  var angle1 = Math.atan2(ex - cx, ey - cy);
  if (clockwise && angle0 < angle1) {
    angle0 += Math.PI * 2;
  } else if (!clockwise && angle0 > angle1) {
    angle1 += Math.PI * 2;
  }
  var startAngle = angle0;
  var angleDiff = angle1 - angle0;
  var absAngleDiff = Math.abs(angleDiff);
  var radius = Math.sqrt(cx2p0x * cx2p0x + cy2p0y * cy2p0y);
  var segCount = (15 * absAngleDiff * Math.sqrt(radius) / Math.PI >> 0) + 1;
  var angleInc = angleDiff / segCount;
  startAngle += angleInc;
  if (clockwise) {
    verts.push(cx, cy);
    verts.push(sx, sy);
    for (var i = 1, angle = startAngle; i < segCount; i++, angle += angleInc) {
      verts.push(cx, cy);
      verts.push(cx + Math.sin(angle) * radius, cy + Math.cos(angle) * radius);
    }
    verts.push(cx, cy);
    verts.push(ex, ey);
  } else {
    verts.push(sx, sy);
    verts.push(cx, cy);
    for (var i = 1, angle = startAngle; i < segCount; i++, angle += angleInc) {
      verts.push(cx + Math.sin(angle) * radius, cy + Math.cos(angle) * radius);
      verts.push(cx, cy);
    }
    verts.push(ex, ey);
    verts.push(cx, cy);
  }
  return segCount * 2;
}
function buildNonNativeLine(graphicsData, graphicsGeometry) {
  var shape = graphicsData.shape;
  var points = graphicsData.points || shape.points.slice();
  var eps = graphicsGeometry.closePointEps;
  if (points.length === 0) {
    return;
  }
  var style = graphicsData.lineStyle;
  var firstPoint = new Point(points[0], points[1]);
  var lastPoint = new Point(points[points.length - 2], points[points.length - 1]);
  var closedShape = shape.type !== SHAPES.POLY || shape.closeStroke;
  var closedPath = Math.abs(firstPoint.x - lastPoint.x) < eps && Math.abs(firstPoint.y - lastPoint.y) < eps;
  if (closedShape) {
    points = points.slice();
    if (closedPath) {
      points.pop();
      points.pop();
      lastPoint.set(points[points.length - 2], points[points.length - 1]);
    }
    var midPointX = (firstPoint.x + lastPoint.x) * 0.5;
    var midPointY = (lastPoint.y + firstPoint.y) * 0.5;
    points.unshift(midPointX, midPointY);
    points.push(midPointX, midPointY);
  }
  var verts = graphicsGeometry.points;
  var length = points.length / 2;
  var indexCount = points.length;
  var indexStart = verts.length / 2;
  var width = style.width / 2;
  var widthSquared = width * width;
  var miterLimitSquared = style.miterLimit * style.miterLimit;
  var x0 = points[0];
  var y0 = points[1];
  var x1 = points[2];
  var y1 = points[3];
  var x2 = 0;
  var y2 = 0;
  var perpx = -(y0 - y1);
  var perpy = x0 - x1;
  var perp1x = 0;
  var perp1y = 0;
  var dist = Math.sqrt(perpx * perpx + perpy * perpy);
  perpx /= dist;
  perpy /= dist;
  perpx *= width;
  perpy *= width;
  var ratio = style.alignment;
  var innerWeight = (1 - ratio) * 2;
  var outerWeight = ratio * 2;
  if (!closedShape) {
    if (style.cap === LINE_CAP.ROUND) {
      indexCount += round(x0 - perpx * (innerWeight - outerWeight) * 0.5, y0 - perpy * (innerWeight - outerWeight) * 0.5, x0 - perpx * innerWeight, y0 - perpy * innerWeight, x0 + perpx * outerWeight, y0 + perpy * outerWeight, verts, true) + 2;
    } else if (style.cap === LINE_CAP.SQUARE) {
      indexCount += square(x0, y0, perpx, perpy, innerWeight, outerWeight, true, verts);
    }
  }
  verts.push(x0 - perpx * innerWeight, y0 - perpy * innerWeight);
  verts.push(x0 + perpx * outerWeight, y0 + perpy * outerWeight);
  for (var i = 1; i < length - 1; ++i) {
    x0 = points[(i - 1) * 2];
    y0 = points[(i - 1) * 2 + 1];
    x1 = points[i * 2];
    y1 = points[i * 2 + 1];
    x2 = points[(i + 1) * 2];
    y2 = points[(i + 1) * 2 + 1];
    perpx = -(y0 - y1);
    perpy = x0 - x1;
    dist = Math.sqrt(perpx * perpx + perpy * perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;
    perp1x = -(y1 - y2);
    perp1y = x1 - x2;
    dist = Math.sqrt(perp1x * perp1x + perp1y * perp1y);
    perp1x /= dist;
    perp1y /= dist;
    perp1x *= width;
    perp1y *= width;
    var dx0 = x1 - x0;
    var dy0 = y0 - y1;
    var dx1 = x1 - x2;
    var dy1 = y2 - y1;
    var dot = dx0 * dx1 + dy0 * dy1;
    var cross = dy0 * dx1 - dy1 * dx0;
    var clockwise = cross < 0;
    if (Math.abs(cross) < 1e-3 * Math.abs(dot)) {
      verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
      verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
      if (dot >= 0) {
        if (style.join === LINE_JOIN.ROUND) {
          indexCount += round(x1, y1, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 - perp1x * innerWeight, y1 - perp1y * innerWeight, verts, false) + 4;
        } else {
          indexCount += 2;
        }
        verts.push(x1 - perp1x * outerWeight, y1 - perp1y * outerWeight);
        verts.push(x1 + perp1x * innerWeight, y1 + perp1y * innerWeight);
      }
      continue;
    }
    var c1 = (-perpx + x0) * (-perpy + y1) - (-perpx + x1) * (-perpy + y0);
    var c2 = (-perp1x + x2) * (-perp1y + y1) - (-perp1x + x1) * (-perp1y + y2);
    var px = (dx0 * c2 - dx1 * c1) / cross;
    var py = (dy1 * c1 - dy0 * c2) / cross;
    var pdist = (px - x1) * (px - x1) + (py - y1) * (py - y1);
    var imx = x1 + (px - x1) * innerWeight;
    var imy = y1 + (py - y1) * innerWeight;
    var omx = x1 - (px - x1) * outerWeight;
    var omy = y1 - (py - y1) * outerWeight;
    var smallerInsideSegmentSq = Math.min(dx0 * dx0 + dy0 * dy0, dx1 * dx1 + dy1 * dy1);
    var insideWeight = clockwise ? innerWeight : outerWeight;
    var smallerInsideDiagonalSq = smallerInsideSegmentSq + insideWeight * insideWeight * widthSquared;
    var insideMiterOk = pdist <= smallerInsideDiagonalSq;
    if (insideMiterOk) {
      if (style.join === LINE_JOIN.BEVEL || pdist / widthSquared > miterLimitSquared) {
        if (clockwise) {
          verts.push(imx, imy);
          verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
          verts.push(imx, imy);
          verts.push(x1 + perp1x * outerWeight, y1 + perp1y * outerWeight);
        } else {
          verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
          verts.push(omx, omy);
          verts.push(x1 - perp1x * innerWeight, y1 - perp1y * innerWeight);
          verts.push(omx, omy);
        }
        indexCount += 2;
      } else if (style.join === LINE_JOIN.ROUND) {
        if (clockwise) {
          verts.push(imx, imy);
          verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
          indexCount += round(x1, y1, x1 + perpx * outerWeight, y1 + perpy * outerWeight, x1 + perp1x * outerWeight, y1 + perp1y * outerWeight, verts, true) + 4;
          verts.push(imx, imy);
          verts.push(x1 + perp1x * outerWeight, y1 + perp1y * outerWeight);
        } else {
          verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
          verts.push(omx, omy);
          indexCount += round(x1, y1, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 - perp1x * innerWeight, y1 - perp1y * innerWeight, verts, false) + 4;
          verts.push(x1 - perp1x * innerWeight, y1 - perp1y * innerWeight);
          verts.push(omx, omy);
        }
      } else {
        verts.push(imx, imy);
        verts.push(omx, omy);
      }
    } else {
      verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
      verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
      if (style.join === LINE_JOIN.ROUND) {
        if (clockwise) {
          indexCount += round(x1, y1, x1 + perpx * outerWeight, y1 + perpy * outerWeight, x1 + perp1x * outerWeight, y1 + perp1y * outerWeight, verts, true) + 2;
        } else {
          indexCount += round(x1, y1, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 - perp1x * innerWeight, y1 - perp1y * innerWeight, verts, false) + 2;
        }
      } else if (style.join === LINE_JOIN.MITER && pdist / widthSquared <= miterLimitSquared) {
        if (clockwise) {
          verts.push(omx, omy);
          verts.push(omx, omy);
        } else {
          verts.push(imx, imy);
          verts.push(imx, imy);
        }
        indexCount += 2;
      }
      verts.push(x1 - perp1x * innerWeight, y1 - perp1y * innerWeight);
      verts.push(x1 + perp1x * outerWeight, y1 + perp1y * outerWeight);
      indexCount += 2;
    }
  }
  x0 = points[(length - 2) * 2];
  y0 = points[(length - 2) * 2 + 1];
  x1 = points[(length - 1) * 2];
  y1 = points[(length - 1) * 2 + 1];
  perpx = -(y0 - y1);
  perpy = x0 - x1;
  dist = Math.sqrt(perpx * perpx + perpy * perpy);
  perpx /= dist;
  perpy /= dist;
  perpx *= width;
  perpy *= width;
  verts.push(x1 - perpx * innerWeight, y1 - perpy * innerWeight);
  verts.push(x1 + perpx * outerWeight, y1 + perpy * outerWeight);
  if (!closedShape) {
    if (style.cap === LINE_CAP.ROUND) {
      indexCount += round(x1 - perpx * (innerWeight - outerWeight) * 0.5, y1 - perpy * (innerWeight - outerWeight) * 0.5, x1 - perpx * innerWeight, y1 - perpy * innerWeight, x1 + perpx * outerWeight, y1 + perpy * outerWeight, verts, false) + 2;
    } else if (style.cap === LINE_CAP.SQUARE) {
      indexCount += square(x1, y1, perpx, perpy, innerWeight, outerWeight, false, verts);
    }
  }
  var indices2 = graphicsGeometry.indices;
  var eps2 = GRAPHICS_CURVES.epsilon * GRAPHICS_CURVES.epsilon;
  for (var i = indexStart; i < indexCount + indexStart - 2; ++i) {
    x0 = verts[i * 2];
    y0 = verts[i * 2 + 1];
    x1 = verts[(i + 1) * 2];
    y1 = verts[(i + 1) * 2 + 1];
    x2 = verts[(i + 2) * 2];
    y2 = verts[(i + 2) * 2 + 1];
    if (Math.abs(x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1)) < eps2) {
      continue;
    }
    indices2.push(i, i + 1, i + 2);
  }
}
function buildNativeLine(graphicsData, graphicsGeometry) {
  var i = 0;
  var shape = graphicsData.shape;
  var points = graphicsData.points || shape.points;
  var closedShape = shape.type !== SHAPES.POLY || shape.closeStroke;
  if (points.length === 0) {
    return;
  }
  var verts = graphicsGeometry.points;
  var indices2 = graphicsGeometry.indices;
  var length = points.length / 2;
  var startIndex = verts.length / 2;
  var currentIndex = startIndex;
  verts.push(points[0], points[1]);
  for (i = 1; i < length; i++) {
    verts.push(points[i * 2], points[i * 2 + 1]);
    indices2.push(currentIndex, currentIndex + 1);
    currentIndex++;
  }
  if (closedShape) {
    indices2.push(currentIndex, startIndex);
  }
}
function buildLine(graphicsData, graphicsGeometry) {
  if (graphicsData.lineStyle.native) {
    buildNativeLine(graphicsData, graphicsGeometry);
  } else {
    buildNonNativeLine(graphicsData, graphicsGeometry);
  }
}
var ArcUtils = function() {
  function ArcUtils2() {
  }
  ArcUtils2.curveTo = function(x1, y1, x2, y2, radius, points) {
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    var a1 = fromY - y1;
    var b1 = fromX - x1;
    var a2 = y2 - y1;
    var b2 = x2 - x1;
    var mm = Math.abs(a1 * b2 - b1 * a2);
    if (mm < 1e-8 || radius === 0) {
      if (points[points.length - 2] !== x1 || points[points.length - 1] !== y1) {
        points.push(x1, y1);
      }
      return null;
    }
    var dd = a1 * a1 + b1 * b1;
    var cc = a2 * a2 + b2 * b2;
    var tt = a1 * a2 + b1 * b2;
    var k1 = radius * Math.sqrt(dd) / mm;
    var k2 = radius * Math.sqrt(cc) / mm;
    var j1 = k1 * tt / dd;
    var j2 = k2 * tt / cc;
    var cx = k1 * b2 + k2 * b1;
    var cy = k1 * a2 + k2 * a1;
    var px = b1 * (k2 + j1);
    var py = a1 * (k2 + j1);
    var qx = b2 * (k1 + j2);
    var qy = a2 * (k1 + j2);
    var startAngle = Math.atan2(py - cy, px - cx);
    var endAngle = Math.atan2(qy - cy, qx - cx);
    return {
      cx: cx + x1,
      cy: cy + y1,
      radius,
      startAngle,
      endAngle,
      anticlockwise: b1 * a2 > b2 * a1
    };
  };
  ArcUtils2.arc = function(_startX, _startY, cx, cy, radius, startAngle, endAngle, _anticlockwise, points) {
    var sweep = endAngle - startAngle;
    var n = GRAPHICS_CURVES._segmentsCount(Math.abs(sweep) * radius, Math.ceil(Math.abs(sweep) / PI_2) * 40);
    var theta = sweep / (n * 2);
    var theta2 = theta * 2;
    var cTheta = Math.cos(theta);
    var sTheta = Math.sin(theta);
    var segMinus = n - 1;
    var remainder = segMinus % 1 / segMinus;
    for (var i = 0; i <= segMinus; ++i) {
      var real = i + remainder * i;
      var angle = theta + startAngle + theta2 * real;
      var c = Math.cos(angle);
      var s = -Math.sin(angle);
      points.push((cTheta * c + sTheta * s) * radius + cx, (cTheta * -s + sTheta * c) * radius + cy);
    }
  };
  return ArcUtils2;
}();
var BezierUtils = function() {
  function BezierUtils2() {
  }
  BezierUtils2.curveLength = function(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY) {
    var n = 10;
    var result2 = 0;
    var t = 0;
    var t2 = 0;
    var t3 = 0;
    var nt = 0;
    var nt2 = 0;
    var nt3 = 0;
    var x = 0;
    var y = 0;
    var dx = 0;
    var dy = 0;
    var prevX = fromX;
    var prevY = fromY;
    for (var i = 1; i <= n; ++i) {
      t = i / n;
      t2 = t * t;
      t3 = t2 * t;
      nt = 1 - t;
      nt2 = nt * nt;
      nt3 = nt2 * nt;
      x = nt3 * fromX + 3 * nt2 * t * cpX + 3 * nt * t2 * cpX2 + t3 * toX;
      y = nt3 * fromY + 3 * nt2 * t * cpY + 3 * nt * t2 * cpY2 + t3 * toY;
      dx = prevX - x;
      dy = prevY - y;
      prevX = x;
      prevY = y;
      result2 += Math.sqrt(dx * dx + dy * dy);
    }
    return result2;
  };
  BezierUtils2.curveTo = function(cpX, cpY, cpX2, cpY2, toX, toY, points) {
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    points.length -= 2;
    var n = GRAPHICS_CURVES._segmentsCount(BezierUtils2.curveLength(fromX, fromY, cpX, cpY, cpX2, cpY2, toX, toY));
    var dt = 0;
    var dt2 = 0;
    var dt3 = 0;
    var t2 = 0;
    var t3 = 0;
    points.push(fromX, fromY);
    for (var i = 1, j = 0; i <= n; ++i) {
      j = i / n;
      dt = 1 - j;
      dt2 = dt * dt;
      dt3 = dt2 * dt;
      t2 = j * j;
      t3 = t2 * j;
      points.push(dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX, dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }
  };
  return BezierUtils2;
}();
var QuadraticUtils = function() {
  function QuadraticUtils2() {
  }
  QuadraticUtils2.curveLength = function(fromX, fromY, cpX, cpY, toX, toY) {
    var ax = fromX - 2 * cpX + toX;
    var ay = fromY - 2 * cpY + toY;
    var bx = 2 * cpX - 2 * fromX;
    var by = 2 * cpY - 2 * fromY;
    var a = 4 * (ax * ax + ay * ay);
    var b = 4 * (ax * bx + ay * by);
    var c = bx * bx + by * by;
    var s = 2 * Math.sqrt(a + b + c);
    var a2 = Math.sqrt(a);
    var a32 = 2 * a * a2;
    var c2 = 2 * Math.sqrt(c);
    var ba = b / a2;
    return (a32 * s + a2 * b * (s - c2) + (4 * c * a - b * b) * Math.log((2 * a2 + ba + s) / (ba + c2))) / (4 * a32);
  };
  QuadraticUtils2.curveTo = function(cpX, cpY, toX, toY, points) {
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    var n = GRAPHICS_CURVES._segmentsCount(QuadraticUtils2.curveLength(fromX, fromY, cpX, cpY, toX, toY));
    var xa = 0;
    var ya = 0;
    for (var i = 1; i <= n; ++i) {
      var j = i / n;
      xa = fromX + (cpX - fromX) * j;
      ya = fromY + (cpY - fromY) * j;
      points.push(xa + (cpX + (toX - cpX) * j - xa) * j, ya + (cpY + (toY - cpY) * j - ya) * j);
    }
  };
  return QuadraticUtils2;
}();
var BatchPart = function() {
  function BatchPart2() {
    this.reset();
  }
  BatchPart2.prototype.begin = function(style, startIndex, attribStart) {
    this.reset();
    this.style = style;
    this.start = startIndex;
    this.attribStart = attribStart;
  };
  BatchPart2.prototype.end = function(endIndex, endAttrib) {
    this.attribSize = endAttrib - this.attribStart;
    this.size = endIndex - this.start;
  };
  BatchPart2.prototype.reset = function() {
    this.style = null;
    this.size = 0;
    this.start = 0;
    this.attribStart = 0;
    this.attribSize = 0;
  };
  return BatchPart2;
}();
var _a;
var FILL_COMMANDS = (_a = {}, _a[SHAPES.POLY] = buildPoly, _a[SHAPES.CIRC] = buildCircle, _a[SHAPES.ELIP] = buildCircle, _a[SHAPES.RECT] = buildRectangle, _a[SHAPES.RREC] = buildRoundedRectangle, _a);
var BATCH_POOL = [];
var DRAW_CALL_POOL = [];
var GraphicsData = function() {
  function GraphicsData2(shape, fillStyle, lineStyle, matrix) {
    if (fillStyle === void 0) {
      fillStyle = null;
    }
    if (lineStyle === void 0) {
      lineStyle = null;
    }
    if (matrix === void 0) {
      matrix = null;
    }
    this.points = [];
    this.holes = [];
    this.shape = shape;
    this.lineStyle = lineStyle;
    this.fillStyle = fillStyle;
    this.matrix = matrix;
    this.type = shape.type;
  }
  GraphicsData2.prototype.clone = function() {
    return new GraphicsData2(this.shape, this.fillStyle, this.lineStyle, this.matrix);
  };
  GraphicsData2.prototype.destroy = function() {
    this.shape = null;
    this.holes.length = 0;
    this.holes = null;
    this.points.length = 0;
    this.points = null;
    this.lineStyle = null;
    this.fillStyle = null;
  };
  return GraphicsData2;
}();
var tmpPoint = new Point();
var GraphicsGeometry = function(_super) {
  __extends$e(GraphicsGeometry2, _super);
  function GraphicsGeometry2() {
    var _this = _super.call(this) || this;
    _this.closePointEps = 1e-4;
    _this.boundsPadding = 0;
    _this.uvsFloat32 = null;
    _this.indicesUint16 = null;
    _this.batchable = false;
    _this.points = [];
    _this.colors = [];
    _this.uvs = [];
    _this.indices = [];
    _this.textureIds = [];
    _this.graphicsData = [];
    _this.drawCalls = [];
    _this.batchDirty = -1;
    _this.batches = [];
    _this.dirty = 0;
    _this.cacheDirty = -1;
    _this.clearDirty = 0;
    _this.shapeIndex = 0;
    _this._bounds = new Bounds();
    _this.boundsDirty = -1;
    return _this;
  }
  Object.defineProperty(GraphicsGeometry2.prototype, "bounds", {
    get: function() {
      this.updateBatches();
      if (this.boundsDirty !== this.dirty) {
        this.boundsDirty = this.dirty;
        this.calculateBounds();
      }
      return this._bounds;
    },
    enumerable: false,
    configurable: true
  });
  GraphicsGeometry2.prototype.invalidate = function() {
    this.boundsDirty = -1;
    this.dirty++;
    this.batchDirty++;
    this.shapeIndex = 0;
    this.points.length = 0;
    this.colors.length = 0;
    this.uvs.length = 0;
    this.indices.length = 0;
    this.textureIds.length = 0;
    for (var i = 0; i < this.drawCalls.length; i++) {
      this.drawCalls[i].texArray.clear();
      DRAW_CALL_POOL.push(this.drawCalls[i]);
    }
    this.drawCalls.length = 0;
    for (var i = 0; i < this.batches.length; i++) {
      var batchPart = this.batches[i];
      batchPart.reset();
      BATCH_POOL.push(batchPart);
    }
    this.batches.length = 0;
  };
  GraphicsGeometry2.prototype.clear = function() {
    if (this.graphicsData.length > 0) {
      this.invalidate();
      this.clearDirty++;
      this.graphicsData.length = 0;
    }
    return this;
  };
  GraphicsGeometry2.prototype.drawShape = function(shape, fillStyle, lineStyle, matrix) {
    if (fillStyle === void 0) {
      fillStyle = null;
    }
    if (lineStyle === void 0) {
      lineStyle = null;
    }
    if (matrix === void 0) {
      matrix = null;
    }
    var data = new GraphicsData(shape, fillStyle, lineStyle, matrix);
    this.graphicsData.push(data);
    this.dirty++;
    return this;
  };
  GraphicsGeometry2.prototype.drawHole = function(shape, matrix) {
    if (matrix === void 0) {
      matrix = null;
    }
    if (!this.graphicsData.length) {
      return null;
    }
    var data = new GraphicsData(shape, null, null, matrix);
    var lastShape = this.graphicsData[this.graphicsData.length - 1];
    data.lineStyle = lastShape.lineStyle;
    lastShape.holes.push(data);
    this.dirty++;
    return this;
  };
  GraphicsGeometry2.prototype.destroy = function() {
    _super.prototype.destroy.call(this);
    for (var i = 0; i < this.graphicsData.length; ++i) {
      this.graphicsData[i].destroy();
    }
    this.points.length = 0;
    this.points = null;
    this.colors.length = 0;
    this.colors = null;
    this.uvs.length = 0;
    this.uvs = null;
    this.indices.length = 0;
    this.indices = null;
    this.indexBuffer.destroy();
    this.indexBuffer = null;
    this.graphicsData.length = 0;
    this.graphicsData = null;
    this.drawCalls.length = 0;
    this.drawCalls = null;
    this.batches.length = 0;
    this.batches = null;
    this._bounds = null;
  };
  GraphicsGeometry2.prototype.containsPoint = function(point) {
    var graphicsData = this.graphicsData;
    for (var i = 0; i < graphicsData.length; ++i) {
      var data = graphicsData[i];
      if (!data.fillStyle.visible) {
        continue;
      }
      if (data.shape) {
        if (data.matrix) {
          data.matrix.applyInverse(point, tmpPoint);
        } else {
          tmpPoint.copyFrom(point);
        }
        if (data.shape.contains(tmpPoint.x, tmpPoint.y)) {
          var hitHole = false;
          if (data.holes) {
            for (var i_1 = 0; i_1 < data.holes.length; i_1++) {
              var hole = data.holes[i_1];
              if (hole.shape.contains(tmpPoint.x, tmpPoint.y)) {
                hitHole = true;
                break;
              }
            }
          }
          if (!hitHole) {
            return true;
          }
        }
      }
    }
    return false;
  };
  GraphicsGeometry2.prototype.updateBatches = function() {
    if (!this.graphicsData.length) {
      this.batchable = true;
      return;
    }
    if (!this.validateBatching()) {
      return;
    }
    this.cacheDirty = this.dirty;
    var uvs = this.uvs;
    var graphicsData = this.graphicsData;
    var batchPart = null;
    var currentStyle = null;
    if (this.batches.length > 0) {
      batchPart = this.batches[this.batches.length - 1];
      currentStyle = batchPart.style;
    }
    for (var i = this.shapeIndex; i < graphicsData.length; i++) {
      this.shapeIndex++;
      var data = graphicsData[i];
      var fillStyle = data.fillStyle;
      var lineStyle = data.lineStyle;
      var command = FILL_COMMANDS[data.type];
      command.build(data);
      if (data.matrix) {
        this.transformPoints(data.points, data.matrix);
      }
      if (fillStyle.visible || lineStyle.visible) {
        this.processHoles(data.holes);
      }
      for (var j = 0; j < 2; j++) {
        var style = j === 0 ? fillStyle : lineStyle;
        if (!style.visible) {
          continue;
        }
        var nextTexture = style.texture.baseTexture;
        var index_1 = this.indices.length;
        var attribIndex = this.points.length / 2;
        nextTexture.wrapMode = WRAP_MODES.REPEAT;
        if (j === 0) {
          this.processFill(data);
        } else {
          this.processLine(data);
        }
        var size = this.points.length / 2 - attribIndex;
        if (size === 0) {
          continue;
        }
        if (batchPart && !this._compareStyles(currentStyle, style)) {
          batchPart.end(index_1, attribIndex);
          batchPart = null;
        }
        if (!batchPart) {
          batchPart = BATCH_POOL.pop() || new BatchPart();
          batchPart.begin(style, index_1, attribIndex);
          this.batches.push(batchPart);
          currentStyle = style;
        }
        this.addUvs(this.points, uvs, style.texture, attribIndex, size, style.matrix);
      }
    }
    var index2 = this.indices.length;
    var attrib = this.points.length / 2;
    if (batchPart) {
      batchPart.end(index2, attrib);
    }
    if (this.batches.length === 0) {
      this.batchable = true;
      return;
    }
    var need32 = attrib > 65535;
    if (this.indicesUint16 && this.indices.length === this.indicesUint16.length && need32 === this.indicesUint16.BYTES_PER_ELEMENT > 2) {
      this.indicesUint16.set(this.indices);
    } else {
      this.indicesUint16 = need32 ? new Uint32Array(this.indices) : new Uint16Array(this.indices);
    }
    this.batchable = this.isBatchable();
    if (this.batchable) {
      this.packBatches();
    } else {
      this.buildDrawCalls();
    }
  };
  GraphicsGeometry2.prototype._compareStyles = function(styleA, styleB) {
    if (!styleA || !styleB) {
      return false;
    }
    if (styleA.texture.baseTexture !== styleB.texture.baseTexture) {
      return false;
    }
    if (styleA.color + styleA.alpha !== styleB.color + styleB.alpha) {
      return false;
    }
    if (!!styleA.native !== !!styleB.native) {
      return false;
    }
    return true;
  };
  GraphicsGeometry2.prototype.validateBatching = function() {
    if (this.dirty === this.cacheDirty || !this.graphicsData.length) {
      return false;
    }
    for (var i = 0, l = this.graphicsData.length; i < l; i++) {
      var data = this.graphicsData[i];
      var fill = data.fillStyle;
      var line = data.lineStyle;
      if (fill && !fill.texture.baseTexture.valid) {
        return false;
      }
      if (line && !line.texture.baseTexture.valid) {
        return false;
      }
    }
    return true;
  };
  GraphicsGeometry2.prototype.packBatches = function() {
    this.batchDirty++;
    this.uvsFloat32 = new Float32Array(this.uvs);
    var batches = this.batches;
    for (var i = 0, l = batches.length; i < l; i++) {
      var batch = batches[i];
      for (var j = 0; j < batch.size; j++) {
        var index2 = batch.start + j;
        this.indicesUint16[index2] = this.indicesUint16[index2] - batch.attribStart;
      }
    }
  };
  GraphicsGeometry2.prototype.isBatchable = function() {
    if (this.points.length > 65535 * 2) {
      return false;
    }
    var batches = this.batches;
    for (var i = 0; i < batches.length; i++) {
      if (batches[i].style.native) {
        return false;
      }
    }
    return this.points.length < GraphicsGeometry2.BATCHABLE_SIZE * 2;
  };
  GraphicsGeometry2.prototype.buildDrawCalls = function() {
    var TICK = ++BaseTexture._globalBatch;
    for (var i = 0; i < this.drawCalls.length; i++) {
      this.drawCalls[i].texArray.clear();
      DRAW_CALL_POOL.push(this.drawCalls[i]);
    }
    this.drawCalls.length = 0;
    var colors = this.colors;
    var textureIds = this.textureIds;
    var currentGroup = DRAW_CALL_POOL.pop();
    if (!currentGroup) {
      currentGroup = new BatchDrawCall();
      currentGroup.texArray = new BatchTextureArray();
    }
    currentGroup.texArray.count = 0;
    currentGroup.start = 0;
    currentGroup.size = 0;
    currentGroup.type = DRAW_MODES.TRIANGLES;
    var textureCount = 0;
    var currentTexture = null;
    var textureId = 0;
    var native = false;
    var drawMode = DRAW_MODES.TRIANGLES;
    var index2 = 0;
    this.drawCalls.push(currentGroup);
    for (var i = 0; i < this.batches.length; i++) {
      var data = this.batches[i];
      var MAX_TEXTURES = 8;
      var style = data.style;
      var nextTexture = style.texture.baseTexture;
      if (native !== !!style.native) {
        native = !!style.native;
        drawMode = native ? DRAW_MODES.LINES : DRAW_MODES.TRIANGLES;
        currentTexture = null;
        textureCount = MAX_TEXTURES;
        TICK++;
      }
      if (currentTexture !== nextTexture) {
        currentTexture = nextTexture;
        if (nextTexture._batchEnabled !== TICK) {
          if (textureCount === MAX_TEXTURES) {
            TICK++;
            textureCount = 0;
            if (currentGroup.size > 0) {
              currentGroup = DRAW_CALL_POOL.pop();
              if (!currentGroup) {
                currentGroup = new BatchDrawCall();
                currentGroup.texArray = new BatchTextureArray();
              }
              this.drawCalls.push(currentGroup);
            }
            currentGroup.start = index2;
            currentGroup.size = 0;
            currentGroup.texArray.count = 0;
            currentGroup.type = drawMode;
          }
          nextTexture.touched = 1;
          nextTexture._batchEnabled = TICK;
          nextTexture._batchLocation = textureCount;
          nextTexture.wrapMode = WRAP_MODES.REPEAT;
          currentGroup.texArray.elements[currentGroup.texArray.count++] = nextTexture;
          textureCount++;
        }
      }
      currentGroup.size += data.size;
      index2 += data.size;
      textureId = nextTexture._batchLocation;
      this.addColors(colors, style.color, style.alpha, data.attribSize, data.attribStart);
      this.addTextureIds(textureIds, textureId, data.attribSize, data.attribStart);
    }
    BaseTexture._globalBatch = TICK;
    this.packAttributes();
  };
  GraphicsGeometry2.prototype.packAttributes = function() {
    var verts = this.points;
    var uvs = this.uvs;
    var colors = this.colors;
    var textureIds = this.textureIds;
    var glPoints = new ArrayBuffer(verts.length * 3 * 4);
    var f32 = new Float32Array(glPoints);
    var u32 = new Uint32Array(glPoints);
    var p = 0;
    for (var i = 0; i < verts.length / 2; i++) {
      f32[p++] = verts[i * 2];
      f32[p++] = verts[i * 2 + 1];
      f32[p++] = uvs[i * 2];
      f32[p++] = uvs[i * 2 + 1];
      u32[p++] = colors[i];
      f32[p++] = textureIds[i];
    }
    this._buffer.update(glPoints);
    this._indexBuffer.update(this.indicesUint16);
  };
  GraphicsGeometry2.prototype.processFill = function(data) {
    if (data.holes.length) {
      buildPoly.triangulate(data, this);
    } else {
      var command = FILL_COMMANDS[data.type];
      command.triangulate(data, this);
    }
  };
  GraphicsGeometry2.prototype.processLine = function(data) {
    buildLine(data, this);
    for (var i = 0; i < data.holes.length; i++) {
      buildLine(data.holes[i], this);
    }
  };
  GraphicsGeometry2.prototype.processHoles = function(holes) {
    for (var i = 0; i < holes.length; i++) {
      var hole = holes[i];
      var command = FILL_COMMANDS[hole.type];
      command.build(hole);
      if (hole.matrix) {
        this.transformPoints(hole.points, hole.matrix);
      }
    }
  };
  GraphicsGeometry2.prototype.calculateBounds = function() {
    var bounds = this._bounds;
    bounds.clear();
    bounds.addVertexData(this.points, 0, this.points.length);
    bounds.pad(this.boundsPadding, this.boundsPadding);
  };
  GraphicsGeometry2.prototype.transformPoints = function(points, matrix) {
    for (var i = 0; i < points.length / 2; i++) {
      var x = points[i * 2];
      var y = points[i * 2 + 1];
      points[i * 2] = matrix.a * x + matrix.c * y + matrix.tx;
      points[i * 2 + 1] = matrix.b * x + matrix.d * y + matrix.ty;
    }
  };
  GraphicsGeometry2.prototype.addColors = function(colors, color2, alpha, size, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    var rgb = (color2 >> 16) + (color2 & 65280) + ((color2 & 255) << 16);
    var rgba = premultiplyTint(rgb, alpha);
    colors.length = Math.max(colors.length, offset + size);
    for (var i = 0; i < size; i++) {
      colors[offset + i] = rgba;
    }
  };
  GraphicsGeometry2.prototype.addTextureIds = function(textureIds, id, size, offset) {
    if (offset === void 0) {
      offset = 0;
    }
    textureIds.length = Math.max(textureIds.length, offset + size);
    for (var i = 0; i < size; i++) {
      textureIds[offset + i] = id;
    }
  };
  GraphicsGeometry2.prototype.addUvs = function(verts, uvs, texture, start, size, matrix) {
    if (matrix === void 0) {
      matrix = null;
    }
    var index2 = 0;
    var uvsStart = uvs.length;
    var frame = texture.frame;
    while (index2 < size) {
      var x = verts[(start + index2) * 2];
      var y = verts[(start + index2) * 2 + 1];
      if (matrix) {
        var nx = matrix.a * x + matrix.c * y + matrix.tx;
        y = matrix.b * x + matrix.d * y + matrix.ty;
        x = nx;
      }
      index2++;
      uvs.push(x / frame.width, y / frame.height);
    }
    var baseTexture = texture.baseTexture;
    if (frame.width < baseTexture.width || frame.height < baseTexture.height) {
      this.adjustUvs(uvs, texture, uvsStart, size);
    }
  };
  GraphicsGeometry2.prototype.adjustUvs = function(uvs, texture, start, size) {
    var baseTexture = texture.baseTexture;
    var eps = 1e-6;
    var finish = start + size * 2;
    var frame = texture.frame;
    var scaleX = frame.width / baseTexture.width;
    var scaleY = frame.height / baseTexture.height;
    var offsetX = frame.x / frame.width;
    var offsetY = frame.y / frame.height;
    var minX = Math.floor(uvs[start] + eps);
    var minY = Math.floor(uvs[start + 1] + eps);
    for (var i = start + 2; i < finish; i += 2) {
      minX = Math.min(minX, Math.floor(uvs[i] + eps));
      minY = Math.min(minY, Math.floor(uvs[i + 1] + eps));
    }
    offsetX -= minX;
    offsetY -= minY;
    for (var i = start; i < finish; i += 2) {
      uvs[i] = (uvs[i] + offsetX) * scaleX;
      uvs[i + 1] = (uvs[i + 1] + offsetY) * scaleY;
    }
  };
  GraphicsGeometry2.BATCHABLE_SIZE = 100;
  return GraphicsGeometry2;
}(BatchGeometry);
var LineStyle = function(_super) {
  __extends$e(LineStyle2, _super);
  function LineStyle2() {
    var _this = _super !== null && _super.apply(this, arguments) || this;
    _this.width = 0;
    _this.alignment = 0.5;
    _this.native = false;
    _this.cap = LINE_CAP.BUTT;
    _this.join = LINE_JOIN.MITER;
    _this.miterLimit = 10;
    return _this;
  }
  LineStyle2.prototype.clone = function() {
    var obj = new LineStyle2();
    obj.color = this.color;
    obj.alpha = this.alpha;
    obj.texture = this.texture;
    obj.matrix = this.matrix;
    obj.visible = this.visible;
    obj.width = this.width;
    obj.alignment = this.alignment;
    obj.native = this.native;
    obj.cap = this.cap;
    obj.join = this.join;
    obj.miterLimit = this.miterLimit;
    return obj;
  };
  LineStyle2.prototype.reset = function() {
    _super.prototype.reset.call(this);
    this.color = 0;
    this.alignment = 0.5;
    this.width = 0;
    this.native = false;
  };
  return LineStyle2;
}(FillStyle);
var temp = new Float32Array(3);
var DEFAULT_SHADERS = {};
var Graphics = function(_super) {
  __extends$e(Graphics2, _super);
  function Graphics2(geometry) {
    if (geometry === void 0) {
      geometry = null;
    }
    var _this = _super.call(this) || this;
    _this.shader = null;
    _this.pluginName = "batch";
    _this.currentPath = null;
    _this.batches = [];
    _this.batchTint = -1;
    _this.batchDirty = -1;
    _this.vertexData = null;
    _this._fillStyle = new FillStyle();
    _this._lineStyle = new LineStyle();
    _this._matrix = null;
    _this._holeMode = false;
    _this.state = State.for2d();
    _this._geometry = geometry || new GraphicsGeometry();
    _this._geometry.refCount++;
    _this._transformID = -1;
    _this.tint = 16777215;
    _this.blendMode = BLEND_MODES.NORMAL;
    return _this;
  }
  Object.defineProperty(Graphics2.prototype, "geometry", {
    get: function() {
      return this._geometry;
    },
    enumerable: false,
    configurable: true
  });
  Graphics2.prototype.clone = function() {
    this.finishPoly();
    return new Graphics2(this._geometry);
  };
  Object.defineProperty(Graphics2.prototype, "blendMode", {
    get: function() {
      return this.state.blendMode;
    },
    set: function(value) {
      this.state.blendMode = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Graphics2.prototype, "tint", {
    get: function() {
      return this._tint;
    },
    set: function(value) {
      this._tint = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Graphics2.prototype, "fill", {
    get: function() {
      return this._fillStyle;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Graphics2.prototype, "line", {
    get: function() {
      return this._lineStyle;
    },
    enumerable: false,
    configurable: true
  });
  Graphics2.prototype.lineStyle = function(options, color2, alpha, alignment, native) {
    if (options === void 0) {
      options = null;
    }
    if (color2 === void 0) {
      color2 = 0;
    }
    if (alpha === void 0) {
      alpha = 1;
    }
    if (alignment === void 0) {
      alignment = 0.5;
    }
    if (native === void 0) {
      native = false;
    }
    if (typeof options === "number") {
      options = { width: options, color: color2, alpha, alignment, native };
    }
    return this.lineTextureStyle(options);
  };
  Graphics2.prototype.lineTextureStyle = function(options) {
    options = Object.assign({
      width: 0,
      texture: Texture.WHITE,
      color: options && options.texture ? 16777215 : 0,
      alpha: 1,
      matrix: null,
      alignment: 0.5,
      native: false,
      cap: LINE_CAP.BUTT,
      join: LINE_JOIN.MITER,
      miterLimit: 10
    }, options);
    if (this.currentPath) {
      this.startPoly();
    }
    var visible = options.width > 0 && options.alpha > 0;
    if (!visible) {
      this._lineStyle.reset();
    } else {
      if (options.matrix) {
        options.matrix = options.matrix.clone();
        options.matrix.invert();
      }
      Object.assign(this._lineStyle, { visible }, options);
    }
    return this;
  };
  Graphics2.prototype.startPoly = function() {
    if (this.currentPath) {
      var points = this.currentPath.points;
      var len = this.currentPath.points.length;
      if (len > 2) {
        this.drawShape(this.currentPath);
        this.currentPath = new Polygon$1();
        this.currentPath.closeStroke = false;
        this.currentPath.points.push(points[len - 2], points[len - 1]);
      }
    } else {
      this.currentPath = new Polygon$1();
      this.currentPath.closeStroke = false;
    }
  };
  Graphics2.prototype.finishPoly = function() {
    if (this.currentPath) {
      if (this.currentPath.points.length > 2) {
        this.drawShape(this.currentPath);
        this.currentPath = null;
      } else {
        this.currentPath.points.length = 0;
      }
    }
  };
  Graphics2.prototype.moveTo = function(x, y) {
    this.startPoly();
    this.currentPath.points[0] = x;
    this.currentPath.points[1] = y;
    return this;
  };
  Graphics2.prototype.lineTo = function(x, y) {
    if (!this.currentPath) {
      this.moveTo(0, 0);
    }
    var points = this.currentPath.points;
    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    if (fromX !== x || fromY !== y) {
      points.push(x, y);
    }
    return this;
  };
  Graphics2.prototype._initCurve = function(x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (this.currentPath) {
      if (this.currentPath.points.length === 0) {
        this.currentPath.points = [x, y];
      }
    } else {
      this.moveTo(x, y);
    }
  };
  Graphics2.prototype.quadraticCurveTo = function(cpX, cpY, toX, toY) {
    this._initCurve();
    var points = this.currentPath.points;
    if (points.length === 0) {
      this.moveTo(0, 0);
    }
    QuadraticUtils.curveTo(cpX, cpY, toX, toY, points);
    return this;
  };
  Graphics2.prototype.bezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY) {
    this._initCurve();
    BezierUtils.curveTo(cpX, cpY, cpX2, cpY2, toX, toY, this.currentPath.points);
    return this;
  };
  Graphics2.prototype.arcTo = function(x1, y1, x2, y2, radius) {
    this._initCurve(x1, y1);
    var points = this.currentPath.points;
    var result2 = ArcUtils.curveTo(x1, y1, x2, y2, radius, points);
    if (result2) {
      var cx = result2.cx, cy = result2.cy, radius_1 = result2.radius, startAngle = result2.startAngle, endAngle = result2.endAngle, anticlockwise = result2.anticlockwise;
      this.arc(cx, cy, radius_1, startAngle, endAngle, anticlockwise);
    }
    return this;
  };
  Graphics2.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise) {
    if (anticlockwise === void 0) {
      anticlockwise = false;
    }
    if (startAngle === endAngle) {
      return this;
    }
    if (!anticlockwise && endAngle <= startAngle) {
      endAngle += PI_2;
    } else if (anticlockwise && startAngle <= endAngle) {
      startAngle += PI_2;
    }
    var sweep = endAngle - startAngle;
    if (sweep === 0) {
      return this;
    }
    var startX = cx + Math.cos(startAngle) * radius;
    var startY = cy + Math.sin(startAngle) * radius;
    var eps = this._geometry.closePointEps;
    var points = this.currentPath ? this.currentPath.points : null;
    if (points) {
      var xDiff = Math.abs(points[points.length - 2] - startX);
      var yDiff = Math.abs(points[points.length - 1] - startY);
      if (xDiff < eps && yDiff < eps)
        ;
      else {
        points.push(startX, startY);
      }
    } else {
      this.moveTo(startX, startY);
      points = this.currentPath.points;
    }
    ArcUtils.arc(startX, startY, cx, cy, radius, startAngle, endAngle, anticlockwise, points);
    return this;
  };
  Graphics2.prototype.beginFill = function(color2, alpha) {
    if (color2 === void 0) {
      color2 = 0;
    }
    if (alpha === void 0) {
      alpha = 1;
    }
    return this.beginTextureFill({ texture: Texture.WHITE, color: color2, alpha });
  };
  Graphics2.prototype.beginTextureFill = function(options) {
    options = Object.assign({
      texture: Texture.WHITE,
      color: 16777215,
      alpha: 1,
      matrix: null
    }, options);
    if (this.currentPath) {
      this.startPoly();
    }
    var visible = options.alpha > 0;
    if (!visible) {
      this._fillStyle.reset();
    } else {
      if (options.matrix) {
        options.matrix = options.matrix.clone();
        options.matrix.invert();
      }
      Object.assign(this._fillStyle, { visible }, options);
    }
    return this;
  };
  Graphics2.prototype.endFill = function() {
    this.finishPoly();
    this._fillStyle.reset();
    return this;
  };
  Graphics2.prototype.drawRect = function(x, y, width, height) {
    return this.drawShape(new Rectangle(x, y, width, height));
  };
  Graphics2.prototype.drawRoundedRect = function(x, y, width, height, radius) {
    return this.drawShape(new RoundedRectangle(x, y, width, height, radius));
  };
  Graphics2.prototype.drawCircle = function(x, y, radius) {
    return this.drawShape(new Circle(x, y, radius));
  };
  Graphics2.prototype.drawEllipse = function(x, y, width, height) {
    return this.drawShape(new Ellipse(x, y, width, height));
  };
  Graphics2.prototype.drawPolygon = function() {
    var arguments$1 = arguments;
    var path2 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      path2[_i] = arguments$1[_i];
    }
    var points;
    var closeStroke = true;
    var poly = path2[0];
    if (poly.points) {
      closeStroke = poly.closeStroke;
      points = poly.points;
    } else if (Array.isArray(path2[0])) {
      points = path2[0];
    } else {
      points = path2;
    }
    var shape = new Polygon$1(points);
    shape.closeStroke = closeStroke;
    this.drawShape(shape);
    return this;
  };
  Graphics2.prototype.drawShape = function(shape) {
    if (!this._holeMode) {
      this._geometry.drawShape(shape, this._fillStyle.clone(), this._lineStyle.clone(), this._matrix);
    } else {
      this._geometry.drawHole(shape, this._matrix);
    }
    return this;
  };
  Graphics2.prototype.clear = function() {
    this._geometry.clear();
    this._lineStyle.reset();
    this._fillStyle.reset();
    this._boundsID++;
    this._matrix = null;
    this._holeMode = false;
    this.currentPath = null;
    return this;
  };
  Graphics2.prototype.isFastRect = function() {
    var data = this._geometry.graphicsData;
    return data.length === 1 && data[0].shape.type === SHAPES.RECT && !data[0].matrix && !data[0].holes.length && !(data[0].lineStyle.visible && data[0].lineStyle.width);
  };
  Graphics2.prototype._render = function(renderer) {
    this.finishPoly();
    var geometry = this._geometry;
    geometry.updateBatches();
    if (geometry.batchable) {
      if (this.batchDirty !== geometry.batchDirty) {
        this._populateBatches();
      }
      this._renderBatched(renderer);
    } else {
      renderer.batch.flush();
      this._renderDirect(renderer);
    }
  };
  Graphics2.prototype._populateBatches = function() {
    var geometry = this._geometry;
    var blendMode = this.blendMode;
    var len = geometry.batches.length;
    this.batchTint = -1;
    this._transformID = -1;
    this.batchDirty = geometry.batchDirty;
    this.batches.length = len;
    this.vertexData = new Float32Array(geometry.points);
    for (var i = 0; i < len; i++) {
      var gI = geometry.batches[i];
      var color2 = gI.style.color;
      var vertexData = new Float32Array(this.vertexData.buffer, gI.attribStart * 4 * 2, gI.attribSize * 2);
      var uvs = new Float32Array(geometry.uvsFloat32.buffer, gI.attribStart * 4 * 2, gI.attribSize * 2);
      var indices2 = new Uint16Array(geometry.indicesUint16.buffer, gI.start * 2, gI.size);
      var batch = {
        vertexData,
        blendMode,
        indices: indices2,
        uvs,
        _batchRGB: hex2rgb(color2),
        _tintRGB: color2,
        _texture: gI.style.texture,
        alpha: gI.style.alpha,
        worldAlpha: 1
      };
      this.batches[i] = batch;
    }
  };
  Graphics2.prototype._renderBatched = function(renderer) {
    if (!this.batches.length) {
      return;
    }
    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
    this.calculateVertices();
    this.calculateTints();
    for (var i = 0, l = this.batches.length; i < l; i++) {
      var batch = this.batches[i];
      batch.worldAlpha = this.worldAlpha * batch.alpha;
      renderer.plugins[this.pluginName].render(batch);
    }
  };
  Graphics2.prototype._renderDirect = function(renderer) {
    var shader = this._resolveDirectShader(renderer);
    var geometry = this._geometry;
    var tint = this.tint;
    var worldAlpha = this.worldAlpha;
    var uniforms = shader.uniforms;
    var drawCalls = geometry.drawCalls;
    uniforms.translationMatrix = this.transform.worldTransform;
    uniforms.tint[0] = (tint >> 16 & 255) / 255 * worldAlpha;
    uniforms.tint[1] = (tint >> 8 & 255) / 255 * worldAlpha;
    uniforms.tint[2] = (tint & 255) / 255 * worldAlpha;
    uniforms.tint[3] = worldAlpha;
    renderer.shader.bind(shader);
    renderer.geometry.bind(geometry, shader);
    renderer.state.set(this.state);
    for (var i = 0, l = drawCalls.length; i < l; i++) {
      this._renderDrawCallDirect(renderer, geometry.drawCalls[i]);
    }
  };
  Graphics2.prototype._renderDrawCallDirect = function(renderer, drawCall) {
    var texArray = drawCall.texArray, type = drawCall.type, size = drawCall.size, start = drawCall.start;
    var groupTextureCount = texArray.count;
    for (var j = 0; j < groupTextureCount; j++) {
      renderer.texture.bind(texArray.elements[j], j);
    }
    renderer.geometry.draw(type, size, start);
  };
  Graphics2.prototype._resolveDirectShader = function(renderer) {
    var shader = this.shader;
    var pluginName = this.pluginName;
    if (!shader) {
      if (!DEFAULT_SHADERS[pluginName]) {
        var MAX_TEXTURES = renderer.plugins[pluginName].MAX_TEXTURES;
        var sampleValues = new Int32Array(MAX_TEXTURES);
        for (var i = 0; i < MAX_TEXTURES; i++) {
          sampleValues[i] = i;
        }
        var uniforms = {
          tint: new Float32Array([1, 1, 1, 1]),
          translationMatrix: new Matrix(),
          default: UniformGroup.from({ uSamplers: sampleValues }, true)
        };
        var program = renderer.plugins[pluginName]._shader.program;
        DEFAULT_SHADERS[pluginName] = new Shader(program, uniforms);
      }
      shader = DEFAULT_SHADERS[pluginName];
    }
    return shader;
  };
  Graphics2.prototype._calculateBounds = function() {
    this.finishPoly();
    var geometry = this._geometry;
    if (!geometry.graphicsData.length) {
      return;
    }
    var _a2 = geometry.bounds, minX = _a2.minX, minY = _a2.minY, maxX = _a2.maxX, maxY = _a2.maxY;
    this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
  };
  Graphics2.prototype.containsPoint = function(point) {
    this.worldTransform.applyInverse(point, Graphics2._TEMP_POINT);
    return this._geometry.containsPoint(Graphics2._TEMP_POINT);
  };
  Graphics2.prototype.calculateTints = function() {
    if (this.batchTint !== this.tint) {
      this.batchTint = this.tint;
      var tintRGB = hex2rgb(this.tint, temp);
      for (var i = 0; i < this.batches.length; i++) {
        var batch = this.batches[i];
        var batchTint = batch._batchRGB;
        var r = tintRGB[0] * batchTint[0] * 255;
        var g = tintRGB[1] * batchTint[1] * 255;
        var b = tintRGB[2] * batchTint[2] * 255;
        var color2 = (r << 16) + (g << 8) + (b | 0);
        batch._tintRGB = (color2 >> 16) + (color2 & 65280) + ((color2 & 255) << 16);
      }
    }
  };
  Graphics2.prototype.calculateVertices = function() {
    var wtID = this.transform._worldID;
    if (this._transformID === wtID) {
      return;
    }
    this._transformID = wtID;
    var wt = this.transform.worldTransform;
    var a = wt.a;
    var b = wt.b;
    var c = wt.c;
    var d = wt.d;
    var tx = wt.tx;
    var ty = wt.ty;
    var data = this._geometry.points;
    var vertexData = this.vertexData;
    var count = 0;
    for (var i = 0; i < data.length; i += 2) {
      var x = data[i];
      var y = data[i + 1];
      vertexData[count++] = a * x + c * y + tx;
      vertexData[count++] = d * y + b * x + ty;
    }
  };
  Graphics2.prototype.closePath = function() {
    var currentPath = this.currentPath;
    if (currentPath) {
      currentPath.closeStroke = true;
      this.finishPoly();
    }
    return this;
  };
  Graphics2.prototype.setMatrix = function(matrix) {
    this._matrix = matrix;
    return this;
  };
  Graphics2.prototype.beginHole = function() {
    this.finishPoly();
    this._holeMode = true;
    return this;
  };
  Graphics2.prototype.endHole = function() {
    this.finishPoly();
    this._holeMode = false;
    return this;
  };
  Graphics2.prototype.destroy = function(options) {
    this._geometry.refCount--;
    if (this._geometry.refCount === 0) {
      this._geometry.dispose();
    }
    this._matrix = null;
    this.currentPath = null;
    this._lineStyle.destroy();
    this._lineStyle = null;
    this._fillStyle.destroy();
    this._fillStyle = null;
    this._geometry = null;
    this.shader = null;
    this.vertexData = null;
    this.batches.length = 0;
    this.batches = null;
    _super.prototype.destroy.call(this, options);
  };
  Graphics2.nextRoundedRectBehavior = false;
  Graphics2._TEMP_POINT = new Point();
  return Graphics2;
}(Container);
var graphicsUtils = {
  buildPoly,
  buildCircle,
  buildRectangle,
  buildRoundedRectangle,
  buildLine,
  ArcUtils,
  BezierUtils,
  QuadraticUtils,
  BatchPart,
  FILL_COMMANDS,
  BATCH_POOL,
  DRAW_CALL_POOL
};
var extendStatics$d = function(d, b) {
  extendStatics$d = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$d(d, b);
};
function __extends$d(d, b) {
  extendStatics$d(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var tempPoint$2 = new Point();
var indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
var Sprite$1 = function(_super) {
  __extends$d(Sprite2, _super);
  function Sprite2(texture) {
    var _this = _super.call(this) || this;
    _this._anchor = new ObservablePoint(_this._onAnchorUpdate, _this, texture ? texture.defaultAnchor.x : 0, texture ? texture.defaultAnchor.y : 0);
    _this._texture = null;
    _this._width = 0;
    _this._height = 0;
    _this._tint = null;
    _this._tintRGB = null;
    _this.tint = 16777215;
    _this.blendMode = BLEND_MODES.NORMAL;
    _this._cachedTint = 16777215;
    _this.uvs = null;
    _this.texture = texture || Texture.EMPTY;
    _this.vertexData = new Float32Array(8);
    _this.vertexTrimmedData = null;
    _this._transformID = -1;
    _this._textureID = -1;
    _this._transformTrimmedID = -1;
    _this._textureTrimmedID = -1;
    _this.indices = indices;
    _this.pluginName = "batch";
    _this.isSprite = true;
    _this._roundPixels = settings.ROUND_PIXELS;
    return _this;
  }
  Sprite2.prototype._onTextureUpdate = function() {
    this._textureID = -1;
    this._textureTrimmedID = -1;
    this._cachedTint = 16777215;
    if (this._width) {
      this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
    }
    if (this._height) {
      this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
    }
  };
  Sprite2.prototype._onAnchorUpdate = function() {
    this._transformID = -1;
    this._transformTrimmedID = -1;
  };
  Sprite2.prototype.calculateVertices = function() {
    var texture = this._texture;
    if (this._transformID === this.transform._worldID && this._textureID === texture._updateID) {
      return;
    }
    if (this._textureID !== texture._updateID) {
      this.uvs = this._texture._uvs.uvsFloat32;
    }
    this._transformID = this.transform._worldID;
    this._textureID = texture._updateID;
    var wt = this.transform.worldTransform;
    var a = wt.a;
    var b = wt.b;
    var c = wt.c;
    var d = wt.d;
    var tx = wt.tx;
    var ty = wt.ty;
    var vertexData = this.vertexData;
    var trim = texture.trim;
    var orig = texture.orig;
    var anchor = this._anchor;
    var w0 = 0;
    var w1 = 0;
    var h0 = 0;
    var h1 = 0;
    if (trim) {
      w1 = trim.x - anchor._x * orig.width;
      w0 = w1 + trim.width;
      h1 = trim.y - anchor._y * orig.height;
      h0 = h1 + trim.height;
    } else {
      w1 = -anchor._x * orig.width;
      w0 = w1 + orig.width;
      h1 = -anchor._y * orig.height;
      h0 = h1 + orig.height;
    }
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
    if (this._roundPixels) {
      var resolution = settings.RESOLUTION;
      for (var i = 0; i < vertexData.length; ++i) {
        vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
      }
    }
  };
  Sprite2.prototype.calculateTrimmedVertices = function() {
    if (!this.vertexTrimmedData) {
      this.vertexTrimmedData = new Float32Array(8);
    } else if (this._transformTrimmedID === this.transform._worldID && this._textureTrimmedID === this._texture._updateID) {
      return;
    }
    this._transformTrimmedID = this.transform._worldID;
    this._textureTrimmedID = this._texture._updateID;
    var texture = this._texture;
    var vertexData = this.vertexTrimmedData;
    var orig = texture.orig;
    var anchor = this._anchor;
    var wt = this.transform.worldTransform;
    var a = wt.a;
    var b = wt.b;
    var c = wt.c;
    var d = wt.d;
    var tx = wt.tx;
    var ty = wt.ty;
    var w1 = -anchor._x * orig.width;
    var w0 = w1 + orig.width;
    var h1 = -anchor._y * orig.height;
    var h0 = h1 + orig.height;
    vertexData[0] = a * w1 + c * h1 + tx;
    vertexData[1] = d * h1 + b * w1 + ty;
    vertexData[2] = a * w0 + c * h1 + tx;
    vertexData[3] = d * h1 + b * w0 + ty;
    vertexData[4] = a * w0 + c * h0 + tx;
    vertexData[5] = d * h0 + b * w0 + ty;
    vertexData[6] = a * w1 + c * h0 + tx;
    vertexData[7] = d * h0 + b * w1 + ty;
  };
  Sprite2.prototype._render = function(renderer) {
    this.calculateVertices();
    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  };
  Sprite2.prototype._calculateBounds = function() {
    var trim = this._texture.trim;
    var orig = this._texture.orig;
    if (!trim || trim.width === orig.width && trim.height === orig.height) {
      this.calculateVertices();
      this._bounds.addQuad(this.vertexData);
    } else {
      this.calculateTrimmedVertices();
      this._bounds.addQuad(this.vertexTrimmedData);
    }
  };
  Sprite2.prototype.getLocalBounds = function(rect) {
    if (this.children.length === 0) {
      if (!this._localBounds) {
        this._localBounds = new Bounds();
      }
      this._localBounds.minX = this._texture.orig.width * -this._anchor._x;
      this._localBounds.minY = this._texture.orig.height * -this._anchor._y;
      this._localBounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
      this._localBounds.maxY = this._texture.orig.height * (1 - this._anchor._y);
      if (!rect) {
        if (!this._localBoundsRect) {
          this._localBoundsRect = new Rectangle();
        }
        rect = this._localBoundsRect;
      }
      return this._localBounds.getRectangle(rect);
    }
    return _super.prototype.getLocalBounds.call(this, rect);
  };
  Sprite2.prototype.containsPoint = function(point) {
    this.worldTransform.applyInverse(point, tempPoint$2);
    var width = this._texture.orig.width;
    var height = this._texture.orig.height;
    var x1 = -width * this.anchor.x;
    var y1 = 0;
    if (tempPoint$2.x >= x1 && tempPoint$2.x < x1 + width) {
      y1 = -height * this.anchor.y;
      if (tempPoint$2.y >= y1 && tempPoint$2.y < y1 + height) {
        return true;
      }
    }
    return false;
  };
  Sprite2.prototype.destroy = function(options) {
    _super.prototype.destroy.call(this, options);
    this._texture.off("update", this._onTextureUpdate, this);
    this._anchor = null;
    var destroyTexture = typeof options === "boolean" ? options : options && options.texture;
    if (destroyTexture) {
      var destroyBaseTexture = typeof options === "boolean" ? options : options && options.baseTexture;
      this._texture.destroy(!!destroyBaseTexture);
    }
    this._texture = null;
  };
  Sprite2.from = function(source, options) {
    var texture = source instanceof Texture ? source : Texture.from(source, options);
    return new Sprite2(texture);
  };
  Object.defineProperty(Sprite2.prototype, "roundPixels", {
    get: function() {
      return this._roundPixels;
    },
    set: function(value) {
      if (this._roundPixels !== value) {
        this._transformID = -1;
      }
      this._roundPixels = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Sprite2.prototype, "width", {
    get: function() {
      return Math.abs(this.scale.x) * this._texture.orig.width;
    },
    set: function(value) {
      var s = sign(this.scale.x) || 1;
      this.scale.x = s * value / this._texture.orig.width;
      this._width = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Sprite2.prototype, "height", {
    get: function() {
      return Math.abs(this.scale.y) * this._texture.orig.height;
    },
    set: function(value) {
      var s = sign(this.scale.y) || 1;
      this.scale.y = s * value / this._texture.orig.height;
      this._height = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Sprite2.prototype, "anchor", {
    get: function() {
      return this._anchor;
    },
    set: function(value) {
      this._anchor.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Sprite2.prototype, "tint", {
    get: function() {
      return this._tint;
    },
    set: function(value) {
      this._tint = value;
      this._tintRGB = (value >> 16) + (value & 65280) + ((value & 255) << 16);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Sprite2.prototype, "texture", {
    get: function() {
      return this._texture;
    },
    set: function(value) {
      if (this._texture === value) {
        return;
      }
      if (this._texture) {
        this._texture.off("update", this._onTextureUpdate, this);
      }
      this._texture = value || Texture.EMPTY;
      this._cachedTint = 16777215;
      this._textureID = -1;
      this._textureTrimmedID = -1;
      if (value) {
        if (value.baseTexture.valid) {
          this._onTextureUpdate();
        } else {
          value.once("update", this._onTextureUpdate, this);
        }
      }
    },
    enumerable: false,
    configurable: true
  });
  return Sprite2;
}(Container);
var extendStatics$c = function(d, b) {
  extendStatics$c = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$c(d, b);
};
function __extends$c(d, b) {
  extendStatics$c(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var TEXT_GRADIENT;
(function(TEXT_GRADIENT2) {
  TEXT_GRADIENT2[TEXT_GRADIENT2["LINEAR_VERTICAL"] = 0] = "LINEAR_VERTICAL";
  TEXT_GRADIENT2[TEXT_GRADIENT2["LINEAR_HORIZONTAL"] = 1] = "LINEAR_HORIZONTAL";
})(TEXT_GRADIENT || (TEXT_GRADIENT = {}));
var defaultStyle = {
  align: "left",
  breakWords: false,
  dropShadow: false,
  dropShadowAlpha: 1,
  dropShadowAngle: Math.PI / 6,
  dropShadowBlur: 0,
  dropShadowColor: "black",
  dropShadowDistance: 5,
  fill: "black",
  fillGradientType: TEXT_GRADIENT.LINEAR_VERTICAL,
  fillGradientStops: [],
  fontFamily: "Arial",
  fontSize: 26,
  fontStyle: "normal",
  fontVariant: "normal",
  fontWeight: "normal",
  letterSpacing: 0,
  lineHeight: 0,
  lineJoin: "miter",
  miterLimit: 10,
  padding: 0,
  stroke: "black",
  strokeThickness: 0,
  textBaseline: "alphabetic",
  trim: false,
  whiteSpace: "pre",
  wordWrap: false,
  wordWrapWidth: 100,
  leading: 0
};
var genericFontFamilies = [
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui"
];
var TextStyle = function() {
  function TextStyle2(style) {
    this.styleID = 0;
    this.reset();
    deepCopyProperties(this, style, style);
  }
  TextStyle2.prototype.clone = function() {
    var clonedProperties = {};
    deepCopyProperties(clonedProperties, this, defaultStyle);
    return new TextStyle2(clonedProperties);
  };
  TextStyle2.prototype.reset = function() {
    deepCopyProperties(this, defaultStyle, defaultStyle);
  };
  Object.defineProperty(TextStyle2.prototype, "align", {
    get: function() {
      return this._align;
    },
    set: function(align) {
      if (this._align !== align) {
        this._align = align;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "breakWords", {
    get: function() {
      return this._breakWords;
    },
    set: function(breakWords) {
      if (this._breakWords !== breakWords) {
        this._breakWords = breakWords;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "dropShadow", {
    get: function() {
      return this._dropShadow;
    },
    set: function(dropShadow) {
      if (this._dropShadow !== dropShadow) {
        this._dropShadow = dropShadow;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "dropShadowAlpha", {
    get: function() {
      return this._dropShadowAlpha;
    },
    set: function(dropShadowAlpha) {
      if (this._dropShadowAlpha !== dropShadowAlpha) {
        this._dropShadowAlpha = dropShadowAlpha;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "dropShadowAngle", {
    get: function() {
      return this._dropShadowAngle;
    },
    set: function(dropShadowAngle) {
      if (this._dropShadowAngle !== dropShadowAngle) {
        this._dropShadowAngle = dropShadowAngle;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "dropShadowBlur", {
    get: function() {
      return this._dropShadowBlur;
    },
    set: function(dropShadowBlur) {
      if (this._dropShadowBlur !== dropShadowBlur) {
        this._dropShadowBlur = dropShadowBlur;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "dropShadowColor", {
    get: function() {
      return this._dropShadowColor;
    },
    set: function(dropShadowColor) {
      var outputColor = getColor(dropShadowColor);
      if (this._dropShadowColor !== outputColor) {
        this._dropShadowColor = outputColor;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "dropShadowDistance", {
    get: function() {
      return this._dropShadowDistance;
    },
    set: function(dropShadowDistance) {
      if (this._dropShadowDistance !== dropShadowDistance) {
        this._dropShadowDistance = dropShadowDistance;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fill", {
    get: function() {
      return this._fill;
    },
    set: function(fill) {
      var outputColor = getColor(fill);
      if (this._fill !== outputColor) {
        this._fill = outputColor;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fillGradientType", {
    get: function() {
      return this._fillGradientType;
    },
    set: function(fillGradientType) {
      if (this._fillGradientType !== fillGradientType) {
        this._fillGradientType = fillGradientType;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fillGradientStops", {
    get: function() {
      return this._fillGradientStops;
    },
    set: function(fillGradientStops) {
      if (!areArraysEqual(this._fillGradientStops, fillGradientStops)) {
        this._fillGradientStops = fillGradientStops;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fontFamily", {
    get: function() {
      return this._fontFamily;
    },
    set: function(fontFamily) {
      if (this.fontFamily !== fontFamily) {
        this._fontFamily = fontFamily;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fontSize", {
    get: function() {
      return this._fontSize;
    },
    set: function(fontSize) {
      if (this._fontSize !== fontSize) {
        this._fontSize = fontSize;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fontStyle", {
    get: function() {
      return this._fontStyle;
    },
    set: function(fontStyle) {
      if (this._fontStyle !== fontStyle) {
        this._fontStyle = fontStyle;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fontVariant", {
    get: function() {
      return this._fontVariant;
    },
    set: function(fontVariant) {
      if (this._fontVariant !== fontVariant) {
        this._fontVariant = fontVariant;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "fontWeight", {
    get: function() {
      return this._fontWeight;
    },
    set: function(fontWeight) {
      if (this._fontWeight !== fontWeight) {
        this._fontWeight = fontWeight;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "letterSpacing", {
    get: function() {
      return this._letterSpacing;
    },
    set: function(letterSpacing) {
      if (this._letterSpacing !== letterSpacing) {
        this._letterSpacing = letterSpacing;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "lineHeight", {
    get: function() {
      return this._lineHeight;
    },
    set: function(lineHeight) {
      if (this._lineHeight !== lineHeight) {
        this._lineHeight = lineHeight;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "leading", {
    get: function() {
      return this._leading;
    },
    set: function(leading) {
      if (this._leading !== leading) {
        this._leading = leading;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "lineJoin", {
    get: function() {
      return this._lineJoin;
    },
    set: function(lineJoin) {
      if (this._lineJoin !== lineJoin) {
        this._lineJoin = lineJoin;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "miterLimit", {
    get: function() {
      return this._miterLimit;
    },
    set: function(miterLimit) {
      if (this._miterLimit !== miterLimit) {
        this._miterLimit = miterLimit;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "padding", {
    get: function() {
      return this._padding;
    },
    set: function(padding) {
      if (this._padding !== padding) {
        this._padding = padding;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "stroke", {
    get: function() {
      return this._stroke;
    },
    set: function(stroke) {
      var outputColor = getColor(stroke);
      if (this._stroke !== outputColor) {
        this._stroke = outputColor;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "strokeThickness", {
    get: function() {
      return this._strokeThickness;
    },
    set: function(strokeThickness) {
      if (this._strokeThickness !== strokeThickness) {
        this._strokeThickness = strokeThickness;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "textBaseline", {
    get: function() {
      return this._textBaseline;
    },
    set: function(textBaseline) {
      if (this._textBaseline !== textBaseline) {
        this._textBaseline = textBaseline;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "trim", {
    get: function() {
      return this._trim;
    },
    set: function(trim) {
      if (this._trim !== trim) {
        this._trim = trim;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "whiteSpace", {
    get: function() {
      return this._whiteSpace;
    },
    set: function(whiteSpace) {
      if (this._whiteSpace !== whiteSpace) {
        this._whiteSpace = whiteSpace;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "wordWrap", {
    get: function() {
      return this._wordWrap;
    },
    set: function(wordWrap) {
      if (this._wordWrap !== wordWrap) {
        this._wordWrap = wordWrap;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextStyle2.prototype, "wordWrapWidth", {
    get: function() {
      return this._wordWrapWidth;
    },
    set: function(wordWrapWidth) {
      if (this._wordWrapWidth !== wordWrapWidth) {
        this._wordWrapWidth = wordWrapWidth;
        this.styleID++;
      }
    },
    enumerable: false,
    configurable: true
  });
  TextStyle2.prototype.toFontString = function() {
    var fontSizeString = typeof this.fontSize === "number" ? this.fontSize + "px" : this.fontSize;
    var fontFamilies = this.fontFamily;
    if (!Array.isArray(this.fontFamily)) {
      fontFamilies = this.fontFamily.split(",");
    }
    for (var i = fontFamilies.length - 1; i >= 0; i--) {
      var fontFamily = fontFamilies[i].trim();
      if (!/([\"\'])[^\'\"]+\1/.test(fontFamily) && genericFontFamilies.indexOf(fontFamily) < 0) {
        fontFamily = '"' + fontFamily + '"';
      }
      fontFamilies[i] = fontFamily;
    }
    return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + fontSizeString + " " + fontFamilies.join(",");
  };
  return TextStyle2;
}();
function getSingleColor(color2) {
  if (typeof color2 === "number") {
    return hex2string(color2);
  } else if (typeof color2 === "string") {
    if (color2.indexOf("0x") === 0) {
      color2 = color2.replace("0x", "#");
    }
  }
  return color2;
}
function getColor(color2) {
  if (!Array.isArray(color2)) {
    return getSingleColor(color2);
  } else {
    for (var i = 0; i < color2.length; ++i) {
      color2[i] = getSingleColor(color2[i]);
    }
    return color2;
  }
}
function areArraysEqual(array1, array2) {
  if (!Array.isArray(array1) || !Array.isArray(array2)) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (var i = 0; i < array1.length; ++i) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}
function deepCopyProperties(target, source, propertyObj) {
  for (var prop in propertyObj) {
    if (Array.isArray(source[prop])) {
      target[prop] = source[prop].slice();
    } else {
      target[prop] = source[prop];
    }
  }
}
var contextSettings = {
  willReadFrequently: true
};
var TextMetrics = function() {
  function TextMetrics2(text, style, width, height, lines, lineWidths, lineHeight, maxLineWidth, fontProperties) {
    this.text = text;
    this.style = style;
    this.width = width;
    this.height = height;
    this.lines = lines;
    this.lineWidths = lineWidths;
    this.lineHeight = lineHeight;
    this.maxLineWidth = maxLineWidth;
    this.fontProperties = fontProperties;
  }
  TextMetrics2.measureText = function(text, style, wordWrap, canvas) {
    if (canvas === void 0) {
      canvas = TextMetrics2._canvas;
    }
    wordWrap = wordWrap === void 0 || wordWrap === null ? style.wordWrap : wordWrap;
    var font = style.toFontString();
    var fontProperties = TextMetrics2.measureFont(font);
    if (fontProperties.fontSize === 0) {
      fontProperties.fontSize = style.fontSize;
      fontProperties.ascent = style.fontSize;
    }
    var context2 = canvas.getContext("2d", contextSettings);
    context2.font = font;
    var outputText = wordWrap ? TextMetrics2.wordWrap(text, style, canvas) : text;
    var lines = outputText.split(/(?:\r\n|\r|\n)/);
    var lineWidths = new Array(lines.length);
    var maxLineWidth = 0;
    for (var i = 0; i < lines.length; i++) {
      var lineWidth = context2.measureText(lines[i]).width + (lines[i].length - 1) * style.letterSpacing;
      lineWidths[i] = lineWidth;
      maxLineWidth = Math.max(maxLineWidth, lineWidth);
    }
    var width = maxLineWidth + style.strokeThickness;
    if (style.dropShadow) {
      width += style.dropShadowDistance;
    }
    var lineHeight = style.lineHeight || fontProperties.fontSize + style.strokeThickness;
    var height = Math.max(lineHeight, fontProperties.fontSize + style.strokeThickness) + (lines.length - 1) * (lineHeight + style.leading);
    if (style.dropShadow) {
      height += style.dropShadowDistance;
    }
    return new TextMetrics2(text, style, width, height, lines, lineWidths, lineHeight + style.leading, maxLineWidth, fontProperties);
  };
  TextMetrics2.wordWrap = function(text, style, canvas) {
    if (canvas === void 0) {
      canvas = TextMetrics2._canvas;
    }
    var context2 = canvas.getContext("2d", contextSettings);
    var width = 0;
    var line = "";
    var lines = "";
    var cache = /* @__PURE__ */ Object.create(null);
    var letterSpacing = style.letterSpacing, whiteSpace = style.whiteSpace;
    var collapseSpaces = TextMetrics2.collapseSpaces(whiteSpace);
    var collapseNewlines = TextMetrics2.collapseNewlines(whiteSpace);
    var canPrependSpaces = !collapseSpaces;
    var wordWrapWidth = style.wordWrapWidth + letterSpacing;
    var tokens = TextMetrics2.tokenize(text);
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (TextMetrics2.isNewline(token)) {
        if (!collapseNewlines) {
          lines += TextMetrics2.addLine(line);
          canPrependSpaces = !collapseSpaces;
          line = "";
          width = 0;
          continue;
        }
        token = " ";
      }
      if (collapseSpaces) {
        var currIsBreakingSpace = TextMetrics2.isBreakingSpace(token);
        var lastIsBreakingSpace = TextMetrics2.isBreakingSpace(line[line.length - 1]);
        if (currIsBreakingSpace && lastIsBreakingSpace) {
          continue;
        }
      }
      var tokenWidth = TextMetrics2.getFromCache(token, letterSpacing, cache, context2);
      if (tokenWidth > wordWrapWidth) {
        if (line !== "") {
          lines += TextMetrics2.addLine(line);
          line = "";
          width = 0;
        }
        if (TextMetrics2.canBreakWords(token, style.breakWords)) {
          var characters = TextMetrics2.wordWrapSplit(token);
          for (var j = 0; j < characters.length; j++) {
            var char = characters[j];
            var k = 1;
            while (characters[j + k]) {
              var nextChar = characters[j + k];
              var lastChar = char[char.length - 1];
              if (!TextMetrics2.canBreakChars(lastChar, nextChar, token, j, style.breakWords)) {
                char += nextChar;
              } else {
                break;
              }
              k++;
            }
            j += char.length - 1;
            var characterWidth = TextMetrics2.getFromCache(char, letterSpacing, cache, context2);
            if (characterWidth + width > wordWrapWidth) {
              lines += TextMetrics2.addLine(line);
              canPrependSpaces = false;
              line = "";
              width = 0;
            }
            line += char;
            width += characterWidth;
          }
        } else {
          if (line.length > 0) {
            lines += TextMetrics2.addLine(line);
            line = "";
            width = 0;
          }
          var isLastToken = i === tokens.length - 1;
          lines += TextMetrics2.addLine(token, !isLastToken);
          canPrependSpaces = false;
          line = "";
          width = 0;
        }
      } else {
        if (tokenWidth + width > wordWrapWidth) {
          canPrependSpaces = false;
          lines += TextMetrics2.addLine(line);
          line = "";
          width = 0;
        }
        if (line.length > 0 || !TextMetrics2.isBreakingSpace(token) || canPrependSpaces) {
          line += token;
          width += tokenWidth;
        }
      }
    }
    lines += TextMetrics2.addLine(line, false);
    return lines;
  };
  TextMetrics2.addLine = function(line, newLine) {
    if (newLine === void 0) {
      newLine = true;
    }
    line = TextMetrics2.trimRight(line);
    line = newLine ? line + "\n" : line;
    return line;
  };
  TextMetrics2.getFromCache = function(key, letterSpacing, cache, context2) {
    var width = cache[key];
    if (typeof width !== "number") {
      var spacing = key.length * letterSpacing;
      width = context2.measureText(key).width + spacing;
      cache[key] = width;
    }
    return width;
  };
  TextMetrics2.collapseSpaces = function(whiteSpace) {
    return whiteSpace === "normal" || whiteSpace === "pre-line";
  };
  TextMetrics2.collapseNewlines = function(whiteSpace) {
    return whiteSpace === "normal";
  };
  TextMetrics2.trimRight = function(text) {
    if (typeof text !== "string") {
      return "";
    }
    for (var i = text.length - 1; i >= 0; i--) {
      var char = text[i];
      if (!TextMetrics2.isBreakingSpace(char)) {
        break;
      }
      text = text.slice(0, -1);
    }
    return text;
  };
  TextMetrics2.isNewline = function(char) {
    if (typeof char !== "string") {
      return false;
    }
    return TextMetrics2._newlines.indexOf(char.charCodeAt(0)) >= 0;
  };
  TextMetrics2.isBreakingSpace = function(char, _nextChar) {
    if (typeof char !== "string") {
      return false;
    }
    return TextMetrics2._breakingSpaces.indexOf(char.charCodeAt(0)) >= 0;
  };
  TextMetrics2.tokenize = function(text) {
    var tokens = [];
    var token = "";
    if (typeof text !== "string") {
      return tokens;
    }
    for (var i = 0; i < text.length; i++) {
      var char = text[i];
      var nextChar = text[i + 1];
      if (TextMetrics2.isBreakingSpace(char, nextChar) || TextMetrics2.isNewline(char)) {
        if (token !== "") {
          tokens.push(token);
          token = "";
        }
        tokens.push(char);
        continue;
      }
      token += char;
    }
    if (token !== "") {
      tokens.push(token);
    }
    return tokens;
  };
  TextMetrics2.canBreakWords = function(_token, breakWords) {
    return breakWords;
  };
  TextMetrics2.canBreakChars = function(_char, _nextChar, _token, _index, _breakWords) {
    return true;
  };
  TextMetrics2.wordWrapSplit = function(token) {
    return token.split("");
  };
  TextMetrics2.measureFont = function(font) {
    if (TextMetrics2._fonts[font]) {
      return TextMetrics2._fonts[font];
    }
    var properties = {
      ascent: 0,
      descent: 0,
      fontSize: 0
    };
    var canvas = TextMetrics2._canvas;
    var context2 = TextMetrics2._context;
    context2.font = font;
    var metricsString = TextMetrics2.METRICS_STRING + TextMetrics2.BASELINE_SYMBOL;
    var width = Math.ceil(context2.measureText(metricsString).width);
    var baseline = Math.ceil(context2.measureText(TextMetrics2.BASELINE_SYMBOL).width);
    var height = Math.ceil(TextMetrics2.HEIGHT_MULTIPLIER * baseline);
    baseline = baseline * TextMetrics2.BASELINE_MULTIPLIER | 0;
    canvas.width = width;
    canvas.height = height;
    context2.fillStyle = "#f00";
    context2.fillRect(0, 0, width, height);
    context2.font = font;
    context2.textBaseline = "alphabetic";
    context2.fillStyle = "#000";
    context2.fillText(metricsString, 0, baseline);
    var imagedata = context2.getImageData(0, 0, width, height).data;
    var pixels = imagedata.length;
    var line = width * 4;
    var i = 0;
    var idx = 0;
    var stop = false;
    for (i = 0; i < baseline; ++i) {
      for (var j = 0; j < line; j += 4) {
        if (imagedata[idx + j] !== 255) {
          stop = true;
          break;
        }
      }
      if (!stop) {
        idx += line;
      } else {
        break;
      }
    }
    properties.ascent = baseline - i;
    idx = pixels - line;
    stop = false;
    for (i = height; i > baseline; --i) {
      for (var j = 0; j < line; j += 4) {
        if (imagedata[idx + j] !== 255) {
          stop = true;
          break;
        }
      }
      if (!stop) {
        idx -= line;
      } else {
        break;
      }
    }
    properties.descent = i - baseline;
    properties.fontSize = properties.ascent + properties.descent;
    TextMetrics2._fonts[font] = properties;
    return properties;
  };
  TextMetrics2.clearMetrics = function(font) {
    if (font === void 0) {
      font = "";
    }
    if (font) {
      delete TextMetrics2._fonts[font];
    } else {
      TextMetrics2._fonts = {};
    }
  };
  Object.defineProperty(TextMetrics2, "_canvas", {
    get: function() {
      if (!TextMetrics2.__canvas) {
        var canvas = void 0;
        try {
          var c = new OffscreenCanvas(0, 0);
          var context2 = c.getContext("2d", contextSettings);
          if (context2 && context2.measureText) {
            TextMetrics2.__canvas = c;
            return c;
          }
          canvas = settings.ADAPTER.createCanvas();
        } catch (ex) {
          canvas = settings.ADAPTER.createCanvas();
        }
        canvas.width = canvas.height = 10;
        TextMetrics2.__canvas = canvas;
      }
      return TextMetrics2.__canvas;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TextMetrics2, "_context", {
    get: function() {
      if (!TextMetrics2.__context) {
        TextMetrics2.__context = TextMetrics2._canvas.getContext("2d", contextSettings);
      }
      return TextMetrics2.__context;
    },
    enumerable: false,
    configurable: true
  });
  return TextMetrics2;
}();
TextMetrics._fonts = {};
TextMetrics.METRICS_STRING = "|ÉqÅ";
TextMetrics.BASELINE_SYMBOL = "M";
TextMetrics.BASELINE_MULTIPLIER = 1.4;
TextMetrics.HEIGHT_MULTIPLIER = 2;
TextMetrics._newlines = [
  10,
  13
];
TextMetrics._breakingSpaces = [
  9,
  32,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8200,
  8201,
  8202,
  8287,
  12288
];
var defaultDestroyOptions = {
  texture: true,
  children: false,
  baseTexture: true
};
var Text$1 = function(_super) {
  __extends$c(Text2, _super);
  function Text2(text, style, canvas) {
    var _this = this;
    var ownCanvas = false;
    if (!canvas) {
      canvas = settings.ADAPTER.createCanvas();
      ownCanvas = true;
    }
    canvas.width = 3;
    canvas.height = 3;
    var texture = Texture.from(canvas);
    texture.orig = new Rectangle();
    texture.trim = new Rectangle();
    _this = _super.call(this, texture) || this;
    _this._ownCanvas = ownCanvas;
    _this.canvas = canvas;
    _this.context = canvas.getContext("2d", {
      willReadFrequently: true
    });
    _this._resolution = settings.RESOLUTION;
    _this._autoResolution = true;
    _this._text = null;
    _this._style = null;
    _this._styleListener = null;
    _this._font = "";
    _this.text = text;
    _this.style = style;
    _this.localStyleID = -1;
    return _this;
  }
  Text2.prototype.updateText = function(respectDirty) {
    var style = this._style;
    if (this.localStyleID !== style.styleID) {
      this.dirty = true;
      this.localStyleID = style.styleID;
    }
    if (!this.dirty && respectDirty) {
      return;
    }
    this._font = this._style.toFontString();
    var context2 = this.context;
    var measured = TextMetrics.measureText(this._text || " ", this._style, this._style.wordWrap, this.canvas);
    var width = measured.width;
    var height = measured.height;
    var lines = measured.lines;
    var lineHeight = measured.lineHeight;
    var lineWidths = measured.lineWidths;
    var maxLineWidth = measured.maxLineWidth;
    var fontProperties = measured.fontProperties;
    this.canvas.width = Math.ceil(Math.ceil(Math.max(1, width) + style.padding * 2) * this._resolution);
    this.canvas.height = Math.ceil(Math.ceil(Math.max(1, height) + style.padding * 2) * this._resolution);
    context2.scale(this._resolution, this._resolution);
    context2.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context2.font = this._font;
    context2.lineWidth = style.strokeThickness;
    context2.textBaseline = style.textBaseline;
    context2.lineJoin = style.lineJoin;
    context2.miterLimit = style.miterLimit;
    var linePositionX;
    var linePositionY;
    var passesCount = style.dropShadow ? 2 : 1;
    for (var i = 0; i < passesCount; ++i) {
      var isShadowPass = style.dropShadow && i === 0;
      var dsOffsetText = isShadowPass ? Math.ceil(Math.max(1, height) + style.padding * 2) : 0;
      var dsOffsetShadow = dsOffsetText * this._resolution;
      if (isShadowPass) {
        context2.fillStyle = "black";
        context2.strokeStyle = "black";
        var dropShadowColor = style.dropShadowColor;
        var rgb = hex2rgb(typeof dropShadowColor === "number" ? dropShadowColor : string2hex(dropShadowColor));
        var dropShadowBlur = style.dropShadowBlur * this._resolution;
        var dropShadowDistance = style.dropShadowDistance * this._resolution;
        context2.shadowColor = "rgba(" + rgb[0] * 255 + "," + rgb[1] * 255 + "," + rgb[2] * 255 + "," + style.dropShadowAlpha + ")";
        context2.shadowBlur = dropShadowBlur;
        context2.shadowOffsetX = Math.cos(style.dropShadowAngle) * dropShadowDistance;
        context2.shadowOffsetY = Math.sin(style.dropShadowAngle) * dropShadowDistance + dsOffsetShadow;
      } else {
        context2.fillStyle = this._generateFillStyle(style, lines, measured);
        context2.strokeStyle = style.stroke;
        context2.shadowColor = "black";
        context2.shadowBlur = 0;
        context2.shadowOffsetX = 0;
        context2.shadowOffsetY = 0;
      }
      var linePositionYShift = (lineHeight - fontProperties.fontSize) / 2;
      if (!Text2.nextLineHeightBehavior || lineHeight - fontProperties.fontSize < 0) {
        linePositionYShift = 0;
      }
      for (var i_1 = 0; i_1 < lines.length; i_1++) {
        linePositionX = style.strokeThickness / 2;
        linePositionY = style.strokeThickness / 2 + i_1 * lineHeight + fontProperties.ascent + linePositionYShift;
        if (style.align === "right") {
          linePositionX += maxLineWidth - lineWidths[i_1];
        } else if (style.align === "center") {
          linePositionX += (maxLineWidth - lineWidths[i_1]) / 2;
        }
        if (style.stroke && style.strokeThickness) {
          this.drawLetterSpacing(lines[i_1], linePositionX + style.padding, linePositionY + style.padding - dsOffsetText, true);
        }
        if (style.fill) {
          this.drawLetterSpacing(lines[i_1], linePositionX + style.padding, linePositionY + style.padding - dsOffsetText);
        }
      }
    }
    this.updateTexture();
  };
  Text2.prototype.drawLetterSpacing = function(text, x, y, isStroke) {
    if (isStroke === void 0) {
      isStroke = false;
    }
    var style = this._style;
    var letterSpacing = style.letterSpacing;
    var supportLetterSpacing = Text2.experimentalLetterSpacing && ("letterSpacing" in CanvasRenderingContext2D.prototype || "textLetterSpacing" in CanvasRenderingContext2D.prototype);
    if (letterSpacing === 0 || supportLetterSpacing) {
      if (supportLetterSpacing) {
        this.context.letterSpacing = letterSpacing;
        this.context.textLetterSpacing = letterSpacing;
      }
      if (isStroke) {
        this.context.strokeText(text, x, y);
      } else {
        this.context.fillText(text, x, y);
      }
      return;
    }
    var currentPosition = x;
    var stringArray = Array.from ? Array.from(text) : text.split("");
    var previousWidth = this.context.measureText(text).width;
    var currentWidth = 0;
    for (var i = 0; i < stringArray.length; ++i) {
      var currentChar = stringArray[i];
      if (isStroke) {
        this.context.strokeText(currentChar, currentPosition, y);
      } else {
        this.context.fillText(currentChar, currentPosition, y);
      }
      var textStr = "";
      for (var j = i + 1; j < stringArray.length; ++j) {
        textStr += stringArray[j];
      }
      currentWidth = this.context.measureText(textStr).width;
      currentPosition += previousWidth - currentWidth + letterSpacing;
      previousWidth = currentWidth;
    }
  };
  Text2.prototype.updateTexture = function() {
    var canvas = this.canvas;
    if (this._style.trim) {
      var trimmed = trimCanvas(canvas);
      if (trimmed.data) {
        canvas.width = trimmed.width;
        canvas.height = trimmed.height;
        this.context.putImageData(trimmed.data, 0, 0);
      }
    }
    var texture = this._texture;
    var style = this._style;
    var padding = style.trim ? 0 : style.padding;
    var baseTexture = texture.baseTexture;
    texture.trim.width = texture._frame.width = canvas.width / this._resolution;
    texture.trim.height = texture._frame.height = canvas.height / this._resolution;
    texture.trim.x = -padding;
    texture.trim.y = -padding;
    texture.orig.width = texture._frame.width - padding * 2;
    texture.orig.height = texture._frame.height - padding * 2;
    this._onTextureUpdate();
    baseTexture.setRealSize(canvas.width, canvas.height, this._resolution);
    texture.updateUvs();
    this.dirty = false;
  };
  Text2.prototype._render = function(renderer) {
    if (this._autoResolution && this._resolution !== renderer.resolution) {
      this._resolution = renderer.resolution;
      this.dirty = true;
    }
    this.updateText(true);
    _super.prototype._render.call(this, renderer);
  };
  Text2.prototype.updateTransform = function() {
    this.updateText(true);
    _super.prototype.updateTransform.call(this);
  };
  Text2.prototype.getBounds = function(skipUpdate, rect) {
    this.updateText(true);
    if (this._textureID === -1) {
      skipUpdate = false;
    }
    return _super.prototype.getBounds.call(this, skipUpdate, rect);
  };
  Text2.prototype.getLocalBounds = function(rect) {
    this.updateText(true);
    return _super.prototype.getLocalBounds.call(this, rect);
  };
  Text2.prototype._calculateBounds = function() {
    this.calculateVertices();
    this._bounds.addQuad(this.vertexData);
  };
  Text2.prototype._generateFillStyle = function(style, lines, metrics) {
    var fillStyle = style.fill;
    if (!Array.isArray(fillStyle)) {
      return fillStyle;
    } else if (fillStyle.length === 1) {
      return fillStyle[0];
    }
    var gradient;
    var dropShadowCorrection = style.dropShadow ? style.dropShadowDistance : 0;
    var padding = style.padding || 0;
    var width = this.canvas.width / this._resolution - dropShadowCorrection - padding * 2;
    var height = this.canvas.height / this._resolution - dropShadowCorrection - padding * 2;
    var fill = fillStyle.slice();
    var fillGradientStops = style.fillGradientStops.slice();
    if (!fillGradientStops.length) {
      var lengthPlus1 = fill.length + 1;
      for (var i = 1; i < lengthPlus1; ++i) {
        fillGradientStops.push(i / lengthPlus1);
      }
    }
    fill.unshift(fillStyle[0]);
    fillGradientStops.unshift(0);
    fill.push(fillStyle[fillStyle.length - 1]);
    fillGradientStops.push(1);
    if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL) {
      gradient = this.context.createLinearGradient(width / 2, padding, width / 2, height + padding);
      var textHeight = metrics.fontProperties.fontSize + style.strokeThickness;
      for (var i = 0; i < lines.length; i++) {
        var lastLineBottom = metrics.lineHeight * (i - 1) + textHeight;
        var thisLineTop = metrics.lineHeight * i;
        var thisLineGradientStart = thisLineTop;
        if (i > 0 && lastLineBottom > thisLineTop) {
          thisLineGradientStart = (thisLineTop + lastLineBottom) / 2;
        }
        var thisLineBottom = thisLineTop + textHeight;
        var nextLineTop = metrics.lineHeight * (i + 1);
        var thisLineGradientEnd = thisLineBottom;
        if (i + 1 < lines.length && nextLineTop < thisLineBottom) {
          thisLineGradientEnd = (thisLineBottom + nextLineTop) / 2;
        }
        var gradStopLineHeight = (thisLineGradientEnd - thisLineGradientStart) / height;
        for (var j = 0; j < fill.length; j++) {
          var lineStop = 0;
          if (typeof fillGradientStops[j] === "number") {
            lineStop = fillGradientStops[j];
          } else {
            lineStop = j / fill.length;
          }
          var globalStop = Math.min(1, Math.max(0, thisLineGradientStart / height + lineStop * gradStopLineHeight));
          globalStop = Number(globalStop.toFixed(5));
          gradient.addColorStop(globalStop, fill[j]);
        }
      }
    } else {
      gradient = this.context.createLinearGradient(padding, height / 2, width + padding, height / 2);
      var totalIterations = fill.length + 1;
      var currentIteration = 1;
      for (var i = 0; i < fill.length; i++) {
        var stop = void 0;
        if (typeof fillGradientStops[i] === "number") {
          stop = fillGradientStops[i];
        } else {
          stop = currentIteration / totalIterations;
        }
        gradient.addColorStop(stop, fill[i]);
        currentIteration++;
      }
    }
    return gradient;
  };
  Text2.prototype.destroy = function(options) {
    if (typeof options === "boolean") {
      options = { children: options };
    }
    options = Object.assign({}, defaultDestroyOptions, options);
    _super.prototype.destroy.call(this, options);
    if (this._ownCanvas) {
      this.canvas.height = this.canvas.width = 0;
    }
    this.context = null;
    this.canvas = null;
    this._style = null;
  };
  Object.defineProperty(Text2.prototype, "width", {
    get: function() {
      this.updateText(true);
      return Math.abs(this.scale.x) * this._texture.orig.width;
    },
    set: function(value) {
      this.updateText(true);
      var s = sign(this.scale.x) || 1;
      this.scale.x = s * value / this._texture.orig.width;
      this._width = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Text2.prototype, "height", {
    get: function() {
      this.updateText(true);
      return Math.abs(this.scale.y) * this._texture.orig.height;
    },
    set: function(value) {
      this.updateText(true);
      var s = sign(this.scale.y) || 1;
      this.scale.y = s * value / this._texture.orig.height;
      this._height = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Text2.prototype, "style", {
    get: function() {
      return this._style;
    },
    set: function(style) {
      style = style || {};
      if (style instanceof TextStyle) {
        this._style = style;
      } else {
        this._style = new TextStyle(style);
      }
      this.localStyleID = -1;
      this.dirty = true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Text2.prototype, "text", {
    get: function() {
      return this._text;
    },
    set: function(text) {
      text = String(text === null || text === void 0 ? "" : text);
      if (this._text === text) {
        return;
      }
      this._text = text;
      this.dirty = true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Text2.prototype, "resolution", {
    get: function() {
      return this._resolution;
    },
    set: function(value) {
      this._autoResolution = false;
      if (this._resolution === value) {
        return;
      }
      this._resolution = value;
      this.dirty = true;
    },
    enumerable: false,
    configurable: true
  });
  Text2.nextLineHeightBehavior = false;
  Text2.experimentalLetterSpacing = false;
  return Text2;
}(Sprite$1);
settings.UPLOADS_PER_FRAME = 4;
var extendStatics$b = function(d, b) {
  extendStatics$b = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$b(d, b);
};
function __extends$b(d, b) {
  extendStatics$b(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var CountLimiter = function() {
  function CountLimiter2(maxItemsPerFrame) {
    this.maxItemsPerFrame = maxItemsPerFrame;
    this.itemsLeft = 0;
  }
  CountLimiter2.prototype.beginFrame = function() {
    this.itemsLeft = this.maxItemsPerFrame;
  };
  CountLimiter2.prototype.allowedToUpload = function() {
    return this.itemsLeft-- > 0;
  };
  return CountLimiter2;
}();
function findMultipleBaseTextures(item, queue) {
  var result2 = false;
  if (item && item._textures && item._textures.length) {
    for (var i = 0; i < item._textures.length; i++) {
      if (item._textures[i] instanceof Texture) {
        var baseTexture = item._textures[i].baseTexture;
        if (queue.indexOf(baseTexture) === -1) {
          queue.push(baseTexture);
          result2 = true;
        }
      }
    }
  }
  return result2;
}
function findBaseTexture(item, queue) {
  if (item.baseTexture instanceof BaseTexture) {
    var texture = item.baseTexture;
    if (queue.indexOf(texture) === -1) {
      queue.push(texture);
    }
    return true;
  }
  return false;
}
function findTexture(item, queue) {
  if (item._texture && item._texture instanceof Texture) {
    var texture = item._texture.baseTexture;
    if (queue.indexOf(texture) === -1) {
      queue.push(texture);
    }
    return true;
  }
  return false;
}
function drawText(_helper, item) {
  if (item instanceof Text$1) {
    item.updateText(true);
    return true;
  }
  return false;
}
function calculateTextStyle(_helper, item) {
  if (item instanceof TextStyle) {
    var font = item.toFontString();
    TextMetrics.measureFont(font);
    return true;
  }
  return false;
}
function findText(item, queue) {
  if (item instanceof Text$1) {
    if (queue.indexOf(item.style) === -1) {
      queue.push(item.style);
    }
    if (queue.indexOf(item) === -1) {
      queue.push(item);
    }
    var texture = item._texture.baseTexture;
    if (queue.indexOf(texture) === -1) {
      queue.push(texture);
    }
    return true;
  }
  return false;
}
function findTextStyle(item, queue) {
  if (item instanceof TextStyle) {
    if (queue.indexOf(item) === -1) {
      queue.push(item);
    }
    return true;
  }
  return false;
}
var BasePrepare = function() {
  function BasePrepare2(renderer) {
    var _this = this;
    this.limiter = new CountLimiter(settings.UPLOADS_PER_FRAME);
    this.renderer = renderer;
    this.uploadHookHelper = null;
    this.queue = [];
    this.addHooks = [];
    this.uploadHooks = [];
    this.completes = [];
    this.ticking = false;
    this.delayedTick = function() {
      if (!_this.queue) {
        return;
      }
      _this.prepareItems();
    };
    this.registerFindHook(findText);
    this.registerFindHook(findTextStyle);
    this.registerFindHook(findMultipleBaseTextures);
    this.registerFindHook(findBaseTexture);
    this.registerFindHook(findTexture);
    this.registerUploadHook(drawText);
    this.registerUploadHook(calculateTextStyle);
  }
  BasePrepare2.prototype.upload = function(item, done) {
    var _this = this;
    if (typeof item === "function") {
      done = item;
      item = null;
    }
    if (done) {
      deprecation("6.5.0", "BasePrepare.upload callback is deprecated, use the return Promise instead.");
    }
    return new Promise(function(resolve2) {
      if (item) {
        _this.add(item);
      }
      var complete = function() {
        done === null || done === void 0 ? void 0 : done();
        resolve2();
      };
      if (_this.queue.length) {
        _this.completes.push(complete);
        if (!_this.ticking) {
          _this.ticking = true;
          Ticker.system.addOnce(_this.tick, _this, UPDATE_PRIORITY.UTILITY);
        }
      } else {
        complete();
      }
    });
  };
  BasePrepare2.prototype.tick = function() {
    setTimeout(this.delayedTick, 0);
  };
  BasePrepare2.prototype.prepareItems = function() {
    this.limiter.beginFrame();
    while (this.queue.length && this.limiter.allowedToUpload()) {
      var item = this.queue[0];
      var uploaded = false;
      if (item && !item._destroyed) {
        for (var i = 0, len = this.uploadHooks.length; i < len; i++) {
          if (this.uploadHooks[i](this.uploadHookHelper, item)) {
            this.queue.shift();
            uploaded = true;
            break;
          }
        }
      }
      if (!uploaded) {
        this.queue.shift();
      }
    }
    if (!this.queue.length) {
      this.ticking = false;
      var completes = this.completes.slice(0);
      this.completes.length = 0;
      for (var i = 0, len = completes.length; i < len; i++) {
        completes[i]();
      }
    } else {
      Ticker.system.addOnce(this.tick, this, UPDATE_PRIORITY.UTILITY);
    }
  };
  BasePrepare2.prototype.registerFindHook = function(addHook) {
    if (addHook) {
      this.addHooks.push(addHook);
    }
    return this;
  };
  BasePrepare2.prototype.registerUploadHook = function(uploadHook) {
    if (uploadHook) {
      this.uploadHooks.push(uploadHook);
    }
    return this;
  };
  BasePrepare2.prototype.add = function(item) {
    for (var i = 0, len = this.addHooks.length; i < len; i++) {
      if (this.addHooks[i](item, this.queue)) {
        break;
      }
    }
    if (item instanceof Container) {
      for (var i = item.children.length - 1; i >= 0; i--) {
        this.add(item.children[i]);
      }
    }
    return this;
  };
  BasePrepare2.prototype.destroy = function() {
    if (this.ticking) {
      Ticker.system.remove(this.tick, this);
    }
    this.ticking = false;
    this.addHooks = null;
    this.uploadHooks = null;
    this.renderer = null;
    this.completes = null;
    this.queue = null;
    this.limiter = null;
    this.uploadHookHelper = null;
  };
  return BasePrepare2;
}();
function uploadBaseTextures(renderer, item) {
  if (item instanceof BaseTexture) {
    if (!item._glTextures[renderer.CONTEXT_UID]) {
      renderer.texture.bind(item);
    }
    return true;
  }
  return false;
}
function uploadGraphics(renderer, item) {
  if (!(item instanceof Graphics)) {
    return false;
  }
  var geometry = item.geometry;
  item.finishPoly();
  geometry.updateBatches();
  var batches = geometry.batches;
  for (var i = 0; i < batches.length; i++) {
    var texture = batches[i].style.texture;
    if (texture) {
      uploadBaseTextures(renderer, texture.baseTexture);
    }
  }
  if (!geometry.batchable) {
    renderer.geometry.bind(geometry, item._resolveDirectShader(renderer));
  }
  return true;
}
function findGraphics(item, queue) {
  if (item instanceof Graphics) {
    queue.push(item);
    return true;
  }
  return false;
}
var Prepare = function(_super) {
  __extends$b(Prepare2, _super);
  function Prepare2(renderer) {
    var _this = _super.call(this, renderer) || this;
    _this.uploadHookHelper = _this.renderer;
    _this.registerFindHook(findGraphics);
    _this.registerUploadHook(uploadBaseTextures);
    _this.registerUploadHook(uploadGraphics);
    return _this;
  }
  Prepare2.extension = {
    name: "prepare",
    type: ExtensionType.RendererPlugin
  };
  return Prepare2;
}(BasePrepare);
var TimeLimiter = function() {
  function TimeLimiter2(maxMilliseconds) {
    this.maxMilliseconds = maxMilliseconds;
    this.frameStart = 0;
  }
  TimeLimiter2.prototype.beginFrame = function() {
    this.frameStart = Date.now();
  };
  TimeLimiter2.prototype.allowedToUpload = function() {
    return Date.now() - this.frameStart < this.maxMilliseconds;
  };
  return TimeLimiter2;
}();
var Spritesheet = function() {
  function Spritesheet2(texture, data, resolutionFilename) {
    if (resolutionFilename === void 0) {
      resolutionFilename = null;
    }
    this.linkedSheets = [];
    this._texture = texture instanceof Texture ? texture : null;
    this.baseTexture = texture instanceof BaseTexture ? texture : this._texture.baseTexture;
    this.textures = {};
    this.animations = {};
    this.data = data;
    var resource = this.baseTexture.resource;
    this.resolution = this._updateResolution(resolutionFilename || (resource ? resource.url : null));
    this._frames = this.data.frames;
    this._frameKeys = Object.keys(this._frames);
    this._batchIndex = 0;
    this._callback = null;
  }
  Spritesheet2.prototype._updateResolution = function(resolutionFilename) {
    if (resolutionFilename === void 0) {
      resolutionFilename = null;
    }
    var scale = this.data.meta.scale;
    var resolution = getResolutionOfUrl(resolutionFilename, null);
    if (resolution === null) {
      resolution = scale !== void 0 ? parseFloat(scale) : 1;
    }
    if (resolution !== 1) {
      this.baseTexture.setResolution(resolution);
    }
    return resolution;
  };
  Spritesheet2.prototype.parse = function(callback) {
    var _this = this;
    if (callback) {
      deprecation("6.5.0", "Spritesheet.parse callback is deprecated, use the return Promise instead.");
    }
    return new Promise(function(resolve2) {
      _this._callback = function(textures) {
        callback === null || callback === void 0 ? void 0 : callback(textures);
        resolve2(textures);
      };
      _this._batchIndex = 0;
      if (_this._frameKeys.length <= Spritesheet2.BATCH_SIZE) {
        _this._processFrames(0);
        _this._processAnimations();
        _this._parseComplete();
      } else {
        _this._nextBatch();
      }
    });
  };
  Spritesheet2.prototype._processFrames = function(initialFrameIndex) {
    var frameIndex = initialFrameIndex;
    var maxFrames = Spritesheet2.BATCH_SIZE;
    while (frameIndex - initialFrameIndex < maxFrames && frameIndex < this._frameKeys.length) {
      var i = this._frameKeys[frameIndex];
      var data = this._frames[i];
      var rect = data.frame;
      if (rect) {
        var frame = null;
        var trim = null;
        var sourceSize = data.trimmed !== false && data.sourceSize ? data.sourceSize : data.frame;
        var orig = new Rectangle(0, 0, Math.floor(sourceSize.w) / this.resolution, Math.floor(sourceSize.h) / this.resolution);
        if (data.rotated) {
          frame = new Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.h) / this.resolution, Math.floor(rect.w) / this.resolution);
        } else {
          frame = new Rectangle(Math.floor(rect.x) / this.resolution, Math.floor(rect.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
        }
        if (data.trimmed !== false && data.spriteSourceSize) {
          trim = new Rectangle(Math.floor(data.spriteSourceSize.x) / this.resolution, Math.floor(data.spriteSourceSize.y) / this.resolution, Math.floor(rect.w) / this.resolution, Math.floor(rect.h) / this.resolution);
        }
        this.textures[i] = new Texture(this.baseTexture, frame, orig, trim, data.rotated ? 2 : 0, data.anchor);
        Texture.addToCache(this.textures[i], i);
      }
      frameIndex++;
    }
  };
  Spritesheet2.prototype._processAnimations = function() {
    var animations = this.data.animations || {};
    for (var animName in animations) {
      this.animations[animName] = [];
      for (var i = 0; i < animations[animName].length; i++) {
        var frameName = animations[animName][i];
        this.animations[animName].push(this.textures[frameName]);
      }
    }
  };
  Spritesheet2.prototype._parseComplete = function() {
    var callback = this._callback;
    this._callback = null;
    this._batchIndex = 0;
    callback.call(this, this.textures);
  };
  Spritesheet2.prototype._nextBatch = function() {
    var _this = this;
    this._processFrames(this._batchIndex * Spritesheet2.BATCH_SIZE);
    this._batchIndex++;
    setTimeout(function() {
      if (_this._batchIndex * Spritesheet2.BATCH_SIZE < _this._frameKeys.length) {
        _this._nextBatch();
      } else {
        _this._processAnimations();
        _this._parseComplete();
      }
    }, 0);
  };
  Spritesheet2.prototype.destroy = function(destroyBase) {
    var _a2;
    if (destroyBase === void 0) {
      destroyBase = false;
    }
    for (var i in this.textures) {
      this.textures[i].destroy();
    }
    this._frames = null;
    this._frameKeys = null;
    this.data = null;
    this.textures = null;
    if (destroyBase) {
      (_a2 = this._texture) === null || _a2 === void 0 ? void 0 : _a2.destroy();
      this.baseTexture.destroy();
    }
    this._texture = null;
    this.baseTexture = null;
    this.linkedSheets = [];
  };
  Spritesheet2.BATCH_SIZE = 1e3;
  return Spritesheet2;
}();
var SpritesheetLoader = function() {
  function SpritesheetLoader2() {
  }
  SpritesheetLoader2.use = function(resource, next) {
    var _a2, _b2;
    var loader = this;
    var imageResourceName = resource.name + "_image";
    if (!resource.data || resource.type !== LoaderResource.TYPE.JSON || !resource.data.frames || loader.resources[imageResourceName]) {
      next();
      return;
    }
    var multiPacks = (_b2 = (_a2 = resource.data) === null || _a2 === void 0 ? void 0 : _a2.meta) === null || _b2 === void 0 ? void 0 : _b2.related_multi_packs;
    if (Array.isArray(multiPacks)) {
      var _loop_12 = function(item2) {
        if (typeof item2 !== "string") {
          return "continue";
        }
        var itemName = item2.replace(".json", "");
        var itemUrl = url.resolve(resource.url.replace(loader.baseUrl, ""), item2);
        if (loader.resources[itemName] || Object.values(loader.resources).some(function(r) {
          return url.format(url.parse(r.url)) === itemUrl;
        })) {
          return "continue";
        }
        var options = {
          crossOrigin: resource.crossOrigin,
          loadType: LoaderResource.LOAD_TYPE.XHR,
          xhrType: LoaderResource.XHR_RESPONSE_TYPE.JSON,
          parentResource: resource,
          metadata: resource.metadata
        };
        loader.add(itemName, itemUrl, options);
      };
      for (var _i = 0, multiPacks_1 = multiPacks; _i < multiPacks_1.length; _i++) {
        var item = multiPacks_1[_i];
        _loop_12(item);
      }
    }
    var loadOptions = {
      crossOrigin: resource.crossOrigin,
      metadata: resource.metadata.imageMetadata,
      parentResource: resource
    };
    var resourcePath = SpritesheetLoader2.getResourcePath(resource, loader.baseUrl);
    loader.add(imageResourceName, resourcePath, loadOptions, function onImageLoad(res) {
      if (res.error) {
        next(res.error);
        return;
      }
      var spritesheet = new Spritesheet(res.texture, resource.data, resource.url);
      spritesheet.parse().then(function() {
        resource.spritesheet = spritesheet;
        resource.textures = spritesheet.textures;
        next();
      });
    });
  };
  SpritesheetLoader2.getResourcePath = function(resource, baseUrl) {
    if (resource.isDataUrl) {
      return resource.data.meta.image;
    }
    return url.resolve(resource.url.replace(baseUrl, ""), resource.data.meta.image);
  };
  SpritesheetLoader2.extension = ExtensionType.Loader;
  return SpritesheetLoader2;
}();
var extendStatics$a = function(d, b) {
  extendStatics$a = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$a(d, b);
};
function __extends$a(d, b) {
  extendStatics$a(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var tempPoint$1 = new Point();
var TilingSprite = function(_super) {
  __extends$a(TilingSprite2, _super);
  function TilingSprite2(texture, width, height) {
    if (width === void 0) {
      width = 100;
    }
    if (height === void 0) {
      height = 100;
    }
    var _this = _super.call(this, texture) || this;
    _this.tileTransform = new Transform();
    _this._width = width;
    _this._height = height;
    _this.uvMatrix = _this.texture.uvMatrix || new TextureMatrix(texture);
    _this.pluginName = "tilingSprite";
    _this.uvRespectAnchor = false;
    return _this;
  }
  Object.defineProperty(TilingSprite2.prototype, "clampMargin", {
    get: function() {
      return this.uvMatrix.clampMargin;
    },
    set: function(value) {
      this.uvMatrix.clampMargin = value;
      this.uvMatrix.update(true);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TilingSprite2.prototype, "tileScale", {
    get: function() {
      return this.tileTransform.scale;
    },
    set: function(value) {
      this.tileTransform.scale.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TilingSprite2.prototype, "tilePosition", {
    get: function() {
      return this.tileTransform.position;
    },
    set: function(value) {
      this.tileTransform.position.copyFrom(value);
    },
    enumerable: false,
    configurable: true
  });
  TilingSprite2.prototype._onTextureUpdate = function() {
    if (this.uvMatrix) {
      this.uvMatrix.texture = this._texture;
    }
    this._cachedTint = 16777215;
  };
  TilingSprite2.prototype._render = function(renderer) {
    var texture = this._texture;
    if (!texture || !texture.valid) {
      return;
    }
    this.tileTransform.updateLocalTransform();
    this.uvMatrix.update();
    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
    renderer.plugins[this.pluginName].render(this);
  };
  TilingSprite2.prototype._calculateBounds = function() {
    var minX = this._width * -this._anchor._x;
    var minY = this._height * -this._anchor._y;
    var maxX = this._width * (1 - this._anchor._x);
    var maxY = this._height * (1 - this._anchor._y);
    this._bounds.addFrame(this.transform, minX, minY, maxX, maxY);
  };
  TilingSprite2.prototype.getLocalBounds = function(rect) {
    if (this.children.length === 0) {
      this._bounds.minX = this._width * -this._anchor._x;
      this._bounds.minY = this._height * -this._anchor._y;
      this._bounds.maxX = this._width * (1 - this._anchor._x);
      this._bounds.maxY = this._height * (1 - this._anchor._y);
      if (!rect) {
        if (!this._localBoundsRect) {
          this._localBoundsRect = new Rectangle();
        }
        rect = this._localBoundsRect;
      }
      return this._bounds.getRectangle(rect);
    }
    return _super.prototype.getLocalBounds.call(this, rect);
  };
  TilingSprite2.prototype.containsPoint = function(point) {
    this.worldTransform.applyInverse(point, tempPoint$1);
    var width = this._width;
    var height = this._height;
    var x1 = -width * this.anchor._x;
    if (tempPoint$1.x >= x1 && tempPoint$1.x < x1 + width) {
      var y1 = -height * this.anchor._y;
      if (tempPoint$1.y >= y1 && tempPoint$1.y < y1 + height) {
        return true;
      }
    }
    return false;
  };
  TilingSprite2.prototype.destroy = function(options) {
    _super.prototype.destroy.call(this, options);
    this.tileTransform = null;
    this.uvMatrix = null;
  };
  TilingSprite2.from = function(source, options) {
    var texture = source instanceof Texture ? source : Texture.from(source, options);
    return new TilingSprite2(texture, options.width, options.height);
  };
  Object.defineProperty(TilingSprite2.prototype, "width", {
    get: function() {
      return this._width;
    },
    set: function(value) {
      this._width = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(TilingSprite2.prototype, "height", {
    get: function() {
      return this._height;
    },
    set: function(value) {
      this._height = value;
    },
    enumerable: false,
    configurable: true
  });
  return TilingSprite2;
}(Sprite$1);
var fragmentSimpleSrc = "#version 100\n#define SHADER_NAME Tiling-Sprite-Simple-100\n\nprecision lowp float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\n\nvoid main(void)\n{\n    vec4 texSample = texture2D(uSampler, vTextureCoord);\n    gl_FragColor = texSample * uColor;\n}\n";
var gl1VertexSrc = "#version 100\n#define SHADER_NAME Tiling-Sprite-100\n\nprecision lowp float;\n\nattribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n";
var gl1FragmentSrc = "#version 100\n#ifdef GL_EXT_shader_texture_lod\n    #extension GL_EXT_shader_texture_lod : enable\n#endif\n#define SHADER_NAME Tiling-Sprite-100\n\nprecision lowp float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord + ceil(uClampOffset - vTextureCoord);\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\n    vec2 unclamped = coord;\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\n\n    #ifdef GL_EXT_shader_texture_lod\n        vec4 texSample = unclamped == coord\n            ? texture2D(uSampler, coord) \n            : texture2DLodEXT(uSampler, coord, 0);\n    #else\n        vec4 texSample = texture2D(uSampler, coord);\n    #endif\n\n    gl_FragColor = texSample * uColor;\n}\n";
var gl2VertexSrc = "#version 300 es\n#define SHADER_NAME Tiling-Sprite-300\n\nprecision lowp float;\n\nin vec2 aVertexPosition;\nin vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTransform;\n\nout vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;\n}\n";
var gl2FragmentSrc = "#version 300 es\n#define SHADER_NAME Tiling-Sprite-100\n\nprecision lowp float;\n\nin vec2 vTextureCoord;\n\nout vec4 fragmentColor;\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;\n\nvoid main(void)\n{\n    vec2 coord = vTextureCoord + ceil(uClampOffset - vTextureCoord);\n    coord = (uMapCoord * vec3(coord, 1.0)).xy;\n    vec2 unclamped = coord;\n    coord = clamp(coord, uClampFrame.xy, uClampFrame.zw);\n\n    vec4 texSample = texture(uSampler, coord, unclamped == coord ? 0.0f : -32.0f);// lod-bias very negative to force lod 0\n\n    fragmentColor = texSample * uColor;\n}\n";
var tempMat = new Matrix();
var TilingSpriteRenderer = function(_super) {
  __extends$a(TilingSpriteRenderer2, _super);
  function TilingSpriteRenderer2(renderer) {
    var _this = _super.call(this, renderer) || this;
    renderer.runners.contextChange.add(_this);
    _this.quad = new QuadUv();
    _this.state = State.for2d();
    return _this;
  }
  TilingSpriteRenderer2.prototype.contextChange = function() {
    var renderer = this.renderer;
    var uniforms = { globals: renderer.globalUniforms };
    this.simpleShader = Shader.from(gl1VertexSrc, fragmentSimpleSrc, uniforms);
    this.shader = renderer.context.webGLVersion > 1 ? Shader.from(gl2VertexSrc, gl2FragmentSrc, uniforms) : Shader.from(gl1VertexSrc, gl1FragmentSrc, uniforms);
  };
  TilingSpriteRenderer2.prototype.render = function(ts) {
    var renderer = this.renderer;
    var quad = this.quad;
    var vertices = quad.vertices;
    vertices[0] = vertices[6] = ts._width * -ts.anchor.x;
    vertices[1] = vertices[3] = ts._height * -ts.anchor.y;
    vertices[2] = vertices[4] = ts._width * (1 - ts.anchor.x);
    vertices[5] = vertices[7] = ts._height * (1 - ts.anchor.y);
    var anchorX = ts.uvRespectAnchor ? ts.anchor.x : 0;
    var anchorY = ts.uvRespectAnchor ? ts.anchor.y : 0;
    vertices = quad.uvs;
    vertices[0] = vertices[6] = -anchorX;
    vertices[1] = vertices[3] = -anchorY;
    vertices[2] = vertices[4] = 1 - anchorX;
    vertices[5] = vertices[7] = 1 - anchorY;
    quad.invalidate();
    var tex = ts._texture;
    var baseTex = tex.baseTexture;
    var premultiplied = baseTex.alphaMode > 0;
    var lt = ts.tileTransform.localTransform;
    var uv = ts.uvMatrix;
    var isSimple = baseTex.isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;
    if (isSimple) {
      if (!baseTex._glTextures[renderer.CONTEXT_UID]) {
        if (baseTex.wrapMode === WRAP_MODES.CLAMP) {
          baseTex.wrapMode = WRAP_MODES.REPEAT;
        }
      } else {
        isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
      }
    }
    var shader = isSimple ? this.simpleShader : this.shader;
    var w = tex.width;
    var h = tex.height;
    var W = ts._width;
    var H = ts._height;
    tempMat.set(lt.a * w / W, lt.b * w / H, lt.c * h / W, lt.d * h / H, lt.tx / W, lt.ty / H);
    tempMat.invert();
    if (isSimple) {
      tempMat.prepend(uv.mapCoord);
    } else {
      shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
      shader.uniforms.uClampFrame = uv.uClampFrame;
      shader.uniforms.uClampOffset = uv.uClampOffset;
    }
    shader.uniforms.uTransform = tempMat.toArray(true);
    shader.uniforms.uColor = premultiplyTintToRgba(ts.tint, ts.worldAlpha, shader.uniforms.uColor, premultiplied);
    shader.uniforms.translationMatrix = ts.transform.worldTransform.toArray(true);
    shader.uniforms.uSampler = tex;
    renderer.shader.bind(shader);
    renderer.geometry.bind(quad);
    this.state.blendMode = correctBlendMode(ts.blendMode, premultiplied);
    renderer.state.set(this.state);
    renderer.geometry.draw(this.renderer.gl.TRIANGLES, 6, 0);
  };
  TilingSpriteRenderer2.extension = {
    name: "tilingSprite",
    type: ExtensionType.RendererPlugin
  };
  return TilingSpriteRenderer2;
}(ObjectRenderer);
var extendStatics$9 = function(d, b) {
  extendStatics$9 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$9(d, b);
};
function __extends$9(d, b) {
  extendStatics$9(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var MeshBatchUvs = function() {
  function MeshBatchUvs2(uvBuffer, uvMatrix) {
    this.uvBuffer = uvBuffer;
    this.uvMatrix = uvMatrix;
    this.data = null;
    this._bufferUpdateId = -1;
    this._textureUpdateId = -1;
    this._updateID = 0;
  }
  MeshBatchUvs2.prototype.update = function(forceUpdate) {
    if (!forceUpdate && this._bufferUpdateId === this.uvBuffer._updateID && this._textureUpdateId === this.uvMatrix._updateID) {
      return;
    }
    this._bufferUpdateId = this.uvBuffer._updateID;
    this._textureUpdateId = this.uvMatrix._updateID;
    var data = this.uvBuffer.data;
    if (!this.data || this.data.length !== data.length) {
      this.data = new Float32Array(data.length);
    }
    this.uvMatrix.multiplyUvs(data, this.data);
    this._updateID++;
  };
  return MeshBatchUvs2;
}();
var tempPoint = new Point();
var tempPolygon = new Polygon$1();
var Mesh = function(_super) {
  __extends$9(Mesh2, _super);
  function Mesh2(geometry, shader, state, drawMode) {
    if (drawMode === void 0) {
      drawMode = DRAW_MODES.TRIANGLES;
    }
    var _this = _super.call(this) || this;
    _this.geometry = geometry;
    _this.shader = shader;
    _this.state = state || State.for2d();
    _this.drawMode = drawMode;
    _this.start = 0;
    _this.size = 0;
    _this.uvs = null;
    _this.indices = null;
    _this.vertexData = new Float32Array(1);
    _this.vertexDirty = -1;
    _this._transformID = -1;
    _this._roundPixels = settings.ROUND_PIXELS;
    _this.batchUvs = null;
    return _this;
  }
  Object.defineProperty(Mesh2.prototype, "geometry", {
    get: function() {
      return this._geometry;
    },
    set: function(value) {
      if (this._geometry === value) {
        return;
      }
      if (this._geometry) {
        this._geometry.refCount--;
        if (this._geometry.refCount === 0) {
          this._geometry.dispose();
        }
      }
      this._geometry = value;
      if (this._geometry) {
        this._geometry.refCount++;
      }
      this.vertexDirty = -1;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "uvBuffer", {
    get: function() {
      return this.geometry.buffers[1];
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "verticesBuffer", {
    get: function() {
      return this.geometry.buffers[0];
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "material", {
    get: function() {
      return this.shader;
    },
    set: function(value) {
      this.shader = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "blendMode", {
    get: function() {
      return this.state.blendMode;
    },
    set: function(value) {
      this.state.blendMode = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "roundPixels", {
    get: function() {
      return this._roundPixels;
    },
    set: function(value) {
      if (this._roundPixels !== value) {
        this._transformID = -1;
      }
      this._roundPixels = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "tint", {
    get: function() {
      return "tint" in this.shader ? this.shader.tint : null;
    },
    set: function(value) {
      this.shader.tint = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Mesh2.prototype, "texture", {
    get: function() {
      return "texture" in this.shader ? this.shader.texture : null;
    },
    set: function(value) {
      this.shader.texture = value;
    },
    enumerable: false,
    configurable: true
  });
  Mesh2.prototype._render = function(renderer) {
    var vertices = this.geometry.buffers[0].data;
    var shader = this.shader;
    if (shader.batchable && this.drawMode === DRAW_MODES.TRIANGLES && vertices.length < Mesh2.BATCHABLE_SIZE * 2) {
      this._renderToBatch(renderer);
    } else {
      this._renderDefault(renderer);
    }
  };
  Mesh2.prototype._renderDefault = function(renderer) {
    var shader = this.shader;
    shader.alpha = this.worldAlpha;
    if (shader.update) {
      shader.update();
    }
    renderer.batch.flush();
    shader.uniforms.translationMatrix = this.transform.worldTransform.toArray(true);
    renderer.shader.bind(shader);
    renderer.state.set(this.state);
    renderer.geometry.bind(this.geometry, shader);
    renderer.geometry.draw(this.drawMode, this.size, this.start, this.geometry.instanceCount);
  };
  Mesh2.prototype._renderToBatch = function(renderer) {
    var geometry = this.geometry;
    var shader = this.shader;
    if (shader.uvMatrix) {
      shader.uvMatrix.update();
      this.calculateUvs();
    }
    this.calculateVertices();
    this.indices = geometry.indexBuffer.data;
    this._tintRGB = shader._tintRGB;
    this._texture = shader.texture;
    var pluginName = this.material.pluginName;
    renderer.batch.setObjectRenderer(renderer.plugins[pluginName]);
    renderer.plugins[pluginName].render(this);
  };
  Mesh2.prototype.calculateVertices = function() {
    var geometry = this.geometry;
    var verticesBuffer = geometry.buffers[0];
    var vertices = verticesBuffer.data;
    var vertexDirtyId = verticesBuffer._updateID;
    if (vertexDirtyId === this.vertexDirty && this._transformID === this.transform._worldID) {
      return;
    }
    this._transformID = this.transform._worldID;
    if (this.vertexData.length !== vertices.length) {
      this.vertexData = new Float32Array(vertices.length);
    }
    var wt = this.transform.worldTransform;
    var a = wt.a;
    var b = wt.b;
    var c = wt.c;
    var d = wt.d;
    var tx = wt.tx;
    var ty = wt.ty;
    var vertexData = this.vertexData;
    for (var i = 0; i < vertexData.length / 2; i++) {
      var x = vertices[i * 2];
      var y = vertices[i * 2 + 1];
      vertexData[i * 2] = a * x + c * y + tx;
      vertexData[i * 2 + 1] = b * x + d * y + ty;
    }
    if (this._roundPixels) {
      var resolution = settings.RESOLUTION;
      for (var i = 0; i < vertexData.length; ++i) {
        vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
      }
    }
    this.vertexDirty = vertexDirtyId;
  };
  Mesh2.prototype.calculateUvs = function() {
    var geomUvs = this.geometry.buffers[1];
    var shader = this.shader;
    if (!shader.uvMatrix.isSimple) {
      if (!this.batchUvs) {
        this.batchUvs = new MeshBatchUvs(geomUvs, shader.uvMatrix);
      }
      this.batchUvs.update();
      this.uvs = this.batchUvs.data;
    } else {
      this.uvs = geomUvs.data;
    }
  };
  Mesh2.prototype._calculateBounds = function() {
    this.calculateVertices();
    this._bounds.addVertexData(this.vertexData, 0, this.vertexData.length);
  };
  Mesh2.prototype.containsPoint = function(point) {
    if (!this.getBounds().contains(point.x, point.y)) {
      return false;
    }
    this.worldTransform.applyInverse(point, tempPoint);
    var vertices = this.geometry.getBuffer("aVertexPosition").data;
    var points = tempPolygon.points;
    var indices2 = this.geometry.getIndex().data;
    var len = indices2.length;
    var step = this.drawMode === 4 ? 3 : 1;
    for (var i = 0; i + 2 < len; i += step) {
      var ind0 = indices2[i] * 2;
      var ind1 = indices2[i + 1] * 2;
      var ind2 = indices2[i + 2] * 2;
      points[0] = vertices[ind0];
      points[1] = vertices[ind0 + 1];
      points[2] = vertices[ind1];
      points[3] = vertices[ind1 + 1];
      points[4] = vertices[ind2];
      points[5] = vertices[ind2 + 1];
      if (tempPolygon.contains(tempPoint.x, tempPoint.y)) {
        return true;
      }
    }
    return false;
  };
  Mesh2.prototype.destroy = function(options) {
    _super.prototype.destroy.call(this, options);
    if (this._cachedTexture) {
      this._cachedTexture.destroy();
      this._cachedTexture = null;
    }
    this.geometry = null;
    this.shader = null;
    this.state = null;
    this.uvs = null;
    this.indices = null;
    this.vertexData = null;
  };
  Mesh2.BATCHABLE_SIZE = 100;
  return Mesh2;
}(Container);
var fragment$5 = "varying vec2 vTextureCoord;\nuniform vec4 uColor;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord) * uColor;\n}\n";
var vertex$2 = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\nuniform mat3 translationMatrix;\nuniform mat3 uTextureMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n\n    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;\n}\n";
var MeshMaterial = function(_super) {
  __extends$9(MeshMaterial2, _super);
  function MeshMaterial2(uSampler, options) {
    var _this = this;
    var uniforms = {
      uSampler,
      alpha: 1,
      uTextureMatrix: Matrix.IDENTITY,
      uColor: new Float32Array([1, 1, 1, 1])
    };
    options = Object.assign({
      tint: 16777215,
      alpha: 1,
      pluginName: "batch"
    }, options);
    if (options.uniforms) {
      Object.assign(uniforms, options.uniforms);
    }
    _this = _super.call(this, options.program || Program.from(vertex$2, fragment$5), uniforms) || this;
    _this._colorDirty = false;
    _this.uvMatrix = new TextureMatrix(uSampler);
    _this.batchable = options.program === void 0;
    _this.pluginName = options.pluginName;
    _this.tint = options.tint;
    _this.alpha = options.alpha;
    return _this;
  }
  Object.defineProperty(MeshMaterial2.prototype, "texture", {
    get: function() {
      return this.uniforms.uSampler;
    },
    set: function(value) {
      if (this.uniforms.uSampler !== value) {
        if (!this.uniforms.uSampler.baseTexture.alphaMode !== !value.baseTexture.alphaMode) {
          this._colorDirty = true;
        }
        this.uniforms.uSampler = value;
        this.uvMatrix.texture = value;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(MeshMaterial2.prototype, "alpha", {
    get: function() {
      return this._alpha;
    },
    set: function(value) {
      if (value === this._alpha) {
        return;
      }
      this._alpha = value;
      this._colorDirty = true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(MeshMaterial2.prototype, "tint", {
    get: function() {
      return this._tint;
    },
    set: function(value) {
      if (value === this._tint) {
        return;
      }
      this._tint = value;
      this._tintRGB = (value >> 16) + (value & 65280) + ((value & 255) << 16);
      this._colorDirty = true;
    },
    enumerable: false,
    configurable: true
  });
  MeshMaterial2.prototype.update = function() {
    if (this._colorDirty) {
      this._colorDirty = false;
      var baseTexture = this.texture.baseTexture;
      premultiplyTintToRgba(this._tint, this._alpha, this.uniforms.uColor, baseTexture.alphaMode);
    }
    if (this.uvMatrix.update()) {
      this.uniforms.uTextureMatrix = this.uvMatrix.mapCoord;
    }
  };
  return MeshMaterial2;
}(Shader);
var MeshGeometry = function(_super) {
  __extends$9(MeshGeometry2, _super);
  function MeshGeometry2(vertices, uvs, index2) {
    var _this = _super.call(this) || this;
    var verticesBuffer = new Buffer2(vertices);
    var uvsBuffer = new Buffer2(uvs, true);
    var indexBuffer = new Buffer2(index2, true, true);
    _this.addAttribute("aVertexPosition", verticesBuffer, 2, false, TYPES.FLOAT).addAttribute("aTextureCoord", uvsBuffer, 2, false, TYPES.FLOAT).addIndex(indexBuffer);
    _this._updateId = -1;
    return _this;
  }
  Object.defineProperty(MeshGeometry2.prototype, "vertexDirtyId", {
    get: function() {
      return this.buffers[0]._updateID;
    },
    enumerable: false,
    configurable: true
  });
  return MeshGeometry2;
}(Geometry);
var extendStatics$8 = function(d, b) {
  extendStatics$8 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$8(d, b);
};
function __extends$8(d, b) {
  extendStatics$8(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var BitmapFontData = function() {
  function BitmapFontData2() {
    this.info = [];
    this.common = [];
    this.page = [];
    this.char = [];
    this.kerning = [];
    this.distanceField = [];
  }
  return BitmapFontData2;
}();
var TextFormat = function() {
  function TextFormat2() {
  }
  TextFormat2.test = function(data) {
    return typeof data === "string" && data.indexOf("info face=") === 0;
  };
  TextFormat2.parse = function(txt) {
    var items = txt.match(/^[a-z]+\s+.+$/gm);
    var rawData = {
      info: [],
      common: [],
      page: [],
      char: [],
      chars: [],
      kerning: [],
      kernings: [],
      distanceField: []
    };
    for (var i in items) {
      var name = items[i].match(/^[a-z]+/gm)[0];
      var attributeList = items[i].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm);
      var itemData = {};
      for (var i_1 in attributeList) {
        var split = attributeList[i_1].split("=");
        var key = split[0];
        var strValue = split[1].replace(/"/gm, "");
        var floatValue = parseFloat(strValue);
        var value = isNaN(floatValue) ? strValue : floatValue;
        itemData[key] = value;
      }
      rawData[name].push(itemData);
    }
    var font = new BitmapFontData();
    rawData.info.forEach(function(info) {
      return font.info.push({
        face: info.face,
        size: parseInt(info.size, 10)
      });
    });
    rawData.common.forEach(function(common) {
      return font.common.push({
        lineHeight: parseInt(common.lineHeight, 10)
      });
    });
    rawData.page.forEach(function(page) {
      return font.page.push({
        id: parseInt(page.id, 10),
        file: page.file
      });
    });
    rawData.char.forEach(function(char) {
      return font.char.push({
        id: parseInt(char.id, 10),
        page: parseInt(char.page, 10),
        x: parseInt(char.x, 10),
        y: parseInt(char.y, 10),
        width: parseInt(char.width, 10),
        height: parseInt(char.height, 10),
        xoffset: parseInt(char.xoffset, 10),
        yoffset: parseInt(char.yoffset, 10),
        xadvance: parseInt(char.xadvance, 10)
      });
    });
    rawData.kerning.forEach(function(kerning) {
      return font.kerning.push({
        first: parseInt(kerning.first, 10),
        second: parseInt(kerning.second, 10),
        amount: parseInt(kerning.amount, 10)
      });
    });
    rawData.distanceField.forEach(function(df) {
      return font.distanceField.push({
        distanceRange: parseInt(df.distanceRange, 10),
        fieldType: df.fieldType
      });
    });
    return font;
  };
  return TextFormat2;
}();
var XMLFormat = function() {
  function XMLFormat2() {
  }
  XMLFormat2.test = function(data) {
    return data instanceof XMLDocument && data.getElementsByTagName("page").length && data.getElementsByTagName("info")[0].getAttribute("face") !== null;
  };
  XMLFormat2.parse = function(xml) {
    var data = new BitmapFontData();
    var info = xml.getElementsByTagName("info");
    var common = xml.getElementsByTagName("common");
    var page = xml.getElementsByTagName("page");
    var char = xml.getElementsByTagName("char");
    var kerning = xml.getElementsByTagName("kerning");
    var distanceField = xml.getElementsByTagName("distanceField");
    for (var i = 0; i < info.length; i++) {
      data.info.push({
        face: info[i].getAttribute("face"),
        size: parseInt(info[i].getAttribute("size"), 10)
      });
    }
    for (var i = 0; i < common.length; i++) {
      data.common.push({
        lineHeight: parseInt(common[i].getAttribute("lineHeight"), 10)
      });
    }
    for (var i = 0; i < page.length; i++) {
      data.page.push({
        id: parseInt(page[i].getAttribute("id"), 10) || 0,
        file: page[i].getAttribute("file")
      });
    }
    for (var i = 0; i < char.length; i++) {
      var letter = char[i];
      data.char.push({
        id: parseInt(letter.getAttribute("id"), 10),
        page: parseInt(letter.getAttribute("page"), 10) || 0,
        x: parseInt(letter.getAttribute("x"), 10),
        y: parseInt(letter.getAttribute("y"), 10),
        width: parseInt(letter.getAttribute("width"), 10),
        height: parseInt(letter.getAttribute("height"), 10),
        xoffset: parseInt(letter.getAttribute("xoffset"), 10),
        yoffset: parseInt(letter.getAttribute("yoffset"), 10),
        xadvance: parseInt(letter.getAttribute("xadvance"), 10)
      });
    }
    for (var i = 0; i < kerning.length; i++) {
      data.kerning.push({
        first: parseInt(kerning[i].getAttribute("first"), 10),
        second: parseInt(kerning[i].getAttribute("second"), 10),
        amount: parseInt(kerning[i].getAttribute("amount"), 10)
      });
    }
    for (var i = 0; i < distanceField.length; i++) {
      data.distanceField.push({
        fieldType: distanceField[i].getAttribute("fieldType"),
        distanceRange: parseInt(distanceField[i].getAttribute("distanceRange"), 10)
      });
    }
    return data;
  };
  return XMLFormat2;
}();
var XMLStringFormat = function() {
  function XMLStringFormat2() {
  }
  XMLStringFormat2.test = function(data) {
    if (typeof data === "string" && data.indexOf("<font>") > -1) {
      var xml = new globalThis.DOMParser().parseFromString(data, "text/xml");
      return XMLFormat.test(xml);
    }
    return false;
  };
  XMLStringFormat2.parse = function(xmlTxt) {
    var xml = new globalThis.DOMParser().parseFromString(xmlTxt, "text/xml");
    return XMLFormat.parse(xml);
  };
  return XMLStringFormat2;
}();
var formats = [
  TextFormat,
  XMLFormat,
  XMLStringFormat
];
function autoDetectFormat(data) {
  for (var i = 0; i < formats.length; i++) {
    if (formats[i].test(data)) {
      return formats[i];
    }
  }
  return null;
}
function generateFillStyle(canvas, context2, style, resolution, lines, metrics) {
  var fillStyle = style.fill;
  if (!Array.isArray(fillStyle)) {
    return fillStyle;
  } else if (fillStyle.length === 1) {
    return fillStyle[0];
  }
  var gradient;
  var dropShadowCorrection = style.dropShadow ? style.dropShadowDistance : 0;
  var padding = style.padding || 0;
  var width = canvas.width / resolution - dropShadowCorrection - padding * 2;
  var height = canvas.height / resolution - dropShadowCorrection - padding * 2;
  var fill = fillStyle.slice();
  var fillGradientStops = style.fillGradientStops.slice();
  if (!fillGradientStops.length) {
    var lengthPlus1 = fill.length + 1;
    for (var i = 1; i < lengthPlus1; ++i) {
      fillGradientStops.push(i / lengthPlus1);
    }
  }
  fill.unshift(fillStyle[0]);
  fillGradientStops.unshift(0);
  fill.push(fillStyle[fillStyle.length - 1]);
  fillGradientStops.push(1);
  if (style.fillGradientType === TEXT_GRADIENT.LINEAR_VERTICAL) {
    gradient = context2.createLinearGradient(width / 2, padding, width / 2, height + padding);
    var lastIterationStop = 0;
    var textHeight = metrics.fontProperties.fontSize + style.strokeThickness;
    var gradStopLineHeight = textHeight / height;
    for (var i = 0; i < lines.length; i++) {
      var thisLineTop = metrics.lineHeight * i;
      for (var j = 0; j < fill.length; j++) {
        var lineStop = 0;
        if (typeof fillGradientStops[j] === "number") {
          lineStop = fillGradientStops[j];
        } else {
          lineStop = j / fill.length;
        }
        var globalStop = thisLineTop / height + lineStop * gradStopLineHeight;
        var clampedStop = Math.max(lastIterationStop, globalStop);
        clampedStop = Math.min(clampedStop, 1);
        gradient.addColorStop(clampedStop, fill[j]);
        lastIterationStop = clampedStop;
      }
    }
  } else {
    gradient = context2.createLinearGradient(padding, height / 2, width + padding, height / 2);
    var totalIterations = fill.length + 1;
    var currentIteration = 1;
    for (var i = 0; i < fill.length; i++) {
      var stop = void 0;
      if (typeof fillGradientStops[i] === "number") {
        stop = fillGradientStops[i];
      } else {
        stop = currentIteration / totalIterations;
      }
      gradient.addColorStop(stop, fill[i]);
      currentIteration++;
    }
  }
  return gradient;
}
function drawGlyph(canvas, context2, metrics, x, y, resolution, style) {
  var char = metrics.text;
  var fontProperties = metrics.fontProperties;
  context2.translate(x, y);
  context2.scale(resolution, resolution);
  var tx = style.strokeThickness / 2;
  var ty = -(style.strokeThickness / 2);
  context2.font = style.toFontString();
  context2.lineWidth = style.strokeThickness;
  context2.textBaseline = style.textBaseline;
  context2.lineJoin = style.lineJoin;
  context2.miterLimit = style.miterLimit;
  context2.fillStyle = generateFillStyle(canvas, context2, style, resolution, [char], metrics);
  context2.strokeStyle = style.stroke;
  if (style.dropShadow) {
    var dropShadowColor = style.dropShadowColor;
    var rgb = hex2rgb(typeof dropShadowColor === "number" ? dropShadowColor : string2hex(dropShadowColor));
    var dropShadowBlur = style.dropShadowBlur * resolution;
    var dropShadowDistance = style.dropShadowDistance * resolution;
    context2.shadowColor = "rgba(" + rgb[0] * 255 + "," + rgb[1] * 255 + "," + rgb[2] * 255 + "," + style.dropShadowAlpha + ")";
    context2.shadowBlur = dropShadowBlur;
    context2.shadowOffsetX = Math.cos(style.dropShadowAngle) * dropShadowDistance;
    context2.shadowOffsetY = Math.sin(style.dropShadowAngle) * dropShadowDistance;
  } else {
    context2.shadowColor = "black";
    context2.shadowBlur = 0;
    context2.shadowOffsetX = 0;
    context2.shadowOffsetY = 0;
  }
  if (style.stroke && style.strokeThickness) {
    context2.strokeText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
  }
  if (style.fill) {
    context2.fillText(char, tx, ty + metrics.lineHeight - fontProperties.descent);
  }
  context2.setTransform(1, 0, 0, 1, 0, 0);
  context2.fillStyle = "rgba(0, 0, 0, 0)";
}
function splitTextToCharacters(text) {
  return Array.from ? Array.from(text) : text.split("");
}
function resolveCharacters(chars) {
  if (typeof chars === "string") {
    chars = [chars];
  }
  var result2 = [];
  for (var i = 0, j = chars.length; i < j; i++) {
    var item = chars[i];
    if (Array.isArray(item)) {
      if (item.length !== 2) {
        throw new Error("[BitmapFont]: Invalid character range length, expecting 2 got " + item.length + ".");
      }
      var startCode = item[0].charCodeAt(0);
      var endCode = item[1].charCodeAt(0);
      if (endCode < startCode) {
        throw new Error("[BitmapFont]: Invalid character range.");
      }
      for (var i_1 = startCode, j_1 = endCode; i_1 <= j_1; i_1++) {
        result2.push(String.fromCharCode(i_1));
      }
    } else {
      result2.push.apply(result2, splitTextToCharacters(item));
    }
  }
  if (result2.length === 0) {
    throw new Error("[BitmapFont]: Empty set when resolving characters.");
  }
  return result2;
}
function extractCharCode(str) {
  return str.codePointAt ? str.codePointAt(0) : str.charCodeAt(0);
}
var BitmapFont = function() {
  function BitmapFont2(data, textures, ownsTextures) {
    var _a2, _b2;
    var info = data.info[0];
    var common = data.common[0];
    var page = data.page[0];
    var distanceField = data.distanceField[0];
    var res = getResolutionOfUrl(page.file);
    var pageTextures = {};
    this._ownsTextures = ownsTextures;
    this.font = info.face;
    this.size = info.size;
    this.lineHeight = common.lineHeight / res;
    this.chars = {};
    this.pageTextures = pageTextures;
    for (var i = 0; i < data.page.length; i++) {
      var _c2 = data.page[i], id = _c2.id, file = _c2.file;
      pageTextures[id] = textures instanceof Array ? textures[i] : textures[file];
      if ((distanceField === null || distanceField === void 0 ? void 0 : distanceField.fieldType) && distanceField.fieldType !== "none") {
        pageTextures[id].baseTexture.alphaMode = ALPHA_MODES.NO_PREMULTIPLIED_ALPHA;
        pageTextures[id].baseTexture.mipmap = MIPMAP_MODES.OFF;
      }
    }
    for (var i = 0; i < data.char.length; i++) {
      var _d = data.char[i], id = _d.id, page_1 = _d.page;
      var _e = data.char[i], x = _e.x, y = _e.y, width = _e.width, height = _e.height, xoffset = _e.xoffset, yoffset = _e.yoffset, xadvance = _e.xadvance;
      x /= res;
      y /= res;
      width /= res;
      height /= res;
      xoffset /= res;
      yoffset /= res;
      xadvance /= res;
      var rect = new Rectangle(x + pageTextures[page_1].frame.x / res, y + pageTextures[page_1].frame.y / res, width, height);
      this.chars[id] = {
        xOffset: xoffset,
        yOffset: yoffset,
        xAdvance: xadvance,
        kerning: {},
        texture: new Texture(pageTextures[page_1].baseTexture, rect),
        page: page_1
      };
    }
    for (var i = 0; i < data.kerning.length; i++) {
      var _f = data.kerning[i], first = _f.first, second = _f.second, amount = _f.amount;
      first /= res;
      second /= res;
      amount /= res;
      if (this.chars[second]) {
        this.chars[second].kerning[first] = amount;
      }
    }
    this.distanceFieldRange = distanceField === null || distanceField === void 0 ? void 0 : distanceField.distanceRange;
    this.distanceFieldType = (_b2 = (_a2 = distanceField === null || distanceField === void 0 ? void 0 : distanceField.fieldType) === null || _a2 === void 0 ? void 0 : _a2.toLowerCase()) !== null && _b2 !== void 0 ? _b2 : "none";
  }
  BitmapFont2.prototype.destroy = function() {
    for (var id in this.chars) {
      this.chars[id].texture.destroy();
      this.chars[id].texture = null;
    }
    for (var id in this.pageTextures) {
      if (this._ownsTextures) {
        this.pageTextures[id].destroy(true);
      }
      this.pageTextures[id] = null;
    }
    this.chars = null;
    this.pageTextures = null;
  };
  BitmapFont2.install = function(data, textures, ownsTextures) {
    var fontData;
    if (data instanceof BitmapFontData) {
      fontData = data;
    } else {
      var format2 = autoDetectFormat(data);
      if (!format2) {
        throw new Error("Unrecognized data format for font.");
      }
      fontData = format2.parse(data);
    }
    if (textures instanceof Texture) {
      textures = [textures];
    }
    var font = new BitmapFont2(fontData, textures, ownsTextures);
    BitmapFont2.available[font.font] = font;
    return font;
  };
  BitmapFont2.uninstall = function(name) {
    var font = BitmapFont2.available[name];
    if (!font) {
      throw new Error("No font found named '" + name + "'");
    }
    font.destroy();
    delete BitmapFont2.available[name];
  };
  BitmapFont2.from = function(name, textStyle, options) {
    if (!name) {
      throw new Error("[BitmapFont] Property `name` is required.");
    }
    var _a2 = Object.assign({}, BitmapFont2.defaultOptions, options), chars = _a2.chars, padding = _a2.padding, resolution = _a2.resolution, textureWidth = _a2.textureWidth, textureHeight = _a2.textureHeight;
    var charsList = resolveCharacters(chars);
    var style = textStyle instanceof TextStyle ? textStyle : new TextStyle(textStyle);
    var lineWidth = textureWidth;
    var fontData = new BitmapFontData();
    fontData.info[0] = {
      face: style.fontFamily,
      size: style.fontSize
    };
    fontData.common[0] = {
      lineHeight: style.fontSize
    };
    var positionX = 0;
    var positionY = 0;
    var canvas;
    var context2;
    var baseTexture;
    var maxCharHeight = 0;
    var textures = [];
    for (var i = 0; i < charsList.length; i++) {
      if (!canvas) {
        canvas = settings.ADAPTER.createCanvas();
        canvas.width = textureWidth;
        canvas.height = textureHeight;
        context2 = canvas.getContext("2d");
        baseTexture = new BaseTexture(canvas, { resolution });
        textures.push(new Texture(baseTexture));
        fontData.page.push({
          id: textures.length - 1,
          file: ""
        });
      }
      var character = charsList[i];
      var metrics = TextMetrics.measureText(character, style, false, canvas);
      var width = metrics.width;
      var height = Math.ceil(metrics.height);
      var textureGlyphWidth = Math.ceil((style.fontStyle === "italic" ? 2 : 1) * width);
      if (positionY >= textureHeight - height * resolution) {
        if (positionY === 0) {
          throw new Error("[BitmapFont] textureHeight " + textureHeight + "px is too small " + ("(fontFamily: '" + style.fontFamily + "', fontSize: " + style.fontSize + "px, char: '" + character + "')"));
        }
        --i;
        canvas = null;
        context2 = null;
        baseTexture = null;
        positionY = 0;
        positionX = 0;
        maxCharHeight = 0;
        continue;
      }
      maxCharHeight = Math.max(height + metrics.fontProperties.descent, maxCharHeight);
      if (textureGlyphWidth * resolution + positionX >= lineWidth) {
        if (positionX === 0) {
          throw new Error("[BitmapFont] textureWidth " + textureWidth + "px is too small " + ("(fontFamily: '" + style.fontFamily + "', fontSize: " + style.fontSize + "px, char: '" + character + "')"));
        }
        --i;
        positionY += maxCharHeight * resolution;
        positionY = Math.ceil(positionY);
        positionX = 0;
        maxCharHeight = 0;
        continue;
      }
      drawGlyph(canvas, context2, metrics, positionX, positionY, resolution, style);
      var id = extractCharCode(metrics.text);
      fontData.char.push({
        id,
        page: textures.length - 1,
        x: positionX / resolution,
        y: positionY / resolution,
        width: textureGlyphWidth,
        height,
        xoffset: 0,
        yoffset: 0,
        xadvance: Math.ceil(width - (style.dropShadow ? style.dropShadowDistance : 0) - (style.stroke ? style.strokeThickness : 0))
      });
      positionX += (textureGlyphWidth + 2 * padding) * resolution;
      positionX = Math.ceil(positionX);
    }
    for (var i = 0, len = charsList.length; i < len; i++) {
      var first = charsList[i];
      for (var j = 0; j < len; j++) {
        var second = charsList[j];
        var c1 = context2.measureText(first).width;
        var c2 = context2.measureText(second).width;
        var total = context2.measureText(first + second).width;
        var amount = total - (c1 + c2);
        if (amount) {
          fontData.kerning.push({
            first: extractCharCode(first),
            second: extractCharCode(second),
            amount
          });
        }
      }
    }
    var font = new BitmapFont2(fontData, textures, true);
    if (BitmapFont2.available[name] !== void 0) {
      BitmapFont2.uninstall(name);
    }
    BitmapFont2.available[name] = font;
    return font;
  };
  BitmapFont2.ALPHA = [["a", "z"], ["A", "Z"], " "];
  BitmapFont2.NUMERIC = [["0", "9"]];
  BitmapFont2.ALPHANUMERIC = [["a", "z"], ["A", "Z"], ["0", "9"], " "];
  BitmapFont2.ASCII = [[" ", "~"]];
  BitmapFont2.defaultOptions = {
    resolution: 1,
    textureWidth: 512,
    textureHeight: 512,
    padding: 4,
    chars: BitmapFont2.ALPHANUMERIC
  };
  BitmapFont2.available = {};
  return BitmapFont2;
}();
var msdfFrag = "// Pixi texture info\r\nvarying vec2 vTextureCoord;\r\nuniform sampler2D uSampler;\r\n\r\n// Tint\r\nuniform vec4 uColor;\r\n\r\n// on 2D applications fwidth is screenScale / glyphAtlasScale * distanceFieldRange\r\nuniform float uFWidth;\r\n\r\nvoid main(void) {\r\n\r\n  // To stack MSDF and SDF we need a non-pre-multiplied-alpha texture.\r\n  vec4 texColor = texture2D(uSampler, vTextureCoord);\r\n\r\n  // MSDF\r\n  float median = texColor.r + texColor.g + texColor.b -\r\n                  min(texColor.r, min(texColor.g, texColor.b)) -\r\n                  max(texColor.r, max(texColor.g, texColor.b));\r\n  // SDF\r\n  median = min(median, texColor.a);\r\n\r\n  float screenPxDistance = uFWidth * (median - 0.5);\r\n  float alpha = clamp(screenPxDistance + 0.5, 0.0, 1.0);\r\n  if (median < 0.01) {\r\n    alpha = 0.0;\r\n  } else if (median > 0.99) {\r\n    alpha = 1.0;\r\n  }\r\n\r\n  // NPM Textures, NPM outputs\r\n  gl_FragColor = vec4(uColor.rgb, uColor.a * alpha);\r\n\r\n}\r\n";
var msdfVert = "// Mesh material default fragment\r\nattribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nuniform mat3 translationMatrix;\r\nuniform mat3 uTextureMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n\r\n    vTextureCoord = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;\r\n}\r\n";
var pageMeshDataDefaultPageMeshData = [];
var pageMeshDataMSDFPageMeshData = [];
var charRenderDataPool = [];
var BitmapText = function(_super) {
  __extends$8(BitmapText2, _super);
  function BitmapText2(text, style) {
    if (style === void 0) {
      style = {};
    }
    var _this = _super.call(this) || this;
    _this._tint = 16777215;
    var _a2 = Object.assign({}, BitmapText2.styleDefaults, style), align = _a2.align, tint = _a2.tint, maxWidth = _a2.maxWidth, letterSpacing = _a2.letterSpacing, fontName = _a2.fontName, fontSize = _a2.fontSize;
    if (!BitmapFont.available[fontName]) {
      throw new Error('Missing BitmapFont "' + fontName + '"');
    }
    _this._activePagesMeshData = [];
    _this._textWidth = 0;
    _this._textHeight = 0;
    _this._align = align;
    _this._tint = tint;
    _this._font = void 0;
    _this._fontName = fontName;
    _this._fontSize = fontSize;
    _this.text = text;
    _this._maxWidth = maxWidth;
    _this._maxLineHeight = 0;
    _this._letterSpacing = letterSpacing;
    _this._anchor = new ObservablePoint(function() {
      _this.dirty = true;
    }, _this, 0, 0);
    _this._roundPixels = settings.ROUND_PIXELS;
    _this.dirty = true;
    _this._resolution = settings.RESOLUTION;
    _this._autoResolution = true;
    _this._textureCache = {};
    return _this;
  }
  BitmapText2.prototype.updateText = function() {
    var _a2;
    var data = BitmapFont.available[this._fontName];
    var fontSize = this.fontSize;
    var scale = fontSize / data.size;
    var pos = new Point();
    var chars = [];
    var lineWidths = [];
    var lineSpaces = [];
    var text = this._text.replace(/(?:\r\n|\r)/g, "\n") || " ";
    var charsInput = splitTextToCharacters(text);
    var maxWidth = this._maxWidth * data.size / fontSize;
    var pageMeshDataPool = data.distanceFieldType === "none" ? pageMeshDataDefaultPageMeshData : pageMeshDataMSDFPageMeshData;
    var prevCharCode = null;
    var lastLineWidth = 0;
    var maxLineWidth = 0;
    var line = 0;
    var lastBreakPos = -1;
    var lastBreakWidth = 0;
    var spacesRemoved = 0;
    var maxLineHeight = 0;
    var spaceCount = 0;
    for (var i = 0; i < charsInput.length; i++) {
      var char = charsInput[i];
      var charCode = extractCharCode(char);
      if (/(?:\s)/.test(char)) {
        lastBreakPos = i;
        lastBreakWidth = lastLineWidth;
        spaceCount++;
      }
      if (char === "\r" || char === "\n") {
        lineWidths.push(lastLineWidth);
        lineSpaces.push(-1);
        maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
        ++line;
        ++spacesRemoved;
        pos.x = 0;
        pos.y += data.lineHeight;
        prevCharCode = null;
        spaceCount = 0;
        continue;
      }
      var charData = data.chars[charCode];
      if (!charData) {
        continue;
      }
      if (prevCharCode && charData.kerning[prevCharCode]) {
        pos.x += charData.kerning[prevCharCode];
      }
      var charRenderData = charRenderDataPool.pop() || {
        texture: Texture.EMPTY,
        line: 0,
        charCode: 0,
        prevSpaces: 0,
        position: new Point()
      };
      charRenderData.texture = charData.texture;
      charRenderData.line = line;
      charRenderData.charCode = charCode;
      charRenderData.position.x = pos.x + charData.xOffset + this._letterSpacing / 2;
      charRenderData.position.y = pos.y + charData.yOffset;
      charRenderData.prevSpaces = spaceCount;
      chars.push(charRenderData);
      lastLineWidth = charRenderData.position.x + Math.max(charData.xAdvance - charData.xOffset, charData.texture.orig.width);
      pos.x += charData.xAdvance + this._letterSpacing;
      maxLineHeight = Math.max(maxLineHeight, charData.yOffset + charData.texture.height);
      prevCharCode = charCode;
      if (lastBreakPos !== -1 && maxWidth > 0 && pos.x > maxWidth) {
        ++spacesRemoved;
        removeItems(chars, 1 + lastBreakPos - spacesRemoved, 1 + i - lastBreakPos);
        i = lastBreakPos;
        lastBreakPos = -1;
        lineWidths.push(lastBreakWidth);
        lineSpaces.push(chars.length > 0 ? chars[chars.length - 1].prevSpaces : 0);
        maxLineWidth = Math.max(maxLineWidth, lastBreakWidth);
        line++;
        pos.x = 0;
        pos.y += data.lineHeight;
        prevCharCode = null;
        spaceCount = 0;
      }
    }
    var lastChar = charsInput[charsInput.length - 1];
    if (lastChar !== "\r" && lastChar !== "\n") {
      if (/(?:\s)/.test(lastChar)) {
        lastLineWidth = lastBreakWidth;
      }
      lineWidths.push(lastLineWidth);
      maxLineWidth = Math.max(maxLineWidth, lastLineWidth);
      lineSpaces.push(-1);
    }
    var lineAlignOffsets = [];
    for (var i = 0; i <= line; i++) {
      var alignOffset = 0;
      if (this._align === "right") {
        alignOffset = maxLineWidth - lineWidths[i];
      } else if (this._align === "center") {
        alignOffset = (maxLineWidth - lineWidths[i]) / 2;
      } else if (this._align === "justify") {
        alignOffset = lineSpaces[i] < 0 ? 0 : (maxLineWidth - lineWidths[i]) / lineSpaces[i];
      }
      lineAlignOffsets.push(alignOffset);
    }
    var lenChars = chars.length;
    var pagesMeshData = {};
    var newPagesMeshData = [];
    var activePagesMeshData = this._activePagesMeshData;
    pageMeshDataPool.push.apply(pageMeshDataPool, activePagesMeshData);
    for (var i = 0; i < lenChars; i++) {
      var texture = chars[i].texture;
      var baseTextureUid = texture.baseTexture.uid;
      if (!pagesMeshData[baseTextureUid]) {
        var pageMeshData = pageMeshDataPool.pop();
        if (!pageMeshData) {
          var geometry = new MeshGeometry();
          var material = void 0;
          var meshBlendMode = void 0;
          if (data.distanceFieldType === "none") {
            material = new MeshMaterial(Texture.EMPTY);
            meshBlendMode = BLEND_MODES.NORMAL;
          } else {
            material = new MeshMaterial(Texture.EMPTY, { program: Program.from(msdfVert, msdfFrag), uniforms: { uFWidth: 0 } });
            meshBlendMode = BLEND_MODES.NORMAL_NPM;
          }
          var mesh = new Mesh(geometry, material);
          mesh.blendMode = meshBlendMode;
          pageMeshData = {
            index: 0,
            indexCount: 0,
            vertexCount: 0,
            uvsCount: 0,
            total: 0,
            mesh,
            vertices: null,
            uvs: null,
            indices: null
          };
        }
        pageMeshData.index = 0;
        pageMeshData.indexCount = 0;
        pageMeshData.vertexCount = 0;
        pageMeshData.uvsCount = 0;
        pageMeshData.total = 0;
        var _textureCache = this._textureCache;
        _textureCache[baseTextureUid] = _textureCache[baseTextureUid] || new Texture(texture.baseTexture);
        pageMeshData.mesh.texture = _textureCache[baseTextureUid];
        pageMeshData.mesh.tint = this._tint;
        newPagesMeshData.push(pageMeshData);
        pagesMeshData[baseTextureUid] = pageMeshData;
      }
      pagesMeshData[baseTextureUid].total++;
    }
    for (var i = 0; i < activePagesMeshData.length; i++) {
      if (newPagesMeshData.indexOf(activePagesMeshData[i]) === -1) {
        this.removeChild(activePagesMeshData[i].mesh);
      }
    }
    for (var i = 0; i < newPagesMeshData.length; i++) {
      if (newPagesMeshData[i].mesh.parent !== this) {
        this.addChild(newPagesMeshData[i].mesh);
      }
    }
    this._activePagesMeshData = newPagesMeshData;
    for (var i in pagesMeshData) {
      var pageMeshData = pagesMeshData[i];
      var total = pageMeshData.total;
      if (!(((_a2 = pageMeshData.indices) === null || _a2 === void 0 ? void 0 : _a2.length) > 6 * total) || pageMeshData.vertices.length < Mesh.BATCHABLE_SIZE * 2) {
        pageMeshData.vertices = new Float32Array(4 * 2 * total);
        pageMeshData.uvs = new Float32Array(4 * 2 * total);
        pageMeshData.indices = new Uint16Array(6 * total);
      } else {
        var total_1 = pageMeshData.total;
        var vertices = pageMeshData.vertices;
        for (var i_1 = total_1 * 4 * 2; i_1 < vertices.length; i_1++) {
          vertices[i_1] = 0;
        }
      }
      pageMeshData.mesh.size = 6 * total;
    }
    for (var i = 0; i < lenChars; i++) {
      var char = chars[i];
      var offset = char.position.x + lineAlignOffsets[char.line] * (this._align === "justify" ? char.prevSpaces : 1);
      if (this._roundPixels) {
        offset = Math.round(offset);
      }
      var xPos = offset * scale;
      var yPos = char.position.y * scale;
      var texture = char.texture;
      var pageMesh = pagesMeshData[texture.baseTexture.uid];
      var textureFrame = texture.frame;
      var textureUvs = texture._uvs;
      var index2 = pageMesh.index++;
      pageMesh.indices[index2 * 6 + 0] = 0 + index2 * 4;
      pageMesh.indices[index2 * 6 + 1] = 1 + index2 * 4;
      pageMesh.indices[index2 * 6 + 2] = 2 + index2 * 4;
      pageMesh.indices[index2 * 6 + 3] = 0 + index2 * 4;
      pageMesh.indices[index2 * 6 + 4] = 2 + index2 * 4;
      pageMesh.indices[index2 * 6 + 5] = 3 + index2 * 4;
      pageMesh.vertices[index2 * 8 + 0] = xPos;
      pageMesh.vertices[index2 * 8 + 1] = yPos;
      pageMesh.vertices[index2 * 8 + 2] = xPos + textureFrame.width * scale;
      pageMesh.vertices[index2 * 8 + 3] = yPos;
      pageMesh.vertices[index2 * 8 + 4] = xPos + textureFrame.width * scale;
      pageMesh.vertices[index2 * 8 + 5] = yPos + textureFrame.height * scale;
      pageMesh.vertices[index2 * 8 + 6] = xPos;
      pageMesh.vertices[index2 * 8 + 7] = yPos + textureFrame.height * scale;
      pageMesh.uvs[index2 * 8 + 0] = textureUvs.x0;
      pageMesh.uvs[index2 * 8 + 1] = textureUvs.y0;
      pageMesh.uvs[index2 * 8 + 2] = textureUvs.x1;
      pageMesh.uvs[index2 * 8 + 3] = textureUvs.y1;
      pageMesh.uvs[index2 * 8 + 4] = textureUvs.x2;
      pageMesh.uvs[index2 * 8 + 5] = textureUvs.y2;
      pageMesh.uvs[index2 * 8 + 6] = textureUvs.x3;
      pageMesh.uvs[index2 * 8 + 7] = textureUvs.y3;
    }
    this._textWidth = maxLineWidth * scale;
    this._textHeight = (pos.y + data.lineHeight) * scale;
    for (var i in pagesMeshData) {
      var pageMeshData = pagesMeshData[i];
      if (this.anchor.x !== 0 || this.anchor.y !== 0) {
        var vertexCount = 0;
        var anchorOffsetX = this._textWidth * this.anchor.x;
        var anchorOffsetY = this._textHeight * this.anchor.y;
        for (var i_2 = 0; i_2 < pageMeshData.total; i_2++) {
          pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetX;
          pageMeshData.vertices[vertexCount++] -= anchorOffsetY;
        }
      }
      this._maxLineHeight = maxLineHeight * scale;
      var vertexBuffer = pageMeshData.mesh.geometry.getBuffer("aVertexPosition");
      var textureBuffer = pageMeshData.mesh.geometry.getBuffer("aTextureCoord");
      var indexBuffer = pageMeshData.mesh.geometry.getIndex();
      vertexBuffer.data = pageMeshData.vertices;
      textureBuffer.data = pageMeshData.uvs;
      indexBuffer.data = pageMeshData.indices;
      vertexBuffer.update();
      textureBuffer.update();
      indexBuffer.update();
    }
    for (var i = 0; i < chars.length; i++) {
      charRenderDataPool.push(chars[i]);
    }
    this._font = data;
    this.dirty = false;
  };
  BitmapText2.prototype.updateTransform = function() {
    this.validate();
    this.containerUpdateTransform();
  };
  BitmapText2.prototype._render = function(renderer) {
    if (this._autoResolution && this._resolution !== renderer.resolution) {
      this._resolution = renderer.resolution;
      this.dirty = true;
    }
    var _a2 = BitmapFont.available[this._fontName], distanceFieldRange = _a2.distanceFieldRange, distanceFieldType = _a2.distanceFieldType, size = _a2.size;
    if (distanceFieldType !== "none") {
      var _b2 = this.worldTransform, a = _b2.a, b = _b2.b, c = _b2.c, d = _b2.d;
      var dx = Math.sqrt(a * a + b * b);
      var dy = Math.sqrt(c * c + d * d);
      var worldScale = (Math.abs(dx) + Math.abs(dy)) / 2;
      var fontScale = this.fontSize / size;
      for (var _i = 0, _c2 = this._activePagesMeshData; _i < _c2.length; _i++) {
        var mesh = _c2[_i];
        mesh.mesh.shader.uniforms.uFWidth = worldScale * distanceFieldRange * fontScale * this._resolution;
      }
    }
    _super.prototype._render.call(this, renderer);
  };
  BitmapText2.prototype.getLocalBounds = function() {
    this.validate();
    return _super.prototype.getLocalBounds.call(this);
  };
  BitmapText2.prototype.validate = function() {
    var font = BitmapFont.available[this._fontName];
    if (!font) {
      throw new Error('Missing BitmapFont "' + this._fontName + '"');
    }
    if (this._font !== font) {
      this.dirty = true;
    }
    if (this.dirty) {
      this.updateText();
    }
  };
  Object.defineProperty(BitmapText2.prototype, "tint", {
    get: function() {
      return this._tint;
    },
    set: function(value) {
      if (this._tint === value) {
        return;
      }
      this._tint = value;
      for (var i = 0; i < this._activePagesMeshData.length; i++) {
        this._activePagesMeshData[i].mesh.tint = value;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "align", {
    get: function() {
      return this._align;
    },
    set: function(value) {
      if (this._align !== value) {
        this._align = value;
        this.dirty = true;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "fontName", {
    get: function() {
      return this._fontName;
    },
    set: function(value) {
      if (!BitmapFont.available[value]) {
        throw new Error('Missing BitmapFont "' + value + '"');
      }
      if (this._fontName !== value) {
        this._fontName = value;
        this.dirty = true;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "fontSize", {
    get: function() {
      var _a2;
      return (_a2 = this._fontSize) !== null && _a2 !== void 0 ? _a2 : BitmapFont.available[this._fontName].size;
    },
    set: function(value) {
      if (this._fontSize !== value) {
        this._fontSize = value;
        this.dirty = true;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "anchor", {
    get: function() {
      return this._anchor;
    },
    set: function(value) {
      if (typeof value === "number") {
        this._anchor.set(value);
      } else {
        this._anchor.copyFrom(value);
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "text", {
    get: function() {
      return this._text;
    },
    set: function(text) {
      text = String(text === null || text === void 0 ? "" : text);
      if (this._text === text) {
        return;
      }
      this._text = text;
      this.dirty = true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "maxWidth", {
    get: function() {
      return this._maxWidth;
    },
    set: function(value) {
      if (this._maxWidth === value) {
        return;
      }
      this._maxWidth = value;
      this.dirty = true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "maxLineHeight", {
    get: function() {
      this.validate();
      return this._maxLineHeight;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "textWidth", {
    get: function() {
      this.validate();
      return this._textWidth;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "letterSpacing", {
    get: function() {
      return this._letterSpacing;
    },
    set: function(value) {
      if (this._letterSpacing !== value) {
        this._letterSpacing = value;
        this.dirty = true;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "roundPixels", {
    get: function() {
      return this._roundPixels;
    },
    set: function(value) {
      if (value !== this._roundPixels) {
        this._roundPixels = value;
        this.dirty = true;
      }
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "textHeight", {
    get: function() {
      this.validate();
      return this._textHeight;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BitmapText2.prototype, "resolution", {
    get: function() {
      return this._resolution;
    },
    set: function(value) {
      this._autoResolution = false;
      if (this._resolution === value) {
        return;
      }
      this._resolution = value;
      this.dirty = true;
    },
    enumerable: false,
    configurable: true
  });
  BitmapText2.prototype.destroy = function(options) {
    var _textureCache = this._textureCache;
    var data = BitmapFont.available[this._fontName];
    var pageMeshDataPool = data.distanceFieldType === "none" ? pageMeshDataDefaultPageMeshData : pageMeshDataMSDFPageMeshData;
    pageMeshDataPool.push.apply(pageMeshDataPool, this._activePagesMeshData);
    for (var _i = 0, _a2 = this._activePagesMeshData; _i < _a2.length; _i++) {
      var pageMeshData = _a2[_i];
      this.removeChild(pageMeshData.mesh);
    }
    this._activePagesMeshData = [];
    pageMeshDataPool.filter(function(page) {
      return _textureCache[page.mesh.texture.baseTexture.uid];
    }).forEach(function(page) {
      page.mesh.texture = Texture.EMPTY;
    });
    for (var id in _textureCache) {
      var texture = _textureCache[id];
      texture.destroy();
      delete _textureCache[id];
    }
    this._font = null;
    this._textureCache = null;
    _super.prototype.destroy.call(this, options);
  };
  BitmapText2.styleDefaults = {
    align: "left",
    tint: 16777215,
    maxWidth: 0,
    letterSpacing: 0
  };
  return BitmapText2;
}(Container);
var BitmapFontLoader = function() {
  function BitmapFontLoader2() {
  }
  BitmapFontLoader2.add = function() {
    LoaderResource.setExtensionXhrType("fnt", LoaderResource.XHR_RESPONSE_TYPE.TEXT);
  };
  BitmapFontLoader2.use = function(resource, next) {
    var format2 = autoDetectFormat(resource.data);
    if (!format2) {
      next();
      return;
    }
    var baseUrl = BitmapFontLoader2.getBaseUrl(this, resource);
    var data = format2.parse(resource.data);
    var textures = {};
    var completed = function(page) {
      textures[page.metadata.pageFile] = page.texture;
      if (Object.keys(textures).length === data.page.length) {
        resource.bitmapFont = BitmapFont.install(data, textures, true);
        next();
      }
    };
    for (var i = 0; i < data.page.length; ++i) {
      var pageFile = data.page[i].file;
      var url2 = baseUrl + pageFile;
      var exists = false;
      for (var name in this.resources) {
        var bitmapResource = this.resources[name];
        if (bitmapResource.url === url2) {
          bitmapResource.metadata.pageFile = pageFile;
          if (bitmapResource.texture) {
            completed(bitmapResource);
          } else {
            bitmapResource.onAfterMiddleware.add(completed);
          }
          exists = true;
          break;
        }
      }
      if (!exists) {
        var options = {
          crossOrigin: resource.crossOrigin,
          loadType: LoaderResource.LOAD_TYPE.IMAGE,
          metadata: Object.assign({ pageFile }, resource.metadata.imageMetadata),
          parentResource: resource
        };
        this.add(url2, options, completed);
      }
    }
  };
  BitmapFontLoader2.getBaseUrl = function(loader, resource) {
    var resUrl = !resource.isDataUrl ? BitmapFontLoader2.dirname(resource.url) : "";
    if (resource.isDataUrl) {
      if (resUrl === ".") {
        resUrl = "";
      }
      if (loader.baseUrl && resUrl) {
        if (loader.baseUrl.charAt(loader.baseUrl.length - 1) === "/") {
          resUrl += "/";
        }
      }
    }
    resUrl = resUrl.replace(loader.baseUrl, "");
    if (resUrl && resUrl.charAt(resUrl.length - 1) !== "/") {
      resUrl += "/";
    }
    return resUrl;
  };
  BitmapFontLoader2.dirname = function(url2) {
    var dir = url2.replace(/\\/g, "/").replace(/\/$/, "").replace(/\/[^\/]*$/, "");
    if (dir === url2) {
      return ".";
    } else if (dir === "") {
      return "/";
    }
    return dir;
  };
  BitmapFontLoader2.extension = ExtensionType.Loader;
  return BitmapFontLoader2;
}();
var extendStatics$7 = function(d, b) {
  extendStatics$7 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$7(d, b);
};
function __extends$7(d, b) {
  extendStatics$7(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var fragment$4 = "varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float uAlpha;\n\nvoid main(void)\n{\n   gl_FragColor = texture2D(uSampler, vTextureCoord) * uAlpha;\n}\n";
var AlphaFilter = function(_super) {
  __extends$7(AlphaFilter2, _super);
  function AlphaFilter2(alpha) {
    if (alpha === void 0) {
      alpha = 1;
    }
    var _this = _super.call(this, defaultVertex$1, fragment$4, { uAlpha: 1 }) || this;
    _this.alpha = alpha;
    return _this;
  }
  Object.defineProperty(AlphaFilter2.prototype, "alpha", {
    get: function() {
      return this.uniforms.uAlpha;
    },
    set: function(value) {
      this.uniforms.uAlpha = value;
    },
    enumerable: false,
    configurable: true
  });
  return AlphaFilter2;
}(Filter);
var extendStatics$6 = function(d, b) {
  extendStatics$6 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$6(d, b);
};
function __extends$6(d, b) {
  extendStatics$6(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var vertTemplate = "\n    attribute vec2 aVertexPosition;\n\n    uniform mat3 projectionMatrix;\n\n    uniform float strength;\n\n    varying vec2 vBlurTexCoords[%size%];\n\n    uniform vec4 inputSize;\n    uniform vec4 outputFrame;\n\n    vec4 filterVertexPosition( void )\n    {\n        vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n        return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n    }\n\n    vec2 filterTextureCoord( void )\n    {\n        return aVertexPosition * (outputFrame.zw * inputSize.zw);\n    }\n\n    void main(void)\n    {\n        gl_Position = filterVertexPosition();\n\n        vec2 textureCoord = filterTextureCoord();\n        %blur%\n    }";
function generateBlurVertSource(kernelSize, x) {
  var halfLength = Math.ceil(kernelSize / 2);
  var vertSource = vertTemplate;
  var blurLoop = "";
  var template;
  if (x) {
    template = "vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * strength, 0.0);";
  } else {
    template = "vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * strength);";
  }
  for (var i = 0; i < kernelSize; i++) {
    var blur = template.replace("%index%", i.toString());
    blur = blur.replace("%sampleIndex%", i - (halfLength - 1) + ".0");
    blurLoop += blur;
    blurLoop += "\n";
  }
  vertSource = vertSource.replace("%blur%", blurLoop);
  vertSource = vertSource.replace("%size%", kernelSize.toString());
  return vertSource;
}
var GAUSSIAN_VALUES = {
  5: [0.153388, 0.221461, 0.250301],
  7: [0.071303, 0.131514, 0.189879, 0.214607],
  9: [0.028532, 0.067234, 0.124009, 0.179044, 0.20236],
  11: [93e-4, 0.028002, 0.065984, 0.121703, 0.175713, 0.198596],
  13: [2406e-6, 9255e-6, 0.027867, 0.065666, 0.121117, 0.174868, 0.197641],
  15: [489e-6, 2403e-6, 9246e-6, 0.02784, 0.065602, 0.120999, 0.174697, 0.197448]
};
var fragTemplate = [
  "varying vec2 vBlurTexCoords[%size%];",
  "uniform sampler2D uSampler;",
  "void main(void)",
  "{",
  "    gl_FragColor = vec4(0.0);",
  "    %blur%",
  "}"
].join("\n");
function generateBlurFragSource(kernelSize) {
  var kernel = GAUSSIAN_VALUES[kernelSize];
  var halfLength = kernel.length;
  var fragSource = fragTemplate;
  var blurLoop = "";
  var template = "gl_FragColor += texture2D(uSampler, vBlurTexCoords[%index%]) * %value%;";
  var value;
  for (var i = 0; i < kernelSize; i++) {
    var blur = template.replace("%index%", i.toString());
    value = i;
    if (i >= halfLength) {
      value = kernelSize - i - 1;
    }
    blur = blur.replace("%value%", kernel[value].toString());
    blurLoop += blur;
    blurLoop += "\n";
  }
  fragSource = fragSource.replace("%blur%", blurLoop);
  fragSource = fragSource.replace("%size%", kernelSize.toString());
  return fragSource;
}
var BlurFilterPass = function(_super) {
  __extends$6(BlurFilterPass2, _super);
  function BlurFilterPass2(horizontal, strength, quality, resolution, kernelSize) {
    if (strength === void 0) {
      strength = 8;
    }
    if (quality === void 0) {
      quality = 4;
    }
    if (resolution === void 0) {
      resolution = settings.FILTER_RESOLUTION;
    }
    if (kernelSize === void 0) {
      kernelSize = 5;
    }
    var _this = this;
    var vertSrc = generateBlurVertSource(kernelSize, horizontal);
    var fragSrc = generateBlurFragSource(kernelSize);
    _this = _super.call(
      this,
      vertSrc,
      fragSrc
    ) || this;
    _this.horizontal = horizontal;
    _this.resolution = resolution;
    _this._quality = 0;
    _this.quality = quality;
    _this.blur = strength;
    return _this;
  }
  BlurFilterPass2.prototype.apply = function(filterManager, input, output, clearMode) {
    if (output) {
      if (this.horizontal) {
        this.uniforms.strength = 1 / output.width * (output.width / input.width);
      } else {
        this.uniforms.strength = 1 / output.height * (output.height / input.height);
      }
    } else {
      if (this.horizontal) {
        this.uniforms.strength = 1 / filterManager.renderer.width * (filterManager.renderer.width / input.width);
      } else {
        this.uniforms.strength = 1 / filterManager.renderer.height * (filterManager.renderer.height / input.height);
      }
    }
    this.uniforms.strength *= this.strength;
    this.uniforms.strength /= this.passes;
    if (this.passes === 1) {
      filterManager.applyFilter(this, input, output, clearMode);
    } else {
      var renderTarget = filterManager.getFilterTexture();
      var renderer = filterManager.renderer;
      var flip = input;
      var flop = renderTarget;
      this.state.blend = false;
      filterManager.applyFilter(this, flip, flop, CLEAR_MODES.CLEAR);
      for (var i = 1; i < this.passes - 1; i++) {
        filterManager.bindAndClear(flip, CLEAR_MODES.BLIT);
        this.uniforms.uSampler = flop;
        var temp2 = flop;
        flop = flip;
        flip = temp2;
        renderer.shader.bind(this);
        renderer.geometry.draw(5);
      }
      this.state.blend = true;
      filterManager.applyFilter(this, flop, output, clearMode);
      filterManager.returnFilterTexture(renderTarget);
    }
  };
  Object.defineProperty(BlurFilterPass2.prototype, "blur", {
    get: function() {
      return this.strength;
    },
    set: function(value) {
      this.padding = 1 + Math.abs(value) * 2;
      this.strength = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BlurFilterPass2.prototype, "quality", {
    get: function() {
      return this._quality;
    },
    set: function(value) {
      this._quality = value;
      this.passes = value;
    },
    enumerable: false,
    configurable: true
  });
  return BlurFilterPass2;
}(Filter);
var BlurFilter = function(_super) {
  __extends$6(BlurFilter2, _super);
  function BlurFilter2(strength, quality, resolution, kernelSize) {
    if (strength === void 0) {
      strength = 8;
    }
    if (quality === void 0) {
      quality = 4;
    }
    if (resolution === void 0) {
      resolution = settings.FILTER_RESOLUTION;
    }
    if (kernelSize === void 0) {
      kernelSize = 5;
    }
    var _this = _super.call(this) || this;
    _this.blurXFilter = new BlurFilterPass(true, strength, quality, resolution, kernelSize);
    _this.blurYFilter = new BlurFilterPass(false, strength, quality, resolution, kernelSize);
    _this.resolution = resolution;
    _this.quality = quality;
    _this.blur = strength;
    _this.repeatEdgePixels = false;
    return _this;
  }
  BlurFilter2.prototype.apply = function(filterManager, input, output, clearMode) {
    var xStrength = Math.abs(this.blurXFilter.strength);
    var yStrength = Math.abs(this.blurYFilter.strength);
    if (xStrength && yStrength) {
      var renderTarget = filterManager.getFilterTexture();
      this.blurXFilter.apply(filterManager, input, renderTarget, CLEAR_MODES.CLEAR);
      this.blurYFilter.apply(filterManager, renderTarget, output, clearMode);
      filterManager.returnFilterTexture(renderTarget);
    } else if (yStrength) {
      this.blurYFilter.apply(filterManager, input, output, clearMode);
    } else {
      this.blurXFilter.apply(filterManager, input, output, clearMode);
    }
  };
  BlurFilter2.prototype.updatePadding = function() {
    if (this._repeatEdgePixels) {
      this.padding = 0;
    } else {
      this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
    }
  };
  Object.defineProperty(BlurFilter2.prototype, "blur", {
    get: function() {
      return this.blurXFilter.blur;
    },
    set: function(value) {
      this.blurXFilter.blur = this.blurYFilter.blur = value;
      this.updatePadding();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BlurFilter2.prototype, "quality", {
    get: function() {
      return this.blurXFilter.quality;
    },
    set: function(value) {
      this.blurXFilter.quality = this.blurYFilter.quality = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BlurFilter2.prototype, "blurX", {
    get: function() {
      return this.blurXFilter.blur;
    },
    set: function(value) {
      this.blurXFilter.blur = value;
      this.updatePadding();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BlurFilter2.prototype, "blurY", {
    get: function() {
      return this.blurYFilter.blur;
    },
    set: function(value) {
      this.blurYFilter.blur = value;
      this.updatePadding();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BlurFilter2.prototype, "blendMode", {
    get: function() {
      return this.blurYFilter.blendMode;
    },
    set: function(value) {
      this.blurYFilter.blendMode = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BlurFilter2.prototype, "repeatEdgePixels", {
    get: function() {
      return this._repeatEdgePixels;
    },
    set: function(value) {
      this._repeatEdgePixels = value;
      this.updatePadding();
    },
    enumerable: false,
    configurable: true
  });
  return BlurFilter2;
}(Filter);
var extendStatics$5 = function(d, b) {
  extendStatics$5 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$5(d, b);
};
function __extends$5(d, b) {
  extendStatics$5(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var fragment$3 = "varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float m[20];\nuniform float uAlpha;\n\nvoid main(void)\n{\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    if (uAlpha == 0.0) {\n        gl_FragColor = c;\n        return;\n    }\n\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\n    if (c.a > 0.0) {\n      c.rgb /= c.a;\n    }\n\n    vec4 result;\n\n    result.r = (m[0] * c.r);\n        result.r += (m[1] * c.g);\n        result.r += (m[2] * c.b);\n        result.r += (m[3] * c.a);\n        result.r += m[4];\n\n    result.g = (m[5] * c.r);\n        result.g += (m[6] * c.g);\n        result.g += (m[7] * c.b);\n        result.g += (m[8] * c.a);\n        result.g += m[9];\n\n    result.b = (m[10] * c.r);\n       result.b += (m[11] * c.g);\n       result.b += (m[12] * c.b);\n       result.b += (m[13] * c.a);\n       result.b += m[14];\n\n    result.a = (m[15] * c.r);\n       result.a += (m[16] * c.g);\n       result.a += (m[17] * c.b);\n       result.a += (m[18] * c.a);\n       result.a += m[19];\n\n    vec3 rgb = mix(c.rgb, result.rgb, uAlpha);\n\n    // Premultiply alpha again.\n    rgb *= result.a;\n\n    gl_FragColor = vec4(rgb, result.a);\n}\n";
var ColorMatrixFilter = function(_super) {
  __extends$5(ColorMatrixFilter2, _super);
  function ColorMatrixFilter2() {
    var _this = this;
    var uniforms = {
      m: new Float32Array([
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        0
      ]),
      uAlpha: 1
    };
    _this = _super.call(this, defaultFilterVertex, fragment$3, uniforms) || this;
    _this.alpha = 1;
    return _this;
  }
  ColorMatrixFilter2.prototype._loadMatrix = function(matrix, multiply) {
    if (multiply === void 0) {
      multiply = false;
    }
    var newMatrix = matrix;
    if (multiply) {
      this._multiply(newMatrix, this.uniforms.m, matrix);
      newMatrix = this._colorMatrix(newMatrix);
    }
    this.uniforms.m = newMatrix;
  };
  ColorMatrixFilter2.prototype._multiply = function(out, a, b) {
    out[0] = a[0] * b[0] + a[1] * b[5] + a[2] * b[10] + a[3] * b[15];
    out[1] = a[0] * b[1] + a[1] * b[6] + a[2] * b[11] + a[3] * b[16];
    out[2] = a[0] * b[2] + a[1] * b[7] + a[2] * b[12] + a[3] * b[17];
    out[3] = a[0] * b[3] + a[1] * b[8] + a[2] * b[13] + a[3] * b[18];
    out[4] = a[0] * b[4] + a[1] * b[9] + a[2] * b[14] + a[3] * b[19] + a[4];
    out[5] = a[5] * b[0] + a[6] * b[5] + a[7] * b[10] + a[8] * b[15];
    out[6] = a[5] * b[1] + a[6] * b[6] + a[7] * b[11] + a[8] * b[16];
    out[7] = a[5] * b[2] + a[6] * b[7] + a[7] * b[12] + a[8] * b[17];
    out[8] = a[5] * b[3] + a[6] * b[8] + a[7] * b[13] + a[8] * b[18];
    out[9] = a[5] * b[4] + a[6] * b[9] + a[7] * b[14] + a[8] * b[19] + a[9];
    out[10] = a[10] * b[0] + a[11] * b[5] + a[12] * b[10] + a[13] * b[15];
    out[11] = a[10] * b[1] + a[11] * b[6] + a[12] * b[11] + a[13] * b[16];
    out[12] = a[10] * b[2] + a[11] * b[7] + a[12] * b[12] + a[13] * b[17];
    out[13] = a[10] * b[3] + a[11] * b[8] + a[12] * b[13] + a[13] * b[18];
    out[14] = a[10] * b[4] + a[11] * b[9] + a[12] * b[14] + a[13] * b[19] + a[14];
    out[15] = a[15] * b[0] + a[16] * b[5] + a[17] * b[10] + a[18] * b[15];
    out[16] = a[15] * b[1] + a[16] * b[6] + a[17] * b[11] + a[18] * b[16];
    out[17] = a[15] * b[2] + a[16] * b[7] + a[17] * b[12] + a[18] * b[17];
    out[18] = a[15] * b[3] + a[16] * b[8] + a[17] * b[13] + a[18] * b[18];
    out[19] = a[15] * b[4] + a[16] * b[9] + a[17] * b[14] + a[18] * b[19] + a[19];
    return out;
  };
  ColorMatrixFilter2.prototype._colorMatrix = function(matrix) {
    var m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;
    return m;
  };
  ColorMatrixFilter2.prototype.brightness = function(b, multiply) {
    var matrix = [
      b,
      0,
      0,
      0,
      0,
      0,
      b,
      0,
      0,
      0,
      0,
      0,
      b,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.tint = function(color2, multiply) {
    var r = color2 >> 16 & 255;
    var g = color2 >> 8 & 255;
    var b = color2 & 255;
    var matrix = [
      r / 255,
      0,
      0,
      0,
      0,
      0,
      g / 255,
      0,
      0,
      0,
      0,
      0,
      b / 255,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.greyscale = function(scale, multiply) {
    var matrix = [
      scale,
      scale,
      scale,
      0,
      0,
      scale,
      scale,
      scale,
      0,
      0,
      scale,
      scale,
      scale,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.blackAndWhite = function(multiply) {
    var matrix = [
      0.3,
      0.6,
      0.1,
      0,
      0,
      0.3,
      0.6,
      0.1,
      0,
      0,
      0.3,
      0.6,
      0.1,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.hue = function(rotation, multiply) {
    rotation = (rotation || 0) / 180 * Math.PI;
    var cosR = Math.cos(rotation);
    var sinR = Math.sin(rotation);
    var sqrt = Math.sqrt;
    var w = 1 / 3;
    var sqrW = sqrt(w);
    var a00 = cosR + (1 - cosR) * w;
    var a01 = w * (1 - cosR) - sqrW * sinR;
    var a02 = w * (1 - cosR) + sqrW * sinR;
    var a10 = w * (1 - cosR) + sqrW * sinR;
    var a11 = cosR + w * (1 - cosR);
    var a12 = w * (1 - cosR) - sqrW * sinR;
    var a20 = w * (1 - cosR) - sqrW * sinR;
    var a21 = w * (1 - cosR) + sqrW * sinR;
    var a22 = cosR + w * (1 - cosR);
    var matrix = [
      a00,
      a01,
      a02,
      0,
      0,
      a10,
      a11,
      a12,
      0,
      0,
      a20,
      a21,
      a22,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.contrast = function(amount, multiply) {
    var v = (amount || 0) + 1;
    var o = -0.5 * (v - 1);
    var matrix = [
      v,
      0,
      0,
      0,
      o,
      0,
      v,
      0,
      0,
      o,
      0,
      0,
      v,
      0,
      o,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.saturate = function(amount, multiply) {
    if (amount === void 0) {
      amount = 0;
    }
    var x = amount * 2 / 3 + 1;
    var y = (x - 1) * -0.5;
    var matrix = [
      x,
      y,
      y,
      0,
      0,
      y,
      x,
      y,
      0,
      0,
      y,
      y,
      x,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.desaturate = function() {
    this.saturate(-1);
  };
  ColorMatrixFilter2.prototype.negative = function(multiply) {
    var matrix = [
      -1,
      0,
      0,
      1,
      0,
      0,
      -1,
      0,
      1,
      0,
      0,
      0,
      -1,
      1,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.sepia = function(multiply) {
    var matrix = [
      0.393,
      0.7689999,
      0.18899999,
      0,
      0,
      0.349,
      0.6859999,
      0.16799999,
      0,
      0,
      0.272,
      0.5339999,
      0.13099999,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.technicolor = function(multiply) {
    var matrix = [
      1.9125277891456083,
      -0.8545344976951645,
      -0.09155508482755585,
      0,
      11.793603434377337,
      -0.3087833385928097,
      1.7658908555458428,
      -0.10601743074722245,
      0,
      -70.35205161461398,
      -0.231103377548616,
      -0.7501899197440212,
      1.847597816108189,
      0,
      30.950940869491138,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.polaroid = function(multiply) {
    var matrix = [
      1.438,
      -0.062,
      -0.062,
      0,
      0,
      -0.122,
      1.378,
      -0.122,
      0,
      0,
      -0.016,
      -0.016,
      1.483,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.toBGR = function(multiply) {
    var matrix = [
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.kodachrome = function(multiply) {
    var matrix = [
      1.1285582396593525,
      -0.3967382283601348,
      -0.03992559172921793,
      0,
      63.72958762196502,
      -0.16404339962244616,
      1.0835251566291304,
      -0.05498805115633132,
      0,
      24.732407896706203,
      -0.16786010706155763,
      -0.5603416277695248,
      1.6014850761964943,
      0,
      35.62982807460946,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.browni = function(multiply) {
    var matrix = [
      0.5997023498159715,
      0.34553243048391263,
      -0.2708298674538042,
      0,
      47.43192855600873,
      -0.037703249837783157,
      0.8609577587992641,
      0.15059552388459913,
      0,
      -36.96841498319127,
      0.24113635128153335,
      -0.07441037908422492,
      0.44972182064877153,
      0,
      -7.562075277591283,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.vintage = function(multiply) {
    var matrix = [
      0.6279345635605994,
      0.3202183420819367,
      -0.03965408211312453,
      0,
      9.651285835294123,
      0.02578397704808868,
      0.6441188644374771,
      0.03259127616149294,
      0,
      7.462829176470591,
      0.0466055556782719,
      -0.0851232987247891,
      0.5241648018700465,
      0,
      5.159190588235296,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.colorTone = function(desaturation, toned, lightColor, darkColor, multiply) {
    desaturation = desaturation || 0.2;
    toned = toned || 0.15;
    lightColor = lightColor || 16770432;
    darkColor = darkColor || 3375104;
    var lR = (lightColor >> 16 & 255) / 255;
    var lG = (lightColor >> 8 & 255) / 255;
    var lB = (lightColor & 255) / 255;
    var dR = (darkColor >> 16 & 255) / 255;
    var dG = (darkColor >> 8 & 255) / 255;
    var dB = (darkColor & 255) / 255;
    var matrix = [
      0.3,
      0.59,
      0.11,
      0,
      0,
      lR,
      lG,
      lB,
      desaturation,
      0,
      dR,
      dG,
      dB,
      toned,
      0,
      lR - dR,
      lG - dG,
      lB - dB,
      0,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.night = function(intensity, multiply) {
    intensity = intensity || 0.1;
    var matrix = [
      intensity * -2,
      -intensity,
      0,
      0,
      0,
      -intensity,
      0,
      intensity,
      0,
      0,
      0,
      intensity,
      intensity * 2,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.predator = function(amount, multiply) {
    var matrix = [
      11.224130630493164 * amount,
      -4.794486999511719 * amount,
      -2.8746118545532227 * amount,
      0 * amount,
      0.40342438220977783 * amount,
      -3.6330697536468506 * amount,
      9.193157196044922 * amount,
      -2.951810836791992 * amount,
      0 * amount,
      -1.316135048866272 * amount,
      -3.2184197902679443 * amount,
      -4.2375030517578125 * amount,
      7.476448059082031 * amount,
      0 * amount,
      0.8044459223747253 * amount,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.lsd = function(multiply) {
    var matrix = [
      2,
      -0.4,
      0.5,
      0,
      0,
      -0.5,
      2,
      -0.4,
      0,
      0,
      -0.4,
      -0.5,
      3,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, multiply);
  };
  ColorMatrixFilter2.prototype.reset = function() {
    var matrix = [
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      1,
      0
    ];
    this._loadMatrix(matrix, false);
  };
  Object.defineProperty(ColorMatrixFilter2.prototype, "matrix", {
    get: function() {
      return this.uniforms.m;
    },
    set: function(value) {
      this.uniforms.m = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(ColorMatrixFilter2.prototype, "alpha", {
    get: function() {
      return this.uniforms.uAlpha;
    },
    set: function(value) {
      this.uniforms.uAlpha = value;
    },
    enumerable: false,
    configurable: true
  });
  return ColorMatrixFilter2;
}(Filter);
ColorMatrixFilter.prototype.grayscale = ColorMatrixFilter.prototype.greyscale;
var extendStatics$4 = function(d, b) {
  extendStatics$4 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$4(d, b);
};
function __extends$4(d, b) {
  extendStatics$4(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var fragment$2 = "varying vec2 vFilterCoord;\nvarying vec2 vTextureCoord;\n\nuniform vec2 scale;\nuniform mat2 rotation;\nuniform sampler2D uSampler;\nuniform sampler2D mapSampler;\n\nuniform highp vec4 inputSize;\nuniform vec4 inputClamp;\n\nvoid main(void)\n{\n  vec4 map =  texture2D(mapSampler, vFilterCoord);\n\n  map -= 0.5;\n  map.xy = scale * inputSize.zw * (rotation * map.xy);\n\n  gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));\n}\n";
var vertex$1 = "attribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\nuniform mat3 filterMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec2 vFilterCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvec2 filterTextureCoord( void )\n{\n    return aVertexPosition * (outputFrame.zw * inputSize.zw);\n}\n\nvoid main(void)\n{\n	gl_Position = filterVertexPosition();\n	vTextureCoord = filterTextureCoord();\n	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;\n}\n";
var DisplacementFilter = function(_super) {
  __extends$4(DisplacementFilter2, _super);
  function DisplacementFilter2(sprite, scale) {
    var _this = this;
    var maskMatrix = new Matrix();
    sprite.renderable = false;
    _this = _super.call(this, vertex$1, fragment$2, {
      mapSampler: sprite._texture,
      filterMatrix: maskMatrix,
      scale: { x: 1, y: 1 },
      rotation: new Float32Array([1, 0, 0, 1])
    }) || this;
    _this.maskSprite = sprite;
    _this.maskMatrix = maskMatrix;
    if (scale === null || scale === void 0) {
      scale = 20;
    }
    _this.scale = new Point(scale, scale);
    return _this;
  }
  DisplacementFilter2.prototype.apply = function(filterManager, input, output, clearMode) {
    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.maskMatrix, this.maskSprite);
    this.uniforms.scale.x = this.scale.x;
    this.uniforms.scale.y = this.scale.y;
    var wt = this.maskSprite.worldTransform;
    var lenX = Math.sqrt(wt.a * wt.a + wt.b * wt.b);
    var lenY = Math.sqrt(wt.c * wt.c + wt.d * wt.d);
    if (lenX !== 0 && lenY !== 0) {
      this.uniforms.rotation[0] = wt.a / lenX;
      this.uniforms.rotation[1] = wt.b / lenX;
      this.uniforms.rotation[2] = wt.c / lenY;
      this.uniforms.rotation[3] = wt.d / lenY;
    }
    filterManager.applyFilter(this, input, output, clearMode);
  };
  Object.defineProperty(DisplacementFilter2.prototype, "map", {
    get: function() {
      return this.uniforms.mapSampler;
    },
    set: function(value) {
      this.uniforms.mapSampler = value;
    },
    enumerable: false,
    configurable: true
  });
  return DisplacementFilter2;
}(Filter);
var extendStatics$3 = function(d, b) {
  extendStatics$3 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$3(d, b);
};
function __extends$3(d, b) {
  extendStatics$3(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var vertex = "\nattribute vec2 aVertexPosition;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 v_rgbNW;\nvarying vec2 v_rgbNE;\nvarying vec2 v_rgbSW;\nvarying vec2 v_rgbSE;\nvarying vec2 v_rgbM;\n\nvarying vec2 vFragCoord;\n\nuniform vec4 inputSize;\nuniform vec4 outputFrame;\n\nvec4 filterVertexPosition( void )\n{\n    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;\n\n    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);\n}\n\nvoid texcoords(vec2 fragCoord, vec2 inverseVP,\n               out vec2 v_rgbNW, out vec2 v_rgbNE,\n               out vec2 v_rgbSW, out vec2 v_rgbSE,\n               out vec2 v_rgbM) {\n    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n    v_rgbM = vec2(fragCoord * inverseVP);\n}\n\nvoid main(void) {\n\n   gl_Position = filterVertexPosition();\n\n   vFragCoord = aVertexPosition * outputFrame.zw;\n\n   texcoords(vFragCoord, inputSize.zw, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n}\n";
var fragment$1 = `varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

varying vec2 vFragCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputSize;


/**
 Basic FXAA implementation based on the code on geeks3d.com with the
 modification that the texture2DLod stuff was removed since it's
 unsupported by WebGL.

 --

 From:
 https://github.com/mitsuhiko/webgl-meincraft

 Copyright (c) 2011 by Armin Ronacher.

 Some rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are
 met:

 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.

 * Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials provided
 with the distribution.

 * The names of the contributors may not be used to endorse or
 promote products derived from this software without specific
 prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#ifndef FXAA_REDUCE_MIN
#define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
#define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
#define FXAA_SPAN_MAX     8.0
#endif

//optimized version for mobile, where dependent
//texture reads can be a bottleneck
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 inverseVP,
          vec2 v_rgbNW, vec2 v_rgbNE,
          vec2 v_rgbSW, vec2 v_rgbSE,
          vec2 v_rgbM) {
    vec4 color;
    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
    vec4 texColor = texture2D(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                  dir * rcpDirMin)) * inverseVP;

    vec3 rgbA = 0.5 * (
                       texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
                       texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
                                     texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
                                     texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, texColor.a);
    else
        color = vec4(rgbB, texColor.a);
    return color;
}

void main() {

      vec4 color;

      color = fxaa(uSampler, vFragCoord, inputSize.zw, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);

      gl_FragColor = color;
}
`;
var FXAAFilter = function(_super) {
  __extends$3(FXAAFilter2, _super);
  function FXAAFilter2() {
    return _super.call(this, vertex, fragment$1) || this;
  }
  return FXAAFilter2;
}(Filter);
var extendStatics$2 = function(d, b) {
  extendStatics$2 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$2(d, b);
};
function __extends$2(d, b) {
  extendStatics$2(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var fragment = "precision highp float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform float uNoise;\nuniform float uSeed;\nuniform sampler2D uSampler;\n\nfloat rand(vec2 co)\n{\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main()\n{\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    float randomValue = rand(gl_FragCoord.xy * uSeed);\n    float diff = (randomValue - 0.5) * uNoise;\n\n    // Un-premultiply alpha before applying the color matrix. See issue #3539.\n    if (color.a > 0.0) {\n        color.rgb /= color.a;\n    }\n\n    color.r += diff;\n    color.g += diff;\n    color.b += diff;\n\n    // Premultiply alpha again.\n    color.rgb *= color.a;\n\n    gl_FragColor = color;\n}\n";
var NoiseFilter = function(_super) {
  __extends$2(NoiseFilter2, _super);
  function NoiseFilter2(noise, seed) {
    if (noise === void 0) {
      noise = 0.5;
    }
    if (seed === void 0) {
      seed = Math.random();
    }
    var _this = _super.call(this, defaultFilterVertex, fragment, {
      uNoise: 0,
      uSeed: 0
    }) || this;
    _this.noise = noise;
    _this.seed = seed;
    return _this;
  }
  Object.defineProperty(NoiseFilter2.prototype, "noise", {
    get: function() {
      return this.uniforms.uNoise;
    },
    set: function(value) {
      this.uniforms.uNoise = value;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NoiseFilter2.prototype, "seed", {
    get: function() {
      return this.uniforms.uSeed;
    },
    set: function(value) {
      this.uniforms.uSeed = value;
    },
    enumerable: false,
    configurable: true
  });
  return NoiseFilter2;
}(Filter);
var _tempMatrix = new Matrix();
DisplayObject.prototype._cacheAsBitmap = false;
DisplayObject.prototype._cacheData = null;
DisplayObject.prototype._cacheAsBitmapResolution = null;
DisplayObject.prototype._cacheAsBitmapMultisample = MSAA_QUALITY.NONE;
var CacheData = function() {
  function CacheData2() {
    this.textureCacheId = null;
    this.originalRender = null;
    this.originalRenderCanvas = null;
    this.originalCalculateBounds = null;
    this.originalGetLocalBounds = null;
    this.originalUpdateTransform = null;
    this.originalDestroy = null;
    this.originalMask = null;
    this.originalFilterArea = null;
    this.originalContainsPoint = null;
    this.sprite = null;
  }
  return CacheData2;
}();
Object.defineProperties(DisplayObject.prototype, {
  cacheAsBitmapResolution: {
    get: function() {
      return this._cacheAsBitmapResolution;
    },
    set: function(resolution) {
      if (resolution === this._cacheAsBitmapResolution) {
        return;
      }
      this._cacheAsBitmapResolution = resolution;
      if (this.cacheAsBitmap) {
        this.cacheAsBitmap = false;
        this.cacheAsBitmap = true;
      }
    }
  },
  cacheAsBitmapMultisample: {
    get: function() {
      return this._cacheAsBitmapMultisample;
    },
    set: function(multisample) {
      if (multisample === this._cacheAsBitmapMultisample) {
        return;
      }
      this._cacheAsBitmapMultisample = multisample;
      if (this.cacheAsBitmap) {
        this.cacheAsBitmap = false;
        this.cacheAsBitmap = true;
      }
    }
  },
  cacheAsBitmap: {
    get: function() {
      return this._cacheAsBitmap;
    },
    set: function(value) {
      if (this._cacheAsBitmap === value) {
        return;
      }
      this._cacheAsBitmap = value;
      var data;
      if (value) {
        if (!this._cacheData) {
          this._cacheData = new CacheData();
        }
        data = this._cacheData;
        data.originalRender = this.render;
        data.originalRenderCanvas = this.renderCanvas;
        data.originalUpdateTransform = this.updateTransform;
        data.originalCalculateBounds = this.calculateBounds;
        data.originalGetLocalBounds = this.getLocalBounds;
        data.originalDestroy = this.destroy;
        data.originalContainsPoint = this.containsPoint;
        data.originalMask = this._mask;
        data.originalFilterArea = this.filterArea;
        this.render = this._renderCached;
        this.renderCanvas = this._renderCachedCanvas;
        this.destroy = this._cacheAsBitmapDestroy;
      } else {
        data = this._cacheData;
        if (data.sprite) {
          this._destroyCachedDisplayObject();
        }
        this.render = data.originalRender;
        this.renderCanvas = data.originalRenderCanvas;
        this.calculateBounds = data.originalCalculateBounds;
        this.getLocalBounds = data.originalGetLocalBounds;
        this.destroy = data.originalDestroy;
        this.updateTransform = data.originalUpdateTransform;
        this.containsPoint = data.originalContainsPoint;
        this._mask = data.originalMask;
        this.filterArea = data.originalFilterArea;
      }
    }
  }
});
DisplayObject.prototype._renderCached = function _renderCached(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }
  this._initCachedDisplayObject(renderer);
  this._cacheData.sprite.transform._worldID = this.transform._worldID;
  this._cacheData.sprite.worldAlpha = this.worldAlpha;
  this._cacheData.sprite._render(renderer);
};
DisplayObject.prototype._initCachedDisplayObject = function _initCachedDisplayObject(renderer) {
  var _a2;
  if (this._cacheData && this._cacheData.sprite) {
    return;
  }
  var cacheAlpha = this.alpha;
  this.alpha = 1;
  renderer.batch.flush();
  var bounds = this.getLocalBounds(null, true).clone();
  if (this.filters && this.filters.length) {
    var padding = this.filters[0].padding;
    bounds.pad(padding);
  }
  bounds.ceil(settings.RESOLUTION);
  var cachedRenderTexture = renderer.renderTexture.current;
  var cachedSourceFrame = renderer.renderTexture.sourceFrame.clone();
  var cachedDestinationFrame = renderer.renderTexture.destinationFrame.clone();
  var cachedProjectionTransform = renderer.projection.transform;
  var renderTexture = RenderTexture.create({
    width: bounds.width,
    height: bounds.height,
    resolution: this.cacheAsBitmapResolution || renderer.resolution,
    multisample: (_a2 = this.cacheAsBitmapMultisample) !== null && _a2 !== void 0 ? _a2 : renderer.multisample
  });
  var textureCacheId = "cacheAsBitmap_" + uid();
  this._cacheData.textureCacheId = textureCacheId;
  BaseTexture.addToCache(renderTexture.baseTexture, textureCacheId);
  Texture.addToCache(renderTexture, textureCacheId);
  var m = this.transform.localTransform.copyTo(_tempMatrix).invert().translate(-bounds.x, -bounds.y);
  this.render = this._cacheData.originalRender;
  renderer.render(this, { renderTexture, clear: true, transform: m, skipUpdateTransform: false });
  renderer.framebuffer.blit();
  renderer.projection.transform = cachedProjectionTransform;
  renderer.renderTexture.bind(cachedRenderTexture, cachedSourceFrame, cachedDestinationFrame);
  this.render = this._renderCached;
  this.updateTransform = this.displayObjectUpdateTransform;
  this.calculateBounds = this._calculateCachedBounds;
  this.getLocalBounds = this._getCachedLocalBounds;
  this._mask = null;
  this.filterArea = null;
  this.alpha = cacheAlpha;
  var cachedSprite = new Sprite$1(renderTexture);
  cachedSprite.transform.worldTransform = this.transform.worldTransform;
  cachedSprite.anchor.x = -(bounds.x / bounds.width);
  cachedSprite.anchor.y = -(bounds.y / bounds.height);
  cachedSprite.alpha = cacheAlpha;
  cachedSprite._bounds = this._bounds;
  this._cacheData.sprite = cachedSprite;
  this.transform._parentID = -1;
  if (!this.parent) {
    this.enableTempParent();
    this.updateTransform();
    this.disableTempParent(null);
  } else {
    this.updateTransform();
  }
  this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
};
DisplayObject.prototype._renderCachedCanvas = function _renderCachedCanvas(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }
  this._initCachedDisplayObjectCanvas(renderer);
  this._cacheData.sprite.worldAlpha = this.worldAlpha;
  this._cacheData.sprite._renderCanvas(renderer);
};
DisplayObject.prototype._initCachedDisplayObjectCanvas = function _initCachedDisplayObjectCanvas(renderer) {
  if (this._cacheData && this._cacheData.sprite) {
    return;
  }
  var bounds = this.getLocalBounds(null, true);
  var cacheAlpha = this.alpha;
  this.alpha = 1;
  var cachedRenderTarget = renderer.context;
  var cachedProjectionTransform = renderer._projTransform;
  bounds.ceil(settings.RESOLUTION);
  var renderTexture = RenderTexture.create({ width: bounds.width, height: bounds.height });
  var textureCacheId = "cacheAsBitmap_" + uid();
  this._cacheData.textureCacheId = textureCacheId;
  BaseTexture.addToCache(renderTexture.baseTexture, textureCacheId);
  Texture.addToCache(renderTexture, textureCacheId);
  var m = _tempMatrix;
  this.transform.localTransform.copyTo(m);
  m.invert();
  m.tx -= bounds.x;
  m.ty -= bounds.y;
  this.renderCanvas = this._cacheData.originalRenderCanvas;
  renderer.render(this, { renderTexture, clear: true, transform: m, skipUpdateTransform: false });
  renderer.context = cachedRenderTarget;
  renderer._projTransform = cachedProjectionTransform;
  this.renderCanvas = this._renderCachedCanvas;
  this.updateTransform = this.displayObjectUpdateTransform;
  this.calculateBounds = this._calculateCachedBounds;
  this.getLocalBounds = this._getCachedLocalBounds;
  this._mask = null;
  this.filterArea = null;
  this.alpha = cacheAlpha;
  var cachedSprite = new Sprite$1(renderTexture);
  cachedSprite.transform.worldTransform = this.transform.worldTransform;
  cachedSprite.anchor.x = -(bounds.x / bounds.width);
  cachedSprite.anchor.y = -(bounds.y / bounds.height);
  cachedSprite.alpha = cacheAlpha;
  cachedSprite._bounds = this._bounds;
  this._cacheData.sprite = cachedSprite;
  this.transform._parentID = -1;
  if (!this.parent) {
    this.parent = renderer._tempDisplayObjectParent;
    this.updateTransform();
    this.parent = null;
  } else {
    this.updateTransform();
  }
  this.containsPoint = cachedSprite.containsPoint.bind(cachedSprite);
};
DisplayObject.prototype._calculateCachedBounds = function _calculateCachedBounds() {
  this._bounds.clear();
  this._cacheData.sprite.transform._worldID = this.transform._worldID;
  this._cacheData.sprite._calculateBounds();
  this._bounds.updateID = this._boundsID;
};
DisplayObject.prototype._getCachedLocalBounds = function _getCachedLocalBounds() {
  return this._cacheData.sprite.getLocalBounds(null);
};
DisplayObject.prototype._destroyCachedDisplayObject = function _destroyCachedDisplayObject() {
  this._cacheData.sprite._texture.destroy(true);
  this._cacheData.sprite = null;
  BaseTexture.removeFromCache(this._cacheData.textureCacheId);
  Texture.removeFromCache(this._cacheData.textureCacheId);
  this._cacheData.textureCacheId = null;
};
DisplayObject.prototype._cacheAsBitmapDestroy = function _cacheAsBitmapDestroy(options) {
  this.cacheAsBitmap = false;
  this.destroy(options);
};
DisplayObject.prototype.name = null;
Container.prototype.getChildByName = function getChildByName(name, deep) {
  for (var i = 0, j = this.children.length; i < j; i++) {
    if (this.children[i].name === name) {
      return this.children[i];
    }
  }
  if (deep) {
    for (var i = 0, j = this.children.length; i < j; i++) {
      var child = this.children[i];
      if (!child.getChildByName) {
        continue;
      }
      var target = child.getChildByName(name, true);
      if (target) {
        return target;
      }
    }
  }
  return null;
};
DisplayObject.prototype.getGlobalPosition = function getGlobalPosition(point, skipUpdate) {
  if (point === void 0) {
    point = new Point();
  }
  if (skipUpdate === void 0) {
    skipUpdate = false;
  }
  if (this.parent) {
    this.parent.toGlobal(this.position, point, skipUpdate);
  } else {
    point.x = this.position.x;
    point.y = this.position.y;
  }
  return point;
};
var ResizePlugin = function() {
  function ResizePlugin2() {
  }
  ResizePlugin2.init = function(options) {
    var _this = this;
    Object.defineProperty(
      this,
      "resizeTo",
      {
        set: function(dom2) {
          globalThis.removeEventListener("resize", this.queueResize);
          this._resizeTo = dom2;
          if (dom2) {
            globalThis.addEventListener("resize", this.queueResize);
            this.resize();
          }
        },
        get: function() {
          return this._resizeTo;
        }
      }
    );
    this.queueResize = function() {
      if (!_this._resizeTo) {
        return;
      }
      _this.cancelResize();
      _this._resizeId = requestAnimationFrame(function() {
        return _this.resize();
      });
    };
    this.cancelResize = function() {
      if (_this._resizeId) {
        cancelAnimationFrame(_this._resizeId);
        _this._resizeId = null;
      }
    };
    this.resize = function() {
      if (!_this._resizeTo) {
        return;
      }
      _this.cancelResize();
      var width;
      var height;
      if (_this._resizeTo === globalThis.window) {
        width = globalThis.innerWidth;
        height = globalThis.innerHeight;
      } else {
        var _a2 = _this._resizeTo, clientWidth = _a2.clientWidth, clientHeight = _a2.clientHeight;
        width = clientWidth;
        height = clientHeight;
      }
      _this.renderer.resize(width, height);
    };
    this._resizeId = null;
    this._resizeTo = null;
    this.resizeTo = options.resizeTo || null;
  };
  ResizePlugin2.destroy = function() {
    globalThis.removeEventListener("resize", this.queueResize);
    this.cancelResize();
    this.cancelResize = null;
    this.queueResize = null;
    this.resizeTo = null;
    this.resize = null;
  };
  ResizePlugin2.extension = ExtensionType.Application;
  return ResizePlugin2;
}();
var Application = function() {
  function Application2(options) {
    var _this = this;
    this.stage = new Container();
    options = Object.assign({
      forceCanvas: false
    }, options);
    this.renderer = autoDetectRenderer(options);
    Application2._plugins.forEach(function(plugin) {
      plugin.init.call(_this, options);
    });
  }
  Application2.registerPlugin = function(plugin) {
    deprecation("6.5.0", "Application.registerPlugin() is deprecated, use extensions.add()");
    extensions.add({
      type: ExtensionType.Application,
      ref: plugin
    });
  };
  Application2.prototype.render = function() {
    this.renderer.render(this.stage);
  };
  Object.defineProperty(Application2.prototype, "view", {
    get: function() {
      return this.renderer.view;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Application2.prototype, "screen", {
    get: function() {
      return this.renderer.screen;
    },
    enumerable: false,
    configurable: true
  });
  Application2.prototype.destroy = function(removeView, stageOptions) {
    var _this = this;
    var plugins = Application2._plugins.slice(0);
    plugins.reverse();
    plugins.forEach(function(plugin) {
      plugin.destroy.call(_this);
    });
    this.stage.destroy(stageOptions);
    this.stage = null;
    this.renderer.destroy(removeView);
    this.renderer = null;
  };
  Application2._plugins = [];
  return Application2;
}();
extensions.handleByList(ExtensionType.Application, Application._plugins);
extensions.add(ResizePlugin);
var extendStatics$1 = function(d, b) {
  extendStatics$1 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics$1(d, b);
};
function __extends$1(d, b) {
  extendStatics$1(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var PlaneGeometry = function(_super) {
  __extends$1(PlaneGeometry2, _super);
  function PlaneGeometry2(width, height, segWidth, segHeight) {
    if (width === void 0) {
      width = 100;
    }
    if (height === void 0) {
      height = 100;
    }
    if (segWidth === void 0) {
      segWidth = 10;
    }
    if (segHeight === void 0) {
      segHeight = 10;
    }
    var _this = _super.call(this) || this;
    _this.segWidth = segWidth;
    _this.segHeight = segHeight;
    _this.width = width;
    _this.height = height;
    _this.build();
    return _this;
  }
  PlaneGeometry2.prototype.build = function() {
    var total = this.segWidth * this.segHeight;
    var verts = [];
    var uvs = [];
    var indices2 = [];
    var segmentsX = this.segWidth - 1;
    var segmentsY = this.segHeight - 1;
    var sizeX = this.width / segmentsX;
    var sizeY = this.height / segmentsY;
    for (var i = 0; i < total; i++) {
      var x = i % this.segWidth;
      var y = i / this.segWidth | 0;
      verts.push(x * sizeX, y * sizeY);
      uvs.push(x / segmentsX, y / segmentsY);
    }
    var totalSub = segmentsX * segmentsY;
    for (var i = 0; i < totalSub; i++) {
      var xpos = i % segmentsX;
      var ypos = i / segmentsX | 0;
      var value = ypos * this.segWidth + xpos;
      var value2 = ypos * this.segWidth + xpos + 1;
      var value3 = (ypos + 1) * this.segWidth + xpos;
      var value4 = (ypos + 1) * this.segWidth + xpos + 1;
      indices2.push(value, value2, value3, value2, value4, value3);
    }
    this.buffers[0].data = new Float32Array(verts);
    this.buffers[1].data = new Float32Array(uvs);
    this.indexBuffer.data = new Uint16Array(indices2);
    this.buffers[0].update();
    this.buffers[1].update();
    this.indexBuffer.update();
  };
  return PlaneGeometry2;
}(MeshGeometry);
var RopeGeometry = function(_super) {
  __extends$1(RopeGeometry2, _super);
  function RopeGeometry2(width, points, textureScale) {
    if (width === void 0) {
      width = 200;
    }
    if (textureScale === void 0) {
      textureScale = 0;
    }
    var _this = _super.call(this, new Float32Array(points.length * 4), new Float32Array(points.length * 4), new Uint16Array((points.length - 1) * 6)) || this;
    _this.points = points;
    _this._width = width;
    _this.textureScale = textureScale;
    _this.build();
    return _this;
  }
  Object.defineProperty(RopeGeometry2.prototype, "width", {
    get: function() {
      return this._width;
    },
    enumerable: false,
    configurable: true
  });
  RopeGeometry2.prototype.build = function() {
    var points = this.points;
    if (!points) {
      return;
    }
    var vertexBuffer = this.getBuffer("aVertexPosition");
    var uvBuffer = this.getBuffer("aTextureCoord");
    var indexBuffer = this.getIndex();
    if (points.length < 1) {
      return;
    }
    if (vertexBuffer.data.length / 4 !== points.length) {
      vertexBuffer.data = new Float32Array(points.length * 4);
      uvBuffer.data = new Float32Array(points.length * 4);
      indexBuffer.data = new Uint16Array((points.length - 1) * 6);
    }
    var uvs = uvBuffer.data;
    var indices2 = indexBuffer.data;
    uvs[0] = 0;
    uvs[1] = 0;
    uvs[2] = 0;
    uvs[3] = 1;
    var amount = 0;
    var prev = points[0];
    var textureWidth = this._width * this.textureScale;
    var total = points.length;
    for (var i = 0; i < total; i++) {
      var index2 = i * 4;
      if (this.textureScale > 0) {
        var dx = prev.x - points[i].x;
        var dy = prev.y - points[i].y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        prev = points[i];
        amount += distance / textureWidth;
      } else {
        amount = i / (total - 1);
      }
      uvs[index2] = amount;
      uvs[index2 + 1] = 0;
      uvs[index2 + 2] = amount;
      uvs[index2 + 3] = 1;
    }
    var indexCount = 0;
    for (var i = 0; i < total - 1; i++) {
      var index2 = i * 2;
      indices2[indexCount++] = index2;
      indices2[indexCount++] = index2 + 1;
      indices2[indexCount++] = index2 + 2;
      indices2[indexCount++] = index2 + 2;
      indices2[indexCount++] = index2 + 1;
      indices2[indexCount++] = index2 + 3;
    }
    uvBuffer.update();
    indexBuffer.update();
    this.updateVertices();
  };
  RopeGeometry2.prototype.updateVertices = function() {
    var points = this.points;
    if (points.length < 1) {
      return;
    }
    var lastPoint = points[0];
    var nextPoint;
    var perpX = 0;
    var perpY = 0;
    var vertices = this.buffers[0].data;
    var total = points.length;
    for (var i = 0; i < total; i++) {
      var point = points[i];
      var index2 = i * 4;
      if (i < points.length - 1) {
        nextPoint = points[i + 1];
      } else {
        nextPoint = point;
      }
      perpY = -(nextPoint.x - lastPoint.x);
      perpX = nextPoint.y - lastPoint.y;
      var perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
      var num = this.textureScale > 0 ? this.textureScale * this._width / 2 : this._width / 2;
      perpX /= perpLength;
      perpY /= perpLength;
      perpX *= num;
      perpY *= num;
      vertices[index2] = point.x + perpX;
      vertices[index2 + 1] = point.y + perpY;
      vertices[index2 + 2] = point.x - perpX;
      vertices[index2 + 3] = point.y - perpY;
      lastPoint = point;
    }
    this.buffers[0].update();
  };
  RopeGeometry2.prototype.update = function() {
    if (this.textureScale > 0) {
      this.build();
    } else {
      this.updateVertices();
    }
  };
  return RopeGeometry2;
}(MeshGeometry);
var SimpleRope = function(_super) {
  __extends$1(SimpleRope2, _super);
  function SimpleRope2(texture, points, textureScale) {
    if (textureScale === void 0) {
      textureScale = 0;
    }
    var _this = this;
    var ropeGeometry = new RopeGeometry(texture.height, points, textureScale);
    var meshMaterial = new MeshMaterial(texture);
    if (textureScale > 0) {
      texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;
    }
    _this = _super.call(this, ropeGeometry, meshMaterial) || this;
    _this.autoUpdate = true;
    return _this;
  }
  SimpleRope2.prototype._render = function(renderer) {
    var geometry = this.geometry;
    if (this.autoUpdate || geometry._width !== this.shader.texture.height) {
      geometry._width = this.shader.texture.height;
      geometry.update();
    }
    _super.prototype._render.call(this, renderer);
  };
  return SimpleRope2;
}(Mesh);
var SimplePlane = function(_super) {
  __extends$1(SimplePlane2, _super);
  function SimplePlane2(texture, verticesX, verticesY) {
    var _this = this;
    var planeGeometry = new PlaneGeometry(texture.width, texture.height, verticesX, verticesY);
    var meshMaterial = new MeshMaterial(Texture.WHITE);
    _this = _super.call(this, planeGeometry, meshMaterial) || this;
    _this.texture = texture;
    _this.autoResize = true;
    return _this;
  }
  SimplePlane2.prototype.textureUpdated = function() {
    this._textureID = this.shader.texture._updateID;
    var geometry = this.geometry;
    var _a2 = this.shader.texture, width = _a2.width, height = _a2.height;
    if (this.autoResize && (geometry.width !== width || geometry.height !== height)) {
      geometry.width = this.shader.texture.width;
      geometry.height = this.shader.texture.height;
      geometry.build();
    }
  };
  Object.defineProperty(SimplePlane2.prototype, "texture", {
    get: function() {
      return this.shader.texture;
    },
    set: function(value) {
      if (this.shader.texture === value) {
        return;
      }
      this.shader.texture = value;
      this._textureID = -1;
      if (value.baseTexture.valid) {
        this.textureUpdated();
      } else {
        value.once("update", this.textureUpdated, this);
      }
    },
    enumerable: false,
    configurable: true
  });
  SimplePlane2.prototype._render = function(renderer) {
    if (this._textureID !== this.shader.texture._updateID) {
      this.textureUpdated();
    }
    _super.prototype._render.call(this, renderer);
  };
  SimplePlane2.prototype.destroy = function(options) {
    this.shader.texture.off("update", this.textureUpdated, this);
    _super.prototype.destroy.call(this, options);
  };
  return SimplePlane2;
}(Mesh);
var SimpleMesh = function(_super) {
  __extends$1(SimpleMesh2, _super);
  function SimpleMesh2(texture, vertices, uvs, indices2, drawMode) {
    if (texture === void 0) {
      texture = Texture.EMPTY;
    }
    var _this = this;
    var geometry = new MeshGeometry(vertices, uvs, indices2);
    geometry.getBuffer("aVertexPosition").static = false;
    var meshMaterial = new MeshMaterial(texture);
    _this = _super.call(this, geometry, meshMaterial, null, drawMode) || this;
    _this.autoUpdate = true;
    return _this;
  }
  Object.defineProperty(SimpleMesh2.prototype, "vertices", {
    get: function() {
      return this.geometry.getBuffer("aVertexPosition").data;
    },
    set: function(value) {
      this.geometry.getBuffer("aVertexPosition").data = value;
    },
    enumerable: false,
    configurable: true
  });
  SimpleMesh2.prototype._render = function(renderer) {
    if (this.autoUpdate) {
      this.geometry.getBuffer("aVertexPosition").update();
    }
    _super.prototype._render.call(this, renderer);
  };
  return SimpleMesh2;
}(Mesh);
var DEFAULT_BORDER_SIZE = 10;
var NineSlicePlane = function(_super) {
  __extends$1(NineSlicePlane2, _super);
  function NineSlicePlane2(texture, leftWidth, topHeight, rightWidth, bottomHeight) {
    if (leftWidth === void 0) {
      leftWidth = DEFAULT_BORDER_SIZE;
    }
    if (topHeight === void 0) {
      topHeight = DEFAULT_BORDER_SIZE;
    }
    if (rightWidth === void 0) {
      rightWidth = DEFAULT_BORDER_SIZE;
    }
    if (bottomHeight === void 0) {
      bottomHeight = DEFAULT_BORDER_SIZE;
    }
    var _this = _super.call(this, Texture.WHITE, 4, 4) || this;
    _this._origWidth = texture.orig.width;
    _this._origHeight = texture.orig.height;
    _this._width = _this._origWidth;
    _this._height = _this._origHeight;
    _this._leftWidth = leftWidth;
    _this._rightWidth = rightWidth;
    _this._topHeight = topHeight;
    _this._bottomHeight = bottomHeight;
    _this.texture = texture;
    return _this;
  }
  NineSlicePlane2.prototype.textureUpdated = function() {
    this._textureID = this.shader.texture._updateID;
    this._refresh();
  };
  Object.defineProperty(NineSlicePlane2.prototype, "vertices", {
    get: function() {
      return this.geometry.getBuffer("aVertexPosition").data;
    },
    set: function(value) {
      this.geometry.getBuffer("aVertexPosition").data = value;
    },
    enumerable: false,
    configurable: true
  });
  NineSlicePlane2.prototype.updateHorizontalVertices = function() {
    var vertices = this.vertices;
    var scale = this._getMinScale();
    vertices[9] = vertices[11] = vertices[13] = vertices[15] = this._topHeight * scale;
    vertices[17] = vertices[19] = vertices[21] = vertices[23] = this._height - this._bottomHeight * scale;
    vertices[25] = vertices[27] = vertices[29] = vertices[31] = this._height;
  };
  NineSlicePlane2.prototype.updateVerticalVertices = function() {
    var vertices = this.vertices;
    var scale = this._getMinScale();
    vertices[2] = vertices[10] = vertices[18] = vertices[26] = this._leftWidth * scale;
    vertices[4] = vertices[12] = vertices[20] = vertices[28] = this._width - this._rightWidth * scale;
    vertices[6] = vertices[14] = vertices[22] = vertices[30] = this._width;
  };
  NineSlicePlane2.prototype._getMinScale = function() {
    var w = this._leftWidth + this._rightWidth;
    var scaleW = this._width > w ? 1 : this._width / w;
    var h = this._topHeight + this._bottomHeight;
    var scaleH = this._height > h ? 1 : this._height / h;
    var scale = Math.min(scaleW, scaleH);
    return scale;
  };
  Object.defineProperty(NineSlicePlane2.prototype, "width", {
    get: function() {
      return this._width;
    },
    set: function(value) {
      this._width = value;
      this._refresh();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NineSlicePlane2.prototype, "height", {
    get: function() {
      return this._height;
    },
    set: function(value) {
      this._height = value;
      this._refresh();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NineSlicePlane2.prototype, "leftWidth", {
    get: function() {
      return this._leftWidth;
    },
    set: function(value) {
      this._leftWidth = value;
      this._refresh();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NineSlicePlane2.prototype, "rightWidth", {
    get: function() {
      return this._rightWidth;
    },
    set: function(value) {
      this._rightWidth = value;
      this._refresh();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NineSlicePlane2.prototype, "topHeight", {
    get: function() {
      return this._topHeight;
    },
    set: function(value) {
      this._topHeight = value;
      this._refresh();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(NineSlicePlane2.prototype, "bottomHeight", {
    get: function() {
      return this._bottomHeight;
    },
    set: function(value) {
      this._bottomHeight = value;
      this._refresh();
    },
    enumerable: false,
    configurable: true
  });
  NineSlicePlane2.prototype._refresh = function() {
    var texture = this.texture;
    var uvs = this.geometry.buffers[1].data;
    this._origWidth = texture.orig.width;
    this._origHeight = texture.orig.height;
    var _uvw = 1 / this._origWidth;
    var _uvh = 1 / this._origHeight;
    uvs[0] = uvs[8] = uvs[16] = uvs[24] = 0;
    uvs[1] = uvs[3] = uvs[5] = uvs[7] = 0;
    uvs[6] = uvs[14] = uvs[22] = uvs[30] = 1;
    uvs[25] = uvs[27] = uvs[29] = uvs[31] = 1;
    uvs[2] = uvs[10] = uvs[18] = uvs[26] = _uvw * this._leftWidth;
    uvs[4] = uvs[12] = uvs[20] = uvs[28] = 1 - _uvw * this._rightWidth;
    uvs[9] = uvs[11] = uvs[13] = uvs[15] = _uvh * this._topHeight;
    uvs[17] = uvs[19] = uvs[21] = uvs[23] = 1 - _uvh * this._bottomHeight;
    this.updateHorizontalVertices();
    this.updateVerticalVertices();
    this.geometry.buffers[0].update();
    this.geometry.buffers[1].update();
  };
  return NineSlicePlane2;
}(SimplePlane);
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) {
      if (b2.hasOwnProperty(p)) {
        d2[p] = b2[p];
      }
    }
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var AnimatedSprite = function(_super) {
  __extends(AnimatedSprite2, _super);
  function AnimatedSprite2(textures, autoUpdate) {
    if (autoUpdate === void 0) {
      autoUpdate = true;
    }
    var _this = _super.call(this, textures[0] instanceof Texture ? textures[0] : textures[0].texture) || this;
    _this._textures = null;
    _this._durations = null;
    _this._autoUpdate = autoUpdate;
    _this._isConnectedToTicker = false;
    _this.animationSpeed = 1;
    _this.loop = true;
    _this.updateAnchor = false;
    _this.onComplete = null;
    _this.onFrameChange = null;
    _this.onLoop = null;
    _this._currentTime = 0;
    _this._playing = false;
    _this._previousFrame = null;
    _this.textures = textures;
    return _this;
  }
  AnimatedSprite2.prototype.stop = function() {
    if (!this._playing) {
      return;
    }
    this._playing = false;
    if (this._autoUpdate && this._isConnectedToTicker) {
      Ticker.shared.remove(this.update, this);
      this._isConnectedToTicker = false;
    }
  };
  AnimatedSprite2.prototype.play = function() {
    if (this._playing) {
      return;
    }
    this._playing = true;
    if (this._autoUpdate && !this._isConnectedToTicker) {
      Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
      this._isConnectedToTicker = true;
    }
  };
  AnimatedSprite2.prototype.gotoAndStop = function(frameNumber) {
    this.stop();
    var previousFrame = this.currentFrame;
    this._currentTime = frameNumber;
    if (previousFrame !== this.currentFrame) {
      this.updateTexture();
    }
  };
  AnimatedSprite2.prototype.gotoAndPlay = function(frameNumber) {
    var previousFrame = this.currentFrame;
    this._currentTime = frameNumber;
    if (previousFrame !== this.currentFrame) {
      this.updateTexture();
    }
    this.play();
  };
  AnimatedSprite2.prototype.update = function(deltaTime) {
    if (!this._playing) {
      return;
    }
    var elapsed = this.animationSpeed * deltaTime;
    var previousFrame = this.currentFrame;
    if (this._durations !== null) {
      var lag = this._currentTime % 1 * this._durations[this.currentFrame];
      lag += elapsed / 60 * 1e3;
      while (lag < 0) {
        this._currentTime--;
        lag += this._durations[this.currentFrame];
      }
      var sign2 = Math.sign(this.animationSpeed * deltaTime);
      this._currentTime = Math.floor(this._currentTime);
      while (lag >= this._durations[this.currentFrame]) {
        lag -= this._durations[this.currentFrame] * sign2;
        this._currentTime += sign2;
      }
      this._currentTime += lag / this._durations[this.currentFrame];
    } else {
      this._currentTime += elapsed;
    }
    if (this._currentTime < 0 && !this.loop) {
      this.gotoAndStop(0);
      if (this.onComplete) {
        this.onComplete();
      }
    } else if (this._currentTime >= this._textures.length && !this.loop) {
      this.gotoAndStop(this._textures.length - 1);
      if (this.onComplete) {
        this.onComplete();
      }
    } else if (previousFrame !== this.currentFrame) {
      if (this.loop && this.onLoop) {
        if (this.animationSpeed > 0 && this.currentFrame < previousFrame) {
          this.onLoop();
        } else if (this.animationSpeed < 0 && this.currentFrame > previousFrame) {
          this.onLoop();
        }
      }
      this.updateTexture();
    }
  };
  AnimatedSprite2.prototype.updateTexture = function() {
    var currentFrame = this.currentFrame;
    if (this._previousFrame === currentFrame) {
      return;
    }
    this._previousFrame = currentFrame;
    this._texture = this._textures[currentFrame];
    this._textureID = -1;
    this._textureTrimmedID = -1;
    this._cachedTint = 16777215;
    this.uvs = this._texture._uvs.uvsFloat32;
    if (this.updateAnchor) {
      this._anchor.copyFrom(this._texture.defaultAnchor);
    }
    if (this.onFrameChange) {
      this.onFrameChange(this.currentFrame);
    }
  };
  AnimatedSprite2.prototype.destroy = function(options) {
    this.stop();
    _super.prototype.destroy.call(this, options);
    this.onComplete = null;
    this.onFrameChange = null;
    this.onLoop = null;
  };
  AnimatedSprite2.fromFrames = function(frames) {
    var textures = [];
    for (var i = 0; i < frames.length; ++i) {
      textures.push(Texture.from(frames[i]));
    }
    return new AnimatedSprite2(textures);
  };
  AnimatedSprite2.fromImages = function(images) {
    var textures = [];
    for (var i = 0; i < images.length; ++i) {
      textures.push(Texture.from(images[i]));
    }
    return new AnimatedSprite2(textures);
  };
  Object.defineProperty(AnimatedSprite2.prototype, "totalFrames", {
    get: function() {
      return this._textures.length;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AnimatedSprite2.prototype, "textures", {
    get: function() {
      return this._textures;
    },
    set: function(value) {
      if (value[0] instanceof Texture) {
        this._textures = value;
        this._durations = null;
      } else {
        this._textures = [];
        this._durations = [];
        for (var i = 0; i < value.length; i++) {
          this._textures.push(value[i].texture);
          this._durations.push(value[i].time);
        }
      }
      this._previousFrame = null;
      this.gotoAndStop(0);
      this.updateTexture();
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AnimatedSprite2.prototype, "currentFrame", {
    get: function() {
      var currentFrame = Math.floor(this._currentTime) % this._textures.length;
      if (currentFrame < 0) {
        currentFrame += this._textures.length;
      }
      return currentFrame;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AnimatedSprite2.prototype, "playing", {
    get: function() {
      return this._playing;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(AnimatedSprite2.prototype, "autoUpdate", {
    get: function() {
      return this._autoUpdate;
    },
    set: function(value) {
      if (value !== this._autoUpdate) {
        this._autoUpdate = value;
        if (!this._autoUpdate && this._isConnectedToTicker) {
          Ticker.shared.remove(this.update, this);
          this._isConnectedToTicker = false;
        } else if (this._autoUpdate && !this._isConnectedToTicker && this._playing) {
          Ticker.shared.add(this.update, this);
          this._isConnectedToTicker = true;
        }
      }
    },
    enumerable: false,
    configurable: true
  });
  return AnimatedSprite2;
}(Sprite$1);
extensions.add(
  AccessibilityManager,
  Extract,
  InteractionManager,
  ParticleRenderer,
  Prepare,
  BatchRenderer,
  TilingSpriteRenderer,
  BitmapFontLoader,
  CompressedTextureLoader,
  DDSLoader,
  KTXLoader,
  SpritesheetLoader,
  TickerPlugin,
  AppLoaderPlugin
);
var filters = {
  AlphaFilter,
  BlurFilter,
  BlurFilterPass,
  ColorMatrixFilter,
  DisplacementFilter,
  FXAAFilter,
  NoiseFilter
};
const pixi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  utils,
  filters,
  AccessibilityManager,
  accessibleTarget,
  InteractionData,
  InteractionEvent,
  InteractionManager,
  InteractionTrackingData,
  interactiveTarget,
  get ExtensionType() {
    return ExtensionType;
  },
  extensions,
  AbstractBatchRenderer,
  AbstractMultiResource,
  AbstractRenderer,
  ArrayResource,
  Attribute,
  BaseImageResource,
  BaseRenderTexture,
  BaseTexture,
  BatchDrawCall,
  BatchGeometry,
  BatchPluginFactory,
  BatchRenderer,
  BatchShaderGenerator,
  BatchSystem,
  BatchTextureArray,
  Buffer: Buffer2,
  BufferResource,
  CanvasResource,
  ContextSystem,
  CubeResource,
  Filter,
  FilterState,
  FilterSystem,
  Framebuffer,
  FramebufferSystem,
  GLFramebuffer,
  GLProgram,
  GLTexture,
  Geometry,
  GeometrySystem,
  IGLUniformData,
  INSTALLED,
  ImageBitmapResource,
  ImageResource,
  MaskData,
  MaskSystem,
  ObjectRenderer,
  Program,
  ProjectionSystem,
  Quad,
  QuadUv,
  RenderTexture,
  RenderTexturePool,
  RenderTextureSystem,
  Renderer,
  Resource,
  SVGResource,
  ScissorSystem,
  Shader,
  ShaderSystem,
  SpriteMaskFilter,
  State,
  StateSystem,
  StencilSystem,
  System,
  Texture,
  TextureGCSystem,
  TextureMatrix,
  TextureSystem,
  TextureUvs,
  UniformGroup,
  VERSION,
  VideoResource,
  ViewableBuffer,
  autoDetectRenderer,
  autoDetectResource,
  checkMaxIfStatementsInShader,
  createUBOElements,
  defaultFilterVertex,
  defaultVertex: defaultVertex$1,
  generateProgram,
  generateUniformBufferSync,
  getTestContext,
  getUBOData,
  resources,
  systems,
  uniformParsers,
  Extract,
  AppLoaderPlugin,
  Loader,
  get LoaderResource() {
    return LoaderResource;
  },
  TextureLoader,
  BlobResource,
  CompressedTextureLoader,
  CompressedTextureResource,
  DDSLoader,
  FORMATS_TO_COMPONENTS,
  get INTERNAL_FORMATS() {
    return INTERNAL_FORMATS;
  },
  INTERNAL_FORMAT_TO_BYTES_PER_PIXEL,
  KTXLoader,
  TYPES_TO_BYTES_PER_COMPONENT,
  TYPES_TO_BYTES_PER_PIXEL,
  parseDDS,
  parseKTX,
  ParticleContainer,
  ParticleRenderer,
  BasePrepare,
  CountLimiter,
  Prepare,
  TimeLimiter,
  Spritesheet,
  SpritesheetLoader,
  TilingSprite,
  TilingSpriteRenderer,
  BitmapFont,
  BitmapFontData,
  BitmapFontLoader,
  BitmapText,
  TextFormat,
  XMLFormat,
  XMLStringFormat,
  autoDetectFormat,
  Ticker,
  TickerPlugin,
  get UPDATE_PRIORITY() {
    return UPDATE_PRIORITY;
  },
  Application,
  ResizePlugin,
  get ALPHA_MODES() {
    return ALPHA_MODES;
  },
  get BLEND_MODES() {
    return BLEND_MODES;
  },
  get BUFFER_BITS() {
    return BUFFER_BITS;
  },
  get BUFFER_TYPE() {
    return BUFFER_TYPE;
  },
  get CLEAR_MODES() {
    return CLEAR_MODES;
  },
  get COLOR_MASK_BITS() {
    return COLOR_MASK_BITS;
  },
  get DRAW_MODES() {
    return DRAW_MODES;
  },
  get ENV() {
    return ENV;
  },
  get FORMATS() {
    return FORMATS;
  },
  get GC_MODES() {
    return GC_MODES;
  },
  get MASK_TYPES() {
    return MASK_TYPES;
  },
  get MIPMAP_MODES() {
    return MIPMAP_MODES;
  },
  get MSAA_QUALITY() {
    return MSAA_QUALITY;
  },
  get PRECISION() {
    return PRECISION;
  },
  get RENDERER_TYPE() {
    return RENDERER_TYPE;
  },
  get SAMPLER_TYPES() {
    return SAMPLER_TYPES;
  },
  get SCALE_MODES() {
    return SCALE_MODES;
  },
  get TARGETS() {
    return TARGETS;
  },
  get TYPES() {
    return TYPES;
  },
  get WRAP_MODES() {
    return WRAP_MODES;
  },
  Bounds,
  Container,
  DisplayObject,
  TemporaryDisplayObject,
  FillStyle,
  GRAPHICS_CURVES,
  Graphics,
  GraphicsData,
  GraphicsGeometry,
  get LINE_CAP() {
    return LINE_CAP;
  },
  get LINE_JOIN() {
    return LINE_JOIN;
  },
  LineStyle,
  graphicsUtils,
  Circle,
  DEG_TO_RAD,
  Ellipse,
  Matrix,
  ObservablePoint,
  PI_2,
  Point,
  Polygon: Polygon$1,
  RAD_TO_DEG,
  Rectangle,
  RoundedRectangle,
  get SHAPES() {
    return SHAPES;
  },
  Transform,
  groupD8,
  Mesh,
  MeshBatchUvs,
  MeshGeometry,
  MeshMaterial,
  NineSlicePlane,
  PlaneGeometry,
  RopeGeometry,
  SimpleMesh,
  SimplePlane,
  SimpleRope,
  Runner,
  Sprite: Sprite$1,
  AnimatedSprite,
  get TEXT_GRADIENT() {
    return TEXT_GRADIENT;
  },
  Text: Text$1,
  TextMetrics,
  TextStyle,
  BrowserAdapter,
  isMobile,
  settings
}, Symbol.toStringTag, { value: "Module" }));
class PixiEngine {
  constructor(id = "bilza", width = 600, height = 300, backgroundColor = 13882323) {
    __publicField(this, "app");
    skipHello();
    this.app = new Application({
      width,
      height,
      antialias: true
    });
    this.app.stage.interactive = true;
    this.app.renderer.backgroundColor = backgroundColor;
    const cont = document.getElementById(id);
    if (cont == null) {
      throw new Error("container not found");
    }
    cont.appendChild(this.app.view);
    window.onload = async () => {
      resizeCanvas(this.app);
    };
  }
  backgroundColor(backgroundColor) {
    this.app.renderer.backgroundColor = backgroundColor;
  }
  getApp() {
    return this.app;
  }
  add(comp) {
    this.app.stage.addChild(comp);
  }
  getTexture(textureName) {
    const r = this.app.loader.resources[textureName].texture;
    if (r == null) {
      throw new Error("texture not found");
    }
    return r;
  }
  destroy() {
    while (this.app.stage.children[0]) {
      this.app.stage.removeChild(
        this.app.stage.children[0]
      );
    }
  }
  totalComps() {
    return this.app.stage.children.length;
  }
  canvasWidth() {
    return this.app.renderer.width;
  }
  canvasHeight() {
    return this.app.renderer.height;
  }
  stageWidth() {
    return this.app.stage.width;
  }
  stageHeight() {
    return this.app.stage.height;
  }
}
function resizeCanvas(app) {
  const resize = () => {
    app.renderer.resize(app.renderer.width, app.renderer.height);
  };
  window.addEventListener("resize", resize);
  resize();
}
let RootComp$1 = class RootComp {
  constructor(pixiObj2) {
    __publicField(this, "id");
    __publicField(this, "pixiObj");
    this.id = Math.random().toString(36).slice(2);
    this.pixiObj = pixiObj2;
  }
  set x(x) {
    this.pixiObj.x = x;
  }
  get x() {
    return this.pixiObj.x;
  }
  set y(y) {
    this.pixiObj.y = y;
  }
  get y() {
    return this.pixiObj.y;
  }
  set color(color2) {
    this.pixiObj.tint = color2;
  }
  get color() {
    return this.pixiObj.tint;
  }
  set opacity(opacity) {
    this.pixiObj.alpha = opacity;
  }
  get opacity() {
    return this.pixiObj.alpha;
  }
};
class BoxComp extends RootComp$1 {
  constructor(pixiObj2) {
    super(pixiObj2);
    __publicField(this, "orignalX");
    __publicField(this, "orignalY");
    this.orignalX = 0;
    this.orignalY = 0;
  }
  set x(x) {
    this.orignalX = x;
    this.pixiObj.x = this.orignalX + this.pixiObj.pivot.x;
  }
  get x() {
    return this.orignalX;
  }
  set y(y) {
    this.orignalY = y;
    this.pixiObj.y = this.orignalY + this.pixiObj.pivot.y;
  }
  get y() {
    return this.orignalY;
  }
  set width(width) {
    this.pixiObj.width = width;
  }
  get width() {
    return this.pixiObj.width;
  }
  set height(height) {
    this.pixiObj.height = height;
  }
  get height() {
    return this.pixiObj.height;
  }
  set angle(angle) {
    this.pixiObj.angle = angle;
  }
  get angle() {
    return this.pixiObj.angle;
  }
  set pivotX(x) {
    this.pixiObj.x = 0;
    this.pixiObj.pivot.x = x;
    this.pixiObj.x = this.orignalX + this.pixiObj.pivot.x;
  }
  get pivotX() {
    return this.pixiObj.pivot.x;
  }
  set pivotY(y) {
    this.pixiObj.y = 0;
    this.pixiObj.pivot.y = y;
    this.pixiObj.y = this.orignalY + this.pixiObj.pivot.y;
  }
  get pivotY() {
    return this.pixiObj.pivot.y;
  }
  pivotXAlign(x) {
    const sum = this.zeroFiftyHundred(x, this.width);
    this.pivotX = 0;
    this.pivotX = sum;
    return this.pivotX;
  }
  pivotYAlign(y) {
    const sum = this.zeroFiftyHundred(y, this.height);
    this.pivotY = 0;
    this.pivotY = sum;
    return this.pivotY;
  }
  zeroFiftyHundred(offset, widthHeight) {
    let ret = 0;
    switch (offset) {
      case 0:
        ret = 0;
        break;
      case 1:
        ret = widthHeight / 2;
        break;
      case 2:
        ret = widthHeight;
        break;
    }
    return ret;
  }
}
const pixiObj = new Graphics();
class BoxGraphComp extends BoxComp {
  constructor() {
    super(pixiObj);
    __publicField(this, "pixiObj", new Graphics());
  }
}
let Rect$2 = class Rect extends BoxGraphComp {
  constructor(width, height) {
    super();
    this.init(width, height);
  }
  init(width, height) {
    this.pixiObj.beginFill(16777215);
    this.pixiObj.drawRect(
      0,
      0,
      width,
      height
    );
    this.pixiObj.endFill();
  }
};
let Rect$1 = class Rect2 extends BoxGraphComp {
  constructor(diameter) {
    super();
    this.init(diameter);
  }
  init(width) {
    this.pixiObj.beginFill(16777215);
    this.pixiObj.drawCircle(0, 0, width / 2);
    this.pixiObj.endFill();
  }
  set width(width) {
    this.pixiObj.width = width;
    this.pixiObj.height = width;
  }
  get width() {
    return this.pixiObj.width;
  }
  set height(height) {
  }
  get height() {
    return this.pixiObj.width;
  }
};
class Rect3 extends BoxGraphComp {
  constructor(width, height) {
    super();
    this.init(width, height);
  }
  init(width, height) {
    this.pixiObj.beginFill(16777215);
    this.pixiObj.drawEllipse(0, 0, width, height);
    this.pixiObj.endFill();
  }
}
class Line extends BoxGraphComp {
  constructor(x1, y1, x2, y2, color2 = 0, lineWidth = 1) {
    super();
    __publicField(this, "_x1");
    __publicField(this, "_y1");
    __publicField(this, "_x2");
    __publicField(this, "_y2");
    __publicField(this, "_lineWidth");
    this._x1 = x1;
    this._y1 = y1;
    this._x2 = x2;
    this._y2 = y2;
    this.color = color2;
    this._lineWidth = lineWidth;
    this.init();
  }
  init() {
    this.pixiObj.clear();
    this.pixiObj.lineStyle(this._lineWidth, this.color);
    this.pixiObj.moveTo(this._x1, this._y1);
    this.pixiObj.lineTo(this._x2, this._y2);
  }
  set x1(x1) {
    this._x1 = x1;
    this.init();
  }
  get x1() {
    return this._x1;
  }
  set y1(y1) {
    this._y1 = y1;
    this.init();
  }
  get y1() {
    return this._y1;
  }
  set x2(x2) {
    this._x2 = x2;
    this.init();
  }
  get x2() {
    return this._x2;
  }
  set y2(y2) {
    this._y2 = y2;
    this.init();
  }
  get y2() {
    return this._y2;
  }
  set lineWidth(lineWidth) {
    this._lineWidth = lineWidth;
    this.init();
  }
  get lineWidth() {
    return this._lineWidth;
  }
}
class Polygon extends BoxGraphComp {
  constructor() {
    super();
    __publicField(this, "points");
    this.points = [];
  }
  init() {
    if (this.points.length < 6) {
      throw new Error("a polygon needs atleast 6 points to draw");
    }
    this.pixiObj.beginFill(this.color);
    this.pixiObj.drawPolygon(this.points);
    this.pixiObj.endFill();
  }
  addPoint(x, y) {
    this.points.push(x);
    this.points.push(y);
  }
}
class RoundRect extends BoxGraphComp {
  constructor(width, height, radius = 10) {
    super();
    __publicField(this, "_width");
    __publicField(this, "_height");
    __publicField(this, "_radius");
    this._width = width;
    this._height = height;
    this._radius = radius;
    this.init();
  }
  init() {
    this.pixiObj.clear();
    this.pixiObj.beginFill(16777215);
    this.pixiObj.drawRoundedRect(
      0,
      0,
      this._width,
      this._height,
      this._radius
    );
    this.pixiObj.endFill();
  }
  set radius(radius) {
    this._radius = radius;
    this.init();
  }
  get radius() {
    return this._radius;
  }
}
class RootComp2 {
  constructor() {
    __publicField(this, "id");
    this.id = Math.random().toString(36).slice(2);
  }
}
class Text extends RootComp2 {
  constructor(content, color2, fontSize = 24) {
    super();
    __publicField(this, "style");
    __publicField(this, "pixiObj");
    this.style = new TextStyle();
    this.style.fontSize = fontSize;
    this.style.lineHeight = 28;
    this.style.letterSpacing = 0;
    this.style.fill = 16777215;
    this.style.align = "center";
    this.pixiObj = new Text$1(content, this.style);
    this.pixiObj.x = 0;
    this.pixiObj.y = 0;
    this.pixiObj.tint = color2;
  }
  set x(x) {
    this.pixiObj.x = x;
  }
  get x() {
    return this.pixiObj.x;
  }
  set y(y) {
    this.pixiObj.y = y;
  }
  get y() {
    return this.pixiObj.y;
  }
  set color(color2) {
    this.pixiObj.tint = color2;
  }
  get color() {
    return this.pixiObj.tint;
  }
  set opacity(opacity) {
    this.pixiObj.alpha = opacity;
  }
  get opacity() {
    return this.pixiObj.alpha;
  }
  set width(width) {
    this.pixiObj.width = width;
  }
  get width() {
    return this.pixiObj.width;
  }
  set height(height) {
    this.pixiObj.height = height;
  }
  get height() {
    return this.pixiObj.height;
  }
  set angle(angle) {
    this.pixiObj.angle = angle;
  }
  get angle() {
    return this.pixiObj.angle;
  }
  set text(text) {
    this.pixiObj.text = text;
  }
  get text() {
    return this.pixiObj.text;
  }
}
function ___$insertStyle(css2) {
  if (!css2) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }
  var style = document.createElement("style");
  style.setAttribute("type", "text/css");
  style.innerHTML = css2;
  document.head.appendChild(style);
  return css2;
}
function colorToString(color2, forceCSSHex) {
  var colorFormat = color2.__state.conversionName.toString();
  var r = Math.round(color2.r);
  var g = Math.round(color2.g);
  var b = Math.round(color2.b);
  var a = color2.a;
  var h = Math.round(color2.h);
  var s = color2.s.toFixed(1);
  var v = color2.v.toFixed(1);
  if (forceCSSHex || colorFormat === "THREE_CHAR_HEX" || colorFormat === "SIX_CHAR_HEX") {
    var str = color2.hex.toString(16);
    while (str.length < 6) {
      str = "0" + str;
    }
    return "#" + str;
  } else if (colorFormat === "CSS_RGB") {
    return "rgb(" + r + "," + g + "," + b + ")";
  } else if (colorFormat === "CSS_RGBA") {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  } else if (colorFormat === "HEX") {
    return "0x" + color2.hex.toString(16);
  } else if (colorFormat === "RGB_ARRAY") {
    return "[" + r + "," + g + "," + b + "]";
  } else if (colorFormat === "RGBA_ARRAY") {
    return "[" + r + "," + g + "," + b + "," + a + "]";
  } else if (colorFormat === "RGB_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + "}";
  } else if (colorFormat === "RGBA_OBJ") {
    return "{r:" + r + ",g:" + g + ",b:" + b + ",a:" + a + "}";
  } else if (colorFormat === "HSV_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + "}";
  } else if (colorFormat === "HSVA_OBJ") {
    return "{h:" + h + ",s:" + s + ",v:" + v + ",a:" + a + "}";
  }
  return "unknown format";
}
var ARR_EACH = Array.prototype.forEach;
var ARR_SLICE = Array.prototype.slice;
var Common = {
  BREAK: {},
  extend: function extend(target) {
    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function(key) {
        if (!this.isUndefined(obj[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  defaults: function defaults(target) {
    this.each(ARR_SLICE.call(arguments, 1), function(obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function(key) {
        if (this.isUndefined(target[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  compose: function compose() {
    var toCall = ARR_SLICE.call(arguments);
    return function() {
      var args = ARR_SLICE.call(arguments);
      for (var i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },
  each: function each(obj, itr, scope) {
    if (!obj) {
      return;
    }
    if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      var key = void 0;
      var l = void 0;
      for (key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (var _key in obj) {
        if (itr.call(scope, obj[_key], _key) === this.BREAK) {
          return;
        }
      }
    }
  },
  defer: function defer(fnc) {
    setTimeout(fnc, 0);
  },
  debounce: function debounce(func, threshold, callImmediately) {
    var timeout = void 0;
    return function() {
      var obj = this;
      var args = arguments;
      function delayed() {
        timeout = null;
        if (!callImmediately)
          func.apply(obj, args);
      }
      var callNow = callImmediately || !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(delayed, threshold);
      if (callNow) {
        func.apply(obj, args);
      }
    };
  },
  toArray: function toArray(obj) {
    if (obj.toArray)
      return obj.toArray();
    return ARR_SLICE.call(obj);
  },
  isUndefined: function isUndefined(obj) {
    return obj === void 0;
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isNaN: function(_isNaN) {
    function isNaN2(_x) {
      return _isNaN.apply(this, arguments);
    }
    isNaN2.toString = function() {
      return _isNaN.toString();
    };
    return isNaN2;
  }(function(obj) {
    return isNaN(obj);
  }),
  isArray: Array.isArray || function(obj) {
    return obj.constructor === Array;
  },
  isObject: function isObject(obj) {
    return obj === Object(obj);
  },
  isNumber: function isNumber(obj) {
    return obj === obj + 0;
  },
  isString: function isString(obj) {
    return obj === obj + "";
  },
  isBoolean: function isBoolean(obj) {
    return obj === false || obj === true;
  },
  isFunction: function isFunction(obj) {
    return obj instanceof Function;
  }
};
var INTERPRETATIONS = [
  {
    litmus: Common.isString,
    conversions: {
      THREE_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) {
            return false;
          }
          return {
            space: "HEX",
            hex: parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
          };
        },
        write: colorToString
      },
      SIX_CHAR_HEX: {
        read: function read2(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) {
            return false;
          }
          return {
            space: "HEX",
            hex: parseInt("0x" + test[1].toString(), 0)
          };
        },
        write: colorToString
      },
      CSS_RGB: {
        read: function read3(original) {
          var test = original.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: "RGB",
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },
        write: colorToString
      },
      CSS_RGBA: {
        read: function read4(original) {
          var test = original.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: "RGB",
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },
        write: colorToString
      }
    }
  },
  {
    litmus: Common.isNumber,
    conversions: {
      HEX: {
        read: function read5(original) {
          return {
            space: "HEX",
            hex: original,
            conversionName: "HEX"
          };
        },
        write: function write(color2) {
          return color2.hex;
        }
      }
    }
  },
  {
    litmus: Common.isArray,
    conversions: {
      RGB_ARRAY: {
        read: function read6(original) {
          if (original.length !== 3) {
            return false;
          }
          return {
            space: "RGB",
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },
        write: function write2(color2) {
          return [color2.r, color2.g, color2.b];
        }
      },
      RGBA_ARRAY: {
        read: function read7(original) {
          if (original.length !== 4)
            return false;
          return {
            space: "RGB",
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },
        write: function write3(color2) {
          return [color2.r, color2.g, color2.b, color2.a];
        }
      }
    }
  },
  {
    litmus: Common.isObject,
    conversions: {
      RGBA_OBJ: {
        read: function read8(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
            return {
              space: "RGB",
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }
          return false;
        },
        write: function write4(color2) {
          return {
            r: color2.r,
            g: color2.g,
            b: color2.b,
            a: color2.a
          };
        }
      },
      RGB_OBJ: {
        read: function read9(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
            return {
              space: "RGB",
              r: original.r,
              g: original.g,
              b: original.b
            };
          }
          return false;
        },
        write: function write5(color2) {
          return {
            r: color2.r,
            g: color2.g,
            b: color2.b
          };
        }
      },
      HSVA_OBJ: {
        read: function read10(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
            return {
              space: "HSV",
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }
          return false;
        },
        write: function write6(color2) {
          return {
            h: color2.h,
            s: color2.s,
            v: color2.v,
            a: color2.a
          };
        }
      },
      HSV_OBJ: {
        read: function read11(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
            return {
              space: "HSV",
              h: original.h,
              s: original.s,
              v: original.v
            };
          }
          return false;
        },
        write: function write7(color2) {
          return {
            h: color2.h,
            s: color2.s,
            v: color2.v
          };
        }
      }
    }
  }
];
var result = void 0;
var toReturn = void 0;
var interpret = function interpret2() {
  toReturn = false;
  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
  Common.each(INTERPRETATIONS, function(family) {
    if (family.litmus(original)) {
      Common.each(family.conversions, function(conversion, conversionName) {
        result = conversion.read(original);
        if (toReturn === false && result !== false) {
          toReturn = result;
          result.conversionName = conversionName;
          result.conversion = conversion;
          return Common.BREAK;
        }
      });
      return Common.BREAK;
    }
  });
  return toReturn;
};
var tmpComponent = void 0;
var ColorMath = {
  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
    return {
      r: c[0] * 255,
      g: c[1] * 255,
      b: c[2] * 255
    };
  },
  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h = void 0;
    var s = void 0;
    if (max !== 0) {
      s = delta / max;
    } else {
      return {
        h: NaN,
        s: 0,
        v: 0
      };
    }
    if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h /= 6;
    if (h < 0) {
      h += 1;
    }
    return {
      h: h * 360,
      s,
      v: max / 255
    };
  },
  rgb_to_hex: function rgb_to_hex(r, g, b) {
    var hex = this.hex_with_component(0, 2, r);
    hex = this.hex_with_component(hex, 1, g);
    hex = this.hex_with_component(hex, 0, b);
    return hex;
  },
  component_from_hex: function component_from_hex(hex, componentIndex) {
    return hex >> componentIndex * 8 & 255;
  },
  hex_with_component: function hex_with_component(hex, componentIndex, value) {
    return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
  }
};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
  return typeof obj;
} : function(obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};
var classCallCheck = function(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
var createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
var get = function get2(object, property, receiver) {
  if (object === null)
    object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);
  if (desc === void 0) {
    var parent = Object.getPrototypeOf(object);
    if (parent === null) {
      return void 0;
    } else {
      return get2(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === void 0) {
      return void 0;
    }
    return getter.call(receiver);
  }
};
var inherits = function(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};
var possibleConstructorReturn = function(self2, call) {
  if (!self2) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self2;
};
var Color = function() {
  function Color2() {
    classCallCheck(this, Color2);
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw new Error("Failed to interpret color arguments");
    }
    this.__state.a = this.__state.a || 1;
  }
  createClass(Color2, [{
    key: "toString",
    value: function toString() {
      return colorToString(this);
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      return colorToString(this, true);
    }
  }, {
    key: "toOriginal",
    value: function toOriginal() {
      return this.__state.conversion.write(this);
    }
  }]);
  return Color2;
}();
function defineRGBComponent(target, component, componentHexIndex) {
  Object.defineProperty(target, component, {
    get: function get$$13() {
      if (this.__state.space === "RGB") {
        return this.__state[component];
      }
      Color.recalculateRGB(this, component, componentHexIndex);
      return this.__state[component];
    },
    set: function set$$13(v) {
      if (this.__state.space !== "RGB") {
        Color.recalculateRGB(this, component, componentHexIndex);
        this.__state.space = "RGB";
      }
      this.__state[component] = v;
    }
  });
}
function defineHSVComponent(target, component) {
  Object.defineProperty(target, component, {
    get: function get$$13() {
      if (this.__state.space === "HSV") {
        return this.__state[component];
      }
      Color.recalculateHSV(this);
      return this.__state[component];
    },
    set: function set$$13(v) {
      if (this.__state.space !== "HSV") {
        Color.recalculateHSV(this);
        this.__state.space = "HSV";
      }
      this.__state[component] = v;
    }
  });
}
Color.recalculateRGB = function(color2, component, componentHexIndex) {
  if (color2.__state.space === "HEX") {
    color2.__state[component] = ColorMath.component_from_hex(color2.__state.hex, componentHexIndex);
  } else if (color2.__state.space === "HSV") {
    Common.extend(color2.__state, ColorMath.hsv_to_rgb(color2.__state.h, color2.__state.s, color2.__state.v));
  } else {
    throw new Error("Corrupted color state");
  }
};
Color.recalculateHSV = function(color2) {
  var result2 = ColorMath.rgb_to_hsv(color2.r, color2.g, color2.b);
  Common.extend(color2.__state, {
    s: result2.s,
    v: result2.v
  });
  if (!Common.isNaN(result2.h)) {
    color2.__state.h = result2.h;
  } else if (Common.isUndefined(color2.__state.h)) {
    color2.__state.h = 0;
  }
};
Color.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"];
defineRGBComponent(Color.prototype, "r", 2);
defineRGBComponent(Color.prototype, "g", 1);
defineRGBComponent(Color.prototype, "b", 0);
defineHSVComponent(Color.prototype, "h");
defineHSVComponent(Color.prototype, "s");
defineHSVComponent(Color.prototype, "v");
Object.defineProperty(Color.prototype, "a", {
  get: function get$$1() {
    return this.__state.a;
  },
  set: function set$$1(v) {
    this.__state.a = v;
  }
});
Object.defineProperty(Color.prototype, "hex", {
  get: function get$$12() {
    if (this.__state.space !== "HEX") {
      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      this.__state.space = "HEX";
    }
    return this.__state.hex;
  },
  set: function set$$12(v) {
    this.__state.space = "HEX";
    this.__state.hex = v;
  }
});
var Controller = function() {
  function Controller2(object, property) {
    classCallCheck(this, Controller2);
    this.initialValue = object[property];
    this.domElement = document.createElement("div");
    this.object = object;
    this.property = property;
    this.__onChange = void 0;
    this.__onFinishChange = void 0;
  }
  createClass(Controller2, [{
    key: "onChange",
    value: function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    }
  }, {
    key: "onFinishChange",
    value: function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    }
  }, {
    key: "setValue",
    value: function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return this.object[this.property];
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay2() {
      return this;
    }
  }, {
    key: "isModified",
    value: function isModified() {
      return this.initialValue !== this.getValue();
    }
  }]);
  return Controller2;
}();
var EVENT_MAP = {
  HTMLEvents: ["change"],
  MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover"],
  KeyboardEvents: ["keydown"]
};
var EVENT_MAP_INV = {};
Common.each(EVENT_MAP, function(v, k) {
  Common.each(v, function(e) {
    EVENT_MAP_INV[e] = k;
  });
});
var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
function cssValueToPixels(val) {
  if (val === "0" || Common.isUndefined(val)) {
    return 0;
  }
  var match = val.match(CSS_VALUE_PIXELS);
  if (!Common.isNull(match)) {
    return parseFloat(match[1]);
  }
  return 0;
}
var dom = {
  makeSelectable: function makeSelectable(elem, selectable) {
    if (elem === void 0 || elem.style === void 0)
      return;
    elem.onselectstart = selectable ? function() {
      return false;
    } : function() {
    };
    elem.style.MozUserSelect = selectable ? "auto" : "none";
    elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
    elem.unselectable = selectable ? "on" : "off";
  },
  makeFullscreen: function makeFullscreen(elem, hor, vert) {
    var vertical = vert;
    var horizontal = hor;
    if (Common.isUndefined(horizontal)) {
      horizontal = true;
    }
    if (Common.isUndefined(vertical)) {
      vertical = true;
    }
    elem.style.position = "absolute";
    if (horizontal) {
      elem.style.left = 0;
      elem.style.right = 0;
    }
    if (vertical) {
      elem.style.top = 0;
      elem.style.bottom = 0;
    }
  },
  fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
    var params = pars || {};
    var className = EVENT_MAP_INV[eventType];
    if (!className) {
      throw new Error("Event type " + eventType + " not supported.");
    }
    var evt = document.createEvent(className);
    switch (className) {
      case "MouseEvents": {
        var clientX = params.x || params.clientX || 0;
        var clientY = params.y || params.clientY || 0;
        evt.initMouseEvent(
          eventType,
          params.bubbles || false,
          params.cancelable || true,
          window,
          params.clickCount || 1,
          0,
          0,
          clientX,
          clientY,
          false,
          false,
          false,
          false,
          0,
          null
        );
        break;
      }
      case "KeyboardEvents": {
        var init2 = evt.initKeyboardEvent || evt.initKeyEvent;
        Common.defaults(params, {
          cancelable: true,
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
          keyCode: void 0,
          charCode: void 0
        });
        init2(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
        break;
      }
      default: {
        evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
        break;
      }
    }
    Common.defaults(evt, aux);
    elem.dispatchEvent(evt);
  },
  bind: function bind2(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.addEventListener) {
      elem.addEventListener(event, func, bool);
    } else if (elem.attachEvent) {
      elem.attachEvent("on" + event, func);
    }
    return dom;
  },
  unbind: function unbind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.removeEventListener) {
      elem.removeEventListener(event, func, bool);
    } else if (elem.detachEvent) {
      elem.detachEvent("on" + event, func);
    }
    return dom;
  },
  addClass: function addClass(elem, className) {
    if (elem.className === void 0) {
      elem.className = className;
    } else if (elem.className !== className) {
      var classes = elem.className.split(/ +/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
      }
    }
    return dom;
  },
  removeClass: function removeClass(elem, className) {
    if (className) {
      if (elem.className === className) {
        elem.removeAttribute("class");
      } else {
        var classes = elem.className.split(/ +/);
        var index2 = classes.indexOf(className);
        if (index2 !== -1) {
          classes.splice(index2, 1);
          elem.className = classes.join(" ");
        }
      }
    } else {
      elem.className = void 0;
    }
    return dom;
  },
  hasClass: function hasClass(elem, className) {
    return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
  },
  getWidth: function getWidth(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style["border-left-width"]) + cssValueToPixels(style["border-right-width"]) + cssValueToPixels(style["padding-left"]) + cssValueToPixels(style["padding-right"]) + cssValueToPixels(style.width);
  },
  getHeight: function getHeight(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style["border-top-width"]) + cssValueToPixels(style["border-bottom-width"]) + cssValueToPixels(style["padding-top"]) + cssValueToPixels(style["padding-bottom"]) + cssValueToPixels(style.height);
  },
  getOffset: function getOffset(el) {
    var elem = el;
    var offset = { left: 0, top: 0 };
    if (elem.offsetParent) {
      do {
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return offset;
  },
  isActive: function isActive(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  }
};
var BooleanController = function(_Controller) {
  inherits(BooleanController2, _Controller);
  function BooleanController2(object, property) {
    classCallCheck(this, BooleanController2);
    var _this2 = possibleConstructorReturn(this, (BooleanController2.__proto__ || Object.getPrototypeOf(BooleanController2)).call(this, object, property));
    var _this = _this2;
    _this2.__prev = _this2.getValue();
    _this2.__checkbox = document.createElement("input");
    _this2.__checkbox.setAttribute("type", "checkbox");
    function onChange() {
      _this.setValue(!_this.__prev);
    }
    dom.bind(_this2.__checkbox, "change", onChange, false);
    _this2.domElement.appendChild(_this2.__checkbox);
    _this2.updateDisplay();
    return _this2;
  }
  createClass(BooleanController2, [{
    key: "setValue",
    value: function setValue(v) {
      var toReturn2 = get(BooleanController2.prototype.__proto__ || Object.getPrototypeOf(BooleanController2.prototype), "setValue", this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn2;
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay2() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute("checked", "checked");
        this.__checkbox.checked = true;
        this.__prev = true;
      } else {
        this.__checkbox.checked = false;
        this.__prev = false;
      }
      return get(BooleanController2.prototype.__proto__ || Object.getPrototypeOf(BooleanController2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return BooleanController2;
}(Controller);
var OptionController = function(_Controller) {
  inherits(OptionController2, _Controller);
  function OptionController2(object, property, opts) {
    classCallCheck(this, OptionController2);
    var _this2 = possibleConstructorReturn(this, (OptionController2.__proto__ || Object.getPrototypeOf(OptionController2)).call(this, object, property));
    var options = opts;
    var _this = _this2;
    _this2.__select = document.createElement("select");
    if (Common.isArray(options)) {
      var map2 = {};
      Common.each(options, function(element) {
        map2[element] = element;
      });
      options = map2;
    }
    Common.each(options, function(value, key) {
      var opt = document.createElement("option");
      opt.innerHTML = key;
      opt.setAttribute("value", value);
      _this.__select.appendChild(opt);
    });
    _this2.updateDisplay();
    dom.bind(_this2.__select, "change", function() {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });
    _this2.domElement.appendChild(_this2.__select);
    return _this2;
  }
  createClass(OptionController2, [{
    key: "setValue",
    value: function setValue(v) {
      var toReturn2 = get(OptionController2.prototype.__proto__ || Object.getPrototypeOf(OptionController2.prototype), "setValue", this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn2;
    }
  }, {
    key: "updateDisplay",
    value: function updateDisplay2() {
      if (dom.isActive(this.__select))
        return this;
      this.__select.value = this.getValue();
      return get(OptionController2.prototype.__proto__ || Object.getPrototypeOf(OptionController2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return OptionController2;
}(Controller);
var StringController = function(_Controller) {
  inherits(StringController2, _Controller);
  function StringController2(object, property) {
    classCallCheck(this, StringController2);
    var _this2 = possibleConstructorReturn(this, (StringController2.__proto__ || Object.getPrototypeOf(StringController2)).call(this, object, property));
    var _this = _this2;
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "text");
    dom.bind(_this2.__input, "keyup", onChange);
    dom.bind(_this2.__input, "change", onChange);
    dom.bind(_this2.__input, "blur", onBlur);
    dom.bind(_this2.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(StringController2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return get(StringController2.prototype.__proto__ || Object.getPrototypeOf(StringController2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return StringController2;
}(Controller);
function numDecimals(x) {
  var _x = x.toString();
  if (_x.indexOf(".") > -1) {
    return _x.length - _x.indexOf(".") - 1;
  }
  return 0;
}
var NumberController = function(_Controller) {
  inherits(NumberController2, _Controller);
  function NumberController2(object, property, params) {
    classCallCheck(this, NumberController2);
    var _this = possibleConstructorReturn(this, (NumberController2.__proto__ || Object.getPrototypeOf(NumberController2)).call(this, object, property));
    var _params = params || {};
    _this.__min = _params.min;
    _this.__max = _params.max;
    _this.__step = _params.step;
    if (Common.isUndefined(_this.__step)) {
      if (_this.initialValue === 0) {
        _this.__impliedStep = 1;
      } else {
        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      _this.__impliedStep = _this.__step;
    }
    _this.__precision = numDecimals(_this.__impliedStep);
    return _this;
  }
  createClass(NumberController2, [{
    key: "setValue",
    value: function setValue(v) {
      var _v = v;
      if (this.__min !== void 0 && _v < this.__min) {
        _v = this.__min;
      } else if (this.__max !== void 0 && _v > this.__max) {
        _v = this.__max;
      }
      if (this.__step !== void 0 && _v % this.__step !== 0) {
        _v = Math.round(_v / this.__step) * this.__step;
      }
      return get(NumberController2.prototype.__proto__ || Object.getPrototypeOf(NumberController2.prototype), "setValue", this).call(this, _v);
    }
  }, {
    key: "min",
    value: function min(minValue) {
      this.__min = minValue;
      return this;
    }
  }, {
    key: "max",
    value: function max(maxValue) {
      this.__max = maxValue;
      return this;
    }
  }, {
    key: "step",
    value: function step(stepValue) {
      this.__step = stepValue;
      this.__impliedStep = stepValue;
      this.__precision = numDecimals(stepValue);
      return this;
    }
  }]);
  return NumberController2;
}(Controller);
function roundToDecimal(value, decimals) {
  var tenTo = Math.pow(10, decimals);
  return Math.round(value * tenTo) / tenTo;
}
var NumberControllerBox = function(_NumberController) {
  inherits(NumberControllerBox2, _NumberController);
  function NumberControllerBox2(object, property, params) {
    classCallCheck(this, NumberControllerBox2);
    var _this2 = possibleConstructorReturn(this, (NumberControllerBox2.__proto__ || Object.getPrototypeOf(NumberControllerBox2)).call(this, object, property, params));
    _this2.__truncationSuspended = false;
    var _this = _this2;
    var prevY = void 0;
    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!Common.isNaN(attempted)) {
        _this.setValue(attempted);
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onBlur() {
      onFinish();
    }
    function onMouseDrag(e) {
      var diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prevY = e.clientY;
    }
    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      onFinish();
    }
    function onMouseDown(e) {
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      prevY = e.clientY;
    }
    _this2.__input = document.createElement("input");
    _this2.__input.setAttribute("type", "text");
    dom.bind(_this2.__input, "change", onChange);
    dom.bind(_this2.__input, "blur", onBlur);
    dom.bind(_this2.__input, "mousedown", onMouseDown);
    dom.bind(_this2.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
        onFinish();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(NumberControllerBox2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
      return get(NumberControllerBox2.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return NumberControllerBox2;
}(NumberController);
function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}
var NumberControllerSlider = function(_NumberController) {
  inherits(NumberControllerSlider2, _NumberController);
  function NumberControllerSlider2(object, property, min, max, step) {
    classCallCheck(this, NumberControllerSlider2);
    var _this2 = possibleConstructorReturn(this, (NumberControllerSlider2.__proto__ || Object.getPrototypeOf(NumberControllerSlider2)).call(this, object, property, { min, max, step }));
    var _this = _this2;
    _this2.__background = document.createElement("div");
    _this2.__foreground = document.createElement("div");
    dom.bind(_this2.__background, "mousedown", onMouseDown);
    dom.bind(_this2.__background, "touchstart", onTouchStart);
    dom.addClass(_this2.__background, "slider");
    dom.addClass(_this2.__foreground, "slider-fg");
    function onMouseDown(e) {
      document.activeElement.blur();
      dom.bind(window, "mousemove", onMouseDrag);
      dom.bind(window, "mouseup", onMouseUp);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      e.preventDefault();
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      return false;
    }
    function onMouseUp() {
      dom.unbind(window, "mousemove", onMouseDrag);
      dom.unbind(window, "mouseup", onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }
      dom.bind(window, "touchmove", onTouchMove);
      dom.bind(window, "touchend", onTouchEnd);
      onTouchMove(e);
    }
    function onTouchMove(e) {
      var clientX = e.touches[0].clientX;
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
    }
    function onTouchEnd() {
      dom.unbind(window, "touchmove", onTouchMove);
      dom.unbind(window, "touchend", onTouchEnd);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    _this2.__background.appendChild(_this2.__foreground);
    _this2.domElement.appendChild(_this2.__background);
    return _this2;
  }
  createClass(NumberControllerSlider2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + "%";
      return get(NumberControllerSlider2.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider2.prototype), "updateDisplay", this).call(this);
    }
  }]);
  return NumberControllerSlider2;
}(NumberController);
var FunctionController = function(_Controller) {
  inherits(FunctionController2, _Controller);
  function FunctionController2(object, property, text) {
    classCallCheck(this, FunctionController2);
    var _this2 = possibleConstructorReturn(this, (FunctionController2.__proto__ || Object.getPrototypeOf(FunctionController2)).call(this, object, property));
    var _this = _this2;
    _this2.__button = document.createElement("div");
    _this2.__button.innerHTML = text === void 0 ? "Fire" : text;
    dom.bind(_this2.__button, "click", function(e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(_this2.__button, "button");
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  createClass(FunctionController2, [{
    key: "fire",
    value: function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    }
  }]);
  return FunctionController2;
}(Controller);
var ColorController = function(_Controller) {
  inherits(ColorController2, _Controller);
  function ColorController2(object, property) {
    classCallCheck(this, ColorController2);
    var _this2 = possibleConstructorReturn(this, (ColorController2.__proto__ || Object.getPrototypeOf(ColorController2)).call(this, object, property));
    _this2.__color = new Color(_this2.getValue());
    _this2.__temp = new Color(0);
    var _this = _this2;
    _this2.domElement = document.createElement("div");
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement("div");
    _this2.__selector.className = "selector";
    _this2.__saturation_field = document.createElement("div");
    _this2.__saturation_field.className = "saturation-field";
    _this2.__field_knob = document.createElement("div");
    _this2.__field_knob.className = "field-knob";
    _this2.__field_knob_border = "2px solid ";
    _this2.__hue_knob = document.createElement("div");
    _this2.__hue_knob.className = "hue-knob";
    _this2.__hue_field = document.createElement("div");
    _this2.__hue_field.className = "hue-field";
    _this2.__input = document.createElement("input");
    _this2.__input.type = "text";
    _this2.__input_textShadow = "0 1px 1px ";
    dom.bind(_this2.__input, "keydown", function(e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(_this2.__input, "blur", onBlur);
    dom.bind(_this2.__selector, "mousedown", function() {
      dom.addClass(this, "drag").bind(window, "mouseup", function() {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    dom.bind(_this2.__selector, "touchstart", function() {
      dom.addClass(this, "drag").bind(window, "touchend", function() {
        dom.removeClass(_this.__selector, "drag");
      });
    });
    var valueField = document.createElement("div");
    Common.extend(_this2.__selector.style, {
      width: "122px",
      height: "102px",
      padding: "3px",
      backgroundColor: "#222",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
    });
    Common.extend(_this2.__field_knob.style, {
      position: "absolute",
      width: "12px",
      height: "12px",
      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? "#fff" : "#000"),
      boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
      borderRadius: "12px",
      zIndex: 1
    });
    Common.extend(_this2.__hue_knob.style, {
      position: "absolute",
      width: "15px",
      height: "2px",
      borderRight: "4px solid #fff",
      zIndex: 1
    });
    Common.extend(_this2.__saturation_field.style, {
      width: "100px",
      height: "100px",
      border: "1px solid #555",
      marginRight: "3px",
      display: "inline-block",
      cursor: "pointer"
    });
    Common.extend(valueField.style, {
      width: "100%",
      height: "100%",
      background: "none"
    });
    linearGradient(valueField, "top", "rgba(0,0,0,0)", "#000");
    Common.extend(_this2.__hue_field.style, {
      width: "15px",
      height: "100px",
      border: "1px solid #555",
      cursor: "ns-resize",
      position: "absolute",
      top: "3px",
      right: "3px"
    });
    hueGradient(_this2.__hue_field);
    Common.extend(_this2.__input.style, {
      outline: "none",
      textAlign: "center",
      color: "#fff",
      border: 0,
      fontWeight: "bold",
      textShadow: _this2.__input_textShadow + "rgba(0,0,0,0.7)"
    });
    dom.bind(_this2.__saturation_field, "mousedown", fieldDown);
    dom.bind(_this2.__saturation_field, "touchstart", fieldDown);
    dom.bind(_this2.__field_knob, "mousedown", fieldDown);
    dom.bind(_this2.__field_knob, "touchstart", fieldDown);
    dom.bind(_this2.__hue_field, "mousedown", fieldDownH);
    dom.bind(_this2.__hue_field, "touchstart", fieldDownH);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, "mousemove", setSV);
      dom.bind(window, "touchmove", setSV);
      dom.bind(window, "mouseup", fieldUpSV);
      dom.bind(window, "touchend", fieldUpSV);
    }
    function fieldDownH(e) {
      setH(e);
      dom.bind(window, "mousemove", setH);
      dom.bind(window, "touchmove", setH);
      dom.bind(window, "mouseup", fieldUpH);
      dom.bind(window, "touchend", fieldUpH);
    }
    function fieldUpSV() {
      dom.unbind(window, "mousemove", setSV);
      dom.unbind(window, "touchmove", setSV);
      dom.unbind(window, "mouseup", fieldUpSV);
      dom.unbind(window, "touchend", fieldUpSV);
      onFinish();
    }
    function fieldUpH() {
      dom.unbind(window, "mousemove", setH);
      dom.unbind(window, "touchmove", setH);
      dom.unbind(window, "mouseup", fieldUpH);
      dom.unbind(window, "touchend", fieldUpH);
      onFinish();
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
      }
    }
    _this2.__saturation_field.appendChild(valueField);
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.__selector.appendChild(_this2.__hue_field);
    _this2.__hue_field.appendChild(_this2.__hue_knob);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__saturation_field.getBoundingClientRect();
      var _ref = e.touches && e.touches[0] || e, clientX = _ref.clientX, clientY = _ref.clientY;
      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }
      if (s > 1) {
        s = 1;
      } else if (s < 0) {
        s = 0;
      }
      _this.__color.v = v;
      _this.__color.s = s;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    function setH(e) {
      if (e.type.indexOf("touch") === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__hue_field.getBoundingClientRect();
      var _ref2 = e.touches && e.touches[0] || e, clientY = _ref2.clientY;
      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    return _this2;
  }
  createClass(ColorController2, [{
    key: "updateDisplay",
    value: function updateDisplay2() {
      var i = interpret(this.getValue());
      if (i !== false) {
        var mismatch = false;
        Common.each(Color.COMPONENTS, function(component) {
          if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {};
          }
        }, this);
        if (mismatch) {
          Common.extend(this.__color.__state, i);
        }
      }
      Common.extend(this.__temp.__state, this.__color.__state);
      this.__temp.a = 1;
      var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
      var _flip = 255 - flip;
      Common.extend(this.__field_knob.style, {
        marginLeft: 100 * this.__color.s - 7 + "px",
        marginTop: 100 * (1 - this.__color.v) - 7 + "px",
        backgroundColor: this.__temp.toHexString(),
        border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toHexString());
      this.__input.value = this.__color.toString();
      Common.extend(this.__input.style, {
        backgroundColor: this.__color.toHexString(),
        color: "rgb(" + flip + "," + flip + "," + flip + ")",
        textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
      });
    }
  }]);
  return ColorController2;
}(Controller);
var vendors = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
function linearGradient(elem, x, a, b) {
  elem.style.background = "";
  Common.each(vendors, function(vendor) {
    elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
  });
}
function hueGradient(elem) {
  elem.style.background = "";
  elem.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
  elem.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
  elem.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
}
var css = {
  load: function load(url2, indoc) {
    var doc = indoc || document;
    var link = doc.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url2;
    doc.getElementsByTagName("head")[0].appendChild(link);
  },
  inject: function inject(cssContent, indoc) {
    var doc = indoc || document;
    var injected = document.createElement("style");
    injected.type = "text/css";
    injected.innerHTML = cssContent;
    var head = doc.getElementsByTagName("head")[0];
    try {
      head.appendChild(injected);
    } catch (e) {
    }
  }
};
var saveDialogContents = `<div id="dg-save" class="dg dialogue">

  Here's the new load parameter for your <code>GUI</code>'s constructor:

  <textarea id="dg-new-constructor"></textarea>

  <div id="dg-save-locally">

    <input id="dg-local-storage" type="checkbox"/> Automatically save
    values to <code>localStorage</code> on exit.

    <div id="dg-local-explain">The values saved to <code>localStorage</code> will
      override those passed to <code>dat.GUI</code>'s constructor. This makes it
      easier to work incrementally, but <code>localStorage</code> is fragile,
      and your friends may not see the same values you do.

    </div>

  </div>

</div>`;
var ControllerFactory = function ControllerFactory2(object, property) {
  var initialValue = object[property];
  if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
    return new OptionController(object, property, arguments[2]);
  }
  if (Common.isNumber(initialValue)) {
    if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
      }
      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
    }
    if (Common.isNumber(arguments[4])) {
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
    }
    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
  }
  if (Common.isString(initialValue)) {
    return new StringController(object, property);
  }
  if (Common.isFunction(initialValue)) {
    return new FunctionController(object, property, "");
  }
  if (Common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }
  return null;
};
function requestAnimationFrame$1(callback) {
  setTimeout(callback, 1e3 / 60);
}
var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;
var CenteredDiv = function() {
  function CenteredDiv2() {
    classCallCheck(this, CenteredDiv2);
    this.backgroundElement = document.createElement("div");
    Common.extend(this.backgroundElement.style, {
      backgroundColor: "rgba(0,0,0,0.8)",
      top: 0,
      left: 0,
      display: "none",
      zIndex: "1000",
      opacity: 0,
      WebkitTransition: "opacity 0.2s linear",
      transition: "opacity 0.2s linear"
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = "fixed";
    this.domElement = document.createElement("div");
    Common.extend(this.domElement.style, {
      position: "fixed",
      display: "none",
      zIndex: "1001",
      opacity: 0,
      WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear",
      transition: "transform 0.2s ease-out, opacity 0.2s linear"
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, "click", function() {
      _this.hide();
    });
  }
  createClass(CenteredDiv2, [{
    key: "show",
    value: function show2() {
      var _this = this;
      this.backgroundElement.style.display = "block";
      this.domElement.style.display = "block";
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = "scale(1.1)";
      this.layout();
      Common.defer(function() {
        _this.backgroundElement.style.opacity = 1;
        _this.domElement.style.opacity = 1;
        _this.domElement.style.webkitTransform = "scale(1)";
      });
    }
  }, {
    key: "hide",
    value: function hide3() {
      var _this = this;
      var hide4 = function hide5() {
        _this.domElement.style.display = "none";
        _this.backgroundElement.style.display = "none";
        dom.unbind(_this.domElement, "webkitTransitionEnd", hide5);
        dom.unbind(_this.domElement, "transitionend", hide5);
        dom.unbind(_this.domElement, "oTransitionEnd", hide5);
      };
      dom.bind(this.domElement, "webkitTransitionEnd", hide4);
      dom.bind(this.domElement, "transitionend", hide4);
      dom.bind(this.domElement, "oTransitionEnd", hide4);
      this.backgroundElement.style.opacity = 0;
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = "scale(1.1)";
    }
  }, {
    key: "layout",
    value: function layout() {
      this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
      this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
    }
  }]);
  return CenteredDiv2;
}();
var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .cr.function .property-name{width:100%}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");
css.inject(styleSheet);
var CSS_NAMESPACE = "dg";
var HIDE_KEY_CODE = 72;
var CLOSE_BUTTON_HEIGHT = 20;
var DEFAULT_DEFAULT_PRESET_NAME = "Default";
var SUPPORTS_LOCAL_STORAGE = function() {
  try {
    return !!window.localStorage;
  } catch (e) {
    return false;
  }
}();
var SAVE_DIALOGUE = void 0;
var autoPlaceVirgin = true;
var autoPlaceContainer = void 0;
var hide = false;
var hideableGuis = [];
var GUI = function GUI2(pars) {
  var _this = this;
  var params = pars || {};
  this.domElement = document.createElement("div");
  this.__ul = document.createElement("ul");
  this.domElement.appendChild(this.__ul);
  dom.addClass(this.domElement, CSS_NAMESPACE);
  this.__folders = {};
  this.__controllers = [];
  this.__rememberedObjects = [];
  this.__rememberedObjectIndecesToControllers = [];
  this.__listening = [];
  params = Common.defaults(params, {
    closeOnTop: false,
    autoPlace: true,
    width: GUI2.DEFAULT_WIDTH
  });
  params = Common.defaults(params, {
    resizable: params.autoPlace,
    hideable: params.autoPlace
  });
  if (!Common.isUndefined(params.load)) {
    if (params.preset) {
      params.load.preset = params.preset;
    }
  } else {
    params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
  }
  if (Common.isUndefined(params.parent) && params.hideable) {
    hideableGuis.push(this);
  }
  params.resizable = Common.isUndefined(params.parent) && params.resizable;
  if (params.autoPlace && Common.isUndefined(params.scrollable)) {
    params.scrollable = true;
  }
  var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
  var saveToLocalStorage = void 0;
  var titleRow = void 0;
  Object.defineProperties(
    this,
    {
      parent: {
        get: function get$$13() {
          return params.parent;
        }
      },
      scrollable: {
        get: function get$$13() {
          return params.scrollable;
        }
      },
      autoPlace: {
        get: function get$$13() {
          return params.autoPlace;
        }
      },
      closeOnTop: {
        get: function get$$13() {
          return params.closeOnTop;
        }
      },
      preset: {
        get: function get$$13() {
          if (_this.parent) {
            return _this.getRoot().preset;
          }
          return params.load.preset;
        },
        set: function set$$13(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        }
      },
      width: {
        get: function get$$13() {
          return params.width;
        },
        set: function set$$13(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },
      name: {
        get: function get$$13() {
          return params.name;
        },
        set: function set$$13(v) {
          params.name = v;
          if (titleRow) {
            titleRow.innerHTML = params.name;
          }
        }
      },
      closed: {
        get: function get$$13() {
          return params.closed;
        },
        set: function set$$13(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI2.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI2.CLASS_CLOSED);
          }
          this.onResize();
          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI2.TEXT_OPEN : GUI2.TEXT_CLOSED;
          }
        }
      },
      load: {
        get: function get$$13() {
          return params.load;
        }
      },
      useLocalStorage: {
        get: function get$$13() {
          return useLocalStorage;
        },
        set: function set$$13(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            useLocalStorage = bool;
            if (bool) {
              dom.bind(window, "unload", saveToLocalStorage);
            } else {
              dom.unbind(window, "unload", saveToLocalStorage);
            }
            localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
          }
        }
      }
    }
  );
  if (Common.isUndefined(params.parent)) {
    this.closed = params.closed || false;
    dom.addClass(this.domElement, GUI2.CLASS_MAIN);
    dom.makeSelectable(this.domElement, false);
    if (SUPPORTS_LOCAL_STORAGE) {
      if (useLocalStorage) {
        _this.useLocalStorage = true;
        var savedGui = localStorage.getItem(getLocalStorageHash(this, "gui"));
        if (savedGui) {
          params.load = JSON.parse(savedGui);
        }
      }
    }
    this.__closeButton = document.createElement("div");
    this.__closeButton.innerHTML = GUI2.TEXT_CLOSED;
    dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_BUTTON);
    if (params.closeOnTop) {
      dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_TOP);
      this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
    } else {
      dom.addClass(this.__closeButton, GUI2.CLASS_CLOSE_BOTTOM);
      this.domElement.appendChild(this.__closeButton);
    }
    dom.bind(this.__closeButton, "click", function() {
      _this.closed = !_this.closed;
    });
  } else {
    if (params.closed === void 0) {
      params.closed = true;
    }
    var titleRowName = document.createTextNode(params.name);
    dom.addClass(titleRowName, "controller-name");
    titleRow = addRow(_this, titleRowName);
    var onClickTitle = function onClickTitle2(e) {
      e.preventDefault();
      _this.closed = !_this.closed;
      return false;
    };
    dom.addClass(this.__ul, GUI2.CLASS_CLOSED);
    dom.addClass(titleRow, "title");
    dom.bind(titleRow, "click", onClickTitle);
    if (!params.closed) {
      this.closed = false;
    }
  }
  if (params.autoPlace) {
    if (Common.isUndefined(params.parent)) {
      if (autoPlaceVirgin) {
        autoPlaceContainer = document.createElement("div");
        dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
        dom.addClass(autoPlaceContainer, GUI2.CLASS_AUTO_PLACE_CONTAINER);
        document.body.appendChild(autoPlaceContainer);
        autoPlaceVirgin = false;
      }
      autoPlaceContainer.appendChild(this.domElement);
      dom.addClass(this.domElement, GUI2.CLASS_AUTO_PLACE);
    }
    if (!this.parent) {
      setWidth(_this, params.width);
    }
  }
  this.__resizeHandler = function() {
    _this.onResizeDebounced();
  };
  dom.bind(window, "resize", this.__resizeHandler);
  dom.bind(this.__ul, "webkitTransitionEnd", this.__resizeHandler);
  dom.bind(this.__ul, "transitionend", this.__resizeHandler);
  dom.bind(this.__ul, "oTransitionEnd", this.__resizeHandler);
  this.onResize();
  if (params.resizable) {
    addResizeHandle(this);
  }
  saveToLocalStorage = function saveToLocalStorage2() {
    if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
      localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
    }
  };
  this.saveToLocalStorageIfPossible = saveToLocalStorage;
  function resetWidth() {
    var root = _this.getRoot();
    root.width += 1;
    Common.defer(function() {
      root.width -= 1;
    });
  }
  if (!params.parent) {
    resetWidth();
  }
};
GUI.toggleHide = function() {
  hide = !hide;
  Common.each(hideableGuis, function(gui2) {
    gui2.domElement.style.display = hide ? "none" : "";
  });
};
GUI.CLASS_AUTO_PLACE = "a";
GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
GUI.CLASS_MAIN = "main";
GUI.CLASS_CONTROLLER_ROW = "cr";
GUI.CLASS_TOO_TALL = "taller-than-window";
GUI.CLASS_CLOSED = "closed";
GUI.CLASS_CLOSE_BUTTON = "close-button";
GUI.CLASS_CLOSE_TOP = "close-top";
GUI.CLASS_CLOSE_BOTTOM = "close-bottom";
GUI.CLASS_DRAG = "drag";
GUI.DEFAULT_WIDTH = 245;
GUI.TEXT_CLOSED = "Close Controls";
GUI.TEXT_OPEN = "Open Controls";
GUI._keydownHandler = function(e) {
  if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
    GUI.toggleHide();
  }
};
dom.bind(window, "keydown", GUI._keydownHandler, false);
Common.extend(
  GUI.prototype,
  {
    add: function add2(object, property) {
      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2)
      });
    },
    addColor: function addColor(object, property) {
      return _add(this, object, property, {
        color: true
      });
    },
    remove: function remove(controller) {
      this.__ul.removeChild(controller.__li);
      this.__controllers.splice(this.__controllers.indexOf(controller), 1);
      var _this = this;
      Common.defer(function() {
        _this.onResize();
      });
    },
    destroy: function destroy() {
      if (this.parent) {
        throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");
      }
      if (this.autoPlace) {
        autoPlaceContainer.removeChild(this.domElement);
      }
      var _this = this;
      Common.each(this.__folders, function(subfolder) {
        _this.removeFolder(subfolder);
      });
      dom.unbind(window, "keydown", GUI._keydownHandler, false);
      removeListeners(this);
    },
    addFolder: function addFolder(name) {
      if (this.__folders[name] !== void 0) {
        throw new Error('You already have a folder in this GUI by the name "' + name + '"');
      }
      var newGuiParams = { name, parent: this };
      newGuiParams.autoPlace = this.autoPlace;
      if (this.load && this.load.folders && this.load.folders[name]) {
        newGuiParams.closed = this.load.folders[name].closed;
        newGuiParams.load = this.load.folders[name];
      }
      var gui2 = new GUI(newGuiParams);
      this.__folders[name] = gui2;
      var li = addRow(this, gui2.domElement);
      dom.addClass(li, "folder");
      return gui2;
    },
    removeFolder: function removeFolder(folder) {
      this.__ul.removeChild(folder.domElement.parentElement);
      delete this.__folders[folder.name];
      if (this.load && this.load.folders && this.load.folders[folder.name]) {
        delete this.load.folders[folder.name];
      }
      removeListeners(folder);
      var _this = this;
      Common.each(folder.__folders, function(subfolder) {
        folder.removeFolder(subfolder);
      });
      Common.defer(function() {
        _this.onResize();
      });
    },
    open: function open() {
      this.closed = false;
    },
    close: function close() {
      this.closed = true;
    },
    hide: function hide2() {
      this.domElement.style.display = "none";
    },
    show: function show() {
      this.domElement.style.display = "";
    },
    onResize: function onResize() {
      var root = this.getRoot();
      if (root.scrollable) {
        var top = dom.getOffset(root.__ul).top;
        var h = 0;
        Common.each(root.__ul.childNodes, function(node) {
          if (!(root.autoPlace && node === root.__save_row)) {
            h += dom.getHeight(node);
          }
        });
        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = "auto";
        }
      }
      if (root.__resize_handle) {
        Common.defer(function() {
          root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
        });
      }
      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + "px";
      }
    },
    onResizeDebounced: Common.debounce(function() {
      this.onResize();
    }, 50),
    remember: function remember() {
      if (Common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
      }
      if (this.parent) {
        throw new Error("You can only call remember on a top level GUI.");
      }
      var _this = this;
      Common.each(Array.prototype.slice.call(arguments), function(object) {
        if (_this.__rememberedObjects.length === 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) === -1) {
          _this.__rememberedObjects.push(object);
        }
      });
      if (this.autoPlace) {
        setWidth(this, this.width);
      }
    },
    getRoot: function getRoot() {
      var gui2 = this;
      while (gui2.parent) {
        gui2 = gui2.parent;
      }
      return gui2;
    },
    getSaveObject: function getSaveObject() {
      var toReturn2 = this.load;
      toReturn2.closed = this.closed;
      if (this.__rememberedObjects.length > 0) {
        toReturn2.preset = this.preset;
        if (!toReturn2.remembered) {
          toReturn2.remembered = {};
        }
        toReturn2.remembered[this.preset] = getCurrentPreset(this);
      }
      toReturn2.folders = {};
      Common.each(this.__folders, function(element, key) {
        toReturn2.folders[key] = element.getSaveObject();
      });
      return toReturn2;
    },
    save: function save() {
      if (!this.load.remembered) {
        this.load.remembered = {};
      }
      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
      this.saveToLocalStorageIfPossible();
    },
    saveAs: function saveAs(presetName) {
      if (!this.load.remembered) {
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }
      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
      this.saveToLocalStorageIfPossible();
    },
    revert: function revert(gui2) {
      Common.each(this.__controllers, function(controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui2 || this.getRoot(), controller);
        }
        if (controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
        }
      }, this);
      Common.each(this.__folders, function(folder) {
        folder.revert(folder);
      });
      if (!gui2) {
        markPresetModified(this.getRoot(), false);
      }
    },
    listen: function listen(controller) {
      var init2 = this.__listening.length === 0;
      this.__listening.push(controller);
      if (init2) {
        updateDisplays(this.__listening);
      }
    },
    updateDisplay: function updateDisplay() {
      Common.each(this.__controllers, function(controller) {
        controller.updateDisplay();
      });
      Common.each(this.__folders, function(folder) {
        folder.updateDisplay();
      });
    }
  }
);
function addRow(gui2, newDom, liBefore) {
  var li = document.createElement("li");
  if (newDom) {
    li.appendChild(newDom);
  }
  if (liBefore) {
    gui2.__ul.insertBefore(li, liBefore);
  } else {
    gui2.__ul.appendChild(li);
  }
  gui2.onResize();
  return li;
}
function removeListeners(gui2) {
  dom.unbind(window, "resize", gui2.__resizeHandler);
  if (gui2.saveToLocalStorageIfPossible) {
    dom.unbind(window, "unload", gui2.saveToLocalStorageIfPossible);
  }
}
function markPresetModified(gui2, modified) {
  var opt = gui2.__preset_select[gui2.__preset_select.selectedIndex];
  if (modified) {
    opt.innerHTML = opt.value + "*";
  } else {
    opt.innerHTML = opt.value;
  }
}
function augmentController(gui2, li, controller) {
  controller.__li = li;
  controller.__gui = gui2;
  Common.extend(controller, {
    options: function options(_options) {
      if (arguments.length > 1) {
        var nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui2, controller.object, controller.property, {
          before: nextSibling,
          factoryArgs: [Common.toArray(arguments)]
        });
      }
      if (Common.isArray(_options) || Common.isObject(_options)) {
        var _nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui2, controller.object, controller.property, {
          before: _nextSibling,
          factoryArgs: [_options]
        });
      }
    },
    name: function name(_name) {
      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
      return controller;
    },
    listen: function listen2() {
      controller.__gui.listen(controller);
      return controller;
    },
    remove: function remove2() {
      controller.__gui.remove(controller);
      return controller;
    }
  });
  if (controller instanceof NumberControllerSlider) {
    var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
    Common.each(["updateDisplay", "onChange", "onFinishChange", "step", "min", "max"], function(method) {
      var pc = controller[method];
      var pb = box[method];
      controller[method] = box[method] = function() {
        var args = Array.prototype.slice.call(arguments);
        pb.apply(box, args);
        return pc.apply(controller, args);
      };
    });
    dom.addClass(li, "has-slider");
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    var r = function r2(returned) {
      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
        controller.remove();
        var newController = _add(gui2, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step]
        });
        newController.name(oldName);
        if (wasListening)
          newController.listen();
        return newController;
      }
      return returned;
    };
    controller.min = Common.compose(r, controller.min);
    controller.max = Common.compose(r, controller.max);
  } else if (controller instanceof BooleanController) {
    dom.bind(li, "click", function() {
      dom.fakeEvent(controller.__checkbox, "click");
    });
    dom.bind(controller.__checkbox, "click", function(e) {
      e.stopPropagation();
    });
  } else if (controller instanceof FunctionController) {
    dom.bind(li, "click", function() {
      dom.fakeEvent(controller.__button, "click");
    });
    dom.bind(li, "mouseover", function() {
      dom.addClass(controller.__button, "hover");
    });
    dom.bind(li, "mouseout", function() {
      dom.removeClass(controller.__button, "hover");
    });
  } else if (controller instanceof ColorController) {
    dom.addClass(li, "color");
    controller.updateDisplay = Common.compose(function(val) {
      li.style.borderLeftColor = controller.__color.toString();
      return val;
    }, controller.updateDisplay);
    controller.updateDisplay();
  }
  controller.setValue = Common.compose(function(val) {
    if (gui2.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui2.getRoot(), true);
    }
    return val;
  }, controller.setValue);
}
function recallSavedValue(gui2, controller) {
  var root = gui2.getRoot();
  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
  if (matchedIndex !== -1) {
    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
    if (controllerMap === void 0) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }
    controllerMap[controller.property] = controller;
    if (root.load && root.load.remembered) {
      var presetMap = root.load.remembered;
      var preset = void 0;
      if (presetMap[gui2.preset]) {
        preset = presetMap[gui2.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        return;
      }
      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== void 0) {
        var value = preset[matchedIndex][controller.property];
        controller.initialValue = value;
        controller.setValue(value);
      }
    }
  }
}
function _add(gui2, object, property, params) {
  if (object[property] === void 0) {
    throw new Error('Object "' + object + '" has no property "' + property + '"');
  }
  var controller = void 0;
  if (params.color) {
    controller = new ColorController(object, property);
  } else {
    var factoryArgs = [object, property].concat(params.factoryArgs);
    controller = ControllerFactory.apply(gui2, factoryArgs);
  }
  if (params.before instanceof Controller) {
    params.before = params.before.__li;
  }
  recallSavedValue(gui2, controller);
  dom.addClass(controller.domElement, "c");
  var name = document.createElement("span");
  dom.addClass(name, "property-name");
  name.innerHTML = controller.property;
  var container = document.createElement("div");
  container.appendChild(name);
  container.appendChild(controller.domElement);
  var li = addRow(gui2, container, params.before);
  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
  if (controller instanceof ColorController) {
    dom.addClass(li, "color");
  } else {
    dom.addClass(li, _typeof(controller.getValue()));
  }
  augmentController(gui2, li, controller);
  gui2.__controllers.push(controller);
  return controller;
}
function getLocalStorageHash(gui2, key) {
  return document.location.href + "." + key;
}
function addPresetOption(gui2, name, setSelected) {
  var opt = document.createElement("option");
  opt.innerHTML = name;
  opt.value = name;
  gui2.__preset_select.appendChild(opt);
  if (setSelected) {
    gui2.__preset_select.selectedIndex = gui2.__preset_select.length - 1;
  }
}
function showHideExplain(gui2, explain) {
  explain.style.display = gui2.useLocalStorage ? "block" : "none";
}
function addSaveMenu(gui2) {
  var div = gui2.__save_row = document.createElement("li");
  dom.addClass(gui2.domElement, "has-save");
  gui2.__ul.insertBefore(div, gui2.__ul.firstChild);
  dom.addClass(div, "save-row");
  var gears = document.createElement("span");
  gears.innerHTML = "&nbsp;";
  dom.addClass(gears, "button gears");
  var button = document.createElement("span");
  button.innerHTML = "Save";
  dom.addClass(button, "button");
  dom.addClass(button, "save");
  var button2 = document.createElement("span");
  button2.innerHTML = "New";
  dom.addClass(button2, "button");
  dom.addClass(button2, "save-as");
  var button3 = document.createElement("span");
  button3.innerHTML = "Revert";
  dom.addClass(button3, "button");
  dom.addClass(button3, "revert");
  var select = gui2.__preset_select = document.createElement("select");
  if (gui2.load && gui2.load.remembered) {
    Common.each(gui2.load.remembered, function(value, key) {
      addPresetOption(gui2, key, key === gui2.preset);
    });
  } else {
    addPresetOption(gui2, DEFAULT_DEFAULT_PRESET_NAME, false);
  }
  dom.bind(select, "change", function() {
    for (var index2 = 0; index2 < gui2.__preset_select.length; index2++) {
      gui2.__preset_select[index2].innerHTML = gui2.__preset_select[index2].value;
    }
    gui2.preset = this.value;
  });
  div.appendChild(select);
  div.appendChild(gears);
  div.appendChild(button);
  div.appendChild(button2);
  div.appendChild(button3);
  if (SUPPORTS_LOCAL_STORAGE) {
    var explain = document.getElementById("dg-local-explain");
    var localStorageCheckBox = document.getElementById("dg-local-storage");
    var saveLocally = document.getElementById("dg-save-locally");
    saveLocally.style.display = "block";
    if (localStorage.getItem(getLocalStorageHash(gui2, "isLocal")) === "true") {
      localStorageCheckBox.setAttribute("checked", "checked");
    }
    showHideExplain(gui2, explain);
    dom.bind(localStorageCheckBox, "change", function() {
      gui2.useLocalStorage = !gui2.useLocalStorage;
      showHideExplain(gui2, explain);
    });
  }
  var newConstructorTextArea = document.getElementById("dg-new-constructor");
  dom.bind(newConstructorTextArea, "keydown", function(e) {
    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
      SAVE_DIALOGUE.hide();
    }
  });
  dom.bind(gears, "click", function() {
    newConstructorTextArea.innerHTML = JSON.stringify(gui2.getSaveObject(), void 0, 2);
    SAVE_DIALOGUE.show();
    newConstructorTextArea.focus();
    newConstructorTextArea.select();
  });
  dom.bind(button, "click", function() {
    gui2.save();
  });
  dom.bind(button2, "click", function() {
    var presetName = prompt("Enter a new preset name.");
    if (presetName) {
      gui2.saveAs(presetName);
    }
  });
  dom.bind(button3, "click", function() {
    gui2.revert();
  });
}
function addResizeHandle(gui2) {
  var pmouseX = void 0;
  gui2.__resize_handle = document.createElement("div");
  Common.extend(gui2.__resize_handle.style, {
    width: "6px",
    marginLeft: "-3px",
    height: "200px",
    cursor: "ew-resize",
    position: "absolute"
  });
  function drag(e) {
    e.preventDefault();
    gui2.width += pmouseX - e.clientX;
    gui2.onResize();
    pmouseX = e.clientX;
    return false;
  }
  function dragStop() {
    dom.removeClass(gui2.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, "mousemove", drag);
    dom.unbind(window, "mouseup", dragStop);
  }
  function dragStart(e) {
    e.preventDefault();
    pmouseX = e.clientX;
    dom.addClass(gui2.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, "mousemove", drag);
    dom.bind(window, "mouseup", dragStop);
    return false;
  }
  dom.bind(gui2.__resize_handle, "mousedown", dragStart);
  dom.bind(gui2.__closeButton, "mousedown", dragStart);
  gui2.domElement.insertBefore(gui2.__resize_handle, gui2.domElement.firstElementChild);
}
function setWidth(gui2, w) {
  gui2.domElement.style.width = w + "px";
  if (gui2.__save_row && gui2.autoPlace) {
    gui2.__save_row.style.width = w + "px";
  }
  if (gui2.__closeButton) {
    gui2.__closeButton.style.width = w + "px";
  }
}
function getCurrentPreset(gui2, useInitialValues) {
  var toReturn2 = {};
  Common.each(gui2.__rememberedObjects, function(val, index2) {
    var savedValues = {};
    var controllerMap = gui2.__rememberedObjectIndecesToControllers[index2];
    Common.each(controllerMap, function(controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });
    toReturn2[index2] = savedValues;
  });
  return toReturn2;
}
function setPresetSelectIndex(gui2) {
  for (var index2 = 0; index2 < gui2.__preset_select.length; index2++) {
    if (gui2.__preset_select[index2].value === gui2.preset) {
      gui2.__preset_select.selectedIndex = index2;
    }
  }
}
function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame$1$1.call(window, function() {
      updateDisplays(controllerArray);
    });
  }
  Common.each(controllerArray, function(c) {
    c.updateDisplay();
  });
}
var color = {
  Color,
  math: ColorMath,
  interpret
};
var controllers = {
  Controller,
  BooleanController,
  OptionController,
  StringController,
  NumberController,
  NumberControllerBox,
  NumberControllerSlider,
  FunctionController,
  ColorController
};
var dom$1 = { dom };
var gui = { GUI };
var GUI$1 = GUI;
var index = {
  color,
  controllers,
  dom: dom$1,
  gui,
  GUI: GUI$1
};
const dat_gui_module = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  color,
  controllers,
  dom: dom$1,
  gui,
  GUI: GUI$1,
  default: index
}, Symbol.toStringTag, { value: "Module" }));
class BoxCompSprite extends BoxComp {
  constructor(texture) {
    const pObj = new Sprite$1(texture);
    super(pObj);
  }
}
class Sprite extends BoxCompSprite {
  constructor(texture) {
    super(texture);
  }
}
export {
  Rect$1 as Circle,
  Rect3 as Ellipse,
  Line,
  pixi as Pixi,
  PixiEngine,
  Polygon,
  Rect$2 as Rect,
  RoundRect,
  Sprite,
  Text,
  dat_gui_module as dat
};
