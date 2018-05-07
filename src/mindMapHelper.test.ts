import {
  attachIdAndSkill,
  recursiveLeveling,
  getNodeFilter,
  filterRelations,
  filterNodes,
  toForceLink,
  ForceNode,
  getParent,
  filterTagNodes
} from "./mindMapHelper";
import { nameAndSkills, langRelations, langTags } from "./sampleData";
import {
  tagsToNodesAndLinks,
  filterTagLinksByNodes,
} from "./mindMapHelper";

describe("Node/Relation Filtering", () => {
  const initial = attachIdAndSkill(nameAndSkills);
  recursiveLeveling("Web Dev", langRelations, initial, 0);
  let casted = initial as ForceNode[];

  test("filter with root: WebDev ", () => {
    let currNode = "Web Dev";
    const nodeFilter = getNodeFilter(langRelations, currNode);
    let newNodes = filterNodes(casted, nodeFilter);
    let newRelations = filterRelations(langRelations, currNode);
    expect(newNodes.length).toBe(6);
    expect(newRelations.length).toBe(2);
  });

  test("filter with FrontEnd", () => {
    let currNode = "FrontEnd";
    const nodeFilter = getNodeFilter(langRelations, currNode);
    let newNodes = filterNodes(casted, nodeFilter);
    let newRelations = filterRelations(langRelations, currNode);
    let links = toForceLink(newRelations);
    console.log(newNodes);
    expect(newNodes.length).toBe(17);
    expect(links.length).toBe(16);
  });

  test("filter with deadend: Backend", () => {
    let currNode = "BackEnd";
    const nodeFilter = getNodeFilter(langRelations, currNode);
    let newNodes = filterNodes(casted, nodeFilter);
    let newRelations = filterRelations(langRelations, currNode);
    expect(newNodes.length).toBe(1);
    expect(newRelations.length).toBe(0);
  });
});

describe("getParent()", () => {
  const initial = attachIdAndSkill(nameAndSkills);
  recursiveLeveling("Web Dev", langRelations, initial, 0);
  let casted = initial as ForceNode[];
  test("edge case: already a top level", () => {
    let currNode = "Web Dev";
    const nodeFilter = getNodeFilter(langRelations, currNode);
    let newNodes = filterNodes(casted, nodeFilter);
    let newRelations = filterRelations(langRelations, currNode);
    const links = toForceLink(newRelations);
    expect(getParent(currNode, links)).toBe(null);
  });
  test("gets parent", () => {
    let currNode = "Web Dev";
    const nodeFilter = getNodeFilter(langRelations, currNode);
    let newNodes = filterNodes(casted, nodeFilter);
    let newRelations = filterRelations(langRelations, currNode);
    const links = toForceLink(newRelations);
    expect(getParent("FrontEnd", links)).toBe("Web Dev");
    expect(getParent("JavaScript", links)).toBe("FrontEnd");
  });
});

describe("tag links and node genration", () => {
  const data = tagsToNodesAndLinks(langTags);
  const currentNodes = [{ id: "Jest" }];
  const filteredLinks = filterTagLinksByNodes(data.links, currentNodes);
  const filteredTags = filterTagNodes(filteredLinks, data.nodes);

  test("filters links", () => {
    expect(filteredLinks).toEqual([
      {
        source: "Jest",
        target: "Testing"
      }
    ]);
  });

  test("filters tags", () => {
    expect(filteredTags).toEqual([
      {
        id: "Testing",
        skill: 5
      }
    ]);
  });
});
