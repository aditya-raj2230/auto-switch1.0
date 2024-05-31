"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
const Hero = () => {
  return (
    <section className="flex flex-row xl:flex-col gap-10">
     
      <div className="hero-section w-screen text-center py-0 h-full flex justify-around gap-0 flex-row ">
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
      <div className="hero-section w-screen text-center py-0 h-full flex  justify-around gap-0 flex-row ">
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
      
     
      <div className="hero-section w-screen text-center py-0 h-full flex  justify-around gap-0 flex-row ">
      <h1 className="text-4xl font-bold mb-4 flex flex-col justify-center  m-10  items-center lg:ml-96">
          Drive your <span>Dream Car</span>
        </h1>
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showArrows={false}
          showIndicators={false}
          className="mx-auto h-2/5 bg-blue w-3/4 rounded-lg ml-32 mr-10 "
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
     
      
    </section>
  );
};

export default Hero;
