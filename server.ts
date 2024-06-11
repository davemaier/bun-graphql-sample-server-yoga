import { gqlSchema } from "./gqlSchema";

import { createYoga } from "graphql-yoga";

const yoga = createYoga({
  schema: gqlSchema,
});

const server = Bun.serve({
  fetch: yoga,
});

console.log(`Listening on http://localhost:${server.port}`);
