<template>
  <page-layout>
    <div class="result-detail">
      <div class="btn-box">
        <meg-return-button
          :title="$t('返回')"
          :disable="true"
          @click="callback"></meg-return-button>
      </div>
      <div class="content">
        <div class="title-box">
          <div
            v-tooltip="true"
            class="lists__top">
            {{ detail.archiveName }}
          </div>
          <div
            class="lists__bottom">
            <span class="item-box item-box-big">{{ $t('有效线索') }}
              <span class="number">{{ detail.clueCount }}</span>
              {{ $t('条') }}
            </span>
            <span class="item-box item-box-big">{{ $t('抓捕') }}
              <span class="number">{{ detail.catchCount }}</span>
              {{ $t('人') }}
            </span>
            <span class="item-box">
              <meg-icon
                name="time"
                width="12"
                height="12"
                class="results__icon"
                color="#C7CED8">
              </meg-icon>{{ detail.archiveTime }}</span>
            <span
              class="item-box">
              <meg-icon
                name="poi"
                width="12"
                height="12"
                class="results__icon"
                color="#C7CED8"></meg-icon>{{ detail.archiveOrgName }}</span>
            <span
              v-if="detail.policemen && detail.policemen.userNames.length"
              class="item-box">
              <meg-icon
                name="card_face"
                width="12"
                height="12"
                class="results__icon"
                color="#C7CED8"></meg-icon>{{ detail.policemen.userNames.join(',') }}</span>
          </div>
        </div>
        <div class="text-box">
          {{ detail.content }}
        </div>
        <div class="card-box">
          <div
            v-if="images.upload.length"
            class="upload-image-box">
            <div class="img-title">
              {{ $t('图片信息') }}
            </div>
            <meg-card-frame
              tag="div"
              :gap="6"
              :card-min-width="120">
              <div
                class="card"
                v-for="(item,index) in images.upload"
                :key="index">
                <meg-img-container
                  :tile="true"
                  :img-src="item.imageUrl">
                </meg-img-container>
              </div>
            </meg-card-frame>
          </div>
          <div
            class="capture-image-box"
            v-if="images.database.length">
            <div class="img-title">
              {{ $t('身份信息') }}
            </div>
            <meg-card-frame
              tag="div"
              :gap="6"
              :card-min-width="320">
              <div
                class="card"
                v-for="(item,index) in images.database"
                :key="index">
                <database-card
                  :draggable="false"
                  :show-jump-button="false"
                  :show-temporary-button="false"
                  :card-data="item.detailData"></database-card>
              </div>
            </meg-card-frame>
          </div>
          <div
            class="capture-image-box"
            v-if="images.capture.length">
            <div class="img-title">
              {{ $t('抓拍信息') }}
            </div>
            <meg-card-frame
              tag="div"
              :gap="6"
              :card-min-width="244">
              <div
                class="card"
                v-for="(item,index) in images.capture"
                :key="index">
                <capture-card
                  :card-data="item.detailData"
                  :is-show-base-button="[]"></capture-card>
              </div>
            </meg-card-frame>
          </div>
          <div
            class="capture-image-box"
            v-if="images.alarm.length">
            <div class="img-title">
              {{ $t('告警信息') }}
            </div>
            <meg-card-frame
              tag="div"
              :gap="6"
              :card-min-width="320">
              <div
                class="card"
                v-for="(item,index) in images.alarm"
                :key="index">
                <alarm-card
                  :show-store-icon="false"
                  :draggable="true"
                  :show-process-status="false"
                  :card-info="item.detailData"></alarm-card>
              </div>
            </meg-card-frame>
          </div>
        </div>
      </div>
    </div>
  </page-layout>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import moment from 'moment';
import AlarmCard from '../../../common-components/common-alarm-card';
import CaptureCard from '../../../common-components/common-card';
import DatabaseCard from '../../../common-components/common-database-card';
import resultsSrv from '../results.service';

export default {
  name: 'ResultDetail',
  components: {
    CaptureCard,
    AlarmCard,
    DatabaseCard
  },
  props: {},
  data() {
    return {
      detail: {},
      images: {
        'database': [],
        'upload': [],
        'capture': [],
        'alarm': [],
      }
    };
  },
  computed: {},
  watch: {},
  created() {
    if (this.$route.query.id) {
      this.currentId = this.$route.query.id;
      this.getResultDetail();
    }
  },
  mounted() {},
  methods: {
    callback() {
      switchToModule({
        module: 'results',
      });
    },
    /**
     * @description 获取战果详情
     */
    getResultDetail() {
      resultsSrv.getResultDetail({ id: this.currentId }).then((res) => {
        if (res.code === 0) {
          this.detail = { ...res.data };
          this.detail.archiveTime = moment(this.detail.archiveTime).format('YYYY-MM-DD');
          this.detail.images.forEach((item) => {
            this.images[item.type].push(item);
          });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.result-detail {
  height: 100%;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding-left: 18px;
  background: #dbe1e5;
  .btn-box {
    height: 56px;
    display: flex;
    align-items: center;
  }
  .content {
    background: white;
    padding-left: 30px;
    padding-bottom: 82px;
    .text-box {
      font-size: 14px;
      line-height: 23px;
      padding: 30px 0 32px;
      border-bottom: 1px solid #E0E0E0;
      margin-bottom: 20px;
      word-break: break-all;
      padding-right: 30px;
    }
    .title-box {
      .lists__top {
        height: 62px;
        line-height: 62px;

        font-size: 24px;
        color: #435068;
        width: 500px !important;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 700;
      }
      @media screen and (min-width: 1600px) {
        .lists__top {
          width: 800px !important;
        }
      }
      .lists__bottom {
        height: 25px;
        line-height: 25px;
        font-size: 14px;
        .item-box-big {
          font-size: 16px;
        }
        .item-box {
          display: inline-block;
          margin-right: 20px;
          color:  rgba(67,80,104,0.50);
          .number {
            color: #435068;
          }
        }
        .results__icon {
          margin-top: -2px;
          margin-right: 4px;
        }
      }
    }
    .card-box {
      .img-title {
        line-height: 33px;
        font-size: 13px;
        margin-top: 10px;
      }
      .upload-image-box {
        .card {
          position: relative;
          width: 120px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid rgba(210, 214, 222, 0.5);
        }
      }
      .delete-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        height: 20px;
        width: 20px;
        background: rgba(134, 154, 187, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .capture-image-box {
        .card {
          position: relative;
        }
      }
    }
  }
}
</style>
