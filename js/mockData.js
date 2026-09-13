/**
 * 模拟数据生成器
 * 包含世界热点和国内热点数据
 */

// ========== 世界热点数据 ==========
const worldHotspots = [
    {
        id: 'w001',
        title: '联合国气候峰会达成新减排协议',
        category: '政治',
        lat: 51.5074,
        lng: -0.1278,
        city: '伦敦, 英国',
        heat: 982,
        trend: 'up',
        trendVal: 12,
        level: 'major',
        spread: '1280万',
        sentiment: 'positive',
        time: '2026-04-22 09:30',
        desc: '第28届联合国气候变化大会经过两周紧张谈判，终于在碳减排时间表上达成一致。协议要求发达国家在2030年前将碳排放减少45%，并为发展中国家提供每年1000亿美元的气候融资支持。'
    },
    {
        id: 'w002',
        title: 'SpaceX星舰第八次试飞成功入轨',
        category: '科技',
        lat: 28.5721,
        lng: -80.6480,
        city: '卡纳维拉尔角, 美国',
        heat: 856,
        trend: 'up',
        trendVal: 28,
        level: 'major',
        spread: '956万',
        sentiment: 'positive',
        time: '2026-04-22 08:15',
        desc: 'SpaceX的Starship重型运载火箭在第八次综合飞行测试中首次成功完成入轨并安全返回。这标志着人类历史上最大运载能力的火箭系统向商业运营迈出关键一步。'
    },
    {
        id: 'w003',
        title: '东京股市日经指数创历史新高',
        category: '经济',
        lat: 35.6762,
        lng: 139.6503,
        city: '东京, 日本',
        heat: 723,
        trend: 'down',
        trendVal: 3,
        level: 'normal',
        spread: '642万',
        sentiment: 'positive',
        time: '2026-04-22 07:00',
        desc: '受半导体出口强劲增长和企业盈利预期上调推动，日经225指数盘中触及42,000点，创下自1989年泡沫经济时期以来的最高纪录。'
    },
    {
        id: 'w004',
        title: '地中海强震致多国发布海啸预警',
        category: '灾害',
        lat: 37.9838,
        lng: 23.7275,
        city: '雅典, 希腊',
        heat: 901,
        trend: 'up',
        trendVal: 45,
        level: 'critical',
        spread: '1102万',
        sentiment: 'negative',
        time: '2026-04-22 06:45',
        desc: '希腊克里特岛附近海域发生7.8级强烈地震，震源深度仅15公里。希腊、土耳其、意大利等国相继发布海啸预警，已确认造成数十人伤亡。'
    },
    {
        id: 'w005',
        title: '巴黎奥运会场馆改造引发环保争议',
        category: '社会',
        lat: 48.8566,
        lng: 2.3522,
        city: '巴黎, 法国',
        heat: 634,
        trend: 'up',
        trendVal: 8,
        level: 'normal',
        spread: '528万',
        sentiment: 'neutral',
        time: '2026-04-21 22:10',
        desc: '2024年巴黎奥运会部分临时场馆的拆除计划引发环保组织抗议。 activists 认为应使用可回收材料重建而非完全拆除，估计产生数万吨建筑垃圾。'
    },
    {
        id: 'w006',
        title: '巴西热带雨林非法砍伐面积同比下降30%',
        category: '环境',
        lat: -3.4653,
        lng: -62.2159,
        city: '马瑙斯, 巴西',
        heat: 512,
        trend: 'down',
        trendVal: 15,
        level: 'normal',
        spread: '415万',
        sentiment: 'positive',
        time: '2026-04-21 20:00',
        desc: '巴西环境部最新卫星监测数据显示，亚马逊雨林保护区内的非法砍伐面积较去年同期下降30%，主要归功于加强的空中巡逻和AI监测系统。'
    },
    {
        id: 'w007',
        title: '澳大利亚大堡礁珊瑚白化加速',
        category: '环境',
        lat: -16.2888,
        lng: 145.8611,
        city: '凯恩斯, 澳大利亚',
        heat: 445,
        trend: 'up',
        trendVal: 22,
        level: 'normal',
        spread: '380万',
        sentiment: 'negative',
        time: '2026-04-21 18:30',
        desc: '海洋科学家最新调查显示，大堡礁北部区域珊瑚白化程度达到近五年最严重水平，海水温度异常升高是主要原因。联合国教科文组织或将重新评估其世界遗产状态。'
    },
    {
        id: 'w008',
        title: '印度孟买地铁新线路正式开通',
        category: '基建',
        lat: 19.0760,
        lng: 72.8777,
        city: '孟买, 印度',
        heat: 398,
        trend: 'up',
        trendVal: 5,
        level: 'normal',
        spread: '320万',
        sentiment: 'positive',
        time: '2026-04-21 16:20',
        desc: '孟买地铁3号线（Colaba-Bandra-SEEPZ）全长33.5公里，是印度首条全长地下线路，预计日均客运量达150万人次，将显著缓解城市交通拥堵。'
    },
    {
        id: 'w009',
        title: '南非总统宣布能源改革新方案',
        category: '政治',
        lat: -25.7479,
        lng: 28.2293,
        city: '比勒陀利亚, 南非',
        heat: 367,
        trend: 'down',
        trendVal: 2,
        level: 'normal',
        spread: '298万',
        sentiment: 'neutral',
        time: '2026-04-21 14:00',
        desc: '南非总统在议会发表重要讲话，公布为期五年的国家能源转型计划，包括加快可再生能源并网、逐步淘汰老旧燃煤电厂，并引入私营部门参与电网建设。'
    },
    {
        id: 'w010',
        title: '南极洲冰架崩塌加速 海平面上升担忧加剧',
        category: '环境',
        lat: -75.2500,
        lng: -63.0000,
        city: '南极半岛',
        heat: 678,
        trend: 'up',
        trendVal: 35,
        level: 'major',
        spread: '720万',
        sentiment: 'negative',
        time: '2026-04-21 12:00',
        desc: '卫星图像显示南极洲布伦特冰架出现新的巨大裂缝，预计将有面积约1500平方公里的冰山脱落。科学家警告这可能是该区域三十年来最大规模的冰架崩塌事件。'
    },
    {
        id: 'w011',
        title: '韩国首尔人工智能芯片峰会开幕',
        category: '科技',
        lat: 37.5665,
        lng: 126.9780,
        city: '首尔, 韩国',
        heat: 589,
        trend: 'up',
        trendVal: 18,
        level: 'normal',
        spread: '510万',
        sentiment: 'positive',
        time: '2026-04-21 10:30',
        desc: '为期三天的全球AI芯片峰会吸引了三星、SK海力士、NVIDIA等巨头参与。韩国政府宣布将在未来十年投资300万亿韩元建设全球最大的AI半导体产业集群。'
    },
    {
        id: 'w012',
        title: '瑞士冰川消融速度创纪录',
        category: '环境',
        lat: 46.5580,
        lng: 7.9800,
        city: '阿尔卑斯山区, 瑞士',
        heat: 423,
        trend: 'up',
        trendVal: 11,
        level: 'normal',
        spread: '356万',
        sentiment: 'negative',
        time: '2026-04-21 09:00',
        desc: '瑞士科学院年度报告指出，2025-2026年冬季阿尔卑斯冰川体积缩减了4.2%，连续第四年创下观测纪录。多个著名冰川预计将在20年内完全消失。'
    }
];

