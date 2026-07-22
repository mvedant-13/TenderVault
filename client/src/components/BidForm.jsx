import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { bidSchema } from "../utils/validationSchemas";
import { createBid, updateBid } from "../api/bidApi";
import "./BidForm.css";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

const BidForm = ({ mode, tenderId, initialBid, onSuccess, onCancel }) => {
  const isEdit = mode === "edit";

  const [submitError, setSubmitError] = useState("");
  const [docsToDelete, setDocsToDelete] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bidSchema),
    defaultValues: isEdit
      ? {
          quotedPrice: initialBid.quotedPrice,
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
    formData.append("quotedPrice", formValues.quotedPrice);

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
        saved = await updateBid(initialBid._id, formData);
      } else {
        formData.append("tender", tenderId);
        saved = await createBid(formData);
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
    <section className="bid-form-section">
      <h2>{isEdit ? "Edit Bid" : "Submit Bid"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="quotedPrice">Quoted Price</label>
          <input
            id="quotedPrice"
            type="number"
            step="0.01"
            {...register("quotedPrice")}
          />
          {errors.quotedPrice && (
            <p className="field-error">{errors.quotedPrice.message}</p>
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

        {isEdit && initialBid.documents?.length > 0 && (
          <div className="existing-docs">
            <p>Existing documents (check to remove):</p>
            {initialBid.documents.map((doc) => (
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
            {isSubmitting ? "Saving..." : isEdit ? "Update Bid" : "Submit Bid"}
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

export default BidForm;
