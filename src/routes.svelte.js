import Notes from "./lib/notes.svelte";
import MainMenu from "./lib/mainMenu.svelte";
import Settings from "./lib/settings.svelte";
export const routes = {
    "/": MainMenu,
    "/notes": Notes,
    "/settings": Settings,
}