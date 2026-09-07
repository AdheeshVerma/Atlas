// Dashboard view rendering

import { formatFileSize, formatNumber, formatDate, escapeHtml } from './utils.js';

// Render the Dashboard view
export function renderDashboard(scanData) {
    const dashboardElement = document.getElementById('view-dashboard');
    if (!dashboardElement) return;

    // If there is no scan yet, show the empty state with the folder selector and drop zone
    if (!scanData) {
        dashboardElement.innerHTML = `
            <div class="dashboard-empty-wrapper">
                <section class="scan-section" aria-labelledby="scan-heading">
                    <header class="section-header">
                        <h2 id="scan-heading" class="section-title">Understand your storage.</h2>
                        <p class="section-description">
                            Atlas analyzes folders directly on your device. Your files and metadata never leave your browser.
                        </p>
                    </header>

                    <div class="scan-controls">
                        <button type="button" id="select-folder-btn" class="select-folder-btn">
                            Select Folder
                        </button>

                        <div id="drop-zone" class="drop-zone" tabindex="0" role="region" aria-label="Folder drop zone">
                            <p class="drop-zone-prompt">Drop a folder here</p>
                            <p class="drop-zone-subtext">or click Select Folder to begin</p>
                        </div>
                    </div>
                </section>

                <section class="privacy-section" aria-labelledby="privacy-heading">
                    <h2 id="privacy-heading" class="section-title">Your files stay on your device</h2>
                    <div class="privacy-details">
                        <article class="privacy-point">
                            <h3 class="privacy-point-title">Local Browser Execution</h3>
                            <p class="privacy-point-text">
                                All filesystem scanning, indexing, and analysis run locally inside your browser sandbox.
                            </p>
                        </article>
                        <article class="privacy-point">
                            <h3 class="privacy-point-title">Zero Server Uploads</h3>
                            <p class="privacy-point-text">
                                No files, filenames, directory structures, or metadata are ever copied, uploaded, or transmitted to any server.
                            </p>
                        </article>
                        <article class="privacy-point">
                            <h3 class="privacy-point-title">Private &amp; Offline</h3>
                            <p class="privacy-point-text">
                                Atlas operates independently of external services and functions entirely offline without network tracking.
                            </p>
                        </article>
                    </div>
                </section>

                <section class="dashboard-section" aria-labelledby="dashboard-overview-heading">
                    <div class="dashboard-header">
                        <h2 id="dashboard-overview-heading" class="section-title">Storage Overview</h2>
                    </div>

                    <div class="stats-overview">
                        <div class="empty-state">
                            <h3 class="empty-state-title">No scan yet</h3>
                            <p class="empty-state-instruction">
                                Select a folder to begin analyzing storage.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        `;
        return;
    }

    // When a scan is available, show the active scan dashboard
    const folderName = scanData.folderName || 'Selected Folder';
    const scanDate = formatDate(scanData.scannedAt);
    const totalSize = scanData.totalSize || 0;
    const totalFiles = scanData.totalFiles || 0;
    const totalFolders = scanData.totalDirectories || 0;
    const duplicateSavings = scanData.duplicates?.potentialSaving || 0;
    const duplicateGroups = scanData.duplicates?.groupAnalysis || [];

    const analysis = scanData.analysisResults || scanData.analysis || {};
    const fileTypes = analysis.byType || [];
    const largestFiles = analysis.largestFiles || [];

    dashboardElement.innerHTML = `
        <div class="dashboard-active-wrapper">
            <!-- Active Scan Summary Bar -->
            <div class="scan-summary-bar">
                <div class="scan-summary-info">
                    <span class="folder-tag">
                        <span class="folder-icon" aria-hidden="true">&#128193;</span>
                        <strong class="folder-name">${escapeHtml(folderName)}</strong>
                    </span>
                    <span class="scan-meta">Scanned ${escapeHtml(scanDate)}</span>
                </div>
                <div class="scan-summary-actions">
                    <button type="button" id="export-json-btn" class="btn-secondary">
                        Export JSON
                    </button>
                    <button type="button" id="rescan-folder-btn" class="select-folder-btn btn-sm">
                        Scan Another Folder
                    </button>
                </div>
            </div>

            <!-- 4 Storage Overview Statistic Cards -->
            <section class="dashboard-section" aria-labelledby="storage-overview-heading">
                <div class="dashboard-header">
                    <h2 id="storage-overview-heading" class="section-title">Storage Overview</h2>
                </div>

                <div class="stats-overview">
                    <div class="stats-grid stats-grid-4">
                        <article class="stat-card">
                            <h3 class="stat-label">Total Size</h3>
                            <p class="stat-value">${formatFileSize(totalSize)}</p>
                        </article>
                        <article class="stat-card">
                            <h3 class="stat-label">Total Files</h3>
                            <p class="stat-value">${formatNumber(totalFiles)}</p>
                        </article>
                        <article class="stat-card">
                            <h3 class="stat-label">Total Folders</h3>
                            <p class="stat-value">${formatNumber(totalFolders)}</p>
                        </article>
                        <article class="stat-card">
                            <h3 class="stat-label">Duplicate Savings</h3>
                            <p class="stat-value ${duplicateSavings > 0 ? 'text-accent' : ''}">${formatFileSize(duplicateSavings)}</p>
                        </article>
                    </div>
                </div>
            </section>

            <!-- Quick Summaries Grid -->
            <div class="quick-insights-grid">
                <!-- File Types Summary -->
                <article class="insight-card">
                    <div class="insight-card-header">
                        <h3 class="insight-card-title">File Types Distribution</h3>
                        <button type="button" class="btn-link" data-go-to-view="analysis">View full analysis &rarr;</button>
                    </div>
                    <div class="insight-card-body">
                        ${fileTypes.length > 0 ? `
                            <div class="type-distribution-list">
                                ${fileTypes.slice(0, 4).map(item => `
                                    <div class="type-distribution-item">
                                        <div class="type-distribution-info">
                                            <span class="type-name">${escapeHtml(item.type || 'other')}</span>
                                            <span class="type-meta">${formatNumber(item.count)} files &bull; ${formatFileSize(item.totalSize)}</span>
                                        </div>
                                        <div class="type-bar-track">
                                            <div class="type-bar-fill" style="width: ${Math.min(100, Math.max(2, item.percentage || 0))}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No type metadata recorded.</p>
                        `}
                    </div>
                </article>

                <!-- Duplicates Summary -->
                <article class="insight-card">
                    <div class="insight-card-header">
                        <h3 class="insight-card-title">Duplicate Detection</h3>
                        <button type="button" class="btn-link" data-go-to-view="duplicates">View duplicates &rarr;</button>
                    </div>
                    <div class="insight-card-body">
                        ${duplicateGroups.length > 0 ? `
                            <div class="dup-quick-summary">
                                <p class="dup-summary-text">
                                    Found <strong>${formatNumber(duplicateGroups.length)} duplicate groups</strong>.
                                </p>
                                <p class="dup-summary-savings">
                                    Potential storage reclaim: <strong>${formatFileSize(duplicateSavings)}</strong>
                                </p>
                                <button type="button" class="btn-secondary btn-sm mt-3" data-go-to-view="duplicates">
                                    Inspect Duplicate Files
                                </button>
                            </div>
                        ` : `
                            <div class="dup-none-box">
                                <span class="dup-status-icon">&#10003;</span>
                                <p class="text-secondary text-sm">No duplicate files detected in this folder.</p>
                            </div>
                        `}
                    </div>
                </article>
            </div>

            <!-- Largest Files Preview -->
            ${largestFiles.length > 0 ? `
                <section class="dashboard-section">
                    <div class="dashboard-header">
                        <h3 class="section-title">Largest Files Preview</h3>
                        <button type="button" class="btn-link" data-go-to-view="analysis">View all largest files &rarr;</button>
                    </div>
                    <div class="data-table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Filename</th>
                                    <th>Location</th>
                                    <th class="text-right">Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${largestFiles.slice(0, 3).map(file => `
                                    <tr>
                                        <td class="cell-primary font-medium">${escapeHtml(file.name)}</td>
                                        <td class="cell-path font-mono text-xs">${escapeHtml(file.path)}</td>
                                        <td class="cell-size text-right font-mono">${formatFileSize(file.size)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}
