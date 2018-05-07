"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
function attachIdAndSkill(langArr) {
    return langArr.map(function (x, i) {
        return { id: x[0], skill: x[1] };
    });
}
exports.attachIdAndSkill = attachIdAndSkill;
/**
 * recursively finds and adds depth level to Nodes
 */
function recursiveLeveling(originId, langRelations, nodes, currentLevel) {
    if (currentLevel === void 0) { currentLevel = 0; }
    var ind = langRelations.findIndex(function (x) { return x.parent === originId; });
    if (ind > -1) {
        findAndLevel(originId, nodes, currentLevel);
        currentLevel++;
        langRelations[ind].children.forEach(function (x) {
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
    var ind = langs.findIndex(function (x) { return x.id === nodeId; });
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
    return nodes.filter(function (node) { return nodeFilter.findIndex(function (name) { return name === node.id; }) > -1; });
}
exports.filterNodes = filterNodes;
function filterRelations(relations, nodeId) {
    return relations.filter(function (relation) {
        return getRelationFilter(relations, nodeId).findIndex(function (name) { return name === relation.parent; }) > -1;
    });
}
exports.filterRelations = filterRelations;
/**
 *
 * @param relation { Relation[]}
 * @param langId { string }
 * @returns { string[] } string of names to use as filter
 */
function getNodeFilter(relation, langId) {
    var relationIndex = relation.findIndex(function (x) { return x.parent === langId; });
    if (relationIndex > -1) {
        var originRelation = relation[relationIndex];
        var originArr = [originRelation.parent].concat(originRelation.children);
        // iterate through children, and get their children then concat them
        var childrenArr = originRelation.children
            .map(function (child) {
            var childIndex = relation.findIndex(function (relation) { return relation.parent === child; });
            if (childIndex > -1) {
                return relation[childIndex].children;
            }
            return [];
        })
            .reduce(function (a, b) { return a.concat(b); });
        return originArr.concat(childrenArr);
    }
    return [langId];
}
exports.getNodeFilter = getNodeFilter;
// if there is only one then there can be no relation at all
// which means I should always check if user can get into situation with no relations
function getRelationFilter(relations, nodeId) {
    var index = relations.findIndex(function (x) { return x.parent === nodeId; });
    if (index > -1) {
        return [relations[index].parent].concat(relations[index].children);
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
            .map(function (x) {
            return x.children.map(function (child) {
                return {
                    source: child,
                    target: x.parent,
                    value: 5
                };
            });
        })
            .reduce(function (a, b) { return a.concat(b); });
    }
    return [];
}
exports.toForceLink = toForceLink;
/**
 * Given a NodeId,
 *  return boolean; whether there is a relation with the same parent name as the node ID,
 */
function isParent(nodeId, relations) {
    return relations.findIndex(function (relation) { return relation.parent === nodeId; }) > -1;
}
exports.isParent = isParent;
/**
 *
 *  * @return { string | null } depending on parent's existence
 */
function getParent(currentNodeId, links) {
    var linkIndex = links.findIndex(function (link) { return link.source === currentNodeId; });
    if (linkIndex > -1) {
        return links[linkIndex].target;
    }
    return null;
}
exports.getParent = getParent;
function getBreadCrumb(currentNodeID, links, resArr) {
    if (resArr === void 0) { resArr = []; }
    var parent = getParent(currentNodeID, links);
    if (parent) {
        resArr.push(parent);
        getBreadCrumb(parent, links, resArr);
    }
    return resArr;
}
exports.getBreadCrumb = getBreadCrumb;
function getCurrentLevel(currentNodeId, nodes) {
    var nodeIndex = nodes.findIndex(function (node) { return node.id === currentNodeId; });
    if (nodeIndex > -1) {
        return nodes[nodeIndex].level;
    }
    console.error("could not find the node with the name " + currentNodeId + " ");
    return 0;
}
exports.getCurrentLevel = getCurrentLevel;
function createTimer(duration) { }
exports.createTimer = createTimer;
var AnimationTimer = /** @class */ (function (_super) {
    __extends(AnimationTimer, _super);
    function AnimationTimer(duration) {
        if (duration === void 0) { duration = 250; }
        var _this = _super.call(this) || this;
        _this.status = 0.1;
        _this.duration = duration;
        return _this;
        // this.startTimer();
    }
    AnimationTimer.prototype.startTimer = function () {
        var _this = this;
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(function () {
            var interval = 1 / _this.duration;
            _this.status += interval;
            _this.emit("timer", _this.status);
            if (_this.status > 1) {
                clearInterval(_this.timer);
                _this.status = 0;
            }
        }, 1);
    };
    return AnimationTimer;
}(events_1.EventEmitter));
exports.AnimationTimer = AnimationTimer;
// cant do immutability with d3
function attachAnimationAttributes(oldNodes, newNodes) {
    newNodes.forEach(function (node) {
        node.status = getNodeAnimationStatus(node.id, oldNodes, newNodes);
    });
    oldNodes.forEach(function (node) {
        node.status = getNodeAnimationStatus(node.id, oldNodes, newNodes);
    });
    var leaving = oldNodes
        .filter(function (node) { return node.status === "LEAVING"; })
        .forEach(function (node) { return newNodes.push(node); });
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
    var inds = newNodes
        .filter(function (node) { return node.status === "LEAVING"; })
        .map(function (n, i) { return i; });
    inds.forEach(function (ind) { return newNodes.splice(ind); });
    return newNodes;
}
exports.takeOutLeavingNodes = takeOutLeavingNodes;
function getNodeAnimationStatus(nodeId, oldNodes, newNodes) {
    var oldNodeInd = oldNodes.findIndex(function (node) { return node.id === nodeId; });
    var newNodeInd = newNodes.findIndex(function (node) { return node.id === nodeId; });
    if (oldNodeInd > -1 && newNodeInd > -1)
        return "STAYING";
    if (oldNodeInd > -1 && newNodeInd === -1)
        return "LEAVING";
    if (oldNodeInd === -1 && newNodeInd > -1)
        return "ENTERING";
    console.error("getNodeAnimationClass is getting called on non existing nodes");
    return "STAYING";
}
function getFontSizeToLevel(nodeLevel, currentLevel, fontSizeArray) {
    if (fontSizeArray === void 0) { fontSizeArray = [60, 35, 20]; }
    var relativeLevel = nodeLevel - currentLevel;
    if (relativeLevel < 0) {
        return fontSizeArray[0];
    }
    return fontSizeArray[relativeLevel];
}
exports.getFontSizeToLevel = getFontSizeToLevel;
function minCap(fontSize, cap) {
    if (cap === void 0) { cap = 0; }
    var res = fontSize - fontSize * this.globalAnimationStatus;
    return res > cap ? res : cap;
}
exports.minCap = minCap;
function addTransparency(hex, alpha) {
    if (alpha === void 0) { alpha = 1; }
    var rgb = hexToRgb(hex);
    return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")";
}
exports.addTransparency = addTransparency;
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
function restrainToRange(x, start, end, padding) {
    if (padding === void 0) { padding = 16; }
    // console.log(end);
    if (x > end - padding)
        return end - padding;
    if (x < start + padding)
        return start + padding;
    return x;
}
exports.restrainToRange = restrainToRange;
function tagsToNodesAndLinks(tags) {
    var nodes = tags.map(function (node) {
        return {
            id: node.parent,
            skill: 5
        };
    });
    var links = tags
        .map(function (node) {
        return node.children.map(function (child) {
            return {
                source: child,
                target: node.parent
            };
        });
    })
        .reduce(function (a, b) { return a.concat(b); });
    return {
        nodes: nodes,
        links: links,
    };
}
exports.tagsToNodesAndLinks = tagsToNodesAndLinks;
// doesnt check for existing target because this is for tags, and we will be generating target nodes depending onthis function
function filterTagLinksByNodes(links, nodes) {
    var nodeIds = nodes.map(function (node) { return node.id; });
    return links.filter(function (link) {
        var searchId = link.source.id ? link.source.id : link.source;
        return nodeIds.includes(searchId);
    });
}
exports.filterTagLinksByNodes = filterTagLinksByNodes;
//https://stackoverflow.com/a/14438954 for what `Set` is doing here
function filterTagNodes(filteredLinks, tagNodes) {
    var tags = Array.from(new Set(filteredLinks.map(function (link) {
        return link.target.id ? link.target.id : link.target;
    })));
    // probably could just return the Set...
    return tagNodes.filter(function (node) { return tags.includes(node.id); });
}
exports.filterTagNodes = filterTagNodes;
/**
 * mutate merge using push
 * push contents of array 2 to array 1
 */
function arrayMerge(arr1, arr2) {
    arr2.forEach(function (item) { return arr1.push(item); });
    return arr1;
}
exports.arrayMerge = arrayMerge;
function isTag(nodeId, tagRelations) {
    var search = tagRelations.map(function (relation) { return relation.parent; });
    return search.includes(nodeId);
}
exports.isTag = isTag;
function hasChild(nodeId, relations, currentNode) {
    if (currentNode) {
        return relations.findIndex(function (relation) { return relation.parent === nodeId; }) > -1 && nodeId !== currentNode;
    }
    return relations.findIndex(function (relation) { return relation.parent === nodeId; }) > -1;
}
exports.hasChild = hasChild;
function generateTagColorMap(tagRelation, tagColorRange) {
    var counter = 0;
    var output = {};
    for (var index = 0; index < tagRelation.length; index++) {
        if (counter > tagColorRange.length - 1) {
            counter = 0;
        }
        counter++;
        output[tagRelation[index].parent] = tagColorRange[counter];
    }
    return output;
}
exports.generateTagColorMap = generateTagColorMap;
function filterTagLinks(links, tagRelations) {
    var search = tagRelations.map(function (relation) { return relation.parent; });
    return links.filter(function (link) {
        var target = link.target.id ? link.target.id : link.target;
        return !search.includes(target);
    });
}
exports.filterTagLinks = filterTagLinks;
//# sourceMappingURL=mindMapHelper.js.map