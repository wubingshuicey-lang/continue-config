// === 梦女模拟器 v2 - 多角色聊天引擎 ===

const SAVE_KEY = 'dream-sim-save';
const API_CONFIG_KEY = 'dream-sim-api-config';

// ==================== 全局状态 ====================
const state = {
  characters: {},        // { id: CharacterData }
  charOrder: [],        // 创建顺序
  activeCharId: null,
  mode: 'online',       // 'online' | 'meetup'
  gameTime: { day: 1, hour: 9, minute: 0 },  // day 1 = 周一
  groupChats: [],       // [{ id, members[], messages[] }]
  activeGroupId: null,
  lastActiveTick: Date.now(),
  proactiveInterval: null,
};

// 单个角色数据模板
function newCharacterData(cfg) {
  return {
    id: cfg.id,
    targetName: cfg.targetName,
    targetJob: cfg.targetJob,
    playerName: cfg.playerName,
    playerJob: cfg.playerJob,
    paceStyle: cfg.paceStyle,
    favor: 5, familiar: 0, heart: 0, depend: 0, jealous: 0,
    week: 1, msgCount: 0,
    chatHistory: [],    // [{ role, text, week, narration?, hidden }]
    apiMessages: [],    // LLM 上下文
    eventLog: [],
    createdAt: Date.now(),
  };
}

// ==================== 工具函数 ====================
function getActiveChar() { return state.activeCharId ? state.characters[state.activeCharId] : null; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rpick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); }

function getStage(ch) {
  const total = ch.favor + ch.familiar * 0.6 + ch.heart * 0.4;
  if (total >= 80) return '恋爱';
  if (total >= 60) return '暧昧';
  if (total >= 40) return '朋友';
  if (total >= 20) return '认识';
  return '陌生';
}

const STAGES = ['陌生', '认识', '朋友', '暧昧', '恋爱'];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==================== 时间系统 ====================
const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function getTimeStr() {
  const dayName = DAY_NAMES[(state.gameTime.day - 1) % 7];
  const h = String(state.gameTime.hour).padStart(2, '0');
  const m = String(state.gameTime.minute).padStart(2, '0');
  return `${dayName} ${h}:${m}`;
}

function advanceTime(minutes) {
  state.gameTime.minute += minutes;
  while (state.gameTime.minute >= 60) { state.gameTime.minute -= 60; state.gameTime.hour++; }
  while (state.gameTime.hour >= 24) { state.gameTime.hour -= 24; state.gameTime.day++; }
  document.getElementById('timeLabel').textContent = getTimeStr();
}

// ==================== UI 更新 ====================
function updateStatsFloat() {
  const ch = getActiveChar();
  if (!ch) return;

  document.getElementById('statsFloatName').textContent = ch.targetName;
  document.getElementById('statFavor').style.width = ch.favor + '%';
  document.getElementById('statFamiliar').style.width = ch.familiar + '%';
  document.getElementById('statHeart').style.width = ch.heart + '%';
  document.getElementById('statDepend').style.width = ch.depend + '%';
  document.getElementById('statJealous').style.width = ch.jealous + '%';
  document.getElementById('stageBadge').textContent = getStage(ch);

  document.getElementById('weekLabel').textContent = `第${ch.week}周`;
  document.getElementById('currentCharName').textContent = ch.targetName;
  document.getElementById('timeLabel').textContent = getTimeStr();
}

function updateModeUI() {
  const btn = document.getElementById('btnModeToggle');
  const badge = document.getElementById('chatModeBadge');
  if (state.mode === 'online') {
    btn.textContent = '📱'; btn.classList.remove('active');
    badge.textContent = '📱 网聊模式';
  } else {
    btn.textContent = '🤝'; btn.classList.add('active');
    badge.textContent = '🤝 见面模式';
  }
}

function scrollChat() {
  const msgs = document.getElementById('chatMessages');
  setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 30);
}

function showTyping(show) {
  document.getElementById('chatTyping').classList.toggle('hidden', !show);
  scrollChat();
}

