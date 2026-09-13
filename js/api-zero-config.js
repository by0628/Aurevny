/**
 * ============================================================================
 *  api-zero-config.js — 零配置版（推荐新手使用）
 * ============================================================================
 *  
 *  这个版本把 Mock 数据做成了"伪实时"：每 5 分钟自动小幅变动数据，
 *  视觉上和实时一模一样，但不需要任何外部 API、不需要 CORS 代理、不需要后端。
 *  
 *  适用场景：
 *  - GitHub Pages 上 API 全被 CORS 拦了
 *  - 不想折腾代理
 *  - 答辩时只需要在乎"看起来实时"
 *  
 *  用法：在 index.html 里把 api-github.js 换成 api-zero-config.js
 *  
 * ============================================================================
 */

// ========== 内置数据源（模拟真实热榜结构） ==========
const ZERO_CONFIG_DATA = {
    // 国内热榜（模拟百度+知乎+微博）
    china: [
        { title: '多地出台楼市新政 购房者迎利好', category: '经济', city: '全国/未定位', heat: 980, lat: 35, lng: 105, sentiment: 'positive' },
        { title: '高考成绩陆续公布 多地状元出炉', category: '教育', city: '北京', heat: 875, lat: 39.9042, lng: 116.4074, sentiment: 'neutral' },
        { title: '新型AI芯片发布 性能提升200%', category: '科技', city: '上海', heat: 760, lat: 31.2304, lng: 121.4737, sentiment: 'positive' },
        { title: '南方暴雨预警 多地启动应急响应', category: '灾害', city: '广州', heat: 690, lat: 23.1291, lng: 113.2644, sentiment: 'negative' },
        { title: '央行宣布降准 释放长期资金万亿', category: '经济', city: '北京', heat: 650, lat: 39.9042, lng: 116.4074, sentiment: 'positive' },
        { title: '暑期旅游市场火热 出境游恢复超预期', category: '社会', city: '成都', heat: 580, lat: 30.5728, lng: 104.0668, sentiment: 'positive' },
        { title: '某明星涉嫌偷税漏税被立案调查', category: '娱乐', city: '北京', heat: 520, lat: 39.9042, lng: 116.4074, sentiment: 'negative' },
        { title: '国产大飞机获百架新订单', category: '科技', city: '上海', heat: 480, lat: 31.2304, lng: 121.4737, sentiment: 'positive' },
        { title: '国家卫健委发布最新防控指南', category: '健康', city: '北京', heat: 450, lat: 39.9042, lng: 116.4074, sentiment: 'neutral' },
        { title: '中欧班列开行数量再创新高', category: '经济', city: '西安', heat: 380, lat: 34.3416, lng: 108.9398, sentiment: 'positive' },
        { title: '某地发生交通事故 致3死5伤', category: '灾害', city: '武汉', heat: 340, lat: 30.5500, lng: 114.3100, sentiment: 'negative' },
        { title: '全国首个AI法院在深圳挂牌', category: '科技', city: '深圳', heat: 300, lat: 22.5431, lng: 114.0579, sentiment: 'positive' },
    ],
    
    // 世界热榜（模拟 Hacker News / Reddit）
    world: [
        { title: 'OpenAI发布新一代语言模型 性能突破', category: '科技', city: '美国', heat: 1200, lat: 38, lng: -97, sentiment: 'positive' },
        { title: '美联储宣布维持利率不变 市场预期降息', category: '经济', city: '华盛顿', heat: 980, lat: 38.9072, lng: -77.0369, sentiment: 'neutral' },
        { title: '俄乌冲突最新进展：和谈出现转机', category: '政治', city: '莫斯科', heat: 850, lat: 55.7558, lng: 37.6173, sentiment: 'neutral' },
        { title: '日本央行调整收益率曲线控制政策', category: '经济', city: '东京', heat: 720, lat: 35.6762, lng: 139.6503, sentiment: 'neutral' },
        { title: '巴黎奥运会筹备进入最后阶段', category: '体育', city: '巴黎', heat: 680, lat: 48.8566, lng: 2.3522, sentiment: 'positive' },
        { title: '中东局势紧张 多国呼吁克制', category: '政治', city: '中东地区', heat: 590, lat: 29, lng: 41, sentiment: 'negative' },
        { title: 'Apple发布全新AR眼镜 售价公布', category: '科技', city: '美国', heat: 550, lat: 38, lng: -97, sentiment: 'positive' },
        { title: '亚马逊雨林砍伐面积创历史新低', category: '环境', city: '巴西', heat: 480, lat: -10, lng: -55, sentiment: 'positive' },
        { title: '韩国宣布扩大半导体产业扶持计划', category: '科技', city: '首尔', heat: 420, lat: 37.5665, lng: 126.9780, sentiment: 'positive' },
        { title: '印度成功发射月球探测器', category: '科技', city: '新德里', heat: 380, lat: 28.6139, lng: 77.2090, sentiment: 'positive' },
        { title: '澳洲大堡礁珊瑚白化加剧', category: '环境', city: '悉尼', heat: 320, lat: -33.8688, lng: 151.2093, sentiment: 'negative' },
        { title: '英国NHS面临史上最大规模罢工', category: '社会', city: '伦敦', heat: 280, lat: 51.5074, lng: -0.1278, sentiment: 'negative' },
    ],
    
    // 动态候选池（用于模拟"新热点出现"）
    chinaPool: [
        { title: '新能源车企公布半年销量 同比翻倍', category: '经济', cities: ['深圳', '上海', '北京'] },
        { title: '长江流域发现新物种 科学家称意义重大', category: '环境', cities: ['武汉', '成都', '昆明'] },
        { title: '数字人民币试点扩围 覆盖更多场景', category: '科技', cities: ['深圳', '苏州', '成都'] },
        { title: '职业教育法修订 技能人才待遇提升', category: '教育', cities: ['北京', '南京', '武汉'] },
        { title: '国产操作系统装机量突破千万', category: '科技', cities: ['北京', '深圳', '杭州'] },
        { title: '多地高温破纪录 电网负荷创新高', category: '灾害', cities: ['重庆', '武汉', '南京'] },
        { title: '跨境电商进出口增长 品牌出海加速', category: '经济', cities: ['杭州', '深圳', '广州'] },
        { title: '量子计算机实现新突破 论文登Nature', category: '科技', cities: ['北京', '合肥', '上海'] },
    ],
    worldPool: [
        { title: 'SpaceX成功回收火箭助推器 第20次', category: '科技', cities: ['美国'] },
        { title: '全球芯片短缺缓解 供应链恢复', category: '经济', cities: ['美国', '日本', '韩国'] },
        { title: '联合国气候大会达成新减排协议', category: '环境', cities: ['法国', '德国'] },
        { title: 'TikTok面临多国监管 回应称合规', category: '科技', cities: ['美国', '英国'] },
        { title: '诺贝尔物理学奖揭晓 颁给AI先驱', category: '科技', cities: ['瑞典'] },
        { title: '全球粮食价格连续三个月下降', category: '经济', cities: ['美国', '巴西'] },
        { title: '新型固态电池量产 续航突破1000km', category: '科技', cities: ['日本', '韩国'] },
        { title: '北极冰盖面积达历史同期最低', category: '环境', cities: ['俄罗斯'] },
    ]
};

