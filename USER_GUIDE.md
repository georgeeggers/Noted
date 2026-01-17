# Noted User Guide
<img src='src-tauri/icons/Square310x310Logo.png' style='width: 100px; height: 100px;'>

## Main Menu
### Main UI
Upon loading Noted for the first time, you should be met with this screen.

<img width="640" height="400" alt="Screenshot 2025-12-11 at 8 34 14 PM" src="https://github.com/user-attachments/assets/6a051b71-c417-46cf-a3bd-1d31800c236f" />

### Search Bar
The search bar serves a dual purpose. It's used both to search for old boards by their name, and to create new boards.

<img width="640" height="400" alt="Screenshot 2025-12-11 at 8 36 50 PM" src="https://github.com/user-attachments/assets/998bf30a-4719-468d-b610-16491c15db84" />

### Preexisting Boards

Prexisting boards will be displayed underneath the search bar. You can use the search bar to search for boards by their display name. Clicking a board will load you into the board UI.

<img width="640" height="400" alt="Screenshot 2025-12-11 at 9 04 26 PM" src="https://github.com/user-attachments/assets/7d71817f-dc8b-4a09-a547-b123d2a71f8b" />

## Board Menu

Right clicking on a board will open up a context menu, where you can do a number of actions.

<img width="640" height="400" alt="Screenshot 2026-01-12 at 11 54 13 PM" src="https://github.com/user-attachments/assets/a0a816ea-70be-4018-88ce-306b16619db5" />

### Renaming

Clicking the rename button will turn it into a text box where you can input the new name of your board. Pressing enter will update it to it's new name!

<img width="280" height="233" alt="Screenshot 2026-01-12 at 11 57 22 PM" src="https://github.com/user-attachments/assets/d306c553-8dbe-4b35-98d0-31fdd5ad5a72" />

### Duplicating

Clicking the duplicate button will create a copy of a board, and all of the nodes associated with it. Due to technical issues from pocketbase, duplicating cloud boards is currently unavailable, and only the nodes are copied.

<img width="431" height="50" alt="Screenshot 2026-01-12 at 11 58 01 PM" src="https://github.com/user-attachments/assets/7e5694de-44dc-4728-9c9e-5e8ec159f5d8" />

### Deleting

Pretty self explanatory. Clicking the delete button will delete that board and all of the data associated with it. This is irreversible, so definitely be careful.

## Board UI

### New Boards

Upon loading into a board, or creating a new one, you will be met with this UI.

<img width="640" height="500" alt="Screenshot 2026-01-17 at 12 49 14 PM" src="https://github.com/user-attachments/assets/b461eafa-362a-497b-8d23-e77046a5f57a" />

### Control Bar

You may notice the primary control bar at the bottom of the window. The four buttons on the left will spawn different nodes in the main board. From left to right, they will spawn a Text Node, ToDo Node, Image Node, and File Node. The button on the right of the divider will toggle between node mode and line mode. We'll go over these two modes a bit later.

<img width="275" height="58" alt="Screenshot 2026-01-17 at 12 50 34 PM" src="https://github.com/user-attachments/assets/3daad6c8-9b68-43cf-b638-1f1ff9722b8a" />

### Spawning Nodes

Clicking one of these 4 buttons will spawn a towards the center of the screen. Each node consists of a title, some sort of content, and the control bar at the bottom. 

<img width="640" height="400" alt="Screenshot 2026-01-17 at 12 52 07 PM" src="https://github.com/user-attachments/assets/f4501c78-448b-45fb-839c-269ec7e59aeb" />

### Node Controls

You may notice the pen icon on the bottom of each node is highlighted green. This means that the node is in editing mode. The content of nodes cannot be changed when they are not in editing mode. From left to right, the buttons on the control bar will toggle editing mode, delete the node, or do some sort of special action. The icon of 6 dots act as a handle. Left clicking and dragging on the handle will let you move each note anywhere in the board. Similarly, right clicking and dragging anywhere on the board will move the actual camera.

<img width="163" height="160" alt="Screenshot 2025-12-11 at 8 47 32 PM" src="https://github.com/user-attachments/assets/d5de9b2e-c8e5-4886-8c6d-178a24b975cc" />

### Exiting

To return to the main menu, press the escape key, or the board name in the top right of the screen. While editing your board, a dot will appear next to the board name if you have unsaved changes.

