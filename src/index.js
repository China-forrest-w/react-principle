/*
 * @Author: your name
 * @Date: 2021-03-04 13:34:04
 * @LastEditTime: 2021-03-25 18:23:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/index.js
 */
import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component {
  /* 设置初始属性对象 */
  static defaultProps = {
    name: 'count'
  }
  constructor(props) {
    super(props);
    this.state = {
      number: 0
    }
    console.log('Counter 1.constructor   初始化属性和状态对象');
  }

  componentWillMount() {
    console.log('Counter 2.componentWillMount 组件将要挂载')
  }

  componentDidMount() {
    console.log('Counter 4.componentDidMount 组件挂载完毕')
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('Counter 5.shouldComponentUpdate  组件是否需要更新')
    return true;
  }
  componentWillUpdate() {
    console.log('组件将要更新')
  }

  componentDidUpdate() {
    console.log('组件更新完成');
  }

  handleClick = (event) => {
    this.setState({
      number: this.state.number + 1
    })
  }

  render() {
    console.log('Counter 3.render');
    return (
      <div>
        <p>{this.state.number}</p>
        <ChildCounter count={this.state.number} />
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}

class ChildCounter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  componentWillMount() {
    console.log('ChildCounter componentWillMount  组件将要挂载');
  }
  componentDidMount() {
    console.log('ChildCounter componentDidMount  组件挂载完成');
  }
  componentWillReceiveProps(newProps) {
    console.log("ChildCounter componentWillReceiveProps 组件将要接收到新的属性");
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildCounter shouldComponentUpdate  组件是否更新');
    return true;
  }
  componentWillUpdate() {
    console.log('ChildCounter componentWillUpdate 组件将要更新')
  }
  componentDidUpdate() {
    console.log("ChildCounter componentDidUpdate 组件更新完毕")
  }
  render() {
    console.log('ChildCounter 2.render');
    return (
      <div>
        {this.props.count}
      </div>
    )
  }
}

// function App() {
//   // const [count, setCount] = React.useState(0)
//   // React.useEffect(() => {
//   //   console.log('useEffect')
//   // }, [count])
//   return (
//     // <div>1
//     //   <span>2</span>
//     // </div>
//     // <div>1</div>
//     // "你好"
//     <div>
//       <p>{count}</p>
//       <button onClick={() => setCount(count + 1)}>+</button>
//     </div>
//   )
// }

ReactDOM.render(<Counter />, document.getElementById('root'))