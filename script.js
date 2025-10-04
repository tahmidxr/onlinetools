// Global variables
let currentTool = '';
let uploadedFile = null;
let convertedFile = null;
let pdfDocument = null;
let totalPages = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Tool card click events - this will now properly open modals
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const toolType = card.getAttribute('data-tool');
            console.log('Opening tool:', toolType);
            openToolModal(toolType);
        });
    });

    // Modal close events
    const closeBtn = document.querySelector('.close');
    const modal = document.querySelector('.modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function openToolModal(toolType) {
    console.log('Opening modal for:', toolType);
    currentTool = toolType;
    const modal = document.getElementById('tool-modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) {
        console.error('Modal elements not found');
        return;
    }

    modalBody.innerHTML = generateToolInterface(toolType);
    modal.style.display = 'block';

    // Initialize tool-specific event listeners after modal is shown
    setTimeout(() => {
        initializeToolListeners(toolType);
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('tool-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    uploadedFile = null;
    convertedFile = null;
    currentTool = '';
    pdfDocument = null;
    totalPages = 0;
}

function generateToolInterface(toolType) {
    const toolConfigs = {
        'jpg-to-png': { title: 'JPG to PNG Converter', icon: 'fa-exchange-alt', accept: '.jpg,.jpeg', formats: 'JPEG' },
        'png-to-jpg': { title: 'PNG to JPG Converter', icon: 'fa-exchange-alt', accept: '.png', formats: 'PNG' },
        'png-to-svg': { title: 'PNG to SVG Converter', icon: 'fa-vector-square', accept: '.png', formats: 'PNG' },
        'jpg-to-svg': { title: 'JPG to SVG Converter', icon: 'fa-bezier-curve', accept: '.jpg,.jpeg', formats: 'JPEG' },
        'image-resizer': { title: 'Image Resizer', icon: 'fa-expand-arrows-alt', accept: '.jpg,.jpeg,.png', formats: 'JPEG, PNG' },
        'image-compressor': { title: 'Image Compressor', icon: 'fa-compress', accept: '.jpg,.jpeg,.png', formats: 'JPEG, PNG' },
        'pdf-to-jpg': { title: 'PDF to JPG Converter', icon: 'fa-file-image', accept: '.pdf', formats: 'PDF' },
        'pdf-to-png': { title: 'PDF to PNG Converter', icon: 'fa-file-image', accept: '.pdf', formats: 'PDF' },
        'jpg-to-pdf': { title: 'JPG to PDF Converter', icon: 'fa-file-pdf', accept: '.jpg,.jpeg', formats: 'JPEG' },
        'png-to-pdf': { title: 'PNG to PDF Converter', icon: 'fa-file-pdf', accept: '.png', formats: 'PNG' },
        'word-to-pdf': { title: 'Word to PDF Converter', icon: 'fa-file-export', accept: '.doc,.docx', formats: 'DOC, DOCX' },
        'image-to-word': { title: 'Image to Word Converter', icon: 'fa-file-word', accept: '.jpg,.jpeg,.png', formats: 'JPEG, PNG' }
    };

    const config = toolConfigs[toolType] || { title: 'Unknown Tool', icon: 'fa-tools', accept: '*', formats: 'All' };

    let optionsHTML = '';

    // Add specific options based on tool type
    if (toolType === 'image-resizer') {
        optionsHTML = `
            <div class="options-panel" id="options-panel" style="display: none;">
                <h4><i class="fas fa-cog"></i> Resize Options</h4>
                <div class="option-group">
                    <label for="resize-width">Width (px)</label>
                    <input type="number" id="resize-width" value="800" min="1" max="10000">
                </div>
                <div class="option-group">
                    <label for="resize-height">Height (px)</label>
                    <input type="number" id="resize-height" value="600" min="1" max="10000">
                </div>
                <div class="option-group">
                    <label>
                        <input type="checkbox" id="maintain-ratio" checked> Maintain Aspect Ratio
                    </label>
                </div>
            </div>
        `;
    } else if (toolType === 'image-compressor') {
        optionsHTML = `
            <div class="options-panel" id="options-panel" style="display: none;">
                <h4><i class="fas fa-cog"></i> Compression Options</h4>
                <div class="option-group">
                    <label for="quality-slider">Quality: <span id="quality-value">80</span>%</label>
                    <input type="range" id="quality-slider" min="1" max="100" value="80">
                </div>
                <div class="option-group">
                    <label for="output-format">Output Format</label>
                    <select id="output-format">
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                    </select>
                </div>
            </div>
        `;
    } else if (toolType === 'pdf-to-jpg' || toolType === 'pdf-to-png') {
        optionsHTML = `
            <div class="options-panel" id="options-panel" style="display: none;">
                <h4><i class="fas fa-cog"></i> PDF Conversion Options</h4>
                <div class="option-group">
                    <label for="page-select">Select Page to Convert</label>
                    <select id="page-select">
                        <option value="1">Page 1</option>
                    </select>
                </div>
                <div class="option-group">
                    <label for="pdf-quality">Image Quality</label>
                    <select id="pdf-quality">
                        <option value="1">Low (Fast)</option>
                        <option value="1.5">Medium</option>
                        <option value="2" selected>High</option>
                        <option value="3">Very High</option>
                    </select>
                </div>
            </div>
        `;
    }

    return `
        <div class="tool-interface">
            <h3><i class="fas ${config.icon}"></i> ${config.title}</h3>
            <p style="text-align: center; color: #666; margin-bottom: 2rem;">Supported formats: ${config.formats}</p>

            <div class="upload-area" id="upload-area">
                <i class="fas fa-cloud-upload-alt"></i>
                <p><strong>Drag and drop your file here</strong></p>
                <p>or</p>
                <button class="upload-btn" id="browse-btn">
                    <i class="fas fa-folder-open"></i> Browse Files
                </button>
                <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">Maximum file size: 50MB</p>
                <input type="file" id="file-input" class="file-input" accept="${config.accept}">
            </div>

            ${optionsHTML}

            <div class="progress-container" id="progress-container" style="display: none; margin-bottom: 1.5rem;">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <p id="progress-text" style="text-align: center; margin-top: 0.5rem; color: #666;">Processing...</p>
            </div>

            <button class="convert-btn" id="convert-btn" disabled>
                <i class="fas fa-sync-alt"></i> Convert File
            </button>

            <div class="result-area" id="result-area" style="display: none;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #28a745;"></i>
                <p>Conversion completed successfully!</p>
                <button class="download-btn" id="download-btn">
                    <i class="fas fa-download"></i> Download File
                </button>
                <button class="new-file-btn" id="new-file-btn">
                    <i class="fas fa-file-upload"></i> Convert Another File
                </button>
            </div>
        </div>
    `;
}

function initializeToolListeners(toolType) {
    console.log('Initializing listeners for:', toolType);

    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadArea = document.getElementById('upload-area');
    const convertBtn = document.getElementById('convert-btn');

    if (!fileInput || !browseBtn || !uploadArea || !convertBtn) {
        console.error('Required elements not found');
        return;
    }

    // Remove any existing event listeners by cloning elements
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);

    const newBrowseBtn = browseBtn.cloneNode(true);
    browseBtn.parentNode.replaceChild(newBrowseBtn, browseBtn);

    const newUploadArea = uploadArea.cloneNode(true);
    uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);

    const newConvertBtn = convertBtn.cloneNode(true);
    convertBtn.parentNode.replaceChild(newConvertBtn, convertBtn);

    // Get references to new elements
    const freshFileInput = document.getElementById('file-input');
    const freshBrowseBtn = document.getElementById('browse-btn');
    const freshUploadArea = document.getElementById('upload-area');
    const freshConvertBtn = document.getElementById('convert-btn');

    // Browse button click
    freshBrowseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        freshFileInput.click();
    });

    // File input change event
    freshFileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    freshUploadArea.addEventListener('dragover', handleDragOver);
    freshUploadArea.addEventListener('dragleave', handleDragLeave);
    freshUploadArea.addEventListener('drop', handleDrop);

    freshUploadArea.addEventListener('click', (e) => {
        if (e.target === freshUploadArea || e.target.tagName === 'P' || e.target.tagName === 'I') {
            freshFileInput.click();
        }
    });

    // Convert button click
    freshConvertBtn.addEventListener('click', (e) => {
        e.preventDefault();
        processFile(toolType);
    });

    // Tool-specific listeners
    initializeSpecificListeners(toolType);
}

