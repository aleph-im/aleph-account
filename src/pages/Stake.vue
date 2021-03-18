<template>
  <q-page class="q-pa-md">
    <q-inner-loading :showing="loading === true">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <q-dialog v-model="createNode">
      <create-node @done="creation_done" />
    </q-dialog>
    <q-dialog v-model="showNode">
      <node-info :node="displayed_node"
      @close="showNode=false"
      @done="edit_done" />
    </q-dialog>
    <div class="row q-gutter-md">
      <q-card flat class="bg-card">
        <q-card-section>
          <div class="text-bold">Nodes</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <vc-donut :sections="nodes_sections"
          :background="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :foreground="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :size="70" unit="px" :thickness="30"
          :total="nodes.length" has-legend legend-placement="right"></vc-donut>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-card">
        <q-card-section>
          <div class="text-bold">Staked</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <vc-donut :sections="staking_sections"
          :background="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :foreground="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :size="70" unit="px" :thickness="30"
          :total="staking_sections.reduce((prev, cur) => prev + cur.value, 0)+1"
          has-legend legend-placement="right"></vc-donut>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-card">
        <q-card-section>
          <div class="text-bold">Staking reward calculator</div>
        </q-card-section>

        <q-card-section class="q-pt-none row q-gutter-md">
          <div class="q-pt-none">
            <q-input v-model="calculator_staked" label="Amount staked"
            standout />
          </div>

          <div>
            <div class="row justify-between q-mb-sm q-gutter-lg">
              <span>
                Reward per day
              </span>
              <span style="text-transform: capitalize;">
                {{(total_per_aleph_per_day * calculator_staked).toFixed(2)}} ALEPH
              </span>
            </div>
            <div class="row justify-between q-mb-sm q-gutter-md">
              <span>
                Current APY
              </span>
              <span style="text-transform: capitalize;">
                {{((((1+total_per_aleph_per_day)**365)-1)*100).toFixed(2)}}%
              </span>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-card col" style="min-width: 25%">
        <q-card-section>
          <div class="text-bold">Node reward</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          With {{active_nodes}} active nodes, a node receives approximately <strong>{{(15000/active_nodes).toFixed(2)}} ALEPH</strong> per day
          and <strong>{{(15000/active_nodes*30).toFixed(2)}} ALEPH</strong> per month on average.
        </q-card-section>
      </q-card>
    </div>
    <nodes-table
      v-if="my_nodes.length"
      title="My Nodes"
      :values="my_nodes"
      :loading="loading"
      :user_node="user_node"
      :user_stakes="user_stakes"
      @node-action="node_emit_action"
      @create-node="createNode = true"
      @node-info="(node) => {showNode=true; displayed_node=node}"
      class="q-mb-xl">
    </nodes-table>
    <nodes-table
      title="All Nodes"
      :values="values"
      :loading="loading"
      :user_node="user_node"
      :user_stakes="user_stakes"
      :show-header="true"
      @node-action="node_emit_action"
      @create-node="createNode = true"
      @node-info="(node) => {showNode=true; displayed_node=node}">
    </nodes-table>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import CreateNode from '../components/CreateNode'
import NodesTable from '../components/NodesTable'
import NodeInfo from '../components/NodeInfo'
import { posts } from 'aleph-js'
import store from '../store'

// function sleep (ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }
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
}

