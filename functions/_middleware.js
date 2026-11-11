// Endereço único: www.willianbocalon.com.br -> willianbocalon.com.br (301)
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === "www.willianbocalon.com.br") {
    url.hostname = "willianbocalon.com.br";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
