import { recordArr } from "../generate"

var Util:any = {}

Util.extend = function extend() {
    var target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        options, name, src, copy, clone

    if (length === 1) {
        target = this
        i = 0
    }

    for (; i < length; i++) {
        options = arguments[i]
        if (!options) continue

        for (name in options) {
            src = target[name]
            copy = options[name]

            if (target === copy) continue
            if (copy === undefined) continue

            if (Util.isArray(copy) || Util.isObject(copy)) {
                if (Util.isArray(copy)) clone = src && Util.isArray(src) ? src : []
                if (Util.isObject(copy)) clone = src && Util.isObject(src) ? src : {}

                target[name] = Util.extend(clone, copy)
            } else {
                target[name] = copy
            }
        }
    }

    return target
}
Util.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};

Util.isObject = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Object]';
};

// 备份原生 XMLHttpRequest
(window as any)._XMLHttpRequest = window.XMLHttpRequest;
(window as any )._ActiveXObject = window.ActiveXObject;

/*
    PhantomJS
    TypeError: '[object EventConstructor]' is not a constructor (evaluating 'new Event("readystatechange")')

    https://github.com/bluerail/twitter-bootstrap-rails-confirm/issues/18
    https://github.com/ariya/phantomjs/issues/11289
*/
try {
    new window.Event('custom')
} catch (exception) {
    (window as any).Event = function(type, bubbles, cancelable, detail) {
        var event = document.createEvent('CustomEvent') // MUST be 'CustomEvent'
        event.initCustomEvent(type, bubbles, cancelable, detail)
        return event
    }
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
}

var XHR_EVENTS = 'readystatechange loadstart progress abort error load timeout loadend'.split(' ')
var XHR_REQUEST_PROPERTIES = 'timeout withCredentials'.split(' ')
var XHR_RESPONSE_PROPERTIES = 'readyState responseURL status statusText responseType response responseText responseXML'.split(' ')

// https://github.com/trek/FakeXMLHttpRequest/blob/master/fake_xml_http_request.js#L32
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
}

/*
    CpicXMLHttpRequest
*/

function CpicXMLHttpRequest() {
    // 初始化 custom 对象，用于存储自定义属性
    this.custom = {
        events: {},
        requestHeaders: {},
        responseHeaders: {},
        responseText:""
    }
}

CpicXMLHttpRequest.prototype.match = false


Util.extend(CpicXMLHttpRequest, XHR_STATES)
Util.extend(CpicXMLHttpRequest.prototype, XHR_STATES)

