import { scanDirectory } from './scanner.js';
import { analyzeScan } from './analyzer.js';
import { findDuplicates } from './duplicate.js';
const selectFolderButton = document.getElementById('select-folder-btn');

selectFolderButton.addEventListener('click', async () => {
    try {
        const fsHandle = await window.showDirectoryPicker(); //return an object representing the selected folder (FileSystemDirectoryHandle)

        const worker = new Worker("./workers/worker.js", { type: "module" });
        worker.postMessage({ type: "SCAN_FOLDER", handle: fsHandle });

        worker.addEventListener('message', (event) => {
            const data = event.data;
            if (data.type === "SCAN_PROGRESS") {
                console.log("Scan progress:", data.progress);
            }
            else if (data.type === "ANALYSIS_STARTED") {
                console.log("Analysis started!");
            }
            else if (data.type === "DUPLICATION DETECTION STARTED") {
                console.log("Duplication detection started!");
            }
            else if (data.type === "SCAN_COMPLETE") {
                console.log("Scan complete!");
            }
        });
        worker.addEventListener("error", (event) => {
            console.error("WORKER ERROR:", event.message);
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Folder selection was canceled by the user.');
        }
        else {
            console.error('Error selecting folder:', error);
        }
    }
});

