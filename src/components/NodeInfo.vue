<template>
  <q-card class="infocard">
    <div class="row">
      <div class="col-12 col-md-5 q-pa-md">
        <div class="text-weight-bold text-h5 q-mb-md">Node Info</div>
        <q-input v-model="name" label="Name"
        stack-label standout :readonly="!editing"
        class="q-my-sm" />
        <q-input v-model="multiaddress" label="Multi-Address"
        stack-label standout :readonly="!editing"
        class="q-my-sm" />
        <q-input v-model="desscription" label="Description" hint="optional"
        stack-label standout :readonly="!editing" type="textarea"
        class="q-my-sm" />
      </div>
      <div class="col-12 col-md-7 q-pa-md">
        <div class="row justify-between">
          <div class="text-weight-bold text-h5 q-mb-md">Summary</div>
          <span>
            <q-btn color="grey" icon="close"
            size="xs" padding="xs" class="radius-4"
            @click="$emit('close')"/>
          </span>
        </div>
        <div class="row justify-between q-mb-sm">
          <span>
            Status
          </span>
          <span style="text-transform: capitalize;">
            {{ node.status }}
            <span :class="'status-pill q-ml-sm bg-'+(node.status === 'active' ? 'positive': 'inactive')"></span>
          </span>
        </div>
        <div class="row justify-between q-mb-sm">
          <span>
            Creation time
          </span>
          <span>
            {{ new Date(node.time*1000).toLocaleDateString() }}
          </span>
        </div>
        <div class="row justify-between q-mb-sm">
          <span>
            Uptime
          </span>
          <span>
            {{ node.uptime ? node.uptime : ' -- ' }} %
          </span>
        </div>
        <div class="row justify-between q-mb-sm">
          <span>
            Total staked
          </span>
          <span>
            {{ node.total_staked.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
// import { posts } from 'aleph-js'
// import { aggregates } from 'aleph-js'

export default {
  name: 'node-info',
  computed: mapState([
    'account',
    'channel',
    'api_server',
    'tags',
    'node_post_type'
  ]),
  props: [
    'node'
  ],
  data () {
    return {
      name: '',
      multiaddress: '',
      description: '',
      editing: false
    }
  },
  methods: {
    async advance () {
    },
    async finish () {
    },
    async update () {
      this.name = this.node.name
      this.multiaddress = this.node.multiaddress
      this.description = this.node.description
    }
  },
  watch: {
    node (old, node) {
      this.update()
    }
  },
  created () {
    this.update()
  }
}
</script>

<style lang="scss">
.infocard {
  width: 900px !important;
  max-width: 80vw !important;
  &>.row {
    >:first-child {
      border-right: 1px solid rgba(0,0,0,.1);
    }
  }
}

.body--dark {
  .infocard {
    background: #1d262e;
    &>.row {
      >:first-child {
        border-right: 1px solid rgba(255,255,255,.1);
      }
    }
  }
}
</style>
