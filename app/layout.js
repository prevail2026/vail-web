export const metadata = {
  title: "vail",
  description: "Personal site — projects, music, github, and skills.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
