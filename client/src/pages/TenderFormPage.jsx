import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TenderForm from "../components/TenderForm";
import { getTenderById } from "../api/tenderApi";

const TenderFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [tender, setTender] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    const loadTender = async () => {
      try {
        const data = await getTenderById(id);
        setTender(data);
      } catch {
        setLoadError("Could not load this tender.");
      }
    };
    loadTender();
  }, [id, isEdit]);

  const handleSuccess = (saved) => navigate(`/tenders/${saved._id}`);
  const handleCancel = () => navigate("/my-tenders");

  if (isEdit && loadError) return <p className="field-error">{loadError}</p>;
  if (isEdit && !tender) return <p>Loading...</p>;

  return (
    <div className="my-tenders-page">
      <TenderForm
        mode={isEdit ? "edit" : "create"}
        initialTender={tender}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default TenderFormPage;
