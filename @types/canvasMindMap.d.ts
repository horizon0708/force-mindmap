import { Relation } from "./mindMapHelper";
export default class CanvasForceMap {
    private canvas;
    private context;
    private width;
    private height;
    private simulation;
    private linkElements;
    private nodeElements;
    private nodes;
    private links;
    private relations;
    private originalLinks;
    private originalNodes;
    private originalTagLinks;
    private originalTagNodes;
    private tagColorMap;
    private tagRelations;
    private tagLinks;
    private tagNodes;
    private animationTimer;
    private globalAnimationStatus;
    private originNode;
    private currentNode;
    private currentLevel;
    breadcrumb: string[];
    animationDuration: number;
    linkColor: string;
    linkWidth: number;
    textColorRange: string[];
    strokeColor: string;
    parentStrokeColor: string;
    textStrokeWidth: number;
    textAlign: string;
    fontSizeRange: number[];
    fontFamily: string;
    fontWeight: "bolder" | "normal" | "bold" | "lighter" | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    tagColorRange: string[];
    tagFontSize: number;
    collsionRadius: number;
    chargeForce: number;
    linkDistance: number;
    constructor(selector: string, nameAndSkills: any[], relations: Relation[], origin: string, tags: Relation[]);
    private initialDataToNodesAndLinks(namesAndSkills, relations);
    private initialSetup;
    startGraph: () => void;
    /**
     * Main mean to update the graph.
     * Could be called after changing a varible to refresh the graph
     * To get the 'exit transition' possible, we save the deleted nodes and give them 'LEAVING' property.
     * Then, we trigger afterAnimationUpdate(), after the animation has triggered to actually take the deleted node outk
     */
    update: (currentNodeId: string) => void;
    private afterAnimationUpdate;
    /**
     * Updates the current node to the current node's parent
     * In other words, Go up the tree by on node.
     */
    gotoParentNode: () => void;
    gotoNode: (nodeId: string) => void;
    /**
     * This is what gets called each frame of force simulation, we use this to draw on canvas
     */
    private ticked;
    private drawLink;
    private drawTagLink;
    private drawNode;
    private setTextContext;
    private onMouseOver;
    private dragstarted;
    private dragged;
    private dragended;
    private click;
    dragsubject: () => any;
    /**
     * original nodes, links should be not be touched, but manipulated by this filter
     */
    private filterNodesAndLinks;
}
