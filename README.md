# Noted - A better way to take notes

<img src='src-tauri/icons/Square310x310Logo.png' style='width: 100px; height: 100px;'>

Noted is a graphical thought organizer and note taking app made for the 2026 WCPS Media Expo.
# Why Noted?
Noted isn't your average note taking app. It's a graphical thought organizer. Noted redifines how notes are taken, by providing users with a 2d workspace, called a Board. Users can spawn various different nodes, and rearrange them, almost like making a digital scrapbook. Noted has all sorts of different nodes for every scenario, such as
 - Text Nodes for storing plaintext notes
 - Image Nodes for displaying various different image formats
 - ToDo Nodes for creating recursive todo lists
 - File Nodes for uploading and downloading files

# Features

## User Guide

For a more comrehensive list of features and how to use them, check out the [user guide](https://github.com/georgeeggers/Noted/blob/master/USER_GUIDE.md)

## Write notes the way you think

Gone are the days of writing a single, long page of notes. Now with Noted, you can write your notes and organize your thoughts like how you think - create notes and todo lists, upload images and files, and drag them anywhere in a large 2d space.

## Beautiful UI

 <img width="480" height="300" alt="Screenshot 2025-12-07 at 3 14 18 PM" src="https://github.com/user-attachments/assets/a709abe8-53a4-4d6c-83bd-6828bd034b37" />
 
## Themes for everyone!

 <div style="display: flex; width: 100%; height: fit-content; gap: 10px; flex-direction: row; align-items: center; flex-wrap: wrap; flex: 1;" />
 
 <img width="240" height="150" alt="Screenshot 2025-12-07 at 3 15 47 PM" src="https://github.com/user-attachments/assets/93abf44c-2ee7-4eac-ad1d-ac5da3835cf2" />
 
 <img width="240" height="150" alt="Screenshot 2025-12-07 at 3 16 06 PM" src="https://github.com/user-attachments/assets/f47d8e18-ba1d-4e8d-b267-a71176b2c614" />
 
 <img width="240" height="150" alt="Screenshot 2025-12-07 at 3 16 42 PM" src="https://github.com/user-attachments/assets/ce2154e0-7b4f-45bb-a20a-ec40dc4af363" />
 
 <img width="240" height="150" alt="Screenshot 2025-12-07 at 3 15 22 PM" src="https://github.com/user-attachments/assets/99dc3ad9-6799-47e8-a791-5f12bce55d21" />


</div>

## Store your notes with you, or get them anywhere

Noted can store your notes directly on your hard drive using a custom SQLite interface. However, a spare laptop can be converted into a self hostable cloud-server, meaning you can synchronize notes across all of your devices

# Installation
The latest release should be avaiable in the [release tab](https://github.com/georgeeggers/Noted/releases)
However, certain systems may be unavailable or may not work. To ensure Noted will work on your device, build from source as directed below.
## Building from source
To begin, make sure you have Git, NPM, and the prerequisites for [Tauri](https://v2.tauri.app/start/prerequisites/)
Once the dependencies are installed, clone the repo from github
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
For most systems, this process should generate an executable installer that you can use to install the app! However, some Linux systems may require additional work. Below is one method that was used to get a working install on an x86 Arch Linux system.

Install dependencies
```
sudo pacman -S cargo-tauri rpmextract
```

Clone github and run build process
```
git clone https://github.com/georgeeggers/Noted
cd Noted
npm install
npm run tauri build
```

Navigate into release folder for the RPM installer
```
cd src-tauri/target/release/bundle/rpm
```

Create a temporary folder, and extract the installer
```
mkdir rpm && cd rpm
rpmextract.sh ../Noted-1.2.0-1x86_64.rpm
```

Copy the resulting data to your usr directory

```
sudo cp -r usr/* /usr/
```

# How does it work?
Noted's frontend utilizes Tauri, a lightweight alternative to Electron. The frontend was built with the Svelte framework, providing an easy to use and beautiful UI, whilst the backend is handled with Javascript and Rust.
The backend works in a couple of different ways. Users can choose to store everything locally, which uses a SQLite driver and custom interfacing to provide a quick and reliable way of storing data on your own machine.
However, a spare laptop or Rasberry Pi can easily be converted into a server using PocketBase and the provided JSON schema. This allows users to create their own "cloud" servers, allowing notes to be synchronized across devices.

# Known Issues
 * Linux based systems still have a GTK context meny pop up on right click.
 * Releasing a node when the "handle" is blocked by part of the ui will cause the release to not register properly.
 * Cloud boards may not load when the app is first launched due to the way settings are loaded 
