const Generate = {
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
    events: [{ id: 1, event: 'click', target: document.documentElement }, { id: 2, event: 'scroll', target: window }, { id: 3, event: 'touchstart', target: document.documentElement }, { id: 4, event: 'touchmove', target: document.documentElement }, { id: 5, event: 'touchend', target: document.documentElement }, { id: 6, event: 'change', target: document.documentElement }, { id: 7, event: 'input', target: document.documentElement }, { id: 8, event: 'onpopstate', target: window },
        , { id: 9, event: 'pushState', target: window }, { id: 10, event: 'replaceState', target: window }, { id: 11, event: 'request', target: window }, { id: 11, event: 'focuschange', target: window }
    ],
    /**
     *  收集用户操作信息
     * @date 2020-07-23
     * @returns {void}
     */
    start(): void {
        // 记录收集信息时间
        this.starttime = new Date().getTime();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // 开启事件侦听
        this.startEventListener();
    },
    stop(): void {
      console.log("stop")
      // console.log(this)
      // 清除focuschange事件
        clearInterval(this.handler.focustimer)
        this.endtime = new Date().getTime();
        this.duration = this.endtime - this.starttime;
        this.events.forEach(ele => {
          // console.log(this.handler)
            ele.target.removeEventListener(ele.event, this.handler[ele.event]);
        })
    },
    startEventListener(): void {
      // 初始化自定义事件
      // 路由变化部分
        var _wr = function(type) {
          var orig = history[type];
          return function() {
            var e:any = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            // 注意事件监听在url变更方法调用之前 也就是在事件监听的回调函数中获取的页面链接为跳转前的链接
            var rv = orig.apply(this, arguments);
            return rv;
          };
        };
        history.pushState = _wr('pushState');
        history.replaceState = _wr('replaceState');
        window.addEventListener('pushState', function(e:any) {
          var path = e && e.arguments.length > 2 && e.arguments[2];
          var url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
          console.log('old:'+location.href,'new:'+url);
        });
        window.addEventListener('replaceState', function(e:any) {
          var path = e && e.arguments.length > 2 && e.arguments[2];
          var url = /^http/.test(path) ? path : (location.protocol + '//' + location.host + path);
          console.log('old:'+location.href,'new:'+url);
        });

        // focus 变化部分
        let prevActive = document.activeElement;
        this.handler.focustimer = setInterval(()=>{
          if(document.activeElement !== prevActive){
            // console.log("focuschange",document.activeElement)
            prevActive = document.activeElement;
            var e:any = new Event("focuschange");
            e.arguments = {
              target:document.activeElement
            }
            window.dispatchEvent(e)
          }
        },30)

        this.events.forEach(ele => {
            // console.log()
            this.handler[ele.event] =  this.handler[ele.event].bind(this)
            this.handler[`${ele.event}tacking`] = false;
            ele.target.addEventListener(ele.event, this.handler[ele.event]);
        })
        window.addEventListener('xhrRequest', this.addRequest)
    },
    generateRecord(id: number): Record {
        const now = new Date().getTime();
        let record = <Record>{
            id,
            time: now,
            duration: (now - this.starttime)
        }
        return record;
    },
    handler: {
        // click 处理函数
        'click': function (e: any) {
            const record = Generate.generateRecord.bind(this)(1);
            // click 事件的信息收集
            record.pointer = { left: e.clientX, top: e.clientY }
            record.domPath = Generate.getDompath(e.target)
            record.type = 'click'
            console.log(record)
            recordArr.push(record)
        },
        'scroll': function (e:any) {
            if (!this.handler.scrolltacking) {
              window.requestAnimationFrame(() => {
                const record = Generate.generateRecord.bind(this)(2);
                record.domPath = Generate.getDompath(e.target.scrollingElement)
                // console.log(e.target.scrollingElement.scrollTop,e.target.scrollingElement.scrollLeft)
                // scroll 事件的信息收集
                record.type = 'scroll'
                record.scroll = {
                  left:e.target.scrollingElement.scrollLeft,
                  top:e.target.scrollingElement.scrollTop
                }
                recordArr.push(record)
                console.log(record)
                this.handler.scrolltacking = false;
              });
          
              this.handler.scrolltacking = true;
            }
            
        },
        'touchstart': throttle((e: any) => {
            const record = Generate.generateRecord(3);
            // touchstart 事件的信息收集
            record.type = 'scroll'
            record.pointer = {
                left: e.touches[0].screenX,
                top: e.touches[0].screenY 
            }
            recordArr.push(record)

        }),
        'touchmove': throttle((e: any) => {
            const record = Generate.generateRecord(4);
            // scroll 事件的信息收集
            // record.type = 'scroll'
            record.type = 'touchmove'
            console.log(e.touches)
            record.pointer = {
                left: e.touches[0].screenX,
                top: e.touches[0].screenY 
            }
            recordArr.push(record)
        }),
        'touchend': throttle((e: any) => {
            const record = Generate.generateRecord(5);
            // touchstart 事件的信息收集
            record.type = 'touchend'
            record.pointer = {
                left: e.changedTouches[0].screenX,
                top: e.changedTouches[0].screenY 
            }
            recordArr.push(record)
        }),
        'change': function (e: any) {
            const record = Generate.generateRecord.bind(this)(6);
            // touchstart 事件的信息收集
            record.type = 'change'
            recordArr.push(record)
        },
        'input': function (e: any) {
            if (!this.handler.inputtacking) {
              window.requestAnimationFrame(() => {
                const record = Generate.generateRecord.bind(this)(7);
                record.domPath = Generate.getDompath(e.target)
                // console.log(e.target.scrollingElement.scrollTop,e.target.scrollingElement.scrollLeft)
                // scroll 事件的信息收集
                record.type = 'input'
                record.value = e.target.value
                recordArr.push(record)
                // console.log(record)
                this.handler.inputtacking = false;
              });
          
              this.handler.inputtacking = true;
            }
        },
        // 浏览器回退/前进等事件
        'onpopstate': function (e: any) {
            const record = Generate.generateRecord.bind(this)(8);
            // touchstart 事件的信息收集
            record.type = 'onpopstate'
            recordArr.push(record)
        },
        // 浏览器跳入新路由事件
        'pushState': function (e: any) {
            const record = Generate.generateRecord.bind(this)(9);
            // touchstart 事件的信息收集
            record.type = 'pushState'
            recordArr.push(record)
        },
        // 浏览器替换路由事件
        'replaceState': function (e: any) {
            const record = Generate.generateRecord.bind(this)(10);
            // touchstart 事件的信息收集
            record.type = 'replaceState'
            recordArr.push(record)
        },
        'request': function (e: any) {
            const { custom, responseText, status } = e.arguments;

            this.requestArr.push({
                options: custom.options, responseText, status
            })
        },
        'focuschange': function (e:any) {
          // console.log(e)
          const record = Generate.generateRecord.bind(this)(12);
          // touchstart 事件的信息收集
          record.domPath = Generate.getDompath(e.arguments.target)
          record.type = 'focuschange'
          console.log(record)
          recordArr.push(record)
        }
    },
    getDompath(ele: HTMLElement) {
        let t: HTMLElement = ele;
        for (var e = []; null != t.parentElement;) {
            for (var n = 0, i = 0, a = 0; a < t.parentElement.childNodes.length; a += 1) {
                var r = t.parentElement.childNodes[a];
                (r === t && (i = n), n += 1)
            }
            var o = "> " + t.nodeName.toLowerCase();
            t.hasAttribute("id") && "" !== t.id ? e.unshift(o + "#" + t.id) : n > 1 ? e.unshift(o + ":nth-child(" + (i + 1) + ")") : e.unshift(o),
                t = t.parentElement
        }
        return e.slice(1).join(" ").substring(2) || "html";
    }

}

