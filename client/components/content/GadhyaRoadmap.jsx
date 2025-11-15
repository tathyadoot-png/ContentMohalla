"use client";
import React from "react";
import Link from "next/link";

export default function GadhyaRoadmap({ vidhaye }) {
  if (!vidhaye || !vidhaye.length) return <p>Loading...</p>;

  return (
    <div className="min-h-screen py-20 px-6">
      <h1 className="text-center text-5xl font-bold mb-12">गद्य विधाओं का विकास-क्रम</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {vidhaye.map((vidha) => (
          <Link key={vidha.id} href={`/gadhya/${vidha.attributes.slug}`}>
            <div className="border rounded-lg p-6 shadow-lg hover:scale-105 transition-transform cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">{vidha.attributes.name}</h2>
              <p className="text-sm line-clamp-3">{vidha.attributes.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
