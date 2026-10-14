(function () {
  'use strict';
  const translations = {
    en: {},
    zh: {
      skip:'跳转到计算器',brand:'功能健康',brandSub:'科研风险预测工具',navCalculator:'预测工具',navNotes:'模型说明',eyebrow:'CHARLS 模型开发 · CLHLS 独立外部验证',title:'老年多病共存人群<br>功能受损风险预测',intro:'预测中国多病共存老年人在研究随访评估时新发 ADL/IADL 功能受损的风险。完整填写 12 个变量，使用论文的冻结模型计算。',complete:'12 个变量均需填写',local:'预测计算在当前浏览器内完成',stepOne:'01 / 填写预测变量',inputTitle:'受评者信息',example:'载入合成示例 ↗',inputIntro:'所有字段必填。量表与变量需按研究定义填写。',groupProfile:'基本信息',age:'年龄',years:'岁',ageHelp:'60–110 岁；开发队列范围 60–95 岁',sex:'性别',choose:'请选择…',male:'男',female:'女',education:'教育程度',edu0:'未接受正规教育',edu1:'1–6 年',edu2:'7 年及以上',residence:'居住地',urban:'城镇',rural:'农村',marital:'婚姻状况',married:'在婚 / 同居',otherMarital:'其他：丧偶、离异、分居或未婚等',groupHealth:'健康与活动能力',count:'慢性病数量',countHelp:'仅统计高血压、糖尿病、心脏病、卒中、肺病、癌症和关节炎这 7 种慢性病。',heart:'心脏病',no:'无 / 否',yes:'有 / 是',heartHelp:'医生诊断；已计入上述慢性病数量',health:'自评健康',health1:'1 · 极好',health2:'2 · 很好',health3:'3 · 好',health4:'4 · 一般',health5:'5 · 差',healthHelp:'采用协调后 CHARLS 的 1–5 编码。',mobility:'基线活动受限',mobilityHelp:'按研究定义的移动能力受限；见测量说明',exercise:'规律体力活动',exerciseHelp:'协调后的中等强度 / 高强度体力活动指标',groupScores:'认知与心理状况',cognition:'认知评分',cogHelp:'0–1；CHARLS 词回忆总分 ÷ 20',depression:'抑郁症状评分',depHelp:'0–1；CESD-10 总分 ÷ 30',eligible:'我确认受评者在基线时没有 ADL/IADL 功能受损。',eligibleHelp:'本模型预测新发受损。基线已有功能受损者不属于研究适用人群。',calculate:'计算风险',reset:'清空输入',stepTwo:'02 / 模型预测',resultTitle:'预测风险',emptyTitle:'预测结果将在此显示',emptyText:'填写全部变量并确认基线适用条件，然后计算。',probabilityLabel:'研究随访评估时的预测概率',thresholdText:'研究二分类阈值为 30.3431%，由 CHARLS bootstrap 合并袋外预测推导。',sampleNotice:'合成输入示例 · 非真实受试者',stale:'输入已修改，请重新计算以更新结果。',download:'下载本次结果',researchOnly:'仅供科研参考。风险分层不是诊断结果，也不构成治疗建议。',horizonTitle:'如何理解预测时间窗',horizon:'开发队列随访中位数为 36 个月，外部验证为 49 个月。本模型不支持自定义预测时间点。',readNotes:'查看模型说明 ↓',aboutEyebrow:'关于研究',aboutTitle:'证据与结果解释',aboutIntro:'模型已冻结，并经过独立外部验证。解释个体预测前，请了解适用范围与局限。',development:'模型开发队列',validation:'独立外部验证队列',externalAuc:'外部验证 AUC',measurementTitle:'预测变量应该怎样测量？',measurementBody:'请使用研究编码，不能随意替换量表。认知评分为 CHARLS 词回忆总分（0–20）除以 20；抑郁评分为 CESD-10 总分（0–30）除以 30。活动受限和体力活动按协调后的调查定义填写。完整变量字典列明了编码及跨队列差异。',dictionaryLink:'查看变量字典（Markdown）',outcomeTitle:'本研究如何定义功能受损？',outcomeBody:'随访时，ADL 的洗澡、穿衣、进食、转移、如厕、控制大小便任一项，或 IADL 的购物、做饭出现新发受损。基线时这些功能均正常；开发队列年龄 ≥60 岁，外部验证 ≥65 岁；至少患有 7 种协调慢病中的 2 种。',modelTitle:'预测结果怎样计算？',modelBody:'页面对研究中 20 套多重插补数据集上训练并冻结的 StandardScaler–XGBoost 管线输出概率取平均。全部 12 个变量必填，因此无需对新输入插补。模型、预处理和阈值没有重新训练或优化。本版本提供预测概率与两档风险分层，不提供个体 SHAP 解释。',limitsTitle:'有哪些重要局限？',limitsBody:'两队列的随访窗和认知测量不同，开发队列体力活动缺失率较高。亚组公平性及工具用于临床决策的影响尚未确立。年龄 >95 岁或 7 种慢病超出开发队列观测范围。外部校准斜率为 1.414，校准截距为 0.006，Brier 分数为 0.186。',privacyTitle:'可以离线使用吗？输入会发送到哪里？',privacyBody:'下载完整仓库文件夹，打开 index.html 即可。本工具使用随附脚本和模型参数，无预测 API、分析追踪或外部字体。除非自行下载结果，输入仅存在于当前页面内存。',modelCardLink:'查看模型说明（Markdown）',footer:'新发功能受损 · 完整输入科研预测工具'
    }
  };
  const form = document.getElementById('risk-form');
  const errorBox = document.getElementById('form-errors');
  let lang = 'en', last = null, isExample = false, stale = false;
  document.querySelectorAll('[data-i18n]').forEach(el => { translations.en[el.dataset.i18n] = el.innerHTML; });
  const message = (en,zh) => lang === 'en' ? en : zh;
  function setLanguage(next) {
    lang = next;
    document.documentElement.lang = next === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = translations[lang][el.dataset.i18n] || translations.en[el.dataset.i18n]; });
    const button = document.getElementById('language');
    button.textContent = lang === 'en' ? '中文' : 'English';
    button.setAttribute('aria-label',lang === 'en' ? 'Switch to Chinese' : 'Switch to English');
    document.title = message('Functional Impairment Risk Calculator','老年多病共存人群功能受损风险预测工具');
    errorBox.hidden = true;
    if (last) render(last);
  }
  function clearValidation() {
    errorBox.hidden = true;
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  }
  function validateForm() {
    clearValidation();
    const values = {}, invalid = [];
    for (const name of FIPredictor.order) {
      const field = form.elements.namedItem(name);
      values[name] = field.value;
      if (!field.checkValidity()) invalid.push(field);
    }
    if (!document.getElementById('eligible').checked) invalid.push(document.getElementById('eligible'));
    if (invalid.length) {
      invalid.forEach(el=>el.setAttribute('aria-invalid','true'));
      errorBox.textContent = message('Please complete all 12 fields within their stated ranges and confirm baseline eligibility.','请按规定范围填写全部 12 个变量，并确认基线适用条件。');
      errorBox.hidden = false;
      invalid[0].focus();
      return null;
    }
    return FIPredictor.validate(values);
  }
  function render(result) {
    document.getElementById('empty-result').hidden = true;
    document.getElementById('computed-result').hidden = false;
    document.getElementById('probability').textContent = (result.probability*100).toFixed(1);
    document.getElementById('risk-fill').style.width = result.probability*100+'%';
    const category = document.getElementById('risk-category');
    category.classList.toggle('high',result.highRisk);
    category.textContent = result.highRisk ? message('Higher risk','高风险') : message('Lower risk','低风险');
    document.getElementById('sample-notice').hidden = !last.isExample;
    document.getElementById('stale-notice').hidden = !stale;
    document.getElementById('download').disabled = stale;
    const warningBox = document.getElementById('prediction-warnings');
    const notices = result.warnings.map(code => code==='AGE_EXTRAPOLATION' ? message('Age exceeds the observed development range (60–95 years).','年龄超出开发队列观测范围（60–95 岁），属于外推预测。') : message('Seven conditions exceeds the observed development count (2–6).','7 种慢病超出开发队列观测范围（2–6 种），属于外推预测。'));
    warningBox.hidden = !notices.length;
    warningBox.textContent = notices.join(' ');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const values = validateForm();
      if (!values) return;
      const result = FIPredictor.predict(values,FI_MODEL);
      last = {...result,values,isExample}; stale = false;
      render(last);
      if (window.innerWidth < 731) document.getElementById('result-title').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    } catch (e) {
      errorBox.textContent = message('The estimate could not be calculated. Check the inputs and ensure all repository files are present.','计算未完成，请检查输入，并确保仓库文件完整。');
      errorBox.hidden = false;
    }
  });
  form.addEventListener('input', () => { clearValidation(); isExample = false; if (last) { stale=true; render(last); } });
  form.addEventListener('change', () => { clearValidation(); isExample = false; if (last) { stale=true; render(last); } });
  document.getElementById('example').addEventListener('click', () => {
    const example = {age:70,sex:1,mm_count:3,mobility_impairment:1,cog_score:.35,exercise:1,education:1,residence:1,depression:.4,heart_disease:1,self_rated_health:4,marital_status:0};
    Object.entries(example).forEach(([key,value]) => { form.elements.namedItem(key).value = value; });
    document.getElementById('eligible').checked = true; isExample=true;
    form.requestSubmit();
  });
  document.getElementById('reset').addEventListener('click', () => {
    HTMLFormElement.prototype.reset.call(form); clearValidation(); last=null; isExample=false; stale=false;
    document.getElementById('empty-result').hidden=false;
    document.getElementById('computed-result').hidden=true;
  });
  document.getElementById('language').addEventListener('click',()=>setLanguage(lang==='en'?'zh':'en'));
  document.getElementById('download').addEventListener('click',()=> {
    if (!last || stale) return;
    const output = {toolVersion:FI_MODEL.toolVersion,modelVersion:FI_MODEL.modelVersion,completeInputsOnly:true,syntheticExample:last.isExample,inputs:last.values,probability:last.probability,cutoff:FI_MODEL.cutoff,highRisk:last.highRisk,extrapolationWarnings:last.warnings,scope:'Incident ADL/IADL impairment at the study follow-up; not a fixed user-selected horizon.'};
    const url=URL.createObjectURL(new Blob([JSON.stringify(output,null,2)+'\n'],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='functional-impairment-risk-result.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  try { FIPredictor.assertBundle(globalThis.FI_MODEL); }
  catch(e) { const box=document.getElementById('load-error');box.hidden=false;box.textContent='Model files are missing or incompatible. Download the full folder before opening index.html. 模型文件缺失或不兼容，请下载完整文件夹。';document.getElementById('calculate').disabled=true;document.getElementById('example').disabled=true; }
})();
