<template>
  <q-page class="q-pa-md">
    <div v-if="account" class="q-mb-md">
      <div v-if="balance_info.ALEPH < 1" class="doc-note doc-note--warning">
        <p>
          <q-icon name="warning" size="md" />
          You need ALEPH tokens to use this dApp section.
        </p>
      </div>
      <div class="row justify-between">
        <q-tabs
          v-model="tab"
        >
          <q-tab name="active" label="Active" />
          <!-- <q-tab name="archived" label="Archived" /> -->
        </q-tabs>

        <q-btn icon="add" color="aleph-radial" label="Create VM" />
      </div>
    </div>
    <div v-else class="login-info">
      Please connect.
    </div>
    <div v-if="account">
      <q-tab-panels class="bg-transparent" v-model="tab" elevation="0">
        <!-- start: active vm -->
        <q-tab-panel name="active">
          <VMTable :data="messages" :account="account">
          </VMTable>
        </q-tab-panel>
        <!-- end: actives vm -->
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { mapState } from 'vuex'
import VMTable from '../components/VMTable'
// import { messages } from 'aleph-js'

export default {
  name: 'VMPage',
  components: {
    VMTable
  },
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    stored: 'stored',
    async allowance (state) {
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
    }
  }),
  data () {
    return {
      loading: null,
      messages: [{
        _id: {
          $oid: '618e2fa2f8ed30f3517347a6'
        },
        item_hash: 'a6ea73d01d8978eccfcc799972873d8dccfc031db26ac41786e1c3b45c2e27ee',
        channel: 'TEST',
        chain: 'ETH',
        confirmed: true,
        size: 587,
        time: 1636708258.6329114
      },
      {
        _id: {
          $oid: '618e2fa2f8ed30f3517347a6'
        },
        item_hash: 'a6ea73d01d8978eccfcc799972873d8dccfc031db26ac41786e1c3b45c2e27ee',
        channel: 'TEST',
        chain: 'ETH',
        confirmed: true,
        size: 587,
        time: 1636708258.6329114
      }],
      id: '',
      agentVersion: '',
      tab: 'active'
    }
  },
  methods: {
    async getMessages () {
      // let items = await messages.get_messages({
      //   message_type: 'STORE',
      //   addresses: ['0x101d8D16372dBf5f1614adaE95Ee5CCE61998Fc9'],
      //   pagination: 1000,
      //   api_server: this.api_server,
      //   channel: 'PINNING'
      // })
    }
  },
  watch: {
    account (account) {
      this.$store.dispatch('update_stored')
    },
    balance_info (account) {

    }
  },
  async mounted () {
    this.getMessages()
  }
}
</script>

<style lang="scss">
</style>
