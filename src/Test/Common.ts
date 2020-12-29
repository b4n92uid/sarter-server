import { fetch, RequestInit } from "apollo-env";
import { DocumentNode } from "graphql";
import { print } from "graphql/language/printer";
import { defaultsDeep, trimStart } from "lodash";

require("dotenv").config();

const TEST_URL = `http://localhost:${process.env.PORT}/api/`;

export const TEST_HEADERS = {
  "X-Machine-ID": "123456789",
  "X-App-Version": "0.1.0",
  "X-App-ID": "com.mosaic.store",
  "X-Hostname": "Starfeel",
  "Content-Type": "application/json"
};

export async function httpFetch(path: string, opts: RequestInit = {}) {
  const r = await fetch(
    TEST_URL + trimStart(path, "/"),
    defaultsDeep(opts, {
      headers: TEST_HEADERS
    })
  );

  return await r.json();
}

interface GraphQLFetch {
  query: DocumentNode;
  variables?: { [s: string]: any };
}

export async function apolloFetch(opts: GraphQLFetch) {
  const r = await fetch(TEST_URL, {
    method: "POST",
    headers: TEST_HEADERS,
    body: JSON.stringify({
      query: print(opts.query),
      variables: opts.variables
    })
  });

  return await r.json();
}
