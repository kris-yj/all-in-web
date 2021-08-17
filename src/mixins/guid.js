export default {
  data() {
    return {
      guid: 100000
    };
  },
  methods: {
    // 生成组件内的guid
    createGuid(prefix = '', suffix = '') {
      this.guid += 1;
      return `${prefix}-${this.guid}-${suffix}`;
    }
  }
};
