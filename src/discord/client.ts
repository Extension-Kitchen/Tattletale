import createClient from "openapi-fetch";
import type { paths } from "./api";

export const baseApiHost = "https://discord.com";
export const baseApiPath = "/api/v10";
export const baseApiUrl = `${baseApiHost}${baseApiPath}`;

export const client = createClient<paths>({ baseUrl: baseApiUrl });
