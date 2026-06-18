import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/DashboardLayout';

export default async function DeveloperDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Developer';

  return (
    <DashboardLayout
      user={{
        email: user.email ?? '',
        name,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
