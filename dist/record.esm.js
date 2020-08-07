var Util = {};

Util.extend = function extend() {
  var target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      options,
      name,
      src,
      copy,
      clone;

  if (length === 1) {
    target = this;
    i = 0;
  }

  for (; i < length; i++) {
    options = arguments[i];
    if (!options) continue;

    for (name in options) {
      src = target[name];
      copy = options[name];
      if (target === copy) continue;
      if (copy === undefined) continue;

      if (Util.isArray(copy) || Util.isObject(copy)) {
        if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : [];
        if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {};
        target[name] = Util.extend(clone, copy);
      } else {
        target[name] = copy;
      }
    }
  }

  return target;
};

Util.isArray = function (arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};

Util.isObject = function (arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
}; // 备份原生 XMLHttpRequest


window._XMLHttpRequest = window.XMLHttpRequest;
window._ActiveXObject = window.ActiveXObject;
/*
    PhantomJS
    TypeError: '[object EventConstructor]' is not a constructor (evaluating 'new Event("readystatechange")')

    https://github.com/bluerail/twitter-bootstrap-rails-confirm/issues/18
    https://github.com/ariya/phantomjs/issues/11289
*/

try {
  new window.Event('custom');
} catch (exception) {
  window.Event = function (type, bubbles, cancelable, detail) {
    var event = document.createEvent('CustomEvent'); // MUST be 'CustomEvent'

    event.initCustomEvent(type, bubbles, cancelable, detail);
    return event;
  };
}

var XHR_STATES = {
  // The object has been constructed.
  UNSENT: 0,
  // The open() method has been successfully invoked.
  OPENED: 1,
  // All redirects (if any) have been followed and all HTTP headers of the response have been received.
  HEADERS_RECEIVED: 2,
  // The response's body is being received.
  LOADING: 3,
  // The data transfer has been completed or something went wrong during the transfer (e.g. infinite redirects).
  DONE: 4
};
var XHR_EVENTS = 'readystatechange loadstart progress abort error load timeout loadend'.split(' ');
var XHR_REQUEST_PROPERTIES = 'timeout withCredentials'.split(' ');
var XHR_RESPONSE_PROPERTIES = 'readyState responseURL status statusText responseType response responseText responseXML'.split(' '); // https://github.com/trek/FakeXMLHttpRequest/blob/master/fake_xml_http_request.js#L32

var HTTP_STATUS_CODES = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  300: "Multiple Choice",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Request Entity Too Large",
  414: "Request-URI Too Long",
  415: "Unsupported Media Type",
  416: "Requested Range Not Satisfiable",
  417: "Expectation Failed",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported"
};
/*
    CpicXMLHttpRequest
*/

function CpicXMLHttpRequest() {
  // 初始化 custom 对象，用于存储自定义属性
  this.custom = {
    events: {},
    requestHeaders: {},
    responseHeaders: {},
    responseText: ""
  };
}

CpicXMLHttpRequest.prototype.match = false;
Util.extend(CpicXMLHttpRequest, XHR_STATES);
Util.extend(CpicXMLHttpRequest.prototype, XHR_STATES); // 初始化 Request 相关的属性和方法

Util.extend(CpicXMLHttpRequest.prototype, {
  // https://xhr.spec.whatwg.org/#the-open()-method
  // Sets the request method, request URL, and synchronous flag.
  open: function open(method, url, async, username, password) {
    var that = this;
    Util.extend(this.custom, {
      method: method,
      url: url,
      async: typeof async === 'boolean' ? async : true,
      username: username,
      password: password,
      options: {
        url: url,
        type: method
      }
    });

    function handle(event) {
      // 同步属性 NativeXMLHttpRequest => CpicXMLHttpRequest
      for (var i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++) {
        try {
          that[XHR_RESPONSE_PROPERTIES[i]] = xhr[XHR_RESPONSE_PROPERTIES[i]];
        } catch (e) {}
      }

      if (event.type === 'readystatechange' && that.readyState === 4) {
        // 这里可以拿到返回信息 需要捕获存储
        // var responseData = that.responseText
        // if()
        console.log(that);
        var ev = new Event("request");
        ev.arguments = that;
        window.dispatchEvent(ev);
      } // console.log(that)
      // 触发 CpicXMLHttpRequest 上的同名事件


      that.dispatchEvent(new Event(event.type
      /*, false, false, that*/
      ));
    }

    if (Record.playing) {
      var idx = Record.requestArr.findIndex(function (ele) {
        ele.options.url == url && ele.options.type == method;
      });
      var customResponse = Record.requestArr.splice(idx, 1)[0] || {};
      this.custom.responseText = customResponse.responseText;
      this.readyState = CpicXMLHttpRequest.OPENED;
      this.dispatchEvent(new Event('readystatechange'
      /*, false, false, this*/
      ));
      return;
    } // 创建原生 XHR 对象，调用原生 open()，监听所有原生事件


    var xhr = createNativeXMLHttpRequest();
    this.custom.xhr = xhr; // 初始化所有事件，用于监听原生 XHR 对象的事件

    for (var i = 0; i < XHR_EVENTS.length; i++) {
      xhr.addEventListener(XHR_EVENTS[i], handle);
    } // xhr.open()


    if (username) xhr.open(method, url, async, username, password);else xhr.open(method, url, async); // 同步属性 CpicXMLHttpRequest => NativeXMLHttpRequest

    for (var j = 0; j < XHR_REQUEST_PROPERTIES.length; j++) {
      try {
        xhr[XHR_REQUEST_PROPERTIES[j]] = that[XHR_REQUEST_PROPERTIES[j]];
      } catch (e) {}
    }
  },
  setRequestHeader: function setRequestHeader(name, value) {
    if (Record.playing) {
      var requestHeaders = this.custom.requestHeaders;
      if (requestHeaders[name]) requestHeaders[name] += ',' + value;else requestHeaders[name] = value;
      return;
    } // 原生 XHR


    this.custom.xhr.setRequestHeader(name, value);
  },
  timeout: 0,
  withCredentials: false,
  upload: {},
  send: function send(data) {
    var that = this;
    this.custom.options.body = data; // console.log(Record.requestArr)
    // 这里可以拿到请求信息           

    if (Record.playing) {
      // 走到mock环节
      // X-Requested-With header
      this.setRequestHeader('X-Requested-With', 'MockXMLHttpRequest'); // loadstart The fetch initiates.

      this.dispatchEvent(new Event('loadstart'
      /*, false, false, this*/
      ));
      done();
      return;
    }

    function done() {
      console.log(CpicXMLHttpRequest.HEADERS_RECEIVED);
      that.readyState = CpicXMLHttpRequest.HEADERS_RECEIVED;
      that.dispatchEvent(new Event('readystatechange'
      /*, false, false, that*/
      ));
      that.readyState = CpicXMLHttpRequest.LOADING;
      that.dispatchEvent(new Event('readystatechange'
      /*, false, false, that*/
      ));
      that.status = 200;
      that.statusText = HTTP_STATUS_CODES[200]; // fix #92 #93 by @qddegtya

      that.response = that.responseText = that.custom.responseText;
      that.readyState = CpicXMLHttpRequest.DONE;
      that.dispatchEvent(new Event('readystatechange'
      /*, false, false, that*/
      ));
      that.dispatchEvent(new Event('load'
      /*, false, false, that*/
      ));
      that.dispatchEvent(new Event('loadend'
      /*, false, false, that*/
      ));
    } // 原生 XHR


    this.custom.xhr.send(data);
  },
  abort: function abort() {
    // 原生 XHR
    this.custom.xhr.abort();
  },
  mockData: function mock(arr) {
    this.custom.requestArr = arr;
  }
}); // 初始化 Response 相关的属性和方法

