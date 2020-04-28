<style>
  #heading {
    font-family: "Bungee Outline", cursive;
    text-transform: uppercase;
    font-size: 60px;
    font-weight: bold;
    margin: 0;
    color: black;
    white-space: nowrap;
  }

  @media (min-width: 475px) {
    #heading {
      font-size: 80px;
    }
  }
</style>

<script>
  export let text;
</script>

<div id="heading">{text}</div>
