import { eventTracking, eventTrackingDirective } from '../directives/event-tracking';

/**
 * 1. eg: directive
 * <meg-buttton v-event-tracking="eventId"></meg-button>
 *
 * 2. eg: method
 * {
 *  ...,
 *  methods: {
 *    handleClick() {
 *      this.eventTracking(this.eventId);
 *    }
 *  }
 * }
 *
 */
export default {
  directives: {
    'event-tracking': eventTrackingDirective
  },
  methods: {
    eventTracking(eventId, extInfo = {}) {
      const { user, currentModule } = this.$store.state;
      const ext = {
        role: user.userName,
        user: user.userName
      };
      eventTracking(currentModule.alias, eventId, { ...ext, ...extInfo });
    }
  },
};
