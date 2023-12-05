# poke-game-front-ts

## Setup

```bash
yarn
yarn serve
```

## 环境变量

```bash
VUE_APP_API_IP
VUE_APP_ENABLE_MULTIPLE_SOCKET
```

### 编译

```
VUE_APP_API_IP=1.2.3.4 VUE_APP_ENABLE_MULTIPLE_SOCKET=0 NODE_ENV=production yarn build
```

### Run your tests

```
yarn run test
```

## Project structure
```
├─public  // html
└─src
    ├─assets
    │  ├─less
    │  └─mp3
    ├─components
    ├─interface
    ├─plugins
    ├─router
    ├─service     // api
    ├─store
    ├─utils
    └─views
```

## License
The MIT License (MIT)
