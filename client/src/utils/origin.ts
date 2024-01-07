const getUrls = () => {
  const baseUrl = 'http://' + (process.env.VUE_APP_API_IP || '127.0.0.1');
  const port = process.env.VUE_APP_API_PORT || 7001;
  const urls = [`${baseUrl}:${port}`];
  return urls;
};

export default {
  urls: getUrls(),
  res: location.href.split('#')[0] + '#',
};
