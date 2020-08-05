import {Record} from '../generate'
const replay = {
    replayClick(item:Record): void {
        let event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
        });
        document.querySelector(item.domPath).dispatchEvent(event)
    },
    replayScroll(item:Record): void {
        // console.log(item)
        document.querySelector(item.domPath).scrollTo({
            left:item.scroll.left,
            top:item.scroll.top
        })
    },
    replayTouch(): void {

    },
    replayChange(): void { },

    replayInput(item:Record):void{
        (document.querySelector(item.domPath) as any).value = item.value;
    },
    replayFocus(item:Record):void{
        (document.querySelector(item.domPath) as any).focus();
    },

    // 初始化
    playInit(record:Record[]): void {
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
    play(): any {
        const playdata = this.recordArr
        if (replay.player) {
            return replay.player
        } else {
            replay.player = setInterval(() => {
                // 找不到下一个要播放的记录则结束播放
                if(!playdata[replay.playDataIndex]){
                    clearInterval(replay.player)
                    replay.player = null
                    return
                }
                if (playdata[replay.playDataIndex].duration - replay.playPosition <= (1000 / replay.NFS)) {
                    // console.log(,replay.playDataIndex)
                    const item = playdata[replay.playDataIndex]
                    switch(item.type){
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
                    replay.playDataIndex = replay.playDataIndex + 1
                } else {
                    console.log('wait')
                }
                replay.playPosition = replay.playPosition + (1000 / replay.NFS)
            }, 1000 / replay.NFS)
        }

    },

    // 暂停
    timeout(): boolean {
        console.log('暂停')
        clearInterval(replay.player)
        replay.player = null
        return true
    },

    // 停止
    suspend(): boolean {
        console.log('停止')
        clearInterval(replay.player)
        replay.player = null
        replay.playPosition = 0
        replay.playDataIndex = 0
        return true
    },

    // 前进
    forward(): void { },

    // 后退
    backoff(): void { }
};

// const playdata = [{ "id": 3, "time": 1595829579674, "duration": 5415, "type": "scroll", "pointer": { "left": 272, "top": 788.7999877929688 } }, { "id": 5, "time": 1595829579892, "duration": 5633, "type": "touchend", "pointer": { "left": 272, "top": 788.7999877929688 } }, { "id": 1, "time": 1595829579897, "duration": 5638, "pointer": { "left": 200, "top": 793 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(2) > div:nth-child(2) > span", "type": "click" }, { "id": 3, "time": 1595829581001, "duration": 6742, "type": "scroll", "pointer": { "left": 372, "top": 776.7999877929688 } }, { "id": 5, "time": 1595829581220, "duration": 6961, "type": "touchend", "pointer": { "left": 372, "top": 776.7999877929688 } }, { "id": 1, "time": 1595829581224, "duration": 6965, "pointer": { "left": 321, "top": 779 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(3) > div:nth-child(1) > img:nth-child(1)", "type": "click" }, { "id": 3, "time": 1595829582560, "duration": 8301, "type": "scroll", "pointer": { "left": 262.3999938964844, "top": 782.4000244140625 } }, { "id": 5, "time": 1595829582779, "duration": 8520, "type": "touchend", "pointer": { "left": 262.3999938964844, "top": 782.4000244140625 } }, { "id": 1, "time": 1595829582786, "duration": 8527, "pointer": { "left": 188, "top": 786 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(2) > div:nth-child(1) > img:nth-child(1)", "type": "click" }, { "id": 3, "time": 1595829583749, "duration": 9490, "type": "scroll", "pointer": { "left": 152.8000030517578, "top": 783.2000122070312 } }, { "id": 5, "time": 1595829583967, "duration": 9708, "type": "touchend", "pointer": { "left": 152.8000030517578, "top": 783.2000122070312 } }, { "id": 1, "time": 1595829583974, "duration": 9715, "pointer": { "left": 54, "top": 787 }, "domPath": "div#app > div:nth-child(2) > div#cmp-footer > div > div:nth-child(1) > div:nth-child(1) > img:nth-child(1)", "type": "click" }, { "id": 3, "time": 1595829585391, "duration": 11132, "type": "scroll", "pointer": { "left": 352.8000183105469, "top": 393.6000061035156 } }, { "id": 5, "time": 1595829585595, "duration": 11336, "type": "touchend", "pointer": { "left": 352.8000183105469, "top": 393.6000061035156 } }, { "id": 1, "time": 1595829585600, "duration": 11341, "pointer": { "left": 308, "top": 314 }, "domPath": "div#app > div:nth-child(2) > div#app-mall > div:nth-child(4) > div:nth-child(1) > a:nth-child(2) > span", "type": "click" }, { "id": 3, "time": 1595829587886, "duration": 13627, "type": "scroll", "pointer": { "left": 280.8000183105469, "top": 552 } }, { "id": 4, "time": 1595829588105, "duration": 13846, "type": "touchmove", "pointer": { "left": 285.6000061035156, "top": 532 } }, { "id": 5, "time": 1595829588634, "duration": 14375, "type": "touchend", "pointer": { "left": 351.20001220703125, "top": 257.6000061035156 } }, { "id": 3, "time": 1595829594195, "duration": 19936, "type": "scroll", "pointer": { "left": 292, "top": 356 } }, { "id": 5, "time": 1595829594404, "duration": 20145, "type": "touchend", "pointer": { "left": 292, "top": 356 } }, { "id": 1, "time": 1595829594408, "duration": 20149, "pointer": { "left": 224, "top": 266 }, "domPath": "div#app > div:nth-child(2) > div#app-list > div:nth-child(2) > div:nth-child(2) > div#cmp-card > div:nth-child(1) > img", "type": "click" }, { "id": 3, "time": 1595829597447, "duration": 23188, "type": "scroll", "pointer": { "left": 267.20001220703125, "top": 314.3999938964844 } }, { "id": 5, "time": 1595829597659, "duration": 23400, "type": "touchend", "pointer": { "left": 267.20001220703125, "top": 314.3999938964844 } }, { "id": 1, "time": 1595829597665, "duration": 23406, "pointer": { "left": 194, "top": 215 }, "domPath": "div#app > div:nth-child(2) > div:nth-child(1) > div > div#cmp-group > div#cmp-input > div > div:nth-child(2) > div > input", "type": "click" }, { "id": 7, "time": 1595829599066, "duration": 24807, "type": "input" }, { "id": 7, "time": 1595829599386, "duration": 25127, "type": "input" }, { "id": 7, "time": 1595829599646, "duration": 25387, "type": "input" }, { "id": 7, "time": 1595829599888, "duration": 25629, "type": "input" }, { "id": 7, "time": 1595829600036, "duration": 25777, "type": "input" }, { "id": 6, "time": 1595829602558, "duration": 28299, "type": "change" }]

export default replay;
export const play = replay.play;
export const playInit = replay.playInit;
export const timeout = replay.timeout;
export const suspend = replay.suspend;
export const forward = replay.forward;
export const backoff = replay.backoff;


