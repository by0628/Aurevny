/**
 * ============================================================================
 *  api-github.js — GitHub Pages 专用实时数据层（方案B 最终版）
 * ============================================================================
 *  
 *  数据流优先级：
 *    ① hotspots-snapshot.json (GitHub Actions 定时生成，最可靠)
 *    ② api.vvhan.com 直连 (百度/知乎/微博热搜)
 *    ③ CORS 代理 (allorigins.win / corsproxy.io)
 *    ④ Hacker News Firebase API (世界热点)
 *    ⑤ 内置 Mock 数据 (永远兜底)
 *  
 *  世界热点：Hacker News + Reddit
 *  国内热点：百度热搜 + 知乎热榜 + 微博热搜
 *  
 *  每 5 分钟自动刷新，localStorage 离线缓存
 *  
 * ============================================================================
 */

// ========== 配置 ==========
const GH = {
    // 国内热榜
    chinaProviders: [
        {
            name: 'vvhan-direct',
            baidu:  'https://api.vvhan.com/api/hotlist?type=baiduRD',
            zhihu:  'https://api.vvhan.com/api/hotlist?type=zhihuHot',
            weibo:  'https://api.vvhan.com/api/hotlist?type=wbHot',
        },
        {
            name: 'allorigins',
            baidu:  'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.vvhan.com/api/hotlist?type=baiduRD'),
            zhihu:  'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.vvhan.com/api/hotlist?type=zhihuHot'),
            weibo:  'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.vvhan.com/api/hotlist?type=wbHot'),
        },
        {
            name: 'corsproxy',
            baidu:  'https://corsproxy.io/?url=' + encodeURIComponent('https://api.vvhan.com/api/hotlist?type=baiduRD'),
            zhihu:  'https://corsproxy.io/?url=' + encodeURIComponent('https://api.vvhan.com/api/hotlist?type=zhihuHot'),
            weibo:  'https://corsproxy.io/?url=' + encodeURIComponent('https://api.vvhan.com/api/hotlist?type=wbHot'),
        }
    ],
    
    // 世界热点
    worldSources: [
        { name: 'hn-direct',  ids: 'https://hacker-news.firebaseio.com/v0/topstories.json',  item: 'https://hacker-news.firebaseio.com/v0/item/{id}.json' },
        { name: 'hn-allorigins', ids: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://hacker-news.firebaseio.com/v0/topstories.json'), item: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://hacker-news.firebaseio.com/v0/item/{id}.json') },
        { name: 'reddit', url: 'https://www.reddit.com/r/worldnews/top.json?limit=15&t=day' }
    ],
    
    snapshotUrl: './hotspots-snapshot.json',
    refreshMs: 5 * 60 * 1000,
    timeoutMs: 10000,
    cacheKey: 'hotspot_cache_v2'
};

// ========== 工具函数 ==========
function fetchJSON(url) {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), GH.timeoutMs);
    return fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
}

function parseVvhan(data) {
    const out = [];
    if (!data || !data.data) return out;
    const groups = Array.isArray(data.data) ? data.data : [data.data];
    groups.forEach(g => {
        (g.data || g.list || []).forEach((it, i) => {
            if (!it.title && !it.word) return;
            out.push({
                title: it.title || it.word || it.name || '',
                heat: parseInt(it.hot) || parseInt(it.num) || parseInt(it.index) * 10000 || 0,
                url: it.url || it.mobile_url || '',
                rank: it.index || i + 1,
                source: g.name || '热榜'
            });
        });
    });
    return out;
}

function toHotspot(raw, i, scope, source) {
    const title = raw.title || '';
    const heat = raw.heat || (1000000 - i * 10000);
    const loc = geoCode(title);
    return {
        id: source + '_' + i + '_' + Date.now(),
        title, category: cat(title), lat: loc.lat, lng: loc.lng, city: loc.city,
        heat: Math.round(heat / 10000), trend: i % 3 === 0 ? 'down' : 'up',
        trendVal: (i * 7) % 20 + 1,
        level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
        spread: Math.round(heat / 10000 * 1.3) + '万',
        sentiment: sent(title), time: new Date().toLocaleString('zh-CN', { hour12: false }),
        desc: title + '\n来源: ' + (raw.source || source),
        source: raw.source || source, url: raw.url || '', rank: raw.rank || i + 1
    };
}

