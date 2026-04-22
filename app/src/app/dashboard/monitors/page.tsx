import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getChangeHistory, getUrlLimit } from '@/lib/db';
import { getUser, getUserUrls } from '@/lib/cached-data';
import { type Locale } from '@/lib/i18n';
import { MonitorsContent } from './monitors-content';

export default async function MonitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const user = await getUser();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || 'en';

  const isComplianceRef = params.ref === 'compliance';

  const [urls, history] = await Promise.all([
    getUserUrls(user.id as string),
    getChangeHistory(user.id as string, 1) as Promise<any[]>,
  ]);
  const urlLimit = getUrlLimit(user.plan as string);
  const isNewUser = urls.length === 0 && history.length === 0;

  return (
    <MonitorsContent
      urls={urls}
      urlLimit={urlLimit}
      isNewUser={isNewUser}
      isComplianceRef={isComplianceRef}
      plan={user.plan as string}
      locale={locale}
    />
  );
}
