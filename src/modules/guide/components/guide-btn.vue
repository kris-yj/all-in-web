<script>
import { get } from 'lodash';
import { routerSwitch, checkDisabled } from './const';

const strType = {
  type: String,
  default: ''
};
export default {
  props: {
    path: strType,
    name: strType
  },
  computed: {
    permissions() {
      return get(this.$store.state, ['menus', 'childPermissions'], null);
    },
  },
  render() {
    const { permissions, path, name } = this;
    const checkBtn = checkDisabled(permissions);
    const btnDisable = checkBtn(path);
    const disabledType = (
    <meg-tooltip effect='meg' content='您没有权限，请联系管理员开通' placement='right-start'>
      <div class="btn-container">
        <meg-button
          disabled>
          { name }
        </meg-button>
      </div>
    </meg-tooltip>);
    const normalType = (
      <meg-button onClick={routerSwitch.bind(null, path)}>
        {name }
      </meg-button>);
    return btnDisable ? disabledType : normalType;
  }
};
</script>
<style lang="scss" scoped>
.btn-container{
  display: inline-block;
}
</style>