// ========== 国内热点数据 ==========
const chinaHotspots = [
    {
        id: 'c001',
        title: '粤港澳大湾区跨境数据流通新规实施',
        category: '政策',
        lat: 22.5431,
        lng: 114.0579,
        city: '深圳, 广东',
        heat: 892,
        trend: 'up',
        trendVal: 25,
        level: 'major',
        spread: '1024万',
        sentiment: 'positive',
        time: '2026-04-22 10:00',
        desc: '《粤港澳大湾区跨境数据流通管理办法》正式生效，率先在金融、医疗、科研三个领域试点数据"白名单"制度，预计将大幅提升区域数字经济协同效率。'
    },
    {
        id: 'c002',
        title: '神舟二十号载人飞船成功对接空间站',
        category: '科技',
        lat: 40.6031,
        lng: 93.7436,
        city: '酒泉, 甘肃',
        heat: 945,
        trend: 'up',
        trendVal: 38,
        level: 'major',
        spread: '1350万',
        sentiment: 'positive',
        time: '2026-04-22 08:45',
        desc: '神舟二十号载人飞船采用自主快速交会对接模式，成功对接于天和核心舱径向端口。三名航天员将开展为期半年的在轨驻留，执行多项空间科学实验任务。'
    },
    {
        id: 'c003',
        title: '长三角一体化新交通规划获批',
        category: '基建',
        lat: 31.2304,
        lng: 121.4737,
        city: '上海',
        heat: 756,
        trend: 'up',
        trendVal: 15,
        level: 'normal',
        spread: '820万',
        sentiment: 'positive',
        time: '2026-04-22 07:30',
        desc: '国家发改委正式批复《长三角多层次轨道交通规划(2026-2035)》，规划新建城际铁路2800公里，实现主要城市间1小时通达，总投资规模超万亿。'
    },
    {
        id: 'c004',
        title: '四川雅安发生5.6级地震 应急响应启动',
        category: '灾害',
        lat: 29.9800,
        lng: 103.0000,
        city: '雅安, 四川',
        heat: 968,
        trend: 'up',
        trendVal: 52,
        level: 'critical',
        spread: '1580万',
        sentiment: 'negative',
        time: '2026-04-22 05:20',
        desc: '四川省雅安市发生5.6级地震，震源深度12公里。应急管理部已启动III级应急响应，当地消防、医疗队伍已赶赴震中区域开展救援，暂无重大伤亡报告。'
    },
    {
        id: 'c005',
        title: '新能源汽车产销量连续18个月全球第一',
        category: '经济',
        lat: 39.9042,
        lng: 116.4074,
        city: '北京',
        heat: 634,
        trend: 'up',
        trendVal: 8,
        level: 'normal',
        spread: '568万',
        sentiment: 'positive',
        time: '2026-04-21 23:00',
        desc: '中国汽车工业协会发布最新数据，2026年一季度新能源汽车产销量分别达到280万和275万辆，同比增长32%和35%，市场渗透率突破45%。'
    },
    {
        id: 'c006',
        title: '杭州亚运村改造项目获国际建筑大奖',
        category: '文化',
        lat: 30.2741,
        lng: 120.1551,
        city: '杭州, 浙江',
        heat: 412,
        trend: 'up',
        trendVal: 20,
        level: 'normal',
        spread: '356万',
        sentiment: 'positive',
        time: '2026-04-21 21:00',
        desc: '杭州亚运村赛后改造项目获得2026年世界建筑节(WAF)城市再生类别最高奖。项目将运动员村改造为面向青年创业者的国际社区，保留了大量可持续设计元素。'
    },
    {
        id: 'c007',
        title: '内蒙古风电基地单日发电量创新高',
        category: '能源',
        lat: 40.8175,
        lng: 111.7650,
        city: '呼和浩特, 内蒙古',
        heat: 389,
        trend: 'down',
        trendVal: 5,
        level: 'normal',
        spread: '298万',
        sentiment: 'positive',
        time: '2026-04-21 19:30',
        desc: '内蒙古乌兰察布风电基地单日发电量突破1.2亿千瓦时，创历史新高。该基地规划总装机容量达600万千瓦，是"西电东送"战略的重要电源点。'
    },
    {
        id: 'c008',
        title: '武汉长江大桥维修引发交通管制讨论',
        category: '民生',
        lat: 30.5500,
        lng: 114.3100,
        city: '武汉, 湖北',
        heat: 523,
        trend: 'up',
        trendVal: 12,
        level: 'normal',
        spread: '445万',
        sentiment: 'neutral',
        time: '2026-04-21 17:00',
        desc: '武汉长江大桥进入全面维修阶段，预计工期18个月。交管部门公布了详细绕行方案，但跨江通勤高峰时段仍可能出现严重拥堵，市民建议错峰出行。'
    },
    {
        id: 'c009',
        title: '海南自贸港零关税清单再扩容',
        category: '政策',
        lat: 20.0174,
        lng: 110.3492,
        city: '海口, 海南',
        heat: 467,
        trend: 'up',
        trendVal: 9,
        level: 'normal',
        spread: '390万',
        sentiment: 'positive',
        time: '2026-04-21 15:30',
        desc: '财政部等五部门联合发布公告，海南自贸港"零关税"原辅料清单新增187项商品，涵盖生物医药、新能源汽车、精密仪器等领域，将进一步降低企业生产成本。'
    },
    {
        id: 'c010',
        title: '青藏高原生态保护红线划定完成',
        category: '环境',
        lat: 35.0000,
        lng: 95.0000,
        city: '青藏高原',
        heat: 578,
        trend: 'up',
        trendVal: 14,
        level: 'normal',
        spread: '480万',
        sentiment: 'positive',
        time: '2026-04-21 13:00',
        desc: '生态环境部宣布青藏高原生态保护红线划定工作全部完成，红线面积占区域总面积的42%，涉及三江源、祁连山、羌塘等国家级自然保护区核心区域。'
    },
    {
        id: 'c011',
        title: '成都科幻大会创参观人次纪录',
        category: '文化',
        lat: 30.5728,
        lng: 104.0668,
        city: '成都, 四川',
        heat: 445,
        trend: 'up',
        trendVal: 28,
        level: 'normal',
        spread: '512万',
        sentiment: 'positive',
        time: '2026-04-21 11:00',
        desc: '第37届中国科幻大会在成都开幕，首日参观人次突破8万，创历史新高。大会设置了科幻影视、游戏、出版等多个展区，刘慈欣等知名作家出席主旨论坛。'
    },
    {
        id: 'c012',
        title: '渤海湾海上风电项目全面并网',
        category: '能源',
        lat: 38.0000,
        lng: 118.0000,
        city: '渤海湾',
        heat: 356,
        trend: 'down',
        trendVal: 3,
        level: 'normal',
        spread: '280万',
        sentiment: 'positive',
        time: '2026-04-21 08:30',
        desc: '渤海湾千万千瓦级海上风电基地最后一批机组正式并网发电，标志着该项目全面投产。年发电量可达350亿千瓦时，相当于减少标准煤消耗约1050万吨。'
    }
];

