/* Browser inference for the frozen complete-input XGBoost ensemble. */
(function (root) {
  'use strict';
  const order = ['age','sex','mm_count','mobility_impairment','cog_score','exercise','education','residence','depression','heart_disease','self_rated_health','marital_status'];
  const rules = {
    age: [60,110,true], sex:[0,1,true], mm_count:[2,7,true],
    mobility_impairment:[0,1,true], cog_score:[0,1,false], exercise:[0,1,true],
    education:[0,2,true], residence:[0,1,true], depression:[0,1,false],
    heart_disease:[0,1,true], self_rated_health:[1,5,true], marital_status:[0,1,true]
  };
  function validate(values) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('INVALID_INPUT');
    const clean = {};
    for (const name of order) {
      const raw = values[name];
      if (raw === null || raw === undefined || (typeof raw === 'string' && !raw.trim())) throw new Error('REQUIRED:' + name);
      if (typeof raw !== 'number' && typeof raw !== 'string') throw new Error('INVALID:' + name);
      if (typeof raw === 'string' && !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(raw.trim())) throw new Error('INVALID:' + name);
      const value = Number(raw), [min,max,integer] = rules[name];
      if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw new Error('INVALID:' + name);
      clean[name] = value;
    }
    return clean;
  }
  function riskClass(probability, cutoff) { return probability >= cutoff; }
  function assertBundle(bundle) {
    if (!bundle || bundle.schemaVersion !== 1 || bundle.completeInputsOnly !== true || bundle.aggregation !== 'mean_of_20_probabilities' || !Array.isArray(bundle.models) || bundle.models.length !== 20 || JSON.stringify(bundle.predictorOrder) !== JSON.stringify(order) || !Number.isFinite(bundle.cutoff)) throw new Error('MODEL_INVALID');
  }
  function predict(values, bundle) {
    const clean = validate(values);
    assertBundle(bundle);
    const x = order.map(name => clean[name]);
    const probabilities = bundle.models.map(model => {
      const z = x.map((v,i) => Math.fround((v - model.mean[i]) / model.scale[i]));
      let margin = Math.fround(model.baseMargin);
      for (const tree of model.trees) {
        let node = 0;
        while (tree.left[node] >= 0) node = z[tree.feature[node]] < Math.fround(tree.value[node]) ? tree.left[node] : tree.right[node];
        margin = Math.fround(margin + Math.fround(tree.value[node]));
      }
      // XGBoost uses float32 margins and probability outputs. Binary64 exp
      // followed by float32 rounding is checked against the native reference.
      return Math.fround(1 / (1 + Math.exp(-margin)));
    });
    const probability = probabilities.reduce((a,b) => a + b, 0) / 20;
    const warnings = [];
    if (clean.age > 95) warnings.push('AGE_EXTRAPOLATION');
    if (clean.mm_count === 7) warnings.push('COUNT_EXTRAPOLATION');
    return {probability, highRisk:riskClass(probability,bundle.cutoff), perModel:probabilities, warnings};
  }
  root.FIPredictor = Object.freeze({predict, validate, riskClass, assertBundle, order});
  if (typeof module !== 'undefined' && module.exports) module.exports = root.FIPredictor;
})(globalThis);
