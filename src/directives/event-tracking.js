import { eventTracking } from '@/utils/utils';

const targetEvents = ['click', 'doubleclick', 'mouseenter'];

export const eventTrackingDirective = {
  bind(el, binding, vnode) {
    const { modifiers, value } = binding || {};
    const $this = vnode.context;
    const { currentModule } = $this.$store.state;
    let eventType = targetEvents[0];
    targetEvents.forEach((evt) => {
      if (modifiers[evt]) {
        eventType = evt;
      }
    });
    el.eventType = eventType;
    el.handle = (e) => {
      e.stopPropagation();
      e.preventDefault();
      eventTracking(currentModule.alias, value);
    };
    el.addEventListener(eventType, el.handle, false);
  },
  unbind(el) {
    if (el.handle && el.eventType) {
      el.removeEventListener(el.eventType, el.handle);
    }
  }
};

export {
  eventTracking
};
