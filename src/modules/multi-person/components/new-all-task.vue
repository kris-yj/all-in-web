<template>
  <div class="person__new">
    <meg-dialog
      :confirm-text="$t('确定')"
      :visible="visible"
      width="800px"
      @close="dialogClose">
      <div slot="title">
        <span>{{ $t('新建任务') }}</span>
      </div>
      <div>
        <div class="video__main">
          <meg-form
            :model="ruleForm"
            :rules="taskRule"
            ref="ruleForm"
            label-width="130px"
            class="demo-ruleForm">
            <meg-form-item
              :label="$t('选择目录')"
              prop="path">
              <div class="video__name meg-select">
                <meg-select
                  v-model="ruleForm.path"
                  filterable
                  :placeholder="$t('请选择')">
                  <meg-option
                    v-for="item in pathLists"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </meg-option>
                </meg-select>
              </div>
            </meg-form-item>
            <meg-form-item
              :class="[ifStatic==='default'?'':'static__choose']"
              prop="uploadType"
              :label="$t('底库类型')">
              <div class="video__upload">
                <meg-radio-group
                  @change="handleUploadTypeChange"
                  v-if="ifStatic==='default'"
                  v-model="ruleForm.uploadType">
                  <meg-radio :label="$t('选择{entity}', { entity: $t('静态库') })"></meg-radio>
                  <meg-radio
                    :label="$t('选择{entity}', { entity: $t('布控库') })"></meg-radio>
                </meg-radio-group>
              </div>
              <meg-treeselect
                ref="albumTreeSelector"
                class="tree-selector"
                :show-checkbox="true"
                default-checked-all
                deep-child-node-type="album"
                :props="{ children: 'items', label: 'name'}"
                :search-placeholder="$t('输入底库名进行搜索')"
                :data="albumTreeSelectorData"
                @check-change="albumChange">
              </meg-treeselect>
              <p
                v-show="showAblum"
                class="rules__ablum1">
                {{ $t('底库不能为空') }}
              </p>
            </meg-form-item>
          </meg-form>
        </div>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button @click="dialogClose">取 消</meg-button>
        <meg-button
          type="primary"
          @click="dialogOpenMain">确 定</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>

<script>
import _ from 'lodash';
import Rule from '@/modules/common/judge.rule.js';
import MultiPersonSrv from '../multi-person.service.js';

