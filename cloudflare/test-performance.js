// Performance test script for the API optimizations
const baseUrl = "http://localhost:8787"; // Update with actual dev server port

async function testAPI(endpoint, label) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const endTime = Date.now();
    const data = await response.json();

    console.log(`${label}:`);
    console.log(`  Time: ${endTime - startTime}ms`);
    console.log(`  Cards returned: ${data.cards ? data.cards.length : "N/A"}`);
    console.log(`  Total results: ${data.total || "N/A"}`);
    console.log("");

    return { time: endTime - startTime, count: data.cards?.length || 0 };
  } catch (error) {
    console.error(`Error testing ${label}:`, error.message);
    return { time: -1, count: 0 };
  }
}

async function runPerformanceTests() {
  console.log("🚀 Running API Performance Tests\n");

  const tests = [
    {
      endpoint: "/api/cards/filter?locale=en&limit=10",
      label: "Filter API (limit=10)",
    },
    {
      endpoint: "/api/cards/filter?locale=en&limit=50",
      label: "Filter API (limit=50)",
    },
    {
      endpoint: "/api/cards/filter?locale=en&limit=100",
      label: "Filter API (limit=100)",
    },
    {
      endpoint: "/api/cards/search?q=hololive&locale=en&limit=50",
      label: "Search API (limit=50)",
    },
  ];

  const results = [];

  for (const test of tests) {
    const result = await testAPI(test.endpoint, test.label);
    results.push({ ...test, ...result });

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("📊 Performance Summary:");
  results.forEach((result) => {
    if (result.time > 0) {
      console.log(`${result.label}: ${result.time}ms (${result.count} cards)`);
    }
  });
}

runPerformanceTests().catch(console.error);
