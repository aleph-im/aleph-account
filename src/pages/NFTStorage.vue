<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="showNFTSnapshot">
      <nft-snapshot @finished="uploaded" />
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
      <div class="row">
        <div class="col-6 col-md-3 q-pa-sm" v-for="item of nfts" :key="item.item_hash">
          <q-card>
          <q-img :src="item.content.metadata.image.replace('ipfs://', 'https://ipfs.io/')" v-if="item.content.metadata.image" />
          <q-video :src="item.content.metadata.animation_url.replace('ipfs://', 'https://ipfs.io/')" v-else-if="item.content.metadata.animation_url" />

            <q-card-section v-if="item.content.metadata.name">
              <div class="text-h6">{{item.content.metadata.name.substring(0, 100)}}</div>
              <div class="text-subtitle2">
                Snapshot from {{new Date(item.time*1000).toLocaleDateString()}}
              </div>

            <div class="text-caption text-grey" v-if="item.content.metadata.description">
                {{ item.content.metadata.description.substring(0, 200) }}
            </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { mapState } from 'vuex'
import { format } from 'quasar'
import { posts } from 'aleph-js'
const { humanStorageSize } = format

import IPFS from 'ipfs'
import NftSnapshot from 'src/components/NftSnapshot.vue'
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
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
      showNFTSnapshot: false,
      nfts: []
    }
  },
  methods: {
    async uploaded () {
      this.showNFTSnapshot = false
      await sleep(1000)
      await this.update()
    },
    async update () {
      let result = await posts.get_posts('nft-snapshot', {
        api_server: this.api_server,
        addresses: [this.account.address]
      })
      this.nfts = result.posts
    },
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
    this.update()
  },
  async created () {
    this.node = await IPFS.create()
  },
  watch: {
    account (account) {
      this.$store.dispatch('update_stored')
      this.update()
    },
    balance_info (account) {

    }
  }
}
</script>

<style lang="scss">
</style>
