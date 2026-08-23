function buildExtensionAnalysis(scanResult) {
    const fileExts = new Map();
    for (const file of scanResult.files) {
        const extension = file.extension || "no_extension";
        if (fileExts.has(extension)) {
            const existing = fileExts.get(extension);
            existing.count++;
            existing.totalSize += file.size;
            fileExts.set(extension, existing);
        } else {
            fileExts.set(extension, { count: 1, totalSize: file.size });
        }
    }

    const entries = Array.from(fileExts.entries()).map(([extension, data]) => ({
        extension,
        count: data.count,
        totalSize: data.totalSize,
        percentage: scanResult.totalSize === 0
            ? 0
            : (data.totalSize / scanResult.totalSize) * 100
    })).sort((a, b) => b.totalSize - a.totalSize); // sort by total size in descending order;
    return entries;
}
function buildTypeAnalysis(scanResult) {
    const fileTypes = new Map();
    for (const file of scanResult.files) {
        const type = file.type.split('/')[0] || "unknown";
        if (fileTypes.has(type)) {
            const existing = fileTypes.get(type);
            existing.count++;
            existing.totalSize += file.size;
            fileTypes.set(type, existing);
        } else {
            fileTypes.set(type, { count: 1, totalSize: file.size });
        }
    }
    const entries = Array.from(fileTypes.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        totalSize: data.totalSize,
        percentage: scanResult.totalSize === 0
            ? 0
            : (data.totalSize / scanResult.totalSize) * 100
    })).sort((a, b) => b.totalSize - a.totalSize); // sort by total size in descending order

    return entries;
}
function getLargestFiles(scanResult) {
    const sortedFiles = [...scanResult.files].sort((a, b) => b.size - a.size);
    return sortedFiles.slice(0, 10);
}
export const analyzeScan = (scanResult) => {
    const analysisResult = {
        byExtension: buildExtensionAnalysis(scanResult),
        byType: buildTypeAnalysis(scanResult),
        largestFiles: getLargestFiles(scanResult),

    };
    return analysisResult;
}