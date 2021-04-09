/*
 * @Author: your name
 * @Date: 2021-03-16 11:24:19
 * @LastEditTime: 2021-04-09 17:01:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/react.js
 */
import Component from './Component';
import { wrapToVdom } from './utils';
function createElement(type, config, children) {
  let key, ref;
  if (config) {
    delete config._source;
    delete config._self;
    key = config.key;
    ref = config.ref;
    delete config.key;
    delete config.ref;
  }
  let props = { ...config };
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    props.children = wrapToVdom(children)
  }
  return {
    type,
    props,
    key,
    ref
  }
}

function createRef() {
  return { current: null };
}

function createContext(initialValue) {
  Provider._value = initialValue;

  function Provider(props) {
    if (Provider._value) {
      Object.assign(Provider._value, props.value);
    } else {
      Provider._value = props.value || {};
    }
    return props.children;
  }

  function Consumer(props) {
    return props.children(Provider._value);
  }
  return { Provider, Consumer }
}
const React = { createElement, Component, createRef, createContext };
export default React;