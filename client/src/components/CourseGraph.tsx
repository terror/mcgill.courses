import { useNavigate } from 'react-router-dom';
import VisGraph, { GraphData, Node, Edge } from 'react-vis-graph-wrapper';
import { v4 as uuidv4 } from 'uuid';

import { useDarkMode } from '../hooks/useDarkMode';
import { courseIdToUrlParam } from '../lib/utils';
import { Course } from '../model/Course';

type CourseGraphProps = {
  course: Course;
};

import { ReqNode } from '../model/Requirements';

const makeGraph = (reqs?: ReqNode) => {
  if (!reqs) return { nodes: [], edges: [], root: undefined };

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: ReqNode): string => {
    if (typeof node === 'string') {
      nodes.push({
        id: node,
        label: addSpace(node),
      });
      return node;
    }
    const codes = node.groups.map((group) => traverse(group));
    const id = codes.join(node.operator);

    nodes.push({
      id,
      label: node.operator,
    });
    for (const code of codes) {
      edges.push({ from: code, to: id });
    }
    return id;
  };

  const root = traverse(reqs);

  return { nodes, edges, root };
};

const addSpace = (courseCode: string) =>
  courseCode.slice(0, 4) + ' ' + courseCode.slice(4);

export const CourseGraph = ({ course }: CourseGraphProps) => {
  const navigate = useNavigate();

  const [darkMode] = useDarkMode();

  const {
    nodes: prereqNodes,
    edges: prereqEdges,
    root: prereqRoot,
  } = makeGraph(course.logicalPrerequisites);
  const {
    nodes: coreqNodes,
    edges: coreqEdges,
    root: coreqRoot,
  } = makeGraph(course.logicalCorequisites);

  const leading = course.leadingTo.map((leading) => {
    return {
      id: leading,
      label: addSpace(leading),
    };
  });

  const graphNodes = [
    { id: course._id, label: addSpace(course._id), title: course.description },
    ...prereqNodes,
    ...coreqNodes,
    ...leading,
  ];

  const graph: GraphData = {
    nodes: graphNodes,
    edges: [
      ...prereqEdges,
      ...coreqEdges,
      { from: prereqRoot, to: course._id },
      { from: coreqRoot, to: course._id },
      ...leading.map((leading) => {
        return { from: course._id, to: leading.id };
      }),
    ],
  };

  const navigateToCourse = (nodes: string[]) => {
    if (nodes.length === 0) return;
    const node = graphNodes.find((node) => node.id === nodes[0]);
    if (node && node.label)
      navigate(`/course/${courseIdToUrlParam(node.label)}`);
  };

  return (
    <VisGraph
      key={uuidv4()}
      graph={graph}
      options={{
        edges: { color: darkMode ? '#919191' : '#b1b1b1' },
        height: '500px',
        layout: {
          randomSeed: undefined,
          improvedLayout: true,
          clusterThreshold: 150,
          hierarchical: {
            enabled: true,
            levelSeparation: 150,
            nodeSpacing: 100,
            treeSpacing: 200,
            blockShifting: true,
            edgeMinimization: true,
            parentCentralization: true,
            direction: 'LR',
            sortMethod: 'directed',
            shakeTowards: 'leaves',
          },
        },
        nodes: {
          color: darkMode ? 'rgb(212 212 212)' : 'rgb(226 232 240)',
          shape: 'dot',
          size: 14,
          font: {
            color: darkMode ? '#FFFFFF' : '#000000',
          },
        },
      }}
      events={{
        select: ({ nodes }: { nodes: string[] }) => {
          navigateToCourse(nodes);
        },
        doubleClick: ({ nodes }: { nodes: string[] }) => {
          navigateToCourse(nodes);
        },
      }}
    />
  );
};
