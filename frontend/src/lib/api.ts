import axios from "axios";

// -- API URLを動的に設定 --------------
// 環境変数が設定されていればそれを使用、なければブラウザのホストから推測
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : "http://localhost:4000");

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface ConversionResponse {
  conversionJobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  originalName: string;
  convertedName?: string;
  downloadUrl?: string;
  message?: string;
}

// -- 変換リクエスト --------------
export const uploadAndConvert = async (
  file: File,
  targetFormat: "glb" | "gltf"
): Promise<ConversionResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("targetFormat", targetFormat);

  const response = await api.post<ConversionResponse>(
    "/conversion/request",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// -- ジョブステータス確認 (ポーリング用) --------------
export const checkConversionStatus = async (
  jobId: string
): Promise<ConversionResponse> => {
  const response = await api.get<ConversionResponse>(
    `/conversion/status/${jobId}`
  );
  return response.data;
};
