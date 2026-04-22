import { headers } from "next/headers";
import DocsLayoutClient from "@/components/docs/DocsLayoutClient";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const docsBase = host.startsWith("docs.") ? "" : "/docs";

  return (
    <DocsLayoutClient docsBase={docsBase}>
      {children}
    </DocsLayoutClient>
  );
}
