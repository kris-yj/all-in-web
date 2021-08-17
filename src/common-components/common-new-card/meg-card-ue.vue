<template>
  <div
    class="meg-card-ue"
    :class="shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow'">
    <div
      class="meg-card-ue__header"
      v-if="$slots.header || header">
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div
      class="meg-card-ue__body"
      :style="bodyStyle">
      <slot></slot>
    </div>
    <div
      class="meg-card-ue__bottom"
      v-if="$slots.bottom || bottom">
      <slot name="bottom">
        {{ bottom }}
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MegCardUe',
  props: {
    header: {
      type: undefined,
      default: '',
    },
    bottom: {
      type: undefined,
      default: '',
    },
    bodyStyle: {
      type: Object,

      default: () => {},
    },
    // never hover always
    shadow: {
      type: String,
      default: 'never',
    },
  },
};
</script>
<style lang="scss">
.meg-card-ue.is-always-shadow,
.meg-card-ue.is-hover-shadow:focus,
.meg-card-ue.is-hover-shadow:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.meg-card-ue {
  background-color: #fff;
  padding: 11px 11px 8px 11px;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
