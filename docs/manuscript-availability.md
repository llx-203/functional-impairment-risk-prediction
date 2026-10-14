# Manuscript wording after publication

Replace brackets with actual URLs only after the public repository and Pages site exist. The original Word and LaTeX manuscripts have not been edited.

## English

> A browser-based calculator implementing the frozen 20-pipeline XGBoost ensemble for complete predictor inputs is available at [GITHUB_PAGES_URL]. All 12 predictors are required; this implementation does not impute missing measurements. The source code, exported inference parameters, predictor definitions and synthetic implementation-validation cases are available at [GITHUB_REPOSITORY_URL]. Browser predictions were compared with the original frozen Python pipeline on 3,587 synthetic complete-input cases (maximum absolute probability difference 3.43 × 10⁻⁸; no risk-category mismatches). The original MICE donor kernel and individual survey records are not distributed.

## 中文

> 本研究基于冻结的 20 套 XGBoost 管线构建了完整输入网页预测工具，访问地址为［GitHub Pages 地址］。本版本要求完整填写全部 12 个预测变量，不对缺失测量进行插补。源码、导出的推理参数、变量定义及合成一致性验证病例公开于［GitHub 仓库地址］。在 3,587 组合成完整输入中，浏览器预测与原冻结 Python 路径的最大概率绝对差为 3.43×10⁻⁸，风险分层全部一致。原 MICE 供体核与调查个体记录不随公开仓库分发。

Specify that computational validation uses synthetic cases. The reported cohort AUC/calibration values belong to the original study model and do not establish clinical utility or a separate validation in a new complete-case-only population. The calculator is a complete-input implementation, not the original missing-input interface.
