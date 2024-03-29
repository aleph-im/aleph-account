<template>
  <q-page class="q-pa-md">
    <q-inner-loading :showing="loading === true">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <q-dialog v-model="createNode">
      <create-node @done="creation_done('core')"  @close="createNode=false" />
    </q-dialog>
    <q-dialog v-model="createComputeNode">
      <create-compute-node @done="creation_done('compute')" @close="createComputeNode=false"/>
    </q-dialog>
    <q-dialog v-model="showNode">
      <node-info :node="displayed_node"
      :node-type="displayed_node_type"
      @close="showNode=false"
      @done="edit_done" />
    </q-dialog>
    <div class="row q-gutter-md">
      <q-card flat class="bg-card" block>
        <q-card-section>
          <div class="text-bold">Core Channel Nodes</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <vc-donut v-if="nodes.length"
          :sections="nodes_sections"
          :background="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :foreground="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :size="70" unit="px" :thickness="30"
          :total="nodes.length" has-legend legend-placement="right"></vc-donut>
        </q-card-section>
      </q-card>
      <q-card flat class="bg-card" block>
        <q-card-section>
          <div class="text-bold">Compute Resource Nodes</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <vc-donut v-if="resource_nodes.length"
          :sections="resource_nodes_sections"
          :background="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :foreground="$q.dark.isActive?'#2E363B':'#FAFAFA'"
          :size="70" unit="px" :thickness="30"
          :total="resource_nodes.length" has-legend legend-placement="right"></vc-donut>
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
                {{current_apy.toFixed(2)}}%
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
    <div class="row justify-between q-mt-xl">
      <div>
        <q-tabs v-model="tab" dense no-caps align="left" indicator-color="primary">
          <q-tab name="core" label="Core" />
          <q-tab name="compute" label="Compute" />
        </q-tabs>
      </div>
      <div>
        <q-btn-dropdown  size="md" class="q-ml-sm" color="aleph-radial" label="Create node" v-if="account">
          <!-- start: dropdown item list  -->
          <q-list>
            <q-item clickable v-close-popup @click="showCCNDialog(true)" :disabled="!((account && (Math.round(balance_info.ALEPH) >= 200000))&&(user_node===null))">
              <q-item-section>
                <q-item-label>Core Channel Node</q-item-label>
              </q-item-section>
            </q-item>

              <q-item clickable v-close-popup @click="createComputeNode = true">
                <q-item-section>
                  <q-item-label>Compute Resource Node</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
              <!-- end: dropdown item list  -->
        </q-btn-dropdown>
      </div>
    </div>
    <q-tab-panels v-model="tab" animated class="transparent">
      <!-- start: all nodes -->
      <q-tab-panel name="core" >
        <nodes-table
          v-if="my_core_nodes.length"
          title="My Nodes"
          :values="my_core_nodes"
          :loading="loading"
          :user_node="user_node"
          :user_stakes="user_stakes"
          :show-header="true"
          :core-node-mode="true"
          @node-action="node_emit_action"
          @create-node="createNode = true"
          @create-compute-node="createComputeNode = true"
          @node-info="(node) => {showNode=true; displayed_node=node; displayed_node_type='core'}"
          class="q-mb-xl">
        </nodes-table>
        <nodes-table
          title="All Core Nodes"
          :values="core_nodes_list"
          :loading="loading"
          :user_node="user_node"
          :user_stakes="user_stakes"
          :show-header="true"
          :core-node-mode="true"
          @node-action="node_emit_action"
          @create-node="createNode = true"
          @create-compute-node="createComputeNode = true"
          @node-info="(node) => {showNode=true; displayed_node=node; displayed_node_type='core'}">
        </nodes-table>
      </q-tab-panel>
      <!-- end: all nodes -->
      <!-- start: all nodes -->
      <q-tab-panel name="compute" >
        <nodes-table
          v-if="my_resource_nodes.length"
          title="My Nodes"
          :values="my_resource_nodes"
          :loading="loading"
          :user_node="user_node"
          :user_stakes="user_stakes"
          :show-header="true"
          @node-action="node_emit_action"
          @create-node="createNode = true"
          @create-compute-node="createComputeNode = true"
          @node-info="(node) => {showNode=true; displayed_node=node; displayed_node_type='resource'}"
          class="q-mb-xl">
        </nodes-table>
        <nodes-table
          title="All Compute Nodes"
          :values="resource_nodes_list"
          :loading="loading"
          :user_node="user_node"
          :user_stakes="user_stakes"
          :show-header="true"
          @node-action="node_emit_action"
          @create-node="createNode = true"
          @create-compute-node="createComputeNode = true"
          @node-info="(node) => {showNode=true; displayed_node=node; displayed_node_type='resource'}">
        </nodes-table>
      </q-tab-panel>
      <!-- end: all nodes -->
    </q-tab-panels>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import CreateNode from '../components/CreateNode'
import CreateComputeNode from '../components/CreateComputeNode'
import NodesTable from '../components/NodesTable'
import NodeInfo from '../components/NodeInfo'
import { posts } from 'aleph-js'
import store from '../store'
import { fetchAndCache } from '../helpers/utilities'

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
      chain: store.state.chain,
      ref: ref
    })
}

