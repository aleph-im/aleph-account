<template>
  <div>
    <q-dialog v-model="registration_modal_open">
      <q-card class="bg-dark-60 q-pa-md">
        <q-card-section>
          <div class="text-h5 text-center text-weight-bold">Redirected to registration</div>
        </q-card-section>

        <q-card-section class="text-center">
          <q-icon name="gpp_maybe" color="warning" size="5rem" />
        </q-card-section>

        <q-card-section>
          You will be redirected away from our application. <br />
          Make sure to trust the node operator before preceding.
        </q-card-section>

        <q-card-section>
          <q-btn color="primary" class="full-width q-pa-sm text-weight-bold" rel="noopener noreferrer" target="_blank" @click="close_registration_modal()" :href="registration_modal_url">
              Yes, I'm sure to proceed
          </q-btn>
        </q-card-section>

        <div style="text-align:center;text-decoration: underline;margin:-5px 0 15px 0">
          <a @click="close_registration_modal()" style="cursor:pointer" class="text-grey">Cancel</a>
        </div>
      </q-card>
    </q-dialog>

    <q-table
    :title="title"
    :data="values"
    :columns="columns"
    :pagination="pagination"
    :filter="filter"
    :rows-per-page-options="[0]"
    row-key="hash"
    flat
    class="bg-transparent"
    :hide-bottom="!showFooter"
    :dense="$q.screen.lt.md"
    :visible-columns="visible_columns"
    >
      <template v-slot:top-right>
        <span class="row" v-if="showHeader">
          <q-input standout dense debounce="300" v-model="filter" placeholder="search nodes">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </span>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="state" :props="props">
            <q-tooltip :content-style="`background-color: ${!props?.row?.score?.total_score ? '#FD686A' : ''}`">
              <div style="font-size:larger">
                <div>
                  <strong v-if="!props?.row?.score">This node is unreachable</strong>
                  <strong v-else-if="props?.row?.score?.version === 0">This node runs an unknown or obsolete version</strong>
                </div>

                <div>
                  <strong v-if="props?.row?.score?.total_score >= 0.8">This node has no reward penalty</strong>
                  <strong v-else-if="props?.row?.score?.total_score >= 0.4">This node has a slight reward penalty</strong>
                  <strong v-else-if="props?.row?.score?.total_score >= 0.2">This node has a huge reward penalty</strong>
                  <strong v-else>This node does not get any reward</strong>
                </div>

                <div v-if="props.row?.metrics && props.row?.score" class="q-pt-sm">
                  <div>ASN: <strong>{{ props.row?.metrics?.as_name }}</strong></div>
                  <div>({{ props.row?.score?.measurements?.nodes_with_identical_asn }} nodes on this ASN)</div>
                  <div v-if="coreNodeMode" class="q-pt-sm">
                    <div>Base latency: <strong>{{ display_percentage(props.row.metrics?.base_latency) }}</strong></div>
                    <div>Aggregate latency: <strong>{{ display_percentage(props.row.metrics?.aggregate_latency) }}</strong></div>
                    <div>File download latency: <strong>{{ display_percentage(props.row.metrics?.file_download_latency) }}</strong></div>
                    <div>Metrics latency: <strong>{{ display_percentage(props.row.metrics?.metrics_latency) }}</strong></div>
                    <div>Eth height remaining: <strong>{{ props.row.metrics?.eth_height_remaining }}</strong></div>
                  </div>

                  <div class="q-pt-sm">
                    last check: {{ display_date(props.row?.metrics?.measured_at) }}
                  </div>
                </div>
              </div>
            </q-tooltip>

            <div class="row items-center">
              <div class="status-pill big q-mr-sm" :style="'background:' + get_color_from_percentage(props.row?.score?.total_score)" />

              <div class="text-weight-bold">
                <span>{{ display_percentage(props.row?.score?.total_score) }}</span>
              </div>
            </div>
          </q-td>
          <q-td key="picture" :props="props" style="font-size: 2.5em; padding-right: 0;">
            <q-icon v-if="props.row.picture" :name="`img:${api_server}/api/v0/storage/raw/${props.row.picture}`" class="rounded-borders" />
          </q-td>
          <q-td key="name" :props="props">
            <div>
              <q-badge rounded color="negative" class="q-pl-sm q-pr-sm" v-if="!is_node_uptodate(props.row, coreNodeMode) && is_my_node(props.row)">
                <q-icon name="gpp_maybe" color="white" class="q-pr-sm" />
                Outdated node version
                <q-tooltip>
                  <div>
                    You are on version <strong>{{ props.row?.metrics?.version }}</strong>
                  </div>
                  <div>
                    Latest version is <strong>
                      {{ coreNodeMode ? latest_releases['ccn'].latest : latest_releases['crn'].latest }}
                    </strong>
                  </div>
                  <div>Please update soon</div>
                </q-tooltip>
              </q-badge>
            </div>
            <span class="text-grey text-weight-light">{{coreNodeMode ? 'CCN-ID' : 'CRN-ID'}} </span> <strong>{{ props.row.hash.slice(-10) }}</strong>
            <br />
            <q-icon name="lock" v-if="props.row.locked">
              <q-tooltip>
                No staker can join this node.
              </q-tooltip>
            </q-icon>
            {{ props.row.name.substring(0, 30) }}
            <div class="lt-sm" v-if="coreNodeMode">
              <span class="text-weight-bold">
                {{ (props.row.total_staked/1000).toFixed(0) }}k
              </span>
              <span class="text-weight-medium text-grey" v-if="props.row.total_staked < 500000">
                of 500k
              </span>
              <span class="text-weight-medium text-grey" v-else>
                staked
              </span>
            </div>
          </q-td>
          <q-td key="total_staked" :props="props" width="200">
            <div class="row justify-between">
              <span>
                <span class="text-weight-bold">
                  {{ (props.row.total_staked/1000).toFixed(0) }}k
                </span>
                <span class="text-weight-medium text-grey" v-if="props.row.total_staked < 500000">
                  of 500k
                </span>
                <span class="text-weight-medium text-grey" v-else>
                  staked
                </span>
              </span>
              <span style="text-transform: capitalize;" class="text-weight-medium">{{ props.row.status }}</span>
            </div>
            <q-linear-progress rounded size="5px"
            :color="props.row.status === 'active' ? 'positive': 'inactive'"
            :value="props.row.total_staked > 500000 ? 1.0 : props.row.total_staked/500000"
            class="q-my-sm">
            </q-linear-progress>
            <!-- <div class="posbadge" :style="`margin-left: calc(${(props.row.total_staked > 450000 ? 1.0 : props.row.total_staked/500000)*80}% - 16px)`">
              <q-badge :color="props.row.status === 'active' ? 'positive': 'inactive'"
                        text-color="white"
                        :label="(props.row.total_staked > 500000 ? '+' : '') + ((props.row.total_staked - 500000)/1000).toFixed(0) + 'k'" />
            </div> -->
          </q-td>
          <q-td key="linked" :props="props">
            <div v-if="!coreNodeMode">
              <span v-if="props.row.parent === null">Unlinked</span>
              <core-node-name :node-hash="props.row.parent" node-type="core" v-else />
            </div>
            <div v-else-if="props.row.resource_nodes !== undefined">
              <div class="row justify-end">
                {{props.row.resource_nodes.length}} linked
              </div>
              <div class="row justify-end">
                <span v-for="(_dot, i) in dots"
                      class="dot q-mr-sm" :class="props.row.resource_nodes.at(i) !== undefined ? 'green' : ''"
                      :key="i" />
              </div>
            </div>
          </q-td>
          <q-td key="decentralization" v-if="!coreNodeMode" :props="props">
            <span v-for="(_dot, i) in new Array(normalize_decentralization(props.row))"
                  class="dot q-mr-sm"
                  :key="i" />
          </q-td>
          <q-td key="time" :props="props">
            {{ new Date(props.row.time*1000).toLocaleDateString() }}
          </q-td>
          <q-td key="version" :props="props">
            <div :style="`color: ${is_node_uptodate(props.row, coreNodeMode) && !is_node_experimental(props.row, coreNodeMode) ? '#1CC272' : is_node_outdated(props.row, coreNodeMode) || is_node_experimental(props.row, coreNodeMode) ? '#FABE23' : '#FD686A'}`">
              <strong>
                {{ props.row?.metrics?.version || '-' }}
              </strong>
            </div>
            <small>
              <template v-if="is_node_latest(props.row, coreNodeMode)">(latest)</template>
              <template v-else-if="is_node_prerelease(props.row, coreNodeMode)">(prerelease)</template>
              <template v-else-if="is_node_experimental(props.row, coreNodeMode)">(experimental)</template>
              <template v-else-if="is_node_outdated(props.row, coreNodeMode)">(outdated)</template>
              <template v-else>(obsolete)</template>
            </small>
          </q-td>
          <q-td key="est_apy" :props="props">
            <template v-if="coreNodeMode">
              <template v-if="is_my_node(props.row)">
                <div class="row items-center">
                  <div class="text-bold q-mr-sm">{{ compute_ccn_rewards(props.row) }}</div>
                  <img v-if="!$q.dark.isActive" src="~/assets/logo-blue.svg" height="16" class="vertical-middle q-pb-xs">
                  <img v-if="$q.dark.isActive" src="~/assets/logo-white.svg" height="16" class="vertical-middle q-pb-xs">
                  &nbsp;/&nbsp;mo
                </div>
              </template>
              <template v-else>
                <q-tooltip v-if="props.row?.resource_nodes.length < 3">
                  <div>{{ 3 - props.row?.resource_nodes.length }} missing CRN</div>
                  <div>Link 3 CRN to that Node to maximise its rewards</div>
                </q-tooltip>
                <q-icon name="warning" style="color: #FD686A" v-if="props.row?.resource_nodes.length < 3" />
                {{ compute_estimated_stakers_apy(props.row) }}
              </template>
            </template>
            <template v-else>
              <div class="row items-center justify-end">
                <div class="text-bold q-mr-sm">{{ compute_crn_rewards(props.row) }}</div>
                <img v-if="!$q.dark.isActive" src="~/assets/logo-blue.svg" height="16" class="vertical-middle q-pb-xs">
                <img v-if="$q.dark.isActive" src="~/assets/logo-white.svg" height="16" class="vertical-middle q-pb-xs">
                &nbsp;/&nbsp;mo
              </div>
            </template>
          </q-td>
          <q-td key="actions" :props="props">
            <span class="q-pa-xs block" v-if="user_stakes.indexOf(props.row) >= 0">
              {{ props.row.stakers[account.address].toFixed(2) }}
              <img v-if="!$q.dark.isActive" src="~/assets/logo-blue.svg" height="14" class="vertical-middle q-pb-xs">
              <img v-if="$q.dark.isActive" src="~/assets/logo-white.svg" height="14" class="vertical-middle q-pb-xs">
            </span>

            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-if="account&&(account.address == props.row.owner)" type="a"
            @click="$emit('node-action', 'drop-node', props.row.hash)">drop node</q-btn>

            <q-btn size="sm" :loading="loading==props.row.hash" color="warning" text-color="black"
            v-else-if="account&&user_stakes&&(user_stakes.indexOf(props.row) >= 0)" type="a"
            @click="$emit('node-action', 'unstake', props.row.hash)">unstake</q-btn>

            <template v-else-if="coreNodeMode">
              <template v-if="is_kyc_required(props.row) && !is_kyc_cleared(props.row)">
                <q-btn size="sm" :loading="loading==props.row.hash" color="primary" type="a"
                 :disabled="!is_stakeable(props.row)" outline
                 @click="account && open_registration_modal(props.row.registration_url)">
                <q-tooltip>
                  {{
                    is_stakeable(props.row) ? 'This node requires KYC authentication'
                    : !account ? 'You should be logged in to register'
                    : 'This nodes has too many stakers'
                  }}
                </q-tooltip>
                register
                </q-btn>
              </template>

              <template v-else>
                <q-btn size="sm" :loading="loading==props.row.hash" color="primary" type="a"
                 :disabled="is_locked(props.row) || !is_stakeable(props.row)" outline
                 @click="$emit('node-action', 'stake-split', props.row.hash)">
                <q-tooltip>{{stake_tooltip(props.row)}}</q-tooltip>
                stake
                </q-btn>
            </template>
          </template>

            <!-- Unlink if user is the core owner or (core owner and compute owner) -->
            <q-btn size="sm" v-if="(!coreNodeMode)&&account&&user_node&&(user_node.hash === props.row.parent)" color="primary" outline class="q-ml-sm" type="a"
            @click="$emit('node-action', 'unlink', props.row.hash)">Unlink</q-btn>
            <!-- Unlink button if user is the compute owner but linked a compute -->
            <q-btn size="sm" v-else-if="(!coreNodeMode)&&account&&(account.address == props.row.owner)&&(props.row.parent !== null)" color="primary" outline class="q-ml-sm" type="a"
            @click="$emit('node-action', 'unlink', props.row.hash)">Unlink</q-btn>

            <q-btn size="sm" v-if="!coreNodeMode&&account&&user_node&&(props.row.parent===null)" color="primary" outline class="q-ml-sm" type="a"
            @click="$emit('node-action', 'link', props.row.hash)" :disabled="Boolean(props.row.locked|(user_node&&(user_node.resource_nodes.length>=3)))">Link</q-btn>
            <q-btn size="sm" :color="is_editable(props.row) ? 'secondary' : 'primary'" outline class="q-ml-sm" type="a"
            @click="$emit('node-info', props.row)">
            {{
              is_editable(props.row) ? 'edit' : 'info'
            }}
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CoreNodeName from './CoreNodeName'
import { normalizeValue, nullButNot0, stripExtraTagDescription } from '../helpers/utilities'

