<template>
  <q-stepper
        v-model="step"
        header-nav
        ref="stepper"
        color="primary"
        class="shadow-2 nftcard"
        animated
      >
    <q-step
      :name="1"
      title="Insert your script"
      icon="settings"
      :done="step > 1"
      :header-nav="step > 1"
    >
      <div class="flex">
        <span class="q-mr-xs"> Copy and paste your python code here.</span>
        <q-btn
        round
        color="primary"
        size="xs"
        icon="help"
        outline
      />
      </div>
      <div class="row q-gutter-md q-mt-md">
        <div class="col-12">
          <q-select standout v-model="model" :options="languages" label="Language" />
        </div>
        <div class="col-12">
          <code>
            <q-input v-model="newProgram.code" label="Python 3"
             type="textarea"
              cols="100" rows="20"
            stack-label standout class="q-my-sm" />
          </code>
        </div>
      </div>

      <q-stepper-navigation>
        <q-btn @click="step = 2" color="primary" label="Import script"/>
      </q-stepper-navigation>
    </q-step>
    <q-step
      :name="2"
      title="Settings"
      icon="settings"
      :done="step > 2"
      :header-nav="step > 2"
    >
    <div class="row q-gutter-md q-mt-md">
        <div class="col-12">
            <q-input v-model="newProgram.refRuntime" label="Ref of runtime"
            stack-label standout class="q-my-sm" />
        </div>
        <div class="col-12">
          <q-btn @click="addVolume()" icon="add" outline color="primary" label="Add Volume"/>
        </div>
        <q-card class="col-12 q-pa-sm" v-for="volume in newProgram.volumes" :key="volume.id">
          <div class="col-12">
            <q-input v-model="volume.description" label="Description"
              stack-label standout class="q-my-sm" />
          </div>
          <div class="col-12" >
            <q-input v-model="volume.description" label="Mount"
              stack-label standout class="q-my-sm" />
          </div>
          <div class="col-12">
            <span>Persist on VM host ?</span>
            <q-radio v-model="volume.persistant" :val="false" label="No" />
            <q-radio v-model="volume.persistant" :val="false" label="No" />
          </div>
          <div >
            <q-input v-model="volume.description" label="Volume name"
              stack-label standout class="q-my-sm" />
          </div>
          <div >
            <q-input v-model="volume.description" label="Size (MiB)"
              stack-label standout class="q-my-sm" />
          </div>
          <q-card-actions align="right">
            <q-btn @click="deleteVolume(volume)" color="red" label="Delete" class="q-ml-sm" />
          </q-card-actions>
        </q-card>
      </div>
      <q-stepper-navigation>
        <q-btn @click="prepare_storage" color="primary" label="Deploy"/>
        <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script>

export default {
  name: 'create-new-vm',
  data () {
    return {
      newProgram: {
        code: `
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
  return {"message": "Hello World"}`,
        refRuntime: 'bd79839bf96e595a06da5ac0b6ba51dea6f7e2591bb913deccded04d831d29f4',
        volumes: []
      },
      languages: [
        { label: 'python', value: 'python', available: true },
        { label: 'node.js (soon)', value: 'nodejs', available: false }
      ],
      step: 1,
      tab: false
    }
  },
  methods: {
    addVolume () {
      this.newProgram.volumes.push({
        id: (Math.random() + 1).toString(36).substring(7)
      })
    },
    deleteVolume (volume) {
      this.newProgram.volumes.splice(this.newProgram.volumes.findIndex(v => v.id === volume.id), 1)
    }
  },
  watch: {
  }
}
</script>

<style lang="scss">
.nftcard {
  width: 900px !important;
  max-width: 80vw !important;
  // &>.row {
  //   >:first-child {
  //     border-right: 1px solid rgba(0,0,0,.1);
  //   }
  // }
}

.body--dark {
  .nftcard {
    background: #1d262e;
    border: none;
    // &>.row {
    //   >:first-child {
    //     border-right: 1px solid rgba(255,255,255,.1);
    //   }
    // }
  }

  .q-stepper {
    background: #1d262e;
    .q-stepper__tab--active, .q-stepper__tab--done {
      color: white;
    }
  }
}
</style>
