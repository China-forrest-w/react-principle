/*
把vdom虚拟DOM变成真实DOM
把虚拟DOM上的属性更新到dom上；
把虚拟DOM的儿子们也变成真实DOM挂载到自己的dom上  dom.appendChlid
 把自己挂载到容器上
*/

import { addEvent } from './event';
import { REACT_TEXT } from './constants';


/* 存放所有状态的数组 */
const hooksStates = [];
let hooksIndex = 0;
let scheduleUpdate;

function render(vdom, parentDOM, nextDOM) {
  mount(vdom, parentDOM, nextDOM);
  scheduleUpdate = () => {
    hooksIndex = 0;
    compareTwoVdom(parentDOM, vdom, vdom)
  }
}

function mount(vdom, parentDOM, nextDOM) {
  const dom = createDOM(vdom);
  if (vdom) {
    const newDOM = createDOM(vdom);
    if (nextDOM) {
      parentDOM.insertBefore(newDOM, nextDOM);
    } else {
      parentDOM.appendChild(newDOM);
    }
  }
  dom.componentDidMount && dom.componentDidMount();
}

export function useMemo(factory, deps) {
  if (hooksStates[hooksIndex]) {
    /* 拿到上一次的依赖值和依赖项 */
    const [lastMemo, lastDeps] = hooksStates[hooksIndex];
    const same = deps.every((item, index) => item === lastDeps[index])
    if (same) {
      hooksIndex++;
      return lastMemo;
    } else {
      const newMemo = factory();
      hooksStates[hooksIndex++] = [newMemo, deps];
      return newMemo;
    }
  } else {
    const newMemo = factory();
    hooksStates[hooksIndex++] = [newMemo, deps];
    return newMemo;
  }
}

export function useCallback(callback, deps) {
  if (hooksStates[hooksIndex]) {
    const [lastCallback, lastDeps] = hooksStates[hooksIndex];
    const same = deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hooksIndex++;
      return lastCallback;
    } else {
      hooksStates[hooksIndex++] = [callback, deps];
      return callback;
    }
  } else {
    hooksStates[hooksIndex++] = [callback, deps];
    return callback;
  }
}

export function useState(initialState) {
  /* 取出之前的值，如果没有则使用默认值 */
  hooksStates[hooksIndex] = hooksStates[hooksIndex] || typeof initialState === 'function' ? initialState() : initialState;
  /* 新定义一个变量currentIndex */
  let currentIndex = hooksIndex;

  function setState(newState) {
    if (typeof newState === 'function') {
      newState = newState(hooksStates[currentIndex]);
    }
    hooksStates[currentIndex] = newState;
    /* 当状态改变后更新应用 */
    scheduleUpdate();
  }
  return [hooksStates[hooksIndex++], setState]
}
// export function useState(initialState) {
//   return useReducer(null, initialState);
// }

export function useReducer(reducer, initialState) {
  hooksStates[hooksIndex] = hooksStates[hooksIndex] || typeof initialState === 'function' ? initialState() : initialState;
  let currentIndex = hooksIndex;

  function dispatch(action) {
    hooksStates[currentIndex] = reducer ? reducer(hooksStates[currentIndex], action) : action;
    scheduleUpdate();
  }
  return [hooksStates[hooksIndex++], dispatch]
}

/* 把虚拟DOM变成真实DOM */
export function createDOM(vdom) {
  let { type, props, key, ref } = vdom;
  let dom;
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.content);
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else { //原生组件
    dom = document.createElement(type);
  }
  // 使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
  updateProps(dom, {}, props);

  // 单独在这里处理children
  // 如果只有一个儿子，并且这个儿子是一个虚拟DOM元素

  if (typeof props?.children === 'object' && props?.children?.type) {
    // 把儿子变成真实DOM插到自己身上
    mount(props.children, dom);
  } else if (Array.isArray(props?.children)) {
    reconcileChildren(props.children, dom);
  }
  // 把真实DOM作为一个dom属性放到虚拟DOM，为以后的更新做准备
  vdom.dom = dom;
  if (ref) ref.current = dom;
  return dom;
}

function mountClassComponent(vdom) {
  // 解构类的定义和类的属性对象；
  let { type, props } = vdom;
  // 创建类的实例
  let classInstance = new type(props);
  if (type.contextType) {
    classInstance.context = type.contextType.Provider._value;
  }
  vdom.classInstance = classInstance;
  if (classInstance.componentWillMount) {
    classInstance.componentWillMount();
  }
  if (type.getDerivedStateFromProps) {
    let partialState = type.getDerivedStateFromProps(classInstance.props, classInstance.state);
    if (partialState) {
      classInstance.state = { ...classInstance.state, ...partialState }
    }
  }
  /* 调用实例的render方法返回要渲染的虚拟DOM对象 */
  let oldRenderVdom = classInstance.render();
  /* 把将要渲染的虚拟dom添加到类的实例上 */
  classInstance.oldRenderVdom = vdom.oldRenderVdom = oldRenderVdom;
  // 根据虚拟DOM对象创建真实DOM对象
  let dom = createDOM(oldRenderVdom);
  if (classInstance.componentDidMount) {
    dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
  }
  return dom;
}

// 把一个类型为自定义函数组件的虚拟DOM转换成为真实DOM并返回；
function mountFunctionComponent(vdom) {//类型为自定义函数组件的虚拟DOM
  let { type: FunctionComponent, props } = vdom;
  let renderVdom = FunctionComponent(props);
  vdom.oldRenderVdom = renderVdom;
  return createDOM(renderVdom);
}

