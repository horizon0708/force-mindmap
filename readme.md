#What is this?

work in progress

#Installation

Installation is a work in progress, as I currently have no clue on|
1. include typings files with js so that IDEs can identify
2. creating a UMD version (I cant seem to the the babel-loader working) especially with d3.

It should, for now, work with 
```
npm install -s force-mindmap
```
or
```
yarn add force-mindmap
```

or of course, you can just take `canvasMindMap.ts` and `mindMapHelper.ts` and compile them yourself.


#Basic Usage
 
```
import * as ForceMindMap from 'force-mindmap';

...


```

#Using with React
* This module does not support server side rendering*
If you are making a React app that is rendering serverside, you need to make sure to initialise and call `startGraph()` on `componentDidMount()`.

An example React App (built with GatsbyJS) is available [here]()

#APIs

## startGraph()
Start simulation for the graph.

## gotoParentNode()
Go to the parent node (go up one level). This is used to implement a back button.

## gotoNode(nodeName| __string__) 
Go to `nodeName` node used to navigate to any node. You can use this with bread crumb to create a navigable breadcrumb.

## breadcrumb| __string[]__
Returns breadcrumb(list of all parent nodes) for the current node.
For example, imagine a node structure like `grandfather -> father -> child`.
For `child`, this will return `["father", "grandfather"]`.
for `father`, this will return `["grandfater"]`.
for `grandfather`, this will return `[]`.

#Customisation/ Setup
Force-Mindmap exposes various variables for you to configure mindmap in various ways. Most are pretty self explanatory.

property name | type | default 
--- | --- | --- 
animationDuration | number | 100
linkColor | number | #9095a0
linkWidth | number | 2
textColorRange | string[] | [ "#72dbe5,#62abd6","#5fa7dd","#4678c4","#284a96"]
strokeColor| string | "#FFF";
parentStrokeColor| string | "#b6ead9";
textStrokeWidth| number | 5;
textAlign| string | "center";
fontSizeRange| number[] | [60, 35, 20];
fontFamily| string | "Open Sans";
fontWeight| valid css fontWeight option | "bolder"
tagColorRange| string[] | ["#abf4cb","#a9f466","#f25c5c","#f4c2ab","#b47cea","#ffb5f0","#fbffc1","#ffb349"];
tagFontSize| number | 20;
collsionRadius| number | 55;
chargeForce| number | -100;
linkDistance| number | 160;

