import { redirect } from "next/navigation";

/**
 * Redirige /login → /es/login para que enlaces o callbacks sin [lang] no devuelvan 404.
 */
export default function LoginRedirect() {
  redirect("/es/login");
}
