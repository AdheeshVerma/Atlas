import { scanDirectory } from './scanner.js';
import { analyzeScan } from './analyzer.js';
const selectFolderButton = document.getElementById('select-folder-btn');

selectFolderButton.addEventListener('click', async () => {
    try {
        const fsHandle = await window.showDirectoryPicker(); //return an object representing the selected folder (FileSystemDirectoryHandle)

        const scanResult = await scanDirectory(fsHandle);
        const analysis = await analyzeScan(scanResult);
        console.log('Scan Result', scanResult);
        console.log('Analysis Result', analysis.byExtension);
        console.log('File Types', analysis.byType);
        console.log('Largest Files', analysis.largestFiles);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Folder selection was canceled by the user.');
        }
        else {
            console.error('Error selecting folder:', error);
        }
    }
});
