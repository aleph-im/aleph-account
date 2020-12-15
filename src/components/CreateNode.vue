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
            <p>You can change it later as well as set a picture and description</p>
        </q-step>
        <q-step
            :name="2"
            title="Node multiaddress"
            icon="settings"
            :done="step > 1"
        >
            <p>The multiaddress is the way the network will find your node.</p>
            <q-input outlined v-model="multiaddress" label="Multiaddress (optional)" />
            <p>
              You need to have a node active and a multiaddress set by Jan 11th 2021
              if you want to continue received rewards on that date.
              Until then, it is optional.
            </p>
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
