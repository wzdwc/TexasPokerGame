import { Link } from '../../src/utils/Link';
import { Player } from '../../src/app/core/Player';

describe('test/utils/link.test.ts', () => {
  it('link', async () => {
    const person1 = new Player({ counter: 1, position: 1, userId: '1' });
    const person2 = new Player({ counter: 2, position: 2, userId: '2' });
    const person3 = new Player({ counter: 2, position: 3, userId: '3' });
    const person4 = new Player({ counter: 2, position: 4, userId: '4' });
    // const person5 = new Player({ counter: 2, position: 5, userId: '5' });
    const link = new Link<Player>([ person1, person2, person3, person4 ], false);
    console.log(link.getNode(0), 'link--------')
    console.log(link.link);
  });

});
