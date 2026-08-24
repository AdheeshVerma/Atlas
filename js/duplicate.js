async function hashFile(file){
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(`Hash of file ${file.name} is ${hashHex}`); ;
    return hashHex;
}
async function buildHashMap(duplicateCandidates){
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
async function findDuplicateCandidates(scanResult){
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
async function duplicateGroups(duplicateHashes){
    const groups = [];
    for (const files of duplicateHashes.values()) {
        if (files.length > 1) {
            groups.push(files);
        }
    }
    return groups;
}
export async function findDuplicates(scanResult){
    const duplicateCandidates = findDuplicateCandidates(scanResult);
    const duplicateHashes = await buildHashMap(duplicateCandidates); // Build the hash map for the duplicate candidates
    console.log("Hashes for Duplicate Files are",duplicateHashes);
    const duplicates = duplicateGroups(duplicateHashes);
    return duplicates;
}
