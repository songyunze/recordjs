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
        , { id: 9, event: 'pushState', target: window }, { id: 10, event: 'replaceState', target: window }, { id: 11, event: 'request', target: window }
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
        this.endtime = new Date().getTime();
        this.duration = this.endtime - this.starttime;
        this.events.forEach(ele => {
            ele.target.removeEventListener(ele.event, this.handler[ele.event]);
        })
    },
    startEventListener(): void {
        this.events.forEach(ele => {
            ele.target.addEventListener(ele.event, this.handler[ele.event].bind(this));
        })
        window.addEventListener('xhrRequest', this.addRequest)
    },
    generateRecord(id: number): Record {
        const now = new Date().getTime();
        let record = <Record>{
            id,
            time: now,
            duration: now - this.starttime
        }
        return record;
    },
    handler: {
        // click 处理函数
        'click': function (e: any) {
            const record = Generate.generateRecord(1);
            // click 事件的信息收集
            record.pointer = { left: e.clientX, top: e.clientY }
            record.domPath = Generate.getDompath(e.target)
            record.type = 'click'
            recordArr.push(record)
        },
        'scroll': throttle((e: any) => {
            const record = Generate.generateRecord(2);
            // scroll 事件的信息收集
            // record.type = 'scroll'
            // recordArr.push(record)
        }),
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
            const record = Generate.generateRecord(6);
            // touchstart 事件的信息收集
            record.type = 'change'
            recordArr.push(record)
        },
        'input': function (e: any) {
            const record = Generate.generateRecord(7);
            // touchstart 事件的信息收集
            record.type = 'input'
            recordArr.push(record)
        },
        // 浏览器回退/前进等事件
        'onpopstate': function (e: any) {
            const record = Generate.generateRecord(8);
            // touchstart 事件的信息收集
            record.type = 'onpopstate'
            recordArr.push(record)
        },
        // 浏览器跳入新路由事件
        'pushState': function (e: any) {
            const record = Generate.generateRecord(9);
            // touchstart 事件的信息收集
            record.type = 'pushState'
            recordArr.push(record)
        },
        // 浏览器替换路由事件
        'replaceState': function (e: any) {
            const record = Generate.generateRecord(10);
            // touchstart 事件的信息收集
            record.type = 'replaceState'
            recordArr.push(record)
        },
        'request': function (e: any) {
            const { custom, responseText, status } = e.arguments;

            this.requestArr.push({
                options: custom.options, responseText, status
            })
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
        return e.slice(1).join(" ").substring(2);
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

interface Record {
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
    }
}

Generate.start()

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
