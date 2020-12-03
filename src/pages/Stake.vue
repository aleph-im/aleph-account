<template>
  <q-page class="q-pa-md">
    <q-table
      title="Nodes"
      :data="values"
      :columns="columns"
      :filter="filter"
      flat
      class="bg-transparent"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="search nodes">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            Node-ID: {{ props.row.id }}<br />
            {{ props.row.name }}
          </q-td>
          <q-td key="staked" :props="props">
            <div class="row justify-between">
              <span>
                {{ (props.row.staked/1000).toFixed(0) }}k
              </span>
              <span style="text-transform: capitalize;">{{ props.row.status }}</span>
            </div>
            <q-linear-progress rounded size="5px" :color="props.row.status === 'active' ? 'positive': 'inactivegradient'" :value="props.row.staked > 500000 ? 1.0 : props.row.staked/500000" />
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
export default {
  name: 'PageIndex',
  computed: mapState({
    account: state => state.account,
    balance_info: state => state.balance_info,
    api_server: state => state.api_server
  }),
  data () {
    return {
      filter: '',
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
