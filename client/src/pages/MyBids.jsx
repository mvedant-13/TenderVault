import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBids, deleteBid } from "../api/bidApi";
import "./MyBids.css";

const MyBids = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const fetchBids = async () => {
    setLoading(true);
    setListError("");
    try {
      const data = await getBids();
      setBids(data);
    } catch {
      setListError("Failed to load bids. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBids = async () => {
      setLoading(true);
      setListError("");
      try {
        const data = await getBids();
        setBids(data);
      } catch {
        setListError("Failed to load bids. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    loadBids();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Withdraw this bid? This cannot be undone.")) return;
    try {
      await deleteBid(id);
      await fetchBids();
    } catch {
      setListError("Failed to withdraw bid. Please try again.");
    }
  };

  return (
    <div className="my-bids-page">
      <div className="my-bids-header">
        <h1>My Bids</h1>
      </div>

      {loading && <p>Loading bids...</p>}
      {listError && <p className="field-error">{listError}</p>}
      {!loading && !listError && bids.length === 0 && (
        <p>You haven't submitted any bids yet.</p>
      )}
      {!loading && bids.length > 0 && (
        <table className="bid-table">
          <thead>
            <tr>
              <th>Tender</th>
              <th>Quoted Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid._id}>
                <td>{bid.tender?.title}</td>
                <td>{bid.quotedPrice}</td>
                <td className="status-cell">{bid.status}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => navigate(`/tenders/${bid.tender?._id}`)}
                  >
                    View Details
                  </button>
                  {bid.status === "submitted" && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(`/my-bids/${bid._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(bid._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBids;