export default {
  name: 'StakePage',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    node_post_type: 'node_post_type',
    ws_api_server: 'ws_api_server',
    monitor_address: 'monitor_address',
    values (state) {
      return state.nodes.filter((node) => {
        return (node !== this.user_node) && (this.user_stakes.indexOf(node) < 0)
      }).sort((a, b) => (a.total_staked > b.total_staked) ? 1 : -1)
    },
    user_node (state) {
      if (state.account) {
        for (let node of state.nodes) {
          if (state.account.address === node.owner) {
            return node
          }
        }
      }
      return null
    },
    user_stakes (state) {
      let nodes = []
      if (state.account) {
        for (let node of state.nodes) {
          if (Object.keys(node.stakers).includes(state.account.address)) {
            nodes.push(node)
          }
        }
      }
      return nodes
    },
    my_nodes (state) {
      let nodes = []
      if (state.account) {
        if (this.user_stakes.length) {
          nodes = nodes.concat(this.user_stakes)
        } else if (this.user_node) {
          nodes.push(this.user_node)
        }
      }
      console.log(nodes)
      return nodes
    },
    active_nodes: (state) => state.nodes.filter((node) => node.status === 'active').length,
    nodes_sections (state) {
      const total_nodes = state.nodes.length
      return [
        {
          label: `${total_nodes} nodes`,
          value: total_nodes - this.active_nodes,
          color: '#71C9FA'
        },
        {
          label: `${this.active_nodes} active`,
          value: this.active_nodes,
          color: '#0054FF'
        }
      ]
    },
    total_staked: (state) => state.nodes.reduce(
      (prev, cur) => prev + cur.total_staked, 0
    ),
    total_staked_in_active: (state) => state.nodes.reduce(
      (prev, cur) => prev + (cur.status === 'active' ? cur.total_staked : 0), 0
    ),
    staking_sections (state) {
      const total_by_operators = state.nodes.length * 200000
      return [
        {
          label: `${(this.total_staked / 10 ** 6).toFixed(2)}M by stakers`,
          value: this.total_staked,
          color: '#71C9FA'
        },
        {
          label: `${(total_by_operators / 10 ** 6).toFixed(2)}M by node operators`,
          value: total_by_operators,
          color: '#0054FF'
        }
      ]
    },
    total_per_day (state) {
      return 15000 * ((Math.log10(this.active_nodes) + 1) / 3)
    },
    total_per_aleph_per_day (state) {
      return this.total_per_day / this.total_staked_in_active
    }
  }),
  components: {
    CreateNode,
    NodesTable,
    NodeInfo
  },
  data () {
    return {
      createNode: false,
      showNode: false,
      loading: null,
      displayed_node: null,
      calculator_staked: 10000
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
    async prepare_nodes_feed () {
      this.statusSocket = new WebSocket(
        `${this.ws_api_server}/api/ws0/messages?msgType=AGGREGATE&addresses=` +
        `${this.monitor_address}`
      )

      this.statusSocket.onmessage = function (event) {
        const data = JSON.parse(event.data)
        if ((data.content.key === 'corechannel') && (data.content.content.nodes !== undefined)) {
          this.$store.commit('set_nodes', data.content.content.nodes)
        }
      }.bind(this)

      this.statusSocket.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason)
        setTimeout(function () {
          this.prepare_nodes_feed()
        }.bind(this), 1000)
      }.bind(this)

      this.statusSocket.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket')
        this.statusSocket.close()
      }.bind(this)
    },
    async creation_done () {
      this.createNode = false
      this.loading = true
      this.loading = null
    },
    async edit_done () {
      this.showNode = false
      this.loading = true
      this.loading = null
    },
    async update () {
      await this.$store.dispatch('update_nodes')
    },
    async node_emit_action (action, node_hash) {
      this.loading = node_hash
      try {
        await node_action(action, node_hash)
      } finally {
        this.loading = null
      }
    },
    async update_calculator () {
      if (this.account && this.balance_info && this.balance_info.ALEPH) {
        this.calculator_staked = this.balance_info.ALEPH.toFixed(0)
      } else {
        this.calculator_staked = 10000
      }
    }
  },
  async mounted () {
    await this.update()
    await this.prepare_nodes_feed()
  },
  async unmounted () {
    this.statusSocket.close()
  },
  watch: {
    account (account) {
      this.update_calculator()
    },
    balance_info (account) {
      this.update_calculator()
    }
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

.cdc-legend-item {
  font-size: 12px;
  line-height: 14px;
  .cdc-legend-item-color {
    height: 8px;
    width: 8px;
    border-radius: 4px;
  }
}
</style>
