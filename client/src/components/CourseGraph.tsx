import VisGraph, { GraphData } from 'react-vis-graph-wrapper';
import { Course } from '../model/Course';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export const CourseGraph = ({ course }: { course: Course }) => {
  const navigate = useNavigate();

  const [darkMode] = useDarkMode();

  const connected = course?.prerequisites?.map((prereq, i) => {
    return {
      id: i + 2,
      label: prereq.split(' ').join(''),
    };
  });

  const graphNodes = [
    { id: 1, label: course?._id, title: course?.description },
    ...(connected || []),
  ];

  const graph: GraphData = {
    nodes: graphNodes,
    edges: [
      ...(connected || []).map((c) => {
        return { from: c.id, to: 1 };
      }),
    ],
  };

  const navigateToCourse = (nodes: number[]) => {
    if (nodes.length === 0) return;
    const node = graphNodes.find((node) => node.id === nodes[0]);
    if (node) navigate(`/course/${node.label}`);
  };

  return (
    <VisGraph
      key={uuidv4()}
      graph={graph}
      options={{
        edges: { color: darkMode ? '#FFFFFF' : '#000000' },
        height: '500px',
        layout: { hierarchical: false },
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
