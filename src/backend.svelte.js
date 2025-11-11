import { BaseDirectory, readFile, readTextFile } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";
import { appState, boards, difs, getID, nodes } from "./global.svelte";

// using tauri's built in SQL plugin for interfacing with the data because i'm lazy and this is easy
// i have NO idea where the db actually exists on disk, but it works so I can't be bothered

export const saveLocal = async () => {
    console.log("saving local");
    const db = await Database.load("sqlite:data.db");

    // do some reasearch into how tarui interfaces with the SQL driver so we can just make one statement and hit the backend once overall instead of once for each dif

    for(let i of difs){
        if(i.action == "delete"){
            const result = await db.execute(
                'DELETE FROM data WHERE id = $1', 
                [i.node.id]
            );
        } else if (i.action == "create"){
            const result = await db.execute(
                'INSERT into data (id, x, y, type, title, content, file, editing) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [i.node.id, i.node.x, i.node.y, i.node.type, i.node.title, i.node.content, i.node.file, i.node.editing ? 1 : 0]
            );
        } else if (i.action == 'update'){
            const result = await db.execute(
                'UPDATE data SET x = $1, y = $2, type = $3, title = $4, content = $5, file = $6, editing = $7 WHERE id = $8',
                [i.node.x, i.node.y, i.node.type, i.node.title, i.node.content, i.node.file, i.node.editing ? 1 : 0, i.node.id]
            );
        }
    }

    difs.length = 0;
}

export const loadLocal = async () => {
    // do this to reset the nodes array
    nodes.length = 0;
    difs.length = 0;
    const db = await Database.load("sqlite:data.db");
    const result = await db.select("SELECT * FROM data");
    for(let i of result){
        nodes.push(i);
    }
}

export const saveServer = () => {

}