"""Maintainer-only export. Never copies donor data into the public package.

Usage: python scripts/export_frozen_model.py --project /path/to/authorized/final1
Requires the recorded Python modelling environment. Readers do not need it.
"""
import argparse
import csv
import hashlib
import importlib.metadata
import json
import pickle
import sys
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
ORDER = ['age', 'sex', 'mm_count', 'mobility_impairment', 'cog_score', 'exercise', 'education', 'residence', 'depression', 'heart_disease', 'self_rated_health', 'marital_status']


def sha256(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for block in iter(lambda: f.read(4 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def synthetic_cases(pipelines):
    rng = np.random.default_rng(2026)
    records = []
    for i in range(2000):
        records.append(dict(zip(ORDER, [int(rng.integers(60, 111)), int(rng.integers(2)), int(rng.integers(2, 8)), int(rng.integers(2)), float(rng.random()), int(rng.integers(2)), int(rng.integers(3)), int(rng.integers(2)), float(rng.random()), int(rng.integers(2)), int(rng.integers(1, 6)), int(rng.integers(2))])))
    low = dict(zip(ORDER, [60, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0]))
    high = dict(zip(ORDER, [110, 1, 7, 1, 1, 1, 2, 1, 1, 1, 5, 1]))
    records += [low, high]
    base = dict(zip(ORDER, [70, 1, 3, 1, .35, 1, 1, 1, .4, 1, 4, 0]))
    # Valid continuous inputs around actual split thresholds, with adjacent
    # float32 standardized values. No participant rows are used.
    seen = set()
    for pipe in pipelines:
        raw = json.loads(pipe.named_steps['clf'].get_booster().save_raw(raw_format='json'))
        for tree in raw['learner']['gradient_booster']['model']['trees']:
            for left, feat, value in zip(tree['left_children'], tree['split_indices'], tree['split_conditions']):
                if left < 0 or feat not in (4, 8):
                    continue
                k = (feat, float(np.float32(value)), float(pipe[0].mean_[feat]), float(pipe[0].scale_[feat]))
                if k in seen:
                    continue
                seen.add(k)
                split = np.float32(value)
                for z in [np.nextafter(split, np.float32(-np.inf)), split, np.nextafter(split, np.float32(np.inf))]:
                    x = float(z) * float(pipe[0].scale_[feat]) + float(pipe[0].mean_[feat])
                    if 0 <= x <= 1:
                        records.append({**base, ORDER[feat]: x})
    return pd.DataFrame(records, columns=ORDER).drop_duplicates().reset_index(drop=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--project', required=True, type=Path)
    args = parser.parse_args()
    project = args.project.resolve()
    spec = json.loads((project / 'outputs/models/final_model_specification.json').read_text(encoding='utf-8'))
    source = project / 'outputs/models/final_model.pkl'
    expected_hash = spec['final_model_pkl_sha256']
    if sha256(source) != expected_hash:
        raise RuntimeError('Frozen source digest differs from the specification.')
    # This is the known, locally audited artefact, not an uploaded pickle.
    with source.open('rb') as f:
        frozen = pickle.load(f)
    assert frozen['type'] == 'MI_ensemble'
    assert frozen['selected_algorithm'] == 'XGBoost'
    assert frozen['predictors'] == ORDER == spec['predictors']
    assert len(frozen['pipelines']) == 20
    models = []
    for pipe in frozen['pipelines']:
        scaler = pipe.named_steps['scaler']
        assert scaler.with_mean and scaler.with_std
        raw = json.loads(pipe.named_steps['clf'].get_booster().save_raw(raw_format='json'))
        learner = raw['learner']
        assert learner['objective']['name'] == 'binary:logistic'
        assert learner['gradient_booster']['name'] == 'gbtree'
        base = float(learner['learner_model_param']['base_score'].strip('[]'))
        p32 = np.float32(base)
        base_margin = float(np.float32(-np.log(np.float32(1) / p32 - np.float32(1))))
        trees = []
        for tree in learner['gradient_booster']['model']['trees']:
            assert not tree['categories'] and not any(tree['split_type'])
            trees.append({'left': tree['left_children'], 'right': tree['right_children'], 'feature': tree['split_indices'], 'value': [float(np.float32(x)) for x in tree['split_conditions']]})
        models.append({'mean': scaler.mean_.tolist(), 'scale': scaler.scale_.tolist(), 'baseMargin': base_margin, 'trees': trees})
    bundle = {'schemaVersion': 1, 'toolVersion': '1.0.0', 'modelVersion': spec['analysis_version'], 'sourceSha256': expected_hash, 'predictorOrder': ORDER, 'cutoff': spec['youden_threshold_charls'], 'aggregation': 'mean_of_20_probabilities', 'completeInputsOnly': True, 'models': models}
    compact = json.dumps(bundle, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
    (ROOT / 'models').mkdir(exist_ok=True)
    (ROOT / 'models/ensemble.json').write_text(compact + '\n', encoding='utf-8')
    (ROOT / 'models/model-data.js').write_text('/* Frozen inference parameters; no donor kernel or individual records. */\n' + 'globalThis.FI_MODEL=' + compact + ';\n', encoding='utf-8')
    frame = synthetic_cases(frozen['pipelines'])
    sys.path.insert(0, str(project / 'risk_prediction_webtool'))
    from utils.predictor import predict_matrix
    # Independent reference: invoke the original frozen MICE + pipeline path.
    reference = predict_matrix(frozen, frame)
    direct = np.column_stack([pipe.predict_proba(frame.to_numpy(dtype=np.float64))[:, 1] for pipe in frozen['pipelines']])
    unchanged = float(np.max(np.abs(reference - direct)))
    assert unchanged == 0, f'Complete inputs changed under original imputation: {unchanged}'
    cases = [{'id': f'SYN_{i:04d}', 'values': row, 'expectedProbability': float(reference[i].mean()), 'expectedHighRisk': bool(reference[i].mean() >= bundle['cutoff']), 'expectedPerModel': reference[i].tolist()} for i, row in enumerate(frame.to_dict('records'))]
    (ROOT / 'tests').mkdir(exist_ok=True)
    (ROOT / 'tests/reference-cases.json').write_text(json.dumps(cases, separators=(',', ':'), allow_nan=False) + '\n', encoding='utf-8')
    metadata = {'inspectionDate': '2026-10-14', 'sourceModelSha256': expected_hash, 'sourceModelBytes': source.stat().st_size, 'modelCount': 20, 'treeCount': sum(len(m['trees']) for m in models), 'syntheticCaseCount': len(cases), 'completeInputOriginalVsBypassMaxDifference': unchanged, 'noTrainingOrRetuning': True, 'exportedKeys': list(bundle), 'perModelExportedKeys': list(models[0]), 'perTreeExportedKeys': list(models[0]['trees'][0]), 'excluded': ['MICE kernel', 'PMM donor rows', 'training matrices', 'participant identifiers', 'individual survey predictions', 'tree cover/hessian statistics'], 'referenceMethod': 'original webtool utils.predictor.predict_matrix using the frozen kernel and all 20 pipelines', 'pythonVersion': sys.version.split()[0], 'packages': {n: importlib.metadata.version(n) for n in ['numpy', 'pandas', 'scikit-learn', 'xgboost', 'miceforest', 'lightgbm', 'scipy']}}
    (ROOT / 'tests/export-report.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    public_meta = {'tool_version': '1.0.0', 'prepared_date': '2026-10-14', 'model_version': spec['analysis_version'], 'source_model_sha256': expected_hash, 'input_mode': 'all_12_predictors_observed', 'missing_input_handling': 'rejected', 'predictor_order': ORDER, 'model_count': 20, 'tree_count': metadata['treeCount'], 'probability_aggregation': 'mean_of_20_probabilities', 'cutoff': bundle['cutoff'], 'cutoff_source': spec['threshold_source'], 'development_cohort': {'name': 'CHARLS 2015-2018', 'n': 1878, 'events': 561, 'median_followup_months': 36}, 'external_validation_cohort': {'name': 'CLHLS 2014-2018', 'n': 488, 'events': 148, 'median_followup_months': 49}, 'outcome': 'incident ADL (six domains) or shopping/cooking IADL impairment at study follow-up', 'individual_shap_available': False, 'repository_url': 'https://github.com/llx-203/functional-impairment-risk-prediction'}
    (ROOT / 'models/metadata.json').write_text(json.dumps(public_meta, indent=2) + '\n', encoding='utf-8')
    ui_rows = [base_example(), {**base_example(), 'age': 82}, {**base_example(), 'age': 110, 'mm_count': 7}]
    ui_reference = predict_matrix(frozen, pd.DataFrame(ui_rows, columns=ORDER)).mean(axis=1)
    ui_cases = [{'id': f'SYN_UI_{i}', 'values': row, 'expectedProbability': float(ui_reference[i]), 'expectedDisplayPercent': f'{ui_reference[i] * 100:.1f}', 'expectedHighRisk': bool(ui_reference[i] >= bundle['cutoff'])} for i, row in enumerate(ui_rows)]
    (ROOT / 'tests/ui-reference.json').write_text(json.dumps(ui_cases, indent=2) + '\n', encoding='utf-8')
    (ROOT / 'examples').mkdir(exist_ok=True)
    with (ROOT / 'examples/synthetic-inputs.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=ORDER)
        writer.writeheader()
        writer.writerows([frame.iloc[0].to_dict(), base_example(), frame.iloc[2000].to_dict()])
    print(json.dumps({'exportedModels': 20, 'treeCount': metadata['treeCount'], 'syntheticCases': len(cases), 'originalCompleteInputDifference': unchanged, 'ensembleBytes': len(compact.encode('utf-8'))}, indent=2))


def base_example():
    return dict(zip(ORDER, [70, 1, 3, 1, .35, 1, 1, 1, .4, 1, 4, 0]))


if __name__ == '__main__':
    main()
