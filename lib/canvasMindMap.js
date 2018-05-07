"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://medium.freecodecamp.org/d3-and-canvas-in-3-steps-8505c8b27444
var mindMapHelper_1 = require("./mindMapHelper");
var d3 = require("d3");
var mindMapHelper_2 = require("./mindMapHelper");
var CanvasForceMap = /** @class */ (function () {
    function CanvasForceMap(selector, nameAndSkills, relations, origin, tags) {
        var _this = this;
        this.globalAnimationStatus = 0;
        this.currentNode = "Web Dev";
        this.currentLevel = 0;
        this.animationDuration = 100;
        this.linkColor = "#9095a0";
        this.linkWidth = 2;
        this.textColorRange = [
            "#72dbe5",
            "#62abd6",
            "#5fa7dd",
            "#4678c4",
            "#284a96"
        ];
        this.strokeColor = "#FFF";
        this.parentStrokeColor = "#b6ead9";
        this.textStrokeWidth = 5;
        this.textAlign = "center";
        this.fontSizeRange = [60, 35, 20];
        this.fontFamily = "Open Sans";
        this.fontWeight = "bolder";
        // tags
        this.tagColorRange = [
            "#abf4cb",
            "#a9f466",
            "#f25c5c",
            "#f4c2ab",
            "#b47cea",
            "#ffb5f0",
            "#fbffc1",
            "#ffb349"
        ];
        this.tagFontSize = 20;
        //force
        this.collsionRadius = 55;
        this.chargeForce = -100;
        this.linkDistance = 160;
        this.initialSetup = function (selector, nameAndSkills, relations, origin, tags) {
            _this.relations = relations;
            var nodeAndLinks = _this.initialDataToNodesAndLinks(nameAndSkills, relations);
            if (tags) {
                _this.tagRelations = tags;
                var tagData = mindMapHelper_1.tagsToNodesAndLinks(tags);
                _this.tagLinks = tagData.links;
                _this.originalTagLinks = tagData.links;
                _this.originalTagNodes = tagData.nodes;
                _this.tagColorMap = mindMapHelper_1.generateTagColorMap(tags, _this.tagColorRange);
            }
            _this.currentNode = origin;
            _this.originNode = origin;
            _this.links = nodeAndLinks.links;
            _this.originalLinks = _this.links;
            _this.nodes = nodeAndLinks.nodes;
            _this.originalNodes = _this.nodes;
            _this.animationTimer = new mindMapHelper_1.AnimationTimer(_this.animationDuration);
            _this.animationTimer.on("timer", function (d) {
                _this.globalAnimationStatus = d;
            });
            _this.canvas = document.querySelector(selector);
            _this.context = _this.canvas.getContext("2d");
            _this.width = _this.canvas.width;
            _this.height = _this.canvas.height;
        };
        this.startGraph = function () {
            var _a = _this.filterNodesAndLinks(_this.currentNode), nodes = _a.nodes, links = _a.links;
            if (_this.tagLinks && _this.tagNodes) {
                _this.tagLinks = mindMapHelper_1.filterTagLinksByNodes(_this.tagLinks, nodes);
                _this.tagNodes = mindMapHelper_1.filterTagNodes(_this.tagLinks, _this.tagNodes);
                mindMapHelper_1.arrayMerge(nodes, _this.tagNodes);
                mindMapHelper_1.arrayMerge(links, _this.tagLinks);
            }
            _this.simulation = d3
                .forceSimulation()
                .nodes(nodes)
                .force("link", d3
                .forceLink(links)
                .id(function (d) { return d.id; })
                .distance(_this.linkDistance))
                .force("collide", d3.forceCollide().radius(_this.collsionRadius))
                .force("charge", d3.forceManyBody().strength(_this.chargeForce))
                .force("center", d3.forceCenter(_this.width / 2, _this.height / 2))
                .on("tick", _this.ticked);
            d3.select(_this.canvas).call(d3
                .drag()
                .container(_this.canvas)
                .subject(_this.dragsubject)
                .on("start", _this.click)
                .on("drag", _this.dragged)
                .on("end", _this.dragended));
            _this.update(_this.currentNode);
        };
        /**
         * Main mean to update the graph.
         * Could be called after changing a varible to refresh the graph
         * To get the 'exit transition' possible, we save the deleted nodes and give them 'LEAVING' property.
         * Then, we trigger afterAnimationUpdate(), after the animation has triggered to actually take the deleted node outk
         */
        this.update = function (currentNodeId) {
            _this.animationTimer.startTimer();
            _this.currentNode = currentNodeId;
            _this.currentLevel = mindMapHelper_1.getCurrentLevel(currentNodeId, _this.originalNodes);
            _this.breadcrumb = mindMapHelper_2.getBreadCrumb(_this.currentNode, _this.originalLinks);
            var _a = _this.filterNodesAndLinks(currentNodeId), nodes = _a.nodes, links = _a.links;
            if (_this.originalTagLinks && _this.originalTagNodes) {
                _this.tagLinks = mindMapHelper_1.filterTagLinksByNodes(_this.originalTagLinks, nodes);
                _this.tagNodes = mindMapHelper_1.filterTagNodes(_this.tagLinks, _this.originalTagNodes);
                mindMapHelper_1.arrayMerge(nodes, _this.tagNodes);
                mindMapHelper_1.arrayMerge(links, _this.tagLinks);
            }
            _this.nodes = mindMapHelper_1.attachAnimationAttributes(_this.nodes, nodes);
            setTimeout(function () {
                _this.afterAnimationUpdate(_this.currentNode);
            }, _this.animationDuration);
            _this.simulation.nodes(_this.nodes, function (d) {
                return d.id;
            });
            _this.simulation
                .force("link")
                .links(links, function (d) { return d.source + "-" + d.target; });
            _this.simulation.alpha(1).restart();
        };
        this.afterAnimationUpdate = function (currentNodeId) {
            var _a = _this.filterNodesAndLinks(currentNodeId), links = _a.links, nodes = _a.nodes;
            if (_this.originalTagLinks && _this.originalTagNodes) {
                _this.tagLinks = mindMapHelper_1.filterTagLinksByNodes(_this.originalTagLinks, nodes);
                _this.tagNodes = mindMapHelper_1.filterTagNodes(_this.tagLinks, _this.originalTagNodes);
                mindMapHelper_1.arrayMerge(nodes, _this.tagNodes);
                mindMapHelper_1.arrayMerge(links, _this.tagLinks);
            }
            _this.nodes = nodes;
            _this.links = links;
            _this.simulation.nodes(_this.nodes, function (d) {
                return d.id;
            });
            _this.simulation.force("link").links(links, function (d) { return d.source + "-" + d.target; });
            _this.simulation.alpha(1).restart();
        };
        /**
         * Updates the current node to the current node's parent
         * In other words, Go up the tree by on node.
         */
        this.gotoParentNode = function () {
            var parent = mindMapHelper_1.getParent(_this.currentNode, _this.originalLinks);
            if (parent) {
                _this.update(parent);
            }
        };
        this.gotoNode = function (nodeId) {
            var ind = _this.originalNodes.findIndex(function (node) { return node.id === nodeId; });
            if (ind > -1) {
                _this.update(nodeId);
            }
            else {
                console.error("gotoNode(): the node " + nodeId + " does not exist!");
            }
        };
        /**
         * This is what gets called each frame of force simulation, we use this to draw on canvas
         */
        this.ticked = function () {
            _this.context.clearRect(0, 0, _this.width, _this.height);
            _this.context.beginPath();
            if (_this.tagRelations) {
                mindMapHelper_1.filterTagLinks(_this.links, _this.tagRelations).forEach(_this.drawLink);
            }
            else {
                _this.links.forEach(_this.drawLink);
            }
            _this.context.lineWidth = _this.linkWidth;
            _this.context.strokeStyle = mindMapHelper_1.addTransparency(_this.linkColor, 0.2);
            _this.context.stroke();
            _this.context.beginPath();
            _this.nodes.forEach(_this.drawNode);
            if (_this.originalTagLinks && _this.originalTagNodes) {
                _this.tagLinks.forEach(_this.drawTagLink);
                _this.context.beginPath();
                _this.tagNodes.forEach(_this.drawNode);
            }
        };
        this.drawLink = function (d) {
            var sourcex = mindMapHelper_1.restrainToRange(d.source.x, 0, _this.width);
            var sourcey = mindMapHelper_1.restrainToRange(d.source.y, 0, _this.height);
            var targetX = mindMapHelper_1.restrainToRange(d.target.x, 0, _this.width);
            var targetY = mindMapHelper_1.restrainToRange(d.target.y, 0, _this.height);
            _this.context.moveTo(sourcex, sourcey);
            _this.context.lineTo(targetX, targetY);
        };
        this.drawTagLink = function (d) {
            _this.context.beginPath();
            var sourcex = mindMapHelper_1.restrainToRange(d.source.x, 0, _this.width);
            var sourcey = mindMapHelper_1.restrainToRange(d.source.y, 0, _this.height);
            var targetX = mindMapHelper_1.restrainToRange(d.target.x, 0, _this.width);
            var targetY = mindMapHelper_1.restrainToRange(d.target.y, 0, _this.height);
            _this.context.moveTo(sourcex, sourcey);
            _this.context.lineTo(targetX, targetY);
            _this.context.strokeStyle = mindMapHelper_1.addTransparency(_this.tagColorMap[d.target.id], 0.2);
            _this.context.stroke();
        };
        this.drawNode = function (d) {
            _this.context.moveTo(d.x + 3, d.y);
            _this.setTextContext(d);
            _this.context.textAlign = _this.textAlign;
            _this.context.lineWidth = _this.textStrokeWidth;
            _this.context.strokeStyle = mindMapHelper_1.hasChild(d.id, _this.relations, _this.currentNode)
                ? _this.parentStrokeColor
                : _this.strokeColor;
            var x = mindMapHelper_1.restrainToRange(d.x, 0, _this.width);
            var y = mindMapHelper_1.restrainToRange(d.y, 0, _this.height);
            _this.context.strokeText(d.id, x, y);
            _this.context.fillText(d.id, x, y);
        };
        this.setTextContext = function (node) {
            var fontSize = mindMapHelper_1.isTag(node.id, _this.tagRelations)
                ? _this.tagFontSize
                : mindMapHelper_1.getFontSizeToLevel(node.level, _this.currentLevel, _this.fontSizeRange);
            _this.context.fillStyle = mindMapHelper_1.isTag(node.id, _this.tagRelations)
                ? mindMapHelper_1.addTransparency(_this.tagColorMap[node.id], _this.globalAnimationStatus)
                : mindMapHelper_1.addTransparency(mindMapHelper_1.getTextColor(node.skill, _this.textColorRange), _this.globalAnimationStatus);
            _this.context.textAlign = "center";
            if (node.status === "ENTERING") {
                _this.context.font = _this.fontWeight + " " + fontSize *
                    _this.globalAnimationStatus + "px " + _this.fontFamily;
            }
            else if (node.status === "LEAVING") {
                _this.context.font = _this.fontWeight + " " + mindMapHelper_1.minCap(fontSize) + "px " + _this.fontFamily;
            }
            else {
                _this.context.fillStyle = mindMapHelper_1.isTag(node.id, _this.tagRelations)
                    ? _this.tagColorMap[node.id]
                    : mindMapHelper_1.getTextColor(node.skill, _this.textColorRange);
                _this.context.font = _this.fontWeight + " " + fontSize + "px " + _this.fontFamily;
            }
        };
        this.onMouseOver = function () { };
        // drag only
        this.dragstarted = function () {
            if (!d3.event.active)
                _this.simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
        };
        this.dragged = function () {
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
        };
        this.dragended = function () {
            if (!d3.event.active)
                _this.simulation.alphaTarget(0);
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
        };
        //drag and click
        this.click = function () {
            if (!d3.event.active)
                _this.simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
            var target = d3.event.subject.id;
            if (target &&
                mindMapHelper_1.isParent(target, _this.relations) &&
                target !== _this.currentNode) {
                _this.update(target);
            }
        };
        this.dragsubject = function () {
            return _this.simulation.find(d3.event.x, d3.event.y);
        };
        /**
         * original nodes, links should be not be touched, but manipulated by this filter
         */
        this.filterNodesAndLinks = function (currentNodeId) {
            var nodeFilter = mindMapHelper_1.getNodeFilter(_this.relations, currentNodeId);
            var newRelations = mindMapHelper_1.filterRelations(_this.relations, currentNodeId);
            return {
                nodes: mindMapHelper_1.filterNodes(_this.originalNodes, nodeFilter),
                links: mindMapHelper_1.toForceLink(newRelations)
            };
        };
        this.initialSetup(selector, nameAndSkills, relations, origin, tags);
    }
    CanvasForceMap.prototype.initialDataToNodesAndLinks = function (namesAndSkills, relations) {
        var nodes = mindMapHelper_1.attachIdAndSkill(namesAndSkills);
        mindMapHelper_1.recursiveLeveling(this.currentNode, relations, nodes, 0);
        return {
            nodes: nodes,
            links: mindMapHelper_1.toForceLink(relations)
        };
    };
    return CanvasForceMap;
}());
exports.default = CanvasForceMap;
//# sourceMappingURL=canvasMindMap.js.map