function setSendEnabled(v) {
  document.getElementById('btnSend').disabled = !v;
  document.getElementById('chatInput').disabled = !v;
}

// ==================== 消息渲染 ====================
function addMessage(role, text, narration) {
  const msgs = document.getElementById('chatMessages');
  const hint = msgs.querySelector('.chat-hint');
  if (hint) hint.remove();

  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;

  let sender = '';
  const ch = getActiveChar();
  if (role === 'target') sender = ch ? ch.targetName : '';
  if (role === 'player') sender = ch ? ch.playerName : '你';

  let html = sender ? `<div class="msg-sender">${sender}</div>` : '';
  html += `<div class="msg-bubble">${escapeHtml(text)}</div>`;

  // 可折叠的叙述
  if (narration && narration.trim()) {
    const nId = 'nar_' + uid();
    html += `<button class="narration-toggle" onclick="toggleNarration('${nId}')">▸ 展开场景/动作</button>`;
    html += `<div class="narration-content" id="${nId}">${escapeHtml(narration)}</div>`;
  }

  div.innerHTML = html;
  div.dataset.searchText = (text + ' ' + (narration || '')).toLowerCase();
  div.dataset.role = role;
  msgs.appendChild(div);
  scrollChat();
}

function addSystemMessage(text) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg system';
  div.innerHTML = `<div class="msg-bubble">${text}</div>`;
  div.dataset.role = 'system';
  msgs.appendChild(div);
  scrollChat();
}

// 全局函数给 onclick 用
window.toggleNarration = function(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const toggle = el.previousElementSibling;
  el.classList.toggle('open');
  if (el.classList.contains('open')) {
    toggle.textContent = '▾ 收起场景/动作';
  } else {
    toggle.textContent = '▸ 展开场景/动作';
  }
};

// ==================== 角色管理 ====================
function switchCharacter(charId) {
  if (state.activeCharId === charId) return;
  state.activeCharId = charId;
  state.activeGroupId = null;

  document.getElementById('chatMessages').innerHTML = '<div class="chat-hint">已切换到 ' + state.characters[charId].targetName + '</div>';

  const ch = state.characters[charId];
  // 渲染本周聊天记录
  ch.chatHistory.forEach(h => {
    if (h.week === ch.week) addMessage(h.role, h.text, h.narration);
  });

  updateStatsFloat();
  updateCharDropdown();
  document.getElementById('chatInput').focus();
}

function createNewCharacter() {
  // 回到创建页
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('createScreen').classList.remove('hidden');
  if (!window._createScreenSetup) {
    setupCreateScreen();
    window._createScreenSetup = true;
  }
}

function updateCharDropdown() {
  const dropdown = document.getElementById('charDropdown');
  dropdown.innerHTML = '';

  Object.values(state.characters).forEach(ch => {
    const div = document.createElement('div');
    div.className = 'char-dropdown-item' + (ch.id === state.activeCharId ? ' active' : '');
    div.textContent = `${ch.targetName} · ${getStage(ch)}`;
    div.addEventListener('click', () => {
      switchCharacter(ch.id);
      dropdown.classList.add('hidden');
    });
    dropdown.appendChild(div);
  });

  // 添加 "创建新角色" 选项
  const addDiv = document.createElement('div');
  addDiv.className = 'char-dropdown-item';
  addDiv.style.opacity = '0.6';
  addDiv.textContent = '+ 创建新角色';
  addDiv.addEventListener('click', () => {
    dropdown.classList.add('hidden');
    createNewCharacter();
  });
  dropdown.appendChild(addDiv);
}

