/// <reference types="node" />
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
export declare function attachIdAndSkill(langArr: any[]): ForceNode[];
/**
 * recursively finds and adds depth level to Nodes
 */
export declare function recursiveLeveling(originId: string, langRelations: Relation[], nodes: ForceNode[], currentLevel?: number): void;
/**
 * impure function
 * Side Effect is leveling
 */
export declare function findAndLevel(nodeId: string, langs: ForceNode[], level: number): ForceNode;
/**
 *
 * @param langId id of the language
 * @return filtered LangRelations[]
 */
export declare function filterNodes(nodes: ForceNode[], nodeFilter: string[]): ForceNode[];
export declare function filterRelations(relations: Relation[], nodeId: string): Relation[];
/**
 *
 * @param relation { Relation[]}
 * @param langId { string }
 * @returns { string[] } string of names to use as filter
 */
export declare function getNodeFilter(relation: Relation[], langId: string): string[];
export declare function getRelationFilter(relations: Relation[], nodeId: string): string[];
/**
 * Parses Relation[] to ForceLink[]
 */
export declare function toForceLink(relation: Relation[]): ForceLink[];
/**
 * Given a NodeId,
 *  return boolean; whether there is a relation with the same parent name as the node ID,
 */
export declare function isParent(nodeId: string, relations: Relation[]): boolean;
/**
 *
 *  * @return { string | null } depending on parent's existence
 */
export declare function getParent(currentNodeId: string, links: ForceLink[]): string | null;
export declare function getBreadCrumb(currentNodeID: string, links: ForceLink[], resArr?: string[]): string[];
export declare function getCurrentLevel(currentNodeId: string, nodes: ForceNode[]): number;
export declare function createTimer(duration: number): void;
export declare class AnimationTimer extends EventEmitter {
    status: number;
    duration: number;
    timer: any;
    constructor(duration?: number);
    startTimer(): void;
}
export declare function attachAnimationAttributes(oldNodes: ForceNode[], newNodes: ForceNode[]): ForceNode[];
export declare function takeOutLeavingNodes(newNodes: ForceNode[]): ForceNode[];
export declare function getFontSizeToLevel(nodeLevel: number, currentLevel: number, fontSizeArray?: number[]): number;
export declare function minCap(fontSize: number, cap?: number): number;
export declare function addTransparency(hex: string, alpha?: number): string;
export declare function getTextColor(skill: number, colorArray: string[]): string;
export declare function restrainToRange(x: number, start: number, end: number, padding?: number): number;
export declare function tagsToNodesAndLinks(tags: Relation[]): {
    nodes: ForceNode[];
    links: ForceLink[];
};
export declare function filterTagLinksByNodes(links: ForceLink[], nodes: ForceNode[]): ForceLink[];
export declare function filterTagNodes(filteredLinks: ForceLink[], tagNodes: ForceNode[]): ForceNode[];
/**
 * mutate merge using push
 * push contents of array 2 to array 1
 */
export declare function arrayMerge(arr1: any[], arr2: any[]): any[];
export declare function isTag(nodeId: string, tagRelations: Relation[]): boolean;
export declare function hasChild(nodeId: string, relations: Relation[], currentNode: string): boolean;
export declare function generateTagColorMap(tagRelation: Relation[], tagColorRange: string[]): any;
export declare function filterTagLinks(links: ForceLink[], tagRelations: Relation[]): ForceLink[];
