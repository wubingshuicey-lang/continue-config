// === 梦女模拟器 - 聊天驱动游戏引擎 ===

// ==================== 游戏状态 ====================
const state = {
  playerName: '',
  playerJob: '',
  targetJob: '',
  targetName: '',
  paceStyle: '',

  favor: 5,
  familiar: 0,
  heart: 0,
  depend: 0,
  jealous: 0,

  week: 1,
  actionPoints: 5,
  maxAP: 5,

  chatHistory: [],   // { role: 'player'|'target'|'narrator', text, week }
  apiMessages: [],   // LLM 上下文（只有 target 和 player，不含 narrator）
  eventLog: [],
  weeklySummaries: [],
};

// ==================== 工具 ====================
function getStage() {
  const total = state.favor + state.familiar * 0.6 + state.heart * 0.4;
  if (total >= 80) return { name: '恋爱', min: 80 };
  if (total >= 60) return { name: '暧昧', min: 60 };
  if (total >= 40) return { name: '朋友', min: 40 };
  if (total >= 20) return { name: '认识', min: 20 };
  return { name: '陌生', min: 0 };
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rpick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ==================== UI ====================
function updateStatsUI() {
  document.getElementById('statFavor').style.width = state.favor + '%';
  document.getElementById('statFamiliar').style.width = state.familiar + '%';
  document.getElementById('statHeart').style.width = state.heart + '%';
  document.getElementById('statDepend').style.width = state.depend + '%';
  document.getElementById('statJealous').style.width = state.jealous + '%';

  document.querySelectorAll('#statsPanel .stat-val').forEach((el, i) => {
    const vals = [state.favor, state.familiar, state.heart, state.depend, state.jealous];
    if (vals[i] !== undefined) el.textContent = vals[i];
  });

  const stage = getStage();
  document.getElementById('stageBadge').textContent = stage.name;
  document.getElementById('stageLabel').textContent = stage.name;
  document.getElementById('targetName').textContent = state.targetName;
  document.getElementById('weekLabel').textContent = `第 ${state.week} 周`;
  document.getElementById('actionDots').textContent =
    '●'.repeat(state.actionPoints) + '○'.repeat(state.maxAP - state.actionPoints);
}

function scrollChat() {
  const msgs = document.getElementById('chatMessages');
  setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
}

function addChatMessage(role, text) {
  const msgs = document.getElementById('chatMessages');
  // 移除初始提示
  const hint = msgs.querySelector('.chat-hint');
  if (hint) hint.remove();

  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;

  let senderLabel = '';
  if (role === 'target') senderLabel = state.targetName;
  if (role === 'player') senderLabel = state.playerName || '你';

  div.innerHTML = `
    ${senderLabel ? `<div class="msg-sender">${senderLabel}</div>` : ''}
    <div class="msg-bubble">${escapeHtml(text)}</div>
  `;
  msgs.appendChild(div);
  scrollChat();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showTyping(show) {
  document.getElementById('chatTyping').classList.toggle('hidden', !show);
  scrollChat();
}

function setSendEnabled(enabled) {
  document.getElementById('btnSend').disabled = !enabled;
  document.getElementById('chatInput').disabled = !enabled;
}

// ==================== 系统提示词 ====================
function buildSystemPrompt() {
  const stage = getStage();
  const paceLabels = { slow: '慢热纯爱', moderate: '情感为主适度刺激', fast: '纯欲刺激线', heavy: '重口模式' };

  return `你是一个恋爱模拟游戏的AI角色。你必须完全扮演以下角色，永远不要跳出角色解释或说明。

## 你的角色
- 名字：${state.targetName}
- 职业：${state.targetJob}
- 性别：男
- 性格：沉稳内敛，不油腻不霸总，行动多于言语，有自己的原则和边界。关心人但不会甜言蜜语，用行动表达。工作认真，会忙会累，不是24小时围着别人转的人。

## 玩家信息
- 名字：${state.playerName}
- 职业：${state.playerJob}
- 你们目前的关系阶段：${stage.name}（好感${state.favor}/熟悉${state.familiar}/心动${state.heart}/依赖${state.depend}）

## 关系阶段规则（严格遵守）
${getStageRules()}

## 亲密推进风格
- 当前设定：${paceLabels[state.paceStyle] || state.paceStyle}
${getPaceRules()}

## 写作要求
- 长描写，沉浸式叙事，文风像豆瓣/网络高热恋爱文
- 不要油腻霸总感，不要老土剧情
- 每次回复要有场景感、细节描写、心理活动
- 自然融入生活细节（工作、朋友、情绪、压力）
- 语气真实，像真正的人对话，该短就短该长就长
- 对话和叙述混合，不要全是对白
- 每次回复结尾必须输出一个不可见的状态更新标记：
  [STATS:好感变化值,熟悉度变化值,心动值变化值,依赖值变化值,吃醋值变化值]
  例如：[STATS:3,2,1,0,0] 表示好感+3 熟悉度+2 心动值+1
  又例如：[STATS:0,0,-1,0,0] 表示心动值-1
  数值范围-10到+10。这个标记会被系统解析，不会显示给玩家。

## 当前时间
第${state.week}周，本周剩余行动点：${state.actionPoints}

## 重要提醒
- 你有自己的工作和生活，你会忙、会累、可能回复慢
- 不要突然告白或过度亲密（除非关系阶段允许）
- 保持慢热、真实、有张力
- 直接开始角色扮演，不要输出任何解释文字`;
}

function getStageRules() {
  const stage = getStage();
  const rules = {
    '陌生': '- 你们刚刚认识或不熟\n- 保持礼貌距离\n- 可以有偶遇、简短交流\n- 禁止：肢体接触、暧昧言语、过度关心、深夜私聊',
    '认识': '- 你们算认识的人了\n- 可以正常聊天、偶尔约饭\n- 可以有一些无意识的细节关注\n- 禁止：亲密肢体接触、明确暧昧、吃醋表现',
    '朋友': '- 你们是朋友关系\n- 可以聊天、约饭、聚会、偶尔深夜消息\n- 可以有一些自然的小关心\n- 可以有微弱的心动迹象\n- 禁止：亲密接触、直白告白',
    '暧昧': '- 你们之间有暧昧氛围\n- 可以有吃醋、试探、深夜电话\n- 可以有不小心碰到手、靠肩膀等意外接触\n- 可以说一些暧昧的话\n- 可以有明显的心动表现\n- 禁止：正式告白、重度亲密行为',
    '恋爱': '- 你们在恋爱关系中\n- 可以有亲密行为、直白表达感情\n- 可以有吃醋、冷战、和好\n- 可以有日常同居感\n- 可以有身体接触、亲吻等',
  };
  return rules[stage.name] || rules['陌生'];
}

function getPaceRules() {
  const rules = {
    'slow': '- 严格遵循关系阶段，绝不越级\n- 亲密行为只在恋爱阶段（80+）开放\n- 注重情感铺垫和心理描写',
    'moderate': '- 以情感为主\n- 暧昧期（60-80）可以在高张力场景下有轻微亲密（深吻、抚摸），但不一定到最后一步\n- 注重情感真实性',
    'fast': '- 可以在熟悉度≥25时的高张力场景下出现克制但强烈的占有欲\n- 允许眼神凶狠、命令式语气、短暂肢体压制\n- 亲密后可能有自责、躲着对方等事后反应\n- 保留角色核心性格',
    'heavy': '- 允许更强烈的亲密描写\n- 可以在合适场景下触发重口内容\n- 但角色性格底线不变，不会变成无脑服从',
  };
  return rules[state.paceStyle] || rules['slow'];
}

// ==================== API 调用 ====================
const API_CONFIG_KEY = 'dream-sim-api-config';

function getApiConfig() {
  try {
    return JSON.parse(localStorage.getItem(API_CONFIG_KEY)) || {};
  } catch { return {}; }
}

function saveApiConfig(config) {
  localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
}

function getDefaultEndpoint(provider) {
  const defaults = {
    'deepseek': 'https://api.deepseek.com/v1/chat/completions',
    'openai': 'https://api.openai.com/v1/chat/completions',
    'gemini': 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    'claude': 'https://api.anthropic.com/v1/messages',
  };
  return defaults[provider] || '';
}

function getDefaultModel(provider) {
  const defaults = {
    'deepseek': 'deepseek-chat',
    'openai': 'gpt-4o',
    'gemini': 'gemini-2.0-flash',
    'claude': 'claude-sonnet-4-6',
  };
  return defaults[provider] || '';
}

async function callApi(userMessage) {
  const config = getApiConfig();
  if (!config.apiKey) throw new Error('请先设置 API Key');

  const provider = config.provider || 'deepseek';
  const endpoint = config.apiBase || getDefaultEndpoint(provider);
  const model = config.apiModel || getDefaultModel(provider);

  // 构建消息
  const systemPrompt = buildSystemPrompt();
  let messages = [{ role: 'system', content: systemPrompt }];

  // 添加最近对话历史（最近20条）
  const recentHistory = state.apiMessages.slice(-20);
  messages = messages.concat(recentHistory);

  // 添加当前用户消息
  messages.push({ role: 'user', content: userMessage });

  let body, headers;

  if (provider === 'gemini') {
    // Gemini API 格式
    const contents = [];
    if (systemPrompt) {
      contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
      contents.push({ role: 'model', parts: [{ text: '明白了，我会按照设定来扮演角色。' }] });
    }
    recentHistory.forEach(m => {
      contents.push({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      });
    });
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    body = JSON.stringify({
      contents,
      generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
    });
    headers = { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey };
  } else if (provider === 'claude') {
    // Anthropic API 格式
    const claudeMessages = recentHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
    claudeMessages.push({ role: 'user', content: userMessage });

    body = JSON.stringify({
      model,
      system: systemPrompt,
      messages: claudeMessages,
      max_tokens: 2048,
      temperature: 0.9,
    });
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    };
  } else {
    // OpenAI 兼容格式 (DeepSeek, OpenAI, 等)
    body = JSON.stringify({
      model,
      messages,
      temperature: 0.9,
      max_tokens: 2048,
    });
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API 错误 (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();

  // 提取回复文本
  let replyText = '';
  if (provider === 'gemini') {
    replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else if (provider === 'claude') {
    replyText = data.content?.[0]?.text || '';
  } else {
    replyText = data.choices?.[0]?.message?.content || '';
  }

  return replyText;
}

// ==================== 解析状态更新 ====================
function parseAndApplyStats(text) {
  const match = text.match(/\[STATS:([^\]]+)\]/);
  if (!match) return text;

  const cleanText = text.replace(/\[STATS:[^\]]+\]/, '').trim();
  const values = match[1].split(',').map(Number);

  const keys = ['favor', 'familiar', 'heart', 'depend', 'jealous'];
  keys.forEach((key, i) => {
    if (values[i] && !isNaN(values[i])) {
      state[key] = clamp(state[key] + values[i], 0, 100);
    }
  });

  return cleanText;
}

// ==================== 发送消息 ====================
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || state.actionPoints <= 0) return;

  input.value = '';
  input.style.height = 'auto';

  // 显示玩家消息
  addChatMessage('player', text);

  // 消耗行动点
  state.actionPoints--;
  updateStatsUI();

  // 检查 API 配置
  const config = getApiConfig();
  if (!config.apiKey) {
    // 无 API：使用本地回退
    addChatMessage('narrator', '⚙ 尚未配置 API Key。点击顶部齿轮图标设置，或使用 DeepSeek/OpenAI/Gemini/Claude 任一 API。');
    setSendEnabled(true);
    return;
  }

  setSendEnabled(false);
  showTyping(true);

  try {
    const reply = await callApi(text);
    showTyping(false);

    const cleanReply = parseAndApplyStats(reply);
    addChatMessage('target', cleanReply);

    // 更新上下文
    state.apiMessages.push({ role: 'user', content: text });
    state.apiMessages.push({ role: 'assistant', content: reply });
    state.chatHistory.push({ role: 'player', text, week: state.week });
    state.chatHistory.push({ role: 'target', text: cleanReply, week: state.week });

    updateStatsUI();
    checkStageUp();
    checkAPDepleted();
    saveGame();
  } catch (err) {
    showTyping(false);
    addChatMessage('narrator', `❌ ${err.message}`);
  }

  setSendEnabled(true);
  document.getElementById('chatInput').focus();
}

