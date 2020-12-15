<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="createNode">
      <CreateNode @done="creation_done" />
    </q-dialog>
    <q-table
      title="Nodes"
      :data="values"
      :columns="columns"
      :filter="filter"
      flat
      class="bg-transparent"
    >
      <template v-slot:top-right>
        <span class="row">
          <q-input borderless dense debounce="300" v-model="filter" placeholder="search nodes">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn :disabled="!((account && (balance_info.ALEPH >= 200000))&&(user_node===null))"
            color="aleph-radial" text-color="white"
            class="q-ml-sm" icon="add" size="sm" @click="createNode = true" rounded>
            Create node
          </q-btn>
        </span>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            <span class="text-grey">Node-ID:</span> {{ props.row.hash.slice(-10) }}<br />
            {{ props.row.name }}
          </q-td>
          <q-td key="total_staked" :props="props" width="200">
            <div class="row justify-between">
              <span>
                {{ (props.row.total_staked/1000).toFixed(0) }}k
              </span>
              <span style="text-transform: capitalize;">{{ props.row.status }}</span>
            </div>
            <q-linear-progress rounded size="5px"
            :color="props.row.status === 'active' ? 'positive': 'inactive'"
            :value="props.row.total_staked > 500000 ? 1.0 : props.row.total_staked/500000"
            class="q-my-sm">
            </q-linear-progress>
            <div class="posbadge" :style="`margin-left: calc(${(props.row.total_staked > 450000 ? 1.0 : props.row.total_staked/500000)*100}% - 16px)`">
              <q-badge :color="props.row.status === 'active' ? 'positive': 'inactive'"
                       text-color="white"
                       :label="(props.row.total_staked > 500000 ? '+' : '') + ((props.row.total_staked - 500000)/1000).toFixed(0) + 'k'" />
            </div>
          </q-td>
          <q-td key="uptime" :props="props">
            {{ props.row.uptime }} %
          </q-td>
          <q-td key="time" :props="props">
            {{ new Date(props.row.time*1000).toLocaleDateString() }}
          </q-td>
          <q-td key="stared" :props="props">

          </q-td>
          <q-td key="actions" :props="props">
            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-if="account&&user_node&&(user_node.hash == props.row.hash)"
            @click="drop_node(props.row.hash)">drop node</q-btn>
            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-else-if="account&&user_stake&&(user_stake.hash == props.row.hash)"
            @click="unstake(props.row.hash)">unstake</q-btn>
            <q-btn size="sm" :loading="loading==props.row.hash" color="aleph-radial" text-color="white"
            v-else :disabled="!(account&&(balance_info.ALEPH >= 10000))"
            @click="stake(props.row.hash)">stake</q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import CreateNode from '../components/CreateNode'
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
      return state.nodes
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
    }
  }),
  components: {
    CreateNode
  },
  data () {
    return {
      filter: '',
      createNode: false,
      loading: null,
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: props => props.hash + ' ' + props.name,
          sortable: true
        },
        {
          name: 'total_staked',
          label: 'Staked',
          field: 'total_staked',
          align: 'left'
        },
        {
          name: 'uptime',
          label: 'Up-Time',
          field: 'uptime'
        },
        {
          name: 'time',
          label: 'Creation Date',
          field: 'time'
        },
        {
          name: 'stared',
          label: '',
          field: 'stared'
        },
        {
          name: 'actions',
          label: '',
          align: 'right'
        }
      ]
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
      await sleep(2000)
      await this.update()
      this.loading = null
    },
    async update () {
      await this.$store.dispatch('update_nodes')
    },
    async stake (node_hash) {
      this.loading = node_hash
      try {
        await node_action('stake', node_hash)
        await this.update()
      } finally {
        this.loading = null
      }
    },
    async unstake (node_hash) {
      this.loading = node_hash
      try {
        await node_action('unstake', node_hash)
        console.log('updating')
        await this.update()
      } finally {
        this.loading = null
      }
    },
    async drop_node (node_hash) {
      this.loading = node_hash
      try {
        await node_action('drop-node', node_hash)
        console.log('updating')
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
