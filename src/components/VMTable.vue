<template>
  <div>
    <div v-if="!loading">
      <q-expansion-item
        v-for="item of data"
        class="overflow-hidden rounded-borders q-mb-md"
        :key="item.item_hash"
        :label="getProgramLabel(item)"
        icon="computer"
        expand-icon-class="text-white"
        :header-class="'bg-expand text-white ' + ($q.dark.isActive?'bg-dark-40':'bg-aleph-radial')"
        flat
      >
        <q-card  class="bg-card-expand rounded-borders" :bordered="!$q.dark.isActive">
          <q-card-section horizontal>
            <q-list class="col q-my-sm">
              <q-item>
                <q-item-section>
                  <q-item-label caption>Item Hash</q-item-label>
                  <q-item-label>
                    {{item.item_hash}}
                    <q-btn @click="copyToClipboard(item.item_hash)" flat round icon="content_copy" size="sm"/>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Program Name</q-item-label>
                  <q-item-label>
                    {{getProgramLabel(item)}}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Size</q-item-label>
                  <q-item-label class="text-body2 overflow-hidden">
                    {{item.storeObj ? item.storeObj.size : 'Null' }}b
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Date</q-item-label>
                  <q-item-label class="text-body2 overflow-hidden">
                    {{convertTimestamp(item.time)}}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Channel</q-item-label>
                  <q-item-label>
                    {{item.channel}}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-separator vertical />

            <q-card-actions vertical class="justify-start q-px-md">
                <q-btn flat icon="play_arrow" align="left" label="Open app"
                      @click="openApp(item)" />
                <q-btn flat icon="link" align="left" label="View Explorer"
                      @click="openExplorer(item)" />
                <q-btn flat icon="upload_file" align="left" label="Download source code"
                      @click="downloadSourceCode(item.storeObj.item_hash)" />
            </q-card-actions>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>
    <div v-else>
      <q-card  flat class="bg-card-expand rounded-borders" :bordered="!$q.dark.isActive">
          <q-skeleton class="q-py-sm" type="rect" />
      </q-card>
    </div>
  </div>
</template>

<script>

import { convertTimestamp } from '../helpers/utilities'
import { copyToClipboard } from 'quasar'

export default {
  props: [
    'data',
    'account',
    'loading'
  ],
  data () {
    return {
      convertTimestamp: convertTimestamp,
      copyToClipboard: copyToClipboard,
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
    },

    openApp (message) {
      const explorerURL = `https://aleph.sh/vm/${message.item_hash}`
      window.open(explorerURL, '_blank')
    },

    downloadSourceCode (item_hash) {
      const explorerURL = `http://api2.aleph.im/api/v0/storage/raw/${item_hash}`
      window.open(explorerURL, '_blank')
    },

    getProgramLabel (program) {
      if (!('extra_fields' in program.content)) {
        return program.item_hash
      } else if (!('program_name' in program.content.extra_fields)) {
        return program.item_hash
      } else if (program.content.extra_fields.program_name.length === 0) {
        return program.item_hash
      }
      return program.content.extra_fields.program_name
    }
  }
}
</script>
