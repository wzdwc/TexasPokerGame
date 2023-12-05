const getUrls = () => {
  let baseUrl = "http://127.0.0.1";
  if (process.env.NODE_ENV === "production") {
    baseUrl = 'http://' + process.env.VUE_APP_API_IP;
  }
  const port = process.env.port || 7001;
  const urls = [`${baseUrl}:${port}`];
  return urls;
};

export default {
  urls: getUrls(),
  res: location.href.split("#")[0] + "#",
};
