import { redirect } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token;

  if (token) {
    redirect(`/register?token=${token}`);
  }

  redirect('/login');
}