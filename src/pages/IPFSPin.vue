<template>
  <q-page class="q-pa-md">
    <div v-if="account && connected" class="q-mb-md">
      <!-- <p>ID: {{ id }}</p>
      <p>Agent version: {{ agentVersion }}</p>
      <q-uploader
        max-total-size="10737418"
        multiple
        :factory="upload_files"
        :color="$q.dark.isActive?'dark-40':'aleph-radial'"
        flat :bordered="!$q.dark.isActive"
      /> -->

      <q-btn-dropdown color="primary" label="Dropdown Button">
        <q-list>
          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Photos</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Videos</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="onItemClick">
            <q-item-section>
              <q-item-label>Articles</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <div v-else-if="!connected">
      <h3>{{ status }}</h3>
    </div>
    <div v-else>
      Please connect.
    </div>

    <div v-if="account">
      <q-expansion-item
        class="overflow-hidden rounded-borders"
        icon="explore"
        label="Counter"
        expand-icon-class="text-white"
        :header-class="'bg-expand text-white ' + ($q.dark.isActive?'bg-dark-40':'bg-aleph-radial')"
        flat
      >
        <q-card class="bg-card-expand rounded-borders" :bordered="!$q.dark.isActive">
          <q-card-section>
            Counting: <q-badge color="secondary">{{ counter }}</q-badge>.
            Will only count when opened, using the show/hide events to control count timer.
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script>
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { mapState } from 'vuex'

import IPFS from 'ipfs'

export default {
  name: 'IPFSPinPage',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    node_post_type: 'node_post_type',
    total_per_day (state) {
      return 15000 * ((Math.log10(this.active_nodes) + 1) / 3)
    },
    total_per_aleph_per_day (state) {
      return this.total_per_day / this.total_staked_in_active
    },
    dropzone_options: {
      thumbnailWidth: 150,
      maxFilesize: 100
    }
  }),
  components: {
  },
  data () {
    return {
      loading: null,
      connected: false,
      status: 'Connecting to IPFS...',
      id: '',
      agentVersion: ''
    }
  },
  methods: {
    async getIpfsNodeInfo () {
      try {
        // Await for ipfs node instance.
        const ipfs = await this.$ipfs
        // Call ipfs `id` method.
        // Returns the identity of the Peer.
        const { agentVersion, id } = await ipfs.id()
        this.agentVersion = agentVersion
        this.id = id
        // Set successful status text.
        this.status = 'Connected to IPFS =)'
        this.connected = true
      } catch (err) {
        // Set error status text.
        this.status = `Error: ${err}`
        this.connected = false
      }
    },
    async upload_files (a, b) {
      console.log(a, b)
    }
  },
  mounted: function () {
    this.getIpfsNodeInfo()
    this.$store.dispatch('update_stored')
  },
  async created () {
    this.node = await IPFS.create()
  },
  watch: {
    account (account) {

    },
    balance_info (account) {
    }
  }
}
</script>

<style lang="scss">
</style>
