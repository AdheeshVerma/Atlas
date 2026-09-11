export function exportAsJSON(scanResult, customFilename = null) {
    const jsonString = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const safeFolderName = (scanResult && scanResult.folderName)
        ? scanResult.folderName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
        : 'atlas_scan';
    const filename = customFilename || `${safeFolderName}_${Date.now()}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
