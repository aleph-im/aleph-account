<template>
  <q-stepper
        v-model="step"
        header-nav
        ref="stepper"
        color="primary"
        class="shadow-2 infocard"
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
        <q-btn @click="fetch_info" color="primary" label="Fetch Details" />
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
            <q-item v-if="nft_data.image"  class="standout">
              <q-item-section>
                <q-item-label caption>Image</q-item-label>
                <img :src="nft_data.image.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" />
              </q-item-section>
            </q-item>
            <q-item v-else-if="nft_data.animation_url"  class="standout">
              <q-item-section>
                <q-item-label caption>Animation</q-item-label>
                <video :src="nft_data.animation_url.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" />
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
        <q-btn @click="prepare_storage" color="primary" label="Continue" />
        <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>

    <q-step
      :name="3"
      title="Create Snapshot"
      icon="create_new_folder"
      :header-nav="step > 3"
    >
      Try out different ad text to see what brings in the most customers, and learn how to
      enhance your ads using features like ad extensions. If you run into any problems with
      your ads, find out how to tell if they're running and how to resolve approval issues.

      <q-stepper-navigation>
        <q-btn color="primary" @click="done3 = true" label="Finish" />
        <q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script>
import { mapState } from 'vuex'
// import { aggregates } from 'aleph-js'
import { get_erc721_tokenURI } from '../services/erc721'
import { ipfsContentPath } from '../services/ipfs'
const axios = require('axios')

async function get_uri_info (ipfs, uri) {
  let nft_uri_path = ipfsContentPath(uri)
  if (nft_uri_path !== null) {
    let stats = null
    try {
      stats = await ipfs.files.stat('/ipfs/' + nft_uri_path.split('/')[2], {
        size: true,
        timeout: 2000
      })
    } catch {

    }
    console.log(stats)
    let httpres = await axios.get(uri.replace('ipfs://', 'https://ipfs.io/'), {
      responseType: 'arraybuffer'
    })
    let content = httpres.data
    return {
      type: 'ipfs',
      path: nft_uri_path,
      original_uri: uri,
      stats: stats,
      content: content
    }
  } else {
    let content = null
    try {
      let httpres = await axios.get(uri, {
        responseType: 'arraybuffer'
      })
      console.log(httpres)
      content = httpres.data
    } catch {
      let httpres = await axios.get(uri)
      console.log(httpres)
      content = JSON.stringify(httpres.data)
    }
    return {
      type: 'http',
      original_uri: uri,
      stats: {
        size: content.length
      },
      content: content
    }
    // let ipfsres = await ipfs.add({
    //   content: httpres.data
    // })
    // ipfsres.cid.string
  }
}

export default {
  name: 'nft-snapshot',
  computed: {
    ...mapState([
      'account',
      'channel',
      'api_server',
      'tags',
      'node_post_type',
      'ethereum_provider'
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
      connected: false,
      media_fields: ['image', 'thumbnail', 'animation_url']
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
      this.content_loading = true
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
        this.nft_uri = token_uri[0]
        let request_uri = token_uri[0]
        request_uri = request_uri.replace('ipfs://', 'https://ipfs.io/')
        let result = await this.$axios.get(request_uri)
        this.nft_data = result.data
        this.tab = 'contract'
        this.step = 2
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'Something went wrong while fetching data.'
        })
      }
      this.content_loading = false
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
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'URL not supported, try entering contract data directly.'
        })
      }
    },
    async prepare_storage () {
      let ipfs = await this.$ipfs
      console.log(ipfs)
      let to_store = []

      // Try to get an IPFS path for the token uri
      to_store.push(await get_uri_info(ipfs, this.nft_uri))

      for (let field of this.media_fields) {
        if (this.nft_data[field] !== undefined) {
          to_store.push(await get_uri_info(ipfs, this.nft_data[field]))
        }
      }
      console.log(to_store)
    }
  },
  watch: {
  },
  created () {
  }
}
</script>

<style lang="scss">
.infocard {
  width: 900px !important;
  max-width: 80vw !important;
  // &>.row {
  //   >:first-child {
  //     border-right: 1px solid rgba(0,0,0,.1);
  //   }
  // }
}

.body--dark {
  .infocard {
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
