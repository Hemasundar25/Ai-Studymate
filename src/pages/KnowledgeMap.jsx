import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { curriculumData } from '../data/curriculum';

export function KnowledgeMap({ data }) {
  const navigate = useNavigate();
  const subjects = Object.keys(curriculumData);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

  const currentNodes = curriculumData[selectedSubject] || curriculumData['JEE Mathematics'];
  const [selectedNode, setSelectedNode] = useState(currentNodes[0]);

  // Merge student's weak topics from personalization engine into node status
  const weakTopicNames = data?.personalization?.weakTopics?.map((t) => t.topic) || [];

  const nodes = currentNodes.map((node) => ({
    ...node,
    status: weakTopicNames.includes(node.title) ? 'weak' : node.status,
  }));

  const activeNode = nodes.find((n) => n.id === selectedNode?.id) || nodes[0];

  // Helper to draw connecting paths between prerequisite nodes and current node
  const renderEdges = () => {
    const edges = [];
    nodes.forEach((node) => {
      if (node.prerequisites && node.prerequisites.length) {
        node.prerequisites.forEach((prereqId) => {
          const prereqNode = nodes.find((n) => n.id === prereqId);
          if (prereqNode) {
            edges.push(
              <line
                key={`${prereqId}->${node.id}`}
                x1={prereqNode.x}
                y1={prereqNode.y}
                x2={node.x}
                y2={node.y}
                className="map-edge"
              />
            );
          }
        });
      }
    });
    return edges;
  };

  return (
    <div>
      <div className="page-intro">
        <div>
          <span className="eyebrow">CURRICULUM PREREQUISITE GRAPH</span>
          <h1>See the structure of your syllabus.</h1>
          <p>
            Concepts build upon prior foundations. Follow the dependency path to eliminate knowledge
            gaps systematically.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Curriculum:</span>
          <select
            className="compact-select"
            value={selectedSubject}
            onChange={(e) => {
              const sub = e.target.value;
              setSelectedSubject(sub);
              setSelectedNode(curriculumData[sub][0]);
            }}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="map-layout">
        <Card className="map-card">
          <svg
            className="curriculum-svg"
            viewBox="0 0 800 420"
            role="img"
            aria-label={`${selectedSubject} curriculum graph`}
          >
            {/* Draw prerequisite connector lines */}
            {renderEdges()}

            {/* Draw nodes */}
            {nodes.map((node) => {
              const isSelected = activeNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  className="map-node"
                  tabIndex="0"
                  onClick={() => setSelectedNode(node)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="32"
                    className={`node-circle ${node.status}`}
                    style={
                      isSelected
                        ? { stroke: '#5b5bf7', strokeWidth: 4, filter: 'drop-shadow(0 4px 10px rgba(91,91,247,0.4))' }
                        : {}
                    }
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    className="node-icon"
                  >
                    {node.status === 'locked'
                      ? '🔒'
                      : node.status === 'completed'
                      ? '✓'
                      : node.status === 'weak'
                      ? '!'
                      : '✦'}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 54}
                    textAnchor="middle"
                    className="node-title"
                  >
                    {node.title}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="map-legend" style={{ marginTop: 20 }}>
            <span>
              <i className="map-dot completed" /> Completed
            </span>
            <span>
              <i className="map-dot current" /> Current / Unlocked
            </span>
            <span>
              <i className="map-dot weak" /> Needs Practice
            </span>
            <span>
              <i className="map-dot locked" /> Locked Prerequisite
            </span>
          </div>
        </Card>

        <Card className="concept-panel">
          <div className={`concept-status ${activeNode.status}`}>
            <span className="status-dot" /> {activeNode.status}
          </div>

          <h2>{activeNode.title}</h2>
          <p style={{ marginTop: 10, lineHeight: 1.7 }}>{activeNode.detail}</p>

          <div className="concept-meta">
            <span>Direct Prerequisites:</span>
            <div>
              {activeNode.prerequisites && activeNode.prerequisites.length ? (
                activeNode.prerequisites.map((pId) => {
                  const prereq = nodes.find((n) => n.id === pId);
                  return (
                    <Badge key={pId} tone="indigo">
                      {prereq ? prereq.title : pId}
                    </Badge>
                  );
                })
              ) : (
                <Badge tone="teal">Foundational (No prior prerequisites)</Badge>
              )}
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <p className="recommendation-copy" style={{ marginBottom: 16 }}>
              {activeNode.status === 'locked'
                ? 'Complete the preceding prerequisite topics to unlock this concept.'
                : activeNode.status === 'weak'
                ? 'High priority: target this topic in your next quiz lab session.'
                : 'Ready for practice: test your fluency with adaptive questions.'}
            </p>

            <Button
              icon={Play}
              disabled={activeNode.status === 'locked'}
              onClick={() =>
                navigate(`/quiz?topic=${encodeURIComponent(activeNode.title)}`)
              }
            >
              Practice {activeNode.title}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default KnowledgeMap;
