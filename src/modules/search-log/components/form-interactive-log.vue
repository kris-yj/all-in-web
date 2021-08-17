<template>
  <div class="form-container-my">
    <meg-form-container
      class="comp"
      @search="$emit('retrieval')"
      @reset="$emit('reset')">
      <section
        slot="header"
        class="head">
        <slot name="moduleName">
          slotNmae:moduleName
        </slot>
      </section>
      <div
        class="formSlot"
        slot="otherFormElement">
        <section class="selectTime">
          <meg-form label-position="top">
            <meg-form-item :label="$t('起止时间')">
              <meg-date-picker
                type="datetimerange"
                :prefix-icon-visible="false"
                :default-date="'pastWeek'"
                :format="format"
                :default-time="['00:00:00','23:59:59']"
                v-model="date"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="getDateValue"
                :picker-options="{shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']}">
              </meg-date-picker>
            </meg-form-item>
          </meg-form>
        </section>
        <slot name="otherFormElement"></slot>
      </div>
    </meg-form-container>
  </div>
</template>
<script>
import moment from 'moment';

export default {
  components: {
  },
  props: {
    format: {
      type: String,
      default: 'yyyy-MM-dd',
    },
  },
  data() {
    return {
      date: [],
      // 日期选择器所选日期
      pickerOptions: {
        shortcuts: [{
          text: this.$t('近一天'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: this.$t('近三天'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: this.$t('近一周'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: this.$t('近一个月'),
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    };
  },
  // computed: {
  //   time() {
  //   }
  // },
  created() {
    this.initTime();
  },
  methods: {
    getDateValue(date) {
      if (date) {
        const startTime = date[0];
        const endTime = date[1];
        this.date = [startTime, endTime];
      }
    },
    initDate() {
      this.initTime();
    },
    getDate() {
      return this.date;
    },
    initTime() {
      this.date = [moment().subtract(6, 'days').startOf('day').valueOf(), moment().endOf('day').valueOf()];
    }
  },
};
</script>

<style scoped lang="scss">
.form-container-my{
  height:100%;
  .head{
    height: 56px!important;
    background: #F1F1F1;
    padding: 0 25px;
    width: 320px;
    box-sizing: border-box;
    font-weight:bold;
    display: flex;
    align-items: center;
 }
}
// .comp{
//     border:1px dashed #000;
// }
.selectLabel{
  margin: 20px 25px 10px 25px;
  font-size: 14px;
}
.scoreLimit{
  width: 270px;
  margin: 0 25px;
}
.formSlot{
  flex: 1;
  flex-shrink: 0;
  padding-top: 20px;
  overflow: hidden;
}
.selectTime{
  padding:0 25px;
  box-sizing: border-box;
  .selectLabel{
    // margin: 15px 25px;
    font-size: 14px;
  }
  // .dataPicker{
  //   margin: 15px auto;
  // }
}
</style>
