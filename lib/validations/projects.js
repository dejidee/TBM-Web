import * as Yup from "yup";

/**
 * "Make into a project" from a design card, POST /projects. There's no
 * backend link between a design and a project (BACKLOG.md #5) — this just
 * pre-fills a new project from the design's prompt/roomType.
 */
export const createProjectSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name cannot exceed 100 characters")
    .required("Project name is required"),

  roomType: Yup.string().trim().required("Room type is required"),

  startDate: Yup.date().nullable(),

  totalBudget: Yup.number()
    .typeError("Enter a number")
    .positive("Must be greater than 0")
    .nullable(),
});
