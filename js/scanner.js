export async function scanDirectory(fsHandle) {
    console.log('Selected folder:', fsHandle);
    for await (const [fname, handle] of fsHandle.entries()) {
        console.log('File name:', fname);
        // console.log('File handle:', handle);
        if (handle.kind === 'directory') {
            await scanDirectory(handle);
        }
    }
}