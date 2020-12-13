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
            <p>The node name is directly set on your address as you can have only one node active.</p>
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
            <q-btn @click="$refs.stepper.next()" color="primary" :label="step === 2 ? 'Finish' : 'Continue'" />
            <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back" class="q-ml-sm" />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'create-node',
  data () {
    return {
      step: 1,
      name: ''
    }
  }
}
</script>
