import { validateStatusTransition } from "../services/contentService";
import { ContentStatus } from "@prisma/client";
import { ValidationError } from "../utils/errors";

describe("Content Workflow State Transitions", () => {
  test("allows DRAFT -> SUBMITTED", () => {
    expect(() => {
      validateStatusTransition(ContentStatus.DRAFT, ContentStatus.SUBMITTED);
    }).not.toThrow();
  });

  test("allows SUBMITTED -> UNDER_REVIEW", () => {
    expect(() => {
      validateStatusTransition(ContentStatus.SUBMITTED, ContentStatus.UNDER_REVIEW);
    }).not.toThrow();
  });

  test("allows UNDER_REVIEW -> APPROVED and REVISION_REQUIRED", () => {
    expect(() => {
      validateStatusTransition(ContentStatus.UNDER_REVIEW, ContentStatus.APPROVED);
    }).not.toThrow();
    expect(() => {
      validateStatusTransition(ContentStatus.UNDER_REVIEW, ContentStatus.REVISION_REQUIRED);
    }).not.toThrow();
  });

  test("allows APPROVED -> READY_FOR_VISUAL -> IN_VISUAL_DESIGN -> VISUAL_COMPLETED -> PUBLISHED", () => {
    expect(() => {
      validateStatusTransition(ContentStatus.APPROVED, ContentStatus.READY_FOR_VISUAL);
      validateStatusTransition(ContentStatus.READY_FOR_VISUAL, ContentStatus.IN_VISUAL_DESIGN);
      validateStatusTransition(ContentStatus.IN_VISUAL_DESIGN, ContentStatus.VISUAL_COMPLETED);
      validateStatusTransition(ContentStatus.VISUAL_COMPLETED, ContentStatus.PUBLISHED);
    }).not.toThrow();
  });

  test("rejects illegal transitions like DRAFT directly to PUBLISHED", () => {
    expect(() => {
      validateStatusTransition(ContentStatus.DRAFT, ContentStatus.PUBLISHED);
    }).toThrow(ValidationError);
  });

  test("rejects jumping from UNDER_REVIEW to PUBLISHED", () => {
    expect(() => {
      validateStatusTransition(ContentStatus.UNDER_REVIEW, ContentStatus.PUBLISHED);
    }).toThrow(ValidationError);
  });
});
