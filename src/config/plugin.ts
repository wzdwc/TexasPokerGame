import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  static: true,
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  }
};

export default plugin;
