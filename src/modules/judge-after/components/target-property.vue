<template>
  <div class="target-property">
    <div class="header">
      <p class="title">
        目标属性
      </p>
      <p class="tips">
        请选择该技战法需要灌输的目标属性
      </p>
    </div>
    <div class="content">
      <common-property-setter
        class="property-setter-wrap"
        ref="propertySetter"></common-property-setter>
    </div>
  </div>
</template>

<script>
import CommonPropertySetter from '@/common-components/common-property-setter';

export default {
  components: {
    CommonPropertySetter
  },
  methods: {
    /**
     * 获取目标属性数据，供外部调用
     */
    getTargetProperties() {
      return this.$refs.propertySetter.getProperties();
    },
    /**
     * 设置目标属性数据，供外部编辑调用设置
     */
    setTargetProperties(data) {
      const { technicalProperties } = data;
      const properties = {};

      try {
        JSON.parse(technicalProperties).forEach((item) => {
          properties[`${item.attrKey}_${item.parentInfo.code}`] = item.value;
        });
      } catch (err) {
        console.log(err);
      }

      this.$refs.propertySetter.setProperties(properties);
    }
  }
};
</script>

<style lang="scss" scoped>
.target-property {
  background-color: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    height: 52px;
    border-bottom: 1px solid #EFEFEF;
    padding-left: 20px;
    display: flex;
    align-items: center;
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #435068;
    }
    .tips {
      font-size: 14px;
      color: #435068;
      margin-left: 20px;
      &:before {
        content: "*";
        color: #f05353;
        margin-right: 2px;
        vertical-align: middle;
      }
    }
  }
  .content {
    flex: 1;
    padding: 20px;
  }
  .property-setter-wrap {
    height: 100%;
    border: 1px solid #EFEFEF;
  }
}
</style>
