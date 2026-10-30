# TidyDrop

TidyDrop is a local-first folder organizer. Choose a folder, review how loose files will be grouped, then confirm the sort. File names and contents stay in the browser; nothing is uploaded to a server.

## Run locally

```bash
npm ci
npm run dev
```

Open <http://localhost:3000> in a recent version of Chrome or Edge. The browser requires `localhost` or HTTPS to grant a website access to a folder.

## Use it

1. Choose Downloads or another folder in the browser's folder picker.
2. Review the file-type groups and preview.
3. Confirm the sort. TidyDrop creates folders for the groups and moves the files into them.
4. Use **Undo last sort** to move the files back during the current page session.

TidyDrop only scans loose files at the selected folder's top level. It leaves nested folders untouched. If a destination already contains a file with the same name, it adds a number to the new file name instead of replacing the existing file.

## Limits

- Folder access uses the browser File System Access API. Chrome and Edge support the full read/write flow. Other browsers may not expose folder access.
- The browser asks for read/write access to the folder you pick. Select only folders you want the app to organize.
- The last-sort undo history stays in memory and is cleared when the page is refreshed or closed.
- File groups are inferred from file extensions. Unknown extensions go to **Other files**.

## Checks

```bash
npm run lint
npm run build
```
