/*
 * @Author: your name
 * @Date: 2021-03-16 11:24:19
 * @LastEditTime: 2021-04-07 11:18:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/react.js
 */
import Component from './Component';
import { wrapToVdom } from './utils';
function createElement(type, config, children) {
    console.log("createElement11111111111111")
    if (config) {
        delete config._source;
        delete config._self;
    }
    let props = { ...config };
    if (arguments.length > 3) {
        props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
    } else {
        props.children = wrapToVdom(children)
    }
    return {
        type,
        props
    }
}

const React = { createElement, Component };
export default React;