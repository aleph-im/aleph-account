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
/* eslint new-cap: ["error", { "newIsCap": false }] */

import * as CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/blackboard.css'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/javascript/javascript.js'
const shajs = require('sha.js')
import { store, broadcast, storage_push, ipfs_push, create, nuls, nuls2, neo, ethereum } from 'aleph-js'

export default {
  name: 'create-new-vm',
  props: ['account', 'api_server'],
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
    async putContent (message, content, inline_requested, storage_engine, api_server) {
      let inline = inline_requested
      if (inline) {
        let serialized = JSON.stringify(content)
        if (serialized.length > 150000) {
          inline = false
        } else {
          message.item_type = 'inline'
          message.item_content = serialized
          message.item_hash = new shajs.sha256().update(serialized).digest('hex')
        }
      }
      if (!inline) {
        let hash = ''
        if (storage_engine === 'ipfs') {
          message.item_type = 'ipfs'
          hash = await ipfs_push(content, { api_server: api_server })
        } else {
          message.item_type = 'storage'
          hash = await storage_push(content, { api_server: api_server })
        }
        message.item_hash = hash
      }
    },
    async importCode () {
      this.file = new File([this.newProgram.code], 'code.py', { type: 'text/plain' })
      this.step = 2
    },
    async send (message) {
      if (this.account.type === 'NULS') {
        message = nuls.sign(Buffer.from(this.account.private_key, 'hex'), message)
      } else if (this.account.type === 'NULS2') {
        message = await nuls2.sign(this.account, message)
      } else if (this.account.type === 'NEO') {
        message = await neo.sign(this.account, message)
      } else if (this.account.type === 'ETH') {
        message = await ethereum.sign(this.account, message)
      }
      console.log(message)
      await broadcast(message, { api_server: 'https://api2.aleph.im' })
    },
    async deploy () {
      let storeMessage = await store.submit(
        this.account.address,
        {
          chain: 'ETH',
          sender: this.account.address,
          account: this.account,
          channel: 'TEST',
          fileobject: this.file,
          api_server: 'https://api2.aleph.im'
        }
      )

      let item_hash = storeMessage.item_hash

      let message = {
        chain: 'ETH',
        time: Date.now(),
        channel: 'TEST',
        sender: this.account.address,
        type: 'PROGRAM',
        item_hash: '',
        on: {
          http: true
        },
        item_type: 'inline'
      }

      let store_content = {
        time: Date.now() / 1000,
        type: 'vm-function',
        address: this.account.address,
        volumes: this.newProgram.volumes,
        allow_amend: false,
        resources: {
          vcpus: 1,
          memory: 128,
          seconds: 30
        },
        code: {
          encoding: 'zip',
          entrypoint: 'main:app',
          ref: item_hash
        },
        environment: {
          reproducible: false,
          internet: true,
          aleph_api: true,
          shared_cache: false
        },
        runtime: {
          ref: this.newProgram.refRuntime,
          use_latest: true,
          comment: 'Aleph Alpine Linux with Python 3.8'
        }
      }

      await this.putContent(message, store_content, true, 'storage', 'https://api2.aleph.im')
      await this.send(message)
    }
  },
  watch: {
  },
  mounted () {
    console.log(create)
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
