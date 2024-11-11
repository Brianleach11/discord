export function GET(req: Request) {
  const url = new URL("/dms", req.url);
  return Response.redirect(url);
}
