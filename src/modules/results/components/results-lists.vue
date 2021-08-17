<template>
  <div class="results__lists__main">
    <div class="results-main-top clearfix">
      <div class="results-datepicker fl">
        <meg-date-picker
          :prefix-icon-visible="false"
          type="datetimerange"
          @change="getDateValue"
          v-model="tempValue"
          :start-placeholder="$t('开始日期')"
          :end-placeholder="$t('结束日期')"
          :range-separator="$t('至')"
          :picker-options="pickerOptions">
        </meg-date-picker>
      </div>
      <div class="results__input fl">
        <div
          class="icon__button1">
          <meg-input
            v-model="searchParams.key"
            :placeholder="$t('请输入战果名称')">
          </meg-input>
        </div>
        <div
          class="icon__button"
          @click="resultsSearch">
          <span class="big-icon">
            <meg-icon
              name="search"
              width="15"
              height="15"
              color="#ffffff #5a6676"></meg-icon>
          </span>
        </div>
      </div>
      <div class="results__release fr">
        <meg-button
          v-if="manageAuth"
          @click="newResultsPublic"
          type="primary">
          {{ $t('发布战果') }}
        </meg-button>
      </div>
    </div>
    <div
      v-loading="loading"
      style="width:100%;height:100%">
      <div
        v-background="!videoBack ? false:{icon:'icon_1',text:$t('暂无数据')}"
        class="results__main__lists">
        <ul class="results__main__center">
          <li

            v-for="(list,index) in resultsLists"
            :key="index"
            @click="jumpResultsDetails(list.id)"
            class="results__center__lists">
            <div class="content">
              <div
                v-tooltip="true"
                class="lists__top">
                {{ list.archiveName }}
              </div>
              <div
                class="lists__bottom">
                <span class="item-box">{{ $t('有效线索') }}
                  <span class="number">{{ list.clueCount }}</span>
                  {{ $t('条') }}</span>
                <span class="item-box">{{ $t('抓捕') }}

                  <span class="number">{{ list.catchCount }}</span>
                  {{ $t('人') }}</span>
                <span class="item-box">
                  <meg-icon
                    name="time"
                    width="12"
                    height="12"
                    class="results__icon"
                    color="#C7CED8">
                  </meg-icon>{{ list.archiveTime }}</span>
                <span
                  class="item-box"
                  v-tooltip="true">
                  <meg-icon
                    name="poi"
                    width="12"
                    height="12"
                    class="results__icon"
                    color="#C7CED8"></meg-icon>{{ list.archiveOrgName }}</span>
                <span
                  class="item-box"
                  v-tooltip="true">
                  <meg-icon
                    name="card_face"
                    width="12"
                    height="12"
                    class="results__icon"
                    color="#C7CED8"></meg-icon>{{ list.policemanName }}</span>
              </div>
            </div>
            <div
              v-if="manageAuth"
              class="btn-box">
              <span>
                <meg-icon
                  @click.stop="edit(list.id)"
                  color="#869ABB"
                  width="16"
                  height="16"
                  name="edit_photo"></meg-icon>
              </span>

              <meg-icon
                @click.stop="openMessageBox(list.id)"
                color="#869ABB"
                width="16"
                height="16"
                name="mission_del"></meg-icon>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import moment from 'moment';

