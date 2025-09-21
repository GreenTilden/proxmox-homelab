// Iconscout Download Helper Bookmarklet
// Usage: Save as browser bookmark, click when viewing an Iconscout icon page

javascript:(function(){
    // Check if we're on an Iconscout icon page
    if (!window.location.hostname.includes('iconscout.com')) {
        alert('This bookmarklet only works on Iconscout.com icon pages');
        return;
    }
    
    // Extract icon information from the page
    function extractIconInfo() {
        const info = {
            title: '',
            category: '',
            tags: [],
            downloadUrl: '',
            previewUrl: ''
        };
        
        // Get title from page title or h1
        info.title = document.title.split(' | ')[0] || 
                    document.querySelector('h1')?.textContent?.trim() || 
                    'unknown-icon';
        
        // Clean title for filename
        info.filename = info.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        
        // Try to find download button or link
        const downloadBtn = document.querySelector('[data-testid="download-button"], .download-btn, [title*="Download"]');
        if (downloadBtn) {
            info.downloadUrl = downloadBtn.href || downloadBtn.getAttribute('data-url');
        }
        
        // Get preview image URL
        const previewImg = document.querySelector('.icon-preview img, .asset-preview img, [data-testid="icon-preview"]');
        if (previewImg) {
            info.previewUrl = previewImg.src;
        }
        
        // Extract tags/categories
        const tagElements = document.querySelectorAll('.tag, .category, [data-testid="tag"]');
        info.tags = Array.from(tagElements).map(el => el.textContent.trim()).filter(tag => tag.length > 0);
        
        return info;
    }
    
    // Create download interface
    function createDownloadInterface() {
        const iconInfo = extractIconInfo();
        
        // Remove existing interface if present
        const existingInterface = document.getElementById('iconscout-helper');
        if (existingInterface) {
            existingInterface.remove();
        }
        
        // Create floating interface
        const interface = document.createElement('div');
        interface.id = 'iconscout-helper';
        interface.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: 2px solid #00ff00;
        `;
        
        interface.innerHTML = `
            <div style="margin-bottom: 15px; text-align: center;">
                <strong>🎮 16-BIT ICON HUNTER 🎮</strong>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="float: right; background: #ff4757; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Icon:</strong> ${iconInfo.filename}
            </div>
            
            <div style="margin-bottom: 10px;">
                <label>Category:</label>
                <select id="icon-category" style="width: 100%; padding: 5px; background: #2c2c2c; color: white; border: 1px solid #00ff00;">
                    <option value="gaming">🎮 Gaming</option>
                    <option value="media">🎬 Media</option>
                    <option value="science">🔬 Science</option>
                    <option value="development">💻 Development</option>
                    <option value="infrastructure">🔧 Infrastructure</option>
                </select>
            </div>
            
            <div style="margin-bottom: 10px;">
                <label>Custom Name:</label>
                <input type="text" id="icon-name" value="${iconInfo.filename}" 
                       style="width: 100%; padding: 5px; background: #2c2c2c; color: white; border: 1px solid #00ff00;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Tags:</label>
                <div style="background: #2c2c2c; padding: 5px; border: 1px solid #00ff00; min-height: 30px; font-size: 10px;">
                    ${iconInfo.tags.join(', ') || 'No tags found'}
                </div>
            </div>
            
            <div style="text-align: center;">
                <button onclick="downloadIcon()" style="background: #00ff00; color: black; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    📥 DOWNLOAD & LOG
                </button>
                <button onclick="copyInfo()" style="background: #3742fa; color: white; padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px;">
                    📋 COPY INFO
                </button>
            </div>
            
            <div id="status-message" style="margin-top: 10px; text-align: center; font-size: 10px;"></div>
        `;
        
        document.body.appendChild(interface);
        
        // Add download functionality
        window.downloadIcon = function() {
            const category = document.getElementById('icon-category').value;
            const customName = document.getElementById('icon-name').value;
            const statusMsg = document.getElementById('status-message');
            
            const downloadInfo = {
                filename: customName,
                category: category,
                url: window.location.href,
                title: iconInfo.title,
                tags: iconInfo.tags,
                timestamp: new Date().toISOString(),
                downloadUrl: iconInfo.downloadUrl,
                previewUrl: iconInfo.previewUrl
            };
            
            // Save to localStorage for batch processing
            let iconLog = JSON.parse(localStorage.getItem('iconscout-download-log') || '[]');
            iconLog.push(downloadInfo);
            localStorage.setItem('iconscout-download-log', JSON.stringify(iconLog));
            
            statusMsg.innerHTML = `✅ Logged! Total icons: ${iconLog.length}`;
            statusMsg.style.color = '#00ff00';
            
            // Auto-trigger download if available
            if (iconInfo.downloadUrl) {
                window.open(iconInfo.downloadUrl, '_blank');
            }
            
            setTimeout(() => {
                interface.remove();
            }, 2000);
        };
        
        window.copyInfo = function() {
            const category = document.getElementById('icon-category').value;
            const customName = document.getElementById('icon-name').value;
            
            const copyText = `Icon: ${customName}
Category: ${category}
URL: ${window.location.href}
Tags: ${iconInfo.tags.join(', ')}
Filename: ${category}-${customName}.svg`;
            
            navigator.clipboard.writeText(copyText).then(() => {
                document.getElementById('status-message').innerHTML = '📋 Copied to clipboard!';
            });
        };
    }
    
    createDownloadInterface();
})();

// Export log functionality (run in console)
function exportIconLog() {
    const log = JSON.parse(localStorage.getItem('iconscout-download-log') || '[]');
    const csv = 'Filename,Category,Title,URL,Tags,Timestamp\n' + 
                log.map(item => `"${item.filename}","${item.category}","${item.title}","${item.url}","${item.tags.join('; ')}","${item.timestamp}"`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iconscout-download-log.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Clear log functionality
function clearIconLog() {
    localStorage.removeItem('iconscout-download-log');
    console.log('Icon download log cleared');
}