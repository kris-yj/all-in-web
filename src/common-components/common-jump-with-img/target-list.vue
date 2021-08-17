<template>
  <div class="capture-items-wrapper">
    <ul
      v-show="visible"
      class="capture-items-list">
      <li
        class="loading"
        v-if="loading"
        v-loading="loading"></li>
      <li
        class="nodata"
        v-if="!loading && !jumpItems.length">
        暂无数据
      </li>
      <template
        v-if="jumpItems.length&&!loading">
        <li
          v-for="item in jumpItems"
          :key="item.id"
          @click.stop="handleItemClick(item)">
          {{ item.name }}
          <meg-icon
            spin
            v-if="deployLoading && 'do-deploy' === item.alias"
            name="play_loading"
            class="inner-loading"></meg-icon>
          <meg-icon
            spin
            v-if="appendDatabaseLoading && 'add-to-database' === item.alias"
            name="play_loading"
            class="inner-loading"></meg-icon>
        </li>
      </template>
    </ul>
    <append-album
      v-if="showAppendAlbum"
      v-bind="appendAlbumData"
      @close="showAppendAlbum = false"></append-album>
    <one-key-monitor
      v-if="showOneKeyMonitor"
      v-bind="deployData"
      @close="showOneKeyMonitor = false"></one-key-monitor>
    <div class="empty">
      <img-analysis
        v-if="jumpParams.genre === 3 && useImgAnalysis"
        selector-mode="single"
        @output="confirm"
        @selctor-change="selctorChange"
        :show-license-plate="false"
        :show-quality="true"
        :enlarge="1.3"
        :max-img-num="1"
        :drop-file="dropFile"></img-analysis>
    </div>
  </div>
</template>
<script>
import AppendAlbum from '@/common-components/common-append-album';
import OneKeyMonitor from '@/common-components/common-one-key-monitor';
import { captureTransToAlarm } from '@/common-components/utils/utils';
import { utils } from '@/utils/utils';
import eventsMap from './events-map';
import commonSwitchParams from '../common-switch-params';
import CommonJumpWithImgSrv from './common-jump-with-img.service';

/**
 * 目标页面接收的参数名称
 */
const jumpInfoKey = 'jumpWithImgInfo';
/**
 * 缓存同一个请求的返回结果，key为params
 */
const requestedData = new Map();
/**
 * 请求下拉选项所需要的参数
 */
const requestKeys = ['genre', 'source'];
/**
 * 获取参数类型
 */
function getArgType(agr) {
  const type = Object.prototype.toString.call(agr).split(/\s/)[1].slice(0, -1).toLowerCase();
  const obj = {};
  ['Array', 'Boolean', 'Number', 'Object', 'Promise', 'String', 'Map', 'RegExp', 'Set', 'Weakmap', 'Weakset', 'Symbol', 'Null', 'Undefined'].forEach((item) => {
    obj[`is${item}`] = item.toLowerCase() === type;
  });
  obj.isFunction = ['asyncfunction', 'generatorfunction', 'function'].includes(type);
  return obj;
}

/**
 * 从一个对象里提取某些key，返回一个新的对象
 */
function pickKeys(obj, keys) {
  const res = {};
  if (getArgType(obj).isObject && keys && keys.length) {
    Object.keys(obj).forEach((key) => {
      if (keys.includes(key)) {
        res[key] = obj[key];
      }
    });
  }
  return res;
}

/**
 * 请求下拉列表数据并缓存
 */
function storedRequest(service) {
  if (!getArgType(service).isFunction) {
    return () => {};
  }
  return async (params) => {
    let data = {};
    if (getArgType(params).isObject && Object.keys(params).length) {
      const key = JSON.stringify(params);
      if (requestedData.has(key)) {
        data = requestedData.get(key);
        console.log('hint:', key, '; value:', data);
      } else {
        delete params.$reqPhoto;
        data = await service(params);
        requestedData.set(key, data);
      }
    }
    return data;
  };
}
/**
 * 转换脸人机非的type适配一键布控的type
 */
/* function captureTransToAlarm(category) {
  const map = {
    '0': '1', // 人脸
    '1': '2', // 人体
    '5': '3', // 机动车
    '6': '4', // 非机动
  };
  return map[category];
} */

