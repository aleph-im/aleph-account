<template>
  <div id="q-app" style="padding-top:40px">
    <div class="network_errors" v-if="has_network_errors">
      <template v-if="network_errors.github">
        Cannot reach Github API, CCN and CRN versions check are disabled.
      </template>
      <template v-if="network_errors.scores">
        Cannot get score information
      </template>
      <template v-if="network_errors.websockets">
        The websocket API is experiencing issues, live status updates are disabled.
      </template>
    </div>

    <router-view />
  </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  computed: {
    has_network_errors () {
      return Object.values(this.network_errors).some(v => v)
    },
    ...mapState({
      network_errors: state => state.network_errors
    })
  }
}
</script>
<style lang="scss">
body.body--dark  {
  background:#1d2a31;
}

.network_errors{
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFF;
  background-color: #fd686a;
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
