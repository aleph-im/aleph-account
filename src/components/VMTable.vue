<template>
  <div>
    <div v-if="!loading">
      <q-expansion-item
        v-for="item of data"
        class="overflow-hidden rounded-borders q-mb-md"
        :key="item?.item_hash"
        :label="getProgramLabel(item)"
        icon="computer"
        expand-icon-class="text-white"
        :header-class="'bg-expand text-white ' + ($q.dark.isActive?'bg-dark-40':'bg-aleph-radial')"
        flat
      >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="computer" />
        </q-item-section>
        <q-item-section>
          <span class="lt-md">{{getProgramLabel(item, true)}}</span>
          <span class="gt-sm">{{getProgramLabel(item)}}</span>
        </q-item-section>
      </template>
        <q-card  class="bg-card-expand rounded-borders" :bordered="!$q.dark.isActive">
          <q-card-section horizontal>
            <q-list class="col q-my-sm">
              <q-item v-show="item.content && !('extra_fields' in item?.content) && item.content?.metadata?.name">
                <q-item-section>
                  <q-item-label caption>Name</q-item-label>
                  <q-item-label>
                    {{item?.content?.metadata?.name}}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Item Hash</q-item-label>
                  <q-item-label>
                    {{ellipseAddress(item.item_hash)}}
                    <q-btn @click="copyToClipboard(item.item_hash)" flat round icon="content_copy" size="sm"/>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Direct link</q-item-label>
                  <q-item-label color="white">
                    <a :href="`https://aleph.sh/vm/${item.item_hash}`" target="_blank" style="color:white;">https://aleph.sh/vm/{{item.item_hash}}</a>
                    <q-btn @click="copyToClipboard(`https://aleph.sh/vm/${item.item_hash}`)" flat round icon="content_copy" size="sm"/>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Size</q-item-label>
                  <q-item-label class="text-body2 overflow-hidden">
                    {{item?.storeObj ? item?.storeObj.size : 'Null' }} B
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
                <q-btn flat icon="upload_file" align="left" label="Download Program File"
                      @click="downloadFile(item?.storeObj.item_hash)" />
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

import { convertTimestamp, ellipseAddress } from '../helpers/utilities'
import { copyToClipboard } from 'quasar'

export default {
  props: [
    'account',
    'data',
    'loading'
  ],
  data () {
    return {
      convertTimestamp: convertTimestamp,
      ellipseAddress: ellipseAddress,
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

    downloadFile (item_hash) {
      const urlToSend = `https://api2.aleph.im/api/v0/storage/raw/${item_hash}`
      var req = new XMLHttpRequest()
      req.open('GET', urlToSend, true)
      req.responseType = 'blob'
      req.onload = function (event) {
        var blob = req.response
        var fileName = `${item_hash}.zip` // if you have the fileName header available
        var link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
      }
      req.send()
    },

    getProgramLabel (program, ellipse = false) {
      if (!program.content) return program.item_hash
      if (!('extra_fields' in program.content)) {
        if (program?.content?.metadata?.name) {
          return `${program.content?.metadata?.name} (${ellipseAddress(program.item_hash)})`
        } else {
          if (ellipse) {
            return ellipseAddress(program.item_hash)
          }
          return program.item_hash
        }
      }
      return program.content.extra_fields.program_name
    }
  }
}
</script>
