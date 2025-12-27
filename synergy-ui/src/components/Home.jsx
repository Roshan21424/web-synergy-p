import React from "react";
import Hero from "./Hero";
import AboutUs from "./AboutUs";
import Services from "./Services";
import FindExperts from "./FindExperts";
import BecomeExpert from "./BecomeExpert";
import ProcessSteps from "./ProcessSteps";
import Footer from "./Footer";

const Home = () => {
  return (
      <div>
      <Hero></Hero>
      <AboutUs></AboutUs>
      <Services></Services>
      <FindExperts></FindExperts>
      <BecomeExpert></BecomeExpert>
      <ProcessSteps></ProcessSteps>
      <Footer></Footer>
    </div>
  );
};
export default Home;
