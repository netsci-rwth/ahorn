/**
 * Computes the Euclidean distance between a class-probability distribution
 * and a perfectly uniform distribution.
 *
 * @param distribution Probability values per class (typically summing to 1).
 * @param uniform Expected probability for each class in a uniform distribution.
 * @returns Non-negative distance; `0` means perfectly uniform.
 */
function euclideanDistanceToUniform(distribution: number[], uniform: number): number {
  return Math.sqrt(
    distribution.reduce(
      (sum, probability) => sum + Math.pow(probability - uniform, 2),
      0,
    ),
  );
}

/**
 * Calculates the imbalance degree for class labels based on distance from uniformity.
 *
 * The function:
 * - ignores classes with non-positive counts,
 * - returns `0` when imbalance is undefined/trivial (no samples or <= 1 class),
 * - normalizes the observed distance against a class-dependent maximum distance,
 * - adds an offset based on the number of minority classes.
 *
 * @param labels Mapping of class label to sample count.
 * @returns Imbalance degree where `0` indicates balanced distribution; larger values indicate stronger imbalance.
 */
export default function imbalanceDegree(labels: Record<string, number>): number {
  const counts = Object.values(labels).filter((count) => count > 0);
  const totalCount = counts.reduce((sum, count) => sum + count, 0);

  if (counts.length <= 1 || totalCount === 0) {
    return 0;
  }

  const classCount = counts.length;
  const uniformProbability = 1 / classCount;
  const distribution = counts.map((count) => count / totalCount);
  const minorityClassCount = distribution.filter(
    (probability) => probability < uniformProbability,
  ).length;
  const distance = euclideanDistanceToUniform(distribution, uniformProbability);

  if (distance === 0) {
    return 0;
  }

  const mostImbalancedDistribution = [
    ...Array(minorityClassCount).fill(0),
    ...Array(classCount - minorityClassCount - 1).fill(uniformProbability),
    1 - (classCount - minorityClassCount - 1) / classCount,
  ];
  const maxDistance = euclideanDistanceToUniform(
    mostImbalancedDistribution,
    uniformProbability,
  );

  return distance / maxDistance + (minorityClassCount - 1);
}
