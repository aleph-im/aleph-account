<template>
  <span>
    <template v-if="node !== null">
      <q-icon v-if="node.picture" style="font-size: 2em" :name="`img:${api_server}/api/v0/storage/raw/${node.picture}`" class="rounded-borders q-mr-sm" />
      {{ node.name.substring(0, 30) }}
      <q-tooltip>
        <span class="text-grey text-weight-light">{{(nodeType === 'core') ? 'CCN-ID' : 'CRN-ID'}} </span> <strong>{{ node.hash.slice(-10) }}</strong>
        <span :class="'status-pill q-ml-sm bg-'+(node.status === 'active' ? 'positive': 'inactive')" :title="node.status"></span>
      </q-tooltip>
    </template>
    <template v-if="node === null">
      {{nodeHash.slice(-10)}}
    </template>
  </span>
</template>

<script>
import { mapState } from 'vuex'
// import { aggregates } from 'aleph-js'

export default {
  name: 'node-name',
  computed: {
    editing () {
      return (this.account && (this.node.owner === this.account.address))
    },
    ...mapState([
      'nodes',
      'resource_nodes',
      'api_server'
    ])
  },
  props: [
    'node-hash',
    'node-type'
  ],
  data () {
    return {
      node: null
    }
  },
  methods: {
    async update () {
      let found = null
      if (this.nodeType === 'core') {
        for (let node of this.nodes) {
          if (node.hash === this.nodeHash) { found = node }
        }
      } else if (this.nodeType === 'resource') {
        for (let node of this.resource_nodes) {
          if (node.hash === this.nodeHash) { found = node }
        }
      }
      this.node = found
    }
  },
  watch: {
    nodeHash (old, node) {
      this.update()
    }
  },
  created () {
    this.update()
  }
}
</script>
