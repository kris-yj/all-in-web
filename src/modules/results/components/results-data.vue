<template>
  <div class="results__count">
    <div class="count__title">
      <div class="title__top">
        <span>{{ $t('累计战果') }}</span>
        <span>{{ $t('有效线索数') }}</span>
        <span>{{ $t('抓获人数') }}</span>
      </div>
      <div class="title__bottom">
        <span>{{ totalArchives }}</span>
        <span>{{ totalClues }}</span>
        <span>{{ totalCatches }}</span>
      </div>
    </div>
    <div class="count__chart">
      <p
        class="count__num">
        {{ $t('战果数') }}
      </p>
      <div
        class="count__chart__lists">
        <meg-histogram
          :data="chartData"
          :extend="extend"
          height="200px"></meg-histogram>
      </div>
    </div>
    <div class="count__lists">
      <p class="lists__name">
        {{ $t('人员贡献') }}
      </p>
      <div>
        <div
          class="count__left"
          v-for="(item,index) in countLeft"
          :key="index">
          <div class="item__rank">
            <span
              class="cry"
              :class="`cry${index+1}`">{{ index+1 }}</span><span
                v-tooltip="true">{{ item.userName }}</span><span>{{ item.num }}</span>
          </div>
        </div>
      </div>
      <div>
        <div
          class="count__left"
          v-for="(item,index) in countRight"
          :key="index">
          <div class="item__rank">
            <span
              class="cry">{{ index+4 }}</span><span
              v-tooltip="true">{{ item.userName }}</span><span>{{ item.num }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="count__devote">
      <p class="devote__name">
        {{ $t('战果周排行') }}
      </p>
      <div
        class="devote__icon">
        <span v-if="data3.length">
          <meg-icon
            name="rank_1"
            width="30"
            height="30"
            color="#FBC647 #F3BC39">
          </meg-icon>
        </span>
        <span v-if="data3.length>1">
          <meg-icon
            name="rank_2"
            width="30"
            height="30"
            color="#DCD9D3 #DED2D5">
          </meg-icon>
        </span>
        <span v-if="data3.length>2">
          <meg-icon
            name="rank_3"
            width="30"
            height="30"
            color="#B89E80  #A79984">
          </meg-icon>
        </span>
      </div>
      <p class="devote__department">
        <span
          v-for="(item,index) in data3"
          :key="index"
          v-tooltip="true">
          {{ item.archiveOrgName }}
        </span>
      </p>
      <p class="devote__num">
        <span
          v-for="(item,index) in data3"
          :key="index">
          {{ item.num }}
        </span>
      </p>
    </div>
  </div>
</template>

<script>

export default {
  components: {

  },
  props: {
    countData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const self = this;
    this.opt = {
      series(v) {
        if (!v) return v;
        v.forEach((i) => {
          i.barMaxWidth = 60;
        });
        return v;
      },
      grid: {
        left: 50,
        right: 50,
      },
    };
    this.extend = {
      ...this.opt,
      tooltip(v) {
        v.formatter = (a) => {
          const index = a[0].dataIndex;
          const labelData = a[0];
          const data = self.AlbumWarningData[index];
          const arr = [];
          let str = '';
          for (let i = 0; i < data.length; i += 1) {
            str += data[i];
            if (str.length === 10) {
              arr.push(str);
              str = '';
            }
          }
          if (str !== '') {
            arr.push(str);
          }
          // arr.push(`<div style="display:flex; justify-content: center; align-items:center">${data.marker} ${data.value}</div>`);
          arr.push(`${labelData.marker}${labelData.value}`);
          return arr.join('</br>');
        };
        return v;
      },
      color: '#42A5F5',
      legend: {
        show: false,
      },
      grid: {
        top: '10',
        bottom: '10',
        backgroundColor: ''
      },
      series: {
        barWidth: 24
      },
      // tooltip: {
      //   trigger: 'item',
      //   axisPointer: { // 坐标轴指示器，坐标轴触发有效
      //     type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      //   },
      //   formatter(item) {
      //     // console.log(item, a, b);
      //     return `${item.name}:${item.data}`;
      //   }
      // },
      yAxis: {
        minInterval: 1,
        splitLine: {
          lineStyle: {
            type: 'dotted',

          }
        }
      },

    };
    return {
      data1: [],
      data2: [],
      data3: [],
      countLeft: [],
      countRight: [],
      totalArchives: '',
      totalCatches: '',
      totalClues: '',
      countDataLists: {},
      chartData: {
        columns: ['部门', '战果数'],
        rows: [
          // {
          //   '部门': '部门1', '战果数': 313
          // },
          // {
          //   '部门': '部门2', '战果数': 515
          // },
          // {
          //   '部门': '部门3', '战果数': 378
          // },
          // {
          //   '部门': '部门4', '战果数': 323
          // },
          // {
          //   '部门': '部门5', '战果数': 345
          // }
        ]
      },
      AlbumWarningData: [],
    };
  },
  watch: {
    countData: {
      handler() {
        this.changeData();
      },
      deep: true
    }
  },

  methods: {
    filterStr(str) {
      if (str.length > 2) {
        str = `${str.substr(0, 2)}··`;
      }
      return str;
    },
    /**
     * 将后台返回的数据进行处理
     * @param
     * @returns
     */
    changeData() {
      this.countDataLists = JSON.parse(JSON.stringify(this.countData));
      this.data1 = this.countDataLists.topArchives;
      this.data2 = this.countDataLists.topArchiveByPoliceman;
      this.data3 = this.countDataLists.topArchiveWeekly;
      this.totalArchives = this.countDataLists.totalArchives;
      this.totalCatches = this.countDataLists.totalCatches;
      this.totalClues = this.countDataLists.totalClues;
      if (this.data1 && this.data1.length > 4) {
        this.data1 = this.data1.slice(0, 5);
      }
      if (this.data2 && this.data2.length > 5) {
        this.data2 = this.data2.slice(0, 6);
      }
      if (this.data3 && this.data3.length > 2) {
        this.data3 = this.data3.slice(0, 3);
      }
      const arrRows = [];
      if (this.data1) {
        this.AlbumWarningData = [];
        this.data1.forEach((item) => {
        // this.chartData.rows[0]=item.archiveOrgName
          const jsonItem = {};
          jsonItem['部门'] = this.filterStr(item.archiveOrgName);
          jsonItem['战果数'] = item.num;
          arrRows.push(jsonItem);
          this.AlbumWarningData.push(item.archiveOrgName);
        });
      }
      const chartDataNew = JSON.parse(JSON.stringify(this.chartData));
      chartDataNew.rows = arrRows;
      this.chartData = chartDataNew;
      console.log('this.chartData', this.chartData);
      if (this.data2) {
        this.countLeft = this.data2.slice(0, 3);
        this.countRight = this.data2.slice(3, 6);
      }
      if (this.data3) {
        this.data3 = this.data3.slice(0, 3);
      }
    }
  }
};
</script>

<style lang='scss' scoped>
.fl {
  float: left;
}
.fr {
  float: right;
}
.clearfix:after {
  display: block;
  clear: both;
  content: "";
}
.clearfix {
  zoom: 1;
}
.results__count {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  .count__title {
    width: 100%;
    padding: 16px 0px 17px;
    box-sizing: border-box;
    border-bottom: 1px solid #efefef;
    .title__top,
    .title__bottom {
      display: flex;
      span {
        flex: 1;
        width: 33.3%;
      }
      & > span:nth-of-type(2) {
        text-align: center;
      }
      & > span:first-of-type {
        text-align: left;
      }
      & > span:last-of-type {
        text-align: right;
      }
    }
    .title__top span {
      height: 24px;
      line-height: 24px;
      font-size: 14px;
      color: #435068;
      font-weight: bold;
    }

    .title__bottom span {
      height: 26px;
      line-height: 26px;
      font-size: 24px;
      color: #435068;
      font-family: "HemiHead";
    }
  }
  .count__chart {
    padding-bottom: 22px;
    border-bottom: 1px solid #efefef;
    .count__num {
      font-size: 15px;
      line-height: 51px;
      font-weight: 700;
      margin-top: 4px;
    }
    .count__chart__lists {
      width: 100%;
      height: 187px;
      box-sizing: border-box;
    }
  }
  .count__lists {
    overflow: hidden;
    & > div {
      width: 49%;
      float: left;
    }
    .lists__name {
      font-size: 15px;
      line-height: 51px;
      font-weight: 700;
      margin-top: 4px;
    }
    .count__left {
      .item__rank {
        width: 100%;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-bottom: 20px;
      }
    }
    .item__rank span {
      &:nth-child(2) {
        display: inline-block;
        width: 70px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-left: 8px;
        font-size: 14px;
        color: #333333;
      }
      &:nth-child(3) {
        font-size: 18px;
        font-family: "HemiHead";
      }
    }
    padding-bottom: 3px;
    border-bottom: 1px solid #efefef;
  }
  .count__devote {
    .devote__name {
      font-size: 15px;
      line-height: 51px;
      font-weight: 700;
      margin-top: 4px;
    }
    .devote__icon {
      width: 100%;
      display: flex;
      align-items: center;
      span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 33.3%;
        box-sizing: border-box;
      }
    }
    .devote__department {
      span {
        display: inline-block;
        width: 33.3%;
        box-sizing: border-box;
        font-size: 14px;
        color: #869abb;
        text-align: center;
        height: 38px;
        line-height: 38px;
        padding-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .devote__num {
      span {
        display: inline-block;
        width: 33.3%;
        box-sizing: border-box;
        font-size: 24px;
        color: #435068;
        text-align: center;
        height: 25px;
        line-height: 25px;
        font-family: "HemiHead";
        padding-top: 6px;
      }
    }
  }
}
.i18n-en-US {
  .count__title {
    padding: 25px 10px;
    box-sizing: border-box;
  }
  .title__top span {
    text-align: center;
  }
  .title__bottom span {
    text-align: center;
  }
  .title__top span {
    font-size: 12px;
  }
}

.rankIcon1 {
  color: #d83c3c;
}
.rankIcon2 {
  color: #f67e49;
}
.rankIcon3 {
  color: #ebbf92;
}
.cry {
  display: inline-block;
  width: 19px;
  height: 19px;
  text-align: center;
  line-height: 19px;
  border-radius: 50%;
  background-color: #89969f;
  color: #FBC0C0;
  font-size: 14px;
}
.cry1 {
  display: inline-block;

  text-align: center;
  border-radius: 50%;
  background-color: #d83c3c;
  color:#FBC0C0;
  font-size: 12px;
}
.cry2 {
  display: inline-block;
  text-align: center;
  border-radius: 50%;
  background-color: #F67E49;
  color:#F9CAB5;
  font-size: 12px;
}
.cry3 {
  display: inline-block;
  text-align: center;
  border-radius: 50%;
  background-color: #B68356;
  color:#EBBF92;
  font-size: 12px;
}
</style>
