/*
把vdom虚拟DOM变成真实DOM
把虚拟DOM上的属性更新到dom上；
把虚拟DOM的儿子们也变成真实DOM挂载到自己的dom上  dom.appendChlid
 把自己挂载到容器上
*/
function render(vdom, container) {
  const dom = createDOM(vdom);
  container.appendChild(dom);
}
/* 把虚拟DOM变成真实DOM */
export function createDOM(vdom) {
  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(vdom);
  }
  // 否则就是一个虚拟DOM对象，也就是React元素；
  let { type, props } = vdom;
  let dom;
  if (typeof type === 'function') {
    if (type.isReactComponent) {
      return mountClassComponent(vdom);
    } else {
      return mountFunctionComponent(vdom);
    }
  } else { //原生组件
    dom = document.createElement(type);
  }
  // 使用虚拟DOM的属性更新刚创建出来的真实DOM的属性
  updateProps(dom, props);
  // 单独在这里处理children
  // 如果只有一个儿子，并且这个儿子是一个虚拟DOM元素
  if (typeof props.children === 'string' || typeof props.children === 'number') {
    dom.textContent = props.children;
  } else if (typeof props.children === 'object' && props.children.type) {
    // 把儿子变成真实DOM插到自己身上
    render(props.children, dom);
  } else if (Array.isArray(props.children)) {
    reconcileChildren(props.children, dom);
  } else {
    document.textContent = props.children ? props.children.toString() : '';
  }
  // 把真实DOM作为一个dom属性放到虚拟DOM，为以后的更新做准备
  return dom;
}

function mountClassComponent(vdom) {
  // 解构类的定义和类的属性对象；
  let { type, props } = vdom;
  // 创建类的实例
  let classInstance = new type(props);
  // 调用实例的render方法返回要渲染的虚拟DOM对象
  let renderVdom = classInstance.render();
  // 根据虚拟DOM对象创建真实DOM对象
  let dom = createDOM(renderVdom);
  // 为以后类组件的更新，把真实DOM挂载到了类的实例上
  classInstance.dom = dom;
  return dom;
}

// 把一个类型为自定义函数组件的虚拟DOM转换成为真实DOM并返回；
function mountFunctionComponent(vdom) {//类型为自定义函数组件的虚拟DOM
  let { type: FunctionComponent, props } = vdom;
  let renderVdom = FunctionComponent(props);
  return createDOM(renderVdom);
}

function reconcileChildren(childrenVdom, parentDOM) {
  for (let i = 0; i < childrenVdom.length; i++) {
    let childVdom = childrenVdom[i];
    render(childVdom, parentDOM)
  }
}

function updateProps(dom, newProps) {
  for (let key in newProps) {
    if (key === 'children') continue;
    if (key === 'style') {
      let styleObj = newProps.style;
      for (let attr in styleObj) {
        dom.style[attr] = styleObj[attr];
      }
    } else if (key.startsWith('on')) {
      // 给真实DOM添加属性
      dom[key.toLocaleLowerCase()] = newProps[key];
    } else {
      dom[key] = newProps[key];
    }
  }
}
const ReactDOM = { render };
export default ReactDOM;