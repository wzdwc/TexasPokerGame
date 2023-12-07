# texas-poke-game-server

texas poke game server，base on TypeScript,midway,node,mysql,redis

## socket.io

使用了 socket.io 进行服务端与客户端的通信. 这里面把一些 room 和 game 的信息挂载到 `nsp` 上.

没有实现 IPC, 所以部署时只能强制将 workers 设成 1, 这样子就只有一个进程了, 缺点不述.

在 egg-socket.io 插件官网上, 要求使用 `--sticky` 参数.

## 安装

See: [egg document][eggjs], [midway document][midway]。

### Redis

```typescript
// config.default
config.redis = {
  client: {
    port: 6379,
    host: '127.0.0.1',
    password: '123456',
    db: 0,
  },
};
```

### DataBase

使用 Mysql

```typescript
// config.default
config.mysql = {
  client: {
    // mysql host
    host: '',
    // pot
    port: '3306',
    // userName
    user: 'root',
    // password
    password: '',
    // database name
    database: 'poker',
  },
  app: true,
  agent: false,
};
```

### 安装依赖包

```bash
yarn
```

## 本地开发

```bash
yarn dev
```

## 部署

鉴于上述 socket.io 小节所说, package.json 中的 `start` 相关的命令都加了 `--workers=1 --sticky`

```bash
yarn start
# 关闭
yarn stop
```

### 性能

为了将多核 CPU 充分发挥起来, 在不对代码进行大改的前提下, 可用以下方案

- `--workers=1 --sticky` 不变
- 开启 10 个进程部署代码, port 从 7000 到 7010
- 7000 的进程可以说是给前端用来进行普通的 api 请求的(其实只要规定好一个 port 就好了)
- 7001-7010 这九个进程, 按 roomNumber 的第一位数字, 来当做 socket.io 服务端
- 前端需要在 socket.io 连接的时候, 根据 roomNumber 连接到不同的 socket.io 服务端
- 说白了, 就是开多个端口, 利用一些规则进行分流

## 扑克牌映射规则

### 数字

| 编号 | 扑克数字 |
| ---- | -------- |
| a    | 2        |
| b    | 3        |
| c    | 4        |
| d    | 5        |
| e    | 6        |
| f    | 7        |
| g    | 8        |
| h    | 9        |
| i    | T(10)    |
| j    | J        |
| k    | Q        |
| l    | K        |
| m    | A        |

### 花色

| 编号 | 扑克花色      |
| ---- | ------------- |
| 1    | 方块 dianmond |
| 2    | 梅花 club     |
| 3    | 红心 heart    |
| 4    | 黑桃 spade    |

## 参考

[midway]: https://midwayjs.org
[eggjs]: https://eggjs.org/zh-cn/
