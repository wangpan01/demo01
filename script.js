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
    
    // 初始化当前时间并定时更新
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // 初始化日期输入为当前日期时间
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // 时间戳转日期
    timestampToDateBtn.addEventListener('click', function() {
        const timestamp = timestampInput.value.trim();
        if (!timestamp) {
            timestampResult.textContent = '请输入时间戳';
            return;
        }
        
        try {
            let timestampValue = parseInt(timestamp);
            const isMilliseconds = document.querySelector('input[name="timestamp-type"]:checked').value === 'milliseconds';
            
            // 如果是秒级时间戳，转换为毫秒
            if (!isMilliseconds) {
                timestampValue *= 1000;
            }
            
            const date = new Date(timestampValue);
            
            if (isNaN(date.getTime())) {
                throw new Error('无效的时间戳');
            }
            
            const formattedDate = date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            timestampResult.textContent = formattedDate;
        } catch (error) {
            timestampResult.textContent = '无效的时间戳';
        }
    });
    
    // 日期转时间戳
    dateToTimestampBtn.addEventListener('click', function() {
        const dateValue = dateInput.value;
        if (!dateValue) {
            dateResult.textContent = '请选择日期时间';
            return;
        }
        
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
                throw new Error('无效的日期');
            }
            
            const timestampMilliseconds = date.getTime();
            const timestampSeconds = Math.floor(timestampMilliseconds / 1000);
            
            dateResult.innerHTML = `
                <div>秒级时间戳: ${timestampSeconds}</div>
                <div>毫秒级时间戳: ${timestampMilliseconds}</div>
            `;
        } catch (error) {
            dateResult.textContent = '无效的日期';
        }
    });
}

/**
 * 文本压缩工具功能
 */
function initTextCompressor() {
    const originalText = document.getElementById('original-text');
    const compressedText = document.getElementById('compressed-text');
    const compressBtn = document.getElementById('compress-text-btn');
    const clearBtn = document.getElementById('clear-text-btn');
    
    // 选项复选框
    const removeSpaces = document.getElementById('remove-spaces');
    const removeLineBreaks = document.getElementById('remove-line-breaks');
    const removeTabs = document.getElementById('remove-tabs');
    const removeExtraSpaces = document.getElementById('remove-extra-spaces');
    const compressJson = document.getElementById('compress-json');
    const compressCode = document.getElementById('compress-code');
    
    // 显示统计数据
    const originalLength = document.getElementById('original-length');
    const compressedLength = document.getElementById('compressed-length');
    const compressionRatio = document.getElementById('compression-ratio');
    
    // 压缩文本函数
    function compressText() {
        let text = originalText.value;
        const originalLen = text.length;
        
        if (!text) {
            compressedText.value = '';
            updateStats(0, 0);
            return;
        }
        
        // 尝试判断并压缩JSON
        if (compressJson.checked) {
            try {
                // 尝试解析为JSON
                const jsonObj = JSON.parse(text);
                // 如果解析成功，压缩JSON (移除所有空白字符)
                text = JSON.stringify(jsonObj);
            } catch (e) {
                // 如果不是有效的JSON，继续使用其他选项
                console.log("不是有效的JSON格式，跳过JSON压缩");
            }
        }
        // 尝试压缩代码
        else if (compressCode.checked) {
            // 移除代码中的注释 (简单处理，仅适用于基本情况)
            // 移除单行注释 //
            text = text.replace(/\/\/.*?(?:\r\n|\n|$)/g, '');
            // 移除多行注释 /* */
            text = text.replace(/\/\*[\s\S]*?\*\//g, '');
            
            // 压缩基本代码结构
            if (removeTabs.checked) {
                text = text.replace(/\t/g, '');
            }
            
            if (removeExtraSpaces.checked) {
                // 保留必要的空格，避免破坏代码语法
                text = text.replace(/\s+/g, ' ');
                // 移除运算符周围多余空格
                text = text.replace(/\s*([=+\-*/%&|^<>!?:;,.()])\s*/g, '$1');
                // 恢复必要的空格
                text = text.replace(/([=+\-*/%&|^<>!?:;,.()])/g, ' $1 ').trim();
                // 重新压缩多余空格
                text = text.replace(/\s{2,}/g, ' ');
                // 花括号后换行
                if (!removeLineBreaks.checked) {
                    text = text.replace(/\{\s+/g, '{\n').replace(/\s+\}/g, '\n}');
                }
            }
        }
        // 常规文本压缩
        else {
            // 根据选择的选项压缩文本
            if (removeTabs.checked) {
                text = text.replace(/\t/g, '');
            }
            
            if (removeExtraSpaces.checked) {
                text = text.replace(/[ \f\v\u00A0\u2028\u2029]+/g, ' ');
            }
            
            if (removeSpaces.checked) {
                text = text.replace(/[ \f\v\u00A0\u2028\u2029]/g, '');
            }
            
            if (removeLineBreaks.checked) {
                text = text.replace(/[\r\n]+/g, '');
            }
        }
        
        // 更新压缩后文本
        compressedText.value = text;
        
        // 更新统计数据
        updateStats(originalLen, text.length);
    }
    
    // 更新统计数据函数
    function updateStats(originalLen, compressedLen) {
        originalLength.textContent = originalLen;
        compressedLength.textContent = compressedLen;
        
        // 计算压缩率
        if (originalLen > 0) {
            const ratio = ((originalLen - compressedLen) / originalLen * 100).toFixed(1);
            compressionRatio.textContent = `${ratio}%`;
        } else {
            compressionRatio.textContent = '0%';
        }
    }
    
    // 清空文本函数
    function clearText() {
        originalText.value = '';
        compressedText.value = '';
        updateStats(0, 0);
    }
    
    // 监听事件
    compressBtn.addEventListener('click', compressText);
    clearBtn.addEventListener('click', clearText);
    
    // 复选框状态变更时自动更新
    removeSpaces.addEventListener('change', compressText);
    removeLineBreaks.addEventListener('change', compressText);
    removeTabs.addEventListener('change', compressText);
    removeExtraSpaces.addEventListener('change', compressText);
    compressJson.addEventListener('change', function() {
        if (this.checked) {
            // JSON压缩和代码压缩不能同时选择
            compressCode.checked = false;
        }
        compressText();
    });
    compressCode.addEventListener('change', function() {
        if (this.checked) {
            // 代码压缩和JSON压缩不能同时选择
            compressJson.checked = false;
        }
        compressText();
    });
    
    // 监听原始文本变化，实时更新统计
    originalText.addEventListener('input', function() {
        originalLength.textContent = this.value.length;
        if (compressedText.value) {
            updateStats(this.value.length, compressedText.value.length);
        } else {
            updateStats(this.value.length, 0);
        }
    });
    
    // 初始化
    updateStats(0, 0);
}

/**
 * 颜色工具函数
 */

// 检查 HEX 颜色是否有效
function isValidHex(hex) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

// 检查 RGB 值是否有效
function isValidRgb(r, g, b) {
    return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
}

// 检查 HSL 值是否有效
function isValidHsl(h, s, l) {
    return h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
}

// HEX 转 RGB
function hexToRgb(hex) {
    // 扩展 3 位 HEX 为 6 位
    if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// RGB 转 HEX
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
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
        h = s = 0; // 灰色
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
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
        r = g = b = l; // 灰色
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