function initializeSpecificListeners(toolType) {
    if (toolType === 'image-compressor') {
        const qualitySlider = document.getElementById('quality-slider');
        const qualityValue = document.getElementById('quality-value');
        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', (e) => {
                qualityValue.textContent = e.target.value + '%';
            });
        }
    }

    if (toolType === 'image-resizer') {
        const widthInput = document.getElementById('resize-width');
        const heightInput = document.getElementById('resize-height');
        const maintainRatio = document.getElementById('maintain-ratio');

        if (widthInput && heightInput && maintainRatio) {
            widthInput.addEventListener('input', () => {
                if (maintainRatio.checked && uploadedFile) {
                    updateAspectRatio('width');
                }
            });

            heightInput.addEventListener('input', () => {
                if (maintainRatio.checked && uploadedFile) {
                    updateAspectRatio('height');
                }
            });
        }
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    console.log('File selected:', file);

    if (file) {
        if (validateFile(file)) {
            uploadedFile = file;
            updateUploadArea(file);
            showOptionsPanel();
            enableConvertButton();

            // If it's a PDF, load it to get page count
            if (currentTool === 'pdf-to-jpg' || currentTool === 'pdf-to-png') {
                loadPdfPages(file);
            }
        } else {
            alert('Invalid file type or size. Please check the requirements.');
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            uploadedFile = file;

            // Update file input to reflect dropped file
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            }

            updateUploadArea(file);
            showOptionsPanel();
            enableConvertButton();

            // If it's a PDF, load it to get page count
            if (currentTool === 'pdf-to-jpg' || currentTool === 'pdf-to-png') {
                loadPdfPages(file);
            }
        } else {
            alert('Invalid file type or size. Please check the requirements.');
        }
    }
}

