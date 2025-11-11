# Noted
Noted is a graphical thought organizer and notes app made for the 2026 WCPS Media Expo.
# Why Noted?
Noted isn't your average note taking app. It's a graphical thought organizer. Noted redifines how notes are taken, by providing users with a 2d workspace, called a Board. Users can spawn various different nodes, organizing them almost like a scrapbook. Noted has all sorts of different nodes for every scenario, such as
 - Text Nodes for storing plaintext notes
 - Image Nodes for displaying various different image formats
 - ToDo Nodes for creating recursive todo lists
 - File Nodes for uploading and downloading files
 - And many more to come...
# How does it work?
Noted's frontend utilizes Tauri, a lightweight alternative to Electron. The frontend was built with the Svelte framework, providing an easy to use and beautiful UI, whilst the backend is handled with Javascript and Rust.
The backend works in a couple of different ways. Users can choose to store everything locally, which uses a SQLite driver and custom interfacing to provide a quick and reliable way of storing data.
However, a spare laptop or rasberry pi can easily be converted into a server using the PocketBase and the provided JSON schema. This allows users to create their own "cloud" servers, allowing notes to be synchronized across devices
