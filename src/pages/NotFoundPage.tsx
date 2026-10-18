import { Link } from "react-router";
import { Button } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">This page doesn't exist</h1>
        <p className="mt-3 text-muted">It may have moved, or the link is wrong.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button variant="primary" size="lg">Back to Create</Button>
        </Link>
      </div>
    </div>
  );
}