export default {
  components: {
  },
  props: {
    visible: {
      type: Boolean,
      default() {
        return true;
      }
    }
  },
  data() {
    return {
      ruleFormUpload: '',
      pathLists: [],
      fileDataUpload: false,
      ifStatic: '',
      showUpload: false,
      showAblum: false,
      taskRule: Rule.total(),
      allAblumData: [],
      packageFile: '',
      jobId: '',
      options: [],
      albumTreeSelectorData: [],
      nationData: [],
      // 选中的相机数据映射表
      selectAlbumObj: {},
      albumListData: [],
      albumListDataJT: [],
      cameraTotalCount: 0,
      statisticsFormat: {
        // 选中项数目的字段名称
        selectPropName: 'selectCount',
        // 总数项数目的字段名称
        totalPropName: 'totalCount'
      },
      ruleForm: {
        path: '',
        uploadType: this.$t('选择{entity}', {
          entity: this.$t('静态库')
        }),
      },
    };
  },
  computed: {
    // 选择的底库数组
    selectAlbumIdArray() {
      return Object.keys(this.selectAlbumObj);
    },
    platformType() {
      //  1是否公安网，0为视频网
      return this.$store.getters.systemByType('dualPlatformType').value;
    },
  },
  watch: {
    ruleForm: {
      handler() {
        this.ruleFormUpload = this.ruleForm.upload;
      },
      deep: true
    },
    ruleFormUpload: {
      handler() {
        if (this.ruleForm.upload === this.$t('选择{entity}', {
          entity: this.$t('静态库')
        })) {
          this.getTreeDataJT();
        }
        if (this.ruleForm.upload === this.$t('选择{entity}', {
          entity: this.$t('布控库')
        })) {
          this.getTreeData();
        }
      }
    },
    packageFile: {
      handler() {
        if (this.packageFile) {
          this.showUpload = false;
        } else {
          this.showUpload = true;
        }
      }
    },
    selectAlbumIdArray: {
      handler(val) {
        this.albumListData = val;
        if (this.albumListData.length !== 0) {
          this.showAblum = false;
        }
      }
    },
    visible: {
      handler() {
        if (!this.visible) {
          this.ruleForm.name = '';
          this.ruleForm.upload = this.$t('选择{entity}', { entity: this.$t('静态库') });
          this.fileDataUpload = false;
          this.packageFile = '';
          if (this.$refs.ruleForm) { this.$refs.ruleForm.resetFields(); }
          this.getTreeDataJT();
        } else {
          this.showUpload = false;
          this.fileDataUpload = true;
        }
      }
    }
  },
  created() {
    this.ifStatic = this.$store.getters.system.dualEnvType.value;
    this.getTreeDataJT();
    this.dataLists();
  },
  methods: {
    albumChange() {
      this.showAblum = false;
    },
    /*
    * 底库类型变化
    * @param {any}
    * @return
    * */
    handleUploadTypeChange(data) {
      if (data === this.$t('选择{entity}', { entity: this.$t('静态库') })) {
        this.getTreeDataJT();
      } else {
        this.getTreeData();
      }
    },
    dataLists() {
      MultiPersonSrv.pathLists().then((Response) => {
        if (Response.code === 0) {
          const arr = [];
          if (Response.data) {
            Response.data.forEach((item) => {
              const obj = {};
              obj.value = item;
              obj.label = item;
              arr.push(obj);
            });
          }
          this.pathLists = arr;
        }
      });
    },
    getTreeData() {
      const params = {
        platformType: this.platformType
      };
      params.type = [2];
      params.srcType = [1];
      MultiPersonSrv.getAlbum(params).then((response) => {
        if (response.code === 0) {
          const arr = [];
          response.data.forEach((item) => {
            arr.push(item.id);
          });
          this.albumListData = arr;
          this.allAblumData = JSON.parse(JSON.stringify(this.albumListData));
          const albumCoreIdArray = [];
          // 适配树形结构，增加一个全部根节点
          const albumListRoot = {
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: []
          };
          response.data.forEach((item) => {
            albumCoreIdArray.push(item.coreId);
            albumListRoot.items.push({ flag: 'album', ...item });
          });
          this.albumTreeSelectorData = [albumListRoot];
        }
      });
    },
    getTreeDataJT() {
      const params = {
        platformType: this.platformType
      };
      params.type = [1];
      params.srcType = [1];
      MultiPersonSrv.getAlbum(params).then((response) => {
        if (response.code === 0) {
          const arr = [];
          response.data.forEach((item) => {
            arr.push(item.id);
          });
          this.albumListData = arr;
          this.allAblumData = JSON.parse(JSON.stringify(this.albumListData));
          const albumCoreIdArray = [];
          // 适配树形结构，增加一个全部根节点
          const albumListRootJT = {
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: []
          };
          response.data.forEach((item) => {
            albumCoreIdArray.push(item.coreId);
            albumListRootJT.items.push({ flag: 'album', ...item });
          });
          this.albumTreeSelectorData = [albumListRootJT];
        }
      });
    },
    // 删除底库
    deleteAlbum(album) {
      this.$delete(this.selectAlbumObj, album.id);
      this.$refs.albumTreeSelector.setCheck(this.selectAlbumIdArray);
    },
    // 在底库树上进行选择
    onAlbumTreeCheckChanged(albumList, checked) {
      const vm = this;
      albumList.forEach((item) => {
        if (checked) {
          if (!vm.selectAlbumObj[item.id]) {
            vm.$set(vm.selectAlbumObj, item.id, item);
          }
        } else {
          vm.$delete(vm.selectAlbumObj, item.id);
        }
      });
      const arr = Object.keys(this.selectAlbumObj);
      const arrData = [];
      arr.forEach((item) => {
        arrData.push(this.selectAlbumObj[item].id);
      });
      this.albumListData = arrData;
    },
    onAlbumTreeUpdateReady(mapData) {
      this.selectAlbumObj = _.pickBy(mapData, (item) => item.flag === 'album');
    },
    fileData(file) {
      this.packageFile = file;
    },
    dialogOpen() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.dialogOpenData();
        }
      });
    },
    dialogOpenData() {
      if (this.albumListData.length === 0) {
        this.showAblum = true;
        return;
      }
      this.dialogOpenMain();
    },
    /**
       * 确定弹窗内容并发请求
       * @augments
       */
    dialogOpenMain() {
      const params = {};
      params.inputPath = this.ruleForm.path;
      if (this.ruleForm.upload === this.$t('选择{entity}', { entity: this.$t('静态库') })) {
        params.albumType = 1;
      }
      if (this.ruleForm.upload === this.$t('选择{entity}', { entity: this.$t('布控库') })) {
        params.albumType = 2;
      }
      params.albumIds = this.albumListData;
      MultiPersonSrv.newAllPerson(params).then((Response) => {
        if (Response.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('新建任务成功！')
          });
          this.$emit('close');
        } else {
          this.$message.error(Response.msg);
        }
      });
    },
    /**
       * 关闭弹窗
       * @augments
       */
    dialogClose2() {
      this.$emit('close');
    },
    /**
       * 关闭弹窗
       * @augments
       */
    dialogClose() {
      this.$emit('close');
    },
  }
};
</script>

