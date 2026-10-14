# 当前占位信息及处理方式

本工具对应论文尚未投稿。工具发布不需要等待论文录用；尚不存在的论文引用不显示为真实引用。

| 信息 | 当前位置 | 当前处理 | 何时补齐 |
|---|---|---|---|
| 作者姓名 | `CITATION.cff.example` 中 AUTHOR_*；`models/metadata.json` 的 authors 为 null；模型说明中的 pending | 引用模板不生效；网页无作者占位文本 | 公开发布时确认软件署名，不必等待论文作者顺序最终发表 |
| ORCID | 引用模板注释与发布说明 | 未设置，没有伪造号码 | 可选，确认后补 |
| 软件许可 | `LICENSE`；metadata 的 license 为 null | 明确许可尚未选定，没有默认授予 MIT 等许可 | 公开发布时由作者／机构确认，与论文录用无关 |
| GitHub 仓库 URL | README 发布说明；metadata 的 repository_url 为 null；论文文案的 [GITHUB_REPOSITORY_URL] | 网页没有假链接；方括号只保留在文案草稿 | 建立仓库成功后即可填写 |
| GitHub Pages 工具 URL | README 发布说明；metadata 的 online_calculator_url 为 null；论文文案的 [GITHUB_PAGES_URL] | 网页没有假链接 | 启用 Pages 并验证访问后即可填写，可用于投稿 |
| 论文正式标题、期刊、发表年份、DOI／链接 | README 保留工作题名；网页 `#publication-citation`；引用模板注释 | 引用栏目带 hidden；没有填写虚构期刊／DOI | 有实际可引用的预印本或正式发表信息后填写，并清楚区分来源 |
| 软件 DOI | 引用模板注释及发布说明 | 未填写，不影响预测功能 | 可选，完成存档后填写；不必等论文发表 |

HTML 输入框中的 70、0.35、0.40 是格式示例，不是缺省填入的真实值，也不是引用占位。合成示例按钮只载入人工构造的病例，模型本身及其概率结果不是占位实现。

## 现在的隐藏范围

已隐藏读者网页上的“如何引用本工具”整个栏目，中英文切换不会使它出现。工具说明、适用范围和验证结果继续显示。模型卡链接移到“预测结果怎样计算”说明中，避免随着引用栏目一起隐藏。

维护用的 null 字段、引用示例及论文文案草稿仍可在仓库文件中看到，方便后续填写。隐藏网页组件不代表这些内容被从仓库保密；如将来需要匿名审稿版，应另按拟投期刊要求准备。

## 有引用信息后恢复

填写 index.html 引用栏中的英文正文及 assets/app.js 的中文 citationBody，再移除 `#publication-citation` 上的 hidden。若需要 GitHub 的“Cite this repository”入口，完善软件作者等信息后，将 CITATION.cff.example 改为 CITATION.cff。论文未发表时可只提供软件引用，论文发表后再添加 preferred-citation。

依据：[GitHub 引用文件说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)。GitHub 将软件引用和论文 preferred-citation 分开处理。