// ========== 合并数据 ==========
let currentTab = 'world';
let allHotspots = [];

function getCurrentHotspots() {
    return currentTab === 'world' ? worldHotspots : chinaHotspots;
}

// ========== 趋势数据（24h） ==========
function generateTrendData() {
    const hours = [];
    const total = [];
    const positive = [];
    const negative = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const t = new Date(now.getTime() - i * 3600000);
        hours.push(t.getHours() + ':00');
        
        const base = 300 + Math.random() * 200;
        const wave = Math.sin((23 - i) / 24 * Math.PI * 2) * 100;
        total.push(Math.round(base + wave + Math.random() * 80));
        
        positive.push(Math.round(total[total.length - 1] * (0.3 + Math.random() * 0.2)));
        negative.push(Math.round(total[total.length - 1] * (0.1 + Math.random() * 0.15)));
    }
    
    return { hours, total, positive, negative };
}

// ========== 词云数据 ==========
function generateWordCloud() {
    const words = [
        { name: '人工智能', value: 100 }, { name: 'AI芯片', value: 85 },
        { name: '碳中和', value: 78 }, { name: '新能源', value: 72 },
        { name: '卫星', value: 65 }, { name: '地震', value: 60 },
        { name: '气候', value: 58 }, { name: '经济', value: 55 },
        { name: '政策', value: 52 }, { name: '5G', value: 48 },
        { name: '数据安全', value: 45 }, { name: '跨境', value: 42 },
        { name: '创新创业', value: 40 }, { name: '航天', value: 38 },
        { name: '生态保护', value: 36 }, { name: '数字经济', value: 35 },
        { name: '一带一路', value: 32 }, { name: '半导体', value: 30 },
        { name: '智慧城市', value: 28 }, { name: '量子', value: 25 },
        { name: '生物医药', value: 23 }, { name: '元宇宙', value: 20 },
        { name: '区块链', value: 18 }, { name: '自动驾驶', value: 16 },
        { name: '储能', value: 15 }, { name: '光刻机', value: 14 },
        { name: '深空探测', value: 12 }, { name: '核聚变', value: 10 }
    ];
    return words;
}

