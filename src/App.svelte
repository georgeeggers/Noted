<script>
  import Router, { location } from "svelte-spa-router";
    import { routes } from "./routes.svelte";
    import { onMount } from "svelte";
    import { BaseDirectory } from "@tauri-apps/plugin-fs";

  onMount(() => {


    document.addEventListener('contextmenu', (event) => { 
      event.preventDefault(); 
    });
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

