export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6">
      <div className="container text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} MovieRush – Last-Minute Movie Booking Platform
      </div>
    </footer>
  );
}
