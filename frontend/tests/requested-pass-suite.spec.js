// @ts-check
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const apiBaseUrl = process.env.API_BASE_URL || "http://127.0.0.1:5000/api";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, "");
    env[key] = value;
  }

  return env;
}

const backendEnvPath = path.resolve(process.cwd(), "../backend/.env");
const backendEnv = parseEnvFile(backendEnvPath);
const adminEmail = process.env.ADMIN_EMAIL || backendEnv.ADMIN_EMAIL || "admin.playwright@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || backendEnv.ADMIN_PASSWORD || "AdminPass123!";

function uniqueToken(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function studentPayload(token) {
  return {
    firstName: "PW",
    lastName: token,
    username: `u_${token}`.slice(0, 30),
    email: `${token}@example.com`,
    phone: `77${String(Math.floor(Math.random() * 10000000)).padStart(7, "0")}`,
    password: "Pass1234!",
    confirmPassword: "Pass1234!",
  };
}

async function registerStudent(request, token) {
  const payload = studentPayload(token);
  const res = await request.post(`${apiBaseUrl}/auth/register`, { data: payload });
  expect(res.status()).toBe(201);
  return payload;
}

async function login(request, email, password) {
  const res = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.token).toBeTruthy();
  expect(body.user).toBeTruthy();
  return body;
}

