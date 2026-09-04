'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const H = require('../../vanilla-common-node/test/helpers/boot.js');
let server, port;
before(async function () {
    H.boot({ VANILLA_DISABLE_POLLERS: '1', VANILLA_DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'vanilla-bench-')) });
    global.UtilHttpClient.request = function () { return Promise.reject(new Error('no network in tests')); };
    server = await H.listen('vanilla-web/vanilla-bench-server'); port = server.__port;
    if (typeof global.SERVER === 'undefined') global.SERVER = server;
    require(path.join(__dirname, '..', 'js-router', 'bench.api.routers.js'));
});
after(async function () { await H.close(server); });
test('GET /api/bench/status → 표준 봉투 + legacy 필드', async function () {
    const r = await H.request(port, 'GET', '/api/bench/status');
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true); assert.equal(r.json.success, true);
    assert.equal(r.json.data.service, 'vanilla-bench-server');
    assert.equal(r.json.data.status, 'ok');
    assert.equal(typeof r.json.data.uptime, 'number');
    assert.equal(r.json.message, 'Bench service router is ready');
});
