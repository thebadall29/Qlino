import React, { useState } from 'react';
import './process.css'; // Adjust the path as needed

const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(1);

  const handleNext = (step) => {
    setActiveStep(step);
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <div className="form-steps-container">
          <div className={`form-step step-one ${activeStep >= 1 ? 'active' : ''}`}></div>
          <div className={`form-step step-two ${activeStep >= 2 ? 'active' : ''}`}></div>
          <div className={`form-step step-three ${activeStep >= 3 ? 'active' : ''}`}></div>
        </div>
        <div className={`form-content ${activeStep === 1 ? 'active' : ''}`}>
          <h1>This is a CSS-only way of separating text into interactive blocks</h1>
          <p>Scratch leg; meow for can opener to feed me the fat cat sat on the mat bat away with paws. Carefully drink from water glass and then spill it everywhere and proceed to lick the puddle fart in owners food and stretch out on bed, yet scoot butt on the rug. Pounce on unsuspecting person walk on keyboard or jump on fridge stare at the wall, play with food and get confused by dust yet i dreamt about fish yum! for where is it?</p>
          <label htmlFor="step2" onClick={() => handleNext(2)}>Next</label>
        </div>
        <div className={`form-content ${activeStep === 2 ? 'active' : ''}`}>
          <h2>Inspired by ekrof's "<span className="italic">CSS Only Playground</span>"</h2>
          <p>Woops poop hanging from butt must get rid run run around house drag poop on floor maybe it comes off woops left brown marks on floor human slave clean lick butt now why can't i catch that stupid red dot murf pratt ungow ungow.</p>
          <label htmlFor="step3" onClick={() => handleNext(3)}>Next</label>
        </div>
        <div className={`form-content ${activeStep === 3 ? 'active' : ''}`}>
          <h2>This was a fun, experimental CSS project</h2>
          <p>I love to jump in box meow like crazy and then stare at nothing sit by the window and stare outside. Whiskers bat at toy, but sniff catnip and get groggy. Lie down in awkward position, but hate water, but always back for more!</p>
          <input type="reset" value="Reset" onClick={() => setActiveStep(1)} />
        </div>
      </div>
    </div>
  );
};

export default ProcessSection;
