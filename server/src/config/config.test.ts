import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
    const config: PowerPartial<EggAppConfig> = {};
    // 业务接口domain
    config.apiDomain = {
    };
    return config;
};
