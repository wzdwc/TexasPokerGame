import { EggAppConfig, PowerPartial } from "egg";

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  // business domain
  config.apiDomain = {};
  return config;
};
