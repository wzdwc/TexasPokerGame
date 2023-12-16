<template>
  <div class="container">
    <div class="common-card-container">
      <cardList :card-list="commonCardMap" :value-cards="valueCards"></cardList>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import cardList from './CardList.vue';

@Component({
  components: {
    cardList,
  },
})
export default class CommonCard extends Vue {
  @Prop() private commonCard: any;
  @Prop() private valueCards!: string[];

  get commonCardMap() {
    const arr = [];
    if (this.commonCard.length !== 0) {
      for (let i = 0; i < 5; i++) {
        if (this.commonCard[i]) {
          arr.push(this.commonCard[i]);
        } else {
          arr.push('');
        }
      }
    }
    return arr;
  }
}
</script>
