<template>
  <div class="action-container">
    <!--    <div class="action">-->
    <!--      <div class="action-type btn"-->
    <!--           v-show="isAction">-->
    <!--          <span @click="action('check')"-->
    <!--                v-show="showActionBtn('check')">check</span>-->
    <!--        <span @click="action('fold')">fold</span>-->
    <!--        <span @click="action('call')"-->
    <!--              v-show="showActionBtn('call')">call</span>-->
    <!--        <span @click="isRaise = true">raise</span>-->
    <!--      </div>-->
    <!--      <div class="raise-size"-->
    <!--           v-show="isRaise">-->
    <!--        <div class="not-allin"-->
    <!--             v-show="showActionBtn('raise')">-->
    <!--          <i @click="raise(pot / 3)">1/3 pot</i>-->
    <!--          <i @click="raise(pot / 2)">1/2 pot</i>-->
    <!--          <i @click="raise(pot / 4)">3/4 pot</i>-->
    <!--          <i @click="raise(pot)">1 pot</i>-->
    <!--          <i @click="raise(pot * 2)">2 pot</i>-->
    <!--          <i @click="raise(pot * 3)">3 pot</i>-->
    <!--        </div>-->
    <!--        <i @click="action('allin')">allin</i>-->
    <!--      </div>-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class Card extends Vue {
  @Prop() private isAction: boolean = false;
  private isRaise = false;

  private raise(size: number) {
    this.action(`raise:${size}`);
  }

  private action(command: string) {
    this.$emit('action', {command});
    this.isAction = false;
    this.isRaise = false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .action-container {
  }
</style>
