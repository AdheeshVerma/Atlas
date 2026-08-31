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
function analyzeDirectories(scanResult) {
    const directoryAnalysis = scanResult.directories.map(dir => {
        const filesInDir = scanResult.files.filter(file =>
            file.path.startsWith(`${dir}/`)
        );

        return {
            directory: dir,
            fileCount: filesInDir.length,
            totalSize: filesInDir.reduce(
                (total, file) => total + file.size,
                0
            )
        };
    }).sort((a, b) => b.totalSize - a.totalSize); // sort folders in decending order by size
    return directoryAnalysis;
}
function getOldestFiles(scanResult) {
    const sortedFiles = [...scanResult.files].sort((a, b) => a.lastModified - b.lastModified);
    return sortedFiles.slice(0, 10);
}
function getNewestFiles(scanResult) {
    const sortedFiles = [...scanResult.files].sort((a, b) => b.lastModified - a.lastModified);
    return sortedFiles.slice(0, 10);
}
export const analyzeScan = (scanResult) => {
    const analysisResult = {
        byExtension: buildExtensionAnalysis(scanResult),
        byType: buildTypeAnalysis(scanResult),
        largestFiles: getLargestFiles(scanResult),
        directories: analyzeDirectories(scanResult),
        oldestFiles: getOldestFiles(scanResult),
        newestFiles: getNewestFiles(scanResult)
    };
    return analysisResult;
}