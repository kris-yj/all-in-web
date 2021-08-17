<template>
  <!-- eslint-disable no-mixed-operators -->
  <div
    @dragenter="dragenter"
    @dragleave="dragleave"
    @dragover="dragover"
    @drop="drop"
    @click="fileSelect"
    class="file__upload">
    <span class="big-icon">
      <meg-icon
        :name="packUploadIcon"
        class="upload-icon"></meg-icon>
    </span>
    <p class="el-upload__text">
      {{ text }}
    </p>
    <input
      class="choose-file"
      type="file"
      title=""
      accept=".rar,.zip"
      @change="handleFileChoose"
      ref="fileInput" />
  </div>
  <!-- eslint-disable no-mixed-operators -->
</template>

<script>

export default {
  components: {
  },
  data() {
    return {
      isUploading: false,
      text: this.$t('拖拽或点击上传')
    };
  },
  computed: {
    packUploadIcon() {
      if (this.isUploading) {
        return 'package_database';
      }
      return 'resouece';
    }
  },
  created() {
  },
  methods: {
    fileSelect() {
      this.$refs.fileInput.click();
    },
    handleFileChoose(e) {
      console.log(e);
      const file = e.target.files;
      this.analysisList(file[0]);
    },
    dragenter() {
    },
    dragleave(e) {
      e.preventDefault();
    },
    dragover(e) {
      e.preventDefault();
    },
    drop(e) {
      e.preventDefault();
      const fs = e.dataTransfer.files;
      console.log(fs);
      if (fs.length > 1) {
        this.$message('一次只能比对一个文件！');
        return false;
      }
      if (fs.length < 1) {
        this.$message('空文件');
        // 检测是否有文件拖拽到页面
      }
      this.analysisList(fs[0]);
      return e;
    },
    /* eslint-disable */
    analysisList(obj) {
      const reg = /\.(zip|rar|RAR)/i;
      if (!reg.test(obj.name)) {
        this.$message('请上传系统指定格式的压缩包！');
        obj = '';
        return false; // eslint-disable no-mixed-operators
      }
      if (obj && obj.size >= 1024 * 1024 * 500 || obj && obj.size <= 0) { // eslint-disable no-mixed-operators
        this.$message('压缩包大小必须大于0KB小于300MB');
        obj = '';
        return false;
      }
      this.isUploading = true;
      this.text = obj.name;
      this.$emit('fileData', obj);
      return obj;
    },
    /* eslint-disable */
  }
};
</script>

<style scoped>
.file__upload{
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid #d2d6de;
    background-color: #f7f8f9;
    border-radius: 0px;
    cursor: pointer;
}

.choose-file{
    display: none;
}
.big-icon{
    display: inline-block;
    margin-top: 20px;
}
.photo-text{
    font-size: 12PX;
    color: rgb(141, 136, 136);
}
.upload-icon {
  color: #dcdde0;
  width: 42px;
  height: 48px;
  margin-top: 12px;
}
.el-upload__text {
  color: #919ba6;
  font-size: 12px;
  margin-top: 5px;
}
</style>
