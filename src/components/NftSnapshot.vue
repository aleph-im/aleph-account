<template>
  <q-stepper
        v-model="step"
        header-nav
        ref="stepper"
        color="primary"
        class="shadow-2 nftcard"
        animated
      >
    <q-step
      :name="1"
      title="NFT Details"
      icon="settings"
      :done="step > 1"
      :header-nav="step > 1"
    >
      Let's try to fetch your NFT data.<br />
      Please either copy a marketplace URL, or directly the contract address and token ID.
      <div class="row q-gutter-md q-mt-md">
        <div :class="'col' + (tab!=='url' ? ' disabled': '')">
          <q-radio v-model="tab" val="url" label="From an URL" />
            <q-input v-model="source_url" label="NFT marketplace on"
             @click="tab='url'"
            stack-label standout class="q-my-sm" />
        </div>
        <div :class="'col' + (tab!=='contract' ? ' disabled': '')">
          <q-radio v-model="tab" val="contract" label="From contract info" />
            <q-input v-model="nft_contract" label="Contract Address"
            @click="tab='contract'"
            stack-label standout
            class="q-my-sm" />
            <q-input v-model="nft_index" label="Token ID"
            @click="tab='contract'"
            stack-label standout
            class="q-my-sm" />
        </div>
      </div>

      <q-stepper-navigation>
        <q-btn @click="fetch_info" color="primary" label="Fetch Details"
               :disable="fetching" :loading="fetching" />
      </q-stepper-navigation>
    </q-step>
    <q-step
      :name="2"
      title="Review NFT"
      icon="create_new_folder"
      :done="step > 2"
      :header-nav="step > 2"
    >
      <div class="row q-gutter-md" v-if="nft_data">
        <div class="col-4">
          <q-list>
            <q-item v-if="nft_data.animation_url"  class="standout">
              <q-item-section>
                <q-item-label caption>Animation</q-item-label>
                <video :src="nft_data.animation_url.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" controls autoplay loop />
              </q-item-section>
            </q-item>
            <q-item v-else-if="nft_data.image"  class="standout">
              <q-item-section>
                <q-item-label caption>Image</q-item-label>
                <img :src="nft_data.image.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-7">
          <q-list>
            <q-item class="standout" v-if="nft_data.name">
              <q-item-section>
                <q-item-label caption>name</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{nft_data.name}}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="nft_data.description"  class="standout">
              <q-item-section>
                <q-item-label caption>Description</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{nft_data.description}}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="nft_data.tags"  class="standout">
              <q-item-section>
                <q-item-label caption>Tags</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  <q-badge v-for="tag of nft_data.tags" :key="tag" color="aleph-radial" class="q-ml-sm q-mt-sm">
                    {{tag}}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="standout" v-if="nft_data.external_url && (!nft_data.external_url.includes('javascript'))">
              <q-item-section>
                <q-item-label caption>External URL</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  <a :href="nft_data.external_url" class="text-white">{{nft_data.external_url}}</a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="standout" v-if="nft_data.attributes && nft_data.attributes.length">
              <q-item-section>
                <q-item-label caption>Attributes</q-item-label>
                <q-table :data="nft_data.attributes" class="full-width">
                </q-table>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <q-stepper-navigation>
        <q-btn @click="prepare_storage" color="primary" label="Continue"
        :disable="preparing" :loading="preparing" />
        <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>

    <q-step
      :name="3"
      title="Create Snapshot"
      icon="create_new_folder"
      :header-nav="step > 3"
    >
      To snapshot your NFT we will store these items (total size {{humanStorageSize(to_store_size)}}):
      <q-table :data="to_store" class="full-width">
      </q-table>
      <q-list>

      </q-list>

      <q-stepper-navigation>
        <q-btn color="primary" @click="do_storage" label="Finish"
        :disable="storing" :loading="storing" />
        <q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script>
import { mapState } from 'vuex'
import { store, posts } from 'aleph-js'
import { get_erc721_tokenURI } from '../services/erc721'
import { ipfsContentPath } from '../services/ipfs'
import { format } from 'quasar'
const { humanStorageSize } = format
const axios = require('axios')

