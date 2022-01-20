<template>
  <q-card style="width:100%;">
    <q-card-section>
      <div class="row justify-between">
                <div class="text-h6">Create Compute Resource Node</div>
                <q-btn unelevated size="md" icon="close" @click="closeDialog()"></q-btn>
        </div>
    </q-card-section>

    <q-card-section class="q-pt-md">
        <div class="q-mb-md">
            <q-input label="Node name" stack-label standout class="q-my-sm" />
        </div>
        <div class="q-mb-md">
            <q-input label="Multiaddress" placeholder="/ip4/46.19.179.231/tcp/4025/p2p/Lqs2Hd ..." stack-label standout class="q-my-sm" />
        </div>
        <div class="q-my-md">
            <a href="" :style="`color: inherit;`" >How to install your node and retrieve the multiaddress.</a>
        </div>
        <div>
            <q-btn class="full-width" text-color="white" outline color="primary" label="Register" @click="finish()" />
        </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { posts } from 'aleph-js'
// import { aggregates } from 'aleph-js'

export default {
  name: 'create-compute-node',
  computed: mapState([
    'account',
    'channel',
    'api_server',
    'tags',
    'node_post_type'
  ]),
  data () {
    return {
      step: 1,
      name: '',
      multiaddress: ''
    }
  },
  methods: {
    async advance () {
      if (this.step < 2) {
        this.$refs.stepper.next()
      } else {
        await this.finish()
      }
    },
    async finish () {
      await posts.submit(this.account.address, this.node_post_type,
        {
          tags: ['create-node', ...this.tags],
          action: 'create-node',
          details: {
            name: this.name,
            multiaddress: this.multiaddress
          }
        },
        {
          api_server: this.api_server,
          account: this.account,
          channel: this.channel
        })
      // await aggregates.submit(this.account.address, 'node', {
      //   name: this.name,
      //   multiaddress: this.multiaddress,
      //   hash: result.item_hash
      // }, {
      //   api_server: this.api_server,
      //   account: this.account,
      //   channel: this.channel
      // })
      this.$emit('done', 'compute')
    },

    closeDialog () {
      this.$emit('close')
    }
  }
}
</script>
