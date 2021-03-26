<template>
  <q-page class="q-pa-md">
    <div v-if="post">
      <div class="q-ma-md">
        <div class="text-h6">{{metadata.name.substring(0, 100)}}</div>
        <div class="text-subtitle2">
          Snapshot from {{new Date(post.time*1000).toLocaleDateString()}}
        </div>
      </div>
      <div class="row q-gutter-md">
        <div class="col-sm-4">
          <q-list>
            <q-item v-if="metadata.animation_url"  class="standout">
              <q-item-section>
                <q-item-label caption>Animation</q-item-label>
                <video :src="metadata.animation_url.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" controls autoplay loop />
              </q-item-section>
            </q-item>
            <q-item v-else-if="metadata.image"  class="standout">
              <q-item-section>
                <q-item-label caption>Image</q-item-label>
                <img :src="metadata.image.replace('ipfs://', 'https://ipfs.io/')" class="full-width q-my-sm" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-sm-7">
          <q-list>
            <q-item class="standout" v-if="metadata.name">
              <q-item-section>
                <q-item-label caption>Name</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{metadata.name}}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="metadata.description"  class="standout">
              <q-item-section>
                <q-item-label caption>Description</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{metadata.description}}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-if="metadata.tags"  class="standout">
              <q-item-section>
                <q-item-label caption>Tags</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  <q-badge v-for="tag of metadata.tags" :key="tag" color="aleph-radial" class="q-ml-sm q-mt-sm">
                    {{tag}}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="standout" v-if="metadata.external_url && (!metadata.external_url.includes('javascript'))">
              <q-item-section>
                <q-item-label caption>External URL</q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  <a :href="metadata.external_url" class="text-white">{{metadata.external_url}}</a>
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-item class="standout" v-if="metadata.attributes && metadata.attributes.length">
              <q-item-section>
                <q-item-label caption>Attributes</q-item-label>
                <q-table :data="metadata.attributes" class="full-width">
                </q-table>
              </q-item-section>
            </q-item>
            <q-item-label header  v-if="extra_fields.length">Custom fields</q-item-label>
            <q-item v-for="field_info of extra_fields" :key="field_info[0]" class="standout">
              <q-item-section>
                <q-item-label caption>
                  {{field_info[0]}}
                </q-item-label>
                <q-item-label class="text-body2 overflow-hidden">
                  {{field_info[1]}}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { posts } from 'aleph-js'
export default {
  computed: {
    metadata () {
      if (this.post === null) { return {} }
      return this.post.content.metadata
    },
    extra_fields () {
      const handled_fields = [
        'name',
        'description',
        'tags',
        'external_url',
        'attributes',
        'image',
        'animation_url'
      ]
      return Object.entries(this.metadata).filter(
        v => !handled_fields.includes(v[0])
      )
    }
  },
  data () {
    return {
      post: null
    }
  },
  props: [
    'hash'
  ],
  methods: {
    async update () {
      let result = await posts.get_posts('nft-snapshot', {
        api_server: this.api_server,
        hashes: [this.hash]
      })

      if (result.posts.length) {
        this.post = result.posts[0]
      } else {
        this.post = null
      }
    }
  },
  mounted () {
    this.update()
  },
  watch: {
    hash () {
      this.update()
    }
  }
}
</script>

<style lang="scss">

</style>
