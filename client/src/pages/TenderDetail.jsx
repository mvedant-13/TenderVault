import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getTenderById, deleteTender } from "../api/tenderApi";
import "./TenderDetail.css";

const SERVER_ORIGIN = import.meta.env.VITE_API_BASE_URL.replace(
  /\/api\/?$/,
  "",
);

const TenderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tender, setTender] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTender = async () => {
      try {
        const data = await getTenderById(id);
        setTender(data);
      } catch {
        setError("Could not load this tender.");
      }
    };
    loadTender();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this tender? This cannot be undone.")) return;
    try {
      await deleteTender(id);
      navigate("/my-tenders");
    } catch {
      setError("Could not delete tender.");
    }
  };

  if (error) return <p className="field-error">{error}</p>;
  if (!tender) return <p>Loading...</p>;

  const isOwner = user._id === tender.createdBy?._id;

  return (
    <div className="tender-detail-page">
      <Link to="/tenders" className="back-link">
        ← Back to Tenders
      </Link>

      <div className="tender-detail-card">
        <div className="tender-detail-header">
          <h1>{tender.title}</h1>
          <span className={`status-badge status-${tender.status}`}>
            {tender.status}
          </span>
        </div>

        <p className="tender-detail-desc">{tender.description}</p>

        <div className="tender-detail-meta">
          <div>
            <span className="meta-label">Department</span>
            <span>{tender.department}</span>
          </div>
          <div>
            <span className="meta-label">Category</span>
            <span>{tender.category}</span>
          </div>
          <div>
            <span className="meta-label">Budget</span>
            <span>{tender.budget}</span>
          </div>
          <div>
            <span className="meta-label">Deadline</span>
            <span>{new Date(tender.deadline).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="meta-label">Posted By</span>
            <span>
              {tender.createdBy?.companyName || tender.createdBy?.name}
            </span>
          </div>
        </div>

        <div className="tender-detail-documents">
          <h2>Documents</h2>
          {tender.documents?.length > 0 ? (
            <ul>
              {tender.documents.map((doc) => (
                <li key={doc._id}>
                  <a
                    href={`${SERVER_ORIGIN}/${doc.filePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {doc.fileName}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-documents">No documents attached.</p>
          )}
        </div>

        {isOwner && (
          <div className="tender-detail-actions">
            <button
              type="button"
              onClick={() => navigate(`/my-tenders/${tender._id}/edit`)}
            >
              Edit
            </button>
            <button type="button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetail;