export default {
  components: {
  },
  props: {
    resultsLists: {
      type: Array,
      default: () => ([])
    },
    videoBack: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tempValue: [],
      lists: [],
      ifAuth: false,
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      },
      manageAuth: false,
      searchParams: {
        start: '',
        end: '',
        key: '',
      }
    };
  },
  watch: {
    input(input) {
      this.inputChange(input);
    },

  },
  created() {
    this.getAuth();
  },
  methods: {
    getAuth() {
      this.manageAuth = this.$store.getters.modulePermissonsByAlias('results', 'resultManage');
    },
    /**
     * @description 触发搜索
     */
    resultsSearch() {
      this.$emit('search', this.searchParams);
    },

    edit(id) {
      switchToModule({
        module: 'manage-result',
        query: {
          id
        }
      });
    },
    /**
     * 新建战果时触发
     * @param
     * @returns
     */
    newResultsPublic() {
      switchToModule({
        module: 'manage-result'
      });
    },
    /**
     * @description 确认删除弹框
     * @param {string} id 要删除的战果id
     */
    openMessageBox(id) {
      this.$confirm(this.$t('此操作将删除该战果, 是否继续?'), this.$t('确定要删除'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.$emit('delete', id);
      }).catch(() => {

      });
    },
    /**
     * input值改变后触发
     * @param {val} input值
     * @returns
     */
    inputChange(val) {
      this.$emit('inputValue', val);
    },

    /**
     * 跳转到详情页
     * @param {id} 要查看详情的id
     * @returns
     */
    jumpResultsDetails(id) {
      switchToModule({
        module: 'result-detail',
        query: {
          id
        }
      });
    },
    /**
     * 获得数据
     * @param
     * @returns
     */
    gatData(data) {
      console.log(data);
    },
    /**
     * 时间日期改变时触发
     * @param {date} 改变后的时间
     * @returns
     */
    getDateValue(date) {
      if (date) {
        this.searchParams.start = date[0] ? moment(date[0]).format('x') : '';
        this.searchParams.end = date[1] ? moment(date[1]).format('x') : '';
      } else {
        this.searchParams.start = '';
        this.searchParams.end = '';
      }

      this.resultsSearch();
    }
  }
};
</script>

<style lang='scss' scoped>
.icon__button {
  float: left;
  height: 34px;
  width: 40px;
  background-color: white;
  line-height: 32px;
  padding-left: 13px;
  box-sizing: border-box;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  margin-left: -1px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}
.icon__button1 {
  float: left;
  width: 230px;
  color: #999999;
}
.fl {
  float: left;
}
.fr {
  float: right;
}
.list__input {
  margin-top: 11px;
  margin-right: 5px;
  cursor: pointer;
}
.results__lists__main {
  width: 100%;
  height: calc(100% - 50px);
  background-color: #eceeef;
  box-sizing: border-box;
}
.results-main-top {
  width: 100%;
  height: 54px;
  padding: 10px 20px;
  background-color: #eceeef;
  box-sizing: border-box;
  .results-datepicker {
    width: 270px;
  }
}
.results__input {
  width: 350px;
  margin-left: 10px;
}
.results__main__center {
  width: calc(100% - 40px);
  margin: 0 20px;
  overflow: hidden;
  height: calc(100% - 7px);
  box-sizing: border-box;
  overflow: auto;
}
.results__main__lists {
  height: calc(100% - 54px);
}
.results__center__lists {
  width: 100%;
  height: 100px;
  margin-bottom: 6px;
  padding-left: 20px;
  background-color: white;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  .content {
  }
  .btn-box {
    position: absolute;
    height: 30px;
    width: 100px;
    top: 22px;
    right: 20px;
    text-align: right;
    span {
      &:first-of-type {
        margin-right: 23px;
      }
    }
  }
}
.results__center__lists:hover {
  background: #d9ebfd;
}
.results__center__lists > div {
  width: 100%;
}
.lists__top {
  height: 62px;
  line-height: 62px;

  font-size: 18px;
  color: #435068;
  width: 500px !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
@media screen and (min-width: 1600px) {
  .lists__top {
    width: 800px !important;
  }
}
.lists__center {
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  padding-top: 3px;
  box-sizing: border-box;
  position: relative;
}
.lists__center__right {
  width: 450px;
  padding-left: 30px;
  box-sizing: border-box;
  color: #989898;
  margin-top: -6px;
}
.lists__center__right span {
  display: inline-block;
  margin-right: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90px;
  max-width: 150px;
  font-size: 14px;
}
.lists__center__right span:nth-child(4) {
  width: 20px;
  position: absolute;
  right: 0;
}
.lists__bottom {
  height: 25px;
  line-height: 25px;
  font-size: 14px;
  .item-box {
    display: inline-block;
    margin-right: 20px;
    width: 102px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgba(67, 80, 104, 0.5);
    .number {
      color: #435068;
    }
  }
  .results__icon {
    margin-top: -2px;
    margin-right: 4px;
  }
}

.lists__edit {
  display: inline-block;
  width: 30px;
  height: 25px;
  line-height: 25px;
  position: relative;
  right: 0;
  top: -8px;
}
.lists__edit1 {
  display: inline-block;
  width: 30px;
  height: 25px;
  line-height: 25px;
  position: relative;
  right: 0;
  top: -8px;
}
</style>
