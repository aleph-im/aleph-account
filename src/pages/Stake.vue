<template>
  <q-page class="q-pa-md">
    <q-table
      title="Nodes"
      :data="values"
      :filter="filter"
      flat
      class="bg-transparent"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="search nodes">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'PageIndex',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server
  }),
  data () {
    return {
      filter: '',
      values: [
        {
          nodeId: 'node-id-123456',
          nodeName: '<Name>',
          staked: 321000,
          status: 'active',
          uptime: 100,
          creationDate: new Date(2020, 12, 18, 11, 18, 31, 255),
          starred: false
        }
      ]
    }
  }
}
</script>
