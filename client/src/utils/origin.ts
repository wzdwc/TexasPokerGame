export default {
  url: process.env.NODE_ENV !== 'production' ?
    process.env.NODE_ENV === 'develop' ? 'http://172.22.72.70:7001'
      : 'http://127.0.0.1:7001' : 'http://www.jojgame.com:7001',
  res: location.href.split('#')[0] + '#',
};
