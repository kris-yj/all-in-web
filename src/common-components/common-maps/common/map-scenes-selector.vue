<template>
  <div class="scene-selector">
    <ul class="scene-list">
      <li
        class="scene-list-item"
        v-show="isShowPagination"
        @click="lastPage">
        <i>
          <meg-icon
            name="arrow_hollow"
            width="12px"
            height="12px"
            :color="canNavLastPage? '#000000':'#8A97A0'"
            dir="down"></meg-icon>
        </i>
      </li>
      <li
        class="scene-list-item"
        v-for="scene in currentSceneList"
        :key="scene.id"
        :class="scene.selected?'selected':''"
        @click="onSceneChange(scene)">
        <map-scene-select
          :scene="scene"
          :scene-name="scene.name"
          :selected="scene.selected"
          @scene-change="onSceneChange">
        </map-scene-select>
        <!-- <meg-tooltip
          :content="scene.name"
          placement="left">
          <meg-icon
            name="img"
            width="20px"
            height="20px"
            :color="scene.selected?'#ffffff':'#435068'">
          </meg-icon>
        </meg-tooltip> -->
      </li>
      <li
        class="scene-list-item"
        v-show="isShowPagination"
        @click="nextPage">
        <i>
          <meg-icon
            name="arrow_hollow"
            width="12px"
            height="12px"
            :color="canNavNextPage? '#000000':'#8A97A0'"></meg-icon>
        </i>
      </li>
    </ul>
  </div>
</template>

<script>
import MapSceneSelect from './map-scene-select.vue';

const MAX_SCENE_LIST_LEN = 10;

export default {
  name: 'MapScenesSelector',
  components: {
    MapSceneSelect
  },
  props: {
    sceneData: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  data() {
    return {
      sourceSceneList: [],
      currentSceneList: [],
      startIndex: 0,
      endIndex: 0,
      maxIndex: 0,
      lastSelectedScene: null
    };
  },
  computed: {
    // 是否可以查看平面图
    isShowPagination() {
      return this.sourceSceneList.length > MAX_SCENE_LIST_LEN;
    },
    // 是否添加按钮
    canNavLastPage() {
      return this.startIndex > 0;
    },
    // 是否最后一张
    canNavNextPage() {
      return this.endIndex < this.maxIndex;
    }
  },
  watch: {
    sceneData() {
      this.updateSceneList();
    }
  },
  mounted() {
    this.updateSceneList();
  },
  methods: {
    /**
     * 平面图重新排序
     */
    updateSceneList() {
      this.sourceSceneList = this.sceneData.map((scene) => ({ selected: false, ...scene }));
      if (this.sourceSceneList.length > MAX_SCENE_LIST_LEN) {
        this.currentSceneList = Array.prototype.slice.call(this.sourceSceneList, 0, MAX_SCENE_LIST_LEN);
        this.startIndex = 0;
        this.endIndex = MAX_SCENE_LIST_LEN - 1;
      } else {
        this.currentSceneList = this.sourceSceneList;
        this.startIndex = 0;
        this.endIndex = this.sourceSceneList.length - 1;
      }
      this.maxIndex = this.sourceSceneList.length - 1;
    },
    /**
     * 平面图更新事件
     */
    onSceneChange(scene) {
      if (scene === this.lastSelectedScene) return;
      if (this.lastSelectedScene) this.lastSelectedScene.selected = false;
      scene.selected = true;
      this.lastSelectedScene = scene;
      this.$emit('select-scene-changed', scene);
    },
    /**
     * 平面图添加按钮判断
     */
    lastPage() {
      if (this.startIndex === 0) return;
      this.startIndex -= 1;
      this.endIndex -= 1;
      this.currentSceneList.pop();
      this.currentSceneList.unshift(this.sourceSceneList[this.startIndex]);
    },
    /**
     * 平面图切换 默认加1
     */
    nextPage() {
      if (this.endIndex === this.maxIndex) return;
      this.startIndex += 1;
      this.endIndex += 1;
      this.currentSceneList.shift();
      this.currentSceneList.push(this.sourceSceneList[this.endIndex]);
    }
  }
};
</script>

<style scoped>
/* .scene-selector{
  box-shadow: 3px 3px 5px 1px #dce1e5;
} */

.scene-list {
  display: flex;
  flex-direction: column;
}
.scene-list-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background: #fff;
  border: 2px solid transparent;
  font-size: 12px;
  user-select: none;
}

.scene-list-item:hover {
  border: 2px solid #0074ff;
  cursor: pointer;
}
.selected {
  background: #0074ff;
  color: #fff;
  /* border: 2px solid #0074FF; */
}
</style>
