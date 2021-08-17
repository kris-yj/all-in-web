import CommonPropertyDisplay from './property-display';
import CommonPropertyDisplayItem from './property-display-item';

CommonPropertyDisplay.install = function (Vue) {
  Vue.component(CommonPropertyDisplay.name, CommonPropertyDisplay);
};

export default CommonPropertyDisplay;
export {
  CommonPropertyDisplayItem
};
