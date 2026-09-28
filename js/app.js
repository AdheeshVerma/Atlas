import { saveScanResult, getAllScanResults, getScanById, clearAllScans, deleteScanById } from './database.js';
import { exportAsJSON } from './export.js';
import {
    setupNavigation,
    showView,
    updateDuplicatesBadge,
    showScanningUI,
    hideScanningUI,
    updateScanningProgress,
    renderDashboard,
    renderAnalysis,
    renderDuplicates,
    renderHistory
} from './ui.js';

let currentScan = null;
let scanHistory = [];
let activeWorker = null;
let isScanning = false;

function initNavigation() {
    setupNavigation((viewName) => {
        if (viewName === 'history') {
            loadHistory();
        }
    });
}

function setupTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const savedTheme = localStorage.getItem('atlas_theme');
    if (savedTheme) {
        document.documentElement.dataset.theme = savedTheme;
        themeBtn.textContent = savedTheme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem('atlas_theme', nextTheme);
        themeBtn.textContent = nextTheme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
    });
}

function renderAllViews() {
    renderDashboard(currentScan);
    renderAnalysis(currentScan);
    renderDuplicates(currentScan);

    const activeId = currentScan ? currentScan.id : null;
    renderHistory(scanHistory, activeId);

    const duplicateGroupsCount = currentScan?.duplicates?.groupAnalysis?.length || 0;
    updateDuplicatesBadge(duplicateGroupsCount);
}

async function loadHistory() {
    try {
        scanHistory = await getAllScanResults();
        const activeId = currentScan ? currentScan.id : null;
        renderHistory(scanHistory, activeId);
    } catch (error) {
        console.error('Error loading history from IndexedDB:', error);
    }
}

async function selectFolder() {
    if (isScanning) return;

    try {
        if ('showDirectoryPicker' in window) {
            const fsHandle = await window.showDirectoryPicker();
            startScan(fsHandle);
        } else {
            const folderInput = document.getElementById('folder-input');
            if (folderInput) {
                folderInput.click();
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Folder selection was canceled by the user.');
        } else {
            console.error('Error selecting folder:', error);
            alert(`Error opening folder: ${error.message}`);
        }
    }
}

function startScan(fsHandle) {
    if (!fsHandle) return;

    isScanning = true;

    showScanningUI();

    let filesCount = 0;
    let dirsCount = 0;

    activeWorker = new Worker('./workers/worker.js', { type: 'module' });
    activeWorker.postMessage({ type: 'SCAN_FOLDER', handle: fsHandle });

    activeWorker.addEventListener('message', async (event) => {
        if (!isScanning) return;
        const data = event.data;

        if (data.type === 'SCAN_PROGRESS') {
            filesCount = data.progress?.filesScanned || 0;
            dirsCount = data.progress?.directoriesScanned || 0;
            updateScanningProgress(filesCount, dirsCount, 'scanning');
        } else if (data.type === 'ANALYSIS_STARTED') {
            updateScanningProgress(filesCount, dirsCount, 'analyzing');
        } else if (data.type === 'DUPLICATION DETECTION STARTED') {
            updateScanningProgress(filesCount, dirsCount, 'duplicates');
        } else if (data.type === 'SCAN_COMPLETE') {
            updateScanningProgress(filesCount, dirsCount, 'complete');

            const scanData = {
                id: crypto.randomUUID(),
                folderName: fsHandle.name,
                scannedAt: Date.now(),
                totalFiles: data.scanResult.totalFiles,
                totalDirectories: data.scanResult.totalDirectories,
                totalSize: data.scanResult.totalSize,
                analysisResults: data.analysis,
                duplicates: data.duplicates
            };

            try {
                await saveScanResult(scanData);
            } catch (dbError) {
                console.error('Error saving scan to IndexedDB:', dbError);
            }

            setTimeout(() => {
                isScanning = false;
                hideScanningUI();
                currentScan = scanData;
                loadHistory();
                renderAllViews();
                showView('dashboard');
                activeWorker = null;
            }, 600);
        }
    });

    activeWorker.addEventListener('error', (event) => {
        console.error('Worker error:', event.message);
        isScanning = false;
        hideScanningUI();
        if (activeWorker) {
            activeWorker.terminate();
            activeWorker = null;
        }
        alert(`Scanning error: ${event.message}`);
    });
}

function cancelScan() {
    isScanning = false;
    if (activeWorker) {
        activeWorker.terminate();
        activeWorker = null;
    }
    hideScanningUI();
}

function setupEventListeners() {
    const cancelBtn = document.getElementById('cancel-scan-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            cancelScan();
        });
    }

    document.addEventListener('click', async (event) => {
        const target = event.target;

        if (target.matches('#select-folder-btn') || target.matches('#rescan-folder-btn')) {
            selectFolder();
            return;
        }

        if (target.matches('#export-json-btn')) {
            if (currentScan) {
                exportAsJSON(currentScan);
            }
            return;
        }

        const navLink = target.closest('[data-go-to-view]');
        if (navLink) {
            showView(navLink.dataset.goToView);
            return;
        }

        const viewBtn = target.closest('[data-action="view-scan"]');
        if (viewBtn) {
            const scanId = viewBtn.dataset.scanId;
            try {
                const found = await getScanById(scanId);
                if (found) {
                    currentScan = found;
                    renderAllViews();
                    showView('dashboard');
                }
            } catch (err) {
                console.error('Error opening scan:', err);
            }
            return;
        }

        const deleteBtn = target.closest('[data-action="delete-scan"]');
        if (deleteBtn) {
            const scanId = deleteBtn.dataset.scanId;
            const confirmed = window.confirm('Delete this scan from history?');
            if (confirmed) {
                await deleteScanById(scanId);
                if (currentScan && currentScan.id === scanId) {
                    currentScan = null;
                }
                await loadHistory();
                renderAllViews();
            }
            return;
        }

        if (target.matches('#clear-all-history-btn')) {
            const confirmed = window.confirm('Clear all scan history? This cannot be undone.');
            if (confirmed) {
                await clearAllScans();
                scanHistory = [];
                renderHistory([], null);
            }
            return;
        }
    });

    document.addEventListener('dragover', (event) => {
        const dropZone = event.target.closest('#drop-zone');
        if (dropZone) {
            event.preventDefault();
            dropZone.classList.add('drag-over');
        }
    });

    document.addEventListener('dragleave', (event) => {
        const dropZone = event.target.closest('#drop-zone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    });

    document.addEventListener('drop', async (event) => {
        const dropZone = event.target.closest('#drop-zone');
        if (!dropZone) return;

        event.preventDefault();
        dropZone.classList.remove('drag-over');

        const items = event.dataTransfer?.items;
        if (!items) return;

        for (const item of items) {
            if (item.kind === 'file' && item.getAsFileSystemHandle) {
                const handle = await item.getAsFileSystemHandle();
                if (handle && handle.kind === 'directory') {
                    startScan(handle);
                    return;
                }
            }
        }

        selectFolder();
    });

    document.addEventListener('click', (event) => {
        const dropZone = event.target.closest('#drop-zone');
        if (dropZone && !event.target.matches('#select-folder-btn')) {
            selectFolder();
        }
    });
}

async function initApp() {
    isScanning = false;
    hideScanningUI();

    initNavigation();
    setupTheme();
    setupEventListeners();

    renderAllViews();

    await loadHistory();
}

window.atlasTestScan = (testScanData) => {
    currentScan = testScanData;
    renderAllViews();
    showView('dashboard');
};

initApp();
