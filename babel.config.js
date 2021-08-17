const presets = [
  [
    "@babel/env",
    {
      useBuiltIns: 'usage',
      // Babel7 需要指定引入corejs的版本，最好使用3
      corejs: 3,
      modules: false, // 需要转换成什么样的模块系统
    },
  ],
  "@vue/babel-preset-jsx"
];

const plugins = [
];

module.exports = { presets, plugins };
