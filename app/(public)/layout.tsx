// Layout para rutas públicas (no necesita autenticación)
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

