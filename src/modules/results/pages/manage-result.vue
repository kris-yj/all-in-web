<template>
  <page-layout>
    <div class="manage-result">
      <div class="btn-box">
        <meg-button
          v-if="!currentId"
          @click="create"
          type="primary">
          {{ $t('发布战果') }}
        </meg-button>
        <meg-button
          v-else
          @click="editResult"
          type="primary">
          {{ $t('确认编辑') }}
        </meg-button>
        <meg-button
          class="right"
          @click="cancel">
          {{ $t('取消编辑') }}
        </meg-button>
      </div>
      <div class="content">
        <!-- <div
        contenteditable
        class="title"></div> -->
        <meg-form
          label-position="top"
          :rules="rules"
          ref="form"
          :model="form">
          <meg-form-item
            prop="archiveName">
            <meg-input
              type="text"
              maxlength="100"
              clearable
              v-model.trim="form.archiveName"
              :placeholder="$t('请输入战果标题(最多100个字符)')"
              class="title"></meg-input>
          </meg-form-item>
          <div class="item-box">
            <meg-form-item
              class="item"
              :label="$t('填报时间')"
              prop="archiveTime">
              <meg-date-picker
                @change="showNewDate"
                icon-align="right"
                v-model="form.archiveTime"
                type="datetime"
                :picker-options="pickerOptions"
                :placeholder="$t('选择日期时间')">
              </meg-date-picker>
            </meg-form-item>
            <meg-form-item
              class="item"
              :label="$t('有效线索数')"
              prop="clueCount">
              <meg-input v-model="form.clueCount"></meg-input>
            </meg-form-item>
            <meg-form-item
              class="item"
              :label="$t('抓获人数')"
              prop="catchCount">
              <meg-input v-model="form.catchCount"></meg-input>
            </meg-form-item>
          </div>
          <div class="item-box">
            <meg-form-item
              class="item"
              :label="$t('部门选择')"
              prop="archiveOrgName">
              <meg-treeselect
                ref="tree"
                :data="deptTree"
                :highlight-current="true"
                :show-count="false"
                :expand-on-click-node="false"
                :single-check="true"
                :props="deptTreeProps"
                :hide-popover-when-checked="true"
                :placeholder-text="$t('请选择部门')"
                :search-placeholder="$t('请输入关键词检索')"
                @node-click="onCheckChange">
              </meg-treeselect>
            </meg-form-item>
            <meg-form-item
              class="item"
              :label="$t('战果来源')"
              prop="archiveSource">
              <meg-select
                v-model="form.archiveSource">
                <meg-option
                  v-for="item in optionsData"
                  :key="item.code"
                  :label="item.value"
                  :value="item.code">
                </meg-option>
              </meg-select>
            </meg-form-item>
            <meg-form-item
              class="item"
              :label="$t('破案民警')"
              prop="policemen.userIds">
              <meg-select
                v-model="form.policemen.userIds"
                @change="changeResults"
                multiple
                :placeholder="$t('请选择破案警察')">
                <meg-option
                  v-for="item in userList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </meg-option>
              </meg-select>
            </meg-form-item>
          </div>
        </meg-form>
        <div class="image-card-area">
          <div
            @drop="onDrop"
            class="upload-box">
            <meg-upload
              drag
              accept=".jpeg,.jpg,.png"
              :http-request="onUpload"
              :show-file-list="false"
              action="">
              <div class="upload-slot">
                <div class="upload-btn-box">
                  <meg-button
                    class="left"
                    @click.stop="openTemp"
                    type="primary">
                    {{ $t('打开暂存架') }}
                  </meg-button>
                  <meg-button
                    type="primary">
                    {{ $t('上传图片') }}
                  </meg-button>
                </div>
                <div class="tip">
                  {{ $t('拖拽到这里以添加图片、抓拍、身份、告警信息') }}
                </div>
              </div>
            </meg-upload>
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
                  <span
                    @click="deleteImage('upload',index)"
                    class="delete-btn">
                    <meg-icon
                      height="16"
                      width="16"
                      color="white"
                      name="delete_1"></meg-icon>
                  </span>
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
                  <span
                    @click="deleteImage('database',index)"
                    class="delete-btn">
                    <meg-icon
                      height="16"
                      width="16"
                      color="white"
                      name="delete_1"></meg-icon>
                  </span>
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
                  <span
                    @click="deleteImage('capture',index)"
                    class="delete-btn">
                    <meg-icon
                      height="16"
                      width="16"
                      color="white"
                      name="delete_1"></meg-icon>
                  </span>
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
                  <span
                    @click="deleteImage('alarm',index)"
                    class="delete-btn">
                    <meg-icon
                      height="16"
                      width="16"
                      color="white"
                      name="delete_1"></meg-icon>
                  </span>
                </div>
              </meg-card-frame>
            </div>
          </div>
        </div>

        <meg-form
          :model="form">
          <meg-form-item
            class="text-content"
            prop="content">
            <meg-input
              type="textarea"
              maxlength="1000"
              :autosize="{ minRows: 2, maxRows: 400}"
              :placeholder="$t('请输入战果描述(最多1000字)')"
              v-model="form.content">
            </meg-input>
          </meg-form-item>
        </meg-form>
      </div>
    </div>
  </page-layout>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import AlarmCard from '../../../common-components/common-alarm-card';