<style lang="scss" scoped>
  .person__new{
    .video__select{
      width: 270px;
    }
    .title__upload{
    font-size: 14px;
    position: absolute;
    top: 130px;
    left: 437px;
    }
    .choose__item{
      float: right;
      font-size: 12px;
      margin-top: -11px;
      position: relative;
      left: -78px;
      color: #606266;
      color:#999999;
    }
    .video__main{
      width: 500px;
      text-align: center;
      font-size: 12px;
      color: #333333;
      padding: 20px 0 0 22px;
      box-sizing: border-box;
    }
    .video__name{
      width: 270px;
    }
    .video__fcy{
      width: 270px;
      text-align: left;
      span{
        font-size: 12px;
        color: #999999;
        display: inline-block;
        margin-right: 10px;
      }
    }
    .frequency{
      display: inline-block;
      width: 88px;
      margin-right: 10px;
    }
    .video__upload{
      width: 270px;
      text-align: left;
    }
    .video__file__upload{
      width:270px ;
      height: 137px;
      text-align: center;
    }
    .video__control{
      width:270px ;
      height: 100%;
    }
    .file__none{
      display: none;
    }
    //tree
    .camera-box{
      position: relative;
      border: 1px solid #d2d6de;
      margin-top: 15px;
    }
    .camera-box:hover{
      position: relative;
      border: 1px solid #21539b;;
    }
    .camera-select-menu{
      position: absolute;
      cursor: pointer;
      right: 7px;
      top: -2px;
      display: inline-block;
      width: 20px;
      height: 34px;
      line-height: 34px;
      z-index: 1000;
    }
    .search-item-container{
      height: 34px;;
    }
    .camera-select-placeholder{
      position: absolute;
      color: rgb(193,195,203);
      left: 15px;
      top: 12px;
      font-size: 14px;
      line-height: 12px;
    }
  }
  .tag__none{
    display: none
  }
  .rules__ablum{
    font-size: 12px;
    color: #f56c6c;
    text-align: left;
    margin-left: 100px;
    position: absolute;
    top: 276px;
    left: 52px;
  }
  .rules__ablum1{
    font-size: 12px;
    color: #f56c6c;
    text-align: left;
    position: relative;
    top:-36px;
  }
  .el-tag{
    margin-left: 4px;
    margin-bottom: 4px;
    float: left;
  }
  //tree
  .camera-select-container1{
    min-height: 32px;
    position: relative;
    max-height: 146px;
    padding: 2px 0px 0px 0px;
    box-sizing: border-box;
    .camera-tag-box{
      line-height: 16px;
      width: 245px;
      .el-tag{
        max-width: 90%;
        position: relative;
        padding: 0 10px 0 10px;
      }
    }
  }

</style>
<style>
  .camera-right-container-main{
    background: #ffffff;
    border-radius: 10px;
    width: 274px;
    height: 524px;
    box-sizing: border-box;
  }
  label.el-form-item__label{
    line-height: 34px ;
  }
  .static__choose label.el-form-item__label {
    margin-top: 15px;
  }
  .camera-select-container1 .camera-tag-box .el-tag{
    padding: 0 20px 0 10px !important;
    color: #435068 !important;
    background-color: #f7f8f9;
  }
  .tag__item .el-tag__close {
    position: absolute;
    right: 2px;
    top: 7px;
  }
  .tag__item .el-tag--info .el-tag__close{
    color: #c7c8c9 !important;
    font-weight: bold;
  }
  .tag__item .el-tag__close:hover{
    color: #2b5f92 !important;
    background-color: #e3f2ff !important;
  }

  .tag__item .el-tag--info:hover{
    background-color: #e3f2ff !important;
    color: #435068 !important;
  }
</style>