// ==================== 群聊 ====================
function setupGroupModal() {
  const list = document.getElementById('groupCharList');
  list.innerHTML = '';
  const selected = new Set();

  Object.values(state.characters).forEach(ch => {
    const chip = document.createElement('button');
    chip.className = 'group-char-chip';
    chip.textContent = ch.targetName;
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      if (chip.classList.contains('selected')) selected.add(ch.id);
      else selected.delete(ch.id);
    });
    list.appendChild(chip);
  });

  document.getElementById('btnCreateGroup').onclick = () => {
    if (selected.size < 2) { alert('至少选两个角色'); return; }

    const gid = uid();
    state.groupChats.push({ id: gid, members: [...selected], messages: [] });
    state.activeGroupId = gid;
    state.activeCharId = null;

    document.getElementById('groupModal').classList.add('hidden');
    document.getElementById('chatMessages').innerHTML = '';

    const memberNames = [...selected].map(id => state.characters[id].targetName).join('、');
    addSystemMessage(`👥 群聊已创建：${memberNames}`);

    updateStatsFloat();
    document.getElementById('chatInput').focus();
  };
}

// ==================== API 调用 ====================
function getApiConfig() {
  try { return JSON.parse(localStorage.getItem(API_CONFIG_KEY)) || {}; } catch { return {}; }
}

function saveApiConfig(cfg) { localStorage.setItem(API_CONFIG_KEY, JSON.stringify(cfg)); }

function getDefaultEndpoint(p) {
  return { deepseek:'https://api.deepseek.com/v1/chat/completions', openai:'https://api.openai.com/v1/chat/completions', gemini:'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', claude:'https://api.anthropic.com/v1/messages' }[p] || '';
}

function getDefaultModel(p) {
  return { deepseek:'deepseek-chat', openai:'gpt-4o', gemini:'gemini-2.0-flash', claude:'claude-sonnet-4-6' }[p] || '';
}

function buildSystemPrompt(ch) {
  const stage = getStage(ch);
  const paceLabels = { slow:'慢热纯爱', moderate:'情感为主', fast:'纯欲刺激', heavy:'重口模式' };
  const timeStr = getTimeStr();

  const modeInstructions = state.mode === 'online'
    ? `## 当前模式：网聊模式
- 这是微信/短信聊天。用真实的口语、简短的自然语气。
- 像真人一样发消息：会打错字（偶尔）、会发短句、会已读不回、会过一会儿再回。
- 你可以主动开启话题、问问题、分享日常。
- 禁止在网聊模式写场景描写和动作叙述。仅输出对话文字。
- 回复格式：只输出聊天文字，不要加任何场景描写。`
    : `## 当前模式：见面模式
- 你们在现实中见面。可以进行动作、场景描写。
- 回复格式：[MSG]对话内容[/MSG]\n[NARRATION]场景、动作、心理描写[/NARRATION]
- MSG部分是你说的对话。NARRATION部分是场景和动作描写。`;

  return `你是恋爱模拟游戏的AI角色，必须完全扮演以下角色。

## 角色设定
- 名字：${ch.targetName}
- 职业：${ch.targetJob}
- 性别：男
- 性格：沉稳内敛，不油腻不霸总，行动多于言语。关心人但不甜言蜜语。有自己的工作和生活，会忙会累。

## 玩家信息
- 名字：${ch.playerName}，职业：${ch.playerJob}
- 关系阶段：${stage}（好感${ch.favor}/熟悉${ch.familiar}/心动${ch.heart}/依赖${ch.depend}）
- 亲密风格：${paceLabels[ch.paceStyle] || ch.paceStyle}

## 关系阶段规则
${getStageRules(stage)}

${getPaceRules(ch.paceStyle)}

${modeInstructions}

## 时间：${timeStr}，第${ch.week}周

## 重要
- 用你自己的语气说话，像真人聊天一样自然
- 该短就短，该长就长
- 可以主动问问题、分享你的日常
- 情绪和状态会变化：疲惫、忙、心情好、吃醋
- 每次回复末尾输出 [STATS:好感变化,熟悉度变化,心动值变化,依赖值变化,吃醋值变化]
  例：[STATS:2,1,1,0,0] 表示各属性+2,+1,+1,0,0。范围-10到+10。
- 直接开始扮演，不要任何解释`;
}