import CaptureCard from '../../../common-components/common-card';
import DatabaseCard from '../../../common-components/common-database-card';
import resultsSrv from '../results.service';
import rules from '../results.rule';

export default {
  name: 'ManageResult',
  components: {
    AlarmCard,
    CaptureCard,
    DatabaseCard
  },
  props: {},
  data() {
    return {
      rules,
      currentId: '',
      form: {
        archiveName: '',
        clueCount: '',
        catchCount: '',
        archiveTime: '',
        archiveOrgId: '',
        archiveOrgName: '',
        archiveSourceName: '',
        archiveSource: '',
        policemen: {
          userNames: [],
          userIds: [],
        },
        images: [],
        policemanId: '',
        policemanName: '',
        content: '',
      },
      fileList: [],
      deptTree: [],
      deptTreeProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
      optionsData: this.$store.getters.dataMapByType('kunlun_event_archive_source'),
      userList: [],
      pickerOptions: {
        disabledDate(now) {
          return new Date(now).getTime() > new Date().getTime();
        }
      },
      images: {
        'database': [],
        'upload': [],
        'capture': [],
        'alarm': [],
      },
      checkedOrgId: '', // 用作部门设置处理，因为部门接口和详情接口返回的先后顺序不一样。

    };
  },
  computed: {},
  watch: {},
  created() {
    if (this.$route.query.id) {
      this.currentId = this.$route.query.id;
      this.getResultDetail();
    }
    if (this.$route.query.eventId) {
      this.eventId = this.$route.query.eventId;
      this.getEventDetail();
    }

    this.init();
  },
  mounted() {},
  methods: {
    init() {
      this.getDeptTree();
      this.getUserList();
    },
    showNewDate(val) {
      const a = new Date(val).getTime();
      const b = new Date().getTime();
      if (a > b) {
        this.form.archiveTime = new Date();
      }
    },
    /**
     * @description 获取事件详情
     */
    getEventDetail() {
      resultsSrv.getEventDetail({ eventId: this.eventId }).then((res) => {
        if (res.code === 0) {
          const database = [];
          res.data.identityResults.forEach((val) => {
            database.push({
              type: 'database',
              detailData: val,
              imageSaveStatus: 0,
            });
          });
          const capture = [];
          res.data.clueResults.forEach((val) => {
            capture.push({
              type: 'capture',
              detailData: val,
              imageSaveStatus: 0,
            });
          });
          this.$set(this.images, 'capture', capture);
          this.$set(this.images, 'database', database);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * @description 获取战果详情
     */
    getResultDetail() {
      resultsSrv.getResultDetail({ id: this.currentId }).then((res) => {
        if (res.code === 0) {
          this.form = { ...res.data, archiveSource: String(res.data.archiveSource), archiveTime: new Date(res.data.archiveTime) };
          this.form.images.forEach((item) => {
            this.images[item.type].push(item);
          });
          this.checkedOrgId = this.form.archiveOrgId;
          this.getUserList(this.form.archiveOrgId);
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(this.form.archiveOrgId);
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * @description
     * @param {any}
     * @returns
     */
    onUpload(file) {
      const formData = new FormData();
      formData.append('file', file.file);

      resultsSrv.uploadFile(formData).then((res) => {
        if (res.code === 0) {
          this.images.upload.push({
            imageUrl: res.data.uri,
            type: 'upload',
            imageSaveStatus: 0
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    openTemp() {
      this.$store.dispatch('shelf/setShelfState', true);
    },
    /**
     * @description 删除
     * @param {string} type 图片类型
     * @param {number} index 图片下标
     * @returns
     */
    deleteImage(type, index) {
      this.images[type].splice(index, 1);
    },
    /**
     * @description 发布战果
     */
    create() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const images = [];
          Object.keys(this.images).forEach((item) => {
            images.push(...this.images[item]);
          });
          const obj = {
            policemanId: this.$store.getters.user.id,
            policemanName: this.$store.getters.user.userName,
            images,
            archiveTime: new Date(this.form.archiveTime).getTime(),
          };
          resultsSrv.createResult({ ...this.form, ...obj }).then((res) => {
            if (res.code === 0) {
              this.$message.success(this.$t('创建成功'));
              switchToModule({
                module: 'results',
              });
            }
          });
        }
      });
    },
    editResult() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const images = [];
          Object.keys(this.images).forEach((item) => {
            images.push(...this.images[item]);
          });
          this.form.images = images;
          const obj = {
            archiveTime: new Date(this.form.archiveTime).getTime(),
          };
          resultsSrv.editResult({ ...this.form, ...obj }).then((res) => {
            if (res.code === 0) {
              this.$message.success(this.$t('编辑成功'));
              switchToModule({
                module: 'results',
              });
            }
          });
        }
      });
    },
    /**
     * @description 检测拖拽事件
     * @param {any}
     * @returns
     */
    onDrop(e) {
      const originData = e.dataTransfer.getData('draggingData');
      if (originData) {
        const data = JSON.parse(originData);
        if (data.type === 'database') {
          if (!this.images[data.type].some((item) => item.detailData.photoId === data.data.photoId)) {
            this.images[data.type].push({
              type: data.type,
              imageSaveStatus: 0,
              detailData: data.data
            });
          }
        } else if (!this.images[data.type].some((item) => item.detailData.id === data.data.id)) {
          this.images[data.type].push({
            type: data.type,
            imageSaveStatus: 0,
            detailData: data.data
          });
        }
      }
    },
    /**
     * @description 取消编辑
     */
    cancel() {
      switchToModule({
        module: 'results',
      });
    },
    getDeptTree() {
      resultsSrv.getDeptTree().then((res) => {
        if (res.code === 0) {
          this.deptTree = [res.data];
          this.$nextTick(() => {
            if (this.checkedOrgId) {
              this.$nextTick(() => {
                this.$refs.tree.setCurrentKey(this.form.archiveOrgId);
              });
            }
          });
        }
      });
    },
    getUserList(orgId = '') {
      const paramsData = {};
      paramsData.pageNo = 1;
      paramsData.pageSize = 1000;
      paramsData.condition = {};
      paramsData.condition.organizationId = orgId || this.$store.getters.user.organization.id;
      paramsData.condition.searchChild = false;
      resultsSrv.userList(paramsData).then((res) => {
        if (res.code === 0) {
          this.userList = res.data.records.map((item) => ({
            label: item.userRealName,
            value: item.id,
          }));
        }
      });
    },
    /**
     * 根据id找出对应警察名，放在一个数组里
     * @param {val} 存放警察id的数组；
     * @returns
     */
    changeResults(val) {
      const arr = JSON.parse(JSON.stringify(this.userList));
      const arrData = [];
      arr.forEach((item) => {
        if (val.find((it) => (it === item.value))) {
          arrData.push(item.label);
        }
      });
      this.form.policemen.userNames = JSON.parse(JSON.stringify(arrData));
    },
    /**
     * @description
     * @param {object} data 被选中的节点
     * @returns
     */
    onCheckChange() {
      const node = this.$refs.tree.getCurrentNode();
      this.form.archiveOrgId = node.id;
      this.form.archiveOrgName = node.orgName;
      this.form.policemen = {
        userNames: [],
        userIds: [],
      };
      this.getUserList(this.form.archiveOrgId);
    },
  },
};
</script>
<style lang="scss" scoped>
.manage-result {
  width: 100%;
  height: 100%;
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  box-sizing: border-box;
  .btn-box {
    width: 700px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    .right {
      margin-left: 10px;
    }
  }
  .content {
    width: 700px;
    padding-bottom: 60px;
    .title {
      border: none;
      border-bottom: 1px solid #d2d6de;
      line-height: 52px;
      width: 100%;
      height: 52px;
      overflow: hidden;
      outline: 0;
      font-size: 32px;
      font-family: SourceHanSansCN-Bold;
      ::v-deep.meg-input__inner {
        border: none;
        color: #2a2a2a;
      }
      &::placeholder {
        color: #869abb;
        font-family: SourceHanSansCN-Bold;
      }
    }
    .item-box {
      display: flex;
      .item {
        flex: 1;
        &:nth-of-type(2) {
          margin: 0 20px;
        }
      }
    }
  }
  .image-card-area {
    border: 1px dashed #d2d6de;
    background: #f7f8f9;
    padding: 20px;
    margin-top: 10px;
    border-radius: 2px;
    .upload-box {
      width: 700px;
      height: 150px;
      ::v-deep.meg-upload-dragger {
        height: 140px;
        width: 660px;
        background: #fff;
      }
      .upload-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
        .upload-btn-box {
          display: flex;
          align-items: center;
          justify-content: center;
          .left {
            margin-right: 14px;
          }
        }
        .tip {
          margin-top: 20px;
          opacity: 0.5;
          font-size: 12px;
          text-align: center;
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

  .text-content {
    margin-top: 30px;
    ::v-deep.meg-textarea__inner {
      border: none;
      font-size: 14px;
      line-height: 19px;
    }
  }
}
</style>
