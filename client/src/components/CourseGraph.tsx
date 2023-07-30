import { useNavigate } from 'react-router-dom';
import VisGraph, { GraphData } from 'react-vis-graph-wrapper';
import { v4 as uuidv4 } from 'uuid';

import { useDarkMode } from '../hooks/useDarkMode';
import { courseIdToUrlParam } from '../lib/utils';
import { Course } from '../model/Course';

type CourseGraphProps = {
  course: Course;
};

export const CourseGraph = ({ course }: CourseGraphProps) => {
  const navigate = useNavigate();

  const [darkMode] = useDarkMode();

  let id = 2;

  const prerequisites = course.prerequisites.map((prerequisite) => {
    return {
      id: id++,
      label: prerequisite,
    };
  });

  const leading = course.leadingTo.map((leading) => {
    return {
      id: id++,
      label: leading,
    };
  });

  const graphNodes = [
    { id: 1, label: course._id, title: course.description },
    ...prerequisites,
    ...leading,
  ];

  const graph: GraphData = {
    nodes: graphNodes,
    edges: [
      ...prerequisites.map((prerequisite) => {
        return { from: prerequisite.id, to: 1 };
      }),
      ...leading.map((leading) => {
        return { from: 1, to: leading.id };
      }),
    ],
  };

  const navigateToCourse = (nodes: number[]) => {
    if (nodes.length === 0) return;
    const node = graphNodes.find((node) => node.id === nodes[0]);
    if (node) navigate(`/course/${courseIdToUrlParam(node.label)}`);
  };

  return (
    <VisGraph
      key={uuidv4()}
      graph={graph}
      options={{
        edges: { color: darkMode ? '#FFFFFF' : '#000000' },
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
        nodes: { color: darkMode ? 'rgb(212 212 212)' : 'rgb(226 232 240)' },
      }}
      events={{
        select: ({ nodes }: { nodes: number[] }) => {
          navigateToCourse(nodes);
        },
        doubleClick: ({ nodes }: { nodes: number[] }) => {
          navigateToCourse(nodes);
        },
      }}
    />
  );
};
