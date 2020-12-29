import { join } from "path";
import { readSync } from "node-yaml";

export function resolveRoot(path: string) {
  return join(__dirname, "../../", path);
}

export function resolveConfig(path: string) {
  return resolveRoot(join("/config/", path));
}

export function resolveVar(path: string) {
  return resolveRoot(join("/var/", path));
}

export function readConfig(path: string) {
  return readSync(resolveConfig(path));
}