function getStageRules(stage) {
  const rules = {
    '陌生': '- 刚认识，保持礼貌距离\n- 偶遇或简短交流\n- 禁止：肢体接触、暧昧、过度关心',
    '认识': '- 算认识的人了\n- 可以正常聊天、偶尔约饭\n- 可以有无意识的细节关注\n- 禁止：亲密接触、明确暧昧',
    '朋友': '- 朋友关系\n- 聊天、约饭、聚会、偶尔深夜消息\n- 可以有自然的小关心和微弱心动\n- 禁止：亲密接触、直白告白',
    '暧昧': '- 暧昧氛围\n- 允许吃醋、试探、深夜电话\n- 意外身体接触（碰手、靠肩）\n- 可以说暧昧的话\n- 禁止：正式告白、重度亲密',
    '恋爱': '- 恋爱关系\n- 允许亲密行为、直白表达感情\n- 吃醋冷战和好\n- 日常同居感、身体接触、亲吻',
  };
  return rules[stage] || rules['陌生'];
}

function getPaceRules(style) {
  const rules = {
    'slow': '- 严格遵循阶段，绝不越级\n- 亲密只在恋爱阶段开放',
    'moderate': '- 情感为主\n- 暧昧期高张力场景可有轻微亲密',
    'fast': '- 熟悉度≥25时高张力场景可展现克制占有欲\n- 允许眼神凶狠、命令语气、短暂压制\n- 亲密后可能有自责等事后反应',
    'heavy': '- 允许更强烈亲密描写\n- 角色性格底线不变',
  };
  return rules[style] || rules['slow'];
}

async function callApi(userMessage, ch) {
  const config = getApiConfig();
  if (!config.apiKey) throw new Error('请先设置 API Key（点击顶栏⚙）');

  const provider = config.provider || 'deepseek';
  const endpoint = config.apiBase || getDefaultEndpoint(provider);
  const model = config.apiModel || getDefaultModel(provider);
  const systemPrompt = buildSystemPrompt(ch);

  let messages = [{ role: 'system', content: systemPrompt }];
  messages = messages.concat(ch.apiMessages.slice(-20));
  messages.push({ role: 'user', content: userMessage });

  let body, headers;

  if (provider === 'gemini') {
    const contents = [];
    contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
    contents.push({ role: 'model', parts: [{ text: '明白了。' }] });
    ch.apiMessages.slice(-20).forEach(m => {
      contents.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] });
    });
    contents.push({ role: 'user', parts: [{ text: userMessage }] });
    body = JSON.stringify({ contents, generationConfig: { temperature: 0.9, maxOutputTokens: 2048 } });
    headers = { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey };
  } else if (provider === 'claude') {
    const claudeMsgs = ch.apiMessages.slice(-20).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
    claudeMsgs.push({ role: 'user', content: userMessage });
    body = JSON.stringify({ model, system: systemPrompt, messages: claudeMsgs, max_tokens: 2048, temperature: 0.9 });
    headers = { 'Content-Type': 'application/json', 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' };
  } else {
    body = JSON.stringify({ model, messages, temperature: 0.9, max_tokens: 2048 });
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` };
  }

  const response = await fetch(endpoint, { method: 'POST', headers, body });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API 错误 (${response.status}): ${errText.slice(0, 150)}`);
  }

  const data = await response.json();
  if (provider === 'gemini') return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (provider === 'claude') return data.content?.[0]?.text || '';
  return data.choices?.[0]?.message?.content || '';
}

