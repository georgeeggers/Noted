export let settings = $state({
    noteWidth: 500,
    imageWidth: 750
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
    selectedBoard: 0,
})

// this is a list of actions that the user takes on a certain board which provide easy updating for the backend later on
// this will, at worst, grow to be the size of nodes. This shouldn't be a massive issue though
// potential optimizations could be to just store the id for delete requests and changes for update requests
export let difs = $state([]);

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