export default {
  name: 'nodes-table',
  computed: {
    visible_columns () {
      if (this.$q.screen.lt.sm) {
        return [
          'state',
          'picture',
          'name',
          'actions'
        ]
      } else {
        if (this.coreNodeMode) {
          return [
            'state',
            'picture',
            'name',
            'total_staked',
            'linked',
            'time',
            'version',
            'est_apy',
            'actions'
          ]
        } else {
          return [
            'state',
            'picture',
            'name',
            'decentralization',
            'linked',
            'time',
            'version',
            'est_apy',
            'actions'
          ]
        }
      }
    },
    ...mapState({
      account: (state) => state.account,
      channel: (state) => state.channel,
      api_server: (state) => state.api_server,
      tags: (state) => state.tags,
      node_post_type: (state) => state.node_post_type,
      balance_info: (state) => state.balance_info,
      latest_releases: (state) => state.github_releases_metadata,
      active_nodes: (state) => state.nodes.filter((node) => node.status === 'active').length,
      total_staked_in_active: (state) => state.nodes.reduce(
        (prev, cur) => prev + (cur.status === 'active' ? cur.total_staked : 0), 0
      )
    })
  },
  components: {
    CoreNodeName
  },
  props: [
    'values',
    'title',
    'user_node',
    'user_stakes',
    'loading',
    'showHeader',
    'showFooter',
    'coreNodeMode'
  ],
  data () {
    return {
      filter: '',
      tab: 'all_nodes',
      registration_modal_url: null,
      registration_modal_open: false,
      dots: new Array(3),
      pagination: {
        sortBy: 'state',
        descending: true
      },
      columns: [
        {
          name: 'state',
          label: 'Score',
          field: props => props?.score?.total_score || 0,
          align: 'left',
          sortable: true
        },
        {
          name: 'picture'
        },
        {
          name: 'name',
          required: true,
          label: 'Name',
          align: 'left',
          field: props => props.hash + ' ' + props.name,
          sortable: true
        },
        {
          name: 'total_staked',
          label: 'Staked',
          field: 'total_staked',
          align: 'left',
          sortable: true
        },
        {
          name: 'linked',
          label: 'Linked',
          align: 'right',
          field: props => props.parent
        },
        {
          name: 'decentralization',
          label: 'Decentralization',
          field: props => props?.score?.decentralization || 0,
          sortable: true,
          align: 'right'
        },
        {
          name: 'time',
          label: 'Creation Date',
          field: 'time',
          align: 'right'
        },
        {
          name: 'version',
          label: 'Version',
          field: props => props?.metrics?.version || '0.0.0',
          sortable: true,
          align: 'right'
        },
        {
          name: 'est_apy',
          label: !this.coreNodeMode ? 'Est. rewards' : (this.title === 'My Nodes') ? 'Est. Rewards/APY' : 'Est. Staking APY',
          field: props => this.coreNodeMode ? this.compute_estimated_stakers_apy(props) : this.compute_crn_rewards(props),
          sortable: true,
          align: 'right'
        },
        {
          name: 'actions',
          label: '',
          align: 'right'
        }
      ]
    }
  },
  methods: {
    stake_tooltip (node) {
      if (!this.account) {
        return 'Please login'
      } else if (!(this.balance_info && (this.balance_info.ALEPH >= 10000))) {
        return 'You need at least 10000 ALEPH to stake'
      } else if (this.user_node) {
        return 'You can\'t stake while you operate a node'
      } else if (node.locked) {
        return 'This node is locked'
      } else if (node.total_staked >= 750000) {
        return 'Too many ALEPH staked on that node'
      } else if (this.user_stakes.length) {
        return 'Add this node to your staking (each node will have an equal part of your total balance staked)'
      } else {
        return `Stake ${this.balance_info.ALEPH.toFixed(2)} ALEPH in this node`
      }
    },
    get_node_type (isCCN) {
      return isCCN ? 'ccn' : 'crn'
    },
    is_my_node (node) {
      return this.account && this.account === node.owner
    },
    is_node_latest (node, nodeType) {
      return node?.metrics?.version === this.latest_releases[this.get_node_type(nodeType)].latest
    },
    is_node_prerelease (node, nodeType) {
      return node?.metrics?.version === this.latest_releases[this.get_node_type(nodeType)].prerelease
    },
    is_node_experimental (node, nodeType) {
      const closestTag = stripExtraTagDescription(node?.metrics?.version || '')

      return closestTag !== node?.metrics?.version && closestTag === this.latest_releases[this.get_node_type(nodeType)].prerelease
    },
    is_node_uptodate (node, nodeType) {
      return this.is_node_latest(node, nodeType) || this.is_node_prerelease(node, nodeType) || this.is_node_experimental(node, nodeType)
    },
    is_node_outdated (node, nodeType) {
      return this.latest_releases[this.get_node_type(nodeType)].outdated.includes(node?.metrics?.version)
    },
    is_node_obsolete (node, nodeType) {
      return !this.is_node_latest(node, nodeType) &&
        !this.is_node_prerelease(node, nodeType) &&
        !this.is_node_outdated(node, nodeType)
    },
    total_per_day () {
      return 15000 * ((Math.log10(this.active_nodes) + 1) / 3)
    },
    total_per_aleph_per_day () {
      return this.total_per_day() / this.total_staked_in_active
    },
    current_apy () {
      return (((1 + this.total_per_aleph_per_day()) ** 365) - 1)
    },
    display_percentage (value) {
      if (nullButNot0(value)) { return 'n/a' }

      return Number(Number(value) * 100).toFixed(1) + '%'
    },
    display_date (value) {
      if (!value) { return 'n/a' }

      const [date, time] = new Date(value * 1000).toISOString().split('T')
      return `${date} (${time.split('.')[0]})`
    },
    compute_estimated_stakers_apy (node) {
      let est_apy = 0
      if (node?.score?.total_score) {
        let linkedCRN = node.resource_nodes.length
        if (linkedCRN > 3) {
          linkedCRN = 3
        }
        const normalizedScore = normalizeValue(node?.score?.total_score, 0.2, 0.8, 0, 1)
        const linkedCRNPenalty = (3 - linkedCRN) / 10

        est_apy = (this.current_apy() * normalizedScore * (1 - linkedCRNPenalty)) * 100
      }
      return '~ ' + est_apy.toFixed(2) + '%'
    },
    compute_ccn_rewards (node) {
      let est_rewards = 0
      if (node?.score?.total_score) {
        let linkedCRN = node.resource_nodes.length
        if (linkedCRN > 3) {
          linkedCRN = 3
        }
        const pool = 15_000 / this.active_nodes
        const normalizedScore = normalizeValue(node?.score?.total_score, 0.2, 0.8, 0, 1)
        const linkedCRNPenalty = (3 - linkedCRN) / 10

        est_rewards = pool * normalizedScore * (1 - linkedCRNPenalty)
      }
      return '~ ' + est_rewards.toFixed(2)
    },
    compute_crn_rewards (node) {
      if (!node?.score?.total_score || !node?.score?.decentralization) return 0
      const { decentralization, total_score } = node.score
      const maxRewards = 500 + decentralization * 2500

      return '~' + (maxRewards * normalizeValue(total_score, 0.2, 0.8, 0, 1)).toFixed(2)
    },
    normalize_decentralization (node) {
      const decentralization = node?.score?.decentralization
      if (!decentralization) return 0

      return [0.3, 0.6, 0.9].findIndex(x => x >= decentralization) + 1
    },
    get_color_from_percentage (percent) {
      if (!percent) { return '#FFFFFF77' }
      const colors = [
        [0.8, '#1CC272'],
        [0.5, '#FABE23'],
        [0.2, '#FD686A']
      ]

      for (const [min, color] of colors) {
        if (percent >= min) {
          return color
        }
      }
      return colors[colors.length - 1][1]
    },
    open_registration_modal (url) {
      // [^-A-Za-z0-9+&@#/%?=~_|!:,.;\(\)] returns a linter error
      const sanitized = url.replace(/[^-A-Za-z0-9+&@#/%?=~_|!:,.;]/gi, '')
        .replace('(', '')
        .replace(')', '')
      this.registration_modal_url = sanitized
      this.registration_modal_open = true
    },
    close_registration_modal () {
      this.registration_modal_url = null
      this.registration_modal_open = false
    },
    is_stakeable (node) {
      return (
        this.account &&
        node.total_staked < 750_000 &&
        !this.user_node &&
        this.balance_info?.ALEPH >= 10_000
      )
    },

    is_kyc_required (node) {
      return node.registration_url !== undefined && node.registration_url !== ''
    },

    is_editable (node) {
      return this.account && (node.owner === this.account.address || node.manager === this.account.address)
    },

    is_kyc_cleared (node) {
      return this.account && node.authorized?.includes(this.account.address)
    },

    is_locked (node) {
      if (node.locked) {
        if (this.is_kyc_required(node) && this.is_kyc_cleared(node)) {
          return false
        }
        return true
      }

      return false
    }

  }
}
</script>

<style lang="scss">
.q-table tbody td {
  font-size: 12px;
  line-height: 28px;
}

.body--dark {
  .q-table tbody td {
    .q-btn.q-btn--outline {
      .q-btn__content {
        color: #fff;
      }
    }
  }
}

.dot {
  height: 5px;
  width: 5px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}

.dot.green {
  background-color: #1CC272;
}

.bad_metrics_reason{
  font-weight: bold;
}
</style>
