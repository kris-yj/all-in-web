<template>
  <div class="export-time-select">
    <div class="select-title">
      起止时间
    </div>
    <div class="select-body">
      <meg-date-picker
        style="width:300px"
        v-model="innerDate"
        :prefix-icon-visible="false"
        format="yyyy-MM-dd HH:mm"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="onDateChange"
        :picker-options="pickerOptions">
      </meg-date-picker>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportSelectTime',
  model: {
    prop: 'selected',
    event: 'change'
  },
  props: {
    selected: {
      type: Array,
      default: () => ([])
    },
    selectOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerDate: [],
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      }
    };
  },
  watch: {
    selected: {
      immediate: true,
      handler() {
        this.innerDate = this.selected;
      }
    }
  },
  created() {
    this.innerDate = this.selectOptions.selects || [Date.now(), Date.now()];
    this.$emit('change', this.innerDate);
  },
  methods: {
    onDateChange(ret) {
      if (Array.isArray(ret)) {
        const [dateStart, dateEnd] = ret;
        this.$emit('change', [dateStart.getTime(), dateEnd.getTime()]);
      } else {
        this.$emit('change', null);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.export-time-select {
  display: flex;

  .select-title {
    display: flex;
    align-items: center;
    flex: 0 0 70px;
    justify-content: flex-start;
  }

  .select-body {
    flex: 1 1 280px;
  }
}
</style>
