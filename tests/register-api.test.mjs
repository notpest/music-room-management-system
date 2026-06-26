import axios from "axios";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const api = axios.create({ baseURL: BASE, validateStatus: () => true });

let passed = 0;
let failed = 0;

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function step(name, fn) {
  console.log(`\n${name}`);
  await fn();
}

async function main() {
  let testBandId = null;
  let secondBandId = null;
  let testUserId = null;
  let originalUserName = null;
  const ts = Date.now();

  // ── Step 1: POST /api/auth/register (missing name) ──
  await step("POST /api/auth/register (missing name)", async () => {
    const res = await api.post("/api/auth/register", { password: "x", email: "x@x.com" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 2: POST /api/auth/register (missing password) ──
  await step("POST /api/auth/register (missing password)", async () => {
    const res = await api.post("/api/auth/register", { name: "X", email: "x@x.com" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 3: POST /api/auth/register (missing email) ──
  await step("POST /api/auth/register (missing email)", async () => {
    const res = await api.post("/api/auth/register", { name: "X", password: "x" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 4: POST /api/auth/register (duplicate email) ──
  await step("POST /api/auth/register (duplicate email)", async () => {
    const res = await api.post("/api/auth/register", {
      name: "Dup", password: "x", email: "admin@admin.in",
    });
    assert("returns 400", res.status === 400);
  });

  // ── Step 5: POST /api/bands (create test band for user registration) ──
  await step("POST /api/bands (create test band)", async () => {
    const res = await api.post("/api/bands", { name: `[TEST] Band ${ts}`, colour: "#ff0000" });
    assert("returns 201", res.status === 201);
    assert("has id", typeof res.data.id === "string");
    if (res.status === 201) {
      testBandId = res.data.id;
      assert("name matches", res.data.name === `[TEST] Band ${ts}`, `expected "[TEST] Band ${ts}", got "${res.data.name}"`);
      assert("colour matches", res.data.colour === "#ff0000", `expected "#ff0000", got "${res.data.colour}"`);
    }
  });

  // ── Step 6: POST /api/auth/register (success with band) ──
  const testEmail = `register-test-${ts}@test.com`;
  await step("POST /api/auth/register (success)", async () => {
    if (!testBandId) {
      assert("skip — no test band", true);
      return;
    }
    const res = await api.post("/api/auth/register", {
      name: `Test User ${ts}`,
      password: "testpass123",
      email: testEmail,
      bandIds: [testBandId],
    });
    assert("returns 201", res.status === 201, `got ${res.status}`);
    assert("has message", typeof res.data.message === "string");
    assert("has user object", !!res.data.user);
    if (res.data && res.data.user) {
      testUserId = res.data.user.id;
      originalUserName = res.data.user.name;
      assert("user has id", typeof testUserId === "string");
      assert("email matches", res.data.user.email === testEmail, `expected ${testEmail}, got ${res.data.user.email}`);
      assert("name matches", res.data.user.name === `Test User ${ts}`);
      // Verify the user appears in GET /api/users
      const getRes = await api.get("/api/users");
      const found = getRes.data.find(u => u.id === testUserId);
      assert("user visible in GET /api/users", !!found);
      if (found) {
        assert("GET shows correct name", found.name === `Test User ${ts}`);
        assert("GET shows bands array", Array.isArray(found.bands));
        assert("GET has associated band", found.bands.length >= 1);
      }
    }
  });

  // ── Step 7: GET /api/users ──
  await step("GET /api/users", async () => {
    const res = await api.get("/api/users");
    assert("returns 200", res.status === 200);
    assert("returns array", Array.isArray(res.data));
    if (res.data.length > 0) {
      const first = res.data[0];
      assert("has id", typeof first.id === "string");
      assert("has name", typeof first.name === "string");
      assert("has email", typeof first.email === "string");
      assert("has role", typeof first.role === "string");
      assert("has bands array", Array.isArray(first.bands));
    }
  });

  // ── Step 8: PUT /api/users (missing id) ──
  await step("PUT /api/users (missing id)", async () => {
    const res = await api.put("/api/users", { name: "X" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 9: PUT /api/users (not found) ──
  await step("PUT /api/users (not found)", async () => {
    const res = await api.put("/api/users?id=00000000-0000-0000-0000-000000000000", { name: "Nobody" });
    assert("returns 404", res.status === 404);
  });

  // ── Step 10: PUT /api/users (update test user name + restore) ──
  await step("PUT /api/users (update name)", async () => {
    if (!testUserId) {
      assert("skip — no test user", true);
      return;
    }
    const newName = `Updated ${ts}`;
    const res = await api.put(`/api/users?id=${testUserId}`, { name: newName });
    assert("returns 200", res.status === 200);
    // Verify via GET
    const getRes = await api.get("/api/users");
    const user = getRes.data.find(u => u.id === testUserId);
    assert("name updated in GET", user && user.name === newName, `expected "${newName}", got "${user?.name}"`);
    // Restore
    const restoreRes = await api.put(`/api/users?id=${testUserId}`, { name: originalUserName });
    assert("restore succeeds", restoreRes.status === 200);
  });

  // ── Step 11: DELETE /api/users (missing id) ──
  await step("DELETE /api/users (missing id)", async () => {
    const res = await api.delete("/api/users");
    assert("returns 400", res.status === 400);
  });

  // ── Step 12: DELETE /api/users (not found) ──
  await step("DELETE /api/users (not found)", async () => {
    const res = await api.delete("/api/users?id=00000000-0000-0000-0000-000000000000");
    assert("returns 404", res.status === 404);
  });

  // ── Step 13: DELETE /api/users (delete test user) ──
  await step("DELETE /api/users (delete test user)", async () => {
    if (!testUserId) {
      assert("skip — no test user", true);
      return;
    }
    const res = await api.delete(`/api/users?id=${testUserId}`);
    assert("returns 200", res.status === 200);
    // Verify gone
    const getRes = await api.get("/api/users");
    assert("user removed from GET", !getRes.data.find(u => u.id === testUserId));
    testUserId = null;
  });

  // ── Step 14: POST /api/bands (missing name) ──
  await step("POST /api/bands (missing name)", async () => {
    const res = await api.post("/api/bands", { colour: "#00ff00" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 15: POST /api/bands (missing colour) ──
  await step("POST /api/bands (missing colour)", async () => {
    const res = await api.post("/api/bands", { name: "No Colour" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 16: POST /api/bands (create second test band) ──
  await step("POST /api/bands (create second test band)", async () => {
    const res = await api.post("/api/bands", {
      name: `[TEST] Second Band ${ts}`,
      colour: "#00ff00",
    });
    assert("returns 201", res.status === 201);
    if (res.status === 201) {
      secondBandId = res.data.id;
      assert("has id", typeof secondBandId === "string");
      assert("name matches", res.data.name === `[TEST] Second Band ${ts}`);
      assert("colour matches", res.data.colour === "#00ff00");
    }
  });

  // ── Step 17: PUT /api/bands (missing id) ──
  await step("PUT /api/bands (missing id)", async () => {
    const res = await api.put("/api/bands", { name: "X", colour: "#fff" });
    assert("returns 400", res.status === 400);
  });

  // ── Step 18: PUT /api/bands (not found) ──
  await step("PUT /api/bands (not found)", async () => {
    const res = await api.put("/api/bands?id=00000000-0000-0000-0000-000000000000", { name: "X", colour: "#fff" });
    assert("returns 404", res.status === 404);
  });

  // ── Step 19: PUT /api/bands (update + restore first test band) ──
  await step("PUT /api/bands (update + restore)", async () => {
    if (!testBandId) {
      assert("skip — no test band", true);
      return;
    }
    const originalName = `[TEST] Band ${ts}`;
    const originalColour = "#ff0000";

    const res = await api.put(`/api/bands?id=${testBandId}`, {
      name: `[TEST] Band Renamed ${ts}`,
      colour: "#0000ff",
    });
    assert("returns 200", res.status === 200);
    assert("name updated", res.data.name === `[TEST] Band Renamed ${ts}`);
    assert("colour updated", res.data.colour === "#0000ff");

    // Restore
    const restoreRes = await api.put(`/api/bands?id=${testBandId}`, {
      name: originalName, colour: originalColour,
    });
    assert("restore succeeds", restoreRes.status === 200);
    assert("name restored", restoreRes.data.name === originalName);
    assert("colour restored", restoreRes.data.colour === originalColour);

    // Verify via GET
    const getRes = await api.get("/api/bands");
    const band = getRes.data.find(b => b.id === testBandId);
    assert("GET confirms name restored", band && band.name === originalName);
  });

  // ── Step 20: DELETE /api/bands (missing id) ──
  await step("DELETE /api/bands (missing id)", async () => {
    const res = await api.delete("/api/bands");
    assert("returns 400", res.status === 400);
  });

  // ── Step 21: DELETE /api/bands (not found) ──
  await step("DELETE /api/bands (not found)", async () => {
    const res = await api.delete("/api/bands?id=00000000-0000-0000-0000-000000000000");
    assert("returns 404", res.status === 404);
  });

  // ── Step 22: DELETE /api/bands (cleanup both test bands) ──
  await step("DELETE /api/bands (cleanup test bands)", async () => {
    let deleted = 0;
    for (const id of [testBandId, secondBandId].filter(Boolean)) {
      const res = await api.delete(`/api/bands?id=${id}`);
      if (res.status === 200) deleted++;
      assert(`delete band ${id}`, res.status === 200, `got ${res.status}`);
    }
    assert(`deleted ${deleted} band(s)`, deleted > 0);
    // Verify via GET
    const getRes = await api.get("/api/bands");
    if (testBandId) assert("band 1 removed", !getRes.data.find(b => b.id === testBandId));
    if (secondBandId) assert("band 2 removed", !getRes.data.find(b => b.id === secondBandId));
    testBandId = null;
    secondBandId = null;
  });

  // ── Step 23: GET /api/users (sanity) ──
  await step("GET /api/users (sanity)", async () => {
    const res = await api.get("/api/users");
    assert("returns 200", res.status === 200);
    assert("returns array", Array.isArray(res.data));
  });

  // ── Step 24: GET /api/bands (sanity) ──
  await step("GET /api/bands (sanity)", async () => {
    const res = await api.get("/api/bands");
    assert("returns 200", res.status === 200);
    assert("returns array", Array.isArray(res.data));
  });

  // ── Summary ──
  const total = passed + failed;
  console.log(`\n${"=".repeat(40)}`);
  console.log(`Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`Failed: ${failed}/${total}`);
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
