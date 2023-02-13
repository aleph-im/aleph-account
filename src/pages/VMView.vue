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
        <div class="column">
        <div class="row">
          <q-input standout v-model="search" @keydown.enter.prevent="reloadVM()" dense label="Search program"
            class="q-mr-md">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn icon="refresh" class="q-mr-md" color="aleph-radial" :disabled="loading" :loading="loading"
            label="Reload" @click="reloadVM()" />
          <q-btn icon="add" color="aleph-radial" label="Create program" @click="showCreateProgram = true"
            :disabled="balance_info.ALEPH < 1" />
        </div>
        <div class="row justify-end q-mt-md"><q-pagination push v-model="current_page" :max="pagination.pages" direction-links flat color="grey"
        active-color="primary" /></div>
      </div>
      </div>
    </div>
    <div v-if="account">
      <!-- start: active vm -->
      <VMTable :data="programs" :account="account" :loading="loading">
      </VMTable>
      <!-- end: actives vm -->
      <div class="row justify-end">
      <q-pagination v-model="current_page" :max="pagination.pages" direction-links flat color="grey"
        active-color="primary" />
      </div>
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
      current_page: 1,
      pagination: {
        total: 0,
        pages: 1,
        per_page: 20
      },
      programs: [],
      search: '',
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
      let params = {
        addresses: [this.account.address],
        pagination: this.pagination.per_page,
        page: this.current_page,
        message_type: 'PROGRAM'
      }
      if (this.search.length > 0) {
        params.hashes = [this.search]
      }
      messages.get_messages(params).then(async (response) => {
        this.pagination.total = response.pagination_total
        this.pagination.pages = Math.ceil(response.pagination_total / this.pagination.per_page)
        let programsTmp = response.messages
        for (let i = 0; i < programsTmp.length; i++) {
          let tx = programsTmp[i].content?.code.ref
          // retrieve store messages
          if (tx && !programsTmp[i].forgotten_by) {
            messages.get_messages({
              addresses: [this.account.address],
              hashes: [tx]
            }).then(async (response) => {
              let storeObj = response.messages[0].content
              programsTmp[i].storeObj = storeObj
            }).catch(() => {
              this.loading = false
            })
          }
        }
        this.programs = programsTmp
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    async reloadVM () {
      await this.getMessages()
    }
  },
  watch: {
    account (account) {
      this.$store.dispatch('update_stored')
      this.getMessages()
    },
    current_page (value) {
      this.pagination.current = value
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
