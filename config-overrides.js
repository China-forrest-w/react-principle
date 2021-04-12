/*
 * @Author: your name
 * @Date: 2021-04-09 18:01:21
 * @LastEditTime: 2021-04-09 18:03:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /react-principle/config.overrides.js
 */
const { override, addBabelPlugin } = require('customize-cra');
module.exports = override(
  addBabelPlugin([
    "@babel/plugin-proposal-decorators", { "legacy": true }
  ])
)