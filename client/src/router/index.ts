import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/home.vue';
import Login from '../views/login.vue';
import Register from '../views/register.vue';
import Game from '../views/game.vue';
import service from '../service';
import cookie from 'js-cookie';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'home',
      needLogin: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: 'login',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      title: 'create account',
    },
  },
  {
    path: '/game/:roomNumber/:isOwner?',
    name: 'game',
    component: Game,
    meta: {
      title: 'game',
      needLogin: true,
    },
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  if (to.meta.needLogin) {
    try {
      const result = await service.checkLogin();
      console.log(result);
      cookie.set('user_id', result.data.userId);
      next();
    } catch (e) {
      await router.replace({ name: 'login' });
    }
  } else {
    next();
  }
});

export default router;
