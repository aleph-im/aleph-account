<template>
  <q-card class="infocard">
    <div class="row">
      <div class="col-12 col-md-5 q-pa-md">
        <div class="text-weight-bold text-h5 q-mb-md">
          NFT Info
        </div>
        <q-tabs
        v-model="tab"
        inline-label
        no-caps
        >
          <q-tab name="url" label="From URL" />
          <q-tab name="contract" label="From Contract Info" />
        </q-tabs>
        <q-tab-panels v-model="tab" class="bg-transparent">
          <q-tab-panel name="url">
            <q-input v-model="source_url" label="NFT marketplace URL"
            stack-label standout class="q-my-sm" />
            <q-btn @click="parse_url">Fetch</q-btn>
          </q-tab-panel>
          <q-tab-panel name="contract">
            <q-input v-model="nft_contract" label="Contract Address"
            stack-label standout
            class="q-my-sm" />
            <q-input v-model="nft_index" label="Token ID"
            stack-label standout
            class="q-my-sm" />
            <q-btn @click="fetch_token">Fetch</q-btn>
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <div class="col-12 col-md-7 q-pa-md">
        <div class="row justify-between">
          <div class="text-weight-bold text-h5 q-mb-md">
            {{(nft_data && nft_data.name) ? nft_data.name : "Summary"}}
          </div>
          <span>
            <q-btn color="grey" icon="close"
            size="xs" padding="xs" class="radius-4"
            @click="$emit('close')"/>
          </span>
        </div>
        <q-list v-if="nft_data">
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
          <q-item v-if="nft_data.image"  class="standout">
            <q-item-section>
              <q-item-label caption>Image</q-item-label>
              <img :src="nft_data.image.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" />
            </q-item-section>
          </q-item>
          <q-item v-if="nft_data.animation_url"  class="standout">
            <q-item-section>
              <q-item-label caption>Animation</q-item-label>
              <video :src="nft_data.animation_url.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" />
            </q-item-section>
          </q-item>
          <q-item v-if="nft_data.tags"  class="standout">
            <q-item-section>
              <q-item-label caption>Tags</q-item-label>
              <q-item-label class="text-body2 overflow-hidden">
                {{nft_data.tags}}
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
          <q-item class="standout" v-if="nft_data.attributes">
            <q-item-section>
              <q-item-label caption>Attributes</q-item-label>
              <q-table :data="nft_data.attributes" class="full-width">
              </q-table>
            </q-item-section>
          </q-item>
        </q-list>
        <q-inner-loading :showing="content_loading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </div>
    </div>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
// import { aggregates } from 'aleph-js'
import { get_erc721_tokenURI } from '../services/erc721'

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
      tab: 'url',
      source_url: '',
      nft_contract: '',
      nft_index: '',
      nft_uri: null,
      nft_data: null,
      content_loading: false,
      media_fields: ['image', 'thumbnail', 'animation_url']
    }
  },
  methods: {
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
        this.nft_uri = token_uri
        let request_uri = token_uri[0]
        request_uri = request_uri.replace('ipfs://', 'https://ipfs.io/')
        let result = await this.$axios.get(request_uri)
        this.nft_data = result.data
        this.tab = 'contract'
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
  &>.row {
    >:first-child {
      border-right: 1px solid rgba(0,0,0,.1);
    }
  }
}

.body--dark {
  .infocard {
    background: #1d262e;
    &>.row {
      >:first-child {
        border-right: 1px solid rgba(255,255,255,.1);
      }
    }
  }
}
</style>
