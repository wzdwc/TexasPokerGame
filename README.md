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
### git提交规范规范
```
git commit 规范
采用 Conventional Commits规范，请细看 Conventional Commits。

<type>[optional scope]: <description>
type 值如下：
    feat：新功能（feature）
    fix：修补 bug
    docs：文档相关（documentation）
    style： 格式（不影响代码运行的变动，空格，注释等）
    refactor：重构（即不是新增功能，也不是修改 bug 的代码变动，代码优化）
    perf： 提升产品用户体验的改动
    test：添加缺失测试、更正或者删除现有测试，test 相关代码改动都用这个
    chore：非 src 或者 test代码变动，如辅助工具、配置文件等变动。
    build：影响构建系统或外部依赖项的更改（示例范围：gulp，broccoli， npm）
    ci：对 CI 配置文件和脚本的更改，一般我们都用不上，开源项目用得上（示例范围：Travis，Circle，BrowserStac k，SauceLabs）
    revert：回滚提交的版本
```
详细文档查看：[git 仓库管理规范] [git-rules]

### 开发基本规范
- 能不用any，绝对不使用any

- interface维护在interface目录下

- 代码注释
  - 每个方法，类必须有注释
  - 方法、类型注释必须描述清楚方法名称，参数，返回值等
  - 关键逻辑行，必须注释
  - 注释从读者的角度
   
- 命名
  - 文件名使用小驼峰, 如：baseService
  - 类名使用大驼峰，如：BaseService
  - 接口名使用大驼峰并以I开头，如：ILog
  - 方法名字尽量以动词开头，如：getSomething，getUserInfo
  
[midway]: https://midwayjs.org
[git-rules]: https://confluence.sui.work/pages/viewpage.action?pageId=51120607
[eggjs]: https://eggjs.org/zh-cn/
