<template>
  <q-layout view="lhh LpR lff">
    <q-header :class="($q.dark.isActive?'text-white':'text-black') + ' bg-transparent q-pa-sm'">
      <q-toolbar>

        <q-btn dense flat round icon="menu" @click="left = !left" v-if="!left" />

        <q-toolbar-title class="logo flex">
            <img v-if="(!left)&&(!$q.dark.isActive)" src="~/assets/logo-blue.svg" height="32">
            <img v-if="(!left)&&$q.dark.isActive" src="~/assets/logo-white.svg" height="32">
            <span class="q-ml-sm">
                aleph.im
            </span>
        </q-toolbar-title>
        <q-space />
        <q-btn-group class="shadow-1 bg-aleph-radial">
          <q-btn v-if="!account" size="md" class="bg-aleph-radial text-white" @click="web3ConnectModal = true">Connect to a wallet</q-btn>
          <q-dialog v-model="web3ConnectModal">
            <q-card style="width: 550px">
              <q-card-section>
                <div class="text-h6">Connect to wallet</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="q-my-md">
                  <div class="text-subtitle-1">Ethereum</div>
                  <q-separator dark inset/>
                </div>
                <div class="row">
                  <div class="col">
                    <q-btn outline left @click="ethWeb3Connect('metamask')">
                      <q-avatar size="sm" square class="q-mr-sm">
                        <img :src="require('../assets/metamask.svg')">
                      </q-avatar>
                      Metamask
                    </q-btn>
                  </div>
                  <div class="col">
                    <q-btn outline left @click="ethWeb3Connect('walletconnect')">
                      <q-avatar size="sm" square class="q-mr-sm">
                        <img :src="require('../assets/walletconnect-circle-blue.svg')">
                      </q-avatar>
                      Wallet Connect
                    </q-btn>
                  </div>
                </div>
                <div class="q-my-md">
                  <div class="text-subtitle-1">Solana </div>
                  <q-separator dark inset=""/>
                </div>
                <div class="row">
                  <div class="col">
                    <q-btn outline left @click="solWeb3Connect('phantom')">
                      <q-avatar size="sm" square class="q-mr-sm">
                        <img :src="require('../assets/phantom-icon-purple.svg')">
                      </q-avatar>
                      Phantom
                    </q-btn>
                  </div>
                  <div class="col">
                    <q-btn outline left @click="solWeb3Connect('solflare')">
                      <q-avatar size="sm" square class="q-mr-sm">
                        <img :src="require('../assets/solflare.svg')">
                      </q-avatar>
                      Solflare
                    </q-btn>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions align="left">
                <q-btn flat label="Close" color="white" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-btn v-if="account" class="text-white">
            {{balance_info['ALEPH'].toFixed(2)}}
            <span v-if="owed_rewards">&nbsp;/ {{owed_rewards.toFixed(2)}}</span> <img src="~/assets/logo-white.svg" style="height: 1.4em; margin: 0 0 .2em .4em;"/>
            <q-tooltip v-if="owed_rewards">
              <strong>Amount staked / pending rewards</strong><br />
              Rewards are sent every few days when gas is low.
            </q-tooltip>
          </q-btn>
          <q-btn v-if="account" color="white" text-color="black" class="rounded-forced">{{ellipseAddress(account.address)}}</q-btn>
          <q-btn v-if="account" class="" round icon="logout" size="sm" @click="web3Logout()"></q-btn>
        </q-btn-group>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="left" side="left" content-class="column justify-between q-pa-md" :width="250">
      <!-- drawer content -->
      <div>
        <p class="q-px-md q-pb-md">
          <img v-if="!$q.dark.isActive" src="~/assets/logo-blue.svg" height="32">
          <img v-else src="~/assets/logo-white.svg" height="32">

        </p>
        <q-list padding class="menu">
          <template v-for="item of links">
            <q-item-label header v-if="item.title" :key="item.title">{{item.title}}</q-item-label>
            <q-item v-for="link of item.items"
                    :key="link.text"
                    clickable v-ripple
                    :to="link.link" :exact="link.exact">
              <q-item-section avatar v-if="link.icon">
                <q-icon :name="link.icon" />
              </q-item-section>

              <q-item-section>
                {{link.text}}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
      <div>
        <q-list>
          <q-item tag="label" v-ripple class="opacity">
            <q-item-section>
              <q-item-label>Dark mode</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-toggle :value="$q.dark.isActive" @input="$q.dark.set(!$q.dark.isActive)" />
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item class="q-mt-sm">
            <q-item-section>
              <q-item-label caption>{{(total_used/1024).toFixed(3)}} GB of {{(allowance/1024).toFixed(3)}} GB</q-item-label>
              <q-linear-progress :value="total_used / allowance" class="q-my-sm" rounded />
            </q-item-section>
          </q-item>

        </q-list>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer :class="($q.dark.isActive?'text-white':'text-black') + ' bg-transparent q-pa-sm q-pt-lg row justify-between'"
              style="font-size: 0.9em; margin-bottom: 10px; opacity: 0.3;">
      <p>
        Copyright ©2020-present <a href="https://aleph.im/" :class="($q.dark.isActive?'text-white':'text-black')">aleph.im project</a>, all rights reserved.
      </p>
      <p v-if="app_version">
        <span caption v-if="last_release_is_a_tag()">
          <a style="color:inherit" :href="('https://github.com/aleph-im/aleph-account/tree/' + app_version)">
            v{{ app_version }}
          </a>
        </span>
        <span caption v-else>
          v{{ app_version }}
        </span>
        &nbsp;
      </p>
    </q-footer>

  </q-layout>
