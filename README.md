# Atlas

### Local-First Filesystem Intelligence & Directory Exploration

Atlas is a lightweight, local-first filesystem intelligence and directory exploration tool built to run directly inside modern web browsers. It enables users to inspect local directories, visualize storage distribution, identify space-consuming files, and detect duplicate files without installing desktop software or uploading sensitive data to external servers.

---

> **Privacy Guarantee**: Atlas runs entirely inside your web browser sandbox using client-side Web APIs. All directory traversal, file metadata extraction, and cryptographic hashing take place locally. No file contents, directory paths, or analytical metrics are ever transmitted over the network.

---

## Project Description

Traditional disk analyzer utilities often require system-level installation, administrative privileges, or reliance on cloud-hosted tools that necessitate uploading sensitive folder structures. Atlas addresses these challenges by operating entirely in the browser through standard Web APIs.

By leveraging the W3C File System Access API, Web Workers, and the Web Crypto API, Atlas performs in-depth directory analysis safely in local client memory. The application requires zero installation, issues zero network requests, and leaves zero footprint on external servers.

Whether auditing project repositories, decluttering media collections, or identifying redundant assets, Atlas provides instant, actionable storage intelligence while keeping user data strictly private.

---

## Goals

| Goal | Focus Area | Description |
| :--- | :--- | :--- |
| **Privacy by Design** | Security & Confidentiality | Zero server uploads, zero remote telemetry, and zero tracking. All directory structures and file data remain exclusively on the user device. |
| **Zero-Installation Access** | Portability & Convenience | Runs instantly in any compatible web browser without installers, package managers, command-line dependencies, or administrative privileges. |
| **Accurate Storage Intelligence** | Visibility & Organization | Categorizes storage consumption across MIME types and file extensions, surfaces disk usage percentages, and highlights the largest space consumers. |
| **Cryptographic Duplicate Detection** | Space Optimization | Accurately identifies identical files through size grouping and SHA-256 cryptographic verification, calculating exact recoverable disk space. |
| **Non-Destructive Operation** | Data Safety | Operates exclusively with read-only permissions, guaranteeing that user files and directory structures cannot be modified, moved, or deleted. |
| **Local Session Persistence** | Continuity & Archival | Saves scan reports locally using browser-based IndexedDB storage, enabling instant session retrieval, historical comparisons, and JSON data exports. |

---

## Specifications

### Runtime & Technical Environment

| Specification Category | Technical Detail | Implementation Notes |
| :--- | :--- | :--- |
| **Execution Sandbox** | Client-Side Web Application | Executes within the browser security boundary without background server infrastructure. |
| **Core Stack** | HTML5, Vanilla CSS3, ES6+ JavaScript | Built using modern, modular web standards with zero external UI frameworks or heavy dependencies. |
| **Filesystem Access** | W3C File System Access API | Native directory traversal via directory picker handles with standard directory input fallback. |
| **Concurrency Model** | Dedicated Web Workers | Traversal, analytical aggregations, and cryptographic hashing run off the main UI thread to prevent interface lag. |
| **Cryptographic Engine** | Web Crypto API (SHA-256) | Generates cryptographic digests for duplicate candidates using subtle crypto routines. |
| **Persistence Layer** | IndexedDB (*FolderAnalyzerDB*) | Stores full scan reports, analytical models, and duplicate listings without localStorage size limits. |
| **Network Footprint** | 0 Bytes Transmitted | Complete offline operation with no external API calls, third-party libraries, or analytics scripts. |
| **Export Formats** | Structured JSON | Downloadable file containing directory hierarchy summaries, file metrics, and duplicate groups. |
| **Browser Support** | Chromium-Based Browsers | Full feature support in Google Chrome, Microsoft Edge, Brave, and Opera, with folder upload fallback on Firefox and Safari. |

### Collected Metrics & Attributes

- **Directory Summary**: Total file count, total subdirectory count, and total cumulative storage size in bytes.
- **File Descriptors**: File name, relative path, file extension, exact byte length, MIME type categorization, and last-modified timestamp.
- **Categorical Breakdown**: Aggregate file counts and total byte volume grouped by file extension and high-level format category (Documents, Media, Code, Archives, Executables, and Unknown).
- **Extremes & Chronology**: Top 10 largest individual files, top 10 oldest files by modification date, and top 10 newest files by modification date.
- **Duplicate File Analysis**: Partitioned duplicate groups, total redundant copies, per-file byte sizes, and cumulative recoverable disk space.

---

## Design

### Architecture Overview

| Layer | Core Responsibilities | Key Functions |
| :--- | :--- | :--- |
| **Presentation Layer** | User interface rendering, theme management, and view routing | Multi-view UI (DOM), dark and light theming, stage tracking, metric visualizations |
| **Worker Pipeline** | Heavy asynchronous filesystem recursion and crypto operations | Recursive file traversal, storage categorization, candidate filtering, SHA-256 hashing |
| **Persistence Layer** | Non-volatile client-side storage and session snapshots | IndexedDB transactions, historical scan records, JSON export service |

---

### Component and Module Design

| Module | Primary Responsibility | Key Functions & Workflows |
| :--- | :--- | :--- |
| **Scanner Engine** | Directory Traversal | Traverses directory handles asynchronously using entry iterators, extracts file descriptors, monitors cancel signals, and posts periodic progress updates. |
| **Analyzer Engine** | Data Aggregation | Groups files by extension and MIME category, calculates volume percentages, ranks largest files, and organizes chronological file lists. |
| **Duplicate Engine** | Identity Verification | Groups files by exact byte size, passes candidate groups through SHA-256 hashing, detects identical copies, and computes reclaimable storage. |
| **Database Module** | Data Persistence | Manages IndexedDB schema creation, scan record persistence, historical query retrieval, and record deletion. |
| **UI Controllers** | Interface Rendering | Renders dashboard statistic cards, analysis breakdown tables, duplicate grouping trees, and historical scan archives. |
| **Export Service** | Data Portability | Serializes scan summaries into formatted JSON strings and triggers local browser downloads via object URLs. |

---

### Execution Pipeline

1. **Folder Selection**: The user selects a target directory via the Directory Picker interface. A dedicated Web Worker is initialized and receives the root directory handle.
2. **Recursive Traversal**: The worker traverses the directory hierarchy asynchronously, recording file metadata and cumulative sizes while dispatching progress events every 100 files to update live counters.
3. **Analytical Aggregation**: Once traversal finishes, the worker analyzes file distributions, categorizing items by MIME category and extension, and compiling top space consumers.
4. **Duplicate Identification**: Files with matching byte sizes are filtered into candidate pools. The worker generates SHA-256 hashes for each candidate, clusters verified duplicates, and calculates potential space savings.
5. **Persistence & Rendering**: The worker returns the complete analytical dataset to the main thread. The scan record is saved to IndexedDB, view components are refreshed, and the user is redirected to the dashboard.
6. **History & Exploration**: Users can navigate between historical snapshots, compare historical folder states, delete past records, or export the dataset as JSON.

---

### User Interface & Safety Design

- **Read-Only Guarantee**: Atlas requests only read permissions from the browser. The application cannot alter, move, rename, or delete any local files or folders.
- **Stage Progression Tracker**: Transparent visual indicators represent each phase of the workflow (Scanning, Analyzing, Detecting Duplicates, Complete) with dynamic counters and immediate cancellation support.
- **Visual Ergonomics**: Clean typography, high-contrast layouts, and support for both dark and light modes ensure optimal readability during large folder audits.
