<template>
  <collapse-property
    :items="items">
    <template v-slot:identityCard>
      <div class="id-card-select">
        <meg-input
          :placeholder="$t('请输入证件号')"
          clearable
          v-model="items[2].value">
          <meg-select
            v-model="items[1].value"
            slot="prepend"
            :placeholder="$t('请选择')">
            <meg-option
              v-for="cardItem in items[1].data"
              :key="cardItem.name"
              :label="cardItem.name"
              :value="cardItem.code"></meg-option>
          </meg-select>
        </meg-input>
      </div>
    </template>
  </collapse-property>
</template>

<script>
import { CollapseProperty } from '@/common-components/common-property-form';

export default {
  name: 'PapersNumbers',
  components: { CollapseProperty },
  props: {
    items: {
      default: () => [],
      type: Array
    }
  },
};
</script>

<style lang="scss">
.collapse-property-extend-alarm-history-self-card-type-none {
  display: none;
}
</style>
<style lang="scss" scoped>
.id-card-select .meg-select {
  width: 88px;
}
</style>
