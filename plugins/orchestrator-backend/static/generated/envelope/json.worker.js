(() => {
  var e = {
      93: (e, t, n) => {
        'use strict';
        var r = n(907),
          i = n(364);
        function o(e) {
          return (
            (o =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            o(e)
          );
        }
        function s(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            (r.enumerable = r.enumerable || !1),
              (r.configurable = !0),
              'value' in r && (r.writable = !0),
              Object.defineProperty(
                e,
                ((i = r.key),
                (s = void 0),
                (s = (function (e, t) {
                  if ('object' !== o(e) || null === e) return e;
                  var n = e[Symbol.toPrimitive];
                  if (void 0 !== n) {
                    var r = n.call(e, t || 'default');
                    if ('object' !== o(r)) return r;
                    throw new TypeError(
                      '@@toPrimitive must return a primitive value.',
                    );
                  }
                  return ('string' === t ? String : Number)(e);
                })(i, 'string')),
                'symbol' === o(s) ? s : String(s)),
                r,
              );
          }
          var i, s;
        }
        function a(e, t, n) {
          return (
            t && s(e.prototype, t),
            n && s(e, n),
            Object.defineProperty(e, 'prototype', { writable: !1 }),
            e
          );
        }
        var l,
          u,
          c = n(342).codes,
          h = c.ERR_AMBIGUOUS_ARGUMENT,
          f = c.ERR_INVALID_ARG_TYPE,
          d = c.ERR_INVALID_ARG_VALUE,
          g = c.ERR_INVALID_RETURN_VALUE,
          m = c.ERR_MISSING_ARGS,
          p = n(801),
          y = n(208).inspect,
          b = n(208).types,
          v = b.isPromise,
          w = b.isRegExp,
          S = n(225)(),
          _ = n(937)(),
          C = n(818)('RegExp.prototype.test');
        new Map();
        function E() {
          var e = n(656);
          (l = e.isDeepEqual), (u = e.isDeepStrictEqual);
        }
        var A = !1,
          x = (e.exports = k),
          N = {};
        function L(e) {
          if (e.message instanceof Error) throw e.message;
          throw new p(e);
        }
        function O(e, t, n, r) {
          if (!n) {
            var i = !1;
            if (0 === t)
              (i = !0), (r = 'No value argument passed to `assert.ok()`');
            else if (r instanceof Error) throw r;
            var o = new p({
              actual: n,
              expected: !0,
              message: r,
              operator: '==',
              stackStartFn: e,
            });
            throw ((o.generatedMessage = i), o);
          }
        }
        function k() {
          for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
            t[n] = arguments[n];
          O.apply(void 0, [k, t.length].concat(t));
        }
        (x.fail = function e(t, n, o, s, a) {
          var l,
            u = arguments.length;
          if (0 === u) l = 'Failed';
          else if (1 === u) (o = t), (t = void 0);
          else {
            if (!1 === A)
              (A = !0),
                (r.emitWarning ? r.emitWarning : i.warn.bind(i))(
                  'assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.',
                  'DeprecationWarning',
                  'DEP0094',
                );
            2 === u && (s = '!=');
          }
          if (o instanceof Error) throw o;
          var c = {
            actual: t,
            expected: n,
            operator: void 0 === s ? 'fail' : s,
            stackStartFn: a || e,
          };
          void 0 !== o && (c.message = o);
          var h = new p(c);
          throw (l && ((h.message = l), (h.generatedMessage = !0)), h);
        }),
          (x.AssertionError = p),
          (x.ok = k),
          (x.equal = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            t != n &&
              L({
                actual: t,
                expected: n,
                message: r,
                operator: '==',
                stackStartFn: e,
              });
          }),
          (x.notEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            t == n &&
              L({
                actual: t,
                expected: n,
                message: r,
                operator: '!=',
                stackStartFn: e,
              });
          }),
          (x.deepEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            void 0 === l && E(),
              l(t, n) ||
                L({
                  actual: t,
                  expected: n,
                  message: r,
                  operator: 'deepEqual',
                  stackStartFn: e,
                });
          }),
          (x.notDeepEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            void 0 === l && E(),
              l(t, n) &&
                L({
                  actual: t,
                  expected: n,
                  message: r,
                  operator: 'notDeepEqual',
                  stackStartFn: e,
                });
          }),
          (x.deepStrictEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            void 0 === l && E(),
              u(t, n) ||
                L({
                  actual: t,
                  expected: n,
                  message: r,
                  operator: 'deepStrictEqual',
                  stackStartFn: e,
                });
          }),
          (x.notDeepStrictEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            void 0 === l && E();
            u(t, n) &&
              L({
                actual: t,
                expected: n,
                message: r,
                operator: 'notDeepStrictEqual',
                stackStartFn: e,
              });
          }),
          (x.strictEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            _(t, n) ||
              L({
                actual: t,
                expected: n,
                message: r,
                operator: 'strictEqual',
                stackStartFn: e,
              });
          }),
          (x.notStrictEqual = function e(t, n, r) {
            if (arguments.length < 2) throw new m('actual', 'expected');
            _(t, n) &&
              L({
                actual: t,
                expected: n,
                message: r,
                operator: 'notStrictEqual',
                stackStartFn: e,
              });
          });
        var R = a(function e(t, n, r) {
          var i = this;
          !(function (e, t) {
            if (!(e instanceof t))
              throw new TypeError('Cannot call a class as a function');
          })(this, e),
            n.forEach(function (e) {
              e in t &&
                (void 0 !== r &&
                'string' == typeof r[e] &&
                w(t[e]) &&
                C(t[e], r[e])
                  ? (i[e] = r[e])
                  : (i[e] = t[e]));
            });
        });
        function T(e, t, n, r) {
          if ('function' != typeof t) {
            if (w(t)) return C(t, e);
            if (2 === arguments.length)
              throw new f('expected', ['Function', 'RegExp'], t);
            if ('object' !== o(e) || null === e) {
              var i = new p({
                actual: e,
                expected: t,
                message: n,
                operator: 'deepStrictEqual',
                stackStartFn: r,
              });
              throw ((i.operator = r.name), i);
            }
            var s = Object.keys(t);
            if (t instanceof Error) s.push('name', 'message');
            else if (0 === s.length)
              throw new d('error', t, 'may not be an empty object');
            return (
              void 0 === l && E(),
              s.forEach(function (i) {
                ('string' == typeof e[i] && w(t[i]) && C(t[i], e[i])) ||
                  (function (e, t, n, r, i, o) {
                    if (!(n in e) || !u(e[n], t[n])) {
                      if (!r) {
                        var s = new R(e, i),
                          a = new R(t, i, e),
                          l = new p({
                            actual: s,
                            expected: a,
                            operator: 'deepStrictEqual',
                            stackStartFn: o,
                          });
                        throw (
                          ((l.actual = e),
                          (l.expected = t),
                          (l.operator = o.name),
                          l)
                        );
                      }
                      L({
                        actual: e,
                        expected: t,
                        message: r,
                        operator: o.name,
                        stackStartFn: o,
                      });
                    }
                  })(e, t, i, n, s, r);
              }),
              !0
            );
          }
          return (
            (void 0 !== t.prototype && e instanceof t) ||
            (!Error.isPrototypeOf(t) && !0 === t.call({}, e))
          );
        }
        function M(e) {
          if ('function' != typeof e) throw new f('fn', 'Function', e);
          try {
            e();
          } catch (e) {
            return e;
          }
          return N;
        }
        function P(e) {
          return (
            v(e) ||
            (null !== e &&
              'object' === o(e) &&
              'function' == typeof e.then &&
              'function' == typeof e.catch)
          );
        }
        function I(e) {
          return Promise.resolve().then(function () {
            var t;
            if ('function' == typeof e) {
              if (!P((t = e())))
                throw new g('instance of Promise', 'promiseFn', t);
            } else {
              if (!P(e)) throw new f('promiseFn', ['Function', 'Promise'], e);
              t = e;
            }
            return Promise.resolve()
              .then(function () {
                return t;
              })
              .then(function () {
                return N;
              })
              .catch(function (e) {
                return e;
              });
          });
        }
        function j(e, t, n, r) {
          if ('string' == typeof n) {
            if (4 === arguments.length)
              throw new f(
                'error',
                ['Object', 'Error', 'Function', 'RegExp'],
                n,
              );
            if ('object' === o(t) && null !== t) {
              if (t.message === n)
                throw new h(
                  'error/message',
                  'The error message "'.concat(
                    t.message,
                    '" is identical to the message.',
                  ),
                );
            } else if (t === n)
              throw new h(
                'error/message',
                'The error "'.concat(t, '" is identical to the message.'),
              );
            (r = n), (n = void 0);
          } else if (null != n && 'object' !== o(n) && 'function' != typeof n)
            throw new f('error', ['Object', 'Error', 'Function', 'RegExp'], n);
          if (t === N) {
            var i = '';
            n && n.name && (i += ' ('.concat(n.name, ')')),
              (i += r ? ': '.concat(r) : '.');
            var s = 'rejects' === e.name ? 'rejection' : 'exception';
            L({
              actual: void 0,
              expected: n,
              operator: e.name,
              message: 'Missing expected '.concat(s).concat(i),
              stackStartFn: e,
            });
          }
          if (n && !T(t, n, r, e)) throw t;
        }
        function F(e, t, n, r) {
          if (t !== N) {
            if (
              ('string' == typeof n && ((r = n), (n = void 0)), !n || T(t, n))
            ) {
              var i = r ? ': '.concat(r) : '.',
                o = 'doesNotReject' === e.name ? 'rejection' : 'exception';
              L({
                actual: t,
                expected: n,
                operator: e.name,
                message:
                  'Got unwanted '.concat(o).concat(i, '\n') +
                  'Actual message: "'.concat(t && t.message, '"'),
                stackStartFn: e,
              });
            }
            throw t;
          }
        }
        function D(e, t, n, r, i) {
          if (!w(t)) throw new f('regexp', 'RegExp', t);
          var s = 'match' === i;
          if ('string' != typeof e || C(t, e) !== s) {
            if (n instanceof Error) throw n;
            var a = !n;
            n =
              n ||
              ('string' != typeof e
                ? 'The "string" argument must be of type string. Received type ' +
                  ''.concat(o(e), ' (').concat(y(e), ')')
                : (s
                    ? 'The input did not match the regular expression '
                    : 'The input was expected to not match the regular expression ') +
                  ''.concat(y(t), '. Input:\n\n').concat(y(e), '\n'));
            var l = new p({
              actual: e,
              expected: t,
              message: n,
              operator: i,
              stackStartFn: r,
            });
            throw ((l.generatedMessage = a), l);
          }
        }
        function V() {
          for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
            t[n] = arguments[n];
          O.apply(void 0, [V, t.length].concat(t));
        }
        (x.throws = function e(t) {
          for (
            var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1;
            i < n;
            i++
          )
            r[i - 1] = arguments[i];
          j.apply(void 0, [e, M(t)].concat(r));
        }),
          (x.rejects = function e(t) {
            for (
              var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1;
              i < n;
              i++
            )
              r[i - 1] = arguments[i];
            return I(t).then(function (t) {
              return j.apply(void 0, [e, t].concat(r));
            });
          }),
          (x.doesNotThrow = function e(t) {
            for (
              var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1;
              i < n;
              i++
            )
              r[i - 1] = arguments[i];
            F.apply(void 0, [e, M(t)].concat(r));
          }),
          (x.doesNotReject = function e(t) {
            for (
              var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), i = 1;
              i < n;
              i++
            )
              r[i - 1] = arguments[i];
            return I(t).then(function (t) {
              return F.apply(void 0, [e, t].concat(r));
            });
          }),
          (x.ifError = function e(t) {
            if (null != t) {
              var n = 'ifError got unwanted exception: ';
              'object' === o(t) && 'string' == typeof t.message
                ? 0 === t.message.length && t.constructor
                  ? (n += t.constructor.name)
                  : (n += t.message)
                : (n += y(t));
              var r = new p({
                  actual: t,
                  expected: null,
                  operator: 'ifError',
                  message: n,
                  stackStartFn: e,
                }),
                i = t.stack;
              if ('string' == typeof i) {
                var s = i.split('\n');
                s.shift();
                for (var a = r.stack.split('\n'), l = 0; l < s.length; l++) {
                  var u = a.indexOf(s[l]);
                  if (-1 !== u) {
                    a = a.slice(0, u);
                    break;
                  }
                }
                r.stack = ''.concat(a.join('\n'), '\n').concat(s.join('\n'));
              }
              throw r;
            }
          }),
          (x.match = function e(t, n, r) {
            D(t, n, r, e, 'match');
          }),
          (x.doesNotMatch = function e(t, n, r) {
            D(t, n, r, e, 'doesNotMatch');
          }),
          (x.strict = S(V, x, {
            equal: x.strictEqual,
            deepEqual: x.deepStrictEqual,
            notEqual: x.notStrictEqual,
            notDeepEqual: x.notDeepStrictEqual,
          })),
          (x.strict.strict = x.strict);
      },
      801: (e, t, n) => {
        'use strict';
        var r = n(907);
        function i(e, t) {
          var n = Object.keys(e);
          if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t &&
              (r = r.filter(function (t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
              n.push.apply(n, r);
          }
          return n;
        }
        function o(e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? i(Object(n), !0).forEach(function (t) {
                  s(e, t, n[t]);
                })
              : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
              : i(Object(n)).forEach(function (t) {
                  Object.defineProperty(
                    e,
                    t,
                    Object.getOwnPropertyDescriptor(n, t),
                  );
                });
          }
          return e;
        }
        function s(e, t, n) {
          return (
            (t = l(t)) in e
              ? Object.defineProperty(e, t, {
                  value: n,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[t] = n),
            e
          );
        }
        function a(e, t) {
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            (r.enumerable = r.enumerable || !1),
              (r.configurable = !0),
              'value' in r && (r.writable = !0),
              Object.defineProperty(e, l(r.key), r);
          }
        }
        function l(e) {
          var t = (function (e, t) {
            if ('object' !== p(e) || null === e) return e;
            var n = e[Symbol.toPrimitive];
            if (void 0 !== n) {
              var r = n.call(e, t || 'default');
              if ('object' !== p(r)) return r;
              throw new TypeError(
                '@@toPrimitive must return a primitive value.',
              );
            }
            return ('string' === t ? String : Number)(e);
          })(e, 'string');
          return 'symbol' === p(t) ? t : String(t);
        }
        function u(e, t) {
          if (t && ('object' === p(t) || 'function' == typeof t)) return t;
          if (void 0 !== t)
            throw new TypeError(
              'Derived constructors may only return object or undefined',
            );
          return c(e);
        }
        function c(e) {
          if (void 0 === e)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called",
            );
          return e;
        }
        function h(e) {
          var t = 'function' == typeof Map ? new Map() : void 0;
          return (
            (h = function (e) {
              if (
                null === e ||
                ((n = e),
                -1 === Function.toString.call(n).indexOf('[native code]'))
              )
                return e;
              var n;
              if ('function' != typeof e)
                throw new TypeError(
                  'Super expression must either be null or a function',
                );
              if (void 0 !== t) {
                if (t.has(e)) return t.get(e);
                t.set(e, r);
              }
              function r() {
                return f(e, arguments, m(this).constructor);
              }
              return (
                (r.prototype = Object.create(e.prototype, {
                  constructor: {
                    value: r,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0,
                  },
                })),
                g(r, e)
              );
            }),
            h(e)
          );
        }
        function f(e, t, n) {
          return (
            (f = d()
              ? Reflect.construct.bind()
              : function (e, t, n) {
                  var r = [null];
                  r.push.apply(r, t);
                  var i = new (Function.bind.apply(e, r))();
                  return n && g(i, n.prototype), i;
                }),
            f.apply(null, arguments)
          );
        }
        function d() {
          if ('undefined' == typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ('function' == typeof Proxy) return !0;
          try {
            return (
              Boolean.prototype.valueOf.call(
                Reflect.construct(Boolean, [], function () {}),
              ),
              !0
            );
          } catch (e) {
            return !1;
          }
        }
        function g(e, t) {
          return (
            (g = Object.setPrototypeOf
              ? Object.setPrototypeOf.bind()
              : function (e, t) {
                  return (e.__proto__ = t), e;
                }),
            g(e, t)
          );
        }
        function m(e) {
          return (
            (m = Object.setPrototypeOf
              ? Object.getPrototypeOf.bind()
              : function (e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                }),
            m(e)
          );
        }
        function p(e) {
          return (
            (p =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            p(e)
          );
        }
        var y = n(208).inspect,
          b = n(342).codes.ERR_INVALID_ARG_TYPE;
        function v(e, t, n) {
          return (
            (void 0 === n || n > e.length) && (n = e.length),
            e.substring(n - t.length, n) === t
          );
        }
        var w = '',
          S = '',
          _ = '',
          C = '',
          E = {
            deepStrictEqual: 'Expected values to be strictly deep-equal:',
            strictEqual: 'Expected values to be strictly equal:',
            strictEqualObject:
              'Expected "actual" to be reference-equal to "expected":',
            deepEqual: 'Expected values to be loosely deep-equal:',
            equal: 'Expected values to be loosely equal:',
            notDeepStrictEqual:
              'Expected "actual" not to be strictly deep-equal to:',
            notStrictEqual: 'Expected "actual" to be strictly unequal to:',
            notStrictEqualObject:
              'Expected "actual" not to be reference-equal to "expected":',
            notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
            notEqual: 'Expected "actual" to be loosely unequal to:',
            notIdentical: 'Values identical but not reference-equal:',
          };
        function A(e) {
          var t = Object.keys(e),
            n = Object.create(Object.getPrototypeOf(e));
          return (
            t.forEach(function (t) {
              n[t] = e[t];
            }),
            Object.defineProperty(n, 'message', { value: e.message }),
            n
          );
        }
        function x(e) {
          return y(e, {
            compact: !1,
            customInspect: !1,
            depth: 1e3,
            maxArrayLength: 1 / 0,
            showHidden: !1,
            breakLength: 1 / 0,
            showProxy: !1,
            sorted: !0,
            getters: !0,
          });
        }
        function N(e, t, n) {
          var i = '',
            o = '',
            s = 0,
            a = '',
            l = !1,
            u = x(e),
            c = u.split('\n'),
            h = x(t).split('\n'),
            f = 0,
            d = '';
          if (
            ('strictEqual' === n &&
              'object' === p(e) &&
              'object' === p(t) &&
              null !== e &&
              null !== t &&
              (n = 'strictEqualObject'),
            1 === c.length && 1 === h.length && c[0] !== h[0])
          ) {
            var g = c[0].length + h[0].length;
            if (g <= 10) {
              if (
                !(
                  ('object' === p(e) && null !== e) ||
                  ('object' === p(t) && null !== t) ||
                  (0 === e && 0 === t)
                )
              )
                return (
                  ''.concat(E[n], '\n\n') +
                  ''.concat(c[0], ' !== ').concat(h[0], '\n')
                );
            } else if ('strictEqualObject' !== n) {
              if (g < (r.stderr && r.stderr.isTTY ? r.stderr.columns : 80)) {
                for (; c[0][f] === h[0][f]; ) f++;
                f > 2 &&
                  ((d = '\n  '.concat(
                    (function (e, t) {
                      if (((t = Math.floor(t)), 0 == e.length || 0 == t))
                        return '';
                      var n = e.length * t;
                      for (t = Math.floor(Math.log(t) / Math.log(2)); t; )
                        (e += e), t--;
                      return e + e.substring(0, n - e.length);
                    })(' ', f),
                    '^',
                  )),
                  (f = 0));
              }
            }
          }
          for (
            var m = c[c.length - 1], y = h[h.length - 1];
            m === y &&
            (f++ < 2 ? (a = '\n  '.concat(m).concat(a)) : (i = m),
            c.pop(),
            h.pop(),
            0 !== c.length && 0 !== h.length);

          )
            (m = c[c.length - 1]), (y = h[h.length - 1]);
          var b = Math.max(c.length, h.length);
          if (0 === b) {
            var A = u.split('\n');
            if (A.length > 30)
              for (A[26] = ''.concat(w, '...').concat(C); A.length > 27; )
                A.pop();
            return ''.concat(E.notIdentical, '\n\n').concat(A.join('\n'), '\n');
          }
          f > 3 && ((a = '\n'.concat(w, '...').concat(C).concat(a)), (l = !0)),
            '' !== i && ((a = '\n  '.concat(i).concat(a)), (i = ''));
          var N = 0,
            L =
              E[n] +
              '\n'
                .concat(S, '+ actual')
                .concat(C, ' ')
                .concat(_, '- expected')
                .concat(C),
            O = ' '.concat(w, '...').concat(C, ' Lines skipped');
          for (f = 0; f < b; f++) {
            var k = f - s;
            if (c.length < f + 1)
              k > 1 &&
                f > 2 &&
                (k > 4
                  ? ((o += '\n'.concat(w, '...').concat(C)), (l = !0))
                  : k > 3 && ((o += '\n  '.concat(h[f - 2])), N++),
                (o += '\n  '.concat(h[f - 1])),
                N++),
                (s = f),
                (i += '\n'.concat(_, '-').concat(C, ' ').concat(h[f])),
                N++;
            else if (h.length < f + 1)
              k > 1 &&
                f > 2 &&
                (k > 4
                  ? ((o += '\n'.concat(w, '...').concat(C)), (l = !0))
                  : k > 3 && ((o += '\n  '.concat(c[f - 2])), N++),
                (o += '\n  '.concat(c[f - 1])),
                N++),
                (s = f),
                (o += '\n'.concat(S, '+').concat(C, ' ').concat(c[f])),
                N++;
            else {
              var R = h[f],
                T = c[f],
                M = T !== R && (!v(T, ',') || T.slice(0, -1) !== R);
              M && v(R, ',') && R.slice(0, -1) === T && ((M = !1), (T += ',')),
                M
                  ? (k > 1 &&
                      f > 2 &&
                      (k > 4
                        ? ((o += '\n'.concat(w, '...').concat(C)), (l = !0))
                        : k > 3 && ((o += '\n  '.concat(c[f - 2])), N++),
                      (o += '\n  '.concat(c[f - 1])),
                      N++),
                    (s = f),
                    (o += '\n'.concat(S, '+').concat(C, ' ').concat(T)),
                    (i += '\n'.concat(_, '-').concat(C, ' ').concat(R)),
                    (N += 2))
                  : ((o += i),
                    (i = ''),
                    (1 !== k && 0 !== f) || ((o += '\n  '.concat(T)), N++));
            }
            if (N > 20 && f < b - 2)
              return (
                ''
                  .concat(L)
                  .concat(O, '\n')
                  .concat(o, '\n')
                  .concat(w, '...')
                  .concat(C)
                  .concat(i, '\n') + ''.concat(w, '...').concat(C)
              );
          }
          return ''
            .concat(L)
            .concat(l ? O : '', '\n')
            .concat(o)
            .concat(i)
            .concat(a)
            .concat(d);
        }
        var L = (function (e, t) {
          !(function (e, t) {
            if ('function' != typeof t && null !== t)
              throw new TypeError(
                'Super expression must either be null or a function',
              );
            (e.prototype = Object.create(t && t.prototype, {
              constructor: { value: e, writable: !0, configurable: !0 },
            })),
              Object.defineProperty(e, 'prototype', { writable: !1 }),
              t && g(e, t);
          })(v, e);
          var n,
            i,
            s,
            l,
            h,
            f =
              ((n = v),
              (i = d()),
              function () {
                var e,
                  t = m(n);
                if (i) {
                  var r = m(this).constructor;
                  e = Reflect.construct(t, arguments, r);
                } else e = t.apply(this, arguments);
                return u(this, e);
              });
          function v(e) {
            var t;
            if (
              ((function (e, t) {
                if (!(e instanceof t))
                  throw new TypeError('Cannot call a class as a function');
              })(this, v),
              'object' !== p(e) || null === e)
            )
              throw new b('options', 'Object', e);
            var n = e.message,
              i = e.operator,
              o = e.stackStartFn,
              s = e.actual,
              a = e.expected,
              l = Error.stackTraceLimit;
            if (((Error.stackTraceLimit = 0), null != n))
              t = f.call(this, String(n));
            else if (
              (r.stderr &&
                r.stderr.isTTY &&
                (r.stderr &&
                r.stderr.getColorDepth &&
                1 !== r.stderr.getColorDepth()
                  ? ((w = '[34m'), (S = '[32m'), (C = '[39m'), (_ = '[31m'))
                  : ((w = ''), (S = ''), (C = ''), (_ = ''))),
              'object' === p(s) &&
                null !== s &&
                'object' === p(a) &&
                null !== a &&
                'stack' in s &&
                s instanceof Error &&
                'stack' in a &&
                a instanceof Error &&
                ((s = A(s)), (a = A(a))),
              'deepStrictEqual' === i || 'strictEqual' === i)
            )
              t = f.call(this, N(s, a, i));
            else if ('notDeepStrictEqual' === i || 'notStrictEqual' === i) {
              var h = E[i],
                d = x(s).split('\n');
              if (
                ('notStrictEqual' === i &&
                  'object' === p(s) &&
                  null !== s &&
                  (h = E.notStrictEqualObject),
                d.length > 30)
              )
                for (d[26] = ''.concat(w, '...').concat(C); d.length > 27; )
                  d.pop();
              t =
                1 === d.length
                  ? f.call(this, ''.concat(h, ' ').concat(d[0]))
                  : f.call(
                      this,
                      ''.concat(h, '\n\n').concat(d.join('\n'), '\n'),
                    );
            } else {
              var g = x(s),
                m = '',
                y = E[i];
              'notDeepEqual' === i || 'notEqual' === i
                ? (g = ''.concat(E[i], '\n\n').concat(g)).length > 1024 &&
                  (g = ''.concat(g.slice(0, 1021), '...'))
                : ((m = ''.concat(x(a))),
                  g.length > 512 && (g = ''.concat(g.slice(0, 509), '...')),
                  m.length > 512 && (m = ''.concat(m.slice(0, 509), '...')),
                  'deepEqual' === i || 'equal' === i
                    ? (g = ''
                        .concat(y, '\n\n')
                        .concat(g, '\n\nshould equal\n\n'))
                    : (m = ' '.concat(i, ' ').concat(m))),
                (t = f.call(this, ''.concat(g).concat(m)));
            }
            return (
              (Error.stackTraceLimit = l),
              (t.generatedMessage = !n),
              Object.defineProperty(c(t), 'name', {
                value: 'AssertionError [ERR_ASSERTION]',
                enumerable: !1,
                writable: !0,
                configurable: !0,
              }),
              (t.code = 'ERR_ASSERTION'),
              (t.actual = s),
              (t.expected = a),
              (t.operator = i),
              Error.captureStackTrace && Error.captureStackTrace(c(t), o),
              t.stack,
              (t.name = 'AssertionError'),
              u(t)
            );
          }
          return (
            (s = v),
            (l = [
              {
                key: 'toString',
                value: function () {
                  return ''
                    .concat(this.name, ' [')
                    .concat(this.code, ']: ')
                    .concat(this.message);
                },
              },
              {
                key: t,
                value: function (e, t) {
                  return y(
                    this,
                    o(o({}, t), {}, { customInspect: !1, depth: 0 }),
                  );
                },
              },
            ]) && a(s.prototype, l),
            h && a(s, h),
            Object.defineProperty(s, 'prototype', { writable: !1 }),
            v
          );
        })(h(Error), y.custom);
        e.exports = L;
      },
      342: (e, t, n) => {
        'use strict';
        function r(e) {
          return (
            (r =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            r(e)
          );
        }
        function i(e, t) {
          for (var n = 0; n < t.length; n++) {
            var i = t[n];
            (i.enumerable = i.enumerable || !1),
              (i.configurable = !0),
              'value' in i && (i.writable = !0),
              Object.defineProperty(
                e,
                ((o = i.key),
                (s = void 0),
                (s = (function (e, t) {
                  if ('object' !== r(e) || null === e) return e;
                  var n = e[Symbol.toPrimitive];
                  if (void 0 !== n) {
                    var i = n.call(e, t || 'default');
                    if ('object' !== r(i)) return i;
                    throw new TypeError(
                      '@@toPrimitive must return a primitive value.',
                    );
                  }
                  return ('string' === t ? String : Number)(e);
                })(o, 'string')),
                'symbol' === r(s) ? s : String(s)),
                i,
              );
          }
          var o, s;
        }
        function o(e, t) {
          return (
            (o = Object.setPrototypeOf
              ? Object.setPrototypeOf.bind()
              : function (e, t) {
                  return (e.__proto__ = t), e;
                }),
            o(e, t)
          );
        }
        function s(e) {
          var t = (function () {
            if ('undefined' == typeof Reflect || !Reflect.construct) return !1;
            if (Reflect.construct.sham) return !1;
            if ('function' == typeof Proxy) return !0;
            try {
              return (
                Boolean.prototype.valueOf.call(
                  Reflect.construct(Boolean, [], function () {}),
                ),
                !0
              );
            } catch (e) {
              return !1;
            }
          })();
          return function () {
            var n,
              i = a(e);
            if (t) {
              var o = a(this).constructor;
              n = Reflect.construct(i, arguments, o);
            } else n = i.apply(this, arguments);
            return (function (e, t) {
              if (t && ('object' === r(t) || 'function' == typeof t)) return t;
              if (void 0 !== t)
                throw new TypeError(
                  'Derived constructors may only return object or undefined',
                );
              return (function (e) {
                if (void 0 === e)
                  throw new ReferenceError(
                    "this hasn't been initialised - super() hasn't been called",
                  );
                return e;
              })(e);
            })(this, n);
          };
        }
        function a(e) {
          return (
            (a = Object.setPrototypeOf
              ? Object.getPrototypeOf.bind()
              : function (e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                }),
            a(e)
          );
        }
        var l,
          u,
          c = {};
        function h(e, t, n) {
          n || (n = Error);
          var r = (function (n) {
            !(function (e, t) {
              if ('function' != typeof t && null !== t)
                throw new TypeError(
                  'Super expression must either be null or a function',
                );
              (e.prototype = Object.create(t && t.prototype, {
                constructor: { value: e, writable: !0, configurable: !0 },
              })),
                Object.defineProperty(e, 'prototype', { writable: !1 }),
                t && o(e, t);
            })(c, n);
            var r,
              a,
              l,
              u = s(c);
            function c(n, r, i) {
              var o;
              return (
                (function (e, t) {
                  if (!(e instanceof t))
                    throw new TypeError('Cannot call a class as a function');
                })(this, c),
                (o = u.call(
                  this,
                  (function (e, n, r) {
                    return 'string' == typeof t ? t : t(e, n, r);
                  })(n, r, i),
                )),
                (o.code = e),
                o
              );
            }
            return (
              (r = c),
              a && i(r.prototype, a),
              l && i(r, l),
              Object.defineProperty(r, 'prototype', { writable: !1 }),
              r
            );
          })(n);
          c[e] = r;
        }
        function f(e, t) {
          if (Array.isArray(e)) {
            var n = e.length;
            return (
              (e = e.map(function (e) {
                return String(e);
              })),
              n > 2
                ? 'one of '
                    .concat(t, ' ')
                    .concat(e.slice(0, n - 1).join(', '), ', or ') + e[n - 1]
                : 2 === n
                ? 'one of '.concat(t, ' ').concat(e[0], ' or ').concat(e[1])
                : 'of '.concat(t, ' ').concat(e[0])
            );
          }
          return 'of '.concat(t, ' ').concat(String(e));
        }
        h(
          'ERR_AMBIGUOUS_ARGUMENT',
          'The "%s" argument is ambiguous. %s',
          TypeError,
        ),
          h(
            'ERR_INVALID_ARG_TYPE',
            function (e, t, i) {
              var o, s, a, u;
              if (
                (void 0 === l && (l = n(93)),
                l('string' == typeof e, "'name' must be a string"),
                'string' == typeof t &&
                ((s = 'not '), t.substr(!a || a < 0 ? 0 : +a, s.length) === s)
                  ? ((o = 'must not be'), (t = t.replace(/^not /, '')))
                  : (o = 'must be'),
                (function (e, t, n) {
                  return (
                    (void 0 === n || n > e.length) && (n = e.length),
                    e.substring(n - t.length, n) === t
                  );
                })(e, ' argument'))
              )
                u = 'The '.concat(e, ' ').concat(o, ' ').concat(f(t, 'type'));
              else {
                var c = (function (e, t, n) {
                  return (
                    'number' != typeof n && (n = 0),
                    !(n + t.length > e.length) && -1 !== e.indexOf(t, n)
                  );
                })(e, '.')
                  ? 'property'
                  : 'argument';
                u = 'The "'
                  .concat(e, '" ')
                  .concat(c, ' ')
                  .concat(o, ' ')
                  .concat(f(t, 'type'));
              }
              return (u += '. Received type '.concat(r(i)));
            },
            TypeError,
          ),
          h(
            'ERR_INVALID_ARG_VALUE',
            function (e, t) {
              var r =
                arguments.length > 2 && void 0 !== arguments[2]
                  ? arguments[2]
                  : 'is invalid';
              void 0 === u && (u = n(208));
              var i = u.inspect(t);
              return (
                i.length > 128 && (i = ''.concat(i.slice(0, 128), '...')),
                "The argument '"
                  .concat(e, "' ")
                  .concat(r, '. Received ')
                  .concat(i)
              );
            },
            TypeError,
            RangeError,
          ),
          h(
            'ERR_INVALID_RETURN_VALUE',
            function (e, t, n) {
              var i;
              return (
                (i =
                  n && n.constructor && n.constructor.name
                    ? 'instance of '.concat(n.constructor.name)
                    : 'type '.concat(r(n))),
                'Expected '
                  .concat(e, ' to be returned from the "')
                  .concat(t, '"') + ' function but got '.concat(i, '.')
              );
            },
            TypeError,
          ),
          h(
            'ERR_MISSING_ARGS',
            function () {
              for (
                var e = arguments.length, t = new Array(e), r = 0;
                r < e;
                r++
              )
                t[r] = arguments[r];
              void 0 === l && (l = n(93)),
                l(t.length > 0, 'At least one arg needs to be specified');
              var i = 'The ',
                o = t.length;
              switch (
                ((t = t.map(function (e) {
                  return '"'.concat(e, '"');
                })),
                o)
              ) {
                case 1:
                  i += ''.concat(t[0], ' argument');
                  break;
                case 2:
                  i += ''.concat(t[0], ' and ').concat(t[1], ' arguments');
                  break;
                default:
                  (i += t.slice(0, o - 1).join(', ')),
                    (i += ', and '.concat(t[o - 1], ' arguments'));
              }
              return ''.concat(i, ' must be specified');
            },
            TypeError,
          ),
          (e.exports.codes = c);
      },
      656: (e, t, n) => {
        'use strict';
        function r(e, t) {
          return (
            (function (e) {
              if (Array.isArray(e)) return e;
            })(e) ||
            (function (e, t) {
              var n =
                null == e
                  ? null
                  : ('undefined' != typeof Symbol && e[Symbol.iterator]) ||
                    e['@@iterator'];
              if (null != n) {
                var r,
                  i,
                  o,
                  s,
                  a = [],
                  l = !0,
                  u = !1;
                try {
                  if (((o = (n = n.call(e)).next), 0 === t)) {
                    if (Object(n) !== n) return;
                    l = !1;
                  } else
                    for (
                      ;
                      !(l = (r = o.call(n)).done) &&
                      (a.push(r.value), a.length !== t);
                      l = !0
                    );
                } catch (e) {
                  (u = !0), (i = e);
                } finally {
                  try {
                    if (
                      !l &&
                      null != n.return &&
                      ((s = n.return()), Object(s) !== s)
                    )
                      return;
                  } finally {
                    if (u) throw i;
                  }
                }
                return a;
              }
            })(e, t) ||
            (function (e, t) {
              if (!e) return;
              if ('string' == typeof e) return i(e, t);
              var n = Object.prototype.toString.call(e).slice(8, -1);
              'Object' === n && e.constructor && (n = e.constructor.name);
              if ('Map' === n || 'Set' === n) return Array.from(e);
              if (
                'Arguments' === n ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
              )
                return i(e, t);
            })(e, t) ||
            (function () {
              throw new TypeError(
                'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
              );
            })()
          );
        }
        function i(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
          return r;
        }
        function o(e) {
          return (
            (o =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function (e) {
                    return typeof e;
                  }
                : function (e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  }),
            o(e)
          );
        }
        var s = void 0 !== /a/g.flags,
          a = function (e) {
            var t = [];
            return (
              e.forEach(function (e) {
                return t.push(e);
              }),
              t
            );
          },
          l = function (e) {
            var t = [];
            return (
              e.forEach(function (e, n) {
                return t.push([n, e]);
              }),
              t
            );
          },
          u = Object.is ? Object.is : n(587),
          c = Object.getOwnPropertySymbols
            ? Object.getOwnPropertySymbols
            : function () {
                return [];
              },
          h = Number.isNaN ? Number.isNaN : n(838);
        function f(e) {
          return e.call.bind(e);
        }
        var d = f(Object.prototype.hasOwnProperty),
          g = f(Object.prototype.propertyIsEnumerable),
          m = f(Object.prototype.toString),
          p = n(208).types,
          y = p.isAnyArrayBuffer,
          b = p.isArrayBufferView,
          v = p.isDate,
          w = p.isMap,
          S = p.isRegExp,
          _ = p.isSet,
          C = p.isNativeError,
          E = p.isBoxedPrimitive,
          A = p.isNumberObject,
          x = p.isStringObject,
          N = p.isBooleanObject,
          L = p.isBigIntObject,
          O = p.isSymbolObject,
          k = p.isFloat32Array,
          R = p.isFloat64Array;
        function T(e) {
          if (0 === e.length || e.length > 10) return !0;
          for (var t = 0; t < e.length; t++) {
            var n = e.charCodeAt(t);
            if (n < 48 || n > 57) return !0;
          }
          return 10 === e.length && e >= Math.pow(2, 32);
        }
        function M(e) {
          return Object.keys(e)
            .filter(T)
            .concat(c(e).filter(Object.prototype.propertyIsEnumerable.bind(e)));
        }
        function P(e, t) {
          if (e === t) return 0;
          for (
            var n = e.length, r = t.length, i = 0, o = Math.min(n, r);
            i < o;
            ++i
          )
            if (e[i] !== t[i]) {
              (n = e[i]), (r = t[i]);
              break;
            }
          return n < r ? -1 : r < n ? 1 : 0;
        }
        var I = 0,
          j = 1,
          F = 2,
          D = 3;
        function V(e, t, n, r) {
          if (e === t) return 0 !== e || !n || u(e, t);
          if (n) {
            if ('object' !== o(e)) return 'number' == typeof e && h(e) && h(t);
            if ('object' !== o(t) || null === e || null === t) return !1;
            if (Object.getPrototypeOf(e) !== Object.getPrototypeOf(t))
              return !1;
          } else {
            if (null === e || 'object' !== o(e))
              return (null === t || 'object' !== o(t)) && e == t;
            if (null === t || 'object' !== o(t)) return !1;
          }
          var i,
            a,
            l,
            c,
            f = m(e);
          if (f !== m(t)) return !1;
          if (Array.isArray(e)) {
            if (e.length !== t.length) return !1;
            var d = M(e),
              g = M(t);
            return d.length === g.length && U(e, t, n, r, j, d);
          }
          if ('[object Object]' === f && ((!w(e) && w(t)) || (!_(e) && _(t))))
            return !1;
          if (v(e)) {
            if (
              !v(t) ||
              Date.prototype.getTime.call(e) !== Date.prototype.getTime.call(t)
            )
              return !1;
          } else if (S(e)) {
            if (
              !S(t) ||
              ((l = e),
              (c = t),
              !(s
                ? l.source === c.source && l.flags === c.flags
                : RegExp.prototype.toString.call(l) ===
                  RegExp.prototype.toString.call(c)))
            )
              return !1;
          } else if (C(e) || e instanceof Error) {
            if (e.message !== t.message || e.name !== t.name) return !1;
          } else {
            if (b(e)) {
              if (n || (!k(e) && !R(e))) {
                if (
                  !(function (e, t) {
                    return (
                      e.byteLength === t.byteLength &&
                      0 ===
                        P(
                          new Uint8Array(e.buffer, e.byteOffset, e.byteLength),
                          new Uint8Array(t.buffer, t.byteOffset, t.byteLength),
                        )
                    );
                  })(e, t)
                )
                  return !1;
              } else if (
                !(function (e, t) {
                  if (e.byteLength !== t.byteLength) return !1;
                  for (var n = 0; n < e.byteLength; n++)
                    if (e[n] !== t[n]) return !1;
                  return !0;
                })(e, t)
              )
                return !1;
              var p = M(e),
                T = M(t);
              return p.length === T.length && U(e, t, n, r, I, p);
            }
            if (_(e)) return !(!_(t) || e.size !== t.size) && U(e, t, n, r, F);
            if (w(e)) return !(!w(t) || e.size !== t.size) && U(e, t, n, r, D);
            if (y(e)) {
              if (
                ((a = t),
                (i = e).byteLength !== a.byteLength ||
                  0 !== P(new Uint8Array(i), new Uint8Array(a)))
              )
                return !1;
            } else if (
              E(e) &&
              !(function (e, t) {
                return A(e)
                  ? A(t) &&
                      u(
                        Number.prototype.valueOf.call(e),
                        Number.prototype.valueOf.call(t),
                      )
                  : x(e)
                  ? x(t) &&
                    String.prototype.valueOf.call(e) ===
                      String.prototype.valueOf.call(t)
                  : N(e)
                  ? N(t) &&
                    Boolean.prototype.valueOf.call(e) ===
                      Boolean.prototype.valueOf.call(t)
                  : L(e)
                  ? L(t) &&
                    BigInt.prototype.valueOf.call(e) ===
                      BigInt.prototype.valueOf.call(t)
                  : O(t) &&
                    Symbol.prototype.valueOf.call(e) ===
                      Symbol.prototype.valueOf.call(t);
              })(e, t)
            )
              return !1;
          }
          return U(e, t, n, r, I);
        }
        function q(e, t) {
          return t.filter(function (t) {
            return g(e, t);
          });
        }
        function U(e, t, n, i, s, u) {
          if (5 === arguments.length) {
            u = Object.keys(e);
            var h = Object.keys(t);
            if (u.length !== h.length) return !1;
          }
          for (var f = 0; f < u.length; f++) if (!d(t, u[f])) return !1;
          if (n && 5 === arguments.length) {
            var m = c(e);
            if (0 !== m.length) {
              var p = 0;
              for (f = 0; f < m.length; f++) {
                var y = m[f];
                if (g(e, y)) {
                  if (!g(t, y)) return !1;
                  u.push(y), p++;
                } else if (g(t, y)) return !1;
              }
              var b = c(t);
              if (m.length !== b.length && q(t, b).length !== p) return !1;
            } else {
              var v = c(t);
              if (0 !== v.length && 0 !== q(t, v).length) return !1;
            }
          }
          if (
            0 === u.length &&
            (s === I || (s === j && 0 === e.length) || 0 === e.size)
          )
            return !0;
          if (void 0 === i)
            i = { val1: new Map(), val2: new Map(), position: 0 };
          else {
            var w = i.val1.get(e);
            if (void 0 !== w) {
              var S = i.val2.get(t);
              if (void 0 !== S) return w === S;
            }
            i.position++;
          }
          i.val1.set(e, i.position), i.val2.set(t, i.position);
          var _ = (function (e, t, n, i, s, u) {
            var c = 0;
            if (u === F) {
              if (
                !(function (e, t, n, r) {
                  for (var i = null, s = a(e), l = 0; l < s.length; l++) {
                    var u = s[l];
                    if ('object' === o(u) && null !== u)
                      null === i && (i = new Set()), i.add(u);
                    else if (!t.has(u)) {
                      if (n) return !1;
                      if (!$(e, t, u)) return !1;
                      null === i && (i = new Set()), i.add(u);
                    }
                  }
                  if (null !== i) {
                    for (var c = a(t), h = 0; h < c.length; h++) {
                      var f = c[h];
                      if ('object' === o(f) && null !== f) {
                        if (!B(i, f, n, r)) return !1;
                      } else if (!n && !e.has(f) && !B(i, f, n, r)) return !1;
                    }
                    return 0 === i.size;
                  }
                  return !0;
                })(e, t, n, s)
              )
                return !1;
            } else if (u === D) {
              if (
                !(function (e, t, n, i) {
                  for (var s = null, a = l(e), u = 0; u < a.length; u++) {
                    var c = r(a[u], 2),
                      h = c[0],
                      f = c[1];
                    if ('object' === o(h) && null !== h)
                      null === s && (s = new Set()), s.add(h);
                    else {
                      var d = t.get(h);
                      if ((void 0 === d && !t.has(h)) || !V(f, d, n, i)) {
                        if (n) return !1;
                        if (!W(e, t, h, f, i)) return !1;
                        null === s && (s = new Set()), s.add(h);
                      }
                    }
                  }
                  if (null !== s) {
                    for (var g = l(t), m = 0; m < g.length; m++) {
                      var p = r(g[m], 2),
                        y = p[0],
                        b = p[1];
                      if ('object' === o(y) && null !== y) {
                        if (!z(s, e, y, b, n, i)) return !1;
                      } else if (
                        !(
                          n ||
                          (e.has(y) && V(e.get(y), b, !1, i)) ||
                          z(s, e, y, b, !1, i)
                        )
                      )
                        return !1;
                    }
                    return 0 === s.size;
                  }
                  return !0;
                })(e, t, n, s)
              )
                return !1;
            } else if (u === j)
              for (; c < e.length; c++) {
                if (!d(e, c)) {
                  if (d(t, c)) return !1;
                  for (var h = Object.keys(e); c < h.length; c++) {
                    var f = h[c];
                    if (!d(t, f) || !V(e[f], t[f], n, s)) return !1;
                  }
                  return h.length === Object.keys(t).length;
                }
                if (!d(t, c) || !V(e[c], t[c], n, s)) return !1;
              }
            for (c = 0; c < i.length; c++) {
              var g = i[c];
              if (!V(e[g], t[g], n, s)) return !1;
            }
            return !0;
          })(e, t, n, u, i, s);
          return i.val1.delete(e), i.val2.delete(t), _;
        }
        function B(e, t, n, r) {
          for (var i = a(e), o = 0; o < i.length; o++) {
            var s = i[o];
            if (V(t, s, n, r)) return e.delete(s), !0;
          }
          return !1;
        }
        function K(e) {
          switch (o(e)) {
            case 'undefined':
              return null;
            case 'object':
              return;
            case 'symbol':
              return !1;
            case 'string':
              e = +e;
            case 'number':
              if (h(e)) return !1;
          }
          return !0;
        }
        function $(e, t, n) {
          var r = K(n);
          return null != r ? r : t.has(r) && !e.has(r);
        }
        function W(e, t, n, r, i) {
          var o = K(n);
          if (null != o) return o;
          var s = t.get(o);
          return (
            !((void 0 === s && !t.has(o)) || !V(r, s, !1, i)) &&
            !e.has(o) &&
            V(r, s, !1, i)
          );
        }
        function z(e, t, n, r, i, o) {
          for (var s = a(e), l = 0; l < s.length; l++) {
            var u = s[l];
            if (V(n, u, i, o) && V(r, t.get(u), i, o)) return e.delete(u), !0;
          }
          return !1;
        }
        e.exports = {
          isDeepEqual: function (e, t) {
            return V(e, t, false);
          },
          isDeepStrictEqual: function (e, t) {
            return V(e, t, true);
          },
        };
      },
      818: (e, t, n) => {
        'use strict';
        var r = n(528),
          i = n(498),
          o = i(r('String.prototype.indexOf'));
        e.exports = function (e, t) {
          var n = r(e, !!t);
          return 'function' == typeof n && o(e, '.prototype.') > -1 ? i(n) : n;
        };
      },
      498: (e, t, n) => {
        'use strict';
        var r = n(138),
          i = n(528),
          o = i('%Function.prototype.apply%'),
          s = i('%Function.prototype.call%'),
          a = i('%Reflect.apply%', !0) || r.call(s, o),
          l = i('%Object.getOwnPropertyDescriptor%', !0),
          u = i('%Object.defineProperty%', !0),
          c = i('%Math.max%');
        if (u)
          try {
            u({}, 'a', { value: 1 });
          } catch (e) {
            u = null;
          }
        e.exports = function (e) {
          var t = a(r, s, arguments);
          l &&
            u &&
            l(t, 'length').configurable &&
            u(t, 'length', {
              value: 1 + c(0, e.length - (arguments.length - 1)),
            });
          return t;
        };
        var h = function () {
          return a(r, o, arguments);
        };
        u ? u(e.exports, 'apply', { value: h }) : (e.exports.apply = h);
      },
      364: (e, t, n) => {
        var r = n(208),
          i = n(93);
        function o() {
          return new Date().getTime();
        }
        var s,
          a = Array.prototype.slice,
          l = {};
        s =
          void 0 !== n.g && n.g.console
            ? n.g.console
            : 'undefined' != typeof window && window.console
            ? window.console
            : {};
        for (
          var u = [
              [function () {}, 'log'],
              [
                function () {
                  s.log.apply(s, arguments);
                },
                'info',
              ],
              [
                function () {
                  s.log.apply(s, arguments);
                },
                'warn',
              ],
              [
                function () {
                  s.warn.apply(s, arguments);
                },
                'error',
              ],
              [
                function (e) {
                  l[e] = o();
                },
                'time',
              ],
              [
                function (e) {
                  var t = l[e];
                  if (!t) throw new Error('No such label: ' + e);
                  delete l[e];
                  var n = o() - t;
                  s.log(e + ': ' + n + 'ms');
                },
                'timeEnd',
              ],
              [
                function () {
                  var e = new Error();
                  (e.name = 'Trace'),
                    (e.message = r.format.apply(null, arguments)),
                    s.error(e.stack);
                },
                'trace',
              ],
              [
                function (e) {
                  s.log(r.inspect(e) + '\n');
                },
                'dir',
              ],
              [
                function (e) {
                  if (!e) {
                    var t = a.call(arguments, 1);
                    i.ok(!1, r.format.apply(null, t));
                  }
                },
                'assert',
              ],
            ],
            c = 0;
          c < u.length;
          c++
        ) {
          var h = u[c],
            f = h[0],
            d = h[1];
          s[d] || (s[d] = f);
        }
        e.exports = s;
      },
      686: (e, t, n) => {
        'use strict';
        var r = n(239)(),
          i = n(528),
          o = r && i('%Object.defineProperty%', !0);
        if (o)
          try {
            o({}, 'a', { value: 1 });
          } catch (e) {
            o = !1;
          }
        var s = i('%SyntaxError%'),
          a = i('%TypeError%'),
          l = n(336);
        e.exports = function (e, t, n) {
          if (!e || ('object' != typeof e && 'function' != typeof e))
            throw new a('`obj` must be an object or a function`');
          if ('string' != typeof t && 'symbol' != typeof t)
            throw new a('`property` must be a string or a symbol`');
          if (
            arguments.length > 3 &&
            'boolean' != typeof arguments[3] &&
            null !== arguments[3]
          )
            throw new a(
              '`nonEnumerable`, if provided, must be a boolean or null',
            );
          if (
            arguments.length > 4 &&
            'boolean' != typeof arguments[4] &&
            null !== arguments[4]
          )
            throw new a(
              '`nonWritable`, if provided, must be a boolean or null',
            );
          if (
            arguments.length > 5 &&
            'boolean' != typeof arguments[5] &&
            null !== arguments[5]
          )
            throw new a(
              '`nonConfigurable`, if provided, must be a boolean or null',
            );
          if (arguments.length > 6 && 'boolean' != typeof arguments[6])
            throw new a('`loose`, if provided, must be a boolean');
          var r = arguments.length > 3 ? arguments[3] : null,
            i = arguments.length > 4 ? arguments[4] : null,
            u = arguments.length > 5 ? arguments[5] : null,
            c = arguments.length > 6 && arguments[6],
            h = !!l && l(e, t);
          if (o)
            o(e, t, {
              configurable: null === u && h ? h.configurable : !u,
              enumerable: null === r && h ? h.enumerable : !r,
              value: n,
              writable: null === i && h ? h.writable : !i,
            });
          else {
            if (!c && (r || i || u))
              throw new s(
                'This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.',
              );
            e[t] = n;
          }
        };
      },
      857: (e, t, n) => {
        'use strict';
        var r = n(228),
          i = 'function' == typeof Symbol && 'symbol' == typeof Symbol('foo'),
          o = Object.prototype.toString,
          s = Array.prototype.concat,
          a = n(686),
          l = n(239)(),
          u = function (e, t, n, r) {
            if (t in e)
              if (!0 === r) {
                if (e[t] === n) return;
              } else if (
                'function' != typeof (i = r) ||
                '[object Function]' !== o.call(i) ||
                !r()
              )
                return;
            var i;
            l ? a(e, t, n, !0) : a(e, t, n);
          },
          c = function (e, t) {
            var n = arguments.length > 2 ? arguments[2] : {},
              o = r(t);
            i && (o = s.call(o, Object.getOwnPropertySymbols(t)));
            for (var a = 0; a < o.length; a += 1) u(e, o[a], t[o[a]], n[o[a]]);
          };
        (c.supportsDescriptors = !!l), (e.exports = c);
      },
      705: (e, t, n) => {
        'use strict';
        var r = n(617),
          i = Object.prototype.toString,
          o = Object.prototype.hasOwnProperty;
        e.exports = function (e, t, n) {
          if (!r(t)) throw new TypeError('iterator must be a function');
          var s;
          arguments.length >= 3 && (s = n),
            '[object Array]' === i.call(e)
              ? (function (e, t, n) {
                  for (var r = 0, i = e.length; r < i; r++)
                    o.call(e, r) &&
                      (null == n ? t(e[r], r, e) : t.call(n, e[r], r, e));
                })(e, t, s)
              : 'string' == typeof e
              ? (function (e, t, n) {
                  for (var r = 0, i = e.length; r < i; r++)
                    null == n
                      ? t(e.charAt(r), r, e)
                      : t.call(n, e.charAt(r), r, e);
                })(e, t, s)
              : (function (e, t, n) {
                  for (var r in e)
                    o.call(e, r) &&
                      (null == n ? t(e[r], r, e) : t.call(n, e[r], r, e));
                })(e, t, s);
        };
      },
      794: e => {
        'use strict';
        var t = Object.prototype.toString,
          n = Math.max,
          r = function (e, t) {
            for (var n = [], r = 0; r < e.length; r += 1) n[r] = e[r];
            for (var i = 0; i < t.length; i += 1) n[i + e.length] = t[i];
            return n;
          };
        e.exports = function (e) {
          var i = this;
          if ('function' != typeof i || '[object Function]' !== t.apply(i))
            throw new TypeError(
              'Function.prototype.bind called on incompatible ' + i,
            );
          for (
            var o,
              s = (function (e, t) {
                for (
                  var n = [], r = t || 0, i = 0;
                  r < e.length;
                  r += 1, i += 1
                )
                  n[i] = e[r];
                return n;
              })(arguments, 1),
              a = n(0, i.length - s.length),
              l = [],
              u = 0;
            u < a;
            u++
          )
            l[u] = '$' + u;
          if (
            ((o = Function(
              'binder',
              'return function (' +
                (function (e, t) {
                  for (var n = '', r = 0; r < e.length; r += 1)
                    (n += e[r]), r + 1 < e.length && (n += t);
                  return n;
                })(l, ',') +
                '){ return binder.apply(this,arguments); }',
            )(function () {
              if (this instanceof o) {
                var t = i.apply(this, r(s, arguments));
                return Object(t) === t ? t : this;
              }
              return i.apply(e, r(s, arguments));
            })),
            i.prototype)
          ) {
            var c = function () {};
            (c.prototype = i.prototype),
              (o.prototype = new c()),
              (c.prototype = null);
          }
          return o;
        };
      },
      138: (e, t, n) => {
        'use strict';
        var r = n(794);
        e.exports = Function.prototype.bind || r;
      },
      528: (e, t, n) => {
        'use strict';
        var r,
          i = SyntaxError,
          o = Function,
          s = TypeError,
          a = function (e) {
            try {
              return o('"use strict"; return (' + e + ').constructor;')();
            } catch (e) {}
          },
          l = Object.getOwnPropertyDescriptor;
        if (l)
          try {
            l({}, '');
          } catch (e) {
            l = null;
          }
        var u = function () {
            throw new s();
          },
          c = l
            ? (function () {
                try {
                  return u;
                } catch (e) {
                  try {
                    return l(arguments, 'callee').get;
                  } catch (e) {
                    return u;
                  }
                }
              })()
            : u,
          h = n(558)(),
          f = n(869)(),
          d =
            Object.getPrototypeOf ||
            (f
              ? function (e) {
                  return e.__proto__;
                }
              : null),
          g = {},
          m = 'undefined' != typeof Uint8Array && d ? d(Uint8Array) : r,
          p = {
            '%AggregateError%':
              'undefined' == typeof AggregateError ? r : AggregateError,
            '%Array%': Array,
            '%ArrayBuffer%':
              'undefined' == typeof ArrayBuffer ? r : ArrayBuffer,
            '%ArrayIteratorPrototype%': h && d ? d([][Symbol.iterator]()) : r,
            '%AsyncFromSyncIteratorPrototype%': r,
            '%AsyncFunction%': g,
            '%AsyncGenerator%': g,
            '%AsyncGeneratorFunction%': g,
            '%AsyncIteratorPrototype%': g,
            '%Atomics%': 'undefined' == typeof Atomics ? r : Atomics,
            '%BigInt%': 'undefined' == typeof BigInt ? r : BigInt,
            '%BigInt64Array%':
              'undefined' == typeof BigInt64Array ? r : BigInt64Array,
            '%BigUint64Array%':
              'undefined' == typeof BigUint64Array ? r : BigUint64Array,
            '%Boolean%': Boolean,
            '%DataView%': 'undefined' == typeof DataView ? r : DataView,
            '%Date%': Date,
            '%decodeURI%': decodeURI,
            '%decodeURIComponent%': decodeURIComponent,
            '%encodeURI%': encodeURI,
            '%encodeURIComponent%': encodeURIComponent,
            '%Error%': Error,
            '%eval%': eval,
            '%EvalError%': EvalError,
            '%Float32Array%':
              'undefined' == typeof Float32Array ? r : Float32Array,
            '%Float64Array%':
              'undefined' == typeof Float64Array ? r : Float64Array,
            '%FinalizationRegistry%':
              'undefined' == typeof FinalizationRegistry
                ? r
                : FinalizationRegistry,
            '%Function%': o,
            '%GeneratorFunction%': g,
            '%Int8Array%': 'undefined' == typeof Int8Array ? r : Int8Array,
            '%Int16Array%': 'undefined' == typeof Int16Array ? r : Int16Array,
            '%Int32Array%': 'undefined' == typeof Int32Array ? r : Int32Array,
            '%isFinite%': isFinite,
            '%isNaN%': isNaN,
            '%IteratorPrototype%': h && d ? d(d([][Symbol.iterator]())) : r,
            '%JSON%': 'object' == typeof JSON ? JSON : r,
            '%Map%': 'undefined' == typeof Map ? r : Map,
            '%MapIteratorPrototype%':
              'undefined' != typeof Map && h && d
                ? d(new Map()[Symbol.iterator]())
                : r,
            '%Math%': Math,
            '%Number%': Number,
            '%Object%': Object,
            '%parseFloat%': parseFloat,
            '%parseInt%': parseInt,
            '%Promise%': 'undefined' == typeof Promise ? r : Promise,
            '%Proxy%': 'undefined' == typeof Proxy ? r : Proxy,
            '%RangeError%': RangeError,
            '%ReferenceError%': ReferenceError,
            '%Reflect%': 'undefined' == typeof Reflect ? r : Reflect,
            '%RegExp%': RegExp,
            '%Set%': 'undefined' == typeof Set ? r : Set,
            '%SetIteratorPrototype%':
              'undefined' != typeof Set && h && d
                ? d(new Set()[Symbol.iterator]())
                : r,
            '%SharedArrayBuffer%':
              'undefined' == typeof SharedArrayBuffer ? r : SharedArrayBuffer,
            '%String%': String,
            '%StringIteratorPrototype%': h && d ? d(''[Symbol.iterator]()) : r,
            '%Symbol%': h ? Symbol : r,
            '%SyntaxError%': i,
            '%ThrowTypeError%': c,
            '%TypedArray%': m,
            '%TypeError%': s,
            '%Uint8Array%': 'undefined' == typeof Uint8Array ? r : Uint8Array,
            '%Uint8ClampedArray%':
              'undefined' == typeof Uint8ClampedArray ? r : Uint8ClampedArray,
            '%Uint16Array%':
              'undefined' == typeof Uint16Array ? r : Uint16Array,
            '%Uint32Array%':
              'undefined' == typeof Uint32Array ? r : Uint32Array,
            '%URIError%': URIError,
            '%WeakMap%': 'undefined' == typeof WeakMap ? r : WeakMap,
            '%WeakRef%': 'undefined' == typeof WeakRef ? r : WeakRef,
            '%WeakSet%': 'undefined' == typeof WeakSet ? r : WeakSet,
          };
        if (d)
          try {
            null.error;
          } catch (e) {
            var y = d(d(e));
            p['%Error.prototype%'] = y;
          }
        var b = function e(t) {
            var n;
            if ('%AsyncFunction%' === t) n = a('async function () {}');
            else if ('%GeneratorFunction%' === t) n = a('function* () {}');
            else if ('%AsyncGeneratorFunction%' === t)
              n = a('async function* () {}');
            else if ('%AsyncGenerator%' === t) {
              var r = e('%AsyncGeneratorFunction%');
              r && (n = r.prototype);
            } else if ('%AsyncIteratorPrototype%' === t) {
              var i = e('%AsyncGenerator%');
              i && d && (n = d(i.prototype));
            }
            return (p[t] = n), n;
          },
          v = {
            '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
            '%ArrayPrototype%': ['Array', 'prototype'],
            '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
            '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
            '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
            '%ArrayProto_values%': ['Array', 'prototype', 'values'],
            '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
            '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
            '%AsyncGeneratorPrototype%': [
              'AsyncGeneratorFunction',
              'prototype',
              'prototype',
            ],
            '%BooleanPrototype%': ['Boolean', 'prototype'],
            '%DataViewPrototype%': ['DataView', 'prototype'],
            '%DatePrototype%': ['Date', 'prototype'],
            '%ErrorPrototype%': ['Error', 'prototype'],
            '%EvalErrorPrototype%': ['EvalError', 'prototype'],
            '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
            '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
            '%FunctionPrototype%': ['Function', 'prototype'],
            '%Generator%': ['GeneratorFunction', 'prototype'],
            '%GeneratorPrototype%': [
              'GeneratorFunction',
              'prototype',
              'prototype',
            ],
            '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
            '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
            '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
            '%JSONParse%': ['JSON', 'parse'],
            '%JSONStringify%': ['JSON', 'stringify'],
            '%MapPrototype%': ['Map', 'prototype'],
            '%NumberPrototype%': ['Number', 'prototype'],
            '%ObjectPrototype%': ['Object', 'prototype'],
            '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
            '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
            '%PromisePrototype%': ['Promise', 'prototype'],
            '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
            '%Promise_all%': ['Promise', 'all'],
            '%Promise_reject%': ['Promise', 'reject'],
            '%Promise_resolve%': ['Promise', 'resolve'],
            '%RangeErrorPrototype%': ['RangeError', 'prototype'],
            '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
            '%RegExpPrototype%': ['RegExp', 'prototype'],
            '%SetPrototype%': ['Set', 'prototype'],
            '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
            '%StringPrototype%': ['String', 'prototype'],
            '%SymbolPrototype%': ['Symbol', 'prototype'],
            '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
            '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
            '%TypeErrorPrototype%': ['TypeError', 'prototype'],
            '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
            '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
            '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
            '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
            '%URIErrorPrototype%': ['URIError', 'prototype'],
            '%WeakMapPrototype%': ['WeakMap', 'prototype'],
            '%WeakSetPrototype%': ['WeakSet', 'prototype'],
          },
          w = n(138),
          S = n(571),
          _ = w.call(Function.call, Array.prototype.concat),
          C = w.call(Function.apply, Array.prototype.splice),
          E = w.call(Function.call, String.prototype.replace),
          A = w.call(Function.call, String.prototype.slice),
          x = w.call(Function.call, RegExp.prototype.exec),
          N =
            /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,
          L = /\\(\\)?/g,
          O = function (e, t) {
            var n,
              r = e;
            if ((S(v, r) && (r = '%' + (n = v[r])[0] + '%'), S(p, r))) {
              var o = p[r];
              if ((o === g && (o = b(r)), void 0 === o && !t))
                throw new s(
                  'intrinsic ' +
                    e +
                    ' exists, but is not available. Please file an issue!',
                );
              return { alias: n, name: r, value: o };
            }
            throw new i('intrinsic ' + e + ' does not exist!');
          };
        e.exports = function (e, t) {
          if ('string' != typeof e || 0 === e.length)
            throw new s('intrinsic name must be a non-empty string');
          if (arguments.length > 1 && 'boolean' != typeof t)
            throw new s('"allowMissing" argument must be a boolean');
          if (null === x(/^%?[^%]*%?$/, e))
            throw new i(
              '`%` may not be present anywhere but at the beginning and end of the intrinsic name',
            );
          var n = (function (e) {
              var t = A(e, 0, 1),
                n = A(e, -1);
              if ('%' === t && '%' !== n)
                throw new i('invalid intrinsic syntax, expected closing `%`');
              if ('%' === n && '%' !== t)
                throw new i('invalid intrinsic syntax, expected opening `%`');
              var r = [];
              return (
                E(e, N, function (e, t, n, i) {
                  r[r.length] = n ? E(i, L, '$1') : t || e;
                }),
                r
              );
            })(e),
            r = n.length > 0 ? n[0] : '',
            o = O('%' + r + '%', t),
            a = o.name,
            u = o.value,
            c = !1,
            h = o.alias;
          h && ((r = h[0]), C(n, _([0, 1], h)));
          for (var f = 1, d = !0; f < n.length; f += 1) {
            var g = n[f],
              m = A(g, 0, 1),
              y = A(g, -1);
            if (
              ('"' === m ||
                "'" === m ||
                '`' === m ||
                '"' === y ||
                "'" === y ||
                '`' === y) &&
              m !== y
            )
              throw new i(
                'property names with quotes must have matching quotes',
              );
            if (
              (('constructor' !== g && d) || (c = !0),
              S(p, (a = '%' + (r += '.' + g) + '%')))
            )
              u = p[a];
            else if (null != u) {
              if (!(g in u)) {
                if (!t)
                  throw new s(
                    'base intrinsic for ' +
                      e +
                      ' exists, but the property is not available.',
                  );
                return;
              }
              if (l && f + 1 >= n.length) {
                var b = l(u, g);
                u =
                  (d = !!b) && 'get' in b && !('originalValue' in b.get)
                    ? b.get
                    : u[g];
              } else (d = S(u, g)), (u = u[g]);
              d && !c && (p[a] = u);
            }
          }
          return u;
        };
      },
      336: (e, t, n) => {
        'use strict';
        var r = n(528)('%Object.getOwnPropertyDescriptor%', !0);
        if (r)
          try {
            r([], 'length');
          } catch (e) {
            r = null;
          }
        e.exports = r;
      },
      239: (e, t, n) => {
        'use strict';
        var r = n(528)('%Object.defineProperty%', !0),
          i = function () {
            if (r)
              try {
                return r({}, 'a', { value: 1 }), !0;
              } catch (e) {
                return !1;
              }
            return !1;
          };
        (i.hasArrayLengthDefineBug = function () {
          if (!i()) return null;
          try {
            return 1 !== r([], 'length', { value: 1 }).length;
          } catch (e) {
            return !0;
          }
        }),
          (e.exports = i);
      },
      869: e => {
        'use strict';
        var t = { foo: {} },
          n = Object;
        e.exports = function () {
          return (
            { __proto__: t }.foo === t.foo &&
            !({ __proto__: null } instanceof n)
          );
        };
      },
      558: (e, t, n) => {
        'use strict';
        var r = 'undefined' != typeof Symbol && Symbol,
          i = n(908);
        e.exports = function () {
          return (
            'function' == typeof r &&
            'function' == typeof Symbol &&
            'symbol' == typeof r('foo') &&
            'symbol' == typeof Symbol('bar') &&
            i()
          );
        };
      },
      908: e => {
        'use strict';
        e.exports = function () {
          if (
            'function' != typeof Symbol ||
            'function' != typeof Object.getOwnPropertySymbols
          )
            return !1;
          if ('symbol' == typeof Symbol.iterator) return !0;
          var e = {},
            t = Symbol('test'),
            n = Object(t);
          if ('string' == typeof t) return !1;
          if ('[object Symbol]' !== Object.prototype.toString.call(t))
            return !1;
          if ('[object Symbol]' !== Object.prototype.toString.call(n))
            return !1;
          for (t in ((e[t] = 42), e)) return !1;
          if ('function' == typeof Object.keys && 0 !== Object.keys(e).length)
            return !1;
          if (
            'function' == typeof Object.getOwnPropertyNames &&
            0 !== Object.getOwnPropertyNames(e).length
          )
            return !1;
          var r = Object.getOwnPropertySymbols(e);
          if (1 !== r.length || r[0] !== t) return !1;
          if (!Object.prototype.propertyIsEnumerable.call(e, t)) return !1;
          if ('function' == typeof Object.getOwnPropertyDescriptor) {
            var i = Object.getOwnPropertyDescriptor(e, t);
            if (42 !== i.value || !0 !== i.enumerable) return !1;
          }
          return !0;
        };
      },
      913: (e, t, n) => {
        'use strict';
        var r = n(908);
        e.exports = function () {
          return r() && !!Symbol.toStringTag;
        };
      },
      571: e => {
        'use strict';
        var t = {}.hasOwnProperty,
          n = Function.prototype.call;
        e.exports = n.bind
          ? n.bind(t)
          : function (e, r) {
              return n.call(t, e, r);
            };
      },
      615: e => {
        'function' == typeof Object.create
          ? (e.exports = function (e, t) {
              t &&
                ((e.super_ = t),
                (e.prototype = Object.create(t.prototype, {
                  constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0,
                  },
                })));
            })
          : (e.exports = function (e, t) {
              if (t) {
                e.super_ = t;
                var n = function () {};
                (n.prototype = t.prototype),
                  (e.prototype = new n()),
                  (e.prototype.constructor = e);
              }
            });
      },
      387: (e, t, n) => {
        'use strict';
        var r = n(913)(),
          i = n(818)('Object.prototype.toString'),
          o = function (e) {
            return (
              !(r && e && 'object' == typeof e && Symbol.toStringTag in e) &&
              '[object Arguments]' === i(e)
            );
          },
          s = function (e) {
            return (
              !!o(e) ||
              (null !== e &&
                'object' == typeof e &&
                'number' == typeof e.length &&
                e.length >= 0 &&
                '[object Array]' !== i(e) &&
                '[object Function]' === i(e.callee))
            );
          },
          a = (function () {
            return o(arguments);
          })();
        (o.isLegacyArguments = s), (e.exports = a ? o : s);
      },
      617: e => {
        'use strict';
        var t,
          n,
          r = Function.prototype.toString,
          i = 'object' == typeof Reflect && null !== Reflect && Reflect.apply;
        if (
          'function' == typeof i &&
          'function' == typeof Object.defineProperty
        )
          try {
            (t = Object.defineProperty({}, 'length', {
              get: function () {
                throw n;
              },
            })),
              (n = {}),
              i(
                function () {
                  throw 42;
                },
                null,
                t,
              );
          } catch (e) {
            e !== n && (i = null);
          }
        else i = null;
        var o = /^\s*class\b/,
          s = function (e) {
            try {
              var t = r.call(e);
              return o.test(t);
            } catch (e) {
              return !1;
            }
          },
          a = function (e) {
            try {
              return !s(e) && (r.call(e), !0);
            } catch (e) {
              return !1;
            }
          },
          l = Object.prototype.toString,
          u = 'function' == typeof Symbol && !!Symbol.toStringTag,
          c = !(0 in [,]),
          h = function () {
            return !1;
          };
        if ('object' == typeof document) {
          var f = document.all;
          l.call(f) === l.call(document.all) &&
            (h = function (e) {
              if ((c || !e) && (void 0 === e || 'object' == typeof e))
                try {
                  var t = l.call(e);
                  return (
                    ('[object HTMLAllCollection]' === t ||
                      '[object HTML document.all class]' === t ||
                      '[object HTMLCollection]' === t ||
                      '[object Object]' === t) &&
                    null == e('')
                  );
                } catch (e) {}
              return !1;
            });
        }
        e.exports = i
          ? function (e) {
              if (h(e)) return !0;
              if (!e) return !1;
              if ('function' != typeof e && 'object' != typeof e) return !1;
              try {
                i(e, null, t);
              } catch (e) {
                if (e !== n) return !1;
              }
              return !s(e) && a(e);
            }
          : function (e) {
              if (h(e)) return !0;
              if (!e) return !1;
              if ('function' != typeof e && 'object' != typeof e) return !1;
              if (u) return a(e);
              if (s(e)) return !1;
              var t = l.call(e);
              return (
                !(
                  '[object Function]' !== t &&
                  '[object GeneratorFunction]' !== t &&
                  !/^\[object HTML/.test(t)
                ) && a(e)
              );
            };
      },
      625: (e, t, n) => {
        'use strict';
        var r,
          i = Object.prototype.toString,
          o = Function.prototype.toString,
          s = /^\s*(?:function)?\*/,
          a = n(913)(),
          l = Object.getPrototypeOf;
        e.exports = function (e) {
          if ('function' != typeof e) return !1;
          if (s.test(o.call(e))) return !0;
          if (!a) return '[object GeneratorFunction]' === i.call(e);
          if (!l) return !1;
          if (void 0 === r) {
            var t = (function () {
              if (!a) return !1;
              try {
                return Function('return function*() {}')();
              } catch (e) {}
            })();
            r = !!t && l(t);
          }
          return l(e) === r;
        };
      },
      6: e => {
        'use strict';
        e.exports = function (e) {
          return e != e;
        };
      },
      838: (e, t, n) => {
        'use strict';
        var r = n(498),
          i = n(857),
          o = n(6),
          s = n(591),
          a = n(641),
          l = r(s(), Number);
        i(l, { getPolyfill: s, implementation: o, shim: a }), (e.exports = l);
      },
      591: (e, t, n) => {
        'use strict';
        var r = n(6);
        e.exports = function () {
          return Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')
            ? Number.isNaN
            : r;
        };
      },
      641: (e, t, n) => {
        'use strict';
        var r = n(857),
          i = n(591);
        e.exports = function () {
          var e = i();
          return (
            r(
              Number,
              { isNaN: e },
              {
                isNaN: function () {
                  return Number.isNaN !== e;
                },
              },
            ),
            e
          );
        };
      },
      943: (e, t, n) => {
        'use strict';
        var r = n(730);
        e.exports = function (e) {
          return !!r(e);
        };
      },
      372: e => {
        'use strict';
        var t = function (e) {
          return e != e;
        };
        e.exports = function (e, n) {
          return 0 === e && 0 === n
            ? 1 / e == 1 / n
            : e === n || !(!t(e) || !t(n));
        };
      },
      587: (e, t, n) => {
        'use strict';
        var r = n(857),
          i = n(498),
          o = n(372),
          s = n(937),
          a = n(87),
          l = i(s(), Object);
        r(l, { getPolyfill: s, implementation: o, shim: a }), (e.exports = l);
      },
      937: (e, t, n) => {
        'use strict';
        var r = n(372);
        e.exports = function () {
          return 'function' == typeof Object.is ? Object.is : r;
        };
      },
      87: (e, t, n) => {
        'use strict';
        var r = n(937),
          i = n(857);
        e.exports = function () {
          var e = r();
          return (
            i(
              Object,
              { is: e },
              {
                is: function () {
                  return Object.is !== e;
                },
              },
            ),
            e
          );
        };
      },
      160: (e, t, n) => {
        'use strict';
        var r;
        if (!Object.keys) {
          var i = Object.prototype.hasOwnProperty,
            o = Object.prototype.toString,
            s = n(968),
            a = Object.prototype.propertyIsEnumerable,
            l = !a.call({ toString: null }, 'toString'),
            u = a.call(function () {}, 'prototype'),
            c = [
              'toString',
              'toLocaleString',
              'valueOf',
              'hasOwnProperty',
              'isPrototypeOf',
              'propertyIsEnumerable',
              'constructor',
            ],
            h = function (e) {
              var t = e.constructor;
              return t && t.prototype === e;
            },
            f = {
              $applicationCache: !0,
              $console: !0,
              $external: !0,
              $frame: !0,
              $frameElement: !0,
              $frames: !0,
              $innerHeight: !0,
              $innerWidth: !0,
              $onmozfullscreenchange: !0,
              $onmozfullscreenerror: !0,
              $outerHeight: !0,
              $outerWidth: !0,
              $pageXOffset: !0,
              $pageYOffset: !0,
              $parent: !0,
              $scrollLeft: !0,
              $scrollTop: !0,
              $scrollX: !0,
              $scrollY: !0,
              $self: !0,
              $webkitIndexedDB: !0,
              $webkitStorageInfo: !0,
              $window: !0,
            },
            d = (function () {
              if ('undefined' == typeof window) return !1;
              for (var e in window)
                try {
                  if (
                    !f['$' + e] &&
                    i.call(window, e) &&
                    null !== window[e] &&
                    'object' == typeof window[e]
                  )
                    try {
                      h(window[e]);
                    } catch (e) {
                      return !0;
                    }
                } catch (e) {
                  return !0;
                }
              return !1;
            })();
          r = function (e) {
            var t = null !== e && 'object' == typeof e,
              n = '[object Function]' === o.call(e),
              r = s(e),
              a = t && '[object String]' === o.call(e),
              f = [];
            if (!t && !n && !r)
              throw new TypeError('Object.keys called on a non-object');
            var g = u && n;
            if (a && e.length > 0 && !i.call(e, 0))
              for (var m = 0; m < e.length; ++m) f.push(String(m));
            if (r && e.length > 0)
              for (var p = 0; p < e.length; ++p) f.push(String(p));
            else
              for (var y in e)
                (g && 'prototype' === y) || !i.call(e, y) || f.push(String(y));
            if (l)
              for (
                var b = (function (e) {
                    if ('undefined' == typeof window || !d) return h(e);
                    try {
                      return h(e);
                    } catch (e) {
                      return !1;
                    }
                  })(e),
                  v = 0;
                v < c.length;
                ++v
              )
                (b && 'constructor' === c[v]) ||
                  !i.call(e, c[v]) ||
                  f.push(c[v]);
            return f;
          };
        }
        e.exports = r;
      },
      228: (e, t, n) => {
        'use strict';
        var r = Array.prototype.slice,
          i = n(968),
          o = Object.keys,
          s = o
            ? function (e) {
                return o(e);
              }
            : n(160),
          a = Object.keys;
        (s.shim = function () {
          if (Object.keys) {
            var e = (function () {
              var e = Object.keys(arguments);
              return e && e.length === arguments.length;
            })(1, 2);
            e ||
              (Object.keys = function (e) {
                return i(e) ? a(r.call(e)) : a(e);
              });
          } else Object.keys = s;
          return Object.keys || s;
        }),
          (e.exports = s);
      },
      968: e => {
        'use strict';
        var t = Object.prototype.toString;
        e.exports = function (e) {
          var n = t.call(e),
            r = '[object Arguments]' === n;
          return (
            r ||
              (r =
                '[object Array]' !== n &&
                null !== e &&
                'object' == typeof e &&
                'number' == typeof e.length &&
                e.length >= 0 &&
                '[object Function]' === t.call(e.callee)),
            r
          );
        };
      },
      164: (e, t, n) => {
        'use strict';
        var r = n(228),
          i = n(908)(),
          o = n(818),
          s = Object,
          a = o('Array.prototype.push'),
          l = o('Object.prototype.propertyIsEnumerable'),
          u = i ? Object.getOwnPropertySymbols : null;
        e.exports = function (e, t) {
          if (null == e) throw new TypeError('target must be an object');
          var n = s(e);
          if (1 === arguments.length) return n;
          for (var o = 1; o < arguments.length; ++o) {
            var c = s(arguments[o]),
              h = r(c),
              f = i && (Object.getOwnPropertySymbols || u);
            if (f)
              for (var d = f(c), g = 0; g < d.length; ++g) {
                var m = d[g];
                l(c, m) && a(h, m);
              }
            for (var p = 0; p < h.length; ++p) {
              var y = h[p];
              if (l(c, y)) {
                var b = c[y];
                n[y] = b;
              }
            }
          }
          return n;
        };
      },
      225: (e, t, n) => {
        'use strict';
        var r = n(164);
        e.exports = function () {
          return Object.assign
            ? (function () {
                if (!Object.assign) return !1;
                for (
                  var e = 'abcdefghijklmnopqrst',
                    t = e.split(''),
                    n = {},
                    r = 0;
                  r < t.length;
                  ++r
                )
                  n[t[r]] = t[r];
                var i = Object.assign({}, n),
                  o = '';
                for (var s in i) o += s;
                return e !== o;
              })() ||
              (function () {
                if (!Object.assign || !Object.preventExtensions) return !1;
                var e = Object.preventExtensions({ 1: 2 });
                try {
                  Object.assign(e, 'xy');
                } catch (t) {
                  return 'y' === e[1];
                }
                return !1;
              })()
              ? r
              : Object.assign
            : r;
        };
      },
      907: e => {
        var t,
          n,
          r = (e.exports = {});
        function i() {
          throw new Error('setTimeout has not been defined');
        }
        function o() {
          throw new Error('clearTimeout has not been defined');
        }
        function s(e) {
          if (t === setTimeout) return setTimeout(e, 0);
          if ((t === i || !t) && setTimeout)
            return (t = setTimeout), setTimeout(e, 0);
          try {
            return t(e, 0);
          } catch (n) {
            try {
              return t.call(null, e, 0);
            } catch (n) {
              return t.call(this, e, 0);
            }
          }
        }
        !(function () {
          try {
            t = 'function' == typeof setTimeout ? setTimeout : i;
          } catch (e) {
            t = i;
          }
          try {
            n = 'function' == typeof clearTimeout ? clearTimeout : o;
          } catch (e) {
            n = o;
          }
        })();
        var a,
          l = [],
          u = !1,
          c = -1;
        function h() {
          u &&
            a &&
            ((u = !1),
            a.length ? (l = a.concat(l)) : (c = -1),
            l.length && f());
        }
        function f() {
          if (!u) {
            var e = s(h);
            u = !0;
            for (var t = l.length; t; ) {
              for (a = l, l = []; ++c < t; ) a && a[c].run();
              (c = -1), (t = l.length);
            }
            (a = null),
              (u = !1),
              (function (e) {
                if (n === clearTimeout) return clearTimeout(e);
                if ((n === o || !n) && clearTimeout)
                  return (n = clearTimeout), clearTimeout(e);
                try {
                  return n(e);
                } catch (t) {
                  try {
                    return n.call(null, e);
                  } catch (t) {
                    return n.call(this, e);
                  }
                }
              })(e);
          }
        }
        function d(e, t) {
          (this.fun = e), (this.array = t);
        }
        function g() {}
        (r.nextTick = function (e) {
          var t = new Array(arguments.length - 1);
          if (arguments.length > 1)
            for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
          l.push(new d(e, t)), 1 !== l.length || u || s(f);
        }),
          (d.prototype.run = function () {
            this.fun.apply(null, this.array);
          }),
          (r.title = 'browser'),
          (r.browser = !0),
          (r.env = {}),
          (r.argv = []),
          (r.version = ''),
          (r.versions = {}),
          (r.on = g),
          (r.addListener = g),
          (r.once = g),
          (r.off = g),
          (r.removeListener = g),
          (r.removeAllListeners = g),
          (r.emit = g),
          (r.prependListener = g),
          (r.prependOnceListener = g),
          (r.listeners = function (e) {
            return [];
          }),
          (r.binding = function (e) {
            throw new Error('process.binding is not supported');
          }),
          (r.cwd = function () {
            return '/';
          }),
          (r.chdir = function (e) {
            throw new Error('process.chdir is not supported');
          }),
          (r.umask = function () {
            return 0;
          });
      },
      272: e => {
        e.exports = function (e) {
          return (
            e &&
            'object' == typeof e &&
            'function' == typeof e.copy &&
            'function' == typeof e.fill &&
            'function' == typeof e.readUInt8
          );
        };
      },
      531: (e, t, n) => {
        'use strict';
        var r = n(387),
          i = n(625),
          o = n(730),
          s = n(943);
        function a(e) {
          return e.call.bind(e);
        }
        var l = 'undefined' != typeof BigInt,
          u = 'undefined' != typeof Symbol,
          c = a(Object.prototype.toString),
          h = a(Number.prototype.valueOf),
          f = a(String.prototype.valueOf),
          d = a(Boolean.prototype.valueOf);
        if (l) var g = a(BigInt.prototype.valueOf);
        if (u) var m = a(Symbol.prototype.valueOf);
        function p(e, t) {
          if ('object' != typeof e) return !1;
          try {
            return t(e), !0;
          } catch (e) {
            return !1;
          }
        }
        function y(e) {
          return '[object Map]' === c(e);
        }
        function b(e) {
          return '[object Set]' === c(e);
        }
        function v(e) {
          return '[object WeakMap]' === c(e);
        }
        function w(e) {
          return '[object WeakSet]' === c(e);
        }
        function S(e) {
          return '[object ArrayBuffer]' === c(e);
        }
        function _(e) {
          return (
            'undefined' != typeof ArrayBuffer &&
            (S.working ? S(e) : e instanceof ArrayBuffer)
          );
        }
        function C(e) {
          return '[object DataView]' === c(e);
        }
        function E(e) {
          return (
            'undefined' != typeof DataView &&
            (C.working ? C(e) : e instanceof DataView)
          );
        }
        (t.isArgumentsObject = r),
          (t.isGeneratorFunction = i),
          (t.isTypedArray = s),
          (t.isPromise = function (e) {
            return (
              ('undefined' != typeof Promise && e instanceof Promise) ||
              (null !== e &&
                'object' == typeof e &&
                'function' == typeof e.then &&
                'function' == typeof e.catch)
            );
          }),
          (t.isArrayBufferView = function (e) {
            return 'undefined' != typeof ArrayBuffer && ArrayBuffer.isView
              ? ArrayBuffer.isView(e)
              : s(e) || E(e);
          }),
          (t.isUint8Array = function (e) {
            return 'Uint8Array' === o(e);
          }),
          (t.isUint8ClampedArray = function (e) {
            return 'Uint8ClampedArray' === o(e);
          }),
          (t.isUint16Array = function (e) {
            return 'Uint16Array' === o(e);
          }),
          (t.isUint32Array = function (e) {
            return 'Uint32Array' === o(e);
          }),
          (t.isInt8Array = function (e) {
            return 'Int8Array' === o(e);
          }),
          (t.isInt16Array = function (e) {
            return 'Int16Array' === o(e);
          }),
          (t.isInt32Array = function (e) {
            return 'Int32Array' === o(e);
          }),
          (t.isFloat32Array = function (e) {
            return 'Float32Array' === o(e);
          }),
          (t.isFloat64Array = function (e) {
            return 'Float64Array' === o(e);
          }),
          (t.isBigInt64Array = function (e) {
            return 'BigInt64Array' === o(e);
          }),
          (t.isBigUint64Array = function (e) {
            return 'BigUint64Array' === o(e);
          }),
          (y.working = 'undefined' != typeof Map && y(new Map())),
          (t.isMap = function (e) {
            return (
              'undefined' != typeof Map && (y.working ? y(e) : e instanceof Map)
            );
          }),
          (b.working = 'undefined' != typeof Set && b(new Set())),
          (t.isSet = function (e) {
            return (
              'undefined' != typeof Set && (b.working ? b(e) : e instanceof Set)
            );
          }),
          (v.working = 'undefined' != typeof WeakMap && v(new WeakMap())),
          (t.isWeakMap = function (e) {
            return (
              'undefined' != typeof WeakMap &&
              (v.working ? v(e) : e instanceof WeakMap)
            );
          }),
          (w.working = 'undefined' != typeof WeakSet && w(new WeakSet())),
          (t.isWeakSet = function (e) {
            return w(e);
          }),
          (S.working =
            'undefined' != typeof ArrayBuffer && S(new ArrayBuffer())),
          (t.isArrayBuffer = _),
          (C.working =
            'undefined' != typeof ArrayBuffer &&
            'undefined' != typeof DataView &&
            C(new DataView(new ArrayBuffer(1), 0, 1))),
          (t.isDataView = E);
        var A =
          'undefined' != typeof SharedArrayBuffer ? SharedArrayBuffer : void 0;
        function x(e) {
          return '[object SharedArrayBuffer]' === c(e);
        }
        function N(e) {
          return (
            void 0 !== A &&
            (void 0 === x.working && (x.working = x(new A())),
            x.working ? x(e) : e instanceof A)
          );
        }
        function L(e) {
          return p(e, h);
        }
        function O(e) {
          return p(e, f);
        }
        function k(e) {
          return p(e, d);
        }
        function R(e) {
          return l && p(e, g);
        }
        function T(e) {
          return u && p(e, m);
        }
        (t.isSharedArrayBuffer = N),
          (t.isAsyncFunction = function (e) {
            return '[object AsyncFunction]' === c(e);
          }),
          (t.isMapIterator = function (e) {
            return '[object Map Iterator]' === c(e);
          }),
          (t.isSetIterator = function (e) {
            return '[object Set Iterator]' === c(e);
          }),
          (t.isGeneratorObject = function (e) {
            return '[object Generator]' === c(e);
          }),
          (t.isWebAssemblyCompiledModule = function (e) {
            return '[object WebAssembly.Module]' === c(e);
          }),
          (t.isNumberObject = L),
          (t.isStringObject = O),
          (t.isBooleanObject = k),
          (t.isBigIntObject = R),
          (t.isSymbolObject = T),
          (t.isBoxedPrimitive = function (e) {
            return L(e) || O(e) || k(e) || R(e) || T(e);
          }),
          (t.isAnyArrayBuffer = function (e) {
            return 'undefined' != typeof Uint8Array && (_(e) || N(e));
          }),
          ['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(
            function (e) {
              Object.defineProperty(t, e, {
                enumerable: !1,
                value: function () {
                  throw new Error(e + ' is not supported in userland');
                },
              });
            },
          );
      },
      208: (e, t, n) => {
        var r = n(907),
          i = n(364),
          o =
            Object.getOwnPropertyDescriptors ||
            function (e) {
              for (var t = Object.keys(e), n = {}, r = 0; r < t.length; r++)
                n[t[r]] = Object.getOwnPropertyDescriptor(e, t[r]);
              return n;
            },
          s = /%[sdj%]/g;
        (t.format = function (e) {
          if (!w(e)) {
            for (var t = [], n = 0; n < arguments.length; n++)
              t.push(c(arguments[n]));
            return t.join(' ');
          }
          n = 1;
          for (
            var r = arguments,
              i = r.length,
              o = String(e).replace(s, function (e) {
                if ('%%' === e) return '%';
                if (n >= i) return e;
                switch (e) {
                  case '%s':
                    return String(r[n++]);
                  case '%d':
                    return Number(r[n++]);
                  case '%j':
                    try {
                      return JSON.stringify(r[n++]);
                    } catch (e) {
                      return '[Circular]';
                    }
                  default:
                    return e;
                }
              }),
              a = r[n];
            n < i;
            a = r[++n]
          )
            b(a) || !C(a) ? (o += ' ' + a) : (o += ' ' + c(a));
          return o;
        }),
          (t.deprecate = function (e, n) {
            if (void 0 !== r && !0 === r.noDeprecation) return e;
            if (void 0 === r)
              return function () {
                return t.deprecate(e, n).apply(this, arguments);
              };
            var o = !1;
            return function () {
              if (!o) {
                if (r.throwDeprecation) throw new Error(n);
                r.traceDeprecation ? i.trace(n) : i.error(n), (o = !0);
              }
              return e.apply(this, arguments);
            };
          });
        var a = {},
          l = /^$/;
        if (r.env.NODE_DEBUG) {
          var u = r.env.NODE_DEBUG;
          (u = u
            .replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/,/g, '$|^')
            .toUpperCase()),
            (l = new RegExp('^' + u + '$', 'i'));
        }
        function c(e, n) {
          var r = { seen: [], stylize: f };
          return (
            arguments.length >= 3 && (r.depth = arguments[2]),
            arguments.length >= 4 && (r.colors = arguments[3]),
            y(n) ? (r.showHidden = n) : n && t._extend(r, n),
            S(r.showHidden) && (r.showHidden = !1),
            S(r.depth) && (r.depth = 2),
            S(r.colors) && (r.colors = !1),
            S(r.customInspect) && (r.customInspect = !0),
            r.colors && (r.stylize = h),
            d(r, e, r.depth)
          );
        }
        function h(e, t) {
          var n = c.styles[t];
          return n
            ? '[' + c.colors[n][0] + 'm' + e + '[' + c.colors[n][1] + 'm'
            : e;
        }
        function f(e, t) {
          return e;
        }
        function d(e, n, r) {
          if (
            e.customInspect &&
            n &&
            x(n.inspect) &&
            n.inspect !== t.inspect &&
            (!n.constructor || n.constructor.prototype !== n)
          ) {
            var i = n.inspect(r, e);
            return w(i) || (i = d(e, i, r)), i;
          }
          var o = (function (e, t) {
            if (S(t)) return e.stylize('undefined', 'undefined');
            if (w(t)) {
              var n =
                "'" +
                JSON.stringify(t)
                  .replace(/^"|"$/g, '')
                  .replace(/'/g, "\\'")
                  .replace(/\\"/g, '"') +
                "'";
              return e.stylize(n, 'string');
            }
            if (v(t)) return e.stylize('' + t, 'number');
            if (y(t)) return e.stylize('' + t, 'boolean');
            if (b(t)) return e.stylize('null', 'null');
          })(e, n);
          if (o) return o;
          var s = Object.keys(n),
            a = (function (e) {
              var t = {};
              return (
                e.forEach(function (e, n) {
                  t[e] = !0;
                }),
                t
              );
            })(s);
          if (
            (e.showHidden && (s = Object.getOwnPropertyNames(n)),
            A(n) &&
              (s.indexOf('message') >= 0 || s.indexOf('description') >= 0))
          )
            return g(n);
          if (0 === s.length) {
            if (x(n)) {
              var l = n.name ? ': ' + n.name : '';
              return e.stylize('[Function' + l + ']', 'special');
            }
            if (_(n))
              return e.stylize(RegExp.prototype.toString.call(n), 'regexp');
            if (E(n)) return e.stylize(Date.prototype.toString.call(n), 'date');
            if (A(n)) return g(n);
          }
          var u,
            c = '',
            h = !1,
            f = ['{', '}'];
          (p(n) && ((h = !0), (f = ['[', ']'])), x(n)) &&
            (c = ' [Function' + (n.name ? ': ' + n.name : '') + ']');
          return (
            _(n) && (c = ' ' + RegExp.prototype.toString.call(n)),
            E(n) && (c = ' ' + Date.prototype.toUTCString.call(n)),
            A(n) && (c = ' ' + g(n)),
            0 !== s.length || (h && 0 != n.length)
              ? r < 0
                ? _(n)
                  ? e.stylize(RegExp.prototype.toString.call(n), 'regexp')
                  : e.stylize('[Object]', 'special')
                : (e.seen.push(n),
                  (u = h
                    ? (function (e, t, n, r, i) {
                        for (var o = [], s = 0, a = t.length; s < a; ++s)
                          k(t, String(s))
                            ? o.push(m(e, t, n, r, String(s), !0))
                            : o.push('');
                        return (
                          i.forEach(function (i) {
                            i.match(/^\d+$/) || o.push(m(e, t, n, r, i, !0));
                          }),
                          o
                        );
                      })(e, n, r, a, s)
                    : s.map(function (t) {
                        return m(e, n, r, a, t, h);
                      })),
                  e.seen.pop(),
                  (function (e, t, n) {
                    var r = e.reduce(function (e, t) {
                      return (
                        t.indexOf('\n') >= 0 && 0,
                        e + t.replace(/\u001b\[\d\d?m/g, '').length + 1
                      );
                    }, 0);
                    if (r > 60)
                      return (
                        n[0] +
                        ('' === t ? '' : t + '\n ') +
                        ' ' +
                        e.join(',\n  ') +
                        ' ' +
                        n[1]
                      );
                    return n[0] + t + ' ' + e.join(', ') + ' ' + n[1];
                  })(u, c, f))
              : f[0] + c + f[1]
          );
        }
        function g(e) {
          return '[' + Error.prototype.toString.call(e) + ']';
        }
        function m(e, t, n, r, i, o) {
          var s, a, l;
          if (
            ((l = Object.getOwnPropertyDescriptor(t, i) || { value: t[i] }).get
              ? (a = l.set
                  ? e.stylize('[Getter/Setter]', 'special')
                  : e.stylize('[Getter]', 'special'))
              : l.set && (a = e.stylize('[Setter]', 'special')),
            k(r, i) || (s = '[' + i + ']'),
            a ||
              (e.seen.indexOf(l.value) < 0
                ? (a = b(n)
                    ? d(e, l.value, null)
                    : d(e, l.value, n - 1)).indexOf('\n') > -1 &&
                  (a = o
                    ? a
                        .split('\n')
                        .map(function (e) {
                          return '  ' + e;
                        })
                        .join('\n')
                        .slice(2)
                    : '\n' +
                      a
                        .split('\n')
                        .map(function (e) {
                          return '   ' + e;
                        })
                        .join('\n'))
                : (a = e.stylize('[Circular]', 'special'))),
            S(s))
          ) {
            if (o && i.match(/^\d+$/)) return a;
            (s = JSON.stringify('' + i)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)
              ? ((s = s.slice(1, -1)), (s = e.stylize(s, 'name')))
              : ((s = s
                  .replace(/'/g, "\\'")
                  .replace(/\\"/g, '"')
                  .replace(/(^"|"$)/g, "'")),
                (s = e.stylize(s, 'string')));
          }
          return s + ': ' + a;
        }
        function p(e) {
          return Array.isArray(e);
        }
        function y(e) {
          return 'boolean' == typeof e;
        }
        function b(e) {
          return null === e;
        }
        function v(e) {
          return 'number' == typeof e;
        }
        function w(e) {
          return 'string' == typeof e;
        }
        function S(e) {
          return void 0 === e;
        }
        function _(e) {
          return C(e) && '[object RegExp]' === N(e);
        }
        function C(e) {
          return 'object' == typeof e && null !== e;
        }
        function E(e) {
          return C(e) && '[object Date]' === N(e);
        }
        function A(e) {
          return C(e) && ('[object Error]' === N(e) || e instanceof Error);
        }
        function x(e) {
          return 'function' == typeof e;
        }
        function N(e) {
          return Object.prototype.toString.call(e);
        }
        function L(e) {
          return e < 10 ? '0' + e.toString(10) : e.toString(10);
        }
        (t.debuglog = function (e) {
          if (((e = e.toUpperCase()), !a[e]))
            if (l.test(e)) {
              var n = r.pid;
              a[e] = function () {
                var r = t.format.apply(t, arguments);
                i.error('%s %d: %s', e, n, r);
              };
            } else a[e] = function () {};
          return a[e];
        }),
          (t.inspect = c),
          (c.colors = {
            bold: [1, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            white: [37, 39],
            grey: [90, 39],
            black: [30, 39],
            blue: [34, 39],
            cyan: [36, 39],
            green: [32, 39],
            magenta: [35, 39],
            red: [31, 39],
            yellow: [33, 39],
          }),
          (c.styles = {
            special: 'cyan',
            number: 'yellow',
            boolean: 'yellow',
            undefined: 'grey',
            null: 'bold',
            string: 'green',
            date: 'magenta',
            regexp: 'red',
          }),
          (t.types = n(531)),
          (t.isArray = p),
          (t.isBoolean = y),
          (t.isNull = b),
          (t.isNullOrUndefined = function (e) {
            return null == e;
          }),
          (t.isNumber = v),
          (t.isString = w),
          (t.isSymbol = function (e) {
            return 'symbol' == typeof e;
          }),
          (t.isUndefined = S),
          (t.isRegExp = _),
          (t.types.isRegExp = _),
          (t.isObject = C),
          (t.isDate = E),
          (t.types.isDate = E),
          (t.isError = A),
          (t.types.isNativeError = A),
          (t.isFunction = x),
          (t.isPrimitive = function (e) {
            return (
              null === e ||
              'boolean' == typeof e ||
              'number' == typeof e ||
              'string' == typeof e ||
              'symbol' == typeof e ||
              void 0 === e
            );
          }),
          (t.isBuffer = n(272));
        var O = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        function k(e, t) {
          return Object.prototype.hasOwnProperty.call(e, t);
        }
        (t.log = function () {
          var e, n;
          i.log(
            '%s - %s',
            ((e = new Date()),
            (n = [L(e.getHours()), L(e.getMinutes()), L(e.getSeconds())].join(
              ':',
            )),
            [e.getDate(), O[e.getMonth()], n].join(' ')),
            t.format.apply(t, arguments),
          );
        }),
          (t.inherits = n(615)),
          (t._extend = function (e, t) {
            if (!t || !C(t)) return e;
            for (var n = Object.keys(t), r = n.length; r--; ) e[n[r]] = t[n[r]];
            return e;
          });
        var R =
          'undefined' != typeof Symbol
            ? Symbol('util.promisify.custom')
            : void 0;
        function T(e, t) {
          if (!e) {
            var n = new Error('Promise was rejected with a falsy value');
            (n.reason = e), (e = n);
          }
          return t(e);
        }
        (t.promisify = function (e) {
          if ('function' != typeof e)
            throw new TypeError(
              'The "original" argument must be of type Function',
            );
          if (R && e[R]) {
            var t;
            if ('function' != typeof (t = e[R]))
              throw new TypeError(
                'The "util.promisify.custom" argument must be of type Function',
              );
            return (
              Object.defineProperty(t, R, {
                value: t,
                enumerable: !1,
                writable: !1,
                configurable: !0,
              }),
              t
            );
          }
          function t() {
            for (
              var t,
                n,
                r = new Promise(function (e, r) {
                  (t = e), (n = r);
                }),
                i = [],
                o = 0;
              o < arguments.length;
              o++
            )
              i.push(arguments[o]);
            i.push(function (e, r) {
              e ? n(e) : t(r);
            });
            try {
              e.apply(this, i);
            } catch (e) {
              n(e);
            }
            return r;
          }
          return (
            Object.setPrototypeOf(t, Object.getPrototypeOf(e)),
            R &&
              Object.defineProperty(t, R, {
                value: t,
                enumerable: !1,
                writable: !1,
                configurable: !0,
              }),
            Object.defineProperties(t, o(e))
          );
        }),
          (t.promisify.custom = R),
          (t.callbackify = function (e) {
            if ('function' != typeof e)
              throw new TypeError(
                'The "original" argument must be of type Function',
              );
            function t() {
              for (var t = [], n = 0; n < arguments.length; n++)
                t.push(arguments[n]);
              var i = t.pop();
              if ('function' != typeof i)
                throw new TypeError(
                  'The last argument must be of type Function',
                );
              var o = this,
                s = function () {
                  return i.apply(o, arguments);
                };
              e.apply(this, t).then(
                function (e) {
                  r.nextTick(s.bind(null, null, e));
                },
                function (e) {
                  r.nextTick(T.bind(null, e, s));
                },
              );
            }
            return (
              Object.setPrototypeOf(t, Object.getPrototypeOf(e)),
              Object.defineProperties(t, o(e)),
              t
            );
          });
      },
      730: (e, t, n) => {
        'use strict';
        var r = n(705),
          i = n(834),
          o = n(498),
          s = n(818),
          a = n(336),
          l = s('Object.prototype.toString'),
          u = n(913)(),
          c = 'undefined' == typeof globalThis ? n.g : globalThis,
          h = i(),
          f = s('String.prototype.slice'),
          d = Object.getPrototypeOf,
          g =
            s('Array.prototype.indexOf', !0) ||
            function (e, t) {
              for (var n = 0; n < e.length; n += 1) if (e[n] === t) return n;
              return -1;
            },
          m = { __proto__: null };
        r(
          h,
          u && a && d
            ? function (e) {
                var t = new c[e]();
                if (Symbol.toStringTag in t) {
                  var n = d(t),
                    r = a(n, Symbol.toStringTag);
                  if (!r) {
                    var i = d(n);
                    r = a(i, Symbol.toStringTag);
                  }
                  m['$' + e] = o(r.get);
                }
              }
            : function (e) {
                var t = new c[e]();
                m['$' + e] = o(t.slice);
              },
        );
        e.exports = function (e) {
          if (!e || 'object' != typeof e) return !1;
          if (!u) {
            var t = f(l(e), 8, -1);
            return g(h, t) > -1
              ? t
              : 'Object' === t &&
                  (function (e) {
                    var t = !1;
                    return (
                      r(m, function (n, r) {
                        if (!t)
                          try {
                            n(e), (t = f(r, 1));
                          } catch (e) {}
                      }),
                      t
                    );
                  })(e);
          }
          return a
            ? (function (e) {
                var t = !1;
                return (
                  r(m, function (n, r) {
                    if (!t)
                      try {
                        '$' + n(e) === r && (t = f(r, 1));
                      } catch (e) {}
                  }),
                  t
                );
              })(e)
            : null;
        };
      },
      834: (e, t, n) => {
        'use strict';
        var r = [
            'BigInt64Array',
            'BigUint64Array',
            'Float32Array',
            'Float64Array',
            'Int16Array',
            'Int32Array',
            'Int8Array',
            'Uint16Array',
            'Uint32Array',
            'Uint8Array',
            'Uint8ClampedArray',
          ],
          i = 'undefined' == typeof globalThis ? n.g : globalThis;
        e.exports = function () {
          for (var e = [], t = 0; t < r.length; t++)
            'function' == typeof i[r[t]] && (e[e.length] = r[t]);
          return e;
        };
      },
    },
    t = {};
  function n(r) {
    var i = t[r];
    if (void 0 !== i) return i.exports;
    var o = (t[r] = { exports: {} });
    return e[r](o, o.exports, n), o.exports;
  }
  (n.g = (function () {
    if ('object' == typeof globalThis) return globalThis;
    try {
      return this || new Function('return this')();
    } catch (e) {
      if ('object' == typeof window) return window;
    }
  })()),
    (() => {
      'use strict';
      const e = new (class {
        constructor() {
          (this.listeners = []),
            (this.unexpectedErrorHandler = function (e) {
              setTimeout(() => {
                if (e.stack) {
                  if (a.isErrorNoTelemetry(e))
                    throw new a(e.message + '\n\n' + e.stack);
                  throw new Error(e.message + '\n\n' + e.stack);
                }
                throw e;
              }, 0);
            });
        }
        emit(e) {
          this.listeners.forEach(t => {
            t(e);
          });
        }
        onUnexpectedError(e) {
          this.unexpectedErrorHandler(e), this.emit(e);
        }
        onUnexpectedExternalError(e) {
          this.unexpectedErrorHandler(e);
        }
      })();
      function t(t) {
        o(t) || e.onUnexpectedError(t);
      }
      function r(e) {
        if (e instanceof Error) {
          const { name: t, message: n } = e;
          return {
            $isError: !0,
            name: t,
            message: n,
            stack: e.stacktrace || e.stack,
            noTelemetry: a.isErrorNoTelemetry(e),
          };
        }
        return e;
      }
      const i = 'Canceled';
      function o(e) {
        return (
          e instanceof s ||
          (e instanceof Error && e.name === i && e.message === i)
        );
      }
      class s extends Error {
        constructor() {
          super(i), (this.name = this.message);
        }
      }
      Error;
      class a extends Error {
        constructor(e) {
          super(e), (this.name = 'CodeExpectedError');
        }
        static fromError(e) {
          if (e instanceof a) return e;
          const t = new a();
          return (t.message = e.message), (t.stack = e.stack), t;
        }
        static isErrorNoTelemetry(e) {
          return 'CodeExpectedError' === e.name;
        }
      }
      class l extends Error {
        constructor(e) {
          super(e || 'An unexpected bug occurred.'),
            Object.setPrototypeOf(this, l.prototype);
        }
      }
      function u(e, t) {
        const n = this;
        let r,
          i = !1;
        return function () {
          if (i) return r;
          if (((i = !0), t))
            try {
              r = e.apply(n, arguments);
            } finally {
              t();
            }
          else r = e.apply(n, arguments);
          return r;
        };
      }
      var c;
      !(function (e) {
        function t(e) {
          return (
            e && 'object' == typeof e && 'function' == typeof e[Symbol.iterator]
          );
        }
        e.is = t;
        const n = Object.freeze([]);
        function* r(e) {
          yield e;
        }
        (e.empty = function () {
          return n;
        }),
          (e.single = r),
          (e.wrap = function (e) {
            return t(e) ? e : r(e);
          }),
          (e.from = function (e) {
            return e || n;
          }),
          (e.reverse = function* (e) {
            for (let t = e.length - 1; t >= 0; t--) yield e[t];
          }),
          (e.isEmpty = function (e) {
            return !e || !0 === e[Symbol.iterator]().next().done;
          }),
          (e.first = function (e) {
            return e[Symbol.iterator]().next().value;
          }),
          (e.some = function (e, t) {
            for (const n of e) if (t(n)) return !0;
            return !1;
          }),
          (e.find = function (e, t) {
            for (const n of e) if (t(n)) return n;
          }),
          (e.filter = function* (e, t) {
            for (const n of e) t(n) && (yield n);
          }),
          (e.map = function* (e, t) {
            let n = 0;
            for (const r of e) yield t(r, n++);
          }),
          (e.concat = function* (...e) {
            for (const t of e) yield* t;
          }),
          (e.reduce = function (e, t, n) {
            let r = n;
            for (const n of e) r = t(r, n);
            return r;
          }),
          (e.slice = function* (e, t, n = e.length) {
            for (
              t < 0 && (t += e.length),
                n < 0 ? (n += e.length) : n > e.length && (n = e.length);
              t < n;
              t++
            )
              yield e[t];
          }),
          (e.consume = function (t, n = Number.POSITIVE_INFINITY) {
            const r = [];
            if (0 === n) return [r, t];
            const i = t[Symbol.iterator]();
            for (let t = 0; t < n; t++) {
              const t = i.next();
              if (t.done) return [r, e.empty()];
              r.push(t.value);
            }
            return [r, { [Symbol.iterator]: () => i }];
          }),
          (e.asyncToArray = async function (e) {
            const t = [];
            for await (const n of e) t.push(n);
            return Promise.resolve(t);
          });
      })(c || (c = {}));
      var h = n(364);
      let f = null;
      function d(e) {
        return null == f || f.trackDisposable(e), e;
      }
      function g(e) {
        null == f || f.markAsDisposed(e);
      }
      function m(e, t) {
        null == f || f.setParent(e, t);
      }
      function p(e) {
        if (c.is(e)) {
          const t = [];
          for (const n of e)
            if (n)
              try {
                n.dispose();
              } catch (e) {
                t.push(e);
              }
          if (1 === t.length) throw t[0];
          if (t.length > 1)
            throw new AggregateError(
              t,
              'Encountered errors while disposing of store',
            );
          return Array.isArray(e) ? [] : e;
        }
        if (e) return e.dispose(), e;
      }
      function y(...e) {
        const t = b(() => p(e));
        return (
          (function (e, t) {
            if (f) for (const n of e) f.setParent(n, t);
          })(e, t),
          t
        );
      }
      function b(e) {
        const t = d({
          dispose: u(() => {
            g(t), e();
          }),
        });
        return t;
      }
      class v {
        constructor() {
          (this._toDispose = new Set()), (this._isDisposed = !1), d(this);
        }
        dispose() {
          this._isDisposed || (g(this), (this._isDisposed = !0), this.clear());
        }
        get isDisposed() {
          return this._isDisposed;
        }
        clear() {
          if (0 !== this._toDispose.size)
            try {
              p(this._toDispose);
            } finally {
              this._toDispose.clear();
            }
        }
        add(e) {
          if (!e) return e;
          if (e === this)
            throw new Error('Cannot register a disposable on itself!');
          return (
            m(e, this),
            this._isDisposed
              ? v.DISABLE_DISPOSED_WARNING ||
                h.warn(
                  new Error(
                    'Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!',
                  ).stack,
                )
              : this._toDispose.add(e),
            e
          );
        }
        deleteAndLeak(e) {
          e &&
            this._toDispose.has(e) &&
            (this._toDispose.delete(e), m(e, null));
        }
      }
      v.DISABLE_DISPOSED_WARNING = !1;
      class w {
        constructor() {
          (this._store = new v()), d(this), m(this._store, this);
        }
        dispose() {
          g(this), this._store.dispose();
        }
        _register(e) {
          if (e === this)
            throw new Error('Cannot register a disposable on itself!');
          return this._store.add(e);
        }
      }
      w.None = Object.freeze({ dispose() {} });
      Symbol.iterator;
      class S {
        constructor(e) {
          (this.element = e),
            (this.next = S.Undefined),
            (this.prev = S.Undefined);
        }
      }
      S.Undefined = new S(void 0);
      class _ {
        constructor() {
          (this._first = S.Undefined),
            (this._last = S.Undefined),
            (this._size = 0);
        }
        get size() {
          return this._size;
        }
        isEmpty() {
          return this._first === S.Undefined;
        }
        clear() {
          let e = this._first;
          for (; e !== S.Undefined; ) {
            const t = e.next;
            (e.prev = S.Undefined), (e.next = S.Undefined), (e = t);
          }
          (this._first = S.Undefined),
            (this._last = S.Undefined),
            (this._size = 0);
        }
        unshift(e) {
          return this._insert(e, !1);
        }
        push(e) {
          return this._insert(e, !0);
        }
        _insert(e, t) {
          const n = new S(e);
          if (this._first === S.Undefined) (this._first = n), (this._last = n);
          else if (t) {
            const e = this._last;
            (this._last = n), (n.prev = e), (e.next = n);
          } else {
            const e = this._first;
            (this._first = n), (n.next = e), (e.prev = n);
          }
          this._size += 1;
          let r = !1;
          return () => {
            r || ((r = !0), this._remove(n));
          };
        }
        shift() {
          if (this._first !== S.Undefined) {
            const e = this._first.element;
            return this._remove(this._first), e;
          }
        }
        pop() {
          if (this._last !== S.Undefined) {
            const e = this._last.element;
            return this._remove(this._last), e;
          }
        }
        _remove(e) {
          if (e.prev !== S.Undefined && e.next !== S.Undefined) {
            const t = e.prev;
            (t.next = e.next), (e.next.prev = t);
          } else
            e.prev === S.Undefined && e.next === S.Undefined
              ? ((this._first = S.Undefined), (this._last = S.Undefined))
              : e.next === S.Undefined
              ? ((this._last = this._last.prev),
                (this._last.next = S.Undefined))
              : e.prev === S.Undefined &&
                ((this._first = this._first.next),
                (this._first.prev = S.Undefined));
          this._size -= 1;
        }
        *[Symbol.iterator]() {
          let e = this._first;
          for (; e !== S.Undefined; ) yield e.element, (e = e.next);
        }
      }
      const C =
        globalThis.performance &&
        'function' == typeof globalThis.performance.now;
      class E {
        static create(e) {
          return new E(e);
        }
        constructor(e) {
          (this._now =
            C && !1 === e
              ? Date.now
              : globalThis.performance.now.bind(globalThis.performance)),
            (this._startTime = this._now()),
            (this._stopTime = -1);
        }
        stop() {
          this._stopTime = this._now();
        }
        elapsed() {
          return -1 !== this._stopTime
            ? this._stopTime - this._startTime
            : this._now() - this._startTime;
        }
      }
      var A = n(364);
      var x;
      !(function (e) {
        function t(e) {
          false;
        }
        function n(e) {
          return (t, n = null, r) => {
            let i,
              o = !1;
            return (
              (i = e(
                e => {
                  if (!o) return i ? i.dispose() : (o = !0), t.call(n, e);
                },
                null,
                r,
              )),
              o && i.dispose(),
              i
            );
          };
        }
        function r(e, t, n) {
          return o((n, r = null, i) => e(e => n.call(r, t(e)), null, i), n);
        }
        function i(e, t, n) {
          return o(
            (n, r = null, i) => e(e => t(e) && n.call(r, e), null, i),
            n,
          );
        }
        function o(e, n) {
          let r;
          const i = {
            onWillAddFirstListener() {
              r = e(o.fire, o);
            },
            onDidRemoveLastListener() {
              null == r || r.dispose();
            },
          };
          n || t();
          const o = new R(i);
          return null == n || n.add(o), o.event;
        }
        function s(e, n, r = 100, i = !1, o = !1, s, a) {
          let l,
            u,
            c,
            h,
            f = 0;
          const d = {
            leakWarningThreshold: s,
            onWillAddFirstListener() {
              l = e(e => {
                f++,
                  (u = n(u, e)),
                  i && !c && (g.fire(u), (u = void 0)),
                  (h = () => {
                    const e = u;
                    (u = void 0),
                      (c = void 0),
                      (!i || f > 1) && g.fire(e),
                      (f = 0);
                  }),
                  'number' == typeof r
                    ? (clearTimeout(c), (c = setTimeout(h, r)))
                    : void 0 === c && ((c = 0), queueMicrotask(h));
              });
            },
            onWillRemoveListener() {
              o && f > 0 && (null == h || h());
            },
            onDidRemoveLastListener() {
              (h = void 0), l.dispose();
            },
          };
          a || t();
          const g = new R(d);
          return null == a || a.add(g), g.event;
        }
        (e.None = () => w.None),
          (e.defer = function (e, t) {
            return s(e, () => {}, 0, void 0, !0, void 0, t);
          }),
          (e.once = n),
          (e.map = r),
          (e.forEach = function (e, t, n) {
            return o(
              (n, r = null, i) =>
                e(
                  e => {
                    t(e), n.call(r, e);
                  },
                  null,
                  i,
                ),
              n,
            );
          }),
          (e.filter = i),
          (e.signal = function (e) {
            return e;
          }),
          (e.any = function (...e) {
            return (t, n = null, r) =>
              (function (e, t) {
                t instanceof Array ? t.push(e) : t && t.add(e);
                return e;
              })(y(...e.map(e => e(e => t.call(n, e)))), r);
          }),
          (e.reduce = function (e, t, n, i) {
            let o = n;
            return r(e, e => ((o = t(o, e)), o), i);
          }),
          (e.debounce = s),
          (e.accumulate = function (t, n = 0, r) {
            return e.debounce(
              t,
              (e, t) => (e ? (e.push(t), e) : [t]),
              n,
              void 0,
              !0,
              void 0,
              r,
            );
          }),
          (e.latch = function (e, t = (e, t) => e === t, n) {
            let r,
              o = !0;
            return i(
              e,
              e => {
                const n = o || !t(e, r);
                return (o = !1), (r = e), n;
              },
              n,
            );
          }),
          (e.split = function (t, n, r) {
            return [e.filter(t, n, r), e.filter(t, e => !n(e), r)];
          }),
          (e.buffer = function (e, t = !1, n = [], r) {
            let i = n.slice(),
              o = e(e => {
                i ? i.push(e) : a.fire(e);
              });
            r && r.add(o);
            const s = () => {
                null == i || i.forEach(e => a.fire(e)), (i = null);
              },
              a = new R({
                onWillAddFirstListener() {
                  o || ((o = e(e => a.fire(e))), r && r.add(o));
                },
                onDidAddFirstListener() {
                  i && (t ? setTimeout(s) : s());
                },
                onDidRemoveLastListener() {
                  o && o.dispose(), (o = null);
                },
              });
            return r && r.add(a), a.event;
          }),
          (e.chain = function (e, t) {
            return (n, r, i) => {
              const o = t(new l());
              return e(
                function (e) {
                  const t = o.evaluate(e);
                  t !== a && n.call(r, t);
                },
                void 0,
                i,
              );
            };
          });
        const a = Symbol('HaltChainable');
        class l {
          constructor() {
            this.steps = [];
          }
          map(e) {
            return this.steps.push(e), this;
          }
          forEach(e) {
            return this.steps.push(t => (e(t), t)), this;
          }
          filter(e) {
            return this.steps.push(t => (e(t) ? t : a)), this;
          }
          reduce(e, t) {
            let n = t;
            return this.steps.push(t => ((n = e(n, t)), n)), this;
          }
          latch(e = (e, t) => e === t) {
            let t,
              n = !0;
            return (
              this.steps.push(r => {
                const i = n || !e(r, t);
                return (n = !1), (t = r), i ? r : a;
              }),
              this
            );
          }
          evaluate(e) {
            for (const t of this.steps) if ((e = t(e)) === a) break;
            return e;
          }
        }
        (e.fromNodeEventEmitter = function (e, t, n = e => e) {
          const r = (...e) => i.fire(n(...e)),
            i = new R({
              onWillAddFirstListener: () => e.on(t, r),
              onDidRemoveLastListener: () => e.removeListener(t, r),
            });
          return i.event;
        }),
          (e.fromDOMEventEmitter = function (e, t, n = e => e) {
            const r = (...e) => i.fire(n(...e)),
              i = new R({
                onWillAddFirstListener: () => e.addEventListener(t, r),
                onDidRemoveLastListener: () => e.removeEventListener(t, r),
              });
            return i.event;
          }),
          (e.toPromise = function (e) {
            return new Promise(t => n(e)(t));
          }),
          (e.fromPromise = function (e) {
            const t = new R();
            return (
              e
                .then(
                  e => {
                    t.fire(e);
                  },
                  () => {
                    t.fire(void 0);
                  },
                )
                .finally(() => {
                  t.dispose();
                }),
              t.event
            );
          }),
          (e.runAndSubscribe = function (e, t, n) {
            return t(n), e(e => t(e));
          });
        class u {
          constructor(e, n) {
            (this._observable = e),
              (this._counter = 0),
              (this._hasChanged = !1);
            const r = {
              onWillAddFirstListener: () => {
                e.addObserver(this);
              },
              onDidRemoveLastListener: () => {
                e.removeObserver(this);
              },
            };
            n || t(), (this.emitter = new R(r)), n && n.add(this.emitter);
          }
          beginUpdate(e) {
            this._counter++;
          }
          handlePossibleChange(e) {}
          handleChange(e, t) {
            this._hasChanged = !0;
          }
          endUpdate(e) {
            this._counter--,
              0 === this._counter &&
                (this._observable.reportChanges(),
                this._hasChanged &&
                  ((this._hasChanged = !1),
                  this.emitter.fire(this._observable.get())));
          }
        }
        (e.fromObservable = function (e, t) {
          return new u(e, t).emitter.event;
        }),
          (e.fromObservableLight = function (e) {
            return (t, n, r) => {
              let i = 0,
                o = !1;
              const s = {
                beginUpdate() {
                  i++;
                },
                endUpdate() {
                  i--,
                    0 === i && (e.reportChanges(), o && ((o = !1), t.call(n)));
                },
                handlePossibleChange() {},
                handleChange() {
                  o = !0;
                },
              };
              e.addObserver(s), e.reportChanges();
              const a = {
                dispose() {
                  e.removeObserver(s);
                },
              };
              return (
                r instanceof v ? r.add(a) : Array.isArray(r) && r.push(a), a
              );
            };
          });
      })(x || (x = {}));
      class N {
        constructor(e) {
          (this.listenerCount = 0),
            (this.invocationCount = 0),
            (this.elapsedOverall = 0),
            (this.durations = []),
            (this.name = `${e}_${N._idPool++}`),
            N.all.add(this);
        }
        start(e) {
          (this._stopWatch = new E()), (this.listenerCount = e);
        }
        stop() {
          if (this._stopWatch) {
            const e = this._stopWatch.elapsed();
            this.durations.push(e),
              (this.elapsedOverall += e),
              (this.invocationCount += 1),
              (this._stopWatch = void 0);
          }
        }
      }
      (N.all = new Set()), (N._idPool = 0);
      class L {
        constructor(e, t = Math.random().toString(18).slice(2, 5)) {
          (this.threshold = e), (this.name = t), (this._warnCountdown = 0);
        }
        dispose() {
          var e;
          null === (e = this._stacks) || void 0 === e || e.clear();
        }
        check(e, t) {
          const n = this.threshold;
          if (n <= 0 || t < n) return;
          this._stacks || (this._stacks = new Map());
          const r = this._stacks.get(e.value) || 0;
          if (
            (this._stacks.set(e.value, r + 1),
            (this._warnCountdown -= 1),
            this._warnCountdown <= 0)
          ) {
            let e;
            this._warnCountdown = 0.5 * n;
            let r = 0;
            for (const [t, n] of this._stacks)
              (!e || r < n) && ((e = t), (r = n));
            A.warn(
              `[${this.name}] potential listener LEAK detected, having ${t} listeners already. MOST frequent listener (${r}):`,
            ),
              A.warn(e);
          }
          return () => {
            const t = this._stacks.get(e.value) || 0;
            this._stacks.set(e.value, t - 1);
          };
        }
      }
      class O {
        static create() {
          var e;
          return new O(
            null !== (e = new Error().stack) && void 0 !== e ? e : '',
          );
        }
        constructor(e) {
          this.value = e;
        }
        print() {
          A.warn(this.value.split('\n').slice(2).join('\n'));
        }
      }
      class k {
        constructor(e) {
          this.value = e;
        }
      }
      class R {
        constructor(e) {
          var t, n, r, i, o;
          (this._size = 0),
            (this._options = e),
            (this._leakageMon = (
              null === (t = this._options) || void 0 === t
                ? void 0
                : t.leakWarningThreshold
            )
              ? new L(
                  null !==
                    (r =
                      null === (n = this._options) || void 0 === n
                        ? void 0
                        : n.leakWarningThreshold) && void 0 !== r
                    ? r
                    : -1,
                )
              : void 0),
            (this._perfMon = (
              null === (i = this._options) || void 0 === i
                ? void 0
                : i._profName
            )
              ? new N(this._options._profName)
              : void 0),
            (this._deliveryQueue =
              null === (o = this._options) || void 0 === o
                ? void 0
                : o.deliveryQueue);
        }
        dispose() {
          var e, t, n, r;
          this._disposed ||
            ((this._disposed = !0),
            (null === (e = this._deliveryQueue) || void 0 === e
              ? void 0
              : e.current) === this && this._deliveryQueue.reset(),
            this._listeners && ((this._listeners = void 0), (this._size = 0)),
            null ===
              (n =
                null === (t = this._options) || void 0 === t
                  ? void 0
                  : t.onDidRemoveLastListener) ||
              void 0 === n ||
              n.call(t),
            null === (r = this._leakageMon) || void 0 === r || r.dispose());
        }
        get event() {
          var e;
          return (
            (null !== (e = this._event) && void 0 !== e) ||
              (this._event = (e, t, n) => {
                var r, i, o, s, a;
                if (
                  this._leakageMon &&
                  this._size > 3 * this._leakageMon.threshold
                )
                  return (
                    A.warn(
                      `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far`,
                    ),
                    w.None
                  );
                if (this._disposed) return w.None;
                t && (e = e.bind(t));
                const l = new k(e);
                let u;
                this._leakageMon &&
                  this._size >= Math.ceil(0.2 * this._leakageMon.threshold) &&
                  ((l.stack = O.create()),
                  (u = this._leakageMon.check(l.stack, this._size + 1))),
                  this._listeners
                    ? this._listeners instanceof k
                      ? ((null !== (a = this._deliveryQueue) && void 0 !== a) ||
                          (this._deliveryQueue = new T()),
                        (this._listeners = [this._listeners, l]))
                      : this._listeners.push(l)
                    : (null ===
                        (i =
                          null === (r = this._options) || void 0 === r
                            ? void 0
                            : r.onWillAddFirstListener) ||
                        void 0 === i ||
                        i.call(r, this),
                      (this._listeners = l),
                      null ===
                        (s =
                          null === (o = this._options) || void 0 === o
                            ? void 0
                            : o.onDidAddFirstListener) ||
                        void 0 === s ||
                        s.call(o, this)),
                  this._size++;
                const c = b(() => {
                  null == u || u(), this._removeListener(l);
                });
                return (
                  n instanceof v ? n.add(c) : Array.isArray(n) && n.push(c), c
                );
              }),
            this._event
          );
        }
        _removeListener(e) {
          var t, n, r, i;
          if (
            (null ===
              (n =
                null === (t = this._options) || void 0 === t
                  ? void 0
                  : t.onWillRemoveListener) ||
              void 0 === n ||
              n.call(t, this),
            !this._listeners)
          )
            return;
          if (1 === this._size)
            return (
              (this._listeners = void 0),
              null ===
                (i =
                  null === (r = this._options) || void 0 === r
                    ? void 0
                    : r.onDidRemoveLastListener) ||
                void 0 === i ||
                i.call(r, this),
              void (this._size = 0)
            );
          const o = this._listeners,
            s = o.indexOf(e);
          if (-1 === s)
            throw (
              (A.log('disposed?', this._disposed),
              A.log('size?', this._size),
              A.log('arr?', JSON.stringify(this._listeners)),
              new Error('Attempted to dispose unknown listener'))
            );
          this._size--, (o[s] = void 0);
          const a = this._deliveryQueue.current === this;
          if (2 * this._size <= o.length) {
            let e = 0;
            for (let t = 0; t < o.length; t++)
              o[t]
                ? (o[e++] = o[t])
                : a &&
                  (this._deliveryQueue.end--,
                  e < this._deliveryQueue.i && this._deliveryQueue.i--);
            o.length = e;
          }
        }
        _deliver(e, n) {
          var r;
          if (!e) return;
          const i =
            (null === (r = this._options) || void 0 === r
              ? void 0
              : r.onListenerError) || t;
          if (i)
            try {
              e.value(n);
            } catch (e) {
              i(e);
            }
          else e.value(n);
        }
        _deliverQueue(e) {
          const t = e.current._listeners;
          for (; e.i < e.end; ) this._deliver(t[e.i++], e.value);
          e.reset();
        }
        fire(e) {
          var t, n, r, i;
          if (
            ((null === (t = this._deliveryQueue) || void 0 === t
              ? void 0
              : t.current) &&
              (this._deliverQueue(this._deliveryQueue),
              null === (n = this._perfMon) || void 0 === n || n.stop()),
            null === (r = this._perfMon) || void 0 === r || r.start(this._size),
            this._listeners)
          )
            if (this._listeners instanceof k) this._deliver(this._listeners, e);
            else {
              const t = this._deliveryQueue;
              t.enqueue(this, e, this._listeners.length), this._deliverQueue(t);
            }
          else;
          null === (i = this._perfMon) || void 0 === i || i.stop();
        }
        hasListeners() {
          return this._size > 0;
        }
      }
      class T {
        constructor() {
          (this.i = -1), (this.end = 0);
        }
        enqueue(e, t, n) {
          (this.i = 0), (this.end = n), (this.current = e), (this.value = t);
        }
        reset() {
          (this.i = this.end), (this.current = void 0), (this.value = void 0);
        }
      }
      Object.prototype.hasOwnProperty;
      function M(e) {
        const t = [];
        for (const n of (function (e) {
          let t = [];
          for (; Object.prototype !== e; )
            (t = t.concat(Object.getOwnPropertyNames(e))),
              (e = Object.getPrototypeOf(e));
          return t;
        })(e))
          'function' == typeof e[n] && t.push(n);
        return t;
      }
      n(364);
      let P =
        'undefined' != typeof document &&
        document.location &&
        document.location.hash.indexOf('pseudo=true') >= 0;
      function I(e, t) {
        let n;
        return (
          (n =
            0 === t.length
              ? e
              : e.replace(/\{(\d+)\}/g, (e, n) => {
                  const r = n[0],
                    i = t[r];
                  let o = e;
                  return (
                    'string' == typeof i
                      ? (o = i)
                      : ('number' != typeof i &&
                          'boolean' != typeof i &&
                          null != i) ||
                        (o = String(i)),
                    o
                  );
                })),
          P && (n = '［' + n.replace(/[aouei]/g, '$&$&') + '］'),
          n
        );
      }
      function j(e, t, ...n) {
        return I(t, n);
      }
      var F,
        D = n(907),
        V = n(364);
      const q = 'en';
      let U,
        B,
        K = !1,
        $ = !1,
        W = !1,
        z = !1,
        H = !1,
        G = !1,
        J = !1,
        X = !1,
        Q = !1,
        Y = !1,
        Z = null,
        ee = null,
        te = null;
      const ne = globalThis;
      let re;
      void 0 !== ne.vscode && void 0 !== ne.vscode.process
        ? (re = ne.vscode.process)
        : void 0 !== D && (re = D);
      const ie =
          'string' ==
          typeof (null === (F = null == re ? void 0 : re.versions) ||
          void 0 === F
            ? void 0
            : F.electron),
        oe = ie && 'renderer' === (null == re ? void 0 : re.type);
      if ('object' == typeof re) {
        (K = 'win32' === re.platform),
          ($ = 'darwin' === re.platform),
          (W = 'linux' === re.platform),
          (z = W && !!re.env.SNAP && !!re.env.SNAP_REVISION),
          (J = ie),
          (Q = !!re.env.CI || !!re.env.BUILD_ARTIFACTSTAGINGDIRECTORY),
          (U = q),
          (Z = q);
        const e = re.env.VSCODE_NLS_CONFIG;
        if (e)
          try {
            const t = JSON.parse(e),
              n = t.availableLanguages['*'];
            (U = t.locale),
              (ee = t.osLocale),
              (Z = n || q),
              (te = t._translationsConfigFile);
          } catch (e) {}
        H = !0;
      } else if ('object' != typeof navigator || oe)
        V.error('Unable to resolve platform.');
      else {
        (B = navigator.userAgent),
          (K = B.indexOf('Windows') >= 0),
          ($ = B.indexOf('Macintosh') >= 0),
          (X =
            (B.indexOf('Macintosh') >= 0 ||
              B.indexOf('iPad') >= 0 ||
              B.indexOf('iPhone') >= 0) &&
            !!navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 0),
          (W = B.indexOf('Linux') >= 0),
          (Y = (null == B ? void 0 : B.indexOf('Mobi')) >= 0),
          (G = !0);
        (U = void j(0, '_') || q), (Z = U), (ee = navigator.language);
      }
      let se = 0;
      $ ? (se = 1) : K ? (se = 3) : W && (se = 2);
      const ae = K,
        le = $,
        ue = (G && 'function' == typeof ne.importScripts && ne.origin, B),
        ce = 'function' == typeof ne.postMessage && !ne.importScripts;
      (() => {
        if (ce) {
          const e = [];
          ne.addEventListener('message', t => {
            if (t.data && t.data.vscodeScheduleAsyncWork)
              for (let n = 0, r = e.length; n < r; n++) {
                const r = e[n];
                if (r.id === t.data.vscodeScheduleAsyncWork)
                  return e.splice(n, 1), void r.callback();
              }
          });
          let t = 0;
          return n => {
            const r = ++t;
            e.push({ id: r, callback: n }),
              ne.postMessage({ vscodeScheduleAsyncWork: r }, '*');
          };
        }
      })();
      const he = !!(ue && ue.indexOf('Chrome') >= 0);
      ue && ue.indexOf('Firefox'),
        !he && ue && ue.indexOf('Safari'),
        ue && ue.indexOf('Edg/'),
        ue && ue.indexOf('Android');
      class fe {
        constructor(e) {
          (this.executor = e), (this._didRun = !1);
        }
        get value() {
          if (!this._didRun)
            try {
              this._value = this.executor();
            } catch (e) {
              this._error = e;
            } finally {
              this._didRun = !0;
            }
          if (this._error) throw this._error;
          return this._value;
        }
        get rawValue() {
          return this._value;
        }
      }
      var de;
      function ge(e) {
        return e.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
      }
      function me(e) {
        return e >= 65 && e <= 90;
      }
      function pe(e) {
        return 55296 <= e && e <= 56319;
      }
      function ye(e) {
        return 56320 <= e && e <= 57343;
      }
      function be(e, t) {
        return t - 56320 + ((e - 55296) << 10) + 65536;
      }
      function ve(e, t, n) {
        const r = e.charCodeAt(n);
        if (pe(r) && n + 1 < t) {
          const t = e.charCodeAt(n + 1);
          if (ye(t)) return be(r, t);
        }
        return r;
      }
      const we = /^[\t\n\r\x20-\x7E]*$/;
      String.fromCharCode(65279);
      class Se {
        static getInstance() {
          return Se._INSTANCE || (Se._INSTANCE = new Se()), Se._INSTANCE;
        }
        constructor() {
          this._data = JSON.parse(
            '[0,0,0,51229,51255,12,44061,44087,12,127462,127487,6,7083,7085,5,47645,47671,12,54813,54839,12,128678,128678,14,3270,3270,5,9919,9923,14,45853,45879,12,49437,49463,12,53021,53047,12,71216,71218,7,128398,128399,14,129360,129374,14,2519,2519,5,4448,4519,9,9742,9742,14,12336,12336,14,44957,44983,12,46749,46775,12,48541,48567,12,50333,50359,12,52125,52151,12,53917,53943,12,69888,69890,5,73018,73018,5,127990,127990,14,128558,128559,14,128759,128760,14,129653,129655,14,2027,2035,5,2891,2892,7,3761,3761,5,6683,6683,5,8293,8293,4,9825,9826,14,9999,9999,14,43452,43453,5,44509,44535,12,45405,45431,12,46301,46327,12,47197,47223,12,48093,48119,12,48989,49015,12,49885,49911,12,50781,50807,12,51677,51703,12,52573,52599,12,53469,53495,12,54365,54391,12,65279,65279,4,70471,70472,7,72145,72147,7,119173,119179,5,127799,127818,14,128240,128244,14,128512,128512,14,128652,128652,14,128721,128722,14,129292,129292,14,129445,129450,14,129734,129743,14,1476,1477,5,2366,2368,7,2750,2752,7,3076,3076,5,3415,3415,5,4141,4144,5,6109,6109,5,6964,6964,5,7394,7400,5,9197,9198,14,9770,9770,14,9877,9877,14,9968,9969,14,10084,10084,14,43052,43052,5,43713,43713,5,44285,44311,12,44733,44759,12,45181,45207,12,45629,45655,12,46077,46103,12,46525,46551,12,46973,46999,12,47421,47447,12,47869,47895,12,48317,48343,12,48765,48791,12,49213,49239,12,49661,49687,12,50109,50135,12,50557,50583,12,51005,51031,12,51453,51479,12,51901,51927,12,52349,52375,12,52797,52823,12,53245,53271,12,53693,53719,12,54141,54167,12,54589,54615,12,55037,55063,12,69506,69509,5,70191,70193,5,70841,70841,7,71463,71467,5,72330,72342,5,94031,94031,5,123628,123631,5,127763,127765,14,127941,127941,14,128043,128062,14,128302,128317,14,128465,128467,14,128539,128539,14,128640,128640,14,128662,128662,14,128703,128703,14,128745,128745,14,129004,129007,14,129329,129330,14,129402,129402,14,129483,129483,14,129686,129704,14,130048,131069,14,173,173,4,1757,1757,1,2200,2207,5,2434,2435,7,2631,2632,5,2817,2817,5,3008,3008,5,3201,3201,5,3387,3388,5,3542,3542,5,3902,3903,7,4190,4192,5,6002,6003,5,6439,6440,5,6765,6770,7,7019,7027,5,7154,7155,7,8205,8205,13,8505,8505,14,9654,9654,14,9757,9757,14,9792,9792,14,9852,9853,14,9890,9894,14,9937,9937,14,9981,9981,14,10035,10036,14,11035,11036,14,42654,42655,5,43346,43347,7,43587,43587,5,44006,44007,7,44173,44199,12,44397,44423,12,44621,44647,12,44845,44871,12,45069,45095,12,45293,45319,12,45517,45543,12,45741,45767,12,45965,45991,12,46189,46215,12,46413,46439,12,46637,46663,12,46861,46887,12,47085,47111,12,47309,47335,12,47533,47559,12,47757,47783,12,47981,48007,12,48205,48231,12,48429,48455,12,48653,48679,12,48877,48903,12,49101,49127,12,49325,49351,12,49549,49575,12,49773,49799,12,49997,50023,12,50221,50247,12,50445,50471,12,50669,50695,12,50893,50919,12,51117,51143,12,51341,51367,12,51565,51591,12,51789,51815,12,52013,52039,12,52237,52263,12,52461,52487,12,52685,52711,12,52909,52935,12,53133,53159,12,53357,53383,12,53581,53607,12,53805,53831,12,54029,54055,12,54253,54279,12,54477,54503,12,54701,54727,12,54925,54951,12,55149,55175,12,68101,68102,5,69762,69762,7,70067,70069,7,70371,70378,5,70720,70721,7,71087,71087,5,71341,71341,5,71995,71996,5,72249,72249,7,72850,72871,5,73109,73109,5,118576,118598,5,121505,121519,5,127245,127247,14,127568,127569,14,127777,127777,14,127872,127891,14,127956,127967,14,128015,128016,14,128110,128172,14,128259,128259,14,128367,128368,14,128424,128424,14,128488,128488,14,128530,128532,14,128550,128551,14,128566,128566,14,128647,128647,14,128656,128656,14,128667,128673,14,128691,128693,14,128715,128715,14,128728,128732,14,128752,128752,14,128765,128767,14,129096,129103,14,129311,129311,14,129344,129349,14,129394,129394,14,129413,129425,14,129466,129471,14,129511,129535,14,129664,129666,14,129719,129722,14,129760,129767,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2307,2307,7,2382,2383,7,2497,2500,5,2563,2563,7,2677,2677,5,2763,2764,7,2879,2879,5,2914,2915,5,3021,3021,5,3142,3144,5,3263,3263,5,3285,3286,5,3398,3400,7,3530,3530,5,3633,3633,5,3864,3865,5,3974,3975,5,4155,4156,7,4229,4230,5,5909,5909,7,6078,6085,7,6277,6278,5,6451,6456,7,6744,6750,5,6846,6846,5,6972,6972,5,7074,7077,5,7146,7148,7,7222,7223,5,7416,7417,5,8234,8238,4,8417,8417,5,9000,9000,14,9203,9203,14,9730,9731,14,9748,9749,14,9762,9763,14,9776,9783,14,9800,9811,14,9831,9831,14,9872,9873,14,9882,9882,14,9900,9903,14,9929,9933,14,9941,9960,14,9974,9974,14,9989,9989,14,10006,10006,14,10062,10062,14,10160,10160,14,11647,11647,5,12953,12953,14,43019,43019,5,43232,43249,5,43443,43443,5,43567,43568,7,43696,43696,5,43765,43765,7,44013,44013,5,44117,44143,12,44229,44255,12,44341,44367,12,44453,44479,12,44565,44591,12,44677,44703,12,44789,44815,12,44901,44927,12,45013,45039,12,45125,45151,12,45237,45263,12,45349,45375,12,45461,45487,12,45573,45599,12,45685,45711,12,45797,45823,12,45909,45935,12,46021,46047,12,46133,46159,12,46245,46271,12,46357,46383,12,46469,46495,12,46581,46607,12,46693,46719,12,46805,46831,12,46917,46943,12,47029,47055,12,47141,47167,12,47253,47279,12,47365,47391,12,47477,47503,12,47589,47615,12,47701,47727,12,47813,47839,12,47925,47951,12,48037,48063,12,48149,48175,12,48261,48287,12,48373,48399,12,48485,48511,12,48597,48623,12,48709,48735,12,48821,48847,12,48933,48959,12,49045,49071,12,49157,49183,12,49269,49295,12,49381,49407,12,49493,49519,12,49605,49631,12,49717,49743,12,49829,49855,12,49941,49967,12,50053,50079,12,50165,50191,12,50277,50303,12,50389,50415,12,50501,50527,12,50613,50639,12,50725,50751,12,50837,50863,12,50949,50975,12,51061,51087,12,51173,51199,12,51285,51311,12,51397,51423,12,51509,51535,12,51621,51647,12,51733,51759,12,51845,51871,12,51957,51983,12,52069,52095,12,52181,52207,12,52293,52319,12,52405,52431,12,52517,52543,12,52629,52655,12,52741,52767,12,52853,52879,12,52965,52991,12,53077,53103,12,53189,53215,12,53301,53327,12,53413,53439,12,53525,53551,12,53637,53663,12,53749,53775,12,53861,53887,12,53973,53999,12,54085,54111,12,54197,54223,12,54309,54335,12,54421,54447,12,54533,54559,12,54645,54671,12,54757,54783,12,54869,54895,12,54981,55007,12,55093,55119,12,55243,55291,10,66045,66045,5,68325,68326,5,69688,69702,5,69817,69818,5,69957,69958,7,70089,70092,5,70198,70199,5,70462,70462,5,70502,70508,5,70750,70750,5,70846,70846,7,71100,71101,5,71230,71230,7,71351,71351,5,71737,71738,5,72000,72000,7,72160,72160,5,72273,72278,5,72752,72758,5,72882,72883,5,73031,73031,5,73461,73462,7,94192,94193,7,119149,119149,7,121403,121452,5,122915,122916,5,126980,126980,14,127358,127359,14,127535,127535,14,127759,127759,14,127771,127771,14,127792,127793,14,127825,127867,14,127897,127899,14,127945,127945,14,127985,127986,14,128000,128007,14,128021,128021,14,128066,128100,14,128184,128235,14,128249,128252,14,128266,128276,14,128335,128335,14,128379,128390,14,128407,128419,14,128444,128444,14,128481,128481,14,128499,128499,14,128526,128526,14,128536,128536,14,128543,128543,14,128556,128556,14,128564,128564,14,128577,128580,14,128643,128645,14,128649,128649,14,128654,128654,14,128660,128660,14,128664,128664,14,128675,128675,14,128686,128689,14,128695,128696,14,128705,128709,14,128717,128719,14,128725,128725,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129009,129023,14,129160,129167,14,129296,129304,14,129320,129327,14,129340,129342,14,129356,129356,14,129388,129392,14,129399,129400,14,129404,129407,14,129432,129442,14,129454,129455,14,129473,129474,14,129485,129487,14,129648,129651,14,129659,129660,14,129671,129679,14,129709,129711,14,129728,129730,14,129751,129753,14,129776,129782,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2274,2274,1,2363,2363,7,2377,2380,7,2402,2403,5,2494,2494,5,2507,2508,7,2558,2558,5,2622,2624,7,2641,2641,5,2691,2691,7,2759,2760,5,2786,2787,5,2876,2876,5,2881,2884,5,2901,2902,5,3006,3006,5,3014,3016,7,3072,3072,5,3134,3136,5,3157,3158,5,3260,3260,5,3266,3266,5,3274,3275,7,3328,3329,5,3391,3392,7,3405,3405,5,3457,3457,5,3536,3537,7,3551,3551,5,3636,3642,5,3764,3772,5,3895,3895,5,3967,3967,7,3993,4028,5,4146,4151,5,4182,4183,7,4226,4226,5,4253,4253,5,4957,4959,5,5940,5940,7,6070,6070,7,6087,6088,7,6158,6158,4,6432,6434,5,6448,6449,7,6679,6680,5,6742,6742,5,6754,6754,5,6783,6783,5,6912,6915,5,6966,6970,5,6978,6978,5,7042,7042,7,7080,7081,5,7143,7143,7,7150,7150,7,7212,7219,5,7380,7392,5,7412,7412,5,8203,8203,4,8232,8232,4,8265,8265,14,8400,8412,5,8421,8432,5,8617,8618,14,9167,9167,14,9200,9200,14,9410,9410,14,9723,9726,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9774,14,9786,9786,14,9794,9794,14,9823,9823,14,9828,9828,14,9833,9850,14,9855,9855,14,9875,9875,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9935,9935,14,9939,9939,14,9962,9962,14,9972,9972,14,9978,9978,14,9986,9986,14,9997,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10133,10135,14,10548,10549,14,11093,11093,14,12330,12333,5,12441,12442,5,42608,42610,5,43010,43010,5,43045,43046,5,43188,43203,7,43302,43309,5,43392,43394,5,43446,43449,5,43493,43493,5,43571,43572,7,43597,43597,7,43703,43704,5,43756,43757,5,44003,44004,7,44009,44010,7,44033,44059,12,44089,44115,12,44145,44171,12,44201,44227,12,44257,44283,12,44313,44339,12,44369,44395,12,44425,44451,12,44481,44507,12,44537,44563,12,44593,44619,12,44649,44675,12,44705,44731,12,44761,44787,12,44817,44843,12,44873,44899,12,44929,44955,12,44985,45011,12,45041,45067,12,45097,45123,12,45153,45179,12,45209,45235,12,45265,45291,12,45321,45347,12,45377,45403,12,45433,45459,12,45489,45515,12,45545,45571,12,45601,45627,12,45657,45683,12,45713,45739,12,45769,45795,12,45825,45851,12,45881,45907,12,45937,45963,12,45993,46019,12,46049,46075,12,46105,46131,12,46161,46187,12,46217,46243,12,46273,46299,12,46329,46355,12,46385,46411,12,46441,46467,12,46497,46523,12,46553,46579,12,46609,46635,12,46665,46691,12,46721,46747,12,46777,46803,12,46833,46859,12,46889,46915,12,46945,46971,12,47001,47027,12,47057,47083,12,47113,47139,12,47169,47195,12,47225,47251,12,47281,47307,12,47337,47363,12,47393,47419,12,47449,47475,12,47505,47531,12,47561,47587,12,47617,47643,12,47673,47699,12,47729,47755,12,47785,47811,12,47841,47867,12,47897,47923,12,47953,47979,12,48009,48035,12,48065,48091,12,48121,48147,12,48177,48203,12,48233,48259,12,48289,48315,12,48345,48371,12,48401,48427,12,48457,48483,12,48513,48539,12,48569,48595,12,48625,48651,12,48681,48707,12,48737,48763,12,48793,48819,12,48849,48875,12,48905,48931,12,48961,48987,12,49017,49043,12,49073,49099,12,49129,49155,12,49185,49211,12,49241,49267,12,49297,49323,12,49353,49379,12,49409,49435,12,49465,49491,12,49521,49547,12,49577,49603,12,49633,49659,12,49689,49715,12,49745,49771,12,49801,49827,12,49857,49883,12,49913,49939,12,49969,49995,12,50025,50051,12,50081,50107,12,50137,50163,12,50193,50219,12,50249,50275,12,50305,50331,12,50361,50387,12,50417,50443,12,50473,50499,12,50529,50555,12,50585,50611,12,50641,50667,12,50697,50723,12,50753,50779,12,50809,50835,12,50865,50891,12,50921,50947,12,50977,51003,12,51033,51059,12,51089,51115,12,51145,51171,12,51201,51227,12,51257,51283,12,51313,51339,12,51369,51395,12,51425,51451,12,51481,51507,12,51537,51563,12,51593,51619,12,51649,51675,12,51705,51731,12,51761,51787,12,51817,51843,12,51873,51899,12,51929,51955,12,51985,52011,12,52041,52067,12,52097,52123,12,52153,52179,12,52209,52235,12,52265,52291,12,52321,52347,12,52377,52403,12,52433,52459,12,52489,52515,12,52545,52571,12,52601,52627,12,52657,52683,12,52713,52739,12,52769,52795,12,52825,52851,12,52881,52907,12,52937,52963,12,52993,53019,12,53049,53075,12,53105,53131,12,53161,53187,12,53217,53243,12,53273,53299,12,53329,53355,12,53385,53411,12,53441,53467,12,53497,53523,12,53553,53579,12,53609,53635,12,53665,53691,12,53721,53747,12,53777,53803,12,53833,53859,12,53889,53915,12,53945,53971,12,54001,54027,12,54057,54083,12,54113,54139,12,54169,54195,12,54225,54251,12,54281,54307,12,54337,54363,12,54393,54419,12,54449,54475,12,54505,54531,12,54561,54587,12,54617,54643,12,54673,54699,12,54729,54755,12,54785,54811,12,54841,54867,12,54897,54923,12,54953,54979,12,55009,55035,12,55065,55091,12,55121,55147,12,55177,55203,12,65024,65039,5,65520,65528,4,66422,66426,5,68152,68154,5,69291,69292,5,69633,69633,5,69747,69748,5,69811,69814,5,69826,69826,5,69932,69932,7,70016,70017,5,70079,70080,7,70095,70095,5,70196,70196,5,70367,70367,5,70402,70403,7,70464,70464,5,70487,70487,5,70709,70711,7,70725,70725,7,70833,70834,7,70843,70844,7,70849,70849,7,71090,71093,5,71103,71104,5,71227,71228,7,71339,71339,5,71344,71349,5,71458,71461,5,71727,71735,5,71985,71989,7,71998,71998,5,72002,72002,7,72154,72155,5,72193,72202,5,72251,72254,5,72281,72283,5,72344,72345,5,72766,72766,7,72874,72880,5,72885,72886,5,73023,73029,5,73104,73105,5,73111,73111,5,92912,92916,5,94095,94098,5,113824,113827,4,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,125252,125258,5,127183,127183,14,127340,127343,14,127377,127386,14,127491,127503,14,127548,127551,14,127744,127756,14,127761,127761,14,127769,127769,14,127773,127774,14,127780,127788,14,127796,127797,14,127820,127823,14,127869,127869,14,127894,127895,14,127902,127903,14,127943,127943,14,127947,127950,14,127972,127972,14,127988,127988,14,127992,127994,14,128009,128011,14,128019,128019,14,128023,128041,14,128064,128064,14,128102,128107,14,128174,128181,14,128238,128238,14,128246,128247,14,128254,128254,14,128264,128264,14,128278,128299,14,128329,128330,14,128348,128359,14,128371,128377,14,128392,128393,14,128401,128404,14,128421,128421,14,128433,128434,14,128450,128452,14,128476,128478,14,128483,128483,14,128495,128495,14,128506,128506,14,128519,128520,14,128528,128528,14,128534,128534,14,128538,128538,14,128540,128542,14,128544,128549,14,128552,128555,14,128557,128557,14,128560,128563,14,128565,128565,14,128567,128576,14,128581,128591,14,128641,128642,14,128646,128646,14,128648,128648,14,128650,128651,14,128653,128653,14,128655,128655,14,128657,128659,14,128661,128661,14,128663,128663,14,128665,128666,14,128674,128674,14,128676,128677,14,128679,128685,14,128690,128690,14,128694,128694,14,128697,128702,14,128704,128704,14,128710,128714,14,128716,128716,14,128720,128720,14,128723,128724,14,128726,128727,14,128733,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129008,129008,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129661,129663,14,129667,129670,14,129680,129685,14,129705,129708,14,129712,129718,14,129723,129727,14,129731,129733,14,129744,129750,14,129754,129759,14,129768,129775,14,129783,129791,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2192,2193,1,2250,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3132,3132,5,3137,3140,7,3146,3149,5,3170,3171,5,3202,3203,7,3262,3262,7,3264,3265,7,3267,3268,7,3271,3272,7,3276,3277,5,3298,3299,5,3330,3331,7,3390,3390,5,3393,3396,5,3402,3404,7,3406,3406,1,3426,3427,5,3458,3459,7,3535,3535,5,3538,3540,5,3544,3550,7,3570,3571,7,3635,3635,7,3655,3662,5,3763,3763,7,3784,3789,5,3893,3893,5,3897,3897,5,3953,3966,5,3968,3972,5,3981,3991,5,4038,4038,5,4145,4145,7,4153,4154,5,4157,4158,5,4184,4185,5,4209,4212,5,4228,4228,7,4237,4237,5,4352,4447,8,4520,4607,10,5906,5908,5,5938,5939,5,5970,5971,5,6068,6069,5,6071,6077,5,6086,6086,5,6089,6099,5,6155,6157,5,6159,6159,5,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6862,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7679,5,8204,8204,5,8206,8207,4,8233,8233,4,8252,8252,14,8288,8292,4,8294,8303,4,8413,8416,5,8418,8420,5,8482,8482,14,8596,8601,14,8986,8987,14,9096,9096,14,9193,9196,14,9199,9199,14,9201,9202,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9729,14,9732,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9775,9775,14,9784,9785,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9874,14,9876,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9934,14,9936,9936,14,9938,9938,14,9940,9940,14,9961,9961,14,9963,9967,14,9970,9971,14,9973,9973,14,9975,9977,14,9979,9980,14,9982,9985,14,9987,9988,14,9992,9996,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10083,14,10085,10087,14,10145,10145,14,10175,10175,14,11013,11015,14,11088,11088,14,11503,11505,5,11744,11775,5,12334,12335,5,12349,12349,14,12951,12951,14,42607,42607,5,42612,42621,5,42736,42737,5,43014,43014,5,43043,43044,7,43047,43047,7,43136,43137,7,43204,43205,5,43263,43263,5,43335,43345,5,43360,43388,8,43395,43395,7,43444,43445,7,43450,43451,7,43454,43456,7,43561,43566,5,43569,43570,5,43573,43574,5,43596,43596,5,43644,43644,5,43698,43700,5,43710,43711,5,43755,43755,7,43758,43759,7,43766,43766,5,44005,44005,5,44008,44008,5,44012,44012,7,44032,44032,11,44060,44060,11,44088,44088,11,44116,44116,11,44144,44144,11,44172,44172,11,44200,44200,11,44228,44228,11,44256,44256,11,44284,44284,11,44312,44312,11,44340,44340,11,44368,44368,11,44396,44396,11,44424,44424,11,44452,44452,11,44480,44480,11,44508,44508,11,44536,44536,11,44564,44564,11,44592,44592,11,44620,44620,11,44648,44648,11,44676,44676,11,44704,44704,11,44732,44732,11,44760,44760,11,44788,44788,11,44816,44816,11,44844,44844,11,44872,44872,11,44900,44900,11,44928,44928,11,44956,44956,11,44984,44984,11,45012,45012,11,45040,45040,11,45068,45068,11,45096,45096,11,45124,45124,11,45152,45152,11,45180,45180,11,45208,45208,11,45236,45236,11,45264,45264,11,45292,45292,11,45320,45320,11,45348,45348,11,45376,45376,11,45404,45404,11,45432,45432,11,45460,45460,11,45488,45488,11,45516,45516,11,45544,45544,11,45572,45572,11,45600,45600,11,45628,45628,11,45656,45656,11,45684,45684,11,45712,45712,11,45740,45740,11,45768,45768,11,45796,45796,11,45824,45824,11,45852,45852,11,45880,45880,11,45908,45908,11,45936,45936,11,45964,45964,11,45992,45992,11,46020,46020,11,46048,46048,11,46076,46076,11,46104,46104,11,46132,46132,11,46160,46160,11,46188,46188,11,46216,46216,11,46244,46244,11,46272,46272,11,46300,46300,11,46328,46328,11,46356,46356,11,46384,46384,11,46412,46412,11,46440,46440,11,46468,46468,11,46496,46496,11,46524,46524,11,46552,46552,11,46580,46580,11,46608,46608,11,46636,46636,11,46664,46664,11,46692,46692,11,46720,46720,11,46748,46748,11,46776,46776,11,46804,46804,11,46832,46832,11,46860,46860,11,46888,46888,11,46916,46916,11,46944,46944,11,46972,46972,11,47000,47000,11,47028,47028,11,47056,47056,11,47084,47084,11,47112,47112,11,47140,47140,11,47168,47168,11,47196,47196,11,47224,47224,11,47252,47252,11,47280,47280,11,47308,47308,11,47336,47336,11,47364,47364,11,47392,47392,11,47420,47420,11,47448,47448,11,47476,47476,11,47504,47504,11,47532,47532,11,47560,47560,11,47588,47588,11,47616,47616,11,47644,47644,11,47672,47672,11,47700,47700,11,47728,47728,11,47756,47756,11,47784,47784,11,47812,47812,11,47840,47840,11,47868,47868,11,47896,47896,11,47924,47924,11,47952,47952,11,47980,47980,11,48008,48008,11,48036,48036,11,48064,48064,11,48092,48092,11,48120,48120,11,48148,48148,11,48176,48176,11,48204,48204,11,48232,48232,11,48260,48260,11,48288,48288,11,48316,48316,11,48344,48344,11,48372,48372,11,48400,48400,11,48428,48428,11,48456,48456,11,48484,48484,11,48512,48512,11,48540,48540,11,48568,48568,11,48596,48596,11,48624,48624,11,48652,48652,11,48680,48680,11,48708,48708,11,48736,48736,11,48764,48764,11,48792,48792,11,48820,48820,11,48848,48848,11,48876,48876,11,48904,48904,11,48932,48932,11,48960,48960,11,48988,48988,11,49016,49016,11,49044,49044,11,49072,49072,11,49100,49100,11,49128,49128,11,49156,49156,11,49184,49184,11,49212,49212,11,49240,49240,11,49268,49268,11,49296,49296,11,49324,49324,11,49352,49352,11,49380,49380,11,49408,49408,11,49436,49436,11,49464,49464,11,49492,49492,11,49520,49520,11,49548,49548,11,49576,49576,11,49604,49604,11,49632,49632,11,49660,49660,11,49688,49688,11,49716,49716,11,49744,49744,11,49772,49772,11,49800,49800,11,49828,49828,11,49856,49856,11,49884,49884,11,49912,49912,11,49940,49940,11,49968,49968,11,49996,49996,11,50024,50024,11,50052,50052,11,50080,50080,11,50108,50108,11,50136,50136,11,50164,50164,11,50192,50192,11,50220,50220,11,50248,50248,11,50276,50276,11,50304,50304,11,50332,50332,11,50360,50360,11,50388,50388,11,50416,50416,11,50444,50444,11,50472,50472,11,50500,50500,11,50528,50528,11,50556,50556,11,50584,50584,11,50612,50612,11,50640,50640,11,50668,50668,11,50696,50696,11,50724,50724,11,50752,50752,11,50780,50780,11,50808,50808,11,50836,50836,11,50864,50864,11,50892,50892,11,50920,50920,11,50948,50948,11,50976,50976,11,51004,51004,11,51032,51032,11,51060,51060,11,51088,51088,11,51116,51116,11,51144,51144,11,51172,51172,11,51200,51200,11,51228,51228,11,51256,51256,11,51284,51284,11,51312,51312,11,51340,51340,11,51368,51368,11,51396,51396,11,51424,51424,11,51452,51452,11,51480,51480,11,51508,51508,11,51536,51536,11,51564,51564,11,51592,51592,11,51620,51620,11,51648,51648,11,51676,51676,11,51704,51704,11,51732,51732,11,51760,51760,11,51788,51788,11,51816,51816,11,51844,51844,11,51872,51872,11,51900,51900,11,51928,51928,11,51956,51956,11,51984,51984,11,52012,52012,11,52040,52040,11,52068,52068,11,52096,52096,11,52124,52124,11,52152,52152,11,52180,52180,11,52208,52208,11,52236,52236,11,52264,52264,11,52292,52292,11,52320,52320,11,52348,52348,11,52376,52376,11,52404,52404,11,52432,52432,11,52460,52460,11,52488,52488,11,52516,52516,11,52544,52544,11,52572,52572,11,52600,52600,11,52628,52628,11,52656,52656,11,52684,52684,11,52712,52712,11,52740,52740,11,52768,52768,11,52796,52796,11,52824,52824,11,52852,52852,11,52880,52880,11,52908,52908,11,52936,52936,11,52964,52964,11,52992,52992,11,53020,53020,11,53048,53048,11,53076,53076,11,53104,53104,11,53132,53132,11,53160,53160,11,53188,53188,11,53216,53216,11,53244,53244,11,53272,53272,11,53300,53300,11,53328,53328,11,53356,53356,11,53384,53384,11,53412,53412,11,53440,53440,11,53468,53468,11,53496,53496,11,53524,53524,11,53552,53552,11,53580,53580,11,53608,53608,11,53636,53636,11,53664,53664,11,53692,53692,11,53720,53720,11,53748,53748,11,53776,53776,11,53804,53804,11,53832,53832,11,53860,53860,11,53888,53888,11,53916,53916,11,53944,53944,11,53972,53972,11,54000,54000,11,54028,54028,11,54056,54056,11,54084,54084,11,54112,54112,11,54140,54140,11,54168,54168,11,54196,54196,11,54224,54224,11,54252,54252,11,54280,54280,11,54308,54308,11,54336,54336,11,54364,54364,11,54392,54392,11,54420,54420,11,54448,54448,11,54476,54476,11,54504,54504,11,54532,54532,11,54560,54560,11,54588,54588,11,54616,54616,11,54644,54644,11,54672,54672,11,54700,54700,11,54728,54728,11,54756,54756,11,54784,54784,11,54812,54812,11,54840,54840,11,54868,54868,11,54896,54896,11,54924,54924,11,54952,54952,11,54980,54980,11,55008,55008,11,55036,55036,11,55064,55064,11,55092,55092,11,55120,55120,11,55148,55148,11,55176,55176,11,55216,55238,9,64286,64286,5,65056,65071,5,65438,65439,5,65529,65531,4,66272,66272,5,68097,68099,5,68108,68111,5,68159,68159,5,68900,68903,5,69446,69456,5,69632,69632,7,69634,69634,7,69744,69744,5,69759,69761,5,69808,69810,7,69815,69816,7,69821,69821,1,69837,69837,1,69927,69931,5,69933,69940,5,70003,70003,5,70018,70018,7,70070,70078,5,70082,70083,1,70094,70094,7,70188,70190,7,70194,70195,7,70197,70197,7,70206,70206,5,70368,70370,7,70400,70401,5,70459,70460,5,70463,70463,7,70465,70468,7,70475,70477,7,70498,70499,7,70512,70516,5,70712,70719,5,70722,70724,5,70726,70726,5,70832,70832,5,70835,70840,5,70842,70842,5,70845,70845,5,70847,70848,5,70850,70851,5,71088,71089,7,71096,71099,7,71102,71102,7,71132,71133,5,71219,71226,5,71229,71229,5,71231,71232,5,71340,71340,7,71342,71343,7,71350,71350,7,71453,71455,5,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,118528,118573,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123566,123566,5,125136,125142,5,126976,126979,14,126981,127182,14,127184,127231,14,127279,127279,14,127344,127345,14,127374,127374,14,127405,127461,14,127489,127490,14,127514,127514,14,127538,127546,14,127561,127567,14,127570,127743,14,127757,127758,14,127760,127760,14,127762,127762,14,127766,127768,14,127770,127770,14,127772,127772,14,127775,127776,14,127778,127779,14,127789,127791,14,127794,127795,14,127798,127798,14,127819,127819,14,127824,127824,14,127868,127868,14,127870,127871,14,127892,127893,14,127896,127896,14,127900,127901,14,127904,127940,14,127942,127942,14,127944,127944,14,127946,127946,14,127951,127955,14,127968,127971,14,127973,127984,14,127987,127987,14,127989,127989,14,127991,127991,14,127995,127999,5,128008,128008,14,128012,128014,14,128017,128018,14,128020,128020,14,128022,128022,14,128042,128042,14,128063,128063,14,128065,128065,14,128101,128101,14,128108,128109,14,128173,128173,14,128182,128183,14,128236,128237,14,128239,128239,14,128245,128245,14,128248,128248,14,128253,128253,14,128255,128258,14,128260,128263,14,128265,128265,14,128277,128277,14,128300,128301,14,128326,128328,14,128331,128334,14,128336,128347,14,128360,128366,14,128369,128370,14,128378,128378,14,128391,128391,14,128394,128397,14,128400,128400,14,128405,128406,14,128420,128420,14,128422,128423,14,128425,128432,14,128435,128443,14,128445,128449,14,128453,128464,14,128468,128475,14,128479,128480,14,128482,128482,14,128484,128487,14,128489,128494,14,128496,128498,14,128500,128505,14,128507,128511,14,128513,128518,14,128521,128525,14,128527,128527,14,128529,128529,14,128533,128533,14,128535,128535,14,128537,128537,14]',
          );
        }
        getGraphemeBreakType(e) {
          if (e < 32) return 10 === e ? 3 : 13 === e ? 2 : 4;
          if (e < 127) return 0;
          const t = this._data,
            n = t.length / 3;
          let r = 1;
          for (; r <= n; )
            if (e < t[3 * r]) r *= 2;
            else {
              if (!(e > t[3 * r + 1])) return t[3 * r + 2];
              r = 2 * r + 1;
            }
          return 0;
        }
      }
      Se._INSTANCE = null;
      class _e {
        static getInstance(e) {
          return de.cache.get(Array.from(e));
        }
        static getLocales() {
          return de._locales.value;
        }
        constructor(e) {
          this.confusableDictionary = e;
        }
        isAmbiguous(e) {
          return this.confusableDictionary.has(e);
        }
        getPrimaryConfusable(e) {
          return this.confusableDictionary.get(e);
        }
        getConfusableCodePoints() {
          return new Set(this.confusableDictionary.keys());
        }
      }
      (de = _e),
        (_e.ambiguousCharacterData = new fe(() =>
          JSON.parse(
            '{"_common":[8232,32,8233,32,5760,32,8192,32,8193,32,8194,32,8195,32,8196,32,8197,32,8198,32,8200,32,8201,32,8202,32,8287,32,8199,32,8239,32,2042,95,65101,95,65102,95,65103,95,8208,45,8209,45,8210,45,65112,45,1748,45,8259,45,727,45,8722,45,10134,45,11450,45,1549,44,1643,44,8218,44,184,44,42233,44,894,59,2307,58,2691,58,1417,58,1795,58,1796,58,5868,58,65072,58,6147,58,6153,58,8282,58,1475,58,760,58,42889,58,8758,58,720,58,42237,58,451,33,11601,33,660,63,577,63,2429,63,5038,63,42731,63,119149,46,8228,46,1793,46,1794,46,42510,46,68176,46,1632,46,1776,46,42232,46,1373,96,65287,96,8219,96,8242,96,1370,96,1523,96,8175,96,65344,96,900,96,8189,96,8125,96,8127,96,8190,96,697,96,884,96,712,96,714,96,715,96,756,96,699,96,701,96,700,96,702,96,42892,96,1497,96,2036,96,2037,96,5194,96,5836,96,94033,96,94034,96,65339,91,10088,40,10098,40,12308,40,64830,40,65341,93,10089,41,10099,41,12309,41,64831,41,10100,123,119060,123,10101,125,65342,94,8270,42,1645,42,8727,42,66335,42,5941,47,8257,47,8725,47,8260,47,9585,47,10187,47,10744,47,119354,47,12755,47,12339,47,11462,47,20031,47,12035,47,65340,92,65128,92,8726,92,10189,92,10741,92,10745,92,119311,92,119355,92,12756,92,20022,92,12034,92,42872,38,708,94,710,94,5869,43,10133,43,66203,43,8249,60,10094,60,706,60,119350,60,5176,60,5810,60,5120,61,11840,61,12448,61,42239,61,8250,62,10095,62,707,62,119351,62,5171,62,94015,62,8275,126,732,126,8128,126,8764,126,65372,124,65293,45,120784,50,120794,50,120804,50,120814,50,120824,50,130034,50,42842,50,423,50,1000,50,42564,50,5311,50,42735,50,119302,51,120785,51,120795,51,120805,51,120815,51,120825,51,130035,51,42923,51,540,51,439,51,42858,51,11468,51,1248,51,94011,51,71882,51,120786,52,120796,52,120806,52,120816,52,120826,52,130036,52,5070,52,71855,52,120787,53,120797,53,120807,53,120817,53,120827,53,130037,53,444,53,71867,53,120788,54,120798,54,120808,54,120818,54,120828,54,130038,54,11474,54,5102,54,71893,54,119314,55,120789,55,120799,55,120809,55,120819,55,120829,55,130039,55,66770,55,71878,55,2819,56,2538,56,2666,56,125131,56,120790,56,120800,56,120810,56,120820,56,120830,56,130040,56,547,56,546,56,66330,56,2663,57,2920,57,2541,57,3437,57,120791,57,120801,57,120811,57,120821,57,120831,57,130041,57,42862,57,11466,57,71884,57,71852,57,71894,57,9082,97,65345,97,119834,97,119886,97,119938,97,119990,97,120042,97,120094,97,120146,97,120198,97,120250,97,120302,97,120354,97,120406,97,120458,97,593,97,945,97,120514,97,120572,97,120630,97,120688,97,120746,97,65313,65,119808,65,119860,65,119912,65,119964,65,120016,65,120068,65,120120,65,120172,65,120224,65,120276,65,120328,65,120380,65,120432,65,913,65,120488,65,120546,65,120604,65,120662,65,120720,65,5034,65,5573,65,42222,65,94016,65,66208,65,119835,98,119887,98,119939,98,119991,98,120043,98,120095,98,120147,98,120199,98,120251,98,120303,98,120355,98,120407,98,120459,98,388,98,5071,98,5234,98,5551,98,65314,66,8492,66,119809,66,119861,66,119913,66,120017,66,120069,66,120121,66,120173,66,120225,66,120277,66,120329,66,120381,66,120433,66,42932,66,914,66,120489,66,120547,66,120605,66,120663,66,120721,66,5108,66,5623,66,42192,66,66178,66,66209,66,66305,66,65347,99,8573,99,119836,99,119888,99,119940,99,119992,99,120044,99,120096,99,120148,99,120200,99,120252,99,120304,99,120356,99,120408,99,120460,99,7428,99,1010,99,11429,99,43951,99,66621,99,128844,67,71922,67,71913,67,65315,67,8557,67,8450,67,8493,67,119810,67,119862,67,119914,67,119966,67,120018,67,120174,67,120226,67,120278,67,120330,67,120382,67,120434,67,1017,67,11428,67,5087,67,42202,67,66210,67,66306,67,66581,67,66844,67,8574,100,8518,100,119837,100,119889,100,119941,100,119993,100,120045,100,120097,100,120149,100,120201,100,120253,100,120305,100,120357,100,120409,100,120461,100,1281,100,5095,100,5231,100,42194,100,8558,68,8517,68,119811,68,119863,68,119915,68,119967,68,120019,68,120071,68,120123,68,120175,68,120227,68,120279,68,120331,68,120383,68,120435,68,5024,68,5598,68,5610,68,42195,68,8494,101,65349,101,8495,101,8519,101,119838,101,119890,101,119942,101,120046,101,120098,101,120150,101,120202,101,120254,101,120306,101,120358,101,120410,101,120462,101,43826,101,1213,101,8959,69,65317,69,8496,69,119812,69,119864,69,119916,69,120020,69,120072,69,120124,69,120176,69,120228,69,120280,69,120332,69,120384,69,120436,69,917,69,120492,69,120550,69,120608,69,120666,69,120724,69,11577,69,5036,69,42224,69,71846,69,71854,69,66182,69,119839,102,119891,102,119943,102,119995,102,120047,102,120099,102,120151,102,120203,102,120255,102,120307,102,120359,102,120411,102,120463,102,43829,102,42905,102,383,102,7837,102,1412,102,119315,70,8497,70,119813,70,119865,70,119917,70,120021,70,120073,70,120125,70,120177,70,120229,70,120281,70,120333,70,120385,70,120437,70,42904,70,988,70,120778,70,5556,70,42205,70,71874,70,71842,70,66183,70,66213,70,66853,70,65351,103,8458,103,119840,103,119892,103,119944,103,120048,103,120100,103,120152,103,120204,103,120256,103,120308,103,120360,103,120412,103,120464,103,609,103,7555,103,397,103,1409,103,119814,71,119866,71,119918,71,119970,71,120022,71,120074,71,120126,71,120178,71,120230,71,120282,71,120334,71,120386,71,120438,71,1292,71,5056,71,5107,71,42198,71,65352,104,8462,104,119841,104,119945,104,119997,104,120049,104,120101,104,120153,104,120205,104,120257,104,120309,104,120361,104,120413,104,120465,104,1211,104,1392,104,5058,104,65320,72,8459,72,8460,72,8461,72,119815,72,119867,72,119919,72,120023,72,120179,72,120231,72,120283,72,120335,72,120387,72,120439,72,919,72,120494,72,120552,72,120610,72,120668,72,120726,72,11406,72,5051,72,5500,72,42215,72,66255,72,731,105,9075,105,65353,105,8560,105,8505,105,8520,105,119842,105,119894,105,119946,105,119998,105,120050,105,120102,105,120154,105,120206,105,120258,105,120310,105,120362,105,120414,105,120466,105,120484,105,618,105,617,105,953,105,8126,105,890,105,120522,105,120580,105,120638,105,120696,105,120754,105,1110,105,42567,105,1231,105,43893,105,5029,105,71875,105,65354,106,8521,106,119843,106,119895,106,119947,106,119999,106,120051,106,120103,106,120155,106,120207,106,120259,106,120311,106,120363,106,120415,106,120467,106,1011,106,1112,106,65322,74,119817,74,119869,74,119921,74,119973,74,120025,74,120077,74,120129,74,120181,74,120233,74,120285,74,120337,74,120389,74,120441,74,42930,74,895,74,1032,74,5035,74,5261,74,42201,74,119844,107,119896,107,119948,107,120000,107,120052,107,120104,107,120156,107,120208,107,120260,107,120312,107,120364,107,120416,107,120468,107,8490,75,65323,75,119818,75,119870,75,119922,75,119974,75,120026,75,120078,75,120130,75,120182,75,120234,75,120286,75,120338,75,120390,75,120442,75,922,75,120497,75,120555,75,120613,75,120671,75,120729,75,11412,75,5094,75,5845,75,42199,75,66840,75,1472,108,8739,73,9213,73,65512,73,1633,108,1777,73,66336,108,125127,108,120783,73,120793,73,120803,73,120813,73,120823,73,130033,73,65321,73,8544,73,8464,73,8465,73,119816,73,119868,73,119920,73,120024,73,120128,73,120180,73,120232,73,120284,73,120336,73,120388,73,120440,73,65356,108,8572,73,8467,108,119845,108,119897,108,119949,108,120001,108,120053,108,120105,73,120157,73,120209,73,120261,73,120313,73,120365,73,120417,73,120469,73,448,73,120496,73,120554,73,120612,73,120670,73,120728,73,11410,73,1030,73,1216,73,1493,108,1503,108,1575,108,126464,108,126592,108,65166,108,65165,108,1994,108,11599,73,5825,73,42226,73,93992,73,66186,124,66313,124,119338,76,8556,76,8466,76,119819,76,119871,76,119923,76,120027,76,120079,76,120131,76,120183,76,120235,76,120287,76,120339,76,120391,76,120443,76,11472,76,5086,76,5290,76,42209,76,93974,76,71843,76,71858,76,66587,76,66854,76,65325,77,8559,77,8499,77,119820,77,119872,77,119924,77,120028,77,120080,77,120132,77,120184,77,120236,77,120288,77,120340,77,120392,77,120444,77,924,77,120499,77,120557,77,120615,77,120673,77,120731,77,1018,77,11416,77,5047,77,5616,77,5846,77,42207,77,66224,77,66321,77,119847,110,119899,110,119951,110,120003,110,120055,110,120107,110,120159,110,120211,110,120263,110,120315,110,120367,110,120419,110,120471,110,1400,110,1404,110,65326,78,8469,78,119821,78,119873,78,119925,78,119977,78,120029,78,120081,78,120185,78,120237,78,120289,78,120341,78,120393,78,120445,78,925,78,120500,78,120558,78,120616,78,120674,78,120732,78,11418,78,42208,78,66835,78,3074,111,3202,111,3330,111,3458,111,2406,111,2662,111,2790,111,3046,111,3174,111,3302,111,3430,111,3664,111,3792,111,4160,111,1637,111,1781,111,65359,111,8500,111,119848,111,119900,111,119952,111,120056,111,120108,111,120160,111,120212,111,120264,111,120316,111,120368,111,120420,111,120472,111,7439,111,7441,111,43837,111,959,111,120528,111,120586,111,120644,111,120702,111,120760,111,963,111,120532,111,120590,111,120648,111,120706,111,120764,111,11423,111,4351,111,1413,111,1505,111,1607,111,126500,111,126564,111,126596,111,65259,111,65260,111,65258,111,65257,111,1726,111,64428,111,64429,111,64427,111,64426,111,1729,111,64424,111,64425,111,64423,111,64422,111,1749,111,3360,111,4125,111,66794,111,71880,111,71895,111,66604,111,1984,79,2534,79,2918,79,12295,79,70864,79,71904,79,120782,79,120792,79,120802,79,120812,79,120822,79,130032,79,65327,79,119822,79,119874,79,119926,79,119978,79,120030,79,120082,79,120134,79,120186,79,120238,79,120290,79,120342,79,120394,79,120446,79,927,79,120502,79,120560,79,120618,79,120676,79,120734,79,11422,79,1365,79,11604,79,4816,79,2848,79,66754,79,42227,79,71861,79,66194,79,66219,79,66564,79,66838,79,9076,112,65360,112,119849,112,119901,112,119953,112,120005,112,120057,112,120109,112,120161,112,120213,112,120265,112,120317,112,120369,112,120421,112,120473,112,961,112,120530,112,120544,112,120588,112,120602,112,120646,112,120660,112,120704,112,120718,112,120762,112,120776,112,11427,112,65328,80,8473,80,119823,80,119875,80,119927,80,119979,80,120031,80,120083,80,120187,80,120239,80,120291,80,120343,80,120395,80,120447,80,929,80,120504,80,120562,80,120620,80,120678,80,120736,80,11426,80,5090,80,5229,80,42193,80,66197,80,119850,113,119902,113,119954,113,120006,113,120058,113,120110,113,120162,113,120214,113,120266,113,120318,113,120370,113,120422,113,120474,113,1307,113,1379,113,1382,113,8474,81,119824,81,119876,81,119928,81,119980,81,120032,81,120084,81,120188,81,120240,81,120292,81,120344,81,120396,81,120448,81,11605,81,119851,114,119903,114,119955,114,120007,114,120059,114,120111,114,120163,114,120215,114,120267,114,120319,114,120371,114,120423,114,120475,114,43847,114,43848,114,7462,114,11397,114,43905,114,119318,82,8475,82,8476,82,8477,82,119825,82,119877,82,119929,82,120033,82,120189,82,120241,82,120293,82,120345,82,120397,82,120449,82,422,82,5025,82,5074,82,66740,82,5511,82,42211,82,94005,82,65363,115,119852,115,119904,115,119956,115,120008,115,120060,115,120112,115,120164,115,120216,115,120268,115,120320,115,120372,115,120424,115,120476,115,42801,115,445,115,1109,115,43946,115,71873,115,66632,115,65331,83,119826,83,119878,83,119930,83,119982,83,120034,83,120086,83,120138,83,120190,83,120242,83,120294,83,120346,83,120398,83,120450,83,1029,83,1359,83,5077,83,5082,83,42210,83,94010,83,66198,83,66592,83,119853,116,119905,116,119957,116,120009,116,120061,116,120113,116,120165,116,120217,116,120269,116,120321,116,120373,116,120425,116,120477,116,8868,84,10201,84,128872,84,65332,84,119827,84,119879,84,119931,84,119983,84,120035,84,120087,84,120139,84,120191,84,120243,84,120295,84,120347,84,120399,84,120451,84,932,84,120507,84,120565,84,120623,84,120681,84,120739,84,11430,84,5026,84,42196,84,93962,84,71868,84,66199,84,66225,84,66325,84,119854,117,119906,117,119958,117,120010,117,120062,117,120114,117,120166,117,120218,117,120270,117,120322,117,120374,117,120426,117,120478,117,42911,117,7452,117,43854,117,43858,117,651,117,965,117,120534,117,120592,117,120650,117,120708,117,120766,117,1405,117,66806,117,71896,117,8746,85,8899,85,119828,85,119880,85,119932,85,119984,85,120036,85,120088,85,120140,85,120192,85,120244,85,120296,85,120348,85,120400,85,120452,85,1357,85,4608,85,66766,85,5196,85,42228,85,94018,85,71864,85,8744,118,8897,118,65366,118,8564,118,119855,118,119907,118,119959,118,120011,118,120063,118,120115,118,120167,118,120219,118,120271,118,120323,118,120375,118,120427,118,120479,118,7456,118,957,118,120526,118,120584,118,120642,118,120700,118,120758,118,1141,118,1496,118,71430,118,43945,118,71872,118,119309,86,1639,86,1783,86,8548,86,119829,86,119881,86,119933,86,119985,86,120037,86,120089,86,120141,86,120193,86,120245,86,120297,86,120349,86,120401,86,120453,86,1140,86,11576,86,5081,86,5167,86,42719,86,42214,86,93960,86,71840,86,66845,86,623,119,119856,119,119908,119,119960,119,120012,119,120064,119,120116,119,120168,119,120220,119,120272,119,120324,119,120376,119,120428,119,120480,119,7457,119,1121,119,1309,119,1377,119,71434,119,71438,119,71439,119,43907,119,71919,87,71910,87,119830,87,119882,87,119934,87,119986,87,120038,87,120090,87,120142,87,120194,87,120246,87,120298,87,120350,87,120402,87,120454,87,1308,87,5043,87,5076,87,42218,87,5742,120,10539,120,10540,120,10799,120,65368,120,8569,120,119857,120,119909,120,119961,120,120013,120,120065,120,120117,120,120169,120,120221,120,120273,120,120325,120,120377,120,120429,120,120481,120,5441,120,5501,120,5741,88,9587,88,66338,88,71916,88,65336,88,8553,88,119831,88,119883,88,119935,88,119987,88,120039,88,120091,88,120143,88,120195,88,120247,88,120299,88,120351,88,120403,88,120455,88,42931,88,935,88,120510,88,120568,88,120626,88,120684,88,120742,88,11436,88,11613,88,5815,88,42219,88,66192,88,66228,88,66327,88,66855,88,611,121,7564,121,65369,121,119858,121,119910,121,119962,121,120014,121,120066,121,120118,121,120170,121,120222,121,120274,121,120326,121,120378,121,120430,121,120482,121,655,121,7935,121,43866,121,947,121,8509,121,120516,121,120574,121,120632,121,120690,121,120748,121,1199,121,4327,121,71900,121,65337,89,119832,89,119884,89,119936,89,119988,89,120040,89,120092,89,120144,89,120196,89,120248,89,120300,89,120352,89,120404,89,120456,89,933,89,978,89,120508,89,120566,89,120624,89,120682,89,120740,89,11432,89,1198,89,5033,89,5053,89,42220,89,94019,89,71844,89,66226,89,119859,122,119911,122,119963,122,120015,122,120067,122,120119,122,120171,122,120223,122,120275,122,120327,122,120379,122,120431,122,120483,122,7458,122,43923,122,71876,122,66293,90,71909,90,65338,90,8484,90,8488,90,119833,90,119885,90,119937,90,119989,90,120041,90,120197,90,120249,90,120301,90,120353,90,120405,90,120457,90,918,90,120493,90,120551,90,120609,90,120667,90,120725,90,5059,90,42204,90,71849,90,65282,34,65284,36,65285,37,65286,38,65290,42,65291,43,65294,46,65295,47,65296,48,65297,49,65298,50,65299,51,65300,52,65301,53,65302,54,65303,55,65304,56,65305,57,65308,60,65309,61,65310,62,65312,64,65316,68,65318,70,65319,71,65324,76,65329,81,65330,82,65333,85,65334,86,65335,87,65343,95,65346,98,65348,100,65350,102,65355,107,65357,109,65358,110,65361,113,65362,114,65364,116,65365,117,65367,119,65370,122,65371,123,65373,125,119846,109],"_default":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"cs":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"de":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"es":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"fr":[65374,126,65306,58,65281,33,8216,96,8245,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"it":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ja":[8211,45,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65292,44,65307,59],"ko":[8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pl":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"pt-BR":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"qps-ploc":[160,32,8211,45,65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"ru":[65374,126,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,305,105,921,73,1009,112,215,120,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"tr":[160,32,8211,45,65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65288,40,65289,41,65292,44,65307,59,65311,63],"zh-hans":[65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41],"zh-hant":[8211,45,65374,126,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65283,35,65307,59]}',
          ),
        )),
        (_e.cache = new (class {
          constructor(e) {
            (this.fn = e),
              (this.lastCache = void 0),
              (this.lastArgKey = void 0);
          }
          get(e) {
            const t = JSON.stringify(e);
            return (
              this.lastArgKey !== t &&
                ((this.lastArgKey = t), (this.lastCache = this.fn(e))),
              this.lastCache
            );
          }
        })(e => {
          function t(e) {
            const t = new Map();
            for (let n = 0; n < e.length; n += 2) t.set(e[n], e[n + 1]);
            return t;
          }
          function n(e, t) {
            if (!e) return t;
            const n = new Map();
            for (const [r, i] of e) t.has(r) && n.set(r, i);
            return n;
          }
          const r = de.ambiguousCharacterData.value;
          let i,
            o = e.filter(e => !e.startsWith('_') && e in r);
          0 === o.length && (o = ['_default']);
          for (const e of o) {
            i = n(i, t(r[e]));
          }
          const s = (function (e, t) {
            const n = new Map(e);
            for (const [e, r] of t) n.set(e, r);
            return n;
          })(t(r._common), i);
          return new de(s);
        })),
        (_e._locales = new fe(() =>
          Object.keys(de.ambiguousCharacterData.value).filter(
            e => !e.startsWith('_'),
          ),
        ));
      class Ce {
        static getRawData() {
          return JSON.parse(
            '[9,10,11,12,13,32,127,160,173,847,1564,4447,4448,6068,6069,6155,6156,6157,6158,7355,7356,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8203,8204,8205,8206,8207,8234,8235,8236,8237,8238,8239,8287,8288,8289,8290,8291,8292,8293,8294,8295,8296,8297,8298,8299,8300,8301,8302,8303,10240,12288,12644,65024,65025,65026,65027,65028,65029,65030,65031,65032,65033,65034,65035,65036,65037,65038,65039,65279,65440,65520,65521,65522,65523,65524,65525,65526,65527,65528,65532,78844,119155,119156,119157,119158,119159,119160,119161,119162,917504,917505,917506,917507,917508,917509,917510,917511,917512,917513,917514,917515,917516,917517,917518,917519,917520,917521,917522,917523,917524,917525,917526,917527,917528,917529,917530,917531,917532,917533,917534,917535,917536,917537,917538,917539,917540,917541,917542,917543,917544,917545,917546,917547,917548,917549,917550,917551,917552,917553,917554,917555,917556,917557,917558,917559,917560,917561,917562,917563,917564,917565,917566,917567,917568,917569,917570,917571,917572,917573,917574,917575,917576,917577,917578,917579,917580,917581,917582,917583,917584,917585,917586,917587,917588,917589,917590,917591,917592,917593,917594,917595,917596,917597,917598,917599,917600,917601,917602,917603,917604,917605,917606,917607,917608,917609,917610,917611,917612,917613,917614,917615,917616,917617,917618,917619,917620,917621,917622,917623,917624,917625,917626,917627,917628,917629,917630,917631,917760,917761,917762,917763,917764,917765,917766,917767,917768,917769,917770,917771,917772,917773,917774,917775,917776,917777,917778,917779,917780,917781,917782,917783,917784,917785,917786,917787,917788,917789,917790,917791,917792,917793,917794,917795,917796,917797,917798,917799,917800,917801,917802,917803,917804,917805,917806,917807,917808,917809,917810,917811,917812,917813,917814,917815,917816,917817,917818,917819,917820,917821,917822,917823,917824,917825,917826,917827,917828,917829,917830,917831,917832,917833,917834,917835,917836,917837,917838,917839,917840,917841,917842,917843,917844,917845,917846,917847,917848,917849,917850,917851,917852,917853,917854,917855,917856,917857,917858,917859,917860,917861,917862,917863,917864,917865,917866,917867,917868,917869,917870,917871,917872,917873,917874,917875,917876,917877,917878,917879,917880,917881,917882,917883,917884,917885,917886,917887,917888,917889,917890,917891,917892,917893,917894,917895,917896,917897,917898,917899,917900,917901,917902,917903,917904,917905,917906,917907,917908,917909,917910,917911,917912,917913,917914,917915,917916,917917,917918,917919,917920,917921,917922,917923,917924,917925,917926,917927,917928,917929,917930,917931,917932,917933,917934,917935,917936,917937,917938,917939,917940,917941,917942,917943,917944,917945,917946,917947,917948,917949,917950,917951,917952,917953,917954,917955,917956,917957,917958,917959,917960,917961,917962,917963,917964,917965,917966,917967,917968,917969,917970,917971,917972,917973,917974,917975,917976,917977,917978,917979,917980,917981,917982,917983,917984,917985,917986,917987,917988,917989,917990,917991,917992,917993,917994,917995,917996,917997,917998,917999]',
          );
        }
        static getData() {
          return (
            this._data || (this._data = new Set(Ce.getRawData())), this._data
          );
        }
        static isInvisibleCharacter(e) {
          return Ce.getData().has(e);
        }
        static get codePoints() {
          return Ce.getData();
        }
      }
      Ce._data = void 0;
      var Ee = n(364);
      const Ae = '$initialize';
      class xe {
        constructor(e, t, n, r) {
          (this.vsWorker = e),
            (this.req = t),
            (this.method = n),
            (this.args = r),
            (this.type = 0);
        }
      }
      class Ne {
        constructor(e, t, n, r) {
          (this.vsWorker = e),
            (this.seq = t),
            (this.res = n),
            (this.err = r),
            (this.type = 1);
        }
      }
      class Le {
        constructor(e, t, n, r) {
          (this.vsWorker = e),
            (this.req = t),
            (this.eventName = n),
            (this.arg = r),
            (this.type = 2);
        }
      }
      class Oe {
        constructor(e, t, n) {
          (this.vsWorker = e),
            (this.req = t),
            (this.event = n),
            (this.type = 3);
        }
      }
      class ke {
        constructor(e, t) {
          (this.vsWorker = e), (this.req = t), (this.type = 4);
        }
      }
      class Re {
        constructor(e) {
          (this._workerId = -1),
            (this._handler = e),
            (this._lastSentReq = 0),
            (this._pendingReplies = Object.create(null)),
            (this._pendingEmitters = new Map()),
            (this._pendingEvents = new Map());
        }
        setWorkerId(e) {
          this._workerId = e;
        }
        sendMessage(e, t) {
          const n = String(++this._lastSentReq);
          return new Promise((r, i) => {
            (this._pendingReplies[n] = { resolve: r, reject: i }),
              this._send(new xe(this._workerId, n, e, t));
          });
        }
        listen(e, t) {
          let n = null;
          const r = new R({
            onWillAddFirstListener: () => {
              (n = String(++this._lastSentReq)),
                this._pendingEmitters.set(n, r),
                this._send(new Le(this._workerId, n, e, t));
            },
            onDidRemoveLastListener: () => {
              this._pendingEmitters.delete(n),
                this._send(new ke(this._workerId, n)),
                (n = null);
            },
          });
          return r.event;
        }
        handleMessage(e) {
          e &&
            e.vsWorker &&
            ((-1 !== this._workerId && e.vsWorker !== this._workerId) ||
              this._handleMessage(e));
        }
        _handleMessage(e) {
          switch (e.type) {
            case 1:
              return this._handleReplyMessage(e);
            case 0:
              return this._handleRequestMessage(e);
            case 2:
              return this._handleSubscribeEventMessage(e);
            case 3:
              return this._handleEventMessage(e);
            case 4:
              return this._handleUnsubscribeEventMessage(e);
          }
        }
        _handleReplyMessage(e) {
          if (!this._pendingReplies[e.seq])
            return void Ee.warn('Got reply to unknown seq');
          const t = this._pendingReplies[e.seq];
          if ((delete this._pendingReplies[e.seq], e.err)) {
            let n = e.err;
            return (
              e.err.$isError &&
                ((n = new Error()),
                (n.name = e.err.name),
                (n.message = e.err.message),
                (n.stack = e.err.stack)),
              void t.reject(n)
            );
          }
          t.resolve(e.res);
        }
        _handleRequestMessage(e) {
          const t = e.req;
          this._handler.handleMessage(e.method, e.args).then(
            e => {
              this._send(new Ne(this._workerId, t, e, void 0));
            },
            e => {
              e.detail instanceof Error && (e.detail = r(e.detail)),
                this._send(new Ne(this._workerId, t, void 0, r(e)));
            },
          );
        }
        _handleSubscribeEventMessage(e) {
          const t = e.req,
            n = this._handler.handleEvent(
              e.eventName,
              e.arg,
            )(e => {
              this._send(new Oe(this._workerId, t, e));
            });
          this._pendingEvents.set(t, n);
        }
        _handleEventMessage(e) {
          this._pendingEmitters.has(e.req)
            ? this._pendingEmitters.get(e.req).fire(e.event)
            : Ee.warn('Got event for unknown req');
        }
        _handleUnsubscribeEventMessage(e) {
          this._pendingEvents.has(e.req)
            ? (this._pendingEvents.get(e.req).dispose(),
              this._pendingEvents.delete(e.req))
            : Ee.warn('Got unsubscribe for unknown req');
        }
        _send(e) {
          const t = [];
          if (0 === e.type)
            for (let n = 0; n < e.args.length; n++)
              e.args[n] instanceof ArrayBuffer && t.push(e.args[n]);
          else 1 === e.type && e.res instanceof ArrayBuffer && t.push(e.res);
          this._handler.sendMessage(e, t);
        }
      }
      function Te(e) {
        return 'o' === e[0] && 'n' === e[1] && me(e.charCodeAt(2));
      }
      function Me(e) {
        return /^onDynamic/.test(e) && me(e.charCodeAt(9));
      }
      function Pe(e, t, n) {
        const r = e =>
            function () {
              const n = Array.prototype.slice.call(arguments, 0);
              return t(e, n);
            },
          i = e =>
            function (t) {
              return n(e, t);
            },
          o = {};
        for (const t of e)
          Me(t) ? (o[t] = i(t)) : Te(t) ? (o[t] = n(t, void 0)) : (o[t] = r(t));
        return o;
      }
      class Ie {
        constructor(e, t) {
          (this._requestHandlerFactory = t),
            (this._requestHandler = null),
            (this._protocol = new Re({
              sendMessage: (t, n) => {
                e(t, n);
              },
              handleMessage: (e, t) => this._handleMessage(e, t),
              handleEvent: (e, t) => this._handleEvent(e, t),
            }));
        }
        onmessage(e) {
          this._protocol.handleMessage(e);
        }
        _handleMessage(e, t) {
          if (e === Ae) return this.initialize(t[0], t[1], t[2], t[3]);
          if (
            !this._requestHandler ||
            'function' != typeof this._requestHandler[e]
          )
            return Promise.reject(
              new Error('Missing requestHandler or method: ' + e),
            );
          try {
            return Promise.resolve(
              this._requestHandler[e].apply(this._requestHandler, t),
            );
          } catch (e) {
            return Promise.reject(e);
          }
        }
        _handleEvent(e, t) {
          if (!this._requestHandler) throw new Error('Missing requestHandler');
          if (Me(e)) {
            const n = this._requestHandler[e].call(this._requestHandler, t);
            if ('function' != typeof n)
              throw new Error(`Missing dynamic event ${e} on request handler.`);
            return n;
          }
          if (Te(e)) {
            const t = this._requestHandler[e];
            if ('function' != typeof t)
              throw new Error(`Missing event ${e} on request handler.`);
            return t;
          }
          throw new Error(`Malformed event name ${e}`);
        }
        initialize(e, t, n, r) {
          this._protocol.setWorkerId(e);
          const i = Pe(
            r,
            (e, t) => this._protocol.sendMessage(e, t),
            (e, t) => this._protocol.listen(e, t),
          );
          return this._requestHandlerFactory
            ? ((this._requestHandler = this._requestHandlerFactory(i)),
              Promise.resolve(M(this._requestHandler)))
            : (t &&
                (void 0 !== t.baseUrl && delete t.baseUrl,
                void 0 !== t.paths &&
                  void 0 !== t.paths.vs &&
                  delete t.paths.vs,
                void 0 !== t.trustedTypesPolicy && delete t.trustedTypesPolicy,
                (t.catchError = !0),
                globalThis.require.config(t)),
              new Promise((e, t) => {
                (0, globalThis.require)(
                  [n],
                  n => {
                    (this._requestHandler = n.create(i)),
                      this._requestHandler
                        ? e(M(this._requestHandler))
                        : t(new Error('No RequestHandler!'));
                  },
                  t,
                );
              }));
        }
      }
      class je {
        constructor(e, t, n, r) {
          (this.originalStart = e),
            (this.originalLength = t),
            (this.modifiedStart = n),
            (this.modifiedLength = r);
        }
        getOriginalEnd() {
          return this.originalStart + this.originalLength;
        }
        getModifiedEnd() {
          return this.modifiedStart + this.modifiedLength;
        }
      }
      function Fe(e, t) {
        return ((t << 5) - t + e) | 0;
      }
      function De(e, t) {
        t = Fe(149417, t);
        for (let n = 0, r = e.length; n < r; n++) t = Fe(e.charCodeAt(n), t);
        return t;
      }
      function Ve(e, t, n = 32) {
        const r = n - t;
        return ((e << t) | ((~((1 << r) - 1) & e) >>> r)) >>> 0;
      }
      function qe(e, t = 0, n = e.byteLength, r = 0) {
        for (let i = 0; i < n; i++) e[t + i] = r;
      }
      function Ue(e, t = 32) {
        return e instanceof ArrayBuffer
          ? Array.from(new Uint8Array(e))
              .map(e => e.toString(16).padStart(2, '0'))
              .join('')
          : (function (e, t, n = '0') {
              for (; e.length < t; ) e = n + e;
              return e;
            })((e >>> 0).toString(16), t / 4);
      }
      class Be {
        constructor() {
          (this._h0 = 1732584193),
            (this._h1 = 4023233417),
            (this._h2 = 2562383102),
            (this._h3 = 271733878),
            (this._h4 = 3285377520),
            (this._buff = new Uint8Array(67)),
            (this._buffDV = new DataView(this._buff.buffer)),
            (this._buffLen = 0),
            (this._totalLen = 0),
            (this._leftoverHighSurrogate = 0),
            (this._finished = !1);
        }
        update(e) {
          const t = e.length;
          if (0 === t) return;
          const n = this._buff;
          let r,
            i,
            o = this._buffLen,
            s = this._leftoverHighSurrogate;
          for (
            0 !== s
              ? ((r = s), (i = -1), (s = 0))
              : ((r = e.charCodeAt(0)), (i = 0));
            ;

          ) {
            let a = r;
            if (pe(r)) {
              if (!(i + 1 < t)) {
                s = r;
                break;
              }
              {
                const t = e.charCodeAt(i + 1);
                ye(t) ? (i++, (a = be(r, t))) : (a = 65533);
              }
            } else ye(r) && (a = 65533);
            if (((o = this._push(n, o, a)), i++, !(i < t))) break;
            r = e.charCodeAt(i);
          }
          (this._buffLen = o), (this._leftoverHighSurrogate = s);
        }
        _push(e, t, n) {
          return (
            n < 128
              ? (e[t++] = n)
              : n < 2048
              ? ((e[t++] = 192 | ((1984 & n) >>> 6)),
                (e[t++] = 128 | ((63 & n) >>> 0)))
              : n < 65536
              ? ((e[t++] = 224 | ((61440 & n) >>> 12)),
                (e[t++] = 128 | ((4032 & n) >>> 6)),
                (e[t++] = 128 | ((63 & n) >>> 0)))
              : ((e[t++] = 240 | ((1835008 & n) >>> 18)),
                (e[t++] = 128 | ((258048 & n) >>> 12)),
                (e[t++] = 128 | ((4032 & n) >>> 6)),
                (e[t++] = 128 | ((63 & n) >>> 0))),
            t >= 64 &&
              (this._step(),
              (t -= 64),
              (this._totalLen += 64),
              (e[0] = e[64]),
              (e[1] = e[65]),
              (e[2] = e[66])),
            t
          );
        }
        digest() {
          return (
            this._finished ||
              ((this._finished = !0),
              this._leftoverHighSurrogate &&
                ((this._leftoverHighSurrogate = 0),
                (this._buffLen = this._push(this._buff, this._buffLen, 65533))),
              (this._totalLen += this._buffLen),
              this._wrapUp()),
            Ue(this._h0) +
              Ue(this._h1) +
              Ue(this._h2) +
              Ue(this._h3) +
              Ue(this._h4)
          );
        }
        _wrapUp() {
          (this._buff[this._buffLen++] = 128),
            qe(this._buff, this._buffLen),
            this._buffLen > 56 && (this._step(), qe(this._buff));
          const e = 8 * this._totalLen;
          this._buffDV.setUint32(56, Math.floor(e / 4294967296), !1),
            this._buffDV.setUint32(60, e % 4294967296, !1),
            this._step();
        }
        _step() {
          const e = Be._bigBlock32,
            t = this._buffDV;
          for (let n = 0; n < 64; n += 4)
            e.setUint32(n, t.getUint32(n, !1), !1);
          for (let t = 64; t < 320; t += 4)
            e.setUint32(
              t,
              Ve(
                e.getUint32(t - 12, !1) ^
                  e.getUint32(t - 32, !1) ^
                  e.getUint32(t - 56, !1) ^
                  e.getUint32(t - 64, !1),
                1,
              ),
              !1,
            );
          let n,
            r,
            i,
            o = this._h0,
            s = this._h1,
            a = this._h2,
            l = this._h3,
            u = this._h4;
          for (let t = 0; t < 80; t++)
            t < 20
              ? ((n = (s & a) | (~s & l)), (r = 1518500249))
              : t < 40
              ? ((n = s ^ a ^ l), (r = 1859775393))
              : t < 60
              ? ((n = (s & a) | (s & l) | (a & l)), (r = 2400959708))
              : ((n = s ^ a ^ l), (r = 3395469782)),
              (i =
                (Ve(o, 5) + n + u + r + e.getUint32(4 * t, !1)) & 4294967295),
              (u = l),
              (l = a),
              (a = Ve(s, 30)),
              (s = o),
              (o = i);
          (this._h0 = (this._h0 + o) & 4294967295),
            (this._h1 = (this._h1 + s) & 4294967295),
            (this._h2 = (this._h2 + a) & 4294967295),
            (this._h3 = (this._h3 + l) & 4294967295),
            (this._h4 = (this._h4 + u) & 4294967295);
        }
      }
      Be._bigBlock32 = new DataView(new ArrayBuffer(320));
      class Ke {
        constructor(e) {
          this.source = e;
        }
        getElements() {
          const e = this.source,
            t = new Int32Array(e.length);
          for (let n = 0, r = e.length; n < r; n++) t[n] = e.charCodeAt(n);
          return t;
        }
      }
      function $e(e, t, n) {
        return new Ge(new Ke(e), new Ke(t)).ComputeDiff(n).changes;
      }
      class We {
        static Assert(e, t) {
          if (!e) throw new Error(t);
        }
      }
      class ze {
        static Copy(e, t, n, r, i) {
          for (let o = 0; o < i; o++) n[r + o] = e[t + o];
        }
        static Copy2(e, t, n, r, i) {
          for (let o = 0; o < i; o++) n[r + o] = e[t + o];
        }
      }
      class He {
        constructor() {
          (this.m_changes = []),
            (this.m_originalStart = 1073741824),
            (this.m_modifiedStart = 1073741824),
            (this.m_originalCount = 0),
            (this.m_modifiedCount = 0);
        }
        MarkNextChange() {
          (this.m_originalCount > 0 || this.m_modifiedCount > 0) &&
            this.m_changes.push(
              new je(
                this.m_originalStart,
                this.m_originalCount,
                this.m_modifiedStart,
                this.m_modifiedCount,
              ),
            ),
            (this.m_originalCount = 0),
            (this.m_modifiedCount = 0),
            (this.m_originalStart = 1073741824),
            (this.m_modifiedStart = 1073741824);
        }
        AddOriginalElement(e, t) {
          (this.m_originalStart = Math.min(this.m_originalStart, e)),
            (this.m_modifiedStart = Math.min(this.m_modifiedStart, t)),
            this.m_originalCount++;
        }
        AddModifiedElement(e, t) {
          (this.m_originalStart = Math.min(this.m_originalStart, e)),
            (this.m_modifiedStart = Math.min(this.m_modifiedStart, t)),
            this.m_modifiedCount++;
        }
        getChanges() {
          return (
            (this.m_originalCount > 0 || this.m_modifiedCount > 0) &&
              this.MarkNextChange(),
            this.m_changes
          );
        }
        getReverseChanges() {
          return (
            (this.m_originalCount > 0 || this.m_modifiedCount > 0) &&
              this.MarkNextChange(),
            this.m_changes.reverse(),
            this.m_changes
          );
        }
      }
      class Ge {
        constructor(e, t, n = null) {
          (this.ContinueProcessingPredicate = n),
            (this._originalSequence = e),
            (this._modifiedSequence = t);
          const [r, i, o] = Ge._getElements(e),
            [s, a, l] = Ge._getElements(t);
          (this._hasStrings = o && l),
            (this._originalStringElements = r),
            (this._originalElementsOrHash = i),
            (this._modifiedStringElements = s),
            (this._modifiedElementsOrHash = a),
            (this.m_forwardHistory = []),
            (this.m_reverseHistory = []);
        }
        static _isStringArray(e) {
          return e.length > 0 && 'string' == typeof e[0];
        }
        static _getElements(e) {
          const t = e.getElements();
          if (Ge._isStringArray(t)) {
            const e = new Int32Array(t.length);
            for (let n = 0, r = t.length; n < r; n++) e[n] = De(t[n], 0);
            return [t, e, !0];
          }
          return t instanceof Int32Array
            ? [[], t, !1]
            : [[], new Int32Array(t), !1];
        }
        ElementsAreEqual(e, t) {
          return (
            this._originalElementsOrHash[e] ===
              this._modifiedElementsOrHash[t] &&
            (!this._hasStrings ||
              this._originalStringElements[e] ===
                this._modifiedStringElements[t])
          );
        }
        ElementsAreStrictEqual(e, t) {
          if (!this.ElementsAreEqual(e, t)) return !1;
          return (
            Ge._getStrictElement(this._originalSequence, e) ===
            Ge._getStrictElement(this._modifiedSequence, t)
          );
        }
        static _getStrictElement(e, t) {
          return 'function' == typeof e.getStrictElement
            ? e.getStrictElement(t)
            : null;
        }
        OriginalElementsAreEqual(e, t) {
          return (
            this._originalElementsOrHash[e] ===
              this._originalElementsOrHash[t] &&
            (!this._hasStrings ||
              this._originalStringElements[e] ===
                this._originalStringElements[t])
          );
        }
        ModifiedElementsAreEqual(e, t) {
          return (
            this._modifiedElementsOrHash[e] ===
              this._modifiedElementsOrHash[t] &&
            (!this._hasStrings ||
              this._modifiedStringElements[e] ===
                this._modifiedStringElements[t])
          );
        }
        ComputeDiff(e) {
          return this._ComputeDiff(
            0,
            this._originalElementsOrHash.length - 1,
            0,
            this._modifiedElementsOrHash.length - 1,
            e,
          );
        }
        _ComputeDiff(e, t, n, r, i) {
          const o = [!1];
          let s = this.ComputeDiffRecursive(e, t, n, r, o);
          return (
            i && (s = this.PrettifyChanges(s)), { quitEarly: o[0], changes: s }
          );
        }
        ComputeDiffRecursive(e, t, n, r, i) {
          for (i[0] = !1; e <= t && n <= r && this.ElementsAreEqual(e, n); )
            e++, n++;
          for (; t >= e && r >= n && this.ElementsAreEqual(t, r); ) t--, r--;
          if (e > t || n > r) {
            let i;
            return (
              n <= r
                ? (We.Assert(
                    e === t + 1,
                    'originalStart should only be one more than originalEnd',
                  ),
                  (i = [new je(e, 0, n, r - n + 1)]))
                : e <= t
                ? (We.Assert(
                    n === r + 1,
                    'modifiedStart should only be one more than modifiedEnd',
                  ),
                  (i = [new je(e, t - e + 1, n, 0)]))
                : (We.Assert(
                    e === t + 1,
                    'originalStart should only be one more than originalEnd',
                  ),
                  We.Assert(
                    n === r + 1,
                    'modifiedStart should only be one more than modifiedEnd',
                  ),
                  (i = [])),
              i
            );
          }
          const o = [0],
            s = [0],
            a = this.ComputeRecursionPoint(e, t, n, r, o, s, i),
            l = o[0],
            u = s[0];
          if (null !== a) return a;
          if (!i[0]) {
            const o = this.ComputeDiffRecursive(e, l, n, u, i);
            let s = [];
            return (
              (s = i[0]
                ? [new je(l + 1, t - (l + 1) + 1, u + 1, r - (u + 1) + 1)]
                : this.ComputeDiffRecursive(l + 1, t, u + 1, r, i)),
              this.ConcatenateChanges(o, s)
            );
          }
          return [new je(e, t - e + 1, n, r - n + 1)];
        }
        WALKTRACE(e, t, n, r, i, o, s, a, l, u, c, h, f, d, g, m, p, y) {
          let b = null,
            v = null,
            w = new He(),
            S = t,
            _ = n,
            C = f[0] - m[0] - r,
            E = -1073741824,
            A = this.m_forwardHistory.length - 1;
          do {
            const t = C + e;
            t === S || (t < _ && l[t - 1] < l[t + 1])
              ? ((d = (c = l[t + 1]) - C - r),
                c < E && w.MarkNextChange(),
                (E = c),
                w.AddModifiedElement(c + 1, d),
                (C = t + 1 - e))
              : ((d = (c = l[t - 1] + 1) - C - r),
                c < E && w.MarkNextChange(),
                (E = c - 1),
                w.AddOriginalElement(c, d + 1),
                (C = t - 1 - e)),
              A >= 0 &&
                ((e = (l = this.m_forwardHistory[A])[0]),
                (S = 1),
                (_ = l.length - 1));
          } while (--A >= -1);
          if (((b = w.getReverseChanges()), y[0])) {
            let e = f[0] + 1,
              t = m[0] + 1;
            if (null !== b && b.length > 0) {
              const n = b[b.length - 1];
              (e = Math.max(e, n.getOriginalEnd())),
                (t = Math.max(t, n.getModifiedEnd()));
            }
            v = [new je(e, h - e + 1, t, g - t + 1)];
          } else {
            (w = new He()),
              (S = o),
              (_ = s),
              (C = f[0] - m[0] - a),
              (E = 1073741824),
              (A = p
                ? this.m_reverseHistory.length - 1
                : this.m_reverseHistory.length - 2);
            do {
              const e = C + i;
              e === S || (e < _ && u[e - 1] >= u[e + 1])
                ? ((d = (c = u[e + 1] - 1) - C - a),
                  c > E && w.MarkNextChange(),
                  (E = c + 1),
                  w.AddOriginalElement(c + 1, d + 1),
                  (C = e + 1 - i))
                : ((d = (c = u[e - 1]) - C - a),
                  c > E && w.MarkNextChange(),
                  (E = c),
                  w.AddModifiedElement(c + 1, d + 1),
                  (C = e - 1 - i)),
                A >= 0 &&
                  ((i = (u = this.m_reverseHistory[A])[0]),
                  (S = 1),
                  (_ = u.length - 1));
            } while (--A >= -1);
            v = w.getChanges();
          }
          return this.ConcatenateChanges(b, v);
        }
        ComputeRecursionPoint(e, t, n, r, i, o, s) {
          let a = 0,
            l = 0,
            u = 0,
            c = 0,
            h = 0,
            f = 0;
          e--,
            n--,
            (i[0] = 0),
            (o[0] = 0),
            (this.m_forwardHistory = []),
            (this.m_reverseHistory = []);
          const d = t - e + (r - n),
            g = d + 1,
            m = new Int32Array(g),
            p = new Int32Array(g),
            y = r - n,
            b = t - e,
            v = e - n,
            w = t - r,
            S = (b - y) % 2 == 0;
          (m[y] = e), (p[b] = t), (s[0] = !1);
          for (let _ = 1; _ <= d / 2 + 1; _++) {
            let d = 0,
              C = 0;
            (u = this.ClipDiagonalBound(y - _, _, y, g)),
              (c = this.ClipDiagonalBound(y + _, _, y, g));
            for (let e = u; e <= c; e += 2) {
              (a =
                e === u || (e < c && m[e - 1] < m[e + 1])
                  ? m[e + 1]
                  : m[e - 1] + 1),
                (l = a - (e - y) - v);
              const n = a;
              for (; a < t && l < r && this.ElementsAreEqual(a + 1, l + 1); )
                a++, l++;
              if (
                ((m[e] = a),
                a + l > d + C && ((d = a), (C = l)),
                !S && Math.abs(e - b) <= _ - 1 && a >= p[e])
              )
                return (
                  (i[0] = a),
                  (o[0] = l),
                  n <= p[e] && _ <= 1448
                    ? this.WALKTRACE(
                        y,
                        u,
                        c,
                        v,
                        b,
                        h,
                        f,
                        w,
                        m,
                        p,
                        a,
                        t,
                        i,
                        l,
                        r,
                        o,
                        S,
                        s,
                      )
                    : null
                );
            }
            const E = (d - e + (C - n) - _) / 2;
            if (
              null !== this.ContinueProcessingPredicate &&
              !this.ContinueProcessingPredicate(d, E)
            )
              return (
                (s[0] = !0),
                (i[0] = d),
                (o[0] = C),
                E > 0 && _ <= 1448
                  ? this.WALKTRACE(
                      y,
                      u,
                      c,
                      v,
                      b,
                      h,
                      f,
                      w,
                      m,
                      p,
                      a,
                      t,
                      i,
                      l,
                      r,
                      o,
                      S,
                      s,
                    )
                  : (e++, n++, [new je(e, t - e + 1, n, r - n + 1)])
              );
            (h = this.ClipDiagonalBound(b - _, _, b, g)),
              (f = this.ClipDiagonalBound(b + _, _, b, g));
            for (let d = h; d <= f; d += 2) {
              (a =
                d === h || (d < f && p[d - 1] >= p[d + 1])
                  ? p[d + 1] - 1
                  : p[d - 1]),
                (l = a - (d - b) - w);
              const g = a;
              for (; a > e && l > n && this.ElementsAreEqual(a, l); ) a--, l--;
              if (((p[d] = a), S && Math.abs(d - y) <= _ && a <= m[d]))
                return (
                  (i[0] = a),
                  (o[0] = l),
                  g >= m[d] && _ <= 1448
                    ? this.WALKTRACE(
                        y,
                        u,
                        c,
                        v,
                        b,
                        h,
                        f,
                        w,
                        m,
                        p,
                        a,
                        t,
                        i,
                        l,
                        r,
                        o,
                        S,
                        s,
                      )
                    : null
                );
            }
            if (_ <= 1447) {
              let e = new Int32Array(c - u + 2);
              (e[0] = y - u + 1),
                ze.Copy2(m, u, e, 1, c - u + 1),
                this.m_forwardHistory.push(e),
                (e = new Int32Array(f - h + 2)),
                (e[0] = b - h + 1),
                ze.Copy2(p, h, e, 1, f - h + 1),
                this.m_reverseHistory.push(e);
            }
          }
          return this.WALKTRACE(
            y,
            u,
            c,
            v,
            b,
            h,
            f,
            w,
            m,
            p,
            a,
            t,
            i,
            l,
            r,
            o,
            S,
            s,
          );
        }
        PrettifyChanges(e) {
          for (let t = 0; t < e.length; t++) {
            const n = e[t],
              r =
                t < e.length - 1
                  ? e[t + 1].originalStart
                  : this._originalElementsOrHash.length,
              i =
                t < e.length - 1
                  ? e[t + 1].modifiedStart
                  : this._modifiedElementsOrHash.length,
              o = n.originalLength > 0,
              s = n.modifiedLength > 0;
            for (
              ;
              n.originalStart + n.originalLength < r &&
              n.modifiedStart + n.modifiedLength < i &&
              (!o ||
                this.OriginalElementsAreEqual(
                  n.originalStart,
                  n.originalStart + n.originalLength,
                )) &&
              (!s ||
                this.ModifiedElementsAreEqual(
                  n.modifiedStart,
                  n.modifiedStart + n.modifiedLength,
                ));

            ) {
              const e = this.ElementsAreStrictEqual(
                n.originalStart,
                n.modifiedStart,
              );
              if (
                this.ElementsAreStrictEqual(
                  n.originalStart + n.originalLength,
                  n.modifiedStart + n.modifiedLength,
                ) &&
                !e
              )
                break;
              n.originalStart++, n.modifiedStart++;
            }
            const a = [null];
            t < e.length - 1 &&
              this.ChangesOverlap(e[t], e[t + 1], a) &&
              ((e[t] = a[0]), e.splice(t + 1, 1), t--);
          }
          for (let t = e.length - 1; t >= 0; t--) {
            const n = e[t];
            let r = 0,
              i = 0;
            if (t > 0) {
              const n = e[t - 1];
              (r = n.originalStart + n.originalLength),
                (i = n.modifiedStart + n.modifiedLength);
            }
            const o = n.originalLength > 0,
              s = n.modifiedLength > 0;
            let a = 0,
              l = this._boundaryScore(
                n.originalStart,
                n.originalLength,
                n.modifiedStart,
                n.modifiedLength,
              );
            for (let e = 1; ; e++) {
              const t = n.originalStart - e,
                u = n.modifiedStart - e;
              if (t < r || u < i) break;
              if (o && !this.OriginalElementsAreEqual(t, t + n.originalLength))
                break;
              if (s && !this.ModifiedElementsAreEqual(u, u + n.modifiedLength))
                break;
              const c =
                (t === r && u === i ? 5 : 0) +
                this._boundaryScore(t, n.originalLength, u, n.modifiedLength);
              c > l && ((l = c), (a = e));
            }
            (n.originalStart -= a), (n.modifiedStart -= a);
            const u = [null];
            t > 0 &&
              this.ChangesOverlap(e[t - 1], e[t], u) &&
              ((e[t - 1] = u[0]), e.splice(t, 1), t++);
          }
          if (this._hasStrings)
            for (let t = 1, n = e.length; t < n; t++) {
              const n = e[t - 1],
                r = e[t],
                i = r.originalStart - n.originalStart - n.originalLength,
                o = n.originalStart,
                s = r.originalStart + r.originalLength,
                a = s - o,
                l = n.modifiedStart,
                u = r.modifiedStart + r.modifiedLength,
                c = u - l;
              if (i < 5 && a < 20 && c < 20) {
                const e = this._findBetterContiguousSequence(o, a, l, c, i);
                if (e) {
                  const [t, o] = e;
                  (t === n.originalStart + n.originalLength &&
                    o === n.modifiedStart + n.modifiedLength) ||
                    ((n.originalLength = t - n.originalStart),
                    (n.modifiedLength = o - n.modifiedStart),
                    (r.originalStart = t + i),
                    (r.modifiedStart = o + i),
                    (r.originalLength = s - r.originalStart),
                    (r.modifiedLength = u - r.modifiedStart));
                }
              }
            }
          return e;
        }
        _findBetterContiguousSequence(e, t, n, r, i) {
          if (t < i || r < i) return null;
          const o = e + t - i + 1,
            s = n + r - i + 1;
          let a = 0,
            l = 0,
            u = 0;
          for (let t = e; t < o; t++)
            for (let e = n; e < s; e++) {
              const n = this._contiguousSequenceScore(t, e, i);
              n > 0 && n > a && ((a = n), (l = t), (u = e));
            }
          return a > 0 ? [l, u] : null;
        }
        _contiguousSequenceScore(e, t, n) {
          let r = 0;
          for (let i = 0; i < n; i++) {
            if (!this.ElementsAreEqual(e + i, t + i)) return 0;
            r += this._originalStringElements[e + i].length;
          }
          return r;
        }
        _OriginalIsBoundary(e) {
          return (
            e <= 0 ||
            e >= this._originalElementsOrHash.length - 1 ||
            (this._hasStrings && /^\s*$/.test(this._originalStringElements[e]))
          );
        }
        _OriginalRegionIsBoundary(e, t) {
          if (this._OriginalIsBoundary(e) || this._OriginalIsBoundary(e - 1))
            return !0;
          if (t > 0) {
            const n = e + t;
            if (this._OriginalIsBoundary(n - 1) || this._OriginalIsBoundary(n))
              return !0;
          }
          return !1;
        }
        _ModifiedIsBoundary(e) {
          return (
            e <= 0 ||
            e >= this._modifiedElementsOrHash.length - 1 ||
            (this._hasStrings && /^\s*$/.test(this._modifiedStringElements[e]))
          );
        }
        _ModifiedRegionIsBoundary(e, t) {
          if (this._ModifiedIsBoundary(e) || this._ModifiedIsBoundary(e - 1))
            return !0;
          if (t > 0) {
            const n = e + t;
            if (this._ModifiedIsBoundary(n - 1) || this._ModifiedIsBoundary(n))
              return !0;
          }
          return !1;
        }
        _boundaryScore(e, t, n, r) {
          return (
            (this._OriginalRegionIsBoundary(e, t) ? 1 : 0) +
            (this._ModifiedRegionIsBoundary(n, r) ? 1 : 0)
          );
        }
        ConcatenateChanges(e, t) {
          const n = [];
          if (0 === e.length || 0 === t.length) return t.length > 0 ? t : e;
          if (this.ChangesOverlap(e[e.length - 1], t[0], n)) {
            const r = new Array(e.length + t.length - 1);
            return (
              ze.Copy(e, 0, r, 0, e.length - 1),
              (r[e.length - 1] = n[0]),
              ze.Copy(t, 1, r, e.length, t.length - 1),
              r
            );
          }
          {
            const n = new Array(e.length + t.length);
            return (
              ze.Copy(e, 0, n, 0, e.length),
              ze.Copy(t, 0, n, e.length, t.length),
              n
            );
          }
        }
        ChangesOverlap(e, t, n) {
          if (
            (We.Assert(
              e.originalStart <= t.originalStart,
              'Left change is not less than or equal to right change',
            ),
            We.Assert(
              e.modifiedStart <= t.modifiedStart,
              'Left change is not less than or equal to right change',
            ),
            e.originalStart + e.originalLength >= t.originalStart ||
              e.modifiedStart + e.modifiedLength >= t.modifiedStart)
          ) {
            const r = e.originalStart;
            let i = e.originalLength;
            const o = e.modifiedStart;
            let s = e.modifiedLength;
            return (
              e.originalStart + e.originalLength >= t.originalStart &&
                (i = t.originalStart + t.originalLength - e.originalStart),
              e.modifiedStart + e.modifiedLength >= t.modifiedStart &&
                (s = t.modifiedStart + t.modifiedLength - e.modifiedStart),
              (n[0] = new je(r, i, o, s)),
              !0
            );
          }
          return (n[0] = null), !1;
        }
        ClipDiagonalBound(e, t, n, r) {
          if (e >= 0 && e < r) return e;
          const i = t % 2 == 0;
          if (e < 0) {
            return i === (n % 2 == 0) ? 0 : 1;
          }
          return i === ((r - n - 1) % 2 == 0) ? r - 1 : r - 2;
        }
      }
      var Je = n(907);
      let Xe;
      const Qe = globalThis.vscode;
      if (void 0 !== Qe && void 0 !== Qe.process) {
        const e = Qe.process;
        Xe = {
          get platform() {
            return e.platform;
          },
          get arch() {
            return e.arch;
          },
          get env() {
            return e.env;
          },
          cwd: () => e.cwd(),
        };
      } else
        Xe =
          void 0 !== Je
            ? {
                get platform() {
                  return Je.platform;
                },
                get arch() {
                  return Je.arch;
                },
                get env() {
                  return Je.env;
                },
                cwd: () => Je.env.VSCODE_CWD || Je.cwd(),
              }
            : {
                get platform() {
                  return ae ? 'win32' : le ? 'darwin' : 'linux';
                },
                get arch() {},
                get env() {
                  return {};
                },
                cwd: () => '/',
              };
      const Ye = Xe.cwd,
        Ze = Xe.env,
        et = Xe.platform,
        tt = 46,
        nt = 47,
        rt = 92,
        it = 58;
      class ot extends Error {
        constructor(e, t, n) {
          let r;
          'string' == typeof t && 0 === t.indexOf('not ')
            ? ((r = 'must not be'), (t = t.replace(/^not /, '')))
            : (r = 'must be');
          const i = -1 !== e.indexOf('.') ? 'property' : 'argument';
          let o = `The "${e}" ${i} ${r} of type ${t}`;
          (o += '. Received type ' + typeof n),
            super(o),
            (this.code = 'ERR_INVALID_ARG_TYPE');
        }
      }
      function st(e, t) {
        if ('string' != typeof e) throw new ot(t, 'string', e);
      }
      const at = 'win32' === et;
      function lt(e) {
        return e === nt || e === rt;
      }
      function ut(e) {
        return e === nt;
      }
      function ct(e) {
        return (e >= 65 && e <= 90) || (e >= 97 && e <= 122);
      }
      function ht(e, t, n, r) {
        let i = '',
          o = 0,
          s = -1,
          a = 0,
          l = 0;
        for (let u = 0; u <= e.length; ++u) {
          if (u < e.length) l = e.charCodeAt(u);
          else {
            if (r(l)) break;
            l = nt;
          }
          if (r(l)) {
            if (s === u - 1 || 1 === a);
            else if (2 === a) {
              if (
                i.length < 2 ||
                2 !== o ||
                i.charCodeAt(i.length - 1) !== tt ||
                i.charCodeAt(i.length - 2) !== tt
              ) {
                if (i.length > 2) {
                  const e = i.lastIndexOf(n);
                  -1 === e
                    ? ((i = ''), (o = 0))
                    : ((i = i.slice(0, e)),
                      (o = i.length - 1 - i.lastIndexOf(n))),
                    (s = u),
                    (a = 0);
                  continue;
                }
                if (0 !== i.length) {
                  (i = ''), (o = 0), (s = u), (a = 0);
                  continue;
                }
              }
              t && ((i += i.length > 0 ? `${n}..` : '..'), (o = 2));
            } else
              i.length > 0
                ? (i += `${n}${e.slice(s + 1, u)}`)
                : (i = e.slice(s + 1, u)),
                (o = u - s - 1);
            (s = u), (a = 0);
          } else l === tt && -1 !== a ? ++a : (a = -1);
        }
        return i;
      }
      function ft(e, t) {
        !(function (e, t) {
          if (null === e || 'object' != typeof e) throw new ot(t, 'Object', e);
        })(t, 'pathObject');
        const n = t.dir || t.root,
          r = t.base || `${t.name || ''}${t.ext || ''}`;
        return n ? (n === t.root ? `${n}${r}` : `${n}${e}${r}`) : r;
      }
      const dt = {
          resolve(...e) {
            let t = '',
              n = '',
              r = !1;
            for (let i = e.length - 1; i >= -1; i--) {
              let o;
              if (i >= 0) {
                if (((o = e[i]), st(o, 'path'), 0 === o.length)) continue;
              } else
                0 === t.length
                  ? (o = Ye())
                  : ((o = Ze[`=${t}`] || Ye()),
                    (void 0 === o ||
                      (o.slice(0, 2).toLowerCase() !== t.toLowerCase() &&
                        o.charCodeAt(2) === rt)) &&
                      (o = `${t}\\`));
              const s = o.length;
              let a = 0,
                l = '',
                u = !1;
              const c = o.charCodeAt(0);
              if (1 === s) lt(c) && ((a = 1), (u = !0));
              else if (lt(c))
                if (((u = !0), lt(o.charCodeAt(1)))) {
                  let e = 2,
                    t = e;
                  for (; e < s && !lt(o.charCodeAt(e)); ) e++;
                  if (e < s && e !== t) {
                    const n = o.slice(t, e);
                    for (t = e; e < s && lt(o.charCodeAt(e)); ) e++;
                    if (e < s && e !== t) {
                      for (t = e; e < s && !lt(o.charCodeAt(e)); ) e++;
                      (e !== s && e === t) ||
                        ((l = `\\\\${n}\\${o.slice(t, e)}`), (a = e));
                    }
                  }
                } else a = 1;
              else
                ct(c) &&
                  o.charCodeAt(1) === it &&
                  ((l = o.slice(0, 2)),
                  (a = 2),
                  s > 2 && lt(o.charCodeAt(2)) && ((u = !0), (a = 3)));
              if (l.length > 0)
                if (t.length > 0) {
                  if (l.toLowerCase() !== t.toLowerCase()) continue;
                } else t = l;
              if (r) {
                if (t.length > 0) break;
              } else if (
                ((n = `${o.slice(a)}\\${n}`), (r = u), u && t.length > 0)
              )
                break;
            }
            return (
              (n = ht(n, !r, '\\', lt)), r ? `${t}\\${n}` : `${t}${n}` || '.'
            );
          },
          normalize(e) {
            st(e, 'path');
            const t = e.length;
            if (0 === t) return '.';
            let n,
              r = 0,
              i = !1;
            const o = e.charCodeAt(0);
            if (1 === t) return ut(o) ? '\\' : e;
            if (lt(o))
              if (((i = !0), lt(e.charCodeAt(1)))) {
                let i = 2,
                  o = i;
                for (; i < t && !lt(e.charCodeAt(i)); ) i++;
                if (i < t && i !== o) {
                  const s = e.slice(o, i);
                  for (o = i; i < t && lt(e.charCodeAt(i)); ) i++;
                  if (i < t && i !== o) {
                    for (o = i; i < t && !lt(e.charCodeAt(i)); ) i++;
                    if (i === t) return `\\\\${s}\\${e.slice(o)}\\`;
                    i !== o && ((n = `\\\\${s}\\${e.slice(o, i)}`), (r = i));
                  }
                }
              } else r = 1;
            else
              ct(o) &&
                e.charCodeAt(1) === it &&
                ((n = e.slice(0, 2)),
                (r = 2),
                t > 2 && lt(e.charCodeAt(2)) && ((i = !0), (r = 3)));
            let s = r < t ? ht(e.slice(r), !i, '\\', lt) : '';
            return (
              0 !== s.length || i || (s = '.'),
              s.length > 0 && lt(e.charCodeAt(t - 1)) && (s += '\\'),
              void 0 === n ? (i ? `\\${s}` : s) : i ? `${n}\\${s}` : `${n}${s}`
            );
          },
          isAbsolute(e) {
            st(e, 'path');
            const t = e.length;
            if (0 === t) return !1;
            const n = e.charCodeAt(0);
            return (
              lt(n) ||
              (t > 2 && ct(n) && e.charCodeAt(1) === it && lt(e.charCodeAt(2)))
            );
          },
          join(...e) {
            if (0 === e.length) return '.';
            let t, n;
            for (let r = 0; r < e.length; ++r) {
              const i = e[r];
              st(i, 'path'),
                i.length > 0 && (void 0 === t ? (t = n = i) : (t += `\\${i}`));
            }
            if (void 0 === t) return '.';
            let r = !0,
              i = 0;
            if ('string' == typeof n && lt(n.charCodeAt(0))) {
              ++i;
              const e = n.length;
              e > 1 &&
                lt(n.charCodeAt(1)) &&
                (++i, e > 2 && (lt(n.charCodeAt(2)) ? ++i : (r = !1)));
            }
            if (r) {
              for (; i < t.length && lt(t.charCodeAt(i)); ) i++;
              i >= 2 && (t = `\\${t.slice(i)}`);
            }
            return dt.normalize(t);
          },
          relative(e, t) {
            if ((st(e, 'from'), st(t, 'to'), e === t)) return '';
            const n = dt.resolve(e),
              r = dt.resolve(t);
            if (n === r) return '';
            if ((e = n.toLowerCase()) === (t = r.toLowerCase())) return '';
            let i = 0;
            for (; i < e.length && e.charCodeAt(i) === rt; ) i++;
            let o = e.length;
            for (; o - 1 > i && e.charCodeAt(o - 1) === rt; ) o--;
            const s = o - i;
            let a = 0;
            for (; a < t.length && t.charCodeAt(a) === rt; ) a++;
            let l = t.length;
            for (; l - 1 > a && t.charCodeAt(l - 1) === rt; ) l--;
            const u = l - a,
              c = s < u ? s : u;
            let h = -1,
              f = 0;
            for (; f < c; f++) {
              const n = e.charCodeAt(i + f);
              if (n !== t.charCodeAt(a + f)) break;
              n === rt && (h = f);
            }
            if (f !== c) {
              if (-1 === h) return r;
            } else {
              if (u > c) {
                if (t.charCodeAt(a + f) === rt) return r.slice(a + f + 1);
                if (2 === f) return r.slice(a + f);
              }
              s > c &&
                (e.charCodeAt(i + f) === rt ? (h = f) : 2 === f && (h = 3)),
                -1 === h && (h = 0);
            }
            let d = '';
            for (f = i + h + 1; f <= o; ++f)
              (f !== o && e.charCodeAt(f) !== rt) ||
                (d += 0 === d.length ? '..' : '\\..');
            return (
              (a += h),
              d.length > 0
                ? `${d}${r.slice(a, l)}`
                : (r.charCodeAt(a) === rt && ++a, r.slice(a, l))
            );
          },
          toNamespacedPath(e) {
            if ('string' != typeof e || 0 === e.length) return e;
            const t = dt.resolve(e);
            if (t.length <= 2) return e;
            if (t.charCodeAt(0) === rt) {
              if (t.charCodeAt(1) === rt) {
                const e = t.charCodeAt(2);
                if (63 !== e && e !== tt) return `\\\\?\\UNC\\${t.slice(2)}`;
              }
            } else if (
              ct(t.charCodeAt(0)) &&
              t.charCodeAt(1) === it &&
              t.charCodeAt(2) === rt
            )
              return `\\\\?\\${t}`;
            return e;
          },
          dirname(e) {
            st(e, 'path');
            const t = e.length;
            if (0 === t) return '.';
            let n = -1,
              r = 0;
            const i = e.charCodeAt(0);
            if (1 === t) return lt(i) ? e : '.';
            if (lt(i)) {
              if (((n = r = 1), lt(e.charCodeAt(1)))) {
                let i = 2,
                  o = i;
                for (; i < t && !lt(e.charCodeAt(i)); ) i++;
                if (i < t && i !== o) {
                  for (o = i; i < t && lt(e.charCodeAt(i)); ) i++;
                  if (i < t && i !== o) {
                    for (o = i; i < t && !lt(e.charCodeAt(i)); ) i++;
                    if (i === t) return e;
                    i !== o && (n = r = i + 1);
                  }
                }
              }
            } else
              ct(i) &&
                e.charCodeAt(1) === it &&
                ((n = t > 2 && lt(e.charCodeAt(2)) ? 3 : 2), (r = n));
            let o = -1,
              s = !0;
            for (let n = t - 1; n >= r; --n)
              if (lt(e.charCodeAt(n))) {
                if (!s) {
                  o = n;
                  break;
                }
              } else s = !1;
            if (-1 === o) {
              if (-1 === n) return '.';
              o = n;
            }
            return e.slice(0, o);
          },
          basename(e, t) {
            void 0 !== t && st(t, 'ext'), st(e, 'path');
            let n,
              r = 0,
              i = -1,
              o = !0;
            if (
              (e.length >= 2 &&
                ct(e.charCodeAt(0)) &&
                e.charCodeAt(1) === it &&
                (r = 2),
              void 0 !== t && t.length > 0 && t.length <= e.length)
            ) {
              if (t === e) return '';
              let s = t.length - 1,
                a = -1;
              for (n = e.length - 1; n >= r; --n) {
                const l = e.charCodeAt(n);
                if (lt(l)) {
                  if (!o) {
                    r = n + 1;
                    break;
                  }
                } else
                  -1 === a && ((o = !1), (a = n + 1)),
                    s >= 0 &&
                      (l === t.charCodeAt(s)
                        ? -1 == --s && (i = n)
                        : ((s = -1), (i = a)));
              }
              return (
                r === i ? (i = a) : -1 === i && (i = e.length), e.slice(r, i)
              );
            }
            for (n = e.length - 1; n >= r; --n)
              if (lt(e.charCodeAt(n))) {
                if (!o) {
                  r = n + 1;
                  break;
                }
              } else -1 === i && ((o = !1), (i = n + 1));
            return -1 === i ? '' : e.slice(r, i);
          },
          extname(e) {
            st(e, 'path');
            let t = 0,
              n = -1,
              r = 0,
              i = -1,
              o = !0,
              s = 0;
            e.length >= 2 &&
              e.charCodeAt(1) === it &&
              ct(e.charCodeAt(0)) &&
              (t = r = 2);
            for (let a = e.length - 1; a >= t; --a) {
              const t = e.charCodeAt(a);
              if (lt(t)) {
                if (!o) {
                  r = a + 1;
                  break;
                }
              } else
                -1 === i && ((o = !1), (i = a + 1)),
                  t === tt
                    ? -1 === n
                      ? (n = a)
                      : 1 !== s && (s = 1)
                    : -1 !== n && (s = -1);
            }
            return -1 === n ||
              -1 === i ||
              0 === s ||
              (1 === s && n === i - 1 && n === r + 1)
              ? ''
              : e.slice(n, i);
          },
          format: ft.bind(null, '\\'),
          parse(e) {
            st(e, 'path');
            const t = { root: '', dir: '', base: '', ext: '', name: '' };
            if (0 === e.length) return t;
            const n = e.length;
            let r = 0,
              i = e.charCodeAt(0);
            if (1 === n)
              return lt(i)
                ? ((t.root = t.dir = e), t)
                : ((t.base = t.name = e), t);
            if (lt(i)) {
              if (((r = 1), lt(e.charCodeAt(1)))) {
                let t = 2,
                  i = t;
                for (; t < n && !lt(e.charCodeAt(t)); ) t++;
                if (t < n && t !== i) {
                  for (i = t; t < n && lt(e.charCodeAt(t)); ) t++;
                  if (t < n && t !== i) {
                    for (i = t; t < n && !lt(e.charCodeAt(t)); ) t++;
                    t === n ? (r = t) : t !== i && (r = t + 1);
                  }
                }
              }
            } else if (ct(i) && e.charCodeAt(1) === it) {
              if (n <= 2) return (t.root = t.dir = e), t;
              if (((r = 2), lt(e.charCodeAt(2)))) {
                if (3 === n) return (t.root = t.dir = e), t;
                r = 3;
              }
            }
            r > 0 && (t.root = e.slice(0, r));
            let o = -1,
              s = r,
              a = -1,
              l = !0,
              u = e.length - 1,
              c = 0;
            for (; u >= r; --u)
              if (((i = e.charCodeAt(u)), lt(i))) {
                if (!l) {
                  s = u + 1;
                  break;
                }
              } else
                -1 === a && ((l = !1), (a = u + 1)),
                  i === tt
                    ? -1 === o
                      ? (o = u)
                      : 1 !== c && (c = 1)
                    : -1 !== o && (c = -1);
            return (
              -1 !== a &&
                (-1 === o || 0 === c || (1 === c && o === a - 1 && o === s + 1)
                  ? (t.base = t.name = e.slice(s, a))
                  : ((t.name = e.slice(s, o)),
                    (t.base = e.slice(s, a)),
                    (t.ext = e.slice(o, a)))),
              (t.dir = s > 0 && s !== r ? e.slice(0, s - 1) : t.root),
              t
            );
          },
          sep: '\\',
          delimiter: ';',
          win32: null,
          posix: null,
        },
        gt = (() => {
          if (at) {
            const e = /\\/g;
            return () => {
              const t = Ye().replace(e, '/');
              return t.slice(t.indexOf('/'));
            };
          }
          return () => Ye();
        })(),
        mt = {
          resolve(...e) {
            let t = '',
              n = !1;
            for (let r = e.length - 1; r >= -1 && !n; r--) {
              const i = r >= 0 ? e[r] : gt();
              st(i, 'path'),
                0 !== i.length &&
                  ((t = `${i}/${t}`), (n = i.charCodeAt(0) === nt));
            }
            return (
              (t = ht(t, !n, '/', ut)), n ? `/${t}` : t.length > 0 ? t : '.'
            );
          },
          normalize(e) {
            if ((st(e, 'path'), 0 === e.length)) return '.';
            const t = e.charCodeAt(0) === nt,
              n = e.charCodeAt(e.length - 1) === nt;
            return 0 === (e = ht(e, !t, '/', ut)).length
              ? t
                ? '/'
                : n
                ? './'
                : '.'
              : (n && (e += '/'), t ? `/${e}` : e);
          },
          isAbsolute: e => (
            st(e, 'path'), e.length > 0 && e.charCodeAt(0) === nt
          ),
          join(...e) {
            if (0 === e.length) return '.';
            let t;
            for (let n = 0; n < e.length; ++n) {
              const r = e[n];
              st(r, 'path'),
                r.length > 0 && (void 0 === t ? (t = r) : (t += `/${r}`));
            }
            return void 0 === t ? '.' : mt.normalize(t);
          },
          relative(e, t) {
            if ((st(e, 'from'), st(t, 'to'), e === t)) return '';
            if ((e = mt.resolve(e)) === (t = mt.resolve(t))) return '';
            const n = e.length,
              r = n - 1,
              i = t.length - 1,
              o = r < i ? r : i;
            let s = -1,
              a = 0;
            for (; a < o; a++) {
              const n = e.charCodeAt(1 + a);
              if (n !== t.charCodeAt(1 + a)) break;
              n === nt && (s = a);
            }
            if (a === o)
              if (i > o) {
                if (t.charCodeAt(1 + a) === nt) return t.slice(1 + a + 1);
                if (0 === a) return t.slice(1 + a);
              } else
                r > o &&
                  (e.charCodeAt(1 + a) === nt ? (s = a) : 0 === a && (s = 0));
            let l = '';
            for (a = 1 + s + 1; a <= n; ++a)
              (a !== n && e.charCodeAt(a) !== nt) ||
                (l += 0 === l.length ? '..' : '/..');
            return `${l}${t.slice(1 + s)}`;
          },
          toNamespacedPath: e => e,
          dirname(e) {
            if ((st(e, 'path'), 0 === e.length)) return '.';
            const t = e.charCodeAt(0) === nt;
            let n = -1,
              r = !0;
            for (let t = e.length - 1; t >= 1; --t)
              if (e.charCodeAt(t) === nt) {
                if (!r) {
                  n = t;
                  break;
                }
              } else r = !1;
            return -1 === n
              ? t
                ? '/'
                : '.'
              : t && 1 === n
              ? '//'
              : e.slice(0, n);
          },
          basename(e, t) {
            void 0 !== t && st(t, 'ext'), st(e, 'path');
            let n,
              r = 0,
              i = -1,
              o = !0;
            if (void 0 !== t && t.length > 0 && t.length <= e.length) {
              if (t === e) return '';
              let s = t.length - 1,
                a = -1;
              for (n = e.length - 1; n >= 0; --n) {
                const l = e.charCodeAt(n);
                if (l === nt) {
                  if (!o) {
                    r = n + 1;
                    break;
                  }
                } else
                  -1 === a && ((o = !1), (a = n + 1)),
                    s >= 0 &&
                      (l === t.charCodeAt(s)
                        ? -1 == --s && (i = n)
                        : ((s = -1), (i = a)));
              }
              return (
                r === i ? (i = a) : -1 === i && (i = e.length), e.slice(r, i)
              );
            }
            for (n = e.length - 1; n >= 0; --n)
              if (e.charCodeAt(n) === nt) {
                if (!o) {
                  r = n + 1;
                  break;
                }
              } else -1 === i && ((o = !1), (i = n + 1));
            return -1 === i ? '' : e.slice(r, i);
          },
          extname(e) {
            st(e, 'path');
            let t = -1,
              n = 0,
              r = -1,
              i = !0,
              o = 0;
            for (let s = e.length - 1; s >= 0; --s) {
              const a = e.charCodeAt(s);
              if (a !== nt)
                -1 === r && ((i = !1), (r = s + 1)),
                  a === tt
                    ? -1 === t
                      ? (t = s)
                      : 1 !== o && (o = 1)
                    : -1 !== t && (o = -1);
              else if (!i) {
                n = s + 1;
                break;
              }
            }
            return -1 === t ||
              -1 === r ||
              0 === o ||
              (1 === o && t === r - 1 && t === n + 1)
              ? ''
              : e.slice(t, r);
          },
          format: ft.bind(null, '/'),
          parse(e) {
            st(e, 'path');
            const t = { root: '', dir: '', base: '', ext: '', name: '' };
            if (0 === e.length) return t;
            const n = e.charCodeAt(0) === nt;
            let r;
            n ? ((t.root = '/'), (r = 1)) : (r = 0);
            let i = -1,
              o = 0,
              s = -1,
              a = !0,
              l = e.length - 1,
              u = 0;
            for (; l >= r; --l) {
              const t = e.charCodeAt(l);
              if (t !== nt)
                -1 === s && ((a = !1), (s = l + 1)),
                  t === tt
                    ? -1 === i
                      ? (i = l)
                      : 1 !== u && (u = 1)
                    : -1 !== i && (u = -1);
              else if (!a) {
                o = l + 1;
                break;
              }
            }
            if (-1 !== s) {
              const r = 0 === o && n ? 1 : o;
              -1 === i || 0 === u || (1 === u && i === s - 1 && i === o + 1)
                ? (t.base = t.name = e.slice(r, s))
                : ((t.name = e.slice(r, i)),
                  (t.base = e.slice(r, s)),
                  (t.ext = e.slice(i, s)));
            }
            return o > 0 ? (t.dir = e.slice(0, o - 1)) : n && (t.dir = '/'), t;
          },
          sep: '/',
          delimiter: ':',
          win32: null,
          posix: null,
        };
      (mt.win32 = dt.win32 = dt), (mt.posix = dt.posix = mt);
      at ? dt.normalize : mt.normalize,
        at ? dt.resolve : mt.resolve,
        at ? dt.relative : mt.relative,
        at ? dt.dirname : mt.dirname,
        at ? dt.basename : mt.basename,
        at ? dt.extname : mt.extname,
        at ? dt.sep : mt.sep;
      const pt = /^\w[\w\d+.-]*$/,
        yt = /^\//,
        bt = /^\/\//;
      const vt = '',
        wt = '/',
        St = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
      class _t {
        static isUri(e) {
          return (
            e instanceof _t ||
            (!!e &&
              'string' == typeof e.authority &&
              'string' == typeof e.fragment &&
              'string' == typeof e.path &&
              'string' == typeof e.query &&
              'string' == typeof e.scheme &&
              'string' == typeof e.fsPath &&
              'function' == typeof e.with &&
              'function' == typeof e.toString)
          );
        }
        constructor(e, t, n, r, i, o = !1) {
          'object' == typeof e
            ? ((this.scheme = e.scheme || vt),
              (this.authority = e.authority || vt),
              (this.path = e.path || vt),
              (this.query = e.query || vt),
              (this.fragment = e.fragment || vt))
            : ((this.scheme = (function (e, t) {
                return e || t ? e : 'file';
              })(e, o)),
              (this.authority = t || vt),
              (this.path = (function (e, t) {
                switch (e) {
                  case 'https':
                  case 'http':
                  case 'file':
                    t ? t[0] !== wt && (t = wt + t) : (t = wt);
                }
                return t;
              })(this.scheme, n || vt)),
              (this.query = r || vt),
              (this.fragment = i || vt),
              (function (e, t) {
                if (!e.scheme && t)
                  throw new Error(
                    `[UriError]: Scheme is missing: {scheme: "", authority: "${e.authority}", path: "${e.path}", query: "${e.query}", fragment: "${e.fragment}"}`,
                  );
                if (e.scheme && !pt.test(e.scheme))
                  throw new Error(
                    '[UriError]: Scheme contains illegal characters.',
                  );
                if (e.path)
                  if (e.authority) {
                    if (!yt.test(e.path))
                      throw new Error(
                        '[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character',
                      );
                  } else if (bt.test(e.path))
                    throw new Error(
                      '[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")',
                    );
              })(this, o));
        }
        get fsPath() {
          return Lt(this, !1);
        }
        with(e) {
          if (!e) return this;
          let { scheme: t, authority: n, path: r, query: i, fragment: o } = e;
          return (
            void 0 === t ? (t = this.scheme) : null === t && (t = vt),
            void 0 === n ? (n = this.authority) : null === n && (n = vt),
            void 0 === r ? (r = this.path) : null === r && (r = vt),
            void 0 === i ? (i = this.query) : null === i && (i = vt),
            void 0 === o ? (o = this.fragment) : null === o && (o = vt),
            t === this.scheme &&
            n === this.authority &&
            r === this.path &&
            i === this.query &&
            o === this.fragment
              ? this
              : new Et(t, n, r, i, o)
          );
        }
        static parse(e, t = !1) {
          const n = St.exec(e);
          return n
            ? new Et(
                n[2] || vt,
                Tt(n[4] || vt),
                Tt(n[5] || vt),
                Tt(n[7] || vt),
                Tt(n[9] || vt),
                t,
              )
            : new Et(vt, vt, vt, vt, vt);
        }
        static file(e) {
          let t = vt;
          if ((ae && (e = e.replace(/\\/g, wt)), e[0] === wt && e[1] === wt)) {
            const n = e.indexOf(wt, 2);
            -1 === n
              ? ((t = e.substring(2)), (e = wt))
              : ((t = e.substring(2, n)), (e = e.substring(n) || wt));
          }
          return new Et('file', t, e, vt, vt);
        }
        static from(e, t) {
          return new Et(e.scheme, e.authority, e.path, e.query, e.fragment, t);
        }
        static joinPath(e, ...t) {
          if (!e.path)
            throw new Error(
              '[UriError]: cannot call joinPath on URI without path',
            );
          let n;
          return (
            (n =
              ae && 'file' === e.scheme
                ? _t.file(dt.join(Lt(e, !0), ...t)).path
                : mt.join(e.path, ...t)),
            e.with({ path: n })
          );
        }
        toString(e = !1) {
          return Ot(this, e);
        }
        toJSON() {
          return this;
        }
        static revive(e) {
          var t, n;
          if (e) {
            if (e instanceof _t) return e;
            {
              const r = new Et(e);
              return (
                (r._formatted =
                  null !== (t = e.external) && void 0 !== t ? t : null),
                (r._fsPath =
                  e._sep === Ct && null !== (n = e.fsPath) && void 0 !== n
                    ? n
                    : null),
                r
              );
            }
          }
          return e;
        }
      }
      const Ct = ae ? 1 : void 0;
      class Et extends _t {
        constructor() {
          super(...arguments), (this._formatted = null), (this._fsPath = null);
        }
        get fsPath() {
          return this._fsPath || (this._fsPath = Lt(this, !1)), this._fsPath;
        }
        toString(e = !1) {
          return e
            ? Ot(this, !0)
            : (this._formatted || (this._formatted = Ot(this, !1)),
              this._formatted);
        }
        toJSON() {
          const e = { $mid: 1 };
          return (
            this._fsPath && ((e.fsPath = this._fsPath), (e._sep = Ct)),
            this._formatted && (e.external = this._formatted),
            this.path && (e.path = this.path),
            this.scheme && (e.scheme = this.scheme),
            this.authority && (e.authority = this.authority),
            this.query && (e.query = this.query),
            this.fragment && (e.fragment = this.fragment),
            e
          );
        }
      }
      const At = {
        58: '%3A',
        47: '%2F',
        63: '%3F',
        35: '%23',
        91: '%5B',
        93: '%5D',
        64: '%40',
        33: '%21',
        36: '%24',
        38: '%26',
        39: '%27',
        40: '%28',
        41: '%29',
        42: '%2A',
        43: '%2B',
        44: '%2C',
        59: '%3B',
        61: '%3D',
        32: '%20',
      };
      function xt(e, t, n) {
        let r,
          i = -1;
        for (let o = 0; o < e.length; o++) {
          const s = e.charCodeAt(o);
          if (
            (s >= 97 && s <= 122) ||
            (s >= 65 && s <= 90) ||
            (s >= 48 && s <= 57) ||
            45 === s ||
            46 === s ||
            95 === s ||
            126 === s ||
            (t && 47 === s) ||
            (n && 91 === s) ||
            (n && 93 === s) ||
            (n && 58 === s)
          )
            -1 !== i &&
              ((r += encodeURIComponent(e.substring(i, o))), (i = -1)),
              void 0 !== r && (r += e.charAt(o));
          else {
            void 0 === r && (r = e.substr(0, o));
            const t = At[s];
            void 0 !== t
              ? (-1 !== i &&
                  ((r += encodeURIComponent(e.substring(i, o))), (i = -1)),
                (r += t))
              : -1 === i && (i = o);
          }
        }
        return (
          -1 !== i && (r += encodeURIComponent(e.substring(i))),
          void 0 !== r ? r : e
        );
      }
      function Nt(e) {
        let t;
        for (let n = 0; n < e.length; n++) {
          const r = e.charCodeAt(n);
          35 === r || 63 === r
            ? (void 0 === t && (t = e.substr(0, n)), (t += At[r]))
            : void 0 !== t && (t += e[n]);
        }
        return void 0 !== t ? t : e;
      }
      function Lt(e, t) {
        let n;
        return (
          (n =
            e.authority && e.path.length > 1 && 'file' === e.scheme
              ? `//${e.authority}${e.path}`
              : 47 === e.path.charCodeAt(0) &&
                ((e.path.charCodeAt(1) >= 65 && e.path.charCodeAt(1) <= 90) ||
                  (e.path.charCodeAt(1) >= 97 &&
                    e.path.charCodeAt(1) <= 122)) &&
                58 === e.path.charCodeAt(2)
              ? t
                ? e.path.substr(1)
                : e.path[1].toLowerCase() + e.path.substr(2)
              : e.path),
          ae && (n = n.replace(/\//g, '\\')),
          n
        );
      }
      function Ot(e, t) {
        const n = t ? Nt : xt;
        let r = '',
          { scheme: i, authority: o, path: s, query: a, fragment: l } = e;
        if (
          (i && ((r += i), (r += ':')),
          (o || 'file' === i) && ((r += wt), (r += wt)),
          o)
        ) {
          let e = o.indexOf('@');
          if (-1 !== e) {
            const t = o.substr(0, e);
            (o = o.substr(e + 1)),
              (e = t.lastIndexOf(':')),
              -1 === e
                ? (r += n(t, !1, !1))
                : ((r += n(t.substr(0, e), !1, !1)),
                  (r += ':'),
                  (r += n(t.substr(e + 1), !1, !0))),
              (r += '@');
          }
          (o = o.toLowerCase()),
            (e = o.lastIndexOf(':')),
            -1 === e
              ? (r += n(o, !1, !0))
              : ((r += n(o.substr(0, e), !1, !0)), (r += o.substr(e)));
        }
        if (s) {
          if (
            s.length >= 3 &&
            47 === s.charCodeAt(0) &&
            58 === s.charCodeAt(2)
          ) {
            const e = s.charCodeAt(1);
            e >= 65 &&
              e <= 90 &&
              (s = `/${String.fromCharCode(e + 32)}:${s.substr(3)}`);
          } else if (s.length >= 2 && 58 === s.charCodeAt(1)) {
            const e = s.charCodeAt(0);
            e >= 65 &&
              e <= 90 &&
              (s = `${String.fromCharCode(e + 32)}:${s.substr(2)}`);
          }
          r += n(s, !0, !1);
        }
        return (
          a && ((r += '?'), (r += n(a, !1, !1))),
          l && ((r += '#'), (r += t ? l : xt(l, !1, !1))),
          r
        );
      }
      function kt(e) {
        try {
          return decodeURIComponent(e);
        } catch (t) {
          return e.length > 3 ? e.substr(0, 3) + kt(e.substr(3)) : e;
        }
      }
      const Rt = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
      function Tt(e) {
        return e.match(Rt) ? e.replace(Rt, e => kt(e)) : e;
      }
      class Mt {
        constructor(e, t) {
          (this.lineNumber = e), (this.column = t);
        }
        with(e = this.lineNumber, t = this.column) {
          return e === this.lineNumber && t === this.column
            ? this
            : new Mt(e, t);
        }
        delta(e = 0, t = 0) {
          return this.with(this.lineNumber + e, this.column + t);
        }
        equals(e) {
          return Mt.equals(this, e);
        }
        static equals(e, t) {
          return (
            (!e && !t) ||
            (!!e &&
              !!t &&
              e.lineNumber === t.lineNumber &&
              e.column === t.column)
          );
        }
        isBefore(e) {
          return Mt.isBefore(this, e);
        }
        static isBefore(e, t) {
          return (
            e.lineNumber < t.lineNumber ||
            (!(t.lineNumber < e.lineNumber) && e.column < t.column)
          );
        }
        isBeforeOrEqual(e) {
          return Mt.isBeforeOrEqual(this, e);
        }
        static isBeforeOrEqual(e, t) {
          return (
            e.lineNumber < t.lineNumber ||
            (!(t.lineNumber < e.lineNumber) && e.column <= t.column)
          );
        }
        static compare(e, t) {
          const n = 0 | e.lineNumber,
            r = 0 | t.lineNumber;
          if (n === r) {
            return (0 | e.column) - (0 | t.column);
          }
          return n - r;
        }
        clone() {
          return new Mt(this.lineNumber, this.column);
        }
        toString() {
          return '(' + this.lineNumber + ',' + this.column + ')';
        }
        static lift(e) {
          return new Mt(e.lineNumber, e.column);
        }
        static isIPosition(e) {
          return (
            e && 'number' == typeof e.lineNumber && 'number' == typeof e.column
          );
        }
        toJSON() {
          return { lineNumber: this.lineNumber, column: this.column };
        }
      }
      class Pt {
        constructor(e, t, n, r) {
          e > n || (e === n && t > r)
            ? ((this.startLineNumber = n),
              (this.startColumn = r),
              (this.endLineNumber = e),
              (this.endColumn = t))
            : ((this.startLineNumber = e),
              (this.startColumn = t),
              (this.endLineNumber = n),
              (this.endColumn = r));
        }
        isEmpty() {
          return Pt.isEmpty(this);
        }
        static isEmpty(e) {
          return (
            e.startLineNumber === e.endLineNumber &&
            e.startColumn === e.endColumn
          );
        }
        containsPosition(e) {
          return Pt.containsPosition(this, e);
        }
        static containsPosition(e, t) {
          return (
            !(
              t.lineNumber < e.startLineNumber || t.lineNumber > e.endLineNumber
            ) &&
            !(t.lineNumber === e.startLineNumber && t.column < e.startColumn) &&
            !(t.lineNumber === e.endLineNumber && t.column > e.endColumn)
          );
        }
        static strictContainsPosition(e, t) {
          return (
            !(
              t.lineNumber < e.startLineNumber || t.lineNumber > e.endLineNumber
            ) &&
            !(
              t.lineNumber === e.startLineNumber && t.column <= e.startColumn
            ) &&
            !(t.lineNumber === e.endLineNumber && t.column >= e.endColumn)
          );
        }
        containsRange(e) {
          return Pt.containsRange(this, e);
        }
        static containsRange(e, t) {
          return (
            !(
              t.startLineNumber < e.startLineNumber ||
              t.endLineNumber < e.startLineNumber
            ) &&
            !(
              t.startLineNumber > e.endLineNumber ||
              t.endLineNumber > e.endLineNumber
            ) &&
            !(
              t.startLineNumber === e.startLineNumber &&
              t.startColumn < e.startColumn
            ) &&
            !(t.endLineNumber === e.endLineNumber && t.endColumn > e.endColumn)
          );
        }
        strictContainsRange(e) {
          return Pt.strictContainsRange(this, e);
        }
        static strictContainsRange(e, t) {
          return (
            !(
              t.startLineNumber < e.startLineNumber ||
              t.endLineNumber < e.startLineNumber
            ) &&
            !(
              t.startLineNumber > e.endLineNumber ||
              t.endLineNumber > e.endLineNumber
            ) &&
            !(
              t.startLineNumber === e.startLineNumber &&
              t.startColumn <= e.startColumn
            ) &&
            !(t.endLineNumber === e.endLineNumber && t.endColumn >= e.endColumn)
          );
        }
        plusRange(e) {
          return Pt.plusRange(this, e);
        }
        static plusRange(e, t) {
          let n, r, i, o;
          return (
            t.startLineNumber < e.startLineNumber
              ? ((n = t.startLineNumber), (r = t.startColumn))
              : t.startLineNumber === e.startLineNumber
              ? ((n = t.startLineNumber),
                (r = Math.min(t.startColumn, e.startColumn)))
              : ((n = e.startLineNumber), (r = e.startColumn)),
            t.endLineNumber > e.endLineNumber
              ? ((i = t.endLineNumber), (o = t.endColumn))
              : t.endLineNumber === e.endLineNumber
              ? ((i = t.endLineNumber),
                (o = Math.max(t.endColumn, e.endColumn)))
              : ((i = e.endLineNumber), (o = e.endColumn)),
            new Pt(n, r, i, o)
          );
        }
        intersectRanges(e) {
          return Pt.intersectRanges(this, e);
        }
        static intersectRanges(e, t) {
          let n = e.startLineNumber,
            r = e.startColumn,
            i = e.endLineNumber,
            o = e.endColumn;
          const s = t.startLineNumber,
            a = t.startColumn,
            l = t.endLineNumber,
            u = t.endColumn;
          return (
            n < s ? ((n = s), (r = a)) : n === s && (r = Math.max(r, a)),
            i > l ? ((i = l), (o = u)) : i === l && (o = Math.min(o, u)),
            n > i || (n === i && r > o) ? null : new Pt(n, r, i, o)
          );
        }
        equalsRange(e) {
          return Pt.equalsRange(this, e);
        }
        static equalsRange(e, t) {
          return (
            (!e && !t) ||
            (!!e &&
              !!t &&
              e.startLineNumber === t.startLineNumber &&
              e.startColumn === t.startColumn &&
              e.endLineNumber === t.endLineNumber &&
              e.endColumn === t.endColumn)
          );
        }
        getEndPosition() {
          return Pt.getEndPosition(this);
        }
        static getEndPosition(e) {
          return new Mt(e.endLineNumber, e.endColumn);
        }
        getStartPosition() {
          return Pt.getStartPosition(this);
        }
        static getStartPosition(e) {
          return new Mt(e.startLineNumber, e.startColumn);
        }
        toString() {
          return (
            '[' +
            this.startLineNumber +
            ',' +
            this.startColumn +
            ' -> ' +
            this.endLineNumber +
            ',' +
            this.endColumn +
            ']'
          );
        }
        setEndPosition(e, t) {
          return new Pt(this.startLineNumber, this.startColumn, e, t);
        }
        setStartPosition(e, t) {
          return new Pt(e, t, this.endLineNumber, this.endColumn);
        }
        collapseToStart() {
          return Pt.collapseToStart(this);
        }
        static collapseToStart(e) {
          return new Pt(
            e.startLineNumber,
            e.startColumn,
            e.startLineNumber,
            e.startColumn,
          );
        }
        collapseToEnd() {
          return Pt.collapseToEnd(this);
        }
        static collapseToEnd(e) {
          return new Pt(
            e.endLineNumber,
            e.endColumn,
            e.endLineNumber,
            e.endColumn,
          );
        }
        delta(e) {
          return new Pt(
            this.startLineNumber + e,
            this.startColumn,
            this.endLineNumber + e,
            this.endColumn,
          );
        }
        static fromPositions(e, t = e) {
          return new Pt(e.lineNumber, e.column, t.lineNumber, t.column);
        }
        static lift(e) {
          return e
            ? new Pt(
                e.startLineNumber,
                e.startColumn,
                e.endLineNumber,
                e.endColumn,
              )
            : null;
        }
        static isIRange(e) {
          return (
            e &&
            'number' == typeof e.startLineNumber &&
            'number' == typeof e.startColumn &&
            'number' == typeof e.endLineNumber &&
            'number' == typeof e.endColumn
          );
        }
        static areIntersectingOrTouching(e, t) {
          return (
            !(
              e.endLineNumber < t.startLineNumber ||
              (e.endLineNumber === t.startLineNumber &&
                e.endColumn < t.startColumn)
            ) &&
            !(
              t.endLineNumber < e.startLineNumber ||
              (t.endLineNumber === e.startLineNumber &&
                t.endColumn < e.startColumn)
            )
          );
        }
        static areIntersecting(e, t) {
          return (
            !(
              e.endLineNumber < t.startLineNumber ||
              (e.endLineNumber === t.startLineNumber &&
                e.endColumn <= t.startColumn)
            ) &&
            !(
              t.endLineNumber < e.startLineNumber ||
              (t.endLineNumber === e.startLineNumber &&
                t.endColumn <= e.startColumn)
            )
          );
        }
        static compareRangesUsingStarts(e, t) {
          if (e && t) {
            const n = 0 | e.startLineNumber,
              r = 0 | t.startLineNumber;
            if (n === r) {
              const n = 0 | e.startColumn,
                r = 0 | t.startColumn;
              if (n === r) {
                const n = 0 | e.endLineNumber,
                  r = 0 | t.endLineNumber;
                if (n === r) {
                  return (0 | e.endColumn) - (0 | t.endColumn);
                }
                return n - r;
              }
              return n - r;
            }
            return n - r;
          }
          return (e ? 1 : 0) - (t ? 1 : 0);
        }
        static compareRangesUsingEnds(e, t) {
          return e.endLineNumber === t.endLineNumber
            ? e.endColumn === t.endColumn
              ? e.startLineNumber === t.startLineNumber
                ? e.startColumn - t.startColumn
                : e.startLineNumber - t.startLineNumber
              : e.endColumn - t.endColumn
            : e.endLineNumber - t.endLineNumber;
        }
        static spansMultipleLines(e) {
          return e.endLineNumber > e.startLineNumber;
        }
        toJSON() {
          return this;
        }
      }
      var It;
      function jt(e, t) {
        return (n, r) => t(e(n), e(r));
      }
      !(function (e) {
        (e.isLessThan = function (e) {
          return e < 0;
        }),
          (e.isLessThanOrEqual = function (e) {
            return e <= 0;
          }),
          (e.isGreaterThan = function (e) {
            return e > 0;
          }),
          (e.isNeitherLessOrGreaterThan = function (e) {
            return 0 === e;
          }),
          (e.greaterThan = 1),
          (e.lessThan = -1),
          (e.neitherLessOrGreaterThan = 0);
      })(It || (It = {}));
      const Ft = (e, t) => e - t;
      class Dt {
        constructor(e) {
          this.iterate = e;
        }
        toArray() {
          const e = [];
          return this.iterate(t => (e.push(t), !0)), e;
        }
        filter(e) {
          return new Dt(t => this.iterate(n => !e(n) || t(n)));
        }
        map(e) {
          return new Dt(t => this.iterate(n => t(e(n))));
        }
        findLast(e) {
          let t;
          return this.iterate(n => (e(n) && (t = n), !0)), t;
        }
        findLastMaxBy(e) {
          let t,
            n = !0;
          return (
            this.iterate(
              r => (
                (n || It.isGreaterThan(e(r, t))) && ((n = !1), (t = r)), !0
              ),
            ),
            t
          );
        }
      }
      function Vt(e) {
        return e < 0 ? 0 : e > 255 ? 255 : 0 | e;
      }
      function qt(e) {
        return e < 0 ? 0 : e > 4294967295 ? 4294967295 : 0 | e;
      }
      Dt.empty = new Dt(e => {});
      class Ut {
        constructor(e) {
          (this.values = e),
            (this.prefixSum = new Uint32Array(e.length)),
            (this.prefixSumValidIndex = new Int32Array(1)),
            (this.prefixSumValidIndex[0] = -1);
        }
        insertValues(e, t) {
          e = qt(e);
          const n = this.values,
            r = this.prefixSum,
            i = t.length;
          return (
            0 !== i &&
            ((this.values = new Uint32Array(n.length + i)),
            this.values.set(n.subarray(0, e), 0),
            this.values.set(n.subarray(e), e + i),
            this.values.set(t, e),
            e - 1 < this.prefixSumValidIndex[0] &&
              (this.prefixSumValidIndex[0] = e - 1),
            (this.prefixSum = new Uint32Array(this.values.length)),
            this.prefixSumValidIndex[0] >= 0 &&
              this.prefixSum.set(
                r.subarray(0, this.prefixSumValidIndex[0] + 1),
              ),
            !0)
          );
        }
        setValue(e, t) {
          return (
            (e = qt(e)),
            (t = qt(t)),
            this.values[e] !== t &&
              ((this.values[e] = t),
              e - 1 < this.prefixSumValidIndex[0] &&
                (this.prefixSumValidIndex[0] = e - 1),
              !0)
          );
        }
        removeValues(e, t) {
          (e = qt(e)), (t = qt(t));
          const n = this.values,
            r = this.prefixSum;
          if (e >= n.length) return !1;
          const i = n.length - e;
          return (
            t >= i && (t = i),
            0 !== t &&
              ((this.values = new Uint32Array(n.length - t)),
              this.values.set(n.subarray(0, e), 0),
              this.values.set(n.subarray(e + t), e),
              (this.prefixSum = new Uint32Array(this.values.length)),
              e - 1 < this.prefixSumValidIndex[0] &&
                (this.prefixSumValidIndex[0] = e - 1),
              this.prefixSumValidIndex[0] >= 0 &&
                this.prefixSum.set(
                  r.subarray(0, this.prefixSumValidIndex[0] + 1),
                ),
              !0)
          );
        }
        getTotalSum() {
          return 0 === this.values.length
            ? 0
            : this._getPrefixSum(this.values.length - 1);
        }
        getPrefixSum(e) {
          return e < 0 ? 0 : ((e = qt(e)), this._getPrefixSum(e));
        }
        _getPrefixSum(e) {
          if (e <= this.prefixSumValidIndex[0]) return this.prefixSum[e];
          let t = this.prefixSumValidIndex[0] + 1;
          0 === t && ((this.prefixSum[0] = this.values[0]), t++),
            e >= this.values.length && (e = this.values.length - 1);
          for (let n = t; n <= e; n++)
            this.prefixSum[n] = this.prefixSum[n - 1] + this.values[n];
          return (
            (this.prefixSumValidIndex[0] = Math.max(
              this.prefixSumValidIndex[0],
              e,
            )),
            this.prefixSum[e]
          );
        }
        getIndexOf(e) {
          (e = Math.floor(e)), this.getTotalSum();
          let t = 0,
            n = this.values.length - 1,
            r = 0,
            i = 0,
            o = 0;
          for (; t <= n; )
            if (
              ((r = (t + (n - t) / 2) | 0),
              (i = this.prefixSum[r]),
              (o = i - this.values[r]),
              e < o)
            )
              n = r - 1;
            else {
              if (!(e >= i)) break;
              t = r + 1;
            }
          return new Bt(r, e - o);
        }
      }
      class Bt {
        constructor(e, t) {
          (this.index = e),
            (this.remainder = t),
            (this._prefixSumIndexOfResultBrand = void 0),
            (this.index = e),
            (this.remainder = t);
        }
      }
      class Kt {
        constructor(e, t, n, r) {
          (this._uri = e),
            (this._lines = t),
            (this._eol = n),
            (this._versionId = r),
            (this._lineStarts = null),
            (this._cachedTextValue = null);
        }
        dispose() {
          this._lines.length = 0;
        }
        get version() {
          return this._versionId;
        }
        getText() {
          return (
            null === this._cachedTextValue &&
              (this._cachedTextValue = this._lines.join(this._eol)),
            this._cachedTextValue
          );
        }
        onEvents(e) {
          e.eol &&
            e.eol !== this._eol &&
            ((this._eol = e.eol), (this._lineStarts = null));
          const t = e.changes;
          for (const e of t)
            this._acceptDeleteRange(e.range),
              this._acceptInsertText(
                new Mt(e.range.startLineNumber, e.range.startColumn),
                e.text,
              );
          (this._versionId = e.versionId), (this._cachedTextValue = null);
        }
        _ensureLineStarts() {
          if (!this._lineStarts) {
            const e = this._eol.length,
              t = this._lines.length,
              n = new Uint32Array(t);
            for (let r = 0; r < t; r++) n[r] = this._lines[r].length + e;
            this._lineStarts = new Ut(n);
          }
        }
        _setLineText(e, t) {
          (this._lines[e] = t),
            this._lineStarts &&
              this._lineStarts.setValue(
                e,
                this._lines[e].length + this._eol.length,
              );
        }
        _acceptDeleteRange(e) {
          if (e.startLineNumber !== e.endLineNumber)
            this._setLineText(
              e.startLineNumber - 1,
              this._lines[e.startLineNumber - 1].substring(
                0,
                e.startColumn - 1,
              ) + this._lines[e.endLineNumber - 1].substring(e.endColumn - 1),
            ),
              this._lines.splice(
                e.startLineNumber,
                e.endLineNumber - e.startLineNumber,
              ),
              this._lineStarts &&
                this._lineStarts.removeValues(
                  e.startLineNumber,
                  e.endLineNumber - e.startLineNumber,
                );
          else {
            if (e.startColumn === e.endColumn) return;
            this._setLineText(
              e.startLineNumber - 1,
              this._lines[e.startLineNumber - 1].substring(
                0,
                e.startColumn - 1,
              ) + this._lines[e.startLineNumber - 1].substring(e.endColumn - 1),
            );
          }
        }
        _acceptInsertText(e, t) {
          if (0 === t.length) return;
          const n = t.split(/\r\n|\r|\n/);
          if (1 === n.length)
            return void this._setLineText(
              e.lineNumber - 1,
              this._lines[e.lineNumber - 1].substring(0, e.column - 1) +
                n[0] +
                this._lines[e.lineNumber - 1].substring(e.column - 1),
            );
          (n[n.length - 1] += this._lines[e.lineNumber - 1].substring(
            e.column - 1,
          )),
            this._setLineText(
              e.lineNumber - 1,
              this._lines[e.lineNumber - 1].substring(0, e.column - 1) + n[0],
            );
          const r = new Uint32Array(n.length - 1);
          for (let t = 1; t < n.length; t++)
            this._lines.splice(e.lineNumber + t - 1, 0, n[t]),
              (r[t - 1] = n[t].length + this._eol.length);
          this._lineStarts && this._lineStarts.insertValues(e.lineNumber, r);
        }
      }
      const $t = (function (e = '') {
        let t = '(-?\\d*\\.\\d\\w*)|([^';
        for (const n of '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?')
          e.indexOf(n) >= 0 || (t += '\\' + n);
        return (t += '\\s]+)'), new RegExp(t, 'g');
      })();
      function Wt(e) {
        let t = $t;
        if (e && e instanceof RegExp)
          if (e.global) t = e;
          else {
            let n = 'g';
            e.ignoreCase && (n += 'i'),
              e.multiline && (n += 'm'),
              e.unicode && (n += 'u'),
              (t = new RegExp(e.source, n));
          }
        return (t.lastIndex = 0), t;
      }
      const zt = new _();
      function Ht(e, t, n, r, i) {
        if (((t = Wt(t)), i || (i = c.first(zt)), n.length > i.maxLen)) {
          let o = e - i.maxLen / 2;
          return (
            o < 0 ? (o = 0) : (r += o),
            Ht(e, t, (n = n.substring(o, e + i.maxLen / 2)), r, i)
          );
        }
        const o = Date.now(),
          s = e - 1 - r;
        let a = -1,
          l = null;
        for (let e = 1; !(Date.now() - o >= i.timeBudget); e++) {
          const r = s - i.windowSize * e;
          t.lastIndex = Math.max(0, r);
          const o = Gt(t, n, s, a);
          if (!o && l) break;
          if (((l = o), r <= 0)) break;
          a = r;
        }
        if (l) {
          const e = {
            word: l[0],
            startColumn: r + 1 + l.index,
            endColumn: r + 1 + l.index + l[0].length,
          };
          return (t.lastIndex = 0), e;
        }
        return null;
      }
      function Gt(e, t, n, r) {
        let i;
        for (; (i = e.exec(t)); ) {
          const t = i.index || 0;
          if (t <= n && e.lastIndex >= n) return i;
          if (r > 0 && t > r) return null;
        }
        return null;
      }
      zt.unshift({ maxLen: 1e3, windowSize: 15, timeBudget: 150 });
      class Jt {
        constructor(e) {
          const t = Vt(e);
          (this._defaultValue = t),
            (this._asciiMap = Jt._createAsciiMap(t)),
            (this._map = new Map());
        }
        static _createAsciiMap(e) {
          const t = new Uint8Array(256);
          return t.fill(e), t;
        }
        set(e, t) {
          const n = Vt(t);
          e >= 0 && e < 256 ? (this._asciiMap[e] = n) : this._map.set(e, n);
        }
        get(e) {
          return e >= 0 && e < 256
            ? this._asciiMap[e]
            : this._map.get(e) || this._defaultValue;
        }
        clear() {
          this._asciiMap.fill(this._defaultValue), this._map.clear();
        }
      }
      class Xt {
        constructor(e, t, n) {
          const r = new Uint8Array(e * t);
          for (let i = 0, o = e * t; i < o; i++) r[i] = n;
          (this._data = r), (this.rows = e), (this.cols = t);
        }
        get(e, t) {
          return this._data[e * this.cols + t];
        }
        set(e, t, n) {
          this._data[e * this.cols + t] = n;
        }
      }
      class Qt {
        constructor(e) {
          let t = 0,
            n = 0;
          for (let r = 0, i = e.length; r < i; r++) {
            const [i, o, s] = e[r];
            o > t && (t = o), i > n && (n = i), s > n && (n = s);
          }
          t++, n++;
          const r = new Xt(n, t, 0);
          for (let t = 0, n = e.length; t < n; t++) {
            const [n, i, o] = e[t];
            r.set(n, i, o);
          }
          (this._states = r), (this._maxCharCode = t);
        }
        nextState(e, t) {
          return t < 0 || t >= this._maxCharCode ? 0 : this._states.get(e, t);
        }
      }
      let Yt = null;
      let Zt = null;
      class en {
        static _createLink(e, t, n, r, i) {
          let o = i - 1;
          do {
            const n = t.charCodeAt(o);
            if (2 !== e.get(n)) break;
            o--;
          } while (o > r);
          if (r > 0) {
            const e = t.charCodeAt(r - 1),
              n = t.charCodeAt(o);
            ((40 === e && 41 === n) ||
              (91 === e && 93 === n) ||
              (123 === e && 125 === n)) &&
              o--;
          }
          return {
            range: {
              startLineNumber: n,
              startColumn: r + 1,
              endLineNumber: n,
              endColumn: o + 2,
            },
            url: t.substring(r, o + 1),
          };
        }
        static computeLinks(
          e,
          t = (function () {
            return (
              null === Yt &&
                (Yt = new Qt([
                  [1, 104, 2],
                  [1, 72, 2],
                  [1, 102, 6],
                  [1, 70, 6],
                  [2, 116, 3],
                  [2, 84, 3],
                  [3, 116, 4],
                  [3, 84, 4],
                  [4, 112, 5],
                  [4, 80, 5],
                  [5, 115, 9],
                  [5, 83, 9],
                  [5, 58, 10],
                  [6, 105, 7],
                  [6, 73, 7],
                  [7, 108, 8],
                  [7, 76, 8],
                  [8, 101, 9],
                  [8, 69, 9],
                  [9, 58, 10],
                  [10, 47, 11],
                  [11, 47, 12],
                ])),
              Yt
            );
          })(),
        ) {
          const n = (function () {
              if (null === Zt) {
                Zt = new Jt(0);
                const e =
                  ' \t<>\'"、。｡､，．：；‘〈「『〔（［｛｢｣｝］）〕』」〉’｀～…';
                for (let t = 0; t < e.length; t++) Zt.set(e.charCodeAt(t), 1);
                const t = '.,;:';
                for (let e = 0; e < t.length; e++) Zt.set(t.charCodeAt(e), 2);
              }
              return Zt;
            })(),
            r = [];
          for (let i = 1, o = e.getLineCount(); i <= o; i++) {
            const o = e.getLineContent(i),
              s = o.length;
            let a = 0,
              l = 0,
              u = 0,
              c = 1,
              h = !1,
              f = !1,
              d = !1,
              g = !1;
            for (; a < s; ) {
              let e = !1;
              const s = o.charCodeAt(a);
              if (13 === c) {
                let t;
                switch (s) {
                  case 40:
                    (h = !0), (t = 0);
                    break;
                  case 41:
                    t = h ? 0 : 1;
                    break;
                  case 91:
                    (d = !0), (f = !0), (t = 0);
                    break;
                  case 93:
                    (d = !1), (t = f ? 0 : 1);
                    break;
                  case 123:
                    (g = !0), (t = 0);
                    break;
                  case 125:
                    t = g ? 0 : 1;
                    break;
                  case 39:
                  case 34:
                  case 96:
                    t = u === s ? 1 : 39 === u || 34 === u || 96 === u ? 0 : 1;
                    break;
                  case 42:
                    t = 42 === u ? 1 : 0;
                    break;
                  case 124:
                    t = 124 === u ? 1 : 0;
                    break;
                  case 32:
                    t = d ? 0 : 1;
                    break;
                  default:
                    t = n.get(s);
                }
                1 === t && (r.push(en._createLink(n, o, i, l, a)), (e = !0));
              } else if (12 === c) {
                let t;
                91 === s ? ((f = !0), (t = 0)) : (t = n.get(s)),
                  1 === t ? (e = !0) : (c = 13);
              } else (c = t.nextState(c, s)), 0 === c && (e = !0);
              e &&
                ((c = 1), (h = !1), (f = !1), (g = !1), (l = a + 1), (u = s)),
                a++;
            }
            13 === c && r.push(en._createLink(n, o, i, l, s));
          }
          return r;
        }
      }
      class tn {
        constructor() {
          this._defaultValueSet = [
            ['true', 'false'],
            ['True', 'False'],
            [
              'Private',
              'Public',
              'Friend',
              'ReadOnly',
              'Partial',
              'Protected',
              'WriteOnly',
            ],
            ['public', 'protected', 'private'],
          ];
        }
        navigateValueSet(e, t, n, r, i) {
          if (e && t) {
            const n = this.doNavigateValueSet(t, i);
            if (n) return { range: e, value: n };
          }
          if (n && r) {
            const e = this.doNavigateValueSet(r, i);
            if (e) return { range: n, value: e };
          }
          return null;
        }
        doNavigateValueSet(e, t) {
          const n = this.numberReplace(e, t);
          return null !== n ? n : this.textReplace(e, t);
        }
        numberReplace(e, t) {
          const n = Math.pow(10, e.length - (e.lastIndexOf('.') + 1));
          let r = Number(e);
          const i = parseFloat(e);
          return isNaN(r) || isNaN(i) || r !== i
            ? null
            : 0 !== r || t
            ? ((r = Math.floor(r * n)), (r += t ? n : -n), String(r / n))
            : null;
        }
        textReplace(e, t) {
          return this.valueSetsReplace(this._defaultValueSet, e, t);
        }
        valueSetsReplace(e, t, n) {
          let r = null;
          for (let i = 0, o = e.length; null === r && i < o; i++)
            r = this.valueSetReplace(e[i], t, n);
          return r;
        }
        valueSetReplace(e, t, n) {
          let r = e.indexOf(t);
          return r >= 0
            ? ((r += n ? 1 : -1),
              r < 0 ? (r = e.length - 1) : (r %= e.length),
              e[r])
            : null;
        }
      }
      tn.INSTANCE = new tn();
      const nn = Object.freeze(function (e, t) {
        const n = setTimeout(e.bind(t), 0);
        return {
          dispose() {
            clearTimeout(n);
          },
        };
      });
      var rn;
      !(function (e) {
        (e.isCancellationToken = function (t) {
          return (
            t === e.None ||
            t === e.Cancelled ||
            t instanceof on ||
            (!(!t || 'object' != typeof t) &&
              'boolean' == typeof t.isCancellationRequested &&
              'function' == typeof t.onCancellationRequested)
          );
        }),
          (e.None = Object.freeze({
            isCancellationRequested: !1,
            onCancellationRequested: x.None,
          })),
          (e.Cancelled = Object.freeze({
            isCancellationRequested: !0,
            onCancellationRequested: nn,
          }));
      })(rn || (rn = {}));
      class on {
        constructor() {
          (this._isCancelled = !1), (this._emitter = null);
        }
        cancel() {
          this._isCancelled ||
            ((this._isCancelled = !0),
            this._emitter && (this._emitter.fire(void 0), this.dispose()));
        }
        get isCancellationRequested() {
          return this._isCancelled;
        }
        get onCancellationRequested() {
          return this._isCancelled
            ? nn
            : (this._emitter || (this._emitter = new R()), this._emitter.event);
        }
        dispose() {
          this._emitter && (this._emitter.dispose(), (this._emitter = null));
        }
      }
      class sn {
        constructor(e) {
          (this._token = void 0),
            (this._parentListener = void 0),
            (this._parentListener =
              e && e.onCancellationRequested(this.cancel, this));
        }
        get token() {
          return this._token || (this._token = new on()), this._token;
        }
        cancel() {
          this._token
            ? this._token instanceof on && this._token.cancel()
            : (this._token = rn.Cancelled);
        }
        dispose(e = !1) {
          var t;
          e && this.cancel(),
            null === (t = this._parentListener) || void 0 === t || t.dispose(),
            this._token
              ? this._token instanceof on && this._token.dispose()
              : (this._token = rn.None);
        }
      }
      class an {
        constructor() {
          (this._keyCodeToStr = []), (this._strToKeyCode = Object.create(null));
        }
        define(e, t) {
          (this._keyCodeToStr[e] = t),
            (this._strToKeyCode[t.toLowerCase()] = e);
        }
        keyCodeToStr(e) {
          return this._keyCodeToStr[e];
        }
        strToKeyCode(e) {
          return this._strToKeyCode[e.toLowerCase()] || 0;
        }
      }
      const ln = new an(),
        un = new an(),
        cn = new an(),
        hn = new Array(230),
        fn = {},
        dn = [],
        gn = Object.create(null),
        mn = Object.create(null),
        pn = [],
        yn = [];
      for (let e = 0; e <= 193; e++) pn[e] = -1;
      for (let e = 0; e <= 132; e++) yn[e] = -1;
      var bn;
      !(function () {
        const e = '',
          t = [
            [1, 0, 'None', 0, 'unknown', 0, 'VK_UNKNOWN', e, e],
            [1, 1, 'Hyper', 0, e, 0, e, e, e],
            [1, 2, 'Super', 0, e, 0, e, e, e],
            [1, 3, 'Fn', 0, e, 0, e, e, e],
            [1, 4, 'FnLock', 0, e, 0, e, e, e],
            [1, 5, 'Suspend', 0, e, 0, e, e, e],
            [1, 6, 'Resume', 0, e, 0, e, e, e],
            [1, 7, 'Turbo', 0, e, 0, e, e, e],
            [1, 8, 'Sleep', 0, e, 0, 'VK_SLEEP', e, e],
            [1, 9, 'WakeUp', 0, e, 0, e, e, e],
            [0, 10, 'KeyA', 31, 'A', 65, 'VK_A', e, e],
            [0, 11, 'KeyB', 32, 'B', 66, 'VK_B', e, e],
            [0, 12, 'KeyC', 33, 'C', 67, 'VK_C', e, e],
            [0, 13, 'KeyD', 34, 'D', 68, 'VK_D', e, e],
            [0, 14, 'KeyE', 35, 'E', 69, 'VK_E', e, e],
            [0, 15, 'KeyF', 36, 'F', 70, 'VK_F', e, e],
            [0, 16, 'KeyG', 37, 'G', 71, 'VK_G', e, e],
            [0, 17, 'KeyH', 38, 'H', 72, 'VK_H', e, e],
            [0, 18, 'KeyI', 39, 'I', 73, 'VK_I', e, e],
            [0, 19, 'KeyJ', 40, 'J', 74, 'VK_J', e, e],
            [0, 20, 'KeyK', 41, 'K', 75, 'VK_K', e, e],
            [0, 21, 'KeyL', 42, 'L', 76, 'VK_L', e, e],
            [0, 22, 'KeyM', 43, 'M', 77, 'VK_M', e, e],
            [0, 23, 'KeyN', 44, 'N', 78, 'VK_N', e, e],
            [0, 24, 'KeyO', 45, 'O', 79, 'VK_O', e, e],
            [0, 25, 'KeyP', 46, 'P', 80, 'VK_P', e, e],
            [0, 26, 'KeyQ', 47, 'Q', 81, 'VK_Q', e, e],
            [0, 27, 'KeyR', 48, 'R', 82, 'VK_R', e, e],
            [0, 28, 'KeyS', 49, 'S', 83, 'VK_S', e, e],
            [0, 29, 'KeyT', 50, 'T', 84, 'VK_T', e, e],
            [0, 30, 'KeyU', 51, 'U', 85, 'VK_U', e, e],
            [0, 31, 'KeyV', 52, 'V', 86, 'VK_V', e, e],
            [0, 32, 'KeyW', 53, 'W', 87, 'VK_W', e, e],
            [0, 33, 'KeyX', 54, 'X', 88, 'VK_X', e, e],
            [0, 34, 'KeyY', 55, 'Y', 89, 'VK_Y', e, e],
            [0, 35, 'KeyZ', 56, 'Z', 90, 'VK_Z', e, e],
            [0, 36, 'Digit1', 22, '1', 49, 'VK_1', e, e],
            [0, 37, 'Digit2', 23, '2', 50, 'VK_2', e, e],
            [0, 38, 'Digit3', 24, '3', 51, 'VK_3', e, e],
            [0, 39, 'Digit4', 25, '4', 52, 'VK_4', e, e],
            [0, 40, 'Digit5', 26, '5', 53, 'VK_5', e, e],
            [0, 41, 'Digit6', 27, '6', 54, 'VK_6', e, e],
            [0, 42, 'Digit7', 28, '7', 55, 'VK_7', e, e],
            [0, 43, 'Digit8', 29, '8', 56, 'VK_8', e, e],
            [0, 44, 'Digit9', 30, '9', 57, 'VK_9', e, e],
            [0, 45, 'Digit0', 21, '0', 48, 'VK_0', e, e],
            [1, 46, 'Enter', 3, 'Enter', 13, 'VK_RETURN', e, e],
            [1, 47, 'Escape', 9, 'Escape', 27, 'VK_ESCAPE', e, e],
            [1, 48, 'Backspace', 1, 'Backspace', 8, 'VK_BACK', e, e],
            [1, 49, 'Tab', 2, 'Tab', 9, 'VK_TAB', e, e],
            [1, 50, 'Space', 10, 'Space', 32, 'VK_SPACE', e, e],
            [0, 51, 'Minus', 88, '-', 189, 'VK_OEM_MINUS', '-', 'OEM_MINUS'],
            [0, 52, 'Equal', 86, '=', 187, 'VK_OEM_PLUS', '=', 'OEM_PLUS'],
            [0, 53, 'BracketLeft', 92, '[', 219, 'VK_OEM_4', '[', 'OEM_4'],
            [0, 54, 'BracketRight', 94, ']', 221, 'VK_OEM_6', ']', 'OEM_6'],
            [0, 55, 'Backslash', 93, '\\', 220, 'VK_OEM_5', '\\', 'OEM_5'],
            [0, 56, 'IntlHash', 0, e, 0, e, e, e],
            [0, 57, 'Semicolon', 85, ';', 186, 'VK_OEM_1', ';', 'OEM_1'],
            [0, 58, 'Quote', 95, "'", 222, 'VK_OEM_7', "'", 'OEM_7'],
            [0, 59, 'Backquote', 91, '`', 192, 'VK_OEM_3', '`', 'OEM_3'],
            [0, 60, 'Comma', 87, ',', 188, 'VK_OEM_COMMA', ',', 'OEM_COMMA'],
            [0, 61, 'Period', 89, '.', 190, 'VK_OEM_PERIOD', '.', 'OEM_PERIOD'],
            [0, 62, 'Slash', 90, '/', 191, 'VK_OEM_2', '/', 'OEM_2'],
            [1, 63, 'CapsLock', 8, 'CapsLock', 20, 'VK_CAPITAL', e, e],
            [1, 64, 'F1', 59, 'F1', 112, 'VK_F1', e, e],
            [1, 65, 'F2', 60, 'F2', 113, 'VK_F2', e, e],
            [1, 66, 'F3', 61, 'F3', 114, 'VK_F3', e, e],
            [1, 67, 'F4', 62, 'F4', 115, 'VK_F4', e, e],
            [1, 68, 'F5', 63, 'F5', 116, 'VK_F5', e, e],
            [1, 69, 'F6', 64, 'F6', 117, 'VK_F6', e, e],
            [1, 70, 'F7', 65, 'F7', 118, 'VK_F7', e, e],
            [1, 71, 'F8', 66, 'F8', 119, 'VK_F8', e, e],
            [1, 72, 'F9', 67, 'F9', 120, 'VK_F9', e, e],
            [1, 73, 'F10', 68, 'F10', 121, 'VK_F10', e, e],
            [1, 74, 'F11', 69, 'F11', 122, 'VK_F11', e, e],
            [1, 75, 'F12', 70, 'F12', 123, 'VK_F12', e, e],
            [1, 76, 'PrintScreen', 0, e, 0, e, e, e],
            [1, 77, 'ScrollLock', 84, 'ScrollLock', 145, 'VK_SCROLL', e, e],
            [1, 78, 'Pause', 7, 'PauseBreak', 19, 'VK_PAUSE', e, e],
            [1, 79, 'Insert', 19, 'Insert', 45, 'VK_INSERT', e, e],
            [1, 80, 'Home', 14, 'Home', 36, 'VK_HOME', e, e],
            [1, 81, 'PageUp', 11, 'PageUp', 33, 'VK_PRIOR', e, e],
            [1, 82, 'Delete', 20, 'Delete', 46, 'VK_DELETE', e, e],
            [1, 83, 'End', 13, 'End', 35, 'VK_END', e, e],
            [1, 84, 'PageDown', 12, 'PageDown', 34, 'VK_NEXT', e, e],
            [1, 85, 'ArrowRight', 17, 'RightArrow', 39, 'VK_RIGHT', 'Right', e],
            [1, 86, 'ArrowLeft', 15, 'LeftArrow', 37, 'VK_LEFT', 'Left', e],
            [1, 87, 'ArrowDown', 18, 'DownArrow', 40, 'VK_DOWN', 'Down', e],
            [1, 88, 'ArrowUp', 16, 'UpArrow', 38, 'VK_UP', 'Up', e],
            [1, 89, 'NumLock', 83, 'NumLock', 144, 'VK_NUMLOCK', e, e],
            [
              1,
              90,
              'NumpadDivide',
              113,
              'NumPad_Divide',
              111,
              'VK_DIVIDE',
              e,
              e,
            ],
            [
              1,
              91,
              'NumpadMultiply',
              108,
              'NumPad_Multiply',
              106,
              'VK_MULTIPLY',
              e,
              e,
            ],
            [
              1,
              92,
              'NumpadSubtract',
              111,
              'NumPad_Subtract',
              109,
              'VK_SUBTRACT',
              e,
              e,
            ],
            [1, 93, 'NumpadAdd', 109, 'NumPad_Add', 107, 'VK_ADD', e, e],
            [1, 94, 'NumpadEnter', 3, e, 0, e, e, e],
            [1, 95, 'Numpad1', 99, 'NumPad1', 97, 'VK_NUMPAD1', e, e],
            [1, 96, 'Numpad2', 100, 'NumPad2', 98, 'VK_NUMPAD2', e, e],
            [1, 97, 'Numpad3', 101, 'NumPad3', 99, 'VK_NUMPAD3', e, e],
            [1, 98, 'Numpad4', 102, 'NumPad4', 100, 'VK_NUMPAD4', e, e],
            [1, 99, 'Numpad5', 103, 'NumPad5', 101, 'VK_NUMPAD5', e, e],
            [1, 100, 'Numpad6', 104, 'NumPad6', 102, 'VK_NUMPAD6', e, e],
            [1, 101, 'Numpad7', 105, 'NumPad7', 103, 'VK_NUMPAD7', e, e],
            [1, 102, 'Numpad8', 106, 'NumPad8', 104, 'VK_NUMPAD8', e, e],
            [1, 103, 'Numpad9', 107, 'NumPad9', 105, 'VK_NUMPAD9', e, e],
            [1, 104, 'Numpad0', 98, 'NumPad0', 96, 'VK_NUMPAD0', e, e],
            [
              1,
              105,
              'NumpadDecimal',
              112,
              'NumPad_Decimal',
              110,
              'VK_DECIMAL',
              e,
              e,
            ],
            [0, 106, 'IntlBackslash', 97, 'OEM_102', 226, 'VK_OEM_102', e, e],
            [1, 107, 'ContextMenu', 58, 'ContextMenu', 93, e, e, e],
            [1, 108, 'Power', 0, e, 0, e, e, e],
            [1, 109, 'NumpadEqual', 0, e, 0, e, e, e],
            [1, 110, 'F13', 71, 'F13', 124, 'VK_F13', e, e],
            [1, 111, 'F14', 72, 'F14', 125, 'VK_F14', e, e],
            [1, 112, 'F15', 73, 'F15', 126, 'VK_F15', e, e],
            [1, 113, 'F16', 74, 'F16', 127, 'VK_F16', e, e],
            [1, 114, 'F17', 75, 'F17', 128, 'VK_F17', e, e],
            [1, 115, 'F18', 76, 'F18', 129, 'VK_F18', e, e],
            [1, 116, 'F19', 77, 'F19', 130, 'VK_F19', e, e],
            [1, 117, 'F20', 78, 'F20', 131, 'VK_F20', e, e],
            [1, 118, 'F21', 79, 'F21', 132, 'VK_F21', e, e],
            [1, 119, 'F22', 80, 'F22', 133, 'VK_F22', e, e],
            [1, 120, 'F23', 81, 'F23', 134, 'VK_F23', e, e],
            [1, 121, 'F24', 82, 'F24', 135, 'VK_F24', e, e],
            [1, 122, 'Open', 0, e, 0, e, e, e],
            [1, 123, 'Help', 0, e, 0, e, e, e],
            [1, 124, 'Select', 0, e, 0, e, e, e],
            [1, 125, 'Again', 0, e, 0, e, e, e],
            [1, 126, 'Undo', 0, e, 0, e, e, e],
            [1, 127, 'Cut', 0, e, 0, e, e, e],
            [1, 128, 'Copy', 0, e, 0, e, e, e],
            [1, 129, 'Paste', 0, e, 0, e, e, e],
            [1, 130, 'Find', 0, e, 0, e, e, e],
            [
              1,
              131,
              'AudioVolumeMute',
              117,
              'AudioVolumeMute',
              173,
              'VK_VOLUME_MUTE',
              e,
              e,
            ],
            [
              1,
              132,
              'AudioVolumeUp',
              118,
              'AudioVolumeUp',
              175,
              'VK_VOLUME_UP',
              e,
              e,
            ],
            [
              1,
              133,
              'AudioVolumeDown',
              119,
              'AudioVolumeDown',
              174,
              'VK_VOLUME_DOWN',
              e,
              e,
            ],
            [
              1,
              134,
              'NumpadComma',
              110,
              'NumPad_Separator',
              108,
              'VK_SEPARATOR',
              e,
              e,
            ],
            [0, 135, 'IntlRo', 115, 'ABNT_C1', 193, 'VK_ABNT_C1', e, e],
            [1, 136, 'KanaMode', 0, e, 0, e, e, e],
            [0, 137, 'IntlYen', 0, e, 0, e, e, e],
            [1, 138, 'Convert', 0, e, 0, e, e, e],
            [1, 139, 'NonConvert', 0, e, 0, e, e, e],
            [1, 140, 'Lang1', 0, e, 0, e, e, e],
            [1, 141, 'Lang2', 0, e, 0, e, e, e],
            [1, 142, 'Lang3', 0, e, 0, e, e, e],
            [1, 143, 'Lang4', 0, e, 0, e, e, e],
            [1, 144, 'Lang5', 0, e, 0, e, e, e],
            [1, 145, 'Abort', 0, e, 0, e, e, e],
            [1, 146, 'Props', 0, e, 0, e, e, e],
            [1, 147, 'NumpadParenLeft', 0, e, 0, e, e, e],
            [1, 148, 'NumpadParenRight', 0, e, 0, e, e, e],
            [1, 149, 'NumpadBackspace', 0, e, 0, e, e, e],
            [1, 150, 'NumpadMemoryStore', 0, e, 0, e, e, e],
            [1, 151, 'NumpadMemoryRecall', 0, e, 0, e, e, e],
            [1, 152, 'NumpadMemoryClear', 0, e, 0, e, e, e],
            [1, 153, 'NumpadMemoryAdd', 0, e, 0, e, e, e],
            [1, 154, 'NumpadMemorySubtract', 0, e, 0, e, e, e],
            [1, 155, 'NumpadClear', 131, 'Clear', 12, 'VK_CLEAR', e, e],
            [1, 156, 'NumpadClearEntry', 0, e, 0, e, e, e],
            [1, 0, e, 5, 'Ctrl', 17, 'VK_CONTROL', e, e],
            [1, 0, e, 4, 'Shift', 16, 'VK_SHIFT', e, e],
            [1, 0, e, 6, 'Alt', 18, 'VK_MENU', e, e],
            [1, 0, e, 57, 'Meta', 91, 'VK_COMMAND', e, e],
            [1, 157, 'ControlLeft', 5, e, 0, 'VK_LCONTROL', e, e],
            [1, 158, 'ShiftLeft', 4, e, 0, 'VK_LSHIFT', e, e],
            [1, 159, 'AltLeft', 6, e, 0, 'VK_LMENU', e, e],
            [1, 160, 'MetaLeft', 57, e, 0, 'VK_LWIN', e, e],
            [1, 161, 'ControlRight', 5, e, 0, 'VK_RCONTROL', e, e],
            [1, 162, 'ShiftRight', 4, e, 0, 'VK_RSHIFT', e, e],
            [1, 163, 'AltRight', 6, e, 0, 'VK_RMENU', e, e],
            [1, 164, 'MetaRight', 57, e, 0, 'VK_RWIN', e, e],
            [1, 165, 'BrightnessUp', 0, e, 0, e, e, e],
            [1, 166, 'BrightnessDown', 0, e, 0, e, e, e],
            [1, 167, 'MediaPlay', 0, e, 0, e, e, e],
            [1, 168, 'MediaRecord', 0, e, 0, e, e, e],
            [1, 169, 'MediaFastForward', 0, e, 0, e, e, e],
            [1, 170, 'MediaRewind', 0, e, 0, e, e, e],
            [
              1,
              171,
              'MediaTrackNext',
              124,
              'MediaTrackNext',
              176,
              'VK_MEDIA_NEXT_TRACK',
              e,
              e,
            ],
            [
              1,
              172,
              'MediaTrackPrevious',
              125,
              'MediaTrackPrevious',
              177,
              'VK_MEDIA_PREV_TRACK',
              e,
              e,
            ],
            [1, 173, 'MediaStop', 126, 'MediaStop', 178, 'VK_MEDIA_STOP', e, e],
            [1, 174, 'Eject', 0, e, 0, e, e, e],
            [
              1,
              175,
              'MediaPlayPause',
              127,
              'MediaPlayPause',
              179,
              'VK_MEDIA_PLAY_PAUSE',
              e,
              e,
            ],
            [
              1,
              176,
              'MediaSelect',
              128,
              'LaunchMediaPlayer',
              181,
              'VK_MEDIA_LAUNCH_MEDIA_SELECT',
              e,
              e,
            ],
            [
              1,
              177,
              'LaunchMail',
              129,
              'LaunchMail',
              180,
              'VK_MEDIA_LAUNCH_MAIL',
              e,
              e,
            ],
            [
              1,
              178,
              'LaunchApp2',
              130,
              'LaunchApp2',
              183,
              'VK_MEDIA_LAUNCH_APP2',
              e,
              e,
            ],
            [1, 179, 'LaunchApp1', 0, e, 0, 'VK_MEDIA_LAUNCH_APP1', e, e],
            [1, 180, 'SelectTask', 0, e, 0, e, e, e],
            [1, 181, 'LaunchScreenSaver', 0, e, 0, e, e, e],
            [
              1,
              182,
              'BrowserSearch',
              120,
              'BrowserSearch',
              170,
              'VK_BROWSER_SEARCH',
              e,
              e,
            ],
            [
              1,
              183,
              'BrowserHome',
              121,
              'BrowserHome',
              172,
              'VK_BROWSER_HOME',
              e,
              e,
            ],
            [
              1,
              184,
              'BrowserBack',
              122,
              'BrowserBack',
              166,
              'VK_BROWSER_BACK',
              e,
              e,
            ],
            [
              1,
              185,
              'BrowserForward',
              123,
              'BrowserForward',
              167,
              'VK_BROWSER_FORWARD',
              e,
              e,
            ],
            [1, 186, 'BrowserStop', 0, e, 0, 'VK_BROWSER_STOP', e, e],
            [1, 187, 'BrowserRefresh', 0, e, 0, 'VK_BROWSER_REFRESH', e, e],
            [1, 188, 'BrowserFavorites', 0, e, 0, 'VK_BROWSER_FAVORITES', e, e],
            [1, 189, 'ZoomToggle', 0, e, 0, e, e, e],
            [1, 190, 'MailReply', 0, e, 0, e, e, e],
            [1, 191, 'MailForward', 0, e, 0, e, e, e],
            [1, 192, 'MailSend', 0, e, 0, e, e, e],
            [1, 0, e, 114, 'KeyInComposition', 229, e, e, e],
            [1, 0, e, 116, 'ABNT_C2', 194, 'VK_ABNT_C2', e, e],
            [1, 0, e, 96, 'OEM_8', 223, 'VK_OEM_8', e, e],
            [1, 0, e, 0, e, 0, 'VK_KANA', e, e],
            [1, 0, e, 0, e, 0, 'VK_HANGUL', e, e],
            [1, 0, e, 0, e, 0, 'VK_JUNJA', e, e],
            [1, 0, e, 0, e, 0, 'VK_FINAL', e, e],
            [1, 0, e, 0, e, 0, 'VK_HANJA', e, e],
            [1, 0, e, 0, e, 0, 'VK_KANJI', e, e],
            [1, 0, e, 0, e, 0, 'VK_CONVERT', e, e],
            [1, 0, e, 0, e, 0, 'VK_NONCONVERT', e, e],
            [1, 0, e, 0, e, 0, 'VK_ACCEPT', e, e],
            [1, 0, e, 0, e, 0, 'VK_MODECHANGE', e, e],
            [1, 0, e, 0, e, 0, 'VK_SELECT', e, e],
            [1, 0, e, 0, e, 0, 'VK_PRINT', e, e],
            [1, 0, e, 0, e, 0, 'VK_EXECUTE', e, e],
            [1, 0, e, 0, e, 0, 'VK_SNAPSHOT', e, e],
            [1, 0, e, 0, e, 0, 'VK_HELP', e, e],
            [1, 0, e, 0, e, 0, 'VK_APPS', e, e],
            [1, 0, e, 0, e, 0, 'VK_PROCESSKEY', e, e],
            [1, 0, e, 0, e, 0, 'VK_PACKET', e, e],
            [1, 0, e, 0, e, 0, 'VK_DBE_SBCSCHAR', e, e],
            [1, 0, e, 0, e, 0, 'VK_DBE_DBCSCHAR', e, e],
            [1, 0, e, 0, e, 0, 'VK_ATTN', e, e],
            [1, 0, e, 0, e, 0, 'VK_CRSEL', e, e],
            [1, 0, e, 0, e, 0, 'VK_EXSEL', e, e],
            [1, 0, e, 0, e, 0, 'VK_EREOF', e, e],
            [1, 0, e, 0, e, 0, 'VK_PLAY', e, e],
            [1, 0, e, 0, e, 0, 'VK_ZOOM', e, e],
            [1, 0, e, 0, e, 0, 'VK_NONAME', e, e],
            [1, 0, e, 0, e, 0, 'VK_PA1', e, e],
            [1, 0, e, 0, e, 0, 'VK_OEM_CLEAR', e, e],
          ],
          n = [],
          r = [];
        for (const e of t) {
          const [t, i, o, s, a, l, u, c, h] = e;
          if (
            (r[i] ||
              ((r[i] = !0),
              (dn[i] = o),
              (gn[o] = i),
              (mn[o.toLowerCase()] = i),
              t &&
                ((pn[i] = s),
                0 !== s &&
                  3 !== s &&
                  5 !== s &&
                  4 !== s &&
                  6 !== s &&
                  57 !== s &&
                  (yn[s] = i))),
            !n[s])
          ) {
            if (((n[s] = !0), !a))
              throw new Error(
                `String representation missing for key code ${s} around scan code ${o}`,
              );
            ln.define(s, a), un.define(s, c || a), cn.define(s, h || c || a);
          }
          l && (hn[l] = s), u && (fn[u] = s);
        }
        yn[3] = 46;
      })(),
        (function (e) {
          (e.toString = function (e) {
            return ln.keyCodeToStr(e);
          }),
            (e.fromString = function (e) {
              return ln.strToKeyCode(e);
            }),
            (e.toUserSettingsUS = function (e) {
              return un.keyCodeToStr(e);
            }),
            (e.toUserSettingsGeneral = function (e) {
              return cn.keyCodeToStr(e);
            }),
            (e.fromUserSettings = function (e) {
              return un.strToKeyCode(e) || cn.strToKeyCode(e);
            }),
            (e.toElectronAccelerator = function (e) {
              if (e >= 98 && e <= 113) return null;
              switch (e) {
                case 16:
                  return 'Up';
                case 18:
                  return 'Down';
                case 15:
                  return 'Left';
                case 17:
                  return 'Right';
              }
              return ln.keyCodeToStr(e);
            });
        })(bn || (bn = {}));
      class vn extends Pt {
        constructor(e, t, n, r) {
          super(e, t, n, r),
            (this.selectionStartLineNumber = e),
            (this.selectionStartColumn = t),
            (this.positionLineNumber = n),
            (this.positionColumn = r);
        }
        toString() {
          return (
            '[' +
            this.selectionStartLineNumber +
            ',' +
            this.selectionStartColumn +
            ' -> ' +
            this.positionLineNumber +
            ',' +
            this.positionColumn +
            ']'
          );
        }
        equalsSelection(e) {
          return vn.selectionsEqual(this, e);
        }
        static selectionsEqual(e, t) {
          return (
            e.selectionStartLineNumber === t.selectionStartLineNumber &&
            e.selectionStartColumn === t.selectionStartColumn &&
            e.positionLineNumber === t.positionLineNumber &&
            e.positionColumn === t.positionColumn
          );
        }
        getDirection() {
          return this.selectionStartLineNumber === this.startLineNumber &&
            this.selectionStartColumn === this.startColumn
            ? 0
            : 1;
        }
        setEndPosition(e, t) {
          return 0 === this.getDirection()
            ? new vn(this.startLineNumber, this.startColumn, e, t)
            : new vn(e, t, this.startLineNumber, this.startColumn);
        }
        getPosition() {
          return new Mt(this.positionLineNumber, this.positionColumn);
        }
        getSelectionStart() {
          return new Mt(
            this.selectionStartLineNumber,
            this.selectionStartColumn,
          );
        }
        setStartPosition(e, t) {
          return 0 === this.getDirection()
            ? new vn(e, t, this.endLineNumber, this.endColumn)
            : new vn(this.endLineNumber, this.endColumn, e, t);
        }
        static fromPositions(e, t = e) {
          return new vn(e.lineNumber, e.column, t.lineNumber, t.column);
        }
        static fromRange(e, t) {
          return 0 === t
            ? new vn(
                e.startLineNumber,
                e.startColumn,
                e.endLineNumber,
                e.endColumn,
              )
            : new vn(
                e.endLineNumber,
                e.endColumn,
                e.startLineNumber,
                e.startColumn,
              );
        }
        static liftSelection(e) {
          return new vn(
            e.selectionStartLineNumber,
            e.selectionStartColumn,
            e.positionLineNumber,
            e.positionColumn,
          );
        }
        static selectionsArrEqual(e, t) {
          if ((e && !t) || (!e && t)) return !1;
          if (!e && !t) return !0;
          if (e.length !== t.length) return !1;
          for (let n = 0, r = e.length; n < r; n++)
            if (!this.selectionsEqual(e[n], t[n])) return !1;
          return !0;
        }
        static isISelection(e) {
          return (
            e &&
            'number' == typeof e.selectionStartLineNumber &&
            'number' == typeof e.selectionStartColumn &&
            'number' == typeof e.positionLineNumber &&
            'number' == typeof e.positionColumn
          );
        }
        static createWithDirection(e, t, n, r, i) {
          return 0 === i ? new vn(e, t, n, r) : new vn(n, r, e, t);
        }
      }
      function wn(e) {
        return 'string' == typeof e;
      }
      const Sn = Object.create(null);
      function _n(e, t) {
        if (wn(t)) {
          const n = Sn[t];
          if (void 0 === n)
            throw new Error(`${e} references an unknown codicon: ${t}`);
          t = n;
        }
        return (Sn[e] = t), { id: e };
      }
      const Cn = {
        add: _n('add', 6e4),
        plus: _n('plus', 6e4),
        gistNew: _n('gist-new', 6e4),
        repoCreate: _n('repo-create', 6e4),
        lightbulb: _n('lightbulb', 60001),
        lightBulb: _n('light-bulb', 60001),
        repo: _n('repo', 60002),
        repoDelete: _n('repo-delete', 60002),
        gistFork: _n('gist-fork', 60003),
        repoForked: _n('repo-forked', 60003),
        gitPullRequest: _n('git-pull-request', 60004),
        gitPullRequestAbandoned: _n('git-pull-request-abandoned', 60004),
        recordKeys: _n('record-keys', 60005),
        keyboard: _n('keyboard', 60005),
        tag: _n('tag', 60006),
        tagAdd: _n('tag-add', 60006),
        tagRemove: _n('tag-remove', 60006),
        gitPullRequestLabel: _n('git-pull-request-label', 60006),
        person: _n('person', 60007),
        personFollow: _n('person-follow', 60007),
        personOutline: _n('person-outline', 60007),
        personFilled: _n('person-filled', 60007),
        gitBranch: _n('git-branch', 60008),
        gitBranchCreate: _n('git-branch-create', 60008),
        gitBranchDelete: _n('git-branch-delete', 60008),
        sourceControl: _n('source-control', 60008),
        mirror: _n('mirror', 60009),
        mirrorPublic: _n('mirror-public', 60009),
        star: _n('star', 60010),
        starAdd: _n('star-add', 60010),
        starDelete: _n('star-delete', 60010),
        starEmpty: _n('star-empty', 60010),
        comment: _n('comment', 60011),
        commentAdd: _n('comment-add', 60011),
        alert: _n('alert', 60012),
        warning: _n('warning', 60012),
        search: _n('search', 60013),
        searchSave: _n('search-save', 60013),
        logOut: _n('log-out', 60014),
        signOut: _n('sign-out', 60014),
        logIn: _n('log-in', 60015),
        signIn: _n('sign-in', 60015),
        eye: _n('eye', 60016),
        eyeUnwatch: _n('eye-unwatch', 60016),
        eyeWatch: _n('eye-watch', 60016),
        circleFilled: _n('circle-filled', 60017),
        primitiveDot: _n('primitive-dot', 60017),
        closeDirty: _n('close-dirty', 60017),
        debugBreakpoint: _n('debug-breakpoint', 60017),
        debugBreakpointDisabled: _n('debug-breakpoint-disabled', 60017),
        debugBreakpointPending: _n('debug-breakpoint-pending', 60377),
        debugHint: _n('debug-hint', 60017),
        primitiveSquare: _n('primitive-square', 60018),
        edit: _n('edit', 60019),
        pencil: _n('pencil', 60019),
        info: _n('info', 60020),
        issueOpened: _n('issue-opened', 60020),
        gistPrivate: _n('gist-private', 60021),
        gitForkPrivate: _n('git-fork-private', 60021),
        lock: _n('lock', 60021),
        mirrorPrivate: _n('mirror-private', 60021),
        close: _n('close', 60022),
        removeClose: _n('remove-close', 60022),
        x: _n('x', 60022),
        repoSync: _n('repo-sync', 60023),
        sync: _n('sync', 60023),
        clone: _n('clone', 60024),
        desktopDownload: _n('desktop-download', 60024),
        beaker: _n('beaker', 60025),
        microscope: _n('microscope', 60025),
        vm: _n('vm', 60026),
        deviceDesktop: _n('device-desktop', 60026),
        file: _n('file', 60027),
        fileText: _n('file-text', 60027),
        more: _n('more', 60028),
        ellipsis: _n('ellipsis', 60028),
        kebabHorizontal: _n('kebab-horizontal', 60028),
        mailReply: _n('mail-reply', 60029),
        reply: _n('reply', 60029),
        organization: _n('organization', 60030),
        organizationFilled: _n('organization-filled', 60030),
        organizationOutline: _n('organization-outline', 60030),
        newFile: _n('new-file', 60031),
        fileAdd: _n('file-add', 60031),
        newFolder: _n('new-folder', 60032),
        fileDirectoryCreate: _n('file-directory-create', 60032),
        trash: _n('trash', 60033),
        trashcan: _n('trashcan', 60033),
        history: _n('history', 60034),
        clock: _n('clock', 60034),
        folder: _n('folder', 60035),
        fileDirectory: _n('file-directory', 60035),
        symbolFolder: _n('symbol-folder', 60035),
        logoGithub: _n('logo-github', 60036),
        markGithub: _n('mark-github', 60036),
        github: _n('github', 60036),
        terminal: _n('terminal', 60037),
        console: _n('console', 60037),
        repl: _n('repl', 60037),
        zap: _n('zap', 60038),
        symbolEvent: _n('symbol-event', 60038),
        error: _n('error', 60039),
        stop: _n('stop', 60039),
        variable: _n('variable', 60040),
        symbolVariable: _n('symbol-variable', 60040),
        array: _n('array', 60042),
        symbolArray: _n('symbol-array', 60042),
        symbolModule: _n('symbol-module', 60043),
        symbolPackage: _n('symbol-package', 60043),
        symbolNamespace: _n('symbol-namespace', 60043),
        symbolObject: _n('symbol-object', 60043),
        symbolMethod: _n('symbol-method', 60044),
        symbolFunction: _n('symbol-function', 60044),
        symbolConstructor: _n('symbol-constructor', 60044),
        symbolBoolean: _n('symbol-boolean', 60047),
        symbolNull: _n('symbol-null', 60047),
        symbolNumeric: _n('symbol-numeric', 60048),
        symbolNumber: _n('symbol-number', 60048),
        symbolStructure: _n('symbol-structure', 60049),
        symbolStruct: _n('symbol-struct', 60049),
        symbolParameter: _n('symbol-parameter', 60050),
        symbolTypeParameter: _n('symbol-type-parameter', 60050),
        symbolKey: _n('symbol-key', 60051),
        symbolText: _n('symbol-text', 60051),
        symbolReference: _n('symbol-reference', 60052),
        goToFile: _n('go-to-file', 60052),
        symbolEnum: _n('symbol-enum', 60053),
        symbolValue: _n('symbol-value', 60053),
        symbolRuler: _n('symbol-ruler', 60054),
        symbolUnit: _n('symbol-unit', 60054),
        activateBreakpoints: _n('activate-breakpoints', 60055),
        archive: _n('archive', 60056),
        arrowBoth: _n('arrow-both', 60057),
        arrowDown: _n('arrow-down', 60058),
        arrowLeft: _n('arrow-left', 60059),
        arrowRight: _n('arrow-right', 60060),
        arrowSmallDown: _n('arrow-small-down', 60061),
        arrowSmallLeft: _n('arrow-small-left', 60062),
        arrowSmallRight: _n('arrow-small-right', 60063),
        arrowSmallUp: _n('arrow-small-up', 60064),
        arrowUp: _n('arrow-up', 60065),
        bell: _n('bell', 60066),
        bold: _n('bold', 60067),
        book: _n('book', 60068),
        bookmark: _n('bookmark', 60069),
        debugBreakpointConditionalUnverified: _n(
          'debug-breakpoint-conditional-unverified',
          60070,
        ),
        debugBreakpointConditional: _n('debug-breakpoint-conditional', 60071),
        debugBreakpointConditionalDisabled: _n(
          'debug-breakpoint-conditional-disabled',
          60071,
        ),
        debugBreakpointDataUnverified: _n(
          'debug-breakpoint-data-unverified',
          60072,
        ),
        debugBreakpointData: _n('debug-breakpoint-data', 60073),
        debugBreakpointDataDisabled: _n(
          'debug-breakpoint-data-disabled',
          60073,
        ),
        debugBreakpointLogUnverified: _n(
          'debug-breakpoint-log-unverified',
          60074,
        ),
        debugBreakpointLog: _n('debug-breakpoint-log', 60075),
        debugBreakpointLogDisabled: _n('debug-breakpoint-log-disabled', 60075),
        briefcase: _n('briefcase', 60076),
        broadcast: _n('broadcast', 60077),
        browser: _n('browser', 60078),
        bug: _n('bug', 60079),
        calendar: _n('calendar', 60080),
        caseSensitive: _n('case-sensitive', 60081),
        check: _n('check', 60082),
        checklist: _n('checklist', 60083),
        chevronDown: _n('chevron-down', 60084),
        dropDownButton: _n('drop-down-button', 60084),
        chevronLeft: _n('chevron-left', 60085),
        chevronRight: _n('chevron-right', 60086),
        chevronUp: _n('chevron-up', 60087),
        chromeClose: _n('chrome-close', 60088),
        chromeMaximize: _n('chrome-maximize', 60089),
        chromeMinimize: _n('chrome-minimize', 60090),
        chromeRestore: _n('chrome-restore', 60091),
        circle: _n('circle', 60092),
        circleOutline: _n('circle-outline', 60092),
        debugBreakpointUnverified: _n('debug-breakpoint-unverified', 60092),
        circleSlash: _n('circle-slash', 60093),
        circuitBoard: _n('circuit-board', 60094),
        clearAll: _n('clear-all', 60095),
        clippy: _n('clippy', 60096),
        closeAll: _n('close-all', 60097),
        cloudDownload: _n('cloud-download', 60098),
        cloudUpload: _n('cloud-upload', 60099),
        code: _n('code', 60100),
        collapseAll: _n('collapse-all', 60101),
        colorMode: _n('color-mode', 60102),
        commentDiscussion: _n('comment-discussion', 60103),
        compareChanges: _n('compare-changes', 60157),
        creditCard: _n('credit-card', 60105),
        dash: _n('dash', 60108),
        dashboard: _n('dashboard', 60109),
        database: _n('database', 60110),
        debugContinue: _n('debug-continue', 60111),
        debugDisconnect: _n('debug-disconnect', 60112),
        debugPause: _n('debug-pause', 60113),
        debugRestart: _n('debug-restart', 60114),
        debugStart: _n('debug-start', 60115),
        debugStepInto: _n('debug-step-into', 60116),
        debugStepOut: _n('debug-step-out', 60117),
        debugStepOver: _n('debug-step-over', 60118),
        debugStop: _n('debug-stop', 60119),
        debug: _n('debug', 60120),
        deviceCameraVideo: _n('device-camera-video', 60121),
        deviceCamera: _n('device-camera', 60122),
        deviceMobile: _n('device-mobile', 60123),
        diffAdded: _n('diff-added', 60124),
        diffIgnored: _n('diff-ignored', 60125),
        diffModified: _n('diff-modified', 60126),
        diffRemoved: _n('diff-removed', 60127),
        diffRenamed: _n('diff-renamed', 60128),
        diff: _n('diff', 60129),
        discard: _n('discard', 60130),
        editorLayout: _n('editor-layout', 60131),
        emptyWindow: _n('empty-window', 60132),
        exclude: _n('exclude', 60133),
        extensions: _n('extensions', 60134),
        eyeClosed: _n('eye-closed', 60135),
        fileBinary: _n('file-binary', 60136),
        fileCode: _n('file-code', 60137),
        fileMedia: _n('file-media', 60138),
        filePdf: _n('file-pdf', 60139),
        fileSubmodule: _n('file-submodule', 60140),
        fileSymlinkDirectory: _n('file-symlink-directory', 60141),
        fileSymlinkFile: _n('file-symlink-file', 60142),
        fileZip: _n('file-zip', 60143),
        files: _n('files', 60144),
        filter: _n('filter', 60145),
        flame: _n('flame', 60146),
        foldDown: _n('fold-down', 60147),
        foldUp: _n('fold-up', 60148),
        fold: _n('fold', 60149),
        folderActive: _n('folder-active', 60150),
        folderOpened: _n('folder-opened', 60151),
        gear: _n('gear', 60152),
        gift: _n('gift', 60153),
        gistSecret: _n('gist-secret', 60154),
        gist: _n('gist', 60155),
        gitCommit: _n('git-commit', 60156),
        gitCompare: _n('git-compare', 60157),
        gitMerge: _n('git-merge', 60158),
        githubAction: _n('github-action', 60159),
        githubAlt: _n('github-alt', 60160),
        globe: _n('globe', 60161),
        grabber: _n('grabber', 60162),
        graph: _n('graph', 60163),
        gripper: _n('gripper', 60164),
        heart: _n('heart', 60165),
        home: _n('home', 60166),
        horizontalRule: _n('horizontal-rule', 60167),
        hubot: _n('hubot', 60168),
        inbox: _n('inbox', 60169),
        issueClosed: _n('issue-closed', 60324),
        issueReopened: _n('issue-reopened', 60171),
        issues: _n('issues', 60172),
        italic: _n('italic', 60173),
        jersey: _n('jersey', 60174),
        json: _n('json', 60175),
        bracket: _n('bracket', 60175),
        kebabVertical: _n('kebab-vertical', 60176),
        key: _n('key', 60177),
        law: _n('law', 60178),
        lightbulbAutofix: _n('lightbulb-autofix', 60179),
        linkExternal: _n('link-external', 60180),
        link: _n('link', 60181),
        listOrdered: _n('list-ordered', 60182),
        listUnordered: _n('list-unordered', 60183),
        liveShare: _n('live-share', 60184),
        loading: _n('loading', 60185),
        location: _n('location', 60186),
        mailRead: _n('mail-read', 60187),
        mail: _n('mail', 60188),
        markdown: _n('markdown', 60189),
        megaphone: _n('megaphone', 60190),
        mention: _n('mention', 60191),
        milestone: _n('milestone', 60192),
        gitPullRequestMilestone: _n('git-pull-request-milestone', 60192),
        mortarBoard: _n('mortar-board', 60193),
        move: _n('move', 60194),
        multipleWindows: _n('multiple-windows', 60195),
        mute: _n('mute', 60196),
        noNewline: _n('no-newline', 60197),
        note: _n('note', 60198),
        octoface: _n('octoface', 60199),
        openPreview: _n('open-preview', 60200),
        package: _n('package', 60201),
        paintcan: _n('paintcan', 60202),
        pin: _n('pin', 60203),
        play: _n('play', 60204),
        run: _n('run', 60204),
        plug: _n('plug', 60205),
        preserveCase: _n('preserve-case', 60206),
        preview: _n('preview', 60207),
        project: _n('project', 60208),
        pulse: _n('pulse', 60209),
        question: _n('question', 60210),
        quote: _n('quote', 60211),
        radioTower: _n('radio-tower', 60212),
        reactions: _n('reactions', 60213),
        references: _n('references', 60214),
        refresh: _n('refresh', 60215),
        regex: _n('regex', 60216),
        remoteExplorer: _n('remote-explorer', 60217),
        remote: _n('remote', 60218),
        remove: _n('remove', 60219),
        replaceAll: _n('replace-all', 60220),
        replace: _n('replace', 60221),
        repoClone: _n('repo-clone', 60222),
        repoForcePush: _n('repo-force-push', 60223),
        repoPull: _n('repo-pull', 60224),
        repoPush: _n('repo-push', 60225),
        report: _n('report', 60226),
        requestChanges: _n('request-changes', 60227),
        rocket: _n('rocket', 60228),
        rootFolderOpened: _n('root-folder-opened', 60229),
        rootFolder: _n('root-folder', 60230),
        rss: _n('rss', 60231),
        ruby: _n('ruby', 60232),
        saveAll: _n('save-all', 60233),
        saveAs: _n('save-as', 60234),
        save: _n('save', 60235),
        screenFull: _n('screen-full', 60236),
        screenNormal: _n('screen-normal', 60237),
        searchStop: _n('search-stop', 60238),
        server: _n('server', 60240),
        settingsGear: _n('settings-gear', 60241),
        settings: _n('settings', 60242),
        shield: _n('shield', 60243),
        smiley: _n('smiley', 60244),
        sortPrecedence: _n('sort-precedence', 60245),
        splitHorizontal: _n('split-horizontal', 60246),
        splitVertical: _n('split-vertical', 60247),
        squirrel: _n('squirrel', 60248),
        starFull: _n('star-full', 60249),
        starHalf: _n('star-half', 60250),
        symbolClass: _n('symbol-class', 60251),
        symbolColor: _n('symbol-color', 60252),
        symbolCustomColor: _n('symbol-customcolor', 60252),
        symbolConstant: _n('symbol-constant', 60253),
        symbolEnumMember: _n('symbol-enum-member', 60254),
        symbolField: _n('symbol-field', 60255),
        symbolFile: _n('symbol-file', 60256),
        symbolInterface: _n('symbol-interface', 60257),
        symbolKeyword: _n('symbol-keyword', 60258),
        symbolMisc: _n('symbol-misc', 60259),
        symbolOperator: _n('symbol-operator', 60260),
        symbolProperty: _n('symbol-property', 60261),
        wrench: _n('wrench', 60261),
        wrenchSubaction: _n('wrench-subaction', 60261),
        symbolSnippet: _n('symbol-snippet', 60262),
        tasklist: _n('tasklist', 60263),
        telescope: _n('telescope', 60264),
        textSize: _n('text-size', 60265),
        threeBars: _n('three-bars', 60266),
        thumbsdown: _n('thumbsdown', 60267),
        thumbsup: _n('thumbsup', 60268),
        tools: _n('tools', 60269),
        triangleDown: _n('triangle-down', 60270),
        triangleLeft: _n('triangle-left', 60271),
        triangleRight: _n('triangle-right', 60272),
        triangleUp: _n('triangle-up', 60273),
        twitter: _n('twitter', 60274),
        unfold: _n('unfold', 60275),
        unlock: _n('unlock', 60276),
        unmute: _n('unmute', 60277),
        unverified: _n('unverified', 60278),
        verified: _n('verified', 60279),
        versions: _n('versions', 60280),
        vmActive: _n('vm-active', 60281),
        vmOutline: _n('vm-outline', 60282),
        vmRunning: _n('vm-running', 60283),
        watch: _n('watch', 60284),
        whitespace: _n('whitespace', 60285),
        wholeWord: _n('whole-word', 60286),
        window: _n('window', 60287),
        wordWrap: _n('word-wrap', 60288),
        zoomIn: _n('zoom-in', 60289),
        zoomOut: _n('zoom-out', 60290),
        listFilter: _n('list-filter', 60291),
        listFlat: _n('list-flat', 60292),
        listSelection: _n('list-selection', 60293),
        selection: _n('selection', 60293),
        listTree: _n('list-tree', 60294),
        debugBreakpointFunctionUnverified: _n(
          'debug-breakpoint-function-unverified',
          60295,
        ),
        debugBreakpointFunction: _n('debug-breakpoint-function', 60296),
        debugBreakpointFunctionDisabled: _n(
          'debug-breakpoint-function-disabled',
          60296,
        ),
        debugStackframeActive: _n('debug-stackframe-active', 60297),
        circleSmallFilled: _n('circle-small-filled', 60298),
        debugStackframeDot: _n('debug-stackframe-dot', 60298),
        debugStackframe: _n('debug-stackframe', 60299),
        debugStackframeFocused: _n('debug-stackframe-focused', 60299),
        debugBreakpointUnsupported: _n('debug-breakpoint-unsupported', 60300),
        symbolString: _n('symbol-string', 60301),
        debugReverseContinue: _n('debug-reverse-continue', 60302),
        debugStepBack: _n('debug-step-back', 60303),
        debugRestartFrame: _n('debug-restart-frame', 60304),
        callIncoming: _n('call-incoming', 60306),
        callOutgoing: _n('call-outgoing', 60307),
        menu: _n('menu', 60308),
        expandAll: _n('expand-all', 60309),
        feedback: _n('feedback', 60310),
        gitPullRequestReviewer: _n('git-pull-request-reviewer', 60310),
        groupByRefType: _n('group-by-ref-type', 60311),
        ungroupByRefType: _n('ungroup-by-ref-type', 60312),
        account: _n('account', 60313),
        gitPullRequestAssignee: _n('git-pull-request-assignee', 60313),
        bellDot: _n('bell-dot', 60314),
        debugConsole: _n('debug-console', 60315),
        library: _n('library', 60316),
        output: _n('output', 60317),
        runAll: _n('run-all', 60318),
        syncIgnored: _n('sync-ignored', 60319),
        pinned: _n('pinned', 60320),
        githubInverted: _n('github-inverted', 60321),
        debugAlt: _n('debug-alt', 60305),
        serverProcess: _n('server-process', 60322),
        serverEnvironment: _n('server-environment', 60323),
        pass: _n('pass', 60324),
        stopCircle: _n('stop-circle', 60325),
        playCircle: _n('play-circle', 60326),
        record: _n('record', 60327),
        debugAltSmall: _n('debug-alt-small', 60328),
        vmConnect: _n('vm-connect', 60329),
        cloud: _n('cloud', 60330),
        merge: _n('merge', 60331),
        exportIcon: _n('export', 60332),
        graphLeft: _n('graph-left', 60333),
        magnet: _n('magnet', 60334),
        notebook: _n('notebook', 60335),
        redo: _n('redo', 60336),
        checkAll: _n('check-all', 60337),
        pinnedDirty: _n('pinned-dirty', 60338),
        passFilled: _n('pass-filled', 60339),
        circleLargeFilled: _n('circle-large-filled', 60340),
        circleLarge: _n('circle-large', 60341),
        circleLargeOutline: _n('circle-large-outline', 60341),
        combine: _n('combine', 60342),
        gather: _n('gather', 60342),
        table: _n('table', 60343),
        variableGroup: _n('variable-group', 60344),
        typeHierarchy: _n('type-hierarchy', 60345),
        typeHierarchySub: _n('type-hierarchy-sub', 60346),
        typeHierarchySuper: _n('type-hierarchy-super', 60347),
        gitPullRequestCreate: _n('git-pull-request-create', 60348),
        runAbove: _n('run-above', 60349),
        runBelow: _n('run-below', 60350),
        notebookTemplate: _n('notebook-template', 60351),
        debugRerun: _n('debug-rerun', 60352),
        workspaceTrusted: _n('workspace-trusted', 60353),
        workspaceUntrusted: _n('workspace-untrusted', 60354),
        workspaceUnspecified: _n('workspace-unspecified', 60355),
        terminalCmd: _n('terminal-cmd', 60356),
        terminalDebian: _n('terminal-debian', 60357),
        terminalLinux: _n('terminal-linux', 60358),
        terminalPowershell: _n('terminal-powershell', 60359),
        terminalTmux: _n('terminal-tmux', 60360),
        terminalUbuntu: _n('terminal-ubuntu', 60361),
        terminalBash: _n('terminal-bash', 60362),
        arrowSwap: _n('arrow-swap', 60363),
        copy: _n('copy', 60364),
        personAdd: _n('person-add', 60365),
        filterFilled: _n('filter-filled', 60366),
        wand: _n('wand', 60367),
        debugLineByLine: _n('debug-line-by-line', 60368),
        inspect: _n('inspect', 60369),
        layers: _n('layers', 60370),
        layersDot: _n('layers-dot', 60371),
        layersActive: _n('layers-active', 60372),
        compass: _n('compass', 60373),
        compassDot: _n('compass-dot', 60374),
        compassActive: _n('compass-active', 60375),
        azure: _n('azure', 60376),
        issueDraft: _n('issue-draft', 60377),
        gitPullRequestClosed: _n('git-pull-request-closed', 60378),
        gitPullRequestDraft: _n('git-pull-request-draft', 60379),
        debugAll: _n('debug-all', 60380),
        debugCoverage: _n('debug-coverage', 60381),
        runErrors: _n('run-errors', 60382),
        folderLibrary: _n('folder-library', 60383),
        debugContinueSmall: _n('debug-continue-small', 60384),
        beakerStop: _n('beaker-stop', 60385),
        graphLine: _n('graph-line', 60386),
        graphScatter: _n('graph-scatter', 60387),
        pieChart: _n('pie-chart', 60388),
        bracketDot: _n('bracket-dot', 60389),
        bracketError: _n('bracket-error', 60390),
        lockSmall: _n('lock-small', 60391),
        azureDevops: _n('azure-devops', 60392),
        verifiedFilled: _n('verified-filled', 60393),
        newLine: _n('newline', 60394),
        layout: _n('layout', 60395),
        layoutActivitybarLeft: _n('layout-activitybar-left', 60396),
        layoutActivitybarRight: _n('layout-activitybar-right', 60397),
        layoutPanelLeft: _n('layout-panel-left', 60398),
        layoutPanelCenter: _n('layout-panel-center', 60399),
        layoutPanelJustify: _n('layout-panel-justify', 60400),
        layoutPanelRight: _n('layout-panel-right', 60401),
        layoutPanel: _n('layout-panel', 60402),
        layoutSidebarLeft: _n('layout-sidebar-left', 60403),
        layoutSidebarRight: _n('layout-sidebar-right', 60404),
        layoutStatusbar: _n('layout-statusbar', 60405),
        layoutMenubar: _n('layout-menubar', 60406),
        layoutCentered: _n('layout-centered', 60407),
        layoutSidebarRightOff: _n('layout-sidebar-right-off', 60416),
        layoutPanelOff: _n('layout-panel-off', 60417),
        layoutSidebarLeftOff: _n('layout-sidebar-left-off', 60418),
        target: _n('target', 60408),
        indent: _n('indent', 60409),
        recordSmall: _n('record-small', 60410),
        errorSmall: _n('error-small', 60411),
        arrowCircleDown: _n('arrow-circle-down', 60412),
        arrowCircleLeft: _n('arrow-circle-left', 60413),
        arrowCircleRight: _n('arrow-circle-right', 60414),
        arrowCircleUp: _n('arrow-circle-up', 60415),
        heartFilled: _n('heart-filled', 60420),
        map: _n('map', 60421),
        mapFilled: _n('map-filled', 60422),
        circleSmall: _n('circle-small', 60423),
        bellSlash: _n('bell-slash', 60424),
        bellSlashDot: _n('bell-slash-dot', 60425),
        commentUnresolved: _n('comment-unresolved', 60426),
        gitPullRequestGoToChanges: _n('git-pull-request-go-to-changes', 60427),
        gitPullRequestNewChanges: _n('git-pull-request-new-changes', 60428),
        searchFuzzy: _n('search-fuzzy', 60429),
        commentDraft: _n('comment-draft', 60430),
        send: _n('send', 60431),
        sparkle: _n('sparkle', 60432),
        insert: _n('insert', 60433),
        mic: _n('mic', 60434),
        thumbsDownFilled: _n('thumbsdown-filled', 60435),
        thumbsUpFilled: _n('thumbsup-filled', 60436),
        coffee: _n('coffee', 60437),
        snake: _n('snake', 60438),
        game: _n('game', 60439),
        vr: _n('vr', 60440),
        chip: _n('chip', 60441),
        piano: _n('piano', 60442),
        music: _n('music', 60443),
        micFilled: _n('mic-filled', 60444),
        gitFetch: _n('git-fetch', 60445),
        copilot: _n('copilot', 60446),
        lightbulbSparkle: _n('lightbulb-sparkle', 60447),
        lightbulbSparkleAutofix: _n('lightbulb-sparkle-autofix', 60447),
        robot: _n('robot', 60448),
        sparkleFilled: _n('sparkle-filled', 60449),
        diffSingle: _n('diff-single', 60450),
        diffMultiple: _n('diff-multiple', 60451),
        surroundWith: _n('surround-with', 60452),
        gitStash: _n('git-stash', 60454),
        gitStashApply: _n('git-stash-apply', 60455),
        gitStashPop: _n('git-stash-pop', 60456),
        runAllCoverage: _n('run-all-coverage', 60461),
        runCoverage: _n('run-all-coverage', 60460),
        coverage: _n('coverage', 60462),
        githubProject: _n('github-project', 60463),
        dialogError: _n('dialog-error', 'error'),
        dialogWarning: _n('dialog-warning', 'warning'),
        dialogInfo: _n('dialog-info', 'info'),
        dialogClose: _n('dialog-close', 'close'),
        treeItemExpanded: _n('tree-item-expanded', 'chevron-down'),
        treeFilterOnTypeOn: _n('tree-filter-on-type-on', 'list-filter'),
        treeFilterOnTypeOff: _n('tree-filter-on-type-off', 'list-selection'),
        treeFilterClear: _n('tree-filter-clear', 'close'),
        treeItemLoading: _n('tree-item-loading', 'loading'),
        menuSelection: _n('menu-selection', 'check'),
        menuSubmenu: _n('menu-submenu', 'chevron-right'),
        menuBarMore: _n('menubar-more', 'more'),
        scrollbarButtonLeft: _n('scrollbar-button-left', 'triangle-left'),
        scrollbarButtonRight: _n('scrollbar-button-right', 'triangle-right'),
        scrollbarButtonUp: _n('scrollbar-button-up', 'triangle-up'),
        scrollbarButtonDown: _n('scrollbar-button-down', 'triangle-down'),
        toolBarMore: _n('toolbar-more', 'more'),
        quickInputBack: _n('quick-input-back', 'arrow-left'),
      };
      class En extends w {
        get isResolved() {
          return this._isResolved;
        }
        constructor(e, t, n) {
          super(),
            (this._registry = e),
            (this._languageId = t),
            (this._factory = n),
            (this._isDisposed = !1),
            (this._resolvePromise = null),
            (this._isResolved = !1);
        }
        dispose() {
          (this._isDisposed = !0), super.dispose();
        }
        async resolve() {
          return (
            this._resolvePromise || (this._resolvePromise = this._create()),
            this._resolvePromise
          );
        }
        async _create() {
          const e = await this._factory.tokenizationSupport;
          (this._isResolved = !0),
            e &&
              !this._isDisposed &&
              this._register(this._registry.register(this._languageId, e));
        }
      }
      var An,
        xn,
        Nn,
        Ln,
        On = n(364);
      class kn {
        constructor(e, t, n) {
          (this.offset = e),
            (this.type = t),
            (this.language = n),
            (this._tokenBrand = void 0);
        }
        toString() {
          return '(' + this.offset + ', ' + this.type + ')';
        }
      }
      !(function (e) {
        const t = new Map();
        t.set(0, Cn.symbolMethod),
          t.set(1, Cn.symbolFunction),
          t.set(2, Cn.symbolConstructor),
          t.set(3, Cn.symbolField),
          t.set(4, Cn.symbolVariable),
          t.set(5, Cn.symbolClass),
          t.set(6, Cn.symbolStruct),
          t.set(7, Cn.symbolInterface),
          t.set(8, Cn.symbolModule),
          t.set(9, Cn.symbolProperty),
          t.set(10, Cn.symbolEvent),
          t.set(11, Cn.symbolOperator),
          t.set(12, Cn.symbolUnit),
          t.set(13, Cn.symbolValue),
          t.set(15, Cn.symbolEnum),
          t.set(14, Cn.symbolConstant),
          t.set(15, Cn.symbolEnum),
          t.set(16, Cn.symbolEnumMember),
          t.set(17, Cn.symbolKeyword),
          t.set(27, Cn.symbolSnippet),
          t.set(18, Cn.symbolText),
          t.set(19, Cn.symbolColor),
          t.set(20, Cn.symbolFile),
          t.set(21, Cn.symbolReference),
          t.set(22, Cn.symbolCustomColor),
          t.set(23, Cn.symbolFolder),
          t.set(24, Cn.symbolTypeParameter),
          t.set(25, Cn.account),
          t.set(26, Cn.issues),
          (e.toIcon = function (e) {
            let n = t.get(e);
            return (
              n ||
                (On.info('No codicon found for CompletionItemKind ' + e),
                (n = Cn.symbolProperty)),
              n
            );
          });
        const n = new Map();
        n.set('method', 0),
          n.set('function', 1),
          n.set('constructor', 2),
          n.set('field', 3),
          n.set('variable', 4),
          n.set('class', 5),
          n.set('struct', 6),
          n.set('interface', 7),
          n.set('module', 8),
          n.set('property', 9),
          n.set('event', 10),
          n.set('operator', 11),
          n.set('unit', 12),
          n.set('value', 13),
          n.set('constant', 14),
          n.set('enum', 15),
          n.set('enum-member', 16),
          n.set('enumMember', 16),
          n.set('keyword', 17),
          n.set('snippet', 27),
          n.set('text', 18),
          n.set('color', 19),
          n.set('file', 20),
          n.set('reference', 21),
          n.set('customcolor', 22),
          n.set('folder', 23),
          n.set('type-parameter', 24),
          n.set('typeParameter', 24),
          n.set('account', 25),
          n.set('issue', 26),
          (e.fromString = function (e, t) {
            let r = n.get(e);
            return void 0 !== r || t || (r = 9), r;
          });
      })(An || (An = {})),
        (function (e) {
          (e[(e.Automatic = 0)] = 'Automatic'),
            (e[(e.Explicit = 1)] = 'Explicit');
        })(xn || (xn = {}));
      !(function (e) {
        (e[(e.Invoke = 1)] = 'Invoke'),
          (e[(e.TriggerCharacter = 2)] = 'TriggerCharacter'),
          (e[(e.ContentChange = 3)] = 'ContentChange');
      })(Nn || (Nn = {})),
        (function (e) {
          (e[(e.Text = 0)] = 'Text'),
            (e[(e.Read = 1)] = 'Read'),
            (e[(e.Write = 2)] = 'Write');
        })(Ln || (Ln = {}));
      j(0, 'array'),
        j(0, 'boolean'),
        j(0, 'class'),
        j(0, 'constant'),
        j(0, 'constructor'),
        j(0, 'enumeration'),
        j(0, 'enumeration member'),
        j(0, 'event'),
        j(0, 'field'),
        j(0, 'file'),
        j(0, 'function'),
        j(0, 'interface'),
        j(0, 'key'),
        j(0, 'method'),
        j(0, 'module'),
        j(0, 'namespace'),
        j(0, 'null'),
        j(0, 'number'),
        j(0, 'object'),
        j(0, 'operator'),
        j(0, 'package'),
        j(0, 'property'),
        j(0, 'string'),
        j(0, 'struct'),
        j(0, 'type parameter'),
        j(0, 'variable');
      var Rn, Tn, Mn, Pn;
      !(function (e) {
        const t = new Map();
        t.set(0, Cn.symbolFile),
          t.set(1, Cn.symbolModule),
          t.set(2, Cn.symbolNamespace),
          t.set(3, Cn.symbolPackage),
          t.set(4, Cn.symbolClass),
          t.set(5, Cn.symbolMethod),
          t.set(6, Cn.symbolProperty),
          t.set(7, Cn.symbolField),
          t.set(8, Cn.symbolConstructor),
          t.set(9, Cn.symbolEnum),
          t.set(10, Cn.symbolInterface),
          t.set(11, Cn.symbolFunction),
          t.set(12, Cn.symbolVariable),
          t.set(13, Cn.symbolConstant),
          t.set(14, Cn.symbolString),
          t.set(15, Cn.symbolNumber),
          t.set(16, Cn.symbolBoolean),
          t.set(17, Cn.symbolArray),
          t.set(18, Cn.symbolObject),
          t.set(19, Cn.symbolKey),
          t.set(20, Cn.symbolNull),
          t.set(21, Cn.symbolEnumMember),
          t.set(22, Cn.symbolStruct),
          t.set(23, Cn.symbolEvent),
          t.set(24, Cn.symbolOperator),
          t.set(25, Cn.symbolTypeParameter),
          (e.toIcon = function (e) {
            let n = t.get(e);
            return (
              n ||
                (On.info('No codicon found for SymbolKind ' + e),
                (n = Cn.symbolProperty)),
              n
            );
          });
      })(Rn || (Rn = {}));
      class In {
        static fromValue(e) {
          switch (e) {
            case 'comment':
              return In.Comment;
            case 'imports':
              return In.Imports;
            case 'region':
              return In.Region;
          }
          return new In(e);
        }
        constructor(e) {
          this.value = e;
        }
      }
      (In.Comment = new In('comment')),
        (In.Imports = new In('imports')),
        (In.Region = new In('region')),
        (function (e) {
          e[(e.AIGenerated = 1)] = 'AIGenerated';
        })(Tn || (Tn = {})),
        (function (e) {
          e.is = function (e) {
            return (
              !(!e || 'object' != typeof e) &&
              'string' == typeof e.id &&
              'string' == typeof e.title
            );
          };
        })(Mn || (Mn = {})),
        (function (e) {
          (e[(e.Type = 1)] = 'Type'), (e[(e.Parameter = 2)] = 'Parameter');
        })(Pn || (Pn = {}));
      new (class {
        constructor() {
          (this._tokenizationSupports = new Map()),
            (this._factories = new Map()),
            (this._onDidChange = new R()),
            (this.onDidChange = this._onDidChange.event),
            (this._colorMap = null);
        }
        handleChange(e) {
          this._onDidChange.fire({ changedLanguages: e, changedColorMap: !1 });
        }
        register(e, t) {
          return (
            this._tokenizationSupports.set(e, t),
            this.handleChange([e]),
            b(() => {
              this._tokenizationSupports.get(e) === t &&
                (this._tokenizationSupports.delete(e), this.handleChange([e]));
            })
          );
        }
        get(e) {
          return this._tokenizationSupports.get(e) || null;
        }
        registerFactory(e, t) {
          var n;
          null === (n = this._factories.get(e)) || void 0 === n || n.dispose();
          const r = new En(this, e, t);
          return (
            this._factories.set(e, r),
            b(() => {
              const t = this._factories.get(e);
              t && t === r && (this._factories.delete(e), t.dispose());
            })
          );
        }
        async getOrCreate(e) {
          const t = this.get(e);
          if (t) return t;
          const n = this._factories.get(e);
          return !n || n.isResolved ? null : (await n.resolve(), this.get(e));
        }
        isResolved(e) {
          if (this.get(e)) return !0;
          const t = this._factories.get(e);
          return !(t && !t.isResolved);
        }
        setColorMap(e) {
          (this._colorMap = e),
            this._onDidChange.fire({
              changedLanguages: Array.from(this._tokenizationSupports.keys()),
              changedColorMap: !0,
            });
        }
        getColorMap() {
          return this._colorMap;
        }
        getDefaultBackground() {
          return this._colorMap && this._colorMap.length > 2
            ? this._colorMap[2]
            : null;
        }
      })();
      var jn,
        Fn,
        Dn,
        Vn,
        qn,
        Un,
        Bn,
        Kn,
        $n,
        Wn,
        zn,
        Hn,
        Gn,
        Jn,
        Xn,
        Qn,
        Yn,
        Zn,
        er,
        tr,
        nr,
        rr,
        ir,
        or,
        sr,
        ar,
        lr,
        ur,
        cr,
        hr,
        fr,
        dr,
        gr,
        mr,
        pr,
        yr,
        br,
        vr,
        wr,
        Sr,
        _r,
        Cr,
        Er;
      !(function (e) {
        (e[(e.Invoke = 0)] = 'Invoke'), (e[(e.Automatic = 1)] = 'Automatic');
      })(jn || (jn = {})),
        (function (e) {
          (e[(e.Unknown = 0)] = 'Unknown'),
            (e[(e.Disabled = 1)] = 'Disabled'),
            (e[(e.Enabled = 2)] = 'Enabled');
        })(Fn || (Fn = {})),
        (function (e) {
          (e[(e.Invoke = 1)] = 'Invoke'), (e[(e.Auto = 2)] = 'Auto');
        })(Dn || (Dn = {})),
        (function (e) {
          (e[(e.None = 0)] = 'None'),
            (e[(e.KeepWhitespace = 1)] = 'KeepWhitespace'),
            (e[(e.InsertAsSnippet = 4)] = 'InsertAsSnippet');
        })(Vn || (Vn = {})),
        (function (e) {
          (e[(e.Method = 0)] = 'Method'),
            (e[(e.Function = 1)] = 'Function'),
            (e[(e.Constructor = 2)] = 'Constructor'),
            (e[(e.Field = 3)] = 'Field'),
            (e[(e.Variable = 4)] = 'Variable'),
            (e[(e.Class = 5)] = 'Class'),
            (e[(e.Struct = 6)] = 'Struct'),
            (e[(e.Interface = 7)] = 'Interface'),
            (e[(e.Module = 8)] = 'Module'),
            (e[(e.Property = 9)] = 'Property'),
            (e[(e.Event = 10)] = 'Event'),
            (e[(e.Operator = 11)] = 'Operator'),
            (e[(e.Unit = 12)] = 'Unit'),
            (e[(e.Value = 13)] = 'Value'),
            (e[(e.Constant = 14)] = 'Constant'),
            (e[(e.Enum = 15)] = 'Enum'),
            (e[(e.EnumMember = 16)] = 'EnumMember'),
            (e[(e.Keyword = 17)] = 'Keyword'),
            (e[(e.Text = 18)] = 'Text'),
            (e[(e.Color = 19)] = 'Color'),
            (e[(e.File = 20)] = 'File'),
            (e[(e.Reference = 21)] = 'Reference'),
            (e[(e.Customcolor = 22)] = 'Customcolor'),
            (e[(e.Folder = 23)] = 'Folder'),
            (e[(e.TypeParameter = 24)] = 'TypeParameter'),
            (e[(e.User = 25)] = 'User'),
            (e[(e.Issue = 26)] = 'Issue'),
            (e[(e.Snippet = 27)] = 'Snippet');
        })(qn || (qn = {})),
        (function (e) {
          e[(e.Deprecated = 1)] = 'Deprecated';
        })(Un || (Un = {})),
        (function (e) {
          (e[(e.Invoke = 0)] = 'Invoke'),
            (e[(e.TriggerCharacter = 1)] = 'TriggerCharacter'),
            (e[(e.TriggerForIncompleteCompletions = 2)] =
              'TriggerForIncompleteCompletions');
        })(Bn || (Bn = {})),
        (function (e) {
          (e[(e.EXACT = 0)] = 'EXACT'),
            (e[(e.ABOVE = 1)] = 'ABOVE'),
            (e[(e.BELOW = 2)] = 'BELOW');
        })(Kn || (Kn = {})),
        (function (e) {
          (e[(e.NotSet = 0)] = 'NotSet'),
            (e[(e.ContentFlush = 1)] = 'ContentFlush'),
            (e[(e.RecoverFromMarkers = 2)] = 'RecoverFromMarkers'),
            (e[(e.Explicit = 3)] = 'Explicit'),
            (e[(e.Paste = 4)] = 'Paste'),
            (e[(e.Undo = 5)] = 'Undo'),
            (e[(e.Redo = 6)] = 'Redo');
        })($n || ($n = {})),
        (function (e) {
          (e[(e.LF = 1)] = 'LF'), (e[(e.CRLF = 2)] = 'CRLF');
        })(Wn || (Wn = {})),
        (function (e) {
          (e[(e.Text = 0)] = 'Text'),
            (e[(e.Read = 1)] = 'Read'),
            (e[(e.Write = 2)] = 'Write');
        })(zn || (zn = {})),
        (function (e) {
          (e[(e.None = 0)] = 'None'),
            (e[(e.Keep = 1)] = 'Keep'),
            (e[(e.Brackets = 2)] = 'Brackets'),
            (e[(e.Advanced = 3)] = 'Advanced'),
            (e[(e.Full = 4)] = 'Full');
        })(Hn || (Hn = {})),
        (function (e) {
          (e[(e.acceptSuggestionOnCommitCharacter = 0)] =
            'acceptSuggestionOnCommitCharacter'),
            (e[(e.acceptSuggestionOnEnter = 1)] = 'acceptSuggestionOnEnter'),
            (e[(e.accessibilitySupport = 2)] = 'accessibilitySupport'),
            (e[(e.accessibilityPageSize = 3)] = 'accessibilityPageSize'),
            (e[(e.ariaLabel = 4)] = 'ariaLabel'),
            (e[(e.ariaRequired = 5)] = 'ariaRequired'),
            (e[(e.autoClosingBrackets = 6)] = 'autoClosingBrackets'),
            (e[(e.autoClosingComments = 7)] = 'autoClosingComments'),
            (e[(e.screenReaderAnnounceInlineSuggestion = 8)] =
              'screenReaderAnnounceInlineSuggestion'),
            (e[(e.autoClosingDelete = 9)] = 'autoClosingDelete'),
            (e[(e.autoClosingOvertype = 10)] = 'autoClosingOvertype'),
            (e[(e.autoClosingQuotes = 11)] = 'autoClosingQuotes'),
            (e[(e.autoIndent = 12)] = 'autoIndent'),
            (e[(e.automaticLayout = 13)] = 'automaticLayout'),
            (e[(e.autoSurround = 14)] = 'autoSurround'),
            (e[(e.bracketPairColorization = 15)] = 'bracketPairColorization'),
            (e[(e.guides = 16)] = 'guides'),
            (e[(e.codeLens = 17)] = 'codeLens'),
            (e[(e.codeLensFontFamily = 18)] = 'codeLensFontFamily'),
            (e[(e.codeLensFontSize = 19)] = 'codeLensFontSize'),
            (e[(e.colorDecorators = 20)] = 'colorDecorators'),
            (e[(e.colorDecoratorsLimit = 21)] = 'colorDecoratorsLimit'),
            (e[(e.columnSelection = 22)] = 'columnSelection'),
            (e[(e.comments = 23)] = 'comments'),
            (e[(e.contextmenu = 24)] = 'contextmenu'),
            (e[(e.copyWithSyntaxHighlighting = 25)] =
              'copyWithSyntaxHighlighting'),
            (e[(e.cursorBlinking = 26)] = 'cursorBlinking'),
            (e[(e.cursorSmoothCaretAnimation = 27)] =
              'cursorSmoothCaretAnimation'),
            (e[(e.cursorStyle = 28)] = 'cursorStyle'),
            (e[(e.cursorSurroundingLines = 29)] = 'cursorSurroundingLines'),
            (e[(e.cursorSurroundingLinesStyle = 30)] =
              'cursorSurroundingLinesStyle'),
            (e[(e.cursorWidth = 31)] = 'cursorWidth'),
            (e[(e.disableLayerHinting = 32)] = 'disableLayerHinting'),
            (e[(e.disableMonospaceOptimizations = 33)] =
              'disableMonospaceOptimizations'),
            (e[(e.domReadOnly = 34)] = 'domReadOnly'),
            (e[(e.dragAndDrop = 35)] = 'dragAndDrop'),
            (e[(e.dropIntoEditor = 36)] = 'dropIntoEditor'),
            (e[(e.emptySelectionClipboard = 37)] = 'emptySelectionClipboard'),
            (e[(e.experimentalWhitespaceRendering = 38)] =
              'experimentalWhitespaceRendering'),
            (e[(e.extraEditorClassName = 39)] = 'extraEditorClassName'),
            (e[(e.fastScrollSensitivity = 40)] = 'fastScrollSensitivity'),
            (e[(e.find = 41)] = 'find'),
            (e[(e.fixedOverflowWidgets = 42)] = 'fixedOverflowWidgets'),
            (e[(e.folding = 43)] = 'folding'),
            (e[(e.foldingStrategy = 44)] = 'foldingStrategy'),
            (e[(e.foldingHighlight = 45)] = 'foldingHighlight'),
            (e[(e.foldingImportsByDefault = 46)] = 'foldingImportsByDefault'),
            (e[(e.foldingMaximumRegions = 47)] = 'foldingMaximumRegions'),
            (e[(e.unfoldOnClickAfterEndOfLine = 48)] =
              'unfoldOnClickAfterEndOfLine'),
            (e[(e.fontFamily = 49)] = 'fontFamily'),
            (e[(e.fontInfo = 50)] = 'fontInfo'),
            (e[(e.fontLigatures = 51)] = 'fontLigatures'),
            (e[(e.fontSize = 52)] = 'fontSize'),
            (e[(e.fontWeight = 53)] = 'fontWeight'),
            (e[(e.fontVariations = 54)] = 'fontVariations'),
            (e[(e.formatOnPaste = 55)] = 'formatOnPaste'),
            (e[(e.formatOnType = 56)] = 'formatOnType'),
            (e[(e.glyphMargin = 57)] = 'glyphMargin'),
            (e[(e.gotoLocation = 58)] = 'gotoLocation'),
            (e[(e.hideCursorInOverviewRuler = 59)] =
              'hideCursorInOverviewRuler'),
            (e[(e.hover = 60)] = 'hover'),
            (e[(e.inDiffEditor = 61)] = 'inDiffEditor'),
            (e[(e.inlineSuggest = 62)] = 'inlineSuggest'),
            (e[(e.inlineEdit = 63)] = 'inlineEdit'),
            (e[(e.letterSpacing = 64)] = 'letterSpacing'),
            (e[(e.lightbulb = 65)] = 'lightbulb'),
            (e[(e.lineDecorationsWidth = 66)] = 'lineDecorationsWidth'),
            (e[(e.lineHeight = 67)] = 'lineHeight'),
            (e[(e.lineNumbers = 68)] = 'lineNumbers'),
            (e[(e.lineNumbersMinChars = 69)] = 'lineNumbersMinChars'),
            (e[(e.linkedEditing = 70)] = 'linkedEditing'),
            (e[(e.links = 71)] = 'links'),
            (e[(e.matchBrackets = 72)] = 'matchBrackets'),
            (e[(e.minimap = 73)] = 'minimap'),
            (e[(e.mouseStyle = 74)] = 'mouseStyle'),
            (e[(e.mouseWheelScrollSensitivity = 75)] =
              'mouseWheelScrollSensitivity'),
            (e[(e.mouseWheelZoom = 76)] = 'mouseWheelZoom'),
            (e[(e.multiCursorMergeOverlapping = 77)] =
              'multiCursorMergeOverlapping'),
            (e[(e.multiCursorModifier = 78)] = 'multiCursorModifier'),
            (e[(e.multiCursorPaste = 79)] = 'multiCursorPaste'),
            (e[(e.multiCursorLimit = 80)] = 'multiCursorLimit'),
            (e[(e.occurrencesHighlight = 81)] = 'occurrencesHighlight'),
            (e[(e.overviewRulerBorder = 82)] = 'overviewRulerBorder'),
            (e[(e.overviewRulerLanes = 83)] = 'overviewRulerLanes'),
            (e[(e.padding = 84)] = 'padding'),
            (e[(e.pasteAs = 85)] = 'pasteAs'),
            (e[(e.parameterHints = 86)] = 'parameterHints'),
            (e[(e.peekWidgetDefaultFocus = 87)] = 'peekWidgetDefaultFocus'),
            (e[(e.definitionLinkOpensInPeek = 88)] =
              'definitionLinkOpensInPeek'),
            (e[(e.quickSuggestions = 89)] = 'quickSuggestions'),
            (e[(e.quickSuggestionsDelay = 90)] = 'quickSuggestionsDelay'),
            (e[(e.readOnly = 91)] = 'readOnly'),
            (e[(e.readOnlyMessage = 92)] = 'readOnlyMessage'),
            (e[(e.renameOnType = 93)] = 'renameOnType'),
            (e[(e.renderControlCharacters = 94)] = 'renderControlCharacters'),
            (e[(e.renderFinalNewline = 95)] = 'renderFinalNewline'),
            (e[(e.renderLineHighlight = 96)] = 'renderLineHighlight'),
            (e[(e.renderLineHighlightOnlyWhenFocus = 97)] =
              'renderLineHighlightOnlyWhenFocus'),
            (e[(e.renderValidationDecorations = 98)] =
              'renderValidationDecorations'),
            (e[(e.renderWhitespace = 99)] = 'renderWhitespace'),
            (e[(e.revealHorizontalRightPadding = 100)] =
              'revealHorizontalRightPadding'),
            (e[(e.roundedSelection = 101)] = 'roundedSelection'),
            (e[(e.rulers = 102)] = 'rulers'),
            (e[(e.scrollbar = 103)] = 'scrollbar'),
            (e[(e.scrollBeyondLastColumn = 104)] = 'scrollBeyondLastColumn'),
            (e[(e.scrollBeyondLastLine = 105)] = 'scrollBeyondLastLine'),
            (e[(e.scrollPredominantAxis = 106)] = 'scrollPredominantAxis'),
            (e[(e.selectionClipboard = 107)] = 'selectionClipboard'),
            (e[(e.selectionHighlight = 108)] = 'selectionHighlight'),
            (e[(e.selectOnLineNumbers = 109)] = 'selectOnLineNumbers'),
            (e[(e.showFoldingControls = 110)] = 'showFoldingControls'),
            (e[(e.showUnused = 111)] = 'showUnused'),
            (e[(e.snippetSuggestions = 112)] = 'snippetSuggestions'),
            (e[(e.smartSelect = 113)] = 'smartSelect'),
            (e[(e.smoothScrolling = 114)] = 'smoothScrolling'),
            (e[(e.stickyScroll = 115)] = 'stickyScroll'),
            (e[(e.stickyTabStops = 116)] = 'stickyTabStops'),
            (e[(e.stopRenderingLineAfter = 117)] = 'stopRenderingLineAfter'),
            (e[(e.suggest = 118)] = 'suggest'),
            (e[(e.suggestFontSize = 119)] = 'suggestFontSize'),
            (e[(e.suggestLineHeight = 120)] = 'suggestLineHeight'),
            (e[(e.suggestOnTriggerCharacters = 121)] =
              'suggestOnTriggerCharacters'),
            (e[(e.suggestSelection = 122)] = 'suggestSelection'),
            (e[(e.tabCompletion = 123)] = 'tabCompletion'),
            (e[(e.tabIndex = 124)] = 'tabIndex'),
            (e[(e.unicodeHighlighting = 125)] = 'unicodeHighlighting'),
            (e[(e.unusualLineTerminators = 126)] = 'unusualLineTerminators'),
            (e[(e.useShadowDOM = 127)] = 'useShadowDOM'),
            (e[(e.useTabStops = 128)] = 'useTabStops'),
            (e[(e.wordBreak = 129)] = 'wordBreak'),
            (e[(e.wordSeparators = 130)] = 'wordSeparators'),
            (e[(e.wordWrap = 131)] = 'wordWrap'),
            (e[(e.wordWrapBreakAfterCharacters = 132)] =
              'wordWrapBreakAfterCharacters'),
            (e[(e.wordWrapBreakBeforeCharacters = 133)] =
              'wordWrapBreakBeforeCharacters'),
            (e[(e.wordWrapColumn = 134)] = 'wordWrapColumn'),
            (e[(e.wordWrapOverride1 = 135)] = 'wordWrapOverride1'),
            (e[(e.wordWrapOverride2 = 136)] = 'wordWrapOverride2'),
            (e[(e.wrappingIndent = 137)] = 'wrappingIndent'),
            (e[(e.wrappingStrategy = 138)] = 'wrappingStrategy'),
            (e[(e.showDeprecated = 139)] = 'showDeprecated'),
            (e[(e.inlayHints = 140)] = 'inlayHints'),
            (e[(e.editorClassName = 141)] = 'editorClassName'),
            (e[(e.pixelRatio = 142)] = 'pixelRatio'),
            (e[(e.tabFocusMode = 143)] = 'tabFocusMode'),
            (e[(e.layoutInfo = 144)] = 'layoutInfo'),
            (e[(e.wrappingInfo = 145)] = 'wrappingInfo'),
            (e[(e.defaultColorDecorators = 146)] = 'defaultColorDecorators'),
            (e[(e.colorDecoratorsActivatedOn = 147)] =
              'colorDecoratorsActivatedOn'),
            (e[(e.inlineCompletionsAccessibilityVerbose = 148)] =
              'inlineCompletionsAccessibilityVerbose');
        })(Gn || (Gn = {})),
        (function (e) {
          (e[(e.TextDefined = 0)] = 'TextDefined'),
            (e[(e.LF = 1)] = 'LF'),
            (e[(e.CRLF = 2)] = 'CRLF');
        })(Jn || (Jn = {})),
        (function (e) {
          (e[(e.LF = 0)] = 'LF'), (e[(e.CRLF = 1)] = 'CRLF');
        })(Xn || (Xn = {})),
        (function (e) {
          (e[(e.Left = 1)] = 'Left'),
            (e[(e.Center = 2)] = 'Center'),
            (e[(e.Right = 3)] = 'Right');
        })(Qn || (Qn = {})),
        (function (e) {
          (e[(e.None = 0)] = 'None'),
            (e[(e.Indent = 1)] = 'Indent'),
            (e[(e.IndentOutdent = 2)] = 'IndentOutdent'),
            (e[(e.Outdent = 3)] = 'Outdent');
        })(Yn || (Yn = {})),
        (function (e) {
          (e[(e.Both = 0)] = 'Both'),
            (e[(e.Right = 1)] = 'Right'),
            (e[(e.Left = 2)] = 'Left'),
            (e[(e.None = 3)] = 'None');
        })(Zn || (Zn = {})),
        (function (e) {
          (e[(e.Type = 1)] = 'Type'), (e[(e.Parameter = 2)] = 'Parameter');
        })(er || (er = {})),
        (function (e) {
          (e[(e.Automatic = 0)] = 'Automatic'),
            (e[(e.Explicit = 1)] = 'Explicit');
        })(tr || (tr = {})),
        (function (e) {
          (e[(e.Invoke = 0)] = 'Invoke'), (e[(e.Automatic = 1)] = 'Automatic');
        })(nr || (nr = {})),
        (function (e) {
          (e[(e.DependsOnKbLayout = -1)] = 'DependsOnKbLayout'),
            (e[(e.Unknown = 0)] = 'Unknown'),
            (e[(e.Backspace = 1)] = 'Backspace'),
            (e[(e.Tab = 2)] = 'Tab'),
            (e[(e.Enter = 3)] = 'Enter'),
            (e[(e.Shift = 4)] = 'Shift'),
            (e[(e.Ctrl = 5)] = 'Ctrl'),
            (e[(e.Alt = 6)] = 'Alt'),
            (e[(e.PauseBreak = 7)] = 'PauseBreak'),
            (e[(e.CapsLock = 8)] = 'CapsLock'),
            (e[(e.Escape = 9)] = 'Escape'),
            (e[(e.Space = 10)] = 'Space'),
            (e[(e.PageUp = 11)] = 'PageUp'),
            (e[(e.PageDown = 12)] = 'PageDown'),
            (e[(e.End = 13)] = 'End'),
            (e[(e.Home = 14)] = 'Home'),
            (e[(e.LeftArrow = 15)] = 'LeftArrow'),
            (e[(e.UpArrow = 16)] = 'UpArrow'),
            (e[(e.RightArrow = 17)] = 'RightArrow'),
            (e[(e.DownArrow = 18)] = 'DownArrow'),
            (e[(e.Insert = 19)] = 'Insert'),
            (e[(e.Delete = 20)] = 'Delete'),
            (e[(e.Digit0 = 21)] = 'Digit0'),
            (e[(e.Digit1 = 22)] = 'Digit1'),
            (e[(e.Digit2 = 23)] = 'Digit2'),
            (e[(e.Digit3 = 24)] = 'Digit3'),
            (e[(e.Digit4 = 25)] = 'Digit4'),
            (e[(e.Digit5 = 26)] = 'Digit5'),
            (e[(e.Digit6 = 27)] = 'Digit6'),
            (e[(e.Digit7 = 28)] = 'Digit7'),
            (e[(e.Digit8 = 29)] = 'Digit8'),
            (e[(e.Digit9 = 30)] = 'Digit9'),
            (e[(e.KeyA = 31)] = 'KeyA'),
            (e[(e.KeyB = 32)] = 'KeyB'),
            (e[(e.KeyC = 33)] = 'KeyC'),
            (e[(e.KeyD = 34)] = 'KeyD'),
            (e[(e.KeyE = 35)] = 'KeyE'),
            (e[(e.KeyF = 36)] = 'KeyF'),
            (e[(e.KeyG = 37)] = 'KeyG'),
            (e[(e.KeyH = 38)] = 'KeyH'),
            (e[(e.KeyI = 39)] = 'KeyI'),
            (e[(e.KeyJ = 40)] = 'KeyJ'),
            (e[(e.KeyK = 41)] = 'KeyK'),
            (e[(e.KeyL = 42)] = 'KeyL'),
            (e[(e.KeyM = 43)] = 'KeyM'),
            (e[(e.KeyN = 44)] = 'KeyN'),
            (e[(e.KeyO = 45)] = 'KeyO'),
            (e[(e.KeyP = 46)] = 'KeyP'),
            (e[(e.KeyQ = 47)] = 'KeyQ'),
            (e[(e.KeyR = 48)] = 'KeyR'),
            (e[(e.KeyS = 49)] = 'KeyS'),
            (e[(e.KeyT = 50)] = 'KeyT'),
            (e[(e.KeyU = 51)] = 'KeyU'),
            (e[(e.KeyV = 52)] = 'KeyV'),
            (e[(e.KeyW = 53)] = 'KeyW'),
            (e[(e.KeyX = 54)] = 'KeyX'),
            (e[(e.KeyY = 55)] = 'KeyY'),
            (e[(e.KeyZ = 56)] = 'KeyZ'),
            (e[(e.Meta = 57)] = 'Meta'),
            (e[(e.ContextMenu = 58)] = 'ContextMenu'),
            (e[(e.F1 = 59)] = 'F1'),
            (e[(e.F2 = 60)] = 'F2'),
            (e[(e.F3 = 61)] = 'F3'),
            (e[(e.F4 = 62)] = 'F4'),
            (e[(e.F5 = 63)] = 'F5'),
            (e[(e.F6 = 64)] = 'F6'),
            (e[(e.F7 = 65)] = 'F7'),
            (e[(e.F8 = 66)] = 'F8'),
            (e[(e.F9 = 67)] = 'F9'),
            (e[(e.F10 = 68)] = 'F10'),
            (e[(e.F11 = 69)] = 'F11'),
            (e[(e.F12 = 70)] = 'F12'),
            (e[(e.F13 = 71)] = 'F13'),
            (e[(e.F14 = 72)] = 'F14'),
            (e[(e.F15 = 73)] = 'F15'),
            (e[(e.F16 = 74)] = 'F16'),
            (e[(e.F17 = 75)] = 'F17'),
            (e[(e.F18 = 76)] = 'F18'),
            (e[(e.F19 = 77)] = 'F19'),
            (e[(e.F20 = 78)] = 'F20'),
            (e[(e.F21 = 79)] = 'F21'),
            (e[(e.F22 = 80)] = 'F22'),
            (e[(e.F23 = 81)] = 'F23'),
            (e[(e.F24 = 82)] = 'F24'),
            (e[(e.NumLock = 83)] = 'NumLock'),
            (e[(e.ScrollLock = 84)] = 'ScrollLock'),
            (e[(e.Semicolon = 85)] = 'Semicolon'),
            (e[(e.Equal = 86)] = 'Equal'),
            (e[(e.Comma = 87)] = 'Comma'),
            (e[(e.Minus = 88)] = 'Minus'),
            (e[(e.Period = 89)] = 'Period'),
            (e[(e.Slash = 90)] = 'Slash'),
            (e[(e.Backquote = 91)] = 'Backquote'),
            (e[(e.BracketLeft = 92)] = 'BracketLeft'),
            (e[(e.Backslash = 93)] = 'Backslash'),
            (e[(e.BracketRight = 94)] = 'BracketRight'),
            (e[(e.Quote = 95)] = 'Quote'),
            (e[(e.OEM_8 = 96)] = 'OEM_8'),
            (e[(e.IntlBackslash = 97)] = 'IntlBackslash'),
            (e[(e.Numpad0 = 98)] = 'Numpad0'),
            (e[(e.Numpad1 = 99)] = 'Numpad1'),
            (e[(e.Numpad2 = 100)] = 'Numpad2'),
            (e[(e.Numpad3 = 101)] = 'Numpad3'),
            (e[(e.Numpad4 = 102)] = 'Numpad4'),
            (e[(e.Numpad5 = 103)] = 'Numpad5'),
            (e[(e.Numpad6 = 104)] = 'Numpad6'),
            (e[(e.Numpad7 = 105)] = 'Numpad7'),
            (e[(e.Numpad8 = 106)] = 'Numpad8'),
            (e[(e.Numpad9 = 107)] = 'Numpad9'),
            (e[(e.NumpadMultiply = 108)] = 'NumpadMultiply'),
            (e[(e.NumpadAdd = 109)] = 'NumpadAdd'),
            (e[(e.NUMPAD_SEPARATOR = 110)] = 'NUMPAD_SEPARATOR'),
            (e[(e.NumpadSubtract = 111)] = 'NumpadSubtract'),
            (e[(e.NumpadDecimal = 112)] = 'NumpadDecimal'),
            (e[(e.NumpadDivide = 113)] = 'NumpadDivide'),
            (e[(e.KEY_IN_COMPOSITION = 114)] = 'KEY_IN_COMPOSITION'),
            (e[(e.ABNT_C1 = 115)] = 'ABNT_C1'),
            (e[(e.ABNT_C2 = 116)] = 'ABNT_C2'),
            (e[(e.AudioVolumeMute = 117)] = 'AudioVolumeMute'),
            (e[(e.AudioVolumeUp = 118)] = 'AudioVolumeUp'),
            (e[(e.AudioVolumeDown = 119)] = 'AudioVolumeDown'),
            (e[(e.BrowserSearch = 120)] = 'BrowserSearch'),
            (e[(e.BrowserHome = 121)] = 'BrowserHome'),
            (e[(e.BrowserBack = 122)] = 'BrowserBack'),
            (e[(e.BrowserForward = 123)] = 'BrowserForward'),
            (e[(e.MediaTrackNext = 124)] = 'MediaTrackNext'),
            (e[(e.MediaTrackPrevious = 125)] = 'MediaTrackPrevious'),
            (e[(e.MediaStop = 126)] = 'MediaStop'),
            (e[(e.MediaPlayPause = 127)] = 'MediaPlayPause'),
            (e[(e.LaunchMediaPlayer = 128)] = 'LaunchMediaPlayer'),
            (e[(e.LaunchMail = 129)] = 'LaunchMail'),
            (e[(e.LaunchApp2 = 130)] = 'LaunchApp2'),
            (e[(e.Clear = 131)] = 'Clear'),
            (e[(e.MAX_VALUE = 132)] = 'MAX_VALUE');
        })(rr || (rr = {})),
        (function (e) {
          (e[(e.Hint = 1)] = 'Hint'),
            (e[(e.Info = 2)] = 'Info'),
            (e[(e.Warning = 4)] = 'Warning'),
            (e[(e.Error = 8)] = 'Error');
        })(ir || (ir = {})),
        (function (e) {
          (e[(e.Unnecessary = 1)] = 'Unnecessary'),
            (e[(e.Deprecated = 2)] = 'Deprecated');
        })(or || (or = {})),
        (function (e) {
          (e[(e.Inline = 1)] = 'Inline'), (e[(e.Gutter = 2)] = 'Gutter');
        })(sr || (sr = {})),
        (function (e) {
          (e[(e.UNKNOWN = 0)] = 'UNKNOWN'),
            (e[(e.TEXTAREA = 1)] = 'TEXTAREA'),
            (e[(e.GUTTER_GLYPH_MARGIN = 2)] = 'GUTTER_GLYPH_MARGIN'),
            (e[(e.GUTTER_LINE_NUMBERS = 3)] = 'GUTTER_LINE_NUMBERS'),
            (e[(e.GUTTER_LINE_DECORATIONS = 4)] = 'GUTTER_LINE_DECORATIONS'),
            (e[(e.GUTTER_VIEW_ZONE = 5)] = 'GUTTER_VIEW_ZONE'),
            (e[(e.CONTENT_TEXT = 6)] = 'CONTENT_TEXT'),
            (e[(e.CONTENT_EMPTY = 7)] = 'CONTENT_EMPTY'),
            (e[(e.CONTENT_VIEW_ZONE = 8)] = 'CONTENT_VIEW_ZONE'),
            (e[(e.CONTENT_WIDGET = 9)] = 'CONTENT_WIDGET'),
            (e[(e.OVERVIEW_RULER = 10)] = 'OVERVIEW_RULER'),
            (e[(e.SCROLLBAR = 11)] = 'SCROLLBAR'),
            (e[(e.OVERLAY_WIDGET = 12)] = 'OVERLAY_WIDGET'),
            (e[(e.OUTSIDE_EDITOR = 13)] = 'OUTSIDE_EDITOR');
        })(ar || (ar = {})),
        (function (e) {
          e[(e.AIGenerated = 1)] = 'AIGenerated';
        })(lr || (lr = {})),
        (function (e) {
          (e[(e.TOP_RIGHT_CORNER = 0)] = 'TOP_RIGHT_CORNER'),
            (e[(e.BOTTOM_RIGHT_CORNER = 1)] = 'BOTTOM_RIGHT_CORNER'),
            (e[(e.TOP_CENTER = 2)] = 'TOP_CENTER');
        })(ur || (ur = {})),
        (function (e) {
          (e[(e.Left = 1)] = 'Left'),
            (e[(e.Center = 2)] = 'Center'),
            (e[(e.Right = 4)] = 'Right'),
            (e[(e.Full = 7)] = 'Full');
        })(cr || (cr = {})),
        (function (e) {
          (e[(e.Left = 0)] = 'Left'),
            (e[(e.Right = 1)] = 'Right'),
            (e[(e.None = 2)] = 'None'),
            (e[(e.LeftOfInjectedText = 3)] = 'LeftOfInjectedText'),
            (e[(e.RightOfInjectedText = 4)] = 'RightOfInjectedText');
        })(hr || (hr = {})),
        (function (e) {
          (e[(e.Off = 0)] = 'Off'),
            (e[(e.On = 1)] = 'On'),
            (e[(e.Relative = 2)] = 'Relative'),
            (e[(e.Interval = 3)] = 'Interval'),
            (e[(e.Custom = 4)] = 'Custom');
        })(fr || (fr = {})),
        (function (e) {
          (e[(e.None = 0)] = 'None'),
            (e[(e.Text = 1)] = 'Text'),
            (e[(e.Blocks = 2)] = 'Blocks');
        })(dr || (dr = {})),
        (function (e) {
          (e[(e.Smooth = 0)] = 'Smooth'), (e[(e.Immediate = 1)] = 'Immediate');
        })(gr || (gr = {})),
        (function (e) {
          (e[(e.Auto = 1)] = 'Auto'),
            (e[(e.Hidden = 2)] = 'Hidden'),
            (e[(e.Visible = 3)] = 'Visible');
        })(mr || (mr = {})),
        (function (e) {
          (e[(e.LTR = 0)] = 'LTR'), (e[(e.RTL = 1)] = 'RTL');
        })(pr || (pr = {})),
        (function (e) {
          (e.Off = 'off'), (e.OnCode = 'onCode'), (e.On = 'on');
        })(yr || (yr = {})),
        (function (e) {
          (e[(e.Invoke = 1)] = 'Invoke'),
            (e[(e.TriggerCharacter = 2)] = 'TriggerCharacter'),
            (e[(e.ContentChange = 3)] = 'ContentChange');
        })(br || (br = {})),
        (function (e) {
          (e[(e.File = 0)] = 'File'),
            (e[(e.Module = 1)] = 'Module'),
            (e[(e.Namespace = 2)] = 'Namespace'),
            (e[(e.Package = 3)] = 'Package'),
            (e[(e.Class = 4)] = 'Class'),
            (e[(e.Method = 5)] = 'Method'),
            (e[(e.Property = 6)] = 'Property'),
            (e[(e.Field = 7)] = 'Field'),
            (e[(e.Constructor = 8)] = 'Constructor'),
            (e[(e.Enum = 9)] = 'Enum'),
            (e[(e.Interface = 10)] = 'Interface'),
            (e[(e.Function = 11)] = 'Function'),
            (e[(e.Variable = 12)] = 'Variable'),
            (e[(e.Constant = 13)] = 'Constant'),
            (e[(e.String = 14)] = 'String'),
            (e[(e.Number = 15)] = 'Number'),
            (e[(e.Boolean = 16)] = 'Boolean'),
            (e[(e.Array = 17)] = 'Array'),
            (e[(e.Object = 18)] = 'Object'),
            (e[(e.Key = 19)] = 'Key'),
            (e[(e.Null = 20)] = 'Null'),
            (e[(e.EnumMember = 21)] = 'EnumMember'),
            (e[(e.Struct = 22)] = 'Struct'),
            (e[(e.Event = 23)] = 'Event'),
            (e[(e.Operator = 24)] = 'Operator'),
            (e[(e.TypeParameter = 25)] = 'TypeParameter');
        })(vr || (vr = {})),
        (function (e) {
          e[(e.Deprecated = 1)] = 'Deprecated';
        })(wr || (wr = {})),
        (function (e) {
          (e[(e.Hidden = 0)] = 'Hidden'),
            (e[(e.Blink = 1)] = 'Blink'),
            (e[(e.Smooth = 2)] = 'Smooth'),
            (e[(e.Phase = 3)] = 'Phase'),
            (e[(e.Expand = 4)] = 'Expand'),
            (e[(e.Solid = 5)] = 'Solid');
        })(Sr || (Sr = {})),
        (function (e) {
          (e[(e.Line = 1)] = 'Line'),
            (e[(e.Block = 2)] = 'Block'),
            (e[(e.Underline = 3)] = 'Underline'),
            (e[(e.LineThin = 4)] = 'LineThin'),
            (e[(e.BlockOutline = 5)] = 'BlockOutline'),
            (e[(e.UnderlineThin = 6)] = 'UnderlineThin');
        })(_r || (_r = {})),
        (function (e) {
          (e[(e.AlwaysGrowsWhenTypingAtEdges = 0)] =
            'AlwaysGrowsWhenTypingAtEdges'),
            (e[(e.NeverGrowsWhenTypingAtEdges = 1)] =
              'NeverGrowsWhenTypingAtEdges'),
            (e[(e.GrowsOnlyWhenTypingBefore = 2)] =
              'GrowsOnlyWhenTypingBefore'),
            (e[(e.GrowsOnlyWhenTypingAfter = 3)] = 'GrowsOnlyWhenTypingAfter');
        })(Cr || (Cr = {})),
        (function (e) {
          (e[(e.None = 0)] = 'None'),
            (e[(e.Same = 1)] = 'Same'),
            (e[(e.Indent = 2)] = 'Indent'),
            (e[(e.DeepIndent = 3)] = 'DeepIndent');
        })(Er || (Er = {}));
      class Ar {
        static chord(e, t) {
          return (function (e, t) {
            return (e | (((65535 & t) << 16) >>> 0)) >>> 0;
          })(e, t);
        }
      }
      (Ar.CtrlCmd = 2048),
        (Ar.Shift = 1024),
        (Ar.Alt = 512),
        (Ar.WinCtrl = 256);
      class xr extends Jt {
        constructor(e) {
          super(0);
          for (let t = 0, n = e.length; t < n; t++)
            this.set(e.charCodeAt(t), 2);
          this.set(32, 1), this.set(9, 1);
        }
      }
      !(function (e) {
        const t = {};
      })(e => new xr(e));
      var Nr, Lr, Or, kr;
      !(function (e) {
        (e[(e.Left = 1)] = 'Left'),
          (e[(e.Center = 2)] = 'Center'),
          (e[(e.Right = 4)] = 'Right'),
          (e[(e.Full = 7)] = 'Full');
      })(Nr || (Nr = {})),
        (function (e) {
          (e[(e.Left = 1)] = 'Left'),
            (e[(e.Center = 2)] = 'Center'),
            (e[(e.Right = 3)] = 'Right');
        })(Lr || (Lr = {})),
        (function (e) {
          (e[(e.Inline = 1)] = 'Inline'), (e[(e.Gutter = 2)] = 'Gutter');
        })(Or || (Or = {})),
        (function (e) {
          (e[(e.Both = 0)] = 'Both'),
            (e[(e.Right = 1)] = 'Right'),
            (e[(e.Left = 2)] = 'Left'),
            (e[(e.None = 3)] = 'None');
        })(kr || (kr = {}));
      function Rr(e, t, n, r, i) {
        return (
          (function (e, t, n, r, i) {
            if (0 === r) return !0;
            const o = t.charCodeAt(r - 1);
            if (0 !== e.get(o)) return !0;
            if (13 === o || 10 === o) return !0;
            if (i > 0) {
              const n = t.charCodeAt(r);
              if (0 !== e.get(n)) return !0;
            }
            return !1;
          })(e, t, 0, r, i) &&
          (function (e, t, n, r, i) {
            if (r + i === n) return !0;
            const o = t.charCodeAt(r + i);
            if (0 !== e.get(o)) return !0;
            if (13 === o || 10 === o) return !0;
            if (i > 0) {
              const n = t.charCodeAt(r + i - 1);
              if (0 !== e.get(n)) return !0;
            }
            return !1;
          })(e, t, n, r, i)
        );
      }
      class Tr {
        constructor(e, t) {
          (this._wordSeparators = e),
            (this._searchRegex = t),
            (this._prevMatchStartIndex = -1),
            (this._prevMatchLength = 0);
        }
        reset(e) {
          (this._searchRegex.lastIndex = e),
            (this._prevMatchStartIndex = -1),
            (this._prevMatchLength = 0);
        }
        next(e) {
          const t = e.length;
          let n;
          do {
            if (this._prevMatchStartIndex + this._prevMatchLength === t)
              return null;
            if (((n = this._searchRegex.exec(e)), !n)) return null;
            const r = n.index,
              i = n[0].length;
            if (
              r === this._prevMatchStartIndex &&
              i === this._prevMatchLength
            ) {
              if (0 === i) {
                ve(e, t, this._searchRegex.lastIndex) > 65535
                  ? (this._searchRegex.lastIndex += 2)
                  : (this._searchRegex.lastIndex += 1);
                continue;
              }
              return null;
            }
            if (
              ((this._prevMatchStartIndex = r),
              (this._prevMatchLength = i),
              !this._wordSeparators || Rr(this._wordSeparators, e, t, r, i))
            )
              return n;
          } while (n);
          return null;
        }
      }
      function Mr(e, t = 'Unreachable') {
        throw new Error(t);
      }
      function Pr(e) {
        e() || (e(), t(new l('Assertion Failed')));
      }
      function Ir(e, t) {
        let n = 0;
        for (; n < e.length - 1; ) {
          if (!t(e[n], e[n + 1])) return !1;
          n++;
        }
        return !0;
      }
      class jr {
        static computeUnicodeHighlights(e, t, n) {
          const r = n ? n.startLineNumber : 1,
            i = n ? n.endLineNumber : e.getLineCount(),
            o = new Fr(t),
            s = o.getCandidateCodePoints();
          let a;
          a =
            'allNonBasicAscii' === s
              ? new RegExp('[^\\t\\n\\r\\x20-\\x7E]', 'g')
              : new RegExp(
                  '' +
                    `[${ge(
                      Array.from(s)
                        .map(e => String.fromCodePoint(e))
                        .join(''),
                    )}]`,
                  'g',
                );
          const l = new Tr(null, a),
            u = [];
          let c,
            h = !1,
            f = 0,
            d = 0,
            g = 0;
          e: for (let t = r, n = i; t <= n; t++) {
            const n = e.getLineContent(t),
              r = n.length;
            l.reset(0);
            do {
              if (((c = l.next(n)), c)) {
                let e = c.index,
                  i = c.index + c[0].length;
                if (e > 0) {
                  pe(n.charCodeAt(e - 1)) && e--;
                }
                if (i + 1 < r) {
                  pe(n.charCodeAt(i - 1)) && i++;
                }
                const s = n.substring(e, i);
                let a = Ht(e + 1, $t, n, 0);
                a && a.endColumn <= e + 1 && (a = null);
                const l = o.shouldHighlightNonBasicASCII(s, a ? a.word : null);
                if (0 !== l) {
                  3 === l ? f++ : 2 === l ? d++ : 1 === l ? g++ : Mr();
                  const n = 1e3;
                  if (u.length >= n) {
                    h = !0;
                    break e;
                  }
                  u.push(new Pt(t, e + 1, t, i + 1));
                }
              }
            } while (c);
          }
          return {
            ranges: u,
            hasMore: h,
            ambiguousCharacterCount: f,
            invisibleCharacterCount: d,
            nonBasicAsciiCharacterCount: g,
          };
        }
        static computeUnicodeHighlightReason(e, t) {
          const n = new Fr(t);
          switch (n.shouldHighlightNonBasicASCII(e, null)) {
            case 0:
              return null;
            case 2:
              return { kind: 1 };
            case 3: {
              const r = e.codePointAt(0),
                i = n.ambiguousCharacters.getPrimaryConfusable(r),
                o = _e
                  .getLocales()
                  .filter(
                    e =>
                      !_e
                        .getInstance(new Set([...t.allowedLocales, e]))
                        .isAmbiguous(r),
                  );
              return {
                kind: 0,
                confusableWith: String.fromCodePoint(i),
                notAmbiguousInLocales: o,
              };
            }
            case 1:
              return { kind: 2 };
          }
        }
      }
      class Fr {
        constructor(e) {
          (this.options = e),
            (this.allowedCodePoints = new Set(e.allowedCodePoints)),
            (this.ambiguousCharacters = _e.getInstance(
              new Set(e.allowedLocales),
            ));
        }
        getCandidateCodePoints() {
          if (this.options.nonBasicASCII) return 'allNonBasicAscii';
          const e = new Set();
          if (this.options.invisibleCharacters)
            for (const t of Ce.codePoints)
              Dr(String.fromCodePoint(t)) || e.add(t);
          if (this.options.ambiguousCharacters)
            for (const t of this.ambiguousCharacters.getConfusableCodePoints())
              e.add(t);
          for (const t of this.allowedCodePoints) e.delete(t);
          return e;
        }
        shouldHighlightNonBasicASCII(e, t) {
          const n = e.codePointAt(0);
          if (this.allowedCodePoints.has(n)) return 0;
          if (this.options.nonBasicASCII) return 1;
          let r = !1,
            i = !1;
          if (t)
            for (const e of t) {
              const t = e.codePointAt(0),
                n = ((o = e), we.test(o));
              (r = r || n),
                n ||
                  this.ambiguousCharacters.isAmbiguous(t) ||
                  Ce.isInvisibleCharacter(t) ||
                  (i = !0);
            }
          var o;
          return !r && i
            ? 0
            : this.options.invisibleCharacters &&
              !Dr(e) &&
              Ce.isInvisibleCharacter(n)
            ? 2
            : this.options.ambiguousCharacters &&
              this.ambiguousCharacters.isAmbiguous(n)
            ? 3
            : 0;
        }
      }
      function Dr(e) {
        return ' ' === e || '\n' === e || '\t' === e;
      }
      class Vr {
        constructor(e, t, n) {
          (this.changes = e), (this.moves = t), (this.hitTimeout = n);
        }
      }
      class qr {
        constructor(e, t) {
          (this.lineRangeMapping = e), (this.changes = t);
        }
      }
      class Ur {
        static addRange(e, t) {
          let n = 0;
          for (; n < t.length && t[n].endExclusive < e.start; ) n++;
          let r = n;
          for (; r < t.length && t[r].start <= e.endExclusive; ) r++;
          if (n === r) t.splice(n, 0, e);
          else {
            const i = Math.min(e.start, t[n].start),
              o = Math.max(e.endExclusive, t[r - 1].endExclusive);
            t.splice(n, r - n, new Ur(i, o));
          }
        }
        static ofLength(e) {
          return new Ur(0, e);
        }
        static ofStartAndLength(e, t) {
          return new Ur(e, e + t);
        }
        constructor(e, t) {
          if (((this.start = e), (this.endExclusive = t), e > t))
            throw new l(`Invalid range: ${this.toString()}`);
        }
        get isEmpty() {
          return this.start === this.endExclusive;
        }
        delta(e) {
          return new Ur(this.start + e, this.endExclusive + e);
        }
        deltaStart(e) {
          return new Ur(this.start + e, this.endExclusive);
        }
        deltaEnd(e) {
          return new Ur(this.start, this.endExclusive + e);
        }
        get length() {
          return this.endExclusive - this.start;
        }
        toString() {
          return `[${this.start}, ${this.endExclusive})`;
        }
        contains(e) {
          return this.start <= e && e < this.endExclusive;
        }
        join(e) {
          return new Ur(
            Math.min(this.start, e.start),
            Math.max(this.endExclusive, e.endExclusive),
          );
        }
        intersect(e) {
          const t = Math.max(this.start, e.start),
            n = Math.min(this.endExclusive, e.endExclusive);
          if (t <= n) return new Ur(t, n);
        }
        intersects(e) {
          return (
            Math.max(this.start, e.start) <
            Math.min(this.endExclusive, e.endExclusive)
          );
        }
        isBefore(e) {
          return this.endExclusive <= e.start;
        }
        isAfter(e) {
          return this.start >= e.endExclusive;
        }
        slice(e) {
          return e.slice(this.start, this.endExclusive);
        }
        clip(e) {
          if (this.isEmpty)
            throw new l(`Invalid clipping range: ${this.toString()}`);
          return Math.max(this.start, Math.min(this.endExclusive - 1, e));
        }
        clipCyclic(e) {
          if (this.isEmpty)
            throw new l(`Invalid clipping range: ${this.toString()}`);
          return e < this.start
            ? this.endExclusive - ((this.start - e) % this.length)
            : e >= this.endExclusive
            ? this.start + ((e - this.start) % this.length)
            : e;
        }
        forEach(e) {
          for (let t = this.start; t < this.endExclusive; t++) e(t);
        }
      }
      function Br(e, t) {
        const n = Kr(e, t);
        return -1 === n ? void 0 : e[n];
      }
      function Kr(e, t, n = 0, r = e.length) {
        let i = n,
          o = r;
        for (; i < o; ) {
          const n = Math.floor((i + o) / 2);
          t(e[n]) ? (i = n + 1) : (o = n);
        }
        return i - 1;
      }
      function $r(e, t, n = 0, r = e.length) {
        let i = n,
          o = r;
        for (; i < o; ) {
          const n = Math.floor((i + o) / 2);
          t(e[n]) ? (o = n) : (i = n + 1);
        }
        return i;
      }
      class Wr {
        constructor(e) {
          (this._array = e), (this._findLastMonotonousLastIdx = 0);
        }
        findLastMonotonous(e) {
          if (Wr.assertInvariants) {
            if (this._prevFindLastPredicate)
              for (const t of this._array)
                if (this._prevFindLastPredicate(t) && !e(t))
                  throw new Error(
                    'MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.',
                  );
            this._prevFindLastPredicate = e;
          }
          const t = Kr(this._array, e, this._findLastMonotonousLastIdx);
          return (
            (this._findLastMonotonousLastIdx = t + 1),
            -1 === t ? void 0 : this._array[t]
          );
        }
      }
      Wr.assertInvariants = !1;
      class zr {
        static fromRangeInclusive(e) {
          return new zr(e.startLineNumber, e.endLineNumber + 1);
        }
        static joinMany(e) {
          if (0 === e.length) return [];
          let t = new Hr(e[0].slice());
          for (let n = 1; n < e.length; n++)
            t = t.getUnion(new Hr(e[n].slice()));
          return t.ranges;
        }
        static ofLength(e, t) {
          return new zr(e, e + t);
        }
        static deserialize(e) {
          return new zr(e[0], e[1]);
        }
        constructor(e, t) {
          if (e > t)
            throw new l(
              `startLineNumber ${e} cannot be after endLineNumberExclusive ${t}`,
            );
          (this.startLineNumber = e), (this.endLineNumberExclusive = t);
        }
        contains(e) {
          return this.startLineNumber <= e && e < this.endLineNumberExclusive;
        }
        get isEmpty() {
          return this.startLineNumber === this.endLineNumberExclusive;
        }
        delta(e) {
          return new zr(
            this.startLineNumber + e,
            this.endLineNumberExclusive + e,
          );
        }
        deltaLength(e) {
          return new zr(this.startLineNumber, this.endLineNumberExclusive + e);
        }
        get length() {
          return this.endLineNumberExclusive - this.startLineNumber;
        }
        join(e) {
          return new zr(
            Math.min(this.startLineNumber, e.startLineNumber),
            Math.max(this.endLineNumberExclusive, e.endLineNumberExclusive),
          );
        }
        toString() {
          return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
        }
        intersect(e) {
          const t = Math.max(this.startLineNumber, e.startLineNumber),
            n = Math.min(this.endLineNumberExclusive, e.endLineNumberExclusive);
          if (t <= n) return new zr(t, n);
        }
        intersectsStrict(e) {
          return (
            this.startLineNumber < e.endLineNumberExclusive &&
            e.startLineNumber < this.endLineNumberExclusive
          );
        }
        overlapOrTouch(e) {
          return (
            this.startLineNumber <= e.endLineNumberExclusive &&
            e.startLineNumber <= this.endLineNumberExclusive
          );
        }
        equals(e) {
          return (
            this.startLineNumber === e.startLineNumber &&
            this.endLineNumberExclusive === e.endLineNumberExclusive
          );
        }
        toInclusiveRange() {
          return this.isEmpty
            ? null
            : new Pt(
                this.startLineNumber,
                1,
                this.endLineNumberExclusive - 1,
                Number.MAX_SAFE_INTEGER,
              );
        }
        toExclusiveRange() {
          return new Pt(
            this.startLineNumber,
            1,
            this.endLineNumberExclusive,
            1,
          );
        }
        mapToLineArray(e) {
          const t = [];
          for (
            let n = this.startLineNumber;
            n < this.endLineNumberExclusive;
            n++
          )
            t.push(e(n));
          return t;
        }
        forEach(e) {
          for (
            let t = this.startLineNumber;
            t < this.endLineNumberExclusive;
            t++
          )
            e(t);
        }
        serialize() {
          return [this.startLineNumber, this.endLineNumberExclusive];
        }
        includes(e) {
          return this.startLineNumber <= e && e < this.endLineNumberExclusive;
        }
        toOffsetRange() {
          return new Ur(
            this.startLineNumber - 1,
            this.endLineNumberExclusive - 1,
          );
        }
      }
      class Hr {
        constructor(e = []) {
          this._normalizedRanges = e;
        }
        get ranges() {
          return this._normalizedRanges;
        }
        addRange(e) {
          if (0 === e.length) return;
          const t = $r(
              this._normalizedRanges,
              t => t.endLineNumberExclusive >= e.startLineNumber,
            ),
            n =
              Kr(
                this._normalizedRanges,
                t => t.startLineNumber <= e.endLineNumberExclusive,
              ) + 1;
          if (t === n) this._normalizedRanges.splice(t, 0, e);
          else if (t === n - 1) {
            const n = this._normalizedRanges[t];
            this._normalizedRanges[t] = n.join(e);
          } else {
            const r = this._normalizedRanges[t]
              .join(this._normalizedRanges[n - 1])
              .join(e);
            this._normalizedRanges.splice(t, n - t, r);
          }
        }
        contains(e) {
          const t = Br(this._normalizedRanges, t => t.startLineNumber <= e);
          return !!t && t.endLineNumberExclusive > e;
        }
        intersects(e) {
          const t = Br(
            this._normalizedRanges,
            t => t.startLineNumber < e.endLineNumberExclusive,
          );
          return !!t && t.endLineNumberExclusive > e.startLineNumber;
        }
        getUnion(e) {
          if (0 === this._normalizedRanges.length) return e;
          if (0 === e._normalizedRanges.length) return this;
          const t = [];
          let n = 0,
            r = 0,
            i = null;
          for (
            ;
            n < this._normalizedRanges.length || r < e._normalizedRanges.length;

          ) {
            let o = null;
            if (
              n < this._normalizedRanges.length &&
              r < e._normalizedRanges.length
            ) {
              const t = this._normalizedRanges[n],
                i = e._normalizedRanges[r];
              t.startLineNumber < i.startLineNumber
                ? ((o = t), n++)
                : ((o = i), r++);
            } else
              n < this._normalizedRanges.length
                ? ((o = this._normalizedRanges[n]), n++)
                : ((o = e._normalizedRanges[r]), r++);
            null === i
              ? (i = o)
              : i.endLineNumberExclusive >= o.startLineNumber
              ? (i = new zr(
                  i.startLineNumber,
                  Math.max(i.endLineNumberExclusive, o.endLineNumberExclusive),
                ))
              : (t.push(i), (i = o));
          }
          return null !== i && t.push(i), new Hr(t);
        }
        subtractFrom(e) {
          const t = $r(
              this._normalizedRanges,
              t => t.endLineNumberExclusive >= e.startLineNumber,
            ),
            n =
              Kr(
                this._normalizedRanges,
                t => t.startLineNumber <= e.endLineNumberExclusive,
              ) + 1;
          if (t === n) return new Hr([e]);
          const r = [];
          let i = e.startLineNumber;
          for (let e = t; e < n; e++) {
            const t = this._normalizedRanges[e];
            t.startLineNumber > i && r.push(new zr(i, t.startLineNumber)),
              (i = t.endLineNumberExclusive);
          }
          return (
            i < e.endLineNumberExclusive &&
              r.push(new zr(i, e.endLineNumberExclusive)),
            new Hr(r)
          );
        }
        toString() {
          return this._normalizedRanges.map(e => e.toString()).join(', ');
        }
        getIntersection(e) {
          const t = [];
          let n = 0,
            r = 0;
          for (
            ;
            n < this._normalizedRanges.length && r < e._normalizedRanges.length;

          ) {
            const i = this._normalizedRanges[n],
              o = e._normalizedRanges[r],
              s = i.intersect(o);
            s && !s.isEmpty && t.push(s),
              i.endLineNumberExclusive < o.endLineNumberExclusive ? n++ : r++;
          }
          return new Hr(t);
        }
        getWithDelta(e) {
          return new Hr(this._normalizedRanges.map(t => t.delta(e)));
        }
      }
      class Gr {
        static inverse(e, t, n) {
          const r = [];
          let i = 1,
            o = 1;
          for (const t of e) {
            const e = new Gr(
              new zr(i, t.original.startLineNumber),
              new zr(o, t.modified.startLineNumber),
            );
            e.modified.isEmpty || r.push(e),
              (i = t.original.endLineNumberExclusive),
              (o = t.modified.endLineNumberExclusive);
          }
          const s = new Gr(new zr(i, t + 1), new zr(o, n + 1));
          return s.modified.isEmpty || r.push(s), r;
        }
        static clip(e, t, n) {
          const r = [];
          for (const i of e) {
            const e = i.original.intersect(t),
              o = i.modified.intersect(n);
            e && !e.isEmpty && o && !o.isEmpty && r.push(new Gr(e, o));
          }
          return r;
        }
        constructor(e, t) {
          (this.original = e), (this.modified = t);
        }
        toString() {
          return `{${this.original.toString()}->${this.modified.toString()}}`;
        }
        flip() {
          return new Gr(this.modified, this.original);
        }
        join(e) {
          return new Gr(
            this.original.join(e.original),
            this.modified.join(e.modified),
          );
        }
      }
      class Jr extends Gr {
        constructor(e, t, n) {
          super(e, t), (this.innerChanges = n);
        }
        flip() {
          var e;
          return new Jr(
            this.modified,
            this.original,
            null === (e = this.innerChanges) || void 0 === e
              ? void 0
              : e.map(e => e.flip()),
          );
        }
      }
      class Xr {
        constructor(e, t) {
          (this.originalRange = e), (this.modifiedRange = t);
        }
        toString() {
          return `{${this.originalRange.toString()}->${this.modifiedRange.toString()}}`;
        }
        flip() {
          return new Xr(this.modifiedRange, this.originalRange);
        }
      }
      class Qr {
        computeDiff(e, t, n) {
          var r;
          const i = new ri(e, t, {
              maxComputationTime: n.maxComputationTimeMs,
              shouldIgnoreTrimWhitespace: n.ignoreTrimWhitespace,
              shouldComputeCharChanges: !0,
              shouldMakePrettyDiff: !0,
              shouldPostProcessCharChanges: !0,
            }).computeDiff(),
            o = [];
          let s = null;
          for (const e of i.changes) {
            let t, n;
            (t =
              0 === e.originalEndLineNumber
                ? new zr(
                    e.originalStartLineNumber + 1,
                    e.originalStartLineNumber + 1,
                  )
                : new zr(
                    e.originalStartLineNumber,
                    e.originalEndLineNumber + 1,
                  )),
              (n =
                0 === e.modifiedEndLineNumber
                  ? new zr(
                      e.modifiedStartLineNumber + 1,
                      e.modifiedStartLineNumber + 1,
                    )
                  : new zr(
                      e.modifiedStartLineNumber,
                      e.modifiedEndLineNumber + 1,
                    ));
            let i = new Jr(
              t,
              n,
              null === (r = e.charChanges) || void 0 === r
                ? void 0
                : r.map(
                    e =>
                      new Xr(
                        new Pt(
                          e.originalStartLineNumber,
                          e.originalStartColumn,
                          e.originalEndLineNumber,
                          e.originalEndColumn,
                        ),
                        new Pt(
                          e.modifiedStartLineNumber,
                          e.modifiedStartColumn,
                          e.modifiedEndLineNumber,
                          e.modifiedEndColumn,
                        ),
                      ),
                  ),
            );
            s &&
              ((s.modified.endLineNumberExclusive !==
                i.modified.startLineNumber &&
                s.original.endLineNumberExclusive !==
                  i.original.startLineNumber) ||
                ((i = new Jr(
                  s.original.join(i.original),
                  s.modified.join(i.modified),
                  s.innerChanges && i.innerChanges
                    ? s.innerChanges.concat(i.innerChanges)
                    : void 0,
                )),
                o.pop())),
              o.push(i),
              (s = i);
          }
          return (
            Pr(() =>
              Ir(
                o,
                (e, t) =>
                  t.original.startLineNumber -
                    e.original.endLineNumberExclusive ==
                    t.modified.startLineNumber -
                      e.modified.endLineNumberExclusive &&
                  e.original.endLineNumberExclusive <
                    t.original.startLineNumber &&
                  e.modified.endLineNumberExclusive <
                    t.modified.startLineNumber,
              ),
            ),
            new Vr(o, [], i.quitEarly)
          );
        }
      }
      function Yr(e, t, n, r) {
        return new Ge(e, t, n).ComputeDiff(r);
      }
      class Zr {
        constructor(e) {
          const t = [],
            n = [];
          for (let r = 0, i = e.length; r < i; r++)
            (t[r] = ii(e[r], 1)), (n[r] = oi(e[r], 1));
          (this.lines = e), (this._startColumns = t), (this._endColumns = n);
        }
        getElements() {
          const e = [];
          for (let t = 0, n = this.lines.length; t < n; t++)
            e[t] = this.lines[t].substring(
              this._startColumns[t] - 1,
              this._endColumns[t] - 1,
            );
          return e;
        }
        getStrictElement(e) {
          return this.lines[e];
        }
        getStartLineNumber(e) {
          return e + 1;
        }
        getEndLineNumber(e) {
          return e + 1;
        }
        createCharSequence(e, t, n) {
          const r = [],
            i = [],
            o = [];
          let s = 0;
          for (let a = t; a <= n; a++) {
            const t = this.lines[a],
              l = e ? this._startColumns[a] : 1,
              u = e ? this._endColumns[a] : t.length + 1;
            for (let e = l; e < u; e++)
              (r[s] = t.charCodeAt(e - 1)), (i[s] = a + 1), (o[s] = e), s++;
            !e &&
              a < n &&
              ((r[s] = 10), (i[s] = a + 1), (o[s] = t.length + 1), s++);
          }
          return new ei(r, i, o);
        }
      }
      class ei {
        constructor(e, t, n) {
          (this._charCodes = e), (this._lineNumbers = t), (this._columns = n);
        }
        toString() {
          return (
            '[' +
            this._charCodes
              .map(
                (e, t) =>
                  (10 === e ? '\\n' : String.fromCharCode(e)) +
                  `-(${this._lineNumbers[t]},${this._columns[t]})`,
              )
              .join(', ') +
            ']'
          );
        }
        _assertIndex(e, t) {
          if (e < 0 || e >= t.length) throw new Error('Illegal index');
        }
        getElements() {
          return this._charCodes;
        }
        getStartLineNumber(e) {
          return e > 0 && e === this._lineNumbers.length
            ? this.getEndLineNumber(e - 1)
            : (this._assertIndex(e, this._lineNumbers), this._lineNumbers[e]);
        }
        getEndLineNumber(e) {
          return -1 === e
            ? this.getStartLineNumber(e + 1)
            : (this._assertIndex(e, this._lineNumbers),
              10 === this._charCodes[e]
                ? this._lineNumbers[e] + 1
                : this._lineNumbers[e]);
        }
        getStartColumn(e) {
          return e > 0 && e === this._columns.length
            ? this.getEndColumn(e - 1)
            : (this._assertIndex(e, this._columns), this._columns[e]);
        }
        getEndColumn(e) {
          return -1 === e
            ? this.getStartColumn(e + 1)
            : (this._assertIndex(e, this._columns),
              10 === this._charCodes[e] ? 1 : this._columns[e] + 1);
        }
      }
      class ti {
        constructor(e, t, n, r, i, o, s, a) {
          (this.originalStartLineNumber = e),
            (this.originalStartColumn = t),
            (this.originalEndLineNumber = n),
            (this.originalEndColumn = r),
            (this.modifiedStartLineNumber = i),
            (this.modifiedStartColumn = o),
            (this.modifiedEndLineNumber = s),
            (this.modifiedEndColumn = a);
        }
        static createFromDiffChange(e, t, n) {
          const r = t.getStartLineNumber(e.originalStart),
            i = t.getStartColumn(e.originalStart),
            o = t.getEndLineNumber(e.originalStart + e.originalLength - 1),
            s = t.getEndColumn(e.originalStart + e.originalLength - 1),
            a = n.getStartLineNumber(e.modifiedStart),
            l = n.getStartColumn(e.modifiedStart),
            u = n.getEndLineNumber(e.modifiedStart + e.modifiedLength - 1),
            c = n.getEndColumn(e.modifiedStart + e.modifiedLength - 1);
          return new ti(r, i, o, s, a, l, u, c);
        }
      }
      class ni {
        constructor(e, t, n, r, i) {
          (this.originalStartLineNumber = e),
            (this.originalEndLineNumber = t),
            (this.modifiedStartLineNumber = n),
            (this.modifiedEndLineNumber = r),
            (this.charChanges = i);
        }
        static createFromDiffResult(e, t, n, r, i, o, s) {
          let a, l, u, c, h;
          if (
            (0 === t.originalLength
              ? ((a = n.getStartLineNumber(t.originalStart) - 1), (l = 0))
              : ((a = n.getStartLineNumber(t.originalStart)),
                (l = n.getEndLineNumber(
                  t.originalStart + t.originalLength - 1,
                ))),
            0 === t.modifiedLength
              ? ((u = r.getStartLineNumber(t.modifiedStart) - 1), (c = 0))
              : ((u = r.getStartLineNumber(t.modifiedStart)),
                (c = r.getEndLineNumber(
                  t.modifiedStart + t.modifiedLength - 1,
                ))),
            o &&
              t.originalLength > 0 &&
              t.originalLength < 20 &&
              t.modifiedLength > 0 &&
              t.modifiedLength < 20 &&
              i())
          ) {
            const o = n.createCharSequence(
                e,
                t.originalStart,
                t.originalStart + t.originalLength - 1,
              ),
              a = r.createCharSequence(
                e,
                t.modifiedStart,
                t.modifiedStart + t.modifiedLength - 1,
              );
            if (o.getElements().length > 0 && a.getElements().length > 0) {
              let e = Yr(o, a, i, !0).changes;
              s &&
                (e = (function (e) {
                  if (e.length <= 1) return e;
                  const t = [e[0]];
                  let n = t[0];
                  for (let r = 1, i = e.length; r < i; r++) {
                    const i = e[r],
                      o =
                        i.originalStart - (n.originalStart + n.originalLength),
                      s =
                        i.modifiedStart - (n.modifiedStart + n.modifiedLength);
                    Math.min(o, s) < 3
                      ? ((n.originalLength =
                          i.originalStart + i.originalLength - n.originalStart),
                        (n.modifiedLength =
                          i.modifiedStart + i.modifiedLength - n.modifiedStart))
                      : (t.push(i), (n = i));
                  }
                  return t;
                })(e)),
                (h = []);
              for (let t = 0, n = e.length; t < n; t++)
                h.push(ti.createFromDiffChange(e[t], o, a));
            }
          }
          return new ni(a, l, u, c, h);
        }
      }
      class ri {
        constructor(e, t, n) {
          (this.shouldComputeCharChanges = n.shouldComputeCharChanges),
            (this.shouldPostProcessCharChanges =
              n.shouldPostProcessCharChanges),
            (this.shouldIgnoreTrimWhitespace = n.shouldIgnoreTrimWhitespace),
            (this.shouldMakePrettyDiff = n.shouldMakePrettyDiff),
            (this.originalLines = e),
            (this.modifiedLines = t),
            (this.original = new Zr(e)),
            (this.modified = new Zr(t)),
            (this.continueLineDiff = si(n.maxComputationTime)),
            (this.continueCharDiff = si(
              0 === n.maxComputationTime
                ? 0
                : Math.min(n.maxComputationTime, 5e3),
            ));
        }
        computeDiff() {
          if (
            1 === this.original.lines.length &&
            0 === this.original.lines[0].length
          )
            return 1 === this.modified.lines.length &&
              0 === this.modified.lines[0].length
              ? { quitEarly: !1, changes: [] }
              : {
                  quitEarly: !1,
                  changes: [
                    {
                      originalStartLineNumber: 1,
                      originalEndLineNumber: 1,
                      modifiedStartLineNumber: 1,
                      modifiedEndLineNumber: this.modified.lines.length,
                      charChanges: void 0,
                    },
                  ],
                };
          if (
            1 === this.modified.lines.length &&
            0 === this.modified.lines[0].length
          )
            return {
              quitEarly: !1,
              changes: [
                {
                  originalStartLineNumber: 1,
                  originalEndLineNumber: this.original.lines.length,
                  modifiedStartLineNumber: 1,
                  modifiedEndLineNumber: 1,
                  charChanges: void 0,
                },
              ],
            };
          const e = Yr(
              this.original,
              this.modified,
              this.continueLineDiff,
              this.shouldMakePrettyDiff,
            ),
            t = e.changes,
            n = e.quitEarly;
          if (this.shouldIgnoreTrimWhitespace) {
            const e = [];
            for (let n = 0, r = t.length; n < r; n++)
              e.push(
                ni.createFromDiffResult(
                  this.shouldIgnoreTrimWhitespace,
                  t[n],
                  this.original,
                  this.modified,
                  this.continueCharDiff,
                  this.shouldComputeCharChanges,
                  this.shouldPostProcessCharChanges,
                ),
              );
            return { quitEarly: n, changes: e };
          }
          const r = [];
          let i = 0,
            o = 0;
          for (let e = -1, n = t.length; e < n; e++) {
            const s = e + 1 < n ? t[e + 1] : null,
              a = s ? s.originalStart : this.originalLines.length,
              l = s ? s.modifiedStart : this.modifiedLines.length;
            for (; i < a && o < l; ) {
              const e = this.originalLines[i],
                t = this.modifiedLines[o];
              if (e !== t) {
                {
                  let n = ii(e, 1),
                    s = ii(t, 1);
                  for (; n > 1 && s > 1; ) {
                    if (e.charCodeAt(n - 2) !== t.charCodeAt(s - 2)) break;
                    n--, s--;
                  }
                  (n > 1 || s > 1) &&
                    this._pushTrimWhitespaceCharChange(
                      r,
                      i + 1,
                      1,
                      n,
                      o + 1,
                      1,
                      s,
                    );
                }
                {
                  let n = oi(e, 1),
                    s = oi(t, 1);
                  const a = e.length + 1,
                    l = t.length + 1;
                  for (; n < a && s < l; ) {
                    if (e.charCodeAt(n - 1) !== e.charCodeAt(s - 1)) break;
                    n++, s++;
                  }
                  (n < a || s < l) &&
                    this._pushTrimWhitespaceCharChange(
                      r,
                      i + 1,
                      n,
                      a,
                      o + 1,
                      s,
                      l,
                    );
                }
              }
              i++, o++;
            }
            s &&
              (r.push(
                ni.createFromDiffResult(
                  this.shouldIgnoreTrimWhitespace,
                  s,
                  this.original,
                  this.modified,
                  this.continueCharDiff,
                  this.shouldComputeCharChanges,
                  this.shouldPostProcessCharChanges,
                ),
              ),
              (i += s.originalLength),
              (o += s.modifiedLength));
          }
          return { quitEarly: n, changes: r };
        }
        _pushTrimWhitespaceCharChange(e, t, n, r, i, o, s) {
          if (this._mergeTrimWhitespaceCharChange(e, t, n, r, i, o, s)) return;
          let a;
          this.shouldComputeCharChanges &&
            (a = [new ti(t, n, t, r, i, o, i, s)]),
            e.push(new ni(t, t, i, i, a));
        }
        _mergeTrimWhitespaceCharChange(e, t, n, r, i, o, s) {
          const a = e.length;
          if (0 === a) return !1;
          const l = e[a - 1];
          return (
            0 !== l.originalEndLineNumber &&
            0 !== l.modifiedEndLineNumber &&
            (l.originalEndLineNumber === t && l.modifiedEndLineNumber === i
              ? (this.shouldComputeCharChanges &&
                  l.charChanges &&
                  l.charChanges.push(new ti(t, n, t, r, i, o, i, s)),
                !0)
              : l.originalEndLineNumber + 1 === t &&
                l.modifiedEndLineNumber + 1 === i &&
                ((l.originalEndLineNumber = t),
                (l.modifiedEndLineNumber = i),
                this.shouldComputeCharChanges &&
                  l.charChanges &&
                  l.charChanges.push(new ti(t, n, t, r, i, o, i, s)),
                !0))
          );
        }
      }
      function ii(e, t) {
        const n = (function (e) {
          for (let t = 0, n = e.length; t < n; t++) {
            const n = e.charCodeAt(t);
            if (32 !== n && 9 !== n) return t;
          }
          return -1;
        })(e);
        return -1 === n ? t : n + 1;
      }
      function oi(e, t) {
        const n = (function (e, t = e.length - 1) {
          for (let n = t; n >= 0; n--) {
            const t = e.charCodeAt(n);
            if (32 !== t && 9 !== t) return n;
          }
          return -1;
        })(e);
        return -1 === n ? t : n + 2;
      }
      function si(e) {
        if (0 === e) return () => !0;
        const t = Date.now();
        return () => Date.now() - t < e;
      }
      class ai {
        static trivial(e, t) {
          return new ai(
            [new li(Ur.ofLength(e.length), Ur.ofLength(t.length))],
            !1,
          );
        }
        static trivialTimedOut(e, t) {
          return new ai(
            [new li(Ur.ofLength(e.length), Ur.ofLength(t.length))],
            !0,
          );
        }
        constructor(e, t) {
          (this.diffs = e), (this.hitTimeout = t);
        }
      }
      class li {
        static invert(e, t) {
          const n = [];
          return (
            (function (e, t) {
              for (let n = 0; n <= e.length; n++)
                t(0 === n ? void 0 : e[n - 1], n === e.length ? void 0 : e[n]);
            })(e, (e, r) => {
              n.push(
                li.fromOffsetPairs(
                  e ? e.getEndExclusives() : ui.zero,
                  r
                    ? r.getStarts()
                    : new ui(
                        t,
                        (e
                          ? e.seq2Range.endExclusive - e.seq1Range.endExclusive
                          : 0) + t,
                      ),
                ),
              );
            }),
            n
          );
        }
        static fromOffsetPairs(e, t) {
          return new li(
            new Ur(e.offset1, t.offset1),
            new Ur(e.offset2, t.offset2),
          );
        }
        constructor(e, t) {
          (this.seq1Range = e), (this.seq2Range = t);
        }
        swap() {
          return new li(this.seq2Range, this.seq1Range);
        }
        toString() {
          return `${this.seq1Range} <-> ${this.seq2Range}`;
        }
        join(e) {
          return new li(
            this.seq1Range.join(e.seq1Range),
            this.seq2Range.join(e.seq2Range),
          );
        }
        delta(e) {
          return 0 === e
            ? this
            : new li(this.seq1Range.delta(e), this.seq2Range.delta(e));
        }
        deltaStart(e) {
          return 0 === e
            ? this
            : new li(
                this.seq1Range.deltaStart(e),
                this.seq2Range.deltaStart(e),
              );
        }
        deltaEnd(e) {
          return 0 === e
            ? this
            : new li(this.seq1Range.deltaEnd(e), this.seq2Range.deltaEnd(e));
        }
        intersect(e) {
          const t = this.seq1Range.intersect(e.seq1Range),
            n = this.seq2Range.intersect(e.seq2Range);
          if (t && n) return new li(t, n);
        }
        getStarts() {
          return new ui(this.seq1Range.start, this.seq2Range.start);
        }
        getEndExclusives() {
          return new ui(
            this.seq1Range.endExclusive,
            this.seq2Range.endExclusive,
          );
        }
      }
      class ui {
        constructor(e, t) {
          (this.offset1 = e), (this.offset2 = t);
        }
        toString() {
          return `${this.offset1} <-> ${this.offset2}`;
        }
        delta(e) {
          return 0 === e ? this : new ui(this.offset1 + e, this.offset2 + e);
        }
        equals(e) {
          return this.offset1 === e.offset1 && this.offset2 === e.offset2;
        }
      }
      (ui.zero = new ui(0, 0)),
        (ui.max = new ui(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
      class ci {
        isValid() {
          return !0;
        }
      }
      ci.instance = new ci();
      class hi {
        constructor(e) {
          if (
            ((this.timeout = e),
            (this.startTime = Date.now()),
            (this.valid = !0),
            e <= 0)
          )
            throw new l('timeout must be positive');
        }
        isValid() {
          return (
            !(Date.now() - this.startTime < this.timeout) &&
              this.valid &&
              (this.valid = !1),
            this.valid
          );
        }
      }
      class fi {
        constructor(e, t) {
          (this.width = e),
            (this.height = t),
            (this.array = []),
            (this.array = new Array(e * t));
        }
        get(e, t) {
          return this.array[e + t * this.width];
        }
        set(e, t, n) {
          this.array[e + t * this.width] = n;
        }
      }
      function di(e) {
        return 32 === e || 9 === e;
      }
      class gi {
        static getKey(e) {
          let t = this.chrKeys.get(e);
          return (
            void 0 === t && ((t = this.chrKeys.size), this.chrKeys.set(e, t)), t
          );
        }
        constructor(e, t, n) {
          (this.range = e),
            (this.lines = t),
            (this.source = n),
            (this.histogram = []);
          let r = 0;
          for (
            let n = e.startLineNumber - 1;
            n < e.endLineNumberExclusive - 1;
            n++
          ) {
            const e = t[n];
            for (let t = 0; t < e.length; t++) {
              r++;
              const n = e[t],
                i = gi.getKey(n);
              this.histogram[i] = (this.histogram[i] || 0) + 1;
            }
            r++;
            const i = gi.getKey('\n');
            this.histogram[i] = (this.histogram[i] || 0) + 1;
          }
          this.totalCount = r;
        }
        computeSimilarity(e) {
          var t, n;
          let r = 0;
          const i = Math.max(this.histogram.length, e.histogram.length);
          for (let o = 0; o < i; o++)
            r += Math.abs(
              (null !== (t = this.histogram[o]) && void 0 !== t ? t : 0) -
                (null !== (n = e.histogram[o]) && void 0 !== n ? n : 0),
            );
          return 1 - r / (this.totalCount + e.totalCount);
        }
      }
      gi.chrKeys = new Map();
      class mi {
        compute(e, t, n = ci.instance, r) {
          if (0 === e.length || 0 === t.length) return ai.trivial(e, t);
          const i = new fi(e.length, t.length),
            o = new fi(e.length, t.length),
            s = new fi(e.length, t.length);
          for (let a = 0; a < e.length; a++)
            for (let l = 0; l < t.length; l++) {
              if (!n.isValid()) return ai.trivialTimedOut(e, t);
              const u = 0 === a ? 0 : i.get(a - 1, l),
                c = 0 === l ? 0 : i.get(a, l - 1);
              let h;
              e.getElement(a) === t.getElement(l)
                ? ((h = 0 === a || 0 === l ? 0 : i.get(a - 1, l - 1)),
                  a > 0 &&
                    l > 0 &&
                    3 === o.get(a - 1, l - 1) &&
                    (h += s.get(a - 1, l - 1)),
                  (h += r ? r(a, l) : 1))
                : (h = -1);
              const f = Math.max(u, c, h);
              if (f === h) {
                const e = a > 0 && l > 0 ? s.get(a - 1, l - 1) : 0;
                s.set(a, l, e + 1), o.set(a, l, 3);
              } else
                f === u
                  ? (s.set(a, l, 0), o.set(a, l, 1))
                  : f === c && (s.set(a, l, 0), o.set(a, l, 2));
              i.set(a, l, f);
            }
          const a = [];
          let l = e.length,
            u = t.length;
          function c(e, t) {
            (e + 1 === l && t + 1 === u) ||
              a.push(new li(new Ur(e + 1, l), new Ur(t + 1, u))),
              (l = e),
              (u = t);
          }
          let h = e.length - 1,
            f = t.length - 1;
          for (; h >= 0 && f >= 0; )
            3 === o.get(h, f)
              ? (c(h, f), h--, f--)
              : 1 === o.get(h, f)
              ? h--
              : f--;
          return c(-1, -1), a.reverse(), new ai(a, !1);
        }
      }
      class pi {
        compute(e, t, n = ci.instance) {
          if (0 === e.length || 0 === t.length) return ai.trivial(e, t);
          const r = e,
            i = t;
          function o(e, t) {
            for (
              ;
              e < r.length &&
              t < i.length &&
              r.getElement(e) === i.getElement(t);

            )
              e++, t++;
            return e;
          }
          let s = 0;
          const a = new bi();
          a.set(0, o(0, 0));
          const l = new vi();
          l.set(0, 0 === a.get(0) ? null : new yi(null, 0, 0, a.get(0)));
          let u = 0;
          e: for (;;) {
            if ((s++, !n.isValid())) return ai.trivialTimedOut(r, i);
            const e = -Math.min(s, i.length + (s % 2)),
              t = Math.min(s, r.length + (s % 2));
            for (u = e; u <= t; u += 2) {
              let n = 0;
              const s = u === t ? -1 : a.get(u + 1),
                c = u === e ? -1 : a.get(u - 1) + 1;
              n++;
              const h = Math.min(Math.max(s, c), r.length),
                f = h - u;
              if ((n++, h > r.length || f > i.length)) continue;
              const d = o(h, f);
              a.set(u, d);
              const g = h === s ? l.get(u + 1) : l.get(u - 1);
              if (
                (l.set(u, d !== h ? new yi(g, h, f, d - h) : g),
                a.get(u) === r.length && a.get(u) - u === i.length)
              )
                break e;
            }
          }
          let c = l.get(u);
          const h = [];
          let f = r.length,
            d = i.length;
          for (;;) {
            const e = c ? c.x + c.length : 0,
              t = c ? c.y + c.length : 0;
            if (
              ((e === f && t === d) ||
                h.push(new li(new Ur(e, f), new Ur(t, d))),
              !c)
            )
              break;
            (f = c.x), (d = c.y), (c = c.prev);
          }
          return h.reverse(), new ai(h, !1);
        }
      }
      class yi {
        constructor(e, t, n, r) {
          (this.prev = e), (this.x = t), (this.y = n), (this.length = r);
        }
      }
      class bi {
        constructor() {
          (this.positiveArr = new Int32Array(10)),
            (this.negativeArr = new Int32Array(10));
        }
        get(e) {
          return e < 0
            ? ((e = -e - 1), this.negativeArr[e])
            : this.positiveArr[e];
        }
        set(e, t) {
          if (e < 0) {
            if ((e = -e - 1) >= this.negativeArr.length) {
              const e = this.negativeArr;
              (this.negativeArr = new Int32Array(2 * e.length)),
                this.negativeArr.set(e);
            }
            this.negativeArr[e] = t;
          } else {
            if (e >= this.positiveArr.length) {
              const e = this.positiveArr;
              (this.positiveArr = new Int32Array(2 * e.length)),
                this.positiveArr.set(e);
            }
            this.positiveArr[e] = t;
          }
        }
      }
      class vi {
        constructor() {
          (this.positiveArr = []), (this.negativeArr = []);
        }
        get(e) {
          return e < 0
            ? ((e = -e - 1), this.negativeArr[e])
            : this.positiveArr[e];
        }
        set(e, t) {
          e < 0
            ? ((e = -e - 1), (this.negativeArr[e] = t))
            : (this.positiveArr[e] = t);
        }
      }
      var wi;
      class Si {
        constructor(e, t) {
          (this.uri = e), (this.value = t);
        }
      }
      class _i {
        constructor(e, t) {
          if (((this[wi] = 'ResourceMap'), e instanceof _i))
            (this.map = new Map(e.map)),
              (this.toKey = null != t ? t : _i.defaultToKey);
          else if (
            (function (e) {
              return Array.isArray(e);
            })(e)
          ) {
            (this.map = new Map()),
              (this.toKey = null != t ? t : _i.defaultToKey);
            for (const [t, n] of e) this.set(t, n);
          } else
            (this.map = new Map()),
              (this.toKey = null != e ? e : _i.defaultToKey);
        }
        set(e, t) {
          return this.map.set(this.toKey(e), new Si(e, t)), this;
        }
        get(e) {
          var t;
          return null === (t = this.map.get(this.toKey(e))) || void 0 === t
            ? void 0
            : t.value;
        }
        has(e) {
          return this.map.has(this.toKey(e));
        }
        get size() {
          return this.map.size;
        }
        clear() {
          this.map.clear();
        }
        delete(e) {
          return this.map.delete(this.toKey(e));
        }
        forEach(e, t) {
          void 0 !== t && (e = e.bind(t));
          for (const [t, n] of this.map) e(n.value, n.uri, this);
        }
        *values() {
          for (const e of this.map.values()) yield e.value;
        }
        *keys() {
          for (const e of this.map.values()) yield e.uri;
        }
        *entries() {
          for (const e of this.map.values()) yield [e.uri, e.value];
        }
        *[((wi = Symbol.toStringTag), Symbol.iterator)]() {
          for (const [, e] of this.map) yield [e.uri, e.value];
        }
      }
      _i.defaultToKey = e => e.toString();
      Symbol.toStringTag, Symbol.iterator;
      class Ci {
        constructor() {
          this.map = new Map();
        }
        add(e, t) {
          let n = this.map.get(e);
          n || ((n = new Set()), this.map.set(e, n)), n.add(t);
        }
        delete(e, t) {
          const n = this.map.get(e);
          n && (n.delete(t), 0 === n.size && this.map.delete(e));
        }
        forEach(e, t) {
          const n = this.map.get(e);
          n && n.forEach(t);
        }
        get(e) {
          const t = this.map.get(e);
          return t || new Set();
        }
      }
      class Ei {
        constructor(e, t, n) {
          (this.lines = e),
            (this.considerWhitespaceChanges = n),
            (this.elements = []),
            (this.firstCharOffsetByLine = []),
            (this.additionalOffsetByLine = []);
          let r = !1;
          t.start > 0 &&
            t.endExclusive >= e.length &&
            ((t = new Ur(t.start - 1, t.endExclusive)), (r = !0)),
            (this.lineRange = t),
            (this.firstCharOffsetByLine[0] = 0);
          for (
            let t = this.lineRange.start;
            t < this.lineRange.endExclusive;
            t++
          ) {
            let i = e[t],
              o = 0;
            if (r) (o = i.length), (i = ''), (r = !1);
            else if (!n) {
              const e = i.trimStart();
              (o = i.length - e.length), (i = e.trimEnd());
            }
            this.additionalOffsetByLine.push(o);
            for (let e = 0; e < i.length; e++)
              this.elements.push(i.charCodeAt(e));
            t < e.length - 1 &&
              (this.elements.push('\n'.charCodeAt(0)),
              (this.firstCharOffsetByLine[t - this.lineRange.start + 1] =
                this.elements.length));
          }
          this.additionalOffsetByLine.push(0);
        }
        toString() {
          return `Slice: "${this.text}"`;
        }
        get text() {
          return this.getText(new Ur(0, this.length));
        }
        getText(e) {
          return this.elements
            .slice(e.start, e.endExclusive)
            .map(e => String.fromCharCode(e))
            .join('');
        }
        getElement(e) {
          return this.elements[e];
        }
        get length() {
          return this.elements.length;
        }
        getBoundaryScore(e) {
          const t = Li(e > 0 ? this.elements[e - 1] : -1),
            n = Li(e < this.elements.length ? this.elements[e] : -1);
          if (7 === t && 8 === n) return 0;
          if (8 === t) return 150;
          let r = 0;
          return (
            t !== n && ((r += 10), 0 === t && 1 === n && (r += 1)),
            (r += Ni(t)),
            (r += Ni(n)),
            r
          );
        }
        translateOffset(e) {
          if (this.lineRange.isEmpty)
            return new Mt(this.lineRange.start + 1, 1);
          const t = Kr(this.firstCharOffsetByLine, t => t <= e);
          return new Mt(
            this.lineRange.start + t + 1,
            e -
              this.firstCharOffsetByLine[t] +
              this.additionalOffsetByLine[t] +
              1,
          );
        }
        translateRange(e) {
          return Pt.fromPositions(
            this.translateOffset(e.start),
            this.translateOffset(e.endExclusive),
          );
        }
        findWordContaining(e) {
          if (e < 0 || e >= this.elements.length) return;
          if (!Ai(this.elements[e])) return;
          let t = e;
          for (; t > 0 && Ai(this.elements[t - 1]); ) t--;
          let n = e;
          for (; n < this.elements.length && Ai(this.elements[n]); ) n++;
          return new Ur(t, n);
        }
        countLinesIn(e) {
          return (
            this.translateOffset(e.endExclusive).lineNumber -
            this.translateOffset(e.start).lineNumber
          );
        }
        isStronglyEqual(e, t) {
          return this.elements[e] === this.elements[t];
        }
        extendToFullLines(e) {
          var t, n;
          const r =
              null !==
                (t = Br(this.firstCharOffsetByLine, t => t <= e.start)) &&
              void 0 !== t
                ? t
                : 0,
            i =
              null !==
                (n = (function (e, t) {
                  const n = $r(e, t);
                  return n === e.length ? void 0 : e[n];
                })(this.firstCharOffsetByLine, t => e.endExclusive <= t)) &&
              void 0 !== n
                ? n
                : this.elements.length;
          return new Ur(r, i);
        }
      }
      function Ai(e) {
        return (
          (e >= 97 && e <= 122) || (e >= 65 && e <= 90) || (e >= 48 && e <= 57)
        );
      }
      const xi = { 0: 0, 1: 0, 2: 0, 3: 10, 4: 2, 5: 30, 6: 3, 7: 10, 8: 10 };
      function Ni(e) {
        return xi[e];
      }
      function Li(e) {
        return 10 === e
          ? 8
          : 13 === e
          ? 7
          : di(e)
          ? 6
          : e >= 97 && e <= 122
          ? 0
          : e >= 65 && e <= 90
          ? 1
          : e >= 48 && e <= 57
          ? 2
          : -1 === e
          ? 3
          : 44 === e || 59 === e
          ? 5
          : 4;
      }
      function Oi(e, t, n, r, i, o) {
        let { moves: s, excludedChanges: a } = (function (e, t, n, r) {
          const i = [],
            o = e
              .filter(e => e.modified.isEmpty && e.original.length >= 3)
              .map(e => new gi(e.original, t, e)),
            s = new Set(
              e
                .filter(e => e.original.isEmpty && e.modified.length >= 3)
                .map(e => new gi(e.modified, n, e)),
            ),
            a = new Set();
          for (const e of o) {
            let t,
              n = -1;
            for (const r of s) {
              const i = e.computeSimilarity(r);
              i > n && ((n = i), (t = r));
            }
            if (
              (n > 0.9 &&
                t &&
                (s.delete(t),
                i.push(new Gr(e.range, t.range)),
                a.add(e.source),
                a.add(t.source)),
              !r.isValid())
            )
              return { moves: i, excludedChanges: a };
          }
          return { moves: i, excludedChanges: a };
        })(e, t, n, o);
        if (!o.isValid()) return [];
        const l = (function (e, t, n, r, i, o) {
          const s = [],
            a = new Ci();
          for (const n of e)
            for (
              let e = n.original.startLineNumber;
              e < n.original.endLineNumberExclusive - 2;
              e++
            ) {
              const n = `${t[e - 1]}:${t[e + 1 - 1]}:${t[e + 2 - 1]}`;
              a.add(n, { range: new zr(e, e + 3) });
            }
          const l = [];
          e.sort(jt(e => e.modified.startLineNumber, Ft));
          for (const t of e) {
            let e = [];
            for (
              let r = t.modified.startLineNumber;
              r < t.modified.endLineNumberExclusive - 2;
              r++
            ) {
              const t = `${n[r - 1]}:${n[r + 1 - 1]}:${n[r + 2 - 1]}`,
                i = new zr(r, r + 3),
                o = [];
              a.forEach(t, ({ range: t }) => {
                for (const n of e)
                  if (
                    n.originalLineRange.endLineNumberExclusive + 1 ===
                      t.endLineNumberExclusive &&
                    n.modifiedLineRange.endLineNumberExclusive + 1 ===
                      i.endLineNumberExclusive
                  )
                    return (
                      (n.originalLineRange = new zr(
                        n.originalLineRange.startLineNumber,
                        t.endLineNumberExclusive,
                      )),
                      (n.modifiedLineRange = new zr(
                        n.modifiedLineRange.startLineNumber,
                        i.endLineNumberExclusive,
                      )),
                      void o.push(n)
                    );
                const n = { modifiedLineRange: i, originalLineRange: t };
                l.push(n), o.push(n);
              }),
                (e = o);
            }
            if (!o.isValid()) return [];
          }
          l.sort(
            ((u = jt(e => e.modifiedLineRange.length, Ft)), (e, t) => -u(e, t)),
          );
          var u;
          const c = new Hr(),
            h = new Hr();
          for (const e of l) {
            const t =
                e.modifiedLineRange.startLineNumber -
                e.originalLineRange.startLineNumber,
              n = c.subtractFrom(e.modifiedLineRange),
              r = h.subtractFrom(e.originalLineRange).getWithDelta(t),
              i = n.getIntersection(r);
            for (const e of i.ranges) {
              if (e.length < 3) continue;
              const n = e,
                r = e.delta(-t);
              s.push(new Gr(r, n)), c.addRange(n), h.addRange(r);
            }
          }
          s.sort(jt(e => e.original.startLineNumber, Ft));
          const f = new Wr(e);
          for (let t = 0; t < s.length; t++) {
            const n = s[t],
              a = f.findLastMonotonous(
                e => e.original.startLineNumber <= n.original.startLineNumber,
              ),
              l = Br(
                e,
                e => e.modified.startLineNumber <= n.modified.startLineNumber,
              ),
              u = Math.max(
                n.original.startLineNumber - a.original.startLineNumber,
                n.modified.startLineNumber - l.modified.startLineNumber,
              ),
              d = f.findLastMonotonous(
                e =>
                  e.original.startLineNumber <
                  n.original.endLineNumberExclusive,
              ),
              g = Br(
                e,
                e =>
                  e.modified.startLineNumber <
                  n.modified.endLineNumberExclusive,
              ),
              m = Math.max(
                d.original.endLineNumberExclusive -
                  n.original.endLineNumberExclusive,
                g.modified.endLineNumberExclusive -
                  n.modified.endLineNumberExclusive,
              );
            let p, y;
            for (p = 0; p < u; p++) {
              const e = n.original.startLineNumber - p - 1,
                t = n.modified.startLineNumber - p - 1;
              if (e > r.length || t > i.length) break;
              if (c.contains(t) || h.contains(e)) break;
              if (!ki(r[e - 1], i[t - 1], o)) break;
            }
            for (
              p > 0 &&
                (h.addRange(
                  new zr(
                    n.original.startLineNumber - p,
                    n.original.startLineNumber,
                  ),
                ),
                c.addRange(
                  new zr(
                    n.modified.startLineNumber - p,
                    n.modified.startLineNumber,
                  ),
                )),
                y = 0;
              y < m;
              y++
            ) {
              const e = n.original.endLineNumberExclusive + y,
                t = n.modified.endLineNumberExclusive + y;
              if (e > r.length || t > i.length) break;
              if (c.contains(t) || h.contains(e)) break;
              if (!ki(r[e - 1], i[t - 1], o)) break;
            }
            y > 0 &&
              (h.addRange(
                new zr(
                  n.original.endLineNumberExclusive,
                  n.original.endLineNumberExclusive + y,
                ),
              ),
              c.addRange(
                new zr(
                  n.modified.endLineNumberExclusive,
                  n.modified.endLineNumberExclusive + y,
                ),
              )),
              (p > 0 || y > 0) &&
                (s[t] = new Gr(
                  new zr(
                    n.original.startLineNumber - p,
                    n.original.endLineNumberExclusive + y,
                  ),
                  new zr(
                    n.modified.startLineNumber - p,
                    n.modified.endLineNumberExclusive + y,
                  ),
                ));
          }
          return s;
        })(
          e.filter(e => !a.has(e)),
          r,
          i,
          t,
          n,
          o,
        );
        return (
          (function (e, t) {
            for (const n of t) e.push(n);
          })(s, l),
          (s = (function (e) {
            if (0 === e.length) return e;
            e.sort(jt(e => e.original.startLineNumber, Ft));
            const t = [e[0]];
            for (let n = 1; n < e.length; n++) {
              const r = t[t.length - 1],
                i = e[n],
                o =
                  i.original.startLineNumber -
                  r.original.endLineNumberExclusive,
                s =
                  i.modified.startLineNumber -
                  r.modified.endLineNumberExclusive;
              o >= 0 && s >= 0 && o + s <= 2
                ? (t[t.length - 1] = r.join(i))
                : t.push(i);
            }
            return t;
          })(s)),
          (s = s.filter(e => {
            const n = e.original
              .toOffsetRange()
              .slice(t)
              .map(e => e.trim());
            return (
              n.join('\n').length >= 15 &&
              (function (e, t) {
                let n = 0;
                for (const r of e) t(r) && n++;
                return n;
              })(n, e => e.length >= 2) >= 2
            );
          })),
          (s = (function (e, t) {
            const n = new Wr(e);
            return (
              (t = t.filter(
                t =>
                  (n.findLastMonotonous(
                    e =>
                      e.original.startLineNumber <
                      t.original.endLineNumberExclusive,
                  ) || new Gr(new zr(1, 1), new zr(1, 1))) !==
                  Br(
                    e,
                    e =>
                      e.modified.startLineNumber <
                      t.modified.endLineNumberExclusive,
                  ),
              )),
              t
            );
          })(e, s)),
          s
        );
      }
      function ki(e, t, n) {
        if (e.trim() === t.trim()) return !0;
        if (e.length > 300 && t.length > 300) return !1;
        const r = new pi().compute(
          new Ei([e], new Ur(0, 1), !1),
          new Ei([t], new Ur(0, 1), !1),
          n,
        );
        let i = 0;
        const o = li.invert(r.diffs, e.length);
        for (const t of o)
          t.seq1Range.forEach(t => {
            di(e.charCodeAt(t)) || i++;
          });
        const s = (function (t) {
          let n = 0;
          for (let r = 0; r < e.length; r++) di(t.charCodeAt(r)) || n++;
          return n;
        })(e.length > t.length ? e : t);
        return i / s > 0.6 && s > 10;
      }
      function Ri(e, t, n) {
        let r = n;
        return (
          (r = Ti(e, t, r)),
          (r = Ti(e, t, r)),
          (r = (function (e, t, n) {
            if (!e.getBoundaryScore || !t.getBoundaryScore) return n;
            for (let r = 0; r < n.length; r++) {
              const i = r > 0 ? n[r - 1] : void 0,
                o = n[r],
                s = r + 1 < n.length ? n[r + 1] : void 0,
                a = new Ur(
                  i ? i.seq1Range.endExclusive + 1 : 0,
                  s ? s.seq1Range.start - 1 : e.length,
                ),
                l = new Ur(
                  i ? i.seq2Range.endExclusive + 1 : 0,
                  s ? s.seq2Range.start - 1 : t.length,
                );
              o.seq1Range.isEmpty
                ? (n[r] = Mi(o, e, t, a, l))
                : o.seq2Range.isEmpty &&
                  (n[r] = Mi(o.swap(), t, e, l, a).swap());
            }
            return n;
          })(e, t, r)),
          r
        );
      }
      function Ti(e, t, n) {
        if (0 === n.length) return n;
        const r = [];
        r.push(n[0]);
        for (let i = 1; i < n.length; i++) {
          const o = r[r.length - 1];
          let s = n[i];
          if (s.seq1Range.isEmpty || s.seq2Range.isEmpty) {
            const n = s.seq1Range.start - o.seq1Range.endExclusive;
            let i;
            for (
              i = 1;
              i <= n &&
              e.getElement(s.seq1Range.start - i) ===
                e.getElement(s.seq1Range.endExclusive - i) &&
              t.getElement(s.seq2Range.start - i) ===
                t.getElement(s.seq2Range.endExclusive - i);
              i++
            );
            if ((i--, i === n)) {
              r[r.length - 1] = new li(
                new Ur(o.seq1Range.start, s.seq1Range.endExclusive - n),
                new Ur(o.seq2Range.start, s.seq2Range.endExclusive - n),
              );
              continue;
            }
            s = s.delta(-i);
          }
          r.push(s);
        }
        const i = [];
        for (let n = 0; n < r.length - 1; n++) {
          const o = r[n + 1];
          let s = r[n];
          if (s.seq1Range.isEmpty || s.seq2Range.isEmpty) {
            const i = o.seq1Range.start - s.seq1Range.endExclusive;
            let a;
            for (
              a = 0;
              a < i &&
              e.isStronglyEqual(
                s.seq1Range.start + a,
                s.seq1Range.endExclusive + a,
              ) &&
              t.isStronglyEqual(
                s.seq2Range.start + a,
                s.seq2Range.endExclusive + a,
              );
              a++
            );
            if (a === i) {
              r[n + 1] = new li(
                new Ur(s.seq1Range.start + i, o.seq1Range.endExclusive),
                new Ur(s.seq2Range.start + i, o.seq2Range.endExclusive),
              );
              continue;
            }
            a > 0 && (s = s.delta(a));
          }
          i.push(s);
        }
        return r.length > 0 && i.push(r[r.length - 1]), i;
      }
      function Mi(e, t, n, r, i) {
        let o = 1;
        for (
          ;
          e.seq1Range.start - o >= r.start &&
          e.seq2Range.start - o >= i.start &&
          n.isStronglyEqual(
            e.seq2Range.start - o,
            e.seq2Range.endExclusive - o,
          ) &&
          o < 100;

        )
          o++;
        o--;
        let s = 0;
        for (
          ;
          e.seq1Range.start + s < r.endExclusive &&
          e.seq2Range.endExclusive + s < i.endExclusive &&
          n.isStronglyEqual(
            e.seq2Range.start + s,
            e.seq2Range.endExclusive + s,
          ) &&
          s < 100;

        )
          s++;
        if (0 === o && 0 === s) return e;
        let a = 0,
          l = -1;
        for (let r = -o; r <= s; r++) {
          const i = e.seq2Range.start + r,
            o = e.seq2Range.endExclusive + r,
            s = e.seq1Range.start + r,
            u =
              t.getBoundaryScore(s) +
              n.getBoundaryScore(i) +
              n.getBoundaryScore(o);
          u > l && ((l = u), (a = r));
        }
        return e.delta(a);
      }
      class Pi {
        constructor(e, t) {
          (this.trimmedHash = e), (this.lines = t);
        }
        getElement(e) {
          return this.trimmedHash[e];
        }
        get length() {
          return this.trimmedHash.length;
        }
        getBoundaryScore(e) {
          return (
            1e3 -
            ((0 === e ? 0 : Ii(this.lines[e - 1])) +
              (e === this.lines.length ? 0 : Ii(this.lines[e])))
          );
        }
        getText(e) {
          return this.lines.slice(e.start, e.endExclusive).join('\n');
        }
        isStronglyEqual(e, t) {
          return this.lines[e] === this.lines[t];
        }
      }
      function Ii(e) {
        let t = 0;
        for (
          ;
          t < e.length && (32 === e.charCodeAt(t) || 9 === e.charCodeAt(t));

        )
          t++;
        return t;
      }
      class ji {
        constructor() {
          (this.dynamicProgrammingDiffing = new mi()),
            (this.myersDiffingAlgorithm = new pi());
        }
        computeDiff(e, t, n) {
          if (
            e.length <= 1 &&
            (function (e, t, n = (e, t) => e === t) {
              if (e === t) return !0;
              if (!e || !t) return !1;
              if (e.length !== t.length) return !1;
              for (let r = 0, i = e.length; r < i; r++)
                if (!n(e[r], t[r])) return !1;
              return !0;
            })(e, t, (e, t) => e === t)
          )
            return new Vr([], [], !1);
          if (
            (1 === e.length && 0 === e[0].length) ||
            (1 === t.length && 0 === t[0].length)
          )
            return new Vr(
              [
                new Jr(new zr(1, e.length + 1), new zr(1, t.length + 1), [
                  new Xr(
                    new Pt(1, 1, e.length, e[0].length + 1),
                    new Pt(1, 1, t.length, t[0].length + 1),
                  ),
                ]),
              ],
              [],
              !1,
            );
          const r =
              0 === n.maxComputationTimeMs
                ? ci.instance
                : new hi(n.maxComputationTimeMs),
            i = !n.ignoreTrimWhitespace,
            o = new Map();
          function s(e) {
            let t = o.get(e);
            return void 0 === t && ((t = o.size), o.set(e, t)), t;
          }
          const a = e.map(e => s(e.trim())),
            l = t.map(e => s(e.trim())),
            u = new Pi(a, e),
            c = new Pi(l, t),
            h = (() =>
              u.length + c.length < 1700
                ? this.dynamicProgrammingDiffing.compute(u, c, r, (n, r) =>
                    e[n] === t[r]
                      ? 0 === t[r].length
                        ? 0.1
                        : 1 + Math.log(1 + t[r].length)
                      : 0.99,
                  )
                : this.myersDiffingAlgorithm.compute(u, c))();
          let f = h.diffs,
            d = h.hitTimeout;
          (f = Ri(u, c, f)),
            (f = (function (e, t, n) {
              let r = n;
              if (0 === r.length) return r;
              let i,
                o = 0;
              do {
                i = !1;
                const s = [r[0]];
                for (let a = 1; a < r.length; a++) {
                  const l = r[a],
                    u = s[s.length - 1];
                  function c(t, n) {
                    const r = new Ur(
                      u.seq1Range.endExclusive,
                      l.seq1Range.start,
                    );
                    return (
                      e.getText(r).replace(/\s/g, '').length <= 4 &&
                      (t.seq1Range.length + t.seq2Range.length > 5 ||
                        n.seq1Range.length + n.seq2Range.length > 5)
                    );
                  }
                  c(u, l)
                    ? ((i = !0), (s[s.length - 1] = s[s.length - 1].join(l)))
                    : s.push(l);
                }
                r = s;
              } while (o++ < 10 && i);
              return r;
            })(u, 0, f));
          const g = [],
            m = n => {
              if (i)
                for (let o = 0; o < n; o++) {
                  const n = p + o,
                    s = y + o;
                  if (e[n] !== t[s]) {
                    const o = this.refineDiff(
                      e,
                      t,
                      new li(new Ur(n, n + 1), new Ur(s, s + 1)),
                      r,
                      i,
                    );
                    for (const e of o.mappings) g.push(e);
                    o.hitTimeout && (d = !0);
                  }
                }
            };
          let p = 0,
            y = 0;
          for (const n of f) {
            Pr(() => n.seq1Range.start - p == n.seq2Range.start - y);
            m(n.seq1Range.start - p),
              (p = n.seq1Range.endExclusive),
              (y = n.seq2Range.endExclusive);
            const o = this.refineDiff(e, t, n, r, i);
            o.hitTimeout && (d = !0);
            for (const e of o.mappings) g.push(e);
          }
          m(e.length - p);
          const b = Fi(g, e, t);
          let v = [];
          return (
            n.computeMoves && (v = this.computeMoves(b, e, t, a, l, r, i)),
            Pr(() => {
              function n(e, t) {
                if (e.lineNumber < 1 || e.lineNumber > t.length) return !1;
                const n = t[e.lineNumber - 1];
                return !(e.column < 1 || e.column > n.length + 1);
              }
              function r(e, t) {
                return (
                  !(
                    e.startLineNumber < 1 || e.startLineNumber > t.length + 1
                  ) &&
                  !(
                    e.endLineNumberExclusive < 1 ||
                    e.endLineNumberExclusive > t.length + 1
                  )
                );
              }
              for (const i of b) {
                if (!i.innerChanges) return !1;
                for (const r of i.innerChanges) {
                  if (
                    !(
                      n(r.modifiedRange.getStartPosition(), t) &&
                      n(r.modifiedRange.getEndPosition(), t) &&
                      n(r.originalRange.getStartPosition(), e) &&
                      n(r.originalRange.getEndPosition(), e)
                    )
                  )
                    return !1;
                }
                if (!r(i.modified, t) || !r(i.original, e)) return !1;
              }
              return !0;
            }),
            new Vr(b, v, d)
          );
        }
        computeMoves(e, t, n, r, i, o, s) {
          return Oi(e, t, n, r, i, o).map(e => {
            const r = Fi(
              this.refineDiff(
                t,
                n,
                new li(e.original.toOffsetRange(), e.modified.toOffsetRange()),
                o,
                s,
              ).mappings,
              t,
              n,
              !0,
            );
            return new qr(e, r);
          });
        }
        refineDiff(e, t, n, r, i) {
          const o = new Ei(e, n.seq1Range, i),
            s = new Ei(t, n.seq2Range, i),
            a =
              o.length + s.length < 500
                ? this.dynamicProgrammingDiffing.compute(o, s, r)
                : this.myersDiffingAlgorithm.compute(o, s, r);
          let l = a.diffs;
          (l = Ri(o, s, l)),
            (l = (function (e, t, n) {
              const r = li.invert(n, e.length),
                i = [];
              let o = new ui(0, 0);
              function s(n, s) {
                if (n.offset1 < o.offset1 || n.offset2 < o.offset2) return;
                const a = e.findWordContaining(n.offset1),
                  l = t.findWordContaining(n.offset2);
                if (!a || !l) return;
                let u = new li(a, l);
                const c = u.intersect(s);
                let h = c.seq1Range.length,
                  f = c.seq2Range.length;
                for (; r.length > 0; ) {
                  const n = r[0];
                  if (!n.seq1Range.intersects(a) && !n.seq2Range.intersects(l))
                    break;
                  const i = e.findWordContaining(n.seq1Range.start),
                    o = t.findWordContaining(n.seq2Range.start),
                    s = new li(i, o),
                    c = s.intersect(n);
                  if (
                    ((h += c.seq1Range.length),
                    (f += c.seq2Range.length),
                    (u = u.join(s)),
                    !(u.seq1Range.endExclusive >= n.seq1Range.endExclusive))
                  )
                    break;
                  r.shift();
                }
                h + f < (2 * (u.seq1Range.length + u.seq2Range.length)) / 3 &&
                  i.push(u),
                  (o = u.getEndExclusives());
              }
              for (; r.length > 0; ) {
                const e = r.shift();
                e.seq1Range.isEmpty ||
                  (s(e.getStarts(), e), s(e.getEndExclusives().delta(-1), e));
              }
              return (function (e, t) {
                const n = [];
                for (; e.length > 0 || t.length > 0; ) {
                  const r = e[0],
                    i = t[0];
                  let o;
                  (o =
                    r && (!i || r.seq1Range.start < i.seq1Range.start)
                      ? e.shift()
                      : t.shift()),
                    n.length > 0 &&
                    n[n.length - 1].seq1Range.endExclusive >= o.seq1Range.start
                      ? (n[n.length - 1] = n[n.length - 1].join(o))
                      : n.push(o);
                }
                return n;
              })(n, i);
            })(o, s, l)),
            (l = (function (e, t, n) {
              const r = [];
              for (const e of n) {
                const t = r[r.length - 1];
                t &&
                (e.seq1Range.start - t.seq1Range.endExclusive <= 2 ||
                  e.seq2Range.start - t.seq2Range.endExclusive <= 2)
                  ? (r[r.length - 1] = new li(
                      t.seq1Range.join(e.seq1Range),
                      t.seq2Range.join(e.seq2Range),
                    ))
                  : r.push(e);
              }
              return r;
            })(0, 0, l)),
            (l = (function (e, t, n) {
              let r = n;
              if (0 === r.length) return r;
              let i,
                o = 0;
              do {
                i = !1;
                const a = [r[0]];
                for (let l = 1; l < r.length; l++) {
                  const u = r[l],
                    c = a[a.length - 1];
                  function h(n, r) {
                    const i = new Ur(
                      c.seq1Range.endExclusive,
                      u.seq1Range.start,
                    );
                    if (e.countLinesIn(i) > 5 || i.length > 500) return !1;
                    const o = e.getText(i).trim();
                    if (o.length > 20 || o.split(/\r\n|\r|\n/).length > 1)
                      return !1;
                    const s = e.countLinesIn(n.seq1Range),
                      a = n.seq1Range.length,
                      l = t.countLinesIn(n.seq2Range),
                      h = n.seq2Range.length,
                      f = e.countLinesIn(r.seq1Range),
                      d = r.seq1Range.length,
                      g = t.countLinesIn(r.seq2Range),
                      m = r.seq2Range.length;
                    function p(e) {
                      return Math.min(e, 130);
                    }
                    return (
                      Math.pow(
                        Math.pow(p(40 * s + a), 1.5) +
                          Math.pow(p(40 * l + h), 1.5),
                        1.5,
                      ) +
                        Math.pow(
                          Math.pow(p(40 * f + d), 1.5) +
                            Math.pow(p(40 * g + m), 1.5),
                          1.5,
                        ) >
                      74184.96480721243
                    );
                  }
                  h(c, u)
                    ? ((i = !0), (a[a.length - 1] = a[a.length - 1].join(u)))
                    : a.push(u);
                }
                r = a;
              } while (o++ < 10 && i);
              const s = [];
              return (
                (function (e, t) {
                  for (let n = 0; n < e.length; n++)
                    t(
                      0 === n ? void 0 : e[n - 1],
                      e[n],
                      n + 1 === e.length ? void 0 : e[n + 1],
                    );
                })(r, (t, n, r) => {
                  let i = n;
                  function o(e) {
                    return (
                      e.length > 0 &&
                      e.trim().length <= 3 &&
                      n.seq1Range.length + n.seq2Range.length > 100
                    );
                  }
                  const a = e.extendToFullLines(n.seq1Range),
                    l = e.getText(new Ur(a.start, n.seq1Range.start));
                  o(l) && (i = i.deltaStart(-l.length));
                  const u = e.getText(
                    new Ur(n.seq1Range.endExclusive, a.endExclusive),
                  );
                  o(u) && (i = i.deltaEnd(u.length));
                  const c = li.fromOffsetPairs(
                      t ? t.getEndExclusives() : ui.zero,
                      r ? r.getStarts() : ui.max,
                    ),
                    h = i.intersect(c);
                  s.length > 0 &&
                  h.getStarts().equals(s[s.length - 1].getEndExclusives())
                    ? (s[s.length - 1] = s[s.length - 1].join(h))
                    : s.push(h);
                }),
                s
              );
            })(o, s, l));
          return {
            mappings: l.map(
              e =>
                new Xr(
                  o.translateRange(e.seq1Range),
                  s.translateRange(e.seq2Range),
                ),
            ),
            hitTimeout: a.hitTimeout,
          };
        }
      }
      function Fi(e, t, n, r = !1) {
        const i = [];
        for (const r of (function* (e, t) {
          let n, r;
          for (const i of e)
            void 0 !== r && t(r, i) ? n.push(i) : (n && (yield n), (n = [i])),
              (r = i);
          n && (yield n);
        })(
          e.map(e =>
            (function (e, t, n) {
              let r = 0,
                i = 0;
              1 === e.modifiedRange.endColumn &&
                1 === e.originalRange.endColumn &&
                e.originalRange.startLineNumber + r <=
                  e.originalRange.endLineNumber &&
                e.modifiedRange.startLineNumber + r <=
                  e.modifiedRange.endLineNumber &&
                (i = -1);
              e.modifiedRange.startColumn - 1 >=
                n[e.modifiedRange.startLineNumber - 1].length &&
                e.originalRange.startColumn - 1 >=
                  t[e.originalRange.startLineNumber - 1].length &&
                e.originalRange.startLineNumber <=
                  e.originalRange.endLineNumber + i &&
                e.modifiedRange.startLineNumber <=
                  e.modifiedRange.endLineNumber + i &&
                (r = 1);
              const o = new zr(
                  e.originalRange.startLineNumber + r,
                  e.originalRange.endLineNumber + 1 + i,
                ),
                s = new zr(
                  e.modifiedRange.startLineNumber + r,
                  e.modifiedRange.endLineNumber + 1 + i,
                );
              return new Jr(o, s, [e]);
            })(e, t, n),
          ),
          (e, t) =>
            e.original.overlapOrTouch(t.original) ||
            e.modified.overlapOrTouch(t.modified),
        )) {
          const e = r[0],
            t = r[r.length - 1];
          i.push(
            new Jr(
              e.original.join(t.original),
              e.modified.join(t.modified),
              r.map(e => e.innerChanges[0]),
            ),
          );
        }
        return (
          Pr(
            () =>
              !(
                !r &&
                i.length > 0 &&
                i[0].original.startLineNumber !== i[0].modified.startLineNumber
              ) &&
              Ir(
                i,
                (e, t) =>
                  t.original.startLineNumber -
                    e.original.endLineNumberExclusive ==
                    t.modified.startLineNumber -
                      e.modified.endLineNumberExclusive &&
                  e.original.endLineNumberExclusive <
                    t.original.startLineNumber &&
                  e.modified.endLineNumberExclusive <
                    t.modified.startLineNumber,
              ),
          ),
          i
        );
      }
      const Di = () => new Qr(),
        Vi = () => new ji();
      function qi(e, t) {
        const n = Math.pow(10, t);
        return Math.round(e * n) / n;
      }
      class Ui {
        constructor(e, t, n, r = 1) {
          (this._rgbaBrand = void 0),
            (this.r = 0 | Math.min(255, Math.max(0, e))),
            (this.g = 0 | Math.min(255, Math.max(0, t))),
            (this.b = 0 | Math.min(255, Math.max(0, n))),
            (this.a = qi(Math.max(Math.min(1, r), 0), 3));
        }
        static equals(e, t) {
          return e.r === t.r && e.g === t.g && e.b === t.b && e.a === t.a;
        }
      }
      class Bi {
        constructor(e, t, n, r) {
          (this._hslaBrand = void 0),
            (this.h = 0 | Math.max(Math.min(360, e), 0)),
            (this.s = qi(Math.max(Math.min(1, t), 0), 3)),
            (this.l = qi(Math.max(Math.min(1, n), 0), 3)),
            (this.a = qi(Math.max(Math.min(1, r), 0), 3));
        }
        static equals(e, t) {
          return e.h === t.h && e.s === t.s && e.l === t.l && e.a === t.a;
        }
        static fromRGBA(e) {
          const t = e.r / 255,
            n = e.g / 255,
            r = e.b / 255,
            i = e.a,
            o = Math.max(t, n, r),
            s = Math.min(t, n, r);
          let a = 0,
            l = 0;
          const u = (s + o) / 2,
            c = o - s;
          if (c > 0) {
            switch (
              ((l = Math.min(u <= 0.5 ? c / (2 * u) : c / (2 - 2 * u), 1)), o)
            ) {
              case t:
                a = (n - r) / c + (n < r ? 6 : 0);
                break;
              case n:
                a = (r - t) / c + 2;
                break;
              case r:
                a = (t - n) / c + 4;
            }
            (a *= 60), (a = Math.round(a));
          }
          return new Bi(a, l, u, i);
        }
        static _hue2rgb(e, t, n) {
          return (
            n < 0 && (n += 1),
            n > 1 && (n -= 1),
            n < 1 / 6
              ? e + 6 * (t - e) * n
              : n < 0.5
              ? t
              : n < 2 / 3
              ? e + (t - e) * (2 / 3 - n) * 6
              : e
          );
        }
        static toRGBA(e) {
          const t = e.h / 360,
            { s: n, l: r, a: i } = e;
          let o, s, a;
          if (0 === n) o = s = a = r;
          else {
            const e = r < 0.5 ? r * (1 + n) : r + n - r * n,
              i = 2 * r - e;
            (o = Bi._hue2rgb(i, e, t + 1 / 3)),
              (s = Bi._hue2rgb(i, e, t)),
              (a = Bi._hue2rgb(i, e, t - 1 / 3));
          }
          return new Ui(
            Math.round(255 * o),
            Math.round(255 * s),
            Math.round(255 * a),
            i,
          );
        }
      }
      class Ki {
        constructor(e, t, n, r) {
          (this._hsvaBrand = void 0),
            (this.h = 0 | Math.max(Math.min(360, e), 0)),
            (this.s = qi(Math.max(Math.min(1, t), 0), 3)),
            (this.v = qi(Math.max(Math.min(1, n), 0), 3)),
            (this.a = qi(Math.max(Math.min(1, r), 0), 3));
        }
        static equals(e, t) {
          return e.h === t.h && e.s === t.s && e.v === t.v && e.a === t.a;
        }
        static fromRGBA(e) {
          const t = e.r / 255,
            n = e.g / 255,
            r = e.b / 255,
            i = Math.max(t, n, r),
            o = i - Math.min(t, n, r),
            s = 0 === i ? 0 : o / i;
          let a;
          return (
            (a =
              0 === o
                ? 0
                : i === t
                ? ((((n - r) / o) % 6) + 6) % 6
                : i === n
                ? (r - t) / o + 2
                : (t - n) / o + 4),
            new Ki(Math.round(60 * a), s, i, e.a)
          );
        }
        static toRGBA(e) {
          const { h: t, s: n, v: r, a: i } = e,
            o = r * n,
            s = o * (1 - Math.abs(((t / 60) % 2) - 1)),
            a = r - o;
          let [l, u, c] = [0, 0, 0];
          return (
            t < 60
              ? ((l = o), (u = s))
              : t < 120
              ? ((l = s), (u = o))
              : t < 180
              ? ((u = o), (c = s))
              : t < 240
              ? ((u = s), (c = o))
              : t < 300
              ? ((l = s), (c = o))
              : t <= 360 && ((l = o), (c = s)),
            (l = Math.round(255 * (l + a))),
            (u = Math.round(255 * (u + a))),
            (c = Math.round(255 * (c + a))),
            new Ui(l, u, c, i)
          );
        }
      }
      class $i {
        static fromHex(e) {
          return $i.Format.CSS.parseHex(e) || $i.red;
        }
        static equals(e, t) {
          return (!e && !t) || (!(!e || !t) && e.equals(t));
        }
        get hsla() {
          return this._hsla ? this._hsla : Bi.fromRGBA(this.rgba);
        }
        get hsva() {
          return this._hsva ? this._hsva : Ki.fromRGBA(this.rgba);
        }
        constructor(e) {
          if (!e) throw new Error('Color needs a value');
          if (e instanceof Ui) this.rgba = e;
          else if (e instanceof Bi)
            (this._hsla = e), (this.rgba = Bi.toRGBA(e));
          else {
            if (!(e instanceof Ki))
              throw new Error('Invalid color ctor argument');
            (this._hsva = e), (this.rgba = Ki.toRGBA(e));
          }
        }
        equals(e) {
          return (
            !!e &&
            Ui.equals(this.rgba, e.rgba) &&
            Bi.equals(this.hsla, e.hsla) &&
            Ki.equals(this.hsva, e.hsva)
          );
        }
        getRelativeLuminance() {
          return qi(
            0.2126 * $i._relativeLuminanceForComponent(this.rgba.r) +
              0.7152 * $i._relativeLuminanceForComponent(this.rgba.g) +
              0.0722 * $i._relativeLuminanceForComponent(this.rgba.b),
            4,
          );
        }
        static _relativeLuminanceForComponent(e) {
          const t = e / 255;
          return t <= 0.03928 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
        }
        isLighter() {
          return (
            (299 * this.rgba.r + 587 * this.rgba.g + 114 * this.rgba.b) / 1e3 >=
            128
          );
        }
        isLighterThan(e) {
          return this.getRelativeLuminance() > e.getRelativeLuminance();
        }
        isDarkerThan(e) {
          return this.getRelativeLuminance() < e.getRelativeLuminance();
        }
        lighten(e) {
          return new $i(
            new Bi(
              this.hsla.h,
              this.hsla.s,
              this.hsla.l + this.hsla.l * e,
              this.hsla.a,
            ),
          );
        }
        darken(e) {
          return new $i(
            new Bi(
              this.hsla.h,
              this.hsla.s,
              this.hsla.l - this.hsla.l * e,
              this.hsla.a,
            ),
          );
        }
        transparent(e) {
          const { r: t, g: n, b: r, a: i } = this.rgba;
          return new $i(new Ui(t, n, r, i * e));
        }
        isTransparent() {
          return 0 === this.rgba.a;
        }
        isOpaque() {
          return 1 === this.rgba.a;
        }
        opposite() {
          return new $i(
            new Ui(
              255 - this.rgba.r,
              255 - this.rgba.g,
              255 - this.rgba.b,
              this.rgba.a,
            ),
          );
        }
        makeOpaque(e) {
          if (this.isOpaque() || 1 !== e.rgba.a) return this;
          const { r: t, g: n, b: r, a: i } = this.rgba;
          return new $i(
            new Ui(
              e.rgba.r - i * (e.rgba.r - t),
              e.rgba.g - i * (e.rgba.g - n),
              e.rgba.b - i * (e.rgba.b - r),
              1,
            ),
          );
        }
        toString() {
          return (
            this._toString || (this._toString = $i.Format.CSS.format(this)),
            this._toString
          );
        }
        static getLighterColor(e, t, n) {
          if (e.isLighterThan(t)) return e;
          n = n || 0.5;
          const r = e.getRelativeLuminance(),
            i = t.getRelativeLuminance();
          return (n = (n * (i - r)) / i), e.lighten(n);
        }
        static getDarkerColor(e, t, n) {
          if (e.isDarkerThan(t)) return e;
          n = n || 0.5;
          const r = e.getRelativeLuminance();
          return (n = (n * (r - t.getRelativeLuminance())) / r), e.darken(n);
        }
      }
      function Wi(e) {
        const t = [];
        for (const n of e) {
          const e = Number(n);
          (e || (0 === e && '' !== n.replace(/\s/g, ''))) && t.push(e);
        }
        return t;
      }
      function zi(e, t, n, r) {
        return { red: e / 255, blue: n / 255, green: t / 255, alpha: r };
      }
      function Hi(e, t) {
        const n = t.index,
          r = t[0].length;
        if (!n) return;
        const i = e.positionAt(n);
        return {
          startLineNumber: i.lineNumber,
          startColumn: i.column,
          endLineNumber: i.lineNumber,
          endColumn: i.column + r,
        };
      }
      function Gi(e, t) {
        if (!e) return;
        const n = $i.Format.CSS.parseHex(t);
        return n
          ? { range: e, color: zi(n.rgba.r, n.rgba.g, n.rgba.b, n.rgba.a) }
          : void 0;
      }
      function Ji(e, t, n) {
        if (!e || 1 !== t.length) return;
        const r = Wi(t[0].values());
        return { range: e, color: zi(r[0], r[1], r[2], n ? r[3] : 1) };
      }
      function Xi(e, t, n) {
        if (!e || 1 !== t.length) return;
        const r = Wi(t[0].values()),
          i = new $i(new Bi(r[0], r[1] / 100, r[2] / 100, n ? r[3] : 1));
        return { range: e, color: zi(i.rgba.r, i.rgba.g, i.rgba.b, i.rgba.a) };
      }
      function Qi(e, t) {
        return 'string' == typeof e ? [...e.matchAll(t)] : e.findMatches(t);
      }
      function Yi(e) {
        return e &&
          'function' == typeof e.getValue &&
          'function' == typeof e.positionAt
          ? (function (e) {
              const t = [],
                n = Qi(
                  e,
                  /\b(rgb|rgba|hsl|hsla)(\([0-9\s,.\%]*\))|(#)([A-Fa-f0-9]{3})\b|(#)([A-Fa-f0-9]{4})\b|(#)([A-Fa-f0-9]{6})\b|(#)([A-Fa-f0-9]{8})\b/gm,
                );
              if (n.length > 0)
                for (const r of n) {
                  const n = r.filter(e => void 0 !== e),
                    i = n[1],
                    o = n[2];
                  if (!o) continue;
                  let s;
                  if ('rgb' === i) {
                    const t =
                      /^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*\)$/gm;
                    s = Ji(Hi(e, r), Qi(o, t), !1);
                  } else if ('rgba' === i) {
                    const t =
                      /^\(\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
                    s = Ji(Hi(e, r), Qi(o, t), !0);
                  } else if ('hsl' === i) {
                    const t =
                      /^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*\)$/gm;
                    s = Xi(Hi(e, r), Qi(o, t), !1);
                  } else if ('hsla' === i) {
                    const t =
                      /^\(\s*(36[0]|3[0-5][0-9]|[12][0-9][0-9]|[1-9]?[0-9])\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(100|\d{1,2}[.]\d*|\d{1,2})%\s*,\s*(0[.][0-9]+|[.][0-9]+|[01][.]|[01])\s*\)$/gm;
                    s = Xi(Hi(e, r), Qi(o, t), !0);
                  } else '#' === i && (s = Gi(Hi(e, r), i + o));
                  s && t.push(s);
                }
              return t;
            })(e)
          : [];
      }
      ($i.white = new $i(new Ui(255, 255, 255, 1))),
        ($i.black = new $i(new Ui(0, 0, 0, 1))),
        ($i.red = new $i(new Ui(255, 0, 0, 1))),
        ($i.blue = new $i(new Ui(0, 0, 255, 1))),
        ($i.green = new $i(new Ui(0, 255, 0, 1))),
        ($i.cyan = new $i(new Ui(0, 255, 255, 1))),
        ($i.lightgrey = new $i(new Ui(211, 211, 211, 1))),
        ($i.transparent = new $i(new Ui(0, 0, 0, 0))),
        (function (e) {
          let t;
          !(function (t) {
            let n;
            !(function (t) {
              function n(e) {
                const t = e.toString(16);
                return 2 !== t.length ? '0' + t : t;
              }
              function r(e) {
                switch (e) {
                  case 48:
                    return 0;
                  case 49:
                    return 1;
                  case 50:
                    return 2;
                  case 51:
                    return 3;
                  case 52:
                    return 4;
                  case 53:
                    return 5;
                  case 54:
                    return 6;
                  case 55:
                    return 7;
                  case 56:
                    return 8;
                  case 57:
                    return 9;
                  case 97:
                  case 65:
                    return 10;
                  case 98:
                  case 66:
                    return 11;
                  case 99:
                  case 67:
                    return 12;
                  case 100:
                  case 68:
                    return 13;
                  case 101:
                  case 69:
                    return 14;
                  case 102:
                  case 70:
                    return 15;
                }
                return 0;
              }
              (t.formatRGB = function (t) {
                return 1 === t.rgba.a
                  ? `rgb(${t.rgba.r}, ${t.rgba.g}, ${t.rgba.b})`
                  : e.Format.CSS.formatRGBA(t);
              }),
                (t.formatRGBA = function (e) {
                  return `rgba(${e.rgba.r}, ${e.rgba.g}, ${
                    e.rgba.b
                  }, ${+e.rgba.a.toFixed(2)})`;
                }),
                (t.formatHSL = function (t) {
                  return 1 === t.hsla.a
                    ? `hsl(${t.hsla.h}, ${(100 * t.hsla.s).toFixed(2)}%, ${(
                        100 * t.hsla.l
                      ).toFixed(2)}%)`
                    : e.Format.CSS.formatHSLA(t);
                }),
                (t.formatHSLA = function (e) {
                  return `hsla(${e.hsla.h}, ${(100 * e.hsla.s).toFixed(2)}%, ${(
                    100 * e.hsla.l
                  ).toFixed(2)}%, ${e.hsla.a.toFixed(2)})`;
                }),
                (t.formatHex = function (e) {
                  return `#${n(e.rgba.r)}${n(e.rgba.g)}${n(e.rgba.b)}`;
                }),
                (t.formatHexA = function (t, r = !1) {
                  return r && 1 === t.rgba.a
                    ? e.Format.CSS.formatHex(t)
                    : `#${n(t.rgba.r)}${n(t.rgba.g)}${n(t.rgba.b)}${n(
                        Math.round(255 * t.rgba.a),
                      )}`;
                }),
                (t.format = function (t) {
                  return t.isOpaque()
                    ? e.Format.CSS.formatHex(t)
                    : e.Format.CSS.formatRGBA(t);
                }),
                (t.parseHex = function (t) {
                  const n = t.length;
                  if (0 === n) return null;
                  if (35 !== t.charCodeAt(0)) return null;
                  if (7 === n) {
                    const n = 16 * r(t.charCodeAt(1)) + r(t.charCodeAt(2)),
                      i = 16 * r(t.charCodeAt(3)) + r(t.charCodeAt(4)),
                      o = 16 * r(t.charCodeAt(5)) + r(t.charCodeAt(6));
                    return new e(new Ui(n, i, o, 1));
                  }
                  if (9 === n) {
                    const n = 16 * r(t.charCodeAt(1)) + r(t.charCodeAt(2)),
                      i = 16 * r(t.charCodeAt(3)) + r(t.charCodeAt(4)),
                      o = 16 * r(t.charCodeAt(5)) + r(t.charCodeAt(6)),
                      s = 16 * r(t.charCodeAt(7)) + r(t.charCodeAt(8));
                    return new e(new Ui(n, i, o, s / 255));
                  }
                  if (4 === n) {
                    const n = r(t.charCodeAt(1)),
                      i = r(t.charCodeAt(2)),
                      o = r(t.charCodeAt(3));
                    return new e(new Ui(16 * n + n, 16 * i + i, 16 * o + o));
                  }
                  if (5 === n) {
                    const n = r(t.charCodeAt(1)),
                      i = r(t.charCodeAt(2)),
                      o = r(t.charCodeAt(3)),
                      s = r(t.charCodeAt(4));
                    return new e(
                      new Ui(
                        16 * n + n,
                        16 * i + i,
                        16 * o + o,
                        (16 * s + s) / 255,
                      ),
                    );
                  }
                  return null;
                });
            })((n = t.CSS || (t.CSS = {})));
          })((t = e.Format || (e.Format = {})));
        })($i || ($i = {}));
      class Zi extends Kt {
        get uri() {
          return this._uri;
        }
        get eol() {
          return this._eol;
        }
        getValue() {
          return this.getText();
        }
        findMatches(e) {
          const t = [];
          for (let n = 0; n < this._lines.length; n++) {
            const r = this._lines[n],
              i = this.offsetAt(new Mt(n + 1, 1)),
              o = r.matchAll(e);
            for (const e of o)
              (e.index || 0 === e.index) && (e.index = e.index + i), t.push(e);
          }
          return t;
        }
        getLinesContent() {
          return this._lines.slice(0);
        }
        getLineCount() {
          return this._lines.length;
        }
        getLineContent(e) {
          return this._lines[e - 1];
        }
        getWordAtPosition(e, t) {
          const n = Ht(e.column, Wt(t), this._lines[e.lineNumber - 1], 0);
          return n
            ? new Pt(e.lineNumber, n.startColumn, e.lineNumber, n.endColumn)
            : null;
        }
        words(e) {
          const t = this._lines,
            n = this._wordenize.bind(this);
          let r = 0,
            i = '',
            o = 0,
            s = [];
          return {
            *[Symbol.iterator]() {
              for (;;)
                if (o < s.length) {
                  const e = i.substring(s[o].start, s[o].end);
                  (o += 1), yield e;
                } else {
                  if (!(r < t.length)) break;
                  (i = t[r]), (s = n(i, e)), (o = 0), (r += 1);
                }
            },
          };
        }
        getLineWords(e, t) {
          const n = this._lines[e - 1],
            r = this._wordenize(n, t),
            i = [];
          for (const e of r)
            i.push({
              word: n.substring(e.start, e.end),
              startColumn: e.start + 1,
              endColumn: e.end + 1,
            });
          return i;
        }
        _wordenize(e, t) {
          const n = [];
          let r;
          for (t.lastIndex = 0; (r = t.exec(e)) && 0 !== r[0].length; )
            n.push({ start: r.index, end: r.index + r[0].length });
          return n;
        }
        getValueInRange(e) {
          if ((e = this._validateRange(e)).startLineNumber === e.endLineNumber)
            return this._lines[e.startLineNumber - 1].substring(
              e.startColumn - 1,
              e.endColumn - 1,
            );
          const t = this._eol,
            n = e.startLineNumber - 1,
            r = e.endLineNumber - 1,
            i = [];
          i.push(this._lines[n].substring(e.startColumn - 1));
          for (let e = n + 1; e < r; e++) i.push(this._lines[e]);
          return (
            i.push(this._lines[r].substring(0, e.endColumn - 1)), i.join(t)
          );
        }
        offsetAt(e) {
          return (
            (e = this._validatePosition(e)),
            this._ensureLineStarts(),
            this._lineStarts.getPrefixSum(e.lineNumber - 2) + (e.column - 1)
          );
        }
        positionAt(e) {
          (e = Math.floor(e)), (e = Math.max(0, e)), this._ensureLineStarts();
          const t = this._lineStarts.getIndexOf(e),
            n = this._lines[t.index].length;
          return {
            lineNumber: 1 + t.index,
            column: 1 + Math.min(t.remainder, n),
          };
        }
        _validateRange(e) {
          const t = this._validatePosition({
              lineNumber: e.startLineNumber,
              column: e.startColumn,
            }),
            n = this._validatePosition({
              lineNumber: e.endLineNumber,
              column: e.endColumn,
            });
          return t.lineNumber !== e.startLineNumber ||
            t.column !== e.startColumn ||
            n.lineNumber !== e.endLineNumber ||
            n.column !== e.endColumn
            ? {
                startLineNumber: t.lineNumber,
                startColumn: t.column,
                endLineNumber: n.lineNumber,
                endColumn: n.column,
              }
            : e;
        }
        _validatePosition(e) {
          if (!Mt.isIPosition(e)) throw new Error('bad position');
          let { lineNumber: t, column: n } = e,
            r = !1;
          if (t < 1) (t = 1), (n = 1), (r = !0);
          else if (t > this._lines.length)
            (t = this._lines.length),
              (n = this._lines[t - 1].length + 1),
              (r = !0);
          else {
            const e = this._lines[t - 1].length + 1;
            n < 1 ? ((n = 1), (r = !0)) : n > e && ((n = e), (r = !0));
          }
          return r ? { lineNumber: t, column: n } : e;
        }
      }
      class eo {
        constructor(e, t) {
          (this._host = e),
            (this._models = Object.create(null)),
            (this._foreignModuleFactory = t),
            (this._foreignModule = null);
        }
        dispose() {
          this._models = Object.create(null);
        }
        _getModel(e) {
          return this._models[e];
        }
        _getModels() {
          const e = [];
          return (
            Object.keys(this._models).forEach(t => e.push(this._models[t])), e
          );
        }
        acceptNewModel(e) {
          this._models[e.url] = new Zi(
            _t.parse(e.url),
            e.lines,
            e.EOL,
            e.versionId,
          );
        }
        acceptModelChanged(e, t) {
          if (!this._models[e]) return;
          this._models[e].onEvents(t);
        }
        acceptRemovedModel(e) {
          this._models[e] && delete this._models[e];
        }
        async computeUnicodeHighlights(e, t, n) {
          const r = this._getModel(e);
          return r
            ? jr.computeUnicodeHighlights(r, t, n)
            : {
                ranges: [],
                hasMore: !1,
                ambiguousCharacterCount: 0,
                invisibleCharacterCount: 0,
                nonBasicAsciiCharacterCount: 0,
              };
        }
        async computeDiff(e, t, n, r) {
          const i = this._getModel(e),
            o = this._getModel(t);
          if (!i || !o) return null;
          return eo.computeDiff(i, o, n, r);
        }
        static computeDiff(e, t, n, r) {
          const i = 'advanced' === r ? Vi() : Di(),
            o = e.getLinesContent(),
            s = t.getLinesContent(),
            a = i.computeDiff(o, s, n);
          function l(e) {
            return e.map(e => {
              var t;
              return [
                e.original.startLineNumber,
                e.original.endLineNumberExclusive,
                e.modified.startLineNumber,
                e.modified.endLineNumberExclusive,
                null === (t = e.innerChanges) || void 0 === t
                  ? void 0
                  : t.map(e => [
                      e.originalRange.startLineNumber,
                      e.originalRange.startColumn,
                      e.originalRange.endLineNumber,
                      e.originalRange.endColumn,
                      e.modifiedRange.startLineNumber,
                      e.modifiedRange.startColumn,
                      e.modifiedRange.endLineNumber,
                      e.modifiedRange.endColumn,
                    ]),
              ];
            });
          }
          return {
            identical:
              !(a.changes.length > 0) && this._modelsAreIdentical(e, t),
            quitEarly: a.hitTimeout,
            changes: l(a.changes),
            moves: a.moves.map(e => [
              e.lineRangeMapping.original.startLineNumber,
              e.lineRangeMapping.original.endLineNumberExclusive,
              e.lineRangeMapping.modified.startLineNumber,
              e.lineRangeMapping.modified.endLineNumberExclusive,
              l(e.changes),
            ]),
          };
        }
        static _modelsAreIdentical(e, t) {
          const n = e.getLineCount();
          if (n !== t.getLineCount()) return !1;
          for (let r = 1; r <= n; r++) {
            if (e.getLineContent(r) !== t.getLineContent(r)) return !1;
          }
          return !0;
        }
        async computeMoreMinimalEdits(e, t, n) {
          const r = this._getModel(e);
          if (!r) return t;
          const i = [];
          let o;
          t = t.slice(0).sort((e, t) => {
            if (e.range && t.range)
              return Pt.compareRangesUsingStarts(e.range, t.range);
            return (e.range ? 0 : 1) - (t.range ? 0 : 1);
          });
          let s = 0;
          for (let e = 1; e < t.length; e++)
            Pt.getEndPosition(t[s].range).equals(
              Pt.getStartPosition(t[e].range),
            )
              ? ((t[s].range = Pt.fromPositions(
                  Pt.getStartPosition(t[s].range),
                  Pt.getEndPosition(t[e].range),
                )),
                (t[s].text += t[e].text))
              : (s++, (t[s] = t[e]));
          t.length = s + 1;
          for (let { range: e, text: s, eol: a } of t) {
            if (('number' == typeof a && (o = a), Pt.isEmpty(e) && !s))
              continue;
            const t = r.getValueInRange(e);
            if (((s = s.replace(/\r\n|\n|\r/g, r.eol)), t === s)) continue;
            if (Math.max(s.length, t.length) > eo._diffLimit) {
              i.push({ range: e, text: s });
              continue;
            }
            const l = $e(t, s, n),
              u = r.offsetAt(Pt.lift(e).getStartPosition());
            for (const e of l) {
              const t = r.positionAt(u + e.originalStart),
                n = r.positionAt(u + e.originalStart + e.originalLength),
                o = {
                  text: s.substr(e.modifiedStart, e.modifiedLength),
                  range: {
                    startLineNumber: t.lineNumber,
                    startColumn: t.column,
                    endLineNumber: n.lineNumber,
                    endColumn: n.column,
                  },
                };
              r.getValueInRange(o.range) !== o.text && i.push(o);
            }
          }
          return (
            'number' == typeof o &&
              i.push({
                eol: o,
                text: '',
                range: {
                  startLineNumber: 0,
                  startColumn: 0,
                  endLineNumber: 0,
                  endColumn: 0,
                },
              }),
            i
          );
        }
        async computeLinks(e) {
          const t = this._getModel(e);
          return t
            ? (function (e) {
                return e &&
                  'function' == typeof e.getLineCount &&
                  'function' == typeof e.getLineContent
                  ? en.computeLinks(e)
                  : [];
              })(t)
            : null;
        }
        async computeDefaultDocumentColors(e) {
          const t = this._getModel(e);
          return t ? Yi(t) : null;
        }
        async textualSuggest(e, t, n, r) {
          const i = new E(),
            o = new RegExp(n, r),
            s = new Set();
          e: for (const n of e) {
            const e = this._getModel(n);
            if (e)
              for (const n of e.words(o))
                if (
                  n !== t &&
                  isNaN(Number(n)) &&
                  (s.add(n), s.size > eo._suggestionsLimit)
                )
                  break e;
          }
          return { words: Array.from(s), duration: i.elapsed() };
        }
        async computeWordRanges(e, t, n, r) {
          const i = this._getModel(e);
          if (!i) return Object.create(null);
          const o = new RegExp(n, r),
            s = Object.create(null);
          for (let e = t.startLineNumber; e < t.endLineNumber; e++) {
            const t = i.getLineWords(e, o);
            for (const n of t) {
              if (!isNaN(Number(n.word))) continue;
              let t = s[n.word];
              t || ((t = []), (s[n.word] = t)),
                t.push({
                  startLineNumber: e,
                  startColumn: n.startColumn,
                  endLineNumber: e,
                  endColumn: n.endColumn,
                });
            }
          }
          return s;
        }
        async navigateValueSet(e, t, n, r, i) {
          const o = this._getModel(e);
          if (!o) return null;
          const s = new RegExp(r, i);
          t.startColumn === t.endColumn &&
            (t = {
              startLineNumber: t.startLineNumber,
              startColumn: t.startColumn,
              endLineNumber: t.endLineNumber,
              endColumn: t.endColumn + 1,
            });
          const a = o.getValueInRange(t),
            l = o.getWordAtPosition(
              { lineNumber: t.startLineNumber, column: t.startColumn },
              s,
            );
          if (!l) return null;
          const u = o.getValueInRange(l);
          return tn.INSTANCE.navigateValueSet(t, a, l, u, n);
        }
        loadForeignModule(e, t, n) {
          const r = (function (e, t) {
              const n = e =>
                  function () {
                    const n = Array.prototype.slice.call(arguments, 0);
                    return t(e, n);
                  },
                r = {};
              for (const t of e) r[t] = n(t);
              return r;
            })(n, (e, t) => this._host.fhr(e, t)),
            i = { host: r, getMirrorModels: () => this._getModels() };
          return this._foreignModuleFactory
            ? ((this._foreignModule = this._foreignModuleFactory(i, t)),
              Promise.resolve(M(this._foreignModule)))
            : Promise.reject(new Error('Unexpected usage'));
        }
        fmr(e, t) {
          if (
            !this._foreignModule ||
            'function' != typeof this._foreignModule[e]
          )
            return Promise.reject(
              new Error('Missing requestHandler or method: ' + e),
            );
          try {
            return Promise.resolve(
              this._foreignModule[e].apply(this._foreignModule, t),
            );
          } catch (e) {
            return Promise.reject(e);
          }
        }
      }
      (eo._diffLimit = 1e5),
        (eo._suggestionsLimit = 1e4),
        'function' == typeof importScripts &&
          (globalThis.monaco = {
            editor: void 0,
            languages: void 0,
            CancellationTokenSource: sn,
            Emitter: R,
            KeyCode: rr,
            KeyMod: Ar,
            Position: Mt,
            Range: Pt,
            Selection: vn,
            SelectionDirection: pr,
            MarkerSeverity: ir,
            MarkerTag: or,
            Uri: _t,
            Token: kn,
          });
      let to = !1;
      function no(e) {
        if (to) return;
        to = !0;
        const t = new Ie(
          e => {
            globalThis.postMessage(e);
          },
          t => new eo(t, e),
        );
        globalThis.onmessage = e => {
          t.onmessage(e.data);
        };
      }
      globalThis.onmessage = e => {
        to || no(null);
      };
      var ro,
        io = n(364),
        oo = n(907);
      function so(e, t) {
        void 0 === t && (t = !1);
        var n = e.length,
          r = 0,
          i = '',
          o = 0,
          s = 16,
          a = 0,
          l = 0,
          u = 0,
          c = 0,
          h = 0;
        function f(t, n) {
          for (var i = 0, o = 0; i < t || !n; ) {
            var s = e.charCodeAt(r);
            if (s >= 48 && s <= 57) o = 16 * o + s - 48;
            else if (s >= 65 && s <= 70) o = 16 * o + s - 65 + 10;
            else {
              if (!(s >= 97 && s <= 102)) break;
              o = 16 * o + s - 97 + 10;
            }
            r++, i++;
          }
          return i < t && (o = -1), o;
        }
        function d() {
          if (((i = ''), (h = 0), (o = r), (l = a), (c = u), r >= n))
            return (o = n), (s = 17);
          var t = e.charCodeAt(r);
          if (ao(t)) {
            do {
              r++, (i += String.fromCharCode(t)), (t = e.charCodeAt(r));
            } while (ao(t));
            return (s = 15);
          }
          if (lo(t))
            return (
              r++,
              (i += String.fromCharCode(t)),
              13 === t && 10 === e.charCodeAt(r) && (r++, (i += '\n')),
              a++,
              (u = r),
              (s = 14)
            );
          switch (t) {
            case 123:
              return r++, (s = 1);
            case 125:
              return r++, (s = 2);
            case 91:
              return r++, (s = 3);
            case 93:
              return r++, (s = 4);
            case 58:
              return r++, (s = 6);
            case 44:
              return r++, (s = 5);
            case 34:
              return (
                r++,
                (i = (function () {
                  for (var t = '', i = r; ; ) {
                    if (r >= n) {
                      (t += e.substring(i, r)), (h = 2);
                      break;
                    }
                    var o = e.charCodeAt(r);
                    if (34 === o) {
                      (t += e.substring(i, r)), r++;
                      break;
                    }
                    if (92 !== o) {
                      if (o >= 0 && o <= 31) {
                        if (lo(o)) {
                          (t += e.substring(i, r)), (h = 2);
                          break;
                        }
                        h = 6;
                      }
                      r++;
                    } else {
                      if (((t += e.substring(i, r)), ++r >= n)) {
                        h = 2;
                        break;
                      }
                      switch (e.charCodeAt(r++)) {
                        case 34:
                          t += '"';
                          break;
                        case 92:
                          t += '\\';
                          break;
                        case 47:
                          t += '/';
                          break;
                        case 98:
                          t += '\b';
                          break;
                        case 102:
                          t += '\f';
                          break;
                        case 110:
                          t += '\n';
                          break;
                        case 114:
                          t += '\r';
                          break;
                        case 116:
                          t += '\t';
                          break;
                        case 117:
                          var s = f(4, !0);
                          s >= 0 ? (t += String.fromCharCode(s)) : (h = 4);
                          break;
                        default:
                          h = 5;
                      }
                      i = r;
                    }
                  }
                  return t;
                })()),
                (s = 10)
              );
            case 47:
              var d = r - 1;
              if (47 === e.charCodeAt(r + 1)) {
                for (r += 2; r < n && !lo(e.charCodeAt(r)); ) r++;
                return (i = e.substring(d, r)), (s = 12);
              }
              if (42 === e.charCodeAt(r + 1)) {
                r += 2;
                for (var m = n - 1, p = !1; r < m; ) {
                  var y = e.charCodeAt(r);
                  if (42 === y && 47 === e.charCodeAt(r + 1)) {
                    (r += 2), (p = !0);
                    break;
                  }
                  r++,
                    lo(y) &&
                      (13 === y && 10 === e.charCodeAt(r) && r++, a++, (u = r));
                }
                return p || (r++, (h = 1)), (i = e.substring(d, r)), (s = 13);
              }
              return (i += String.fromCharCode(t)), r++, (s = 16);
            case 45:
              if (
                ((i += String.fromCharCode(t)),
                ++r === n || !uo(e.charCodeAt(r)))
              )
                return (s = 16);
            case 48:
            case 49:
            case 50:
            case 51:
            case 52:
            case 53:
            case 54:
            case 55:
            case 56:
            case 57:
              return (
                (i += (function () {
                  var t = r;
                  if (48 === e.charCodeAt(r)) r++;
                  else for (r++; r < e.length && uo(e.charCodeAt(r)); ) r++;
                  if (r < e.length && 46 === e.charCodeAt(r)) {
                    if (!(++r < e.length && uo(e.charCodeAt(r))))
                      return (h = 3), e.substring(t, r);
                    for (r++; r < e.length && uo(e.charCodeAt(r)); ) r++;
                  }
                  var n = r;
                  if (
                    r < e.length &&
                    (69 === e.charCodeAt(r) || 101 === e.charCodeAt(r))
                  )
                    if (
                      (((++r < e.length && 43 === e.charCodeAt(r)) ||
                        45 === e.charCodeAt(r)) &&
                        r++,
                      r < e.length && uo(e.charCodeAt(r)))
                    ) {
                      for (r++; r < e.length && uo(e.charCodeAt(r)); ) r++;
                      n = r;
                    } else h = 3;
                  return e.substring(t, n);
                })()),
                (s = 11)
              );
            default:
              for (; r < n && g(t); ) r++, (t = e.charCodeAt(r));
              if (o !== r) {
                switch ((i = e.substring(o, r))) {
                  case 'true':
                    return (s = 8);
                  case 'false':
                    return (s = 9);
                  case 'null':
                    return (s = 7);
                }
                return (s = 16);
              }
              return (i += String.fromCharCode(t)), r++, (s = 16);
          }
        }
        function g(e) {
          if (ao(e) || lo(e)) return !1;
          switch (e) {
            case 125:
            case 93:
            case 123:
            case 91:
            case 34:
            case 58:
            case 44:
            case 47:
              return !1;
          }
          return !0;
        }
        return {
          setPosition: function (e) {
            (r = e), (i = ''), (o = 0), (s = 16), (h = 0);
          },
          getPosition: function () {
            return r;
          },
          scan: t
            ? function () {
                var e;
                do {
                  e = d();
                } while (e >= 12 && e <= 15);
                return e;
              }
            : d,
          getToken: function () {
            return s;
          },
          getTokenValue: function () {
            return i;
          },
          getTokenOffset: function () {
            return o;
          },
          getTokenLength: function () {
            return r - o;
          },
          getTokenStartLine: function () {
            return l;
          },
          getTokenStartCharacter: function () {
            return o - c;
          },
          getTokenError: function () {
            return h;
          },
        };
      }
      function ao(e) {
        return (
          32 === e ||
          9 === e ||
          11 === e ||
          12 === e ||
          160 === e ||
          5760 === e ||
          (e >= 8192 && e <= 8203) ||
          8239 === e ||
          8287 === e ||
          12288 === e ||
          65279 === e
        );
      }
      function lo(e) {
        return 10 === e || 13 === e || 8232 === e || 8233 === e;
      }
      function uo(e) {
        return e >= 48 && e <= 57;
      }
      function co(e, t, n) {
        var r, i, o, s, a;
        if (t) {
          for (s = t.offset, a = s + t.length, o = s; o > 0 && !fo(e, o - 1); )
            o--;
          for (var l = a; l < e.length && !fo(e, l); ) l++;
          (i = e.substring(o, l)),
            (r = (function (e, t) {
              var n = 0,
                r = 0,
                i = t.tabSize || 4;
              for (; n < e.length; ) {
                var o = e.charAt(n);
                if (' ' === o) r++;
                else {
                  if ('\t' !== o) break;
                  r += i;
                }
                n++;
              }
              return Math.floor(r / i);
            })(i, n));
        } else (i = e), (r = 0), (o = 0), (s = 0), (a = e.length);
        var u,
          c = (function (e, t) {
            for (var n = 0; n < t.length; n++) {
              var r = t.charAt(n);
              if ('\r' === r)
                return n + 1 < t.length && '\n' === t.charAt(n + 1)
                  ? '\r\n'
                  : '\r';
              if ('\n' === r) return '\n';
            }
            return (e && e.eol) || '\n';
          })(n, e),
          h = !1,
          f = 0;
        u = n.insertSpaces ? ho(' ', n.tabSize || 4) : '\t';
        var d = so(i, !1),
          g = !1;
        function m() {
          return c + ho(u, r + f);
        }
        function p() {
          var e = d.scan();
          for (h = !1; 15 === e || 14 === e; )
            (h = h || 14 === e), (e = d.scan());
          return (g = 16 === e || 0 !== d.getTokenError()), e;
        }
        var y = [];
        function b(n, r, i) {
          g ||
            (t && !(r < a && i > s)) ||
            e.substring(r, i) === n ||
            y.push({ offset: r, length: i - r, content: n });
        }
        var v = p();
        if (17 !== v) {
          var w = d.getTokenOffset() + o;
          b(ho(u, r), o, w);
        }
        for (; 17 !== v; ) {
          for (
            var S = d.getTokenOffset() + d.getTokenLength() + o,
              _ = p(),
              C = '',
              E = !1;
            !h && (12 === _ || 13 === _);

          ) {
            b(' ', S, d.getTokenOffset() + o),
              (S = d.getTokenOffset() + d.getTokenLength() + o),
              (C = (E = 12 === _) ? m() : ''),
              (_ = p());
          }
          if (2 === _) 1 !== v && (f--, (C = m()));
          else if (4 === _) 3 !== v && (f--, (C = m()));
          else {
            switch (v) {
              case 3:
              case 1:
                f++, (C = m());
                break;
              case 5:
              case 12:
                C = m();
                break;
              case 13:
                h ? (C = m()) : E || (C = ' ');
                break;
              case 6:
                E || (C = ' ');
                break;
              case 10:
                if (6 === _) {
                  E || (C = '');
                  break;
                }
              case 7:
              case 8:
              case 9:
              case 11:
              case 2:
              case 4:
                12 === _ || 13 === _
                  ? E || (C = ' ')
                  : 5 !== _ && 17 !== _ && (g = !0);
                break;
              case 16:
                g = !0;
            }
            !h || (12 !== _ && 13 !== _) || (C = m());
          }
          17 === _ && (C = n.insertFinalNewline ? c : ''),
            b(C, S, d.getTokenOffset() + o),
            (v = _);
        }
        return y;
      }
      function ho(e, t) {
        for (var n = '', r = 0; r < t; r++) n += e;
        return n;
      }
      function fo(e, t) {
        return -1 !== '\r\n'.indexOf(e.charAt(t));
      }
      (ro || (ro = {})).DEFAULT = { allowTrailingComma: !1 };
      var go,
        mo,
        po,
        yo,
        bo,
        vo,
        wo,
        So,
        _o,
        Co,
        Eo,
        Ao,
        xo,
        No,
        Lo,
        Oo,
        ko,
        Ro,
        To,
        Mo,
        Po,
        Io,
        jo,
        Fo,
        Do,
        Vo,
        qo,
        Uo,
        Bo,
        Ko,
        $o,
        Wo,
        zo,
        Ho,
        Go,
        Jo,
        Xo,
        Qo,
        Yo,
        Zo,
        es,
        ts,
        ns,
        rs,
        is,
        os,
        ss,
        as,
        ls,
        us = so,
        cs = function (e, t, n) {
          void 0 === t && (t = []), void 0 === n && (n = ro.DEFAULT);
          var r = null,
            i = [],
            o = [];
          function s(e) {
            Array.isArray(i) ? i.push(e) : null !== r && (i[r] = e);
          }
          return (
            (function (e, t, n) {
              void 0 === n && (n = ro.DEFAULT);
              var r = so(e, !1);
              function i(e) {
                return e
                  ? function () {
                      return e(
                        r.getTokenOffset(),
                        r.getTokenLength(),
                        r.getTokenStartLine(),
                        r.getTokenStartCharacter(),
                      );
                    }
                  : function () {
                      return !0;
                    };
              }
              function o(e) {
                return e
                  ? function (t) {
                      return e(
                        t,
                        r.getTokenOffset(),
                        r.getTokenLength(),
                        r.getTokenStartLine(),
                        r.getTokenStartCharacter(),
                      );
                    }
                  : function () {
                      return !0;
                    };
              }
              var s = i(t.onObjectBegin),
                a = o(t.onObjectProperty),
                l = i(t.onObjectEnd),
                u = i(t.onArrayBegin),
                c = i(t.onArrayEnd),
                h = o(t.onLiteralValue),
                f = o(t.onSeparator),
                d = i(t.onComment),
                g = o(t.onError),
                m = n && n.disallowComments,
                p = n && n.allowTrailingComma;
              function y() {
                for (;;) {
                  var e = r.scan();
                  switch (r.getTokenError()) {
                    case 4:
                      b(14);
                      break;
                    case 5:
                      b(15);
                      break;
                    case 3:
                      b(13);
                      break;
                    case 1:
                      m || b(11);
                      break;
                    case 2:
                      b(12);
                      break;
                    case 6:
                      b(16);
                  }
                  switch (e) {
                    case 12:
                    case 13:
                      m ? b(10) : d();
                      break;
                    case 16:
                      b(1);
                      break;
                    case 15:
                    case 14:
                      break;
                    default:
                      return e;
                  }
                }
              }
              function b(e, t, n) {
                if (
                  (void 0 === t && (t = []),
                  void 0 === n && (n = []),
                  g(e),
                  t.length + n.length > 0)
                )
                  for (var i = r.getToken(); 17 !== i; ) {
                    if (-1 !== t.indexOf(i)) {
                      y();
                      break;
                    }
                    if (-1 !== n.indexOf(i)) break;
                    i = y();
                  }
              }
              function v(e) {
                var t = r.getTokenValue();
                return e ? h(t) : a(t), y(), !0;
              }
              function w() {
                switch (r.getToken()) {
                  case 11:
                    var e = r.getTokenValue(),
                      t = Number(e);
                    isNaN(t) && (b(2), (t = 0)), h(t);
                    break;
                  case 7:
                    h(null);
                    break;
                  case 8:
                    h(!0);
                    break;
                  case 9:
                    h(!1);
                    break;
                  default:
                    return !1;
                }
                return y(), !0;
              }
              function S() {
                return 10 !== r.getToken()
                  ? (b(3, [], [2, 5]), !1)
                  : (v(!1),
                    6 === r.getToken()
                      ? (f(':'), y(), E() || b(4, [], [2, 5]))
                      : b(5, [], [2, 5]),
                    !0);
              }
              function _() {
                s(), y();
                for (var e = !1; 2 !== r.getToken() && 17 !== r.getToken(); ) {
                  if (5 === r.getToken()) {
                    if (
                      (e || b(4, [], []), f(','), y(), 2 === r.getToken() && p)
                    )
                      break;
                  } else e && b(6, [], []);
                  S() || b(4, [], [2, 5]), (e = !0);
                }
                return l(), 2 !== r.getToken() ? b(7, [2], []) : y(), !0;
              }
              function C() {
                u(), y();
                for (var e = !1; 4 !== r.getToken() && 17 !== r.getToken(); ) {
                  if (5 === r.getToken()) {
                    if (
                      (e || b(4, [], []), f(','), y(), 4 === r.getToken() && p)
                    )
                      break;
                  } else e && b(6, [], []);
                  E() || b(4, [], [4, 5]), (e = !0);
                }
                return c(), 4 !== r.getToken() ? b(8, [4], []) : y(), !0;
              }
              function E() {
                switch (r.getToken()) {
                  case 3:
                    return C();
                  case 1:
                    return _();
                  case 10:
                    return v(!0);
                  default:
                    return w();
                }
              }
              if ((y(), 17 === r.getToken()))
                return !!n.allowEmptyContent || (b(4, [], []), !1);
              if (!E()) return b(4, [], []), !1;
              17 !== r.getToken() && b(9, [], []);
            })(
              e,
              {
                onObjectBegin: function () {
                  var e = {};
                  s(e), o.push(i), (i = e), (r = null);
                },
                onObjectProperty: function (e) {
                  r = e;
                },
                onObjectEnd: function () {
                  i = o.pop();
                },
                onArrayBegin: function () {
                  var e = [];
                  s(e), o.push(i), (i = e), (r = null);
                },
                onArrayEnd: function () {
                  i = o.pop();
                },
                onLiteralValue: s,
                onError: function (e, n, r) {
                  t.push({ error: e, offset: n, length: r });
                },
              },
              n,
            ),
            i[0]
          );
        },
        hs = function e(t, n, r) {
          if (
            (void 0 === r && (r = !1),
            (function (e, t, n) {
              return (
                void 0 === n && (n = !1),
                (t >= e.offset && t < e.offset + e.length) ||
                  (n && t === e.offset + e.length)
              );
            })(t, n, r))
          ) {
            var i = t.children;
            if (Array.isArray(i))
              for (var o = 0; o < i.length && i[o].offset <= n; o++) {
                var s = e(i[o], n, r);
                if (s) return s;
              }
            return t;
          }
        },
        fs = function e(t) {
          if (!t.parent || !t.parent.children) return [];
          var n = e(t.parent);
          if ('property' === t.parent.type) {
            var r = t.parent.children[0].value;
            n.push(r);
          } else if ('array' === t.parent.type) {
            var i = t.parent.children.indexOf(t);
            -1 !== i && n.push(i);
          }
          return n;
        },
        ds = function e(t) {
          switch (t.type) {
            case 'array':
              return t.children.map(e);
            case 'object':
              for (
                var n = Object.create(null), r = 0, i = t.children;
                r < i.length;
                r++
              ) {
                var o = i[r],
                  s = o.children[1];
                s && (n[o.children[0].value] = e(s));
              }
              return n;
            case 'null':
            case 'string':
            case 'number':
            case 'boolean':
              return t.value;
            default:
              return;
          }
        };
      function gs(e, t) {
        if (e === t) return !0;
        if (null == e || null == t) return !1;
        if (typeof e != typeof t) return !1;
        if ('object' != typeof e) return !1;
        if (Array.isArray(e) !== Array.isArray(t)) return !1;
        var n, r;
        if (Array.isArray(e)) {
          if (e.length !== t.length) return !1;
          for (n = 0; n < e.length; n++) if (!gs(e[n], t[n])) return !1;
        } else {
          var i = [];
          for (r in e) i.push(r);
          i.sort();
          var o = [];
          for (r in t) o.push(r);
          if ((o.sort(), !gs(i, o))) return !1;
          for (n = 0; n < i.length; n++) if (!gs(e[i[n]], t[i[n]])) return !1;
        }
        return !0;
      }
      function ms(e) {
        return 'number' == typeof e;
      }
      function ps(e) {
        return void 0 !== e;
      }
      function ys(e) {
        return 'boolean' == typeof e;
      }
      function bs(e, t) {
        var n = e.length - t.length;
        return n > 0 ? e.lastIndexOf(t) === n : 0 === n && e === t;
      }
      function vs(e) {
        var t = '';
        (function (e, t) {
          if (e.length < t.length) return !1;
          for (var n = 0; n < t.length; n++) if (e[n] !== t[n]) return !1;
          return !0;
        })(e, '(?i)') && ((e = e.substring(4)), (t = 'i'));
        try {
          return new RegExp(e, t + 'u');
        } catch (n) {
          try {
            return new RegExp(e, t);
          } catch (e) {
            return;
          }
        }
      }
      ((mo = go || (go = {})).MIN_VALUE = -2147483648),
        (mo.MAX_VALUE = 2147483647),
        ((yo = po || (po = {})).MIN_VALUE = 0),
        (yo.MAX_VALUE = 2147483647),
        ((vo = bo || (bo = {})).create = function (e, t) {
          return (
            e === Number.MAX_VALUE && (e = po.MAX_VALUE),
            t === Number.MAX_VALUE && (t = po.MAX_VALUE),
            { line: e, character: t }
          );
        }),
        (vo.is = function (e) {
          var t = e;
          return (
            va.objectLiteral(t) &&
            va.uinteger(t.line) &&
            va.uinteger(t.character)
          );
        }),
        ((So = wo || (wo = {})).create = function (e, t, n, r) {
          if (
            va.uinteger(e) &&
            va.uinteger(t) &&
            va.uinteger(n) &&
            va.uinteger(r)
          )
            return { start: bo.create(e, t), end: bo.create(n, r) };
          if (bo.is(e) && bo.is(t)) return { start: e, end: t };
          throw new Error(
            'Range#create called with invalid arguments[' +
              e +
              ', ' +
              t +
              ', ' +
              n +
              ', ' +
              r +
              ']',
          );
        }),
        (So.is = function (e) {
          var t = e;
          return va.objectLiteral(t) && bo.is(t.start) && bo.is(t.end);
        }),
        ((Co = _o || (_o = {})).create = function (e, t) {
          return { uri: e, range: t };
        }),
        (Co.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            wo.is(t.range) &&
            (va.string(t.uri) || va.undefined(t.uri))
          );
        }),
        ((Ao = Eo || (Eo = {})).create = function (e, t, n, r) {
          return {
            targetUri: e,
            targetRange: t,
            targetSelectionRange: n,
            originSelectionRange: r,
          };
        }),
        (Ao.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            wo.is(t.targetRange) &&
            va.string(t.targetUri) &&
            (wo.is(t.targetSelectionRange) ||
              va.undefined(t.targetSelectionRange)) &&
            (wo.is(t.originSelectionRange) ||
              va.undefined(t.originSelectionRange))
          );
        }),
        ((No = xo || (xo = {})).create = function (e, t, n, r) {
          return { red: e, green: t, blue: n, alpha: r };
        }),
        (No.is = function (e) {
          var t = e;
          return (
            va.numberRange(t.red, 0, 1) &&
            va.numberRange(t.green, 0, 1) &&
            va.numberRange(t.blue, 0, 1) &&
            va.numberRange(t.alpha, 0, 1)
          );
        }),
        ((Oo = Lo || (Lo = {})).create = function (e, t) {
          return { range: e, color: t };
        }),
        (Oo.is = function (e) {
          var t = e;
          return wo.is(t.range) && xo.is(t.color);
        }),
        ((Ro = ko || (ko = {})).create = function (e, t, n) {
          return { label: e, textEdit: t, additionalTextEdits: n };
        }),
        (Ro.is = function (e) {
          var t = e;
          return (
            va.string(t.label) &&
            (va.undefined(t.textEdit) || Ho.is(t)) &&
            (va.undefined(t.additionalTextEdits) ||
              va.typedArray(t.additionalTextEdits, Ho.is))
          );
        }),
        ((Mo = To || (To = {})).Comment = 'comment'),
        (Mo.Imports = 'imports'),
        (Mo.Region = 'region'),
        ((Io = Po || (Po = {})).create = function (e, t, n, r, i) {
          var o = { startLine: e, endLine: t };
          return (
            va.defined(n) && (o.startCharacter = n),
            va.defined(r) && (o.endCharacter = r),
            va.defined(i) && (o.kind = i),
            o
          );
        }),
        (Io.is = function (e) {
          var t = e;
          return (
            va.uinteger(t.startLine) &&
            va.uinteger(t.startLine) &&
            (va.undefined(t.startCharacter) || va.uinteger(t.startCharacter)) &&
            (va.undefined(t.endCharacter) || va.uinteger(t.endCharacter)) &&
            (va.undefined(t.kind) || va.string(t.kind))
          );
        }),
        ((Fo = jo || (jo = {})).create = function (e, t) {
          return { location: e, message: t };
        }),
        (Fo.is = function (e) {
          var t = e;
          return va.defined(t) && _o.is(t.location) && va.string(t.message);
        }),
        ((Vo = Do || (Do = {})).Error = 1),
        (Vo.Warning = 2),
        (Vo.Information = 3),
        (Vo.Hint = 4),
        ((Uo = qo || (qo = {})).Unnecessary = 1),
        (Uo.Deprecated = 2),
        ((Bo || (Bo = {})).is = function (e) {
          var t = e;
          return null != t && va.string(t.href);
        }),
        (($o = Ko || (Ko = {})).create = function (e, t, n, r, i, o) {
          var s = { range: e, message: t };
          return (
            va.defined(n) && (s.severity = n),
            va.defined(r) && (s.code = r),
            va.defined(i) && (s.source = i),
            va.defined(o) && (s.relatedInformation = o),
            s
          );
        }),
        ($o.is = function (e) {
          var t,
            n = e;
          return (
            va.defined(n) &&
            wo.is(n.range) &&
            va.string(n.message) &&
            (va.number(n.severity) || va.undefined(n.severity)) &&
            (va.integer(n.code) || va.string(n.code) || va.undefined(n.code)) &&
            (va.undefined(n.codeDescription) ||
              va.string(
                null === (t = n.codeDescription) || void 0 === t
                  ? void 0
                  : t.href,
              )) &&
            (va.string(n.source) || va.undefined(n.source)) &&
            (va.undefined(n.relatedInformation) ||
              va.typedArray(n.relatedInformation, jo.is))
          );
        }),
        ((zo = Wo || (Wo = {})).create = function (e, t) {
          for (var n = [], r = 2; r < arguments.length; r++)
            n[r - 2] = arguments[r];
          var i = { title: e, command: t };
          return va.defined(n) && n.length > 0 && (i.arguments = n), i;
        }),
        (zo.is = function (e) {
          var t = e;
          return va.defined(t) && va.string(t.title) && va.string(t.command);
        }),
        ((Go = Ho || (Ho = {})).replace = function (e, t) {
          return { range: e, newText: t };
        }),
        (Go.insert = function (e, t) {
          return { range: { start: e, end: e }, newText: t };
        }),
        (Go.del = function (e) {
          return { range: e, newText: '' };
        }),
        (Go.is = function (e) {
          var t = e;
          return va.objectLiteral(t) && va.string(t.newText) && wo.is(t.range);
        }),
        ((Xo = Jo || (Jo = {})).create = function (e, t, n) {
          var r = { label: e };
          return (
            void 0 !== t && (r.needsConfirmation = t),
            void 0 !== n && (r.description = n),
            r
          );
        }),
        (Xo.is = function (e) {
          var t = e;
          return (
            void 0 !== t &&
            va.objectLiteral(t) &&
            va.string(t.label) &&
            (va.boolean(t.needsConfirmation) ||
              void 0 === t.needsConfirmation) &&
            (va.string(t.description) || void 0 === t.description)
          );
        }),
        ((Qo || (Qo = {})).is = function (e) {
          return 'string' == typeof e;
        }),
        ((Zo = Yo || (Yo = {})).replace = function (e, t, n) {
          return { range: e, newText: t, annotationId: n };
        }),
        (Zo.insert = function (e, t, n) {
          return { range: { start: e, end: e }, newText: t, annotationId: n };
        }),
        (Zo.del = function (e, t) {
          return { range: e, newText: '', annotationId: t };
        }),
        (Zo.is = function (e) {
          var t = e;
          return Ho.is(t) && (Jo.is(t.annotationId) || Qo.is(t.annotationId));
        }),
        ((ts = es || (es = {})).create = function (e, t) {
          return { textDocument: e, edits: t };
        }),
        (ts.is = function (e) {
          var t = e;
          return (
            va.defined(t) && Es.is(t.textDocument) && Array.isArray(t.edits)
          );
        }),
        ((rs = ns || (ns = {})).create = function (e, t, n) {
          var r = { kind: 'create', uri: e };
          return (
            void 0 === t ||
              (void 0 === t.overwrite && void 0 === t.ignoreIfExists) ||
              (r.options = t),
            void 0 !== n && (r.annotationId = n),
            r
          );
        }),
        (rs.is = function (e) {
          var t = e;
          return (
            t &&
            'create' === t.kind &&
            va.string(t.uri) &&
            (void 0 === t.options ||
              ((void 0 === t.options.overwrite ||
                va.boolean(t.options.overwrite)) &&
                (void 0 === t.options.ignoreIfExists ||
                  va.boolean(t.options.ignoreIfExists)))) &&
            (void 0 === t.annotationId || Qo.is(t.annotationId))
          );
        }),
        ((os = is || (is = {})).create = function (e, t, n, r) {
          var i = { kind: 'rename', oldUri: e, newUri: t };
          return (
            void 0 === n ||
              (void 0 === n.overwrite && void 0 === n.ignoreIfExists) ||
              (i.options = n),
            void 0 !== r && (i.annotationId = r),
            i
          );
        }),
        (os.is = function (e) {
          var t = e;
          return (
            t &&
            'rename' === t.kind &&
            va.string(t.oldUri) &&
            va.string(t.newUri) &&
            (void 0 === t.options ||
              ((void 0 === t.options.overwrite ||
                va.boolean(t.options.overwrite)) &&
                (void 0 === t.options.ignoreIfExists ||
                  va.boolean(t.options.ignoreIfExists)))) &&
            (void 0 === t.annotationId || Qo.is(t.annotationId))
          );
        }),
        ((as = ss || (ss = {})).create = function (e, t, n) {
          var r = { kind: 'delete', uri: e };
          return (
            void 0 === t ||
              (void 0 === t.recursive && void 0 === t.ignoreIfNotExists) ||
              (r.options = t),
            void 0 !== n && (r.annotationId = n),
            r
          );
        }),
        (as.is = function (e) {
          var t = e;
          return (
            t &&
            'delete' === t.kind &&
            va.string(t.uri) &&
            (void 0 === t.options ||
              ((void 0 === t.options.recursive ||
                va.boolean(t.options.recursive)) &&
                (void 0 === t.options.ignoreIfNotExists ||
                  va.boolean(t.options.ignoreIfNotExists)))) &&
            (void 0 === t.annotationId || Qo.is(t.annotationId))
          );
        }),
        ((ls || (ls = {})).is = function (e) {
          var t = e;
          return (
            t &&
            (void 0 !== t.changes || void 0 !== t.documentChanges) &&
            (void 0 === t.documentChanges ||
              t.documentChanges.every(function (e) {
                return va.string(e.kind)
                  ? ns.is(e) || is.is(e) || ss.is(e)
                  : es.is(e);
              }))
          );
        });
      var ws,
        Ss,
        _s,
        Cs,
        Es,
        As,
        xs,
        Ns,
        Ls,
        Os,
        ks,
        Rs,
        Ts,
        Ms,
        Ps,
        Is,
        js,
        Fs,
        Ds,
        Vs,
        qs,
        Us,
        Bs,
        Ks,
        $s,
        Ws,
        zs,
        Hs,
        Gs,
        Js,
        Xs,
        Qs,
        Ys,
        Zs,
        ea,
        ta,
        na,
        ra,
        ia,
        oa,
        sa,
        aa,
        la,
        ua,
        ca,
        ha,
        fa,
        da,
        ga,
        ma,
        pa,
        ya = (function () {
          function e(e, t) {
            (this.edits = e), (this.changeAnnotations = t);
          }
          return (
            (e.prototype.insert = function (e, t, n) {
              var r, i;
              if (
                (void 0 === n
                  ? (r = Ho.insert(e, t))
                  : Qo.is(n)
                  ? ((i = n), (r = Yo.insert(e, t, n)))
                  : (this.assertChangeAnnotations(this.changeAnnotations),
                    (i = this.changeAnnotations.manage(n)),
                    (r = Yo.insert(e, t, i))),
                this.edits.push(r),
                void 0 !== i)
              )
                return i;
            }),
            (e.prototype.replace = function (e, t, n) {
              var r, i;
              if (
                (void 0 === n
                  ? (r = Ho.replace(e, t))
                  : Qo.is(n)
                  ? ((i = n), (r = Yo.replace(e, t, n)))
                  : (this.assertChangeAnnotations(this.changeAnnotations),
                    (i = this.changeAnnotations.manage(n)),
                    (r = Yo.replace(e, t, i))),
                this.edits.push(r),
                void 0 !== i)
              )
                return i;
            }),
            (e.prototype.delete = function (e, t) {
              var n, r;
              if (
                (void 0 === t
                  ? (n = Ho.del(e))
                  : Qo.is(t)
                  ? ((r = t), (n = Yo.del(e, t)))
                  : (this.assertChangeAnnotations(this.changeAnnotations),
                    (r = this.changeAnnotations.manage(t)),
                    (n = Yo.del(e, r))),
                this.edits.push(n),
                void 0 !== r)
              )
                return r;
            }),
            (e.prototype.add = function (e) {
              this.edits.push(e);
            }),
            (e.prototype.all = function () {
              return this.edits;
            }),
            (e.prototype.clear = function () {
              this.edits.splice(0, this.edits.length);
            }),
            (e.prototype.assertChangeAnnotations = function (e) {
              if (void 0 === e)
                throw new Error(
                  'Text edit change is not configured to manage change annotations.',
                );
            }),
            e
          );
        })(),
        ba = (function () {
          function e(e) {
            (this._annotations = void 0 === e ? Object.create(null) : e),
              (this._counter = 0),
              (this._size = 0);
          }
          return (
            (e.prototype.all = function () {
              return this._annotations;
            }),
            Object.defineProperty(e.prototype, 'size', {
              get: function () {
                return this._size;
              },
              enumerable: !1,
              configurable: !0,
            }),
            (e.prototype.manage = function (e, t) {
              var n;
              if (
                (Qo.is(e) ? (n = e) : ((n = this.nextId()), (t = e)),
                void 0 !== this._annotations[n])
              )
                throw new Error('Id ' + n + ' is already in use.');
              if (void 0 === t)
                throw new Error('No annotation provided for id ' + n);
              return (this._annotations[n] = t), this._size++, n;
            }),
            (e.prototype.nextId = function () {
              return this._counter++, this._counter.toString();
            }),
            e
          );
        })();
      !(function () {
        function e(e) {
          var t = this;
          (this._textEditChanges = Object.create(null)),
            void 0 !== e
              ? ((this._workspaceEdit = e),
                e.documentChanges
                  ? ((this._changeAnnotations = new ba(e.changeAnnotations)),
                    (e.changeAnnotations = this._changeAnnotations.all()),
                    e.documentChanges.forEach(function (e) {
                      if (es.is(e)) {
                        var n = new ya(e.edits, t._changeAnnotations);
                        t._textEditChanges[e.textDocument.uri] = n;
                      }
                    }))
                  : e.changes &&
                    Object.keys(e.changes).forEach(function (n) {
                      var r = new ya(e.changes[n]);
                      t._textEditChanges[n] = r;
                    }))
              : (this._workspaceEdit = {});
        }
        Object.defineProperty(e.prototype, 'edit', {
          get: function () {
            return (
              this.initDocumentChanges(),
              void 0 !== this._changeAnnotations &&
                (0 === this._changeAnnotations.size
                  ? (this._workspaceEdit.changeAnnotations = void 0)
                  : (this._workspaceEdit.changeAnnotations =
                      this._changeAnnotations.all())),
              this._workspaceEdit
            );
          },
          enumerable: !1,
          configurable: !0,
        }),
          (e.prototype.getTextEditChange = function (e) {
            if (Es.is(e)) {
              if (
                (this.initDocumentChanges(),
                void 0 === this._workspaceEdit.documentChanges)
              )
                throw new Error(
                  'Workspace edit is not configured for document changes.',
                );
              var t = { uri: e.uri, version: e.version };
              if (!(r = this._textEditChanges[t.uri])) {
                var n = { textDocument: t, edits: (i = []) };
                this._workspaceEdit.documentChanges.push(n),
                  (r = new ya(i, this._changeAnnotations)),
                  (this._textEditChanges[t.uri] = r);
              }
              return r;
            }
            if ((this.initChanges(), void 0 === this._workspaceEdit.changes))
              throw new Error(
                'Workspace edit is not configured for normal text edit changes.',
              );
            var r;
            if (!(r = this._textEditChanges[e])) {
              var i = [];
              (this._workspaceEdit.changes[e] = i),
                (r = new ya(i)),
                (this._textEditChanges[e] = r);
            }
            return r;
          }),
          (e.prototype.initDocumentChanges = function () {
            void 0 === this._workspaceEdit.documentChanges &&
              void 0 === this._workspaceEdit.changes &&
              ((this._changeAnnotations = new ba()),
              (this._workspaceEdit.documentChanges = []),
              (this._workspaceEdit.changeAnnotations =
                this._changeAnnotations.all()));
          }),
          (e.prototype.initChanges = function () {
            void 0 === this._workspaceEdit.documentChanges &&
              void 0 === this._workspaceEdit.changes &&
              (this._workspaceEdit.changes = Object.create(null));
          }),
          (e.prototype.createFile = function (e, t, n) {
            if (
              (this.initDocumentChanges(),
              void 0 === this._workspaceEdit.documentChanges)
            )
              throw new Error(
                'Workspace edit is not configured for document changes.',
              );
            var r, i, o;
            if (
              (Jo.is(t) || Qo.is(t) ? (r = t) : (n = t),
              void 0 === r
                ? (i = ns.create(e, n))
                : ((o = Qo.is(r) ? r : this._changeAnnotations.manage(r)),
                  (i = ns.create(e, n, o))),
              this._workspaceEdit.documentChanges.push(i),
              void 0 !== o)
            )
              return o;
          }),
          (e.prototype.renameFile = function (e, t, n, r) {
            if (
              (this.initDocumentChanges(),
              void 0 === this._workspaceEdit.documentChanges)
            )
              throw new Error(
                'Workspace edit is not configured for document changes.',
              );
            var i, o, s;
            if (
              (Jo.is(n) || Qo.is(n) ? (i = n) : (r = n),
              void 0 === i
                ? (o = is.create(e, t, r))
                : ((s = Qo.is(i) ? i : this._changeAnnotations.manage(i)),
                  (o = is.create(e, t, r, s))),
              this._workspaceEdit.documentChanges.push(o),
              void 0 !== s)
            )
              return s;
          }),
          (e.prototype.deleteFile = function (e, t, n) {
            if (
              (this.initDocumentChanges(),
              void 0 === this._workspaceEdit.documentChanges)
            )
              throw new Error(
                'Workspace edit is not configured for document changes.',
              );
            var r, i, o;
            if (
              (Jo.is(t) || Qo.is(t) ? (r = t) : (n = t),
              void 0 === r
                ? (i = ss.create(e, n))
                : ((o = Qo.is(r) ? r : this._changeAnnotations.manage(r)),
                  (i = ss.create(e, n, o))),
              this._workspaceEdit.documentChanges.push(i),
              void 0 !== o)
            )
              return o;
          });
      })();
      ((Ss = ws || (ws = {})).create = function (e) {
        return { uri: e };
      }),
        (Ss.is = function (e) {
          var t = e;
          return va.defined(t) && va.string(t.uri);
        }),
        ((Cs = _s || (_s = {})).create = function (e, t) {
          return { uri: e, version: t };
        }),
        (Cs.is = function (e) {
          var t = e;
          return va.defined(t) && va.string(t.uri) && va.integer(t.version);
        }),
        ((As = Es || (Es = {})).create = function (e, t) {
          return { uri: e, version: t };
        }),
        (As.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            va.string(t.uri) &&
            (null === t.version || va.integer(t.version))
          );
        }),
        ((Ns = xs || (xs = {})).create = function (e, t, n, r) {
          return { uri: e, languageId: t, version: n, text: r };
        }),
        (Ns.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            va.string(t.uri) &&
            va.string(t.languageId) &&
            va.integer(t.version) &&
            va.string(t.text)
          );
        }),
        ((Os = Ls || (Ls = {})).PlainText = 'plaintext'),
        (Os.Markdown = 'markdown'),
        (function (e) {
          e.is = function (t) {
            var n = t;
            return n === e.PlainText || n === e.Markdown;
          };
        })(Ls || (Ls = {})),
        ((ks || (ks = {})).is = function (e) {
          var t = e;
          return va.objectLiteral(e) && Ls.is(t.kind) && va.string(t.value);
        }),
        ((Ts = Rs || (Rs = {})).Text = 1),
        (Ts.Method = 2),
        (Ts.Function = 3),
        (Ts.Constructor = 4),
        (Ts.Field = 5),
        (Ts.Variable = 6),
        (Ts.Class = 7),
        (Ts.Interface = 8),
        (Ts.Module = 9),
        (Ts.Property = 10),
        (Ts.Unit = 11),
        (Ts.Value = 12),
        (Ts.Enum = 13),
        (Ts.Keyword = 14),
        (Ts.Snippet = 15),
        (Ts.Color = 16),
        (Ts.File = 17),
        (Ts.Reference = 18),
        (Ts.Folder = 19),
        (Ts.EnumMember = 20),
        (Ts.Constant = 21),
        (Ts.Struct = 22),
        (Ts.Event = 23),
        (Ts.Operator = 24),
        (Ts.TypeParameter = 25),
        ((Ps = Ms || (Ms = {})).PlainText = 1),
        (Ps.Snippet = 2),
        ((Is || (Is = {})).Deprecated = 1),
        ((Fs = js || (js = {})).create = function (e, t, n) {
          return { newText: e, insert: t, replace: n };
        }),
        (Fs.is = function (e) {
          var t = e;
          return (
            t && va.string(t.newText) && wo.is(t.insert) && wo.is(t.replace)
          );
        }),
        ((Vs = Ds || (Ds = {})).asIs = 1),
        (Vs.adjustIndentation = 2),
        ((qs || (qs = {})).create = function (e) {
          return { label: e };
        }),
        ((Us || (Us = {})).create = function (e, t) {
          return { items: e || [], isIncomplete: !!t };
        }),
        ((Ks = Bs || (Bs = {})).fromPlainText = function (e) {
          return e.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
        }),
        (Ks.is = function (e) {
          var t = e;
          return (
            va.string(t) ||
            (va.objectLiteral(t) && va.string(t.language) && va.string(t.value))
          );
        }),
        (($s || ($s = {})).is = function (e) {
          var t = e;
          return (
            !!t &&
            va.objectLiteral(t) &&
            (ks.is(t.contents) ||
              Bs.is(t.contents) ||
              va.typedArray(t.contents, Bs.is)) &&
            (void 0 === e.range || wo.is(e.range))
          );
        }),
        ((Ws || (Ws = {})).create = function (e, t) {
          return t ? { label: e, documentation: t } : { label: e };
        }),
        ((zs || (zs = {})).create = function (e, t) {
          for (var n = [], r = 2; r < arguments.length; r++)
            n[r - 2] = arguments[r];
          var i = { label: e };
          return (
            va.defined(t) && (i.documentation = t),
            va.defined(n) ? (i.parameters = n) : (i.parameters = []),
            i
          );
        }),
        ((Gs = Hs || (Hs = {})).Text = 1),
        (Gs.Read = 2),
        (Gs.Write = 3),
        ((Js || (Js = {})).create = function (e, t) {
          var n = { range: e };
          return va.number(t) && (n.kind = t), n;
        }),
        ((Qs = Xs || (Xs = {})).File = 1),
        (Qs.Module = 2),
        (Qs.Namespace = 3),
        (Qs.Package = 4),
        (Qs.Class = 5),
        (Qs.Method = 6),
        (Qs.Property = 7),
        (Qs.Field = 8),
        (Qs.Constructor = 9),
        (Qs.Enum = 10),
        (Qs.Interface = 11),
        (Qs.Function = 12),
        (Qs.Variable = 13),
        (Qs.Constant = 14),
        (Qs.String = 15),
        (Qs.Number = 16),
        (Qs.Boolean = 17),
        (Qs.Array = 18),
        (Qs.Object = 19),
        (Qs.Key = 20),
        (Qs.Null = 21),
        (Qs.EnumMember = 22),
        (Qs.Struct = 23),
        (Qs.Event = 24),
        (Qs.Operator = 25),
        (Qs.TypeParameter = 26),
        ((Ys || (Ys = {})).Deprecated = 1),
        ((Zs || (Zs = {})).create = function (e, t, n, r, i) {
          var o = { name: e, kind: t, location: { uri: r, range: n } };
          return i && (o.containerName = i), o;
        }),
        ((ta = ea || (ea = {})).create = function (e, t, n, r, i, o) {
          var s = { name: e, detail: t, kind: n, range: r, selectionRange: i };
          return void 0 !== o && (s.children = o), s;
        }),
        (ta.is = function (e) {
          var t = e;
          return (
            t &&
            va.string(t.name) &&
            va.number(t.kind) &&
            wo.is(t.range) &&
            wo.is(t.selectionRange) &&
            (void 0 === t.detail || va.string(t.detail)) &&
            (void 0 === t.deprecated || va.boolean(t.deprecated)) &&
            (void 0 === t.children || Array.isArray(t.children)) &&
            (void 0 === t.tags || Array.isArray(t.tags))
          );
        }),
        ((ra = na || (na = {})).Empty = ''),
        (ra.QuickFix = 'quickfix'),
        (ra.Refactor = 'refactor'),
        (ra.RefactorExtract = 'refactor.extract'),
        (ra.RefactorInline = 'refactor.inline'),
        (ra.RefactorRewrite = 'refactor.rewrite'),
        (ra.Source = 'source'),
        (ra.SourceOrganizeImports = 'source.organizeImports'),
        (ra.SourceFixAll = 'source.fixAll'),
        ((oa = ia || (ia = {})).create = function (e, t) {
          var n = { diagnostics: e };
          return null != t && (n.only = t), n;
        }),
        (oa.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            va.typedArray(t.diagnostics, Ko.is) &&
            (void 0 === t.only || va.typedArray(t.only, va.string))
          );
        }),
        ((aa = sa || (sa = {})).create = function (e, t, n) {
          var r = { title: e },
            i = !0;
          return (
            'string' == typeof t
              ? ((i = !1), (r.kind = t))
              : Wo.is(t)
              ? (r.command = t)
              : (r.edit = t),
            i && void 0 !== n && (r.kind = n),
            r
          );
        }),
        (aa.is = function (e) {
          var t = e;
          return (
            t &&
            va.string(t.title) &&
            (void 0 === t.diagnostics || va.typedArray(t.diagnostics, Ko.is)) &&
            (void 0 === t.kind || va.string(t.kind)) &&
            (void 0 !== t.edit || void 0 !== t.command) &&
            (void 0 === t.command || Wo.is(t.command)) &&
            (void 0 === t.isPreferred || va.boolean(t.isPreferred)) &&
            (void 0 === t.edit || ls.is(t.edit))
          );
        }),
        ((ua = la || (la = {})).create = function (e, t) {
          var n = { range: e };
          return va.defined(t) && (n.data = t), n;
        }),
        (ua.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            wo.is(t.range) &&
            (va.undefined(t.command) || Wo.is(t.command))
          );
        }),
        ((ha = ca || (ca = {})).create = function (e, t) {
          return { tabSize: e, insertSpaces: t };
        }),
        (ha.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            va.uinteger(t.tabSize) &&
            va.boolean(t.insertSpaces)
          );
        }),
        ((da = fa || (fa = {})).create = function (e, t, n) {
          return { range: e, target: t, data: n };
        }),
        (da.is = function (e) {
          var t = e;
          return (
            va.defined(t) &&
            wo.is(t.range) &&
            (va.undefined(t.target) || va.string(t.target))
          );
        }),
        ((ma = ga || (ga = {})).create = function (e, t) {
          return { range: e, parent: t };
        }),
        (ma.is = function (e) {
          var t = e;
          return (
            void 0 !== t &&
            wo.is(t.range) &&
            (void 0 === t.parent || ma.is(t.parent))
          );
        }),
        (function (e) {
          function t(e, n) {
            if (e.length <= 1) return e;
            var r = (e.length / 2) | 0,
              i = e.slice(0, r),
              o = e.slice(r);
            t(i, n), t(o, n);
            for (var s = 0, a = 0, l = 0; s < i.length && a < o.length; ) {
              var u = n(i[s], o[a]);
              e[l++] = u <= 0 ? i[s++] : o[a++];
            }
            for (; s < i.length; ) e[l++] = i[s++];
            for (; a < o.length; ) e[l++] = o[a++];
            return e;
          }
          (e.create = function (e, t, n, r) {
            return new _a(e, t, n, r);
          }),
            (e.is = function (e) {
              var t = e;
              return !!(
                va.defined(t) &&
                va.string(t.uri) &&
                (va.undefined(t.languageId) || va.string(t.languageId)) &&
                va.uinteger(t.lineCount) &&
                va.func(t.getText) &&
                va.func(t.positionAt) &&
                va.func(t.offsetAt)
              );
            }),
            (e.applyEdits = function (e, n) {
              for (
                var r = e.getText(),
                  i = t(n, function (e, t) {
                    var n = e.range.start.line - t.range.start.line;
                    return 0 === n
                      ? e.range.start.character - t.range.start.character
                      : n;
                  }),
                  o = r.length,
                  s = i.length - 1;
                s >= 0;
                s--
              ) {
                var a = i[s],
                  l = e.offsetAt(a.range.start),
                  u = e.offsetAt(a.range.end);
                if (!(u <= o)) throw new Error('Overlapping edit');
                (r = r.substring(0, l) + a.newText + r.substring(u, r.length)),
                  (o = l);
              }
              return r;
            });
        })(pa || (pa = {}));
      var va,
        wa,
        Sa,
        _a = (function () {
          function e(e, t, n, r) {
            (this._uri = e),
              (this._languageId = t),
              (this._version = n),
              (this._content = r),
              (this._lineOffsets = void 0);
          }
          return (
            Object.defineProperty(e.prototype, 'uri', {
              get: function () {
                return this._uri;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'languageId', {
              get: function () {
                return this._languageId;
              },
              enumerable: !1,
              configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'version', {
              get: function () {
                return this._version;
              },
              enumerable: !1,
              configurable: !0,
            }),
            (e.prototype.getText = function (e) {
              if (e) {
                var t = this.offsetAt(e.start),
                  n = this.offsetAt(e.end);
                return this._content.substring(t, n);
              }
              return this._content;
            }),
            (e.prototype.update = function (e, t) {
              (this._content = e.text),
                (this._version = t),
                (this._lineOffsets = void 0);
            }),
            (e.prototype.getLineOffsets = function () {
              if (void 0 === this._lineOffsets) {
                for (
                  var e = [], t = this._content, n = !0, r = 0;
                  r < t.length;
                  r++
                ) {
                  n && (e.push(r), (n = !1));
                  var i = t.charAt(r);
                  (n = '\r' === i || '\n' === i),
                    '\r' === i &&
                      r + 1 < t.length &&
                      '\n' === t.charAt(r + 1) &&
                      r++;
                }
                n && t.length > 0 && e.push(t.length), (this._lineOffsets = e);
              }
              return this._lineOffsets;
            }),
            (e.prototype.positionAt = function (e) {
              e = Math.max(Math.min(e, this._content.length), 0);
              var t = this.getLineOffsets(),
                n = 0,
                r = t.length;
              if (0 === r) return bo.create(0, e);
              for (; n < r; ) {
                var i = Math.floor((n + r) / 2);
                t[i] > e ? (r = i) : (n = i + 1);
              }
              var o = n - 1;
              return bo.create(o, e - t[o]);
            }),
            (e.prototype.offsetAt = function (e) {
              var t = this.getLineOffsets();
              if (e.line >= t.length) return this._content.length;
              if (e.line < 0) return 0;
              var n = t[e.line],
                r =
                  e.line + 1 < t.length ? t[e.line + 1] : this._content.length;
              return Math.max(Math.min(n + e.character, r), n);
            }),
            Object.defineProperty(e.prototype, 'lineCount', {
              get: function () {
                return this.getLineOffsets().length;
              },
              enumerable: !1,
              configurable: !0,
            }),
            e
          );
        })();
      (wa = va || (va = {})),
        (Sa = Object.prototype.toString),
        (wa.defined = function (e) {
          return void 0 !== e;
        }),
        (wa.undefined = function (e) {
          return void 0 === e;
        }),
        (wa.boolean = function (e) {
          return !0 === e || !1 === e;
        }),
        (wa.string = function (e) {
          return '[object String]' === Sa.call(e);
        }),
        (wa.number = function (e) {
          return '[object Number]' === Sa.call(e);
        }),
        (wa.numberRange = function (e, t, n) {
          return '[object Number]' === Sa.call(e) && t <= e && e <= n;
        }),
        (wa.integer = function (e) {
          return (
            '[object Number]' === Sa.call(e) &&
            -2147483648 <= e &&
            e <= 2147483647
          );
        }),
        (wa.uinteger = function (e) {
          return '[object Number]' === Sa.call(e) && 0 <= e && e <= 2147483647;
        }),
        (wa.func = function (e) {
          return '[object Function]' === Sa.call(e);
        }),
        (wa.objectLiteral = function (e) {
          return null !== e && 'object' == typeof e;
        }),
        (wa.typedArray = function (e, t) {
          return Array.isArray(e) && e.every(t);
        });
      var Ca,
        Ea,
        Aa,
        xa,
        Na,
        La = class e {
          constructor(e, t, n, r) {
            (this._uri = e),
              (this._languageId = t),
              (this._version = n),
              (this._content = r),
              (this._lineOffsets = void 0);
          }
          get uri() {
            return this._uri;
          }
          get languageId() {
            return this._languageId;
          }
          get version() {
            return this._version;
          }
          getText(e) {
            if (e) {
              const t = this.offsetAt(e.start),
                n = this.offsetAt(e.end);
              return this._content.substring(t, n);
            }
            return this._content;
          }
          update(t, n) {
            for (let n of t)
              if (e.isIncremental(n)) {
                const e = Ra(n.range),
                  t = this.offsetAt(e.start),
                  r = this.offsetAt(e.end);
                this._content =
                  this._content.substring(0, t) +
                  n.text +
                  this._content.substring(r, this._content.length);
                const i = Math.max(e.start.line, 0),
                  o = Math.max(e.end.line, 0);
                let s = this._lineOffsets;
                const a = ka(n.text, !1, t);
                if (o - i === a.length)
                  for (let e = 0, t = a.length; e < t; e++) s[e + i + 1] = a[e];
                else
                  a.length < 1e4
                    ? s.splice(i + 1, o - i, ...a)
                    : (this._lineOffsets = s =
                        s.slice(0, i + 1).concat(a, s.slice(o + 1)));
                const l = n.text.length - (r - t);
                if (0 !== l)
                  for (let e = i + 1 + a.length, t = s.length; e < t; e++)
                    s[e] = s[e] + l;
              } else {
                if (!e.isFull(n))
                  throw new Error('Unknown change event received');
                (this._content = n.text), (this._lineOffsets = void 0);
              }
            this._version = n;
          }
          getLineOffsets() {
            return (
              void 0 === this._lineOffsets &&
                (this._lineOffsets = ka(this._content, !0)),
              this._lineOffsets
            );
          }
          positionAt(e) {
            e = Math.max(Math.min(e, this._content.length), 0);
            let t = this.getLineOffsets(),
              n = 0,
              r = t.length;
            if (0 === r) return { line: 0, character: e };
            for (; n < r; ) {
              let i = Math.floor((n + r) / 2);
              t[i] > e ? (r = i) : (n = i + 1);
            }
            let i = n - 1;
            return { line: i, character: e - t[i] };
          }
          offsetAt(e) {
            let t = this.getLineOffsets();
            if (e.line >= t.length) return this._content.length;
            if (e.line < 0) return 0;
            let n = t[e.line],
              r = e.line + 1 < t.length ? t[e.line + 1] : this._content.length;
            return Math.max(Math.min(n + e.character, r), n);
          }
          get lineCount() {
            return this.getLineOffsets().length;
          }
          static isIncremental(e) {
            let t = e;
            return (
              null != t &&
              'string' == typeof t.text &&
              void 0 !== t.range &&
              (void 0 === t.rangeLength || 'number' == typeof t.rangeLength)
            );
          }
          static isFull(e) {
            let t = e;
            return (
              null != t &&
              'string' == typeof t.text &&
              void 0 === t.range &&
              void 0 === t.rangeLength
            );
          }
        };
      function Oa(e, t) {
        if (e.length <= 1) return e;
        const n = (e.length / 2) | 0,
          r = e.slice(0, n),
          i = e.slice(n);
        Oa(r, t), Oa(i, t);
        let o = 0,
          s = 0,
          a = 0;
        for (; o < r.length && s < i.length; ) {
          let n = t(r[o], i[s]);
          e[a++] = n <= 0 ? r[o++] : i[s++];
        }
        for (; o < r.length; ) e[a++] = r[o++];
        for (; s < i.length; ) e[a++] = i[s++];
        return e;
      }
      function ka(e, t, n = 0) {
        const r = t ? [n] : [];
        for (let t = 0; t < e.length; t++) {
          let i = e.charCodeAt(t);
          (13 !== i && 10 !== i) ||
            (13 === i && t + 1 < e.length && 10 === e.charCodeAt(t + 1) && t++,
            r.push(n + t + 1));
        }
        return r;
      }
      function Ra(e) {
        const t = e.start,
          n = e.end;
        return t.line > n.line ||
          (t.line === n.line && t.character > n.character)
          ? { start: n, end: t }
          : e;
      }
      function Ta(e) {
        const t = Ra(e.range);
        return t !== e.range ? { newText: e.newText, range: t } : e;
      }
      function Ma(e, t, ...n) {
        return (function (e, t) {
          let n;
          return (
            (n =
              0 === t.length
                ? e
                : e.replace(/\{(\d+)\}/g, (e, n) => {
                    let r = n[0];
                    return void 0 !== t[r] ? t[r] : e;
                  })),
            n
          );
        })(t, n);
      }
      function Pa(e) {
        return Ma;
      }
      ((Ea = Ca || (Ca = {})).create = function (e, t, n, r) {
        return new La(e, t, n, r);
      }),
        (Ea.update = function (e, t, n) {
          if (e instanceof La) return e.update(t, n), e;
          throw new Error(
            'TextDocument.update: document must be created by TextDocument.create',
          );
        }),
        (Ea.applyEdits = function (e, t) {
          let n = e.getText(),
            r = Oa(t.map(Ta), (e, t) => {
              let n = e.range.start.line - t.range.start.line;
              return 0 === n
                ? e.range.start.character - t.range.start.character
                : n;
            }),
            i = 0;
          const o = [];
          for (const t of r) {
            let r = e.offsetAt(t.range.start);
            if (r < i) throw new Error('Overlapping edit');
            r > i && o.push(n.substring(i, r)),
              t.newText.length && o.push(t.newText),
              (i = e.offsetAt(t.range.end));
          }
          return o.push(n.substr(i)), o.join('');
        }),
        ((xa = Aa || (Aa = {}))[(xa.Undefined = 0)] = 'Undefined'),
        (xa[(xa.EnumValueMismatch = 1)] = 'EnumValueMismatch'),
        (xa[(xa.Deprecated = 2)] = 'Deprecated'),
        (xa[(xa.UnexpectedEndOfComment = 257)] = 'UnexpectedEndOfComment'),
        (xa[(xa.UnexpectedEndOfString = 258)] = 'UnexpectedEndOfString'),
        (xa[(xa.UnexpectedEndOfNumber = 259)] = 'UnexpectedEndOfNumber'),
        (xa[(xa.InvalidUnicode = 260)] = 'InvalidUnicode'),
        (xa[(xa.InvalidEscapeCharacter = 261)] = 'InvalidEscapeCharacter'),
        (xa[(xa.InvalidCharacter = 262)] = 'InvalidCharacter'),
        (xa[(xa.PropertyExpected = 513)] = 'PropertyExpected'),
        (xa[(xa.CommaExpected = 514)] = 'CommaExpected'),
        (xa[(xa.ColonExpected = 515)] = 'ColonExpected'),
        (xa[(xa.ValueExpected = 516)] = 'ValueExpected'),
        (xa[(xa.CommaOrCloseBacketExpected = 517)] =
          'CommaOrCloseBacketExpected'),
        (xa[(xa.CommaOrCloseBraceExpected = 518)] =
          'CommaOrCloseBraceExpected'),
        (xa[(xa.TrailingComma = 519)] = 'TrailingComma'),
        (xa[(xa.DuplicateKey = 520)] = 'DuplicateKey'),
        (xa[(xa.CommentNotPermitted = 521)] = 'CommentNotPermitted'),
        (xa[(xa.SchemaResolveError = 768)] = 'SchemaResolveError'),
        ((Na || (Na = {})).LATEST = {
          textDocument: {
            completion: {
              completionItem: {
                documentationFormat: [Ls.Markdown, Ls.PlainText],
                commitCharactersSupport: !0,
              },
            },
          },
        });
      var Ia,
        ja,
        Fa = (function () {
          var e = function (t, n) {
            return (e =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (e, t) {
                  e.__proto__ = t;
                }) ||
              function (e, t) {
                for (var n in t)
                  Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
              })(t, n);
          };
          return function (t, n) {
            if ('function' != typeof n && null !== n)
              throw new TypeError(
                'Class extends value ' +
                  String(n) +
                  ' is not a constructor or null',
              );
            function r() {
              this.constructor = t;
            }
            e(t, n),
              (t.prototype =
                null === n
                  ? Object.create(n)
                  : ((r.prototype = n.prototype), new r()));
          };
        })(),
        Da = Pa(),
        Va = {
          'color-hex': {
            errorMessage: Da(
              'colorHexFormatWarning',
              'Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA.',
            ),
            pattern: /^#([0-9A-Fa-f]{3,4}|([0-9A-Fa-f]{2}){3,4})$/,
          },
          'date-time': {
            errorMessage: Da(
              'dateTimeFormatWarning',
              'String is not a RFC3339 date-time.',
            ),
            pattern:
              /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i,
          },
          date: {
            errorMessage: Da(
              'dateFormatWarning',
              'String is not a RFC3339 date.',
            ),
            pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/i,
          },
          time: {
            errorMessage: Da(
              'timeFormatWarning',
              'String is not a RFC3339 time.',
            ),
            pattern:
              /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i,
          },
          email: {
            errorMessage: Da(
              'emailFormatWarning',
              'String is not an e-mail address.',
            ),
            pattern:
              /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))$/,
          },
          hostname: {
            errorMessage: Da(
              'hostnameFormatWarning',
              'String is not a hostname.',
            ),
            pattern:
              /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
          },
          ipv4: {
            errorMessage: Da(
              'ipv4FormatWarning',
              'String is not an IPv4 address.',
            ),
            pattern:
              /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
          },
          ipv6: {
            errorMessage: Da(
              'ipv6FormatWarning',
              'String is not an IPv6 address.',
            ),
            pattern:
              /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
          },
        },
        qa = (function () {
          function e(e, t, n) {
            void 0 === n && (n = 0),
              (this.offset = t),
              (this.length = n),
              (this.parent = e);
          }
          return (
            Object.defineProperty(e.prototype, 'children', {
              get: function () {
                return [];
              },
              enumerable: !1,
              configurable: !0,
            }),
            (e.prototype.toString = function () {
              return (
                'type: ' +
                this.type +
                ' (' +
                this.offset +
                '/' +
                this.length +
                ')' +
                (this.parent ? ' parent: {' + this.parent.toString() + '}' : '')
              );
            }),
            e
          );
        })(),
        Ua = (function (e) {
          function t(t, n) {
            var r = e.call(this, t, n) || this;
            return (r.type = 'null'), (r.value = null), r;
          }
          return Fa(t, e), t;
        })(qa),
        Ba = (function (e) {
          function t(t, n, r) {
            var i = e.call(this, t, r) || this;
            return (i.type = 'boolean'), (i.value = n), i;
          }
          return Fa(t, e), t;
        })(qa),
        Ka = (function (e) {
          function t(t, n) {
            var r = e.call(this, t, n) || this;
            return (r.type = 'array'), (r.items = []), r;
          }
          return (
            Fa(t, e),
            Object.defineProperty(t.prototype, 'children', {
              get: function () {
                return this.items;
              },
              enumerable: !1,
              configurable: !0,
            }),
            t
          );
        })(qa),
        $a = (function (e) {
          function t(t, n) {
            var r = e.call(this, t, n) || this;
            return (
              (r.type = 'number'), (r.isInteger = !0), (r.value = Number.NaN), r
            );
          }
          return Fa(t, e), t;
        })(qa),
        Wa = (function (e) {
          function t(t, n, r) {
            var i = e.call(this, t, n, r) || this;
            return (i.type = 'string'), (i.value = ''), i;
          }
          return Fa(t, e), t;
        })(qa),
        za = (function (e) {
          function t(t, n, r) {
            var i = e.call(this, t, n) || this;
            return (
              (i.type = 'property'), (i.colonOffset = -1), (i.keyNode = r), i
            );
          }
          return (
            Fa(t, e),
            Object.defineProperty(t.prototype, 'children', {
              get: function () {
                return this.valueNode
                  ? [this.keyNode, this.valueNode]
                  : [this.keyNode];
              },
              enumerable: !1,
              configurable: !0,
            }),
            t
          );
        })(qa),
        Ha = (function (e) {
          function t(t, n) {
            var r = e.call(this, t, n) || this;
            return (r.type = 'object'), (r.properties = []), r;
          }
          return (
            Fa(t, e),
            Object.defineProperty(t.prototype, 'children', {
              get: function () {
                return this.properties;
              },
              enumerable: !1,
              configurable: !0,
            }),
            t
          );
        })(qa);
      function Ga(e) {
        return ys(e) ? (e ? {} : { not: {} }) : e;
      }
      ((ja = Ia || (Ia = {}))[(ja.Key = 0)] = 'Key'),
        (ja[(ja.Enum = 1)] = 'Enum');
      var Ja = (function () {
          function e(e, t) {
            void 0 === e && (e = -1),
              (this.focusOffset = e),
              (this.exclude = t),
              (this.schemas = []);
          }
          return (
            (e.prototype.add = function (e) {
              this.schemas.push(e);
            }),
            (e.prototype.merge = function (e) {
              Array.prototype.push.apply(this.schemas, e.schemas);
            }),
            (e.prototype.include = function (e) {
              return (
                (-1 === this.focusOffset || el(e, this.focusOffset)) &&
                e !== this.exclude
              );
            }),
            (e.prototype.newSub = function () {
              return new e(-1, this.exclude);
            }),
            e
          );
        })(),
        Xa = (function () {
          function e() {}
          return (
            Object.defineProperty(e.prototype, 'schemas', {
              get: function () {
                return [];
              },
              enumerable: !1,
              configurable: !0,
            }),
            (e.prototype.add = function (e) {}),
            (e.prototype.merge = function (e) {}),
            (e.prototype.include = function (e) {
              return !0;
            }),
            (e.prototype.newSub = function () {
              return this;
            }),
            (e.instance = new e()),
            e
          );
        })(),
        Qa = (function () {
          function e() {
            (this.problems = []),
              (this.propertiesMatches = 0),
              (this.propertiesValueMatches = 0),
              (this.primaryValueMatches = 0),
              (this.enumValueMatch = !1),
              (this.enumValues = void 0);
          }
          return (
            (e.prototype.hasProblems = function () {
              return !!this.problems.length;
            }),
            (e.prototype.mergeAll = function (e) {
              for (var t = 0, n = e; t < n.length; t++) {
                var r = n[t];
                this.merge(r);
              }
            }),
            (e.prototype.merge = function (e) {
              this.problems = this.problems.concat(e.problems);
            }),
            (e.prototype.mergeEnumValues = function (e) {
              if (
                !this.enumValueMatch &&
                !e.enumValueMatch &&
                this.enumValues &&
                e.enumValues
              ) {
                this.enumValues = this.enumValues.concat(e.enumValues);
                for (var t = 0, n = this.problems; t < n.length; t++) {
                  var r = n[t];
                  r.code === Aa.EnumValueMismatch &&
                    (r.message = Da(
                      'enumWarning',
                      'Value is not accepted. Valid values: {0}.',
                      this.enumValues
                        .map(function (e) {
                          return JSON.stringify(e);
                        })
                        .join(', '),
                    ));
                }
              }
            }),
            (e.prototype.mergePropertyMatch = function (e) {
              this.merge(e),
                this.propertiesMatches++,
                (e.enumValueMatch ||
                  (!e.hasProblems() && e.propertiesMatches)) &&
                  this.propertiesValueMatches++,
                e.enumValueMatch &&
                  e.enumValues &&
                  1 === e.enumValues.length &&
                  this.primaryValueMatches++;
            }),
            (e.prototype.compare = function (e) {
              var t = this.hasProblems();
              return t !== e.hasProblems()
                ? t
                  ? -1
                  : 1
                : this.enumValueMatch !== e.enumValueMatch
                ? e.enumValueMatch
                  ? -1
                  : 1
                : this.primaryValueMatches !== e.primaryValueMatches
                ? this.primaryValueMatches - e.primaryValueMatches
                : this.propertiesValueMatches !== e.propertiesValueMatches
                ? this.propertiesValueMatches - e.propertiesValueMatches
                : this.propertiesMatches - e.propertiesMatches;
            }),
            e
          );
        })();
      function Ya(e) {
        return ds(e);
      }
      function Za(e) {
        return fs(e);
      }
      function el(e, t, n) {
        return (
          void 0 === n && (n = !1),
          (t >= e.offset && t < e.offset + e.length) ||
            (n && t === e.offset + e.length)
        );
      }
      var tl = (function () {
        function e(e, t, n) {
          void 0 === t && (t = []),
            void 0 === n && (n = []),
            (this.root = e),
            (this.syntaxErrors = t),
            (this.comments = n);
        }
        return (
          (e.prototype.getNodeFromOffset = function (e, t) {
            if ((void 0 === t && (t = !1), this.root))
              return hs(this.root, e, t);
          }),
          (e.prototype.visit = function (e) {
            if (this.root) {
              var t = function (n) {
                var r = e(n),
                  i = n.children;
                if (Array.isArray(i))
                  for (var o = 0; o < i.length && r; o++) r = t(i[o]);
                return r;
              };
              t(this.root);
            }
          }),
          (e.prototype.validate = function (e, t, n) {
            if ((void 0 === n && (n = Do.Warning), this.root && t)) {
              var r = new Qa();
              return (
                nl(this.root, t, r, Xa.instance),
                r.problems.map(function (t) {
                  var r,
                    i = wo.create(
                      e.positionAt(t.location.offset),
                      e.positionAt(t.location.offset + t.location.length),
                    );
                  return Ko.create(
                    i,
                    t.message,
                    null !== (r = t.severity) && void 0 !== r ? r : n,
                    t.code,
                  );
                })
              );
            }
          }),
          (e.prototype.getMatchingSchemas = function (e, t, n) {
            void 0 === t && (t = -1);
            var r = new Ja(t, n);
            return this.root && e && nl(this.root, e, new Qa(), r), r.schemas;
          }),
          e
        );
      })();
      function nl(e, t, n, r) {
        if (e && r.include(e)) {
          var i = e;
          switch (i.type) {
            case 'object':
              !(function (e, t, n, r) {
                for (
                  var i = Object.create(null), o = [], s = 0, a = e.properties;
                  s < a.length;
                  s++
                ) {
                  (i[(V = (p = a[s]).keyNode.value)] = p.valueNode), o.push(V);
                }
                if (Array.isArray(t.required))
                  for (var l = 0, u = t.required; l < u.length; l++) {
                    if (!i[(C = u[l])]) {
                      var c =
                          e.parent &&
                          'property' === e.parent.type &&
                          e.parent.keyNode,
                        h = c
                          ? { offset: c.offset, length: c.length }
                          : { offset: e.offset, length: 1 };
                      n.problems.push({
                        location: h,
                        message: Da(
                          'MissingRequiredPropWarning',
                          'Missing property "{0}".',
                          C,
                        ),
                      });
                    }
                  }
                var f = function (e) {
                  for (var t = o.indexOf(e); t >= 0; )
                    o.splice(t, 1), (t = o.indexOf(e));
                };
                if (t.properties)
                  for (
                    var d = 0, g = Object.keys(t.properties);
                    d < g.length;
                    d++
                  ) {
                    f((C = g[d]));
                    var m = t.properties[C];
                    if ((O = i[C]))
                      if (ys(m))
                        if (m)
                          n.propertiesMatches++, n.propertiesValueMatches++;
                        else {
                          var p = O.parent;
                          n.problems.push({
                            location: {
                              offset: p.keyNode.offset,
                              length: p.keyNode.length,
                            },
                            message:
                              t.errorMessage ||
                              Da(
                                'DisallowedExtraPropWarning',
                                'Property {0} is not allowed.',
                                C,
                              ),
                          });
                        }
                      else nl(O, m, (x = new Qa()), r), n.mergePropertyMatch(x);
                  }
                if (t.patternProperties)
                  for (
                    var y = 0, b = Object.keys(t.patternProperties);
                    y < b.length;
                    y++
                  )
                    for (
                      var v = b[y], w = vs(v), S = 0, _ = o.slice(0);
                      S < _.length;
                      S++
                    ) {
                      var C = _[S];
                      if (null == w ? void 0 : w.test(C))
                        if ((f(C), (O = i[C])))
                          if (ys((m = t.patternProperties[v])))
                            if (m)
                              n.propertiesMatches++, n.propertiesValueMatches++;
                            else {
                              p = O.parent;
                              n.problems.push({
                                location: {
                                  offset: p.keyNode.offset,
                                  length: p.keyNode.length,
                                },
                                message:
                                  t.errorMessage ||
                                  Da(
                                    'DisallowedExtraPropWarning',
                                    'Property {0} is not allowed.',
                                    C,
                                  ),
                              });
                            }
                          else
                            nl(O, m, (x = new Qa()), r),
                              n.mergePropertyMatch(x);
                    }
                if ('object' == typeof t.additionalProperties)
                  for (var E = 0, A = o; E < A.length; E++) {
                    if ((O = i[(C = A[E])])) {
                      var x = new Qa();
                      nl(O, t.additionalProperties, x, r),
                        n.mergePropertyMatch(x);
                    }
                  }
                else if (!1 === t.additionalProperties && o.length > 0)
                  for (var N = 0, L = o; N < L.length; N++) {
                    var O;
                    if ((O = i[(C = L[N])])) {
                      p = O.parent;
                      n.problems.push({
                        location: {
                          offset: p.keyNode.offset,
                          length: p.keyNode.length,
                        },
                        message:
                          t.errorMessage ||
                          Da(
                            'DisallowedExtraPropWarning',
                            'Property {0} is not allowed.',
                            C,
                          ),
                      });
                    }
                  }
                ms(t.maxProperties) &&
                  e.properties.length > t.maxProperties &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'MaxPropWarning',
                      'Object has more properties than limit of {0}.',
                      t.maxProperties,
                    ),
                  });
                ms(t.minProperties) &&
                  e.properties.length < t.minProperties &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'MinPropWarning',
                      'Object has fewer properties than the required number of {0}',
                      t.minProperties,
                    ),
                  });
                if (t.dependencies)
                  for (
                    var k = 0, R = Object.keys(t.dependencies);
                    k < R.length;
                    k++
                  ) {
                    if (i[(V = R[k])]) {
                      var T = t.dependencies[V];
                      if (Array.isArray(T))
                        for (var M = 0, P = T; M < P.length; M++) {
                          var I = P[M];
                          i[I]
                            ? n.propertiesValueMatches++
                            : n.problems.push({
                                location: {
                                  offset: e.offset,
                                  length: e.length,
                                },
                                message: Da(
                                  'RequiredDependentPropWarning',
                                  'Object is missing property {0} required by property {1}.',
                                  I,
                                  V,
                                ),
                              });
                        }
                      else if ((m = Ga(T)))
                        nl(e, m, (x = new Qa()), r), n.mergePropertyMatch(x);
                    }
                  }
                var j = Ga(t.propertyNames);
                if (j)
                  for (var F = 0, D = e.properties; F < D.length; F++) {
                    var V;
                    (V = D[F].keyNode) && nl(V, j, n, Xa.instance);
                  }
              })(i, t, n, r);
              break;
            case 'array':
              !(function (e, t, n, r) {
                if (Array.isArray(t.items)) {
                  for (var i = t.items, o = 0; o < i.length; o++) {
                    var s = Ga(i[o]),
                      a = new Qa();
                    (f = e.items[o])
                      ? (nl(f, s, a, r), n.mergePropertyMatch(a))
                      : e.items.length >= i.length &&
                        n.propertiesValueMatches++;
                  }
                  if (e.items.length > i.length)
                    if ('object' == typeof t.additionalItems)
                      for (var l = i.length; l < e.items.length; l++) {
                        a = new Qa();
                        nl(e.items[l], t.additionalItems, a, r),
                          n.mergePropertyMatch(a);
                      }
                    else
                      !1 === t.additionalItems &&
                        n.problems.push({
                          location: { offset: e.offset, length: e.length },
                          message: Da(
                            'additionalItemsWarning',
                            'Array has too many items according to schema. Expected {0} or fewer.',
                            i.length,
                          ),
                        });
                } else {
                  var u = Ga(t.items);
                  if (u)
                    for (var c = 0, h = e.items; c < h.length; c++) {
                      var f;
                      nl((f = h[c]), u, (a = new Qa()), r),
                        n.mergePropertyMatch(a);
                    }
                }
                var d = Ga(t.contains);
                if (d) {
                  e.items.some(function (e) {
                    var t = new Qa();
                    return nl(e, d, t, Xa.instance), !t.hasProblems();
                  }) ||
                    n.problems.push({
                      location: { offset: e.offset, length: e.length },
                      message:
                        t.errorMessage ||
                        Da(
                          'requiredItemMissingWarning',
                          'Array does not contain required item.',
                        ),
                    });
                }
                ms(t.minItems) &&
                  e.items.length < t.minItems &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'minItemsWarning',
                      'Array has too few items. Expected {0} or more.',
                      t.minItems,
                    ),
                  });
                ms(t.maxItems) &&
                  e.items.length > t.maxItems &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'maxItemsWarning',
                      'Array has too many items. Expected {0} or fewer.',
                      t.maxItems,
                    ),
                  });
                if (!0 === t.uniqueItems) {
                  var g = Ya(e);
                  g.some(function (e, t) {
                    return t !== g.lastIndexOf(e);
                  }) &&
                    n.problems.push({
                      location: { offset: e.offset, length: e.length },
                      message: Da(
                        'uniqueItemsWarning',
                        'Array has duplicate items.',
                      ),
                    });
                }
              })(i, t, n, r);
              break;
            case 'string':
              !(function (e, t, n, r) {
                ms(t.minLength) &&
                  e.value.length < t.minLength &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'minLengthWarning',
                      'String is shorter than the minimum length of {0}.',
                      t.minLength,
                    ),
                  });
                ms(t.maxLength) &&
                  e.value.length > t.maxLength &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'maxLengthWarning',
                      'String is longer than the maximum length of {0}.',
                      t.maxLength,
                    ),
                  });
                if (((o = t.pattern), 'string' == typeof o)) {
                  var i = vs(t.pattern);
                  (null == i ? void 0 : i.test(e.value)) ||
                    n.problems.push({
                      location: { offset: e.offset, length: e.length },
                      message:
                        t.patternErrorMessage ||
                        t.errorMessage ||
                        Da(
                          'patternWarning',
                          'String does not match the pattern of "{0}".',
                          t.pattern,
                        ),
                    });
                }
                var o;
                if (t.format)
                  switch (t.format) {
                    case 'uri':
                    case 'uri-reference':
                      var s = void 0;
                      if (e.value) {
                        var a =
                          /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/.exec(
                            e.value,
                          );
                        a
                          ? a[2] ||
                            'uri' !== t.format ||
                            (s = Da(
                              'uriSchemeMissing',
                              'URI with a scheme is expected.',
                            ))
                          : (s = Da('uriMissing', 'URI is expected.'));
                      } else s = Da('uriEmpty', 'URI expected.');
                      s &&
                        n.problems.push({
                          location: { offset: e.offset, length: e.length },
                          message:
                            t.patternErrorMessage ||
                            t.errorMessage ||
                            Da(
                              'uriFormatWarning',
                              'String is not a URI: {0}',
                              s,
                            ),
                        });
                      break;
                    case 'color-hex':
                    case 'date-time':
                    case 'date':
                    case 'time':
                    case 'email':
                    case 'hostname':
                    case 'ipv4':
                    case 'ipv6':
                      var l = Va[t.format];
                      (e.value && l.pattern.exec(e.value)) ||
                        n.problems.push({
                          location: { offset: e.offset, length: e.length },
                          message:
                            t.patternErrorMessage ||
                            t.errorMessage ||
                            l.errorMessage,
                        });
                  }
              })(i, t, n);
              break;
            case 'number':
              !(function (e, t, n, r) {
                var i = e.value;
                function o(e) {
                  var t,
                    n = /^(-?\d+)(?:\.(\d+))?(?:e([-+]\d+))?$/.exec(
                      e.toString(),
                    );
                  return (
                    n && {
                      value: Number(n[1] + (n[2] || '')),
                      multiplier:
                        ((null === (t = n[2]) || void 0 === t
                          ? void 0
                          : t.length) || 0) - (parseInt(n[3]) || 0),
                    }
                  );
                }
                if (ms(t.multipleOf)) {
                  var s = -1;
                  if (Number.isInteger(t.multipleOf)) s = i % t.multipleOf;
                  else {
                    var a = o(t.multipleOf),
                      l = o(i);
                    if (a && l) {
                      var u = Math.pow(
                        10,
                        Math.abs(l.multiplier - a.multiplier),
                      );
                      l.multiplier < a.multiplier
                        ? (l.value *= u)
                        : (a.value *= u),
                        (s = l.value % a.value);
                    }
                  }
                  0 !== s &&
                    n.problems.push({
                      location: { offset: e.offset, length: e.length },
                      message: Da(
                        'multipleOfWarning',
                        'Value is not divisible by {0}.',
                        t.multipleOf,
                      ),
                    });
                }
                function c(e, t) {
                  return ms(t) ? t : ys(t) && t ? e : void 0;
                }
                function h(e, t) {
                  if (!ys(t) || !t) return e;
                }
                var f = c(t.minimum, t.exclusiveMinimum);
                ms(f) &&
                  i <= f &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'exclusiveMinimumWarning',
                      'Value is below the exclusive minimum of {0}.',
                      f,
                    ),
                  });
                var d = c(t.maximum, t.exclusiveMaximum);
                ms(d) &&
                  i >= d &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'exclusiveMaximumWarning',
                      'Value is above the exclusive maximum of {0}.',
                      d,
                    ),
                  });
                var g = h(t.minimum, t.exclusiveMinimum);
                ms(g) &&
                  i < g &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'minimumWarning',
                      'Value is below the minimum of {0}.',
                      g,
                    ),
                  });
                var m = h(t.maximum, t.exclusiveMaximum);
                ms(m) &&
                  i > m &&
                  n.problems.push({
                    location: { offset: e.offset, length: e.length },
                    message: Da(
                      'maximumWarning',
                      'Value is above the maximum of {0}.',
                      m,
                    ),
                  });
              })(i, t, n);
              break;
            case 'property':
              return nl(i.valueNode, t, n, r);
          }
          !(function () {
            function e(e) {
              return (
                i.type === e ||
                ('integer' === e && 'number' === i.type && i.isInteger)
              );
            }
            Array.isArray(t.type)
              ? t.type.some(e) ||
                n.problems.push({
                  location: { offset: i.offset, length: i.length },
                  message:
                    t.errorMessage ||
                    Da(
                      'typeArrayMismatchWarning',
                      'Incorrect type. Expected one of {0}.',
                      t.type.join(', '),
                    ),
                })
              : t.type &&
                (e(t.type) ||
                  n.problems.push({
                    location: { offset: i.offset, length: i.length },
                    message:
                      t.errorMessage ||
                      Da(
                        'typeMismatchWarning',
                        'Incorrect type. Expected "{0}".',
                        t.type,
                      ),
                  }));
            if (Array.isArray(t.allOf))
              for (var o = 0, s = t.allOf; o < s.length; o++) {
                var a = s[o];
                nl(i, Ga(a), n, r);
              }
            var l = Ga(t.not);
            if (l) {
              var u = new Qa(),
                c = r.newSub();
              nl(i, l, u, c),
                u.hasProblems() ||
                  n.problems.push({
                    location: { offset: i.offset, length: i.length },
                    message: Da(
                      'notSchemaWarning',
                      'Matches a schema that is not allowed.',
                    ),
                  });
              for (var h = 0, f = c.schemas; h < f.length; h++) {
                var d = f[h];
                (d.inverted = !d.inverted), r.add(d);
              }
            }
            var g = function (e, t) {
              for (var o = [], s = void 0, a = 0, l = e; a < l.length; a++) {
                var u = Ga(l[a]),
                  c = new Qa(),
                  h = r.newSub();
                if ((nl(i, u, c, h), c.hasProblems() || o.push(u), s))
                  if (
                    t ||
                    c.hasProblems() ||
                    s.validationResult.hasProblems()
                  ) {
                    var f = c.compare(s.validationResult);
                    f > 0
                      ? (s = {
                          schema: u,
                          validationResult: c,
                          matchingSchemas: h,
                        })
                      : 0 === f &&
                        (s.matchingSchemas.merge(h),
                        s.validationResult.mergeEnumValues(c));
                  } else
                    s.matchingSchemas.merge(h),
                      (s.validationResult.propertiesMatches +=
                        c.propertiesMatches),
                      (s.validationResult.propertiesValueMatches +=
                        c.propertiesValueMatches);
                else s = { schema: u, validationResult: c, matchingSchemas: h };
              }
              return (
                o.length > 1 &&
                  t &&
                  n.problems.push({
                    location: { offset: i.offset, length: 1 },
                    message: Da(
                      'oneOfWarning',
                      'Matches multiple schemas when only one must validate.',
                    ),
                  }),
                s &&
                  (n.merge(s.validationResult),
                  (n.propertiesMatches += s.validationResult.propertiesMatches),
                  (n.propertiesValueMatches +=
                    s.validationResult.propertiesValueMatches),
                  r.merge(s.matchingSchemas)),
                o.length
              );
            };
            Array.isArray(t.anyOf) && g(t.anyOf, !1);
            Array.isArray(t.oneOf) && g(t.oneOf, !0);
            var m = function (e) {
                var t = new Qa(),
                  o = r.newSub();
                nl(i, Ga(e), t, o),
                  n.merge(t),
                  (n.propertiesMatches += t.propertiesMatches),
                  (n.propertiesValueMatches += t.propertiesValueMatches),
                  r.merge(o);
              },
              p = Ga(t.if);
            p &&
              ((y = p),
              (b = Ga(t.then)),
              (v = Ga(t.else)),
              (w = Ga(y)),
              (S = new Qa()),
              (_ = r.newSub()),
              nl(i, w, S, _),
              r.merge(_),
              S.hasProblems() ? v && m(v) : b && m(b));
            var y, b, v, w, S, _;
            if (Array.isArray(t.enum)) {
              for (
                var C = Ya(i), E = !1, A = 0, x = t.enum;
                A < x.length;
                A++
              ) {
                if (gs(C, x[A])) {
                  E = !0;
                  break;
                }
              }
              (n.enumValues = t.enum),
                (n.enumValueMatch = E),
                E ||
                  n.problems.push({
                    location: { offset: i.offset, length: i.length },
                    code: Aa.EnumValueMismatch,
                    message:
                      t.errorMessage ||
                      Da(
                        'enumWarning',
                        'Value is not accepted. Valid values: {0}.',
                        t.enum
                          .map(function (e) {
                            return JSON.stringify(e);
                          })
                          .join(', '),
                      ),
                  });
            }
            if (ps(t.const)) {
              gs((C = Ya(i)), t.const)
                ? (n.enumValueMatch = !0)
                : (n.problems.push({
                    location: { offset: i.offset, length: i.length },
                    code: Aa.EnumValueMismatch,
                    message:
                      t.errorMessage ||
                      Da(
                        'constWarning',
                        'Value must be {0}.',
                        JSON.stringify(t.const),
                      ),
                  }),
                  (n.enumValueMatch = !1)),
                (n.enumValues = [t.const]);
            }
            t.deprecationMessage &&
              i.parent &&
              n.problems.push({
                location: { offset: i.parent.offset, length: i.parent.length },
                severity: Do.Warning,
                message: t.deprecationMessage,
                code: Aa.Deprecated,
              });
          })(),
            r.add({ node: i, schema: t });
        }
      }
      function rl(e, t) {
        var n = [],
          r = -1,
          i = e.getText(),
          o = us(i, !1),
          s = t && t.collectComments ? [] : void 0;
        function a() {
          for (;;) {
            var t = o.scan();
            switch ((c(), t)) {
              case 12:
              case 13:
                Array.isArray(s) &&
                  s.push(
                    wo.create(
                      e.positionAt(o.getTokenOffset()),
                      e.positionAt(o.getTokenOffset() + o.getTokenLength()),
                    ),
                  );
                break;
              case 15:
              case 14:
                break;
              default:
                return t;
            }
          }
        }
        function l(t, i, o, s, a) {
          if ((void 0 === a && (a = Do.Error), 0 === n.length || o !== r)) {
            var l = wo.create(e.positionAt(o), e.positionAt(s));
            n.push(Ko.create(l, t, a, i, e.languageId)), (r = o);
          }
        }
        function u(e, t, n, r, s) {
          void 0 === n && (n = void 0),
            void 0 === r && (r = []),
            void 0 === s && (s = []);
          var u = o.getTokenOffset(),
            c = o.getTokenOffset() + o.getTokenLength();
          if (u === c && u > 0) {
            for (u--; u > 0 && /\s/.test(i.charAt(u)); ) u--;
            c = u + 1;
          }
          if ((l(e, t, u, c), n && h(n, !1), r.length + s.length > 0))
            for (var f = o.getToken(); 17 !== f; ) {
              if (-1 !== r.indexOf(f)) {
                a();
                break;
              }
              if (-1 !== s.indexOf(f)) break;
              f = a();
            }
          return n;
        }
        function c() {
          switch (o.getTokenError()) {
            case 4:
              return (
                u(
                  Da('InvalidUnicode', 'Invalid unicode sequence in string.'),
                  Aa.InvalidUnicode,
                ),
                !0
              );
            case 5:
              return (
                u(
                  Da(
                    'InvalidEscapeCharacter',
                    'Invalid escape character in string.',
                  ),
                  Aa.InvalidEscapeCharacter,
                ),
                !0
              );
            case 3:
              return (
                u(
                  Da('UnexpectedEndOfNumber', 'Unexpected end of number.'),
                  Aa.UnexpectedEndOfNumber,
                ),
                !0
              );
            case 1:
              return (
                u(
                  Da('UnexpectedEndOfComment', 'Unexpected end of comment.'),
                  Aa.UnexpectedEndOfComment,
                ),
                !0
              );
            case 2:
              return (
                u(
                  Da('UnexpectedEndOfString', 'Unexpected end of string.'),
                  Aa.UnexpectedEndOfString,
                ),
                !0
              );
            case 6:
              return (
                u(
                  Da(
                    'InvalidCharacter',
                    'Invalid characters in string. Control characters must be escaped.',
                  ),
                  Aa.InvalidCharacter,
                ),
                !0
              );
          }
          return !1;
        }
        function h(e, t) {
          return (
            (e.length = o.getTokenOffset() + o.getTokenLength() - e.offset),
            t && a(),
            e
          );
        }
        var f = new Wa(void 0, 0, 0);
        function d(t, n) {
          var r = new za(t, o.getTokenOffset(), f),
            i = g(r);
          if (!i) {
            if (16 !== o.getToken()) return;
            u(
              Da('DoubleQuotesExpected', 'Property keys must be doublequoted'),
              Aa.Undefined,
            );
            var s = new Wa(r, o.getTokenOffset(), o.getTokenLength());
            (s.value = o.getTokenValue()), (i = s), a();
          }
          r.keyNode = i;
          var c = n[i.value];
          if (
            (c
              ? (l(
                  Da('DuplicateKeyWarning', 'Duplicate object key'),
                  Aa.DuplicateKey,
                  r.keyNode.offset,
                  r.keyNode.offset + r.keyNode.length,
                  Do.Warning,
                ),
                'object' == typeof c &&
                  l(
                    Da('DuplicateKeyWarning', 'Duplicate object key'),
                    Aa.DuplicateKey,
                    c.keyNode.offset,
                    c.keyNode.offset + c.keyNode.length,
                    Do.Warning,
                  ),
                (n[i.value] = !0))
              : (n[i.value] = r),
            6 === o.getToken())
          )
            (r.colonOffset = o.getTokenOffset()), a();
          else if (
            (u(Da('ColonExpected', 'Colon expected'), Aa.ColonExpected),
            10 === o.getToken() &&
              e.positionAt(i.offset + i.length).line <
                e.positionAt(o.getTokenOffset()).line)
          )
            return (r.length = i.length), r;
          var h = m(r);
          return h
            ? ((r.valueNode = h),
              (r.length = h.offset + h.length - r.offset),
              r)
            : u(
                Da('ValueExpected', 'Value expected'),
                Aa.ValueExpected,
                r,
                [],
                [2, 5],
              );
        }
        function g(e) {
          if (10 === o.getToken()) {
            var t = new Wa(e, o.getTokenOffset());
            return (t.value = o.getTokenValue()), h(t, !0);
          }
        }
        function m(e) {
          return (
            (function (e) {
              if (3 === o.getToken()) {
                var t = new Ka(e, o.getTokenOffset());
                a();
                for (var n = !1; 4 !== o.getToken() && 17 !== o.getToken(); ) {
                  if (5 === o.getToken()) {
                    n ||
                      u(
                        Da('ValueExpected', 'Value expected'),
                        Aa.ValueExpected,
                      );
                    var r = o.getTokenOffset();
                    if ((a(), 4 === o.getToken())) {
                      n &&
                        l(
                          Da('TrailingComma', 'Trailing comma'),
                          Aa.TrailingComma,
                          r,
                          r + 1,
                        );
                      continue;
                    }
                  } else
                    n &&
                      u(
                        Da('ExpectedComma', 'Expected comma'),
                        Aa.CommaExpected,
                      );
                  var i = m(t);
                  i
                    ? t.items.push(i)
                    : u(
                        Da('PropertyExpected', 'Value expected'),
                        Aa.ValueExpected,
                        void 0,
                        [],
                        [4, 5],
                      ),
                    (n = !0);
                }
                return 4 !== o.getToken()
                  ? u(
                      Da(
                        'ExpectedCloseBracket',
                        'Expected comma or closing bracket',
                      ),
                      Aa.CommaOrCloseBacketExpected,
                      t,
                    )
                  : h(t, !0);
              }
            })(e) ||
            (function (e) {
              if (1 === o.getToken()) {
                var t = new Ha(e, o.getTokenOffset()),
                  n = Object.create(null);
                a();
                for (var r = !1; 2 !== o.getToken() && 17 !== o.getToken(); ) {
                  if (5 === o.getToken()) {
                    r ||
                      u(
                        Da('PropertyExpected', 'Property expected'),
                        Aa.PropertyExpected,
                      );
                    var i = o.getTokenOffset();
                    if ((a(), 2 === o.getToken())) {
                      r &&
                        l(
                          Da('TrailingComma', 'Trailing comma'),
                          Aa.TrailingComma,
                          i,
                          i + 1,
                        );
                      continue;
                    }
                  } else
                    r &&
                      u(
                        Da('ExpectedComma', 'Expected comma'),
                        Aa.CommaExpected,
                      );
                  var s = d(t, n);
                  s
                    ? t.properties.push(s)
                    : u(
                        Da('PropertyExpected', 'Property expected'),
                        Aa.PropertyExpected,
                        void 0,
                        [],
                        [2, 5],
                      ),
                    (r = !0);
                }
                return 2 !== o.getToken()
                  ? u(
                      Da(
                        'ExpectedCloseBrace',
                        'Expected comma or closing brace',
                      ),
                      Aa.CommaOrCloseBraceExpected,
                      t,
                    )
                  : h(t, !0);
              }
            })(e) ||
            g(e) ||
            (function (e) {
              if (11 === o.getToken()) {
                var t = new $a(e, o.getTokenOffset());
                if (0 === o.getTokenError()) {
                  var n = o.getTokenValue();
                  try {
                    var r = JSON.parse(n);
                    if (!ms(r))
                      return u(
                        Da('InvalidNumberFormat', 'Invalid number format.'),
                        Aa.Undefined,
                        t,
                      );
                    t.value = r;
                  } catch (e) {
                    return u(
                      Da('InvalidNumberFormat', 'Invalid number format.'),
                      Aa.Undefined,
                      t,
                    );
                  }
                  t.isInteger = -1 === n.indexOf('.');
                }
                return h(t, !0);
              }
            })(e) ||
            (function (e) {
              switch (o.getToken()) {
                case 7:
                  return h(new Ua(e, o.getTokenOffset()), !0);
                case 8:
                  return h(new Ba(e, !0, o.getTokenOffset()), !0);
                case 9:
                  return h(new Ba(e, !1, o.getTokenOffset()), !0);
                default:
                  return;
              }
            })(e)
          );
        }
        var p = void 0;
        return (
          17 !== a() &&
            ((p = m(p))
              ? 17 !== o.getToken() &&
                u(
                  Da('End of file expected', 'End of file expected.'),
                  Aa.Undefined,
                )
              : u(
                  Da(
                    'Invalid symbol',
                    'Expected a JSON object, array or literal.',
                  ),
                  Aa.Undefined,
                )),
          new tl(p, n, s)
        );
      }
      function il(e, t, n) {
        if (null !== e && 'object' == typeof e) {
          var r = t + '\t';
          if (Array.isArray(e)) {
            if (0 === e.length) return '[]';
            for (var i = '[\n', o = 0; o < e.length; o++)
              (i += r + il(e[o], r, n)),
                o < e.length - 1 && (i += ','),
                (i += '\n');
            return (i += t + ']');
          }
          var s = Object.keys(e);
          if (0 === s.length) return '{}';
          for (i = '{\n', o = 0; o < s.length; o++) {
            var a = s[o];
            (i += r + JSON.stringify(a) + ': ' + il(e[a], r, n)),
              o < s.length - 1 && (i += ','),
              (i += '\n');
          }
          return (i += t + '}');
        }
        return n(e);
      }
      var ol = Pa(),
        sl = (function () {
          function e(e, t, n, r) {
            void 0 === t && (t = []),
              void 0 === n && (n = Promise),
              void 0 === r && (r = {}),
              (this.schemaService = e),
              (this.contributions = t),
              (this.promiseConstructor = n),
              (this.clientCapabilities = r);
          }
          return (
            (e.prototype.doResolve = function (e) {
              for (var t = this.contributions.length - 1; t >= 0; t--) {
                var n = this.contributions[t].resolveCompletion;
                if (n) {
                  var r = n(e);
                  if (r) return r;
                }
              }
              return this.promiseConstructor.resolve(e);
            }),
            (e.prototype.doComplete = function (e, t, n) {
              var r = this,
                i = { items: [], isIncomplete: !1 },
                o = e.getText(),
                s = e.offsetAt(t),
                a = n.getNodeFromOffset(s, !0);
              if (this.isInComment(e, a ? a.offset : 0, s))
                return Promise.resolve(i);
              if (a && s === a.offset + a.length && s > 0) {
                var l = o[s - 1];
                (('object' === a.type && '}' === l) ||
                  ('array' === a.type && ']' === l)) &&
                  (a = a.parent);
              }
              var u,
                c = this.getCurrentWord(e, s);
              if (
                !a ||
                ('string' !== a.type &&
                  'number' !== a.type &&
                  'boolean' !== a.type &&
                  'null' !== a.type)
              ) {
                var h = s - c.length;
                h > 0 && '"' === o[h - 1] && h--,
                  (u = wo.create(e.positionAt(h), t));
              } else
                u = wo.create(
                  e.positionAt(a.offset),
                  e.positionAt(a.offset + a.length),
                );
              var f = {},
                d = {
                  add: function (e) {
                    var t = e.label,
                      n = f[t];
                    if (n)
                      n.documentation || (n.documentation = e.documentation),
                        n.detail || (n.detail = e.detail);
                    else {
                      if ((t = t.replace(/[\n]/g, '↵')).length > 60) {
                        var r = t.substr(0, 57).trim() + '...';
                        f[r] || (t = r);
                      }
                      u &&
                        void 0 !== e.insertText &&
                        (e.textEdit = Ho.replace(u, e.insertText)),
                        (e.label = t),
                        (f[t] = e),
                        i.items.push(e);
                    }
                  },
                  setAsIncomplete: function () {
                    i.isIncomplete = !0;
                  },
                  error: function (e) {
                    io.error(e);
                  },
                  log: function (e) {
                    io.log(e);
                  },
                  getNumberOfProposals: function () {
                    return i.items.length;
                  },
                };
              return this.schemaService
                .getSchemaForResource(e.uri, n)
                .then(function (t) {
                  var l = [],
                    h = !0,
                    g = '',
                    m = void 0;
                  if (a && 'string' === a.type) {
                    var p = a.parent;
                    p &&
                      'property' === p.type &&
                      p.keyNode === a &&
                      ((h = !p.valueNode),
                      (m = p),
                      (g = o.substr(a.offset + 1, a.length - 2)),
                      p && (a = p.parent));
                  }
                  if (a && 'object' === a.type) {
                    if (a.offset === s) return i;
                    a.properties.forEach(function (e) {
                      (m && m === e) || (f[e.keyNode.value] = qs.create('__'));
                    });
                    var y = '';
                    h && (y = r.evaluateSeparatorAfter(e, e.offsetAt(u.end))),
                      t
                        ? r.getPropertyCompletions(t, n, a, h, y, d)
                        : r.getSchemaLessPropertyCompletions(n, a, g, d);
                    var b = Za(a);
                    r.contributions.forEach(function (t) {
                      var n = t.collectPropertyCompletions(
                        e.uri,
                        b,
                        c,
                        h,
                        '' === y,
                        d,
                      );
                      n && l.push(n);
                    }),
                      !t &&
                        c.length > 0 &&
                        '"' !== o.charAt(s - c.length - 1) &&
                        (d.add({
                          kind: Rs.Property,
                          label: r.getLabelForValue(c),
                          insertText: r.getInsertTextForProperty(
                            c,
                            void 0,
                            !1,
                            y,
                          ),
                          insertTextFormat: Ms.Snippet,
                          documentation: '',
                        }),
                        d.setAsIncomplete());
                  }
                  var v = {};
                  return (
                    t
                      ? r.getValueCompletions(t, n, a, s, e, d, v)
                      : r.getSchemaLessValueCompletions(n, a, s, e, d),
                    r.contributions.length > 0 &&
                      r.getContributedValueCompletions(n, a, s, e, d, l),
                    r.promiseConstructor.all(l).then(function () {
                      if (0 === d.getNumberOfProposals()) {
                        var t = s;
                        !a ||
                          ('string' !== a.type &&
                            'number' !== a.type &&
                            'boolean' !== a.type &&
                            'null' !== a.type) ||
                          (t = a.offset + a.length);
                        var n = r.evaluateSeparatorAfter(e, t);
                        r.addFillerValueCompletions(v, n, d);
                      }
                      return i;
                    })
                  );
                });
            }),
            (e.prototype.getPropertyCompletions = function (e, t, n, r, i, o) {
              var s = this;
              t.getMatchingSchemas(e.schema, n.offset).forEach(function (e) {
                if (e.node === n && !e.inverted) {
                  var t = e.schema.properties;
                  t &&
                    Object.keys(t).forEach(function (e) {
                      var n = t[e];
                      if (
                        'object' == typeof n &&
                        !n.deprecationMessage &&
                        !n.doNotSuggest
                      ) {
                        var a = {
                          kind: Rs.Property,
                          label: e,
                          insertText: s.getInsertTextForProperty(e, n, r, i),
                          insertTextFormat: Ms.Snippet,
                          filterText: s.getFilterTextForValue(e),
                          documentation:
                            s.fromMarkup(n.markdownDescription) ||
                            n.description ||
                            '',
                        };
                        void 0 !== n.suggestSortText &&
                          (a.sortText = n.suggestSortText),
                          a.insertText &&
                            bs(a.insertText, '$1'.concat(i)) &&
                            (a.command = {
                              title: 'Suggest',
                              command: 'editor.action.triggerSuggest',
                            }),
                          o.add(a);
                      }
                    });
                  var a = e.schema.propertyNames;
                  if (
                    'object' == typeof a &&
                    !a.deprecationMessage &&
                    !a.doNotSuggest
                  ) {
                    var l = function (e, t) {
                      void 0 === t && (t = void 0);
                      var n = {
                        kind: Rs.Property,
                        label: e,
                        insertText: s.getInsertTextForProperty(e, void 0, r, i),
                        insertTextFormat: Ms.Snippet,
                        filterText: s.getFilterTextForValue(e),
                        documentation:
                          t ||
                          s.fromMarkup(a.markdownDescription) ||
                          a.description ||
                          '',
                      };
                      void 0 !== a.suggestSortText &&
                        (n.sortText = a.suggestSortText),
                        n.insertText &&
                          bs(n.insertText, '$1'.concat(i)) &&
                          (n.command = {
                            title: 'Suggest',
                            command: 'editor.action.triggerSuggest',
                          }),
                        o.add(n);
                    };
                    if (a.enum)
                      for (var u = 0; u < a.enum.length; u++) {
                        var c = void 0;
                        a.markdownEnumDescriptions &&
                        u < a.markdownEnumDescriptions.length
                          ? (c = s.fromMarkup(a.markdownEnumDescriptions[u]))
                          : a.enumDescriptions &&
                            u < a.enumDescriptions.length &&
                            (c = a.enumDescriptions[u]),
                          l(a.enum[u], c);
                      }
                    a.const && l(a.const);
                  }
                }
              });
            }),
            (e.prototype.getSchemaLessPropertyCompletions = function (
              e,
              t,
              n,
              r,
            ) {
              var i = this,
                o = function (e) {
                  e.properties.forEach(function (e) {
                    var t = e.keyNode.value;
                    r.add({
                      kind: Rs.Property,
                      label: t,
                      insertText: i.getInsertTextForValue(t, ''),
                      insertTextFormat: Ms.Snippet,
                      filterText: i.getFilterTextForValue(t),
                      documentation: '',
                    });
                  });
                };
              if (t.parent)
                if ('property' === t.parent.type) {
                  var s = t.parent.keyNode.value;
                  e.visit(function (e) {
                    return (
                      'property' === e.type &&
                        e !== t.parent &&
                        e.keyNode.value === s &&
                        e.valueNode &&
                        'object' === e.valueNode.type &&
                        o(e.valueNode),
                      !0
                    );
                  });
                } else
                  'array' === t.parent.type &&
                    t.parent.items.forEach(function (e) {
                      'object' === e.type && e !== t && o(e);
                    });
              else
                'object' === t.type &&
                  r.add({
                    kind: Rs.Property,
                    label: '$schema',
                    insertText: this.getInsertTextForProperty(
                      '$schema',
                      void 0,
                      !0,
                      '',
                    ),
                    insertTextFormat: Ms.Snippet,
                    documentation: '',
                    filterText: this.getFilterTextForValue('$schema'),
                  });
            }),
            (e.prototype.getSchemaLessValueCompletions = function (
              e,
              t,
              n,
              r,
              i,
            ) {
              var o = this,
                s = n;
              if (
                (!t ||
                  ('string' !== t.type &&
                    'number' !== t.type &&
                    'boolean' !== t.type &&
                    'null' !== t.type) ||
                  ((s = t.offset + t.length), (t = t.parent)),
                !t)
              )
                return (
                  i.add({
                    kind: this.getSuggestionKind('object'),
                    label: 'Empty object',
                    insertText: this.getInsertTextForValue({}, ''),
                    insertTextFormat: Ms.Snippet,
                    documentation: '',
                  }),
                  void i.add({
                    kind: this.getSuggestionKind('array'),
                    label: 'Empty array',
                    insertText: this.getInsertTextForValue([], ''),
                    insertTextFormat: Ms.Snippet,
                    documentation: '',
                  })
                );
              var a = this.evaluateSeparatorAfter(r, s),
                l = function (e) {
                  e.parent &&
                    !el(e.parent, n, !0) &&
                    i.add({
                      kind: o.getSuggestionKind(e.type),
                      label: o.getLabelTextForMatchingNode(e, r),
                      insertText: o.getInsertTextForMatchingNode(e, r, a),
                      insertTextFormat: Ms.Snippet,
                      documentation: '',
                    }),
                    'boolean' === e.type &&
                      o.addBooleanValueCompletion(!e.value, a, i);
                };
              if ('property' === t.type && n > (t.colonOffset || 0)) {
                var u = t.valueNode;
                if (
                  u &&
                  (n > u.offset + u.length ||
                    'object' === u.type ||
                    'array' === u.type)
                )
                  return;
                var c = t.keyNode.value;
                e.visit(function (e) {
                  return (
                    'property' === e.type &&
                      e.keyNode.value === c &&
                      e.valueNode &&
                      l(e.valueNode),
                    !0
                  );
                }),
                  '$schema' === c &&
                    t.parent &&
                    !t.parent.parent &&
                    this.addDollarSchemaCompletions(a, i);
              }
              if ('array' === t.type)
                if (t.parent && 'property' === t.parent.type) {
                  var h = t.parent.keyNode.value;
                  e.visit(function (e) {
                    return (
                      'property' === e.type &&
                        e.keyNode.value === h &&
                        e.valueNode &&
                        'array' === e.valueNode.type &&
                        e.valueNode.items.forEach(l),
                      !0
                    );
                  });
                } else t.items.forEach(l);
            }),
            (e.prototype.getValueCompletions = function (e, t, n, r, i, o, s) {
              var a = r,
                l = void 0,
                u = void 0;
              if (
                (!n ||
                  ('string' !== n.type &&
                    'number' !== n.type &&
                    'boolean' !== n.type &&
                    'null' !== n.type) ||
                  ((a = n.offset + n.length), (u = n), (n = n.parent)),
                n)
              ) {
                if ('property' === n.type && r > (n.colonOffset || 0)) {
                  var c = n.valueNode;
                  if (c && r > c.offset + c.length) return;
                  (l = n.keyNode.value), (n = n.parent);
                }
                if (n && (void 0 !== l || 'array' === n.type)) {
                  for (
                    var h = this.evaluateSeparatorAfter(i, a),
                      f = 0,
                      d = t.getMatchingSchemas(e.schema, n.offset, u);
                    f < d.length;
                    f++
                  ) {
                    var g = d[f];
                    if (g.node === n && !g.inverted && g.schema) {
                      if ('array' === n.type && g.schema.items)
                        if (Array.isArray(g.schema.items)) {
                          var m = this.findItemAtOffset(n, i, r);
                          m < g.schema.items.length &&
                            this.addSchemaValueCompletions(
                              g.schema.items[m],
                              h,
                              o,
                              s,
                            );
                        } else
                          this.addSchemaValueCompletions(
                            g.schema.items,
                            h,
                            o,
                            s,
                          );
                      if (void 0 !== l) {
                        var p = !1;
                        if (g.schema.properties)
                          (S = g.schema.properties[l]) &&
                            ((p = !0),
                            this.addSchemaValueCompletions(S, h, o, s));
                        if (g.schema.patternProperties && !p)
                          for (
                            var y = 0,
                              b = Object.keys(g.schema.patternProperties);
                            y < b.length;
                            y++
                          ) {
                            var v = b[y],
                              w = vs(v);
                            if (null == w ? void 0 : w.test(l)) {
                              p = !0;
                              var S = g.schema.patternProperties[v];
                              this.addSchemaValueCompletions(S, h, o, s);
                            }
                          }
                        if (g.schema.additionalProperties && !p) {
                          S = g.schema.additionalProperties;
                          this.addSchemaValueCompletions(S, h, o, s);
                        }
                      }
                    }
                  }
                  '$schema' !== l ||
                    n.parent ||
                    this.addDollarSchemaCompletions(h, o),
                    s.boolean &&
                      (this.addBooleanValueCompletion(!0, h, o),
                      this.addBooleanValueCompletion(!1, h, o)),
                    s.null && this.addNullValueCompletion(h, o);
                }
              } else this.addSchemaValueCompletions(e.schema, '', o, s);
            }),
            (e.prototype.getContributedValueCompletions = function (
              e,
              t,
              n,
              r,
              i,
              o,
            ) {
              if (t) {
                if (
                  (('string' !== t.type &&
                    'number' !== t.type &&
                    'boolean' !== t.type &&
                    'null' !== t.type) ||
                    (t = t.parent),
                  t && 'property' === t.type && n > (t.colonOffset || 0))
                ) {
                  var s = t.keyNode.value,
                    a = t.valueNode;
                  if ((!a || n <= a.offset + a.length) && t.parent) {
                    var l = Za(t.parent);
                    this.contributions.forEach(function (e) {
                      var t = e.collectValueCompletions(r.uri, l, s, i);
                      t && o.push(t);
                    });
                  }
                }
              } else
                this.contributions.forEach(function (e) {
                  var t = e.collectDefaultCompletions(r.uri, i);
                  t && o.push(t);
                });
            }),
            (e.prototype.addSchemaValueCompletions = function (e, t, n, r) {
              var i = this;
              'object' == typeof e &&
                (this.addEnumValueCompletions(e, t, n),
                this.addDefaultValueCompletions(e, t, n),
                this.collectTypes(e, r),
                Array.isArray(e.allOf) &&
                  e.allOf.forEach(function (e) {
                    return i.addSchemaValueCompletions(e, t, n, r);
                  }),
                Array.isArray(e.anyOf) &&
                  e.anyOf.forEach(function (e) {
                    return i.addSchemaValueCompletions(e, t, n, r);
                  }),
                Array.isArray(e.oneOf) &&
                  e.oneOf.forEach(function (e) {
                    return i.addSchemaValueCompletions(e, t, n, r);
                  }));
            }),
            (e.prototype.addDefaultValueCompletions = function (e, t, n, r) {
              var i = this;
              void 0 === r && (r = 0);
              var o = !1;
              if (ps(e.default)) {
                for (var s = e.type, a = e.default, l = r; l > 0; l--)
                  (a = [a]), (s = 'array');
                n.add({
                  kind: this.getSuggestionKind(s),
                  label: this.getLabelForValue(a),
                  insertText: this.getInsertTextForValue(a, t),
                  insertTextFormat: Ms.Snippet,
                  detail: ol('json.suggest.default', 'Default value'),
                }),
                  (o = !0);
              }
              Array.isArray(e.examples) &&
                e.examples.forEach(function (s) {
                  for (var a = e.type, l = s, u = r; u > 0; u--)
                    (l = [l]), (a = 'array');
                  n.add({
                    kind: i.getSuggestionKind(a),
                    label: i.getLabelForValue(l),
                    insertText: i.getInsertTextForValue(l, t),
                    insertTextFormat: Ms.Snippet,
                  }),
                    (o = !0);
                }),
                Array.isArray(e.defaultSnippets) &&
                  e.defaultSnippets.forEach(function (s) {
                    var a,
                      l,
                      u = e.type,
                      c = s.body,
                      h = s.label;
                    if (ps(c)) {
                      e.type;
                      for (var f = r; f > 0; f--) (c = [c]), 'array';
                      (a = i.getInsertTextForSnippetValue(c, t)),
                        (l = i.getFilterTextForSnippetValue(c)),
                        (h = h || i.getLabelForSnippetValue(c));
                    } else {
                      if ('string' != typeof s.bodyText) return;
                      var d = '',
                        g = '',
                        m = '';
                      for (f = r; f > 0; f--)
                        (d = d + m + '[\n'),
                          (g = g + '\n' + m + ']'),
                          (m += '\t'),
                          (u = 'array');
                      (a =
                        d + m + s.bodyText.split('\n').join('\n' + m) + g + t),
                        (h = h || a),
                        (l = a.replace(/[\n]/g, ''));
                    }
                    n.add({
                      kind: i.getSuggestionKind(u),
                      label: h,
                      documentation:
                        i.fromMarkup(s.markdownDescription) || s.description,
                      insertText: a,
                      insertTextFormat: Ms.Snippet,
                      filterText: l,
                    }),
                      (o = !0);
                  }),
                !o &&
                  'object' == typeof e.items &&
                  !Array.isArray(e.items) &&
                  r < 5 &&
                  this.addDefaultValueCompletions(e.items, t, n, r + 1);
            }),
            (e.prototype.addEnumValueCompletions = function (e, t, n) {
              if (
                (ps(e.const) &&
                  n.add({
                    kind: this.getSuggestionKind(e.type),
                    label: this.getLabelForValue(e.const),
                    insertText: this.getInsertTextForValue(e.const, t),
                    insertTextFormat: Ms.Snippet,
                    documentation:
                      this.fromMarkup(e.markdownDescription) || e.description,
                  }),
                Array.isArray(e.enum))
              )
                for (var r = 0, i = e.enum.length; r < i; r++) {
                  var o = e.enum[r],
                    s = this.fromMarkup(e.markdownDescription) || e.description;
                  e.markdownEnumDescriptions &&
                  r < e.markdownEnumDescriptions.length &&
                  this.doesSupportMarkdown()
                    ? (s = this.fromMarkup(e.markdownEnumDescriptions[r]))
                    : e.enumDescriptions &&
                      r < e.enumDescriptions.length &&
                      (s = e.enumDescriptions[r]),
                    n.add({
                      kind: this.getSuggestionKind(e.type),
                      label: this.getLabelForValue(o),
                      insertText: this.getInsertTextForValue(o, t),
                      insertTextFormat: Ms.Snippet,
                      documentation: s,
                    });
                }
            }),
            (e.prototype.collectTypes = function (e, t) {
              if (!Array.isArray(e.enum) && !ps(e.const)) {
                var n = e.type;
                Array.isArray(n)
                  ? n.forEach(function (e) {
                      return (t[e] = !0);
                    })
                  : n && (t[n] = !0);
              }
            }),
            (e.prototype.addFillerValueCompletions = function (e, t, n) {
              e.object &&
                n.add({
                  kind: this.getSuggestionKind('object'),
                  label: '{}',
                  insertText: this.getInsertTextForGuessedValue({}, t),
                  insertTextFormat: Ms.Snippet,
                  detail: ol('defaults.object', 'New object'),
                  documentation: '',
                }),
                e.array &&
                  n.add({
                    kind: this.getSuggestionKind('array'),
                    label: '[]',
                    insertText: this.getInsertTextForGuessedValue([], t),
                    insertTextFormat: Ms.Snippet,
                    detail: ol('defaults.array', 'New array'),
                    documentation: '',
                  });
            }),
            (e.prototype.addBooleanValueCompletion = function (e, t, n) {
              n.add({
                kind: this.getSuggestionKind('boolean'),
                label: e ? 'true' : 'false',
                insertText: this.getInsertTextForValue(e, t),
                insertTextFormat: Ms.Snippet,
                documentation: '',
              });
            }),
            (e.prototype.addNullValueCompletion = function (e, t) {
              t.add({
                kind: this.getSuggestionKind('null'),
                label: 'null',
                insertText: 'null' + e,
                insertTextFormat: Ms.Snippet,
                documentation: '',
              });
            }),
            (e.prototype.addDollarSchemaCompletions = function (e, t) {
              var n = this,
                r = this.schemaService.getRegisteredSchemaIds(function (e) {
                  return 'http' === e || 'https' === e;
                });
              r.forEach(function (r) {
                return t.add({
                  kind: Rs.Module,
                  label: n.getLabelForValue(r),
                  filterText: n.getFilterTextForValue(r),
                  insertText: n.getInsertTextForValue(r, e),
                  insertTextFormat: Ms.Snippet,
                  documentation: '',
                });
              });
            }),
            (e.prototype.getLabelForValue = function (e) {
              return JSON.stringify(e);
            }),
            (e.prototype.getFilterTextForValue = function (e) {
              return JSON.stringify(e);
            }),
            (e.prototype.getFilterTextForSnippetValue = function (e) {
              return JSON.stringify(e).replace(
                /\$\{\d+:([^}]+)\}|\$\d+/g,
                '$1',
              );
            }),
            (e.prototype.getLabelForSnippetValue = function (e) {
              return JSON.stringify(e).replace(
                /\$\{\d+:([^}]+)\}|\$\d+/g,
                '$1',
              );
            }),
            (e.prototype.getInsertTextForPlainText = function (e) {
              return e.replace(/[\\\$\}]/g, '\\$&');
            }),
            (e.prototype.getInsertTextForValue = function (e, t) {
              var n = JSON.stringify(e, null, '\t');
              return '{}' === n
                ? '{$1}' + t
                : '[]' === n
                ? '[$1]' + t
                : this.getInsertTextForPlainText(n + t);
            }),
            (e.prototype.getInsertTextForSnippetValue = function (e, t) {
              return (
                il(e, '', function (e) {
                  return 'string' == typeof e && '^' === e[0]
                    ? e.substr(1)
                    : JSON.stringify(e);
                }) + t
              );
            }),
            (e.prototype.getInsertTextForGuessedValue = function (e, t) {
              switch (typeof e) {
                case 'object':
                  return null === e
                    ? '${1:null}' + t
                    : this.getInsertTextForValue(e, t);
                case 'string':
                  var n = JSON.stringify(e);
                  return (
                    (n = n.substr(1, n.length - 2)),
                    '"${1:' + (n = this.getInsertTextForPlainText(n)) + '}"' + t
                  );
                case 'number':
                case 'boolean':
                  return '${1:' + JSON.stringify(e) + '}' + t;
              }
              return this.getInsertTextForValue(e, t);
            }),
            (e.prototype.getSuggestionKind = function (e) {
              if (Array.isArray(e)) {
                var t = e;
                e = t.length > 0 ? t[0] : void 0;
              }
              if (!e) return Rs.Value;
              switch (e) {
                case 'string':
                default:
                  return Rs.Value;
                case 'object':
                  return Rs.Module;
                case 'property':
                  return Rs.Property;
              }
            }),
            (e.prototype.getLabelTextForMatchingNode = function (e, t) {
              switch (e.type) {
                case 'array':
                  return '[]';
                case 'object':
                  return '{}';
                default:
                  return t.getText().substr(e.offset, e.length);
              }
            }),
            (e.prototype.getInsertTextForMatchingNode = function (e, t, n) {
              switch (e.type) {
                case 'array':
                  return this.getInsertTextForValue([], n);
                case 'object':
                  return this.getInsertTextForValue({}, n);
                default:
                  var r = t.getText().substr(e.offset, e.length) + n;
                  return this.getInsertTextForPlainText(r);
              }
            }),
            (e.prototype.getInsertTextForProperty = function (e, t, n, r) {
              var i = this.getInsertTextForValue(e, '');
              if (!n) return i;
              var o,
                s = i + ': ',
                a = 0;
              if (t) {
                if (Array.isArray(t.defaultSnippets)) {
                  if (1 === t.defaultSnippets.length) {
                    var l = t.defaultSnippets[0].body;
                    ps(l) && (o = this.getInsertTextForSnippetValue(l, ''));
                  }
                  a += t.defaultSnippets.length;
                }
                if (
                  (t.enum &&
                    (o ||
                      1 !== t.enum.length ||
                      (o = this.getInsertTextForGuessedValue(t.enum[0], '')),
                    (a += t.enum.length)),
                  ps(t.default) &&
                    (o ||
                      (o = this.getInsertTextForGuessedValue(t.default, '')),
                    a++),
                  Array.isArray(t.examples) &&
                    t.examples.length &&
                    (o ||
                      (o = this.getInsertTextForGuessedValue(
                        t.examples[0],
                        '',
                      )),
                    (a += t.examples.length)),
                  0 === a)
                ) {
                  var u = Array.isArray(t.type) ? t.type[0] : t.type;
                  switch (
                    (u ||
                      (t.properties
                        ? (u = 'object')
                        : t.items && (u = 'array')),
                    u)
                  ) {
                    case 'boolean':
                      o = '$1';
                      break;
                    case 'string':
                      o = '"$1"';
                      break;
                    case 'object':
                      o = '{$1}';
                      break;
                    case 'array':
                      o = '[$1]';
                      break;
                    case 'number':
                    case 'integer':
                      o = '${1:0}';
                      break;
                    case 'null':
                      o = '${1:null}';
                      break;
                    default:
                      return i;
                  }
                }
              }
              return (!o || a > 1) && (o = '$1'), s + o + r;
            }),
            (e.prototype.getCurrentWord = function (e, t) {
              for (
                var n = t - 1, r = e.getText();
                n >= 0 && -1 === ' \t\n\r\v":{[,]}'.indexOf(r.charAt(n));

              )
                n--;
              return r.substring(n + 1, t);
            }),
            (e.prototype.evaluateSeparatorAfter = function (e, t) {
              var n = us(e.getText(), !0);
              switch ((n.setPosition(t), n.scan())) {
                case 5:
                case 2:
                case 4:
                case 17:
                  return '';
                default:
                  return ',';
              }
            }),
            (e.prototype.findItemAtOffset = function (e, t, n) {
              for (
                var r = us(t.getText(), !0), i = e.items, o = i.length - 1;
                o >= 0;
                o--
              ) {
                var s = i[o];
                if (n > s.offset + s.length)
                  return (
                    r.setPosition(s.offset + s.length),
                    5 === r.scan() &&
                    n >= r.getTokenOffset() + r.getTokenLength()
                      ? o + 1
                      : o
                  );
                if (n >= s.offset) return o;
              }
              return 0;
            }),
            (e.prototype.isInComment = function (e, t, n) {
              var r = us(e.getText(), !1);
              r.setPosition(t);
              for (
                var i = r.scan();
                17 !== i && r.getTokenOffset() + r.getTokenLength() < n;

              )
                i = r.scan();
              return (12 === i || 13 === i) && r.getTokenOffset() <= n;
            }),
            (e.prototype.fromMarkup = function (e) {
              if (e && this.doesSupportMarkdown())
                return { kind: Ls.Markdown, value: e };
            }),
            (e.prototype.doesSupportMarkdown = function () {
              if (!ps(this.supportsMarkdown)) {
                var e =
                  this.clientCapabilities.textDocument &&
                  this.clientCapabilities.textDocument.completion;
                this.supportsMarkdown =
                  e &&
                  e.completionItem &&
                  Array.isArray(e.completionItem.documentationFormat) &&
                  -1 !==
                    e.completionItem.documentationFormat.indexOf(Ls.Markdown);
              }
              return this.supportsMarkdown;
            }),
            (e.prototype.doesSupportsCommitCharacters = function () {
              if (!ps(this.supportsCommitCharacters)) {
                var e =
                  this.clientCapabilities.textDocument &&
                  this.clientCapabilities.textDocument.completion;
                this.supportsCommitCharacters =
                  e &&
                  e.completionItem &&
                  !!e.completionItem.commitCharactersSupport;
              }
              return this.supportsCommitCharacters;
            }),
            e
          );
        })(),
        al = (function () {
          function e(e, t, n) {
            void 0 === t && (t = []),
              (this.schemaService = e),
              (this.contributions = t),
              (this.promise = n || Promise);
          }
          return (
            (e.prototype.doHover = function (e, t, n) {
              var r = e.offsetAt(t),
                i = n.getNodeFromOffset(r);
              if (
                !i ||
                (('object' === i.type || 'array' === i.type) &&
                  r > i.offset + 1 &&
                  r < i.offset + i.length - 1)
              )
                return this.promise.resolve(null);
              var o = i;
              if ('string' === i.type) {
                var s = i.parent;
                if (
                  s &&
                  'property' === s.type &&
                  s.keyNode === i &&
                  !(i = s.valueNode)
                )
                  return this.promise.resolve(null);
              }
              for (
                var a = wo.create(
                    e.positionAt(o.offset),
                    e.positionAt(o.offset + o.length),
                  ),
                  l = function (e) {
                    return { contents: e, range: a };
                  },
                  u = Za(i),
                  c = this.contributions.length - 1;
                c >= 0;
                c--
              ) {
                var h = this.contributions[c].getInfoContribution(e.uri, u);
                if (h)
                  return h.then(function (e) {
                    return l(e);
                  });
              }
              return this.schemaService
                .getSchemaForResource(e.uri, n)
                .then(function (e) {
                  if (e && i) {
                    var t = n.getMatchingSchemas(e.schema, i.offset),
                      r = void 0,
                      o = void 0,
                      s = void 0,
                      a = void 0;
                    t.every(function (e) {
                      if (
                        e.node === i &&
                        !e.inverted &&
                        e.schema &&
                        ((r = r || e.schema.title),
                        (o =
                          o ||
                          e.schema.markdownDescription ||
                          ll(e.schema.description)),
                        e.schema.enum)
                      ) {
                        var t = e.schema.enum.indexOf(Ya(i));
                        e.schema.markdownEnumDescriptions
                          ? (s = e.schema.markdownEnumDescriptions[t])
                          : e.schema.enumDescriptions &&
                            (s = ll(e.schema.enumDescriptions[t])),
                          s &&
                            'string' != typeof (a = e.schema.enum[t]) &&
                            (a = JSON.stringify(a));
                      }
                      return !0;
                    });
                    var u = '';
                    return (
                      r && (u = ll(r)),
                      o && (u.length > 0 && (u += '\n\n'), (u += o)),
                      s &&
                        (u.length > 0 && (u += '\n\n'),
                        (u += '`'
                          .concat(
                            (function (e) {
                              if (-1 !== e.indexOf('`'))
                                return '`` ' + e + ' ``';
                              return e;
                            })(a),
                            '`: ',
                          )
                          .concat(s))),
                      l([u])
                    );
                  }
                  return null;
                });
            }),
            e
          );
        })();
      function ll(e) {
        if (e)
          return e
            .replace(/([^\n\r])(\r?\n)([^\n\r])/gm, '$1\n\n$3')
            .replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
      }
      var ul = Pa(),
        cl = (function () {
          function e(e, t) {
            (this.jsonSchemaService = e),
              (this.promise = t),
              (this.validationEnabled = !0);
          }
          return (
            (e.prototype.configure = function (e) {
              e &&
                ((this.validationEnabled = !1 !== e.validate),
                (this.commentSeverity = e.allowComments ? void 0 : Do.Error));
            }),
            (e.prototype.doValidation = function (e, t, n, r) {
              var i = this;
              if (!this.validationEnabled) return this.promise.resolve([]);
              var o = [],
                s = {},
                a = function (e) {
                  var t =
                    e.range.start.line +
                    ' ' +
                    e.range.start.character +
                    ' ' +
                    e.message;
                  s[t] || ((s[t] = !0), o.push(e));
                },
                l = function (r) {
                  var s = (null == n ? void 0 : n.trailingCommas)
                      ? gl(n.trailingCommas)
                      : Do.Error,
                    l = (null == n ? void 0 : n.comments)
                      ? gl(n.comments)
                      : i.commentSeverity,
                    u = (null == n ? void 0 : n.schemaValidation)
                      ? gl(n.schemaValidation)
                      : Do.Warning,
                    c = (null == n ? void 0 : n.schemaRequest)
                      ? gl(n.schemaRequest)
                      : Do.Warning;
                  if (r) {
                    if (r.errors.length && t.root && c) {
                      var h = t.root,
                        f = 'object' === h.type ? h.properties[0] : void 0;
                      if (f && '$schema' === f.keyNode.value) {
                        var d = f.valueNode || f,
                          g = wo.create(
                            e.positionAt(d.offset),
                            e.positionAt(d.offset + d.length),
                          );
                        a(Ko.create(g, r.errors[0], c, Aa.SchemaResolveError));
                      } else {
                        g = wo.create(
                          e.positionAt(h.offset),
                          e.positionAt(h.offset + 1),
                        );
                        a(Ko.create(g, r.errors[0], c, Aa.SchemaResolveError));
                      }
                    } else if (u) {
                      var m = t.validate(e, r.schema, u);
                      m && m.forEach(a);
                    }
                    fl(r.schema) && (l = void 0), dl(r.schema) && (s = void 0);
                  }
                  for (var p = 0, y = t.syntaxErrors; p < y.length; p++) {
                    var b = y[p];
                    if (b.code === Aa.TrailingComma) {
                      if ('number' != typeof s) continue;
                      b.severity = s;
                    }
                    a(b);
                  }
                  if ('number' == typeof l) {
                    var v = ul(
                      'InvalidCommentToken',
                      'Comments are not permitted in JSON.',
                    );
                    t.comments.forEach(function (e) {
                      a(Ko.create(e, v, l, Aa.CommentNotPermitted));
                    });
                  }
                  return o;
                };
              if (r) {
                var u = r.id || 'schemaservice://untitled/' + hl++;
                return this.jsonSchemaService
                  .registerExternalSchema(u, [], r)
                  .getResolvedSchema()
                  .then(function (e) {
                    return l(e);
                  });
              }
              return this.jsonSchemaService
                .getSchemaForResource(e.uri, t)
                .then(function (e) {
                  return l(e);
                });
            }),
            (e.prototype.getLanguageStatus = function (e, t) {
              return {
                schemas: this.jsonSchemaService.getSchemaURIsForResource(
                  e.uri,
                  t,
                ),
              };
            }),
            e
          );
        })(),
        hl = 0;
      function fl(e) {
        if (e && 'object' == typeof e) {
          if (ys(e.allowComments)) return e.allowComments;
          if (e.allOf)
            for (var t = 0, n = e.allOf; t < n.length; t++) {
              var r = fl(n[t]);
              if (ys(r)) return r;
            }
        }
      }
      function dl(e) {
        if (e && 'object' == typeof e) {
          if (ys(e.allowTrailingCommas)) return e.allowTrailingCommas;
          var t = e;
          if (ys(t.allowsTrailingCommas)) return t.allowsTrailingCommas;
          if (e.allOf)
            for (var n = 0, r = e.allOf; n < r.length; n++) {
              var i = dl(r[n]);
              if (ys(i)) return i;
            }
        }
      }
      function gl(e) {
        switch (e) {
          case 'error':
            return Do.Error;
          case 'warning':
            return Do.Warning;
          case 'ignore':
            return;
        }
      }
      var ml = 48,
        pl = 57,
        yl = 65,
        bl = 97,
        vl = 102;
      function wl(e) {
        return e < ml
          ? 0
          : e <= pl
          ? e - ml
          : (e < bl && (e += bl - yl), e >= bl && e <= vl ? e - bl + 10 : 0);
      }
      function Sl(e) {
        if ('#' === e[0])
          switch (e.length) {
            case 4:
              return {
                red: (17 * wl(e.charCodeAt(1))) / 255,
                green: (17 * wl(e.charCodeAt(2))) / 255,
                blue: (17 * wl(e.charCodeAt(3))) / 255,
                alpha: 1,
              };
            case 5:
              return {
                red: (17 * wl(e.charCodeAt(1))) / 255,
                green: (17 * wl(e.charCodeAt(2))) / 255,
                blue: (17 * wl(e.charCodeAt(3))) / 255,
                alpha: (17 * wl(e.charCodeAt(4))) / 255,
              };
            case 7:
              return {
                red: (16 * wl(e.charCodeAt(1)) + wl(e.charCodeAt(2))) / 255,
                green: (16 * wl(e.charCodeAt(3)) + wl(e.charCodeAt(4))) / 255,
                blue: (16 * wl(e.charCodeAt(5)) + wl(e.charCodeAt(6))) / 255,
                alpha: 1,
              };
            case 9:
              return {
                red: (16 * wl(e.charCodeAt(1)) + wl(e.charCodeAt(2))) / 255,
                green: (16 * wl(e.charCodeAt(3)) + wl(e.charCodeAt(4))) / 255,
                blue: (16 * wl(e.charCodeAt(5)) + wl(e.charCodeAt(6))) / 255,
                alpha: (16 * wl(e.charCodeAt(7)) + wl(e.charCodeAt(8))) / 255,
              };
          }
      }
      var _l = (function () {
        function e(e) {
          this.schemaService = e;
        }
        return (
          (e.prototype.findDocumentSymbols = function (e, t, n) {
            var r = this;
            void 0 === n && (n = { resultLimit: Number.MAX_VALUE });
            var i = t.root;
            if (!i) return [];
            var o = n.resultLimit || Number.MAX_VALUE,
              s = e.uri;
            if (
              ('vscode://defaultsettings/keybindings.json' === s ||
                bs(s.toLowerCase(), '/user/keybindings.json')) &&
              'array' === i.type
            ) {
              for (var a = [], l = 0, u = i.items; l < u.length; l++) {
                var c = u[l];
                if ('object' === c.type)
                  for (var h = 0, f = c.properties; h < f.length; h++) {
                    var d = f[h];
                    if ('key' === d.keyNode.value && d.valueNode) {
                      var g = _o.create(e.uri, Cl(e, c));
                      if (
                        (a.push({
                          name: Ya(d.valueNode),
                          kind: Xs.Function,
                          location: g,
                        }),
                        --o <= 0)
                      )
                        return (
                          n &&
                            n.onResultLimitExceeded &&
                            n.onResultLimitExceeded(s),
                          a
                        );
                    }
                  }
              }
              return a;
            }
            for (
              var m = [{ node: i, containerName: '' }],
                p = 0,
                y = !1,
                b = [],
                v = function (t, n) {
                  'array' === t.type
                    ? t.items.forEach(function (e) {
                        e && m.push({ node: e, containerName: n });
                      })
                    : 'object' === t.type &&
                      t.properties.forEach(function (t) {
                        var i = t.valueNode;
                        if (i)
                          if (o > 0) {
                            o--;
                            var s = _o.create(e.uri, Cl(e, t)),
                              a = n
                                ? n + '.' + t.keyNode.value
                                : t.keyNode.value;
                            b.push({
                              name: r.getKeyLabel(t),
                              kind: r.getSymbolKind(i.type),
                              location: s,
                              containerName: n,
                            }),
                              m.push({ node: i, containerName: a });
                          } else y = !0;
                      });
                };
              p < m.length;

            ) {
              var w = m[p++];
              v(w.node, w.containerName);
            }
            return (
              y && n && n.onResultLimitExceeded && n.onResultLimitExceeded(s), b
            );
          }),
          (e.prototype.findDocumentSymbols2 = function (e, t, n) {
            var r = this;
            void 0 === n && (n = { resultLimit: Number.MAX_VALUE });
            var i = t.root;
            if (!i) return [];
            var o = n.resultLimit || Number.MAX_VALUE,
              s = e.uri;
            if (
              ('vscode://defaultsettings/keybindings.json' === s ||
                bs(s.toLowerCase(), '/user/keybindings.json')) &&
              'array' === i.type
            ) {
              for (var a = [], l = 0, u = i.items; l < u.length; l++) {
                var c = u[l];
                if ('object' === c.type)
                  for (var h = 0, f = c.properties; h < f.length; h++) {
                    var d = f[h];
                    if ('key' === d.keyNode.value && d.valueNode) {
                      var g = Cl(e, c),
                        m = Cl(e, d.keyNode);
                      if (
                        (a.push({
                          name: Ya(d.valueNode),
                          kind: Xs.Function,
                          range: g,
                          selectionRange: m,
                        }),
                        --o <= 0)
                      )
                        return (
                          n &&
                            n.onResultLimitExceeded &&
                            n.onResultLimitExceeded(s),
                          a
                        );
                    }
                  }
              }
              return a;
            }
            for (
              var p = [],
                y = [{ node: i, result: p }],
                b = 0,
                v = !1,
                w = function (t, n) {
                  'array' === t.type
                    ? t.items.forEach(function (t, i) {
                        if (t)
                          if (o > 0) {
                            o--;
                            var s = Cl(e, t),
                              a = s,
                              l = {
                                name: String(i),
                                kind: r.getSymbolKind(t.type),
                                range: s,
                                selectionRange: a,
                                children: [],
                              };
                            n.push(l), y.push({ result: l.children, node: t });
                          } else v = !0;
                      })
                    : 'object' === t.type &&
                      t.properties.forEach(function (t) {
                        var i = t.valueNode;
                        if (i)
                          if (o > 0) {
                            o--;
                            var s = Cl(e, t),
                              a = Cl(e, t.keyNode),
                              l = [],
                              u = {
                                name: r.getKeyLabel(t),
                                kind: r.getSymbolKind(i.type),
                                range: s,
                                selectionRange: a,
                                children: l,
                                detail: r.getDetail(i),
                              };
                            n.push(u), y.push({ result: l, node: i });
                          } else v = !0;
                      });
                };
              b < y.length;

            ) {
              var S = y[b++];
              w(S.node, S.result);
            }
            return (
              v && n && n.onResultLimitExceeded && n.onResultLimitExceeded(s), p
            );
          }),
          (e.prototype.getSymbolKind = function (e) {
            switch (e) {
              case 'object':
                return Xs.Module;
              case 'string':
                return Xs.String;
              case 'number':
                return Xs.Number;
              case 'array':
                return Xs.Array;
              case 'boolean':
                return Xs.Boolean;
              default:
                return Xs.Variable;
            }
          }),
          (e.prototype.getKeyLabel = function (e) {
            var t = e.keyNode.value;
            return (
              t && (t = t.replace(/[\n]/g, '↵')),
              t && t.trim() ? t : '"'.concat(t, '"')
            );
          }),
          (e.prototype.getDetail = function (e) {
            if (e)
              return 'boolean' === e.type ||
                'number' === e.type ||
                'null' === e.type ||
                'string' === e.type
                ? String(e.value)
                : 'array' === e.type
                ? e.children.length
                  ? void 0
                  : '[]'
                : 'object' === e.type
                ? e.children.length
                  ? void 0
                  : '{}'
                : void 0;
          }),
          (e.prototype.findDocumentColors = function (e, t, n) {
            return this.schemaService
              .getSchemaForResource(e.uri, t)
              .then(function (r) {
                var i = [];
                if (r)
                  for (
                    var o =
                        n && 'number' == typeof n.resultLimit
                          ? n.resultLimit
                          : Number.MAX_VALUE,
                      s = {},
                      a = 0,
                      l = t.getMatchingSchemas(r.schema);
                    a < l.length;
                    a++
                  ) {
                    var u = l[a];
                    if (
                      !u.inverted &&
                      u.schema &&
                      ('color' === u.schema.format ||
                        'color-hex' === u.schema.format) &&
                      u.node &&
                      'string' === u.node.type
                    ) {
                      var c = String(u.node.offset);
                      if (!s[c]) {
                        var h = Sl(Ya(u.node));
                        if (h) {
                          var f = Cl(e, u.node);
                          i.push({ color: h, range: f });
                        }
                        if (((s[c] = !0), --o <= 0))
                          return (
                            n &&
                              n.onResultLimitExceeded &&
                              n.onResultLimitExceeded(e.uri),
                            i
                          );
                      }
                    }
                  }
                return i;
              });
          }),
          (e.prototype.getColorPresentations = function (e, t, n, r) {
            var i,
              o = [],
              s = Math.round(255 * n.red),
              a = Math.round(255 * n.green),
              l = Math.round(255 * n.blue);
            function u(e) {
              var t = e.toString(16);
              return 2 !== t.length ? '0' + t : t;
            }
            return (
              (i =
                1 === n.alpha
                  ? '#'.concat(u(s)).concat(u(a)).concat(u(l))
                  : '#'
                      .concat(u(s))
                      .concat(u(a))
                      .concat(u(l))
                      .concat(u(Math.round(255 * n.alpha)))),
              o.push({ label: i, textEdit: Ho.replace(r, JSON.stringify(i)) }),
              o
            );
          }),
          e
        );
      })();
      function Cl(e, t) {
        return wo.create(
          e.positionAt(t.offset),
          e.positionAt(t.offset + t.length),
        );
      }
      var El,
        Al,
        xl,
        Nl,
        Ll,
        Ol,
        kl = Pa(),
        Rl = {
          schemaAssociations: [],
          schemas: {
            'http://json-schema.org/schema#': {
              $ref: 'http://json-schema.org/draft-07/schema#',
            },
            'http://json-schema.org/draft-04/schema#': {
              $schema: 'http://json-schema.org/draft-04/schema#',
              definitions: {
                schemaArray: {
                  type: 'array',
                  minItems: 1,
                  items: { $ref: '#' },
                },
                positiveInteger: { type: 'integer', minimum: 0 },
                positiveIntegerDefault0: {
                  allOf: [
                    { $ref: '#/definitions/positiveInteger' },
                    { default: 0 },
                  ],
                },
                simpleTypes: {
                  type: 'string',
                  enum: [
                    'array',
                    'boolean',
                    'integer',
                    'null',
                    'number',
                    'object',
                    'string',
                  ],
                },
                stringArray: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                  uniqueItems: !0,
                },
              },
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uri' },
                $schema: { type: 'string', format: 'uri' },
                title: { type: 'string' },
                description: { type: 'string' },
                default: {},
                multipleOf: {
                  type: 'number',
                  minimum: 0,
                  exclusiveMinimum: !0,
                },
                maximum: { type: 'number' },
                exclusiveMaximum: { type: 'boolean', default: !1 },
                minimum: { type: 'number' },
                exclusiveMinimum: { type: 'boolean', default: !1 },
                maxLength: {
                  allOf: [{ $ref: '#/definitions/positiveInteger' }],
                },
                minLength: {
                  allOf: [{ $ref: '#/definitions/positiveIntegerDefault0' }],
                },
                pattern: { type: 'string', format: 'regex' },
                additionalItems: {
                  anyOf: [{ type: 'boolean' }, { $ref: '#' }],
                  default: {},
                },
                items: {
                  anyOf: [{ $ref: '#' }, { $ref: '#/definitions/schemaArray' }],
                  default: {},
                },
                maxItems: {
                  allOf: [{ $ref: '#/definitions/positiveInteger' }],
                },
                minItems: {
                  allOf: [{ $ref: '#/definitions/positiveIntegerDefault0' }],
                },
                uniqueItems: { type: 'boolean', default: !1 },
                maxProperties: {
                  allOf: [{ $ref: '#/definitions/positiveInteger' }],
                },
                minProperties: {
                  allOf: [{ $ref: '#/definitions/positiveIntegerDefault0' }],
                },
                required: { allOf: [{ $ref: '#/definitions/stringArray' }] },
                additionalProperties: {
                  anyOf: [{ type: 'boolean' }, { $ref: '#' }],
                  default: {},
                },
                definitions: {
                  type: 'object',
                  additionalProperties: { $ref: '#' },
                  default: {},
                },
                properties: {
                  type: 'object',
                  additionalProperties: { $ref: '#' },
                  default: {},
                },
                patternProperties: {
                  type: 'object',
                  additionalProperties: { $ref: '#' },
                  default: {},
                },
                dependencies: {
                  type: 'object',
                  additionalProperties: {
                    anyOf: [
                      { $ref: '#' },
                      { $ref: '#/definitions/stringArray' },
                    ],
                  },
                },
                enum: { type: 'array', minItems: 1, uniqueItems: !0 },
                type: {
                  anyOf: [
                    { $ref: '#/definitions/simpleTypes' },
                    {
                      type: 'array',
                      items: { $ref: '#/definitions/simpleTypes' },
                      minItems: 1,
                      uniqueItems: !0,
                    },
                  ],
                },
                format: {
                  anyOf: [
                    {
                      type: 'string',
                      enum: [
                        'date-time',
                        'uri',
                        'email',
                        'hostname',
                        'ipv4',
                        'ipv6',
                        'regex',
                      ],
                    },
                    { type: 'string' },
                  ],
                },
                allOf: { allOf: [{ $ref: '#/definitions/schemaArray' }] },
                anyOf: { allOf: [{ $ref: '#/definitions/schemaArray' }] },
                oneOf: { allOf: [{ $ref: '#/definitions/schemaArray' }] },
                not: { allOf: [{ $ref: '#' }] },
              },
              dependencies: {
                exclusiveMaximum: ['maximum'],
                exclusiveMinimum: ['minimum'],
              },
              default: {},
            },
            'http://json-schema.org/draft-07/schema#': {
              definitions: {
                schemaArray: {
                  type: 'array',
                  minItems: 1,
                  items: { $ref: '#' },
                },
                nonNegativeInteger: { type: 'integer', minimum: 0 },
                nonNegativeIntegerDefault0: {
                  allOf: [
                    { $ref: '#/definitions/nonNegativeInteger' },
                    { default: 0 },
                  ],
                },
                simpleTypes: {
                  enum: [
                    'array',
                    'boolean',
                    'integer',
                    'null',
                    'number',
                    'object',
                    'string',
                  ],
                },
                stringArray: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: !0,
                  default: [],
                },
              },
              type: ['object', 'boolean'],
              properties: {
                $id: { type: 'string', format: 'uri-reference' },
                $schema: { type: 'string', format: 'uri' },
                $ref: { type: 'string', format: 'uri-reference' },
                $comment: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                default: !0,
                readOnly: { type: 'boolean', default: !1 },
                examples: { type: 'array', items: !0 },
                multipleOf: { type: 'number', exclusiveMinimum: 0 },
                maximum: { type: 'number' },
                exclusiveMaximum: { type: 'number' },
                minimum: { type: 'number' },
                exclusiveMinimum: { type: 'number' },
                maxLength: { $ref: '#/definitions/nonNegativeInteger' },
                minLength: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
                pattern: { type: 'string', format: 'regex' },
                additionalItems: { $ref: '#' },
                items: {
                  anyOf: [{ $ref: '#' }, { $ref: '#/definitions/schemaArray' }],
                  default: !0,
                },
                maxItems: { $ref: '#/definitions/nonNegativeInteger' },
                minItems: { $ref: '#/definitions/nonNegativeIntegerDefault0' },
                uniqueItems: { type: 'boolean', default: !1 },
                contains: { $ref: '#' },
                maxProperties: { $ref: '#/definitions/nonNegativeInteger' },
                minProperties: {
                  $ref: '#/definitions/nonNegativeIntegerDefault0',
                },
                required: { $ref: '#/definitions/stringArray' },
                additionalProperties: { $ref: '#' },
                definitions: {
                  type: 'object',
                  additionalProperties: { $ref: '#' },
                  default: {},
                },
                properties: {
                  type: 'object',
                  additionalProperties: { $ref: '#' },
                  default: {},
                },
                patternProperties: {
                  type: 'object',
                  additionalProperties: { $ref: '#' },
                  propertyNames: { format: 'regex' },
                  default: {},
                },
                dependencies: {
                  type: 'object',
                  additionalProperties: {
                    anyOf: [
                      { $ref: '#' },
                      { $ref: '#/definitions/stringArray' },
                    ],
                  },
                },
                propertyNames: { $ref: '#' },
                const: !0,
                enum: {
                  type: 'array',
                  items: !0,
                  minItems: 1,
                  uniqueItems: !0,
                },
                type: {
                  anyOf: [
                    { $ref: '#/definitions/simpleTypes' },
                    {
                      type: 'array',
                      items: { $ref: '#/definitions/simpleTypes' },
                      minItems: 1,
                      uniqueItems: !0,
                    },
                  ],
                },
                format: { type: 'string' },
                contentMediaType: { type: 'string' },
                contentEncoding: { type: 'string' },
                if: { $ref: '#' },
                then: { $ref: '#' },
                else: { $ref: '#' },
                allOf: { $ref: '#/definitions/schemaArray' },
                anyOf: { $ref: '#/definitions/schemaArray' },
                oneOf: { $ref: '#/definitions/schemaArray' },
                not: { $ref: '#' },
              },
              default: !0,
            },
          },
        },
        Tl = {
          id: kl('schema.json.id', 'A unique identifier for the schema.'),
          $schema: kl(
            'schema.json.$schema',
            'The schema to verify this document against.',
          ),
          title: kl('schema.json.title', 'A descriptive title of the element.'),
          description: kl(
            'schema.json.description',
            'A long description of the element. Used in hover menus and suggestions.',
          ),
          default: kl(
            'schema.json.default',
            'A default value. Used by suggestions.',
          ),
          multipleOf: kl(
            'schema.json.multipleOf',
            'A number that should cleanly divide the current value (i.e. have no remainder).',
          ),
          maximum: kl(
            'schema.json.maximum',
            'The maximum numerical value, inclusive by default.',
          ),
          exclusiveMaximum: kl(
            'schema.json.exclusiveMaximum',
            'Makes the maximum property exclusive.',
          ),
          minimum: kl(
            'schema.json.minimum',
            'The minimum numerical value, inclusive by default.',
          ),
          exclusiveMinimum: kl(
            'schema.json.exclusiveMininum',
            'Makes the minimum property exclusive.',
          ),
          maxLength: kl(
            'schema.json.maxLength',
            'The maximum length of a string.',
          ),
          minLength: kl(
            'schema.json.minLength',
            'The minimum length of a string.',
          ),
          pattern: kl(
            'schema.json.pattern',
            'A regular expression to match the string against. It is not implicitly anchored.',
          ),
          additionalItems: kl(
            'schema.json.additionalItems',
            'For arrays, only when items is set as an array. If it is a schema, then this schema validates items after the ones specified by the items array. If it is false, then additional items will cause validation to fail.',
          ),
          items: kl(
            'schema.json.items',
            'For arrays. Can either be a schema to validate every element against or an array of schemas to validate each item against in order (the first schema will validate the first element, the second schema will validate the second element, and so on.',
          ),
          maxItems: kl(
            'schema.json.maxItems',
            'The maximum number of items that can be inside an array. Inclusive.',
          ),
          minItems: kl(
            'schema.json.minItems',
            'The minimum number of items that can be inside an array. Inclusive.',
          ),
          uniqueItems: kl(
            'schema.json.uniqueItems',
            'If all of the items in the array must be unique. Defaults to false.',
          ),
          maxProperties: kl(
            'schema.json.maxProperties',
            'The maximum number of properties an object can have. Inclusive.',
          ),
          minProperties: kl(
            'schema.json.minProperties',
            'The minimum number of properties an object can have. Inclusive.',
          ),
          required: kl(
            'schema.json.required',
            'An array of strings that lists the names of all properties required on this object.',
          ),
          additionalProperties: kl(
            'schema.json.additionalProperties',
            "Either a schema or a boolean. If a schema, then used to validate all properties not matched by 'properties' or 'patternProperties'. If false, then any properties not matched by either will cause this schema to fail.",
          ),
          definitions: kl(
            'schema.json.definitions',
            'Not used for validation. Place subschemas here that you wish to reference inline with $ref.',
          ),
          properties: kl(
            'schema.json.properties',
            'A map of property names to schemas for each property.',
          ),
          patternProperties: kl(
            'schema.json.patternProperties',
            'A map of regular expressions on property names to schemas for matching properties.',
          ),
          dependencies: kl(
            'schema.json.dependencies',
            'A map of property names to either an array of property names or a schema. An array of property names means the property named in the key depends on the properties in the array being present in the object in order to be valid. If the value is a schema, then the schema is only applied to the object if the property in the key exists on the object.',
          ),
          enum: kl(
            'schema.json.enum',
            'The set of literal values that are valid.',
          ),
          type: kl(
            'schema.json.type',
            'Either a string of one of the basic schema types (number, integer, null, array, object, boolean, string) or an array of strings specifying a subset of those types.',
          ),
          format: kl(
            'schema.json.format',
            'Describes the format expected for the value.',
          ),
          allOf: kl(
            'schema.json.allOf',
            'An array of schemas, all of which must match.',
          ),
          anyOf: kl(
            'schema.json.anyOf',
            'An array of schemas, where at least one must match.',
          ),
          oneOf: kl(
            'schema.json.oneOf',
            'An array of schemas, exactly one of which must match.',
          ),
          not: kl('schema.json.not', 'A schema which must not match.'),
          $id: kl('schema.json.$id', 'A unique identifier for the schema.'),
          $ref: kl(
            'schema.json.$ref',
            'Reference a definition hosted on any location.',
          ),
          $comment: kl(
            'schema.json.$comment',
            'Comments from schema authors to readers or maintainers of the schema.',
          ),
          readOnly: kl(
            'schema.json.readOnly',
            'Indicates that the value of the instance is managed exclusively by the owning authority.',
          ),
          examples: kl(
            'schema.json.examples',
            'Sample JSON values associated with a particular schema, for the purpose of illustrating usage.',
          ),
          contains: kl(
            'schema.json.contains',
            'An array instance is valid against "contains" if at least one of its elements is valid against the given schema.',
          ),
          propertyNames: kl(
            'schema.json.propertyNames',
            'If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema.',
          ),
          const: kl(
            'schema.json.const',
            'An instance validates successfully against this keyword if its value is equal to the value of the keyword.',
          ),
          contentMediaType: kl(
            'schema.json.contentMediaType',
            'Describes the media type of a string property.',
          ),
          contentEncoding: kl(
            'schema.json.contentEncoding',
            'Describes the content encoding of a string property.',
          ),
          if: kl(
            'schema.json.if',
            'The validation outcome of the "if" subschema controls which of the "then" or "else" keywords are evaluated.',
          ),
          then: kl(
            'schema.json.then',
            'The "if" subschema is used for validation when the "if" subschema succeeds.',
          ),
          else: kl(
            'schema.json.else',
            'The "else" subschema is used for validation when the "if" subschema fails.',
          ),
        };
      for (Ll in Rl.schemas)
        for (Nl in (El = Rl.schemas[Ll]).properties)
          'boolean' == typeof (Al = El.properties[Nl]) &&
            (Al = El.properties[Nl] = {}),
            (xl = Tl[Nl])
              ? (Al.description = xl)
              : io.log(
                  ''
                    .concat(Nl, ": localize('schema.json.")
                    .concat(Nl, '\', "")'),
                );
      Ol = (() => {
        var e = {
            470: e => {
              function t(e) {
                if ('string' != typeof e)
                  throw new TypeError(
                    'Path must be a string. Received ' + JSON.stringify(e),
                  );
              }
              function n(e, t) {
                for (
                  var n, r = '', i = 0, o = -1, s = 0, a = 0;
                  a <= e.length;
                  ++a
                ) {
                  if (a < e.length) n = e.charCodeAt(a);
                  else {
                    if (47 === n) break;
                    n = 47;
                  }
                  if (47 === n) {
                    if (o === a - 1 || 1 === s);
                    else if (o !== a - 1 && 2 === s) {
                      if (
                        r.length < 2 ||
                        2 !== i ||
                        46 !== r.charCodeAt(r.length - 1) ||
                        46 !== r.charCodeAt(r.length - 2)
                      )
                        if (r.length > 2) {
                          var l = r.lastIndexOf('/');
                          if (l !== r.length - 1) {
                            -1 === l
                              ? ((r = ''), (i = 0))
                              : (i =
                                  (r = r.slice(0, l)).length -
                                  1 -
                                  r.lastIndexOf('/')),
                              (o = a),
                              (s = 0);
                            continue;
                          }
                        } else if (2 === r.length || 1 === r.length) {
                          (r = ''), (i = 0), (o = a), (s = 0);
                          continue;
                        }
                      t && (r.length > 0 ? (r += '/..') : (r = '..'), (i = 2));
                    } else
                      r.length > 0
                        ? (r += '/' + e.slice(o + 1, a))
                        : (r = e.slice(o + 1, a)),
                        (i = a - o - 1);
                    (o = a), (s = 0);
                  } else 46 === n && -1 !== s ? ++s : (s = -1);
                }
                return r;
              }
              var r = {
                resolve: function () {
                  for (
                    var e, r = '', i = !1, o = arguments.length - 1;
                    o >= -1 && !i;
                    o--
                  ) {
                    var s;
                    o >= 0
                      ? (s = arguments[o])
                      : (void 0 === e && (e = oo.cwd()), (s = e)),
                      t(s),
                      0 !== s.length &&
                        ((r = s + '/' + r), (i = 47 === s.charCodeAt(0)));
                  }
                  return (
                    (r = n(r, !i)),
                    i ? (r.length > 0 ? '/' + r : '/') : r.length > 0 ? r : '.'
                  );
                },
                normalize: function (e) {
                  if ((t(e), 0 === e.length)) return '.';
                  var r = 47 === e.charCodeAt(0),
                    i = 47 === e.charCodeAt(e.length - 1);
                  return (
                    0 !== (e = n(e, !r)).length || r || (e = '.'),
                    e.length > 0 && i && (e += '/'),
                    r ? '/' + e : e
                  );
                },
                isAbsolute: function (e) {
                  return t(e), e.length > 0 && 47 === e.charCodeAt(0);
                },
                join: function () {
                  if (0 === arguments.length) return '.';
                  for (var e, n = 0; n < arguments.length; ++n) {
                    var i = arguments[n];
                    t(i),
                      i.length > 0 && (void 0 === e ? (e = i) : (e += '/' + i));
                  }
                  return void 0 === e ? '.' : r.normalize(e);
                },
                relative: function (e, n) {
                  if ((t(e), t(n), e === n)) return '';
                  if ((e = r.resolve(e)) === (n = r.resolve(n))) return '';
                  for (var i = 1; i < e.length && 47 === e.charCodeAt(i); ++i);
                  for (
                    var o = e.length, s = o - i, a = 1;
                    a < n.length && 47 === n.charCodeAt(a);
                    ++a
                  );
                  for (
                    var l = n.length - a, u = s < l ? s : l, c = -1, h = 0;
                    h <= u;
                    ++h
                  ) {
                    if (h === u) {
                      if (l > u) {
                        if (47 === n.charCodeAt(a + h))
                          return n.slice(a + h + 1);
                        if (0 === h) return n.slice(a + h);
                      } else
                        s > u &&
                          (47 === e.charCodeAt(i + h)
                            ? (c = h)
                            : 0 === h && (c = 0));
                      break;
                    }
                    var f = e.charCodeAt(i + h);
                    if (f !== n.charCodeAt(a + h)) break;
                    47 === f && (c = h);
                  }
                  var d = '';
                  for (h = i + c + 1; h <= o; ++h)
                    (h !== o && 47 !== e.charCodeAt(h)) ||
                      (0 === d.length ? (d += '..') : (d += '/..'));
                  return d.length > 0
                    ? d + n.slice(a + c)
                    : ((a += c), 47 === n.charCodeAt(a) && ++a, n.slice(a));
                },
                _makeLong: function (e) {
                  return e;
                },
                dirname: function (e) {
                  if ((t(e), 0 === e.length)) return '.';
                  for (
                    var n = e.charCodeAt(0),
                      r = 47 === n,
                      i = -1,
                      o = !0,
                      s = e.length - 1;
                    s >= 1;
                    --s
                  )
                    if (47 === (n = e.charCodeAt(s))) {
                      if (!o) {
                        i = s;
                        break;
                      }
                    } else o = !1;
                  return -1 === i
                    ? r
                      ? '/'
                      : '.'
                    : r && 1 === i
                    ? '//'
                    : e.slice(0, i);
                },
                basename: function (e, n) {
                  if (void 0 !== n && 'string' != typeof n)
                    throw new TypeError('"ext" argument must be a string');
                  t(e);
                  var r,
                    i = 0,
                    o = -1,
                    s = !0;
                  if (void 0 !== n && n.length > 0 && n.length <= e.length) {
                    if (n.length === e.length && n === e) return '';
                    var a = n.length - 1,
                      l = -1;
                    for (r = e.length - 1; r >= 0; --r) {
                      var u = e.charCodeAt(r);
                      if (47 === u) {
                        if (!s) {
                          i = r + 1;
                          break;
                        }
                      } else
                        -1 === l && ((s = !1), (l = r + 1)),
                          a >= 0 &&
                            (u === n.charCodeAt(a)
                              ? -1 == --a && (o = r)
                              : ((a = -1), (o = l)));
                    }
                    return (
                      i === o ? (o = l) : -1 === o && (o = e.length),
                      e.slice(i, o)
                    );
                  }
                  for (r = e.length - 1; r >= 0; --r)
                    if (47 === e.charCodeAt(r)) {
                      if (!s) {
                        i = r + 1;
                        break;
                      }
                    } else -1 === o && ((s = !1), (o = r + 1));
                  return -1 === o ? '' : e.slice(i, o);
                },
                extname: function (e) {
                  t(e);
                  for (
                    var n = -1, r = 0, i = -1, o = !0, s = 0, a = e.length - 1;
                    a >= 0;
                    --a
                  ) {
                    var l = e.charCodeAt(a);
                    if (47 !== l)
                      -1 === i && ((o = !1), (i = a + 1)),
                        46 === l
                          ? -1 === n
                            ? (n = a)
                            : 1 !== s && (s = 1)
                          : -1 !== n && (s = -1);
                    else if (!o) {
                      r = a + 1;
                      break;
                    }
                  }
                  return -1 === n ||
                    -1 === i ||
                    0 === s ||
                    (1 === s && n === i - 1 && n === r + 1)
                    ? ''
                    : e.slice(n, i);
                },
                format: function (e) {
                  if (null === e || 'object' != typeof e)
                    throw new TypeError(
                      'The "pathObject" argument must be of type Object. Received type ' +
                        typeof e,
                    );
                  return (
                    (n = (t = e).dir || t.root),
                    (r = t.base || (t.name || '') + (t.ext || '')),
                    n ? (n === t.root ? n + r : n + '/' + r) : r
                  );
                  var t, n, r;
                },
                parse: function (e) {
                  t(e);
                  var n = { root: '', dir: '', base: '', ext: '', name: '' };
                  if (0 === e.length) return n;
                  var r,
                    i = e.charCodeAt(0),
                    o = 47 === i;
                  o ? ((n.root = '/'), (r = 1)) : (r = 0);
                  for (
                    var s = -1, a = 0, l = -1, u = !0, c = e.length - 1, h = 0;
                    c >= r;
                    --c
                  )
                    if (47 !== (i = e.charCodeAt(c)))
                      -1 === l && ((u = !1), (l = c + 1)),
                        46 === i
                          ? -1 === s
                            ? (s = c)
                            : 1 !== h && (h = 1)
                          : -1 !== s && (h = -1);
                    else if (!u) {
                      a = c + 1;
                      break;
                    }
                  return (
                    -1 === s ||
                    -1 === l ||
                    0 === h ||
                    (1 === h && s === l - 1 && s === a + 1)
                      ? -1 !== l &&
                        (n.base = n.name =
                          0 === a && o ? e.slice(1, l) : e.slice(a, l))
                      : (0 === a && o
                          ? ((n.name = e.slice(1, s)), (n.base = e.slice(1, l)))
                          : ((n.name = e.slice(a, s)),
                            (n.base = e.slice(a, l))),
                        (n.ext = e.slice(s, l))),
                    a > 0 ? (n.dir = e.slice(0, a - 1)) : o && (n.dir = '/'),
                    n
                  );
                },
                sep: '/',
                delimiter: ':',
                win32: null,
                posix: null,
              };
              (r.posix = r), (e.exports = r);
            },
            447: (e, t, n) => {
              var r;
              if (
                (n.r(t),
                n.d(t, { URI: () => m, Utils: () => x }),
                'object' == typeof oo)
              )
                r = 'win32' === oo.platform;
              else if ('object' == typeof navigator) {
                var i = navigator.userAgent;
                r = i.indexOf('Windows') >= 0;
              }
              var o,
                s,
                a =
                  ((o = function (e, t) {
                    return (o =
                      Object.setPrototypeOf ||
                      ({ __proto__: [] } instanceof Array &&
                        function (e, t) {
                          e.__proto__ = t;
                        }) ||
                      function (e, t) {
                        for (var n in t)
                          Object.prototype.hasOwnProperty.call(t, n) &&
                            (e[n] = t[n]);
                      })(e, t);
                  }),
                  function (e, t) {
                    if ('function' != typeof t && null !== t)
                      throw new TypeError(
                        'Class extends value ' +
                          String(t) +
                          ' is not a constructor or null',
                      );
                    function n() {
                      this.constructor = e;
                    }
                    o(e, t),
                      (e.prototype =
                        null === t
                          ? Object.create(t)
                          : ((n.prototype = t.prototype), new n()));
                  }),
                l = /^\w[\w\d+.-]*$/,
                u = /^\//,
                c = /^\/\//;
              function h(e, t) {
                if (!e.scheme && t)
                  throw new Error(
                    '[UriError]: Scheme is missing: {scheme: "", authority: "'
                      .concat(e.authority, '", path: "')
                      .concat(e.path, '", query: "')
                      .concat(e.query, '", fragment: "')
                      .concat(e.fragment, '"}'),
                  );
                if (e.scheme && !l.test(e.scheme))
                  throw new Error(
                    '[UriError]: Scheme contains illegal characters.',
                  );
                if (e.path)
                  if (e.authority) {
                    if (!u.test(e.path))
                      throw new Error(
                        '[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character',
                      );
                  } else if (c.test(e.path))
                    throw new Error(
                      '[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")',
                    );
              }
              var f = '',
                d = '/',
                g =
                  /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,
                m = (function () {
                  function e(e, t, n, r, i, o) {
                    void 0 === o && (o = !1),
                      'object' == typeof e
                        ? ((this.scheme = e.scheme || f),
                          (this.authority = e.authority || f),
                          (this.path = e.path || f),
                          (this.query = e.query || f),
                          (this.fragment = e.fragment || f))
                        : ((this.scheme = (function (e, t) {
                            return e || t ? e : 'file';
                          })(e, o)),
                          (this.authority = t || f),
                          (this.path = (function (e, t) {
                            switch (e) {
                              case 'https':
                              case 'http':
                              case 'file':
                                t ? t[0] !== d && (t = d + t) : (t = d);
                            }
                            return t;
                          })(this.scheme, n || f)),
                          (this.query = r || f),
                          (this.fragment = i || f),
                          h(this, o));
                  }
                  return (
                    (e.isUri = function (t) {
                      return (
                        t instanceof e ||
                        (!!t &&
                          'string' == typeof t.authority &&
                          'string' == typeof t.fragment &&
                          'string' == typeof t.path &&
                          'string' == typeof t.query &&
                          'string' == typeof t.scheme &&
                          'string' == typeof t.fsPath &&
                          'function' == typeof t.with &&
                          'function' == typeof t.toString)
                      );
                    }),
                    Object.defineProperty(e.prototype, 'fsPath', {
                      get: function () {
                        return S(this, !1);
                      },
                      enumerable: !1,
                      configurable: !0,
                    }),
                    (e.prototype.with = function (e) {
                      if (!e) return this;
                      var t = e.scheme,
                        n = e.authority,
                        r = e.path,
                        i = e.query,
                        o = e.fragment;
                      return (
                        void 0 === t
                          ? (t = this.scheme)
                          : null === t && (t = f),
                        void 0 === n
                          ? (n = this.authority)
                          : null === n && (n = f),
                        void 0 === r ? (r = this.path) : null === r && (r = f),
                        void 0 === i ? (i = this.query) : null === i && (i = f),
                        void 0 === o
                          ? (o = this.fragment)
                          : null === o && (o = f),
                        t === this.scheme &&
                        n === this.authority &&
                        r === this.path &&
                        i === this.query &&
                        o === this.fragment
                          ? this
                          : new y(t, n, r, i, o)
                      );
                    }),
                    (e.parse = function (e, t) {
                      void 0 === t && (t = !1);
                      var n = g.exec(e);
                      return n
                        ? new y(
                            n[2] || f,
                            A(n[4] || f),
                            A(n[5] || f),
                            A(n[7] || f),
                            A(n[9] || f),
                            t,
                          )
                        : new y(f, f, f, f, f);
                    }),
                    (e.file = function (e) {
                      var t = f;
                      if (
                        (r && (e = e.replace(/\\/g, d)),
                        e[0] === d && e[1] === d)
                      ) {
                        var n = e.indexOf(d, 2);
                        -1 === n
                          ? ((t = e.substring(2)), (e = d))
                          : ((t = e.substring(2, n)),
                            (e = e.substring(n) || d));
                      }
                      return new y('file', t, e, f, f);
                    }),
                    (e.from = function (e) {
                      var t = new y(
                        e.scheme,
                        e.authority,
                        e.path,
                        e.query,
                        e.fragment,
                      );
                      return h(t, !0), t;
                    }),
                    (e.prototype.toString = function (e) {
                      return void 0 === e && (e = !1), _(this, e);
                    }),
                    (e.prototype.toJSON = function () {
                      return this;
                    }),
                    (e.revive = function (t) {
                      if (t) {
                        if (t instanceof e) return t;
                        var n = new y(t);
                        return (
                          (n._formatted = t.external),
                          (n._fsPath = t._sep === p ? t.fsPath : null),
                          n
                        );
                      }
                      return t;
                    }),
                    e
                  );
                })(),
                p = r ? 1 : void 0,
                y = (function (e) {
                  function t() {
                    var t = (null !== e && e.apply(this, arguments)) || this;
                    return (t._formatted = null), (t._fsPath = null), t;
                  }
                  return (
                    a(t, e),
                    Object.defineProperty(t.prototype, 'fsPath', {
                      get: function () {
                        return (
                          this._fsPath || (this._fsPath = S(this, !1)),
                          this._fsPath
                        );
                      },
                      enumerable: !1,
                      configurable: !0,
                    }),
                    (t.prototype.toString = function (e) {
                      return (
                        void 0 === e && (e = !1),
                        e
                          ? _(this, !0)
                          : (this._formatted || (this._formatted = _(this, !1)),
                            this._formatted)
                      );
                    }),
                    (t.prototype.toJSON = function () {
                      var e = { $mid: 1 };
                      return (
                        this._fsPath &&
                          ((e.fsPath = this._fsPath), (e._sep = p)),
                        this._formatted && (e.external = this._formatted),
                        this.path && (e.path = this.path),
                        this.scheme && (e.scheme = this.scheme),
                        this.authority && (e.authority = this.authority),
                        this.query && (e.query = this.query),
                        this.fragment && (e.fragment = this.fragment),
                        e
                      );
                    }),
                    t
                  );
                })(m),
                b =
                  (((s = {})[58] = '%3A'),
                  (s[47] = '%2F'),
                  (s[63] = '%3F'),
                  (s[35] = '%23'),
                  (s[91] = '%5B'),
                  (s[93] = '%5D'),
                  (s[64] = '%40'),
                  (s[33] = '%21'),
                  (s[36] = '%24'),
                  (s[38] = '%26'),
                  (s[39] = '%27'),
                  (s[40] = '%28'),
                  (s[41] = '%29'),
                  (s[42] = '%2A'),
                  (s[43] = '%2B'),
                  (s[44] = '%2C'),
                  (s[59] = '%3B'),
                  (s[61] = '%3D'),
                  (s[32] = '%20'),
                  s);
              function v(e, t) {
                for (var n = void 0, r = -1, i = 0; i < e.length; i++) {
                  var o = e.charCodeAt(i);
                  if (
                    (o >= 97 && o <= 122) ||
                    (o >= 65 && o <= 90) ||
                    (o >= 48 && o <= 57) ||
                    45 === o ||
                    46 === o ||
                    95 === o ||
                    126 === o ||
                    (t && 47 === o)
                  )
                    -1 !== r &&
                      ((n += encodeURIComponent(e.substring(r, i))), (r = -1)),
                      void 0 !== n && (n += e.charAt(i));
                  else {
                    void 0 === n && (n = e.substr(0, i));
                    var s = b[o];
                    void 0 !== s
                      ? (-1 !== r &&
                          ((n += encodeURIComponent(e.substring(r, i))),
                          (r = -1)),
                        (n += s))
                      : -1 === r && (r = i);
                  }
                }
                return (
                  -1 !== r && (n += encodeURIComponent(e.substring(r))),
                  void 0 !== n ? n : e
                );
              }
              function w(e) {
                for (var t = void 0, n = 0; n < e.length; n++) {
                  var r = e.charCodeAt(n);
                  35 === r || 63 === r
                    ? (void 0 === t && (t = e.substr(0, n)), (t += b[r]))
                    : void 0 !== t && (t += e[n]);
                }
                return void 0 !== t ? t : e;
              }
              function S(e, t) {
                var n;
                return (
                  (n =
                    e.authority && e.path.length > 1 && 'file' === e.scheme
                      ? '//'.concat(e.authority).concat(e.path)
                      : 47 === e.path.charCodeAt(0) &&
                        ((e.path.charCodeAt(1) >= 65 &&
                          e.path.charCodeAt(1) <= 90) ||
                          (e.path.charCodeAt(1) >= 97 &&
                            e.path.charCodeAt(1) <= 122)) &&
                        58 === e.path.charCodeAt(2)
                      ? t
                        ? e.path.substr(1)
                        : e.path[1].toLowerCase() + e.path.substr(2)
                      : e.path),
                  r && (n = n.replace(/\//g, '\\')),
                  n
                );
              }
              function _(e, t) {
                var n = t ? w : v,
                  r = '',
                  i = e.scheme,
                  o = e.authority,
                  s = e.path,
                  a = e.query,
                  l = e.fragment;
                if (
                  (i && ((r += i), (r += ':')),
                  (o || 'file' === i) && ((r += d), (r += d)),
                  o)
                ) {
                  var u = o.indexOf('@');
                  if (-1 !== u) {
                    var c = o.substr(0, u);
                    (o = o.substr(u + 1)),
                      -1 === (u = c.indexOf(':'))
                        ? (r += n(c, !1))
                        : ((r += n(c.substr(0, u), !1)),
                          (r += ':'),
                          (r += n(c.substr(u + 1), !1))),
                      (r += '@');
                  }
                  -1 === (u = (o = o.toLowerCase()).indexOf(':'))
                    ? (r += n(o, !1))
                    : ((r += n(o.substr(0, u), !1)), (r += o.substr(u)));
                }
                if (s) {
                  if (
                    s.length >= 3 &&
                    47 === s.charCodeAt(0) &&
                    58 === s.charCodeAt(2)
                  )
                    (h = s.charCodeAt(1)) >= 65 &&
                      h <= 90 &&
                      (s = '/'
                        .concat(String.fromCharCode(h + 32), ':')
                        .concat(s.substr(3)));
                  else if (s.length >= 2 && 58 === s.charCodeAt(1)) {
                    var h;
                    (h = s.charCodeAt(0)) >= 65 &&
                      h <= 90 &&
                      (s = ''
                        .concat(String.fromCharCode(h + 32), ':')
                        .concat(s.substr(2)));
                  }
                  r += n(s, !0);
                }
                return (
                  a && ((r += '?'), (r += n(a, !1))),
                  l && ((r += '#'), (r += t ? l : v(l, !1))),
                  r
                );
              }
              function C(e) {
                try {
                  return decodeURIComponent(e);
                } catch (t) {
                  return e.length > 3 ? e.substr(0, 3) + C(e.substr(3)) : e;
                }
              }
              var E = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
              function A(e) {
                return e.match(E)
                  ? e.replace(E, function (e) {
                      return C(e);
                    })
                  : e;
              }
              var x,
                N,
                L = n(470),
                O = function (e, t, n) {
                  if (n || 2 === arguments.length)
                    for (var r, i = 0, o = t.length; i < o; i++)
                      (!r && i in t) ||
                        (r || (r = Array.prototype.slice.call(t, 0, i)),
                        (r[i] = t[i]));
                  return e.concat(r || Array.prototype.slice.call(t));
                },
                k = L.posix || L;
              ((N = x || (x = {})).joinPath = function (e) {
                for (var t = [], n = 1; n < arguments.length; n++)
                  t[n - 1] = arguments[n];
                return e.with({ path: k.join.apply(k, O([e.path], t, !1)) });
              }),
                (N.resolvePath = function (e) {
                  for (var t = [], n = 1; n < arguments.length; n++)
                    t[n - 1] = arguments[n];
                  var r = e.path || '/';
                  return e.with({ path: k.resolve.apply(k, O([r], t, !1)) });
                }),
                (N.dirname = function (e) {
                  var t = k.dirname(e.path);
                  return 1 === t.length && 46 === t.charCodeAt(0)
                    ? e
                    : e.with({ path: t });
                }),
                (N.basename = function (e) {
                  return k.basename(e.path);
                }),
                (N.extname = function (e) {
                  return k.extname(e.path);
                });
            },
          },
          t = {};
        function n(r) {
          if (t[r]) return t[r].exports;
          var i = (t[r] = { exports: {} });
          return e[r](i, i.exports, n), i.exports;
        }
        return (
          (n.d = (e, t) => {
            for (var r in t)
              n.o(t, r) &&
                !n.o(e, r) &&
                Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
          }),
          (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
          (n.r = e => {
            'undefined' != typeof Symbol &&
              Symbol.toStringTag &&
              Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
              Object.defineProperty(e, '__esModule', { value: !0 });
          }),
          n(447)
        );
      })();
      var { URI: Ml, Utils: Pl } = Ol;
      function Il(e, t) {
        if ('string' != typeof e) throw new TypeError('Expected a string');
        for (
          var n,
            r = String(e),
            i = '',
            o = !!t && !!t.extended,
            s = !!t && !!t.globstar,
            a = !1,
            l = t && 'string' == typeof t.flags ? t.flags : '',
            u = 0,
            c = r.length;
          u < c;
          u++
        )
          switch ((n = r[u])) {
            case '/':
            case '$':
            case '^':
            case '+':
            case '.':
            case '(':
            case ')':
            case '=':
            case '!':
            case '|':
              i += '\\' + n;
              break;
            case '?':
              if (o) {
                i += '.';
                break;
              }
            case '[':
            case ']':
              if (o) {
                i += n;
                break;
              }
            case '{':
              if (o) {
                (a = !0), (i += '(');
                break;
              }
            case '}':
              if (o) {
                (a = !1), (i += ')');
                break;
              }
            case ',':
              if (a) {
                i += '|';
                break;
              }
              i += '\\' + n;
              break;
            case '*':
              for (var h = r[u - 1], f = 1; '*' === r[u + 1]; ) f++, u++;
              var d = r[u + 1];
              if (s)
                f > 1 &&
                ('/' === h || void 0 === h || '{' === h || ',' === h) &&
                ('/' === d || void 0 === d || ',' === d || '}' === d)
                  ? ('/' === d
                      ? u++
                      : '/' === h &&
                        i.endsWith('\\/') &&
                        (i = i.substr(0, i.length - 2)),
                    (i += '((?:[^/]*(?:/|$))*)'))
                  : (i += '([^/]*)');
              else i += '.*';
              break;
            default:
              i += n;
          }
        return (l && ~l.indexOf('g')) || (i = '^' + i + '$'), new RegExp(i, l);
      }
      var jl,
        Fl = Pa(),
        Dl = (function () {
          function e(e, t) {
            this.globWrappers = [];
            try {
              for (var n = 0, r = e; n < r.length; n++) {
                var i = r[n],
                  o = '!' !== i[0];
                o || (i = i.substring(1)),
                  i.length > 0 &&
                    ('/' === i[0] && (i = i.substring(1)),
                    this.globWrappers.push({
                      regexp: Il('**/' + i, { extended: !0, globstar: !0 }),
                      include: o,
                    }));
              }
              this.uris = t;
            } catch (e) {
              (this.globWrappers.length = 0), (this.uris = []);
            }
          }
          return (
            (e.prototype.matchesPattern = function (e) {
              for (
                var t = !1, n = 0, r = this.globWrappers;
                n < r.length;
                n++
              ) {
                var i = r[n],
                  o = i.regexp,
                  s = i.include;
                o.test(e) && (t = s);
              }
              return t;
            }),
            (e.prototype.getURIs = function () {
              return this.uris;
            }),
            e
          );
        })(),
        Vl = (function () {
          function e(e, t, n) {
            (this.service = e),
              (this.uri = t),
              (this.dependencies = new Set()),
              (this.anchors = void 0),
              n &&
                (this.unresolvedSchema = this.service.promise.resolve(
                  new ql(n),
                ));
          }
          return (
            (e.prototype.getUnresolvedSchema = function () {
              return (
                this.unresolvedSchema ||
                  (this.unresolvedSchema = this.service.loadSchema(this.uri)),
                this.unresolvedSchema
              );
            }),
            (e.prototype.getResolvedSchema = function () {
              var e = this;
              return (
                this.resolvedSchema ||
                  (this.resolvedSchema = this.getUnresolvedSchema().then(
                    function (t) {
                      return e.service.resolveSchemaContent(t, e);
                    },
                  )),
                this.resolvedSchema
              );
            }),
            (e.prototype.clearSchema = function () {
              var e = !!this.unresolvedSchema;
              return (
                (this.resolvedSchema = void 0),
                (this.unresolvedSchema = void 0),
                this.dependencies.clear(),
                (this.anchors = void 0),
                e
              );
            }),
            e
          );
        })(),
        ql = (function () {
          return function (e, t) {
            void 0 === t && (t = []), (this.schema = e), (this.errors = t);
          };
        })(),
        Ul = (function () {
          function e(e, t) {
            void 0 === t && (t = []), (this.schema = e), (this.errors = t);
          }
          return (
            (e.prototype.getSection = function (e) {
              var t = this.getSectionRecursive(e, this.schema);
              if (t) return Ga(t);
            }),
            (e.prototype.getSectionRecursive = function (e, t) {
              if (!t || 'boolean' == typeof t || 0 === e.length) return t;
              var n = e.shift();
              if (t.properties && (t.properties[n], 1))
                return this.getSectionRecursive(e, t.properties[n]);
              if (t.patternProperties)
                for (
                  var r = 0, i = Object.keys(t.patternProperties);
                  r < i.length;
                  r++
                ) {
                  var o = i[r],
                    s = vs(o);
                  if (null == s ? void 0 : s.test(n))
                    return this.getSectionRecursive(e, t.patternProperties[o]);
                }
              else {
                if ('object' == typeof t.additionalProperties)
                  return this.getSectionRecursive(e, t.additionalProperties);
                if (n.match('[0-9]+'))
                  if (Array.isArray(t.items)) {
                    var a = parseInt(n, 10);
                    if (!isNaN(a) && t.items[a])
                      return this.getSectionRecursive(e, t.items[a]);
                  } else if (t.items)
                    return this.getSectionRecursive(e, t.items);
              }
            }),
            e
          );
        })(),
        Bl = (function () {
          function e(e, t, n) {
            (this.contextService = t),
              (this.requestService = e),
              (this.promiseConstructor = n || Promise),
              (this.callOnDispose = []),
              (this.contributionSchemas = {}),
              (this.contributionAssociations = []),
              (this.schemasById = {}),
              (this.filePatternAssociations = []),
              (this.registeredSchemasIds = {});
          }
          return (
            (e.prototype.getRegisteredSchemaIds = function (e) {
              return Object.keys(this.registeredSchemasIds).filter(function (
                t,
              ) {
                var n = Ml.parse(t).scheme;
                return 'schemaservice' !== n && (!e || e(n));
              });
            }),
            Object.defineProperty(e.prototype, 'promise', {
              get: function () {
                return this.promiseConstructor;
              },
              enumerable: !1,
              configurable: !0,
            }),
            (e.prototype.dispose = function () {
              for (; this.callOnDispose.length > 0; )
                this.callOnDispose.pop()();
            }),
            (e.prototype.onResourceChange = function (e) {
              var t = this;
              this.cachedSchemaForResource = void 0;
              for (
                var n = !1,
                  r = [(e = $l(e))],
                  i = Object.keys(this.schemasById).map(function (e) {
                    return t.schemasById[e];
                  });
                r.length;

              )
                for (var o = r.pop(), s = 0; s < i.length; s++) {
                  var a = i[s];
                  a &&
                    (a.uri === o || a.dependencies.has(o)) &&
                    (a.uri !== o && r.push(a.uri),
                    a.clearSchema() && (n = !0),
                    (i[s] = void 0));
                }
              return n;
            }),
            (e.prototype.setSchemaContributions = function (e) {
              if (e.schemas) {
                var t = e.schemas;
                for (var n in t) {
                  var r = $l(n);
                  this.contributionSchemas[r] = this.addSchemaHandle(r, t[n]);
                }
              }
              if (Array.isArray(e.schemaAssociations))
                for (var i = 0, o = e.schemaAssociations; i < o.length; i++) {
                  var s = o[i],
                    a = s.uris.map($l),
                    l = this.addFilePatternAssociation(s.pattern, a);
                  this.contributionAssociations.push(l);
                }
            }),
            (e.prototype.addSchemaHandle = function (e, t) {
              var n = new Vl(this, e, t);
              return (this.schemasById[e] = n), n;
            }),
            (e.prototype.getOrAddSchemaHandle = function (e, t) {
              return this.schemasById[e] || this.addSchemaHandle(e, t);
            }),
            (e.prototype.addFilePatternAssociation = function (e, t) {
              var n = new Dl(e, t);
              return this.filePatternAssociations.push(n), n;
            }),
            (e.prototype.registerExternalSchema = function (e, t, n) {
              var r = $l(e);
              return (
                (this.registeredSchemasIds[r] = !0),
                (this.cachedSchemaForResource = void 0),
                t && this.addFilePatternAssociation(t, [r]),
                n ? this.addSchemaHandle(r, n) : this.getOrAddSchemaHandle(r)
              );
            }),
            (e.prototype.clearExternalSchemas = function () {
              for (var e in ((this.schemasById = {}),
              (this.filePatternAssociations = []),
              (this.registeredSchemasIds = {}),
              (this.cachedSchemaForResource = void 0),
              this.contributionSchemas))
                (this.schemasById[e] = this.contributionSchemas[e]),
                  (this.registeredSchemasIds[e] = !0);
              for (
                var t = 0, n = this.contributionAssociations;
                t < n.length;
                t++
              ) {
                var r = n[t];
                this.filePatternAssociations.push(r);
              }
            }),
            (e.prototype.getResolvedSchema = function (e) {
              var t = $l(e),
                n = this.schemasById[t];
              return n ? n.getResolvedSchema() : this.promise.resolve(void 0);
            }),
            (e.prototype.loadSchema = function (e) {
              if (!this.requestService) {
                var t = Fl(
                  'json.schema.norequestservice',
                  "Unable to load schema from '{0}'. No schema request service available",
                  Wl(e),
                );
                return this.promise.resolve(new ql({}, [t]));
              }
              return this.requestService(e).then(
                function (t) {
                  if (!t) {
                    var n = Fl(
                      'json.schema.nocontent',
                      "Unable to load schema from '{0}': No content.",
                      Wl(e),
                    );
                    return new ql({}, [n]);
                  }
                  var r,
                    i = [];
                  r = cs(t, i);
                  var o = i.length
                    ? [
                        Fl(
                          'json.schema.invalidFormat',
                          "Unable to parse content from '{0}': Parse error at offset {1}.",
                          Wl(e),
                          i[0].offset,
                        ),
                      ]
                    : [];
                  return new ql(r, o);
                },
                function (t) {
                  var n = t.toString(),
                    r = t.toString().split('Error: ');
                  return (
                    r.length > 1 && (n = r[1]),
                    bs(n, '.') && (n = n.substr(0, n.length - 1)),
                    new ql({}, [
                      Fl(
                        'json.schema.nocontent',
                        "Unable to load schema from '{0}': {1}.",
                        Wl(e),
                        n,
                      ),
                    ])
                  );
                },
              );
            }),
            (e.prototype.resolveSchemaContent = function (e, t) {
              var n = this,
                r = e.errors.slice(0),
                i = e.schema;
              if (i.$schema) {
                var o = $l(i.$schema);
                if ('http://json-schema.org/draft-03/schema' === o)
                  return this.promise.resolve(
                    new Ul({}, [
                      Fl(
                        'json.schema.draft03.notsupported',
                        'Draft-03 schemas are not supported.',
                      ),
                    ]),
                  );
                'https://json-schema.org/draft/2019-09/schema' === o
                  ? r.push(
                      Fl(
                        'json.schema.draft201909.notsupported',
                        'Draft 2019-09 schemas are not yet fully supported.',
                      ),
                    )
                  : 'https://json-schema.org/draft/2020-12/schema' === o &&
                    r.push(
                      Fl(
                        'json.schema.draft202012.notsupported',
                        'Draft 2020-12 schemas are not yet fully supported.',
                      ),
                    );
              }
              var s = this.contextService,
                a = function (e, t, n, i) {
                  var o, s, a, l;
                  void 0 === i || 0 === i.length
                    ? (o = t)
                    : '/' === i.charAt(0)
                    ? (o = (function (e, t) {
                        t = decodeURIComponent(t);
                        var n = e;
                        return (
                          '/' === t[0] && (t = t.substring(1)),
                          t.split('/').some(function (e) {
                            return (
                              (e = e.replace(/~1/g, '/').replace(/~0/g, '~')),
                              !(n = n[e])
                            );
                          }),
                          n
                        );
                      })(t, i))
                    : ((s = t),
                      (l = i),
                      (a = n).anchors || (a.anchors = c(s)),
                      (o = a.anchors.get(l))),
                    o
                      ? (function (e, t) {
                          for (var n in t)
                            t.hasOwnProperty(n) &&
                              !e.hasOwnProperty(n) &&
                              'id' !== n &&
                              '$id' !== n &&
                              (e[n] = t[n]);
                        })(e, o)
                      : r.push(
                          Fl(
                            'json.schema.invalidid',
                            "$ref '{0}' in '{1}' can not be resolved.",
                            i,
                            n.uri,
                          ),
                        );
                },
                l = function (e, t, i, o) {
                  s &&
                    !/^[A-Za-z][A-Za-z0-9+\-.+]*:\/\/.*/.test(t) &&
                    (t = s.resolveRelativePath(t, o.uri)),
                    (t = $l(t));
                  var l = n.getOrAddSchemaHandle(t);
                  return l.getUnresolvedSchema().then(function (n) {
                    if ((o.dependencies.add(t), n.errors.length)) {
                      var s = i ? t + '#' + i : t;
                      r.push(
                        Fl(
                          'json.schema.problemloadingref',
                          "Problems loading reference '{0}': {1}",
                          s,
                          n.errors[0],
                        ),
                      );
                    }
                    return a(e, n.schema, l, i), u(e, n.schema, l);
                  });
                },
                u = function (e, t, r) {
                  var i = [];
                  return (
                    n.traverseNodes(e, function (e) {
                      for (var n = new Set(); e.$ref; ) {
                        var o = e.$ref,
                          s = o.split('#', 2);
                        if ((delete e.$ref, s[0].length > 0))
                          return void i.push(l(e, s[0], s[1], r));
                        if (!n.has(o)) {
                          var u = s[1];
                          a(e, t, r, u), n.add(o);
                        }
                      }
                    }),
                    n.promise.all(i)
                  );
                },
                c = function (e) {
                  var t = new Map();
                  return (
                    n.traverseNodes(e, function (e) {
                      var n = e.$id || e.id;
                      if ('string' == typeof n && '#' === n.charAt(0)) {
                        var i = n.substring(1);
                        t.has(i)
                          ? r.push(
                              Fl(
                                'json.schema.duplicateid',
                                "Duplicate id declaration: '{0}'",
                                n,
                              ),
                            )
                          : t.set(i, e);
                      }
                    }),
                    t
                  );
                };
              return u(i, i, t).then(function (e) {
                return new Ul(i, r);
              });
            }),
            (e.prototype.traverseNodes = function (e, t) {
              if (!e || 'object' != typeof e) return Promise.resolve(null);
              for (
                var n = new Set(),
                  r = function () {
                    for (var e = [], t = 0; t < arguments.length; t++)
                      e[t] = arguments[t];
                    for (var n = 0, r = e; n < r.length; n++) {
                      var i = r[n];
                      'object' == typeof i && s.push(i);
                    }
                  },
                  i = function () {
                    for (var e = [], t = 0; t < arguments.length; t++)
                      e[t] = arguments[t];
                    for (var n = 0, r = e; n < r.length; n++) {
                      var i = r[n];
                      if ('object' == typeof i)
                        for (var o in i) {
                          var a = i[o];
                          'object' == typeof a && s.push(a);
                        }
                    }
                  },
                  o = function () {
                    for (var e = [], t = 0; t < arguments.length; t++)
                      e[t] = arguments[t];
                    for (var n = 0, r = e; n < r.length; n++) {
                      var i = r[n];
                      if (Array.isArray(i))
                        for (var o = 0, a = i; o < a.length; o++) {
                          var l = a[o];
                          'object' == typeof l && s.push(l);
                        }
                    }
                  },
                  s = [e],
                  a = s.pop();
                a;

              )
                n.has(a) ||
                  (n.add(a),
                  t(a),
                  r(
                    a.items,
                    a.additionalItems,
                    a.additionalProperties,
                    a.not,
                    a.contains,
                    a.propertyNames,
                    a.if,
                    a.then,
                    a.else,
                  ),
                  i(
                    a.definitions,
                    a.properties,
                    a.patternProperties,
                    a.dependencies,
                  ),
                  o(a.anyOf, a.allOf, a.oneOf, a.items)),
                  (a = s.pop());
            }),
            (e.prototype.getSchemaFromProperty = function (e, t) {
              var n, r;
              if (
                'object' ===
                (null === (n = t.root) || void 0 === n ? void 0 : n.type)
              )
                for (var i = 0, o = t.root.properties; i < o.length; i++) {
                  var s = o[i];
                  if (
                    '$schema' === s.keyNode.value &&
                    'string' ===
                      (null === (r = s.valueNode) || void 0 === r
                        ? void 0
                        : r.type)
                  ) {
                    var a = s.valueNode.value;
                    return (
                      this.contextService &&
                        !/^\w[\w\d+.-]*:/.test(a) &&
                        (a = this.contextService.resolveRelativePath(a, e)),
                      a
                    );
                  }
                }
            }),
            (e.prototype.getAssociatedSchemas = function (e) {
              for (
                var t = Object.create(null),
                  n = [],
                  r = (function (e) {
                    try {
                      return Ml.parse(e)
                        .with({ fragment: null, query: null })
                        .toString(!0);
                    } catch (t) {
                      return e;
                    }
                  })(e),
                  i = 0,
                  o = this.filePatternAssociations;
                i < o.length;
                i++
              ) {
                var s = o[i];
                if (s.matchesPattern(r))
                  for (var a = 0, l = s.getURIs(); a < l.length; a++) {
                    var u = l[a];
                    t[u] || (n.push(u), (t[u] = !0));
                  }
              }
              return n;
            }),
            (e.prototype.getSchemaURIsForResource = function (e, t) {
              var n = t && this.getSchemaFromProperty(e, t);
              return n ? [n] : this.getAssociatedSchemas(e);
            }),
            (e.prototype.getSchemaForResource = function (e, t) {
              if (t) {
                var n = this.getSchemaFromProperty(e, t);
                if (n) {
                  var r = $l(n);
                  return this.getOrAddSchemaHandle(r).getResolvedSchema();
                }
              }
              if (
                this.cachedSchemaForResource &&
                this.cachedSchemaForResource.resource === e
              )
                return this.cachedSchemaForResource.resolvedSchema;
              var i = this.getAssociatedSchemas(e),
                o =
                  i.length > 0
                    ? this.createCombinedSchema(e, i).getResolvedSchema()
                    : this.promise.resolve(void 0);
              return (
                (this.cachedSchemaForResource = {
                  resource: e,
                  resolvedSchema: o,
                }),
                o
              );
            }),
            (e.prototype.createCombinedSchema = function (e, t) {
              if (1 === t.length) return this.getOrAddSchemaHandle(t[0]);
              var n = 'schemaservice://combinedSchema/' + encodeURIComponent(e),
                r = {
                  allOf: t.map(function (e) {
                    return { $ref: e };
                  }),
                };
              return this.addSchemaHandle(n, r);
            }),
            (e.prototype.getMatchingSchemas = function (e, t, n) {
              if (n) {
                var r =
                  n.id || 'schemaservice://untitled/matchingSchemas/' + Kl++;
                return this.addSchemaHandle(r, n)
                  .getResolvedSchema()
                  .then(function (e) {
                    return t.getMatchingSchemas(e.schema).filter(function (e) {
                      return !e.inverted;
                    });
                  });
              }
              return this.getSchemaForResource(e.uri, t).then(function (e) {
                return e
                  ? t.getMatchingSchemas(e.schema).filter(function (e) {
                      return !e.inverted;
                    })
                  : [];
              });
            }),
            e
          );
        })(),
        Kl = 0;
      function $l(e) {
        try {
          return Ml.parse(e).toString(!0);
        } catch (t) {
          return e;
        }
      }
      function Wl(e) {
        try {
          var t = Ml.parse(e);
          if ('file' === t.scheme) return t.fsPath;
        } catch (e) {}
        return e;
      }
      function zl(e, t) {
        var n = [],
          r = [],
          i = [],
          o = -1,
          s = us(e.getText(), !1),
          a = s.scan();
        function l(e) {
          n.push(e), r.push(i.length);
        }
        for (; 17 !== a; ) {
          switch (a) {
            case 1:
            case 3:
              var u = {
                startLine: (f = e.positionAt(s.getTokenOffset()).line),
                endLine: f,
                kind: 1 === a ? 'object' : 'array',
              };
              i.push(u);
              break;
            case 2:
            case 4:
              var c = 2 === a ? 'object' : 'array';
              if (i.length > 0 && i[i.length - 1].kind === c) {
                u = i.pop();
                var h = e.positionAt(s.getTokenOffset()).line;
                u &&
                  h > u.startLine + 1 &&
                  o !== u.startLine &&
                  ((u.endLine = h - 1), l(u), (o = u.startLine));
              }
              break;
            case 13:
              var f = e.positionAt(s.getTokenOffset()).line,
                d = e.positionAt(s.getTokenOffset() + s.getTokenLength()).line;
              1 === s.getTokenError() && f + 1 < e.lineCount
                ? s.setPosition(e.offsetAt(bo.create(f + 1, 0)))
                : f < d &&
                  (l({ startLine: f, endLine: d, kind: To.Comment }), (o = f));
              break;
            case 12:
              var g = e
                .getText()
                .substr(s.getTokenOffset(), s.getTokenLength())
                .match(/^\/\/\s*#(region\b)|(endregion\b)/);
              if (g) {
                h = e.positionAt(s.getTokenOffset()).line;
                if (g[1]) {
                  u = { startLine: h, endLine: h, kind: To.Region };
                  i.push(u);
                } else {
                  for (
                    var m = i.length - 1;
                    m >= 0 && i[m].kind !== To.Region;

                  )
                    m--;
                  if (m >= 0) {
                    u = i[m];
                    (i.length = m),
                      h > u.startLine &&
                        o !== u.startLine &&
                        ((u.endLine = h), l(u), (o = u.startLine));
                  }
                }
              }
          }
          a = s.scan();
        }
        var p = t && t.rangeLimit;
        if ('number' != typeof p || n.length <= p) return n;
        t && t.onRangeLimitExceeded && t.onRangeLimitExceeded(e.uri);
        for (var y = [], b = 0, v = r; b < v.length; b++) {
          (E = v[b]) < 30 && (y[E] = (y[E] || 0) + 1);
        }
        var w = 0,
          S = 0;
        for (m = 0; m < y.length; m++) {
          var _ = y[m];
          if (_) {
            if (_ + w > p) {
              S = m;
              break;
            }
            w += _;
          }
        }
        var C = [];
        for (m = 0; m < n.length; m++) {
          var E;
          'number' == typeof (E = r[m]) &&
            (E < S || (E === S && w++ < p)) &&
            C.push(n[m]);
        }
        return C;
      }
      function Hl(e, t, n) {
        function r(t, n) {
          return wo.create(e.positionAt(t), e.positionAt(n));
        }
        var i = us(e.getText(), !0);
        function o(e, t) {
          return (
            i.setPosition(e),
            i.scan() === t ? i.getTokenOffset() + i.getTokenLength() : -1
          );
        }
        return t.map(function (t) {
          for (
            var i = e.offsetAt(t), s = n.getNodeFromOffset(i, !0), a = [];
            s;

          ) {
            switch (s.type) {
              case 'string':
              case 'object':
              case 'array':
                var l = s.offset + 1,
                  u = s.offset + s.length - 1;
                l < u && i >= l && i <= u && a.push(r(l, u)),
                  a.push(r(s.offset, s.offset + s.length));
                break;
              case 'number':
              case 'boolean':
              case 'null':
              case 'property':
                a.push(r(s.offset, s.offset + s.length));
            }
            if (
              'property' === s.type ||
              (s.parent && 'array' === s.parent.type)
            ) {
              var c = o(s.offset + s.length, 5);
              -1 !== c && a.push(r(s.offset, c));
            }
            s = s.parent;
          }
          for (var h = void 0, f = a.length - 1; f >= 0; f--)
            h = ga.create(a[f], h);
          return h || (h = ga.create(wo.create(t, t))), h;
        });
      }
      function Gl(e, t) {
        var n = [];
        return (
          t.visit(function (r) {
            var i;
            if (
              'property' === r.type &&
              '$ref' === r.keyNode.value &&
              'string' ===
                (null === (i = r.valueNode) || void 0 === i ? void 0 : i.type)
            ) {
              var o = r.valueNode.value,
                s = (function (e, t) {
                  var n = (function (e) {
                    if ('#' === e) return [];
                    if ('#' !== e[0] || '/' !== e[1]) return null;
                    return e.substring(2).split(/\//).map(Ql);
                  })(t);
                  if (!n) return null;
                  return Xl(n, e.root);
                })(t, o);
              if (s) {
                var a = e.positionAt(s.offset);
                n.push({
                  target: ''
                    .concat(e.uri, '#')
                    .concat(a.line + 1, ',')
                    .concat(a.character + 1),
                  range: Jl(e, r.valueNode),
                });
              }
            }
            return !0;
          }),
          Promise.resolve(n)
        );
      }
      function Jl(e, t) {
        return wo.create(
          e.positionAt(t.offset + 1),
          e.positionAt(t.offset + t.length - 1),
        );
      }
      function Xl(e, t) {
        if (!t) return null;
        if (0 === e.length) return t;
        var n = e.shift();
        if (t && 'object' === t.type) {
          var r = t.properties.find(function (e) {
            return e.keyNode.value === n;
          });
          return r ? Xl(e, r.valueNode) : null;
        }
        if (t && 'array' === t.type && n.match(/^(0|[1-9][0-9]*)$/)) {
          var i = Number.parseInt(n),
            o = t.items[i];
          return o ? Xl(e, o) : null;
        }
        return null;
      }
      function Ql(e) {
        return e.replace(/~1/g, '/').replace(/~0/g, '~');
      }
      function Yl(e) {
        var t = e.promiseConstructor || Promise,
          n = new Bl(e.schemaRequestService, e.workspaceContext, t);
        n.setSchemaContributions(Rl);
        var r = new sl(n, e.contributions, t, e.clientCapabilities),
          i = new al(n, e.contributions, t),
          o = new _l(n),
          s = new cl(n, t);
        return {
          configure: function (e) {
            n.clearExternalSchemas(),
              e.schemas &&
                e.schemas.forEach(function (e) {
                  n.registerExternalSchema(e.uri, e.fileMatch, e.schema);
                }),
              s.configure(e);
          },
          resetSchema: function (e) {
            return n.onResourceChange(e);
          },
          doValidation: s.doValidation.bind(s),
          getLanguageStatus: s.getLanguageStatus.bind(s),
          parseJSONDocument: function (e) {
            return rl(e, { collectComments: !0 });
          },
          newJSONDocument: function (e, t) {
            return (function (e, t) {
              return void 0 === t && (t = []), new tl(e, t, []);
            })(e, t);
          },
          getMatchingSchemas: n.getMatchingSchemas.bind(n),
          doResolve: r.doResolve.bind(r),
          doComplete: r.doComplete.bind(r),
          findDocumentSymbols: o.findDocumentSymbols.bind(o),
          findDocumentSymbols2: o.findDocumentSymbols2.bind(o),
          findDocumentColors: o.findDocumentColors.bind(o),
          getColorPresentations: o.getColorPresentations.bind(o),
          doHover: i.doHover.bind(i),
          getFoldingRanges: zl,
          getSelectionRanges: Hl,
          findDefinition: function () {
            return Promise.resolve([]);
          },
          findLinks: Gl,
          format: function (e, t, n) {
            var r = void 0;
            if (t) {
              var i = e.offsetAt(t.start);
              r = { offset: i, length: e.offsetAt(t.end) - i };
            }
            var o = {
              tabSize: n ? n.tabSize : 4,
              insertSpaces: !0 === (null == n ? void 0 : n.insertSpaces),
              insertFinalNewline:
                !0 === (null == n ? void 0 : n.insertFinalNewline),
              eol: '\n',
            };
            return (function (e, t, n) {
              return co(e, t, n);
            })(e.getText(), r, o).map(function (t) {
              return Ho.replace(
                wo.create(
                  e.positionAt(t.offset),
                  e.positionAt(t.offset + t.length),
                ),
                t.content,
              );
            });
          },
        };
      }
      'undefined' != typeof fetch &&
        (jl = function (e) {
          return fetch(e).then(e => e.text());
        });
      var Zl = class {
          constructor(e, t) {
            (this._ctx = e),
              (this._languageSettings = t.languageSettings),
              (this._languageId = t.languageId),
              (this._languageService = Yl({
                workspaceContext: {
                  resolveRelativePath: (e, t) =>
                    (function (e, t) {
                      if (
                        (function (e) {
                          return e.charCodeAt(0) === eu;
                        })(t)
                      ) {
                        const n = Ml.parse(e),
                          r = t.split('/');
                        return n.with({ path: nu(r) }).toString();
                      }
                      return (function (e, ...t) {
                        const n = Ml.parse(e),
                          r = n.path.split('/');
                        for (let e of t) r.push(...e.split('/'));
                        return n.with({ path: nu(r) }).toString();
                      })(e, t);
                    })(t.substr(0, t.lastIndexOf('/') + 1), e),
                },
                schemaRequestService: t.enableSchemaRequest ? jl : void 0,
                clientCapabilities: Na.LATEST,
              })),
              this._languageService.configure(this._languageSettings);
          }
          async doValidation(e) {
            let t = this._getTextDocument(e);
            if (t) {
              let e = this._languageService.parseJSONDocument(t);
              return this._languageService.doValidation(
                t,
                e,
                this._languageSettings,
              );
            }
            return Promise.resolve([]);
          }
          async doComplete(e, t) {
            let n = this._getTextDocument(e);
            if (!n) return null;
            let r = this._languageService.parseJSONDocument(n);
            return this._languageService.doComplete(n, t, r);
          }
          async doResolve(e) {
            return this._languageService.doResolve(e);
          }
          async doHover(e, t) {
            let n = this._getTextDocument(e);
            if (!n) return null;
            let r = this._languageService.parseJSONDocument(n);
            return this._languageService.doHover(n, t, r);
          }
          async format(e, t, n) {
            let r = this._getTextDocument(e);
            if (!r) return [];
            let i = this._languageService.format(r, t, n);
            return Promise.resolve(i);
          }
          async resetSchema(e) {
            return Promise.resolve(this._languageService.resetSchema(e));
          }
          async findDocumentSymbols(e) {
            let t = this._getTextDocument(e);
            if (!t) return [];
            let n = this._languageService.parseJSONDocument(t),
              r = this._languageService.findDocumentSymbols2(t, n);
            return Promise.resolve(r);
          }
          async findDocumentColors(e) {
            let t = this._getTextDocument(e);
            if (!t) return [];
            let n = this._languageService.parseJSONDocument(t),
              r = this._languageService.findDocumentColors(t, n);
            return Promise.resolve(r);
          }
          async getColorPresentations(e, t, n) {
            let r = this._getTextDocument(e);
            if (!r) return [];
            let i = this._languageService.parseJSONDocument(r),
              o = this._languageService.getColorPresentations(r, i, t, n);
            return Promise.resolve(o);
          }
          async getFoldingRanges(e, t) {
            let n = this._getTextDocument(e);
            if (!n) return [];
            let r = this._languageService.getFoldingRanges(n, t);
            return Promise.resolve(r);
          }
          async getSelectionRanges(e, t) {
            let n = this._getTextDocument(e);
            if (!n) return [];
            let r = this._languageService.parseJSONDocument(n),
              i = this._languageService.getSelectionRanges(n, t, r);
            return Promise.resolve(i);
          }
          async parseJSONDocument(e) {
            let t = this._getTextDocument(e);
            if (!t) return null;
            let n = this._languageService.parseJSONDocument(t);
            return Promise.resolve(n);
          }
          async getMatchingSchemas(e) {
            let t = this._getTextDocument(e);
            if (!t) return [];
            let n = this._languageService.parseJSONDocument(t);
            return Promise.resolve(
              this._languageService.getMatchingSchemas(t, n),
            );
          }
          _getTextDocument(e) {
            let t = this._ctx.getMirrorModels();
            for (let n of t)
              if (n.uri.toString() === e)
                return Ca.create(e, this._languageId, n.version, n.getValue());
            return null;
          }
        },
        eu = '/'.charCodeAt(0),
        tu = '.'.charCodeAt(0);
      function nu(e) {
        const t = [];
        for (const n of e)
          0 === n.length ||
            (1 === n.length && n.charCodeAt(0) === tu) ||
            (2 === n.length && n.charCodeAt(0) === tu && n.charCodeAt(1) === tu
              ? t.pop()
              : t.push(n));
        e.length > 1 && 0 === e[e.length - 1].length && t.push('');
        let n = t.join('/');
        return 0 === e[0].length && (n = '/' + n), n;
      }
      self.onmessage = () => {
        no((e, t) => new Zl(e, t));
      };
    })();
})();
