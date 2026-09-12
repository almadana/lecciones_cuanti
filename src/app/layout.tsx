import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata: Metadata = {
  title: "Lecciones Cuanti",
  description: "Historias interactivas para aprender estadística con preguntas y datos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