Util.extend(CpicXMLHttpRequest.prototype, {
  responseURL: '',
  status: CpicXMLHttpRequest.UNSENT,
  statusText: '',
  // https://xhr.spec.whatwg.org/#the-getresponseheader()-method
  getResponseHeader: function getResponseHeader(name) {
    // 原生 XHR
    return this.custom.xhr.getResponseHeader(name);
  },
  // https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
  // http://www.utf8-chartable.de/
  getAllResponseHeaders: function getAllResponseHeaders() {
    // 原生 XHR
    return this.custom.xhr.getAllResponseHeaders();
  },
  overrideMimeType: function overrideMimeType()
  /*mime*/
  {},
  responseType: '',
  // '', 'text', 'arraybuffer', 'blob', 'document', 'json'
  response: null,
  responseText: '',
  responseXML: null
}); // EventTarget

Util.extend(CpicXMLHttpRequest.prototype, {
  addEventListener: function addEventListener(type, handle) {
    var events = this.custom.events;
    if (!events[type]) events[type] = [];
    events[type].push(handle);
  },
  removeEventListener: function removeEventListener(type, handle) {
    var handles = this.custom.events[type] || [];

    for (var i = 0; i < handles.length; i++) {
      if (handles[i] === handle) {
        handles.splice(i--, 1);
      }
    }
  },
  dispatchEvent: function dispatchEvent(event) {
    var handles = this.custom.events[event.type] || [];

    for (var i = 0; i < handles.length; i++) {
      handles[i].call(this, event);
    }

    var ontype = 'on' + event.type;
    if (this[ontype]) this[ontype](event);
  }
}); // Inspired by jQuery

