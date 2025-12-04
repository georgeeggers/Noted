<script>
    import { saveSettings, settings } from "../../global.svelte";


let { value = $bindable(), onClick = () => {value = !value; }} = $props();

let click = () => {
    onClick();
    saveSettings();
}

</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="main {settings.animations ? 'anim' : ""}" onclick={click} style="{value ? "background-color: var(--dim-main-color);" : ""}">
    <div class="toggleDot {settings.animations ? 'anim' : ""}" style='left: {value ? "calc(100% - 25px);" : "5px;"}'></div>
</div>

<style>

    .toggleDot {
        height: 20px;
        width: 20px;
        border-radius: var(--border-radius);
        position: absolute;
        background-color: white;
    }

    .toggleDot.anim {
        transition: left .25s ease;
    }

    .main {
        width: 60px;
        height: 30px;
        padding: 10px;
        background-color: var(--lighter-bg-color);
        border-radius: var(--border-radius);
        cursor: pointer;
        align-items: center;
        gap: 10px;
        flex-direction: row;
        display: flex;
        cursor: pointer;
        position: relative;
        border: 1px solid var(--lightest-bg-color);
        box-sizing: border-box;
        color: var(--text-color);
    }

    .main.anim {
        transition: background-color .25s ease;
    }
</style>