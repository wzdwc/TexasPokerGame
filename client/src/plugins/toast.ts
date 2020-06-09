import Vue, { PluginObject } from 'vue';
import Toast from '../components/toast.vue';

export interface IOptions {
  text?: string;
  timeOut?: number;
}

const ToastConstructor = Vue.extend(Toast);

export class ToastExtendConstructor extends ToastConstructor {
  public close() {
    this.$props.show = false;
    this.$off('update:show');
  }
}

let instance: ToastExtendConstructor;
let defaultOptions: IOptions;

const getInstance = () => {
  if (instance) { return instance; }

  instance = new ToastExtendConstructor({
    el: document.createElement('div'),
  });

  return instance;
};

const toast = (options: string | IOptions) => {
  const vm = getInstance();

  if (!defaultOptions) {
    defaultOptions = { ...vm.$props };
  }

  let opts: IOptions;
  if (typeof options === 'string') {
    opts = { ...defaultOptions, text: options };
  } else {
    opts = { ...defaultOptions, ...options };
  }

  Object.keys(opts).forEach((key) => {
    vm.$props[key] = opts[key as keyof IOptions];
  });
  console.log(vm.$props);
  vm.$props.show = true;
  vm.$off('update:show');
  vm.$on('update:show', (val: boolean) => {
    vm.$props.show = val;
  });
  document.body.appendChild(vm.$el);

  return vm;
};

const plugin: PluginObject<Vue> = {
  // tslint:disable-next-line:no-shadowed-variable
  install(Vue) {
    if (!Vue.prototype.$plugin) {
      Vue.prototype.$plugin = {};
    }
    Vue.prototype.$plugin.toast = toast;
  },
};

export default plugin;
