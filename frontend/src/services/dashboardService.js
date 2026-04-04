import API from "./api";

export async function fetchDashboardSummary() {
  const res = await API.get("/dashboard/summary");
  return res.data;
}
