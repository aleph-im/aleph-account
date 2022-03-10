<template>
  <q-page class="q-pa-md">
        <!-- start: create vm dialog -->
    <q-dialog v-model="showCreateProgram">
      <CreateNewVM :account="account" :api_server="api_server" @created="uploadVM" />
    </q-dialog>
    <!-- end: create vm dialog -->
    <div v-if="account" class="q-mb-md">
      <div v-if="balance_info.ALEPH < 1" class="doc-note doc-note--warning">
        <p>
          <q-icon name="warning" size="md" />
          You need ALEPH tokens to use this dApp section.
        </p>
      </div>
    </div>
    <div v-else class="login-info">
      Please connect.
    </div>
    <div class="q-mb-md" v-if="account">
    <div class="row justify-end">
        <q-btn icon="refresh" class="q-mr-md" color="aleph-radial" label="Reload" @click="reloadVM()"/>
        <q-btn icon="add" color="aleph-radial" label="Create program" @click="showCreateProgram = true"/>
    </div>
    </div>
    <div v-if="account">
      <!-- start: active vm -->
      <VMTable :data="programs" :account="account" :loading="loading" >
      </VMTable>
      <!-- end: actives vm -->
    </div>
  </q-page>
</template>

<script>
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import { mapState } from 'vuex'
import VMTable from '../components/VMTable'
import { messages } from 'aleph-js'
import CreateNewVM from '../components/CreateNewVM'

export default {
  name: 'programs',
  components: {
    VMTable,
    CreateNewVM
  },
  computed: mapState({
    account: state => state.account,
    api_server: state => state.api_server,
    balance_info: state => state.balance_info,
    stored: 'stored'
  }),
  data () {
    return {
      loading: true,
      programs: [],
      showCreateProgram: false,
      id: '',
      agentVersion: '',
      tab: 'active'
    }
  },
  methods: {
    uploadVM (value) {
      this.showCreateProgram = value
      this.getMessages()
    },

    async getMessages () {
      this.loading = true
      await messages.get_messages({
        addresses: [this.account.address],
        pagination: 1000,
        message_type: 'PROGRAM'
      }).then(async (response) => {
        var programsTmp = response.messages
        programsTmp.forEach(async program => {
          let tx = program.content.code.ref
          // retrieve store messages
          await messages.get_messages({
            addresses: [this.account.address],
            hashes: [tx]
          }).then(async (response) => {
            let storeObj = response.messages[0].content
            program.storeObj = storeObj
          }).catch(() => {
            this.loading = false
          })
        })
        this.programs = programsTmp
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    async reloadVM () {
      this.getMessages()
    }
  },
  watch: {
    account (account) {
      this.$store.dispatch('update_stored')
      this.getMessages()
    }
  },
  async mounted () {
    this.getMessages()
  }
}
</script>

<style lang="scss">
</style>
