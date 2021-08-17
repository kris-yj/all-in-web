import { switchToModule } from '@/utils/utils';

export default {
  methods: {
    getImgJumpList(photoLinks) {
      return photoLinks.map((item) => this.$store.getters.moduleByAlias(item)).filter((item) => item);
    },
    withImgToOtherModule(data) {
      const query = {
        fileType: 'url',
        fileData: data.url,
        hasCoordinate: data.hasCoordinate ? data.hasCoordinate : false,
        coordinate: data.hasCoordinate ? data.coordinate : '',
        rect: (data.usefulFrame && Object.keys(data.usefulFrame).length) ? JSON.stringify(data.usefulFrame) : '',
        landmark: data.landmark ? JSON.stringify(data.landmark) : ''
      };
      if (data.alias === 'human-fusion' || data.alias === 'body-search') {
        query.cameraIds = data.cameraId;
        query.captureTime = data.captureTime;
      }
      const moduleInfo = {
        isBlank: true,
        module: data.alias,
        query
      };
      if (data.alias === 'doc-search') {
        moduleInfo.child = 'doc-search-details';
      }
      if (data.alias) {
        switchToModule({
          isBlank: true,
          module: data.alias,
          query
        });
      }
    }
  }
};
