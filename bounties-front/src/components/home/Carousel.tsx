"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";

const logos = [
  {
    alt: "Meta Pool",
    bw: "/assets/home/carousel/metapoolColorlessLogo.png",
    color: "/assets/home/carousel/metapoolLogo.png",
    width: 182.8,
    height: 22,
    offsetY: 1,
    offsetX: -35,
  },
  {
    alt: "Mango",
    bw: "/assets/home/carousel/mangoColorlessLogo.png",
    color: "/assets/home/carousel/mangoLogo.png",
    width: 89,
    height: 31.2,
    offsetY: -2,
  },
  {
    alt: "BitMart",
    bw: "/assets/home/carousel/bitmartColorlessLogo.png",
    color: "/assets/home/carousel/bitmartLogo.png",
    width: 150.2,
    height: 38.1,
    offsetY: -2,
  },
  {
    alt: "Streamflow",
    bw: "/assets/home/carousel/streamflowColorlessLogo.png",
    color: "/assets/home/carousel/streamflowLogo.png",
    width: 237,
    height: 38.4,
    offsetY: 0,
  },
  {
    alt: "Turtle",
    bw: "/assets/home/carousel/turtleclubColorlessLogo.png",
    color: "/assets/home/carousel/turtleclubLogo.png",
    width: 192.86,
    height: 47.5,
    offsetY: -2,
    offsetX: -50,
  },
  {
    alt: "Kaisar",
    bw: "/assets/home/carousel/kaisarColorlessLogo.png",
    color: "/assets/home/carousel/kaisarLogo.png",
    width: 127.6,
    height: 40.5,
    offsetY: -1,
  },
  {
    alt: "Bitget",
    bw: "/assets/home/carousel/bitgetColorlessLogo.png",
    color: "/assets/home/carousel/bitgetLogo.png",
    width: 210,
    height: 37.5,
    offsetY: 1,
  },
];

export default function Carousel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const backgroundStyle = "linear-gradient(to right, #003459 0%, #FF5800 50%, #003459 100%)";

  return (
    <div
      className="relative w-full overflow-hidden py-12 max-md:py-8 mb-16"
      style={{ background: backgroundStyle }}
    >
      <Marquee speed={60} gradient={false} className="gap-16 px-8">
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={`${logo.alt}-${index}`}
            className="group relative flex items-center justify-center mx-28 max-md:mx-24"
            style={{
              width: isMobile ? logo.width * 0.67 : logo.width,
              height: isMobile ? logo.height * 0.67 : logo.height,
              transform: `translateY(${logo.offsetY ?? 0}px)`,
              marginLeft: logo.offsetX ?? 0,
            }}
          >
            <Image
              src={logo.bw}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="object-contain absolute transition-opacity duration-300 opacity-100 group-hover:opacity-0"
              style={{ width: 'auto', height: 'auto' }}
            />
            <Image
              src={logo.color}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
