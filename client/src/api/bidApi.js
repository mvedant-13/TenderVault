import axiosInstance from "./axiosInstance";

export const createBid = async (formData) => {
  const res = await axiosInstance.post("/bids", formData);
  return res.data;
};

export const getBids = async (params = {}) => {
  const res = await axiosInstance.get("/bids", { params });
  return res.data;
};

export const getBidById = async (id) => {
  const res = await axiosInstance.get(`/bids/${id}`);
  return res.data;
};

export const updateBid = async (id, formData) => {
  const res = await axiosInstance.put(`/bids/${id}`, formData);
  return res.data;
};

export const deleteBid = async (id) => {
  const res = await axiosInstance.delete(`/bids/${id}`);
  return res.data;
};

export const updateBidStatus = async (id, status) => {
  const res = await axiosInstance.put(`/bids/${id}/status`, { status });
  return res.data;
};

export const scoreBidsForTender = async (tenderId) => {
  const res = await axiosInstance.put(`/bids/tender/${tenderId}/score`);
  return res.data;
};
