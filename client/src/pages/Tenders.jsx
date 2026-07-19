import { useState, useEffect } from "react";
import { getTenders } from "../api/tenderApi";
import "./Tenders.css";

const Tenders = () => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  useEffect(() => {
    const fetchTenders = async () => {
      setLoading(true);
      setListError("");
      try {
        const data = await getTenders();
        setTenders(data);
      } catch {
        setListError("Failed to load tenders. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  return (
    <div className="tenders-page">
      <h1>All Tenders</h1>
      {loading && <p>Loading tenders...</p>}
      {listError && <p className="field-error">{listError}</p>}
      {!loading && !listError && tenders.length === 0 && (
        <p>No tenders found.</p>
      )}
      {!loading && tenders.length > 0 && (
        <table className="tender-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Category</th>
              <th>Budget</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Posted By</th>
            </tr>
          </thead>
          <tbody>
            {tenders.map((tender) => (
              <tr key={tender._id}>
                <td>{tender.title}</td>
                <td>{tender.department}</td>
                <td>{tender.category}</td>
                <td>{tender.budget}</td>
                <td>{new Date(tender.deadline).toLocaleDateString()}</td>
                <td>{tender.status}</td>
                <td>
                  {tender.createdBy?.companyName || tender.createdBy?.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Tenders;
