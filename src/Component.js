import { createDOM } from './react-dom';
class Component {
    static isReactComponent = true;
    constructor(props) {
        this.props = props;
        this.state = {};
    }
    setState(partialState) {
        let state = this.state;
        this.state = { ...state, ...partialState };
        let newVdom = this.render();
        updateClassComponent(this, newVdom);
    }
    render() {
        throw new Error('此方法为抽象方法，需要子类来实现');
    }
}

function updateClassComponent(classInstance, newVdom) {
    /* 取出这个类组件中上次渲染出来的真实DOM */
    let oldDOM = classInstance.dom;
    /* 把一个新的虚拟DOM变成真实DOM */
    let newDOM = createDOM(newVdom);
    oldDOM.parentNode.replaceChild(newDOM, oldDOM)
    classInstance.dom = newDOM;
}

export default Component;