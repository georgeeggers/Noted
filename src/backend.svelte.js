import Database from "@tauri-apps/plugin-sql";
import { addNotification, appState, difs, getID, nodes, settings } from "./global.svelte";
import Pocket from 'pocketbase'
import { CircleX } from "@lucide/svelte";

// encode files as a base64 string for the backend. Awful way to do it, but we ball

const toBase64 = (file) => new Promise((resolve, reject) => {
    if(file == null){
        resolve(null);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // @ts-ignore
    reader.onload = () => resolve(`${file.name} ${reader.result.split(',')[1]}`);
    reader.onerror = reject;
});


// using tauri's built in SQL plugin for interfacing with the data because i'm lazy and this is easy
// i have NO idea where the db actually exists on disk, but it works so I can't be bothered

export const saveLocal = async (id) => {

    const db = await Database.load("sqlite:data.db");

    // do some reasearch into how tarui interfaces with the SQL driver so we can just make one statement and hit the backend once overall instead of once for each dif

    for(let i of difs){

        if(i.action == "delete"){
            const result = await db.execute(
                'DELETE FROM data WHERE id = $1', 
                [i.node.id]
            );
        } else if (i.action == "create"){
            let file = await toBase64(i.node.file);
            let content;
            if(i.node.type == 'todo'){
                content = JSON.stringify(i.node.content);
            } else {
                content = i.node.content;
            }
            const result = await db.execute(
                'INSERT into data (id, boardID, x, y, type, title, content, file, editing) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [i.node.id, id, i.node.x, i.node.y, i.node.type, i.node.title, content, file, i.node.editing ? 1 : 0]
            );

        } else if (i.action == 'update'){
            let file = await toBase64(i.node.file);
            let content;
            if(i.node.type == 'todo'){
                content = JSON.stringify(i.node.content);
            } else {
                content = i.node.content;
            }
            const result = await db.execute(
                'UPDATE data SET x = $1, y = $2, type = $3, title = $4, content = $5, file = $6, editing = $7 WHERE id = $8',
                [i.node.x, i.node.y, i.node.type, i.node.title, i.node.content, file, i.node.editing ? 1 : 0, i.node.id]
            );
        }
    }

    difs.length = 0;
}

export const loadLocal = async (id) => {
    // do this to reset the nodes array
    nodes.length = 0;
    difs.length = 0;
    const db = await Database.load("sqlite:data.db");
    const result = await db.select("SELECT * FROM data WHERE boardID = $1", [id]);
    for(let i of result){
        if(i.type == "image" || i.type == "file"){
            if(i.file != null){
                let parts = i.file.split(' ');
                const bytes = atob(parts[1]);
                const byteArray1 = [];
                for (let i = 0; i < bytes.length; i++) {
                    const byte = bytes.charCodeAt(i);
                    byteArray1.push(byte);
                }
                const byteArray = new Uint8Array(byteArray1);
                i.file = new Blob([byteArray]);
                i.file.name = parts[0];
            }

        } else if (i.type == "todo"){
            i.content = JSON.parse(i.content);
        }
        i.handle = null;
        nodes.push(i);
    }
}

export const deleteAllLocal = async () => {
    const db = await Database.load("sqlite:data.db");
    const result = await db.execute(
        "DELETE FROM data WHERE type = 'image' OR type = 'file'"
    );
}

export const loadBoards = async () => {
    appState.boards.length = 0;
    const db = await Database.load("sqlite:data.db");
    let result = await db.select("SELECT * FROM boards");

    for(let i of result){
        appState.boards.push(i);
    }

    if(settings.doServer){
        try {
            const response = await pb.collection('boards').getFullList();
            for(let i of response){
                appState.boards.push(i);
            }
        } catch {
            addNotification("Server Error!", "var(--fail-color)", CircleX, 4000, 'error');
        }

    }



    return result;

}

export const makeLocalBoard = async (name) => {
    const db = await Database.load("sqlite:data.db");
    const id = getID();
    const result = await db.execute("INSERT into boards (id, boardType, boardName) VALUES ($1, $2, $3)", [id, "local", name]);
    appState.boards.push({id: id, boardType: "local", boardName: name});
}

export const deleteBoard = async (b) => {
    if(b.boardType){
        const db = await Database.load("sqlite:data.db");
        const id = b.id;
        let result = await db.execute('DELETE FROM boards WHERE id = $1', [id]);
        result = await db.execute('DELETE FROM data where boardID = $1', [id]);
    } else {
        const result = await pb.collection('boards').delete(b.id);
        const targets = await pb.collection('data').getFullList({
            filter: `boardID="${b.id}"`
        })
        for(let i of targets){
            const result = await pb.collection('data').delete(i.id);
        }
    }

    await loadBoards();
}







let url = $state("");
export const changeUrl = (d) => {
    url = d;
}
let pb = $derived(new Pocket(url));




export const loadServer = async (id) => {
    // do this to reset the nodes array
    nodes.length = 0;
    difs.length = 0;
    const result = await pb.collection('data').getFullList({
        filter: `boardID="${id}"`
    })
    for(let i of result){
        if (i.type == "image" || i.type == "file"){
            i.file = pb.files.getURL(i, i.file);
        } else if (i.type == "todo"){
            i.content = JSON.parse(i.content);
        }
        i.handle = null;
        nodes.push(i);
    }
}

export const saveServer = async (id) => {
    // do some reasearch into how tarui interfaces with the SQL driver so we can just make one statement and hit the backend once overall instead of once for each dif

    for(let i of difs){
        if(i.action == "delete"){
            const result = await pb.collection('data').delete(i.node.id);
        } else if (i.action == "create"){
            const result = await pb.collection('data').create(i.node);
        } else if (i.action == 'update'){
            if(i.node.type == "image" || i.node.type == "file"){
                if(typeof(i.node.file) == "string"){
                    const thing = i.node.file;
                    delete i.node.file;
                    const result = await pb.collection('data').update(i.node.id, i.node);
                    i.node.file = thing;
                    continue
                }
            }
            const result = await pb.collection('data').update(i.node.id, i.node);
        }
    }

    difs.length = 0;
}

export const makeServerBoard = async (name) => {
    await pb.collection('boards').create({boardName: name});
    
    await loadBoards();
}


