export default {
  url: process.env.NODE_ENV !== 'production' ?
    process.env.NODE_ENV === 'develop' ? 'http://172.22.72.70:7001'
      : 'http://192.168.0.110:7001' : 'http://www.jojgame.com:7001',
}
