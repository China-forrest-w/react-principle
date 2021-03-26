/*
 * @Author: your name
 * @Date: 2021-03-25 13:54:16
 * @LastEditTime: 2021-03-26 20:16:52
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/event.js
 */
import { updateQueue } from './Component';

/* 
给真实DOM添加时间处理函数
为什么要做合成事件和事件委托呢？
1.做兼容处理，不同浏览器的事件对象event是不一样的
2. 可以在我们写事件处理函数之前和之后做一些事情，比如设置是否进行批量更新（updateQueue.isBatchingUpdate = true/false）
*/
export function addEvent(dom, eventType, listener) {
  let store = dom.store || (dom.store = {});
  store[eventType] = listener;
  if (!document[eventType]) {
    /* 事件委托，不管给哪个DOM元素绑定事件，最后都统一绑定到document上去了 */
    document[eventType] = dispatchEvent;//document.onClick = dispatchEvent;
  }
}

let syntheticEvent = {
  stoppingPropagation: false,
  stopPropagation() {
    this.stoppingPropagation = true;
  }
};

function dispatchEvent(event) {
  let { target, type } = event;//事件源就是button哪个DOM元素，类型就是click
  let eventType = `on${type}`
  updateQueue.isBatchingUpdate = true;//把队列设置成批量更新模式;
  createSyntheticEvent(event);
  /* react中模拟的冒泡，当点击的dom内层还有节点的时候生效 */
  while (target) {
    const { store } = target;
    const listener = store && store[eventType];
    listener && listener.call(target, syntheticEvent);//还要给一个合成事件作为参数  
    if (syntheticEvent.stoppingPropagation) {
      break;
    }
    target = target.parentNode;
  }
  for (let key in syntheticEvent) {
    syntheticEvent[key] = null;
  }
  updateQueue.isBatchingUpdate = false;
  updateQueue.batchUpdate();
}

function createSyntheticEvent(nativeEvent) {
  for (let key in nativeEvent) {
    syntheticEvent[key] = nativeEvent[key];
  }
  return syntheticEvent;
}