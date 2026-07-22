import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBids, updateBidStatus } from "../api/bidApi";
import { getTenderById } from "../api/tenderApi";
import "./TenderBids.css";

const SERVER_ORIGIN = import.meta.env.VITE_API_BASE_URL.replace(
  /\/api\/?$/,
  "",
);

const TenderBids = () => {
  const { tenderId } = useParams();

  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBids = async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await getBids({ tender: tenderId });
      setBids(data);
    } catch {
      setListError("Failed to load bids. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTender = async () => {
      try {
        const data = await getTenderById(tenderId);
        setTender(data);
      } catch {
        setListError("Could not load this tender.");
      }
    };
    loadTender();
  }, [tenderId]);

  useEffect(() => {
    const loadBids = async () => {
      setLoading(true);
      setListError("");
      try {
        const data = await getBids({ tender: tenderId });
        setBids(data);
      } catch {
        setListError("Failed to load bids. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    loadBids();
  }, [tenderId]);

  const handleStatusChange = async (bidId, status) => {
    const label =
      status === "awarded"
        ? "Award this bid?"
        : status === "rejected"
          ? "Reject this bid?"
          : "Shortlist this bid?";
    if (!window.confirm(label)) return;

    setUpdatingId(bidId);
    try {
      await updateBidStatus(bidId, status);
      await fetchBids();
    } catch {
      setListError("Failed to update bid status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="tender-bids-page">
      <Link to={`/tenders/${tenderId}`} className="back-link">
        ← Back to Tender
      </Link>

      <div className="tender-bids-header">
        <h1>Bids Received</h1>
        {tender && <p>{tender.title}</p>}
      </div>

      {loading && <p>Loading bids...</p>}
      {listError && <p className="field-error">{listError}</p>}
      {!loading && !listError && bids.length === 0 && (
        <p>No bids have been submitted for this tender yet.</p>
      )}
      {!loading && bids.length > 0 && (
        <table className="bid-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Quoted Price</th>
              <th>Documents</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid._id}>
                <td>
                  {bid.vendor?.companyName || bid.vendor?.name}
                  {bid.vendor?.gstNumber && (
                    <div className="meta-label">{bid.vendor.gstNumber}</div>
                  )}
                </td>
                <td>{bid.quotedPrice}</td>
                <td className="documents-cell">
                  {bid.documents?.length > 0 ? (
                    <ul>
                      {bid.documents.map((doc) => (
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
                    <span className="no-documents">None</span>
                  )}
                </td>
                <td className="status-cell">{bid.status}</td>
                <td>
                  <button
                    type="button"
                    className="btn-award"
                    disabled={
                      bid.status === "awarded" || updatingId === bid._id
                    }
                    onClick={() => handleStatusChange(bid._id, "awarded")}
                  >
                    Award
                  </button>
                  <button
                    type="button"
                    disabled={
                      bid.status === "shortlisted" ||
                      bid.status === "awarded" ||
                      updatingId === bid._id
                    }
                    onClick={() => handleStatusChange(bid._id, "shortlisted")}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    className="btn-reject"
                    disabled={
                      bid.status === "rejected" ||
                      bid.status === "awarded" ||
                      updatingId === bid._id
                    }
                    onClick={() => handleStatusChange(bid._id, "rejected")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TenderBids;
