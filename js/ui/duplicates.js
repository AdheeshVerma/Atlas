// Duplicates view rendering

import { formatFileSize, formatNumber, escapeHtml } from './utils.js';

// Render the Duplicates view
export function renderDuplicates(scanData) {
    const duplicatesElement = document.getElementById('view-duplicates');
    if (!duplicatesElement) return;

    if (!scanData) {
        duplicatesElement.innerHTML = `
            <div class="view-empty-panel">
                <div class="empty-state">
                    <h3 class="empty-state-title">No scan yet</h3>
                    <p class="empty-state-instruction">
                        Select a folder to begin analyzing storage.
                    </p>
                    <button type="button" class="select-folder-btn mt-4" data-go-to-view="dashboard">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const duplicates = scanData.duplicates || {};
    const groupAnalysis = duplicates.groupAnalysis || [];
    const potentialSaving = duplicates.potentialSaving || 0;

    if (groupAnalysis.length === 0) {
        duplicatesElement.innerHTML = `
            <div class="view-empty-panel">
                <div class="empty-state">
                    <h3 class="empty-state-title">No duplicate files found</h3>
                    <p class="empty-state-instruction">
                        Atlas checked all files and found no identical files in this folder.
                    </p>
                    <button type="button" class="btn-secondary mt-4" data-go-to-view="analysis">
                        View Storage Analysis
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Count total duplicate files across groups
    let totalDuplicateFiles = 0;
    for (const group of groupAnalysis) {
        totalDuplicateFiles += group.fileCount || (group.files ? group.files.length : 0);
    }

    duplicatesElement.innerHTML = `
        <div class="duplicates-wrapper">
            <header class="view-header">
                <div class="view-header-title-group">
                    <h2 class="view-title">Duplicate Files</h2>
                    <p class="view-subtitle">Files with identical contents detected via local SHA-256 hashing.</p>
                </div>
            </header>

            <!-- Duplicates Overview Stat Cards -->
            <section class="duplicate-stats-bar">
                <div class="stats-grid stats-grid-3">
                    <article class="stat-card">
                        <h3 class="stat-label">Potential Storage Savings</h3>
                        <p class="stat-value text-accent">${formatFileSize(potentialSaving)}</p>
                    </article>
                    <article class="stat-card">
                        <h3 class="stat-label">Duplicate Groups</h3>
                        <p class="stat-value">${formatNumber(groupAnalysis.length)}</p>
                    </article>
                    <article class="stat-card">
                        <h3 class="stat-label">Identical Files Found</h3>
                        <p class="stat-value">${formatNumber(totalDuplicateFiles)}</p>
                    </article>
                </div>
            </section>

            <div class="duplicates-notice-banner">
                <span class="status-indicator"></span>
                <span>Analysis mode only &mdash; file deletion is not enabled.</span>
            </div>

            <!-- Expandable Duplicate Groups List -->
            <div class="duplicate-groups-list">
                ${groupAnalysis.map((group, index) => {
                    const groupSaving = group.potentialSaving || 0;
                    const fileCount = group.fileCount || (group.files ? group.files.length : 0);
                    const sizePerFile = group.sizePerFile || 0;

                    return `
                        <details class="duplicate-card" ${index < 5 ? 'open' : ''}>
                            <summary class="duplicate-header">
                                <div class="duplicate-header-main">
                                    <span class="duplicate-group-badge font-mono">Group #${index + 1}</span>
                                    <span class="duplicate-count-label">${formatNumber(fileCount)} identical files</span>
                                </div>
                                <div class="duplicate-header-side">
                                    <span class="duplicate-saving-tag font-mono">${formatFileSize(groupSaving)} potential saving</span>
                                    <span class="disclosure-chevron" aria-hidden="true">&#9662;</span>
                                </div>
                            </summary>

                            <div class="duplicate-body">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 80px;">Status</th>
                                            <th>Filename</th>
                                            <th>Location</th>
                                            <th class="text-right">Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(group.files || []).map((fileItem, fIndex) => {
                                            const fileName = typeof fileItem === 'string' ? fileItem : (fileItem.name || 'file');
                                            const filePath = typeof fileItem === 'string' ? '(path unavailable)' : (fileItem.path || fileName);
                                            const fileSize = typeof fileItem === 'string' ? sizePerFile : (fileItem.size ?? sizePerFile);
                                            const isFirst = fIndex === 0;

                                            return `
                                                <tr>
                                                    <td>
                                                        <span class="status-badge ${isFirst ? 'badge-original' : 'badge-duplicate'}">
                                                            ${isFirst ? 'Original' : 'Duplicate'}
                                                        </span>
                                                    </td>
                                                    <td class="font-medium cell-primary">${escapeHtml(fileName)}</td>
                                                    <td class="cell-path font-mono text-xs">${escapeHtml(filePath)}</td>
                                                    <td class="text-right font-mono text-xs">${formatFileSize(fileSize)}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </details>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}
