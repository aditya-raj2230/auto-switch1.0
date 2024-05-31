'use client'

import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css';
const Hero = () => {
  return (
    <section className="flex flex-col gap-20 xl:flex-row  ">
      <div className="hero-section w-screen text-center py-12 h-full">
        <h1 className="text-4xl font-bold mb-4">
          Want to Drive Your Dream Car?
        </h1>
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          className="mx-auto max-w-4xl "
        >
          <div>
            <img
              src="/daniel-thiele-C0jolb5ay0c-unsplash.jpg"
              alt="Dream Car 1"
              className="object-cover w-full h-96"
            />
          </div>
          <div>
            <img
              src="/sean-pollock-PhYq704ffdA-unsplash.jpg"
              alt="Dream Car 2"
              className="object-cover w-full h-96"
            />
          </div>
          <div>
            <img
              src="/samuel-girven-NGbtPRrEujY-unsplash.jpg"
              alt="Dream Car 3"
              className="object-cover w-full h-96"
            />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default Hero;
