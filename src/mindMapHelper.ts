import { EventEmitter } from "events";

export interface ForceNode {
  id: string;
  level?: number;
  skill?: number;
  status?: "ENTERING" | "STAYING" | "LEAVING";
  timing?: AnimationTimer;
}

export interface ForceLink {
  source: any;
  target: any;
  value?: number;
}

export interface Relation {
  parent: string;
  children: string[];
}

export function attachIdAndSkill(langArr: any[]): ForceNode[] {
  return langArr.map((x, i) => {
    return { id: x[0], skill: x[1] };
  });
}
/**
 * recursively finds and adds depth level to Nodes
 */
export function recursiveLeveling(
  originId: string,
  langRelations: Relation[],
  nodes: ForceNode[],
  currentLevel: number = 0
) {
  const ind = langRelations.findIndex(x => x.parent === originId);
  if (ind > -1) {
    findAndLevel(originId, nodes, currentLevel);
    currentLevel++;
    langRelations[ind].children.forEach(x => {
      recursiveLeveling(x, langRelations, nodes, currentLevel);
    });
  } else {
    findAndLevel(originId, nodes, currentLevel);
  }
}
/**
 * impure function
 * Side Effect is leveling
 */
export function findAndLevel(
  nodeId: string,
  langs: ForceNode[],
  level: number
) {
  const ind = langs.findIndex(x => x.id === nodeId);
  if (ind > -1) {
    if (!langs[ind].level) {
      langs[ind].level = level;
    }
    return langs[ind];
  }
  return langs[ind];
}

/**
 *
 * @param langId id of the language
 * @return filtered LangRelations[]
 */
export function filterNodes(nodes: ForceNode[], nodeFilter: string[]) {
  return nodes.filter(
    node => nodeFilter.findIndex(name => name === node.id) > -1
  );
}

export function filterRelations(relations: Relation[], nodeId: string) {
  return relations.filter(
    relation =>
      getRelationFilter(relations, nodeId).findIndex(
        name => name === relation.parent
      ) > -1
  );
}
/**
 *
 * @param relation { Relation[]}
 * @param langId { string }
 * @returns { string[] } string of names to use as filter
 */
export function getNodeFilter(relation: Relation[], langId: string): string[] {
  const relationIndex = relation.findIndex(x => x.parent === langId);
  if (relationIndex > -1) {
    const originRelation = relation[relationIndex];
    const originArr = [originRelation.parent, ...originRelation.children];
    // iterate through children, and get their children then concat them
    const childrenArr = originRelation.children
      .map((child: string) => {
        const childIndex = relation.findIndex(
          relation => relation.parent === child
        );
        if (childIndex > -1) {
          return relation[childIndex].children;
        }
        return [];
      })
      .reduce((a, b) => a.concat(b));
    return originArr.concat(childrenArr);
  }
  return [langId];
}

// if there is only one then there can be no relation at all
// which means I should always check if user can get into situation with no relations
export function getRelationFilter(
  relations: Relation[],
  nodeId: string
): string[] {
  const index = relations.findIndex(x => x.parent === nodeId);
  if (index > -1) {
    return [relations[index].parent, ...relations[index].children];
  }
  return [];
}

/**
 * Parses Relation[] to ForceLink[]
 */
export function toForceLink(relation: Relation[]): ForceLink[] {
  if (relation.length > 0) {
    return relation
      .map(x => {
        return x.children.map((child: string) => {
          return {
            source: child,
            target: x.parent,
            value: 5
          };
        });
      })
      .reduce((a, b) => a.concat(b));
  }
  return [];
}

/**
 * Given a NodeId,
 *  return boolean; whether there is a relation with the same parent name as the node ID,
 */
export function isParent(nodeId: string, relations: Relation[]): boolean {
  return relations.findIndex(relation => relation.parent === nodeId) > -1;
}

/**
 *
 *  * @return { string | null } depending on parent's existence
 */
export function getParent(currentNodeId: string, links: ForceLink[]): string | null {
  const linkIndex = links.findIndex(link => link.source === currentNodeId);
  if (linkIndex > -1) {
    return links[linkIndex].target;
  }
  return null;
}

export function getBreadCrumb(currentNodeID: string, links: ForceLink[], resArr: string[] = []): string[] {

    let parent = getParent(currentNodeID,links);
    if(parent){
      resArr.push(parent);
      getBreadCrumb(parent, links, resArr);
    }
    return resArr
}

export function getCurrentLevel(currentNodeId: string, nodes: ForceNode[]) {
  const nodeIndex = nodes.findIndex(node => node.id === currentNodeId);
  if (nodeIndex > -1) {
    return nodes[nodeIndex].level;
  }
  console.error(`could not find the node with the name ${currentNodeId} `);
  return 0;
}

export function createTimer(duration: number) {}

export class AnimationTimer extends EventEmitter {
  status: number = 0.1;
  duration: number;
  timer: any;

