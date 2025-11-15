"use client";
import React from "react";
import Link from "next/link";

export default function RasaChakra({ rasas }) {
  if (!rasas || !rasas.length) return <p>Loading...</p>;

  const centerRasa = rasas[0];
  const outerRasas = rasas.slice(1);

  return (
    <div className="min-h-screen py-20 px-6">
      <h1 className="text-center text-5xl font-bold mb-12">काव्य का नवरस चक्र</h1>

      {/* Center Rasa */}
      <div className="text-center mb-12">
        <Link href={`/kavya/${centerRasa.attributes.slug}`}>
          <div className="p-6 border rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <h2 className="text-3xl font-bold">{centerRasa.attributes.name}</h2>
            <p className="mt-2">{centerRasa.attributes.description}</p>
          </div>
        </Link>
      </div>

      {/* Outer Rasas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {outerRasas.map((ras) => (
          <Link key={ras.id} href={`/kavya/${ras.attributes.slug}`}>
            <div className="p-4 border rounded-lg shadow hover:shadow-lg cursor-pointer">
              <h3 className="text-xl font-semibold mb-1">{ras.attributes.name}</h3>
              <p className="text-sm line-clamp-3">{ras.attributes.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
