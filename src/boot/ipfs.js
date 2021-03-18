import IPFS from 'ipfs'
import Vue from 'vue'

const plugin = {
  install (Vue, opts = {}) {
    Vue.prototype.$ipfs = IPFS.create(opts)
  }
}

Vue.use(plugin)
