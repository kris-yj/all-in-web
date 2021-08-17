<template>
  <div class="scene-selector">
    <ul class="scene-list">
      <li
        class="scene-list-item"
        v-for="(scene) in sceneList"
        :key="scene.id"
        :class="scene.selected?'selected':''"
        @click="onSceneChange(scene)">
        <map-scene-edit
          :scene="scene"
          :selected="scene.selected"
          :is-edit="false"
          :scene-name="scene.name"
          @scene-change="onSceneChange">
        </map-scene-edit>
      </li>
    </ul>
  </div>
</template>

<script>
import MapSceneEdit from './map-scene-edit.vue';

export default {
  name: 'MapScenesSetting',
  components: {
    MapSceneEdit
  },
  props: {
    // 场景数据
    sceneData: {
      type: Array,
      default: () => []
    },

  },
  data() {
    return {
      // 场景数据列表
      sceneList: [],
      // 上一次选中的场景
      lastSelectedScene: null,
    };
  },
  computed: {

    // 排序后的场景列表
    orderedSceneList() {
      const len = this.sceneList.length;
      const orderArray = [];
      for (let i = 0; i < len; i += 1) {
        const {
          id, name, url, width, height, selected
        } = this.sceneList[i];

        orderArray.push({
          id,
          name,
          orderNo: len - i,
          url,
          width,
          height,
          selected
        });
      }
      return orderArray;
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
    // 更新场景数据
    updateSceneList() {
      this.sceneList = this.sceneData.map((scene) => ({ ...scene, selected: false }));
      this.$emit('scene-change', this.orderedSceneList);
    },
    // 场景选择
    onSceneChange(scene) {
      if (scene === this.lastSelectedScene) return;
      if (this.lastSelectedScene) this.lastSelectedScene.selected = false;
      scene.selected = true;
      this.lastSelectedScene = scene;
      this.$emit('scene-select-changed', scene, this.orderedSceneList);
    },
    // 重置所有场景为未选中
    resetSelect() {
      this.sceneList.forEach((scene) => {
        scene.selected = false;
      });
      this.lastSelectedScene = null;
    },
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
.scene-list-item,
.plan-img-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  line-height: 34px;
  background: #fff;
  font-size: 12px;
  border: 2px solid transparent;
  user-select: none;
}

.scene-list-item:hover {
  border: 2px solid #0074ff;
  cursor: pointer;
}

.scene-name {
  display: inline-block;
  width: 34px;
  height: 34px;
  text-align: center;
  line-height: 34px;
}

.scene-edit {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 34px;
}

.selected {
  background: #0074ff;
  color: #fff;
}
.rename-header {
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.rename-container {
  height: 120px;
  padding: 50px 20px 0 50px;
}
.rename-tip {
  line-height: 16px;
  color: #bbb;
  font-size: 12px;
}
</style>
