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

  fetchRemoteFullImage(params) {
    this.id = params.id || '';
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
export default {
  data() {
    return {
      remoteFullImageFetcher: null
    };
  },
  methods: {
    // 是否需要拉取全景图
    shouldRemoteFullImage(url) {
      return (/^remote:\/\//).test(url)
    },
    // 初始化远程全景图获取器
    initRemoteFullImageFetcher(fn) {
      this.remoteFullImageFetcher = new RemoteFullImageFetcher(fn);
    },
    // 获取全景图
    fetchRemoteFullImage(params = {}) {
      return this.remoteFullImageFetcher.fetchRemoteFullImage(params);
    }
  }
};
