// History view rendering

import { formatFileSize, formatNumber, formatDate, escapeHtml } from './utils.js';

// Render the History view
export function renderHistory(scanHistory, activeScanId) {
    const historyElement = document.getElementById('view-history');
    if (!historyElement) return;

    if (!scanHistory || scanHistory.length === 0) {
        historyElement.innerHTML = `
            <div class="view-empty-panel">
                <div class="empty-state">
                    <h3 class="empty-state-title">No previous scans</h3>
                    <p class="empty-state-instruction">
                        Completed scans will appear here.
                    </p>
                    <button type="button" class="select-folder-btn mt-4" data-go-to-view="dashboard">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Sort newest scans first
    const sortedScans = [...scanHistory].sort((a, b) => (b.scannedAt || 0) - (a.scannedAt || 0));

    historyElement.innerHTML = `
        <div class="history-wrapper">
            <header class="view-header history-header">
                <div class="view-header-title-group">
                    <h2 class="view-title">Scan History</h2>
                    <p class="view-subtitle">Past folder analyses stored securely in your browser's IndexedDB.</p>
                </div>
                <div class="history-top-actions">
                    <button type="button" id="clear-all-history-btn" class="btn-secondary btn-danger-subtle">
                        Clear History
                    </button>
                </div>
            </header>

            <div class="data-table-wrapper history-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Folder Name</th>
                            <th>Scan Date</th>
                            <th class="text-right">Total Files</th>
                            <th class="text-right">Total Folders</th>
                            <th class="text-right">Total Size</th>
                            <th class="text-center" style="width: 150px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedScans.map(scan => {
                            const isCurrentlyActive = scan.id === activeScanId;
                            return `
                                <tr class="${isCurrentlyActive ? 'row-active-scan' : ''}">
                                    <td>
                                        <div class="history-folder-cell">
                                            <span class="folder-mini-icon" aria-hidden="true">&#128193;</span>
                                            <strong class="font-medium cell-primary">${escapeHtml(scan.folderName || 'Folder')}</strong>
                                            ${isCurrentlyActive ? '<span class="badge-active-pill">Loaded</span>' : ''}
                                        </div>
                                    </td>
                                    <td class="font-mono text-xs text-secondary">${escapeHtml(formatDate(scan.scannedAt))}</td>
                                    <td class="text-right font-mono text-xs">${formatNumber(scan.totalFiles || 0)}</td>
                                    <td class="text-right font-mono text-xs">${formatNumber(scan.totalDirectories || 0)}</td>
                                    <td class="text-right font-mono text-xs">${formatFileSize(scan.totalSize || 0)}</td>
                                    <td class="text-center">
                                        <div class="table-actions-group">
                                            <button type="button" class="btn-table-action" data-action="view-scan" data-scan-id="${escapeHtml(scan.id)}">
                                                View
                                            </button>
                                            <button type="button" class="btn-table-action btn-delete-scan" data-action="delete-scan" data-scan-id="${escapeHtml(scan.id)}">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
