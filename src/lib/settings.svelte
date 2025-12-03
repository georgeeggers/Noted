<script>
    import { replace } from "svelte-spa-router";
    import { ArrowLeft, Moon, Sun } from "@lucide/svelte";
    import DropdownAction from "./modules/dropdownAction.svelte";
    import { color, loadTheme, saveSettings, settings, themes } from "../global.svelte";
    import DropdownSelector from "./modules/dropdownSelector.svelte";

    let fonts = ['Monospace', "Arial", "Roboto"];
    let fontSizes = ["Smaller", "Small", "Normal", "Big", "Bigger"];
    let borders = ["Square", "Squarcle", "Rounded", "Roundest"];
    let gaps = [0, 5, 10, 20, 50];

    const save = async (a) => {
        await saveSettings();
    }

</script>



<div class="globalArea">

    <h1 class='header'>Settings</h1>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="headerBar" onclick={() => replace("/")}>
        <p>Back</p>
        <ArrowLeft size={20} />
    </div>

    
    <div class="content">
        <div class="setting">
            <div class="title">
                <p>Text</p>
            </div>

            <div class="subSetting">
                <div class="text">
                    <p class='settingName'>Font</p>
                    <p>Selects the font used in the app</p>
                </div>
                <DropdownSelector stickLeft={false} options={fonts} bind:selected={settings.font} callbackFunc={save}/>
            </div>

            <div class="subSetting">
                <div class="text">
                    <p class='settingName'>Font Size</p>
                    <p>Controls the size of the text across the app</p>
                </div>
                <DropdownSelector stickLeft={false} options={fontSizes} bind:selected={settings.fontSize} callbackFunc={save}/>

            </div>

        </div>

        <div class="setting">
            <div class="title">
                <p>UI</p>
            </div>

            <div class="subSetting">
                <div class="text">
                    <p class='settingName'>Borders</p>
                    <p>Decides the radius of borders</p>
                </div>
                <DropdownSelector stickLeft={false} options={borders} bind:selected={settings.border} callbackFunc={save}/>
            </div>

            <div class="subSetting">
                <div class="text">
                    <p class='settingName'>Gap</p>
                    <p>Controls the gap size between notes when sorting</p>
                </div>
                <DropdownSelector stickLeft={false} options={gaps} bind:selected={settings.gap} displayFunc={(a) => {return `${a}px`}} callbackFunc={save}/>
            </div>

        </div>

        <div class="setting">
            <div class="title">
                <p>Theme</p>
            </div>
                <div class="themeContainer">
                    {#each themes as t, i}
                        <button class='invis' id='{t.name}' onclick={() => loadTheme(t, i)}>{t.name}</button>
                        <label class='theme {settings.themeIndex == i ? 'selected' : ""}' for="{t.name}">
                            {#if t.type == "dark"}
                                <Moon size=20 />
                            {:else}
                                <Sun size=20 />
                            {/if}
                            <p>{t.name}</p>
                        </label>
                    {/each}
                </div>
        </div>

    </div>



</div>



<style>



.themeContainer {
    width: 100%;
    height: fit-content;
    flex-wrap: wrap;
    flex-direction: row;
    display: flex;
    box-sizing: border-box;
    gap: 10px;
}

.theme {
    background-color: var(--lighter-bg-color);
    font-size: calc(16px + var(--font-size-modifier));
    display: flex;
    flex-direction: row;
    gap: 7px;
    padding: 10px;
    border: 1px solid var(--lightest-bg-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background .25s ease;
    color: var(--text-color);
    align-items: center;
}

.theme:hover {
    background-color: var(--lightest-bg-color);
}

.selected {
    color: var(--light-main-color);
    background-color: var(--lightest-bg-color);

}

.content {
    gap: 20px;
}

.subSetting {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
    padding: 20px;
}

.text {
    width: fit-content;
    display: flex;
    flex-direction: column;
    color: var(--text-color);
}

.text {
    font-size: calc(16px + var(--font-size-modifier));
}

.settingName {
    font-size: calc(20px + var(--font-size-modifier));
}

.setting {
    width: 100%;
    background-color: var(--light-bg-color);
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
    align-items: center;
    border: 1px solid var(--lighter-bg-color);
}

.title p {
    font-size: calc(24px + var(--font-size-modifier));
    margin: 0px;
}

.title {
    display: flex;
    padding: 10px;
    justify-content: center;
    color: var(--header-color);
}

.globalArea {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100%;
    align-items: center;
    display: flex;
    padding: 50px;
    gap: 10px;
    flex-direction: column;
    padding-bottom: 1000px;
}

.header {
    margin: 0px;
    font-size: calc(40px + var(--font-size-modifier));
    color: var(--header-color);
}


.headerBar {
    width: fit-content;
    box-sizing: border-box;
    background-color: var(--input-color);
    height: fit-content;
    position: fixed;
    z-index: 10;
    top: 20px;
    right: 20px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: row;
    border-radius: var(--border-radius);
    gap: 10px;
    color: var(--header-color);
    transition: background-color .25s ease;
    backdrop-filter: blur(5px);
    cursor: pointer;
    border: 1px solid var(--lightest-bg-color);
}

.headerBar:hover {
    background-color: var(--lightest-bg-color);
}

.headerBar p {
    font-size: calc(16px + var(--font-size-modifier));
    margin: 0px;
}
</style>