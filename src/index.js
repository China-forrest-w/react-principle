// import React from 'react';
import React from 'react';
import ReactDOM from 'react-dom';

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 0
    }
  }
  handlerClick = () => {
    this.setState((lastState) => ({ number: lastState.number + 1 }), () => {
      console.log("callback1", this.state.number);
    });
    console.log("this.state.number", this.state.number);
    this.setState((lastState) => ({ number: lastState.number + 1 }));
    console.log('this.state.number', this.state.number);
    Promise.resolve().then(() => {
      console.log('this.state,number', this.state.number);
      this.setState((lastState) => ({ number: lastState.number + 1 }));
      console.log('this.state,number', this.state.number);
      this.setState((lastState) => ({ number: lastState.number + 1 }));
      console.log('this.state,number', this.state.number);
    });
    // this.setState({ number: this.state.number + 1 })
  }
  render() {
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handlerClick}>+</button>
      </div>
    )
  }
}

ReactDOM.render((
  <Counter name="计数器" />
), document.getElementById('root'));