function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    const childVdom = childrenVdom[i];
    mount(childVdom, parentDOM)
  }
}

function updateProps(dom, oldProps, newProps) {
  for (let key in newProps) {
    if (key === 'children') continue;
    if (key === 'style') {
      let styleObj = newProps.style;
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (key.startsWith('on')) {
      // 给真实DOM添加属性
      addEvent(dom, key.toLocaleLowerCase(), newProps[key]);
    } else {
      dom[key] = newProps[key];
    }
  }
}

/* 对当前组件进行dom-diff */
/**
 * @description: 
 * @param {*} parentDOM  当前组件挂载真实DOM节点
 * @param {*} oldVdom    上一次老的虚拟DOM
 * @param {*} newVdom    上一次新的虚拟DOM
 * @return {*}
 */
export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
  /* 老的虚拟DOM和新的虚拟DOM都是null */
  if (!oldVdom && !newVdom) {
  } else if (oldVdom && !newVdom) {
    const currentDOM = findDOM(oldVdom);
    if (currentDOM) parentDOM.removeChild(currentDOM);
    if (oldVdom?.classInstance?.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount();
    }
    /* 老的虚拟dom为null,新的虚拟dom有值：新建dom节点然后插入 */
  } else if (!oldVdom && newVdom) {
    mount(newVdom, parentDOM, nextDOM);
  } else if (oldVdom && newVdom && (oldVdom.type !== newVdom.type)) {
    /* 老的有，新的也有，但是类型不同 */
    const oldDOM = findDOM(oldVdom); //老的真实DOM
    const newDOM = createDOM(newVdom);//新的真实DOM
    parentDOM.replaceChild(newDOM, oldDOM);
    if (oldVdom?.classInstance?.componentWillUnmount) {
      oldVdom.classInstance.componentWillUnmount();
    }
    /* 新的有老的也有并且类型相同：就可以复用老的dom节点，然后进行深度的dom-diff */
    /* 既要更新自己的属性，又要比较儿子们 */
  } else {
    updateElement(oldVdom, newVdom);
  }
}

/**
 * @description: 
 * @param {*} oldVdom
 * @param {*} newVdom
 * @return {*}
 */
function updateElement(oldVdom, newVdom) {
  // 先更新属性
  /* 文本节点 */
  if (oldVdom.type === REACT_TEXT) {
    const currentDOM = newVdom.dom = oldVdom.dom;
    currentDOM.textContent = newVdom.props.content;
    /* 原生节点 */
  } else if (typeof oldVdom.type === 'string') {
    let currentDOM = newVdom.dom = oldVdom.dom;//复用老的div的真实DOM
    /* 先更新自己的属性 */
    updateProps(currentDOM, oldVdom.props, newVdom.props);
    /* 然后更新儿子们： 也就是只有原生组件我们才会进行深度对比 */
    updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
  } else if (typeof oldVdom.type === 'function') {
    /* 老的是组件，新的也是组件 */
    if (oldVdom.type.isReactComponent) {
      updateClassComponent(oldVdom, newVdom);
    } else {
      updateFunctionComponent(oldVdom, newVdom);
    }
  }
}

function updateFunctionComponent(oldVdom, newVdom) {
  let parentDOM = findDOM(oldVdom).parentNode;
  let { type, props } = newVdom;
  let oldRenderVdom = oldVdom.oldRenderVdom;
  let newRenderVdom = type(props);
  compareTwoVdom(parentDOM, oldRenderVdom, newRenderVdom);
  newVdom.oldRenderVdom = newRenderVdom;
}

/**
 * @description: 
 * @param {*} oldVdom
 * @param {*} newVdom
 * @return {*}
 */
function updateClassComponent(oldVdom, newVdom) {
  /* 类的实例需要复用，类的实例不管更新多少只有一个 */
  let classInstance = newVdom.classInstance = oldVdom.classInstance;
  /* 上一次的这个类组件渲染出来的虚拟DOM */
  newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
  if (classInstance.componentWillReceiveProps) {
    classInstance.componentWillReceiveProps();
  }
  /* 触发组件的更新，要把新的属性传过来 */
  classInstance.updater.emitUpdate(newVdom.props)
}

/**
 * @description: 深度比较两个虚拟DOM的children
 * @param {*} parentDOM 复用的老的父节点的真实DOM
 * @param {*} oldVChildren  老儿子们
 * @param {*} newVChildren  新儿子们
 * @return {*}
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  /* 因为children可能是对象，也可能是数组，为了方便我们都采用索引比较，全部格式化为数组 */
  oldVChildren = Array.isArray(oldVChildren) ? oldVChildren : [oldVChildren];
  newVChildren = Array.isArray(newVChildren) ? newVChildren : [newVChildren];
  const maxLength = Math.max(oldVChildren.length, newVChildren.length);
  for (let i = 0; i < maxLength; i++) {
    let nextDOM = oldVChildren.find((item, index) => index > i && item && item.dom);
    compareTwoVdom(parentDOM, oldVChildren[i], newVChildren[i], nextDOM && nextDOM.dom);
  }
}

/**
 * @description: 查找虚拟DOM对应的真实DOM
 * @param {*} vdom
 * @return {*}
 */
function findDOM(vdom) {
  let { type } = vdom;
  let dom;
  if (typeof type === 'function') {
    if (type.isReactComponent) {
      dom = findDOM(vdom.classInstance.oldRenderVdom);
    } else {
      dom = findDOM(vdom.oldRenderVdom);
    }
  } else {
    dom = vdom.dom
  }
  return dom;
}

const ReactDOM = { render };
export default ReactDOM;