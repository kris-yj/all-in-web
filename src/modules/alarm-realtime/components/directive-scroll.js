// 滚动顶部指令
export const directiveScrollTop = {
  bind(el, binding, vnode) {
    const onScrollTopFn = vnode.context[binding.expression] || this.binding.value;
    if (typeof onScrollTopFn !== 'function') throw new Error('v-scroll-top binding is not a function');
    el.addEventListener('scroll', () => {
      if (el.scrollTop === 0) {
        onScrollTopFn();
      }
    });
  }
};

// 滚动底部指令
export const directiveScrollBottom = {
  bind(el, binding, vnode) {
    const onScrollBottomFn = vnode.context[binding.expression] || this.binding.value;
    if (typeof onScrollBottomFn !== 'function') throw new Error('v-scroll-bottom binding is not a function');
    el.addEventListener('scroll', () => {
      if (el.scrollHeight - el.scrollTop <= el.clientHeight) {
        onScrollBottomFn();
      }
    });
  }
};

// 移动到容器顶部
export const scrollToTop = (el) => {
  const scrollPerFrame = () => {
    const c = el.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(scrollPerFrame);
      el.scrollTo(0, c - c / 8);
    }
  };
  scrollPerFrame();
};
