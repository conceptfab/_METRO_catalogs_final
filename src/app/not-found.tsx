import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-semibold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        <Link
          href="/"
          className="text-primary underline hover:text-primary/90 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
