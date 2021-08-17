<template>
  <page-layout>
    <div class="person__card">
      <div
        class="card__title">
        <meg-return-button
          max-width="800px"
          class="return__button"
          :disable="true"
          :title="jobName || ''"
          @click="returnLits"></meg-return-button>
        <span
          class="return__title">{{ $t('共分析') }}<span style="font-size:14px"> {{ fileNum }} </span>{{ $t('人') }}</span>
      </div>
      <div
        v-loading="loading"
        style="width:100%;height: calc(100% - 53px)">
        <div
          v-background="videoBack"
          class="content__container">
          <meg-scrollbar
            @scroll-bottom="scrollBottomFn">
            <meg-card-frame
              :card-min-width="160">
              <div
                class="card-frame-child"
                v-for="(item,index) in cardLists"
                :key="index">
                <meg-card
                  :img-src="item.uploadPhotoUrl">
                  <div
                    class="bottom__list"
                    slot="bottom">
                    <p
                      v-tooltip="true"
                      class=" file__name">
                      {{ item.uploadPhotoName }}
                    </p>
                    <p class=" more__lists">
                      <meg-button
                        @click="moreData(item.uploadPhotoId,item.searchResultCount)">
                        {{ $t('查看更多') }}({{ item.searchResultCount }})
                      </meg-button>
                    </p>
                  </div>
                </meg-card>
              </div>
            </meg-card-frame>
          </meg-scrollbar>
        </div>
      </div>
    </div>
  </page-layout>
</template>

<script>
import MultiPersonSrv from '@/modules/multi-person/multi-person.service.js';
import { switchToModule } from '@/utils/utils.js';

export default {
  components: {
  },
  data() {
    return {
      cardData: [],
      cardLists: [],
      listsLength: '',
      loading: true,
      pageNo: 1,
      pageSize: 60,
      fileNum: 0,
      jobName: this.$t('返回'),
      videoBack: false,
      jobId: ''
    };
  },
  created() {
    this.getData();
    this.jobName = this.$route.queryjobName;
    if (this.jobName) {
      localStorage.setItem('videoMoreJobName', this.jobName);
    }
    this.jobName = localStorage.getItem('videoMoreJobName');
  },
  methods: {
    moreData(id, num) {
      if (num > 0) {
        const query = { uid: id, jobName: this.jobName };
        switchToModule({
          module: 'multi-person',
          child: 'more-card',
          query
        });
      }
    },
    /**
       * 返回上一个路由页面
       * @augments
       */
    returnLits() {
      this.$router.go(-1);
    },
    /**
       * 获取上传图像卡片数据
       * @augments
       */
    getData() {
      const params = {};
      this.jobId = this.$route.query.uid;
      if (this.jobId) {
        localStorage.setItem('videoSearchLists', this.jobId);
      }
      this.jobId = localStorage.getItem('videoSearchLists');
      params.jobId = this.jobId;
      params.pageNo = this.pageNo;
      params.pageSize = this.pageSize;
      MultiPersonSrv.personLists({ jobId: this.jobId, params }).then((response) => {
        this.cardLists = response.data.records;
        this.fileNum = response.data.totalRecords;
        this.loading = false;
        if (this.cardLists.length === 0) {
          this.videoBack = true;
        }
      });
    },
    /**
       * 当滚动条滚动到底时加载更多数据
       * @augments
       */
    scrollBottomFn() {
      this.loading = true;
      this.pageNo += 1;
      const params = {};
      params.jobId = this.$route.query.uid;
      params.pageNo = this.pageNo;
      params.pageSize = this.pageSize;
      MultiPersonSrv.personLists({ jobId: this.jobId, params }).then((response) => {
        this.cardLists = this.cardLists.concat(response.data.records);
        this.loading = false;
      });
    },
  }
};
</script>

<style scoped>
.person__card{
    width:100%;
    height: 100%;
    background-color: #D1D5DD;
}
.card__title{
    height: 53px;
    line-height: 53px;
}
.results__icon2{
  margin-top: -2px;
  transform:rotate(90deg);
  margin-right: 8px;
  cursor: pointer;

}

.return__lists{
  display: inline-block;
  margin-left:15px;

}
.return__title{
position: relative;
top:-10px;
}
.return__button{
    display: inline-block;
    height: 16px;
    line-height: 16px;
    padding-top: 15px;
    margin-left: 15px;
}

.card__title >span:nth-child(2){
  display: inline-block;
  margin-left: 20px;
  font-size: 12px;
  color: #435068 ;
}
.content__container{
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  height: calc(100% - 53px);
  overflow: auto;
}
.more__lists{
  font-size: 12px;
  text-align: center;
  margin: 0 auto;
}
.file__name{
  width: 136px;
  height: 34px;
  text-align: center;
  color: #5A6676 ;
  font-size: 12px;
  margin: 5px auto;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap
}
.bottom__list{
  padding-bottom: 10px;
}
</style>
