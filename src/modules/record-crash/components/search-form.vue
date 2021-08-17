<template>
  <div class="seach-form">
    <meg-form-container
      :button-text="$t('分析')"
      @search="formSearch"
      @reset="resetForm">
      <div
        slot="header"
        class="form-title">
        {{ $t("档案碰撞") }}
      </div>
      <meg-form
        slot="otherFormElement"
        class="judge-search-form"
        ref="searchForm"
        label-position="top"
        label-width="80px"
        :model="activeFormData">
        <meg-form-item class="photo-form-item">
          <div style="height:100%;">
            <common-img-analysis
              ref="imgAnalysis"
              :max-img-num="1"
              selector-mode="single"
              bottom-height="20px"
              font-size="12px"
              clear-icon
              background="face"
              :analyze-type="[0]"
              upload-prompt-text="拖拽或点击上传图像"
              :init-file="initFile"
              @output="imgFileChange">
            </common-img-analysis>
          </div>
        </meg-form-item>
        <meg-form-item
          :label="$t('活动时间段')">
          <meg-date-picker
            v-model="dateValue"
            :prefix-icon-visible="false"
            format="yyyy-MM-dd HH:mm"
            :default-time="['00:00:00','23:59:59']"
            type="datetimerange"
            :range-separator="$t('至')"
            :start-placeholder="$t('开始日期')"
            :end-placeholder="$t('结束日期')"
            :default-date="'pastWeek'"
            :picker-options="pickerOptions">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item prop="appearCount">
          <div
            slot="label"
            class="input-item-label">
            {{ $t('同行频次阈值') }}
            <span class="item-tips">
              {{ $t('输入范围2-100') }}
            </span>
          </div>
          <meg-input
            v-model.number="activeFormData.appearCount"
            :placeholder="$t('请输入内容')"
            @change="checkType('appearCount')">
            <div slot="suffix">
              {{ $t('次') }}
            </div>
          </meg-input>
        </meg-form-item>
        <meg-form-item
          prop="interval">
          <div
            slot="label"
            class="input-item-label">
            {{ $t('同行间隔时间') }}
            <span class="item-tips">
              {{ $t('输入范围1-300') }}
            </span>
          </div>
          <meg-input
            v-model.number="activeFormData.interval"
            :placeholder="$t('请输入内容')"
            @change="checkType('interval')">
            <div slot="suffix">
              {{ $t('秒') }}
            </div>
          </meg-input>
        </meg-form-item>
        <meg-form-item
          :label="$t('档案类型')">
          <meg-select
            v-model="profileType"
            :placeholder="$t('请选择')">
            <meg-option
              v-for="(item) in recordOptions"
              :key="item.code"
              :label="item.value"
              :value="item.code">
            </meg-option>
          </meg-select>
        </meg-form-item>
        <meg-form-item
          v-if="profileType !== 2"
          :label="$t('底库')">
          <meg-treeselect
            ref="tree"
            :data="libraryData"
            :props="{children: 'items', label: 'name'}"
            :highlight-current="true"
            :show-checkbox="true"
            :expand-on-click-node="false"
            :selected-count-text="$t('已选择{count}底库')"
            :placeholder-text="$t('请选择底库')"
            :all-selected-text="$t('全部')"
            :search-placeholder="$t('输入底库名进行查找')">
          </meg-treeselect>
        </meg-form-item>
      </meg-form>
    </meg-form-container>
    <record-gather
      :visible.sync="recordVisible"
      :match-record-list="matchRecordList"
      :dialog-loading="dialogLoading"
      @selected-record="selectedRecord">
    </record-gather>
  </div>
</template>

<script>
import commonImgAnalysis from '@/common-components/common-img-analysis';
import RecordGather from './record-gather';
import recordCrashSrv from '../record-crash.service.js';

