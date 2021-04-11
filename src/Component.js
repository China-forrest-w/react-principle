/*
 * @Author: your name
 * @Date: 2021-03-16 15:13:37
 * @LastEditTime: 2021-04-09 16:40:41
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/Component.js
 */
import { compareTwoVdom } from './react-dom';

// 更新队列
export let updateQueue = {
  isBatchingUpdate: false, //当前是否处于批量更新模式,默认不是，即直接更新
  updaters: new Set(),
  batchUpdate() {//批量更新其实就是循环updaters进行执行
    for (let updater of this.updaters) {
      updater.updateComponent();
    }
    this.updaters.clear();
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
  emitUpdate(nextProps) {
    this.nextProps = nextProps;
    /* 判断是否批量更新模式 */
    if (updateQueue.isBatchingUpdate) {
      updateQueue.updaters.add(this);
    } else {
      this.updateComponent();
    }
  }

  updateComponent() {
    let { classInstance, pendingState, callbacks, nextProps } = this;
    /* 有等待更新的对象 */
    if (nextProps || pendingState.length) {
      callbacks.forEach(callback => callback());
      callbacks.length = 0;
      shouldUpdate(classInstance, nextProps, this.getState(nextProps));
    }
  }
  /* 计算最新的状态 */
  getState(nextProps) {
    let { classInstance, pendingState } = this;
    let { state } = classInstance;
    pendingState.forEach((nextState) => {
      if (typeof nextState === 'function') {
        nextState = nextState.call(classInstance, state);
      }
      state = { ...state, ...nextState };
    });
    pendingState.length = 0;
    if (classInstance.getDerivedStateFromProps) {
      let partialState = classInstance.getDerivedStateFromProps(nextProps, classInstance.state);
      if (partialState) state = { ...state, ...partialState }
    }
    return state;
  }
}
/**
 * @description: 
 * @param {*} classInstance 组件实例
 * @param {*} pendingState  新的状态
 * @return {*}
 */
function shouldUpdate(classInstance, nextProps, nextState) {
  let willUpdate = true;//是否要更新
  /* 如果有shouldComponentUpdate方法，并且返回值是false则不更新 */
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false;
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate();
  }
  /* 不管组件是否更新， 组件新的props，和state已经改变了 */
  if (nextProps) classInstance.props = nextProps;
  classInstance.state = nextState;
  // if(classInstance.constructor.contextType) {
  //   classInstance.context = classInstance.constructor.contextType.Provider._value;
  // }
  if (willUpdate) classInstance.updateComponent();
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
    let nextState = this.state;
    let nextProps = this.props;
    if (this.constructor.getDerivedStateFromProps) {
      let partialState = this.constructor.getDerivedStateFromProps(nextProps, nextState);
      if (partialState) nextState = { ...nextState, ...partialState }
    }
    this.state = nextState;
    // if(this.constructor.contextType) {
    //   this.context = this.constructor.contextType.Provider._value;
    // }
    this.updateComponent();
  }
  updateComponent() {
    const newVdom = this.render();
    const extraArgs = this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate();
    compareTwoVdom(this.oldRenderVdom.dom.parentNode, this.oldRenderVdom, newVdom);
    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state, extraArgs);
    }
  }
}

class PureComponent extends Component {
  // 重写了此方法，只有状态或者属性变化了才会更新，否则不更新
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
  /* 任何一方不是对象或者null则不相等。即只有是对象才有资格判定为相等即不更新，只有普通类型才有能实现更新 */
}
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 !== null || typeof obj2 !== 'object' || obj2 === null) {
    return false;
  } 
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}

export { Component, PureComponent }