import classNames from "classnames";

import Surface from "@/components/surface";
import { formatNumber } from "@/utils/format";

export type SimplicialShapeTableProps = {
  shape: number[];
  className?: string;
};

function simplexName(dimension: number): string {
  const names = ["Vertices", "Edges", "Triangles", "Tetrahedra"];
  return names[dimension] ?? `${dimension}-Simplices`;
}

export default function SimplicialShapeTable({
  shape,
  className = "",
}: SimplicialShapeTableProps) {
  const totalSimplices = shape.reduce((sum, count) => sum + count, 0);

  return (
    <Surface
      as="section"
      variant="secondary"
      className={classNames("not-prose", className)}
    >
      <div className="max-h-128 overflow-auto">
        <table className="w-full min-w-136 border-collapse text-sm">
          <thead className="sticky top-0 z-10 border-b border-black-25 bg-black-10/95 text-left text-xs font-semibold tracking-wide text-black-50 uppercase backdrop-blur dark:border-black-75 dark:bg-black-100/95 dark:text-black-50">
            <tr>
              <th className="w-28 py-2 pr-4 pl-4">Dimension</th>
              <th className="py-2 pr-4">Simplex Type</th>
              <th className="py-2 pr-4 text-right">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black-10 dark:divide-black-75/45">
            {shape.map((count, dimension) => (
              <tr
                key={dimension}
                className="odd:bg-white/25 dark:odd:bg-white/3"
              >
                <td className="py-2.5 pr-4 pl-4 font-medium text-black-100 dark:text-white">
                  {dimension}
                </td>
                <td className="py-2.5 pr-4 text-black-75 dark:text-black-25">
                  {simplexName(dimension)}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-xs whitespace-nowrap text-black-100 tabular-nums dark:text-white">
                  {formatNumber(count)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 border-t border-black-25 bg-black-10/95 text-black-100 backdrop-blur dark:border-black-75 dark:bg-black-100/95 dark:text-white">
            <tr>
              <td
                colSpan={2}
                className="py-2.5 pr-4 pl-4 text-xs font-semibold tracking-wide uppercase"
              >
                Total Simplices
              </td>
              <td className="py-2.5 pr-4 text-right font-mono text-xs font-semibold whitespace-nowrap tabular-nums">
                {formatNumber(totalSimplices)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Surface>
  );
}
