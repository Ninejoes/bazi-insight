import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

function noStoreHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  next.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  next.set("Pragma", "no-cache");
  next.set("Expires", "0");
  return next;
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: noStoreHeaders({ "content-type": "text/html; charset=utf-8" }),
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));
