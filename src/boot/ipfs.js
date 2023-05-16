import * as IPFS from 'ipfs'
import Vue from 'vue'

const plugin = {

  async install (Vue, opts = {}) {
    const IPFS_instance = await IPFS.create(opts)
    Vue.prototype.$ipfs = IPFS_instance
  }
}

Vue.use(plugin)
