import { api } from "@/lib/api";

export const patientLogin = async (data: any) => {
  const response = await api.post("/auth/login", {
    email: (data.email || "").toLowerCase().trim(),
    password: data.password,
  });
  return response.data;
};

export const doctorLogin = async (data: any) => {
  const response = await api.post("/auth/login", {
    email: (data.email || "").toLowerCase().trim(),
    password: data.password,
  });
  return response.data;
};

export const patientRegister = async (data: any) => {
  const response = await api.post("/auth/register", {
    full_name: (data.name || data.full_name || "").trim(),
    email: (data.email || "").toLowerCase().trim(),
    password: data.password,
    role: "patient",
  });
  return response.data;
};

export const doctorRegister = async (data: any) => {
  const response = await api.post("/auth/register", {
    full_name: (data.name || data.full_name || "").trim(),
    email: (data.email || "").toLowerCase().trim(),
    password: data.password,
    role: "doctor",
  });
  return response.data;
};


