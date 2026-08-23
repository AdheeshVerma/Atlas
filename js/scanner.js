
async function listDirectoryContents(fsHandle, path = "", scanResult) {
    for await (const [fname, handle] of fsHandle.entries()) {
        const currentPath = path ? `${path}/${fname}` : fname;
        if (handle.kind === 'directory') {
            scanResult.directories.push(currentPath);
            scanResult.totalDirectories++;
            await listDirectoryContents(handle, currentPath, scanResult);
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

                lastModified: file.lastModified //not converting to date cause would need to compare later on
            };
            scanResult.files.push(fileInfo);
            scanResult.totalFiles++;
            scanResult.totalSize += file.size;
        }
    }
}

export async function scanDirectory(fsHandle) {
    const scanResult = {
        files: [],
        directories: [],
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0
    }
    await listDirectoryContents(fsHandle, "", scanResult);
    return scanResult;
}