export default {
  components: {
    AppendAlbum,
    OneKeyMonitor,
    ImgAnalysis: () => import('@/common-components/common-img-analysis')
  },
  props: {
    // 排除抓拍检索和人脸身份
    excludeCommonUse: {
      type: Boolean,
      default: false
    },
    // 自定义携图跳转列表
    customTargetList: {
      type: Array,
      default: () => []
    },
    /**
     * 集成一键布控
     */
    doDeploy: {
      type: Object,
      default: () => ({})
    },
    /**
     * 集成加入底库
     */
    appendAlbum: {
      type: Object,
      default: () => ({})
    },
    /**
     * 使用时如有显隐的情况，推荐使用v-show控制
     */
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 请求选项列表所需要的参数：
     * id 图片id：抓拍/底库/关联图 coreid
     * type 图片子类型：人体/人脸/其他
     * genre 图片类型：抓拍图：0/底库图：1/关联图：2/全景图：3/上传图：4
     * source 图片来源：报警:0/其他:1
     *
     * eg: {
     *  id, 非必须，抓拍、底库图必传，关联图可选
     *  type, 非必须，抓拍图、全景图需调分析接口获取type
     *  genre, 必须
     *  source, 必须
     *  photo, 必须
     *  startTime, 开始时间
     *  endTime, 结束时间
     *  capturedTime, 非必须，全域追踪：抓拍、报警必传 抓拍时间
     *  cameraId 非必须，全域追踪：抓拍、报警必传 抓拍地点
     * }
     */
    params: {
      type: Object,
      default: () => ({})
    },
    /**
     * 自定义选项
     * eg: [
     *  {
     *    name: '自定义跳转',
     *    handle() {}
     *  }
     * ]
     */
    prevItems: {
      type: [Array, Object],
      default: () => []
    },
    nextItems: {
      type: [Array, Object],
      default: () => []
    },
    /**
     * 跳转时携带额外的参数，callback(alias)
     */
    extraQuery: {
      type: Function,
      default: null
    },
    /**
     * 自定义跳转
     * eg: {
     *  [alias]: () => {}
     * }
     */
    handleJumpMap: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      deployLoading: false,
      appendDatabaseLoading: false,
      showImgAnalysis: false,
      showOneKeyMonitor: false,
      showAppendAlbum: false,
      loading: true,
      targetList: [],
      analyzedData: {},
      dropFile: {},
      jumpParams: this.params,
      appendAlbumData: this.appendAlbum,
      deployData: this.doDeploy,
      detectTypeMap: {
        0: 1,
        1: 2,
        5: 3,
        6: 4
      },
      dualPlatformType: this.$store.getters.system.dualPlatformType.value === '1', // 是否公安网
    };
  },
  computed: {
    useImgAnalysis() {
      let { targetList } = this;
      if (!Array.isArray(targetList)) {
        targetList = [];
      }
      return targetList.find((item) => ['add-to-database', 'do-deploy'].includes(item.alias));
    },
    jumpItems() {
      let { targetList, prevItems, nextItems } = this;
      if (getArgType(prevItems).isObject) {
        prevItems = [prevItems];
      }
      if (getArgType(nextItems).isObject) {
        nextItems = [nextItems];
      }
      if (prevItems && prevItems.length) {
        targetList = prevItems.concat(targetList);
      }
      if (nextItems && nextItems.length) {
        targetList = targetList.concat(nextItems);
      }
      return targetList;
    },
    defaultItems() {
      return {
        /**
         * 一键布控
         */
        'do-deploy': () => {
          const { genre, photo, type = [] } = this.jumpParams;
          if (genre === 3) {
            this.deployLoading = true;
            // 全景图
            this.dropFile = {
              photo,
              extra: 'handle-deploy'
            };
          } else {
            let { doDeploy = {} } = this;
            if (!Object.keys(doDeploy).length) {
              doDeploy = {
                photoUrl: photo,
                photoType: captureTransToAlarm(type[0]) // 0156
              };
            }
            // photoType接收0156
            // doDeploy.photoType = captureTransToAlarm(doDeploy.photoType);
            this.deployData = doDeploy;
            this.showOneKeyMonitor = true;
          }
        },
        /**
         * 一键比对
         */
        'do-compare': () => {
          this.$emit('handle-compare');
        },
        /**
         * 加入底库
         */
        'add-to-database': () => {
          const { genre, photo } = this.jumpParams;
          if (genre === 3) {
            this.appendDatabaseLoading = true;
            // 全景图
            this.dropFile = {
              photo,
              extra: 'add-to-database'
            };
          } else {
            this.showAppendAlbum = true;
          }
        }
      };
    }
  },
  watch: {
    jumpItems: {
      immediate: true,
      handler(items = []) {
        this.$emit('size-change', {
          height: Math.min(items.length * 30, 200) + 8, // 超过200显示滚动条了
          width: 120
        });
      }
    },
    visible: {
      immediate: true,
      handler(bool) {
        this.$emit('toggle-list', bool);
        if (bool) {
          this.getJumpPicture();
        }
      }
    },
    appendAlbum(data) {
      this.appendAlbumData = data;
    },
    doDeploy(data) {
      this.deployData = data;
    }
  },
  methods: {
    selctorChange(bool) {
      if (bool) {
        this.appendDatabaseLoading = false;
        this.deployLoading = false;
      }
    },
    confirm(data) {
      if (data[0].extra === 'handle-deploy') {
        this.showOneKeyMonitor = true;
        this.deployData = {
          photoUrl: data[0].images[0].base64,
          photoType: captureTransToAlarm(data[0].images[0].detectType),
        };
      } else if (data[0].extra === 'add-to-database') {
        this.showAppendAlbum = true;
        this.appendAlbumData.imageData = {
          ...this.appendAlbumData.imageData,
          ...{
            originType: 'upload',
            photoUrl: data[0].images[0].base64,
            type: data[0].images[0].detectType,
          }
        };
      }
    },
    /**
     * 分析接口
     */
    async analyze() {
      this.loading = true;
      const { photo, type = [] } = this.params;
      let res = photo;
      if (!photo.startsWith('data:image')) {
        res = await utils.urlToBase64(photo);
      }
      const params = {
        photo: res,
        analyzeType: type && type.length ? type : [0, 1, 5, 6] // 0156
      };
      const request = storedRequest(CommonJumpWithImgSrv.analyze);
      const { code, msg, data } = await request(params);
      if (code === 0) {
        this.analyzedData = data;
      } else {
        this.$message.error(msg);
      }
      this.loading = false;
    },
    async handleItemClick(item, goAnalyze = false, params = this.jumpParams) {
      if (goAnalyze) await this.analyze();
      const { alias, handle } = item;
      const { images = [] } = this.analyzedData;

      if (['capture-search', 'track', 'hiding-place'].includes(alias)) {
        // 低质量目标，检测不出feature，不做跳转
        if (!images.length || !images.find((img) => img.feature)) {
          return this.$message.error('图片低质量无法进行使用');
        }
      }
      const {
        id,
        // genre,
        type,
        photo,
        startTime,
        endTime,
        capturedTime,
        cameraId
      } = params;
      const jumpMap = this.handleJumpMap;
      /**
       * 验证全域追踪的参数
       */
      // if (alias === 'path-trace' && !(capturedTime && cameraId)) {
      //   return this.$message.error('\'capturedTime\' and \'cameraId\' key are expected when has path-trace(全域追踪) access.');
      // }
      if (getArgType(jumpMap).isObject && jumpMap[alias]) {
        /**
         * 自定义跳转
         */
        const handleJump = jumpMap[alias];
        if (getArgType(handleJump).isFunction) {
          handleJump();
        }
      } else if (getArgType(handle).isFunction) {
        /**
         * prev-items, next-items里传入的选项的跳转
         */
        handle(alias);
      } else {
        const defaultAlias = Object.keys(this.defaultItems);
        const defaultHandle = this.defaultItems[alias];
        if (defaultAlias.includes(alias)) {
          /**
           * 内部已约定好的自定义跳转项
           */
          if (getArgType(defaultHandle).isFunction) {
            defaultHandle();
          } else {
            this.$message.error(`please provide the handle of '${alias}'`);
          }
        } else {
          /**
           * switchToModule
           */
          let query = {
            photoUrl: photo,
            photo: {}
          };
          const { analyzedData } = this;
          if (analyzedData) {
            analyzedData.extra = {
              id
            };
            // 抓拍图多目标时打开弹窗
            // if (images && images.length > 1 && genre === 0) {
            //   analyzedData.goAnalyze = true;
            // } else {
            //   analyzedData.goAnalyze = false;
            // }
            // if (analyzedData.extra.id && genre === 0) {
            //   analyzedData.goAnalyze = false;
            // } else {
            //   analyzedData.goAnalyze = true;
            // }
            analyzedData.goAnalyze = false;
            analyzedData.couldEdit = true;
            query.photo = analyzedData;
          }
          if (type && type.length) {
            [query.photo.detectType] = type;
          }
          // 全域追踪
          if (alias === 'path-trace') {
            query.capturedTime = capturedTime;
            query.cameraId = cameraId;
          } else {
            query.startTime = startTime;
            query.endTime = endTime;
          }

          const { extraQuery } = this;
          if (getArgType(extraQuery).isFunction) {
            const ext = extraQuery(alias);
            if (getArgType(ext).isObject) {
              query = {
                ...query,
                ...ext
              };
            }
          }
          this.jump(alias, query);
        }
      }
      /**
       * 埋点
       */
      this.eventTracking(eventsMap[alias]);
      return false;
    },
    jump(target, query) {
      new commonSwitchParams.FormatSwitchParams({
        module: target,
        query: {
          data: {
            [jumpInfoKey]: query
          }
        },
        isBlank: true,
        pageType: 'single',
      }).switchToModule();
    },
    /**
     * 获取选项列表
     */
    async getJumpPicture() {
      const params = JSON.parse(JSON.stringify(this.params));
      const access = [...requestKeys, 'photo'].every((key) => params[key] !== undefined);
      if (!access) return;
      /**
       * 0: 抓拍图
       * 3：全景图
       * 4: 上传图
       */
      // if ([0, 3, 4].includes(Number(params.genre))) {
      await this.analyze();
      const { images = [] } = this.analyzedData;
      if (images.length) {
        const types = images.map((item) => item.detectType);
        params.type = types;
        if (images.length === 1) {
          this.analyzedData.checked = true;
        }
      } else if (!params.type) {
        params.type = [7];
      }
      // }
      this.jumpParams = params;
      const reqParams = pickKeys(params, ['id', 'type', 'photo', ...requestKeys]);
      reqParams.$reqPhoto = reqParams.photo;
      delete reqParams.photo;
      // 如果有自定义跳转列表，则不用远程获取，直接使用用户定义的
      if (this.customTargetList.length) {
        this.targetList = this.customTargetList;
      } else {
        const request = storedRequest(CommonJumpWithImgSrv.getJumpPicture);
        const { code, msg, data } = await request(reqParams);
        if (code === 0 && data) {
          let { records } = data;
          if (records && records.length) {
            if (images && images.length) {
              const notPassable = images.find((item) => item.pass === 0);
              const { alarmType, platformType } = this.params;
              if (platformType === 1 && !this.dualPlatformType) {
                /**
                 * 新增：视频网不能加入公安网底库，也不能一键布控
                 */
                records = records.filter((item) => item.alias !== 'add-to-database' && item.alias !== 'do-deploy');
              }
              if (notPassable) {
                /**
                 * 新增：pass为0时不能加入底库
                 */
                records = records.filter((item) => item.alias !== 'add-to-database');
              }
              if (alarmType === 1) {
                /**
                 * 新增：alarmType为1时检测布控不能一键比对
                 */
                records = records.filter((item) => item.alias !== 'do-compare');
              }
            }
            /**
             * 新增：排除抓拍检索和人脸身份
             */
            if (this.excludeCommonUse) {
              const { type = [] } = params;
              const excludeItems = ['capture-search'];
              if (type[0] === 0) {
                // 人脸
                excludeItems.push('face-identity');
              } else {
                excludeItems.push('track');
              }
              records = records.filter((item) => !excludeItems.includes(item.alias));
            }
            this.targetList = records;
          }
        } else {
          this.$message.error(msg);
        }
      }

      this.loading = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.capture-items-wrapper {
  padding-top: 18px;
  position: absolute;
  right: 0;
  top: 6px;
  z-index: 12;
}
.capture-items-list {
  width: 120px;
  max-height: 200px;
  overflow: auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  line-height: 30px;
  margin-top: 5px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #444;
  background-color: #fff;
  text-align: center;
  cursor: pointer;
  ::v-deep .circular {
    width: 34px;
    height: 34px;
  }
  li {
    transition: all 0.3s;
    padding: 7px;
    line-height: 1.4;
    text-align: center;
    word-break: break-all;
  }
  li:hover {
    background: #e5f2fe;
    color: #21539b;
  }
  .loading {
    height: 100px;
  }
  .nodata {
    height: 100px;
    line-height: 100px;
    text-align: center;
  }
  .inner-loading {
    display: inline-block;
    vertical-align: top;
    margin-left: 2px;
  }
}
.empty {
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