</template>
<script>
import { ellipseAddress } from '../helpers/utilities'
import { ethers, providers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'

import { mapState } from 'vuex'
import {
  ethereum, solana, posts
} from 'aleph-js'

export default {
  name: 'MainLayout',

  components: {
  },
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    infura_key: state => state.infura_key,
    mb_per_aleph: state => state.mb_per_aleph,
    sender_address: state => state.sender_address,
    monitor_address: state => state.monitor_address,
    ws_api_server: 'ws_api_server',

    allowance: function () {
      if ((this.balance_info !== null) && (this.balance_info.ALEPH !== undefined)) {
        return this.balance_info.ALEPH * this.mb_per_aleph
      }
      return 0
    },
    owed_rewards: function () {
      if ((this.last_calculation !== null) && (this.account !== null)) {
        if (this.last_calculation.content.rewards[this.account.address]) {
          return this.last_calculation.content.rewards[this.account.address]
        }
      }
      return 0
    },
    total_used (state) {
      let value = 0
      for (let item of state.stored) {
        value = value + item.content?.size
      }
      return value / (1024 ** 2)
    }
  }),
  watch: {
    async account () {
      await this.$store.dispatch('update_balance')
    }
  },
  data () {
    return {
      app_version: GIT_DESCRIBE_TAGS,
      web3ConnectModal: false,
      ellipseAddress: ellipseAddress,
      left: false,
      search: '',
      storage: 0,
      show_backup: false,
      lbimgs: '', // Img Url , string or Array
      lbvisible: false,
      lbidx: 0, // default: 0,
      display_onboarding: false,
      provider: null,
      eth_chain_id: null,
      last_distribution: null,
      last_calculation: null,
      links: [
        {
          title: 'Earn',
          items: [
            // { text: 'Dashboard', link: { name: 'dashboard' }, exact: true },
            { text: 'Nodes and Staking', link: { name: 'stake' }, exact: true }
          ]
        },
        {
          title: 'Store',
          items: [
            { text: 'IPFS Pinning', link: { name: 'ipfs' }, exact: true },
            { text: 'NFT Storage', link: { name: 'nft-storage' }, exact: true },
            { text: 'My Programs', link: { name: 'programs' }, exact: true }
          ]
        }

        // { text: 'Swap', link: { name: 'swap' }, exact: false }
        // { icon: 'far fa-newspaper', text:'My Feed' },
        // { icon: 'photo', text: 'Photos' },
        // { icon: 'people', text: 'Contacts' }
      ],
      links2: [
        // { icon: 'archive', text: 'Archive' },
        // { icon: 'delete', text: 'Trash' }
      ],
      links3: [
        // { icon: 'settings', text: 'Settings' },
        // { icon: 'help', text: 'Help & Feedback' },
        // { icon: 'get_app', text: 'App Downloads' }
      ],
      createMenu: [
        // { icon: 'photo_album', text: 'Album' },
        // { icon: 'people', text: 'Shared Album' },
        // { icon: 'movie', text: 'Movie' },
        // { icon: 'library_books', text: 'Animation' },
        // { icon: 'dashboard', text: 'Collage' },
        // { icon: 'book', text: 'Photo book' }
      ]
    }
  },
  methods: {
    async prepare_distributions_feed () {
      const statusSocket = new WebSocket(
        `${this.ws_api_server}/api/ws0/messages?msgType=POST&contentTypes=staking-rewards-distribution&addresses=` +
        `${this.sender_address},${this.monitor_address}`
      )

      statusSocket.onmessage = function (event) {
        const data = JSON.parse(event.data)

        if (data.content === undefined || data.content.content === undefined) {
          return
        }

        if (data.content.content.status === 'distribution') {
          for (let dist of data.content.content.targets) {
            if (dist.success) {
              this.last_distribution = data.content
            }
          }
        } else if (data.content.content.status === 'calculation') {
          this.last_calculation = data.content
        }
      }.bind(this)

      statusSocket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason)
        setTimeout(function () {
          this.prepare_distributions_feed()
        }.bind(this), 1000)
      }.bind(this)

      statusSocket.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket')
        statusSocket.close()
      }
    },
    last_release_is_a_tag () {
      return /\d+-.[0-9A-F]{7}$/i.test(this.app_version)
    },
    async update_distributions () {
      let result = await posts.get_posts(
        'staking-rewards-distribution',
        {
          pagination: 10,
          api_server: this.api_server,
          tags: ['distribution'],
          addresses: [this.sender_address]
        }
      )
      let last_distribution = null
      for (let item of result.posts) {
        if ((last_distribution === null) && (item.content.status === 'distribution')) {
          for (let dist of item.content.targets) {
            if (dist.success) { last_distribution = item }
          }
        }
      }
      this.last_distribution = last_distribution
    },
    async update_eth_account (provider) {
      let account = await ethereum.from_provider(provider)
      this.$store.commit('set_account', account)
    },
    async ethWeb3Connect (wallet) {
      let provider = null
      let web3Provider = null
      this.$store.commit('set_balance_info', 0)
      if (wallet === 'walletconnect') {
        try {
          const wc = new WalletConnectProvider({
            infuraId: this.infura_key,
            qrcodeModalOptions: {
              mobileLinks: [
                'metamask',
                'trust'
              ]
            }
          })
          await wc.enable()
          provider = new providers.Web3Provider(wc)
          web3Provider = wc
          this.web3ConnectModal = false
        } catch (err) {
          this.$q.notify({
            type: 'negative',
            message: err.message
          })
        }
      } else if (wallet === 'metamask') {
        if (window.ethereum) {
          await window.ethereum.enable()

          provider = new ethers.providers.Web3Provider(window.ethereum)
          web3Provider = window.ethereum
          this.web3ConnectModal = false
        } else if (window.web3) {
          provider = new ethers.providers.Web3Provider(window.web3.currentProvider)
          web3Provider = window.web3
          this.web3ConnectModal = false
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Non-Ethereum browser detected. You should consider trying MetaMask!'
          })
          console.warn('Non-Ethereum browser detected. You should consider trying MetaMask!')
          return
        }
      }

      provider.on('network', async (newNetwork, oldNetwork) => {
        this.eth_chain_id = newNetwork.chainId
        await this.update_eth_account(web3Provider)
        await this.update_distributions()
      })

      provider.on('accountsChanged', async (account) => {
        await this.update_eth_account(web3Provider)
        await this.update_distributions()
      })
    },
    async solWeb3Connect (wallet) {
      let providerInfo = {}

      if (wallet === 'phantom') {
        providerInfo = {
          url: 'https://phantom.app/',
          provider: wallet === 'phantom' ? window.phantom?.solana : null,
          installed: window.phantom?.solana?.isPhantom
        }
      } else if (wallet === 'solflare') {
        providerInfo = {
          url: 'https://solflare.com',
          provider: wallet === 'solflare' ? window.solflare : null,
          installed: window.solflare?.isSolflare
        }
      }

      const getProvider = () => {
        if (wallet in window) {
          if (providerInfo.installed) {
            return providerInfo.provider
          }
        }
        window.open(providerInfo.url, '_blank')
      }
      const provider = getProvider() // see "Detecting the Provider"

      try {
        await provider.connect()
        let account = await solana.from_provider(provider)
        this.$store.commit('set_account', account)
        this.web3ConnectModal = false
        window.solana_account = account
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.message
        })
      }
    },
    async web3Logout () {
      const wc = new WalletConnectProvider({
        infuraId: this.infura_key
      })
      try {
        await wc.disconnect()
        this.$store.commit('set_account', null)
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.message
        })
      }
    }
  },
  created () {
    this.$store.dispatch('connect_provider')
    this.update_distributions()
    this.prepare_distributions_feed()

    if (!GIT_DESCRIBE_TAGS) {
      console.warn(`
No build version detected.
This bundle was probably not built from a git repository,
or your build process might be broken! `)
    }
  }
}
</script>

