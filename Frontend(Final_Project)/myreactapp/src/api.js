import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// --- NEW FILE HIDING FUNCTIONS ---

export const hideFile = async (coverImage, secretFile) => {
  const formData = new FormData();
  formData.append("cover_image", coverImage);
  formData.append("secret_file", secretFile);

  return axios.post(`${API_URL}/hide-file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const retrieveFile = async (stegoImage, key) => {
  const formData = new FormData();
  formData.append("stego_image", stegoImage);
  formData.append("key", key);

  // vital: responseType 'blob' tells browser this is a file download
  return axios.post(`${API_URL}/retrieve-file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob", 
  });
};

// --- EXISTING HELPERS (Keep these) ---

export const getDashboardData = async () => {
    return axios.get(`${API_URL}/dashboard/`);
};

export const generateAnalysis = async (originalName, stegoName) => {
  const formData = new FormData();
  formData.append("original", originalName);
  formData.append("stego", stegoName);

  return axios.post(`${API_URL}/analyze/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const simulateAttack = async (filename) => {
  const formData = new FormData();
  formData.append("filename", filename);

  return axios.post(`${API_URL}/simulate-attack/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};