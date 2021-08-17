<template>
  <page-layout>
    <track-analysis
      :default-params="reqParams"
      :fetch-func="reqMethods"></track-analysis>
  </page-layout>
</template>

<script>
import TrackAnalysis from '@/modules/events-manage/pages/track-analysis';
import trackSrv from '../shelf-track-analysis.service';

export default {
  components: {
    TrackAnalysis
  },
  data() {
    return {
      reqParams: {
      },
      reqMethods: () => {
        switch (this.$route.query.from) {
          case 'capture-search': return trackSrv.captureSearchTrack;
          case 'cascade-capture-search': return trackSrv.cascadeCaptureSearchTrack;
          default: return trackSrv.searchTrack;
        }
      }
    };
  },
  created() {
    const {
      ids, temType, searchId, cascadeNodeRegId
    } = this.$route.query;
    this.reqParams = {
      temType,
      searchId,
      cascadeNodeRegId,
      temIds: ids.split(',')
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
