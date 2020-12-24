<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Create node</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-stepper
        v-model="step"
        ref="stepper"
        :active-color="$q.dark.isActive?'light-blue':'primary'"
        :done-color="$q.dark.isActive?'primary':'light-blue'"
        animated
        flat
      >
        <q-step
            :name="1"
            title="Set node name"
            icon="settings"
            :done="step > 1"
        >
            <p>Your node name should be short and meaningful.</p>
            <q-input outlined v-model="name" label="Node name (optional)" />
            <p style="padding-top: 8px; opacity:.8;">You can change it later if you want and even set a picture and description</p>
        </q-step>
        <q-step
            :name="2"
            title="Pair multiaddress"
            icon="settings"
            :done="step > 1"
        >
            <p>The multiaddress is a way for the network to find your node.</p>
            <q-input outlined v-model="multiaddress" label="Multiaddress (optional)" />
            <p style="padding-top: 8px; opacity:.8;">
              Don't worry if you still didn't install your node (server).
              You will receive a multiaddress during the installation of your node.
              But be warned, you need to have a node active and a multiaddress set by <b>Jan 11th 2021</b>
              if you want to continue to receive rewards after that date.
              Until then, it is optional and you can finish for now and comback later to pair it.
            </p>
            <p><a href="https://bit.ly/3mw3GYK" :class="($q.dark.isActive?'text-white':'text-black')" target="_blank">How to create a node</a>!</p>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn @click="advance" color="primary" :label="step === 2 ? 'Finish' : 'Continue'" />
            <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back" class="q-ml-sm" />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapState } from 'vuex'
import { posts } from 'aleph-js'
// import { aggregates } from 'aleph-js'

export default {
  name: 'create-node',
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
      let result = await posts.submit(this.account.address, this.node_post_type,
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
      this.$emit('done', result)
    }
  }
}
</script>
