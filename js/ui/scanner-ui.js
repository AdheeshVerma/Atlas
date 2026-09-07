// Scanning progress and status UI

import { formatNumber } from './utils.js';

// Show the scanning progress box
export function showScanningUI() {
    const progressBox = document.getElementById('scanning-progress-box');
    if (progressBox) {
        progressBox.hidden = false;
    }
    resetScanningUI();
}

// Hide the scanning progress box and reset progress
export function hideScanningUI() {
    const progressBox = document.getElementById('scanning-progress-box');
    if (progressBox) {
        progressBox.hidden = true;
    }
    resetScanningUI();
}

// Reset the scanning UI elements to idle state
export function resetScanningUI() {
    const progressBar = document.getElementById('scan-progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    updateScanningProgress(0, 0, 'scanning');
}

// Update the real-time scanning progress box based on actual worker messages
export function updateScanningProgress(filesScanned, directoriesScanned, currentStage) {
    const filesCounter = document.getElementById('scan-files-counter');
    const dirsCounter = document.getElementById('scan-dirs-counter');
    const stageTitle = document.getElementById('scan-stage-title');
    const progressBar = document.getElementById('scan-progress-bar');

    if (filesCounter) filesCounter.textContent = formatNumber(filesScanned);
    if (dirsCounter) dirsCounter.textContent = formatNumber(directoriesScanned);

    if (stageTitle) {
        if (currentStage === 'scanning') stageTitle.textContent = 'Scanning folder...';
        if (currentStage === 'analyzing') stageTitle.textContent = 'Analyzing filesystem metadata...';
        if (currentStage === 'duplicates') stageTitle.textContent = 'Detecting duplicate files...';
        if (currentStage === 'complete') stageTitle.textContent = 'Scan complete!';
    }

    // Update active stage indicator dots
    const stageIds = ['scanning', 'analyzing', 'duplicates', 'complete'];
    let passed = true;

    for (const stageId of stageIds) {
        const stepEl = document.getElementById(`stage-step-${stageId}`);
        if (!stepEl) continue;

        stepEl.classList.remove('active', 'completed');
        if (stageId === currentStage) {
            stepEl.classList.add('active');
            passed = false;
        } else if (passed) {
            stepEl.classList.add('completed');
        }
    }

    // Set real progress bar width based on current pipeline stage
    if (progressBar) {
        if (currentStage === 'scanning') {
            progressBar.style.width = '25%';
        } else if (currentStage === 'analyzing') {
            progressBar.style.width = '50%';
        } else if (currentStage === 'duplicates') {
            progressBar.style.width = '75%';
        } else if (currentStage === 'complete') {
            progressBar.style.width = '100%';
        }
    }
}
