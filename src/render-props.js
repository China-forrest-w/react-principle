import React from 'react';
import ReactDOM from 'react-dom';

// // 原生实现
// class MouseTracker extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { x: 0, y: 0 }
//   }

//   handleMouseMove = (event) => {
//     this.setState({
//       x: event.clientX,
//       y: event.clientY
//     })
//   }
//   render() {
//     return (
//       <div onMouseMove={this.handleMouseMove}>
//         <h1>移动鼠标!</h1>
//         <p>当前的鼠标位置是 ({this.state.x}, {this.state.y})</p>
//       </div>
//     )
//   }
// }

// ReactDOM.render(<MouseTracker />, document.getElementById('root'));

// // children
// class MouseTracker extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { x: 0, y: 0 };
//   }

//   handleMouseMove = (event) => {
//     this.setState({
//       x: event.clientX,
//       y: event.clientY
//     });
//   }
//   render() {
//     return (
//       <div onMouseMove={this.handleMouseMove}>
//         {this.props.children(this.state)}
//       </div>
//     )
//   }
// }

// ReactDOM.render(<MouseTracker>
//   {
//     (props) => {
//       <div>
//         <h1>移动鼠标!</h1>
//         <p>当前的鼠标位置是 ({props.x}, {props.y})</p>
//       </div>
//     }
//   }
// </MouseTracker>, document.getElementById('root'))

// render
/*
class MouseTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = { x: 0, y: 0 };
    }

    handleMouseMove = (event) => {
        this.setState({
            x: event.clientX,
            y: event.clientY
        });
    }

    render() {
        return (
            <div onMouseMove={this.handleMouseMove}>
              this.props.render(this.state);
            </div>
        );
    }
}
ReactDOM.render(<MouseTracker render={params => {
     <>
        <h1>移动鼠标!</h1>
        <p>当前的鼠标位置是 ({params.x}, {params.y})</p>
    </>
}}></MouseTracker>, document.getElementById('root'));
*/

/* HOC */
function withTracker(OldComponent) {
  return class MouseTracker extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        x: 0, y: 0
      }
    }
    handleMouseMove = (event) => {
      this.setState({
        x: event.clientX,
        y: event.clientY
      })
    }

    render() {
      return (
        <div onMouseMove={this.handleMouseMove}>
          <OldComponent {...this.state} />
        </div>
      )
    }
  }
}
function Show(props) {
  return (
    <React.Fragment>
      <h1>请移动鼠标</h1>
      <p>当前鼠标的位置是: x:{props.x} y:{props.y}</p>
    </React.Fragment>
  )
}
let HighShow = withTracker(Show);
ReactDOM.render(<HighShow />, document.getElementById('root'));