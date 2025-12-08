# Noted - A better way to take notes

<img src='src-tauri/icons/Square310x310Logo.png' style='width: 100px; height: 100px;'>

Noted is a graphical thought organizer and note taking app made for the 2026 WCPS Media Expo.
# Why Noted?
Noted isn't your average note taking app. It's a graphical thought organizer. Noted redifines how notes are taken, by providing users with a 2d workspace, called a Board. Users can spawn various different nodes, and rearrange them, almost like making a digital scrapbook. Noted has all sorts of different nodes for every scenario, such as
 - Text Nodes for storing plaintext notes
 - Image Nodes for displaying various different image formats
 - ToDo Nodes for creating recursive todo lists
 - File Nodes for uploading and downloading files
# How does it work?
Noted's frontend utilizes Tauri, a lightweight alternative to Electron. The frontend was built with the Svelte framework, providing an easy to use and beautiful UI, whilst the backend is handled with Javascript and Rust.
The backend works in a couple of different ways. Users can choose to store everything locally, which uses a SQLite driver and custom interfacing to provide a quick and reliable way of storing data on your own machine.
However, a spare laptop or Rasberry Pi can easily be converted into a server using PocketBase and the provided JSON schema. This allows users to create their own "cloud" servers, allowing notes to be synchronized across devices.
# Installation
The latest release should be avaiable in the [release tab](https://github.com/georgeeggers/Noted/releases)
However, certain systems may be unavailable or may not work. To ensure Noted will work on your device, build from source as directed below.
# Building from source
To begin, make sure you have Git, NPM, and the prerequisites for [Tauri](https://v2.tauri.app/start/prerequisites/)
Once the dependancies are installed, clone the repo from github
```
git clone https://github.com/georgeeggers/Noted
```
After this, cd into the directory, and install with npm
```
cd Noted
npm install
```
Finally, build the app with the Tauri CLI

```
npm run tauri build
```
This should generate an executable installer that you can use to install the app!
# Features
## Saving boards
Save boards to a local machine using a SQLite database, or to a self-hostable server using PocketBase

## Beautiful UI

<img width="1440" height="900" alt="Screenshot 2025-12-07 at 3 14 18 PM" src="https://github.com/user-attachments/assets/a709abe8-53a4-4d6c-83bd-6828bd034b37" />

## Themes for any user

### Sunset
<img width="1440" height="900" alt="Screenshot 2025-12-07 at 3 15 22 PM" src="https://github.com/user-attachments/assets/99dc3ad9-6799-47e8-a791-5f12bce55d21" />

### Matcha
<img width="1440" height="900" alt="Screenshot 2025-12-07 at 3 15 47 PM" src="https://github.com/user-attachments/assets/93abf44c-2ee7-4eac-ad1d-ac5da3835cf2" />

### Light
<img width="1440" height="900" alt="Screenshot 2025-12-07 at 3 16 06 PM" src="https://github.com/user-attachments/assets/f47d8e18-ba1d-4e8d-b267-a71176b2c614" />

### Peach
<img width="1440" height="900" alt="Screenshot 2025-12-07 at 3 16 42 PM" src="https://github.com/user-attachments/assets/ce2154e0-7b4f-45bb-a20a-ec40dc4af363" />

### And many more...

## Accessibility
Change font, font size, node appearance, and lots of other things
