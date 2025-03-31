/**
 * 工具集合 - 颜色转换与时间戳工具
 * 包含：颜色工具、时间戳转换、文本压缩
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有功能
    initColorTool(); // 合并后的颜色工具
    initTimestampConverter();
    initTextCompressor();
    
    // 初始化所有复制按钮
    initCopyButtons();
});

/**
 * 初始化所有复制按钮功能
 */
function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            let textToCopy;
            
            // 根据目标元素类型获取要复制的文本
            if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
                textToCopy = targetElement.value;
            } else {
                textToCopy = targetElement.textContent;
            }
            
            if (!textToCopy) return;
            
            // 复制文本到剪贴板
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = this.textContent;
                this.textContent = '已复制';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                    this.style.color = '';
                }, 1000);
            });
        });
    });
    
    // 添加文本压缩复制按钮功能
    const copyCompressedBtn = document.getElementById('copy-compressed-btn');
    if (copyCompressedBtn) {
        copyCompressedBtn.addEventListener('click', function() {
            const compressedText = document.getElementById('compressed-text').value;
            if (!compressedText) return;
            
            navigator.clipboard.writeText(compressedText).then(() => {
                const originalText = this.textContent;
                this.textContent = '已复制';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                    this.style.color = '';
                }, 1000);
            });
        });
    }
}

/**
 * 颜色工具功能 (合并了颜色转换器和选择器)
 */
function initColorTool() {
    // 颜色输入和显示元素
    const colorInput = document.getElementById('color-input');
    const colorPreview = document.getElementById('color-preview');
    const colorName = document.getElementById('color-name');
    
    // 颜色值输入框
    const hexInput = document.getElementById('hex-color');
    const rgbInput = document.getElementById('rgb-color');
    const hslInput = document.getElementById('hsl-color');
    
    // 保存颜色相关元素
    const saveColorBtn = document.getElementById('save-color-btn');
    const savedColorsContainer = document.getElementById('saved-colors-container');
    
    // 存储已保存的颜色
    let savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
    
    // 更新颜色显示和值
    function updateColorDisplay(color) {
        // 更新颜色预览和名称
        colorPreview.style.backgroundColor = color;
        colorName.textContent = color;
        
        // 解析颜色为各种格式
        const rgb = hexToRgb(color);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // 更新输入框值
        hexInput.value = color;
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }
    
    // 显示保存的颜色
    function displaySavedColors() {
        savedColorsContainer.innerHTML = '';
        
        savedColors.forEach((color, index) => {
            const colorSwatch = document.createElement('div');
            colorSwatch.className = 'color-swatch';
            colorSwatch.style.backgroundColor = color;
            colorSwatch.title = color;
            colorSwatch.setAttribute('data-index', index);
            
            // 点击色块选择该颜色
            colorSwatch.addEventListener('click', function() {
                colorInput.value = color;
                updateColorDisplay(color);
            });
            
            // 右键点击删除颜色
            colorSwatch.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                const index = parseInt(this.getAttribute('data-index'));
                savedColors.splice(index, 1);
                localStorage.setItem('savedColors', JSON.stringify(savedColors));
                displaySavedColors();
            });
            
            savedColorsContainer.appendChild(colorSwatch);
        });
    }
    
    // 监听颜色选择器变化
    colorInput.addEventListener('input', function() {
        updateColorDisplay(this.value);
    });
    
    // 监听 HEX 输入变化
    hexInput.addEventListener('input', function() {
        const hexValue = this.value.trim();
        if (isValidHex(hexValue)) {
            colorInput.value = hexValue;
            updateColorDisplay(hexValue);
        }
    });
    
    // 监听 RGB 输入变化
    rgbInput.addEventListener('input', function() {
        const rgbValue = this.value.trim();
        const rgbMatch = rgbValue.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            
            if (isValidRgb(r, g, b)) {
                const hexValue = rgbToHex(r, g, b);
                colorInput.value = hexValue;
                updateColorDisplay(hexValue);
            }
        }
    });
    
    // 监听 HSL 输入变化
    hslInput.addEventListener('input', function() {
        const hslValue = this.value.trim();
        const hslMatch = hslValue.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
        
        if (hslMatch) {
            const h = parseInt(hslMatch[1]);
            const s = parseInt(hslMatch[2]);
            const l = parseInt(hslMatch[3]);
            
            if (isValidHsl(h, s, l)) {
                const rgb = hslToRgb(h, s, l);
                const hexValue = rgbToHex(rgb.r, rgb.g, rgb.b);
                colorInput.value = hexValue;
                updateColorDisplay(hexValue);
            }
        }
    });
    
    // 保存当前颜色
    saveColorBtn.addEventListener('click', function() {
        const currentColor = colorInput.value;
        if (!savedColors.includes(currentColor)) {
            savedColors.unshift(currentColor);
            // 最多保存 12 个颜色
            if (savedColors.length > 12) {
                savedColors.pop();
            }
            localStorage.setItem('savedColors', JSON.stringify(savedColors));
            displaySavedColors();
        }
    });
    
    // 初始化显示
    updateColorDisplay(colorInput.value);
    displaySavedColors();
}

/**
 * 时间戳转换器功能
 */
