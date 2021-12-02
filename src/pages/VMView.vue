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

        <!-- <q-btn icon="add" color="aleph-radial" label="Create VM" /> -->
      </div>
    </div>
    <div v-else class="login-info">
      Please connect.
    </div>
    <div v-if="account">
      <q-tab-panels class="bg-transparent" v-model="tab" elevation="0">
        <!-- start: active vm -->
        <q-tab-panel name="active">
          <VMTable :data="programs" :account="account">
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
import { messages } from 'aleph-js'

export default {
  name: 'my-programs',
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
      programs: [],
      id: '',
      agentVersion: '',
      tab: 'active'
    }
  },
  methods: {
    async getMessages () {
      console.log('addr', this.account.address)
      let items = await messages.get_messages({
        addresses: [this.account.address],
        pagination: 1000,
        messages_type: 'PROGRAM'
      })
      console.log(items)
      this.programs = items.messages
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
