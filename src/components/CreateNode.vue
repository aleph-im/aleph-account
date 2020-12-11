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
            Your node name should be short and meaningful, you can edit it later.
        </q-step>
        <q-step
            :name="2"
            title="Select campaign settings"
            icon="settings"
            :done="step > 1"
        >
            For each ad campaign that you create, you can control how much you're willing to
            spend on clicks and conversions, which networks and geographical locations you want
            your ads to show on, and more.
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
      step: 1
    }
  }
}
</script>
