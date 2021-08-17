<script>
import { CountUp } from 'countup.js';

const typeOf = (type) => (object) => Object.prototype.toString.call(object) === `[object ${type}]`;
const isFunction = typeOf('Function');

const ensureNumber = (n) => (typeof n === 'number' && !Number.isNaN(n));

export default {
  name: 'CountUp',
  props: {
    // 创建元素的标签
    tag: {
      type: String,
      default: 'span'
    },
    // 自动开始动画
    autoStart: {
      type: Boolean,
      default: true
    },
    // 数字的开始数值
    startVal: {
      type: [Number, String],
      required: false,
      default: 0
    },
    // 数字的结束数值
    endVal: {
      type: [Number, String],
      required: true
    },
    // 千分符号
    separator: {
      type: String,
      default: ',',
    },
    // 合并配置
    options: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  watch: {
    autoStart(val) {
      if (val) {
        this.countup.start();
      }
    },
    endVal(val) {
      if (this.countup && isFunction(this.countup.update)) {
        const total = ensureNumber(val) ? val : 0;
        this.countup.reset(); // 重置后在更新，防止出现NaN后不再更新
        this.countup.update(total);
      }
    }
  },
  mounted() {
    this.create();
  },
  beforeDestroy() {
    this.countup = null;
  },
  methods: {
    create() {
      // 如果已经存在就不再重复加载
      if (this.countup) return;
      // 合并参数
      const options = {
        useEasing: false,
        duration: 2,
        startVal: this.startVal, // 开始时的数字
        separator: this.separator, // 千分符号
        ...this.options
      };
      // 创建countUp实例
      this.countup = new CountUp(this.$el, this.endVal, options);
      if (this.countup.error) return;
      // 加载
      this.$nextTick(() => {
        if (this.autoStart) {
          this.countup.start();
        }
      });
    }
  },
  render(h) {
    return h(this.tag, { }, [this.startVal]);
  }
};
</script>
