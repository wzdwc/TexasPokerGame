<template>
  <div :class="classNames">
    <slot />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component
export default class Animation extends Vue {
  public expose = ['applyAnimation'];
  @Prop() private animationName!: string;

  private classNames = '';

  public applyAnimation() {
    this.classNames = '';
    setTimeout(() => {
      if (this.animationName) {
        this.classNames = `animate__animated animate__${this.animationName}`;
      }
    }, 50);
  }

  @Watch('animationName')
  private watchAnimationName() {
    this.applyAnimation();
  }

  private mounted() {
    this.applyAnimation();
  }
}
</script>
