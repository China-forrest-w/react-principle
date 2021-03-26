/*
 * @Author: your name
 * @Date: 2021-03-16 15:13:37
 * @LastEditTime: 2021-03-26 19:34:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/Component.js
 */
import { createDOM, compareTwoVdom } from './react-dom';

// 更新队列
export let updateQueue = {
  isBatchingUpdate: false, //当前是否处于批量更新模式,默认不是，即直接更新
  updaters: new Set(),
  batchUpdate() {//批量更新其实就是循环updaters进行执行
    for (let updater of this.updaters) {
      updater.updateComponent();
    }
    this.isBatchingUpdate = false;
  }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance;//类组件的实例
    this.pendingState = [];//等待生效的状态，放到数组中进行批量处理： 可能是对象和函数
    this.callbacks = [];
  }
  addState(partialState, callback) {
    this.pendingState.push(partialState);//等待生效的状态
    if (typeof callback === 'function') {
      this.callbacks.push(callback);//状态更新后的回调
    }
    this.emitUpdate();
  }
  /* 组件不管是属性还是状态变化都需要进行更新，因此我们提取成一个方法 */
  emitUpdate(newProps) {
    /* 判断是否批量更新模式 */
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent();
    }
  }

  updateComponent() {
    let { classInstance, pendingState, callbacks } = this;
    /* 有等待更新的对象 */
    if (pendingState.length) {
      callbacks.forEach(callback => callback());
      callbacks.length = 0;
      shouldUpdate(classInstance, this.getState());
    }
  }
  /* 计算最新的状态 */
  getState() {
    let { classInstance, pendingState } = this;
    let { state } = classInstance;
    pendingState.forEach((nextState) => {
      if (typeof nextState === 'function') {
        nextState = nextState.call(classInstance, state);
      }
      state = { ...state, ...nextState };
    });
    pendingState.length = 0;
    return state;
  }
}
/**
 * @description: 
 * @param {*} classInstance 组件实例
 * @param {*} pendingState  新的状态
 * @return {*}
 */
function shouldUpdate(classInstance, nextState) {
  /* 不管组件的属性是否要更新，其实组件的state已经改变了 */
  classInstance.state = nextState;
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(classInstance.props, classInstance.state)) {
    return;
  }
  classInstance.forceUpdate();
}

class Component {
  static isReactComponent = true;
  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }
  setState(partialState, callback) {
    this.updater.addState(partialState, callback);
  }
  forceUpdate() {
    if (this.componentWillUpdate) {
      this.componentWillUpdate();
    }
    const newVdom = this.render();
    console.log('this', this);
    console.log('newVdom', newVdom);
    // updateClassComponent(this, newVdom);
    compareTwoVdom(this.oldRenderVdom.dom.parentNode, this.oldRenderVdom, newVdom);
    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
  }
}

// 更新类组件实例上挂载的dom
// function updateClassComponent(classInstance, newVdom) {
//   /* 取出这个类组件中上次渲染出来的真实DOM */
//   let oldDOM = classInstance.dom;
//   /* 把一个新的虚拟DOM变成真实DOM */
//   let newDOM = createDOM(newVdom);
//   oldDOM.parentNode.replaceChild(newDOM, oldDOM)
//   classInstance.dom = newDOM;
// }

export default Component;