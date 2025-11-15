'use client';

import Image from 'next/image';

const fiveIcons = {
  who: '/2.png',
  what: '/1.png',
  when: '/3.png',
  where: '/4.png',
  why: '/5.png',
  how: '/6.png',
};

export default function FiveW1H({ description }) {
  if (!description) return null;

  let data = {};
  try {
    data =
      typeof description === 'string' ? JSON.parse(description) : description;
  } catch (err) {
    console.error('Failed to parse 5W1H:', err);
  }

  const keys = ['who', 'what', 'when', 'where', 'why', 'how'];

  return (
    <div className="relative flex flex-col mt-6">
      {/* Vertical line */}
      <div className="absolute left-[33px] top-0 w-1 bg-borderCustom h-full"></div>

      {keys.map((key, idx) => (
        <div key={key} className="flex items-start gap-6 mb-10 relative">
          <div className="flex flex-col items-center">
            {/* Circle + Image */}
            <div className="bg-white rounded-full p-3 shadow z-10 flex items-center justify-center w-16 h-16">
              <Image
                src={fiveIcons[key]}
                alt={key}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>

            {/* Connector line */}
            {idx !== keys.length - 1 && (
              <div className="w-1 h-full bg-borderCustom -mt-1"></div>
            )}
          </div>

          {/* Text content */}
          <div className="ml-8">
            <h4 className="font-semibold text-primary capitalize">{key}</h4>
            <p className="text-desc mt-1">{data[key] || '-'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
