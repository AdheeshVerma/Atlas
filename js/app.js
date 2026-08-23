import { scanDirectory } from './scanner.js';
const selectFolderButton = document.getElementById('select-folder-btn');

selectFolderButton.addEventListener('click', async () => {
    try {
        const fsHandle = await window.showDirectoryPicker(); //return an object representing the selected folder (FileSystemDirectoryHandle)

        const scanResult = await scanDirectory(fsHandle);
        console.log('Scan Result', scanResult);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Folder selection was canceled by the user.');
        }
        else {
            console.error('Error selecting folder:', error);
        }
    }
});
