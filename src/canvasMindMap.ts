// https://medium.freecodecamp.org/d3-and-canvas-in-3-steps-8505c8b27444
import {
  Relation,
  attachIdAndSkill,
  recursiveLeveling,
  toForceLink,
  getNodeFilter,
  filterRelations,
  filterNodes,
  getParent,
  isParent,
  AnimationTimer,
  attachAnimationAttributes,
  getCurrentLevel,
  ForceLink,
  getFontSizeToLevel,
  minCap,
  addTransparency,
  getTextColor,
  restrainToRange,
  isTag,
  filterTagLinks,
  hasChild,
  generateTagColorMap,
  ForceNode,
  tagsToNodesAndLinks,
  filterTagLinksByNodes,
  filterTagNodes,
  arrayMerge
} from "./mindMapHelper";

import * as d3 from "d3";
import { getBreadCrumb } from './mindMapHelper';

export default class CanvasForceMap {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private simulation: any;

  private linkElements: any;
  private nodeElements: any;
  private nodes: ForceNode[];
  private links: ForceLink[];
  private relations: Relation[];
  private originalLinks: ForceLink[];
  private originalNodes: ForceNode[];
  private originalTagLinks: ForceLink[];
  private originalTagNodes: ForceNode[];
  private tagColorMap: any;

  private tagRelations: Relation[];
  private tagLinks: ForceLink[];
  private tagNodes: ForceNode[];
  private animationTimer: AnimationTimer;
  private globalAnimationStatus: number = 0;
  private originNode: string;
  private currentNode: string = "Web Dev";
  private currentLevel: number = 0;

  // public settings
  public breadcrumb: string[];
  public animationDuration: number = 100;
  public linkColor: string = `#9095a0`;
  public linkWidth: number = 2;
  public textColorRange: string[] = [
    "#72dbe5",
    "#62abd6",
    "#5fa7dd",
    "#4678c4",
    "#284a96"
  ];
  public strokeColor: string = "#FFF";
  public parentStrokeColor: string = "#b6ead9";
  public textStrokeWidth: number = 5;
  public textAlign: string = "center";

  public fontSizeRange: number[] = [60, 35, 20];
  public fontFamily: string = "Open Sans";
  public fontWeight:
    | "bolder"
    | "normal"
    | "bold"
    | "lighter"
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900 = "bolder";

  // tags
  public tagColorRange: string[] = [
    "#abf4cb",
    "#a9f466",
    "#f25c5c",
    "#f4c2ab",
    "#b47cea",
    "#ffb5f0",
    "#fbffc1",
    "#ffb349"
  ];
  public tagFontSize: number = 20;

  //force
  public collsionRadius: number = 55;
  public chargeForce: number = -100;
  public linkDistance: number = 160;
  constructor(
    selector: string,
    nameAndSkills: any[],
    relations: Relation[],
    origin: string,
    tags: Relation[]
  ) {
    this.initialSetup(selector, nameAndSkills, relations, origin, tags);
  }

  private initialDataToNodesAndLinks(
    namesAndSkills: any[],
    relations: Relation[]
  ): { nodes: ForceNode[]; links: ForceLink[] } {
    const nodes = attachIdAndSkill(namesAndSkills);
    recursiveLeveling(this.currentNode, relations, nodes, 0);
    return {
      nodes,
      links: toForceLink(relations)
    };
  }

  private initialSetup = (
    selector: string,
    nameAndSkills: any[],
    relations: Relation[],
    origin: string,
    tags: Relation[]
  ) => {
    this.relations = relations;
    const nodeAndLinks = this.initialDataToNodesAndLinks(
      nameAndSkills,
      relations
    );
    if (tags) {
      this.tagRelations = tags;
      const tagData = tagsToNodesAndLinks(tags);
      this.tagLinks = tagData.links;
      this.originalTagLinks = tagData.links;
      this.originalTagNodes = tagData.nodes;
      this.tagColorMap = generateTagColorMap(tags, this.tagColorRange);
    }
    this.currentNode = origin;
    this.originNode = origin;
    this.links = nodeAndLinks.links;
    this.originalLinks = this.links;
    this.nodes = nodeAndLinks.nodes;
    this.originalNodes = this.nodes;
    this.animationTimer = new AnimationTimer(this.animationDuration);
    this.animationTimer.on("timer", d => {
      this.globalAnimationStatus = d;
    });

    this.canvas = document.querySelector(selector);
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;

  };

