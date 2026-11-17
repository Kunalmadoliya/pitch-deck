import { auth } from "@/auth/auth";
import { getImageKitUploadAuthParams } from "@/modules/indexing/upload/auth-params";

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(getImageKitUploadAuthParams());
}
