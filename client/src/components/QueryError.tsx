export function QueryError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-red-600">
      {message}
    </p>
  );
}
