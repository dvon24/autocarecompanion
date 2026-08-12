import assert from 'node:assert/strict';
import test from 'node:test';
import { candidateQualifiersAppearInArticle } from './part-type-evidence';

test('side and emissions qualifiers must be present in article evidence', () => {
  assert.equal(candidateQualifiersAppearInArticle('Driver Side Mirror Motor', 'Replace the driver-side mirror motor.'), true);
  assert.equal(candidateQualifiersAppearInArticle('Passenger Side Mirror Motor', 'Replace the driver-side mirror motor.'), false);
  assert.equal(candidateQualifiersAppearInArticle('CARB Catalytic Converter', 'Replace the EPA catalytic converter.'), false);
  assert.equal(candidateQualifiersAppearInArticle('EPA Catalytic Converter', 'Replace the EPA catalytic converter.'), true);
  assert.equal(candidateQualifiersAppearInArticle('EPA Catalytic Converter', 'Repair the catalytic converter.'), false);
  assert.equal(candidateQualifiersAppearInArticle('CARB Catalytic Converter', 'Carbon buildup; replace the catalytic converter.'), false);
  assert.equal(candidateQualifiersAppearInArticle('Right Headlight', 'Replace the bright headlight.'), false);
  assert.equal(candidateQualifiersAppearInArticle('Rear Shock', 'A dreary noise requires replacing the shock.'), false);
});
