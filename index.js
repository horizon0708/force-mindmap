"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://medium.freecodecamp.org/d3-and-canvas-in-3-steps-8505c8b27444
const mindMapHelper_1 = require("./mindMapHelper");
const d3 = require("d3");
const mindMapHelper_2 = require("./mindMapHelper");
class CanvasForceMap {
    constructor(selector, nameAndSkills, relations, origin, tags) {
        this.globalAnimationStatus = 0;
        this.currentNode = "Web Dev";
        this.currentLevel = 0;
        this.animationDuration = 100;
        this.linkColor = `#9095a0`;
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
        this.initialSetup = (selector, nameAndSkills, relations, origin, tags) => {
            this.relations = relations;
            this.currentNode = origin;
            this.originNode = origin;
            const nodeAndLinks = this.initialDataToNodesAndLinks(nameAndSkills, relations);
            if (tags) {
                this.tagRelations = tags;
                const tagData = mindMapHelper_1.tagsToNodesAndLinks(tags);
                this.tagLinks = tagData.links;
                this.originalTagLinks = tagData.links;
                this.originalTagNodes = tagData.nodes;
                this.tagColorMap = mindMapHelper_1.generateTagColorMap(tags, this.tagColorRange);
            }
            this.links = nodeAndLinks.links;
            this.originalLinks = this.links;
            this.nodes = nodeAndLinks.nodes;
            this.originalNodes = this.nodes;
            this.animationTimer = new mindMapHelper_1.AnimationTimer(this.animationDuration);
            this.animationTimer.on("timer", d => {
                this.globalAnimationStatus = d;
            });
            this.canvas = document.querySelector(selector);
            this.context = this.canvas.getContext("2d");
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        };
        this.startGraph = () => {
            const { nodes, links } = this.filterNodesAndLinks(this.currentNode);
            if (this.tagLinks && this.tagNodes) {
                this.tagLinks = mindMapHelper_1.filterTagLinksByNodes(this.tagLinks, nodes);
                this.tagNodes = mindMapHelper_1.filterTagNodes(this.tagLinks, this.tagNodes);
                mindMapHelper_1.arrayMerge(nodes, this.tagNodes);
                mindMapHelper_1.arrayMerge(links, this.tagLinks);
            }
            this.simulation = d3
                .forceSimulation()
                .nodes(nodes)
                .force("link", d3
                .forceLink(links)
                .id((d) => d.id)
                .distance(this.linkDistance))
                .force("collide", d3.forceCollide().radius(this.collsionRadius))
                .force("charge", d3.forceManyBody().strength(this.chargeForce))
                .force("center", d3.forceCenter(this.width / 2, this.height / 2))
                .on("tick", this.ticked);
            d3.select(this.canvas).call(d3
                .drag()
                .container(this.canvas)
                .subject(this.dragsubject)
                .on("start", this.click)
                .on("drag", this.dragged)
                .on("end", this.dragended));
            this.update(this.currentNode);
        };
        /**
         * Main mean to update the graph.
         * Could be called after changing a varible to refresh the graph
         * To get the 'exit transition' possible, we save the deleted nodes and give them 'LEAVING' property.
         * Then, we trigger afterAnimationUpdate(), after the animation has triggered to actually take the deleted node outk
         */
        this.update = (currentNodeId) => {
            this.animationTimer.startTimer();
            this.currentNode = currentNodeId;
            this.currentLevel = mindMapHelper_1.getCurrentLevel(currentNodeId, this.originalNodes);
            this.breadcrumb = mindMapHelper_2.getBreadCrumb(this.currentNode, this.originalLinks);
            const { nodes, links } = this.filterNodesAndLinks(currentNodeId);
            if (this.originalTagLinks && this.originalTagNodes) {
                this.tagLinks = mindMapHelper_1.filterTagLinksByNodes(this.originalTagLinks, nodes);
                this.tagNodes = mindMapHelper_1.filterTagNodes(this.tagLinks, this.originalTagNodes);
                mindMapHelper_1.arrayMerge(nodes, this.tagNodes);
                mindMapHelper_1.arrayMerge(links, this.tagLinks);
            }
            this.nodes = mindMapHelper_1.attachAnimationAttributes(this.nodes, nodes);
            setTimeout(() => {
                this.afterAnimationUpdate(this.currentNode);
            }, this.animationDuration);
            this.simulation.nodes(this.nodes, (d) => {
                return d.id;
            });
            this.simulation
                .force("link")
                .links(links, (d) => d.source + "-" + d.target);
            this.simulation.alpha(1).restart();
        };
        this.afterAnimationUpdate = (currentNodeId) => {
            const { links, nodes } = this.filterNodesAndLinks(currentNodeId);
            if (this.originalTagLinks && this.originalTagNodes) {
                this.tagLinks = mindMapHelper_1.filterTagLinksByNodes(this.originalTagLinks, nodes);
                this.tagNodes = mindMapHelper_1.filterTagNodes(this.tagLinks, this.originalTagNodes);
                mindMapHelper_1.arrayMerge(nodes, this.tagNodes);
                mindMapHelper_1.arrayMerge(links, this.tagLinks);
            }
            this.nodes = nodes;
            this.links = links;
            this.simulation.nodes(this.nodes, (d) => {
                return d.id;
            });
            this.simulation.force("link").links(links, (d) => d.source + "-" + d.target);
            this.simulation.alpha(1).restart();
        };
        /**
         * Updates the current node to the current node's parent
         * In other words, Go up the tree by on node.
         */
        this.gotoParentNode = () => {
            const parent = mindMapHelper_1.getParent(this.currentNode, this.originalLinks);
            if (parent) {
                this.update(parent);
            }
        };
        this.gotoNode = (nodeId) => {
            const ind = this.originalNodes.findIndex(node => node.id === nodeId);
            if (ind > -1) {
                this.update(nodeId);
            }
            else {
                console.error(`gotoNode(): the node ${nodeId} does not exist!`);
            }
        };
        /**
         * This is what gets called each frame of force simulation, we use this to draw on canvas
         */
        this.ticked = () => {
            this.context.clearRect(0, 0, this.width, this.height);
            this.context.beginPath();
            if (this.tagRelations) {
                mindMapHelper_1.filterTagLinks(this.links, this.tagRelations).forEach(this.drawLink);
            }
            else {
                this.links.forEach(this.drawLink);
            }
            this.context.lineWidth = this.linkWidth;
            this.context.strokeStyle = mindMapHelper_1.addTransparency(this.linkColor, 0.2);
            this.context.stroke();
            this.context.beginPath();
            this.nodes.forEach(this.drawNode);
            if (this.originalTagLinks && this.originalTagNodes) {
                this.tagLinks.forEach(this.drawTagLink);
                this.context.beginPath();
                this.tagNodes.forEach(this.drawNode);
            }
        };
        this.drawLink = (d) => {
            const sourcex = mindMapHelper_1.restrainToRange(d.source.x, 0, this.width);
            const sourcey = mindMapHelper_1.restrainToRange(d.source.y, 0, this.height);
            const targetX = mindMapHelper_1.restrainToRange(d.target.x, 0, this.width);
            const targetY = mindMapHelper_1.restrainToRange(d.target.y, 0, this.height);
            this.context.moveTo(sourcex, sourcey);
            this.context.lineTo(targetX, targetY);
        };
        this.drawTagLink = (d) => {
            this.context.beginPath();
            const sourcex = mindMapHelper_1.restrainToRange(d.source.x, 0, this.width);
            const sourcey = mindMapHelper_1.restrainToRange(d.source.y, 0, this.height);
            const targetX = mindMapHelper_1.restrainToRange(d.target.x, 0, this.width);
            const targetY = mindMapHelper_1.restrainToRange(d.target.y, 0, this.height);
            this.context.moveTo(sourcex, sourcey);
            this.context.lineTo(targetX, targetY);
            this.context.strokeStyle = mindMapHelper_1.addTransparency(this.tagColorMap[d.target.id], 0.2);
            this.context.stroke();
        };
        this.drawNode = (d) => {
            this.context.moveTo(d.x + 3, d.y);
            this.setTextContext(d);
            this.context.textAlign = this.textAlign;
            this.context.lineWidth = this.textStrokeWidth;
            this.context.strokeStyle = mindMapHelper_1.hasChild(d.id, this.relations, this.currentNode)
                ? this.parentStrokeColor
                : this.strokeColor;
            const x = mindMapHelper_1.restrainToRange(d.x, 0, this.width);
            const y = mindMapHelper_1.restrainToRange(d.y, 0, this.height);
            this.context.strokeText(d.id, x, y);
            this.context.fillText(d.id, x, y);
        };
        this.setTextContext = (node) => {
            const fontSize = mindMapHelper_1.isTag(node.id, this.tagRelations)
                ? this.tagFontSize
                : mindMapHelper_1.getFontSizeToLevel(node.level, this.currentLevel, this.fontSizeRange);
            this.context.fillStyle = mindMapHelper_1.isTag(node.id, this.tagRelations)
                ? mindMapHelper_1.addTransparency(this.tagColorMap[node.id], this.globalAnimationStatus)
                : mindMapHelper_1.addTransparency(mindMapHelper_1.getTextColor(node.skill, this.textColorRange), this.globalAnimationStatus);
            this.context.textAlign = "center";
            if (node.status === "ENTERING") {
                this.context.font = `${this.fontWeight} ${fontSize *
                    this.globalAnimationStatus}px ${this.fontFamily}`;
            }
            else if (node.status === "LEAVING") {
                this.context.font = `${this.fontWeight} ${mindMapHelper_1.minCap(fontSize)}px ${this.fontFamily}`;
            }
            else {
                this.context.fillStyle = mindMapHelper_1.isTag(node.id, this.tagRelations)
                    ? this.tagColorMap[node.id]
                    : mindMapHelper_1.getTextColor(node.skill, this.textColorRange);
                this.context.font = `${this.fontWeight} ${fontSize}px ${this.fontFamily}`;
            }
        };
        this.onMouseOver = () => { };
        // drag only
        this.dragstarted = () => {
            if (!d3.event.active)
                this.simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
        };
        this.dragged = () => {
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
        };
        this.dragended = () => {
            if (!d3.event.active)
                this.simulation.alphaTarget(0);
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
        };
        //drag and click
        this.click = () => {
            if (!d3.event.active)
                this.simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
            const target = d3.event.subject.id;
            if (target &&
                mindMapHelper_1.isParent(target, this.relations) &&
                target !== this.currentNode) {
                this.update(target);
            }
        };
        this.dragsubject = () => {
            return this.simulation.find(d3.event.x, d3.event.y);
        };
        /**
         * original nodes, links should be not be touched, but manipulated by this filter
         */
        this.filterNodesAndLinks = (currentNodeId) => {
            const nodeFilter = mindMapHelper_1.getNodeFilter(this.relations, currentNodeId);
            const newRelations = mindMapHelper_1.filterRelations(this.relations, currentNodeId);
            return {
                nodes: mindMapHelper_1.filterNodes(this.originalNodes, nodeFilter),
                links: mindMapHelper_1.toForceLink(newRelations)
            };
        };
        this.initialSetup(selector, nameAndSkills, relations, origin, tags);
    }
    initialDataToNodesAndLinks(namesAndSkills, relations) {
        const nodes = mindMapHelper_1.attachIdAndSkill(namesAndSkills);
        mindMapHelper_1.recursiveLeveling(this.currentNode, relations, nodes, 0);
        return {
            nodes,
            links: mindMapHelper_1.toForceLink(relations)
        };
    }
}
exports.default = CanvasForceMap;
//# sourceMappingURL=canvasMindMap.js.map