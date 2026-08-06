/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('node:https');
const querystring = require('node:querystring');

const CHECKS = [
  {
    name: 'three-way-valve recall 6154',
    path: '/ri/stat/detail.do',
    body: { recallId: '6154', ctype: 'O', currentPageNo: '1' },
    needles: ['캐스퍼 일렉트릭(AX1 EV)', '2024-06-21 ~ 2026-04-24', '18,961 대', '3웨이 밸브 설계 미흡', '3웨이 밸브 개선품 교환 및 퓨즈 교환'],
  },
  {
    name: 'EWP free-repair 3750',
    path: '/ri/grts/detail.do',
    body: { gratischeckId: '3750', ctype: 'O', currentPageNo: '1' },
    needles: ['캐스퍼 전기차 (AX EV)', '2024-07-06 ~ 2024-09-21', '2245 대', '전동식워터펌프(EWP)의 간헐적 작동불량', '드라이버-쿨런트 허브 교환 작업'],
  },
  {
    name: 'ICCU free-repair 4279',
    path: '/ri/grts/detail.do',
    body: { gratischeckId: '4279', ctype: 'O', currentPageNo: '1' },
    needles: ['캐스퍼 전기차 (AX EV)', '2024-07-16 ~ 2025-08-22', '13587 대', 'V2L 사용 시 간헐적으로 통합충전제어장치(ICCU) 내부 고장', '통합충전제어장치(ICCU) 소프트웨어 업데이트'],
  },
];

function post(pathname, body) {
  const payload = querystring.stringify(body);
  return new Promise((resolve, reject) => {
    const request = https.request({ hostname: 'www.car.go.kr', path: pathname, method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', 'content-length': Buffer.byteLength(payload), 'user-agent': 'au7o-known-issues-audit/1.0' }, timeout: 30000 }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
    });
    request.on('timeout', () => request.destroy(new Error('request timeout')));
    request.on('error', reject);
    request.end(payload);
  });
}

async function main() {
  const results = [];
  for (const check of CHECKS) {
    const response = await post(check.path, check.body);
    const missing = check.needles.filter((needle) => !response.body.includes(needle));
    results.push({ name: check.name, status: response.status, passed: response.status === 200 && missing.length === 0, missing });
  }
  const passed = results.every((result) => result.passed);
  console.log(JSON.stringify({ passed, checkedOn: '2026-08-06', results }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
