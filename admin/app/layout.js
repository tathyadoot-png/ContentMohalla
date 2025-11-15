// app/layout.js
import "@/styles/globals.css";
import AuthProviderWrapper from "../components/AuthProviderWrapper";

export const metadata = {
  title: "Admin Panel",
  description: "Admin panel for managing news and editors",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
