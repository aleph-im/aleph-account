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
      :name="STEP_EDITOR"
      title="Insert your script"
      icon="settings"
      :done="step > STEP_EDITOR"
      :header-nav="step > STEP_EDITOR"
    >
      <div class="flex">
        <span class="q-mr-xs"> Choose your language then copy and paste your code in the following text area</span>
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
        <div class="col-12">
          <q-tabs
            v-model="csMethodeTab"
            dense
            no-caps
            indicator-color="primary"
            inline-label
            align="left"
            :breakpoint="0"
          >
            <q-tab name="ide" icon="code" label="Online Editor"/>
            <q-tab name="file" icon="upload_file" label="Upload File"/>
          </q-tabs>
        </div>
        <div class="col-12">
        <q-tab-panels v-model="csMethodeTab" animated class="transparent">
          <q-tab-panel name="ide">
            <codemirror :options="getCodeMirrorOption(selectedLanguage)" ref="textarea" type="textarea" id="editor" outlined v-model="newProgram.code"/>
          </q-tab-panel>
          <q-tab-panel name="file">
            <q-file v-model="newProgram.file" label="Your program file" accept=".py" counter outlined>
            <template v-slot:prepend>
              <q-icon name="upload_file" />
            </template>
          </q-file>
          </q-tab-panel>
        </q-tab-panels>
        </div>
      </div>

      <q-stepper-navigation>
        <q-btn :loading="loading" @click="importCode()" :disable="!selectedLanguage.available" color="primary" label="Use this code"/>
      </q-stepper-navigation>
    </q-step>
    <q-step
      :name="STEP_DONE"
      title="Settings"
      icon="settings"
      :done="step > STEP_DONE"
      :header-nav="step > STEP_DONE"
    >
    <div class="row q-gutter-md q-mt-md">
        <div class="col-12">
            <q-input v-model="newProgram.entrypoint" label="Your entrypoint"
            stack-label standout class="q-my-sm" />
        </div>
        <div class="col-12">
            <q-input v-model="newProgram.metadata.name" label="Name your VM"
            stack-label standout class="q-my-sm" />
        </div>
        <div class="col-12">
            <q-input v-model="newProgram.refRuntime" label="Ref of runtime"
            stack-label standout class="q-my-sm" />
        </div>
        <div class="col-12">
          <q-btn class="q-mr-xs" @click="addVolume(false)" icon="add" outline color="primary" label="Add Volume"/>
          <q-btn @click="addVolume(true)" icon="add" outline color="primary" label="Add Persistent Volume"/>
        </div>
        <q-card class="col-12 q-pa-sm" v-for="volume in newProgram.volumes" :key="volume.id">
          <div class="q-ml-sm">
            <div class="text-h6">{{volume.isPersistent ? 'Persistent Volume' : 'Volume'}}</div>
          </div>
          <div class="col-12">
            <q-input v-model="volume.comment" placeholder="Basic description of your volume" label="Description"
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
            <q-radio v-model="volume.use_latest" :val="true" label="Yes" />
            <q-radio v-model="volume.use_latest" :val="false" label="No" />
          </div>
          <div v-show="volume.isPersistent">
            <q-input v-model="volume.name" label="Volume name"
              stack-label standout class="q-my-sm" />
          </div>
          <div v-show="volume.isPersistent">
            <q-input v-model="volume.size_mib" label="Size (MiB)"
              stack-label standout class="q-my-sm" />
          </div>
          <q-card-actions align="right">
            <q-btn @click="deleteVolume(volume)" color="red" label="Delete" class="q-ml-sm" />
          </q-card-actions>
        </q-card>
      </div>
      <q-stepper-navigation>
        <q-btn :loading="loading" color="primary" label="Deploy" @click="deploy()"/>
        <q-btn flat @click="backStep(STEP_EDITOR)" color="primary" label="Back" class="q-ml-sm" />
      </q-stepper-navigation>
    </q-step>
  </q-stepper>
</template>

