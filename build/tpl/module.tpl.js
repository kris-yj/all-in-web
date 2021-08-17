const moduleTpl =
`<template>
  <page-layout>
    <div>
      <meg-button type="primary">
        module: {{moduleFileName}}
      </meg-button>
    </div>
  </page-layout>
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
    };
  },
  created() {
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
</style>
`;

module.exports = moduleTpl;
