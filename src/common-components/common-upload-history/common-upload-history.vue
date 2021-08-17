<template>
  <meg-dialog
    :title="$t('最近上传的{count}张照片',{count:imageListData.length})"
    :visible="visible && imageListData.length > 0"
    class="recently-upload-dialog"
    width="1250px"
    body-height="600px"
    :middle="false"
    append-to-body
    modal-append-to-body
    @close="cancel">
    <div class="card-wrapper">
      <meg-card-frame
        :card-min-width="166"
        child-name="card-box">
        <div
          class="card-box"
          v-for="(item, index) in imageListData"
          :key="index">
          <div
            class="card"
            @click="dbiChoose(index, item)">
            <meg-card
              class="card-item"
              :img-src="item.photoUrl">
              <div
                slot="bottom"
                class="bottom">
                <meg-icon
                  name="poi"
                  width="16"
                  height="11"
                  color="#444444">
                </meg-icon>
                <span class="time">{{ item.uploadTime }}</span>
              </div>
            </meg-card>
            <!-- <meg-checkbox
                  :checked="true"
                  @change="iChoose(index, item)"
                  v-if="index === current"
                  class="check">
                </meg-checkbox> -->
          </div>
        </div>
      </meg-card-frame>
    </div>
    <div slot="footer">
      <meg-button
        type="primary"
        @click="confirm">
        {{ $t('确认') }}
      </meg-button>
      <meg-button @click="cancel">
        {{ $t('取消') }}
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import config from '@/utils/config.utils';
import { utils } from '@/utils/utils';

export default {
  name: 'CommonUploadHistory',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    imageListData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      current: '',
      url: '',
      qualityPass: false,
      landmark: {},
      rect: {},
      hint: {},
      body: false,
      flag: false,
      baseUrl: '',
    };
  },
  watch: {
    visible() {
      this.initData();
    },
    imageListData(val) {
      console.log('afddsafdas', val);
    }
  },
  created() {
    this.baseUrl = config.apiPath.service;
  },
  methods: {
    /**
     * 双击选择
     */
    dbiChoose(index, item) {
      if (this.flag || !this.visible) return;
      this.flag = true;
      this.iChoose(index, item);
      this.confirm();
    },
    /**
     * 初始化数据
     */
    initData() {
      this.current = '';
      this.url = '';
      this.qualityPass = false;
      this.landmark = {};
      this.rect = {};
      this.hint = {};
      this.body = false;
    },
    /**
     * 编辑完成按钮派发事件
     */
    confirm() {
      if (this.url === '') {
        this.$message.warning(this.$t('请选择一张图片'));
        return;
      }
      console.log(this.url);
      utils.urlToBase64(this.url).then((base64) => {
        this.$emit('confirm', {
          photoData: base64,
          qualityPass: this.qualityPass,
          landmark: this.landmark,
          rect: this.rect,
          hint: this.hint,
          body: this.body
        });
        this.flag = false;
      });
    },
    /**
     * 关闭模态框事件
     */
    cancel() {
      this.$emit('cancel');
    },
    /**
     * 选择历史图片操作
     * @param {index, url} 当前下表 路径
     */
    iChoose(index, item) {
      if (index === this.current) {
        this.initData();
        return;
      }
      this.current = index;
      this.url = item.photoUrl;
      this.qualityPass = item.qualityPass;
      this.hint = item.hint || {};
      this.landmark = item.landmark || {};
      this.rect = item.rect || {};
      this.body = item.body;
    },
  },
};
</script>

<style lang="scss" scoped>
.recently-upload-dialog{
  div,span,p{
    box-sizing: border-box;
  }
  ::v-deep .meg-dialog__body {
    height: 600px;
    padding-bottom: 20px;
    background: #DCE1E5;
    overflow-y: auto;
  }
  .card-wrapper{
    width: 100%;
  }
  .card-box{
    display: inline-block;
    position: relative;
  }
  .bottom{
    line-height: 30px;
  }
  .time{
    font-size: 12px;
    color: #444444;
  }
  .card{
    width: 100%;
  }
  .check{
    position: absolute;
    top: 10px;
    left: 10px;
  }
}
</style>