function checkStageUp() {
  const stage = getStage();
  const badge = document.getElementById('stageBadge');
  if (badge.dataset.prevStage && badge.dataset.prevStage !== stage.name) {
    addChatMessage('narrator', `✦ 你们的关系进入了新的阶段：${stage.name}`);
  }
  badge.dataset.prevStage = stage.name;
}

function checkAPDepleted() {
  if (state.actionPoints <= 0) {
    setTimeout(() => {
      addChatMessage('narrator', '本周行动点已用完。点击左侧「推进到下一周」继续。');
    }, 600);
  }
}

// ==================== 周推进 ====================
function advanceWeek() {
  const stage = getStage();
  const events = state.chatHistory.filter(h => h.week === state.week);
  const summary = events.length > 0
    ? `本周你和${state.targetName}之间有${events.length}次交流。关系阶段：${stage.name}。`
    : `平淡的一周过去了。`;

  state.weeklySummaries.push({
    week: state.week,
    stage: stage.name,
    summary,
    stats: { favor: state.favor, familiar: state.familiar, heart: state.heart, depend: state.depend, jealous: state.jealous },
  });

  addChatMessage('narrator', `—— 第 ${state.week} 周结束 ——\n${summary}`);

  state.week++;
  state.actionPoints = state.maxAP;
  state.eventLog = [];

  updateStatsUI();

  setTimeout(() => {
    addChatMessage('narrator', `—— 第 ${state.week} 周 ——\n新的一周开始了。早晨的阳光透过窗帘照进来，又是新的一天。`);
    document.getElementById('chatInput').focus();
  }, 500);

  saveGame();
}

