/* Runs without npm packages. All reference inputs are independently synthetic. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const engine = require(path.join(root,'assets/predictor.js'));
const model = JSON.parse(fs.readFileSync(path.join(root,'models/ensemble.json'),'utf8'));
const cases = JSON.parse(fs.readFileSync(path.join(__dirname,'reference-cases.json'),'utf8'));
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(root,'models/model-data.js'),'utf8'),sandbox);
assert.deepEqual(JSON.parse(JSON.stringify(sandbox.FI_MODEL)), model, 'Offline model script must contain the canonical model.');
let maxDifference = 0, maxModelDifference = 0, mismatches = 0, nearest = 1;
for (const test of cases) {
  const actual = engine.predict(test.values,model);
  maxDifference = Math.max(maxDifference,Math.abs(actual.probability - test.expectedProbability));
  maxModelDifference = Math.max(maxModelDifference,...actual.perModel.map((p,i)=>Math.abs(p - test.expectedPerModel[i])));
  if (actual.highRisk !== test.expectedHighRisk) mismatches++;
  nearest = Math.min(nearest,Math.abs(test.expectedProbability-model.cutoff));
}
assert(maxDifference <= 1e-6, 'Mean prediction difference exceeds 1e-6.');
assert(maxModelDifference <= 1e-6, 'Per-model difference exceeds 1e-6.');
assert.equal(mismatches,0,'Risk classification differs from the original path.');
assert.equal(engine.riskClass(model.cutoff,model.cutoff),true);
assert.equal(engine.riskClass(model.cutoff-1e-12,model.cutoff),false);
assert.equal(engine.riskClass(model.cutoff+1e-12,model.cutoff),true);
const base = cases[0].values;
const uiCases = JSON.parse(fs.readFileSync(path.join(__dirname,'ui-reference.json'),'utf8'));
for(const test of uiCases) {
  const result = engine.predict(test.values,model);
  assert(Math.abs(result.probability-test.expectedProbability)<=1e-6);
  assert.equal((result.probability*100).toFixed(1),test.expectedDisplayPercent);
  assert.equal(result.highRisk,test.expectedHighRisk);
}
let invalidChecks = 0;
for (const name of engine.order) {
  for (const value of [null,undefined,'',NaN,Infinity,'not-a-number',false]) {
    assert.throws(()=>engine.predict({...base,[name]:value},model)); invalidChecks++;
  }
}
for (const values of [{age:59},{age:111},{age:70.5},{mm_count:1},{mm_count:8},{sex:2},{cog_score:-.1},{cog_score:1.01},{depression:1.01},{education:3},{self_rated_health:0},{marital_status:2}]) {
  assert.throws(()=>engine.predict({...base,...values},model)); invalidChecks++;
}
assert(engine.predict({...base,age:110,mm_count:7},model).warnings.length === 2);
const allowedTop = ['schemaVersion','toolVersion','modelVersion','sourceSha256','predictorOrder','cutoff','aggregation','completeInputsOnly','models'];
assert.deepEqual(Object.keys(model),allowedTop);
for (const m of model.models) {
  assert.deepEqual(Object.keys(m),['mean','scale','baseMargin','trees']);
  assert.equal(m.mean.length,12); assert.equal(m.scale.length,12);
  assert(m.scale.every(x=>x>0 && Number.isFinite(x)));
  for (const t of m.trees) {
    assert.deepEqual(Object.keys(t),['left','right','feature','value']);
    assert.equal(t.left.length,t.right.length); assert.equal(t.left.length,t.value.length);
  }
}
const report = {date:'2026-10-14',syntheticCaseCount:cases.length,maxAbsoluteProbabilityDifference:maxDifference,maxPerModelDifference:maxModelDifference,riskClassMismatches:mismatches,minimumReferenceDistanceToCutoff:nearest,tolerance:1e-6,invalidInputChecks:invalidChecks,thresholdBoundaryChecks:3,offlineScriptMatchesCanonicalModel:true,exportSchemaContainsOnlyInferenceParameters:true,result:'PASS'};
fs.writeFileSync(path.join(__dirname,'validation-results.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
