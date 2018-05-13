"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
function attachIdAndSkill(langArr) {
    return langArr.map((x, i) => {
        return { id: x[0], skill: x[1] };
    });
}
exports.attachIdAndSkill = attachIdAndSkill;
/**
 * recursively finds and adds depth level to Nodes
 */
function recursiveLeveling(originId, langRelations, nodes, currentLevel = 0) {
    const ind = langRelations.findIndex(x => x.parent === originId);
    if (ind > -1) {
        findAndLevel(originId, nodes, currentLevel);
        currentLevel++;
        langRelations[ind].children.forEach(x => {
            recursiveLeveling(x, langRelations, nodes, currentLevel);
        });
    }
    else {
        findAndLevel(originId, nodes, currentLevel);
    }
}
exports.recursiveLeveling = recursiveLeveling;
/**
 * impure function
 * Side Effect is leveling
 */
function findAndLevel(nodeId, langs, level) {
    const ind = langs.findIndex(x => x.id === nodeId);
    if (ind > -1) {
        if (!langs[ind].level) {
            langs[ind].level = level;
        }
        return langs[ind];
    }
    return langs[ind];
}
exports.findAndLevel = findAndLevel;
/**
 *
 * @param langId id of the language
 * @return filtered LangRelations[]
 */
function filterNodes(nodes, nodeFilter) {
    return nodes.filter(node => nodeFilter.findIndex(name => name === node.id) > -1);
}
exports.filterNodes = filterNodes;
function filterRelations(relations, nodeId) {
    return relations.filter(relation => getRelationFilter(relations, nodeId).findIndex(name => name === relation.parent) > -1);
}
exports.filterRelations = filterRelations;
/**
 *
 * @param relation { Relation[]}
 * @param langId { string }
 * @returns { string[] } string of names to use as filter
 */