function parseReply(text) {
  // 见面模式：解析 [MSG]...[NARRATION]...
  const msgMatch = text.match(/\[MSG\]([\s\S]*?)\[\/MSG\]/i);
  const narMatch = text.match(/\[NARRATION\]([\s\S]*?)\[\/NARRATION\]/i);

  let msg = text;
  let narration = '';

  if (msgMatch) {
    msg = msgMatch[1].trim();
    text = text.replace(/\[MSG\][\s\S]*?\[\/MSG\]/i, '').trim();
  }
  if (narMatch) {
    narration = narMatch[1].trim();
    text = text.replace(/\[NARRATION\][\s\S]*?\[\/NARRATION\]/i, '').trim();
  }

  // 如果没匹配到标签，网聊模式全部作为对话
  if (!msgMatch && state.mode === 'online') {
    msg = text;
  }
  // 见面模式没标签，全部作为叙述（兼容旧格式）
  if (!msgMatch && state.mode === 'meetup') {
    msg = text;
  }

  return { msg: msg || text, narration };
}

function parseStats(text) {
  const match = text.match(/\[STATS:([^\]]+)\]/);
  if (!match) return { text, stats: null };
  const clean = text.replace(/\[STATS:[^\]]+\]/, '').trim();
  const vals = match[1].split(',').map(Number);
  return { text: clean, stats: vals };
}

// ==================== 发送消息 ====================
async function sendMessage() {
  const ch = getActiveChar();
  if (!ch) return;

  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  advanceTime(5 + Math.floor(Math.random() * 20));

  addMessage('player', text);
  ch.msgCount++;
  updateStatsFloat();

  const config = getApiConfig();
  if (!config.apiKey) {
    addSystemMessage('⚙ 请先设置 API Key。点击顶栏 ⚙ 按钮。');
    setSendEnabled(true);
    return;
  }

  setSendEnabled(false);
  showTyping(true);

  try {
    const reply = await callApi(text, ch);
    showTyping(false);

    const { msg, narration } = parseReply(reply);
    const { text: cleanMsg, stats } = parseStats(msg);
    const { text: cleanNarration } = parseStats(narration);

    // 应用数值
    if (stats) {
      const keys = ['favor', 'familiar', 'heart', 'depend', 'jealous'];
      keys.forEach((k, i) => { if (!isNaN(stats[i])) ch[k] = clamp(ch[k] + stats[i], 0, 100); });
    }

    addMessage('target', cleanMsg, cleanNarration);

    ch.apiMessages.push({ role: 'user', content: text });
    ch.apiMessages.push({ role: 'assistant', content: reply });
    ch.chatHistory.push({ role: 'player', text, week: ch.week });
    ch.chatHistory.push({ role: 'target', text: cleanMsg, narration: cleanNarration, week: ch.week });

    updateStatsFloat();
    saveGame();
  } catch (err) {
    showTyping(false);
    addSystemMessage('❌ ' + err.message);
  }

  setSendEnabled(true);
  document.getElementById('chatInput').focus();
}

// ==================== 主动消息 ====================
async function proactiveMessage() {
  if (state.mode !== 'online') return; // 只在网聊模式主动发消息
  if (document.getElementById('chatTyping').classList.contains('hidden') === false) return; // 正在回复中

  const ch = getActiveChar();
  if (!ch) return;
  if (!getApiConfig().apiKey) return;

  // 概率判断：关系越高越可能主动发消息
  const stage = getStage(ch);
  const stageIdx = STAGES.indexOf(stage);
  const baseChance = 0.02 + stageIdx * 0.04; // 陌生2% → 恋爱18%
  if (Math.random() > baseChance) return;

  // 时间推进
  advanceTime(10 + Math.floor(Math.random() * 60));

  // 主动消息的触发场景
  const triggers = [
    '突然想你了',
    '刚下班，很累但想跟你说句话',
    '看到你喜欢的东西，拍了张照片',
    '今天工作中发生了有趣的事',
    '下雨了，问你带伞没',
    '失眠了',
    '朋友提到你，想问问你最近怎么样',
    '刷到你朋友圈了',
  ];

  const trigger = rpick(triggers);
  const userPrompt = `（这是一条主动消息。触发原因：${trigger}。请以你自己的语气主动给${ch.playerName}发一条消息。自然、简短，像真人聊天一样。不要写场景描写，只输出对话。）`;

  try {
    showTyping(true);
    const reply = await callApi(userPrompt, ch);
    showTyping(false);

    const { msg, narration } = parseReply(reply);
    const { text: cleanMsg, stats } = parseStats(msg);

    if (stats) {
      const keys = ['favor', 'familiar', 'heart', 'depend', 'jealous'];
      keys.forEach((k, i) => { if (!isNaN(stats[i])) ch[k] = clamp(ch[k] + stats[i], 0, 100); });
    }

    addMessage('target', cleanMsg, narration);
    ch.msgCount++;
    ch.apiMessages.push({ role: 'user', content: userPrompt });
    ch.apiMessages.push({ role: 'assistant', content: reply });
    ch.chatHistory.push({ role: 'target', text: cleanMsg, narration, week: ch.week });

    updateStatsFloat();
    saveGame();
  } catch (e) {
    showTyping(false);
  }
}

