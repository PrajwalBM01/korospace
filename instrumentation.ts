export async function register() {
    // Node runtime only. The edge runtime doesn't get these variables and
    // validating server secrets there would fail for the wrong reason.
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./lib/env")
    }
  }