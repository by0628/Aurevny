/**
 * 主控制器 - 初始化、事件绑定、数据流
 */

// ========== DOM 就绪 ==========
document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initParticles();
    initMap();
    initCharts();
    initHotspotList();
    initTabs();
    initMapControls();
    initEventStream();
    initMobileNav();
    initPopup();
    
    // 启动动画
    setTimeout(() => {
        animateKPI();
    }, 500);
    
    // ===== 实时数据集成 =====
    if (window.HotspotAPI) {
        window.onHotspotsUpdated = onHotspotsDataUpdated;
        addDataSourceIndicator();
        HotspotAPI.start();
    }
    
    // 定时更新
    setInterval(updateEventStream, 5000);
    setInterval(updateTrendData, 10000);
    setInterval(updateClock, 1000);
});

// ========== 实时数据更新回调 ==========
function onHotspotsDataUpdated(data) {
    if (data.isRealTime) {
        // 用实时数据替换 Mock
        windowHotspots.length = 0;
        windowHotspots.push(...data.world);
        chinaHotspots.length = 0;
        chinaHotspots.push(...data.china);
    }
    
    // 重新渲染当前视图
    renderHotspotList();
    updateCharts();
    if (typeof renderHotspots === 'function') renderHotspots();
    if (typeof renderFlyLines === 'function') renderFlyLines();
    animateKPI();
    updateDataSourceIndicator(data.isRealTime);
}

// ========== 数据源状态指示器 ==========
function addDataSourceIndicator() {
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    
    if (document.querySelector('.data-source-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'data-source-indicator';
    indicator.innerHTML = `
        <span class="ds-dot"></span>
        <span class="ds-text">连接中...</span>
    `;
    headerRight.prepend(indicator);
    
    if (!document.getElementById('ds-style')) {
        const style = document.createElement('style');
        style.id = 'ds-style';
        style.textContent = `
            .data-source-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 4px 12px;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                margin-right: 12px;
            }
            .ds-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: var(--orange);
                transition: all 0.3s;
            }
            .ds-dot.realtime {
                background: var(--green);
                box-shadow: 0 0 6px var(--green);
                animation: blink 1.5s ease-in-out infinite;
            }
            .ds-text {
                font-size: 11px;
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);
    }
}

function updateDataSourceIndicator(isRealTime) {
    const dot = document.querySelector('.ds-dot');
    const text = document.querySelector('.ds-text');
    if (!dot || !text) return;
    
    if (isRealTime) {
        dot.classList.add('realtime');
        text.textContent = '● 实时数据';
        text.style.color = 'var(--green)';
    } else {
        dot.classList.remove('realtime');
        text.textContent = '○ 离线数据';
        text.style.color = 'var(--text-muted)';
    }
}

// ========== 时钟 ==========
function initClock() {
    updateClock();
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const dateStr = now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        weekday: 'short'
    });
    
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    if (clockEl) clockEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;
}

// ========== 背景粒子 ==========
function initParticles() {
    const canvas = document.getElementById('bg-particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticlesArray();
    }
    
    function initParticlesArray() {
        const count = Math.min(Math.floor(window.innerWidth / 20), 80);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 245, 212, ${p.opacity})`;
            ctx.fill();
        });
        
        // 连线
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 245, 212, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        animationId = requestAnimationFrame(draw);
    }
    
    resize();
    draw();
    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationId);
        resize();
        draw();
    });
}

// ========== 热点列表渲染 ==========
function initHotspotList() {
    renderHotspotList();
}

