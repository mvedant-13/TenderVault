import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getTenderById, deleteTender } from "../api/tenderApi";
import { getBids } from "../api/bidApi";
import BidForm from "../components/BidForm";
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
  const [showBidForm, setShowBidForm] = useState(false);
  const [myBid, setMyBid] = useState(null);
  const [checkingBid, setCheckingBid] = useState(true);

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

  useEffect(() => {
    const checkExistingBid = async () => {
      if (user.role !== "vendor") {
        setCheckingBid(false);
        return;
      }
      try {
        const myBids = await getBids();
        const found = myBids.find((bid) => bid.tender?._id === id);
        setMyBid(found || null);
      } catch {
        setError("Could not check for existing bids.");
      } finally {
        setCheckingBid(false);
      }
    };
    checkExistingBid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBidSuccess = () => {
    setShowBidForm(false);
    navigate("/my-bids");
  };

  if (error) return <p className="field-error">{error}</p>;
  if (!tender) return <p>Loading...</p>;

  const isOwner = user._id === tender.createdBy?._id;
  const canBid =
    user.role === "vendor" &&
    tender.status === "open" &&
    !checkingBid &&
    !myBid;

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
            <button
              type="button"
              onClick={() => navigate(`/tenders/${tender._id}/bids`)}
            >
              View Bids
            </button>
          </div>
        )}

        {user.role === "vendor" && myBid && !checkingBid && (
          <div className="tender-detail-documents">
            <h2>Your Bid</h2>
            <div className="tender-detail-meta">
              <div>
                <span className="meta-label">Quoted Price</span>
                <span>₹{myBid.quotedPrice}</span>
              </div>
              <div>
                <span className="meta-label">Status</span>
                <span className={`status-badge status-${myBid.status}`}>
                  {myBid.status}
                </span>
              </div>
            </div>
            {myBid.documents?.length > 0 ? (
              <ul>
                {myBid.documents.map((doc) => (
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
            {myBid.status === "submitted" && (
              <p className="no-documents">
                <Link to={`/my-bids/${myBid._id}/edit`}>Edit your bid</Link>
              </p>
            )}
          </div>
        )}

        {canBid && !showBidForm && (
          <div className="tender-detail-actions">
            <button type="button" onClick={() => setShowBidForm(true)}>
              Submit Bid
            </button>
          </div>
        )}
      </div>

      {canBid && showBidForm && (
        <BidForm
          mode="create"
          tenderId={tender._id}
          onSuccess={handleBidSuccess}
          onCancel={() => setShowBidForm(false)}
        />
      )}
    </div>
  );
};

export default TenderDetail;
