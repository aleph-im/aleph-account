<template>
  <div>
    <q-expansion-item
      v-for="item of data"
      class="overflow-hidden rounded-borders q-mb-md"
      :key="item.hash_item"
      :label="item.hash_item"
      expand-icon-class="text-white"
      :header-class="'bg-expand text-white ' + ($q.dark.isActive?'bg-dark-40':'bg-aleph-radial')"
      flat
    >
      <q-card class="bg-card-expand rounded-borders" :bordered="!$q.dark.isActive">
        <q-card-section horizontal>
          <q-list class="col q-my-sm">
            <q-item>
              <q-item-section>
                <q-item-label caption>Channel</q-item-label>
                <q-item-label>
                  {{item.channel}}
                </q-item-label>
              </q-item-section>
            </q-item>
             <q-item>
              <q-item-section>
                <q-item-label caption>Chain</q-item-label>
                <q-item-label>
                  {{item.chain}}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Chain</q-item-label>
                <q-item-label>
                  {{ellipseAddress(item.item_hash)}}
                  <q-btn @click="copyToClipboard(item.item_hash)" flat round icon="content_copy" size="sm"/>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Size</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{item.size}} MB
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Size</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{item.size}} MB
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label caption>Date pinned</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{new Date(item.time*1000).toLocaleDateString()}}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator vertical />

          <q-card-actions vertical class="justify-start q-px-md">
              <q-btn flat icon="link" label="View Explorer"
                     @click="openExplorer(item)" />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-expansion-item>
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
