// @ts-check
import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const out = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim().replace(/^['\"]|['\"]$/g, "");
    out[key] = value;
  }

  return out;
}

const backendEnvPath = path.resolve(process.cwd(), "../backend/.env");
const backendEnv = parseEnvFile(backendEnvPath);

const backendPort = process.env.BACKEND_PORT || backendEnv.PORT || "5000";
const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
const apiBaseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${backendPort}/api`;
const adminEmail = process.env.ADMIN_EMAIL || backendEnv.ADMIN_EMAIL || "";
const adminPassword = process.env.ADMIN_PASSWORD || backendEnv.ADMIN_PASSWORD || "";

function uniqueSeed(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function studentPayload(seed) {
  return {
    firstName: "PW",
    lastName: seed,
    username: `u_${seed}`.slice(0, 30),
    email: `${seed}@example.com`,
    phone: `77${String(Math.floor(Math.random() * 10000000)).padStart(7, "0")}`,
    password: "Pass1234!",
    confirmPassword: "Pass1234!",
  };
}

async function registerStudent(request, seed) {
  const payload = studentPayload(seed);
  const res = await request.post(`${apiBaseUrl}/auth/register`, { data: payload });
  expect(res.status(), "register should return 201").toBe(201);
  return payload;
}

async function login(request, email, password) {
  const res = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email, password },
  });
  expect(res.status(), "login should return 200").toBe(200);
  const body = await res.json();
  expect(body.token).toBeTruthy();
  expect(body.user).toBeTruthy();
  return body;
}

test.describe("UniConnect auth and CRUD", () => {
  test("user login via UI", async ({ page, request }) => {
    const seed = uniqueSeed("student_ui");
    const student = await registerStudent(request, seed);

    await page.goto(`${frontendBaseUrl}/login`);
    await page.locator('input[name="email"]').fill(student.email);
    await page.locator('input[name="password"]').fill(student.password);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("admin login via UI", async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL/ADMIN_PASSWORD are required for admin login test");

    await page.goto(`${frontendBaseUrl}/admin/login`);
    await page.locator('input[name="email"]').fill(adminEmail);
    await page.locator('input[name="password"]').fill(adminPassword);
    await page.getByRole("button", { name: /login/i }).click();

    await expect(page).toHaveURL(/\/adminDashboard$/);
  });

  test("student CRUD via API: posts, comments, groups, feedback", async ({ request }) => {
    const seed = uniqueSeed("student_api");
    const student = await registerStudent(request, seed);
    const auth = await login(request, student.email, student.password);
    const authHeader = { Authorization: `Bearer ${auth.token}` };

    const postCreate = await request.post(`${apiBaseUrl}/posts`, {
      headers: authHeader,
      multipart: {
        title: `Post ${seed}`,
        content: "Playwright CRUD test content",
        subject: "General",
        tags: JSON.stringify(["playwright", "crud"]),
      },
    });
    expect(postCreate.status()).toBe(201);
    const post = await postCreate.json();
    expect(post._id).toBeTruthy();

    const postRead = await request.get(`${apiBaseUrl}/posts/${post._id}`);
    expect(postRead.status()).toBe(200);

    const postUpdate = await request.put(`${apiBaseUrl}/posts/${post._id}`, {
      headers: authHeader,
      multipart: {
        title: `Post updated ${seed}`,
        content: "Updated content",
        tags: JSON.stringify(["updated"]),
      },
    });
    expect(postUpdate.status()).toBe(200);

    const commentCreate = await request.post(`${apiBaseUrl}/comments`, {
      headers: authHeader,
      data: {
        postId: post._id,
        text: `Comment ${seed}`,
      },
    });
    expect(commentCreate.status()).toBe(201);
    const comment = await commentCreate.json();

    const commentUpdate = await request.put(`${apiBaseUrl}/comments/${comment._id}`, {
      headers: authHeader,
      data: { text: `Updated comment ${seed}` },
    });
    expect(commentUpdate.status()).toBe(200);

    const commentDelete = await request.delete(`${apiBaseUrl}/comments/${comment._id}`, {
      headers: authHeader,
    });
    expect(commentDelete.status()).toBe(200);

    const groupCreate = await request.post(`${apiBaseUrl}/groups`, {
      headers: authHeader,
      data: {
        groupName: `Group ${seed}`,
        moduleSubject: "SE1010",
        facultyTag: "Engineering",
        description: "Playwright CRUD group",
        privacyType: "public",
      },
    });
    expect(groupCreate.status()).toBe(201);
    const groupBody = await groupCreate.json();
    const groupId = groupBody?.group?._id;
    expect(groupId).toBeTruthy();

    const groupRead = await request.get(`${apiBaseUrl}/groups`, {
      headers: authHeader,
    });
    expect(groupRead.status()).toBe(200);

    const feedbackCreate = await request.post(`${apiBaseUrl}/feedback`, {
      headers: authHeader,
      data: {
        message: "This is a Playwright CRUD feedback message.",
        rating: 5,
      },
    });
    expect(feedbackCreate.status()).toBe(201);
    const feedbackBody = await feedbackCreate.json();
    const feedbackId = feedbackBody?.feedback?._id;
    expect(feedbackId).toBeTruthy();

    const feedbackMine = await request.get(`${apiBaseUrl}/feedback/mine`, {
      headers: authHeader,
    });
    expect(feedbackMine.status()).toBe(200);

    const feedbackUpdate = await request.patch(`${apiBaseUrl}/feedback/mine/${feedbackId}`, {
      headers: authHeader,
      data: {
        message: "Updated Playwright feedback message for CRUD validation.",
        rating: 4,
      },
    });
    expect(feedbackUpdate.status()).toBe(200);

    const feedbackDelete = await request.delete(`${apiBaseUrl}/feedback/mine/${feedbackId}`, {
      headers: authHeader,
    });
    expect(feedbackDelete.status()).toBe(200);

    const groupDelete = await request.delete(`${apiBaseUrl}/groups/${groupId}`, {
      headers: authHeader,
    });
    expect(groupDelete.status()).toBe(200);

    const postDelete = await request.delete(`${apiBaseUrl}/posts/${post._id}`, {
      headers: authHeader,
    });
    expect(postDelete.status()).toBe(200);
  });

  test("admin CRUD via API: users and feedback moderation", async ({ request }) => {
    test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL/ADMIN_PASSWORD are required for admin CRUD test");

    const admin = await login(request, adminEmail, adminPassword);
    const adminHeaders = { Authorization: `Bearer ${admin.token}` };

    const seed = uniqueSeed("managed_user");
    const managedUser = await registerStudent(request, seed);
    const managedLogin = await login(request, managedUser.email, managedUser.password);

    const usersRes = await request.get(`${apiBaseUrl}/admin/users`, {
      headers: adminHeaders,
    });
    expect(usersRes.status()).toBe(200);
    const usersBody = await usersRes.json();
    const targetUser = usersBody?.users?.find((u) => u.email === managedUser.email);
    expect(targetUser?._id).toBeTruthy();

    const updateUserRes = await request.put(`${apiBaseUrl}/admin/users/${targetUser._id}`, {
      headers: adminHeaders,
      data: {
        name: `Updated ${seed}`,
      },
    });
    expect(updateUserRes.status()).toBe(200);

    const roleRes = await request.put(`${apiBaseUrl}/admin/users/${targetUser._id}/role`, {
      headers: adminHeaders,
      data: { role: "student" },
    });
    expect(roleRes.status()).toBe(200);

    const blockRes = await request.put(`${apiBaseUrl}/admin/users/${targetUser._id}/block`, {
      headers: adminHeaders,
      data: { isBlocked: true },
    });
    expect(blockRes.status()).toBe(200);

    const unblockRes = await request.put(`${apiBaseUrl}/admin/users/${targetUser._id}/block`, {
      headers: adminHeaders,
      data: { isBlocked: false },
    });
    expect(unblockRes.status()).toBe(200);

    const feedbackCreate = await request.post(`${apiBaseUrl}/feedback`, {
      headers: { Authorization: `Bearer ${managedLogin.token}` },
      data: {
        message: "Feedback for admin moderation CRUD test.",
        rating: 5,
      },
    });
    expect(feedbackCreate.status()).toBe(201);
    const createdFeedback = await feedbackCreate.json();
    const feedbackId = createdFeedback?.feedback?._id;
    expect(feedbackId).toBeTruthy();

    const adminFeedbackList = await request.get(`${apiBaseUrl}/admin/feedback`, {
      headers: adminHeaders,
    });
    expect(adminFeedbackList.status()).toBe(200);

    const adminFeedbackUpdate = await request.patch(`${apiBaseUrl}/admin/feedback/${feedbackId}`, {
      headers: adminHeaders,
      data: { visibleToUsers: false },
    });
    expect(adminFeedbackUpdate.status()).toBe(200);

    const adminFeedbackDelete = await request.delete(`${apiBaseUrl}/admin/feedback/${feedbackId}`, {
      headers: adminHeaders,
    });
    expect(adminFeedbackDelete.status()).toBe(200);

    const deleteUserRes = await request.delete(`${apiBaseUrl}/admin/users/${targetUser._id}`, {
      headers: adminHeaders,
    });
    expect(deleteUserRes.status()).toBe(200);
  });
});
