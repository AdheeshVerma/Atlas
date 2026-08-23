function buildFileTypeMap(scanResult) {
    const fileTypes = new Map();
    for (const file of scanResult.files) {
        const extension = file.extension || "no_extension";
        if (fileTypes.has(extension)) {
            const existing = fileTypes.get(extension);
            existing.count++;
            existing.totalSize += file.size;
            fileTypes.set(extension, existing);
        } else {
            fileTypes.set(extension, { count: 1, totalSize: file.size });
        }
    }
    return fileTypes;
}
export const analyzeScan = (scanResult) => {
    const fileTypes = buildFileTypeMap(scanResult);
    const entries = Array.from(fileTypes.entries()).map(([extension, data]) => ({
        extension,
        count: data.count,
        totalSize: data.totalSize
    })).sort((a, b) => b.totalSize - a.totalSize); // Sort by total size in descending order
    return entries;
}