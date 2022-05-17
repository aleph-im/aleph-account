<template>
  <span>
    <template v-if="node !== undefined">
      <div class="row items-center">
        <div>
          <q-icon style="font-size: 2em" :name="node.picture && `img:${api_server}/api/v0/storage/raw/${node.picture}`" class="rounded-borders q-mr-md" />
        </div>

        <div style="font-size:12px">
          <div class="row items-center">
            <span class="text-grey text-weight-light">CRN-ID&nbsp;</span> <strong>{{ node.hash.slice(-10) }}</strong>
            <span :class="'status-pill q-mr-sm q-ml-sm bg-'+(node.status === 'active' ? 'positive': 'inactive')">
              <q-tooltip>
                {{ node.status }}
              </q-tooltip>
            </span>
          </div>
          <span>{{ node.name.substring(0, 30) }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      {{nodeHash.slice(-10)}}
    </template>
  </span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'resource-node-name',
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
    'node-hash'
  ],
  data () {
    return {
      node: undefined
    }
  },
  methods: {
    async update () {
      this.node = this.resource_nodes.find(node => node.hash === this.nodeHash)
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
