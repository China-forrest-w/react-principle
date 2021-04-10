/*
 * @Author: your name
 * @Date: 2021-04-09 18:40:16
 * @LastEditTime: 2021-04-09 20:18:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/index.js
 */
import React from 'react';
import ReactDOM from 'react-dom';

let withLoading = loadingMessage = OldComponent => {
  return class NewComponent extends React.Component {
    show = () => {
      // console.log('show');
    }
    hide = () => {
      // console.log('hide');
    }
    render() {
      let extraProps = { show: this.show, hide: this.hide };
      return <OldComponent {...this.props} {...extraProps} />
    }
  }
}

@withLoading('加载中。。。。。。')
class Hello extends React.Component {
  render() {
    return (
      <div>hello</div>
    )
  }
}

ReactDOM.render(<Hello />, document.getElementById('root'))