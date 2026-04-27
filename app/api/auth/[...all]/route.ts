import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export const { POST, GET } = auth.toNextApiHandler()

// Additional endpoint for getting session
export async function GET_SESSION(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  return Response.json({ user: session?.user || null })
}
