import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { tenderSchema } from "../utils/validationSchemas";
import { createTender, updateTender } from "../api/tenderApi";
import "./TenderForm.css";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

const TenderForm = ({ mode, initialTender, onSuccess, onCancel }) => {
  const isEdit = mode === "edit";

  const [submitError, setSubmitError] = useState("");
  const [docsToDelete, setDocsToDelete] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(tenderSchema),
    defaultValues: isEdit
      ? {
          title: initialTender.title,
          description: initialTender.description,
          department: initialTender.department,
          category: initialTender.category,
          budget: initialTender.budget,
          deadline: initialTender.deadline?.slice(0, 10),
        }
      : undefined,
  });

  const validateFiles = (fileList) => {
    if (fileList.length > MAX_FILES) {
      return `You can attach at most ${MAX_FILES} files`;
    }
    for (const file of fileList) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return `${file.name} is not an allowed file type (pdf, doc, docx, jpeg, png only)`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name} exceeds the 10MB size limit`;
      }
    }
    return null;
  };

  const toggleDocForDeletion = (docId) => {
    setDocsToDelete((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const onSubmit = async (formValues) => {
    setSubmitError("");
    const fileList = formValues.documents;

    if (fileList && fileList.length > 0) {
      const fileError = validateFiles(fileList);
      if (fileError) {
        setSubmitError(fileError);
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", formValues.title);
    formData.append("description", formValues.description);
    formData.append("department", formValues.department);
    formData.append("category", formValues.category);
    formData.append("budget", formValues.budget);
    formData.append("deadline", formValues.deadline);

    if (fileList && fileList.length > 0) {
      Array.from(fileList).forEach((file) => {
        formData.append("documents", file);
      });
    }

    try {
      let saved;
      if (isEdit) {
        if (docsToDelete.length > 0) {
          formData.append("documentsToDelete", JSON.stringify(docsToDelete));
        }
        saved = await updateTender(initialTender._id, formData);
      } else {
        saved = await createTender(formData);
      }
      onSuccess(saved);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <section className="tender-form-section">
      <h2>{isEdit ? "Edit Tender" : "Create Tender"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input id="title" {...register("title")} />
          {errors.title && (
            <p className="field-error">{errors.title.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" {...register("description")} />
          {errors.description && (
            <p className="field-error">{errors.description.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="department">Department</label>
          <input id="department" {...register("department")} />
          {errors.department && (
            <p className="field-error">{errors.department.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="category">Category</label>
          <input id="category" {...register("category")} />
          {errors.category && (
            <p className="field-error">{errors.category.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="budget">Budget</label>
          <input
            id="budget"
            type="number"
            step="0.01"
            {...register("budget")}
          />
          {errors.budget && (
            <p className="field-error">{errors.budget.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="deadline">Deadline</label>
          <input id="deadline" type="date" {...register("deadline")} />
          {errors.deadline && (
            <p className="field-error">{errors.deadline.message}</p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="documents">
            Documents {isEdit ? "(new files to add)" : ""}
          </label>
          <input
            id="documents"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
            {...register("documents")}
          />
        </div>

        {isEdit && initialTender.documents?.length > 0 && (
          <div className="existing-docs">
            <p>Existing documents (check to remove):</p>
            {initialTender.documents.map((doc) => (
              <label key={doc._id} className="existing-doc-item">
                <input
                  type="checkbox"
                  checked={docsToDelete.includes(doc._id)}
                  onChange={() => toggleDocForDeletion(doc._id)}
                />
                {doc.fileName}
              </label>
            ))}
          </div>
        )}

        {submitError && <p className="field-error">{submitError}</p>}

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Update Tender"
                : "Create Tender"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default TenderForm;
