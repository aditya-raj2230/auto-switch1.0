import Image from "next/image";
import { useEffect, useState } from "react";

const Carousel = () => {
  const images = ["/cardcar.png", "/cardcar.png", "/cardcar.png"];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
      console.log(`Current Image Index: ${currentImage}`);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div className="relative w-full h-96 flex justify-center items-center overflow-hidden bg-gray-200">
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentImage * 100}%)` }}
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 flex justify-center items-center"
          >
            <Image
              src={src}
              alt={`Slide ${index}`}
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
              onLoadingComplete={() => console.log(`Image ${index} loaded`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;