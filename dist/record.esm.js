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
    responseHeaders: {}
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

    if (this.match) {
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
    if (this.match) {
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
    this.custom.options.body = data; // 这里可以拿到请求信息           

    if (this.match) {
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

      that.response = that.responseText = "asdfjiwe";
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
    event: 'onpopstate',
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
    history.replaceState = _wr('replaceState');
    window.addEventListener('pushState', function (e) {
      var path = e && e.arguments.length > 2 && e.arguments[2];
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;
      console.log('old:' + location.href, 'new:' + url);
    });
    window.addEventListener('replaceState', function (e) {
      var path = e && e.arguments.length > 2 && e.arguments[2];
      var url = /^http/.test(path) ? path : location.protocol + '//' + location.host + path;
      console.log('old:' + location.href, 'new:' + url);
    }); // focus 变化部分

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
    'touchstart': throttle(function (e) {
      var record = Generate.generateRecord(3); // touchstart 事件的信息收集

      record.type = 'scroll';
      record.pointer = {
        left: e.touches[0].screenX,
        top: e.touches[0].screenY
      };
      recordArr.push(record);
    }),
    'touchmove': throttle(function (e) {
      var record = Generate.generateRecord(4); // scroll 事件的信息收集
      // record.type = 'scroll'

      record.type = 'touchmove';
      console.log(e.touches);
      record.pointer = {
        left: e.touches[0].screenX,
        top: e.touches[0].screenY
      };
      recordArr.push(record);
    }),
    'touchend': throttle(function (e) {
      var record = Generate.generateRecord(5); // touchstart 事件的信息收集

      record.type = 'touchend';
      record.pointer = {
        left: e.changedTouches[0].screenX,
        top: e.changedTouches[0].screenY
      };
      recordArr.push(record);
    }),
    'change': function change(e) {
      var record = Generate.generateRecord.bind(this)(6); // touchstart 事件的信息收集

      record.type = 'change';
      recordArr.push(record);
    },
    'input': function input(e) {
      var _this4 = this;

      if (!this.handler.inputtacking) {
        window.requestAnimationFrame(function () {
          var record = Generate.generateRecord.bind(_this4)(7);
          record.domPath = Generate.getDompath(e.target); // console.log(e.target.scrollingElement.scrollTop,e.target.scrollingElement.scrollLeft)
          // scroll 事件的信息收集

          record.type = 'input';
          record.value = e.target.value;
          recordArr.push(record); // console.log(record)

          _this4.handler.inputtacking = false;
        });
        this.handler.inputtacking = true;
      }
    },
    // 浏览器回退/前进等事件
    'onpopstate': function onpopstate(e) {
      var record = Generate.generateRecord.bind(this)(8); // touchstart 事件的信息收集

      record.type = 'onpopstate';
      recordArr.push(record);
    },
    // 浏览器跳入新路由事件
    'pushState': function pushState(e) {
      var record = Generate.generateRecord.bind(this)(9); // touchstart 事件的信息收集

      record.type = 'pushState';
      recordArr.push(record);
    },
    // 浏览器替换路由事件
    'replaceState': function replaceState(e) {
      var record = Generate.generateRecord.bind(this)(10); // touchstart 事件的信息收集

      record.type = 'replaceState';
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

function throttle(fn) {
  var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
  var timer = 0;
  return function () {
    var context = this;
    var args = arguments;
    var now = new Date().valueOf();

    if (now - timer >= wait) {
      fn.apply(context, args);
      timer = now;
    }
  };
}
var start = Generate.start;
var stop = Generate.stop;
var startEventListener = Generate.startEventListener;
var generateRecord = Generate.generateRecord;
var recordArr = Generate.recordArr;
var requestArr = Generate.requestArr;
var handler = Generate.handler;
var events = Generate.events;

var replay = {
  replayClick: function replayClick(item) {
    var event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
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
    document.querySelector(item.domPath).focus();
  },
  // 初始化
  playInit: function playInit(record) {
    this.playData = record;
  },
  // 视频长度
  playTimer: 600000,
  // 播放队列
  playdata: [],
  // 帧数
  NFS: 60,
  // 当前播放位置
  playPosition: 0,
  // 播放到的操作位
  playDataIndex: 0,
  player: null,
  // 播放
  play: function play() {
    var playdata = this.recordArr;

    if (replay.player) {
      return replay.player;
    } else {
      replay.player = setInterval(function () {
        // 找不到下一个要播放的记录则结束播放
        if (!playdata[replay.playDataIndex]) {
          clearInterval(replay.player);
          replay.player = null;
          return;
        }

        if (playdata[replay.playDataIndex].duration - replay.playPosition <= 1000 / replay.NFS) {
          // console.log(,replay.playDataIndex)
          var item = playdata[replay.playDataIndex];

          switch (item.type) {
            case "click":
              replay.replayClick(item);
              break;

            case "scroll":
              replay.replayScroll(item);
              break;

            case "input":
              replay.replayInput(item);

            case "focuschange":
              replay.replayFocus(item);
          }

          replay.playDataIndex = replay.playDataIndex + 1;
        } else {
          console.log('wait');
        }

        replay.playPosition = replay.playPosition + 1000 / replay.NFS;
      }, 1000 / replay.NFS);
    }
  },
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
    clearInterval(replay.player);
    replay.player = null;
    replay.playPosition = 0;
    replay.playDataIndex = 0;
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
