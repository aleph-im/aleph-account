<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="showNFTSnapshot">
      <nft-snapshot @close="showNFTSnapshot=false" />
    </q-dialog>
    <div v-if="account" class="q-mb-md">
      <div class="row justify-between">
        <q-tabs
          v-model="tab"
        >
          <q-tab name="active" label="Active" />
          <q-tab name="archived" label="Archived" />
        </q-tabs>

        <q-btn icon="art_track" color="aleph-radial" label="Backup NFT"  @click="showNFTSnapshot=true" v-if="connected" />
        <div v-else>
          <p>{{ status }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      Please connect.
    </div>
    <div v-if="account">
    </div>
  </q-page>
</template>

<script>
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { mapState } from 'vuex'
import { format } from 'quasar'
const { humanStorageSize } = format

import IPFS from 'ipfs'
import NftSnapshot from 'src/components/NftSnapshot.vue'

export default {
  name: 'NFTStoragePage',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    stored: 'stored',
    allowance (state) {
      if (state.account) {
        if (state.balance_info.ALEPH !== undefined) {
          return state.balance_info.ALEPH * state.mb_per_aleph
        }
      }
      return 0
    },
    total_used (state) {
      let value = 0
      for (let item of state.stored) {
        value = value + item.content.size
      }
      return value / (1024 ** 2)
    },
    displayed_stores (state) {
      if (this.tab === 'active') {
        return this.stored.filter(
          item => item.content.item_type === 'ipfs'
        )
      }
      return []
    }
  }),
  components: {
    NftSnapshot
  },
  data () {
    return {
      loading: null,
      connected: false,
      status: 'Connecting to IPFS...',
      id: '',
      agentVersion: '',
      upload_type: 'file',
      humanStorageSize: humanStorageSize,
      tab: 'active',
      showNFTSnapshot: false
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
      this.$store.dispatch('update_stored')
    },
    balance_info (account) {

    }
  }
}
</script>

<style lang="scss">
</style>
