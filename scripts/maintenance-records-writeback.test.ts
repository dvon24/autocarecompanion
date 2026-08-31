import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { renderMaintenanceAlertEmail } from '../src/lib/maintenance-alert-email';
import {
  isManagedMaintenanceReceipt,
  maintenanceReceiptBelongsToOwner,
  validateMaintenanceReceiptContents,
} from '../src/lib/maintenance-receipt-storage';
import {
  calculateServiceRecordMetrics,
  filterServiceRecords,
  groupServiceRecordsByYear,
  type ServiceRecordView,
} from '../src/lib/service-records';

const records: ServiceRecordView[] = [
  { id:'r2', type:'brake_fluid', mileage:52000, cost:null, date:'2025-04-01', shopName:'Brake & Tire', receiptUrl:'https://blob.example/receipt.pdf' },
  { id:'r1', type:'oil_change', mileage:45000, cost:89.5, date:'2024-10-02', notes:'Owner supplied oil' },
  { id:'r3', type:'tire_rotation', mileage:60000, cost:0, date:'2025-09-15' },
];

test('service record metrics use only persisted facts and handle empty boundaries', () => {
  assert.deepEqual(calculateServiceRecordMetrics([], 1000), {
    totalSpent:0,
    pricedRecordCount:0,
    receiptCount:0,
    milesSinceLatest:null,
    longestMileageGap:null,
  });
  assert.deepEqual(calculateServiceRecordMetrics(records, 65000), {
    totalSpent:89.5,
    pricedRecordCount:2,
    receiptCount:1,
    milesSinceLatest:5000,
    longestMileageGap:8000,
  });
  assert.equal(calculateServiceRecordMetrics(records, 50000).milesSinceLatest, null);
});

test('service record filters and year groups preserve newest-first records', () => {
  assert.deepEqual(filterServiceRecords(records, 'receipt').map((record) => record.id), ['r2']);
  assert.deepEqual(filterServiceRecords(records, 'shop').map((record) => record.id), ['r2']);
  assert.deepEqual(filterServiceRecords(records, 'owner').map((record) => record.id), ['r1', 'r3']);
  assert.deepEqual(groupServiceRecordsByYear(records).map((group) => [group.year, group.records.map((record) => record.id)]), [
    ['2025', ['r3', 'r2']],
    ['2024', ['r1']],
  ]);
});

test('receipt intake rejects MIME-only disguises and recognizes managed private paths', async () => {
  const pdf = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37])], 'invoice.pdf', { type:'application/pdf' });
  const disguised = new File(['not a png'], 'invoice.png', { type:'image/png' });
  assert.equal(await validateMaintenanceReceiptContents(pdf), null);
  assert.match(await validateMaintenanceReceiptContents(disguised) || '', /contents do not match/i);
  assert.equal(isManagedMaintenanceReceipt('maintenance-receipts/user/vehicle/file.pdf'), true);
  assert.equal(isManagedMaintenanceReceipt('https://store.private.blob.vercel-storage.com/maintenance-receipts/user/vehicle/file.pdf'), true);
  assert.equal(isManagedMaintenanceReceipt('https://example.test/maintenance-receipts/user/vehicle/file.pdf'), false);
  assert.equal(isManagedMaintenanceReceipt('https://example.test/unmanaged/file.pdf'), false);
  const owned = 'https://store.private.blob.vercel-storage.com/maintenance-receipts/user-1/vehicle-1/file.pdf';
  assert.equal(maintenanceReceiptBelongsToOwner(owned, 'user-1', 'vehicle-1'), true);
  assert.equal(maintenanceReceiptBelongsToOwner(owned, 'user-2', 'vehicle-1'), false);
  assert.equal(maintenanceReceiptBelongsToOwner(owned, 'user-1', 'vehicle-2'), false);
});

test('maintenance email escapes dynamic facts and links to the exact owner vehicle', () => {
  const html = renderMaintenanceAlertEmail({
    userName:'Devon <script>alert(1)</script>',
    appUrl:'https://app.au7o.test/surplus-path',
    alerts:[{
      vehicleId:'vehicle/id?unsafe=1',
      vehicleName:'2020 <img src=x onerror=alert(1)>',
      currentMileage:65432,
      maintenanceType:'oil_change',
      maintenanceName:'Oil & filter <urgent>',
      status:{
        status:'overdue',
        message:'Overdue by <500> miles',
        dueAtMileage:65000,
        dueAtDate:new Date('2026-09-15T00:00:00.000Z'),
      },
    }],
  });
  assert.match(html, /Devon &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Oil &amp; filter &lt;urgent&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /https:\/\/app\.au7o\.test\/garage\/vehicle%2Fid%3Funsafe%3D1\/maintenance\?view=history/);
  assert.match(html, /65,432 mi/);
  assert.doesNotMatch(html, /Challenger|\$134\.00|sample/i);
});

test('responsive and trust boundaries remain present in the affected UI entry points', async () => {
  const [historyPage, logFlow, tree, account, prompt] = await Promise.all([
    readFile('src/app/garage/[id]/maintenance/page.tsx', 'utf8'),
    readFile('src/components/vehicle/MaintenanceLogFlow.tsx', 'utf8'),
    readFile('src/components/twin/stage/TechTree.jsx', 'utf8'),
    readFile('src/app/account/page.tsx', 'utf8'),
    readFile('src/lib/hub-chat-prompt.ts', 'utf8'),
  ]);
  assert.match(historyPage, /view=history/);
  assert.match(historyPage, /<ServiceRecords/);
  assert.match(historyPage, /nextOffset/);
  assert.match(historyPage, /offset=\$\{offset\}/);
  assert.match(logFlow, /minWidth: 'min\(100%, 220px\)'/);
  assert.match(logFlow, /maintenance-mileage-error/);
  assert.match(tree, /onPointerDown=\{e=>e\.stopPropagation\(\)\}/);
  assert.match(account, /minmax\(0, 1fr\) minmax\(0, 340px\)/);
  assert.match(prompt, /response-only/);
  assert.match(prompt, /Never say or imply/);
});