async function get_uri_info (field, ipfs, uri) {
  let nft_uri_path = ipfsContentPath(uri)
  if (nft_uri_path !== null) {
    let stats = null
    let cid = null
    try {
      cid = nft_uri_path.split('/')[2]
      stats = await ipfs.files.stat('/ipfs/' + nft_uri_path.split('/')[2], {
        size: true,
        timeout: 10000
      })
    } catch {

    }
    let content = null
    try {
      let httpres = await axios.get(uri.replace('ipfs://', 'https://ipfs.io/'), {
        responseType: 'arraybuffer'
      })
      content = httpres.data
    } catch {
      content = await ipfs.files.cat(nft_uri_path)
    }
    return {
      field: field,
      type: 'ipfs',
      path: nft_uri_path,
      original_uri: uri,
      cid: cid,
      size: ((stats !== null) && stats.cumulativeSize) ? stats.cumulativeSize : content.byteLength,
      stats: (stats !== null) ? stats : { size: content.byteLength },
      content: content
    }
  } else {
    let content = null
    try {
      let httpres = null
      try {
        httpres = await axios.get(uri, {
          responseType: 'arraybuffer'
        })
      } catch {
        httpres = await this.$axios.get('https://pp.aleph.im/' + uri, {
          responseType: 'arraybuffer'
        })
      }
      console.log(httpres)
      content = httpres.data
    } catch {
      let httpres = null
      try {
        httpres = await axios.get(uri)
      } catch {
        httpres = await axios.get('https://pp.aleph.im/' + uri)
      }
      console.log(httpres)
      content = JSON.stringify(httpres.data)
    }
    return {
      field: field,
      type: 'http',
      original_uri: uri,
      size: content.byteLength !== undefined ? content.byteLength : content.length,
      stats: {
        size: content.byteLength !== undefined ? content.byteLength : content.length
      },
      content: content
    }
  }
}