test.describe("Requested passing suite", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Use chromium for stable local run");

  test("user login test", async ({ request }) => {
    const token = uniqueToken("user_login");
    const student = await registerStudent(request, token);

    const logged = await login(request, student.email, student.password);
    expect(logged.user.role).toBe("student");

    const meRes = await request.get(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${logged.token}` },
    });
    expect(meRes.status()).toBe(200);
  });

  test("admin login test", async ({ request }) => {
    const admin = await login(request, adminEmail, adminPassword);
    expect(admin.user.role).toBe("admin");

    const usersRes = await request.get(`${apiBaseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    expect(usersRes.status()).toBe(200);
  });

  test("change user role test", async ({ request }) => {
    const admin = await login(request, adminEmail, adminPassword);
    const token = uniqueToken("role_change");
    const student = await registerStudent(request, token);

    const usersRes = await request.get(`${apiBaseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    expect(usersRes.status()).toBe(200);
    const usersBody = await usersRes.json();

    const target = usersBody.users.find((u) => u.email === student.email);
    expect(target?._id).toBeTruthy();

    const roleRes = await request.put(`${apiBaseUrl}/admin/users/${target._id}/role`, {
      headers: { Authorization: `Bearer ${admin.token}` },
      data: { role: "admin" },
    });
    expect(roleRes.status()).toBe(200);

    const roleBody = await roleRes.json();
    expect(roleBody.user.role).toBe("admin");
  });

  test("delete user test", async ({ request }) => {
    const admin = await login(request, adminEmail, adminPassword);
    const token = uniqueToken("user_delete");
    const student = await registerStudent(request, token);

    const usersRes = await request.get(`${apiBaseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    expect(usersRes.status()).toBe(200);
    const usersBody = await usersRes.json();

    const target = usersBody.users.find((u) => u.email === student.email);
    expect(target?._id).toBeTruthy();

    const deleteRes = await request.delete(`${apiBaseUrl}/admin/users/${target._id}`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    expect(deleteRes.status()).toBe(200);
  });

  test("material submit, view, download, delete test", async ({ request }) => {
    const fileText = `Playwright material ${new Date().toISOString()}`;
    const fileBuffer = Buffer.from(fileText, "utf8");

    const uploadRes = await request.post(`${apiBaseUrl}/materials/upload`, {
      multipart: {
        faculty: "Engineering",
        year: "Year 1",
        semester: "Semester 1",
        specialization: "Software",
        module: `SE1010-${Date.now()}`,
        file: {
          name: "playwright-material.txt",
          mimeType: "text/plain",
          buffer: fileBuffer,
        },
      },
    });
    expect(uploadRes.status()).toBe(201);

    const uploadBody = await uploadRes.json();
    const material = uploadBody.material;
    expect(material?._id).toBeTruthy();
    expect(material?.fileUrl).toBeTruthy();

    const viewRes = await request.get(`${apiBaseUrl}/materials/file/${material.fileUrl}`);
    expect(viewRes.status()).toBe(200);

    const downloaded = await viewRes.body();
    expect(downloaded.length).toBeGreaterThan(0);

    const allRes = await request.get(`${apiBaseUrl}/materials/all`);
    expect(allRes.status()).toBe(200);
    const allMaterials = await allRes.json();
    expect(Array.isArray(allMaterials)).toBeTruthy();
    expect(allMaterials.some((m) => m._id === material._id)).toBeTruthy();

    const deleteRes = await request.delete(`${apiBaseUrl}/materials/${material._id}`);
    expect(deleteRes.status()).toBe(200);
  });

  test("forum test", async ({ request }) => {
    const student = await registerStudent(request, uniqueToken("forum"));
    const auth = await login(request, student.email, student.password);
    const headers = { Authorization: `Bearer ${auth.token}` };

    const postRes = await request.post(`${apiBaseUrl}/posts`, {
      headers,
      multipart: {
        title: `Forum post ${Date.now()}`,
        content: "Forum test content",
        subject: "General",
        tags: JSON.stringify(["forum", "playwright"]),
      },
    });
    expect(postRes.status()).toBe(201);
    const post = await postRes.json();

    const commentRes = await request.post(`${apiBaseUrl}/comments`, {
      headers,
      data: {
        postId: post._id,
        text: "Forum comment test",
      },
    });
    expect(commentRes.status()).toBe(201);
    const comment = await commentRes.json();

    const votePostRes = await request.post(`${apiBaseUrl}/posts/${post._id}/vote`, {
      headers,
      data: { voteType: "up" },
    });
    expect(votePostRes.status()).toBe(200);

    const voteCommentRes = await request.post(`${apiBaseUrl}/comments/${comment._id}/vote`, {
      headers,
      data: { voteType: "up" },
    });
    expect(voteCommentRes.status()).toBe(200);

    const deleteCommentRes = await request.delete(`${apiBaseUrl}/comments/${comment._id}`, {
      headers,
    });
    expect(deleteCommentRes.status()).toBe(200);

    const deletePostRes = await request.delete(`${apiBaseUrl}/posts/${post._id}`, { headers });
    expect(deletePostRes.status()).toBe(200);
  });

  test("grouping test", async ({ request }) => {
    const owner = await registerStudent(request, uniqueToken("group_owner"));
    const member = await registerStudent(request, uniqueToken("group_member"));

    const ownerAuth = await login(request, owner.email, owner.password);
    const memberAuth = await login(request, member.email, member.password);

    const createRes = await request.post(`${apiBaseUrl}/groups`, {
      headers: { Authorization: `Bearer ${ownerAuth.token}` },
      data: {
        groupName: `Group ${Date.now()}`,
        moduleSubject: "SE2200",
        facultyTag: "Engineering",
        description: "Grouping test",
        privacyType: "public",
      },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    const groupId = created?.group?._id;
    expect(groupId).toBeTruthy();

    const joinRes = await request.post(`${apiBaseUrl}/groups/${groupId}/join`, {
      headers: { Authorization: `Bearer ${memberAuth.token}` },
    });
    expect(joinRes.status()).toBe(200);

    const listRes = await request.get(`${apiBaseUrl}/groups`, {
      headers: { Authorization: `Bearer ${ownerAuth.token}` },
    });
    expect(listRes.status()).toBe(200);
    const groups = await listRes.json();
    expect(Array.isArray(groups)).toBeTruthy();
    expect(groups.some((g) => g._id === groupId)).toBeTruthy();

    const deleteRes = await request.delete(`${apiBaseUrl}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${ownerAuth.token}` },
    });
    expect(deleteRes.status()).toBe(200);
  });
});
