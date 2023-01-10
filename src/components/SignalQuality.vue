<template>
    <div :class="'signal_quality_wrapper ' + quality_text[quality]">
        <div v-for="(threshold, i) in thresholds" :class="score > threshold ? 'signal_bar active' : 'signal_bar'" :key="i" />
        <div v-if="quality === 0" class="bad_quality">x</div>
        <slot></slot>
    </div>
</template>

<script>
import { scaleNodeQuality } from '../helpers/utilities'

export default {
  name: 'signal-quality',
  props: {
    score: Number
  },
  data: function () {
    return {
      thresholds: [0, 0.5, 0.85]
    }
  },
  computed: {
    quality () { return scaleNodeQuality(this.score, this.thresholds) },
    quality_text () { return ['none', 'bad', 'avg', 'good'] }
  }
}
</script>

<style lang="scss">
.signal_quality_wrapper{
    display: flex;
    align-items: baseline;
    margin: auto;
    width: fit-content;
    position: relative;

    &.good .signal_bar.active{
        background-color: var(--q-color-positive);
    }
    &.avg .signal_bar.active{
        background-color: yellow;
    }
    &.bad .signal_bar.active{
        background-color: var(--q-color-negative);
    }

    .signal_bar{
        width: 5px;
        margin: 0 1px;
        background-color: #FFFFFF33;
        border-radius: 2px;
    }

    .signal_bar:nth-child(1){
        height: 8px;
    }

    .signal_bar:nth-child(2){
        height: 12px;
    }

    .signal_bar:nth-child(3){
        height: 16px;
    }

    .bad_quality{
        position: relative;
        left: -5px;
        color: var(--q-color-negative);
        font-weight: bold;
        font-size: 13px;
    }
}
</style>