// 节流函数
function throttle(fn, wait = 1000) {
    let timer = 0
    return function () {
        let context = this
        let args = arguments
        let now = new Date().valueOf()
        if (now - timer >= wait) {
            fn.apply(context, args)
            timer = now
        }
    }
}

interface EventType {
    id?: number,
    event: string,
    target: Element | Window
}

export interface Record {
    /** 触发记录事件的id */
    id: number,
    /** 事件戳 */
    time: number,
    /** 距离记录开始时间 */
    duration: number,
    /** 触发事件的元素路径，如果有 */
    domPath?: string,
    /** 触发的事件信息 */
    event?: any
    /** 触发的事件类型 */
    type?: any
    /** 触发事件引起的值改变 */
    value?: any,
    /** 事件触发时鼠标/标记所在位置 */
    pointer?: {
        left: number,
        top: number
    },
    scroll?:{
        left:number,
        top:number
    }
}

// Generate.start()

export default Generate
export const start = Generate.start;
export const stop = Generate.stop;
export const startEventListener = Generate.startEventListener;
export const generateRecord = Generate.generateRecord;
export const recordArr = Generate.recordArr;
export const requestArr = Generate.requestArr;
export const handler = Generate.handler;
export const events = Generate.events;
export * from "../lib/xhr";