async function loadPdfPages(file) {
    try {
        if (typeof pdfjsLib === 'undefined') {
            console.warn('PDF.js not loaded, using fallback');
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        pdfDocument = await loadingTask.promise;
        totalPages = pdfDocument.numPages;

        // Update page selector
        const pageSelect = document.getElementById('page-select');
        if (pageSelect) {
            pageSelect.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Page ${i}`;
                pageSelect.appendChild(option);
            }

            // Add "All Pages" option
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = `All Pages (${totalPages})`;
            pageSelect.insertBefore(allOption, pageSelect.firstChild);
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
    }
}

function validateFile(file) {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        return false;
    }

    // Basic file type validation
    const allowedTypes = {
        'jpg-to-png': ['image/jpeg', 'image/jpg'],
        'png-to-jpg': ['image/png'],
        'png-to-svg': ['image/png'],
        'jpg-to-svg': ['image/jpeg', 'image/jpg'],
        'image-resizer': ['image/jpeg', 'image/jpg', 'image/png'],
        'image-compressor': ['image/jpeg', 'image/jpg', 'image/png'],
        'pdf-to-jpg': ['application/pdf'],
        'pdf-to-png': ['application/pdf'],
        'jpg-to-pdf': ['image/jpeg', 'image/jpg'],
        'png-to-pdf': ['image/png'],
        'word-to-pdf': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
        'image-to-word': ['image/jpeg', 'image/jpg', 'image/png']
    };

    const allowed = allowedTypes[currentTool];
    return allowed ? allowed.includes(file.type) : true;
}

function updateUploadArea(file) {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.innerHTML = `
        <i class="fas fa-file-check" style="color: #28a745;"></i>
        <p><strong>File Ready: ${file.name}</strong></p>
        <p style="font-size: 0.9rem; color: #666;">
            Size: ${formatFileSize(file.size)} | Type: ${file.type || 'Unknown'}
        </p>
        <button class="upload-btn" id="browse-btn" style="margin-top: 1rem;">
            <i class="fas fa-sync-alt"></i> Choose Different File
        </button>
        <input type="file" id="file-input" class="file-input" accept="${getAcceptTypes()}">
    `;
}

function getAcceptTypes() {
    const accepts = {
        'jpg-to-png': '.jpg,.jpeg',
        'png-to-jpg': '.png',
        'png-to-svg': '.png',
        'jpg-to-svg': '.jpg,.jpeg',
        'image-resizer': '.jpg,.jpeg,.png',
        'image-compressor': '.jpg,.jpeg,.png',
        'pdf-to-jpg': '.pdf',
        'pdf-to-png': '.pdf',
        'jpg-to-pdf': '.jpg,.jpeg',
        'png-to-pdf': '.png',
        'word-to-pdf': '.doc,.docx',
        'image-to-word': '.jpg,.jpeg,.png'
    };
    return accepts[currentTool] || '*';
}

function showOptionsPanel() {
    const optionsPanel = document.getElementById('options-panel');
    if (optionsPanel) {
        optionsPanel.style.display = 'block';
    }
}

function enableConvertButton() {
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.disabled = false;
        convertBtn.style.opacity = '1';
        convertBtn.style.cursor = 'pointer';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showProgress() {
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (progressContainer) {
        progressContainer.style.display = 'block';
    }

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress >= 95) {
            progress = 95;
        }
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (progress >= 95) {
            clearInterval(interval);
            if (progressText) {
                progressText.textContent = 'Finalizing...';
            }
        }
    }, 200);

    return interval;
}

function hideProgress() {
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = '0';
    }
}

function showResult(blob, fileName) {
    const resultArea = document.getElementById('result-area');
    const downloadBtn = document.getElementById('download-btn');
    const newFileBtn = document.getElementById('new-file-btn');

    if (resultArea) {
        resultArea.style.display = 'block';
    }

    if (downloadBtn) {
        // Remove old listeners by cloning
        const newDownloadBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);
        document.getElementById('download-btn').onclick = () => downloadFile(blob, fileName);
    }

    if (newFileBtn) {
        // Remove old listeners by cloning
        const newNewFileBtn = newFileBtn.cloneNode(true);
        newFileBtn.parentNode.replaceChild(newNewFileBtn, newFileBtn);
        document.getElementById('new-file-btn').onclick = () => resetTool();
    }
}

function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetTool() {
    const uploadArea = document.getElementById('upload-area');
    const optionsPanel = document.getElementById('options-panel');
    const resultArea = document.getElementById('result-area');
    const convertBtn = document.getElementById('convert-btn');

    // Reset upload area
    if (uploadArea) {
        uploadArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p><strong>Drag and drop your file here</strong></p>
            <p>or</p>
            <button class="upload-btn" id="browse-btn">
                <i class="fas fa-folder-open"></i> Browse Files
            </button>
            <p style="font-size: 0.9rem; color: #999; margin-top: 1rem;">Maximum file size: 50MB</p>
            <input type="file" id="file-input" class="file-input" accept="${getAcceptTypes()}">
        `;
    }

    // Hide panels
    if (optionsPanel) optionsPanel.style.display = 'none';
    if (resultArea) resultArea.style.display = 'none';

    // Reset button
    if (convertBtn) {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Convert File';
    }

    // Clear variables
    uploadedFile = null;
    convertedFile = null;
    pdfDocument = null;
    totalPages = 0;

    // Re-initialize listeners
    setTimeout(() => {
        initializeToolListeners(currentTool);
    }, 100);
}

// Main processing function
async function processFile(toolType) {
    if (!uploadedFile) {
        alert('Please select a file first');
        return;
    }

    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
    }

    const progressInterval = showProgress();

    try {
        let result;

        switch(toolType) {
            case 'jpg-to-png':
                result = await convertImageFormat(uploadedFile, 'png');
                break;
            case 'png-to-jpg':
                result = await convertImageFormat(uploadedFile, 'jpeg');
                break;
            case 'png-to-svg':
                result = await convertImageToSVG(uploadedFile);
                break;
            case 'jpg-to-svg':
                result = await convertImageToSVG(uploadedFile);
                break;
            case 'image-resizer':
                result = await resizeImage(uploadedFile);
                break;
            case 'image-compressor':
                result = await compressImage(uploadedFile);
                break;
            case 'pdf-to-jpg':
                result = await convertPdfToImage(uploadedFile, 'jpeg');
                break;
            case 'pdf-to-png':
                result = await convertPdfToImage(uploadedFile, 'png');
                break;
            case 'jpg-to-pdf':
                result = await convertImageToPdf(uploadedFile);
                break;
            case 'png-to-pdf':
                result = await convertImageToPdf(uploadedFile);
                break;
            case 'word-to-pdf':
                result = await convertWordToPdf(uploadedFile);
                break;
            case 'image-to-word':
                result = await convertImageToWord(uploadedFile);
                break;
            default:
                throw new Error('Conversion type not supported: ' + toolType);
        }

        clearInterval(progressInterval);

        // Complete progress
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }

        setTimeout(() => {
            hideProgress();
            showResult(result.blob, result.fileName);
        }, 500);

    } catch (error) {
        clearInterval(progressInterval);
        hideProgress();
        console.error('Conversion error:', error);
        alert('Conversion failed: ' + error.message);
    } finally {
        if (convertBtn) {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Convert File';
        }
    }
}

