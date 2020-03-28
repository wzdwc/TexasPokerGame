# node-loan-center

node服务中心

## 快速入门
详细文档，参见 [egg 文档][eggjs], [midway 文档][midway]。

### 安装 启动

```bash
$ yarn
$ yarn dev
$ open http://localhost:7001/
```

### 部署

```bash
$ npm start
$ npm stop
```

### 单元测试
```
yarn test

```
- 具体参见 [midway 文档 - 单元测试](https://eggjs.org/zh-cn/core/unittest)。

### 目录结构
```
├─dist
├─logs
│  ├─ELKLog   //上报kibana日志系统log
|  |  ├─info.log
|  |  └─error.log
│  └─node-loan-center   // 系统日志
├─node_modules
├─src         //开发目录
│  ├─app
│  │  ├─controller
│  │  ├─extend
│  │  ├─helper
│  │  ├─middleware
│  │  └─public  // 静态目录
│  ├─config    // 配置文件目录，包含test，prod，local等config文件
│  ├─interface  // ts接口目录
│  ├─lib       // 工具类目录，如基类
│  └─service   
└─test  // 单元测试用例目录
    └─app
        └─controller

```
  
[midway]: https://midwayjs.org
[git-rules]: https://confluence.sui.work/pages/viewpage.action?pageId=51120607
[eggjs]: https://eggjs.org/zh-cn/
