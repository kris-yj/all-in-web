<template>
  <meg-form
    ref="searchForm"
    :model="formData"
    :class="['database-condition__wrap', {'is-text-search': isTextSearch}]"
    label-position="top">
    <div class="condition__left">
      <meg-form-item
        label="底库来源"
        prop="searchType">
        <meg-select
          background
          v-model="formData.searchType"
          placeholder="请选择"
          @change="changeAlbum">
          <meg-option
            v-for="item in albumSourceDict"
            :value="item.code"
            :label="item.value"
            :key="item.value"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item
        label="底库类型"
        prop="albumType">
        <meg-select
          background
          v-model="formData.albumType"
          placeholder="请选择"
          @change="changeAlbum">
          <meg-option
            v-for="item in albumDeployDict"
            :value="item.code"
            :label="item.value"
            :key="item.code"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item
        label="选择底库"
        v-if="initAlbumDone">
        <meg-treeselect
          ref="tree"
          :data="albumList"
          :node-key="'id'"
          :props="{ children: 'items', label: 'name' }"
          :show-checkbox="true"
          :default-checked-all="true"
          :placeholder-text="$t('请选择{entity}', { entity: $t('底库') })"
          :all-selected-text="$t('全部底库')"
          :search-placeholder="$t('输入底库名进行查找')">
        </meg-treeselect>
      </meg-form-item>
      <div v-show="isTextSearch">
        <meg-form-item
          label="姓名"
          prop="name">
          <meg-input
            :placeholder="'请输入姓名'"
            v-model="formData.filter.name"></meg-input>
        </meg-form-item>
      </div>
    </div>
    <!-- 右侧选项， 此处的显藏逻辑写在了 /scss/common-css.scss 中 -->
    <div
      class="condition__right">
      <meg-form-item
        label="性别"
        prop="gender">
        <meg-select
          background
          v-model="formData.filter.gender"
          placeholder="请选择">
          <meg-option
            v-for="item in genderDict"
            :key="item.value"
            :label="item.value"
            :value="item.code"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item
        label="籍贯"
        prop="address">
        <meg-input
          :placeholder="'请输入籍贯'"
          v-model="formData.filter.address"></meg-input>
      </meg-form-item>
      <meg-form-item
        label="证件号"
        prop="cardNo">
        <div class="id-card-select">
          <meg-input
            :placeholder="'请输入证件号'"
            v-model="formData.filter.cardInfo.cardNo">
            <!-- 证件类型选择 -->
            <meg-select
              v-model="formData.filter.cardInfo.cardType"
              slot="prepend"
              v-if="isTextSearch"
              :placeholder="$t('请选择')">
              <meg-option
                v-for="item in albumCardDict"
                :key="item.value"
                :label="item.value"
                :value="item.code"></meg-option>
            </meg-select>
          </meg-input>
        </div>
      </meg-form-item>
      <meg-form-item
        label="备注"
        prop="remark">
        <meg-input
          :placeholder="'请输入备注'"
          v-model="formData.filter.remark"></meg-input>
      </meg-form-item>
    </div>
  </meg-form>
</template>

<script>
import FaceIdentitySrv from '@/modules/face-identity/face-identity.service.js';

export default {
  components: {
  },
  props: {
    isTextSearch: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      formData: {
        // 底库来源
        searchType: '1',
        // 底库类型
        albumType: '1',
        // 这里之所以采用这种层级结构，是因为 人脸身份页面采用这样的结构
        filter: {
          // 姓名
          name: '',
          // 性别
          gender: '',
          // 备注
          remark: '',
          // 籍贯
          address: '',
          cardInfo: {
            // 证件类型
            cardType: 'sfz',
            // 证件号
            cardNo: '',
          }
        },
      },
      albumLists: [],
      initAlbumDone: false, // 初始化底库完成
    };
  },
  computed: {
    isDual() {
      return this.$store.getters.systemByType('isDual').value === 'true';
    },
    platformType() {
      //  1是否公安网，0为视频网
      return this.isDual ? this.$store.getters.systemByType('dualPlatformType').value : '';
    },
    // 底库来源字典
    albumSourceDict() {
      let arr = this.$store.getters.dataMapByType('album_source');
      arr = arr.filter((value) => value.code !== '3');
      const openPostNearPermission = this.$store.getters.modulesByAlias(['terminal']).length;
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
      const tar = `${this.formData.searchType}_${this.formData.albumType}`;
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
          const tar = `${element.src.type}_${element.type}`;
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
      }
    });
  },
  methods: {
    // 改变底库
    changeAlbum() {
      if (!this.albumList.length) {
        this.$message({
          message: this.$t('底库列表为空！'),
          type: 'warning'
        });
      }
    },
    /**
     * 获取检索条件
     * @returns Object
     */
    getCondion() {
      // 获取选择的底库
      const album = this.$refs.tree.getCheckedKeys().filter((id) => id !== 0);
      this.formData.albumIds = album;
      // 以图搜图，只传 底库来源 + 底库类型 + 底库
      if (!this.isTextSearch) {
        return {
          // 底库来源
          searchType: this.formData.searchType,
          // 底库类型
          albumType: this.formData.albumType,
          // 底库
          albumIds: this.formData.albumIds
        };
      }
      return {
        ...this.formData,
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../scss/common-css.scss';
.database-condition__wrap{
  @include wrap-style;
  .id-card-select .meg-select{
    width: 85px;
  }
}
</style>
