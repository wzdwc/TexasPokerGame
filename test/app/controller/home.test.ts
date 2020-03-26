/* tslint:disable */
const { app, assert } = require('midway-mock/bootstrap');

/* tslint:enable */

describe('test/app/controller/home.test.ts', () => {

  it('should assert', async () => {
    const pkg = require('../../../package.json');
    assert(app.config.keys.startsWith(pkg.name));
    // const ctx = app.mockContext({});
    // await ctx.service.xx();
  });

  it('should POST /ocrAuth', () => {
    /* tslint:disable */
    return app.httpRequest().
      post('/node/ocrAuth').
      set('Authorization', 'Bearer ad7bc5ae-e19e-4d39-9a93-aa75bc01ede1').
      send({
        'params': JSON.stringify({
          'head': {
            'clientId': 0,
            'appUDID': '',
            'appVersion': '',
            'channelId': '',
            'innerMedia': '',
            'outerMedia': '',
            'subClientId': '0',
            'systemVersion': 'undefined',
            'origin': '',
          },
          'body': {
            'name': '蔡建帮',
            'address': '测试',
            'authOrg': '测试政府',
            'gender': '男',
            'idNo': '445222198911111111',
            'nation': '中国',
            'validDate': '20190909 - 20990907',
            'frontImage': '',
            'backImage': '',
            'productId': 'L0003',
            'channelType': 1,
          },
        }),
      }).
      expect(200);
  });
});
