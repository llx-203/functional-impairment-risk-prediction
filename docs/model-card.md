# Model card

**Tool:** complete-input browser calculator, version 1.0.0. **Study model:** `mice_bootstrap_8model_2026-08-19`. **Preparation date:** 14 October 2026.

## Model and implementation

The original research model consists of a frozen MICE-PMM kernel and 20 StandardScaler–XGBoost classifier pipelines. Each pipeline was trained on one completed development dataset. The calculator preserves all 20 frozen classifiers and their scaler parameters, averaging class-1 probabilities. It requires all predictors to be observed, so it can omit new-input imputation without changing those complete input values.

The export contains numeric split thresholds, leaf scores, tree topology, scaler mean/scale and base margins. It omits the kernel, donor rows, training matrices, participant identifiers and tree cover/hessian statistics. No model was retrained. JavaScript uses float32 feature conversion and margin accumulation, with checked numerical tolerance against native XGBoost.

Source SHA-256: `3b4c6be08608e9d5ba1138c08eb0da1ea7f46dcc476fe4ccfe94bec54b9757b6`. This digest identifies the private source artefact, not the exported JSON. Exported files have separate digests in `SHA256SUMS.txt`.

## Intended population and outcome

Older Chinese adults with at least two of the seven specified chronic conditions, without baseline ADL/IADL impairment. Age ≥60 in CHARLS development and ≥65 in CLHLS validation. Outcome: new difficulty in any of six ADL domains or shopping/cooking IADL at follow-up.

CHARLS 2015–2018 included 1,878 participants / 561 events; CLHLS 2014–2018 included 488 / 148. Median follow-up was 36 versus 49 months. This is a wave-based binary outcome, not a flexible survival model.

## Selection, validation and threshold

The final algorithm was selected using CHARLS internal results; CLHLS was used only for independent external validation. Five-fold cross-validation served tuning. Formal internal validation used 500 bootstrap resamples. The threshold `0.3034314632454784` maximized the Youden index on pooled CHARLS out-of-bag predictions and was applied unchanged externally.

Internal optimism-corrected AUC: 0.699632 (95% CI 0.677953–0.720772). External AUC: 0.725497 (95% CI 0.678242–0.771924). External Brier: 0.185585; calibration slope: 1.414; calibration-in-the-large: 0.006. At the frozen threshold, external sensitivity was approximately 0.669 and specificity 0.638. These evaluate the original cohort pipeline; browser-engine validation separately establishes implementation agreement for complete inputs.

## Restrictions and limitations

All 12 measurements are required. Age >95 or a count of 7 conditions extrapolates beyond the development observations. Non-identical cognition and mood constructs across cohorts, 51.1% development physical-activity missingness, different follow-up windows, and unassessed subgroup fairness limit interpretation. No separate impact study establishes benefit from clinical decisions based on the tool.

This edition provides probability and a two-category classification, without SHAP, uncertainty intervals, missing-input processing or batch uploads. Disabling those interface features does not refit the classifier. Scores across trained pipelines are averaged; their variability is not a calibrated individual confidence interval.

Small floating-point differences are expected. Agreement was checked within 10⁻⁶ on synthetic cases; classification matched on all reference cases. A probability arbitrarily close to the cutoff should not be interpreted as a clinically distinct state simply because it falls on one side of the statistical threshold.

## Input processing and data protection

Inputs stay in page memory and are not sent to a prediction server. They can be downloaded locally as JSON by the user. No persistent browser storage or analytics is included.

The repository contains the inference parameters and synthetic validation cases. The original donor-bearing pickle and raw/processed survey data are not distributed.