function createNativeXMLHttpRequest() {
  var isLocal = function () {
    var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;
    var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/;
    var ajaxLocation = location.href;
    var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
    return rlocalProtocol.test(ajaxLocParts[1]);
  }();

  return window.ActiveXObject ? !isLocal && createStandardXHR() || createActiveXHR() : createStandardXHR();

  function createStandardXHR() {
    try {
      return new window._XMLHttpRequest();
    } catch (e) {}
  }

  function createActiveXHR() {
    try {
      return new window._ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {}
  }
}

window.XMLHttpRequest = CpicXMLHttpRequest;

var Generate = {
  /** 操作记录列表 */
  recordArr: [],

  /** 请求记录列表 */
  requestArr: [],

  /** 操作开始时间点 */
  starttime: 0,

  /** 操作结束时间点 */
  endtime: 0,

  /** 操作持续时间 */
  duration: 0,

  /** 记录操作时的window.innerWidth */
  width: 0,

  /** 记录操作时的window.innerHeight */
  height: 0,
  events: [{
    id: 1,
    event: 'click',
    target: document.documentElement
  }, {
    id: 2,
    event: 'scroll',
    target: window
  }, {
    id: 3,
    event: 'touchstart',
    target: document.documentElement
  }, {
    id: 4,
    event: 'touchmove',
    target: document.documentElement
  }, {
    id: 5,
    event: 'touchend',
    target: document.documentElement
  }, {
    id: 6,
    event: 'change',
    target: document.documentElement
  }, {
    id: 7,
    event: 'input',
    target: document.documentElement
  }, {
    id: 8,
    event: 'popstate',
    target: window
  },, {
    id: 9,
    event: 'pushState',
    target: window
  }, {
    id: 10,
    event: 'replaceState',
    target: window
  }, {
    id: 11,
    event: 'request',
    target: window
  }, {
    id: 11,
    event: 'focuschange',
    target: window
  }, {
    id: 12,
    event: 'mousedown',
    target: document.documentElement
  }, {
    id: 13,
    event: 'mousemove',
    target: document.documentElement
  }, {
    id: 12,
    event: 'mouseup',
    target: document.documentElement
  }],

  /**
   *  收集用户操作信息
   * @date 2020-07-23
   * @returns {void}
   */
  start: function start() {
    // 记录收集信息时间
    this.starttime = new Date().getTime();
    this.width = window.innerWidth;
    this.height = window.innerHeight; // 开启事件侦听

    this.startEventListener();
  },
  stop: function stop() {
    var _this = this;

    console.log("stop"); // console.log(this)
    // 清除focuschange事件

    clearInterval(this.handler.focustimer);
    this.endtime = new Date().getTime();
    this.duration = this.endtime - this.starttime;
    this.events.forEach(function (ele) {
      // console.log(this.handler)
      ele.target.removeEventListener(ele.event, _this.handler[ele.event]);
    });
  },
  startEventListener: function startEventListener() {
    var _this2 = this;

    // 初始化自定义事件
    // 路由变化部分
    var _wr = function _wr(type) {
      var orig = history[type];
      return function () {
        var e = new Event(type);
        e.arguments = arguments;
        window.dispatchEvent(e); // 注意事件监听在url变更方法调用之前 也就是在事件监听的回调函数中获取的页面链接为跳转前的链接

        var rv = orig.apply(this, arguments);
        return rv;
      };
    };

    history.pushState = _wr('pushState');
    history.replaceState = _wr('replaceState'); // focus 变化部分

    var prevActive = document.activeElement;
    this.handler.focustimer = setInterval(function () {
      if (document.activeElement !== prevActive) {
        // console.log("focuschange",document.activeElement)
        prevActive = document.activeElement;
        var e = new Event("focuschange");
        e.arguments = {
          target: document.activeElement
        };
        window.dispatchEvent(e);
      }
    }, 30);
    this.events.forEach(function (ele) {
      // console.log()
      _this2.handler[ele.event] = _this2.handler[ele.event].bind(_this2);
      _this2.handler["".concat(ele.event, "tacking")] = false;
      ele.target.addEventListener(ele.event, _this2.handler[ele.event]);
    });
    window.addEventListener('xhrRequest', this.addRequest);
  },
  generateRecord: function generateRecord(id) {
    var now = new Date().getTime();
    var record = {
      id: id,
      time: now,
      duration: now - this.starttime
    };
    return record;
  },
  handler: {
    // click 处理函数
    'click': function click(e) {
      var record = Generate.generateRecord.bind(this)(1); // click 事件的信息收集

      record.pointer = {
        left: e.clientX,
        top: e.clientY
      };
      record.domPath = Generate.getDompath(e.target);
      record.type = 'click';
      console.log(record);
      recordArr.push(record);
    },
    'scroll': function scroll(e) {
      var _this3 = this;

      if (!this.handler.scrolltacking) {
        window.requestAnimationFrame(function () {
          var record = Generate.generateRecord.bind(_this3)(2);
          record.domPath = Generate.getDompath(e.target.scrollingElement); // console.log(e.target.scrollingElement.scrollTop,e.target.scrollingElement.scrollLeft)
          // scroll 事件的信息收集

          record.type = 'scroll';
          record.scroll = {
            left: e.target.scrollingElement.scrollLeft,
            top: e.target.scrollingElement.scrollTop
          };
          recordArr.push(record);
          console.log(record);
          _this3.handler.scrolltacking = false;
        });
        this.handler.scrolltacking = true;
      }
    },
    'touchstart': function touchstart(e) {
      // const record = Generate.generateRecord.bind(this)(3);
      // touchstart 事件的信息收集
      var record = Generate.generateRecord.bind(this)(3);
      record.domPath = Generate.getDompath(e.target);
      console.log(e); // scroll 事件的信息收集

      record.type = 'touchstart'; //   record.touches = e.changedTouches[0]

      record.touches = e.touches;
      record.targetTouches = e.targetTouches, record.changedTouches = e.changedTouches, recordArr.push(record);
      console.log(record);
      recordArr.push(record);
    },
    'touchmove': function touchmove(e) {
      var _this4 = this;

      if (!this.handler.touchmovetacking) {
        window.requestAnimationFrame(function () {
          var record = Generate.generateRecord.bind(_this4)(4);
          record.domPath = Generate.getDompath(e.target);
          console.log(e); // scroll 事件的信息收集

          record.type = 'touchmove'; //   record.touches = e.changedTouches[0]

          record.touches = e.touches;
          record.targetTouches = e.targetTouches;
          record.changedTouches = e.changedTouches;
          record.pointer = {
            left: e.changedTouches[0].screenX,
            top: e.changedTouches[0].screenY
          };
          recordArr.push(record);
          console.log(record);
          _this4.handler.touchmovetacking = false;
        });
        this.handler.touchmovetacking = true;
      }
    },
    'touchend': function touchend(e) {
      var record = Generate.generateRecord.bind(this)(5);
      record.domPath = Generate.getDompath(e.target);
      console.log(e); // scroll 事件的信息收集

      record.type = 'touchend'; //   record.touches = e.changedTouches[0]

      record.touches = e.touches;
      record.targetTouches = e.targetTouches, record.changedTouches = e.changedTouches, recordArr.push(record);
      console.log(record);
      record.type = 'touchend';
      recordArr.push(record);
    },
    'change': function change(e) {
      var record = Generate.generateRecord.bind(this)(6); // touchstart 事件的信息收集

      record.type = 'change';
      recordArr.push(record);
    },
    'input': function input(e) {
      var _this5 = this;

      if (!this.handler.inputtacking) {
        window.requestAnimationFrame(function () {
          var record = Generate.generateRecord.bind(_this5)(7);
          record.domPath = Generate.getDompath(e.target); // console.log(e.target.scrollingElement.scrollTop,e.target.scrollingElement.scrollLeft)
          // scroll 事件的信息收集

          record.type = 'input';
          record.value = e.target.value;
          recordArr.push(record); // console.log(record)

          _this5.handler.inputtacking = false;
        });
        this.handler.inputtacking = true;
      }
    },
    // 浏览器回退/前进等事件
    'popstate': function popstate(e) {
      // console.log(e)
      console.log("location: " + document.location + ", state: " + JSON.stringify(e.state));
      var record = Generate.generateRecord.bind(this)(8); // touchstart 事件的信息收集

      record.type = 'popstate';
      recordArr.push(record);
    },
    // 浏览器跳入新路由事件
    'pushState': function pushState(e) {
      var record = Generate.generateRecord.bind(this)(9); // touchstart 事件的信息收集

      var state = e && e.arguments.length > 0 && JSON.stringify(e.arguments[0]);
      var path = e && e.arguments.length > 2 && e.arguments[2];
      var title = e && e.arguments.length > 1 && e.arguments[1];
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;
      console.log('old:' + location.href, 'new:' + url);
      record.type = 'pushState';
      record.state = {
        path: path,
        state: state,
        title: title
      };
      console.log(record);
      recordArr.push(record);
    },
    // 浏览器替换路由事件
    'replaceState': function replaceState(e) {
      var record = Generate.generateRecord.bind(this)(10);
      var path = e && e.arguments.length > 2 && e.arguments[2];
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;
      var state = e && e.arguments.length > 0 && JSON.stringify(e.arguments[0]);
      var path = e && e.arguments.length > 2 && e.arguments[2];
      var title = e && e.arguments.length > 1 && e.arguments[1];
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;
      console.log('old:' + location.href, 'new:' + url); // touchstart 事件的信息收集

      record.type = 'replaceState';
      record.state = {
        path: path,
        state: state,
        title: title
      };
      recordArr.push(record);
    },
    'request': function request(e) {
      var _e$arguments = e.arguments,
          custom = _e$arguments.custom,
          responseText = _e$arguments.responseText,
          status = _e$arguments.status;
      this.requestArr.push({
        options: custom.options,
        responseText: responseText,
        status: status
      });
    },
    'focuschange': function focuschange(e) {
      // console.log(e)
      var record = Generate.generateRecord.bind(this)(12); // touchstart 事件的信息收集

      record.domPath = Generate.getDompath(e.arguments.target);
      record.type = 'focuschange';
      console.log(record);
      recordArr.push(record);
    },
    'mousedown': function mousedown(e) {
      var record = Generate.generateRecord.bind(this)(13); // click 事件的信息收集

      record.pointer = {
        left: e.clientX,
        top: e.clientY
      };
      record.domPath = Generate.getDompath(e.target);
      record.type = 'mousedown';
      console.log(record);
      recordArr.push(record);
    },
    'mouseup': function mouseup(e) {
      var record = Generate.generateRecord.bind(this)(14); // click 事件的信息收集

      record.pointer = {
        left: e.clientX,
        top: e.clientY
      };
      record.domPath = Generate.getDompath(e.target);
      record.type = 'mouseup';
      console.log(record);
      recordArr.push(record);
    },
    'mousemove': function mousemove(e) {
      var _this6 = this;

      if (!this.handler.mousemovetacking) {
        window.requestAnimationFrame(function () {
          var record = Generate.generateRecord.bind(_this6)(15); // click 事件的信息收集

          record.pointer = {
            left: e.clientX,
            top: e.clientY
          };
          record.domPath = Generate.getDompath(e.target);
          record.type = 'mousemove';
          console.log(record);
          recordArr.push(record);
          _this6.handler.mousemovetacking = false;
        });
        this.handler.mousemovetacking = true;
      }
    }
  },
  getDompath: function getDompath(ele) {
    var t = ele;

    for (var e = []; null != t.parentElement;) {
      for (var n = 0, i = 0, a = 0; a < t.parentElement.childNodes.length; a += 1) {
        var r = t.parentElement.childNodes[a];
        r === t && (i = n), n += 1;
      }

      var o = "> " + t.nodeName.toLowerCase();
      t.hasAttribute("id") && "" !== t.id ? e.unshift(o + "#" + t.id) : n > 1 ? e.unshift(o + ":nth-child(" + (i + 1) + ")") : e.unshift(o), t = t.parentElement;
    }

    return e.slice(1).join(" ").substring(2) || "html";
  }
}; // 节流函数
var start = Generate.start;
var stop = Generate.stop;
var startEventListener = Generate.startEventListener;
var generateRecord = Generate.generateRecord;
var recordArr = Generate.recordArr;
var requestArr = Generate.requestArr;
var handler = Generate.handler;
var events = Generate.events;

var replay = {
  replayMouseEvt: function replayMouseEvt(item, evt) {
    var args = {
      'view': window,
      'bubbles': true,
      'cancelable': true
    };

    if (item.pointer) {
      args.clientX = item.pointer.left;
      args.clientY = item.pointer.top;
      replay.mouseEle.style.left = item.pointer.left + "px";
      replay.mouseEle.style.top = item.pointer.top + "px";
    }

    var event = new MouseEvent(evt, args);
    document.querySelector(item.domPath).dispatchEvent(event);
  },
  replayScroll: function replayScroll(item) {
    // console.log(item)
    document.querySelector(item.domPath).scrollTo({
      left: item.scroll.left,
      top: item.scroll.top
    });
  },
  replayTouch: function replayTouch() {},
  replayChange: function replayChange() {},
  replayInput: function replayInput(item) {
    document.querySelector(item.domPath).value = item.value;
  },
  replayFocus: function replayFocus(item) {
    console.log("focus");
    document.querySelector(item.domPath).focus();
  },
  replayPushState: function replayPushState(item) {
    // pushState 延时触发，因为一般点击事件会触发本事件。
    setTimeout(function () {
      var path = item.state.path;
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;

      if (url !== location.href) {
        history.pushState(JSON.parse(item.state.state), item.state.title, item.state.path);
      }
    }, 100);
  },
  replayReplaceState: function replayReplaceState(item) {
    // pushState 延时触发，因为一般点击事件会触发本事件。
    setTimeout(function () {
      var path = item.state.path;
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;

      if (url !== location.href) {
        history.replaceState(JSON.parse(item.state.state), item.state.title, item.state.path);
      }
    }, 100);
  },
  replaytouch: function replaytouch(item, type) {
    console.log('touch');
    var evt = new TouchEvent(type, {
      cancelable: !0,
      bubbles: !0,
      touches: item.touches,
      targetTouches: item.targetTouches,
      changedTouches: item.changedTouches,
      shiftKey: !0
    });

    if (item.pointer) {
      replay.mouseEle.style.left = item.pointer.left + "px";
      replay.mouseEle.style.top = item.pointer.top + "px";
    }

    document.querySelector(item.domPath).dispatchEvent(evt);
  },
  // 初始化
  playInit: function playInit(record, requestArr, width, height) {
    var _this = this;

    this.playData = record;
    this.requestArr = requestArr;
    replay.player = null;
    replay.playPosition = 0;
    replay.playDataIndex = 0;
    document.documentElement.style.width = width + "px";
    document.documentElement.style.height = height + "px"; // document.documentElement.style.margin = "0 auto";

    if (!replay.mouseEle) {
      var img = document.createElement("img");
      img.src = replay.mouseIcon;
      document.body.appendChild(img);
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.position = 'fixed';
      img.style.top = "0";
      img.style.left = "0";
      replay.mouseEle = img;
    }

    {
      var div = document.createElement("div");
      div.style.position = "fixed";
      div.style.top = "0";
      div.style.left = "0";
      div.style.width = width + "px";
      div.style.height = height + "px";
      div.style.zIndex = "10";
      div.style.overflow = "hidden";
      var img = document.createElement("img");
      img.src = replay.playIcon;
      img.style.width = '80px';
      img.style.height = '80px';
      img.style.marginLeft = (parseFloat(width) - 80) / 2 + "px";
      img.style.marginTop = (parseFloat(height) - 80) / 2 + "px";
      img.addEventListener("click", function () {
        _this.play();

        img.style.display = "none";
        img1.style.display = "block";
      });
      replay.playIconEle = img;
      var img1 = document.createElement("img");
      img1.src = replay.parseIcon;
      img1.style.width = '80px';
      img1.style.height = '80px';
      img1.style.marginLeft = (parseFloat(width) - 80) / 2 + "px";
      img1.style.marginTop = (parseFloat(height) - 80) / 2 + "px";
      img1.addEventListener("click", function () {
        replay.timeout();
        img.style.display = "block";
        img1.style.display = "none";
      });
      replay.parseIconEle = img1;
      img1.style.display = "none";
      div.appendChild(img1);
      div.appendChild(img);
      document.body.appendChild(div);
    }
  },
  // 视频长度
  playTimer: 600000,
  // 播放队列
  playdata: [],
  mouseEle: null,
  backEle: null,
  playIconEle: null,
  parseIconEle: null,
  // 帧数
  NFS: 60,
  // 当前播放位置
  playPosition: 0,
  // 播放到的操作位
  playDataIndex: 0,
  player: null,
  // 播放
  play: function play() {
    var _this2 = this;

    this.playing = true;
    var playdata = this.recordArr;

    if (replay.player) {
      return replay.player;
    } else {
      replay.player = setInterval(function () {
        // 找不到下一个要播放的记录则结束播放
        if (!playdata[replay.playDataIndex]) {
          _this2.suspend();

          return;
        }

        if (playdata[replay.playDataIndex].duration - replay.playPosition <= 1000 / replay.NFS) {
          // console.log(,replay.playDataIndex)
          var item = playdata[replay.playDataIndex];

          switch (item.type) {
            case "click":
              replay.replayMouseEvt(item, 'click');
              break;

            case "mousedown":
              replay.replayMouseEvt(item, 'mousedown');
              break;

            case "mouseup":
              replay.replayMouseEvt(item, 'mouseup');
              break;

            case "mousemove":
              replay.replayMouseEvt(item, 'mousemove');
              break;

            case "scroll":
              replay.replayScroll(item);
              break;

            case "input":
              replay.replayInput(item);
              break;

            case "focuschange":
              replay.replayFocus(item);
              break;

            case "pushState":
              replay.replayPushState(item);
              break;

            case "replaceState":
              replay.replayFocus(item);
              break;

            case "touchmove":
              replay.replaytouch(item, 'touchmove');
              break;

            case "touchstart":
              replay.replaytouch(item, 'touchstart');
              break;

            case "touchend":
              replay.replaytouch(item, 'touchend');
              break;
          }

          replay.playDataIndex = replay.playDataIndex + 1;
        } else {
          console.log('wait');
        }

        replay.playPosition = replay.playPosition + 1000 / replay.NFS;
      }, 1000 / replay.NFS);
    }
  },
  mouseIcon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAgAElEQVR4Xu3dCfh9XTUH8JW5yJBZgyFKSkUZixLSRKFkKhJJZQoNppLmCEmTWaYyFSFSNBfJmKEQaUBJyZDZ8+k9931/7++9w9lr733uufee9Tz3+f3rPWefvdc+6+y91/qu77pULNJTAx8QEVeOiPeOiPeMiPcY/vr35SLinSLiMhHxjsPf1b/fHBH/eu73zxHx2oj4h4j4+zN/XxURL4+I1/ccyKm2falTHXjjcXvhPy4irh4RHzb8PnR46Rs/amNzb4yIvxp+fxkRvxsRvzMYz1R9OLrnLAaSm9L3iogbRsSnRMT1BoPItdT/LqvOcyPiBRHxnOHf/Z96JE9YDGT8RN4sIm4xGMbVxt82uytfGRE/HRGPjYi/mF3vZtahxUA2T8jlI+IzIuLmEXGjiLj0zOautjv/ERHfHBEPj4j/rW3sWO9fDOTiM+vQ/LkR8SXDmeJY5/3suJ4fEbeOiFefwmBLx7gYyAUau/5gFJ8zeJRK9Xjo1/OM2T461C9yRgOnbCBcq18aEXeJiKssb8VbNOAD8TOLLi7SwCkayBUj4muHFeNdlpfhYhr4n4j4wuEQv6gmIk7JQD42Iu4ZEbdaZn6nBqysP7jzqhO44BQMhEv2ocMe+wSmtMkQ/y8i7hoRj27S2gE3cswG8n4R8YCIuH1EvNUBz9E+u+58dtJGcowG8q6Df//r9vlmHdGzvyYivueIxlM0lGMzkC+OiIdEBCjIIu008A0R8R3tmjuclo7FQAAEQSfEMxbpowHbVZH3k5JDNxCR7/tHxN0i4q1Paub2M9gfHdzjJwNNOWQD+YSI+MmIuMJ+3pWTfeovRsQXRMS/nIIGDtVA7hcR33LAEyQhSgKUHA5//y0iLjvAXKyKovzvPOPx/fUQdT96aMqhGciVIuKnIuLjZ/7y/FlEvGYAAP5dRPj536v/j4GMkXcbshFlJK5+VsyPjIjrRIT/vk/5poh44D470PvZh2QgnxkRPxwRc4KHyNx78ZC9J4PP7596T9qZ9qX0fkREXHcwGn+l9U4pPgZfNiRjTfncSZ51KAYiEs7VuG8BCQfme0pE/PawPdp3n84//8MH1AB07pQrLWiKOZryA9Fd93M3EEG/nxsSlrorY8MD/iAinhwRT4qI39tXJ5LPRQzBUCR+fdpAEpFsatRt0nsFaB8/6uoDuGjOBnKNiOAx+cA96PFZg0H8QkQ4kB6LfHpE3DEibtl5QL8aEYK28kwOWuZqICbSYZw3Z0qBO3LolLd9zALyf+fBWBz+e8jrBiP55R6NT9XmHA2Ej90SPVXf3jQA8kApbBFOSd42Ijg/vmIgo+gx9scN+Tdc2QcnU72EYxXzlRHxiLEXV173hoj47uF5R3WwTOqFNwyc5KbJ+7fdxtt328HL16H5fk3OyUAE/gQAe8t/RsT3RcS3H5vHpZHiuIofNHB+NWryLc3Qu0SsgzrAz8VAvisiwKp7iiSgJ0TEvY/s4N1LZ4CfD4sImZgt5TERYafw3y0b7dXWHAxkCuN45uB+FMhbpEwDNx5WFNH7VoJqyNkHx/CsZd8Gcp+IuG9HDf1jRHx1RPxEx2ecStPiGy1zQsBuxGdeNGcF7tNAQNS/t6NybKc8g7txkTYa+OCI+JGBj7hFi/8+gB4hE2Yp+zKQ20XEj3XSiC8TbNBB+9876aZFs94ZhA4PbhSnkluCyVKuyexkHwaCdgd8pAeRAjwQziuxjUX6agBQEngUy30L+cbhrNOirWZtTG0gPCPPbtb7ixr624j4ooj4zQ5tL01u18C3RsS3NVLSo4bVqVFz9c1MaSC+OKDhrXMYJO0IbjmQL7IfDcB2/XgjMKQ4iY8dt/zeZSoDkR3HW/EhjUcMeo4qUxBqkf1qQEUtIEUfwlr5/oi4U20jLe6fwkCcNZ4RETdo0eGhDV8Xy3qrpb1h1066KbuDJzaKwj9yCCjuVaFTGAhslchpS1HDgxt3kXlqQLykBXHfd0bE1+9ziL0NBEBNua9WAm2r4tPRkwW0Utge2wHpaZGvLpC8t51CTwORc/CSga2jxTwhPlBJ9pgSmFroZc5t3KuR61YKBIqnyaWXgWgX3uZjGo3IyiG/+lCLTiKa4KAQiZYhaa++ovdZ/ZWbsaqNjnPKv1ECyYMHF/dT5vnQBAgV3q5G/ms4w3qnJpVeBtLqy0EZrx+gDdgzDkUA/JSI/sShelVL17aPxJ9ExK8NacGHUFuwhZHI2QGYnHQH0cNAJN5g/HibBm8z4xCp/aMGbfVswqoAeMcwVMR9h54PO9e2bexvRMSvRMSvT/jc0kfJWhQIrJGXDRRHVtZJpIeB/Hmjmn+U8ElDcHESZRQ+BInd50XEbQYSt8Lbu1zuK4t9RXzoaTPMuWiRFGdcPkSTSGsDwf4tU6+FXC8inteioYZtIJEAhAS2bJkf0bCLFzblA8NQZE/Oia6Ie16x0BqxhVfmoru0NBBeK0vg2zfoNbRo7XLcoBsXNoFfSl4J+Lx/H5r46kqjnQNWzfvxgoi4doUSZSP6gNrKd5WWBoLDCl1PrYA941Sag+DBFaiyalxmDh2q7IMXSmzCXO0T6/S+A4GDv1lBzaQuTFfkdisDARZ0SKwVWwGuYW69fYpDtu0iKs2322dHOj0baJTR+7svsYLYQl+6ogOI/T6r4v6dt7YyEP75WgZEmX+U9qqdve57AW+UmnwtQHd9e1rXukQlBAoY2lEg7UO83HKDagSoEbixi7QwEIku+JRqRUGc59Q2UnE/g/DC4LA9JRGEtVLK8NzHtquWtENQ9eoR8Yoek1ZrIA6sOlZLEQpr05O8YZfuPj8ifqByud/1jLn/d7EU2DmxpynFdvaPI+LKFQ99eiME8SW6UGsgLZC6PF8OW/vgSeJRAatGaLbIBdtb257u3qFzyv6owbNVk4YtEGkH0FRqDMSW5KURAUNUI4jJXljTQPJeZyZlDdTTWOQiDXCQ3GOgZZ1SL7bptutZsdVSEeBvsg2su6/GQLCvy8uoERbP8qcWqGBeN/VHphIHYeUAkKX5+TeEsr9+3JXcntjWbV0vP/xbzXf/3/tN1dHhOeh97jDxM9ViuWbFM5tH2bMGIopcy1Lo5bhKbz/2GmUDEf7SBHgpbOawUWIOVqravb3th+AYL5sc8Nbpy+veS3xVt46I/6h4aUtutQLU4u6EHJ5a8tBt12YNBISB4mrksyPi52saSNwrr0AgsldNdSsD42MUjKPniyUHnKH4iR3V7N+3qfK5Q5WqqVzBteX2oJ3p5n8S78clbskYiKWf56pmQnyZWkTdS3TQAnK97nm2RjxgPhqT5ysMHVK40wcHAdtHlyhl5LW8TJ86bAlH3pK+DMHHyyshPVK8OV+qJWMgtX5rlu2AjMtqKgFdQXLWUhwGefEUiHFAnItILBPXsBWr+YidHw8j0XZXaMfwULg3tVuyAtXMiVQNiy81EJlxzg41+Q5TH8xbRGvPTpSzhBfwh7KzN9F9zigM+CYNnyeQK6A7hcig/KCKBzUhfCg1kFqGb/xV7z/RUk23vngQrC3wVKLMViE6mGo/XvF+XHirrRdDaeUFc75SugBUpafo989WPAAxtuNAVfWwUgNx9gBrz4qJsnxOIeAHzgSXbfAwSWD293PLTxk7NHnv9x/g+i0cFDiQpwiu0jeXfFbkJqFGTUuJgdQidt88nD1s0XqL+IY9sy9IrdgSMupjYG+0PQIOfM9apQxcZ00Owlv6UhtOsHrYsaTPTSUGQrE10GLlvERopxAUmLV7by5aq8Ze6GY6Kkkwknu9trSaDwb38u937KumxTRqAKTeOe9eSsYaCDci9owsrASFDUuegmBa+YOHp7Rx0U3OGCZlakxSZbdH324euaXFUGoEw4itbM8Sz7cYYkvZfkIrS3xL7QDGGoisurQVDpWkvio7woL7rjWQZNcwqoB94BE+JJqhAhVdeCkXMIi74GmNYM5EXtFLvKNc6jVnX27+VIGesQZSy1TC5dib9M1XEUzhqhUzJTaDy2pS7qWK/tbeav6ttrUVhqEqahOfto3l7hHBbZsVOfCpw/4YA5HlV8OKwRMBQ9Rb7jmUBcs+x8qhRviUAcxsX1vfB5ioJkdWlL3DGtlrqyW67hk1vABwXjjEimSMgdRWEEovbwUjeZ+BljOb38zL4QtTrMCCPs75UquvIGANTAWGykeqlzy2smZIKkA9xkAUvrlOctRC/eDaPUF7ulbjYXN4Q1B3qDGO5NRc4jauXwjt7F5fHgmoeq+zm6S6mg+Y1c0Yi1a5XQYi+lpDoqDMc+/DuZdbgZ6sIIFTPmyRCxKOeO6yKzHkrzqUvQQLC2rbrGByASwdLbsM5M4R8ejRrV3ywt6Hc/13MOdqzMg+koIy/ZzyHlWI0elkRf2WFhRQ656Pt+A+2Y4NKQhFMZVdBqLW+M2SHbIc+iL1FIhVyUgZ+dPha9R7+5fp277vqXkRe64i3Pi1gUlM+6OxdNsMRCzB4TWL3G2CptzxptgzZzhy7UMpu7fred8ves3zrSJWk4zY9v5W5sYR99jy1wAveevEf0bJNgMBI+A/zorUVnQsvUQCT5buH1xdHb1FNmtAaoMAnb+lgkLI/PQQ51ocyVmx4xht+NsMxEvEdZcRX2i+6yZpjxs64AuVqZyLBVJK5r7pTTN6nfqeGrZ+VD48oK3Fhxc5Q1Z4LYFZweF3yjYDkRbrwJUROQO1OJ9tz5WRmC1H1ntly+hrrvcgBLSKvHuigzyDPIQ9xBkis7Kt+uLsijtgp2wzkDcOq8DORtZc0IXE68xz5DbglC2VZyVXndLnHNP1WfCnLzTDGvWlLlQY/BcWyKxIGwdf2SmbDKQ2KAO524UrdRhR9qBmX2x/vMh4DcjGtIpAK5TKF0bET5TeNOJ6sTUE41kRTxkV/N5kICoAqQSUES8veHEvkfRjJSgVeLKMx6v0Ocd4vQAbcopSkZeTDRNsexZYUA3yQbqwLdpOso1NBoJMOpuq2EspK4WZKBNWKj0DWKV9ObTrpemimS0lUeCkkdWJL6ylwI7JUK1hbeHJ2hlD22QgNcRwD46Ie7fUxrm2pFGWUoZK1JL0tUheA1nCDlmZrSmXjKIWdoJWyPlqq2wyEHW4r7br5g3/XSkBvL09BKRErnmpWHW+vPSm5fqLaSDrOXx8RNy+gy5r0b2jckTWGYhlS4wgu3x5iRlYDxEgEigqFWmbYDOL1GkAPEcMqUSQdNTUItz0rDuWAg/PNSQNHNvLVllnIAqZZCEYDAs0pRdnErIBnEwlws1oS5bKSS550Alcm+XN7QFaBa3HBl8jO/u1zkCknD4z+dTR7rNE+/qK1bD0/PGkhFEluncSt4CyPzsx0h51BGEFffR2AW63dXcngfq6xiXgZ6luesLHsxxJvQ6Jiffk4G/xvnCSlEaxnUmdTVuL7ZvaKVm53y74/DoDyXordPJeEfGQbG933IfJr7SaKbpQWWRT0A11GvbsmsUOUnroRvpRenYZM3DJXTBfWdlZRnqdgdSwt/fMP+c+Ls15noowIjtBh3hfhjNX/UkR+dZVdDNn0rM6l1uyNUNxnYHYXmV5jmRrZSHou14WRMYmp0Sm5AIu6dchX6usgPodpcJN3JpOCdykJqUbk83WLdo6A6lJlOFZqC2htUnxoCIoiEqk55avpB/HdK0odsYj2ANFXUtoaEVT6Xhj6sM6A6lJs7Xff12ntwG0wGBKxF5ZoGqRthowx6UQePwGgnstRRHZ2qC0FXFjZdx1BmKLlM0Gq3G5bVOcvISdwLI1DXxyJeNJy8k8prbsEkr5BuS5w/i1lKzb+Wwf1JDZWDpv3Qut4MwNk6PoZSD2iZmyCeAyvXiakio6itt+LSJuXDgSKc6yVFuKGvd/WNngVtrUdS80a8pQ4yOJK/WPjx0bFKmSXKWiP9V16kofegLXZ6hKba9ss1pK9r042wcYvY1Q/nUGgoIyw6UL0pxJqhmjsAysQF68rdki7TXwwARim3e0lkn+/EhA6V9ZObytBB7rDETGnb17qXDhceX1EPtEfEsl8rKIuErJDcu1ozWgzDIXeon04CnIbr3P9ntrmbZ1BmIgmRrmtkAYvntIhskCZgiubJH2GsgEC9HDZj6823qP97k2GWtrfvo6A3liRNwmoVM56HLRe0gGQAnpWRo36dH3Y2yT+7y0IA3vaBHt5wjFed9qg4+SueD11so6A8lgbTTeMxc9A1TcGSUdMQHLJes1kKnFgoGfx6ilwHfJUakR2bM4GEYbSDZTC8rzcjU93XKvswTAW4mIksqlbo3/KenDsV4rXbW0nHcPpDcclRSLGik2kAcNqNzSh0qSalGDe91zs2UYsKvUlG8o1cGpXI/xZuNXd4MSepTC4G3lda0RPL0bq2ut22LdNSKy9a/VlQAJaS2XTcYzetFfth7fobWHdgn9UolwDWfI/rY9A6VQbSr11vjMOgNRCz1bkNFWiHu1h2SwWKMpJnt0+IjbNMelHkuu4eyHd5Mqa/PStQsRvLGI6ToDqWF178lcyCslYFgiW6OkJQ0t115MA9CvpaW2bxoRT22sx2+MiAdUtrmVpmqdgdi3Zyu99kxvzdQh7AGQq5yPg78daz/e5lLZSZBQ2uDw9a/JB/FIRubcvVbWGYj/DyNeBni4M8c3oYTVLVJ571F4PwZv26xF2mkgUxPS+yRVoXU5jGzM7qw27hARPGyjDcSFaH/Q/5RKD1feqg8ZfliJPQ74mQSf0rGfyvUPH8NIeE4ZvVAW2Hdq0RJbs2A3rRLZrEJFbXxhekjmy6Uf6pSAzyzSRgPSbSUZlQh4/E1Kbhh5bYaG9nzTW7NgNxlItoijojaZlWeMPrDg2fuWMj4q+5shux7Tp1O7JlsWo4eLF1vjqxtMAM7mjaw3mwwEeyHGiFIRLPQi9yiaoi+Zop3SQ6UCL1KvgQzExFN7eDd5xWrLTWNbkWO/UTYZSA396I0iQlZiD3lYREjULxWuaxxKi9RpQMqB1IMS8RL6aLYut42QY6P3aWQHZZtuJWnf5qmScCQyXipKH/At95DsV4OvXEHKRfIaQNLw2oR3s1fZuxp6qpUWdgIotxlIJu/Yg3skxqwG5EvkYFYapJK3rC76InkNIAXM1PnoFYvKMM2fH/3WZCkXbzMQK4HDVan03vOrYJXxiEjwz9QWKR3/sV6fLbvtw1RLrHBepy0qTGkTQaKCoBtlm4HU1IGTTJ9h3xvzcslrVmK4VBSTVFRykXINZDI6PWXnHr+8K2+5Q2Zii2KsO413V7Q8ew7ZaZlJxbhN/RF74Z3FT849g4eN86E2A62i6wd7a4YHy2C3EiJUaAOFEJL1Wtn1/u+Ek2TPIb05ce2F7YlL5dERcZfSm078+mzFYx8kLDc+Zq2lpkTgqi+/ExEfvatjuywI9ilTzgBUBTitl2Sj6lCogl3ZClq9xjPXdiXA0VVp5Nx4euSga7dFHrp2hAx2Yvt2GchVK5gJex+K7W/1r1R6l6ku7c+cr5cu8JhkBxF/YORvLV8REY9q0CjmnqfsameXgbif50dhzlLBw8rF10tA638w2fiCz9qtOGc9pM6odUrFfRw1PWpVQmgryloj+oV1cyff8xgDAWH/lkRvXpIgOC55jFiIiZCvXiooimQ/to7ulvZjztdn3fzGBPsGA9daFOF501CMp6btnYVzVo2PMRCuMA1mBC1LKRtJyXMUgge/zkgPEoFMP+Z4j3Pai5JIitdExJUiAsSktYh/2SLXyneOhSyNMRCdyUCc3fetESFa2UtAYbCWvFvyAbeKiCcn7z3W2+hSevMVkwO8e0RgK+whmSpj6/qhesGoSs5jDQSWSWpiqUzBbijhPjshlmv5AEts5IKZ5bXy4mTIy90vVZv3ssfWtQXNqD6+oeSDOtZALJleorHXnzUkrIjKp/USkwrKYFuQEZge5R6WMgkXVBFWTTgr0iTUpe8hLdC7+gWFcbuxHSx54bMYKCXQSssGj+3/6roMd+/ZZ/hqgi+0zpkuHcc+r1e7QyA1K0+PCJCUHuI99YH2oa4VgU9siqOkxEC4RjNfB4c1TCm1LNy7BpRh+zvb5lYS410PP/D/bkvlI5FlxhSA5ZCRUdpDsliw833xAcRRMDqhr8RApLo6EGeK5PRkO1kpgRG+NOl5WbWxlSOpx8zPoE1bU4lQ71rRl1FR6Yr2W7CXeDyuBcSIo6XEQDQqHuJlLxV4nEzAqfQ5NZHf1bMsv7aEPShUS8fT+3qMHpKGaipxgaJATfTSl5zxVnium5em6ZYaCBegVSSTabiVf6jhmyCX3mGxRjgVRGtbkALU9KPnvQKB90+QYJztE6O4TkQAD/YSfWzB6asIrJJtRdH9UgOhhAz1vfsoMQNZKVW8PSavVgZgd/ZZ6oswEqjPYxIEbtJVi7YaGxTQK2K+epw0X2iJmhVu1VZqm58xkJrCiT3YLdbNncpSXuzS1NzzbSGcg/mSbHUMgiqHN7JF+rEAq0BrT3low9LRPGDFlLoZA6EQIMGNZau2aEziTSkBdXYCbOl+KHvzufvAWST/FC3PjZ7dqhlbIcbRggLJCo3d5F9bdW5NOy0KdK6aRZqN8KNYsgYC6CfAVkripoN3igsCUlNIplzxpn5BBQhWtWYo760HBgFZbTtUu6Lqq728yk7+9hRlCWqJqVf920ovum0QWQPRpgBgJsfb3l65aOm8vcX4eKVUZW0l4gW4uYD55iz27RKCpKa22MMbqxXDytGahOG8HrMVxdbNRxWqvMZAas4iU8YbHEqV6bpuw7dZ3UOGB5+GmHlOgvFDVBwPWEvXuu0lNO3TJhjs4xrSxSqyk95q1xgIPVm6IXZLReQVqI2HYgrhS39BJ95gkyk+ZGXct9x2oGqSrNRaGJ1yZb1Fnri5qn039dOcQCWn2f1rO3GZoeRaJmlpa3XRDrPga4oqRlCrtZgAvFGy3URrpyocarVA9aoGihTSLER9mz6sHAKnU3jyJETZEpWWd9vU//skA9sXtldrIBrKFJVfdWBUXnDDt1mMhHuyV4mGVVft0TFM+jmrtCxFLVgrPsMoHD6NqZcIBIqXtEhSGtPHbPbquralMoiFvX7Mgzdd08JAtI0YWkXZUoHNRx7c2yNytl++utj0WgTKxoyXM8JWEhp13e/81sxXlBPD5K5+mDxW/4aFazVv2/qv1ASQ4FTOCCt7y8M/JnpxlCpppWhLoqXR5JZKL3qYXf0AXwBj2LdAljIgnMOI7VoerLNjk2LN89cLnXu+X1DEDFGAt4WACPmgOOtWSSsD0Yksh5Z75ZaDsEwtNxi8US2CZ1P3vdfzxKiUbO6RFbipz1zR2BJbyedHxE+1aKylgfgKPG8MW92ajjvkcsOKtE8ttiwQraV1L6buZ+/nWclkE8JpTSm2VmBB3PEtBNBUFmsTaWkgOiRpRoQ9I1OBGdf1jXHbbtm3ttZJRhdT3/OyoZZjdu6y/cVNBaHgjNVKPmGIezVpr8fLUEPFY3kHRdmXqETF198CzLevMZQ816qBWtavVz7Htv44fwKwtpIfTXI2b3x+DwPxMPEGOd4Z6UkbM6Y/dGKrAcclwHisYluJEeaVexpgqzyPVfd5RDmLNhbkzIyzl4F4sZwnMum5YgZ8/Dt5UzMDLrjH8o/TCxt8Nle74HGTXYrTWFR8FC9Up17J7Gs9v1WQkk3j7GUgnnf9iFCfLvMMSz+mkql88NveA/tjUHfweciBQxUVguWOQzDsE7bPlc2NXFrfZZven9/LyZJ5eUtekCxWyzOUchN8nAupmwj23QYX6CG5hUXBGUavysMl7wO9IYhoWRoDa841elHc9jYQyntGBbQDr69ScIJocxHBUJl0EsYcMDM5Mb3HAgvmwCqxbapg364xXS4inl1B8LepfUDRbgHfKQzEl/eFFV8NyzFA3pyMZDVZIP8qXdl+2TrsUwT2YL9Au3mH9rmNOq8H5znb7dbZpN4r8atuY53CQChL2P/FJZyo5zQMxoJw2LZrriLL0rlr9Wu5jVg3ZmA8sHC5LrYtgrSjCdEmVKKzBqSzlN+WInkLjq84z7ykE1MZiD7ZKvGcAAtmxHYLNKQ3Q2Omb+vuwcght4GhAB/6yw1ZWhXLeCVl+eGg8pcnyqF77sKpgZIU93FrgSKX1dpVpjQQA4GRqckrsJ/m3Zoq36KX8r04vqxSYVd/fTh8Ff1UPvKXb/9QRYUqRWDNV2sRw7l160bXtTe1gehDlp1x1X/IV9utuXi3ppinQ3uGBDo8zpkUiF1jtaXitZqEjX8fBkIBDxoYQnYpY9N/t4KI1PesXpXt26nf59Asq7IHbN+qaqs+Gah1XwbiJVICTVwhK5Rly8Zzs8g8NGA+cYhlz5nbRjElacSF/dingbQwEm3gT0LD06Mm3jxeu/n3QmxI0c7RhWkSQ4JmaJkzMqoL+zYQnYSerUXwcnfKgDtmsulRE7qHi3jnpDA3y8FYM4a91W6Zg4G0OJNoQ4wE7Y3I/SLTaADzoRW8p4DICBTvReZiIAZv//qIJLhxpTz71EcNhG4CaYv00QCUtlp/2ZSGsb1C4qD6Fbf3XmROBkIBmEYs17WHPFstXzf+8kXaasAcwXjVVKQa0yNZjgKMVbQ9Yx607Zq5GYi+4qxCwNaCT/aXI+KuEzI41s7HnO9/54h4TER83gSdFOuQ3fmaCZ619RFzNBAdVmjHy90iV5k7GMMe1pRTrmKbfde8I5KRIGaVJOgtyq0xjpf3ftCY9udqIPpuCUfdgjC5hfzxkPh0aOULWow92wYChEd2QOFu6g9HC7xdz5JuRbqYs4EYiP5Je8Wi3qqvkK9WFCC6RdZrwMotyeo2EyoICNOhfypC81FDa/XSjXpYxUUSlIAcW6a8yiW47wEWxKlQ485bwUOw0igUNKXgxbJT2OuBfN2AD8VA9B2l/88O1Y1aTp58CivKKcdPkLdhxvycJBHmBuoAAAOsSURBVH1szXxgwEFivg/aoZ39PiQDWQ2mJQP4WQXxuYuhYBY8lRiKctlWDGeNfcjeIuRjB3uIBmJsYNTYOVp4uc7rSlaethXGcV45NlEuAbRHYLa2VHZWN7yJVizAxlnLoRoIpZro7+sMkJO5Z1WR29A1tbPzW4IXwDYGXg3n2D4Ft4AzpRz12cshG8hKuTLWfO1LU1lLJwdvrQw5P6nDc8z/PjsmcBBRb9soCWYtKtyW6uz89bgFkMbNylO1bVDHYCCr8SGedti+dO0sjrzf4RJ7CHcxQop9CycGaAZjkFQk625OYtuKAWaK6sbNxn1MBkIpVxgCW7dspqFxDVlNBCLlzL90+MES+WL2ANohgZDWiikEi4pVdIoo9zhtXPKqLx9W+ez9e7vv2AxkpUg1/ADqeqR9lk6W3GkpwkiiYYv8Vd6Mp8x/89dvVccQD7Dtkb774d7yv/193wrqpNJ+t7herQ7YrYNNjT5WAzG5CLTRwrSCqrR4YU6pDdg3LuSDlmM2kNXECC7y3iwyjQaskF92LAiFUzAQrwViB27ORfpqAFuNQO4so+KZoZ+KgSAVQJyM6XCR9hoA0xF8BDg8KjkVAzFpgmXqSPSOlxzVC7JjMLZTKoJx4R6lnJKBmEDcuDwrLYu3HOWLsWNQouG2U7jNjmY7tW7Mp2YgdOAsspDN5cyaMSDWeMBU1J+5bra76xQNhPbkgYi6LzJeA+JKdHboxOHjR9wwS6/ooTO5GHsKHq1FNmtAUZ4fGSr+vuIUFXWqK4i5Bt5DDHHjU5z4HWNGdAEAqn76odRj6TKNp2wgFKqGBdAhcrJFLkDZ2kpJI5hd+us+JujUDWRlJJg7UNucoqiz8sSIeMJMUMmzmoPFQC6aDvnY8EMAgccuQJMolcQvEH8vskEDi4FcXDG2XFJR7zyDqrWtX1reJ1SsVgoFPxcZoYHFQDYr6UoDElgCEr6mOUDnR0zphZfIQ1Ho0wrxlKEabsn9y7Un7uYtfQFk6OENhufy72uXNtDxenklErZeNBiFv7NhJ+w47u5NLytInYpl9F0zIq41GA2WkCvXNbn1bl4mgEBZiwzAT678Ujiok9IXA+mjWMla0n+vOPyVDoutHjOknHm/1b9lEMrTFnvwd/VvJaAxqTAKv5MM1PWZnvGtLgYyXlfLlSeogcVATnDSlyGP18BiION1tVx5ghpYDOQEJ30Z8ngNLAYyXlfLlSeogcVATnDSlyGP18BiION1tVx5ghr4f2cE1xQcHd/hAAAAAElFTkSuQmCC',
  playIcon: "data:image/png;base64,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",
  parseIcon: "data:image/png;base64,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",
  // 暂停
  timeout: function timeout() {
    console.log('暂停');
    clearInterval(replay.player);
    replay.player = null;
    return true;
  },
  // 停止
  suspend: function suspend() {
    console.log('停止');
    this.playing = false;
    clearInterval(replay.player);
    replay.player = null;
    replay.playPosition = 0;
    replay.playDataIndex = 0;
    replay.playIconEle.style.display = "block";
    replay.parseIconEle.style.display = "none";
    return true;
  },
  // 前进
  forward: function forward() {},
  // 后退
  backoff: function backoff() {}
}; // const playdata = [{ "id": 3, "time": 1595829579674, "duration": 5415, "type": "scroll", "pointer": { "left": 272, "top": 788.7999877929688 } }, { "id": 5, "time": 1595829579892, "duration": 5633, "type": "touchend", "pointer": { "left": 272, "top": 788.7999877929688 } }, { "id": 1, "time": 1595829579897, "duration": 5638, "pointer": { "left": 200, "top": 793 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(2) > div:nth-child(2) > span", "type": "click" }, { "id": 3, "time": 1595829581001, "duration": 6742, "type": "scroll", "pointer": { "left": 372, "top": 776.7999877929688 } }, { "id": 5, "time": 1595829581220, "duration": 6961, "type": "touchend", "pointer": { "left": 372, "top": 776.7999877929688 } }, { "id": 1, "time": 1595829581224, "duration": 6965, "pointer": { "left": 321, "top": 779 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(3) > div:nth-child(1) > img:nth-child(1)", "type": "click" }, { "id": 3, "time": 1595829582560, "duration": 8301, "type": "scroll", "pointer": { "left": 262.3999938964844, "top": 782.4000244140625 } }, { "id": 5, "time": 1595829582779, "duration": 8520, "type": "touchend", "pointer": { "left": 262.3999938964844, "top": 782.4000244140625 } }, { "id": 1, "time": 1595829582786, "duration": 8527, "pointer": { "left": 188, "top": 786 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(2) > div:nth-child(1) > img:nth-child(1)", "type": "click" }, { "id": 3, "time": 1595829583749, "duration": 9490, "type": "scroll", "pointer": { "left": 152.8000030517578, "top": 783.2000122070312 } }, { "id": 5, "time": 1595829583967, "duration": 9708, "type": "touchend", "pointer": { "left": 152.8000030517578, "top": 783.2000122070312 } }, { "id": 1, "time": 1595829583974, "duration": 9715, "pointer": { "left": 54, "top": 787 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(1) > div:nth-child(1) > img:nth-child(1)", "type": "click" }, { "id": 3, "time": 1595829585391, "duration": 11132, "type": "scroll", "pointer": { "left": 352.8000183105469, "top": 393.6000061035156 } }, { "id": 5, "time": 1595829585595, "duration": 11336, "type": "touchend", "pointer": { "left": 352.8000183105469, "top": 393.6000061035156 } }, { "id": 1, "time": 1595829585600, "duration": 11341, "pointer": { "left": 308, "top": 314 }, "domPath": "div#app > div:nth-child(2) > div#app-mall > div:nth-child(4) > div:nth-child(1) > a:nth-child(2) > span", "type": "click" }, { "id": 3, "time": 1595829587886, "duration": 13627, "type": "scroll", "pointer": { "left": 280.8000183105469, "top": 552 } }, { "id": 4, "time": 1595829588105, "duration": 13846, "type": "touchmove", "pointer": { "left": 285.6000061035156, "top": 532 } }, { "id": 5, "time": 1595829588634, "duration": 14375, "type": "touchend", "pointer": { "left": 351.20001220703125, "top": 257.6000061035156 } }, { "id": 3, "time": 1595829594195, "duration": 19936, "type": "scroll", "pointer": { "left": 292, "top": 356 } }, { "id": 5, "time": 1595829594404, "duration": 20145, "type": "touchend", "pointer": { "left": 292, "top": 356 } }, { "id": 1, "time": 1595829594408, "duration": 20149, "pointer": { "left": 224, "top": 266 }, "domPath": "div#app > div:nth-child(2) > div#app-list > div:nth-child(2) > div:nth-child(2) > div#cmp-card > div:nth-child(1) > img", "type": "click" }, { "id": 3, "time": 1595829597447, "duration": 23188, "type": "scroll", "pointer": { "left": 267.20001220703125, "top": 314.3999938964844 } }, { "id": 5, "time": 1595829597659, "duration": 23400, "type": "touchend", "pointer": { "left": 267.20001220703125, "top": 314.3999938964844 } }, { "id": 1, "time": 1595829597665, "duration": 23406, "pointer": { "left": 194, "top": 215 }, "domPath": "div#app > div:nth-child(2) > div:nth-child(1) > div > div#cmp-group > div#cmp-input > div > div:nth-child(2) > div > input", "type": "click" }, { "id": 7, "time": 1595829599066, "duration": 24807, "type": "input" }, { "id": 7, "time": 1595829599386, "duration": 25127, "type": "input" }, { "id": 7, "time": 1595829599646, "duration": 25387, "type": "input" }, { "id": 7, "time": 1595829599888, "duration": 25629, "type": "input" }, { "id": 7, "time": 1595829600036, "duration": 25777, "type": "input" }, { "id": 6, "time": 1595829602558, "duration": 28299, "type": "change" }]
var play = replay.play;
var playInit = replay.playInit;
var timeout = replay.timeout;
var suspend = replay.suspend;
var forward = replay.forward;
var backoff = replay.backoff;

export { start, stop, startEventListener, generateRecord, recordArr, requestArr, handler, events, play, playInit, timeout, suspend, forward, backoff };
