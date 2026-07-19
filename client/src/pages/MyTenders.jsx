import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/useAuth";
import { tenderSchema } from "../utils/validationSchemas";
import {
  createTender,
  getTenders,
  updateTender,
  deleteTender,
} from "../api/tenderApi";
import "./MyTenders.css";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB, mirrors uploadMiddleware.js
const MAX_FILES = 5; // mirrors upload.array("documents", 5)

const MyTenders = () => {
  const { user } = useAuth();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [existingDocs, setExistingDocs] = useState([]);
  const [docsToDelete, setDocsToDelete] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(tenderSchema) });

  // Reusable refetch — called from onSubmit/handleDelete after mutations.
  // NOT called directly from the mount effect below (see loadTenders there) —
  // react-hooks/set-state-in-effect only clears functions whose setState calls
  // are visible inline before the first await; calling out to this named
  // function from an effect gets flagged even though the pattern is safe.
  const fetchTenders = async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await getTenders({ createdBy: user._id });
      setTenders(data);
    } catch {
      setListError("Failed to load tenders. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTenders = async () => {
      setLoading(true);
      setListError("");
      try {
        const data = await getTenders({ createdBy: user._id });
        setTenders(data);
      } catch {
        setListError("Failed to load tenders. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    loadTenders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (editingId) {
        if (docsToDelete.length > 0) {
          formData.append("documentsToDelete", JSON.stringify(docsToDelete));
        }
        await updateTender(editingId, formData);
      } else {
        await createTender(formData);
      }
      cancelEdit();
      await fetchTenders();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  const startEdit = (tender) => {
    setEditingId(tender._id);
    setExistingDocs(tender.documents || []);
    setDocsToDelete([]);
    setSubmitError("");
    reset({
      title: tender.title,
      description: tender.description,
      department: tender.department,
      category: tender.category,
      budget: tender.budget,
      deadline: tender.deadline?.slice(0, 10),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setExistingDocs([]);
    setDocsToDelete([]);
    setSubmitError("");
    reset({
      title: "",
      description: "",
      department: "",
      category: "",
      budget: "",
      deadline: "",
    });
  };

  const toggleDocForDeletion = (docId) => {
    setDocsToDelete((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tender? This cannot be undone.")) return;
    try {
      await deleteTender(id);
      await fetchTenders();
    } catch {
      setListError("Failed to delete tender. Please try again.");
    }
  };

  return (
    <div className="my-tenders-page">
      <h1>My Tenders</h1>

      <section className="tender-form-section">
        <h2>{editingId ? "Edit Tender" : "Create Tender"}</h2>
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
              Documents {editingId ? "(new files to add)" : ""}
            </label>
            <input
              id="documents"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
              {...register("documents")}
            />
          </div>

          {editingId && existingDocs.length > 0 && (
            <div className="existing-docs">
              <p>Existing documents (check to remove):</p>
              {existingDocs.map((doc) => (
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
                : editingId
                  ? "Update Tender"
                  : "Create Tender"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="tender-list-section">
        <h2>My Tenders</h2>
        {loading && <p>Loading tenders...</p>}
        {listError && <p className="field-error">{listError}</p>}
        {!loading && !listError && tenders.length === 0 && (
          <p>You haven't created any tenders yet.</p>
        )}
        {!loading && tenders.length > 0 && (
          <table className="tender-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender) => (
                <tr key={tender._id}>
                  <td>{tender.title}</td>
                  <td>{tender.category}</td>
                  <td>{tender.budget}</td>
                  <td>{new Date(tender.deadline).toLocaleDateString()}</td>
                  <td>{tender.status}</td>
                  <td>
                    <button type="button" onClick={() => startEdit(tender)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tender._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default MyTenders;
