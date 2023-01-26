<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="cid_prompt">
      <q-card style="min-width: 400px">
        <q-inner-loading :showing="cid_loading">
          <q-spinner size="50px" color="white" />
        </q-inner-loading>
        <q-card-section>
          <div class="text-h6">Pin IPFS item</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="cid_name" label="Name (optional)" />
          <q-input dense v-model="cid_input" autofocus label="Content Hash (CID)" @keyup="fetch_cid_info"
            @keyup.enter="upload_cid" @change="fetch_cid_info" />
        </q-card-section>

        <q-card-section v-if="cid_info">
          <b>Type:</b> {{ cid_info.type }}<br />
          <b>Size:</b> {{ humanStorageSize(cid_info.cumulativeSize) }}
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn :disable="cid_info === null" color="aleph-radial" label="Pin content" @click="upload_cid"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="delete_prompt">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Are you sure?</div>
          <div class="text-body2 q-mt-md">You are about to delete a file with the following CID:</div>
          <div class="text-body1 text-weight-bold q-my-md">{{ selected_message.content?.item_hash }}</div>
          <div class="text-body2">This file stored on IPFS will be unpinned from the node.</div>
          <div class="text-body2 q-my-md">Leave a note for future reference. (Optional)</div>
          <div class="text-body2">
            <q-input ref="delete_field" standout v-model="selected_message.reason" label="Enter note" />
          </div>
          <div class="text-body2 q-mt-md">In order to confirm your action, please enter <span class="text-weight-bold">
              DELETE</span> in capital letters.</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input ref="delete_field" standout v-model="delete_field" label="Type DELETE here"
            :rules="[delete_rules]" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn color="aleph-radial" label="Delete" :disable="delete_field !== 'DELETE'" :loading="loading"
            @click="forgetMessage(selected_message)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div v-if="account" class="q-mb-md">
      <input type="file" style="display: none" ref="finput" @change="do_upload" />
      <input type="file" style="display: none" ref="folinput" @change="do_upload_folder" webkitdirectory />

      <div class="row justify-between">
        <q-tabs v-model="tab">
          <q-tab name="active" label="Active" />
          <q-tab name="archived" label="Archived" />
        </q-tabs>

        <q-btn-dropdown color="aleph-radial" label="Public upload" icon="cloud_upload" v-if="connected">
          <q-list>
            <q-item clickable v-close-popup @click="$refs.finput.click()">
              <q-item-section side>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>
                <q-item-label>File</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$refs.folinput.click()">
              <q-item-section side>
                <q-icon name="drive_folder_upload" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Folder</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="display_cid_prompt">
              <q-item-section side>
                <q-icon name="integration_instructions" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Pin IPFS CID (Hash)</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <div v-else>
          <p>{{ status }}</p>
        </div>
      </div>
    </div>
    <div v-else>
      Please connect.
    </div>
    <div v-if="account">
      <q-expansion-item v-for="item of displayed_stores" class="overflow-hidden rounded-borders q-mb-md"
        :icon="item.content.content_type === 'directory' ? 'folder' : 'attachment'" :key="item.hash"
        :label="item.content.name ? item.content.name : item.content.item_hash" expand-icon-class="text-white"
        :header-class="'bg-expand text-white ' + ($q.dark.isActive ? 'bg-dark-40' : 'bg-aleph-radial')" flat>
        <q-card class="bg-card-expand rounded-borders" :bordered="!$q.dark.isActive">
          <q-card-section horizontal>
            <q-list class="col q-my-sm">
              <q-item>
                <q-item-section>
                  <q-item-label caption>CID</q-item-label>
                  <q-item-label>
                    {{ item.content.item_hash }}
                    <q-btn flat round icon="content_copy" size="sm" @click="copyToClipboard(item.content.item_hash)" />
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Size</q-item-label>
                  <q-item-label class="text-body2 overflow-hidden">
                    {{ humanStorageSize(item.content?.size) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Date pinned</q-item-label>
                  <q-item-label class="text-body2 overflow-hidden">
                    {{ new Date(item.time * 1000).toLocaleDateString() }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-separator vertical />

            <q-card-actions vertical class="justify-start q-px-md">
              <q-btn flat icon="link" align="left" label="Direct link"
                @click="copyToClipboard(`https://ipfs.io/ipfs/${item.content.item_hash}`)" />
              <q-btn flat icon="archive" align="left" label="Archive" v-if="tab === 'active'"
                @click="change_item_metadata(item, { status: 'archived' })" />
              <q-btn flat icon="unarchive" align="left" label="Recover" v-if="tab === 'archived'"
                @click="change_item_metadata(item, { status: 'active' })" />
              <q-btn flat icon="delete" align="left" label="Delete" v-if="tab === 'archived'"
                @click="show_delete_prompt(item)" />
            </q-card-actions>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script>

import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { mapState } from 'vuex'
import { store, broadcast, aggregates, ethereum, solana } from 'aleph-js'
import { format, copyToClipboard } from 'quasar'
import { sha256 as Sha256 } from 'sha.js'
import isIPFS from 'is-ipfs'


function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  name: 'IPFSPinPage',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    store_info: 'store_info',
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
        if (item.content) {
          value += (item.content.size ? item.content.size : 0)
        }
      }
      return value / (1024 ** 2)
    },
    displayed_stores (state) {
      let ipfs_stores = this.stored.filter(
        item => item.content?.item_type === 'ipfs'
      )
      if (this.tab === 'active') {
        return ipfs_stores.filter(
          item => (
            (state.store_info[item.item_hash] === undefined) ||
            (state.store_info[item.item_hash].status === undefined) ||
            (state.store_info[item.item_hash].status === 'active')
          )
        )
      } else if (this.tab === 'archived') {
        return ipfs_stores.filter(
          item => (
            (state.store_info[item.item_hash] !== undefined) &&
            (state.store_info[item.item_hash].status === 'archived')
          )
        )
      }
      return []
    }
  }),
  components: {
  },
  data () {
    return {
      ipfs: null,
      loading: null,
      connected: false,
      status: 'Connecting to IPFS...',
      id: '',
      agentVersion: '',
      upload_type: 'file',
      humanStorageSize: humanStorageSize,
      copyToClipboard: copyToClipboard,
      tab: 'active',
      cid_loading: false,
      cid_prompt: false,
      cid_input: '',
      cid_info: null,
      cid_name: '',
      selected_message: {
        reason: 'None'
      },
      delete_prompt: false,
      delete_field: ''
    }
  },
  methods: {
    delete_rules (val) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(!!val & val === 'DELETE' || 'please enter DELETE in capital letters')
        }, 500)
      })
    },
    show_delete_prompt (message) {
      this.delete_prompt = true
      this.selected_message = message
    },
    async change_item_metadata (item, updates) {
      let curmetadata = {}
      if (this.store_info[item.item_hash] !== undefined) {
        Object.assign(curmetadata, this.store_info[item.item_hash])
      }
      Object.assign(curmetadata, updates)
      let new_info = {}
      Object.assign(new_info, this.store_info)
      new_info[item.item_hash] = curmetadata

      await aggregates.submit(
        this.account.address,
        'stores',
        new_info,
        {
          account: this.account, channel: 'PINNING'
        }
      )
      this.$store.commit('set_store_info', new_info)
    },
    async display_cid_prompt () {
      this.cid_prompt = true
      this.cid_info = null
      this.cid_input = ''
      this.cid_name = ''
    },
    async getIpfsNodeInfo () {
      try {
        // Await for ipfs node instance.
        this.ipfs = await this.$ipfs
        // Call ipfs `id` method.
        // Returns the identity of the Peer.
        const { agentVersion, id } = await this.ipfs.id()
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
    async do_upload (evt) {
      const ipfs = this.ipfs
      for (let file of evt.target.files) {
        let res = await ipfs.add({
          path: file.name,
          content: file
        })
        await this.create_store(res)
      }
    },
    async do_upload_folder (evt) {
      let content = []
      let total_size = 0
      for (let file of evt.target.files) {
        content.push({
          path: file.webkitRelativePath,
          content: file
        })
        total_size = total_size + file.size
      }
      let result = null
      await this.create_store(result)
    },
    async create_store (result) {
      if ((result.size / (1024 ** 2)) <= (this.allowance - this.total_used)) {
        await store.submit(this.account.address, {
          account: this.account,
          api_server: this.api_server,
          file_hash: result.cid.string,
          storage_engine: 'ipfs',
          channel: 'PINNING',
          extra_fields: {
            name: result.path
          }
        })
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'ERROR: Not enough storage allowance, please replenish your ALEPH balance.'
        })
      }
      await sleep(1000)
      this.$store.dispatch('update_stored')
      await sleep(5000)
      this.$store.dispatch('update_stored')
    },
    async fetch_cid_info () {
      if (!isIPFS.cid(this.cid_input)) { this.cid_info = null }
      try {
        this.cid_loading = true
        this.cid_info = await this.ipfs.files.stat('/ipfs/' + this.cid_input, {
          size: true,
          timeout: 10000
        })
        console.log(this.cid_info)
      } catch {
        this.cid_info = null
      } finally {
        this.cid_loading = false
      }
    },
    async upload_cid () {
      if (this.cid_info !== null) {
        await this.create_store({
          cid: this.cid_info.cid,
          size: this.cid_info.cumulativeSize,
          path: this.cid_name
        })
      }
    },
    async putContent (message, content, inline_requested, api_server) {
      let inline = inline_requested
      if (inline) {
        let serialized = JSON.stringify(content)
        if (serialized.length > 150000) {
          inline = false
        } else {
          message.item_type = 'inline'
          message.item_content = serialized
          message.item_hash = new Sha256().update(serialized).digest('hex') // eslint-disable-line no-use-before-define
        }
      }
    },
    async send (message) {
      if (this.account.type === 'ETH') {
        message = await ethereum.sign(this.account, message)
      } else if (this.account.type === 'SOL') {
        message = await solana.sign(this.account, message)
      }
      await broadcast(message, { api_server: this.api_server })
    },
    async forgetMessage (item) {
      this.loading = true
      const timestamp = Date.now() / 1000
      const content = {
        address: this.account.address,
        time: timestamp,
        hashes: [item.item_hash],
        reason: item.reason?.length > 0 ? item.reason : 'None'
      }
      const message = {
        chain: item.chain,
        sender: item.sender,
        type: 'FORGET',
        channel: item.channel,
        confirmed: false,
        signature: '',
        size: 0,
        time: timestamp,
        item_type: item.item_type,
        item_content: '',
        item_hash: '',
        content: content
      }

      await this.putContent(message, content, true, 'https://api2.aleph.im').catch((response) => {
        this.loading = false
      })

      await sleep(1000)

      await this.send(message)
        .then(() => {
          this.getIpfsNodeInfo()
          this.$store.dispatch('update_stored')
          this.delete_prompt = false
        })
        .catch((response) => {
          this.loading = false
        })

      this.loading = false
    }
  },
  mounted: function () {
    this.getIpfsNodeInfo()
    this.$store.dispatch('update_stored')
    this.$store.dispatch('update_store_info')
  },
  async created () {
    this.node = this.$ipfs
  },
  watch: {
    account (account) {
      this.$store.dispatch('update_stored')
      this.$store.dispatch('update_store_info')
    }
  }
}
</script>

<style lang="scss">

</style>
