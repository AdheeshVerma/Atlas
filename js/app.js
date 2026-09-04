import { saveScanResult, getAllScanResults } from './database.js';
const selectFolderButton = document.getElementById('select-folder-btn');

selectFolderButton.addEventListener('click', async () => {
    try {
        const fsHandle = await window.showDirectoryPicker(); //return an object representing the selected folder (FileSystemDirectoryHandle)

        const worker = new Worker("./workers/worker.js", { type: "module" });
        worker.postMessage({ type: "SCAN_FOLDER", handle: fsHandle });

        worker.addEventListener('message', async (event) => {
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
                const scanData = {
                    id: crypto.randomUUID(),
                    folderName: fsHandle.name,
                    scannedAt: Date.now(),
                    totalFiles: data.scanResult.totalFiles,
                    totalDirectories: data.scanResult.totalDirectories,
                    totalSize: data.scanResult.totalSize,
                    analysisResults: data.analysis,
                    duplicates: data.duplicates
                }
                await saveScanResult(scanData);
                console.log("Scan data saved to IndexedDB:", scanData);
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

const scanHistory = await getAllScanResults();
console.log("Scan History from IndexedDB:", scanHistory);