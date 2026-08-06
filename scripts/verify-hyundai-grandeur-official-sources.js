/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const querystring = require('node:querystring');
const { OFFICIAL_REGISTRY, SOURCES } = require('./build-hyundai-grandeur-adjudication');

function requestUrl(url, options = {}, body = null, redirects = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const request = https.request(target, { method: options.method || 'GET', headers: { 'user-agent': 'au7o-known-issues-audit/1.0', accept: '*/*', ...(options.headers || {}) }, timeout: 60000 }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 5) {
        response.resume();
        resolve(requestUrl(new URL(response.headers.location, target).toString(), {}, null, redirects + 1));
        return;
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, contentType: response.headers['content-type'] || '', body: Buffer.concat(chunks) }));
    });
    request.on('timeout', () => request.destroy(new Error(`timeout: ${url}`)));
    request.on('error', reject);
    request.end(body);
  });
}

function postRegistry(pathname, body) {
  const payload = querystring.stringify(body);
  return requestUrl(`https://www.car.go.kr${pathname}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'content-length': Buffer.byteLength(payload) } }, payload);
}

const REGISTRY_CHECKS = [
  { name: 'stall free-repair 2781', path: '/ri/grts/detail.do', body: { gratischeckId: OFFICIAL_REGISTRY.stall.recordId, ctype: 'O', currentPageNo: '1' }, needles: ['그랜저 (GN7) 2.5 GDI', '2022-11-16 ~ 2023-01-02', '4818 대', '중립제어 구간 전기 부하 대응 데이터 강건화 미흡', 'ECU 업그레이드'] },
  { name: 'brake rollback recall 4726', path: '/ri/stat/detail.do', body: { recallId: OFFICIAL_REGISTRY.brakeRollback.recordId, ctype: 'O', currentPageNo: '1' }, needles: ['그랜저 하이브리드(GN7 HEV)', '14,316 대', '경사로 5%미만', '후방 밀림', '소프트웨어 업데이트'] },
  { name: 'parking warning recall 4697', path: '/ri/stat/detail.do', body: { recallId: '4697', ctype: 'O', currentPageNo: '1' }, needles: ['그랜저(GN7)', '11,200 대', '주차 거리 경고(PDW)', '바디제어장치(BDC) 소프트웨어 업데이트'] },
  { name: 'door-handle free-repair 2818', path: '/ri/grts/detail.do', body: { gratischeckId: '2818', ctype: 'O', currentPageNo: '1' }, needles: ['8475 대', '도어핸들터치센서(DHS)', '업그레이드'] },
  { name: 'LDM free-repair 2816', path: '/ri/grts/detail.do', body: { gratischeckId: '2816', ctype: 'O', currentPageNo: '1' }, needles: ['1961 대', '저온 조건', 'LDM 양측 교환'] },
  { name: 'BMS free-repair 2838', path: '/ri/grts/detail.do', body: { gratischeckId: '2838', ctype: 'O', currentPageNo: '1' }, needles: ['6006 대', '배터리 제어 시스템(BMS)', '배터리 방전', 'BMS 업그레이드'] },
  { name: 'tailgate free-repair 2839', path: '/ri/grts/detail.do', body: { gratischeckId: '2839', ctype: 'O', currentPageNo: '1' }, needles: ['1524 대', '파워트렁크/파워테일게이트(PTG)', '업그레이드'] },
  { name: 'KSDS free-repair 1693', path: '/ri/grts/detail.do', body: { gratischeckId: '1693', ctype: 'O', currentPageNo: '1' }, needles: ['그랜저(IG): 2016.06.21~2018.05.09', '커넥팅로드 베어링 손상', 'KSDS 신규 소프트웨어'] },
  { name: 'KSDS free-repair 1692', path: '/ri/grts/detail.do', body: { gratischeckId: '1692', ctype: 'O', currentPageNo: '1' }, needles: ['그랜저(IG): 2018.04.26~2019.12.10', '커넥팅로드 베어링 손상', 'KSDS 업데이트'] },
];

async function main() {
  const results = [];
  for (const [name, url] of Object.entries(SOURCES)) {
    const response = await requestUrl(url);
    const isPdf = /\.pdf$/i.test(url);
    const text = isPdf ? '' : response.body.toString('utf8');
    const needles = name === 'grandeur2019' ? ['2019 Grandeur', '2.4 GDi'] : [];
    const passed = response.status === 200 && (isPdf ? response.body.subarray(0, 4).toString('ascii') === '%PDF' : needles.every((needle) => text.includes(needle)));
    results.push({ name, kind: 'stable-public-source', status: response.status, bytes: response.body.length, passed, url });
  }
  for (const check of REGISTRY_CHECKS) {
    const response = await postRegistry(check.path, check.body);
    const text = response.body.toString('utf8');
    const missing = check.needles.filter((needle) => !text.includes(needle));
    results.push({ name: check.name, kind: 'POST-only-registry-evidence', status: response.status, passed: response.status === 200 && missing.length === 0, missing });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
