/**
 * Snapshot Loader - 读取 GitHub Actions 生成的快照数据
 * 
 * 如果开启了 GitHub Actions 定时任务（.github/workflows/update-hotspots.yml），
 * 页面会优先读取 hotspots-snapshot.json，避免 CORS 问题。
 * 
 * 用法：在 index.html 中 api-github.js 之后引入
 *   <script src="js/snapshot-loader.js"></script>
 * 
 * 优先级：快照文件 > 第三方 API > Mock
 */

async function loadSnapshot() {
    try {
        // 加时间戳防止 CDN 缓存
        const url = `./hotspots-snapshot.json?t=${Date.now()}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        
        if (!data.world || !data.china) throw new Error('Invalid snapshot');
        
        console.log('[Snapshot] ✅ 加载快照数据', {
            world: data.world.length,
            china: data.china.length,
            age: Math.round((Date.now() - data.timestamp) / 60000) + 'min'
        });
        
        // 转换为标准格式
        const world = data.world.slice(0, 12).map((item, i) => ({
            id: `snap_w_${i}`,
            title: item.title,
            category: inferCategorySync(item.title),
            lat: 37.7749 + (Math.random() - 0.5) * 30,
            lng: -122.4194 + (Math.random() - 0.5) * 60,
            city: inferLocationSync(item.title),
            heat: item.score || item.heat || (1000 - i * 50),
            trend: i < 5 ? 'up' : 'down',
            trendVal: Math.floor(Math.random() * 20) + 1,
            level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
            spread: Math.floor((item.score || 500) * 1.5) + '',
            sentiment: inferSentimentSync(item.title),
            time: new Date((item.time || Date.now() / 1000) * 1000).toLocaleString('zh-CN', { hour12: false }),
            desc: item.title,
            source: item.source || 'GitHub Actions',
            url: item.url || '',
            rank: i + 1
        }));
        
        const china = data.china.slice(0, 12).map((item, i) => ({
            id: `snap_c_${i}`,
            title: item.title,
            category: inferCategorySync(item.title),
            lat: 35.0 + (Math.random() - 0.5) * 15,
            lng: 105.0 + (Math.random() - 0.5) * 20,
            city: inferLocationSync(item.title),
            heat: Math.round((item.hot || item.heat || 100000) / 10000),
            trend: i < 5 ? 'up' : 'down',
            trendVal: Math.floor(Math.random() * 20) + 1,
            level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
            spread: Math.round((item.hot || 100000) / 10000 * 1.3) + '万',
            sentiment: inferSentimentSync(item.title),
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
            desc: item.title,
            source: item.source || '百度热搜',
            url: item.url || '',
            rank: i + 1
        }));
        
        return { world, china, timestamp: data.timestamp, isRealTime: true, source: 'snapshot' };
        
    } catch (e) {
        console.log('[Snapshot] 无快照文件或加载失败，使用 API 模式');
        return null;
    }
}

// 同步版工具函数（避免依赖 api-github.js 的加载顺序）
function inferCategorySync(title) {
    const rules = {
        '科技': ['AI', '芯片', '手机', '华为', '苹果', 'GPT', '量子'],
        '经济': ['股市', '经济', '金融', '央行', '贸易'],
        '政治': ['政府', '政策', '总统', '外交', '选举'],
        '灾害': ['地震', '台风', '洪水', '火灾', '事故'],
        '健康': ['疫情', '病毒', '疫苗', '医院'],
        '体育': ['比赛', '夺冠', '冠军', '足球', '篮球'],
        '娱乐': ['明星', '电影', '综艺', '演唱会'],
    };
    for (const [cat, kws] of Object.entries(rules)) {
        for (const kw of kws) if (title.includes(kw)) return cat;
    }
    return '社会';
}

function inferSentimentSync(title) {
    const neg = ['死亡', '事故', '爆炸', '灾害', '犯罪'];
    const pos = ['成功', '突破', '获奖', '夺冠', '增长'];
    for (const w of neg) if (title.includes(w)) return 'negative';
    for (const w of pos) if (title.includes(w)) return 'positive';
    return 'neutral';
}

function inferLocationSync(title) {
    const cities = {
        '北京': '北京', '上海': '上海', '广州': '广州', '深圳': '深圳',
        '杭州': '杭州', '成都': '成都', '武汉': '武汉',
        '美国': '美国', '日本': '日本', '英国': '英国', '韩国': '韩国',
    };
    for (const [k, v] of Object.entries(cities)) {
        if (title.includes(k)) return v;
    }
    return '未定位';
}

// 挂载到全局
window.SnapshotLoader = { load: loadSnapshot };
