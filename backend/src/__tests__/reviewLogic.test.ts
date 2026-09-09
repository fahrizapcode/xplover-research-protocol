import { calculateOverallScore } from "../services/reviewService";

describe("Review Logic and Scoring Calculation", () => {
  const perfectReview = {
    accuracyScore: 10,
    relevanceScore: 10,
    clarityScore: 10,
    hookScore: 10,
    valueScore: 10,
    flowScore: 10,
    ctaScore: 10,
    consistencyScore: 10,
  };

  const goodReview = {
    accuracyScore: 8,
    relevanceScore: 8,
    clarityScore: 9,
    hookScore: 8,
    valueScore: 8,
    flowScore: 8,
    ctaScore: 8,
    consistencyScore: 9,
  };

  const failingReview = {
    accuracyScore: 6,
    relevanceScore: 6,
    clarityScore: 5,
    hookScore: 6,
    valueScore: 5,
    flowScore: 6,
    ctaScore: 5,
    consistencyScore: 6,
  };

  test("calculates perfect 10.0 score correctly", () => {
    const score = calculateOverallScore([perfectReview, perfectReview, perfectReview]);
    expect(score).toBe(10.0);
  });

  test("calculates passing overall score (>= 8.0)", () => {
    const score = calculateOverallScore([goodReview, goodReview, goodReview, goodReview, goodReview]);
    expect(score).toBeGreaterThanOrEqual(8.0);
  });

  test("calculates failing overall score (< 8.0)", () => {
    const score = calculateOverallScore([failingReview, failingReview, failingReview, failingReview, failingReview]);
    expect(score).toBeLessThan(8.0);
  });

  test("returns 0 for empty review list", () => {
    const score = calculateOverallScore([]);
    expect(score).toBe(0);
  });
});
