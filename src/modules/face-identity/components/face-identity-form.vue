<template>
  <common-form-container
    @search="searchClick"
    @reset="resetClick">
    <template slot="header">
      {{ $t('人脸身份') }}
    </template>
    <meg-form
      class="face-identity-form"
      ref="searchForm"
      label-position="top">
      <div class="common-img-analysis-wrapper">
        <common-img-analysis
          ref="imgAnalysis"
          font-size="12px"
          bottom-height="20px"
          selector-mode="single"
          :max-img-num="3"
          :analyze-type="[0]"
          background="face"
          :init-file="initFile"
          @output="photoChange">
        </common-img-analysis>
      </div>
      <meg-form-item
        class="meg-select"
        :label="$t('底库来源')">
        <meg-select
          v-model="formData.searchType"
          @change="changeAlbum">
          <meg-option
            v-for="item in albumSourceDict"
            :value="item.code"
            :label="item.value"
            :key="item.value"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item
        class="meg-select"
        v-if="dualEnvType"
        :label="$t('底库类型')">
        <div>
          <meg-select
            v-model="formData.albumType"
            @change="changeAlbum">
            <meg-option
              v-for="item in albumDeployDict"
              :value="item.code"
              :label="item.value"
              :key="item.code"></meg-option>
          </meg-select>
        </div>
      </meg-form-item>
      <meg-form-item
        class="meg-select treeWrap"
        :label="$t('底库')"
        v-if="initAlbumDone">
        <meg-treeselect
          ref="tree"
          :data="albumList"
          node-key="id"
          :props="{ children: 'items', label: 'name' }"
          :show-checkbox="true"
          :default-checked-all="true"
          :placeholder-text="$t('请选择{entity}', { entity: $t('底库') })"
          :all-selected-text="$t('全部底库')"
          :search-placeholder="$t('输入底库名进行查找')">
        </meg-treeselect>
      </meg-form-item>
      <div
        v-show="formData.searchType === '1'">
        <p
          class="more-opts"
          @click="showMore">
          {{ isShowMore? $t('收起') : $t('更多') }}
          <meg-icon
            name="caret_down"
            width="12"
            :dir="isShowMore?'down':'up'"
            height="12"
            color="#21539b"></meg-icon>
        </p>
      </div>
      <div v-show="isShowMore && formData.searchType === '1'">
        <meg-form-item
          class="meg-select"
          :label="$t('姓名')">
          <meg-input
            :placeholder="$t('请输入{entity}', { entity: $t('姓名') } )"
            v-model="formData.filter.name"></meg-input>
        </meg-form-item>
        <meg-form-item
          class="meg-select"
          :label="$t('证件号')">
          <meg-input
            :placeholder="$t('证件号')"
            v-model="formData.filter.cardInfo.cardNo">
            <meg-select
              v-model="formData.filter.cardInfo.cardType"
              class="card-type"
              slot="prepend">
              <meg-option
                v-for="item in albumCardDict"
                :key="item.value"
                :label="item.value"
                :value="item.code"></meg-option>
            </meg-select>
          </meg-input>
        </meg-form-item>
        <meg-form-item :label="$t('性别')">
          <div class="meg-select">
            <meg-select
              v-model="formData.filter.gender">
              <meg-option
                v-for="item in genderDict"
                :key="item.value"
                :label="item.value"
                :value="item.code"></meg-option>
            </meg-select>
          </div>
        </meg-form-item>
        <meg-form-item
          class="meg-select"
          :label="$t('籍贯')">
          <meg-input
            :placeholder="$t('请输入{entity}', { entity: $t('籍贯') })"
            v-model="formData.filter.address"></meg-input>
        </meg-form-item>
        <meg-form-item
          class="meg-select"
          :label="$t('在逃编号')">
          <meg-input
            :placeholder="$t('请输入{entity}', { entity: $t('在逃编号') })"
            v-model="formData.filter.criminalNumber"></meg-input>
        </meg-form-item>
        <meg-form-item
          class="meg-select"
          :label="$t('备注')">
          <meg-input
            :placeholder="$t('请输入{entity}', { entity: $t('备注') })"
            v-model="formData.filter.remark"></meg-input>
        </meg-form-item>
        <meg-form-item v-show="isDeepSearchOn">
          <meg-checkbox
            class="deep-search"
            v-model="formData.isDeepSearch">
            {{ $t('深度检索') }}
          </meg-checkbox>
          <meg-popover
            placement="top"
            trigger="hover"
            :content="$t('深度检索结果更精确，但会延长检索耗时')">
            <meg-icon
              name="help_prompt"
              class="help-icon"
              slot="reference"
              color="#999">
            </meg-icon>
          </meg-popover>
        </meg-form-item>
      </div>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonImgAnalysis from '@/common-components/common-img-analysis';
