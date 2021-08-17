/* eslint-disable no-unused-vars */
import Vue from 'vue';
import Router from 'vue-router';
import LoginRoute from '@/modules/login/login.router.js';
import GuideRoute from '@/modules/guide/guide.router.js';

Vue.use(Router);
const router = new Router();

const staticRoutes = [];

staticRoutes.push(...LoginRoute);
staticRoutes.push(...GuideRoute);

export default router;

export {
  staticRoutes
};
