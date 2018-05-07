import { Relation } from './mindMapHelper';
export const nameAndSkills = [
  ["Web Dev", 5],
  ["FrontEnd", 5],
  ["JavaScript", 5],
  ["TypeScript", 5],
  ["ES6", 5],
  ["React", 5],
  ["MoBX", 4],
  ["Redux", 4],
  ["Gatsby", 3],
  ["Flux", 4],
  ["D3", 4],
  ["SVG", 3],
  ["Jest", 4],
  ["Enzyme", 4],
  ["Webpack", 3],
  ["Gulp", 1],
  ["HTML5", 5],
  ["CSS", 5],
  ["SCSS", 5],
  ["Bootstrap", 5],
  ["Bulma", 5],
  ["BackEnd", 4],
  ["Glamorous", 1],
  ["Mocha", 3],
  ["Chai", 2],
  ["Jasmine", 3],
  ["Styled-Components", 3],
  ["JSS", 2],
];

export const langRelations: Relation[] = [
  {
    parent: "Web Dev",
    children: ["FrontEnd", "BackEnd"]
  },
  {
    parent: "FrontEnd",
    children: ["JavaScript", "CSS", "HTML5"]
  },
  {
    parent: "JavaScript",
    children: ["TypeScript", "ES6", "React", "D3", "SVG", "Jest", "Webpack", "Mocha", "Chai", "Jasmine"]
  },
  {
    parent: "React",
    children: ["MoBX", "Redux", "Gatsby", "Flux", "Enzyme", "Styled-Components", "JSS", "Glamorous"]
  },
  {
    parent: "CSS",
    children: ["SCSS", "Bootstrap", "Bulma"]
  }
];

export const langTags: Relation[] = [
  {
    parent: "State Management",
    children: ["MoBX", "Flux", "Redux"]
  },
  {
    parent: "Testing",
    children: ["Mocha", "Chai", "Jasmine", "Jest", "Enzyme"]
  },
  {
    parent: "Styling",
    children: ["Styled-Components", "JSS", "Glamorous"] 
  },
  {
    parent: "Task Runner",
    children: ["Webpack", "Gulp"]
  }
]