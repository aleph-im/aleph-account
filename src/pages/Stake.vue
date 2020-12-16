<template>
  <q-page class="q-pa-md">
    <q-inner-loading :showing="loading === true">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <q-dialog v-model="createNode">
      <CreateNode @done="creation_done" />
    </q-dialog>
    <nodes-table
      v-if="my_nodes.length"
      title="My Staking"
      :values="my_nodes"
      :loading="loading"
      :user_node="user_node"
      :user_stake="user_stake"
      @node-action="node_emit_action"
      @create-node="createNode = true"
      class="q-mb-xl">
    </nodes-table>
    <nodes-table
      title="Nodes"
      :values="values"
      :loading="loading"
      :user_node="user_node"
      :user_stake="user_stake"
      :show-header="true"
      :show-footer="true"
      @node-action="node_emit_action"
      @create-node="createNode = true">
    </nodes-table>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import CreateNode from '../components/CreateNode'
import NodesTable from '../components/NodesTable'
import { posts } from 'aleph-js'
import store from '../store'

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
async function node_action (action, ref) {
  await posts.submit(store.state.account.address, store.state.node_post_type,
    {
      tags: [action, ...store.state.tags],
      action: action
    },
    {
      api_server: store.state.api_server,
      account: store.state.account,
      channel: store.state.channel,
      ref: ref
    })
  await sleep(3000)
}

export default {
  name: 'StakePage',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    node_post_type: 'node_post_type',
    values (state) {
      return state.nodes.filter((node) => {
        return (node !== this.user_node) && (node !== this.user_stake)
      })
    },
    user_node (state) {
      if (state.account) {
        for (let node of state.nodes) {
          if (state.account.address === node.owner) {
            console.log(node)
            return node
          }
        }
      }
      return null
    },
    user_stake (state) {
      if (state.account) {
        for (let node of state.nodes) {
          if (Object.keys(node.stakers).includes(state.account.address)) {
            return node
          }
        }
      }
      return null
    },
    my_nodes (state) {
      let nodes = []
      if (state.account) {
        if (this.user_stake) {
          nodes.push(this.user_stake)
        } else if (this.user_node) {
          nodes.push(this.user_node)
        }
      }
      return nodes
    }
  }),
  components: {
    CreateNode,
    NodesTable
  },
  data () {
    return {
      createNode: false,
      loading: null
      // values: [
      //   {
      //     id: 'node-id-123456',
      //     name: '<Name>',
      //     staked: 321000,
      //     status: 'waiting',
      //     uptime: 0,
      //     creationDate: new Date(2020, 11, 18, 11, 18, 31, 255),
      //     starred: false
      //   },
      //   {
      //     id: 'node-id-123457',
      //     name: '<Name>',
      //     staked: 589253,
      //     status: 'active',
      //     uptime: 100,
      //     creationDate: new Date(2020, 11, 17, 10, 14, 28, 255),
      //     starred: false
      //   }
      // ]
    }
  },
  methods: {
    async creation_done () {
      this.createNode = false
      this.loading = true
      await sleep(3000)
      await this.update()
      this.loading = null
    },
    async update () {
      await this.$store.dispatch('update_nodes')
    },
    async node_emit_action (action, node_hash) {
      this.loading = node_hash
      try {
        await node_action(action, node_hash)
        await this.update()
      } finally {
        this.loading = null
      }
    }
  },
  async created () {
    await this.update()
  }
}
</script>

<style lang="scss">
.posbadge {
  position: absolute;
  z-index: 10;
  margin-top: -17px;

  .q-badge {
    display: block;
    width: 28px;
    text-align: center;
    z-index: 10;
    border-radius: 2px;
    line-height: 10px;
    font-size: 9px;
    padding: 2px;
  }
}
</style>
