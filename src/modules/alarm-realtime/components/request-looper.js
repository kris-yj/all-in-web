export default class RequestLooper {
  constructor(req, callback = null, interval = 1000) {
    this.req = req;
    this.interval = interval;
    this.timer = null;
    this.callback = callback;
    this.reqPromise = null;
    this.flag = 0;
  }

  start() {
    this.stop();
    if (this.req) {
      this.flag += 1;
      this.getReq();
    }
  }

  stop() {
    if (this.reqPromise) this.reqPromise.abort = true;
    if (this.timer) clearTimeout(this.timer);
  }

  destroy() {
    this.stop();
    this.req = null;
    this.callback = null;
  }

  loopHandler() {
    this.timer = setTimeout(() => {
      if (this.req) this.getReq();
    }, this.interval);
  }

  getReq() {
    this.reqPromise = this.req();
    const { flag } = this;
    this.reqPromise.then((data) => {
      if (!this.reqPromise.abort && flag === this.flag) {
        this.callback(data);
        this.loopHandler();
        this.reqPromise = null;
      }
    }).catch(() => {
      // this.loopHandler();
    });
  }
}
