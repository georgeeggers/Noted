import { load } from "@tauri-apps/plugin-store";

export let settings = $state({
    noteWidth: 500,
    imageWidth: 500,
    gap: 10,
    fontSize: 'Normal',
    font: "Monospace",
    border: "Rounded",
    themeIndex: 0
})

const encoder = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-=!@#$%^&*()_+\`~,./<>?;\':\"[]{}\\|";

export const random = (min, max) => {
    return (Math.floor(Math.random() * (max - min + 1)) + min)
}

export const getID = () => {
    let id = "";
    for(let i = 0; i < 10; i++){
        id += encoder[random(0, encoder.length)];
    }

    return id;
}



/**
 * Nodes should be represented by this json schema
 * x - int representing the x in pixels
 * y - int representing the y in pixels
 * type - string representing the node type (todo list, note, file, etc.)
 * title - string representing the title of the node
 * content - string representing the content of the node if its a note type. Will be JSON representing a nested todo list if its a todo list
 * file - file handle if the note is a file type
 * editing - bool representing if the node is currently being edited
 * id - randomly generated ID for ease of use. Use pocketbase IDs for cloud hosting
 * 
 */


export let boards = $state([
    {
        name: "New Board",
        isLocalSaved: true,
        id: getID(),
    }
])



export let nodes = $state([]);

export let appState = $state({
    selectedBoard: null,
    boards: [],
})

// this is a list of actions that the user takes on a certain board which provide easy updating for the backend later on
// this will, at worst, grow to be the size of nodes. This shouldn't be a massive issue though
// potential optimizations could be to just store the id for delete requests and changes for update requests
export let difs = $state([]);

export const updateDifByIndex = (index, action) => {
    const node = nodes[index];
    updateDif(node, action);
}

export const updateDif = (node, action) => {
    if(action == "create"){
        difs.push({
            action: "create",
            node: node
        })
    } else if (action == "update"){
        // search through data to see if the note was created. if so, we can just change it to a create, as the database wont care
        for(let i of difs){
            if(i.node.id == node.id && (i.action == "create" || i.action == "update")){
                i.node = node;
                return;
            }
        }

        difs.push({
            action: "update",
            node: node
        })
    } else if (action == "delete"){
        // if a node was just created or updated, we can remove those difs

        for(let i of difs){
            if(i.node.id == node.id){
                if(i.action == "create"){
                    difs.splice(difs.indexOf(i), 1);
                    return;
                } else {
                    if(i.action == "update"){
                        difs.splice(difs.indexOf(i), 1);
                        break;
                    }
                }

            }
        }
        difs.push({
            action: 'delete',
            node: node
        })
    }
}

export const translateFontSizes = (size) => {
    if(size == 'Smaller'){
        return -4;
    } else if (size == "Small"){
        return -2;
    } else if (size == "Normal"){
        return 0;
    } else if (size == 'Big'){
        return 2;
    }
    return 4;
}

export const translateRadius = (size) => {
    if(size == 'Square'){
        return 0;
    } else if (size == "Squarcle"){
        return 5;
    } else if (size == "Rounded"){
        return 10;
    } else if (size == 'Roundest'){
        return 20;
    }
}

export let color = $state(
    {
        name: 'Default',
        type: 'dark',
        headerColor: "#f8f8f8",
        textColor: "#c9c9c9",
        mainColor: "#018d6c",
        lightMainColor: "#00ad85ff",
        dimMainColor: "#006e55ff",
        grayColor: "#2f2f2f",
        inputColor: "#2e2e2e80",
        bgColor: "#0f0f0f",
        lightBgColor: "#181818",
        lighterBgColor: "#232323",
        lightestBgColor: "#2e2e2e",
        fail: "#a52100",
    }
)