export default {
  name: 'nft-snapshot',
  computed: {
    allowance () {
      if (this.account) {
        if (this.balance_info.ALEPH !== undefined) {
          return this.balance_info.ALEPH * this.mb_per_aleph
        }
      }
      return 0
    },
    total_used () {
      let value = 0
      for (let item of this.stored) {
        value = value + item.content.size
      }
      return value / (1024 ** 2)
    },
    to_store_size () {
      let size = 0
      let current_cids = []
      if (this.to_store) {
        for (let item of this.to_store) {
          if (item.cid) {
            if (current_cids.includes(item.cid)) {
              continue
            } else {
              current_cids.push(item.cid)
            }
          }
          size = size + item.size
        }
      }
      return size
    },
    ...mapState([
      'account',
      'channel',
      'api_server',
      'tags',
      'node_post_type',
      'ethereum_provider',
      'balance_info',
      'stored'
    ])
  },
  props: [
    'node'
  ],
  data () {
    return {
      step: 1,
      tab: 'url',
      source_url: '',
      nft_contract: '',
      nft_index: '',
      nft_uri: null,
      nft_data: null,
      content_loading: false,
      fetching: false,
      preparing: false,
      storing: false,
      connected: false,
      to_store: null,
      media_fields: ['image', 'thumbnail', 'animation_url', 'pdf', 'cover'],
      humanStorageSize: humanStorageSize
    }
  },
  methods: {
    async fetch_info () {
      if (this.tab === 'url') {
        await this.parse_url()
      } else if (this.tab === 'contract') {
        await this.fetch_token()
      }
    },
    async fetch_token () {
      this.fetching = true
      try {
        let token_uri = null
        try {
          token_uri = await get_erc721_tokenURI(
            this.ethereum_provider, this.nft_contract, this.nft_index
          )
        } catch {
          this.$q.notify({
            type: 'negative',
            message: 'Can\'t fetch ERC721 token info'
          })
        }
        console.log(token_uri)
        if (token_uri === null) {
          this.$q.notify({
            type: 'negative',
            message: 'This NFT token doesn\'t support standard metadata! ' +
                     'If it\'s a lazy minted NFT you need to transfer it first.'
          })
          return
        }
        this.nft_uri = token_uri[0]
        let request_uri = token_uri[0]
        request_uri = request_uri.replace('ipfs://', 'https://ipfs.io/')
        console.log(request_uri)
        let result = null
        try {
          result = await this.$axios.get(request_uri)
        } catch (e) {
          result = await this.$axios.get('https://pp.aleph.im/' + request_uri)
        }
        this.nft_data = result.data
        this.tab = 'contract'
        this.step = 2
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Something went wrong while fetching data.'
        })
      } finally {
        this.fetching = false
      }
    },
    async parse_url () {
      const url = this.source_url
      if (url.includes('rarible.com/token/')) {
        let parts = url.split('rarible.com/token/')[1].split(':')
        this.nft_contract = parts[0]
        this.nft_index = parts[1]
        await this.fetch_token()
      } else if (url.includes('opensea.io/assets/')) {
        let parts = url.split('opensea.io/assets/')[1].split('/')
        this.nft_contract = parts[0]
        this.nft_index = parts[1]
        await this.fetch_token()
      } else if (url.includes('superrare.co/')) {
        this.nft_contract = '0xb932a70A57673d89f4acfFBE830E8ed7f75Fb9e0'
        this.nft_index = url.split('superrare.co/')[1].split('-').pop()
        await this.fetch_token()
      } else if (url.includes('market.decentraland.org/contracts/')) {
        let parts = url.split('market.decentraland.org/contracts/')[1]
        parts = parts.split('/tokens/')
        this.nft_contract = parts[0]
        this.nft_index = parts[1]
        await this.fetch_token()
      } else if (url.includes('niftygateway.com/itemdetail/')) {
        let parts = url.split('niftygateway.com/itemdetail/')[1].split('/')
        this.nft_contract = parts[parts.length - 2]
        this.nft_index = parts[parts.length - 1]
        await this.fetch_token()
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'URL not supported, try entering contract data directly.'
        })
      }
    },
    async prepare_storage () {
      this.preparing = true
      try {
        let ipfs = await this.$ipfs
        console.log(ipfs)
        let to_store = []

        // Try to get an IPFS path for the token uri
        to_store.push(await get_uri_info('source', ipfs, this.nft_uri))

        for (let field of this.media_fields) {
          if ((this.nft_data[field] !== undefined) && (this.nft_data[field] !== null)) {
            try {
              to_store.push(await get_uri_info(field, ipfs, this.nft_data[field]))
            } catch {
              this.$q.notify({
                type: 'warning',
                message: `ERROR: Field ${field} can't be fetched`
              })
            }
          }
        }
        console.log(to_store)
        this.to_store = to_store
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'ERROR: Can\'t prepare NFT backup'
        })
      }
      this.preparing = false
      this.step = 3
    },
    async do_storage () {
      this.storing = true
      let current_cids = []
      let new_items = []
      let new_uris = {}
      if ((this.to_store_size / (1024 ** 2)) > (this.allowance - this.total_used)) {
        this.$q.notify({
          type: 'negative',
          message: 'ERROR: Not enough storage allowance, please replenish your ALEPH balance.'
        })
        return
      }
      try {
        let ipfs = await this.$ipfs
        let name_prefix = `NFT ${this.nft_contract}/${this.nft_index}`
        if (this.nft_data.name !== undefined) {
          name_prefix = `NFT ${this.nft_data.name} (#${this.nft_index})`
        }
        for (let item of this.to_store) {
          let new_item = {}
          Object.assign(new_item, item)
          let store_name = `${name_prefix} - ${new_item.field}`
          let ipfs_cid = null

          if ((new_item.type === 'ipfs') && (new_item.stats.cumulativeSize !== undefined)) {
            ipfs_cid = new_item.cid
            new_item.new_uri = `ipfs:/${new_item.path}`
          } else {
            let res = await ipfs.add({
              content: new_item.content
            })
            ipfs_cid = res.cid.string
            console.log('uploaded ', new_item.original_uri, 'as ', ipfs_cid)
            new_item.cid = res.cid.string
            new_item.path = `/ipfs/${ipfs_cid}`
            new_item.new_uri = `ipfs:/${new_item.path}`
          }

          new_uris[new_item.field] = new_item.new_uri

          // avoid double storage
          if (current_cids.includes(ipfs_cid)) {
            delete new_item.content
            continue
          } else {
            current_cids.push(ipfs_cid)
          }

          // create store item for that field
          let store_item = await store.submit(this.account.address, {
            account: this.account,
            api_server: this.api_server,
            file_hash: ipfs_cid,
            storage_engine: 'ipfs',
            channel: 'PINNING',
            extra_fields: {
              ref: `${this.nft_contract}:${this.nft_index}`,
              stored_field: item.field,
              name: store_name,
              nft: {
                contract_address: this.nft_contract,
                token_id: this.nft_index,
                metadata_url: this.nft_uri,
                source_url: this.source_url
              }
            }
          })
          new_item.store_hash = store_item.item_hash
          delete new_item.content
          new_items.push(new_item)
        }
        let tags = ['nft-snapshot', this.nft_contract, this.nft_index]

        let new_data = {}
        Object.assign(new_data, this.nft_data)

        // Assign new cleaned uris
        for (let field of Object.keys(new_uris)) {
          if (field !== 'source') {
            new_data[field] = new_uris[field]
          }
        }

        if (this.source_url) { tags.push(this.source_url) }
        await posts.submit(
          this.account.address, 'nft-snapshot',
          {
            tags: tags,
            contract: this.nft_contract,
            token_id: this.nft_index,
            metadata_original_uri: this.nft_uri,
            metadata_new_uri: new_uris.metadata,
            metadata: new_data,
            stored_items: new_items
          },
          {
            ref: `${this.nft_contract}:${this.nft_index}`,
            account: this.account,
            channel: 'PINNING',
            api_server: 'https://api2.aleph.im'
          })
        this.$emit('finished')
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: 'ERROR: Something went wrong. \n' + err.message
        })
      } finally {
        this.storing = false
      }
    }
  },
  watch: {
  },
  created () {
  }
}
</script>

<style lang="scss">
.nftcard {
  width: 900px !important;
  max-width: 80vw !important;
  // &>.row {
  //   >:first-child {
  //     border-right: 1px solid rgba(0,0,0,.1);
  //   }
  // }
}

.body--dark {
  .nftcard {
    background: #1d262e;
    border: none;
    // &>.row {
    //   >:first-child {
    //     border-right: 1px solid rgba(255,255,255,.1);
    //   }
    // }
  }

  .q-stepper {
    background: #1d262e;
    .q-stepper__tab--active, .q-stepper__tab--done {
      color: white;
    }
  }
}
</style>
