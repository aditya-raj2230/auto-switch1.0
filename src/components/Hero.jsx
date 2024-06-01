"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
const Hero = () => {
  return (
    <section className="flex flex-row xl:flex-col gap-10 m-10">
      <div className="hero-section w-screen text-center py-0 h-full lg:flex justify-around gap-0 flex-row hidden ">
        <h1 className="text-4xl font-bold mb-4 flex flex-col justify-center  m-20  items-center lg:ml-96">
          Drive your <span>Dream Car</span>
        </h1>
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showArrows={false}
          showIndicators={false}
          className="mx-auto h-2/5 bg-blue w-3/4 rounded-lg ml-32 mr-10"
        >
          <div className="rounded-lg">
            <img
              src="/joshua-koblin-kvbblovYuX4-unsplash.jpg"
              alt="Dream Car 1"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
          <div className="rounded-lg">
            <img
              src="/samuel-girven-NGbtPRrEujY-unsplash.jpg"
              alt="Dream Car 2"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
          <div className="rounded-lg">
            <img
              src="/roland-denes-EWf48MRVUNE-unsplash.jpg"
              alt="Dream Car 3"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
        </Carousel>
      </div>
      <div className="hero-section w-screen text-center py-0 h-full lg:flex  justify-around gap-0 flex-row hidden ">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showArrows={false}
          showIndicators={false}
          className="mx-auto h-2/5 bg-blue w-3/4 rounded-lg mr-32 ml-10 "
        >
          <div className="rounded-lg">
            <img
              src="/joshua-koblin-kvbblovYuX4-unsplash.jpg"
              alt="Dream Car 1"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
          <div className="rounded-lg">
            <img
              src="/samuel-girven-NGbtPRrEujY-unsplash.jpg"
              alt="Dream Car 2"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
          <div className="rounded-lg">
            <img
              src="/roland-denes-EWf48MRVUNE-unsplash.jpg"
              alt="Dream Car 3"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
        </Carousel>
        <h1 className="text-4xl font-bold mb-4 flex flex-col justify-center  m-10  items-center lg:mr-96">
          Drive your <span>Dream Car</span>
        </h1>
      </div>
      <div className="hero-section w-screen text-center py-0 h-full lg:flex justify-around gap-0 flex-row hidden ">
        <h1 className="text-4xl font-bold mb-4 flex flex-col justify-center  m-20  items-center lg:ml-96">
          Drive your <span>Dream Car</span>
        </h1>
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showArrows={false}
          showIndicators={false}
          className="mx-auto h-2/5 bg-blue w-3/4 rounded-lg ml-32 mr-10"
        >
          <div className="rounded-lg">
            <img
              src="/joshua-koblin-kvbblovYuX4-unsplash.jpg"
              alt="Dream Car 1"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
          <div className="rounded-lg">
            <img
              src="/samuel-girven-NGbtPRrEujY-unsplash.jpg"
              alt="Dream Car 2"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
          <div className="rounded-lg">
            <img
              src="/roland-denes-EWf48MRVUNE-unsplash.jpg"
              alt="Dream Car 3"
              className="object-cover w-full h-96 rounded-lg"
            />
          </div>
        </Carousel>
      </div>
      


      <div className="hero-section w-screen text-center py-0 h-full flex flex-col lg:flex-row justify-around gap-0 lg:hidden lg:gap-0 rounded-lg mt-10">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showArrows={false}
          showIndicators={false}
          className="mx-auto h-2/5 bg-blue w-3/4 rounded-lg lg:ml-32 lg:mr-10"
        >
          <div className="relative rounded-lg">
            <img
              src="/joshua-koblin-kvbblovYuX4-unsplash.jpg"
              alt="Dream Car 1"
              className="object-cover w-full h-96 rounded-lg"
            />
            <h2 className="absolute inset-0 flex items-center justify-center text-2xl rounded-lg font-bold text-white bg-black bg-opacity-50 lg:text-4xl lg:top-10 lg:left-10">
              Drive your Dream Car
            </h2>
          </div>
          <div className="relative rounded-lg">
            <img
              src="/samuel-girven-NGbtPRrEujY-unsplash.jpg"
              alt="Dream Car 2"
              className="object-cover w-full h-96 rounded-lg"
            />
            <h2 className="absolute inset-0 flex items-center justify-center text-2xl rounded-lg font-bold text-white bg-black bg-opacity-50 lg:text-4xl lg:top-10 lg:left-10">
              Swap car in your city
            </h2>
          </div>
          <div className="relative rounded-lg">
            <img
              src="/roland-denes-EWf48MRVUNE-unsplash.jpg"
              alt="Dream Car 3"
              className="object-cover w-full h-96 rounded-lg"
            />
            <h2 className="absolute inset-0 flex items-center justify-center text-2xl font-bold rounded-lg text-white bg-black bg-opacity-50 lg:text-4xl lg:top-10 lg:left-10">
              Rent a car in your city
            </h2>
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default Hero;
