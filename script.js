function switchPage(pageId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const targetSection = document.getElementById(`page-${pageId}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        switchPage(page);
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

let compFile = null;
const compressorInput = document.getElementById('compressorInput');
const qualitySlider = document.getElementById('qualitySlider');
const qualityVal = document.getElementById('qualityVal');

if (compressorInput) {
    compressorInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) processCompressor(e.target.files[0]);
    });
}

function processCompressor(file) {
    compFile = file;
    document.getElementById('compOrigSize').textContent = formatBytes(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('compOrigPreview').src = e.target.result;
        runCompression(e.target.result, qualitySlider.value / 100);
        document.getElementById('dropZoneCompressor').style.display = 'none';
        document.getElementById('compressorWorkspace').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function runCompression(base64Src, quality) {
    const img = new Image();
    img.src = base64Src;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        document.getElementById('compResultPreview').src = compressedUrl;
        const head = 'data:image/jpeg;base64,';
        const sizeInBytes = Math.round((compressedUrl.length - head.length) * 3 / 4);
        document.getElementById('compResultSize').textContent = formatBytes(sizeInBytes);
    };
}

if (qualitySlider) {
    qualitySlider.addEventListener('input', (e) => {
        qualityVal.textContent = e.target.value + '%';
        const compOrigPreview = document.getElementById('compOrigPreview');
        if (compOrigPreview && compOrigPreview.src) {
            runCompression(compOrigPreview.src, e.target.value / 100);
        }
    });
}

document.getElementById('downloadCompBtn')?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `compressed_${compFile ? compFile.name : 'image.jpg'}`;
    link.href = document.getElementById('compResultPreview').src;
    link.click();
    showToast('Compressed image downloaded successfully');
});

let resizeImgObj = null;
let originalAspect = 1;
const resizerInput = document.getElementById('resizerInput');
const resizeWidth = document.getElementById('resizeWidth');
const resizeHeight = document.getElementById('resizeHeight');
const aspectRatioCheck = document.getElementById('aspectRatioCheck');

if (resizerInput) {
    resizerInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.src = evt.target.result;
                img.onload = () => {
                    resizeImgObj = img;
                    originalAspect = img.width / img.height;
                    resizeWidth.value = img.width;
                    resizeHeight.value = img.height;
                    document.getElementById('resizePreview').src = evt.target.result;
                    document.getElementById('dropZoneResizer').style.display = 'none';
                    document.getElementById('resizerWorkspace').style.display = 'block';
                };
            };
            reader.readAsDataURL(file);
        }
    });
}

resizeWidth?.addEventListener('input', () => {
    if (aspectRatioCheck.checked && originalAspect) {
        resizeHeight.value = Math.round(resizeWidth.value / originalAspect);
    }
});

resizeHeight?.addEventListener('input', () => {
    if (aspectRatioCheck.checked && originalAspect) {
        resizeWidth.value = Math.round(resizeHeight.value * originalAspect);
    }
});

document.getElementById('downloadResizeBtn')?.addEventListener('click', () => {
    if (!resizeImgObj) return;
    const canvas = document.createElement('canvas');
    canvas.width = parseInt(resizeWidth.value) || resizeImgObj.width;
    canvas.height = parseInt(resizeHeight.value) || resizeImgObj.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(resizeImgObj, 0, 0, canvas.width, canvas.height);

    const link = document.createElement('a');
    link.download = 'resized_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Resized image downloaded successfully');
});

function setupConverter(inputId, dropId, workId, previewId, downloadId, targetFormat, ext) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.src = evt.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (targetFormat === 'image/jpeg') {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    ctx.drawImage(img, 0, 0);
                    const converted = canvas.toDataURL(targetFormat, 0.92);
                    document.getElementById(previewId).src = converted;
                    document.getElementById(dropId).style.display = 'none';
                    document.getElementById(workId).style.display = 'block';

                    document.getElementById(downloadId).onclick = () => {
                        const link = document.createElement('a');
                        link.download = `converted_image.${ext}`;
                        link.href = converted;
                        link.click();
                        showToast(`Image converted and downloaded as ${ext.toUpperCase()}`);
                    };
                };
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

setupConverter('jpgPngInput', 'dropZoneJpgPng', 'jpgPngWorkspace', 'jpgPngPreview', 'downloadJpgPngBtn', 'image/png', 'png');
setupConverter('pngJpgInput', 'dropZonePngJpg', 'pngJpgWorkspace', 'pngJpgPreview', 'downloadPngJpgBtn', 'image/jpeg', 'jpg');

let convertImgObj = null;
const converterInput = document.getElementById('converterInput');
if (converterInput) {
    converterInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.src = evt.target.result;
                img.onload = () => {
                    convertImgObj = img;
                    document.getElementById('converterPreview').src = evt.target.result;
                    document.getElementById('dropZoneConverter').style.display = 'none';
                    document.getElementById('converterWorkspace').style.display = 'block';
                };
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
}

document.getElementById('downloadConvertBtn')?.addEventListener('click', () => {
    if (!convertImgObj) return;
    const format = document.getElementById('targetFormat').value;
    const canvas = document.createElement('canvas');
    canvas.width = convertImgObj.width;
    canvas.height = convertImgObj.height;
    const ctx = canvas.getContext('2d');

    if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(convertImgObj, 0, 0);

    const ext = format.split('/')[1];
    const link = document.createElement('a');
    link.download = `converted.${ext}`;
    link.href = canvas.toDataURL(format, 0.92);
    link.click();
    showToast(`Converted and downloaded as ${ext.toUpperCase()}`);
});

function resetTool(type) {
    if (type === 'compressor') {
        document.getElementById('compressorWorkspace').style.display = 'none';
        document.getElementById('dropZoneCompressor').style.display = 'block';
        document.getElementById('compressorInput').value = '';
    } else if (type === 'resizer') {
        document.getElementById('resizerWorkspace').style.display = 'none';
        document.getElementById('dropZoneResizer').style.display = 'block';
        document.getElementById('resizerInput').value = '';
    } else if (type === 'jpgPng') {
        document.getElementById('jpgPngWorkspace').style.display = 'none';
        document.getElementById('dropZoneJpgPng').style.display = 'block';
        document.getElementById('jpgPngInput').value = '';
    } else if (type === 'pngJpg') {
        document.getElementById('pngJpgWorkspace').style.display = 'none';
        document.getElementById('dropZonePngJpg').style.display = 'block';
        document.getElementById('pngJpgInput').value = '';
    } else if (type === 'converter') {
        document.getElementById('converterWorkspace').style.display = 'none';
        document.getElementById('dropZoneConverter').style.display = 'block';
        document.getElementById('converterInput').value = '';
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    showToast('Your message has been submitted successfully');
    document.getElementById('contactForm').reset();
}