  public startGraph = () => {
    const { nodes, links } = this.filterNodesAndLinks(this.currentNode);
    if (this.tagLinks && this.tagNodes) {
      this.tagLinks = filterTagLinksByNodes(this.tagLinks, nodes);
      this.tagNodes = filterTagNodes(this.tagLinks, this.tagNodes);
      arrayMerge(nodes, this.tagNodes);
      arrayMerge(links, this.tagLinks);
    }

    this.simulation = d3
      .forceSimulation()
      .nodes(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: ForceNode) => d.id)
          .distance(this.linkDistance)
      )
      .force("collide", d3.forceCollide().radius(this.collsionRadius))
      .force("charge", d3.forceManyBody().strength(this.chargeForce))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .on("tick", this.ticked);

    d3.select(this.canvas).call(
      d3
        .drag()
        .container(this.canvas)
        .subject(this.dragsubject)
        .on("start", this.click)
        .on("drag", this.dragged)
        .on("end", this.dragended)
    );

    this.update(this.currentNode);
  };

  /**
   * Main mean to update the graph.
   * Could be called after changing a varible to refresh the graph
   * To get the 'exit transition' possible, we save the deleted nodes and give them 'LEAVING' property.
   * Then, we trigger afterAnimationUpdate(), after the animation has triggered to actually take the deleted node outk
   */
  public update = (currentNodeId: string) => {
    this.animationTimer.startTimer();
    this.currentNode = currentNodeId;
    this.currentLevel = getCurrentLevel(currentNodeId, this.originalNodes);
    this.breadcrumb = getBreadCrumb(this.currentNode, this.originalLinks);
    const { nodes, links } = this.filterNodesAndLinks(currentNodeId);
    if (this.originalTagLinks && this.originalTagNodes) {
      this.tagLinks = filterTagLinksByNodes(this.originalTagLinks, nodes);
      this.tagNodes = filterTagNodes(this.tagLinks, this.originalTagNodes);
      arrayMerge(nodes, this.tagNodes);
      arrayMerge(links, this.tagLinks);
    }
    this.nodes = attachAnimationAttributes(this.nodes, nodes);

    setTimeout(() => {
      this.afterAnimationUpdate(this.currentNode);
    }, this.animationDuration);

    this.simulation.nodes(this.nodes, (d:ForceNode) => {
      return d.id;
    });
    this.simulation
      .force("link")
      .links(links, (d: ForceLink) => d.source + "-" + d.target);
    this.simulation.alpha(1).restart();
  };

  private afterAnimationUpdate = (currentNodeId: string) => {
    const { links, nodes } = this.filterNodesAndLinks(currentNodeId);
    if (this.originalTagLinks && this.originalTagNodes) {
      this.tagLinks = filterTagLinksByNodes(this.originalTagLinks, nodes);
      this.tagNodes = filterTagNodes(this.tagLinks, this.originalTagNodes);
      arrayMerge(nodes, this.tagNodes);
      arrayMerge(links, this.tagLinks);
    }
    this.nodes = nodes;
    this.links = links;
    this.simulation.nodes(this.nodes, (d: ForceNode) => {
      return d.id;
    });
    this.simulation.force("link").links(links, (d:ForceLink) => d.source + "-" + d.target);
    this.simulation.alpha(1).restart();
  };

  /**
   * Updates the current node to the current node's parent
   * In other words, Go up the tree by on node.
   */
  public gotoParentNode = () => {
    const parent = getParent(this.currentNode, this.originalLinks);
    if (parent) {
      this.update(parent);
    }
  };

  public gotoNode = (nodeId: string) => {
    const ind = this.originalNodes.findIndex(node => node.id === nodeId);
    if (ind > -1) {
      this.update(nodeId);
    } else {
      console.error(`gotoNode(): the node ${nodeId} does not exist!`);
    }
  };

  /**
   * This is what gets called each frame of force simulation, we use this to draw on canvas
   */
  private ticked = () => {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.beginPath();
    if (this.tagRelations) {
      filterTagLinks(this.links, this.tagRelations).forEach(this.drawLink);
    } else {
      this.links.forEach(this.drawLink);
    }
    this.context.lineWidth = this.linkWidth;

    this.context.strokeStyle = addTransparency(this.linkColor, 0.2);
    this.context.stroke();

    this.context.beginPath();
    this.nodes.forEach(this.drawNode);

    if (this.originalTagLinks && this.originalTagNodes) {
      this.tagLinks.forEach(this.drawTagLink);

      this.context.beginPath();
      this.tagNodes.forEach(this.drawNode);
    }
  };

  private drawLink = (d: any) => {
    const sourcex = restrainToRange(d.source.x, 0, this.width);
    const sourcey = restrainToRange(d.source.y, 0, this.height);
    const targetX = restrainToRange(d.target.x, 0, this.width);
    const targetY = restrainToRange(d.target.y, 0, this.height);

    this.context.moveTo(sourcex, sourcey);
    this.context.lineTo(targetX, targetY);
  };

  private drawTagLink = (d: any) => {
    this.context.beginPath();
    const sourcex = restrainToRange(d.source.x, 0, this.width);
    const sourcey = restrainToRange(d.source.y, 0, this.height);
    const targetX = restrainToRange(d.target.x, 0, this.width);
    const targetY = restrainToRange(d.target.y, 0, this.height);
    this.context.moveTo(sourcex, sourcey);
    this.context.lineTo(targetX, targetY);
    this.context.strokeStyle = addTransparency(
      this.tagColorMap[d.target.id],
      0.2
    );
    this.context.stroke();
  };

  private drawNode = (d: any) => {
    this.context.moveTo(d.x + 3, d.y);
    this.setTextContext(d);

    this.context.textAlign = this.textAlign;
    this.context.lineWidth = this.textStrokeWidth;
    this.context.strokeStyle = hasChild(d.id, this.relations, this.currentNode)
      ? this.parentStrokeColor
      : this.strokeColor;
    const x = restrainToRange(d.x, 0, this.width);
    const y = restrainToRange(d.y, 0, this.height);
    this.context.strokeText(d.id, x, y);
    this.context.fillText(d.id, x, y);
  };

  private setTextContext = (node: ForceNode) => {
    const fontSize = isTag(node.id, this.tagRelations)
      ? this.tagFontSize
      : getFontSizeToLevel(node.level, this.currentLevel, this.fontSizeRange);
    this.context.fillStyle = isTag(node.id, this.tagRelations)
      ? addTransparency(this.tagColorMap[node.id], this.globalAnimationStatus)
      : addTransparency(
          getTextColor(node.skill, this.textColorRange),
          this.globalAnimationStatus
        );
    this.context.textAlign = "center";

    if (node.status === "ENTERING") {
      this.context.font = `${this.fontWeight} ${fontSize *
        this.globalAnimationStatus}px ${this.fontFamily}`;
    } else if (node.status === "LEAVING") {
      this.context.font = `${this.fontWeight} ${minCap(fontSize)}px ${
        this.fontFamily
      }`;
    } else {
      this.context.fillStyle = isTag(node.id, this.tagRelations)
        ? this.tagColorMap[node.id]
        : getTextColor(node.skill, this.textColorRange);
      this.context.font = `${this.fontWeight} ${fontSize}px ${this.fontFamily}`;
    }
  };

  private onMouseOver = () => {};

  // drag only
  private dragstarted = () => {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  };

  private dragged = () => {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  };

  private dragended = () => {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  };

  //drag and click
  private click = () => {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;

    const target = d3.event.subject.id;
    if (
      target &&
      isParent(target, this.relations) &&
      target !== this.currentNode
    ) {
      this.update(target);
    }
  };

  dragsubject = () => {
    return this.simulation.find(d3.event.x, d3.event.y);
  };

  /**
   * original nodes, links should be not be touched, but manipulated by this filter
   */
  private filterNodesAndLinks = (
    currentNodeId: string
  ): { nodes: ForceNode[]; links: ForceLink[] } => {
    const nodeFilter = getNodeFilter(this.relations, currentNodeId);
    const newRelations = filterRelations(this.relations, currentNodeId);
    return {
      nodes: filterNodes(this.originalNodes, nodeFilter),
      links: toForceLink(newRelations)
    };
  };
}
