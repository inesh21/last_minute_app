import { formatTitle } from '../../utils/format';

export function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {formatTitle('dashboard-feature')} is ready for the next iteration.
      </p>
    </div>
  );
}