export default {
  name: 'StakePage',
  computed: mapState({
    scoring_address: 'scoring_address',
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server,
    nodes: state => state.nodes,
    resource_nodes: state => state.resource_nodes,
    node_post_type: 'node_post_type',
    ws_api_server: 'ws_api_server',
    monitor_address: 'monitor_address',
    my_core_nodes (state) {
      let nodes = []
      if (state.account && state.nodes) {
        nodes = state.nodes.filter(node => node.manager === state.account.address)
        if (this.user_stakes.length) {
          nodes = nodes.concat(this.user_stakes)
        } else if (this.user_node) {
          nodes.push(this.user_node)
        }
      }
      return nodes
    },
    core_nodes_list (state) {
      if (state.nodes) {
        return state.nodes.filter((node) => {
          return (node !== this.user_node) && (this.user_stakes.indexOf(node) < 0) && (!state.account || (node.manager !== state.account.address))
        }).sort((a, b) => (a.total_staked > b.total_staked) ? 1 : -1)
      } else {
        return []
      }
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
    my_resource_nodes (state) {
      if (state.resource_nodes && state.account) {
        return state.resource_nodes.filter((node) => {
          return (node.owner === state.account.address)
        })
      } else {
        return []
      }
    },
    resource_nodes_list (state) {
      if (state.resource_nodes && state.account) {
        return state.resource_nodes.filter((node) => {
          return (node.owner !== state.account.address || node.manager !== state.account.address)
        }).sort((a, b) => (a.total_staked > b.total_staked) ? 1 : -1)
      } else if (state.resource_nodes) {
        return state.resource_nodes.filter((node) => true)
      } else {
        return []
      }
    },
    active_nodes: (state) => state.nodes.filter((node) => node.status === 'active').length,
    linked_nodes: (state) => state.resource_nodes.filter((node) => node.parent).length,
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
    resource_nodes_sections (state) {
      const total_nodes = state.resource_nodes.length
      return [
        {
          label: `${total_nodes} nodes`,
          value: total_nodes - this.linked_nodes,
          color: '#71C9FA'
        },
        {
          label: `${this.linked_nodes} linked`,
          value: this.linked_nodes,
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
    total_per_day () {
      return 15000 * ((Math.log10(this.active_nodes) + 1) / 3)
    },
    total_per_aleph_per_day () {
      return this.total_per_day / this.total_staked_in_active
    },
    current_apy () {
      return (((1 + this.total_per_aleph_per_day) ** 365) - 1) * 100
    },
    closeComputeDialog () {
      this.createComputeNode = false
    }
  }),
  components: {
    CreateNode,
    CreateComputeNode,
    NodesTable,
    NodeInfo
  },
  data () {
    return {
      tab: 'core',
      createNode: false,
      createComputeNode: false,
      showNode: false,
      loading: null,
      displayed_node: null,
      displayed_node_type: null,
      calculator_staked: 10000
    }
  },
  methods: {
    async preloadMetaInfo () {
      // Runs the following queries in parallel:
      // Load latest CCN and CRN versions from Github
      // Load latest scores and metrics from aleph messages

      const [ccn_versions, crn_versions, scores, metrics] = await Promise.all([
        this.getLatestCCNVersion(),
        this.getLatestCRNVersion(),
        this.getLatestScores(),
        this.getLatestMetrics()
      ])
      if (!ccn_versions || !crn_versions) {
        this.$store.commit('set_network_errors', 'github')
      }
      if (!scores || !metrics) {
        this.$store.commit('set_network_errors', 'scores')
      }
      this.$store.commit('set_nodes_metadata', {
        ccn_versions,
        crn_versions,
        scores: scores?.posts[0]?.content?.scores || { ccn: [], crn: [] },
        metrics: metrics?.posts[0]?.content?.metrics || { ccn: [], crn: [] }
      })
    },
    async getLatestCCNVersion () {
      return fetchAndCache(
        'https://api.github.com/repos/aleph-im/pyaleph/releases',
        'ccn_versions',
        300_000
      )
    },
    async getLatestCRNVersion () {
      return fetchAndCache(
        'https://api.github.com/repos/aleph-im/aleph-vm/releases',
        'crn_versions',
        300_000
      )
    },
    async getLatestScores () {
      return posts.get_posts('aleph-scoring-scores', {
        pagination: 1,
        page: 1,
        addresses: [this.scoring_address]
      })
    },
    async getLatestMetrics () {
      return posts.get_posts('aleph-network-metrics', {
        pagination: 1,
        page: 1,
        addresses: [this.scoring_address]
      })
    },
    async prepare_nodes_feed () {
      this.statusSocket = new WebSocket(
        `${this.ws_api_server}/api/ws0/messages?msgType=AGGREGATE&history=1&addresses=` +
        `${this.monitor_address}`
      )

      this.statusSocket.onmessage = function (event) {
        this.$store.commit('unset_network_errors', 'websockets')
        const data = JSON.parse(event.data)
        if ((data.content !== undefined) &&
            (data.content.address === this.monitor_address) &&
            (data.content.key === 'corechannel') &&
            (data.content.content.nodes !== undefined)) {
          this.$store.commit('set_nodes', data.content.content.nodes)
          this.$store.commit('set_resource_nodes', data.content.content.resource_nodes)
          this.$store.commit('merge_node_scores')
          this.$store.commit('pack_crn_references')
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
        this.$store.commit('set_network_errors', 'websockets')
        this.statusSocket.close()
      }.bind(this)
    },
    async creation_done (tab) {
      this.tab = tab
      this.createNode = false
      this.createComputeNode = false
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
    },
    showCCNDialog (value) {
      if ((this.account && (Math.round(this.balance_info.ALEPH) >= 200000)) && (this.user_node === null)) {
        this.createNode = value
      }
    }
  },
  async mounted () {
    await this.preloadMetaInfo()
    await this.update()
    await this.prepare_nodes_feed()
  },
  async unmounted () {
    this.statusSocket.close()
  },
  async destroyed () {
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