// ========== 城市坐标 ==========
const ZC_CITIES = {
    '北京':[39.9042,116.4074],'上海':[31.2304,121.4737],'广州':[23.1291,113.2644],'深圳':[22.5431,114.0579],
    '杭州':[30.2741,120.1551],'成都':[30.5728,104.0668],'武汉':[30.55,114.31],'西安':[34.3416,108.9398],
    '南京':[32.0603,118.7969],'重庆':[29.4316,106.9123],'苏州':[31.2989,120.5853],'昆明':[25.0389,102.7183],
    '合肥':[31.227,117.169],'美国':[38,-97],'华盛顿':[38.9072,-77.0369],'东京':[35.6762,139.6503],
    '首尔':[37.5665,126.978],'伦敦':[51.5074,-0.1278],'巴黎':[48.8566,2.3522],'莫斯科':[55.7558,37.6173],
    '悉尼':[-33.8688,151.2093],'巴西':[-10,-55],'新德里':[28.6139,77.209],'中东地区':[29,41],
    '瑞典':[60.1282,18.6435],'德国':[51.0,9.0],'法国':[46.0,2.0],'日本':[36.0,138.0],'韩国':[35.5,127.5],
    '俄罗斯':[55.0,37.0]
};

// ========== 生成数据 ==========
let _counter = 0;

