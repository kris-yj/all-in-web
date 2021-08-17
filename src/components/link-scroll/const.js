const typeArr = Object.freeze(['menu', 'body']);
const typeEnum = Object.freeze((function (obj) {
  const [menu, body] = typeArr;
  obj[obj[0] = menu] = menu;
  obj[obj[1] = body] = body;
  return obj;
})({}));
// const evtNameArr = typeArr.map(genEvtName);
const suffix = Math.random().toString(36).substr(2);
const evtName = {
  addContainer: 'add-container',
  genMenu: 'gen-menu',
  menuItemClick: 'menu-item-click'
};
// 方法部分
const getName = (comp) => comp.$options.name;
const sleep = (time = 0) => new Promise((res) => { setTimeout(() => { res(); }, time); });
export {
  typeEnum,
  suffix,
  evtName,
  getName,
  sleep,
};
