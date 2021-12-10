<template>
  <q-page class="q-pa-md">
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

export default {
  name: 'programs',
  components: {
    VMTable
  },
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    stored: 'stored'
  }),
  data () {
    return {
      loading: true,
      programs: [],
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