function dedupe(items) {
    const seen = new Set();
    return items.filter(it => {
        const k = (it.title || '').substr(0, 15);
        if (seen.has(k)) return false;
        seen.add(k); return true;
    });
}

// ========== 地理编码 ==========
function geoCode(title) {
    const map = {
        '北京':[39.9042,116.4074,'北京'],'上海':[31.2304,121.4737,'上海'],'广州':[23.1291,113.2644,'广州'],
        '深圳':[22.5431,114.0579,'深圳'],'杭州':[30.2741,120.1551,'杭州'],'成都':[30.5728,104.0668,'成都'],
        '武汉':[30.55,114.31,'武汉'],'西安':[34.3416,108.9398,'西安'],'南京':[32.0603,118.7969,'南京'],
        '天津':[39.0842,117.201,'天津'],'重庆':[29.4316,106.9123,'重庆'],'苏州':[31.2989,120.5853,'苏州'],
        '厦门':[24.4798,118.0894,'厦门'],'长沙':[28.2282,112.9388,'长沙'],'郑州':[34.7466,113.6253,'郑州'],
        '青岛':[36.0671,120.3826,'青岛'],'沈阳':[41.8057,123.4315,'沈阳'],'大连':[38.914,121.6147,'大连'],
        '哈尔滨':[45.8038,126.535,'哈尔滨'],'昆明':[25.0389,102.7183,'昆明'],'福州':[26.0745,119.2965,'福州'],
        '乌鲁木齐':[43.8256,87.6168,'乌鲁木齐'],'拉萨':[29.6477,91.1179,'拉萨'],'兰州':[36.0611,103.8343,'兰州'],
        '贵阳':[26.647,106.6302,'贵阳'],'南宁':[22.817,108.3665,'南宁'],'济南':[36.6512,117.1201,'济南'],
        '合肥':[31.227,117.169,'合肥'],'南昌':[28.682,115.8579,'南昌'],'太原':[37.8706,112.5489,'太原'],
        '石家庄':[38.0428,114.5149,'石家庄'],'长春':[43.8163,125.3245,'长春'],'大庆':[46.58,125.01,'大庆'],
        '齐齐哈尔':[47.33,123.97,'齐齐哈尔'],'牡丹江':[44.57,129.61,'牡丹江'],'佳木斯':[46.8,130.3,'佳木斯'],
        '美国':[38,-97,'美国'],'华盛顿':[38.9072,-77.0369,'华盛顿'],'纽约':[40.7128,-74.006,'纽约'],
        '洛杉矶':[34.0522,-118.2437,'洛杉矶'],'英国':[51.5,-0.12,'英国'],'伦敦':[51.5074,-0.1278,'伦敦'],
        '日本':[36,138,'日本'],'东京':[35.6762,139.6503,'东京'],'大阪':[34.6937,135.5023,'大阪'],
        '韩国':[35.5,127.5,'韩国'],'首尔':[37.5665,126.978,'首尔'],'法国':[46,2,'法国'],
        '巴黎':[48.8566,2.3522,'巴黎'],'德国':[51,9,'德国'],'柏林':[52.52,13.405,'柏林'],
        '俄罗斯':[55,37,'俄罗斯'],'莫斯科':[55.7558,37.6173,'莫斯科'],'印度':[20,77,'印度'],
        '澳大利亚':[-25,133,'澳大利亚'],'悉尼':[-33.8688,151.2093,'悉尼'],'新加坡':[1.3521,103.8198,'新加坡'],
        '台湾':[23.6978,120.9605,'台北'],'香港':[22.3193,114.1694,'香港'],'澳门':[22.1987,113.5439,'澳门'],
        '以色列':[31.0461,34.8516,'以色列'],'伊朗':[32,53,'伊朗'],'乌克兰':[50,30,'乌克兰'],
        '巴西':[-10,-55,'巴西'],'非洲':[0,20,'非洲'],'东南亚':[5,105,'东南亚']
    };
    
    for (const [k, v] of Object.entries(map)) {
        if (title.includes(k)) return { lat: v[0], lng: v[1], city: v[2] };
    }
    
    // 国际推断
    if (/美国|拜登|特朗普|华盛顿|纽约|加州|硅谷|华尔街/.test(title)) return { lat: 38, lng: -97, city: '美国' };
    if (/英国|伦敦|英镑|苏格兰|UK /.test(title)) return { lat: 51.5, lng: -0.12, city: '英国' };
    if (/日本|东京|大阪|日元|安倍/.test(title)) return { lat: 36, lng: 138, city: '日本' };
    if (/韩国|首尔|三星|韩元/.test(title)) return { lat: 35.5, lng: 127.5, city: '韩国' };
    if (/俄罗斯|莫斯科|普京/.test(title)) return { lat: 55, lng: 37, city: '俄罗斯' };
    if (/欧盟|欧洲|德国|法国|意大利|西班牙/.test(title)) return { lat: 50, lng: 10, city: '欧洲' };
    if (/中东|以色列|伊朗|沙特/.test(title)) return { lat: 29, lng: 41, city: '中东' };
    if (/印度|孟买|新德里/.test(title)) return { lat: 20, lng: 77, city: '印度' };
    
    return { lat: 35, lng: 105, city: '全国/未定位' };
}

