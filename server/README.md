poke-game-center
================
> pokeGame server，base on TypeScript,midway,node,mysql,redis 

### Setup
See: [egg document][eggjs], [midway document][midway]。

- Redis for game room
```
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
- DataBase
> Mysql
```
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
- Install
```bash
$ yarn
$ yarn dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### Test
```
yarn test

```
- See [midway document - test](https://eggjs.org/zh-cn/core/unittest)。

### Project structure
```
├─dist
├─logs
│  ├─ELKLog   // report log
|  |  ├─info.log
|  |  └─error.log
│  └─node-loan-center   // system log
├─node_modules
├─src
│  ├─app
│  │  ├─controller     // http controller
│  │  ├─core           // poker core code
|  |  |  ├─Player.ts     // game player class
|  |  |  ├─Poker.ts      // poker class, get random poker cards
|  |  |  ├─PokerGame.ts   // poker game Class
│  │  │  └─PokerStyle.ts   // Contrast poker style and all TexasPoker style
│  │  ├─extend
│  │  ├─helper
│  │  ├─io
│  │  │  ├─controller      // socket.io controller
│  │  │  └─middleware      //do auth, join, leave middleware
│  │  ├─middleware        // http middleware
│  │  └─public           // client
│  ├─config              // system base config
│  ├─interface
│  │  └─service
│  ├─lib
│  ├─service             // http service
│  └─utils               // some tools
└─test  // test case
    └─app
        └─controller

```

[midway]: https://midwayjs.org
[git-rules]: https://confluence.sui.work/pages/viewpage.action?pageId=51120607
[eggjs]: https://eggjs.org/zh-cn/

## License
The MIT License (MIT)
