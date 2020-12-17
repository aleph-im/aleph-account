<template>
  <div>
    <q-table
      :title="title"
      :data="values"
      :columns="columns"
      :filter="filter"
      :rows-per-page-options="[15,30,60,0]"
      row-key="hash"
      flat
      class="bg-transparent"
      :hide-bottom="!showFooter"
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
            class="q-ml-sm" icon="add" size="sm" @click="$emit('create-node')">
            Create node
          </q-btn>
        </span>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            <span class="text-grey text-weight-light">Node-ID: </span> <strong>{{ props.row.hash.slice(-10) }}</strong><br />
            {{ props.row.name.substring(0, 30) }}
          </q-td>
          <q-td key="total_staked" :props="props" width="200">
            <div class="row justify-between">
              <span>
                <span class="text-weight-bold">
                  {{ (props.row.total_staked/1000).toFixed(0) }}k
                </span>
                <span class="text-weight-medium text-grey">
                  of 500k
                </span>
              </span>
              <span style="text-transform: capitalize;">{{ props.row.status }}</span>
            </div>
            <q-linear-progress rounded size="5px"
            :color="props.row.status === 'active' ? 'positive': 'inactive'"
            :value="props.row.total_staked > 500000 ? 1.0 : props.row.total_staked/500000"
            class="q-my-sm">
            </q-linear-progress>
            <div class="posbadge" :style="`margin-left: calc(${(props.row.total_staked > 450000 ? 1.0 : props.row.total_staked/500000)*80}% - 16px)`">
              <q-badge :color="props.row.status === 'active' ? 'positive': 'inactive'"
                        text-color="white"
                        :label="(props.row.total_staked > 500000 ? '+' : '') + ((props.row.total_staked - 500000)/1000).toFixed(0) + 'k'" />
            </div>
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
            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-if="account&&user_node&&(user_node.hash == props.row.hash)"
            @click="$emit('node-action', 'drop-node', props.row.hash)">drop node</q-btn>
            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-else-if="account&&user_stake&&(user_stake.hash == props.row.hash)"
            @click="$emit('node-action', 'unstake', props.row.hash)">unstake</q-btn>
            <q-btn size="sm" :loading="loading==props.row.hash"
            v-else :disabled="!(account&&(balance_info.ALEPH >= 10000)&&(!user_node))" outline
            :class="'border-primary text-'+($q.dark.isActive?'white':'black')"
            @click="$emit('node-action', 'stake', props.row.hash)">stake</q-btn>
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
  computed: mapState([
    'account',
    'channel',
    'api_server',
    'tags',
    'node_post_type',
    'balance_info'
  ]),
  props: [
    'values',
    'title',
    'user_node',
    'user_stake',
    'loading',
    'showHeader',
    'showFooter'
  ],
  data () {
    return {
      filter: '',
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
  }
}
</script>

<style lang="scss">
.q-table tbody td {
  font-size: 12px;
  line-height: 28px;
}
</style>
