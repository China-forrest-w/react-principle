/*
 * @Author: your name
 * @Date: 2021-04-09 20:19:04
 * @LastEditTime: 2021-04-09 20:26:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/hoc之反向代理.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

class Button extends React.Component {
  state = {
    name: '张三'
  }
  componentWillMount() {
    console.log("button componentWillMount");
  }
  componentDidMount() {
    console.log('button componentDidMount');
  }
  render() {
    console.log(this);
    console.log('button render');
    return (
      <button name={this.state.name} title={this.props.title}></button>
    )
  }
}

const wrap = Button => {
  return class WrapButton extends Button {
    state = {
      number: 0
    }
    componentWillMount() {
      console.log('wrapButton componentWillMount');
      super.componentWillMount();
    }
    componentDidMount() {
      console.log('wrapButton componentDidMount');
      super.componentDidMount();
    }
    add = () => {
      this.setState({ number: this.state.number + 1 });
    }
    render() {
      console.log('wrapButton render');
      let superRenderElement = super.render();
      let renderElement = React.cloneElement(superRenderElement, {
        onClick: this.add
      }, this.state.number);
      return renderElement;
    }
  }
}
let WrapButton = wrap(Button);

ReactDOM.render(<WrapButton title="标题" />, document.getElementById('root'));