// ==================== 开场 ====================
function generateOpening() {
  return `九月，城市还没完全凉下来。\n\n${state.playerName}拖着行李箱站在新租的公寓楼下，新的工作、新的住处、新的生活。手机震动了一下，是房东发来的门禁密码。\n\n深吸一口气，推开了门。`;
}

// ==================== 存档 ====================
const SAVE_KEY = 'dream-sim-save';

function saveGame() {
  const data = {
    ...state,
    apiMessages: state.apiMessages.slice(-30),  // 只保留最近对话给 LLM
    chatHistory: state.chatHistory.slice(-100),
    weeklySummaries: state.weeklySummaries.slice(-20),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    Object.assign(state, data);
    return true;
  } catch { return false; }
}

// ==================== 初始化 ====================
function setupCreateScreen() {
  document.querySelectorAll('.choice-grid').forEach(grid => {
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.glass-chip');
      if (!chip) return;
      grid.querySelectorAll('.glass-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  document.getElementById('btnConfirmCreate').addEventListener('click', () => {
    const name = document.getElementById('playerName').value.trim() || '你';
    const playerJob = getSelected('playerJob');
    const targetJob = getSelected('targetJob');
    const paceStyle = getSelected('paceStyle');
    const customTargetName = document.getElementById('targetNameInput').value.trim();

    if (!playerJob || !targetJob || !paceStyle) {
      alert('请完成所有选择');
      return;
    }

    state.playerName = name;
    state.playerJob = playerJob;
    state.targetJob = targetJob;
    state.paceStyle = paceStyle;
    state.targetName = customTargetName || generateTargetName(targetJob);

    saveGame();
    startGame();
  });
}

function getSelected(gridId) {
  const el = document.getElementById(gridId).querySelector('.glass-chip.selected');
  return el ? el.dataset.value : null;
}

function generateTargetName(job) {
  const surnames = ['陈', '林', '张', '李', '王', '周', '沈', '陆', '顾', '许', '苏', '江', '何', '叶', '宋', '梁'];
  const names = ['奕恒', '景行', '明远', '霁川', '晏舟', '知遥', '司衡', '怀瑾', '云深', '砚清', '翊辰', '谨言'];
  return rpick(surnames) + rpick(names);
}

function startGame() {
  document.getElementById('createScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  updateStatsUI();

  // 初始化 stage 追踪
  document.getElementById('stageBadge').dataset.prevStage = getStage().name;

  const opening = generateOpening();
  addChatMessage('narrator', opening);

  // 加载对话历史
  state.chatHistory.forEach(h => {
    if (h.week === state.week) {
      addChatMessage(h.role, h.text);
    }
  });

  document.getElementById('chatInput').focus();
}

// ==================== API 设置弹窗 ====================
function setupApiModal() {
  const modal = document.getElementById('apiModal');
  const config = getApiConfig();
  const provider = config.provider || 'deepseek';

  // 初始化选中状态
  document.querySelectorAll('#apiProvider .glass-chip').forEach(chip => {
    chip.classList.toggle('selected', chip.dataset.value === provider);
  });

  document.getElementById('apiKey').value = config.apiKey || '';
  document.getElementById('apiBase').value = config.apiBase || '';
  document.getElementById('apiModel').value = config.apiModel || '';

  // Provider 切换
  document.getElementById('apiProvider').addEventListener('click', (e) => {
    const chip = e.target.closest('.glass-chip');
    if (!chip) return;
    document.querySelectorAll('#apiProvider .glass-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');

    const p = chip.dataset.value;
    document.getElementById('apiBase').placeholder = getDefaultEndpoint(p);
    document.getElementById('apiModel').placeholder = getDefaultModel(p);
  });

  // 保存
  document.getElementById('btnSaveApi').addEventListener('click', () => {
    const provider = document.querySelector('#apiProvider .glass-chip.selected')?.dataset.value || 'deepseek';
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiBase = document.getElementById('apiBase').value.trim();
    const apiModel = document.getElementById('apiModel').value.trim();

    saveApiConfig({ provider, apiKey, apiBase, apiModel });
    document.getElementById('apiStatus').textContent = '已保存';
    document.getElementById('apiStatus').className = 'api-status success';

    setTimeout(() => { modal.classList.add('hidden'); }, 800);
  });

  // 测试
  document.getElementById('btnTestApi').addEventListener('click', async () => {
    const statusEl = document.getElementById('apiStatus');
    statusEl.textContent = '测试中…';
    statusEl.className = 'api-status';

    const provider = document.querySelector('#apiProvider .glass-chip.selected')?.dataset.value || 'deepseek';
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiBase = document.getElementById('apiBase').value.trim();
    const apiModel = document.getElementById('apiModel').value.trim();

    if (!apiKey) { statusEl.textContent = '请先输入 API Key'; statusEl.className = 'api-status error'; return; }

    // 临时保存用于测试
    saveApiConfig({ provider, apiKey, apiBase, apiModel });

    try {
      // 发送简单测试
      const testState = { ...state, targetName: '测试角色', targetJob: '医生', playerName: '测试', playerJob: '设计师', favor: 5, familiar: 0, heart: 0, depend: 0, jealous: 0, week: 1, actionPoints: 5, paceStyle: 'slow', apiMessages: [] };

      const origState = { ...state };
      Object.assign(state, testState);

      await callApi('你好');
      statusEl.textContent = '连接成功！';
      statusEl.className = 'api-status success';
      Object.assign(state, origState);
    } catch (err) {
      statusEl.textContent = `连接失败: ${err.message}`;
      statusEl.className = 'api-status error';
    }
  });
}

// ==================== 事件绑定 ====================
// 首页 → 创建
document.getElementById('btnStartGame').addEventListener('click', () => {
  document.getElementById('landingPage').classList.add('hidden');
  document.getElementById('createScreen').classList.remove('hidden');
  setupCreateScreen();
});

// 首页导航
document.getElementById('navNewGame').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('landingPage').classList.add('hidden');
  document.getElementById('createScreen').classList.remove('hidden');
  setupCreateScreen();
});

