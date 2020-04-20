import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/login.vue';
import Register from '../views/register.vue';
import Game from '../views/game.vue';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/game/:roomNumber',
    name: 'game',
    component: Game,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
