// @ts-check
import { test, expect } from "@playwright/test";

const apiBaseUrl = process.env.API_BASE_URL || "http://127.0.0.1:5000/api";

function seed(prefix, index) {
  return `${prefix}_${index}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
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

async function createStudentSession(request, token) {
  const payload = studentPayload(token);

  const registerRes = await request.post(`${apiBaseUrl}/auth/register`, { data: payload });
  expect(registerRes.status()).toBe(201);

  const loginRes = await request.post(`${apiBaseUrl}/auth/login`, {
    data: { email: payload.email, password: payload.password },
  });
  expect(loginRes.status()).toBe(200);

  const loginBody = await loginRes.json();
  expect(loginBody.token).toBeTruthy();

  return {
    payload,
    token: loginBody.token,
    user: loginBody.user,
    headers: { Authorization: `Bearer ${loginBody.token}` },
  };
}

test.describe("40 passing CRUD/api tests", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Run this report suite on Chromium only");

  for (let i = 1; i <= 10; i += 1) {
    test(`auth/me smoke #${i}`, async ({ request }) => {
      const s = await createStudentSession(request, seed("auth", i));

      const meRes = await request.get(`${apiBaseUrl}/auth/me`, { headers: s.headers });
      expect(meRes.status()).toBe(200);
      const me = await meRes.json();
      expect(me.email).toBe(s.payload.email.toLowerCase());
      expect(me.role).toBe("student");

      const healthRes = await request.get(`${apiBaseUrl}/feedback/health`);
      expect(healthRes.status()).toBe(200);
    });
  }

  for (let i = 1; i <= 10; i += 1) {
    test(`posts CRUD #${i}`, async ({ request }) => {
      const s = await createStudentSession(request, seed("post", i));

      const createPostRes = await request.post(`${apiBaseUrl}/posts`, {
        headers: s.headers,
        multipart: {
          title: `Post ${i}`,
          content: `Post content ${i}`,
          subject: "General",
          tags: JSON.stringify(["pw", `p${i}`]),
        },
      });
      expect(createPostRes.status()).toBe(201);
      const post = await createPostRes.json();
      expect(post._id).toBeTruthy();

      const getPostRes = await request.get(`${apiBaseUrl}/posts/${post._id}`);
      expect(getPostRes.status()).toBe(200);

      const updatePostRes = await request.put(`${apiBaseUrl}/posts/${post._id}`, {
        headers: s.headers,
        multipart: {
          title: `Post updated ${i}`,
          content: `Post updated content ${i}`,
          tags: JSON.stringify(["updated", `u${i}`]),
        },
      });
      expect(updatePostRes.status()).toBe(200);

      const deletePostRes = await request.delete(`${apiBaseUrl}/posts/${post._id}`, {
        headers: s.headers,
      });
      expect(deletePostRes.status()).toBe(200);
    });
  }

  for (let i = 1; i <= 10; i += 1) {
    test(`comments CRUD #${i}`, async ({ request }) => {
      const s = await createStudentSession(request, seed("comment", i));

      const createPostRes = await request.post(`${apiBaseUrl}/posts`, {
        headers: s.headers,
        multipart: {
          title: `Comment post ${i}`,
          content: `Comment base post ${i}`,
          subject: "General",
          tags: JSON.stringify(["comment", `c${i}`]),
        },
      });
      expect(createPostRes.status()).toBe(201);
      const post = await createPostRes.json();

      const createCommentRes = await request.post(`${apiBaseUrl}/comments`, {
        headers: s.headers,
        data: {
          postId: post._id,
          text: `Comment text ${i}`,
        },
      });
      expect(createCommentRes.status()).toBe(201);
      const comment = await createCommentRes.json();
      expect(comment._id).toBeTruthy();

      const updateCommentRes = await request.put(`${apiBaseUrl}/comments/${comment._id}`, {
        headers: s.headers,
        data: {
          text: `Updated comment text ${i}`,
        },
      });
      expect(updateCommentRes.status()).toBe(200);

      const deleteCommentRes = await request.delete(`${apiBaseUrl}/comments/${comment._id}`, {
        headers: s.headers,
      });
      expect(deleteCommentRes.status()).toBe(200);

      const deletePostRes = await request.delete(`${apiBaseUrl}/posts/${post._id}`, {
        headers: s.headers,
      });
      expect(deletePostRes.status()).toBe(200);
    });
  }

  for (let i = 1; i <= 10; i += 1) {
    test(`groups + feedback CRUD #${i}`, async ({ request }) => {
      const s = await createStudentSession(request, seed("group_feedback", i));

      const createGroupRes = await request.post(`${apiBaseUrl}/groups`, {
        headers: s.headers,
        data: {
          groupName: `PW Group ${i}`,
          moduleSubject: `SE${2000 + i}`,
          facultyTag: "Engineering",
          description: `Playwright group description ${i}`,
          privacyType: "public",
        },
      });
      expect(createGroupRes.status()).toBe(201);
      const groupBody = await createGroupRes.json();
      const groupId = groupBody?.group?._id;
      expect(groupId).toBeTruthy();

      const listGroupsRes = await request.get(`${apiBaseUrl}/groups`, {
        headers: s.headers,
      });
      expect(listGroupsRes.status()).toBe(200);

      const createFeedbackRes = await request.post(`${apiBaseUrl}/feedback`, {
        headers: s.headers,
        data: {
          message: `Playwright feedback message ${i} with enough characters.`,
          rating: 5,
        },
      });
      expect(createFeedbackRes.status()).toBe(201);
      const feedbackBody = await createFeedbackRes.json();
      const feedbackId = feedbackBody?.feedback?._id;
      expect(feedbackId).toBeTruthy();

      const updateFeedbackRes = await request.patch(`${apiBaseUrl}/feedback/mine/${feedbackId}`, {
        headers: s.headers,
        data: {
          message: `Updated Playwright feedback message ${i} with enough characters.`,
          rating: 4,
        },
      });
      expect(updateFeedbackRes.status()).toBe(200);

      const deleteFeedbackRes = await request.delete(`${apiBaseUrl}/feedback/mine/${feedbackId}`, {
        headers: s.headers,
      });
      expect(deleteFeedbackRes.status()).toBe(200);

      const deleteGroupRes = await request.delete(`${apiBaseUrl}/groups/${groupId}`, {
        headers: s.headers,
      });
      expect(deleteGroupRes.status()).toBe(200);
    });
  }
});
