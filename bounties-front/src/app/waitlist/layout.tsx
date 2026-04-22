import { GuestLayout, HostLayout } from '@/components/layout';

export default function HostLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestLayout>
      {children}
    </GuestLayout>
  );
}