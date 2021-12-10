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
        <span class="q-mr-xs"> Choose your language then copy and paste your code in the following text area</span>
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
          <q-select standout v-model="selectedLanguage" :options="languages" label="Language">
            <template v-slot:selected-item="scope">
              {{ scope.opt.label }}
              <q-chip
                v-if="!scope.opt.available"
                dense
                square
                color="white"
                text-color="primary"
                class="q-my-none q-mx-xs q-mr-none"
              >Soon</q-chip>
            </template>
          </q-select>
        </div>
        <div class="col-12" v-if="selectedLanguage.available">
          <q-input ref="textarea" type="textarea" id="editor" v-model="newProgram.code">
          </q-input>
        </div>
      </div>

      <q-stepper-navigation>
        <q-btn @click="importCode()" :disable="!selectedLanguage.available" color="primary" label="Import script"/>
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
          <q-btn class="q-mr-xs" @click="addVolume(false)" icon="add" outline color="primary" label="Add Volume"/>
          <q-btn @click="addVolume(true)" icon="add" outline color="primary" label="Add Persistent Volume"/>
        </div>
        <q-card class="col-12 q-pa-sm" v-for="volume in newProgram.volumes" :key="volume.id">
          <div class="col-12">
            <q-input v-model="volume.comment" label="Description"
              stack-label standout class="q-my-sm" />
          </div>
          <div class="col-12" >
            <q-input v-model="volume.mount" label="Mount"
              stack-label standout class="q-my-sm" />
          </div>
          <div v-show="!volume.isPersistent">
            <q-input v-model="volume.ref" label="Ref"
              stack-label standout class="q-my-sm" />
          </div>
          <div v-show="!volume.isPersistent">
            <span>Use latest version?</span>
            <q-radio v-model="volume.latestVersion" :val="true" label="Yes" />
            <q-radio v-model="volume.latestVersion" :val="false" label="No" />
          </div>
          <div v-show="volume.isPersistent">
            <q-input v-model="volume.name" label="Volume name"
              stack-label standout class="q-my-sm" />
          </div>
          <div v-show="volume.isPersistent">
            <q-input v-model="volume.size" label="Size (MiB)"
              stack-label standout class="q-my-sm" />
          </div>
          <q-card-actions align="right">
            <q-btn @click="deleteVolume(volume)" color="red" label="Delete" class="q-ml-sm" />
          </q-card-actions>
        </q-card>
      </div>
      <q-stepper-navigation>
        <q-btn color="primary" label="Deploy" @click="deploy()"/>
        <q-btn flat @click="backStep(1)" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script>

import * as CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/blackboard.css'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/javascript/javascript.js'
import { store } from 'aleph-js'

export default {
  name: 'create-new-vm',
  props: ['account'],
  data () {
    return {
      cm: null,
      file: null,
      newProgram: {
        code: 'print("Hello Wolrd!")',
        refRuntime: 'bd79839bf96e595a06da5ac0b6ba51dea6f7e2591bb913deccded04d831d29f4',
        volumes: []
      },
      languages: [
        { label: 'Python', value: 'python', available: true },
        { label: 'Javascript', value: 'javascript', available: false }
      ],
      selectedLanguage: { label: 'Python', value: 'python', available: true },
      step: 1,
      tab: false
    }
  },
  computed: {
    getEditorElement () {
      return document.getElementById('editor')
    }
  },
  methods: {
    addVolume (isPersistent) {
      if (isPersistent) {
        this.newProgram.volumes.push({
          id: (Math.random() + 1).toString(36).substring(7),
          isPersistent: true,
          persistence: 'host'
        })
      } else {
        this.newProgram.volumes.push({
          id: (Math.random() + 1).toString(36).substring(7),
          isPersistent: false
        })
      }
    },
    deleteVolume (volume) {
      this.newProgram.volumes.splice(this.newProgram.volumes.findIndex(v => v.id === volume.id), 1)
    },
    backStep (step) {
      this.step = step
    },
    init () {
      CodeMirror.fromTextArea(this.$refs.textarea, {
        lineNumbers: true,
        theme: 'blackboard',
        mode: 'python'
      })
    },
    async importCode () {
      this.file = new File([this.newProgram.code], 'code.py', { type: 'text/plain' })
      this.step = 2
    },
    async deploy () {
      await store.submit(
        this.account.address,
        {
          chain: 'ETH',
          type: 'PROGRAM',
          sender: this.account.address,
          channel: 'TEST',
          fileobject: this.file,
          content: {
            address: this.account.address,
            volumes: this.newProgram.volumes,
            runtime: {
              ref: this.newProgram.refRuntime,
              comment: this.newProgram.description
            }
          },
          api_server: 'https://api2.aleph.im'
        }
      )
    }
  },
  watch: {
  },
  mounted () {
    this.init()
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
