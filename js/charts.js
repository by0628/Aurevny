/**
 * ECharts 图表模块
 * 包含：情感饼图、24h趋势、词云、分类柱状图、仪表盘
 */

let charts = {};

// ========== 初始化所有图表 ==========
function initCharts() {
    // 情感分布
    charts.sentiment = echarts.init(document.getElementById('sentiment-chart'));
    
    // 趋势
    charts.trend = echarts.init(document.getElementById('trend-chart'));
    
    // 词云
    charts.wordcloud = echarts.init(document.getElementById('wordcloud-chart'));
    
    // 分类
    charts.category = echarts.init(document.getElementById('category-chart'));
    
    // 仪表盘
    charts.gaugeAttention = echarts.init(document.getElementById('gauge-attention'));
    charts.gaugeSpread = echarts.init(document.getElementById('gauge-spread'));
    
    // 渲染
    renderAllCharts();
    
    // 窗口自适应
    window.addEventListener('resize', handleResize);
    
    // 移动端视图切换时也重新渲染
    const observer = new MutationObserver(() => {
        setTimeout(handleResize, 300);
    });
    observer.observe(document.querySelector('.main-content'), { 
        attributes: true, 
        subtree: true 
    });
}

function handleResize() {
    Object.values(charts).forEach(chart => {
        if (chart && !chart.isDisposed()) {
            chart.resize();
        }
    });
}

// ========== 渲染所有图表 ==========
function renderAllCharts() {
    renderSentiment();
    renderTrend();
    renderWordCloud();
    renderCategory();
    renderGauges();
}

// ========== 情感分布（环形图） ==========
function renderSentiment() {
    const data = getSentimentStats();
    
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(16,22,38,0.95)',
            borderColor: 'rgba(0,245,212,0.3)',
            textStyle: { color: '#e0e8f5' },
            formatter: '{b}: {c} ({d}%)'
        },
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 6,
                borderColor: '#0a0e1a',
                borderWidth: 2
            },
            label: {
                color: '#8a9bb5',
                fontSize: 10,
                formatter: '{b}\n{d}%'
            },
            labelLine: {
                length: 8,
                length2: 10,
                lineStyle: { color: 'rgba(255,255,255,0.2)' }
            },
            data: data,
            animationType: 'scale',
            animationEasing: 'elasticOut'
        }]
    };
    
    charts.sentiment.setOption(option);
}

// ========== 24H 热度趋势（面积图） ==========
function renderTrend() {
    const trendData = generateTrendData();
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(16,22,38,0.95)',
            borderColor: 'rgba(0,245,212,0.3)',
            textStyle: { color: '#e0e8f5' },
            axisPointer: { type: 'cross', lineStyle: { color: 'rgba(255,255,255,0.2)' } }
        },
        grid: {
            left: '12%', right: '5%', top: '15%', bottom: '15%'
        },
        xAxis: {
            type: 'category',
            data: trendData.hours,
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            axisLabel: { color: '#5a6a85', fontSize: 9, interval: 3 },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            axisLabel: { color: '#5a6a85', fontSize: 9 }
        },
        series: [
            {
                name: '总声量',
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: trendData.total,
                lineStyle: { color: '#00f5d4', width: 2 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(0,245,212,0.3)' },
                        { offset: 1, color: 'rgba(0,245,212,0)' }
                    ])
                }
            },
            {
                name: '正面',
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: trendData.positive,
                lineStyle: { color: '#2ed573', width: 1.5 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(46,213,115,0.2)' },
                        { offset: 1, color: 'rgba(46,213,115,0)' }
                    ])
                }
            },
            {
                name: '负面',
                type: 'line',
                smooth: true,
                symbol: 'none',
                data: trendData.negative,
                lineStyle: { color: '#ff4757', width: 1.5 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(255,71,87,0.15)' },
                        { offset: 1, color: 'rgba(255,71,87,0)' }
                    ])
                }
            }
        ]
    };
    
    charts.trend.setOption(option);
}

