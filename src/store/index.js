import Vue from 'vue'
import Vuex from 'vuex'
import { LocalStorage } from 'quasar'
import { posts, aggregates, messages } from 'aleph-js'
import {
  get_nuls_balance_info, get_neo_balance_info, get_solana_balance_info
} from '../services/balances'
import { decrypt_content } from '../services/encryption.js'
import { get_erc20_balance } from '../services/erc20.js'

var providers = require('ethers').providers

// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

// export default function (/* { ssrContext } */) {
export default new Vuex.Store({
  state: {
    erc20_address: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
    splToken_address: '3UCMiSnkcnkPE1pgQ5ggPCBv6dXgVUy16TmMUe1WpG9x',
    // monitor_address: '0x86bfBC59a1d1D82D2596fdeB02538fDe0426faD2', // test
    monitor_address: '0xa1B3bb7d2332383D96b7796B908fB7f7F3c2Be10',
    sender_address: '0x3a5CC6aBd06B601f4654035d125F9DD2FC992C25',
    api_server: 'https://api2.aleph.im',
    ws_api_server: 'wss://api1.aleph.im',
    ipfs_gateway: 'https://ipfs.io/ipfs/',
    solana_rpc: 'https://api.mainnet-beta.solana.com',
    account: null,
    profiles: {},
    last_broadcast: null,
    categories: [ // categories are hard-coded for now...
    ],
    pages: {},
    store_info: {},
    menu: [],
    notes: [],
    notebooks: {},
    files: [],
    nodes: [],
    resource_nodes: [],
    stored: [],
    mb_per_aleph: 3,
    balance_info: {
      ALEPH: 0
    },
    decimals: 18,
    channel: 'FOUNDATION',
    ethereum_network: 'homestead',
    infura_key: '4890a5bd89854916b128088119d76b50',
    ethereum_provider: null,
    // tags: ['mainnet-test'], // test
    tags: ['mainnet'],
    node_post_type: 'corechan-operation'
  },
  mutations: {
    set_account (state, account) {
      if (state.account !== account) {
        state.notes = []
        state.files = []
      }
      state.account = account
    },
    set_pages (state, pages) { // TODO: handle per-page mutation
      state.pages = pages
    },
    set_store_info (state, store_info) { // TODO: handle per-page mutation
      state.store_info = store_info
    },
    set_files (state, files) { // TODO: handle per-files mutation
      state.files = files
    },
    set_notes (state, notes) {
      state.notes = notes
    },
    set_notebooks (state, notebooks) {
      state.notebooks = notebooks
    },
    set_nodes (state, nodes) {
      state.nodes = nodes
    },
    set_resource_nodes (state, nodes) {
      state.resource_nodes = nodes
    },
    set_stored (state, stored) {
      state.stored = stored
    },
    update_note (state, new_note) {
      for (const note of state.notes) {
        if (note.hash === new_note.hash) {
          Object.assign(note, new_note)
        }
      }
    },
    update_file (state, new_file) {
      for (const file of state.files) {
        if (file.hash === new_file.hash) {
          Object.assign(file, new_file)
        }
      }
    },
    update_notebook (state, payload) {
      // Object.assign(state.notebooks[payload.key], payload.notebook)
      Vue.set(state.notebooks, payload.key, payload.notebook)
    },
    add_note (state, new_note) {
      state.notes.unshift(new_note)
    },
    add_file (state, new_file) {
      state.files.unshift(new_file)
    },
    add_notebook (state, payload) {
      Vue.set(state.notebooks, payload.key, payload.notebook)
      // state.notebooks[payload.key] = payload.notebook
    },
    set_menu (state, menu_items) {
      state.menu = menu_items
    },
    store_profile (state, payload) {
      state.profiles[payload.address] = payload.profile
    },
    set_balance_info (state, balance_info) {
      state.balance_info = balance_info
    },
    set_provider (state, ethereum_provider) {
      state.ethereum_provider = ethereum_provider
    }
  },
  actions: {
    async connect_provider ({ state, commit }) {
      // Connect to INFUA
      var infuraProvider = new providers.InfuraProvider(
        state.ethereum_network,
        state.infura_key)

      // Connect to Etherscan
      var etherscanProvider = new providers.EtherscanProvider(
        state.ethereum_network)

      // Creating a provider to automatically fallback onto Etherscan
      // if INFURA is down
      var fallbackProvider = new providers.FallbackProvider([
        infuraProvider,
        etherscanProvider
      ])
      await commit('set_provider', fallbackProvider)
    },
    async store_account ({ state, commit }, account) {
      try {
        LocalStorage.set('account', account)
      } catch (e) {
        console.warn("Can't store account")
      }
      await commit('set_account', account)
    },
    async logout ({ state, commit }) {
      try {
        LocalStorage.set('account', null)
      } catch (e) {
        console.warn("Can't store account")
      }
      await commit('set_account', null)
    },
    async update_notes ({ state, commit }, progress_callback) {
      const result = await posts.get_posts('note', {
        pagination: 1000,
        addresses: [state.account.address],
        api_server: state.api_server
      })
      const post_list = []
      let i = 0
      for (const post of result.posts) {
        i += 1
        try {
          if (post.content.private) {
            await decrypt_content(post.content, ['title', 'body', 'notebook'], state.account)
            // post.content.encrypted_title = post.content.title
            // post.content.title = encryption.decrypt(state.account, post.content.title)
            // post.content.encrypted_body = post.content.body
            // post.content.body = encryption.decrypt(state.account, post.content.body)
          }
        } catch (e) {
          console.error("Can't decrypt...", e)
        }
        if (progress_callback !== undefined) {
          await progress_callback(i / result.posts.length)
        }
        post_list.push(post)
      }
      commit('set_notes', post_list)
    },
    async update_files ({ state, commit }, progress_callback) {
      const result = await posts.get_posts('file,folder', {
        pagination: 10000,
        addresses: [state.account.address],
        api_server: state.api_server
      })
      let post_list = []
      let i = 0
      for (let post of result.posts) {
        i += 1
        try {
          if ((post.content.private) || (post.type === 'folder')) {
            await decrypt_content(post.content, ['filename', 'mimetype', 'thumbnail_url'], state.account)
          }
        } catch (e) {
          console.error("Can't decrypt...", e)
        }
        if (progress_callback !== undefined) {
          await progress_callback(i / result.posts.length)
        }
        post_list.push(post)
      }
      commit('set_files', post_list)
    },
    async update_balance ({ state, commit }) {
      if (state.account !== null) {
        if (state.account.type === 'NULS2') {
          commit('set_balance_info', await get_nuls_balance_info(
            state.account.address, 'https://nuls.world'
          ))
        } else if (state.account.type === 'ETH') {
          let val = await get_erc20_balance(
            state.ethereum_provider,
            state.erc20_address,
            state.account.address
          )
          val = val / (10 ** state.decimals)
          commit('set_balance_info', {
            ALEPH: val
          })
        } else if (state.account.type === 'NEO') {
          commit('set_balance_info', await get_neo_balance_info(
            state.account.address, 'https://api.neoscan.io'
          ))
        } else if (state.account.type === 'SOL') {
          let val = await get_solana_balance_info(state.account.address,
            state.solana_rpc,
            state.splToken_address
          )
          commit('set_balance_info', {
            ALEPH: parseFloat(val.ALEPH)
          })
        }
      }
    },
    async update_notebooks ({ state, commit }, progress_callback) {
      let notebooks = await aggregates.fetch_one(
        state.account.address,
        'notebooks', {
          api_server: state.api_server
        })
      if (notebooks !== null) {
        let i = 0
        let key_len = Object.keys(notebooks).length
        for (let [key, item] of Object.entries(notebooks)) { // eslint-disable-line no-unused-vars
          i += 1
          try {
            if (item.private) {
              await decrypt_content(item, ['name', 'description'], state.account)
            }
          } catch (e) {
            console.error("Can't decrypt...", e)
          }
          if (progress_callback !== undefined) {
            await progress_callback(i / key_len)
          }
        }
      } else {
        notebooks = {}
      }
      commit('set_notebooks', notebooks)
    },
    async update_store_info ({ state, commit }) {
      let metadata = await aggregates.fetch_one(
        state.account.address,
        'stores', {
          api_server: state.api_server
        })
      if (metadata === null) { metadata = {} }
      commit('set_store_info', metadata)
    },
    async update_nodes ({ state, commit }) {
      let corechannel = await aggregates.fetch_one(
        state.monitor_address,
        'corechannel', {
          api_server: state.api_server,
          limit: 50
        })

      let nodes = []
      if (corechannel.nodes !== undefined) { nodes = corechannel.nodes }
      let resource_nodes = []
      if (corechannel.resource_nodes !== undefined) { resource_nodes = corechannel.resource_nodes }
      commit('set_nodes', nodes)
      commit('set_resource_nodes', resource_nodes)
    },
    async update_stored ({ state, commit }) {
      if (state.account !== null) {
        let items = await messages.get_messages(
          {
            message_type: 'STORE',
            addresses: [state.account.address],
            pagination: 1000,
            api_server: state.api_server,
            channel: 'PINNING'
          })

        if (items.messages) { commit('set_stored', items.messages) }
      }
    }
    // async update_pages({ state, commit }) {
    //   let pages = await fetch_one(
    //     state.site_address, 'pages', {
    //     'api_server': state.api_server
    //   })
    //   if (pages === null)
    //     pages = {}

    //   await commit('set_pages', pages)
    // },
    // async update_menu({ state, commit }) {
    //   let menu_obj = await fetch_one(
    //     state.site_address, 'menu', {
    //     'api_server': state.api_server
    //   })
    //   let items = []
    //   if ((menu_obj !== null) && menu_obj.items)
    //     items = menu_obj.items

    //   await commit('set_menu', items)
    // }
  },

  modules: {
    // example
  },

  // enable strict mode (adds overhead!)
  // for dev mode only
  // strict: process.env.DEBUGGING
  strict: false
})

// return Store
// }