export const themes = [{
    name: 'Default',
    type: 'dark',
    headerColor: "#f8f8f8",
    textColor: "#c9c9c9",
    mainColor: "#018d6c",
    lightMainColor: "#00ad85ff",
    dimMainColor: "#006e55ff",
    grayColor: "#2f2f2f",
    inputColor: "#2e2e2e80",
    bgColor: "#0f0f0f",
    lightBgColor: "#181818",
    lighterBgColor: "#232323",
    lightestBgColor: "#2e2e2e",
    fail: "#a52100"
},{
    name: "Matcha",
    type: "dark",
    headerColor: "#e1e6f8ff",
    textColor: "#cdd6f4",
    mainColor: "#60995aff",
    lightMainColor: "#7cca76ff",
    dimMainColor: "#53884eff",
    grayColor: "#313244",
    inputColor: "#39395780",
    bgColor: "#1e1e2e",
    lightBgColor: "#242436ff",
    lighterBgColor: "#2e2e46ff",
    lightestBgColor: "#393957ff",
    fail: "#df6174ff"
},{
    name: "Ocean",
    type: "dark",
    headerColor: "#f0f2fdff",
    textColor: "#e3e7ffff",
    mainColor: "#5966d6ff",
    lightMainColor: "#7482f2ff",
    dimMainColor: "#4a56b3ff",
    grayColor: "#2e2f44ff",
    inputColor: "#383a5e80",
    bgColor: "#191a2c",
    lightBgColor: "#202136ff",
    lighterBgColor: "#2b2c46ff",
    lightestBgColor: "#383a5eff",
    fail: "#d94f5cff"
},{
    name: "Sunset",
    type: "dark",
    headerColor: "#fffdfbff",
    textColor: "#ffeedd",
    mainColor: "#ff7f50ff",
    lightMainColor: "#ff9e70ff",
    dimMainColor: "#e36b44ff",
    grayColor: "#403b3dff",
    inputColor:  "#3f3f5780",
    bgColor: "#1b1b24",
    lightBgColor: "#232330ff",
    lighterBgColor: "#2d2d3bff",
    lightestBgColor: "#3f3f57ff",
    fail: "#bb0a0aff"
},{
    name: "Regal",
    type: "dark",
    headerColor: "#e9e1f8ff",
    textColor: "#d5cdeaff",
    mainColor: "#a678dfff",
    lightMainColor: "#c29cf2ff",
    dimMainColor: "#8a5fd1ff",
    grayColor: "#343046ff",
    inputColor: "#332e4c80",
    bgColor: "#1d1a26ff",
    lightBgColor: "#242032ff",
    lighterBgColor: "#2b263fff",
    lightestBgColor: "#332e4cff",
    fail: "#df6174ff"
},{
    name: "Forest",
    type: "dark",
    headerColor: "#e4f2e1ff",
    textColor: "#d2e8d0ff",
    mainColor: "#5aa469ff",
    lightMainColor: "#74c282ff",
    dimMainColor: "#4b8f59ff",
    grayColor: "#2f3b33ff",
    inputColor: "#313f3780",
    bgColor: "#1c241eff",
    lightBgColor: "#232c25ff",
    lighterBgColor: "#29352dff",
    lightestBgColor: "#313f37ff",
    fail: "#df6174ff"
},{
    name: 'Light',
    type: 'light',
    headerColor: "#020202",
    textColor: "#080808",
    mainColor: "#018d6c",
    lightMainColor: "#00ad85",
    dimMainColor: "#006e55",
    grayColor: "#2f2f2f",
    inputColor: "#d1d1d180",
    bgColor: "#f8f8f8",
    lightBgColor: "#e8e8e8",
    lighterBgColor: "#dedede",
    lightestBgColor: "#d1d1d1ff",
    fail: "#a52100"
},{
    name: "Sandstone",
    type: "light",
    headerColor: "#1d1b18ff",
    textColor: "#2d2925",
    mainColor: "#f59b42ff",
    lightMainColor: "#f5942dff",
    dimMainColor: "#b88352ff",
    grayColor: "#dad4cfff",
    inputColor: "#d3b59f80",
    bgColor: "#fdfaf6",
    lightBgColor: "#f6f0ebff",
    lighterBgColor: "#ece2daff",
    lightestBgColor: "#d3b59fff",
    fail: "#ff0000ff"
},{
    name: "Skyline",
    type: "light",
    headerColor: "#0a1a2fff",
    textColor: "#14213d",
    mainColor: "#0077b6",
    lightMainColor: "#00b4d8",
    dimMainColor: "#005f8a",
    grayColor: "#b0c4de",
    inputColor: "#8fb2c980",
    bgColor: "#d6dce2ff",
    lightBgColor: "#beccd6ff",
    lighterBgColor: "#99afc2ff",
    lightestBgColor: "#8fb2c9ff",
    fail: "#d62828ff"
},
{
    name: "Peach",
    type: "light",
    headerColor: "#3d0c02ff",
    textColor: "#432818",
    mainColor: "#f9844a",
    lightMainColor: "#f6aa1c",
    dimMainColor: "#e36414",
    grayColor: "#c9b5aaff",
    inputColor: "#f9d8b680",
    bgColor: "#fff5ec",
    lightBgColor: "#ffebd8",
    lighterBgColor: "#fde2c8",
    lightestBgColor: "#f9d8b6",
    fail: "#db0028ff"
},
{
    name: "Mint",
    type: "light",
    headerColor: "#1a2e1aff",
    textColor: "#243424",
    mainColor: "#5bb98c",
    lightMainColor: "#84d9ab",
    dimMainColor: "#449970",
    grayColor: "#cfd8d3ff",
    inputColor: "#cce6d880",
    bgColor: "#f4fff9",
    lightBgColor: "#e7f8ef",
    lighterBgColor: "#d9efe4",
    lightestBgColor: "#cce6d8",
    fail: "#d81e1eff"
}]




export const loadTheme = (theme, index) => { 
    color.name = theme.name;
    color.headerColor = theme.headerColor;
    color.textColor = theme.textColor;
    color.mainColor = theme.mainColor;
    color.lightMainColor = theme.lightMainColor;
    color.dimMainColor = theme.dimMainColor;
    color.grayColor = theme.grayColor;
    color.inputColor = theme.inputColor;
    color.bgColor = theme.bgColor;
    color.lightBgColor = theme.lightBgColor;
    color.lighterBgColor = theme.lighterBgColor;
    color.lightestBgColor = theme.lightestBgColor,
    color.fail = theme.fail;

    settings.themeIndex = index;

};

export const saveSettings = async () => {
    const store = await load('store.json', {
        autoSave: false,
        defaults: {}
    });
    await store.set('settings', settings);
    await store.save();
}

export const loadSettings = async () => {
    const store = await load('store.json', {
        autoSave: false,
        defaults: {}
    });

    const result = await store.get('settings');
    for(let [key, val] of Object.entries(result)){
        settings[key] = val;
    }

    await loadTheme(themes[settings.themeIndex], settings.themeIndex);
}

export const createDebounce = (action, delay) => {
  let timer;
  return (
    () => {
      clearTimeout(timer);
      timer = setTimeout(action, delay);
    }
  )
}