function startProactiveTimer() {
  if (state.proactiveInterval) clearInterval(state.proactiveInterval);
  state.proactiveInterval = setInterval(() => {
    // 每15-45秒检查一次是否触发主动消息
    proactiveMessage();
  }, 20000 + Math.random() * 30000);
}

// ==================== 周推进 ====================
function advanceWeek() {
  const ch = getActiveChar();
  if (!ch) return;

  const stage = getStage(ch);
  const summary = ch.msgCount > 0
    ? `本周和${ch.targetName}交换了${ch.msgCount}条消息。关系：${stage}。`
    : '平淡的一周过去了。';

  addSystemMessage(`—— 第 ${ch.week} 周结束 ——\n${summary}`);

  ch.week++;
  ch.msgCount = 0;
  ch.eventLog = [];
  state.gameTime.day += 7;

  updateStatsFloat();
  saveGame();

  setTimeout(() => {
    addSystemMessage(`—— 第 ${ch.week} 周 ——`);
    document.getElementById('chatInput').focus();
  }, 400);
}

// ==================== 搜索 ====================
function searchMessages(query) {
  const msgs = document.getElementById('chatMessages');
  const all = msgs.querySelectorAll('.chat-msg');
  let count = 0;
  const q = query.toLowerCase();

  all.forEach(msg => {
    const text = (msg.dataset.searchText || '');
    if (!q || text.includes(q)) {
      msg.style.display = '';
      count++;
    } else {
      msg.style.display = 'none';
    }
  });

  document.getElementById('searchCount').textContent = q ? `${count} 条结果` : '';
  return count;
}

// ==================== 存档 ====================
function saveGame() {
  const data = {
    characters: {},
    charOrder: state.charOrder,
    activeCharId: state.activeCharId,
    mode: state.mode,
    gameTime: state.gameTime,
    groupChats: state.groupChats,
    activeGroupId: state.activeGroupId,
  };

  Object.entries(state.characters).forEach(([id, ch]) => {
    data.characters[id] = {
      ...ch,
      apiMessages: ch.apiMessages.slice(-30),
      chatHistory: ch.chatHistory.slice(-200),
    };
  });

  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    state.characters = data.characters || {};
    state.charOrder = data.charOrder || [];
    state.activeCharId = data.activeCharId || null;
    state.mode = data.mode || 'online';
    state.gameTime = data.gameTime || { day: 1, hour: 9, minute: 0 };
    state.groupChats = data.groupChats || [];
    state.activeGroupId = data.activeGroupId || null;
    return true;
  } catch { return false; }
}

// ==================== 生成名字 ====================
function generateTargetName() {
  const surnames = ['陈', '林', '张', '李', '王', '周', '沈', '陆', '顾', '许', '苏', '江', '何', '叶', '宋', '梁'];
  const names = ['奕恒', '景行', '明远', '霁川', '晏舟', '知遥', '司衡', '怀瑾', '云深', '砚清', '翊辰', '谨言'];
  return rpick(surnames) + rpick(names);
}

