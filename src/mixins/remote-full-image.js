/* eslint-disable */
class RemoteFullImageFetcher {
  constructor(fn) {
    if (fn && typeof fn === 'function') {
      this.fn = fn;
    } else {
      throw new Error('fn must be a function');
    }
    this.id = '';
  }

  fetchRemoteFullImage(id, params) {
    this.id = id || '';
    const that = this;
    return new Promise((resolve, reject) => {
      this.fn(params).then((res) => {
        if (res.code === 0) {
          if (res.data.id === that.id) {
            resolve(res.data.fullUrl);
          } else {
            reject({ msg: 'not same id' });
          }
        } else {
          reject(res);
        }
      });
    });
  }
}
/* eslint-disable */
export default {
  data() {
    return {
      remoteFullImageFetcher: null
    };
  },
  computed: {
    // 是否可以获取远程全景图
    canRemoteFullImage() {
      const isDual = this.$store.getters.systemByType('isDual').value;
      const platFormType = this.$store.getters.systemByType('dualPlatformType').value;
      const scene = this.$store.getters.systemByType('dualScene').value;
      return (isDual === 'true' && (scene === '2' || scene === '3') && platFormType === '1');
    }
  },
  methods: {
    // 初始化远程全景图获取器
    initRemoteFullImageFetcher(emitFn) {
      this.remoteFullImageFetcher = new RemoteFullImageFetcher(emitFn);
    },
    // 是否需要拉取全景图
    shouldRemoteFullImage(url) {
      return (/^remote:\/\//).test(url)
    },
    // 判断url是否需要远程获取
    isRemoteFullImageUrl(imgUrl) {
      return String.prototype.includes.call(imgUrl, 'bremote---');
    },
    // 是否为以图搜图或路人检索的url
    isCaptureSearchImageUrl(imgUrl) {
      return /^tutu---/g.test(imgUrl);
    },
    // 获取远程全景图
    fetchRemoteFullImageUrl(id, params = {}) {
      return this.remoteFullImageFetcher.fetchRemoteFullImage(id, params);
    }
  }
};
