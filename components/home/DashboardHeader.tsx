export function DashboardHeader({
  email,
  roleText,
}: {
  email: string | undefined;
  roleText: string;
}) {
  return (
    <header className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-foreground">
            🎸 Welcome Back!
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground break-all">{email}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Role: {roleText}</p>
        </div>
      </div>
    </header>
  );
}
