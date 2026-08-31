import { scanDirectory } from '../js/scanner.js';
import { analyzeScan } from '../js/analyzer.js';
import { findDuplicates } from '../js/duplicate.js';
self.onmessage = async function (event) {
    const data = event.data;
    if (data.type === "SCAN_FOLDER") {
        const fsHandle = data.handle;
        const { scanResult, cancelled } = await scanDirectory(fsHandle, (progress) => {


            self.postMessage({ type: "SCAN_PROGRESS", progress })

        }, (cancel) => {

            if (cancel) {

                self.postMessage({ type: "SCAN_CANCELLED" });

            }

        });
        if (cancelled) return;
        const analysis = analyzeScan(scanResult);
        console.log('Scan Result', scanResult);
        console.log('Analysis Result', analysis.byExtension);
        console.log('File Types', analysis.byType);
        console.log('Largest Files', analysis.largestFiles);
        console.log('Large Folders', analysis.directories);
        console.log('Oldest Files', analysis.oldestFiles);
        console.log('Newest Files', analysis.newestFiles);
        const duplicates = await findDuplicates(scanResult);
        console.log('Duplicates', duplicates);


        self.postMessage({
            type: "SCAN_COMPLETE",
            scanResult,
            analysis,
            duplicates
        });
    }


}



