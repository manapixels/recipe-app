import { Metadata } from 'next';
import ProtectedWrapper from '@/_components/auth/ProtectedWrapper';
import EventListInMyEvents from './_components/EventListInMyEvents';

export const metadata: Metadata = {
  title: 'recipe-app | My Events',
};

export default function MyEventsPage() {
  return (
    <ProtectedWrapper>
      <div className="flex w-full flex-col md:col-span-4">
        <EventListInMyEvents />
      </div>
    </ProtectedWrapper>
  );
}
