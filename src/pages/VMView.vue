<template>
  <q-page class="q-pa-md">
        <!-- start: create vm dialog -->
    <q-dialog v-model="showCreateProgram">
      <CreateNewVM :account="account" :api_server="api_server" />
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
        <q-btn icon="add" color="aleph-radial" label="Create program" @click="showCreateProgram = true"/>
    </div>
    </div>
    <div v-if="account">
      <q-card class="bg-transparent" elevation="0">
        <!-- start: active vm -->
        <div>
          <VMTable :data="programs" :account="account" :loading="loading">
          </VMTable>
        </div>
        <!-- end: actives vm -->
      </q-card>
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
    async getMessages () {
      this.loading = true
      await messages.get_messages({
        addresses: [this.account.address],
        pagination: 1000,
        message_type: 'PROGRAM'
      }).then((response) => {
        this.loading = false
        this.programs = response.messages
      }).catch(() => {
        this.loading = false
      })
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