function cat(title) {
    const rules = {
        '科技': ['AI','人工智能','芯片','手机','华为','苹果','特斯拉','GPT','量子','算法','软件','云计算','区块链'],
        '经济': ['股市','经济','金融','央行','降息','通胀','GDP','贸易','关税','汇率','房价','人民币'],
        '政治': ['政府','政策','总统','总理','外交','联合国','选举','法案','制裁','谈判'],
        '灾害': ['地震','台风','洪水','大火','爆炸','事故','伤亡','遇难','灾害','火灾','暴雨'],
        '健康': ['疫情','病毒','确诊','疫苗','医院','医生','病例','感染','疾病','治疗'],
        '体育': ['比赛','夺冠','冠军','球队','球员','足球','篮球','奥运','世界杯','联赛'],
        '娱乐': ['明星','演员','歌手','电影','综艺','票房','演唱会','粉丝','恋情'],
        '教育': ['高考','学校','大学','学生','教师','教育','考研','毕业'],
        '军事': ['军队','军事','武器','导弹','国防','演习','战争'],
        '环境': ['气候','环保','碳排放','污染','生态','冰川'],
    };
    for (const [c, kws] of Object.entries(rules)) {
        for (const kw of kws) if (title.includes(kw)) return c;
    }
    return '社会';
}

function sent(title) {
    const neg = ['死亡','遇难','事故','爆炸','地震','灾害','犯罪','诈骗','贪腐','亏损','裁员','暴跌'];
    const pos = ['成功','突破','创新','获奖','夺冠','上市','增长','合作','利好','通车','暴涨'];
    for (const w of neg) if (title.includes(w)) return 'negative';
    for (const w of pos) if (title.includes(w)) return 'positive';
    return 'neutral';
}

