<template>
  <page-layout>
    <div class="human-fusion">
      <search-form
        @search-data="searchData">
      </search-form>
      <div
        class="human-fusion-content"
        v-loading="searchLoadding">
        <div
          v-background="usefulHumanData.length > 0 ? false : {icon:'icon_3',text:$t('暂无结果')}"
          class="content-background">
          <div class="content-title">
            {{ $t('分析结果：共{count}条', { count: usefulHumanData.length }) }}
          </div>
          <meg-scrollbar>
            <div
              class="content-body">
              <meg-card-frame
                tag="div"
                v-if="searchType === 'body'"
                :gap="5"
                :card-min-width="270">
                <body-card
                  v-for="(item, ind) of usefulHumanData"
                  :key="ind"
                  :card-data="item"
                  @click.native="jumpDetail(item, 'body')">
                </body-card>
              </meg-card-frame>
              <meg-card-frame
                class="face-content"
                tag="div"
                v-if="searchType === 'face'"
                :card-min-width="250">
                <record-card
                  v-for="(item, ind) of usefulHumanData"
                  :card-data="item"
                  :key="ind"
                  card-type="score"
                  @click.native="jumpDetail(item, 'face')">
                </record-card>
              </meg-card-frame>
              <div
                class="load-more-box"
                @click="loadMore"
                v-if="isShowLoadMore">
                <meg-button>
                  {{ $t('加载更多') }}
                </meg-button>
              </div>
            </div>
          </meg-scrollbar>
        </div>
      </div>
    </div>
  </page-layout>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import recordCard from '@/modules/record-crash/components/record-card';
import searchForm from '../components/search-form.vue';
import bodyCard from '../components/body-card';
import humanFusionSrv from '../human-fusion.service';

const PAGESIZE = 60;
export default {
  components: {
    searchForm,
    bodyCard,
    recordCard
  },
  data() {
    return {
      searchType: 'body',
      humanAllData: [],
      usefulHumanData: [],
      searchLoadding: false,
      updatePhoto: '',
      searchFace: false,
      searchBody: false
    };
  },
  computed: {
    isShowLoadMore() {
      return this.humanAllData.length > this.usefulHumanData.length;
    }
  },
  methods: {
    jumpDetail(item, type) {
      let query = {};
      item.type = type;
      item.updatePhoto = this.updatePhoto;
      if (type === 'body') {
        query.bodyCapturedTime = item.body.captureTime;
        query.bodyId = item.body.id;
        query.profileId = item.profile.profileId;
        query.bodyUrl = item.body.url;
        query.bodyScore = item.body.score;
        query.bodyCaptureDate = item.body.captureDate;
        query.bodyCameraType = item.body.cameraType;
        query.bodyCameraName = item.body.cameraName;
        query.profileCoverPageImgUri = item.profile.coverPageImgUri;
        query.profileName = (item.profile.name && item.profile.name[0]);
        query.profileAlbum = (item.profile.albumList && item.profile.albumList[0]);
        query.profileCardNo = item.profile.cardNo;
      } else {
        query = item;
      }
      query.type = type;
      sessionStorage.setItem('humanPhoto', this.updatePhoto);
      switchToModule({
        module: 'human-fusion',
        child: 'capture-detail',
        query
      });
    },
    searchData(type, searchFormData) {
      this.updatePhoto = searchFormData.uploadPhoto;
      this.searchLoadding = true;
      this.humanAllData = [];
      this.usefulHumanData = [];
      this.searchType = type;
      if (type === 'body') {
        this.bodySearch(searchFormData);
      } else {
        this.faceSearch(searchFormData);
      }
    },
    bodySearch(data) {
      if (this.searchBody) return;
      this.searchBody = true;
      const params = {
        photo: data.photo,
        startTime: data.dateValue[0].getTime(),
        endTime: data.dateValue[1].getTime(),
        cameraIds: data.cameraIds,
        feature: data.feature,
        bodyId: data.bodyId
      };
      humanFusionSrv.bodySearchList(params).then((res) => {
        this.searchLoadding = false;
        this.searchBody = false;
        if (res.code === 0) {
          this.humanAllData = res.data;
          this.loadMore();
        }
      });
    },
    faceSearch(data) {
      if (this.searchFace) return;
      this.searchFace = true;
      const params = {
        photo: data.photo,
        landmark: data.landmark,
      };
      humanFusionSrv.faceSearchList(params).then((res) => {
        this.searchLoadding = false;
        this.searchFace = false;
        if (res.code === 0) {
          this.humanAllData = res.data;
          this.loadMore();
        }
      });
    },
    /**
     * @description 裁切数据
     */
    loadMore() {
      let item = [];
      if (this.humanAllData.length > PAGESIZE) {
        item = this.humanAllData.splice(0, PAGESIZE);
      } else {
        item = this.humanAllData.splice(0);
      }
      this.usefulHumanData = this.usefulHumanData.concat(item);
    },
  }
};
</script>
<style lang='scss' scoped>
.human-fusion{
  display: flex;
  height: 100%;
  &-content{
    flex: 1;
    background: #DBE1E5;
    padding: 0 19px;
    .content-background{
      height: 100%;
    }
    .content-title{
      height: 56px;
      line-height: 56px;
      color:#5A6676;
      font-size: 12px;
    }
    .content-body{
      height: calc(100% - 56px);
      padding-bottom: 60px;
    }
  }
  .human-fusion-content{
    ::v-deep .meg-scrollbar{
      height: calc(100% - 56px);
    }
  }
  .face-content {
    min-width: 1000px;
  }
  .load-more-box{
    text-align: center;
    width: 100%;
    height: 56px;
    button{
      width: 300px;
      margin-top: 10px;
    }
  }
}
</style>
