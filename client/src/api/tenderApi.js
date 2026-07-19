import axiosInstance from "./axiosInstance";

export const createTender = async (formData) => {
  const res = await axiosInstance.post("/tenders", formData);
  return res.data;
};

export const getTenders = async (params = {}) => {
  const res = await axiosInstance.get("/tenders", { params });
  return res.data;
};

export const getTenderById = async (id) => {
  const res = await axiosInstance.get(`/tenders/${id}`);
  return res.data;
};

export const updateTender = async (id, formData) => {
  const res = await axiosInstance.put(`/tenders/${id}`, formData);
  return res.data;
};

export const deleteTender = async (id) => {
  const res = await axiosInstance.delete(`/tenders/${id}`);
  return res.data;
};