// ========== 词云 ==========
function renderWordCloud() {
    const words = generateWordCloud();
    
    const option = {
        tooltip: {
            backgroundColor: 'rgba(16,22,38,0.95)',
            borderColor: 'rgba(0,245,212,0.3)',
            textStyle: { color: '#e0e8f5' },
            formatter: '{b}: {c}'
        },
        series: [{
            type: 'wordCloud',
            shape: 'circle',
            width: '100%',
            height: '100%',
            sizeRange: [12, 36],
            rotationRange: [-30, 30],
            rotationStep: 15,
            gridSize: 6,
            drawOutOfBound: false,
            textStyle: {
                fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
                color: function(params) {
                    const colors = [
                        '#00f5d4', '#4facfe', '#a855f7', '#ff9d00', 
                        '#2ed573', '#ff6b81', '#7c3aed', '#06b6d4'
                    ];
                    return colors[params.dataIndex % colors.length];
                }
            },
            emphasis: {
                textStyle: {
                    shadowBlur: 10,
                    shadowColor: '#00f5d4'
                }
            },
            data: words
        }]
    };
    
    charts.wordcloud.setOption(option);
}

// ========== 分类分布（水平柱状图） ==========
function renderCategory() {
    const cats = getCategoryStats();
    cats.sort((a, b) => b.value - a.value);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(16,22,38,0.95)',
            borderColor: 'rgba(0,245,212,0.3)',
            textStyle: { color: '#e0e8f5' }
        },
        grid: {
            left: '20%', right: '10%', top: '5%', bottom: '5%'
        },
        xAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
            axisLabel: { color: '#5a6a85', fontSize: 9 }
        },
        yAxis: {
            type: 'category',
            data: cats.map(c => c.name),
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            axisLabel: { color: '#8a9bb5', fontSize: 10 },
            axisTick: { show: false }
        },
        series: [{
            type: 'bar',
            data: cats.map((c, i) => ({
                value: c.value,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: 'rgba(0,245,212,0.2)' },
                        { offset: 1, color: ['#00f5d4', '#4facfe', '#a855f7', '#ff9d00', '#2ed573', '#ff6b81'][i % 6] }
                    ]),
                    borderRadius: [0, 4, 4, 0]
                }
            })),
            barWidth: '60%',
            label: {
                show: true,
                position: 'right',
                color: '#8a9bb5',
                fontSize: 10
            }
        }]
    };
    
    charts.category.setOption(option);
}

// ========== 仪表盘 ==========
function renderGauges() {
    const baseOption = (value, color, name) => ({
        series: [{
            type: 'gauge',
            radius: '95%',
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 100,
            progress: {
                show: true,
                width: 8,
                itemStyle: { color: color }
            },
            axisLine: {
                lineStyle: {
                    width: 8,
                    color: [[1, 'rgba(255,255,255,0.08)']]
                }
            },
            axisTick: { show: false },
            splitLine: {
                length: 8,
                lineStyle: { color: 'rgba(255,255,255,0.1)' }
            },
            axisLabel: { show: false },
            pointer: {
                width: 3,
                itemStyle: { color: color }
            },
            anchor: {
                show: true,
                size: 10,
                itemStyle: { color: color }
            },
            detail: {
                valueAnimation: true,
                fontSize: 22,
                fontWeight: 'bold',
                color: color,
                offsetCenter: [0, '35%'],
                formatter: '{value}'
            },
            data: [{ value: value }],
            animationDuration: 2000,
            animationEasing: 'cubicOut'
        }]
    });
    
    charts.gaugeAttention.setOption(baseOption(78, '#00f5d4'));
    charts.gaugeSpread.setOption(baseOption(86, '#4facfe'));
}

// ========== 更新图表数据 ==========
function updateCharts() {
    renderSentiment();
    renderTrend();
    renderWordCloud();
    renderCategory();
}

// ========== KPI 数字滚动动画 ==========
function animateKPI() {
    const worldCount = worldHotspots.length;
    const chinaCount = chinaHotspots.length;
    const totalSpread = [...worldHotspots, ...chinaHotspots]
        .reduce((sum, h) => sum + parseInt(h.spread), 0);
    
    animateValue('kpi-world', 0, worldCount, 1500);
    animateValue('kpi-china', 0, chinaCount, 1500);
    animateValue('kpi-spread', 0, Math.round(totalSpread / 10000), 1500, true);
}

function animateValue(id, start, end, duration, isWan = false) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const startTime = performance.now();
    const suffix = isWan ? '万' : '';
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.round(start + (end - start) * eased);
        
        el.textContent = current.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = end.toLocaleString() + suffix;
        }
    }
    
    requestAnimationFrame(update);
}
