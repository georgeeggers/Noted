<script>
  import Router from "svelte-spa-router";
    import { routes } from "./routes.svelte";
    import { onMount } from "svelte";

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

