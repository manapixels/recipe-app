import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

const ListOfParticipants = ({ participants }: { participants: any[] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState(participants);
  const debounced = useDebounceCallback(setSearchTerm, 500);

  useEffect(() => {
    setFilteredParticipants(
      participants.filter(participant =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  return (
    <div>
      <div className="sticky top-0 z-10 mb-4">
        <input
          type="text"
          placeholder="Search participants by name..."
          onChange={e => debounced(e.target.value)}
          className="p-4 border-2 border-black rounded w-full"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filteredParticipants.map(participant => (
          <div key={participant.id}>
            <Link
              href={`/profiles/${participant.username}`}
              target="_blank"
              className="flex gap-2 px-3 py-2 border border-gray-200 rounded-lg mb-2"
            >
              <Image
                src={
                  participant?.avatar_url !== ''
                    ? participant.avatar_url
                    : '/users/placeholder-avatar.svg'
                }
                alt={participant.name}
                width={30}
                height={30}
                className="rounded-full"
              />
              <div>
                <div className="font-medium text-sm">{participant.name}</div>
                <div className="text-sm text-gray-500">
                  {participant?.tickets_bought}{' '}
                  {participant?.tickets_bought > 1 ? 'tickets' : 'ticket'}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListOfParticipants;
