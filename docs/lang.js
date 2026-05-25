// === 梦女模拟器 i18n — 中文/EN ===
var LANG_KEY = 'dream-sim-lang';
var currentLang = localStorage.getItem(LANG_KEY) || 'zh';

var I18N = {
  zh: {
    siteTitle: '梦女模拟器',
    siteDesc: '一个他在意你、会主动找你、会吃醋、会已读不回的恋爱模拟游戏',
    navNewGame: '新游戏',
    navContinue: '继续游戏',
    navImport: '导入存档',
    heroSubtitle: '夜深了，打开手机',
    heroTitle: '梦女模拟器',
    heroDesc: '在深夜的屏幕对面，有一个人\n他会想你、会主动、会吃醋、会已读不回\n像真人一样，用他的方式跟你聊天',
    btnStartGame: '开始新游戏',
    entriesTitle: '你的故事',
    entriesEmpty: '还没有角色，创建第一个故事吧',
    addNewStory: '新故事',
    createBack: '← 返回',
    createTitle: '这次想攻略谁？',
    createSubtitle: '创建一个新角色',
    labelPlayerName: '你的昵称',
    labelPlayerGender: '你的性别',
    labelPlayerJob: '你的职业',
    labelTargetName: '攻略对象名字',
    labelTargetGender: '攻略对象性别',
    labelTargetJob: '攻略对象职业',
    labelTargetPersona: '攻略对象性格/人设（自定义，留空用默认）',
    labelTargetKinks: '性偏好 / XP（可多选）',
    labelPaceStyle: '亲密推进风格',
    labelCustomJob: '✎ 自定义…',
    placeholderPlayerName: '输入你的名字…',
    placeholderTargetName: '自定义或留空随机生成…',
    placeholderTargetPersona: '例如：高冷毒舌但心软的外科医生，工作狂，不喜欢甜食，有一只猫叫年糕…',
    placeholderTargetKinks: '自定义 XP，用逗号分隔…',
    placeholderPlayerJob: '输入你的职业…',
    placeholderTargetJob: '输入攻略对象的职业…',
    btnConfirmCreate: '确认 · 进入游戏',
    modeOnline: '📱 网聊模式',
    modeMeetup: '🤝 见面模式',
    chatHint: '故事即将开始…',
    chatPlaceholder: '输入消息…',
    btnSend: '发送',
    typingLabel: '对方正在输入…',
    weekLabel: '第{0}周',
    statMood: '心情',
    statEnergy: '精力',
    statFavor: '好感',
    statFamiliar: '熟悉',
    statHeart: '心动',
    statDepend: '依赖',
    statJealous: '吃醋',
    stageStranger: '陌生',
    stageAcquaintance: '认识',
    stageFriend: '朋友',
    stageAmbiguous: '暧昧',
    stageLove: '恋爱',
    scenarioProgress: '🏆 剧情节点 {0}/10',
    btnNextWeek: '⏭ 下一周',
    apiSettings: 'API 设置',
    apiProvider: '模型平台',
    apiKey: 'API Key',
    apiBase: 'API 地址（可选）',
    apiModel: '模型名称（可选）',
    supabaseUrl: '云同步 · Supabase URL',
    supabaseKey: '云同步 · Supabase Key',
    btnTestApi: '测试连接',
    btnSaveApi: '保存设置',
    groupChat: '创建群聊',
    groupDesc: '选择要拉入群聊的角色',
    btnCreateGroup: '创建群聊',
    moodGreat: '很好',
    moodGood: '还行',
    moodNormal: '一般',
    moodBad: '不好',
    moodTerrible: '很差',
    energyFull: '精力充沛',
    energyNormal: '正常',
    energyTired: '有点累',
    energyExhausted: '精疲力尽',
    searchPlaceholder: '搜索聊天记录…',
    noResult: '无结果',
    titleEmoji: '😊',
    titleImage: '🖼',
    titleVoice: '🎤',
    titleSearch: '🔍',
    titleCreateChar: '创建新角色',
    titleGroupChat: '创建群聊',
    titleExport: '导出存档',
    titleImport: '导入存档',
    titleSync: '云端同步',
    titleSound: '音效',
    titleSettings: 'API 设置',
    titleBack: '返回',
    titleModeToggle: '网聊/见面切换',
    genders: { '女': 'Female', '男': 'Male', '非二元': 'Non-binary', '跨性别女': 'Trans Woman', '跨性别男': 'Trans Man', '双性': 'Intersex' },
    playerJobs: { '设计师': 'Designer', '摄影师': 'Photographer', '医生': 'Doctor', '律师': 'Lawyer', '咖啡店店主': 'Café Owner', '老师': 'Teacher', '自由职业': 'Freelancer' },
    targetJobs: { '医生': 'Doctor', '警察': 'Police', '律师': 'Lawyer', '咖啡店老板': 'Café Owner', '总监': 'Director', '大学老师': 'Professor', '程序员': 'Programmer' },
    paceStyles: { 'slow': '慢热纯爱', 'moderate': '情感为主', 'fast': '纯欲刺激', 'heavy': '重口模式' },
    kinks: {
      '温柔系': 'Gentle', '粗暴系': 'Rough', '言语羞辱': 'Verbal Humiliation', '束缚': 'Bondage',
      '支配者': 'Dominant', '被支配': 'Submissive', '亲吻狂魔': 'Kiss Addict', '舔': 'Licking',
      '咬/印记': 'Biting/Marking', '窒息': 'Breath Play', '角色扮演': 'Roleplay', '野外/车里': 'Outdoor/Car',
      '浴室': 'Shower', '制服': 'Uniform', '年上控': 'Older', '年下控': 'Younger',
      '酒后': 'Tipsy', '半推半就': 'Reluctant', '强制': 'Forceful', '偷窥/偷拍': 'Voyeurism',
      '公开场合': 'Public', '撒娇': 'Coquettish', '哭': 'Crying', '玩具': 'Toys'
    },
    scenarios: {
      'first_meal': '第一次一起吃饭', 'late_night': '深夜聊天', 'first_jealous': '醋意',
      'first_meetup': '第一次见面', 'first_touch': '第一次触碰', 'confession': '告白',
      'first_kiss': '初吻', 'cold_war': '冷战', 'first_intimate': '第一次', 'living_together': '同居'
    },
    scenarioDescs: {
      'first_meal': '你们第一次约了饭。', 'late_night': '夜深人静时他主动发来消息。',
      'first_jealous': '他第一次因为你提到别人而吃醋。', 'first_meetup': '你们第一次线下见面。',
      'first_touch': '不经意间的肢体接触，心跳加速。', 'confession': '他说出了藏在心里的话。',
      'first_kiss': '空气凝固，他低头吻了你。', 'cold_war': '因为一件事，他不理你了。',
      'first_intimate': '防线崩塌，你们终于在一起了。', 'living_together': '你们开始了同居生活。'
    },
    eventNewScenario: '🎬 剧情触发',
    eventWeekAdvanced: '📅 新的一周开始了',
    alertNoSave: '没有本地存档，请点「导入存档」选择 save.json 文件',
    alertImportSuccess: '存档导入成功',
    alertImportFail: '存档导入失败，请检查文件格式',
    alertExportSuccess: '存档已导出',
    confirmDeleteChar: '确定要删除这个角色吗？此操作不可撤销。',
    msgStartChat: '开始聊天…',
    soundOn: '音效：开',
    soundOff: '音效：关',
    langLabel: '中/EN',
    langTitle: '切换语言',
  },

  en: {
    siteTitle: 'Dream Girl Simulator',
    siteDesc: 'A dating sim where he cares, initiates, gets jealous, and leaves you on read — just like a real person',
    navNewGame: 'New Game',
    navContinue: 'Continue',
    navImport: 'Import Save',
    heroSubtitle: 'Late at night, open your phone',
    heroTitle: 'Dream Sim',
    heroDesc: 'On the other side of the screen, there\'s someone\nWho thinks of you, reaches out, gets jealous, leaves you on read\nLike a real person, chatting with you in his own way',
    btnStartGame: 'Start New Game',
    entriesTitle: 'Your Stories',
    entriesEmpty: 'No characters yet. Create your first story.',
    addNewStory: 'New Story',
    createBack: '← Back',
    createTitle: 'Who will you pursue?',
    createSubtitle: 'Create a New Character',
    labelPlayerName: 'Your Name',
    labelPlayerGender: 'Your Gender',
    labelPlayerJob: 'Your Job',
    labelTargetName: 'Character Name',
    labelTargetGender: 'Character Gender',
    labelTargetJob: 'Character Job',
    labelTargetPersona: 'Personality / Character Bio (custom, leave empty for default)',
    labelTargetKinks: 'Kinks / Preferences (multi-select)',
    labelPaceStyle: 'Intimacy Pace',
    labelCustomJob: '✎ Custom…',
    placeholderPlayerName: 'Enter your name…',
    placeholderTargetName: 'Custom or leave blank for random…',
    placeholderTargetPersona: 'e.g. A cold, sharp-tongued surgeon with a soft heart, workaholic, hates sweets, has a cat named Mochi…',
    placeholderTargetKinks: 'Custom kinks, comma-separated…',
    placeholderPlayerJob: 'Enter your job…',
    placeholderTargetJob: 'Enter character\'s job…',
    btnConfirmCreate: 'Confirm · Start Game',
    modeOnline: '📱 Online Chat',
    modeMeetup: '🤝 Meetup Mode',
    chatHint: 'The story is about to begin…',
    chatPlaceholder: 'Type a message…',
    btnSend: 'Send',
    typingLabel: 'Typing…',
    weekLabel: 'Week {0}',
    statMood: 'Mood',
    statEnergy: 'Energy',
    statFavor: 'Favor',
    statFamiliar: 'Familiarity',
    statHeart: 'Heart',
    statDepend: 'Attachment',
    statJealous: 'Jealousy',
    stageStranger: 'Stranger',
    stageAcquaintance: 'Acquaintance',
    stageFriend: 'Friend',
    stageAmbiguous: 'Crush',
    stageLove: 'Lovers',
    scenarioProgress: '🏆 Scenarios {0}/10',
    btnNextWeek: '⏭ Next Week',
    apiSettings: 'API Settings',
    apiProvider: 'Model Provider',
    apiKey: 'API Key',
    apiBase: 'API Base URL (optional)',
    apiModel: 'Model Name (optional)',
    supabaseUrl: 'Cloud Sync · Supabase URL',
    supabaseKey: 'Cloud Sync · Supabase Key',
    btnTestApi: 'Test Connection',
    btnSaveApi: 'Save Settings',
    groupChat: 'Create Group Chat',
    groupDesc: 'Select characters to add to the group',
    btnCreateGroup: 'Create Group Chat',
    moodGreat: 'Great',
    moodGood: 'Good',
    moodNormal: 'Okay',
    moodBad: 'Bad',
    moodTerrible: 'Terrible',
    energyFull: 'Energetic',
    energyNormal: 'Normal',
    energyTired: 'Tired',
    energyExhausted: 'Exhausted',
    searchPlaceholder: 'Search chat history…',
    noResult: 'No results',
    titleEmoji: 'Emoji',
    titleImage: 'Image',
    titleVoice: 'Voice',
    titleSearch: 'Search',
    titleCreateChar: 'New Character',
    titleGroupChat: 'Group Chat',
    titleExport: 'Export Save',
    titleImport: 'Import Save',
    titleSync: 'Cloud Sync',
    titleSound: 'Sound',
    titleSettings: 'API Settings',
    titleBack: 'Back',
    titleModeToggle: 'Toggle Online/Meetup',
    genders: { '女': 'Female', '男': 'Male', '非二元': 'Non-binary', '跨性别女': 'Trans Woman', '跨性别男': 'Trans Man', '双性': 'Intersex' },
    playerJobs: { '设计师': 'Designer', '摄影师': 'Photographer', '医生': 'Doctor', '律师': 'Lawyer', '咖啡店店主': 'Café Owner', '老师': 'Teacher', '自由职业': 'Freelancer' },
    targetJobs: { '医生': 'Doctor', '警察': 'Police', '律师': 'Lawyer', '咖啡店老板': 'Café Owner', '总监': 'Director', '大学老师': 'Professor', '程序员': 'Programmer' },
    paceStyles: { 'slow': 'Slow Burn', 'moderate': 'Emotion-Driven', 'fast': 'Spicy & Fast', 'heavy': 'Heavy Mode' },
    kinks: {
      '温柔系': 'Gentle', '粗暴系': 'Rough', '言语羞辱': 'Verbal', '束缚': 'Bondage',
      '支配者': 'Dominant', '被支配': 'Submissive', '亲吻狂魔': 'Kisses', '舔': 'Licking',
      '咬/印记': 'Biting/Marking', '窒息': 'Breath Play', '角色扮演': 'Roleplay', '野外/车里': 'Outdoor/Car',
      '浴室': 'Shower', '制服': 'Uniform', '年上控': 'Older', '年下控': 'Younger',
      '酒后': 'Tipsy', '半推半就': 'Reluctant', '强制': 'Forceful', '偷窥/偷拍': 'Voyeur',
      '公开场合': 'Public', '撒娇': 'Coquettish', '哭': 'Crying', '玩具': 'Toys'
    },
    scenarios: {
      'first_meal': 'First Meal Together', 'late_night': 'Late Night Chat', 'first_jealous': 'Jealousy',
      'first_meetup': 'First Meetup', 'first_touch': 'First Touch', 'confession': 'Confession',
      'first_kiss': 'First Kiss', 'cold_war': 'Cold War', 'first_intimate': 'First Time', 'living_together': 'Living Together'
    },
    scenarioDescs: {
      'first_meal': 'You had your first meal date.', 'late_night': 'Late at night, he reached out.',
      'first_jealous': 'He got jealous for the first time.', 'first_meetup': 'You met offline for the first time.',
      'first_touch': 'An accidental touch made hearts race.', 'confession': 'He finally said what\'s in his heart.',
      'first_kiss': 'Time froze. He leaned in and kissed you.', 'cold_war': 'Something happened. He\'s giving you the silent treatment.',
      'first_intimate': 'The walls came down. You were finally together.', 'living_together': 'You started living together.'
    },
    eventNewScenario: '🎬 Scenario Unlocked',
    eventWeekAdvanced: '📅 A new week begins',
    alertNoSave: 'No local save found. Use "Import Save" to load a save.json file.',
    alertImportSuccess: 'Save imported successfully.',
    alertImportFail: 'Import failed. Check the file format.',
    alertExportSuccess: 'Save exported.',
    confirmDeleteChar: 'Delete this character? This cannot be undone.',
    msgStartChat: 'Start chatting…',
    soundOn: 'Sound: ON',
    soundOff: 'Sound: OFF',
    langLabel: '中/EN',
    langTitle: 'Switch Language',
  }
};

