<template>
  <div>
    <q-table
      grid
      card-class="bg-primary text-white"
      title="VMs"
      :data="data"
      :columns="columns"
      no-data-label="No VM found"
      row-key="name"
      :filter="filter"
    >
      <template v-slot:top-right>
        <q-input borderless dense  v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <!-- TODO: slice hash -->
      <template v-slot:item="props">
        <q-card class="q-mx-sm">
          <q-card-section>
            <q-list separator>
              <q-item :clickable="false">
                <q-item-section>
                  <q-item-label overline>Channel</q-item-label>
                  <q-item-label>{{props.row.channel}}</q-item-label>
                  <q-item-label overline>Chain</q-item-label>
                  <q-item-label>{{props.row.chain}}</q-item-label>
                  <q-item-label overline>Item Hash</q-item-label>
                  <q-item-label>{{ellipseAddress(props.row.item_hash)}}</q-item-label>
                  <q-item-label overline>Time</q-item-label>
                  <q-item-label>{{convertTimestamp(props.row.time)}}</q-item-label>
                  <q-item-label overline>Size</q-item-label>
                  <q-item-label>{{props.row.size}} MB</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-actions>
              <q-btn color="aleph-radial" label="View Explorer" @click="openExplorer(props.row)">
                <q-icon right size="xs" class="material-icons">
                  open_in_new
                </q-icon>
              </q-btn>
            </q-card-actions>
          </q-card-section>
        </q-card>
      </template>
    </q-table>
  </div>
</template>

<script>

import { ellipseAddress, convertTimestamp } from '../helpers/utilities'

export default {
  props: [
    'data',
    'account'
  ],
  data () {
    return {
      ellipseAddress: ellipseAddress,
      convertTimestamp: convertTimestamp,
      filter: '',
      columns: [
        { name: 'channel', label: 'Channel', field: 'channel', align: 'left' },
        { name: 'chain', label: 'Chain', field: 'chain' },
        { name: 'item_hash', label: 'Item Hash', field: 'item_hash' },
        { name: 'time', label: 'Time', field: 'time', sortable: true },
        { name: 'size', label: 'Size', field: 'size', sortable: true }
      ]
    }
  },

  methods: {
    openExplorer (message) {
      const explorerURL = `https://explorer.aleph.im/address/ETH/${this.account.address}/message/PROGRAM/${message.item_hash}`
      window.open(explorerURL, '_blank')
    }
  }
}
</script>
