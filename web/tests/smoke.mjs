/**
 * Smoke tests for API routes.
 * Usage: node tests/smoke.mjs
 */

const BASE = process.env.TEST_URL || "http://localhost:3011"

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`)
    process.exitCode = 1
  }
}

async function main() {
  console.log(`\n🧪 Smoke tests against ${BASE}\n`)

  await test("GET /api/players returns 200", async () => {
    const res = await fetch(`${BASE}/api/players`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error("Not an array")
    if (data.length === 0) throw new Error("Empty array")
  })

  await test("GET /api/players?q=messi returns results", async () => {
    const res = await fetch(`${BASE}/api/players?q=messi`)
    const data = await res.json()
    if (!data.some(p => p.name?.toLowerCase().includes("messi"))) throw new Error("Messi not found")
  })

  await test("GET /api/teams returns 200", async () => {
    const res = await fetch(`${BASE}/api/teams`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error("Not an array")
  })

  await test("GET /api/teams?q=real returns results", async () => {
    const res = await fetch(`${BASE}/api/teams?q=real`)
    const data = await res.json()
    if (!data.some(t => t.name?.toLowerCase().includes("real"))) throw new Error("Real Madrid not found")
  })

  await test("GET /api/rankings returns 200", async () => {
    const res = await fetch(`${BASE}/api/rankings`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  await test("POST /api/chat returns response", async () => {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Dime un dato sobre Messi", mode: "general", history: [] }),
    })
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const data = await res.json()
    if (!data.response) throw new Error("No response field")
  })

  console.log(`\n${process.exitCode ? "⚠️  Some tests failed" : "✅ All tests passed"}\n`)
}

main()
