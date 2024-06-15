import createClient from "openapi-fetch";
import type { paths } from "./api";

export const baseApiUrl = "https://api.chaster.app";

export const client = createClient<paths>({ baseUrl: baseApiUrl });
