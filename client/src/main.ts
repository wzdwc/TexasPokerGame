import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VConsole from 'vconsole';

Vue.config.productionTip = false;

// tslint:disable-next-line:no-unused-expression
new VConsole();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