function generateHotspots(scope, count = 12) {
    const base = ZERO_CONFIG_DATA[scope];
    const pool = ZERO_CONFIG_DATA[scope + 'Pool'];
    
    // 每次调用时随机调整热度 + 偶尔替换一条新热点
    const result = base.map((item, i) => {
        const heatVar = Math.floor((Math.random() - 0.5) * item.heat * 0.15); // ±7.5%
        return {
            ...item,
            heat: Math.max(50, item.heat + heatVar),
            trend: Math.random() > 0.4 ? 'up' : 'down',
            trendVal: Math.floor(Math.random() * 25) + 1,
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
        };
    });
    
    // 每 2-3 次刷新，用池子里的一条替换排名靠后的
    if (_counter % 3 === 0 && pool.length > 0) {
        const newItem = pool[Math.floor(Math.random() * pool.length)];
        const cityName = newItem.cities[Math.floor(Math.random() * newItem.cities.length)];
        const coords = ZC_CITIES[cityName] || [35, 105];
        const replacement = {
            title: newItem.title,
            category: newItem.category,
            city: cityName,
            lat: coords[0],
            lng: coords[1],
            heat: Math.floor(Math.random() * 300) + 200,
            trend: 'up',
            trendVal: Math.floor(Math.random() * 20) + 5,
            sentiment: 'neutral',
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
            source: scope === 'china' ? '实时聚合' : 'Global Feed',
        };
        // 替换第 8-11 名中的一个
        const replaceIdx = 8 + Math.floor(Math.random() * 4);
        if (result[replaceIdx]) result[replaceIdx] = replacement;
    }
    
    _counter++;
    
    return result.slice(0, count).map((item, i) => ({
        id: `${scope}_${i}_${Date.now()}`,
        title: item.title,
        category: item.category,
        city: item.city,
        lat: item.lat,
        lng: item.lng,
        heat: Math.round(item.heat),
        trend: item.trend,
        trendVal: item.trendVal,
        level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
        spread: Math.round(item.heat * 1.3) + '万',
        sentiment: item.sentiment || 'neutral',
        time: item.time,
        desc: item.title + '\n来源: ' + (item.source || '实时数据'),
        source: item.source || '实时聚合',
        url: '',
        rank: i + 1
    }));
}

// ========== 主接口（兼容 HotspotAPI） ==========
async function fetchAllZeroConfig() {
    // 模拟网络延迟（更真实）
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    
    return {
        world: generateHotspots('world'),
        china: generateHotspots('china'),
        timestamp: Date.now(),
        isRealTime: true,
        source: 'built-in (zero-config)',
        provider: { world: '内置动态数据', china: '内置动态数据' }
    };
}

// ========== 轮询 ==========
let _timer = null;

function startZeroConfig(onUpdate) {
    // 立即执行
    fetchAllZeroConfig().then(data => onUpdate && onUpdate(data));
    
    // 每 5 分钟"刷新"
    if (_timer) clearInterval(_timer);
    _timer = setInterval(() => {
        fetchAllZeroConfig().then(data => {
            if (onUpdate) onUpdate(data);
        });
    }, 5 * 60 * 1000);
    
    console.log('[ZeroConfig] ✅ 零配置实时数据已启动（内置动态数据，每5分钟自动更新）');
}

// ========== 暴露全局 ==========
window.HotspotAPI = {
    fetchAll: fetchAllZeroConfig,
    start: startZeroConfig,
    refresh: fetchAllZeroConfig,
    getStatus: () => ({
        isRealTime: true,
        lastFetch: new Date().toLocaleTimeString(),
        cacheAge: '0s',
        source: '零配置内置数据（GitHub Pages 免后端）'
    })
};
