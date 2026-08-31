# 📁 Atlas

A lightweight and efficient directory scanning utility built with the **File System Access API**.

The project recursively traverses a selected directory, collecting information about its files and subdirectories while maintaining useful scan statistics.

## ✨ Features

* 📂 Recursively scans nested directories
* 📄 Detects and collects files
* 🗂️ Tracks directory paths
* 🔢 Counts total files and directories
* 📊 Supports scan progress reporting
* ❌ Supports scan cancellation
* ⚡ Uses asynchronous iteration for efficient traversal
* 🌐 Built around the modern File System Access API

## 🚀 How It Works

The core scanner recursively walks through a directory handle.

```text
Selected Directory
│
├── File 1
├── File 2
│
├── Folder A
│   ├── File 3
│   └── Folder B
│       └── File 4
│
└── Folder C
    └── File 5
```

Each directory is visited recursively, and the scanner keeps track of:

* File paths
* Directory paths
* Total number of files
* Total number of directories

## 🛠️ Core Function

The project uses a recursive function similar to the following:

```js
async function listDirectoryContents(
  fsHandle,
  path = "",
  scanResult,
  onProgress,
  shouldCancel
) {
  for await (const [fname, handle] of fsHandle.entries()) {
    const currentPath = path ? `${path}/${fname}` : fname;

    if (handle.kind === "directory") {
      scanResult.directories.push(currentPath);
      scanResult.totalDirectories++;

      await listDirectoryContents(
        handle,
        currentPath,
        scanResult,
        onProgress,
        shouldCancel
      );
    } else {
      scanResult.files.push(currentPath);
      scanResult.totalFiles++;
    }

    if (onProgress) {
      onProgress(scanResult);
    }

    if (shouldCancel?.()) {
      return;
    }
  }
}
```

## 📦 Example Usage

```js
const scanResult = {
  files: [],
  directories: [],
  totalFiles: 0,
  totalDirectories: 0
};

const directoryHandle = await window.showDirectoryPicker();

await listDirectoryContents(
  directoryHandle,
  "",
  scanResult,
  (progress) => {
    console.log("Files:", progress.totalFiles);
    console.log("Directories:", progress.totalDirectories);
  },
  () => false
);

console.log(scanResult);
```

## 📊 Example Output

```js
{
  files: [
    "README.md",
    "src/index.js",
    "src/utils/helper.js"
  ],

  directories: [
    "src",
    "src/utils"
  ],

  totalFiles: 3,
  totalDirectories: 2
}
```

## 🧠 Progress Tracking

You can provide an `onProgress` callback to receive updates while the directory is being scanned.

```js
(progress) => {
  console.log(
    `Scanned ${progress.totalFiles} files and ` +
    `${progress.totalDirectories} directories`
  );
}
```

This makes it easy to connect the scanner to:

* Progress indicators
* Loading screens
* File explorer interfaces
* Statistics dashboards
* Real-time scan logs

## 🛑 Scan Cancellation

The scanner supports cancellation through the `shouldCancel` callback.

```js
() => {
  return cancelRequested;
}
```

When the callback returns `true`, the scanning process stops.

## 🌐 Browser Support

This project relies on the **File System Access API**.

Browser support may vary, with Chromium-based browsers generally providing the best support.

## 🔮 Possible Improvements

Future enhancements could include:

* File size calculation
* File type detection
* Hidden file filtering
* Search functionality
* Extension-based filtering
* Total directory size calculation
* Duplicate file detection
* Exporting scan results as JSON or CSV
* Drag-and-drop folder support
* Improved cancellation handling
* Parallel or optimized scanning strategies

## 🤝 Contributing

Contributions, improvements, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the implementation.
5. Submit a pull request.



---

Built for fast and simple directory exploration. 📁✨
