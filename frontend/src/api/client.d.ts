export function getJson(path: string, token?: string | null): Promise<unknown>;
export function postJson(path: string, body: unknown, token?: string | null): Promise<unknown>;
export function patchJson(path: string, body: unknown, token?: string | null): Promise<unknown>;
export function deleteJson(path: string, token?: string | null): Promise<unknown>;
