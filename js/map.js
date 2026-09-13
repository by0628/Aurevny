/**
 * 地图模块 - 基于 Leaflet + OpenStreetMap
 * 支持：矢量地图 / 卫星地图切换、热点标注、飞线、点击定位
 */

let map = null;
let currentLayer = null;
let markerLayer = null;
let flyLineLayer = null;
let currentMode = 'osm'; // 'osm' | 'satellite'

// CartoDB 暗色风格（更酷）
const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap · © CARTO',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
});

// Esri 卫星地图
const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri · Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community',
    maxZoom: 18
});

// 标注层（卫星模式下叠加暗色标签）
const labelLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
    opacity: 0.7
});

// 自定义图标
function createHotspotIcon(hotspot) {
    const levelColors = {
        critical: '#ff4757',
        major: '#ff9d00',
        normal: '#00f5d4'
    };
    const color = levelColors[hotspot.level] || '#00f5d4';
    const size = hotspot.level === 'critical' ? 20 : hotspot.level === 'major' ? 16 : 12;
    
    return L.divIcon({
        className: 'hotspot-marker',
        html: `
            <div class="marker-wrapper" style="--size:${size}px; --color:${color};">
                <div class="marker-pulse"></div>
                <div class="marker-dot"></div>
                <div class="marker-ring"></div>
            </div>
        `,
        iconSize: [size * 3, size * 3],
        iconAnchor: [size * 1.5, size * 1.5]
    });
}

// 计算贝塞尔曲线点
function getBezierPoints(start, end, segments = 32) {
    // 计算控制点（垂直于连线的偏移）
    const dx = end[1] - start[1];
    const dy = end[0] - start[0];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    
    // 偏移量与距离成正比
    const offset = Math.min(dist * 0.25, 15);
    const ctrl = [
        mid[0] + (-dy / (dist || 1)) * offset,
        mid[1] + (dx / (dist || 1)) * offset
    ];
    
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const mt = 1 - t;
        const lat = mt * mt * start[0] + 2 * mt * t * ctrl[0] + t * t * end[0];
        const lng = mt * mt * start[1] + 2 * mt * t * ctrl[1] + t * t * end[1];
        points.push([lat, lng]);
    }
    return points;
}

// 初始化地图
function initMap() {
    const defaultView = currentTab === 'world' 
        ? [20, 0] 
        : [35.0, 105.0];
    const defaultZoom = currentTab === 'world' ? 2 : 4;
    
    map = L.map('map-container', {
        center: defaultView,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: true,
        preferCanvas: true
    });
    
    // 初始暗色图层
    currentLayer = darkLayer;
    currentLayer.addTo(map);
    
    // 图层组
    markerLayer = L.layerGroup().addTo(map);
    flyLineLayer = L.layerGroup().addTo(map);
    
    // 缩放控件
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    // 渲染
    renderHotspots();
    renderFlyLines();
    
    // 注入 CSS
    injectMarkerCSS();
}

// Marker 动画 CSS
function injectMarkerCSS() {
    if (document.getElementById('marker-style')) return;
    
    const style = document.createElement('style');
    style.id = 'marker-style';
    style.textContent = `
        .hotspot-marker {
            background: none !important;
            border: none !important;
        }
        .marker-wrapper {
            position: relative;
            width: var(--size);
            height: var(--size);
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        .marker-dot {
            position: absolute;
            width: var(--size);
            height: var(--size);
            background: var(--color);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 8px var(--color), 0 0 16px var(--color);
            z-index: 3;
            transition: transform 0.2s;
        }
        .marker-pulse {
            position: absolute;
            width: var(--size);
            height: var(--size);
            background: var(--color);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            animation: markerPulse 2s ease-out infinite;
            opacity: 0.6;
            z-index: 1;
        }
        .marker-ring {
            position: absolute;
            width: calc(var(--size) * 2);
            height: calc(var(--size) * 2);
            border: 2px solid var(--color);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            animation: markerRing 2s ease-out infinite;
            opacity: 0;
            z-index: 2;
        }
        @keyframes markerPulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes markerRing {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .hotspot-marker:hover .marker-dot {
            transform: translate(-50%, -50%) scale(1.5);
        }
        .hotspot-tooltip {
            background: rgba(16,22,38,0.95) !important;
            color: #e0e8f5 !important;
            border: 1px solid rgba(0,245,212,0.3) !important;
            border-radius: 6px !important;
            font-size: 11px !important;
            backdrop-filter: blur(8px);
        }
        .hotspot-tooltip::before {
            border-top-color: rgba(16,22,38,0.95) !important;
        }
        .fly-line-path {
            stroke-dasharray: 8, 6;
            animation: flyLineFlow 3s linear infinite;
        }
        @keyframes flyLineFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -56; }
        }
    `;
    document.head.appendChild(style);
}

