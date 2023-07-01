// @ts-ignore
import Graph from 'react-graph-vis';
import { useDarkMode } from '../hooks/useDarkMode';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Course } from '../model/Course';

export const CourseGraph = ({ course }: { course: Course }) => {
  const navigate = useNavigate();

  const [darkMode] = useDarkMode();

  const connected = course?.prerequisites?.map((prereq, i) => {
    return {
      id: i + 2,
      label: prereq.split(' ').join(''),
    };
  });

  const nodes = [
    { id: 1, label: course?._id, title: course?.description },
    ...(connected || []),
  ];

  const graph = {
    nodes,
    edges: [
      ...(connected || []).map((c) => {
        return { from: c.id, to: 1 };
      }),
    ],
  };

  return (
    <Graph
      key={uuidv4()}
      graph={graph}
      options={{
        edges: { color: darkMode ? '#FFFFFF' : '#000000' },
        height: '500px',
        layout: { hierarchical: false },
      }}
      events={{
        select: ({ selected }: { selected: number[] }) => {
          if (nodes.length === 0) return;
          const node = nodes.find((node) => node.id === selected[0]);
          if (node) navigate(`/course/${node.label}`);
        },
      }}
    />
  );
};