// 初始化 Request 相关的属性和方法
Util.extend(CpicXMLHttpRequest.prototype, {
    // https://xhr.spec.whatwg.org/#the-open()-method
    // Sets the request method, request URL, and synchronous flag.
    open: function(method, url, async, username, password) {
        var that = this

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
        })

        function handle(event) {
            // 同步属性 NativeXMLHttpRequest => CpicXMLHttpRequest
            for (var i = 0; i < XHR_RESPONSE_PROPERTIES.length; i++) {
                try {
                    that[XHR_RESPONSE_PROPERTIES[i]] = xhr[XHR_RESPONSE_PROPERTIES[i]]
                } catch (e) {}
            }
            if (event.type === 'readystatechange'&&that.readyState === 4) {
                // 这里可以拿到返回信息 需要捕获存储
                // var responseData = that.responseText
                // if()
                console.log(that)
                var ev:any = new Event("request")
                ev.arguments = that;
                window.dispatchEvent(ev)
            }
            // console.log(that)
            // 触发 CpicXMLHttpRequest 上的同名事件
            that.dispatchEvent(new Event(event.type /*, false, false, that*/ ))
            
        }
        if(Record.playing){
           var idx =  Record.requestArr.findIndex( ele => {
                ele.options.url == url && ele.options.type == method;
            } )
            var customResponse = Record.requestArr.splice(idx,1)[0]||{};
            this.custom.responseText = customResponse.responseText;
            this.readyState = (CpicXMLHttpRequest as any).OPENED
            this.dispatchEvent(new Event('readystatechange' /*, false, false, this*/ ))
            return ;
        }

        // 创建原生 XHR 对象，调用原生 open()，监听所有原生事件
        var xhr = createNativeXMLHttpRequest()
        this.custom.xhr = xhr

        // 初始化所有事件，用于监听原生 XHR 对象的事件
        for (var i = 0; i < XHR_EVENTS.length; i++) {
            xhr.addEventListener(XHR_EVENTS[i], handle)
        }

        // xhr.open()
        if (username) xhr.open(method, url, async, username, password)
        else xhr.open(method, url, async)

        // 同步属性 CpicXMLHttpRequest => NativeXMLHttpRequest
        for (var j = 0; j < XHR_REQUEST_PROPERTIES.length; j++) {
            try {
                xhr[XHR_REQUEST_PROPERTIES[j]] = that[XHR_REQUEST_PROPERTIES[j]]
            } catch (e) {}
        }
    },
    setRequestHeader: function(name, value) {
        if(Record.playing){
            var requestHeaders = this.custom.requestHeaders
            if (requestHeaders[name]) requestHeaders[name] += ',' + value
            else requestHeaders[name] = value
            return ;
        }
        // 原生 XHR
        this.custom.xhr.setRequestHeader(name, value)
    },
    timeout: 0,
    withCredentials: false,
    upload: {},
    send: function send(data) {
        var that = this
        this.custom.options.body = data
        // console.log(Record.requestArr)
        // 这里可以拿到请求信息           
        if(Record.playing){
            // 走到mock环节
            // X-Requested-With header
            this.setRequestHeader('X-Requested-With', 'MockXMLHttpRequest')

            // loadstart The fetch initiates.
            this.dispatchEvent(new Event('loadstart' /*, false, false, this*/ ))
            done()
            return ;
        }
        function done() {
            
            console.log((CpicXMLHttpRequest as any).HEADERS_RECEIVED)
            that.readyState = (CpicXMLHttpRequest as any).HEADERS_RECEIVED
            that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ))
            that.readyState = (CpicXMLHttpRequest as any ).LOADING
            that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ))

            that.status = 200
            that.statusText = HTTP_STATUS_CODES[200]

            // fix #92 #93 by @qddegtya
            that.response = that.responseText = that.custom.responseText

            that.readyState = (CpicXMLHttpRequest as any).DONE
            that.dispatchEvent(new Event('readystatechange' /*, false, false, that*/ ))
            that.dispatchEvent(new Event('load' /*, false, false, that*/ ));
            that.dispatchEvent(new Event('loadend' /*, false, false, that*/ ));
        }
        // 原生 XHR
        this.custom.xhr.send(data)
    },
    abort: function abort() {
        // 原生 XHR
        this.custom.xhr.abort()
    },
    mockData: function mock(arr){
        this.custom.requestArr = arr;
    }
})

// 初始化 Response 相关的属性和方法
Util.extend(CpicXMLHttpRequest.prototype, {
    responseURL: '',
    status: (CpicXMLHttpRequest as any ).UNSENT,
    statusText: '',
    // https://xhr.spec.whatwg.org/#the-getresponseheader()-method
    getResponseHeader: function(name) {
        // 原生 XHR
        return this.custom.xhr.getResponseHeader(name)

    },
    // https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
    // http://www.utf8-chartable.de/
    getAllResponseHeaders: function() {
        // 原生 XHR
        return this.custom.xhr.getAllResponseHeaders()
    },
    overrideMimeType: function( /*mime*/ ) {},
    responseType: '', // '', 'text', 'arraybuffer', 'blob', 'document', 'json'
    response: null,
    responseText: '',
    responseXML: null
})

// EventTarget
Util.extend(CpicXMLHttpRequest.prototype, {
    addEventListener: function addEventListener(type, handle) {
        var events = this.custom.events
        if (!events[type]) events[type] = []
        events[type].push(handle)
    },
    removeEventListener: function removeEventListener(type, handle) {
        var handles = this.custom.events[type] || []
        for (var i = 0; i < handles.length; i++) {
            if (handles[i] === handle) {
                handles.splice(i--, 1)
            }
        }
    },
    dispatchEvent: function dispatchEvent(event) {
        var handles = this.custom.events[event.type] || []
        for (var i = 0; i < handles.length; i++) {
            handles[i].call(this, event)
        }

        var ontype = 'on' + event.type
        if (this[ontype]) this[ontype](event)
    }
})

// Inspired by jQuery
function createNativeXMLHttpRequest() {
    var isLocal = function() {
        var rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/
        var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/
        var ajaxLocation = location.href
        var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
        return rlocalProtocol.test(ajaxLocParts[1])
    }()

    return window.ActiveXObject ?
        (!isLocal && createStandardXHR() || createActiveXHR()) : createStandardXHR()

    function createStandardXHR() {
        try {
            return new (window as any)._XMLHttpRequest();
        } catch (e) {}
    }

    function createActiveXHR() {
        try {
            return new (window as any)._ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
    }
}

(window as any).XMLHttpRequest = CpicXMLHttpRequest;

export default CpicXMLHttpRequest;