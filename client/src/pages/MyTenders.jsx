import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getTenders, deleteTender } from "../api/tenderApi";
import "./MyTenders.css";

const MyTenders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

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
      <div className="my-tenders-header">
        <h1>My Tenders</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/my-tenders/new")}
        >
          + Create Tender
        </button>
      </div>

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
                  <button
                    type="button"
                    onClick={() => navigate(`/tenders/${tender._id}`)}
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/my-tenders/${tender._id}/edit`)}
                  >
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
    </div>
  );
};

export default MyTenders;
