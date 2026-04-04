import API from "./api";

export async function updateAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);

  const res = await API.post("/user/update-avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function updateUserSettings(payload) {
  const res = await API.put("/user/settings", payload);
  return res.data;
}
