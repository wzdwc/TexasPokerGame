y
<template>
  <div class="sit-list-container">
    <div class="sit-list">
      <div
        class="sit"
        v-for="(sit, key) in sitList"
        :key="key"
        @click="sitDown(sit)"
      >
        <div class="default" v-show="!sit.player">
          <i>sit</i>
        </div>
        <div class="sit-player" v-if="sit.player">
          <div class="player">
            <div class="user-name" v-show="sit.player.nickName">
              {{ sit.player.nickName }}
            </div>
            <div class="icon iconfont icon-user-avatar"></div>
            <div class="counter" v-show="sit.player.counter">
              {{ sit.player.counter }}
            </div>
            <div class="action-size" v-show="sit.player.actionSize">
              {{ sit.player.actionSize }}
            </div>
            <div class="action-command" v-show="sit.player.actionCommand">
              {{ sit.player.actionCommand }}
            </div>
            <div class="type" v-show="sit.player.type">
              {{ sit.player.type }}
            </div>
            <div class="hand-card" v-show="sit.player.handCard">
              {{ sit.player.handCard }}
            </div>
          </div>
          <div class="cards" v-show="sit.player.userId === currPlayer.userId">
            <div class="hand-card">
              <cardList :cardList="handCard"></cardList>
            </div>
            <div class="ready" v-show="handCard.length === 0">ready</div>
            <div class="card-style"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {Component, Prop, Watch, Vue} from 'vue-property-decorator';
import {IUser} from '@/interface/user';
import {ILinkNode, Link} from '@/utils/Link';
import ISit from '@/interface/sit';
import cardList from './cardList.vue';

@Component({
  components: {
    cardList,
  },
})
export default class SitList extends Vue {
  @Prop() private msg!: string;
  @Prop() private currPlayer: IUser | undefined;
  @Prop() private sitLink: ILinkNode<ISit> | undefined;
  @Prop() private handCard: string[] | undefined;
  private sitLinkNode: any = '';

  @Watch('sitLink')
  private getSit(val: ILinkNode<ISit>) {
    this.sitLinkNode = val;
  }
  private sitDown(sit: ISit) {
    if (!sit.player) {
      console.log('ccc', sit.position);
      let sitNode = this.sitLinkNode;
      for (let i = 0; i < 9; i++) {
        if (sitNode) {
          const next = sitNode.next;
          if (sitNode.node.player?.nickName === this.currPlayer?.nickName) {
            sitNode.node.player = null;
          }
          sitNode = next as ILinkNode<ISit>;
        }
      }
      for (let i = 0; i < 9; i++) {
        if (sitNode) {
          const next = sitNode.next;
          if (sit.position === sitNode.node.position) {
            sitNode.node.player = this.currPlayer as IUser;
            this.$emit('update:sitLink', sitNode);
            this.$emit('sit', sitNode);
          }
          sitNode = next as ILinkNode<ISit>;
        }
      }
    }
  }

  get sitList() {
    const sitMap: ISit[] = [];
    if (this.sitLinkNode) {
      let link = this.sitLinkNode;
      for (let i = 0; i < 9; i++) {
        if (
          link.node.player &&
          link.node.player.userId === this.currPlayer?.userId
        ) {
          this.sitLinkNode = link;
          break;
        }
        const next = link.next;
        link = next as ILinkNode<ISit>;
      }
      let sitNode = this.sitLinkNode;
      for (let i = 0; i < 9; i++) {
        const next = sitNode.next;
        sitMap.push(sitNode.node);
        sitNode = next as ILinkNode<ISit>;
      }
      console.log('sit', sitMap);
      return sitMap;
    }
    return [];
  }

  private mounted() {
    this.sitLinkNode = this.sitLink;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .sit-list-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    height: 100vh;
    width: 100vw;

    .sit-list {
      position: relative;
      width: 100vw;
      height: 620px;
      padding: 10px;
      margin: 0 15px;
      box-sizing: border-box;

      .sit {
        position: absolute;
        font-size: 12px;

        .default {
          i {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            border: 1px solid #bababa;
            display: block;
            font-style: normal;
            font-size: 20px;
            line-height: 45px;
            color: #fff;
          }
        }

        .player {
          position: relative;

          .icon {
            width: 45px;
            height: 45px;
            font-size: 45px;
            line-height: 45px;
            border-radius: 50%;
            margin-bottom: 2px;
          }

          .user-name {
            color: #fff;
          }

          .counter {
            background-color: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-weight: 600;
            font-size: 12px;
            border-radius: 2px;
          }

          .action-command {
            top: 15px;
            left: 45px;
            padding: 1px 8px;
            border-radius: 9px;
            color: #ffffff;
            background-color: #2c3e50;
            text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.3);
            position: absolute;
          }

          .type {
            background-color: #fff;
            color: #2b2b2b;
            border-radius: 50%;
            padding: 2px;
            width: 15px;
            height: 15px;
            line-height: 16px;
            position: absolute;
            top: 53px;
            left: 38px;
            font-size: 12px;
            transform: scale(0.8);
          }

          .action-size {
            background: rgba(0, 0, 0, 0.3) url("../assets/gold.svg") center left no-repeat;
            background-size: contain;
            border-radius: 2px;
            padding: 1px 4px 1px 12px;
            text-align: center;
            min-width: 35px;
            color: #fff;
            font-weight: 600;
            position: absolute;
            top: 35px;
            left: 40px;
          }
        }

        &:nth-child(1) {
          left: 100px;
          top: 460px;

          .action-command {
            left: -22px;
          }

          .type {
            left: -16px;
          }

          .action-size {
            top: -5px;
            left: 57px;
            padding-right: 15px;
            text-align: right;
          }
        }

        &:nth-child(2) {
          left: 0;
          top: 330px;
        }

        &:nth-child(3) {
          left: 0;
          top: 210px;
        }

        &:nth-child(4) {
          left: 0;
          top: 100px;
        }

        &:nth-child(5) {
          left: 75px;
          top: 0;
        }

        &:nth-child(6) {
          left: 240px;
          top: 0;
        }

        &:nth-child(7) {
          left: 296px;
          top: 100px;
        }

        &:nth-child(8) {
          left: 296px;
          top: 210px;
        }

        &:nth-child(9) {
          left: 296px;
          top: 330px;
        }

        &:nth-child(6),
        &:nth-child(7),
        &:nth-child(8),
        &:nth-child(9) {
          .action-command {
            left: -22px;
          }

          .type {
            left: -16px;
          }

          .action-size {
            background-position: right;
            left: -40px;
            padding-left: 1px;
            padding-right: 17px;
            text-align: right;
          }
        }

        .cards {
          position: absolute;
          left: 52px;
          top: 20px;
          min-width: 60px;
          min-height: 60px;
          line-height: 60px;
          .ready{
            font-size: 14px;
            display: inline-block;
            vertical-align: middle;
          }
        }
      }
    }
  }
</style>
