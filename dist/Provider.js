"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = exports.createProvider = exports.defaultContext = exports.createCustomContext = void 0;

var _react = require("react");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// -------------------------------------------------------
// context
// -------------------------------------------------------
var warningObject = {
  get state() {
    throw new Error('Please use <Provider useValue={...}>');
  },

  get dispatch() {
    throw new Error('Please use <Provider useValue={...}>');
  },

  get subscribe() {
    throw new Error('Please use <Provider useValue={...}>');
  }

};

var calculateChangedBits = function calculateChangedBits(a, b) {
  return a.dispatch !== b.dispatch || a.subscribe !== b.subscribe ? 1 : 0;
};

var createCustomContext = function createCustomContext() {
  var w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : warningObject;
  var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : calculateChangedBits;
  return (0, _react.createContext)(w, c);
};

exports.createCustomContext = createCustomContext;
var defaultContext = createCustomContext(); // -------------------------------------------------------
// provider
// -------------------------------------------------------

exports.defaultContext = defaultContext;

var createProvider = function createProvider(customContext, customUseValue) {
  return function (_ref) {
    var useValue = _ref.useValue,
        children = _ref.children;

    if (customUseValue) {
      useValue = customUseValue;
    } else {
      // Although this looks like violating the hooks rule,
      // it is ok because it won't change once created.
      var useValueRef = (0, _react.useRef)(useValue);

      if (useValueRef.current !== useValue) {
        throw new Error('useValue must be statically defined');
      }
    }

    var _useValue = useValue(),
        _useValue2 = _slicedToArray(_useValue, 2),
        state = _useValue2[0],
        dispatch = _useValue2[1];

    var listeners = (0, _react.useRef)([]); // we call listeners in render intentionally.
    // listeners are not technically pure, but
    // otherwise we can't get benefits from concurrent mode.
    // we make sure to work with double or more invocation of listeners.

    listeners.current.forEach(function (listener) {
      return listener(state);
    });
    var subscribe = (0, _react.useCallback)(function (listener) {
      listeners.current.push(listener);

      var unsubscribe = function unsubscribe() {
        var index = listeners.current.indexOf(listener);
        listeners.current.splice(index, 1);
      };

      return unsubscribe;
    }, []);
    return (0, _react.createElement)(customContext.Provider, {
      value: {
        state: state,
        dispatch: dispatch,
        subscribe: subscribe
      }
    }, children);
  };
};

exports.createProvider = createProvider;
var Provider = createProvider(defaultContext);
exports.Provider = Provider;