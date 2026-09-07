// Scanning progress and status UI

import { formatNumber } from './utils.js';

// Show the scanning progress box when a scan starts
export function showScanningUI() {
    const progressBox = document.getElementById('scanning-progress-box');
    if (progressBox) {
        progressBox.hidden = false;
        progressBox.classList.add('is-scanning');
        progressBox.classList.remove('is-complete');
    }

    const stageTitle = document.getElementById('scan-stage-title');
    if (stageTitle) {
        stageTitle.textContent = 'Scanning folder...';
    }

    const filesCounter = document.getElementById('scan-files-counter');
    const dirsCounter = document.getElementById('scan-dirs-counter');
    if (filesCounter) filesCounter.textContent = '0';
    if (dirsCounter) dirsCounter.textContent = '0';

    // Start with "Scanning" active
    setStageState('scanning');
}

// Hide the scanning progress box and stop all animations
export function hideScanningUI() {
    const progressBox = document.getElementById('scanning-progress-box');
    if (progressBox) {
        progressBox.hidden = true;
        progressBox.classList.remove('is-scanning', 'is-complete');
    }
    resetScanningUI();
}

// Reset the scanning UI elements to idle state (no active stages, no text)
export function resetScanningUI() {
    const progressBox = document.getElementById('scanning-progress-box');
    if (progressBox) {
        progressBox.classList.remove('is-scanning', 'is-complete');
    }

    const stageTitle = document.getElementById('scan-stage-title');
    if (stageTitle) {
        stageTitle.textContent = '';
    }

    const filesCounter = document.getElementById('scan-files-counter');
    const dirsCounter = document.getElementById('scan-dirs-counter');
    if (filesCounter) filesCounter.textContent = '0';
    if (dirsCounter) dirsCounter.textContent = '0';

    // Clear all stages so none are active or completed
    const stageIds = ['scanning', 'analyzing', 'duplicates', 'complete'];
    for (const stageId of stageIds) {
        const stepEl = document.getElementById(`stage-step-${stageId}`);
        if (stepEl) {
            stepEl.classList.remove('active', 'completed');
        }
    }
}

// Helper to set which stage is active and mark preceding stages as completed
function setStageState(currentStage) {
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
}

// Update the real-time scanning progress box based on actual worker messages
export function updateScanningProgress(filesScanned, directoriesScanned, currentStage) {
    const filesCounter = document.getElementById('scan-files-counter');
    const dirsCounter = document.getElementById('scan-dirs-counter');
    const stageTitle = document.getElementById('scan-stage-title');
    const progressBox = document.getElementById('scanning-progress-box');

    if (filesCounter && typeof filesScanned === 'number') {
        filesCounter.textContent = formatNumber(filesScanned);
    }
    if (dirsCounter && typeof directoriesScanned === 'number') {
        dirsCounter.textContent = formatNumber(directoriesScanned);
    }

    if (stageTitle) {
        if (currentStage === 'scanning') stageTitle.textContent = 'Scanning folder...';
        if (currentStage === 'analyzing') stageTitle.textContent = 'Analyzing filesystem metadata...';
        if (currentStage === 'duplicates') stageTitle.textContent = 'Detecting duplicate files...';
        if (currentStage === 'complete') stageTitle.textContent = 'Scan complete!';
    }

    // When complete, stop the spinner and show full bar
    if (currentStage === 'complete' && progressBox) {
        progressBox.classList.remove('is-scanning');
        progressBox.classList.add('is-complete');
    }

    setStageState(currentStage);
}
