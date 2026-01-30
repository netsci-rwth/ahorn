"use client";

import { ComputedBoxPlot } from "@/components/chart/box-plot";
import ShapeChart from "@/components/chart/shape";
import Stat from "@/components/stat";
import TabBar from "@/components/tab-bar";
import { formatNumber } from "@/utils/format";

export type NetworkViewTabsProps = {
  numNodes: number;
  numEdges: number;
  nodeDegrees?: Record<number, number> | null;
  shape?: number[] | null;
};

export default function NetworkViewTabs({
  numNodes,
  numEdges,
  nodeDegrees = null,
  shape = null,
}: NetworkViewTabsProps) {
  const numSimplices = shape ? shape.reduce((sum, count) => sum + count, 0) : 0;

  return (
    <TabBar label="Domain Type" tabs={["Graph", "Simplicial Complex"]}>
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Graph Statistics
          </h3>
          <dl className="not-prose grid gap-5 sm:grid-cols-2">
            <Stat title="Nodes" value={formatNumber(numNodes)} />
            <Stat title="Node Type" value="Club Members" />
            {nodeDegrees && (
              <ComputedBoxPlot
                title="Node Degree"
                values={nodeDegrees}
                className="sm:col-span-2"
              />
            )}
            <Stat title="Edges" value={formatNumber(numEdges)} />
            <Stat title="Edge Type" value="Friendships" />
          </dl>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Graph Properties
          </h3>
          <dl className="not-prose grid gap-5 sm:grid-cols-2">
            <Stat
              title="Density"
              value={((2 * numEdges) / (numNodes * (numNodes - 1))).toFixed(4)}
            />
          </dl>
        </div>
      </div>
      {shape && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Simplicial Complex Statistics
            </h3>
            <dl className="not-prose grid gap-5 sm:grid-cols-2">
              <Stat title="Nodes" value={formatNumber(shape[0])} />
              <Stat title="Node Type" value="Club Members" />
              <Stat title="Edges" value={formatNumber(shape[1])} />
              <Stat title="Edge Type" value="Friendships" />
              <Stat
                title="Total Simplices"
                value={formatNumber(numSimplices)}
              />
              <Stat title="Max Dimension" value={shape.length - 1} />
            </dl>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Shape by Dimension
            </h3>
            <ShapeChart shape={shape} />
          </div>
        </div>
      )}
    </TabBar>
  );
}
