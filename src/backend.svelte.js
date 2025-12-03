import Database from "@tauri-apps/plugin-sql";
import { appState, boards, difs, getID, nodes } from "./global.svelte";
import { replace } from "svelte-spa-router";

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

export const loadSever = async (id) => {

}

export const saveServer = async (id) => {

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
    const result = await db.select("SELECT * FROM boards");

    for(let i of result){
        appState.boards.push(i);
    }

    return result;

}

export const makeLocalBoard = async (name) => {
    const db = await Database.load("sqlite:data.db");
    const id = getID();
    const result = await db.execute("INSERT into boards (id, boardType, boardName) VALUES ($1, $2, $3)", [id, "local", name]);
    appState.boards.push({id: id, boardType: "local", boardName: name});
}

export const makeServerBoard = async (name) => {
    alert('Server boards coming soon!');
}

export const deleteBoard = async (b) => {
    const db = await Database.load("sqlite:data.db");
    const id = b.id;
    let result = await db.execute('DELETE FROM boards WHERE id = $1', [id]);
    result = await db.execute('DELETE FROM data where boardID = $1', [id]);
    await loadBoards();
}