document.getElementById('navContinue').addEventListener('click', (e) => {
  e.preventDefault();
  if (loadGame() && state.targetName) {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    restoreGameUI();
  } else {
    alert('没有存档，请先开始新游戏');
  }
});

// 游戏内返回首页
document.getElementById('btnBackHome').addEventListener('click', () => {
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('createScreen').classList.add('hidden');
  document.getElementById('landingPage').classList.remove('hidden');
});

// 创建页面也有返回
document.getElementById('createScreen').addEventListener('dblclick', function(e) {
  if (e.target === this) {
    this.classList.add('hidden');
    document.getElementById('landingPage').classList.remove('hidden');
  }
});

document.getElementById('btnNextWeek').addEventListener('click', advanceWeek);

document.getElementById('btnSend').addEventListener('click', sendMessage);

document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// 自动调整输入框高度
document.getElementById('chatInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// API 设置弹窗
document.getElementById('btnSettings').addEventListener('click', () => {
  document.getElementById('apiModal').classList.remove('hidden');
});

document.getElementById('apiModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add('hidden');
  }
});

// 弹窗初始化
setupApiModal();

function restoreGameUI() {
  updateStatsUI();
  document.getElementById('stageBadge').dataset.prevStage = getStage().name;

  // 清空聊天区
  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML = '';

  state.chatHistory.forEach(h => {
    if (h.week === state.week) addChatMessage(h.role, h.text);
  });

  if (state.actionPoints > 0) {
    addChatMessage('narrator', `欢迎回来，${state.playerName}。—— 第 ${state.week} 周，剩余 ${state.actionPoints} 个行动点`);
  }
  document.getElementById('chatInput').focus();
}

// ==================== 启动 ====================
function init() {
  if (loadGame() && state.targetName) {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    restoreGameUI();
  }
}

window.addEventListener('beforeunload', () => {
  if (state.targetName) saveGame();
});

init();
