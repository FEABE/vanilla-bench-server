'use strict';
/**
 * vanilla-web/vanilla-bench-server/js/core.js — 측정 도구 검증
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const WEB = path.join(__dirname, '..', '..', 'vanilla-web', 'vanilla-bench-server');
const C = require(path.join(WEB, 'js', 'core.js'));

test('통계: 백분위, 프레임 시간, 끊김 비율, 기하평균, 점수', function () {
    assert.equal(C.percentile([1, 2, 3, 4, 5], 0.5), 3);
    assert.equal(C.percentile([10, 20], 0.5), 15);
    const st = C.frameStats([16, 16, 17, 16, 50, 16, 16, 16, 16, 16]);
    assert.equal(st.frames, 10);
    assert.equal(st.p50, 16);
    assert.equal(st.jankPct, 10);          // 50ms 하나가 끊김 (20ms × 1.5 초과)
    assert.equal(st.max, 50);
    assert.equal(Math.round(C.geomean([10, 1000])), 100);
    assert.equal(C.geomean([0, -1, NaN]), 0);
    assert.equal(C.indexOf(500, 1000), 500);
    assert.equal(C.indexOf(2000, 1000), 2000);
    assert.equal(C.indexOf(0, 1000), 0);
});

test('같은 계산: JS 로 옮긴 computeHeavy 가 wasm/bench.wasm 과 결과가 같다', async function () {
    const buf = fs.readFileSync(path.join(WEB, 'wasm', 'bench.wasm'));
    const { instance } = await WebAssembly.instantiate(buf, { env: { abort() {} } });
    for (const n of [0, 1, 7, 1000, 99991, 300000]) assert.equal(C.computeHeavyJS(n), instance.exports.computeHeavy(n), 'n=' + n);
});

test('공유 링크: 결과를 압축해 # 뒤에 담고 다시 읽는다 (잘못된 값은 버린다)', async function () {
    const run = { at: 1763270000000, device: { platform: 'Windows', browser: 'Chrome 140', cores: 8, gpu: 'ANGLE (NVIDIA RTX)', refreshHz: 144 }, results: { 'gpu-fill': { score: 123.456, index: 823 }, 'cpu-single': { score: 8123.4, index: 1015 }, 'bad': { error: 'x' } } };
    const code = await C.encodeShare(run);
    assert.match(code, /^[zj][A-Za-z0-9_-]+$/);
    const back = await C.decodeShare(code);
    assert.equal(back.refreshHz, 144);
    assert.match(back.label, /Windows/);
    assert.deepEqual(Object.keys(back.results).sort(), ['cpu-single', 'gpu-fill']);
    assert.equal(back.results['cpu-single'].index, 1015);
    await assert.rejects(() => C.decodeShare('j' + Buffer.from(JSON.stringify({ v: 2 })).toString('base64url')));
});

test('그래프: SVG 를 만들고 이름은 이스케이프한다', function () {
    const svg = C.lineChart([{ name: '<b>CPU</b>', points: [[0, 100], [30, 90], [60, 80]] }], { yUnit: '%' });
    assert.match(svg, /^<svg/);
    assert.doesNotMatch(svg, /<b>CPU/);
    assert.match(svg, /&lt;b&gt;CPU/);
});

test('실제 작업에 쓰는 압축기·diff 는 허브 도구와 같은 파일이다 (복사본이 어긋나지 않게)', function () {
    const pairs = [['minify.js', 'tools/minify/minify.js'], ['mangle.js', 'tools/minify/mangle.js'], ['diff.js', 'tools/diff/diff.js']];
    for (const [lib, tool] of pairs) {
        const a = fs.readFileSync(path.join(WEB, 'js', 'lib', lib), 'utf8').replace(/\r\n/g, '\n');
        const b = fs.readFileSync(path.join(__dirname, '..', '..', 'vanilla-gateway', 'public', tool), 'utf8').replace(/\r\n/g, '\n');
        assert.equal(a, b, lib + ' 가 vanilla-gateway/public/' + tool + ' 와 다릅니다 — 다시 복사하세요');
    }
});

test('외부 라이브러리 없음: three.js 를 쓰지 않고, 페이지는 직접 만든 스크립트만 읽는다', function () {
    assert.equal(fs.existsSync(path.join(WEB, 'js', 'three.min.js')), false);
    const html = fs.readFileSync(path.join(WEB, 'index.html'), 'utf8');
    const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((m) => m[1]);
    assert.deepEqual(scripts, ['/js/http.js', 'js/core.js', 'js/lib/minify.js', 'js/lib/mangle.js', 'js/lib/diff.js', 'js/tests.js', 'js/gfx/effects-2d.js', 'js/gfx/effects-gl.js', 'js/gfx/effects-gpu.js', 'js/gfx/effects-web.js', 'js/gfx/engine.js', 'js/app.js']);
    assert.doesNotMatch(html, /https?:\/\/[^"]*\.js/);
});