function initTimestampConverter() {
    const currentTimeEl = document.getElementById('current-time');
    const currentDateEl = document.getElementById('current-date');
    const currentTimestampEl = document.getElementById('current-timestamp');
    
    const timestampInput = document.getElementById('timestamp-input');
    const timestampTypeRadios = document.getElementsByName('timestamp-type');
    const timestampToDateBtn = document.getElementById('timestamp-to-date-btn');
    const timestampResult = document.getElementById('timestamp-result');
    
    const dateInput = document.getElementById('date-input');
    const dateToTimestampBtn = document.getElementById('date-to-timestamp-btn');
    const dateResult = document.getElementById('date-result');
    
    // 更新当前时间显示
    function updateCurrentTime() {
        const now = new Date();
        
        // 格式化时间
        const timeString = now.toLocaleTimeString('zh-CN');
        const dateString = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        // 获取时间戳
        const timestampSeconds = Math.floor(now.getTime() / 1000);
        const timestampMilliseconds = now.getTime();
        
        // 更新显示
        currentTimeEl.textContent = timeString;
        currentDateEl.textContent = dateString;
        currentTimestampEl.textContent = `秒级: ${timestampSeconds} | 毫秒级: ${timestampMilliseconds}`;
    }
    
    // 每秒更新当前时间
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // 时间戳转日期
    timestampToDateBtn.addEventListener('click', function() {
        const timestamp = parseInt(timestampInput.value);
        if (!timestamp) {
            timestampResult.textContent = '请输入有效的时间戳';
            return;
        }
        
        const isMilliseconds = document.querySelector('input[name="timestamp-type"]:checked').value === 'milliseconds';
        const date = new Date(isMilliseconds ? timestamp : timestamp * 1000);
        
        if (isNaN(date.getTime())) {
            timestampResult.textContent = '无效的时间戳';
            return;
        }
        
        timestampResult.textContent = date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        });
    });
    
    // 日期转时间戳
    dateToTimestampBtn.addEventListener('click', function() {
        const dateValue = dateInput.value;
        if (!dateValue) {
            dateResult.textContent = '请选择日期时间';
            return;
        }
        
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            dateResult.textContent = '无效的日期时间';
            return;
        }
        
        const timestampMilliseconds = date.getTime();
        const timestampSeconds = Math.floor(timestampMilliseconds / 1000);
        
        dateResult.textContent = `秒级: ${timestampSeconds}\n毫秒级: ${timestampMilliseconds}`;
    });
}

/**
 * 文本压缩工具功能
 */
function initTextCompressor() {
    const originalText = document.getElementById('original-text');
    const compressedText = document.getElementById('compressed-text');
    const compressTextBtn = document.getElementById('compress-text-btn');
    const clearTextBtn = document.getElementById('clear-text-btn');
    const originalLength = document.getElementById('original-length');
    const compressedLength = document.getElementById('compressed-length');
    const compressionRatio = document.getElementById('compression-ratio');
    
    // 压缩选项
    const removeSpaces = document.getElementById('remove-spaces');
    const removeLineBreaks = document.getElementById('remove-line-breaks');
    const removeTabs = document.getElementById('remove-tabs');
    const removeExtraSpaces = document.getElementById('remove-extra-spaces');
    const compressJson = document.getElementById('compress-json');
    const compressCode = document.getElementById('compress-code');
    
    // 压缩文本
    function compressText() {
        let text = originalText.value;
        const len = text.length;
        
        if (!text) {
            alert('请输入需要压缩的文本');
            return;
        }
        
        // 尝试解析 JSON
        if (compressJson.checked) {
            try {
                const jsonObj = JSON.parse(text);
                text = JSON.stringify(jsonObj);
            } catch (e) {
                // 如果不是有效的 JSON，继续使用原文本
            }
        }
        
        // 移除制表符
        if (removeTabs.checked) {
            text = text.replace(/\t/g, '');
        }
        
        // 移除换行符
        if (removeLineBreaks.checked) {
            text = text.replace(/\r?\n/g, '');
        }
        
        // 移除空格
        if (removeSpaces.checked) {
            text = text.replace(/ /g, '');
        }
        // 合并连续空格
        else if (removeExtraSpaces.checked) {
            text = text.replace(/\s+/g, ' ').trim();
        }
        
        // 压缩代码（简单实现）
        if (compressCode.checked) {
            text = text
                .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // 移除注释
                .replace(/\s*([{}:;,])\s*/g, '$1') // 移除运算符周围的空格
                .replace(/\s+/g, ' ') // 合并空格
                .trim();
        }
        
        compressedText.value = text;
        updateStats(len, text.length);
    }
    
    // 更新统计信息
    function updateStats(originalLen, compressedLen) {
        originalLength.textContent = originalLen;
        compressedLength.textContent = compressedLen;
        
        const ratio = originalLen ? ((originalLen - compressedLen) / originalLen * 100).toFixed(1) : 0;
        compressionRatio.textContent = ratio + '%';
    }
    
    // 清空文本
    function clearText() {
        originalText.value = '';
        compressedText.value = '';
        updateStats(0, 0);
    }
    
    // 绑定事件
    compressTextBtn.addEventListener('click', compressText);
    clearTextBtn.addEventListener('click', clearText);
}

/**
 * 颜色格式验证和转换工具函数
 */

// 验证 HEX 颜色值
function isValidHex(hex) {
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
}

// 验证 RGB 颜色值
function isValidRgb(r, g, b) {
    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
}

// 验证 HSL 颜色值
function isValidHsl(h, s, l) {
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
}

// HEX 转 RGB
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// RGB 转 HEX
function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// RGB 转 HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        
        h /= 6;
    }
    
    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

// HSL 转 RGB
function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}