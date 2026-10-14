# Implementation validation

Validation date: **14 October 2026**. This concerns computational agreement, not a new clinical validation study.

## Independent Python reference

The maintainer verified the frozen source pickle SHA-256 against the study specification before loading it. The original web-tool function `utils.predictor.predict_matrix` applied the actual frozen MICE kernel, each corresponding StandardScaler and XGBoost classifier. All reference inputs were generated independently; no participant-level survey cases were exported.

There were **3,587** unique complete inputs: 2,000 random synthetic profiles, two extreme valid profiles, and valid continuous cognition/depression values near actual standardized tree splits. Comparing the original MICE path to the same 20 pipelines on direct complete inputs produced a maximum per-model difference of **0.0**. The donors are therefore unnecessary for these complete-input predictions.

The export uses only an allowed inference schema. Original XGBoost JSON is obtained through `save_raw(raw_format='json')`; only required numeric inference fields are retained. Training statistics, cover/hessian arrays, the MICE kernel and donor datasets are omitted.

## JavaScript reference comparison

`node tests/verify-model.cjs` checks the actual browser-engine code against those native Python outputs, using the canonical exported model and comparing the offline model script to the same JSON.

| Check | Observed result |
|---|---|
| Reference cases | 3,587 |
| Maximum absolute mean-probability difference | 3.427267075695184 × 10⁻⁸ |
| Maximum per-model probability difference | 8.940696716308594 × 10⁻⁸ |
| Risk-class mismatches | 0 |
| Acceptance tolerance | 10⁻⁶ |
| Invalid-input checks | 96 |
| Classification boundary checks | 3: below, at, above cutoff |
| Closest reference probability to cutoff | Absolute distance 8.384883013651256 × 10⁻⁵ |

Boundary checks test classification logic at the threshold; they do not claim a real model profile exactly equals the cutoff. Float32 rounding and mathematical-library implementations cause tiny differences. The browser calculation is within the tested tolerance and is not claimed to be bit-identical to native XGBoost for every possible input.

Machine-readable evidence: `tests/export-report.json` and `tests/validation-results.json`. All reference records in `tests/reference-cases.json` are synthetic and use `SYN_` identifiers.

## Browser verification

Actual browser verification is recorded separately in `tests/browser-qa.json`. It covers HTTP serving, example prediction, language switching, missing/range/eligibility handling, stale-result indication, extrapolation notices, result download, reset, and desktop/mobile layout. Source/package review separately checks that the calculator contains no prediction network calls. These interface checks do not substitute for the independent numerical reference.

The browser automation URL policy blocks `file://`. Direct local-file opening could not be tested through that browser; no bypass was attempted. The offline script bundle is verified to contain the same canonical model and uses ordinary local script tags without fetch/module loading. The HTTP-served local entry point was tested successfully.

## Re-running checks

Node.js alone is enough for the public test suite; npm installation is unnecessary:

```bash
node tests/verify-model.cjs
node scripts/audit-package.cjs
```

Ordinary users need only a browser. Regenerating the model/reference cases requires the authorized private study artefact, the maintainer export script and the recorded Python environment. It never belongs in the public repository.
