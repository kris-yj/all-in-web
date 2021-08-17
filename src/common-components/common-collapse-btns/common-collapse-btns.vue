<script>
export default {
  name: 'CommonCollapseBtns',
  props: {
    max: {
      type: Number,
      default: 3,
    }
  },
  data() {
    return {
      showPopover: false,
    };
  },
  mounted() {
  },
  methods: {
    popoverVisibleChange() {
      this.showPopover = !this.showPopover;
    }
  },
  render() {
    const btns = this.$slots.default;
    const allBtns = btns ? btns.filter((btn) => btn.tag) : [];
    const showBtns = allBtns.length <= this.max ? allBtns : allBtns.slice(0, this.max - 1);
    const subBtns = allBtns.length <= this.max ? [] : allBtns.slice(this.max - 1);
    return (
      <span>
        {showBtns}
        <meg-popover
          v-model={this.showPopover}
          placement="bottom"
          trigger="click"
          popper-class="common-collapse-popover">
          <span
            on-click={this.popoverVisibleChange}> {subBtns} </span>
          <meg-button
            v-show={subBtns.length}
            class="common-collapse-more-icon"
            type="text"
            slot="reference">
            更多
            <meg-icon
              name="meg-icon-arrow_down"
              class="icon meg-icon--right"></meg-icon>
          </meg-button>
        </meg-popover>
      </span>
    );
  }
};
</script>

<style lang="scss">
.common-collapse-popover{
  width: 110px !important;
  min-width: auto;
  padding: 3px 0;
  span{
    display: block;
  }
  span > .meg-button{
    margin: 0;
    width: 100%;
    &:hover{
      background: #e6f2ff;
    }
  }
}
 .common-collapse-more-icon{
    margin-left: 10px;
    .icon{
      font-size: 12px;
      margin-left: 0
    }
  }
</style>