function renderHotspotList() {
    const container = document.getElementById('hotspot-list');
    const hotspots = getCurrentHotspots();
    const badge = document.getElementById('hotspot-count');
    
    if (badge) badge.textContent = hotspots.length;
    
    container.innerHTML = hotspots.map((h, i) => {
        const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : 'normal';
        const trendIcon = h.trend === 'up' ? '↑' : '↓';
        const catColors = {
            '政治': '#a855f7', '科技': '#00f5d4', '经济': '#ff9d00',
            '灾害': '#ff4757', '社会': '#4facfe', '环境': '#2ed573',
            '基建': '#06b6d4', '政策': '#a855f7', '能源': '#ff9d00',
            '文化': '#c084fc', '民生': '#f472b6'
        };
        const catColor = catColors[h.category] || '#4facfe';
        
        const sourceBadge = h.source ? `<span class="hotspot-source">${h.source.includes('微博') ? '微' : h.source.includes('知乎') ? '知' : '实'}</span>` : '';
        
        return `
            <div class="hotspot-item" data-id="${h.id}" onclick="onHotspotClick('${h.id}')">
                <div class="hotspot-item-row">
                    <span class="hotspot-rank ${rankClass}">${i + 1}</span>
                    <div class="hotspot-info">
                        <div class="hotspot-title">${h.title}</div>
                        <div class="hotspot-meta">
                            <span class="hotspot-cat" style="color:${catColor};background:${catColor}20">${h.category}</span>
                            <span class="hotspot-heat">🔥 ${h.heat}万</span>
                            <span class="hotspot-trend ${h.trend}" style="color:${h.trend === 'up' ? '#ff4757' : '#2ed573'}">${trendIcon}${h.trendVal}%</span>
                            ${sourceBadge}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== 点击热点 ==========
function onHotspotClick(id) {
    const hotspots = getCurrentHotspots();
    const hotspot = hotspots.find(h => h.id === id);
    if (hotspot) {
        // 定位地图
        focusOnHotspot(id);
        // 高亮列表项
        highlightHotspotItem(id);
    }
}

function highlightHotspotItem(id) {
    document.querySelectorAll('.hotspot-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.id === id) {
            el.classList.add('active');
        }
    });
}

// ========== Tab 切换 ==========
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentTab = tab.dataset.tab;
            
            // 更新列表
            renderHotspotList();
            // 更新图表
            updateCharts();
            // 更新地图
            updateMapView();
            // 重新定位
            setTimeout(() => {
                const first = getCurrentHotspots()[0];
                if (first) renderFlyLines();
            }, 600);
        });
    });
}

// ========== 地图控件 ==========
function initMapControls() {
    const btns = document.querySelectorAll('.map-btn[data-map]');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchMapMode(btn.dataset.map);
        });
    });
    
    // 定位按钮
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            const hotspots = getCurrentHotspots();
            const top = hotspots.find(h => h.level === 'critical') || hotspots[0];
            if (top) locateEvent(top);
        });
    }
}

// ========== 事件弹窗 ==========
function initPopup() {
    // 点击地图外部关闭
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.event-popup') && !e.target.closest('.hotspot-marker')) {
            // 不自动关闭，保持展示
        }
    });
}

function showEventPopup(hotspot) {
    const popup = document.getElementById('event-popup');
    if (!popup) return;
    
    // 填充数据
    const levelMap = { critical: '🔴 重大事件', major: '🟠 重要事件', normal: '🟢 一般事件' };
    const sentimentMap = { positive: '正面', neutral: '中性', negative: '负面' };
    const sentimentColor = { positive: '#2ed573', neutral: '#ff9d00', negative: '#ff4757' };
    
    document.getElementById('popup-level').textContent = levelMap[hotspot.level] || '事件';
    document.getElementById('popup-title').textContent = hotspot.title;
    document.getElementById('popup-location').textContent = '📍 ' + hotspot.city;
    document.getElementById('popup-time').textContent = '🕐 ' + hotspot.time;
    document.getElementById('popup-spread').textContent = hotspot.spread;
    
    const sentimentEl = document.getElementById('popup-sentiment');
    sentimentEl.textContent = sentimentMap[hotspot.sentiment];
    sentimentEl.style.color = sentimentColor[hotspot.sentiment];
    
    document.getElementById('popup-desc').textContent = hotspot.desc;
    
    // 显示动画
    popup.classList.add('show');
    
    // 更新仪表盘
    const attention = Math.min(95, hotspot.heat / 10 + Math.random() * 10);
    const spread = Math.min(98, hotspot.heat / 8 + Math.random() * 5);
    charts.gaugeAttention.setOption({
        series: [{ data: [{ value: Math.round(attention) }] }]
    });
    charts.gaugeSpread.setOption({
        series: [{ data: [{ value: Math.round(spread) }] }]
    });
}

function closePopup() {
    const popup = document.getElementById('event-popup');
    if (popup) popup.classList.remove('show');
}

// ========== 事件流 ==========
function initEventStream() {
    renderEventStream();
}

function renderEventStream() {
    const container = document.getElementById('stream-list');
    const streams = generateEventStream();
    
    container.innerHTML = streams.map(s => `
        <div class="stream-item">
            <span class="stream-time">${new Date().toLocaleTimeString('zh-CN', { hour12: false })}</span>
            <span class="stream-tag ${s.tag}">${s.tag === 'world' ? '世界' : '国内'}</span>
            <span class="stream-text">${s.text}</span>
        </div>
    `).join('');
}

function updateEventStream() {
    const container = document.getElementById('stream-list');
    if (!container) return;
    
    const streams = generateEventStream();
    const random = streams[Math.floor(Math.random() * streams.length)];
    const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    
    const item = document.createElement('div');
    item.className = 'stream-item';
    item.innerHTML = `
        <span class="stream-time">${now}</span>
        <span class="stream-tag ${random.tag}">${random.tag === 'world' ? '世界' : '国内'}</span>
        <span class="stream-text">${random.text}</span>
    `;
    
    container.prepend(item);
    
    // 保持最多 8 条
    while (container.children.length > 8) {
        container.removeChild(container.lastChild);
    }
}

// ========== 趋势数据更新 ==========
function updateTrendData() {
    const trendData = generateTrendData();
    if (charts.trend && !charts.trend.isDisposed()) {
        charts.trend.setOption({
            xAxis: { data: trendData.hours },
            series: [
                { data: trendData.total },
                { data: trendData.positive },
                { data: trendData.negative }
            ]
        });
    }
}

// ========== 手机端导航 ==========
function initMobileNav() {
    const btns = document.querySelectorAll('.mobile-nav-btn');
    const sections = [
        { btn: 'map', selector: '.center-panel' },
        { btn: 'hotspots', selector: '.left-panel' },
        { btn: 'charts', selector: '.right-panel' }
    ];
    
    // 包裹左右栏为视图区域
    wrapMobileViews();
    
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            sections.forEach(s => {
                const el = document.querySelector(s.selector);
                if (!el) return;
                if (s.btn === view) {
                    el.classList.add('mobile-view-active');
                } else {
                    el.classList.remove('mobile-view-active');
                }
            });
            
            // 触发图表重绘
            setTimeout(handleResize, 350);
        });
    });
}

function wrapMobileViews() {
    // 添加移动端视图切换的 CSS
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .left-panel, .center-panel, .right-panel {
                display: none;
            }
            .left-panel.mobile-view-active,
            .center-panel.mobile-view-active,
            .right-panel.mobile-view-active {
                display: block;
            }
            .center-panel.mobile-view-active {
                display: block !important;
            }
            .mobile-view-active {
                animation: fadeInUp 0.3s ease;
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        }
    `;
    document.head.appendChild(style);
    
    // 默认显示地图
    const centerPanel = document.querySelector('.center-panel');
    if (centerPanel) centerPanel.classList.add('mobile-view-active');
}
