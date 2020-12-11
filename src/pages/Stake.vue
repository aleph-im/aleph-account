<template>
  <q-page class="q-pa-md">
    <q-dialog v-model="createNode">
      <CreateNode />
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
          <q-btn v-if="account && (balance_info.ALEPH >= 200000)"
            color="aleph-radial" text-color="white"
            class="q-ml-sm" icon="add" size="sm" @click="createNode = true" rounded>
            Create node
          </q-btn>
        </span>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            <span class="text-grey">Node-ID:</span> {{ props.row.id }}<br />
            {{ props.row.name }}
          </q-td>
          <q-td key="staked" :props="props" width="200">
            <div class="row justify-between">
              <span>
                {{ (props.row.staked/1000).toFixed(0) }}k
              </span>
              <span style="text-transform: capitalize;">{{ props.row.status }}</span>
            </div>
            <q-linear-progress rounded size="5px"
            :color="props.row.status === 'active' ? 'positive': 'inactive'"
            :value="props.row.staked > 500000 ? 1.0 : props.row.staked/500000"
            class="q-my-sm">
            </q-linear-progress>
            <div class="posbadge" :style="`margin-left: calc(${(props.row.staked > 500000 ? 1.0 : props.row.staked/500000)*100}% - 28px - 16px)`">
              <q-badge :color="props.row.status === 'active' ? 'positive': 'inactive'"
                       text-color="white"
                       :label="(props.row.staked > 500000 ? '+' : '') + ((props.row.staked - 500000)/1000).toFixed(0) + 'k'" />
            </div>
          </q-td>
          <q-td key="uptime" :props="props">
            {{ props.row.uptime }} %
          </q-td>
          <q-td key="creationDate" :props="props">
            {{ props.row.creationDate.toLocaleDateString() }}
          </q-td>
          <q-td key="stared" :props="props">

          </q-td>
          <q-td key="actions" :props="props">

          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import CreateNode from '../components/CreateNode'
export default {
  name: 'StakePage',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server
  }),
  components: {
    CreateNode
  },
  data () {
    return {
      filter: '',
      createNode: false,
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: props => props.id + ' ' + props.name,
          sortable: true
        },
        {
          name: 'staked',
          label: 'Staked',
          field: 'staked',
          align: 'left'
        },
        {
          name: 'uptime',
          label: 'Up-Time',
          field: 'uptime'
        },
        {
          name: 'creationDate',
          label: 'Creation Date',
          field: 'creationDate'
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
      ],
      values: [
        {
          id: 'node-id-123456',
          name: '<Name>',
          staked: 321000,
          status: 'waiting',
          uptime: 0,
          creationDate: new Date(2020, 11, 18, 11, 18, 31, 255),
          starred: false
        },
        {
          id: 'node-id-123457',
          name: '<Name>',
          staked: 589253,
          status: 'active',
          uptime: 100,
          creationDate: new Date(2020, 11, 17, 10, 14, 28, 255),
          starred: false
        }
      ]
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
</style>
