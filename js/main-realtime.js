/**
 * ============================================================================
 *  main-realtime.js — 实时数据 → UI 绑定（GitHub Pages 版）
 * ============================================================================
 *  
 *  职责：
 *  1. 启动 HotspotAPI 轮询
 *  2. 数据更新 → 重新渲染列表 / 图表 / 地图
 *  3. 右上角数据源状态指示器
 *  4. 地图控件区"🔄 刷新"按钮
 *  
 *  不需要修改 main.js，此文件独立工作。
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // 等 main.js 初始化完成后再启动
    setTimeout(initRealtime, 100);
});

// ========== 初始化 ==========
function initRealtime() {
    if (!window.HotspotAPI) {
        console.warn('[Realtime] HotspotAPI 未加载');
        return;
    }
    
    // 启动轮询
    HotspotAPI.start(onDataUpdate);
    
    // UI 元素
    addDataSourceIndicator();
    addRefreshButton();
    
    console.log('[Realtime] ✅ 实时数据集成已启动');
}

// ========== 数据更新回调（核心） ==========
function onDataUpdate(data) {
    console.log(`[Realtime] 📡 数据更新 (实时:${data.isRealTime}, 世界:${data.world?.length}, 国内:${data.china?.length})`);
    
    // 1. 更新全局数据（Tab 切换时用）
    if (data.world?.length > 0) window.windowHotspots = data.world;
    if (data.china?.length > 0) window.chinaHotspots = data.china;
    
    // 2. 重新渲染当前视图
    safeCall('renderHotspotList');
    safeCall('updateCharts');
    safeCall('renderHotspots');
    safeCall('renderFlyLines');
    safeCall('animateKPI');
    
    // 3. 更新状态指示器
    updateDataSourceIndicator(data);
    
    // 4. 事件流
    updateEventStream(data);
}

function safeCall(fnName) {
    if (typeof window[fnName] === 'function') window[fnName]();
}

// ========== 数据源状态指示器 ==========
function addDataSourceIndicator() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight || document.querySelector('.data-source-indicator')) return;
    
    const el = document.createElement('div');
    el.className = 'data-source-indicator';
    el.innerHTML = '<span class="ds-dot"></span><span class="ds-text">连接中...</span>';
    headerRight.prepend(el);
    
    ensureStyle();
}

function ensureStyle() {
    if (document.getElementById('ds-style')) return;
    const style = document.createElement('style');
    style.id = 'ds-style';
    style.textContent = `
        .data-source-indicator {
            display: flex; align-items: center; gap: 6px;
            padding: 4px 12px; margin-right: 12px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
        }
        .ds-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: var(--orange, #ff9d00); transition: all 0.3s;
        }
        .ds-dot.realtime {
            background: var(--green, #2ed573);
            box-shadow: 0 0 6px var(--green, #2ed573);
            animation: blink 1.5s ease-in-out infinite;
        }
        .ds-text { font-size: 11px; color: var(--text-secondary, #8b9bb4); white-space: nowrap; }
        .hotspot-source {
            display: inline-flex; align-items: center; justify-content: center;
            min-width: 16px; height: 16px; padding: 0 3px;
            border-radius: 3px; font-size: 9px; font-weight: 700;
            background: rgba(79,172,254,0.15); color: var(--blue, #4facfe); flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
}

function updateDataSourceIndicator(data) {
    const dot = document.querySelector('.ds-dot');
    const text = document.querySelector('.ds-text');
    if (!dot || !text) return;
    
    if (data.isRealTime) {
        dot.classList.add('realtime');
        const status = HotspotAPI.getStatus();
        text.textContent = `● 实时 (${data.provider?.china || data.source || 'API'})`;
        text.style.color = 'var(--green, #2ed573)';
    } else {
        dot.classList.remove('realtime');
        text.textContent = '○ 离线 (Mock)';
        text.style.color = 'var(--text-muted, #5a6a80)';
    }
}

// ========== 刷新按钮 ==========
function addRefreshButton() {
    const controls = document.querySelector('.map-controls');
    if (!controls || document.querySelector('.refresh-btn')) return;
    
    const btn = document.createElement('button');
    btn.className = 'map-btn refresh-btn';
    btn.innerHTML = '🔄 刷新';
    btn.onclick = () => {
        btn.style.opacity = '0.5';
        btn.disabled = true;
        HotspotAPI.refresh().then(data => {
            onDataUpdate(data);
            btn.style.opacity = '1';
            btn.disabled = false;
        }).catch(() => {
            btn.style.opacity = '1';
            btn.disabled = false;
        });
    };
    controls.appendChild(btn);
}

// ========== 事件流更新 ==========
function updateEventStream(data) {
    const list = document.getElementById('stream-list');
    if (!list) return;
    
    const items = [
        ...(data.world || []).slice(0, 3),
        ...(data.china || []).slice(0, 3)
    ].sort((a, b) => (b.heat || 0) - (a.heat || 0));
    
    if (items.length === 0) return;
    
    const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    
    items.forEach(item => {
        const tag = (item.source && /HN|Reddit|world/i.test(item.source)) ? 'world' : 'china';
        const el = document.createElement('div');
        el.className = 'stream-item';
        el.innerHTML = `
            <span class="stream-time">${now}</span>
            <span class="stream-tag ${tag}">${tag === 'world' ? '世界' : '国内'}</span>
            <span class="stream-text">${item.title}</span>
        `;
        list.prepend(el);
    });
    
    while (list.children.length > 8) list.removeChild(list.lastChild);
}