import CommonFormContainer from '@/common-components/common-form-container';
import commonSwitchParams from '@/common-components/common-switch-params';
import FaceIdentitySrv from '../face-identity.service';

export default {
  components: {
    CommonFormContainer,
    CommonImgAnalysis
  },
  props: {

  },
  data() {
    return {
      formData: {
        albumIds: [], // 底库id
        searchType: '1', // 底库来源
        albumType: '1', // 地库类型
        faceList: [], // 人脸
        filter: {
          name: '', // 姓名
          cardInfo: {
            cardNo: '', // 证件号
            cardType: 'sfz', // 证件类型
          },
          address: '', // 籍贯
          gender: '', // 性别
          criminalNumber: '', // 在逃编号
          remark: '', // 备注

        },
        isDeepSearch: false
      },
      initFile: [],
      clusterLoading: false, // 集群加载状态
      albumLists: [],
      autoSearch: false, // 携图跳转后检索
      initAlbumDone: false, // 初始化底库完成
      isShowMore: false, // 显示更多
    };
  },
  computed: {
    // 是否纯静态纯动态 default为全量
    dualEnvType() {
      return this.$store.getters.systemByType('dualEnvType').value === 'default';
    },
    isDual() {
      return this.$store.getters.systemByType('isDual').value === 'true';
    },
    platformType() {
      //  1是否公安网，0为视频网
      return this.isDual ? this.$store.getters.systemByType('dualPlatformType').value : '';
    },
    isDeepSearchOn() {
      return Boolean(this.$store.getters.system.deepSearchModel.value === 'true');
    },
    // 底库来源字典
    albumSourceDict() {
      let arr = this.$store.getters.dataMapByType('album_source');
      arr = arr.filter((value) => value.code !== '3');
      const openPostNearPermission = !!this.$store.getters.modulesByAlias(['terminal']).length;
      if (!openPostNearPermission) {
        arr = arr.filter((value) => value.code !== '2');
      }
      return arr;
    },
    // 底库类型字典
    albumDeployDict() {
      return this.$store.getters.dataMapByType('album_deploy');
    },
    // 证件号类型字典
    albumCardDict() {
      return this.$store.getters.dataMapByType('album_card');
    },
    // 性别
    genderDict() {
      let gender = this.$store.getters.dataMapByType('common_gender');
      gender = gender.filter((value) => value.code !== '9');
      gender.unshift({ code: '', value: this.$t('全部') });
      return gender;
    },
    // 底库列表
    albumList() {
      const tar = `a${this.formData.searchType}${this.formData.albumType}`;
      return this.albumLists[tar] ? this.albumLists[tar] : [];
    }
  },
  mounted() {
    const type = this.albumDeployDict.map((i) => parseInt(i.code, 10));
    const srcType = this.albumSourceDict.map((i) => parseInt(i.code, 10));
    // 获取所有底库
    FaceIdentitySrv.getAlbum({
      range: 1,
      deployObject: [1],
      type,
      srcType,
      platformType: this.platformType
    }).then((res) => {
      if (res.code === 0) {
        res.data.forEach((element) => {
          // 底库分类
          const tar = `a${element.src.type}${element.type}`;
          if (!this.albumLists[tar]) {
            this.albumLists[tar] = [{
              name: this.$t('全部'),
              id: 0,
              items: [],
            }];
          }
          this.albumLists[tar][0].items.push({
            ...element,
            flag: 'dataBase'
          });
        });
        this.initAlbumDone = true;
        // 底库获取完成后处理携图跳转或日志跳转
        if (JSON.stringify(this.$route.query) !== '{}') {
          const routerParams = this.$route.query;
          // 检索日志跳转
          if (routerParams.id) {
            this.fillBySearchLog(routerParams.id);
          } else {
            // 其他跳转
            commonSwitchParams.getOriginalQuery(this.$route.query).then((params) => {
              this.fillByParams(params);
            });
          }
        }
      }
    });
  },
  methods: {
    // 根据跳转携带参数回填
    fillByParams(params) {
      // 普通携图跳转
      if (params.jumpWithImgInfo && params.jumpWithImgInfo.photo) {
        this.initFile = [{ ...params.jumpWithImgInfo.photo, photo: params.jumpWithImgInfo.photoUrl }];
        this.autoSearch = true;
        return;
      }
      // 综合检索跳转
      const { photo } = params;
      delete params.photo;
      Object.assign(this.formData, params);
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(params.albumIds);
        this.initFile = photo;
        this.autoSearch = true;
        if (!photo) this.searchClick();
      });
    },
    // 根据检索日志回填
    fillBySearchLog(id) {
      FaceIdentitySrv.getOperationLog({ id }).then((res) => {
        if (res.code === 0) {
          const { param, type } = JSON.parse(res.data.realParam);
          Object.assign(this.formData, param);
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(param.albumIds);
            if (type === 'byProperties') { // 属性检索
              this.$emit('search', this.formData);
            } else { // 人像检索
              const faceList = [];
              param.faceList.forEach((item) => {
                const photoObj = {
                  photo: item.photoData,
                  goAnalyze: false,
                  images: [{
                    feature: item.feature,
                    locator: {
                      landmark: item.landmark,
                      hint: item.hint,
                      rect: item.rect,
                    },
                    hasCoordinate: !!item.hint,
                    coordinate: item.hint,
                  }]
                };
                faceList.push(photoObj);
              });
              this.initFile = faceList;
              this.autoSearch = true;
              if (!faceList.length) this.searchClick();
            }
          });
        }
      });
    },
    // 日志跳转时通过change事件触发检索
    photoChange(item) {
      if (this.autoSearch && item.length === this.initFile.length) {
        this.autoSearch = false;
        this.$nextTick(() => {
          this.searchClick();
        });
      }
    },
    // 点击检索
    searchClick() {
      const faceList = this.$refs.imgAnalysis.getFileList(true);
      this.formData.faceList = [];
      faceList.forEach((face) => {
        const item = {
          body: false,
          photoData: face.photo,
          qualityPass: Boolean(face.images[0].pass),
          feature: face.images[0].feature,
          landmark: face.images[0].locator.landmark,
          rect: face.images[0].locator.rect,
        };
        if (face.images[0].hasCoordinate) {
          item.hint = face.images[0].coordinate;
        }
        this.formData.faceList.push(item);
      });
      const album = this.$refs.tree.getCheckedKeys().filter((id) => id !== 0);
      this.formData.albumIds = album;
      // 表单填充校验
      if ((this.formData.faceList.length || this.formData.filter.name
       || this.formData.filter.gender || this.formData.filter.address
       || this.formData.filter.remark || this.formData.filter.cardInfo.cardNo
       || this.formData.filter.criminalNumber) && this.formData.albumIds.length) {
        this.$emit('search', this.formData);
      } else {
        this.$message({
          message: this.$t('请填充检索条件'),
          type: 'warning'
        });
      }
    },
    // 点击重置
    resetClick() {
      this.$refs.imgAnalysis.reset();
      this.formData = {
        albumIds: [],
        searchType: '1',
        albumType: '1',
        faceList: [],
        filter: {
          name: '',
          cardInfo: {
            cardNo: '',
            cardType: 'sfz',
            address: '',
          },
          gender: '',
          criminalNumber: '',
          remark: '',

        },
        isDeepSearch: false
      };
      this.$refs.tree.setCheckedNodes('ALL');
    },
    // 改变底库
    changeAlbum() {
      if (!this.albumList.length) {
        this.$message({
          message: this.$t('底库列表为空！'),
          type: 'warning'
        });
      }
    },
    // 显示更多
    showMore() {
      this.isShowMore = !this.isShowMore;
    }
  },
};
</script>

<style lang='scss' scoped>
.face-identity-form {
  width: 260px;
  .common-img-analysis-wrapper{
    height: 152px;
    width: 208px;
    margin: 0 auto 20px;
  }
  .meg-select{
    display: block;
    .meg-input{
      display: inline-table;
    }
    .card-type {
      width: 115px;
    }
  }
  .deep-search {
    margin-right: 5px;
  }
  .help-icon {
    margin-top: -1px;
  }
  .more-opts {
    cursor: pointer;
    color: #21539b;
    font-size: 14px;
    margin-bottom: 20px;
  }
}
</style>