<script>
/* eslint new-cap: ["error", { "newIsCap": false }] */

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/blackboard.css'
import 'codemirror/theme/lucario.css'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/javascript/javascript.js'
const shajs = require('sha.js')
import JSZip from 'jszip'
import { store, broadcast, storage_push, ipfs_push, nuls, nuls2, ethereum } from 'aleph-js'

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  name: 'create-new-vm',
  props: ['account', 'api_server'],
  components: {
    codemirror
  },
  data () {
    return {
      STEP_DONE: 2,
      STEP_EDITOR: 1,
      csMethodeTab: 'ide',
      loading: false,
      exportFile: null,
      newProgram: {
        metadata: {
          name: 'My program'
        },
        isFile: false,
        file: null,
        entrypoint: 'app',
        filename: 'main',
        code: `from fastapi import FastAPI
app = FastAPI()
@app.get("/")
async def root():
  return {"message": "Hello World"}`,
        refRuntime: 'bd79839bf96e595a06da5ac0b6ba51dea6f7e2591bb913deccded04d831d29f4',
        volumes: []
      },
      languages: [
        { label: 'Python 3', value: 'python', available: true, code: '' },
        { label: 'Javascript', value: 'javascript', available: false, code: 'console.log("coming soon")' }
      ],
      selectedLanguage: { label: 'Python 3', value: 'python', available: true },
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

    getCodeMirrorOption (selectedLanguage) {
      var cmOption = {
        tabSize: 4,
        mode: `${selectedLanguage.value}`,
        line: true,
        theme: this.$q.dark.isActive ? 'blackboard' : 'lucario',
        readOnly: !selectedLanguage.available,
        value: this.newProgram.code
      }
      if (selectedLanguage.code !== 'undefined') {
        cmOption.value = selectedLanguage.code
      }
      return cmOption
    },

    addVolume (isPersistent) {
      if (isPersistent) {
        this.newProgram.volumes.push({
          id: (Math.random() + 1).toString(36).substring(7),
          comment: '',
          isPersistent: true,
          persistence: 'host'
        })
      } else {
        this.newProgram.volumes.push({
          id: (Math.random() + 1).toString(36).substring(7),
          comment: '',
          isPersistent: false,
          use_latest: false
        })
      }
    },
    deleteVolume (volume) {
      this.newProgram.volumes.splice(this.newProgram.volumes.findIndex(v => v.id === volume.id), 1)
    },
    backStep (step) {
      this.step = step
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
      this.loading = true
      const zip = new JSZip()

      if (this.csMethodeTab === 'ide') {
        zip.file('main.py', this.newProgram.code)
      } else if (this.csMethodeTab === 'file') {
        zip.file('main.py', this.newProgram.file)
      }
      this.exportFile = await zip.generateAsync({ type: 'blob' })

      this.step = this.STEP_DONE
      this.loading = false
    },
    async send (message) {
      if (this.account.type === 'ETH') {
        message = await ethereum.sign(this.account, message)
      } else if (this.account.type === 'NULS') {
        message = await nuls.sign(Buffer.from(this.account.private_key, 'hex'), message)
      } else if (this.account.type === 'NULS2') {
        message = await nuls2.sign(this.account, message)
      }

      await broadcast(message, { api_server: this.api_server })
    },
    async deploy () {
      this.loading = true
      let storeMessage = await store.submit(
        this.account.address,
        {
          chain: 'ETH',
          sender: this.account.address,
          account: this.account,
          channel: 'TEST',
          fileobject: this.exportFile,
          api_server: this.api_server
        }
      ).catch((response) => {
        this.loading = false
      })

      let item_hash = storeMessage.item_hash

      let message = {
        chain: 'ETH',
        time: parseInt(Date.now() / 1000),
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
        time: parseInt(Date.now() / 1000),
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
          entrypoint: `${this.newProgram.filename}:${this.newProgram.entrypoint}`,
          ref: item_hash,
          use_latest: true
        },
        on: {
          http: true
        },
        metadata: this.newProgram.metadata,
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

      await this.putContent(message, store_content, true, 'storage', 'https://api2.aleph.im').catch((response) => {
        this.loading = false
      })

      await sleep(1000)

      await this.send(message).catch((response) => {
        this.loading = false
      })

      this.$emit('created', false)
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.nftcard {
  width: 900px !important;
  max-width: 80vw !important;
}

.body--dark {
  .nftcard {
    background: #1d262e;
    border: none;
  }

  .q-stepper {
    background: #1d262e;
    .q-stepper__tab--active, .q-stepper__tab--done {
      color: white;
    }
  }
}
</style>