// ==================== 角色创建 ====================
function setupCreateScreen() {
  document.querySelectorAll('.choice-grid').forEach(grid => {
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.glass-chip');
      if (!chip) return;
      grid.querySelectorAll('.glass-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  document.getElementById('btnConfirmCreate').onclick = () => {
    const name = document.getElementById('playerName').value.trim() || '你';
    const playerJob = document.getElementById('playerJob').querySelector('.glass-chip.selected')?.dataset.value;
    const targetJob = document.getElementById('targetJob').querySelector('.glass-chip.selected')?.dataset.value;
    const paceStyle = document.getElementById('paceStyle').querySelector('.glass-chip.selected')?.dataset.value;
    const targetName = document.getElementById('targetNameInput').value.trim() || generateTargetName();

    if (!playerJob || !targetJob || !paceStyle) { alert('请完成所有选择'); return; }

    const id = uid();
    const ch = newCharacterData({ id, targetName, targetJob, playerName: name, playerJob, paceStyle });
    state.characters[id] = ch;
    state.charOrder.push(id);
    state.activeCharId = id;

    document.getElementById('createScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');

    initGameUI();
  };
}

function initGameUI() {
  updateStatsFloat();
  updateModeUI();
  updateCharDropdown();
  document.getElementById('timeLabel').textContent = getTimeStr();

  const ch = getActiveChar();
  if (!ch) return;

  const msgs = document.getElementById('chatMessages');
  msgs.innerHTML = '';

  const opening = `九月，城市还没完全凉下来。\n\n${ch.playerName}开始了新的生活。手机震动，有新消息进来。`;
  addSystemMessage(opening);

  ch.chatHistory.forEach(h => {
    if (h.week === ch.week) addMessage(h.role, h.text, h.narration);
  });

  document.getElementById('chatInput').focus();
  startProactiveTimer();
}

// ==================== 事件绑定 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 首页 → 创建
  document.getElementById('btnStartGame').addEventListener('click', () => {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('createScreen').classList.remove('hidden');
    setupCreateScreen();
  });

  document.getElementById('navNewGame').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('createScreen').classList.remove('hidden');
    setupCreateScreen();
  });

  document.getElementById('navContinue').addEventListener('click', (e) => {
    e.preventDefault();
    if (loadGame() && state.charOrder.length > 0) {
      document.getElementById('landingPage').classList.add('hidden');
      document.getElementById('gameScreen').classList.remove('hidden');
      initGameUI();
    } else { alert('没有存档'); }
  });

  // 游戏内操作
  document.getElementById('btnBackHome').addEventListener('click', () => {
    if (state.proactiveInterval) clearInterval(state.proactiveInterval);
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('createScreen').classList.add('hidden');
    document.getElementById('landingPage').classList.remove('hidden');
  });

  document.getElementById('btnSend').addEventListener('click', sendMessage);

  document.getElementById('chatInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  document.getElementById('chatInput').addEventListener('input', function() {
    this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  document.getElementById('btnNextWeek').addEventListener('click', advanceWeek);

  // 模式切换
  document.getElementById('btnModeToggle').addEventListener('click', () => {
    state.mode = state.mode === 'online' ? 'meetup' : 'online';
    updateModeUI();
    saveGame();
    const ch = getActiveChar();
    if (ch) {
      addSystemMessage(state.mode === 'meetup' ? '🤝 已切换到见面模式。动作和场景会自然融入对话。' : '📱 已切换到网聊模式。像微信聊天一样。');
    }
  });

  // 搜索
  document.getElementById('btnSearch').addEventListener('click', () => {
    const bar = document.getElementById('searchBar');
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) {
      document.getElementById('searchInput').focus();
    } else {
      document.getElementById('searchInput').value = '';
      searchMessages('');
    }
  });

  document.getElementById('searchInput').addEventListener('input', function() {
    searchMessages(this.value);
  });

  document.getElementById('btnSearchClose').addEventListener('click', () => {
    document.getElementById('searchBar').classList.add('hidden');
    document.getElementById('searchInput').value = '';
    searchMessages('');
  });

  // 角色选择器
  document.getElementById('charSelector').addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = document.getElementById('charDropdown');
    dd.classList.toggle('hidden');
    if (!dd.classList.contains('hidden')) updateCharDropdown();
  });

  document.addEventListener('click', () => {
    document.getElementById('charDropdown').classList.add('hidden');
  });

  // 创建新角色按钮
  document.getElementById('btnCreateChar').addEventListener('click', createNewCharacter);

  // 群聊
  document.getElementById('btnGroupChat').addEventListener('click', () => {
    setupGroupModal();
    document.getElementById('groupModal').classList.remove('hidden');
  });

  document.getElementById('groupModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });

  // 浮动面板折叠
  document.getElementById('statsFloatHeader').addEventListener('click', () => {
    document.getElementById('statsFloat').classList.toggle('collapsed');
  });

  // API 设置
  setupApiModal();
});

