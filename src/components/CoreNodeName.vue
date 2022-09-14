<template>
  <span>
    <template v-if="node !== undefined">
      <q-icon v-if="node.picture" style="font-size: 2em" :name="`img:${api_server}/api/v0/storage/raw/${node.picture}`" class="rounded-borders q-mr-sm" />
      {{ node.name.substring(0, 30) }}
      <q-tooltip>
        <span class="text-grey text-weight-light">CCN-ID </span> <strong>{{ node.hash.slice(-10) }}</strong>
        <span :class="'status-pill q-ml-sm bg-'+(node.status === 'active' ? 'positive': 'inactive')" :title="node.status"></span>
      </q-tooltip>
    </template>
    <template v-else>
      {{nodeHash.slice(-10)}}
    </template>
  </span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'core-node-name',
  computed: {
    editing () {
      return (
        this.account &&
        (
          this.node.owner === this.account.address ||
          this.node.manager === this.account.address
        )
      )
    },
    ...mapState([
      'nodes',
      'resource_nodes',
      'api_server'
    ])
  },
  props: [
    'node-hash'
  ],
  data () {
    return {
      node: undefined
    }
  },
  methods: {
    async update () {
      this.node = this.nodes.find(node => node.hash === this.nodeHash)
    }
  },
  watch: {
    nodeHash () {
      this.update()
    }
  },
  created () {
    this.update()
  }
}
</script>
