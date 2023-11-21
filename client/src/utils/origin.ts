const getUrls = () => {
  if (process.env.NODE_ENV === "production") {
    const baseUrl = "http://172.26.0.88";
    if (process.env.VUE_APP_ENABLE_MULTIPLE_SOCKET) {
      const startPort = Number(process.env.START_PORT || 7000);
      const urls = [];
      for (var port = startPort; port <= startPort + 10; port++) {
        urls.push(`${baseUrl}:${port}`);
      }
      return urls;
    } else {
      const port = process.env.port || 7001;
      const urls = [`${baseUrl}:${port}`];
      return urls;
    }
  } else {
    const baseUrl = "http://127.0.0.1";
    const port = process.env.port || 7001;
    const urls = [`${baseUrl}:${port}`];
    return urls;
  }
};

export default {
  urls: getUrls(),
  res: location.href.split("#")[0] + "#",
};