function t(key) {
  var lang = currentLang;
  var val = (I18N[lang] && I18N[lang][key]) ? I18N[lang][key] : (I18N['zh'][key] || key);
  // Handle {0}, {1} format args
  var args = Array.prototype.slice.call(arguments, 1);
  if (args.length > 0) {
    for (var i = 0; i < args.length; i++) {
      val = val.replace('{' + i + '}', args[i]);
    }
  }
  return val;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  refreshAllUIText();
}

function getCurrentLang() { return currentLang; }

// Called by game.js after DOM updates to refresh all text
function refreshAllUIText() {
  var lang = currentLang;
  // Document title
  document.title = t('siteTitle');

  // Landing page
  setText('#navNewGame', 'navNewGame');
  setText('#navContinue', 'navContinue');
  setText('#navImport', 'navImport');
  setText('.hero .subtitle', 'heroSubtitle');
  setText('.hero h1', 'heroTitle');
  setText('.hero .desc', 'heroDesc');
  setText('#btnStartGame', 'btnStartGame');
  setText('.entries-title', 'entriesTitle');
  setText('.entries-empty p', 'entriesEmpty');

  // Create screen
  setText('.create-card .subtitle', 'createSubtitle');
  setText('.create-card h2', 'createTitle');
  setPlaceholder('#playerName', 'placeholderPlayerName');
  setPlaceholder('#targetNameInput', 'placeholderTargetName');
  setPlaceholder('#targetPersona', 'placeholderTargetPersona');
  setPlaceholder('#targetKinksCustom', 'placeholderTargetKinks');
  setPlaceholder('#playerJobCustom', 'placeholderPlayerJob');
  setPlaceholder('#targetJobCustom', 'placeholderTargetJob');
  setText('#btnConfirmCreate', 'btnConfirmCreate');

  // Game screen
  setPlaceholder('#chatInput', 'chatPlaceholder');
  setText('#btnSend', 'btnSend');
  setText('.typing-label', 'typingLabel');

  // Stats panel
  setText('.stats-float-header span:first-child', 'statFavor'); // fallback if name not set

  // Chat mode badge
  var badge = document.getElementById('chatModeBadge');
  if (badge && state.activeCharId) {
    badge.textContent = state.mode === 'online' ? t('modeOnline') : t('modeMeetup');
  }

  // Meta
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('siteDesc'));

  // Re-render char entries (they contain text)
  if (typeof renderCharEntries === 'function') {
    renderCharEntries();
  }

  // Update stats float (has labels)
  if (typeof updateStatsFloat === 'function') {
    updateStatsFloat();
  }
}

function setText(selector, key) {
  var el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

function setPlaceholder(selector, key) {
  var el = document.getElementById(selector);
  if (el) el.placeholder = t(key);
}
