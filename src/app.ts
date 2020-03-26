import { Application } from 'egg';
import * as path from 'path';
import ElkTransport from './app/helper/logTransport';

export default (app: Application) => {
    app.beforeStart(async () => {});
    app.logger.set('remoteInfo', new ElkTransport({
        level: 'INFO',
        file: path.join(app.baseDir, '../logs/ELKLog/info.log'),
    }));
    app.logger.set('remoteError', new ElkTransport({
        level: 'ERROR',
        file: path.join(app.baseDir, '../logs/ELKLog/error.log'),
    }));
};