// ========== ① 快照文件 ==========
async function loadSnapshot() {
    try {
        const data = await fetchJSON(GH.snapshotUrl + '?t=' + Date.now());
        if (!data || !data.timestamp) throw new Error('Invalid snapshot');
        
        const world = (data.world || []).slice(0, 12).map((it, i) => ({
            id: 'snap_w_' + i, title: it.title, category: cat(it.title),
            lat: 37.7749 + (Math.random() - 0.5) * 30, lng: -122.4194 + (Math.random() - 0.5) * 60,
            city: inferLoc(it.title), heat: it.score || it.heat || 500,
            trend: i < 5 ? 'up' : 'down', trendVal: Math.floor(Math.random() * 20) + 1,
            level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
            spread: Math.floor((it.score || 500) * 1.5) + '', sentiment: sent(it.title),
            time: new Date((it.time || Date.now() / 1000) * 1000).toLocaleString('zh-CN', { hour12: false }),
            desc: it.title, source: it.source || '快照数据', url: it.url || '', rank: i + 1
        }));
        
        const china = (data.china || []).slice(0, 12).map((it, i) => ({
            id: 'snap_c_' + i, title: it.title, category: cat(it.title),
            lat: 35 + (Math.random() - 0.5) * 15, lng: 105 + (Math.random() - 0.5) * 20,
            city: inferLoc(it.title), heat: Math.round((it.hot || it.heat || 100000) / 10000),
            trend: i < 5 ? 'up' : 'down', trendVal: Math.floor(Math.random() * 20) + 1,
            level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
            spread: Math.round((it.hot || 100000) / 10000 * 1.3) + '万', sentiment: sent(it.title),
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
            desc: it.title, source: it.source || '百度热搜', url: it.url || '', rank: i + 1
        }));
        
        return { world, china, timestamp: data.timestamp, isRealTime: true, source: 'snapshot' };
    } catch (e) {
        return null; // 快照不存在，继续走 API
    }
}

function inferLoc(title) {
    const map = {
        '北京':'北京','上海':'上海','广州':'广州','深圳':'深圳','杭州':'杭州','成都':'成都',
        '美国':'美国','日本':'日本','英国':'英国','韩国':'韩国','法国':'法国','德国':'德国'
    };
    for (const [k, v] of Object.entries(map)) if (title.includes(k)) return v;
    return '未定位';
}

// ========== ② 国内热点 ==========
async function fetchChina() {
    for (const p of GH.chinaProviders) {
        try {
            const [baidu, zhihu, weibo] = await Promise.allSettled([
                fetchJSON(p.baidu), fetchJSON(p.zhihu), fetchJSON(p.weibo)
            ]);
            
            const all = [];
            if (baidu.status === 'fulfilled') all.push(...parseVvhan(baidu.value).map((it, i) => toHotspot(it, i, 'china', 'baidu')));
            if (zhihu.status === 'fulfilled') all.push(...parseVvhan(zhihu.value).map((it, i) => toHotspot(it, i, 'china', 'zhihu')));
            if (weibo.status === 'fulfilled') all.push(...parseVvhan(weibo.value).map((it, i) => toHotspot(it, i, 'china', 'weibo')));
            
            if (all.length > 0) {
                console.log('[API] ✅ 国内热点来源:', p.name, `(${all.length}条)`);
                return { data: dedupe(all).slice(0, 12), provider: p.name };
            }
        } catch (e) { /* try next */ }
    }
    return null;
}

