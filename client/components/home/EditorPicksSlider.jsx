'use client';

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import { fetchByCategoryAndSection } from "@/services/newsService";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MetaInfo from "@/common/MetaInfo"; // ✅ Import MetaInfo

export default function EditorPicksSlider() {
  const [editorPicks, setEditorPicks] = useState([]);
  const [slidesToShow, setSlidesToShow] = useState(4);

  useEffect(() => {
    const fetchEditorPicks = async () => {
      try {
        const data = await fetchByCategoryAndSection({ category: "editor's-picks" });
        const allPicks = [].concat(...Object.values(data || {}));
        const uniquePicks = Array.from(
          new Map(allPicks.map((item) => [item._id, item])).values()
        );
        setEditorPicks(uniquePicks);
      } catch (error) {
        console.error("Error fetching editor picks:", error);
        setEditorPicks([]);
      }
    };
    fetchEditorPicks();
  }, []);

  useEffect(() => {
    const calc = (w) => {
      if (w >= 1280) return 4;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    };

    if (typeof window !== "undefined") setSlidesToShow(calc(window.innerWidth));

    let t = null;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setSlidesToShow(calc(window.innerWidth)), 100);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    centerMode: slidesToShow === 1,
    centerPadding: slidesToShow === 1 ? "20px" : "0",
  };

  return (
    <section className="w-full px-2 sm:px-4 py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 border-b-2 border-accent pb-2">
        Editor&apos;s Picks
      </h2>

      {editorPicks.length > 0 ? (
        <Slider {...settings} key={slidesToShow} className="editor-slider">
          {editorPicks.map((item, i) => (
            <div key={i} className="px-1">
              <div className="flex flex-col w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer bg-white border border-gray-100">
                <div className="relative w-full h-48 sm:h-64 md:h-72">
                  <Image
                    src={item.imageUrl || "/default.jpg"}
                    alt={item.title || "editor pick"}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105 rounded-t-xl"
                  />
                </div>
                <div className="p-3 sm:p-4 flex flex-col gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-[#3f3f3f] mb-1 hover:text-accent transition-colors">
                    {item.title}
                  </h3>

                  {/* ✅ MetaInfo component */}
                  <MetaInfo
                    author={item.authoredBy}
                    location={item.deskLocation}
                    date={item.createdAt}
                  />
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-gray-500 text-center">No editor picks available.</p>
      )}
    </section>
  );
}
