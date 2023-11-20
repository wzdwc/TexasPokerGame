#! /bin/bash

START_PORT=7000
END_PORT=7010
PORTS=$(seq ${START_PORT} 1 ${END_PORT})
TITLE_PREFIX="taxes-poker-server"

function show_help() {
cat <<HEREDOCUMENT
用法: $0 (start|stop|restart)

一次性开始10个 node 进程, 端口从 ${START_PORT} 到 ${END_PORT}

HEREDOCUMENT
}

function start() {
    current_path=$(cd $(dirname $0);pwd)
    base_dir=$(dirname $current_path)
    yarn build
    options="--daemon --framework=@midwayjs/web --ts --sticky --workers=1"
    for port in ${PORTS[@]}; do
        PORT=${port} yarn egg-scripts start ${base_dir} --port ${port} --title="${TITLE_PREFIX}-${port}" ${options}
    done
}

function stop() {
    for port in ${PORTS[@]}; do
        yarn egg-scripts stop --title="${TITLE_PREFIX}-${port}"
    done
}


# 参数个数判断
if [ $# -ne 1 ]; then
    echo 参数个数错误
    show_help
    exit 1
fi

case $1 in
    "start")
        start
        ;;
    "stop")
        stop
        ;;
    "restart")
        stop && start
        ;;
    *)
        echo 参数错误
        show_help
        exit 1
        ;;
esac