// ========== ③ 世界热点 ==========
async function fetchWorld() {
    for (const src of GH.worldSources) {
        try {
            if (src.ids) {
                // Hacker News
                const ids = await fetchJSON(src.ids);
                if (!Array.isArray(ids) || ids.length === 0) continue;
                
                const items = [];
                for (let i = 0; i < Math.min(ids.length, 20); i += 5) {
                    const batch = ids.slice(i, i + 5);
                    const results = await Promise.allSettled(
                        batch.map(id => fetchJSON(src.item.replace('{id}', id)))
                    );
                    results.forEach(r => { if (r.status === 'fulfilled' && r.value && r.value.title) items.push(r.value); });
                }
                
                if (items.length > 0) {
                    console.log('[API] ✅ 世界热点来源:', src.name, `(${items.length}条)`);
                    return {
                        data: items.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 12).map((it, i) => ({
                            id: 'hn_' + it.id, title: it.title, category: cat(it.title),
                            lat: 37.7749 + (Math.random() - 0.5) * 30, lng: -122.4194 + (Math.random() - 0.5) * 60,
                            city: inferLoc(it.title), heat: it.score || 500,
                            trend: i < 5 ? 'up' : 'down', trendVal: Math.floor(Math.random() * 20) + 1,
                            level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
                            spread: Math.floor((it.score || 500) * 1.5) + '', sentiment: sent(it.title),
                            time: new Date((it.time || Date.now() / 1000) * 1000).toLocaleString('zh-CN', { hour12: false }),
                            desc: it.title, source: 'Hacker News', url: it.url || ('https://news.ycombinator.com/item?id=' + it.id), rank: i + 1
                        })),
                        provider: src.name
                    };
                }
            } else if (src.url) {
                // Reddit
                const data = await fetchJSON(src.url);
                const posts = data?.data?.children || [];
                if (posts.length > 0) {
                    console.log('[API] ✅ 世界热点来源:', src.name, `(${posts.length}条)`);
                    return {
                        data: posts.slice(0, 12).map((p, i) => {
                            const d = p.data;
                            return {
                                id: 'reddit_' + d.id, title: d.title, category: cat(d.title),
                                lat: 37.7749 + (Math.random() - 0.5) * 30, lng: -122.4194 + (Math.random() - 0.5) * 60,
                                city: inferLoc(d.title), heat: d.score || 500,
                                trend: i < 5 ? 'up' : 'down', trendVal: Math.floor(Math.random() * 20) + 1,
                                level: i < 3 ? 'critical' : i < 8 ? 'major' : 'normal',
                                spread: Math.floor((d.score || 500) * 1.5) + '', sentiment: sent(d.title),
                                time: new Date(d.created_utc * 1000).toLocaleString('zh-CN', { hour12: false }),
                                desc: d.title, source: 'Reddit', url: d.url || ('https://reddit.com' + d.permalink), rank: i + 1
                            };
                        }),
                        provider: src.name
                    };
                }
            }
        } catch (e) { /* try next */ }
    }
    return null;
}

// ========== 主入口 ==========
async function fetchAllHotspots() {
    const cached = loadCache();
    const now = Date.now();
    
    // 缓存有效期内直接返回
    if (cached && cached.timestamp && (now - cached.timestamp) < GH.refreshMs) {
        return { ...cached, fromCache: true };
    }
    
    // 尝试快照
    const snapshot = await loadSnapshot();
    if (snapshot && snapshot.world.length > 0) {
        saveCache(snapshot);
        return snapshot;
    }
    
    // 尝试 API
    const [world, china] = await Promise.all([fetchWorld(), fetchChina()]);
    
    const result = {
        world: world ? world.data : (cached?.world || getMock('world')),
        china: china ? china.data : (cached?.china || getMock('china')),
        timestamp: now,
        isRealTime: !!(world || china),
        provider: { world: world?.provider || 'cache', china: china?.provider || 'cache' }
    };
    
    saveCache(result);
    return result;
}

function getMock(scope) {
    return scope === 'world' ? (window.windowHotspots || []) : (window.chinaHotspots || []);
}

// ========== 缓存 ==========
function saveCache(data) {
    try {
        localStorage.setItem(GH.cacheKey, JSON.stringify({
            world: data.world, china: data.china, timestamp: data.timestamp
        }));
    } catch (e) {}
}

function loadCache() {
    try {
        const raw = localStorage.getItem(GH.cacheKey);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

// ========== 轮询 ==========
let _timer = null;
function startPolling(onUpdate) {
    fetchAllHotspots().then(data => onUpdate && onUpdate(data));
    if (_timer) clearInterval(_timer);
    _timer = setInterval(() => fetchAllHotspots().then(data => onUpdate && onUpdate(data)), GH.refreshMs);
    console.log(`[API] 实时轮询已启动 (${GH.refreshMs / 1000}s)`);
}

// ========== 暴露全局 ==========
window.HotspotAPI = {
    fetchAll: fetchAllHotspots,
    start: startPolling,
    refresh: fetchAllHotspots,
    getStatus: () => {
        const c = loadCache();
        return {
            isRealTime: c ? (Date.now() - c.timestamp < GH.refreshMs) : false,
            lastFetch: c ? new Date(c.timestamp).toLocaleTimeString() : '从未',
            cacheAge: c ? Math.round((Date.now() - c.timestamp) / 1000) + 's' : 'N/A',
            source: 'GitHub Pages (方案B)'
        };
    }
};
