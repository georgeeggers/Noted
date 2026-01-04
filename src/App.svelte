<script>
  import Router from "svelte-spa-router";
  import { routes } from "./routes.svelte";
  import { onMount } from "svelte";
  import { color, loadSettings, saveSettings, settings, translateFontSizes, translateRadius } from "./global.svelte";

  let init = $state(true);

  $effect(() => {
      const colorVars = {
          '--header-color': color.headerColor,
          '--text-color': color.textColor,
          '--main-color': color.mainColor,
          '--light-main-color': color.lightMainColor,
          '--dim-main-color': color.dimMainColor,
          '--gray-color': color.grayColor,
          '--input-color': color.inputColor,
          '--bg-color': color.bgColor,
          '--light-bg-color': color.lightBgColor,
          '--lighter-bg-color': color.lighterBgColor,
          '--lightest-bg-color': color.lightestBgColor,
          '--fail-color': color.fail,
          '--font-size-modifier': `${translateFontSizes(settings.fontSize)}px`,
          '--font': `${settings.font}`,
          '--border-radius': `${translateRadius(settings.border)}px`
      };
      for (const [varName, value] of Object.entries(colorVars)) {
        document.documentElement.style.setProperty(varName, `${value}`);
      }
      if(!init){
        saveSettings();
      }
  })


  onMount(async () => {
    await loadSettings();
    document.addEventListener('contextmenu', (event) => { 
      event.preventDefault(); 
    });

    init = false;

  })

</script>

<div class="globalContainer">

  <Router routes={routes} />

</div>

<style>
  .globalContainer {
    height: 100lvh;
    width: 100vw;
    box-sizing: border-box;
  }

</style>