<style lang="scss">
.logo {
  .q-badge {
    position: absolute;
    margin-top: -0.2rem;
    margin-left: -1rem;
  }
}

.q-drawer {
  background: $light-grey;

  .q-separator.q-separator--horizontal {
    width: auto;
    margin: 0 16px;
  }
}

.q-list.menu {
  .q-item {
      min-height: 36px;
      padding-bottom: 0;
      padding-top: 0;
  }

  .q-item__label--header {
    font-weight: 700;
    padding-bottom: 0.5em;
    padding-top: 1.5em;
  }
}

.q-drawer--dark {
  background: #172025;

  .q-list.menu {
    .q-item {
      opacity: 0.5;
      color: #F6F8FB;

      &.q-router-link--active {
        color: #fff;
        opacity: 1.0;
      }
    }

    .q-item__label--header {
      color: #FFF;
    }
  }
}

.content {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 10px;
  word-wrap: normal;

  .title {
    font-size: 3rem;

    @media (max-width: $breakpoint-sm-max) {
      font-size: 4.4vw;
    }
  }

  .menu {
    background: #7a40f2;
    border-radius: 20px !important;
    margin: 10px;
    padding: 10px;
  }
}

#left {
  .q-drawer {
    :first-child {
      border-radius: 15px;
    }
    padding: 5px !important;

    .q-item.q-item--active {
      background: #fff;
      margin-left: 10px;
      padding-right: 10px;
      border-radius: 15px 0 0 15px;

      border-top-right-radius: 0;
      border-bottom-right-radius: 0;

      &:before, &:after{
        box-sizing: content-box;
        content: '';
        position: absolute;
        left: 100%; /* I use this instead of right: 0 to avoid 1px rounding errors */
        margin-left: -15px; /* I use this because I am using left: 100% */
        width: 15px;
        height: 15px;
        border-right: 15px solid #fff ;
        z-index: 10;
      }

      &:before {
        top: -15px;
        border-bottom: 15px solid  #fff;
        border-bottom-right-radius: 30px;
      }

      &:after {
        bottom: -15px;
        border-top: 15px solid  #fff;
        border-top-right-radius: 30px;
      }
    }
  }
}

.rounded-large {
  border-radius: 25px;
}

.rounded-forced {
  border-radius: 10px !important;
}
</style>
