<template>
  <div>
    <q-table
      :title="title"
      :data="values"
      :columns="columns"
      :filter="filter"
      :rows-per-page-options="[0]"
      row-key="hash"
      flat
      class="bg-transparent"
      :hide-bottom="!showFooter"
      :dense="$q.screen.lt.md"
      :visible-columns="visible_columns"
    >
      <template v-slot:top-right>
        <span class="row" v-if="showHeader">
          <q-input rounded standout dense debounce="300" v-model="filter" placeholder="search nodes">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn :disabled="!((account && (balance_info.ALEPH >= 200000))&&(user_node===null))"
            color="aleph-radial" text-color="white"
            class="q-ml-sm font-weight-bold" icon="add" size="sm" @click="$emit('create-node')">
            Create node
          </q-btn>
        </span>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="picture" :props="props" style="font-size: 2.5em; padding-right: 0;">
            <q-icon v-if="props.row.picture" :name="`img:${api_server}/api/v0/storage/raw/${props.row.picture}`" class="rounded-borders" />
          </q-td>
          <q-td key="name" :props="props">
            <span class="text-grey text-weight-light">Node-ID: </span> <strong>{{ props.row.hash.slice(-10) }}</strong>
            <span :class="'status-pill q-ml-sm bg-'+(props.row.status === 'active' ? 'positive': 'inactive')" :title="props.row.status"></span>
            <br />
            <q-icon name="lock" v-if="props.row.locked">
              <q-tooltip>
                No staker can join this node.
              </q-tooltip>
            </q-icon>
            {{ props.row.name.substring(0, 30) }}
            <div class="lt-sm">
              <span class="text-weight-bold">
                {{ (props.row.total_staked/1000).toFixed(0) }}k
              </span>
              <span class="text-weight-medium text-grey" v-if="props.row.total_staked < 500000">
                of 500k
              </span>
              <span class="text-weight-medium text-grey" v-else>
                staked
              </span>
            </div>
          </q-td>
          <q-td key="total_staked" :props="props" width="200">
            <div class="row justify-between">
              <span>
                <span class="text-weight-bold">
                  {{ (props.row.total_staked/1000).toFixed(0) }}k
                </span>
                <span class="text-weight-medium text-grey" v-if="props.row.total_staked < 500000">
                  of 500k
                </span>
                <span class="text-weight-medium text-grey" v-else>
                  staked
                </span>
              </span>
              <span style="text-transform: capitalize;" class="text-weight-medium">{{ props.row.status }}</span>
            </div>
            <q-linear-progress rounded size="5px"
            :color="props.row.status === 'active' ? 'positive': 'inactive'"
            :value="props.row.total_staked > 500000 ? 1.0 : props.row.total_staked/500000"
            class="q-my-sm">
            </q-linear-progress>
            <!-- <div class="posbadge" :style="`margin-left: calc(${(props.row.total_staked > 450000 ? 1.0 : props.row.total_staked/500000)*80}% - 16px)`">
              <q-badge :color="props.row.status === 'active' ? 'positive': 'inactive'"
                        text-color="white"
                        :label="(props.row.total_staked > 500000 ? '+' : '') + ((props.row.total_staked - 500000)/1000).toFixed(0) + 'k'" />
            </div> -->
          </q-td>
          <q-td key="uptime" :props="props">
            <strong>{{ props.row.uptime === undefined ? '100' : props.row.uptime }}</strong> %
          </q-td>
          <q-td key="time" :props="props">
            {{ new Date(props.row.time*1000).toLocaleDateString() }}
          </q-td>
          <q-td key="stared" :props="props">

          </q-td>
          <q-td key="actions" :props="props">
            <span class="q-pa-xs block" v-if="user_stakes.indexOf(props.row) >= 0">
              {{props.row.stakers[account.address].toFixed(2)}}
              <img v-if="!$q.dark.isActive" src="~/assets/logo-blue.svg" height="18" class="vertical-middle q-pb-xs">
              <img v-if="$q.dark.isActive" src="~/assets/logo-white.svg" height="18" class="vertical-middle q-pb-xs">
            </span>
            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-if="account&&user_node&&(user_node.hash == props.row.hash)" type="a"
            @click="$emit('node-action', 'drop-node', props.row.hash)">drop node</q-btn>
            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-else-if="account&&user_stakes&&(user_stakes.indexOf(props.row) >= 0)" type="a"
            @click="$emit('node-action', 'unstake', props.row.hash)">unstake</q-btn>
            <q-btn size="sm" :loading="loading==props.row.hash" color="primary" type="a"
            v-else :disabled="!(account&&(balance_info.ALEPH >= 10000)&&(!user_node)&&(!props.row.locked)&&(props.row.total_staked<1000000))" outline
            @click="$emit('node-action', 'stake-split', props.row.hash)">
            <q-tooltip>{{stake_tooltip(props.row)}}</q-tooltip>
            stake
            </q-btn>
            <q-btn size="sm" color="primary" outline class="q-ml-sm" type="a"
            @click="$emit('node-info', props.row)">Info</q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'nodes-table',
  computed: {
    visible_columns () {
      if (this.$q.screen.lt.sm) {
        return [
          'picture',
          'name',
          'actions'
        ]
      } else {
        return [
          'picture',
          'name',
          'total_staked',
          'uptime',
          'time',
          'stared',
          'actions'
        ]
      }
    },
    ...mapState([
      'account',
      'channel',
      'api_server',
      'tags',
      'node_post_type',
      'balance_info'
    ])
  },
  props: [
    'values',
    'title',
    'user_node',
    'user_stakes',
    'loading',
    'showHeader',
    'showFooter'
  ],
  data () {
    return {
      filter: '',
      columns: [
        {
          name: 'picture'
        },
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
          align: 'left',
          sortable: true
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
    }
  },
  methods: {
    stake_tooltip (node) {
      if (!this.account) {
        return 'Please login'
      } else if (!(this.balance_info && (this.balance_info.ALEPH >= 10000))) {
        return 'You need at least 10000 ALEPH to stake'
      } else if (this.user_node) {
        return 'You can\'t stake while you operate a node'
      } else if (node.locked) {
        return 'This node is locked'
      } else if (node.total_staked >= 1000000) {
        return 'Too many ALEPH staked on that node'
      } else if (this.user_stakes.length) {
        return 'Add this node to your staking (each node will have an equal part of your total balance staked)'
      } else {
        return `Stake ${this.balance_info.ALEPH.toFixed(2)} ALEPH in this node`
      }
    }
  }
}
</script>

<style lang="scss">
.q-table tbody td {
  font-size: 12px;
  line-height: 28px;
}

.body--dark {
  .q-table tbody td {
    .q-btn.q-btn--outline {
      .q-btn__content {
        color: #fff;
      }
    }
  }
}
</style>