// 渲染热点标记
function renderHotspots() {
    if (!markerLayer) return;
    markerLayer.clearLayers();
    
    const hotspots = getCurrentHotspots();
    
    hotspots.forEach(hotspot => {
        const icon = createHotspotIcon(hotspot);
        const marker = L.marker([hotspot.lat, hotspot.lng], { icon });
        
        marker.on('click', () => {
            showEventPopup(hotspot);
            highlightHotspotItem(hotspot.id);
        });
        
        marker.on('mouseover', (e) => {
            marker.bindTooltip(hotspot.title, {
                direction: 'top',
                offset: [0, -15],
                className: 'hotspot-tooltip',
                opacity: 0.95
            }).openTooltip();
        });
        
        markerLayer.addLayer(marker);
    });
}

// 渲染飞线（贝塞尔曲线）
function renderFlyLines() {
    if (!flyLineLayer) return;
    flyLineLayer.clearLayers();
    
    const hotspots = getCurrentHotspots().slice(0, 6);
    const center = currentTab === 'world' 
        ? [51.5074, -0.1278]
        : [39.9042, 116.4074];
    
    hotspots.forEach(hotspot => {
        const start = center;
        const end = [hotspot.lat, hotspot.lng];
        const points = getBezierPoints(start, end);
        
        const color = hotspot.level === 'critical' ? '#ff4757' : 
                      hotspot.level === 'major' ? '#ff9d00' : '#00f5d4';
        const weight = hotspot.level === 'critical' ? 3 : 2;
        
        const polyline = L.polyline(points, {
            color: color,
            weight: weight,
            opacity: 0.8,
            className: 'fly-line-path',
            smoothFactor: 1
        });
        
        flyLineLayer.addLayer(polyline);
    });
}

// 切换地图模式
function switchMapMode(mode) {
    if (!map) return;
    currentMode = mode;
    
    if (currentLayer) map.removeLayer(currentLayer);
    map.removeLayer(labelLayer);
    
    if (mode === 'satellite') {
        currentLayer = satelliteLayer;
        map.addLayer(currentLayer);
        map.addLayer(labelLayer);
    } else {
        currentLayer = darkLayer;
        map.addLayer(currentLayer);
    }
}

// 定位到事件
function locateEvent(hotspot) {
    if (!map) return;
    
    map.flyTo([hotspot.lat, hotspot.lng], 7, {
        duration: 1.5,
        easeLinearity: 0.25
    });
    
    setTimeout(() => {
        showEventPopup(hotspot);
    }, 800);
}

// Tab 切换时更新地图
function updateMapView() {
    if (!map) return;
    
    const view = currentTab === 'world' 
        ? [20, 0] 
        : [35.0, 105.0];
    const zoom = currentTab === 'world' ? 2 : 4;
    
    map.flyTo(view, zoom, { duration: 1.2 });
    
    setTimeout(() => {
        renderHotspots();
        renderFlyLines();
    }, 500);
}

// 点击列表项 → 定位
function focusOnHotspot(id) {
    const hotspots = getCurrentHotspots();
    const hotspot = hotspots.find(h => h.id === id);
    if (hotspot) {
        locateEvent(hotspot);
        // 手机端自动切换到地图视图
        if (window.innerWidth <= 768) {
            const mapBtn = document.querySelector('.mobile-nav-btn[data-view="map"]');
            if (mapBtn) mapBtn.click();
        }
    }
}