<img width="221" height="53" alt="Screenshot 2025-12-11 at 8 56 28 PM" src="https://github.com/user-attachments/assets/6d591b3b-6669-483f-a4ed-45492854c871" />

### Saving

Attempting to return to the main menu with unsaved changed will display an alert. From here, you can choose to save or discard changes. Alternatively, press Control + S to save at any time.

<img width="640" height="400" alt="Screenshot 2025-12-11 at 8 57 45 PM" src="https://github.com/user-attachments/assets/cae61a37-a9c0-4c25-aa0f-be305b54fdad" />

## Node Types

### Text Node

The text node is the most basic of all the nodes. It simply consists of a title, and a body, where you can type any text you want. In addition, typing triple backticks will create an inline code box, allowing you to format and easily copy a specific command

<img width="568" height="349" alt="image" src="https://github.com/user-attachments/assets/c05b22c2-858d-4ef2-9b92-45f139654046" />

### Todo Node

The todo node provides an easy to use recursive system for todo lists. Pressing the plus icon marked new will add a new item to the list. Pressing the plus icon next to an item will turn it into a list, letting you stack more items under it. Pressing the X button will remove an item. To mark an item as complete, simply click the cirle to its left!

<img width="581" height="328" alt="image" src="https://github.com/user-attachments/assets/2b146b1e-2277-4535-a34d-3c697438f9d1" />

### Image Node

The image node does exactly what it sounds like. It stores and displays an image. Press the upload button to select an image for the first time, or click an already existing image while in edit mode to change the display.

<img width="722" height="522" alt="image" src="https://github.com/user-attachments/assets/09ff2c21-f9c0-4fd1-ba7a-9af55aa2db6d" />

### File Node

The file node works similarly to the image node, with one key difference. You can store files of any type. This is particularly useful when coupled with a self-hosted server, as it lets you share larger files across devices! You can easily download the files stored by pressing the download button in the control bar at the bottom of each File Node.

<img width="448" height="223" alt="image" src="https://github.com/user-attachments/assets/6258142f-a350-4f59-97c4-f7237e235fe0" />

## Lines

Pressing the arrow button on the control bar will toggle between node mode and line mode. When in line mode, the control bar will change to have display various lines types

<img width="275" height="56" alt="Screenshot 2026-01-17 at 12 54 11 PM" src="https://github.com/user-attachments/assets/e1ea8cac-a550-484d-882d-a90ba72cf814" />

### Creating Lines

When in line mode, your current line type will be highlighted in the theme's main color. When in line mode, clicking any node will highlight it, marking it as the start node for your line.

<img width="168" height="168" alt="Screenshot 2026-01-17 at 12 55 36 PM" src="https://github.com/user-attachments/assets/c5228201-2e10-474a-aba6-af44f4e12371" />

When a node is highlighted, clicking any other node will create a line between the two. There are four different types of lines to choose from. Simple solid lines, one way arrows, two way arrows, and arrow only lines. 

<img width="923" height="787" alt="Screenshot 2026-01-17 at 12 58 34 PM" src="https://github.com/user-attachments/assets/0cd242f2-8f3d-43c6-9817-27c5d7747280" />

## Deleting Lines

When in line mode, hovering over a line will highlight it. Clicking it will delete it.

<img width="260" height="202" alt="Screenshot 2026-01-17 at 12 59 51 PM" src="https://github.com/user-attachments/assets/e15a9554-2663-473b-866e-3b19b418bd49" />

## Shortcuts

When in the board UI, several shortcuts can be used to speed up your workflow. They are as follows.

* Control + r will sort and organize nodes. The gap size between sorted notes can be configured in settings. 

* Control + = will zoom in. 

* Control + - will zoom out 

* Control + s will save the board.

## Settings

### Entering Settings

To enter the settings menu, press the button titled settings in the main menu

<img width="141" height="59" alt="Screenshot 2025-12-11 at 9 10 45 PM" src="https://github.com/user-attachments/assets/793dc685-25c1-4736-852f-03e7dea227b4" />

### Settings Menu

The settings menu is pretty self explanatory. Each setting will have a name, a description, and usually a dropdown menu or a toggle to control it. To exit, press the back button in the top right.

<img width="640" height="400" alt="Screenshot 2025-12-11 at 9 11 45 PM" src="https://github.com/user-attachments/assets/4f33b980-48f4-4b0f-a496-30dc2d453701" />
