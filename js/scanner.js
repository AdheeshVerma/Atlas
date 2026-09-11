
async function listDirectoryContents(fsHandle, path = "", scanResult, onProgress, shouldCancel) {
    for await (const [fname, handle] of fsHandle.entries()) {
        if (shouldCancel()) {
            return true;
        }
        const currentPath = path ? `${path}/${fname}` : fname;
        if (handle.kind === 'directory') {
            scanResult.directories.push(currentPath);
            scanResult.totalDirectories++;
            const cancelled = await listDirectoryContents(handle, currentPath, scanResult, onProgress, shouldCancel);
            if (cancelled) {
                return true;
            }
        }
        else if (handle.kind === 'file') {
            const file = await handle.getFile();
            const fileInfo = {
                name: file.name,

                path: currentPath,

                extension: file.name.includes(".")
                    ? file.name.split(".").pop()
                    : "",

                size: file.size,

                type: file.type,

                lastModified: file.lastModified, //not converting to date cause would need to compare later on
                fileHandle: handle // Store the FileSystemFileHandle for later use
            };
            scanResult.files.push(fileInfo);
            scanResult.totalFiles++;
            scanResult.totalSize += file.size;
            if (scanResult.totalFiles % 100 == 0) {
                onProgress({
                    filesScanned: scanResult.totalFiles,
                    directoriesScanned: scanResult.totalDirectories,
                })
            }
        }
    }
    return false;
}

export async function scanDirectory(fsHandle, onProgress = () => { }, shouldCancel = () => { }) {
    const scanResult = {
        files: [],
        directories: [],
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0
    }
    const cancelled = await listDirectoryContents(
        fsHandle,
        "",
        scanResult,
        onProgress,
        shouldCancel
    );
    return { scanResult, cancelled };
}
console.log("Into scanner.js");