function getNodeFilter(relation, langId) {
    const relationIndex = relation.findIndex(x => x.parent === langId);
    if (relationIndex > -1) {
        const originRelation = relation[relationIndex];
        const originArr = [originRelation.parent, ...originRelation.children];
        // iterate through children, and get their children then concat them
        const childrenArr = originRelation.children
            .map((child) => {
            const childIndex = relation.findIndex(relation => relation.parent === child);
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
exports.getNodeFilter = getNodeFilter;
// if there is only one then there can be no relation at all
// which means I should always check if user can get into situation with no relations
function getRelationFilter(relations, nodeId) {
    const index = relations.findIndex(x => x.parent === nodeId);
    if (index > -1) {
        return [relations[index].parent, ...relations[index].children];
    }
    return [];
}
exports.getRelationFilter = getRelationFilter;
/**
 * Parses Relation[] to ForceLink[]
 */
function toForceLink(relation) {
    if (relation.length > 0) {
        return relation
            .map(x => {
            return x.children.map((child) => {
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
exports.toForceLink = toForceLink;
/**
 * Given a NodeId,
 *  return boolean; whether there is a relation with the same parent name as the node ID,
 */
function isParent(nodeId, relations) {
    return relations.findIndex(relation => relation.parent === nodeId) > -1;
}
exports.isParent = isParent;
/**
 *
 *  * @return { string | null } depending on parent's existence
 */
function getParent(currentNodeId, links) {
    const linkIndex = links.findIndex(link => link.source === currentNodeId);
    if (linkIndex > -1) {
        return links[linkIndex].target;
    }
    return null;
}
exports.getParent = getParent;
function getBreadCrumb(currentNodeID, links, resArr = []) {
    let parent = getParent(currentNodeID, links);
    if (parent) {
        resArr.push(parent);
        getBreadCrumb(parent, links, resArr);
    }
    return resArr;
}
exports.getBreadCrumb = getBreadCrumb;
function getCurrentLevel(currentNodeId, nodes) {
    const nodeIndex = nodes.findIndex(node => node.id === currentNodeId);
    if (nodeIndex > -1) {
        return nodes[nodeIndex].level;
    }
    console.error(`could not find the node with the name ${currentNodeId} `);
    return 0;
}
exports.getCurrentLevel = getCurrentLevel;
function createTimer(duration) { }
exports.createTimer = createTimer;
class AnimationTimer extends events_1.EventEmitter {
    constructor(duration = 250) {
        super();
        this.status = 0.1;
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
exports.AnimationTimer = AnimationTimer;
// cant do immutability with d3
function attachAnimationAttributes(oldNodes, newNodes) {
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
exports.attachAnimationAttributes = attachAnimationAttributes;
function takeOutLeavingNodes(newNodes) {
    const inds = newNodes
        .filter(node => node.status === "LEAVING")
        .map((n, i) => i);
    inds.forEach(ind => newNodes.splice(ind));
    return newNodes;
}
exports.takeOutLeavingNodes = takeOutLeavingNodes;
function getNodeAnimationStatus(nodeId, oldNodes, newNodes) {
    const oldNodeInd = oldNodes.findIndex(node => node.id === nodeId);
    const newNodeInd = newNodes.findIndex(node => node.id === nodeId);
    if (oldNodeInd > -1 && newNodeInd > -1)
        return "STAYING";
    if (oldNodeInd > -1 && newNodeInd === -1)
        return "LEAVING";
    if (oldNodeInd === -1 && newNodeInd > -1)
        return "ENTERING";
    console.error("getNodeAnimationClass is getting called on non existing nodes");
    return "STAYING";
}
function getFontSizeToLevel(nodeLevel, currentLevel, fontSizeArray = [60, 35, 20]) {
    const relativeLevel = nodeLevel - currentLevel;
    if (relativeLevel < 0) {
        return fontSizeArray[0];
    }
    return fontSizeArray[relativeLevel];
}
exports.getFontSizeToLevel = getFontSizeToLevel;
function minCap(fontSize, cap = 0) {
    const res = fontSize - fontSize * this.globalAnimationStatus;
    return res > cap ? res : cap;
}
exports.minCap = minCap;
function addTransparency(hex, alpha = 1) {
    const rgb = hexToRgb(hex);
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}
exports.addTransparency = addTransparency;
function hexToRgb(hex) {
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
function getTextColor(skill, colorArray) {
    if (colorArray.length - 1 < skill) {
        return colorArray[colorArray.length - 1];
    }
    return colorArray[skill];
}
exports.getTextColor = getTextColor;
function restrainToRange(x, start, end, padding = 16) {
    // console.log(end);
    if (x > end - padding)
        return end - padding;
    if (x < start + padding)
        return start + padding;
    return x;
}
exports.restrainToRange = restrainToRange;
function tagsToNodesAndLinks(tags) {
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
    outputLinks = outputLinks.length > 0 ? outputLinks.reduce((a, b) => a.concat(b)) : [];
    return {
        nodes,
        links: outputLinks,
    };
}
exports.tagsToNodesAndLinks = tagsToNodesAndLinks;
// doesnt check for existing target because this is for tags, and we will be generating target nodes depending onthis function
function filterTagLinksByNodes(links, nodes) {
    const nodeIds = nodes.map(node => node.id);
    return links.filter(link => {
        const searchId = link.source.id ? link.source.id : link.source;
        return nodeIds.includes(searchId);
    });
}
exports.filterTagLinksByNodes = filterTagLinksByNodes;
//https://stackoverflow.com/a/14438954 for what `Set` is doing here
function filterTagNodes(filteredLinks, tagNodes) {
    const tags = Array.from(new Set(filteredLinks.map(link => {
        return link.target.id ? link.target.id : link.target;
    })));
    // probably could just return the Set...
    return tagNodes.filter(node => tags.includes(node.id));
}
exports.filterTagNodes = filterTagNodes;
/**
 * mutate merge using push
 * push contents of array 2 to array 1
 */
function arrayMerge(arr1, arr2) {
    arr2.forEach(item => arr1.push(item));
    return arr1;
}
exports.arrayMerge = arrayMerge;
function isTag(nodeId, tagRelations) {
    const search = tagRelations.map(relation => relation.parent);
    return search.includes(nodeId);
}
exports.isTag = isTag;
function hasChild(nodeId, relations, currentNode) {
    if (currentNode) {
        return relations.findIndex(relation => relation.parent === nodeId) > -1 && nodeId !== currentNode;
    }
    return relations.findIndex(relation => relation.parent === nodeId) > -1;
}
exports.hasChild = hasChild;
function generateTagColorMap(tagRelation, tagColorRange) {
    let counter = 0;
    let output = {};
    for (let index = 0; index < tagRelation.length; index++) {
        if (counter > tagColorRange.length - 1) {
            counter = 0;
        }
        output[tagRelation[index].parent] = tagColorRange[counter];
        counter++;
    }
    return output;
}
exports.generateTagColorMap = generateTagColorMap;
function filterTagLinks(links, tagRelations) {
    const search = tagRelations.map(relation => relation.parent);
    return links.filter(link => {
        const target = link.target.id ? link.target.id : link.target;
        return !search.includes(target);
    });
}
exports.filterTagLinks = filterTagLinks;
//# sourceMappingURL=mindMapHelper.js.map