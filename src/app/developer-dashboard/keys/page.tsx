import { redirect } from 'next/navigation';

export default async function DeveloperDashboardKeysPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.searchParams;
  const slug = params.slug || params.apiSlug;
  if (slug) {
    redirect(`/developer-dashboard/projects?apiSlug=${slug}`);
  }
  redirect('/developer-dashboard/projects');
}