// Convert image format (JPG to PNG, PNG to JPG, etc.)
async function convertImageFormat(file, targetFormat) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // For PNG, preserve transparency
            if (targetFormat === 'png') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                // For JPG/JPEG, fill with white background
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            const mimeType = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
            const quality = targetFormat === 'png' ? 1.0 : 0.95;

            canvas.toBlob((blob) => {
                if (blob) {
                    const extension = targetFormat === 'png' ? 'png' : 'jpg';
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + extension;
                    resolve({ blob, fileName });
                } else {
                    reject(new Error('Failed to convert image'));
                }
            }, mimeType, quality);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Convert image to SVG
async function convertImageToSVG(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const dataURL = canvas.toDataURL('image/png');

            const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
    <image width="${img.width}" height="${img.height}" xlink:href="${dataURL}"/>
</svg>`;

            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.svg';
            resolve({ blob, fileName });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Resize image
async function resizeImage(file) {
    const widthInput = document.getElementById('resize-width');
    const heightInput = document.getElementById('resize-height');
    const targetWidth = parseInt(widthInput?.value) || 800;
    const targetHeight = parseInt(heightInput?.value) || 600;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Fill background for JPG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            canvas.toBlob((blob) => {
                if (blob) {
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '_resized.jpg';
                    resolve({ blob, fileName });
                } else {
                    reject(new Error('Failed to resize image'));
                }
            }, 'image/jpeg', 0.9);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Compress image
async function compressImage(file) {
    const qualitySlider = document.getElementById('quality-slider');
    const formatSelect = document.getElementById('output-format');
    const quality = (parseInt(qualitySlider?.value) || 80) / 100;
    const format = formatSelect?.value || 'jpeg';

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            if (format === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            const mimeType = format === 'webp' ? 'image/webp' : 'image/' + format;

            canvas.toBlob((blob) => {
                if (blob) {
                    const fileName = file.name.replace(/\.[^/.]+$/, '') + '_compressed.' + format;
                    resolve({ blob, fileName });
                } else {
                    reject(new Error('Failed to compress image'));
                }
            }, mimeType, quality);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Convert image to PDF
async function convertImageToPdf(file) {
    return new Promise((resolve, reject) => {
        if (typeof window.jspdf === 'undefined') {
            reject(new Error('PDF library not loaded'));
            return;
        }

        const img = new Image();

        img.onload = () => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();

                // A4 dimensions in points
                const pdfWidth = 210; // A4 width in mm
                const pdfHeight = 297; // A4 height in mm

                // Calculate scale to fit image
                const imgAspect = img.width / img.height;
                const pdfAspect = pdfWidth / pdfHeight;

                let finalWidth, finalHeight;
                if (imgAspect > pdfAspect) {
                    // Image is wider than PDF
                    finalWidth = pdfWidth - 20; // 10mm margin on each side
                    finalHeight = finalWidth / imgAspect;
                } else {
                    // Image is taller than PDF
                    finalHeight = pdfHeight - 20; // 10mm margin on top/bottom
                    finalWidth = finalHeight * imgAspect;
                }

                // Center the image
                const x = (pdfWidth - finalWidth) / 2;
                const y = (pdfHeight - finalHeight) / 2;

                // Create canvas to get image data
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imgData = canvas.toDataURL('image/jpeg', 0.9);
                pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

                const pdfBlob = pdf.output('blob');
                const fileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
                resolve({ blob: pdfBlob, fileName });
            } catch (error) {
                reject(new Error('PDF generation failed: ' + error.message));
            }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Convert PDF to image with proper PDF.js integration
async function convertPdfToImage(file, format) {
    try {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded. Please refresh the page.');
        }

        const pageSelect = document.getElementById('page-select');
        const qualitySelect = document.getElementById('pdf-quality');
        const selectedPage = pageSelect?.value || '1';
        const scale = parseFloat(qualitySelect?.value) || 2;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        if (selectedPage === 'all') {
            // Convert all pages
            const blobs = [];
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const blob = await new Promise((resolve) => {
                    canvas.toBlob(resolve, 'image/' + format, 0.95);
                });
                blobs.push(blob);
            }

            // Create a ZIP file with all pages (simplified version - download first page)
            // In a full implementation, you would use JSZip library
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '_page1.' + format;
            return { blob: blobs[0], fileName };

        } else {
            // Convert single page
            const pageNum = parseInt(selectedPage);
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // White background
            context.fillStyle = '#FFFFFF';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((b) => {
                    if (b) resolve(b);
                    else reject(new Error('Failed to create blob'));
                }, 'image/' + format, 0.95);
            });

            const fileName = file.name.replace(/\.[^/.]+$/, '') + '_page' + pageNum + '.' + format;
            return { blob, fileName };
        }
    } catch (error) {
        console.error('PDF conversion error:', error);
        throw new Error('Failed to convert PDF: ' + error.message);
    }
}

// Convert Word to PDF (demo implementation)
async function convertWordToPdf(file) {
    return new Promise((resolve, reject) => {
        if (typeof window.jspdf === 'undefined') {
            reject(new Error('PDF library not loaded'));
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            // Add title
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Document Converted from Word', 20, 30);

            // Add file info
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Original file: ' + file.name, 20, 50);
            pdf.text('File size: ' + formatFileSize(file.size), 20, 65);
            pdf.text('Conversion date: ' + new Date().toLocaleString(), 20, 80);

            // Add sample content
            pdf.text('This is a demonstration of Word to PDF conversion.', 20, 100);
            pdf.text('In a full implementation, the actual content from', 20, 115);
            pdf.text('your Word document would be extracted and', 20, 130);
            pdf.text('formatted properly in this PDF.', 20, 145);

            pdf.text('Features that would be included:', 20, 165);
            pdf.text('• Text formatting (bold, italic, fonts)', 20, 180);
            pdf.text('• Images and graphics', 20, 195);
            pdf.text('• Tables and lists', 20, 210);
            pdf.text('• Headers and footers', 20, 225);
            pdf.text('• Page breaks and layout', 20, 240);

            const pdfBlob = pdf.output('blob');
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
            resolve({ blob: pdfBlob, fileName });
        } catch (error) {
            reject(new Error('Word to PDF conversion failed: ' + error.message));
        }
    });
}

// Convert Image to Word (demo implementation)
async function convertImageToWord(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            // Create a simple text document
            const content = `Document Created from Image Conversion

Source Image: ${file.name}
Image Size: ${img.width} x ${img.height} pixels
File Size: ${formatFileSize(file.size)}
Conversion Date: ${new Date().toLocaleDateString()}

OCR Results:
[In a full implementation, this section would contain the text 
extracted from the image using OCR technology]

Image Analysis:
• Image dimensions: ${img.width} x ${img.height} pixels
• File format: ${file.type}
• Color profile: ${img.width * img.height > 1000000 ? 'High resolution' : 'Standard resolution'}

Note: This is a demonstration conversion. A complete implementation 
would use OCR (Optical Character Recognition) technology to extract 
actual text from the image and format it properly in a Word document.

The extracted text would maintain formatting where possible and 
provide options for:
• Language detection
• Text formatting
• Table recognition
• Layout preservation
`;

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.txt';
            resolve({ blob, fileName });
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

// Update aspect ratio helper
function updateAspectRatio(changedDimension) {
    if (!uploadedFile) return;

    const img = new Image();
    img.onload = () => {
        const widthInput = document.getElementById('resize-width');
        const heightInput = document.getElementById('resize-height');

        if (!widthInput || !heightInput) return;

        const aspectRatio = img.width / img.height;

        if (changedDimension === 'width') {
            const newWidth = parseInt(widthInput.value);
            if (newWidth && newWidth > 0) {
                heightInput.value = Math.round(newWidth / aspectRatio);
            }
        } else {
            const newHeight = parseInt(heightInput.value);
            if (newHeight && newHeight > 0) {
                widthInput.value = Math.round(newHeight * aspectRatio);
            }
        }
    };
    img.src = URL.createObjectURL(uploadedFile);
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}
