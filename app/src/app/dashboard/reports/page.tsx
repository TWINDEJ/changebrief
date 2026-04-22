import { redirect } from 'next/navigation';
import { getSession, getUser } from '@/lib/cached-data';
import { ReportConfig } from './report-config';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session?.user?.email) redirect('/login');

  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <ReportConfig
      email={session.user.email}
      initialDigestFrequency={(user.digest_frequency as string) || 'weekly'}
      plan={user.plan as string}
    />
  );
}
