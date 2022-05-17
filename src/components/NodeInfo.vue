<template>
  <q-card class="infocard">
    <q-img
      :src="`${api_server}/api/v0/storage/raw/${node.banner}`"
      basic
      :ratio="$q.screen.lt.md ? 4/3 : 32/9"
      v-if="node.banner"
    >
        <div class="absolute-bottom">
          <div class="text-h6">
            <q-icon v-if="node.picture" :name="`img:${api_server}/api/v0/storage/raw/${node.picture}`" class="rounded-borders" />
            {{name}}
          </div>
          <p v-if="description" class="q-mb-none q-pt-sm">
            {{description}}
          </p>
        </div>
    </q-img>
    <div class="row">
      <div class="col-12 col-md-5 q-pa-md" v-if="!editing">
        <div class="text-weight-bold text-h5 q-mb-md">
          <q-icon name="lock" v-if="locked" class="float-right">
            <q-tooltip v-if="nodeType==='core'">
              No staker can join this node.
            </q-tooltip>
            <q-tooltip v-if="nodeType==='resource'">
              No core channel code can link this resource node.
            </q-tooltip>
          </q-icon>
          Node Info
        </div>
        <q-list>
          <q-item class="standout">
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>{{name}}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="standout copyonclick">
            <q-item-section @click="copyToClipboard(node.owner)">
              <q-icon name="content_copy" class="copy-icon bg-dark-50" />
              <q-item-label caption>Owner</q-item-label>
              <q-item-label class="text-body2 overflow-hidden">{{ellipseAddress(node.owner)}}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="node.reward !== node.owner"  class="standout copyonclick">
            <q-item-section  @click="copyToClipboard(node.reward)">
              <q-icon name="content_copy" class="copy-icon bg-dark-50" />
              <q-item-label caption>Reward address</q-item-label>
              <q-item-label class="text-body2 overflow-hidden">{{ellipseAddress(node.reward)}}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="standout copyonclick" v-if="nodeType==='core'">
            <q-item-section @click="copyToClipboard(multiaddress)">
              <q-icon name="content_copy" class="copy-icon bg-dark-50" />
              <q-item-label caption>Multi-Address</q-item-label>
              <q-item-label class="text-body2 overflow-hidden">{{multiaddress}}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item class="standout copyonclick" v-else-if="nodeType==='resource'">
            <q-item-section @click="copyToClipboard(address)">
              <q-icon name="content_copy" class="copy-icon bg-dark-50" />
              <q-item-label caption>Address</q-item-label>
              <q-item-label class="text-body2 overflow-hidden">{{address}}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="description"  class="standout">
            <q-item-section>
              <q-item-label caption>Description</q-item-label>
              <q-item-label class="text-body2 overflow-hidden">{{description}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col-12 col-md-5 q-pa-md" v-if="editing">
        <div class="text-weight-bold text-h5 q-mb-md">
          Node Info
        </div>
        <q-input v-model="name" label="Name"
        stack-label standout
        class="q-my-sm" />
        <q-input v-model="reward" label="Reward address"
        stack-label standout
        class="q-my-sm" />
        <q-input v-model="multiaddress" label="Multi-Address" v-if="nodeType === 'core'"
        stack-label standout
        class="q-my-sm" />
        <q-input v-model="address" label="Address" v-else-if="nodeType === 'resource'"
        stack-label standout
        class="q-my-sm" />
        <q-input v-model="description" label="Description" hint="optional"
        stack-label standout type="textarea"
        class="q-my-sm" />
        <q-file v-model="picture" label="Icon"
        stack-label standout :hint="'Max. 50kB, optional.' + (node.picture ? ' There is one already, replace it?' : '')"
        accept=".jpg, image/*"
        max-file-size="51200"
        class="q-my-sm" />
        <q-file v-model="banner" label="Banner"
        stack-label standout
        accept=".jpg, image/*" :hint="'Max. 1MB, optional.' + (node.banner ? ' There is one already, replace it?' : '')"
        max-file-size="1048576"
        class="q-my-sm" />
        <div class="flex justify-between">
          <q-btn color="primary" v-if="editing" @click="save">Save</q-btn>
          <q-toggle
            v-model="locked"
            unchecked-icon="lock_open"
            checked-icon="lock"
            color="red"
            :label="locked ? 'Locked' : 'Unlocked'"
            left-label
          >
            <q-tooltip v-if="nodeType==='core'">
              Prevent stakers from joining this node.
            </q-tooltip>
            <q-tooltip v-if="nodeType==='resource'">
              Prevent core channel node owners from linking to this resource node.
            </q-tooltip>
          </q-toggle>
        </div>
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
        <div class="row justify-between q-mb-sm" v-if="nodeType === 'resource'">
          <span>
            Linked to
          </span>
          <span style="text-transform: capitalize;">
            <span v-if="node.parent === null">Unlinked</span>
            <node-name v-else :node-hash="node.parent" node-type="core"></node-name>
            <span :class="'status-pill q-ml-sm bg-'+(node.parent !== null ? 'positive': 'negative')"></span>
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
        <div class="row justify-between q-mb-sm" v-if="nodeType==='core'">
          <span>
            Total staked
          </span>
          <span>
            {{ node.total_staked.toFixed(2) }}
          </span>
        </div>
        <template v-if="nodeType === 'core'">
          <div class="row justify-between q-mt-lg q-mb-md">
            <div class="text-weight-bold text-h5 ">Linked resource nodes</div>
            <span class="text-grey">{{node.resource_nodes.length}} of 3</span>
          </div>
          <q-list bordered v-if="node.resource_nodes.length">
            <q-item v-for="resource_node of node.resource_nodes" :key="resource_node">
              <q-item-section>
                <node-name :node-hash="resource_node" node-type="resource"></node-name>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else>
            None yet.
          </div>
        </template>
      </div>
    </div>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { posts, store } from 'aleph-js'
import NodeName from './NodeName.vue'
import { copyToClipboard, ellipseAddress } from '../helpers/utilities'
// import { aggregates } from 'aleph-js'

export default {
  components: { NodeName },
  name: 'node-info',
  computed: {
    editing () {
      return (this.account && (this.node.owner === this.account.address))
    },
    ...mapState([
      'account',
      'channel',
      'api_server',
      'tags',
      'node_post_type'
    ])
  },
  props: [
    'node',
    'node-type'
  ],
  data () {
    return {
      name: '',
      multiaddress: '',
      address: '',
      description: '',
      reward: '',
      picture: null,
      banner: null,
      locked: false
    }
  },
  methods: {
    copyToClipboard,
    ellipseAddress,
    async upload_file (fileobject) {
      let message = await store.submit(
        this.account.address,
        {
          fileobject: fileobject,
          channel: this.channel,
          api_server: this.api_server,
          account: this.account
        })

      return message.content.item_hash
    },
    async advance () {
    },
    async finish () {
    },
    async update () {
      this.name = this.node.name
      this.multiaddress = this.node.multiaddress
      this.address = this.node.address
      this.description = this.node.description
      this.reward = this.node.reward
      this.locked = this.node.locked
    },
    async save () {
      let picture = this.node.picture
      if (this.picture) {
        picture = await this.upload_file(this.picture)
      }
      let banner = this.node.banner
      if (this.banner) {
        banner = await this.upload_file(this.banner)
      }
      let amend_action = 'create-node'
      if (this.nodeType === 'resource') {
        amend_action = 'create-resource-node'
      }
      let result = await posts.submit(this.account.address, 'amend',
        {
          tags: [amend_action, ...this.tags],
          action: amend_action,
          details: {
            name: this.name,
            multiaddress: this.multiaddress,
            address: this.address,
            description: this.description,
            reward: this.reward,
            picture: picture,
            banner: banner,
            locked: this.locked
          }
        },
        {
          api_server: this.api_server,
          account: this.account,
          channel: this.channel,
          ref: this.node.hash
        })
      this.$emit('done', result)
    }
  },
  watch: {
    node () {
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

.overflow-hidden{
  text-overflow: ellipsis;
}

.copyonclick{
  transition: .3s;
  cursor: pointer;
  position: relative;
  .copy-icon{
    transition: .3s;
    position: absolute;
    font-size: 150%;
    opacity: 0;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    padding: 5px;
    border-radius: 5px;
    background: $light-grey;
  }
  &:hover{
    filter: brightness(1.25);
    .copy-icon{
      opacity: 1;
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

  .copyonclick{
    &:hover{
      filter: brightness(.75);
    }
    .copy-icon{
      background: #223038;
    }
  }
}
</style>
