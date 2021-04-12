/*
 * @Author: your name
 * @Date: 2021-03-16 11:24:19
 * @LastEditTime: 2021-04-09 19:48:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/react.js
 */
import { Component, PureComponent } from './Component';
import { wrapToVdom } from './utils';
import { useState, useCallback, useMemo, useReducer, useEffect, useLayoutEffect, useRef } from './react-dom';
function createElement(type, config, children) {
  console.log('createElement')
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

function cloneElement(oldElement, newProps, ...newChildren) {
  let children = oldElement.props.children;
  if (children) {
    if (!Array.isArray(children)) {
      children = [children];
    }
  } else {
    children = [];
  }
  children.push(...newChildren);
  children = children.map(wrapToVdom);
  if (children.length === 0) {
    children = undefined;
  } else if (children.length === 1) {
    children = children[0];
  }
  newProps.children = children;
  let props = { ...oldElement.props, ...newProps };
  return { ...oldElement, props }
}

function createRef() {
  return { current: null };
}

function createContext(initialValue) {
  let context = { Provider, Consumer };
  function Provider(props) {
    context._currentValue = context._currentValue || initialValue;
    Object.assign(context._currentValue, props.value);
    return props.children;
  }

  function Consumer(props) {
    return props.children(context._currentValue);
  }

  return context;
}

function useContext(context) {
  return context._currentValue;
}

function memo(FunctionComponent) {
  return class extends PureComponent {
    render() {
      return FunctionComponent(this.props)
    }
  }
}
const React = {
  createElement,
  Component,
  PureComponent,
  createRef,
  createContext,
  cloneElement,
  useState,
  memo,
  useCallback,
  useMemo,
  useReducer,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef
};
export default React;