// Analysis view rendering

import { formatFileSize, formatNumber, formatDate, escapeHtml } from './utils.js';

// Render the Analysis view
export function renderAnalysis(scanData) {
    const analysisElement = document.getElementById('view-analysis');
    if (!analysisElement) return;

    if (!scanData) {
        analysisElement.innerHTML = `
            <div class="view-empty-panel">
                <div class="empty-state">
                    <h3 class="empty-state-title">No analysis available</h3>
                    <p class="empty-state-instruction">
                        Scan a folder to see storage insights.
                    </p>
                    <button type="button" class="select-folder-btn mt-4" data-go-to-view="dashboard">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        `;
        return;
    }

    const analysis = scanData.analysisResults || scanData.analysis || {};
    const fileTypes = analysis.byType || [];
    const fileExtensions = analysis.byExtension || [];
    const largestFiles = analysis.largestFiles || [];
    const directories = analysis.directories || [];
    const oldestFiles = analysis.oldestFiles || [];
    const newestFiles = analysis.newestFiles || [];

    analysisElement.innerHTML = `
        <div class="analysis-wrapper">
            <header class="view-header">
                <div class="view-header-title-group">
                    <h2 class="view-title">Storage Analysis</h2>
                    <p class="view-subtitle">Detailed breakdown of metadata, extensions, and directory distribution.</p>
                </div>
            </header>

            <div class="analysis-grid">
                <!-- 1. File Types -->
                <section class="analysis-card">
                    <header class="card-header">
                        <h3 class="card-title">File Types</h3>
                        <span class="card-badge">${formatNumber(fileTypes.length)} categories</span>
                    </header>
                    <div class="card-body">
                        ${fileTypes.length > 0 ? `
                            <div class="type-distribution-list">
                                ${fileTypes.map(item => {
                                    const pct = Number(item.percentage || 0).toFixed(1);
                                    return `
                                        <div class="type-item">
                                            <div class="type-header">
                                                <span class="type-label font-medium">${escapeHtml(item.type || 'other')}</span>
                                                <span class="type-stats font-mono text-xs">
                                                    ${formatNumber(item.count)} files &bull; ${formatFileSize(item.totalSize)} &bull; ${pct}%
                                                </span>
                                            </div>
                                            <div class="type-bar-track">
                                                <div class="type-bar-fill" style="width: ${Math.min(100, Math.max(2, pct))}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No type metadata recorded.</p>
                        `}
                    </div>
                </section>

                <!-- 2. File Extensions -->
                <section class="analysis-card">
                    <header class="card-header">
                        <h3 class="card-title">File Extensions</h3>
                        <span class="card-badge">${formatNumber(fileExtensions.length)} extensions</span>
                    </header>
                    <div class="card-body">
                        ${fileExtensions.length > 0 ? `
                            <div class="data-table-wrapper table-scrollable">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Extension</th>
                                            <th class="text-right">Files</th>
                                            <th class="text-right">Total Size</th>
                                            <th class="text-right" style="width: 120px;">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${fileExtensions.map(ext => {
                                            const extName = ext.extension === 'no_extension' ? '(none)' : `.${ext.extension}`;
                                            const pct = Number(ext.percentage || 0).toFixed(1);
                                            return `
                                                <tr>
                                                    <td><span class="ext-tag font-mono">${escapeHtml(extName)}</span></td>
                                                    <td class="text-right font-mono text-xs">${formatNumber(ext.count)}</td>
                                                    <td class="text-right font-mono text-xs">${formatFileSize(ext.totalSize)}</td>
                                                    <td class="text-right">
                                                        <div class="pct-cell">
                                                            <span class="pct-label font-mono text-xs">${pct}%</span>
                                                            <div class="pct-bar-track">
                                                                <div class="pct-bar-fill" style="width: ${Math.min(100, Math.max(2, pct))}%"></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No extension data found.</p>
                        `}
                    </div>
                </section>

                <!-- 3. Largest Files -->
                <section class="analysis-card full-width">
                    <header class="card-header">
                        <h3 class="card-title">Largest Files</h3>
                        <span class="card-badge">Top ${largestFiles.length}</span>
                    </header>
                    <div class="card-body">
                        ${largestFiles.length > 0 ? `
                            <div class="data-table-wrapper">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Filename</th>
                                            <th>Location</th>
                                            <th class="text-right">Size</th>
                                            <th>Modified</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${largestFiles.map(file => `
                                            <tr>
                                                <td class="font-medium cell-primary">${escapeHtml(file.name)}</td>
                                                <td class="cell-path font-mono text-xs">${escapeHtml(file.path)}</td>
                                                <td class="text-right font-mono text-xs">${formatFileSize(file.size)}</td>
                                                <td class="font-mono text-xs text-muted">${formatDate(file.lastModified)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No files scanned.</p>
                        `}
                    </div>
                </section>

                <!-- 4. Directory Usage -->
                <section class="analysis-card full-width">
                    <header class="card-header">
                        <h3 class="card-title">Directory Usage</h3>
                        <span class="card-badge">${formatNumber(directories.length)} folders</span>
                    </header>
                    <div class="card-body">
                        ${directories.length > 0 ? `
                            <div class="data-table-wrapper">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Directory</th>
                                            <th class="text-right">Files</th>
                                            <th class="text-right">Total Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${directories.map(dir => `
                                            <tr>
                                                <td class="font-mono text-xs cell-primary">
                                                    <span class="folder-mini-icon" aria-hidden="true">&#128193;</span>
                                                    ${escapeHtml(dir.directory)}
                                                </td>
                                                <td class="text-right font-mono text-xs">${formatNumber(dir.fileCount)}</td>
                                                <td class="text-right font-mono text-xs">${formatFileSize(dir.totalSize)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No subdirectories found.</p>
                        `}
                    </div>
                </section>

                <!-- 5. Oldest Files -->
                <section class="analysis-card">
                    <header class="card-header">
                        <h3 class="card-title">Oldest Files</h3>
                        <span class="card-badge">Earliest ${oldestFiles.length}</span>
                    </header>
                    <div class="card-body">
                        ${oldestFiles.length > 0 ? `
                            <div class="data-table-wrapper">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Filename</th>
                                            <th>Location</th>
                                            <th>Modified</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${oldestFiles.map(file => `
                                            <tr>
                                                <td class="font-medium cell-primary">${escapeHtml(file.name)}</td>
                                                <td class="cell-path font-mono text-xs">${escapeHtml(file.path)}</td>
                                                <td class="font-mono text-xs text-muted">${formatDate(file.lastModified)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No files scanned.</p>
                        `}
                    </div>
                </section>

                <!-- 6. Newest Files -->
                <section class="analysis-card">
                    <header class="card-header">
                        <h3 class="card-title">Newest Files</h3>
                        <span class="card-badge">Recent ${newestFiles.length}</span>
                    </header>
                    <div class="card-body">
                        ${newestFiles.length > 0 ? `
                            <div class="data-table-wrapper">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Filename</th>
                                            <th>Location</th>
                                            <th>Modified</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${newestFiles.map(file => `
                                            <tr>
                                                <td class="font-medium cell-primary">${escapeHtml(file.name)}</td>
                                                <td class="cell-path font-mono text-xs">${escapeHtml(file.path)}</td>
                                                <td class="font-mono text-xs text-muted">${formatDate(file.lastModified)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <p class="text-muted text-sm">No files scanned.</p>
                        `}
                    </div>
                </section>
            </div>
        </div>
    `;
}
