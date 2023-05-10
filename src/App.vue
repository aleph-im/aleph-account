<template>
  <div id="q-app" style="padding-top:40px">
    <div class="scores_disclaimer" v-if="_scores_grace_period_end - Date.now() > 0">
      <a href="https://medium.com/aleph-im/new-nodes-scoring-on-aleph-network-20a0cfc305fa">Starting from May 4th 2023 (23:59 UTC), our new reward system will be in effect, balancing rewards based on nodes scores.</a>
    </div>

    <router-view />
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  computed: mapState({
    _scores_grace_period_end: state => state._scores_grace_period_end
  })
}
</script>
<style lang="scss">
body.body--dark  {
  background:#1d2a31;
}

.scores_disclaimer{
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
  background-color: #0055FF;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 6000;
  font-weight: bold;

  a{
    color: inherit;
  }
}
</style>