// ==================== API 设置弹窗 ====================
function setupApiModal() {
  const modal = document.getElementById('apiModal');
  const config = getApiConfig();

  document.querySelectorAll('#apiProvider .glass-chip').forEach(c => {
    c.classList.toggle('selected', c.dataset.value === (config.provider || 'deepseek'));
  });
  document.getElementById('apiKey').value = config.apiKey || '';
  document.getElementById('apiBase').value = config.apiBase || '';
  document.getElementById('apiModel').value = config.apiModel || '';

  document.getElementById('apiProvider').addEventListener('click', (e) => {
    const chip = e.target.closest('.glass-chip');
    if (!chip) return;
    document.querySelectorAll('#apiProvider .glass-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    document.getElementById('apiBase').placeholder = getDefaultEndpoint(chip.dataset.value);
    document.getElementById('apiModel').placeholder = getDefaultModel(chip.dataset.value);
  });

  document.getElementById('btnSaveApi').onclick = () => {
    const provider = document.querySelector('#apiProvider .glass-chip.selected')?.dataset.value || 'deepseek';
    saveApiConfig({
      provider,
      apiKey: document.getElementById('apiKey').value.trim(),
      apiBase: document.getElementById('apiBase').value.trim(),
      apiModel: document.getElementById('apiModel').value.trim(),
    });
    document.getElementById('apiStatus').textContent = '已保存 ✓';
    document.getElementById('apiStatus').className = 'api-status success';
    setTimeout(() => modal.classList.add('hidden'), 600);
  };

  document.getElementById('btnTestApi').onclick = async () => {
    const status = document.getElementById('apiStatus');
    status.textContent = '测试中…'; status.className = 'api-status';
    const provider = document.querySelector('#apiProvider .glass-chip.selected')?.dataset.value || 'deepseek';
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) { status.textContent = '请输入 API Key'; status.className = 'api-status error'; return; }
    saveApiConfig({ provider, apiKey, apiBase: document.getElementById('apiBase').value.trim(), apiModel: document.getElementById('apiModel').value.trim() });
    try {
      const testCh = newCharacterData({ id: 'test', targetName:'测试', targetJob:'医生', playerName:'你', playerJob:'设计师', paceStyle:'slow' });
      testCh.apiMessages = [];
      const text = await callApi('你好', testCh);
      status.textContent = text ? '连接成功 ✓' : '空响应';
      status.className = text ? 'api-status success' : 'api-status error';
    } catch (err) {
      status.textContent = '失败: ' + err.message;
      status.className = 'api-status error';
    }
  };

  document.getElementById('btnSettings').addEventListener('click', () => modal.classList.remove('hidden'));
  modal.addEventListener('click', (e) => { if (e.target === e.currentTarget) modal.classList.add('hidden'); });
}

// ==================== 启动 ====================
if (loadGame() && state.charOrder.length > 0) {
  document.getElementById('landingPage').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');
  initGameUI();
}

window.addEventListener('beforeunload', () => { if (state.charOrder.length > 0) saveGame(); });
