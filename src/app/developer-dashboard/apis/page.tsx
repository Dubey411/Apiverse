import { redirect } from 'next/navigation';

export default async function DeveloperDashboardApisPage() {
  redirect('/developer-dashboard/projects');
}
