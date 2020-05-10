export interface ILinkNode<T> {
  node: T;
  next: ILinkNode<T> | null;
}

// interface ILink<T> {
//   getNode(position: number): T;
//   setNode(position: number): void;
//   removeNode(position: number): void;

export class Link<T> {
  public link: ILinkNode<T> = {
    node: {} as T,
    next: null,
  };

  constructor(nodes: T[], isCircular: boolean = true) {
    let prevNode: ILinkNode<T> = {
      node: {} as T,
      next: null,
    };
    nodes.forEach((node, key) => {
      const currNode: ILinkNode<T> = {
        node,
        next: null,
      };
      // head
      if (key === 0) {
        this.link = currNode;
      } else {
        // circular, last node next is first
        if (key === nodes.length - 1 && isCircular) {
          currNode.next = this.link;
        }
        prevNode.next = currNode;
      }
      prevNode = currNode;
    });
  }

  public getNode(position: number) {
    let linkNode = this.link;
    let i = 0;
    while (linkNode.next) {
      if (i === position) {
        return linkNode;
      }
      linkNode = linkNode.next;
      i++;
    }
    return linkNode;
  }

  public setNode(node: T, position: number) {
    let linkNode = this.link;
    let i = 0;
    const currNode: ILinkNode<T> = {
      node,
      next: null,
    };
    while (linkNode.next) {
      if (i === position) {
        currNode.next = linkNode.next;
        linkNode.next = currNode;
        return;
      }
      linkNode = linkNode.next;
      i++;
    }
    currNode.next = linkNode.next;
    linkNode.next = currNode;
  }
}
