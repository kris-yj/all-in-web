<script>
import LinkScrollItem from './link-scroll-item';

export default {
  name: 'MenuRender',
  components: {
    LinkScrollItem
  },
  props: {
    description: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    this.$emit('auto-menu-updated');
  },
  methods: {
    renderContent(h, arr, index = 0) {
      const tipBase = ['link-scroll-item', { class: `menu-item menu-h${index}` }];
      return arr.map((item) => {
        if (typeof item === 'string') {
          return h(...tipBase, item);
        }
        return h(...tipBase, [item.text].concat(this.renderContent(h, item.children, index + 1)));
      });
    }
  },
  render(h) {
    return h('article', { class: 'auto-menu' }, this.renderContent(h, this.description));
  }
};
</script>
<style lang="scss" scoped>
.auto-menu{
  height: 100%;
}
</style>
