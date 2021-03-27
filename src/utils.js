/*
 * @Author: your name
 * @Date: 2021-03-26 21:13:07
 * @LastEditTime: 2021-03-26 21:18:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/src/utils.js
 */
import { REACT_TEXT } from './constants';
/**
 * @description: 为了方便后面的dom-diff： 把文本节点进行单独的封装或者标识，全部处理成react元素的形式
 * @param {*} element : 可能是一个React元素，也可能是一个字符串或者数字
 * @return {*}
 */
export function wrapToVdom(element) {
    return (typeof element === 'string' || typeof element === 'number') ? { type: REACT_TEXT, props: { content: element } } : element
}