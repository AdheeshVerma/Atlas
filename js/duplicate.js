async function hashFile(file) {
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    // console.log(`Hash of file ${file.name} is ${hashHex}`);;
    return hashHex;
}
async function buildHashMap(duplicateCandidates) {
    const hashMap = new Map();
    for (const group of duplicateCandidates) {
        for (const file of group) {
            const fileHandle = file.fileHandle;
            const fileData = await fileHandle.getFile();
            const hash = await hashFile(fileData);
            if (hashMap.has(hash)) {
                hashMap.get(hash).push(file);
            } else {
                hashMap.set(hash, [file]);
            }
        }
    }
    return hashMap;
}
function findDuplicateCandidates(scanResult) {
    const sizeMap = new Map();
    for (const file of scanResult.files) {
        if (sizeMap.has(file.size)) {
            sizeMap.get(file.size).push(file);
        } else {
            sizeMap.set(file.size, [file]);
        }
    }
    const duplicateCandidates = [];
    for (const files of sizeMap.values()) {
        if (files.length > 1) {
            duplicateCandidates.push(files);
        }
    }
    return duplicateCandidates;
}
function duplicateGroups(duplicateHashes) {
    const groups = [];
    for (const files of duplicateHashes.values()) {
        if (files.length > 1) {
            groups.push(files);
        }
    }
    return groups;
}
function analyzeDuplicateGroups(duplicateGroups) {
    const groupAnalysis = [];
    for (const group of duplicateGroups) {
        const files = [];
        for (const file of group) {
            files.push({
                name: file.name,
                path: file.path,
                size: file.size
            });
        }
        const fileCount = files.length;
        const sizePerFile = group[0].size;
        const potentialSaving = sizePerFile * (fileCount - 1);
        groupAnalysis.push({
            files: files,
            fileCount: fileCount,
            sizePerFile: sizePerFile,
            potentialSaving
        });
    }
    return groupAnalysis;
}
function calculateTotalPotentialSaving(groupAnalysis) {
    let totalPotentialSaving = 0;
    for (const group of groupAnalysis) {
        totalPotentialSaving += group.potentialSaving;
    }
    return totalPotentialSaving;
}
export async function findDuplicates(scanResult) {
    const duplicateCandidates = findDuplicateCandidates(scanResult);
    console.log(`Duplicate Candidates are`, duplicateCandidates);
    const duplicateHashes = await buildHashMap(duplicateCandidates); // Build the hash map for the duplicate candidates
    const duplicates = duplicateGroups(duplicateHashes);
    const groupAnalysis = analyzeDuplicateGroups(duplicates);
    const potentialSaving = calculateTotalPotentialSaving(groupAnalysis);
    console.log(`Total Potential Saving is ${potentialSaving} bytes`);
    return { groupAnalysis, potentialSaving };
}
