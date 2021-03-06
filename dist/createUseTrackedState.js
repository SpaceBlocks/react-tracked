"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUseTracked = exports.createUseTrackedState = void 0;

var _react = require("react");

var _utils = require("./utils");

var _createProvider = require("./createProvider");

var _deepProxy = require("./deepProxy");

var _createUseUpdate = require("./createUseUpdate");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MODE_ALWAYS_ASSUME_CHANGED_IF_UNAFFECTED = 0;
var MODE_ALWAYS_ASSUME_UNCHANGED_IF_UNAFFECTED = _deepProxy.MODE_ASSUME_UNCHANGED_IF_UNAFFECTED | _deepProxy.MODE_ASSUME_UNCHANGED_IF_UNAFFECTED_IN_DEEP;
var MODE_MUTABLE_ROOT_STATE = _deepProxy.MODE_IGNORE_REF_EQUALITY; // only for root

var MODE_DEFAULT = _deepProxy.MODE_ASSUME_UNCHANGED_IF_UNAFFECTED; // only for root

var STATE_PROPERTY = 's';
var AFFECTED_PROPERTY = 'a';
var CACHE_PROPERTY = 'c';
var DEEP_PROXY_MODE_PROPERTY = 'd';

var createUseTrackedState = function createUseTrackedState(context) {
  var useTrackedState = function useTrackedState() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var _useContext = (0, _react.useContext)(context),
        state = _useContext[_createProvider.STATE_CONTEXT_PROPERTY],
        version = _useContext[_createProvider.VERSION_CONTEXT_PROPERTY],
        subscribe = _useContext[_createProvider.SUBSCRIBE_CONTEXT_PROPERTY];

    var affected = new WeakMap();
    var lastTracked = (0, _react.useRef)();
    (0, _utils.useIsomorphicLayoutEffect)(function () {
      var _lastTracked$current;

      lastTracked.current = (_lastTracked$current = {}, _defineProperty(_lastTracked$current, STATE_PROPERTY, state), _defineProperty(_lastTracked$current, AFFECTED_PROPERTY, affected), _defineProperty(_lastTracked$current, CACHE_PROPERTY, new WeakMap()), _defineProperty(_lastTracked$current, DEEP_PROXY_MODE_PROPERTY, opts.unstable_forceUpdateForStateChange ? MODE_ALWAYS_ASSUME_CHANGED_IF_UNAFFECTED : opts.unstable_ignoreIntermediateObjectUsage ? MODE_ALWAYS_ASSUME_UNCHANGED_IF_UNAFFECTED : opts.unstable_ignoreStateEquality ? MODE_MUTABLE_ROOT_STATE :
      /* default */
      MODE_DEFAULT), _lastTracked$current);
    });

    var _useReducer = (0, _react.useReducer)(function (c, v) {
      if (version < v) {
        return c + 1; // schedule update
      }

      try {
        var lastTrackedCurrent = lastTracked.current;

        if (lastTrackedCurrent[STATE_PROPERTY] === state || !(0, _deepProxy.isDeepChanged)(lastTrackedCurrent[STATE_PROPERTY], state, lastTrackedCurrent[AFFECTED_PROPERTY], lastTrackedCurrent[CACHE_PROPERTY], lastTrackedCurrent[DEEP_PROXY_MODE_PROPERTY])) {
          // not changed
          return c; // bail out
        }
      } catch (e) {// ignored (thrown promise or some other reason)
      }

      return c + 1;
    }, 0),
        _useReducer2 = _slicedToArray(_useReducer, 2),
        checkUpdate = _useReducer2[1];

    (0, _utils.useIsomorphicLayoutEffect)(function () {
      var callback = function callback(nextVersion, nextState) {
        try {
          var lastTrackedCurrent = lastTracked.current;

          if (nextState && (lastTrackedCurrent[STATE_PROPERTY] === nextState || !(0, _deepProxy.isDeepChanged)(lastTrackedCurrent[STATE_PROPERTY], nextState, lastTrackedCurrent[AFFECTED_PROPERTY], lastTrackedCurrent[CACHE_PROPERTY], lastTrackedCurrent[DEEP_PROXY_MODE_PROPERTY]))) {
            // not changed
            return;
          }
        } catch (e) {// ignored (thrown promise or some other reason)
        }

        checkUpdate(nextVersion);
      };

      var unsubscribe = subscribe(callback);
      return unsubscribe;
    }, [subscribe]);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      (0, _utils.useAffectedDebugValue)(state, affected);
    }

    var proxyCache = (0, _react.useRef)(new WeakMap()); // per-hook proxyCache

    return (0, _deepProxy.createDeepProxy)(state, affected, proxyCache.current);
  };

  return useTrackedState;
};

exports.createUseTrackedState = createUseTrackedState;

var createUseTracked = function createUseTracked(context) {
  var useTrackedState = createUseTrackedState(context);
  var useUpdate = (0, _createUseUpdate.createUseUpdate)(context);

  var useTracked = function useTracked(opts) {
    var state = useTrackedState(opts);
    var update = useUpdate();
    return (0, _react.useMemo)(function () {
      return [state, update];
    }, [state, update]);
  };

  return useTracked;
};

exports.createUseTracked = createUseTracked;