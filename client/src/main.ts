import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VConsole from 'vconsole';
import './utils/init';
// 快速点击bug
// import fastClick from 'fastclick';

Vue.config.productionTip = false;

// tslint:disable-next-line:no-unused-expression
if (process.env.NODE_ENV !== 'production') {
  new VConsole();
}
// @ts-ignore
// fastClick.attach(document.body);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