const DefaultFormData = function (interval) {
  this.photos = [];
  this.landmark = {};
  this.hint = {};
  this.appearCount = 2;
  this.interval = interval;
};
export default {
  components: {
    commonImgAnalysis,
    RecordGather
  },
  props: {
    type: {
      type: String,
      default() {
        return 'photo';
      }
    },
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      profileType: -1,
      recordVisible: false,
      dateValue: [],
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      activeFormData: new DefaultFormData(this.peerIntervals),
      initFile: [],
      recordOptions: [
        {
          code: -1,
          value: this.$t('全部档案')
        },
        {
          code: 1,
          value: this.$t('实名档案')
        },
        {
          code: 2,
          value: this.$t('未实名档案')
        },
      ],
      libraryData: [],
      profileId: '',
      matchRecordList: [],
      dialogLoading: false,
    };
  },
  computed: {
    peerIntervals() {
      return parseFloat(this.$store.getters.system.peerIntervals.value);
    }
  },
  created() {
    this.getAlbumList();
    this.activeFormData = new DefaultFormData(this.peerIntervals);
  },
  methods: {
    getAlbumList() {
      recordCrashSrv.getAlbumList().then((res) => {
        if (res.code === 0) {
          const albumListRoot = {
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: res.data
          };
          this.libraryData = [albumListRoot];
        }
      });
    },
    checkType(type) {
      const value = this.activeFormData[type];
      if (type === 'appearCount') {
        if (!(typeof value === 'number' && value >= 2 && value <= 100)) {
          this.activeFormData[type] = 2;
        }
      } else {
        if (!(typeof value === 'number' && value >= 1 && value <= 300)) {  // eslint-disable-line
          this.activeFormData[type] = this.peerIntervals;
        }
      }
    },
    resetForm() {
      this.profileId = '';
      this.dateValue = [new Date(new Date().getTime() - 3600 * 1000 * 24 * 7), new Date()];
      this.initFile = [];
      this.$refs.searchForm.resetFields();
      this.activeFormData = new DefaultFormData(this.peerIntervals);
      this.profileType = -1;
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedKeys([]);
      }
    },
    formSearch() {
      if (this.dateValue && this.dateValue[0] && this.dateValue[1]) {
        this.activeFormData.startTime = this.dateValue[0].getTime();
        this.activeFormData.endTime = this.dateValue[1].getTime();
      } else {
        this.$message.warning(this.$t('请选择时间'));
        return;
      }
      // 如果是全部档案不传档案类型
      if (this.profileType !== -1) {
        this.activeFormData.profileType = this.profileType;
      } else {
        delete this.activeFormData.profileType;
      }
      // 如果是未实名档案不传底库ID
      if (this.profileType !== 2) {
        this.activeFormData.albumIds = this.$refs.tree.getCheckedNodes().map((item) => item.coreId).filter((item) => item);
      } else {
        delete this.activeFormData.albumIds;
      }
      this.$refs.searchForm.validate((valid) => {
        if (!this.activeFormData.startTime || !this.activeFormData.endTime) {
          this.$message.warning(this.$t('请选择时间'));
          return;
        }
        if (this.activeFormData.photos.length === 0) {
          this.$message.error(this.$t('请上传图片'));
          return;
        }
        if (valid) {
          // 在此处判断是否有档案Id,如果有档案,直接检索，没有的话，检索档案，再执行碰撞
          if (this.profileId) {
            this.$emit('search-crash', this.activeFormData, this.profileId);
          } else {
            this.photoSelcetRecord();
          }
        } else {
          this.$message.error(this.$t('请填写完整的搜索信息'));
        }
      });
    },
    photoSelcetRecord() {
      this.matchRecordList = [];
      this.recordVisible = true;
      this.dialogLoading = true;
      const params = {
        condition: {
          photoCondition: {
            photoData: this.activeFormData.photos,
            landmark: this.activeFormData.landmark,
            rect: this.activeFormData.rect,
            hint: this.activeFormData.hint
          },
          realNameCondition: {}
        },
        pageNo: 1,
        pageSize: 100
      };
      recordCrashSrv.recordPhotoSelect(params).then((res) => {
        this.dialogLoading = false;
        if (res.code === 0) {
          this.matchRecordList = res.data.records;
        }
      });
    },
    selectedRecord(selecedRecordData) {
      if (selecedRecordData && selecedRecordData.profileId) {
        this.profileId = selecedRecordData.profileId;
        this.$emit('search-crash', this.activeFormData, this.profileId);
      } else {
        this.$message.warning(this.$t('无档案信息'));
      }
    },
    /**
     * 接受图片上传组件的图片结果
     * @param {arr} 图片数组
     */
    imgFileChange(arr) {
      this.profileId = '';
      if (!arr.length) {
        this.activeFormData.photos = [];
        this.activeFormData.landmark = null;
        this.activeFormData.hint = null;
        this.activeFormData.rect = null;
        return;
      }
      const [photoInfo] = arr;
      const { images } = photoInfo;
      this.activeFormData = {
        ...this.activeFormData,
        ...images[0] && images[0].locator,
        photos: photoInfo.photo,
      };
    },
  }
};
</script>
<style lang='scss' scoped>
::v-deep .meg-form-item__content{
  height: 100%;
  .img-upload .upload-select .upload-container .upload-prompt-text {
    top: 80%;
  }
}
.seach-form ::v-deep .meg-select {
  width: 100%;
}
.input-item-label{
  position: relative;
  width: 100%;
}
.item-tips{
  position: absolute;
  right: -180px;
  color:#a1a8b4;
}
.seach-form{
  width: 320px;
  .judge-search-form {
    padding: 20px 25px 0;
    overflow: scroll;
  }
  .form-title{
    width: 100%;
    height: 56px;
    line-height: 56px;
    padding-left: 20px;
    background: #EEEEEE;
    font-size: 16px;
    color: #435068;
    font-family: SourceHanSansCN;
    font-weight: 900;
  }
  .photo-form-item{
    margin: 0px auto 30px;
    height: 150px;
    width: 150px;
    div.el-form-item__content{
      height: 100%;
      line-height: 14px;
    }
  }
  .similarity{
    width: 76px;
    .el-input__inner{
      padding: 0;
      text-align: center;
    }
  }
  .search-item-container{
  height: 70px;
  }
  .search-item-container p{
    line-height: 26px;
    font-size: 12px;
    color: #435068;
  }
}
.form-item-error{
  color: #f05353;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}
</style>