// ========== 分类统计 ==========
function getCategoryStats() {
    const data = getCurrentHotspots();
    const cats = {};
    data.forEach(item => {
        cats[item.category] = (cats[item.category] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
}

// ========== 情感统计 ==========
function getSentimentStats() {
    const data = getCurrentHotspots();
    const stats = { positive: 0, neutral: 0, negative: 0 };
    data.forEach(item => {
        stats[item.sentiment]++;
    });
    return [
        { value: stats.positive, name: '正面', itemStyle: { color: '#2ed573' } },
        { value: stats.neutral, name: '中性', itemStyle: { color: '#ff9d00' } },
        { value: stats.negative, name: '负面', itemStyle: { color: '#ff4757' } }
    ];
}

// ========== 实时事件流 ==========
function generateEventStream() {
    const streams = [
        { tag: 'world', text: '英国伦敦 · 气候变化协议细节公布，碳交易机制或将调整' },
        { tag: 'china', text: '甘肃酒泉 · 神舟二十号完成首次在轨实验操作' },
        { tag: 'world', text: '希腊雅典 · 强震余震持续，救援队已抵达灾区' },
        { tag: 'china', text: '四川雅安 · 地震应急响应升级，通信基本恢复' },
        { tag: 'world', text: '美国佛州 · SpaceX确认下一轮试飞时间窗口' },
        { tag: 'china', text: '广东深圳 · 跨境数据流通首批白名单企业公布' },
        { tag: 'world', text: '日本东京 · 日经指数盘中回落，获利盘回吐' },
        { tag: 'china', text: '上海 · 长三角轨交规划环评公示启动' },
        { tag: 'world', text: '法国巴黎 · 环保组织占据奥运场馆抗议' },
        { tag: 'china', text: '浙江杭州 · 亚运村改造获国际认可，游客量激增' },
    ];
    return streams;
}

// ========== 飞线数据（模拟城市间数据流动） ==========
function generateFlyLines() {
    const data = getCurrentHotspots();
    const center = currentTab === 'world' 
        ? { lat: 20, lng: 0 }
        : { lat: 35, lng: 105 };
    
    return data.slice(0, 8).map(item => ({
        from: [center.lng, center.lat],
        to: [item.lng, item.lat],
        value: item.heat
    }));
}
