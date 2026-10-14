# Predictor measurement and coding

All 12 inputs are required and must be observed. Do not replace unknown values with zero, a mean or an unrelated scale. Predictor order is fixed in the model bundle.

| Predictor | Input and coding | Study measurement / interpretation |
|---|---|---|
| `age` | Integer 60–110 years | CHARLS development observed 60–95. Values >95 trigger extrapolation notice. |
| `sex` | 0 male; 1 female | Study sex variable. |
| `mm_count` | Integer 2–7 | Count physician-diagnosed hypertension, diabetes, heart disease, stroke, lung disease, cancer and arthritis only. Development observed 2–6. |
| `mobility_impairment` | 0 no; 1 yes | CHARLS `r3mobilsev > 0` indicates mobility difficulty. Relevant survey tasks cover walking, chair rise, stooping, lifting, jogging and raising arms. This is distinct from baseline ADL/IADL eligibility. Use the survey summary definition rather than treating any medical condition as mobility impairment. |
| `cog_score` | Numeric 0–1 | CHARLS `r3tr20 / 20`, immediate and delayed word recall total out of 20. CLHLS used a non-identical MMSE-like construct normalized to 0–1. This is not measurement equivalence. Do not enter an MMSE/MoCA raw score or arbitrary perceived ability. |
| `exercise` | 0 no; 1 yes | CHARLS vigorous/moderate activity indicators combined by three-valued OR: yes if either is yes, no only if both are observed no. CLHLS `d91`: 1 yes → 1, 2 no → 0. Unknown activity is not no. |
| `education` | 0 none; 1 1–6 years; 2 ≥7 years | CHARLS `raeduc_c`: 1 → 0, 2–4 → 1, 5–10 → 2; these include incomplete primary/sishu/elementary in the middle tier. CLHLS uses schooling years. |
| `residence` | 0 urban; 1 rural | Actual residence, not hukou classification. |
| `depression` | Numeric 0–1 | CHARLS CESD-10 total (0–30) divided by 30, including the instrument's proper reverse coding. CLHLS used a non-identical seven-item mood measure. Do not substitute PHQ-9, GDS or unscaled raw scores. |
| `heart_disease` | 0 no; 1 yes | Doctor-diagnosed heart disease, also included in `mm_count`. |
| `self_rated_health` | 1 excellent; 2 very good; 3 good; 4 fair; 5 poor | Harmonized `r3shlt`, higher = worse. Chinese labels on this page follow this order: 极好、很好、好、一般、差. The model's numeric coding is unchanged. |
| `marital_status` | 0 married/partnered; 1 other | Other includes separated, divorced, widowed and never married. |

## Baseline eligibility

Confirm no baseline impairment in bathing, dressing, eating, transferring, toileting or continence, and no baseline shopping/cooking IADL impairment, using the study definitions. The new-impairment model was not validated for participants already impaired at baseline. Mobility limitations can coexist with eligibility because they measure a different construct.

## Time window and missing measurements

The model concerns the study's wave-based follow-up. Development median follow-up was 36 months; external validation median follow-up was 49 months. The calculator offers no time-horizon selector.

The original research handled missing predictors with a frozen MICE-PMM kernel. This browser edition intentionally requires complete measurements and does not distribute that kernel. Its cohort performance figures are inherited from the study; there is no separate new clinical validation of the complete-input deployment population.

Source of definitions: the study's `TableS2a_predictor_harmonization.csv`, cleaning code, and Harmonized CHARLS D codebook. The public predictor dictionary reproduces the definitions, not the licensed source records or full questionnaires.

## 中文测量提示

认知请输入词回忆总分除以 20；抑郁请输入按 CESD-10 正确计分后的总分除以 30。二者均为 0–1，但不同量表换算到同一数值范围并不意味着可直接替代。慢病数量只统计指定的 7 种疾病，自评健康需按协调后的 1–5 顺序填写。不了解或缺失的测量不能凭估计填写。
