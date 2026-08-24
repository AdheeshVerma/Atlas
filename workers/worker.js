import { scanDirectory } from '../js/scanner.js';
import { analyzeScan } from '../js/analyzer.js';
import { findDuplicates } from '../js/duplicate.js';
self.onmessage = async function (event) {
    const data = event.data;
    if (data.type === "SCAN_FOLDER") {
        const fsHandle = data.handle;
        const scanResult = await scanDirectory(fsHandle);
        const analysis = analyzeScan(scanResult);
        console.log('Scan Result', scanResult);
        console.log('Analysis Result', analysis.byExtension);
        console.log('File Types', analysis.byType);
        console.log('Largest Files', analysis.largestFiles);
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



