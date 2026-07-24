import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBidById } from "../api/bidApi";
import BidForm from "../components/BidForm";

const BidFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bid, setBid] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBid = async () => {
      try {
        const data = await getBidById(id);
        setBid(data);
      } catch {
        setError("Could not load this bid.");
      }
    };
    loadBid();
  }, [id]);

  const handleSuccess = () => {
    navigate("/my-bids");
  };

  if (error) return <p className="field-error">{error}</p>;
  if (!bid) return <p>Loading...</p>;

  return (
    <div className="my-bids-page">
      <BidForm
        mode="edit"
        initialBid={bid}
        onSuccess={handleSuccess}
        onCancel={() => navigate("/my-bids")}
      />
    </div>
  );
};

export default BidFormPage;