  constructor(duration: number = 250) {
    super();
    this.duration = duration;
    // this.startTimer();
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      const interval = 1 / this.duration;
      this.status += interval;
      this.emit("timer", this.status);
      if (this.status > 1) {
        clearInterval(this.timer);
        this.status = 0;
      }
    }, 1);
  }
}
// cant do immutability with d3
export function attachAnimationAttributes(
  oldNodes: ForceNode[],
  newNodes: ForceNode[]
) {
  newNodes.forEach(node => {
    node.status = getNodeAnimationStatus(node.id, oldNodes, newNodes);
  });
  oldNodes.forEach(node => {
    node.status = getNodeAnimationStatus(node.id, oldNodes, newNodes);
  });
  const leaving = oldNodes
    .filter(node => node.status === "LEAVING")
    .forEach(node => newNodes.push(node));
  return newNodes;
  // return newNodes.map(node=>{
  //   return {
  //     ...node,
  //     status: getNodeAnimationStatus(node.id, oldNodes, newNodes),
  //     timing: timer.status
  //   }
  // })
}

export function takeOutLeavingNodes(newNodes: ForceNode[]) {
  const inds = newNodes
    .filter(node => node.status === "LEAVING")
    .map((n, i) => i);
  inds.forEach(ind => newNodes.splice(ind));
  return newNodes;
}

function getNodeAnimationStatus(
  nodeId: string,
  oldNodes: ForceNode[],
  newNodes: ForceNode[]
) {
  const oldNodeInd = oldNodes.findIndex(node => node.id === nodeId);
  const newNodeInd = newNodes.findIndex(node => node.id === nodeId);
  if (oldNodeInd > -1 && newNodeInd > -1) return "STAYING";
  if (oldNodeInd > -1 && newNodeInd === -1) return "LEAVING";
  if (oldNodeInd === -1 && newNodeInd > -1) return "ENTERING";
  console.error(
    "getNodeAnimationClass is getting called on non existing nodes"
  );
  return "STAYING";
}

export function getFontSizeToLevel(
  nodeLevel: number,
  currentLevel: number,
  fontSizeArray: number[] = [60, 35, 20]
): number {
  const relativeLevel = nodeLevel - currentLevel;
  if (relativeLevel < 0) {
    return fontSizeArray[0];
  }
  return fontSizeArray[relativeLevel];
}

export function minCap(fontSize: number, cap: number = 0): number {
  const res = fontSize - fontSize * this.globalAnimationStatus;
  return res > cap ? res : cap;
}

export function addTransparency(hex: string, alpha: number = 1) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

export function getTextColor(skill: number, colorArray: string[]) {
  if (colorArray.length - 1 < skill) {
    return colorArray[colorArray.length - 1];
  }
  return colorArray[skill];
}

export function restrainToRange(
  x: number,
  start: number,
  end: number,
  padding = 16
): number {
  // console.log(end);
  if (x > end - padding) return end - padding;
  if (x < start + padding) return start + padding;
  return x;
}

export function tagsToNodesAndLinks(
  tags: Relation[]
): { nodes: ForceNode[]; links: ForceLink[] } {
  const nodes = tags.map(node => {
    return {
      id: node.parent,
      skill: 5
    };
  });
  let outputLinks = tags
    .map(node => {
      return node.children.map(child => {
        return {
          source: child,
          target: node.parent
        };
      });
    });
  outputLinks = outputLinks.length >0 ? outputLinks.reduce((a,b) => a.concat(b)) : [];
  return {
    nodes,
    links:outputLinks,
  };
}

// doesnt check for existing target because this is for tags, and we will be generating target nodes depending onthis function
export function filterTagLinksByNodes(links: ForceLink[], nodes: ForceNode[]) {
  const nodeIds = nodes.map(node => node.id);
  return links.filter(link => {
    const searchId = link.source.id ? link.source.id : link.source;
    return nodeIds.includes(searchId);
  });
}

//https://stackoverflow.com/a/14438954 for what `Set` is doing here
export function filterTagNodes(
  filteredLinks: ForceLink[],
  tagNodes: ForceNode[]
) {
  const tags = Array.from(
    new Set(
      filteredLinks.map(link => {
        return link.target.id ? link.target.id : link.target;
      })
    )
  );
  // probably could just return the Set...
  return tagNodes.filter(node => tags.includes(node.id));
}
/**
 * mutate merge using push
 * push contents of array 2 to array 1
 */
export function arrayMerge(arr1: any[], arr2: any[]): any[] {
  arr2.forEach(item => arr1.push(item));
  return arr1;
}

export function isTag(nodeId: string, tagRelations: Relation[]){
  const search = tagRelations.map(relation=> relation.parent);
  return search.includes(nodeId);
}

export function hasChild(
  nodeId: string,
  relations: Relation[],
  currentNode: string
): boolean {
  if (currentNode) {
    return relations.findIndex(relation => relation.parent === nodeId) > -1 && nodeId !== currentNode;
  }
  return relations.findIndex(relation => relation.parent === nodeId) > -1;
}

export function generateTagColorMap(tagRelation: Relation[], tagColorRange: string[]): any{
  let counter = 0;
  let output: any = {};
  for (let index = 0; index < tagRelation.length; index++) {
    if(counter > tagColorRange.length -1){
      counter = 0;
    }
    output[tagRelation[index].parent] = tagColorRange[counter];
    counter++;
  }
  return output;
}

export function filterTagLinks(links: ForceLink[], tagRelations:Relation[]){
  const search = tagRelations.map(relation=> relation.parent);
  return links.filter(link => {
    const target = link.target.id ? link.target.id : link.target;
    return !search.includes(target);
  })
}