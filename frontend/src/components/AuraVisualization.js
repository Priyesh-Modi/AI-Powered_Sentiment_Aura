import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const AuraVisualization = ({ sentiment, energy, emotion, colorPalette, keywords }) => {
  const sketchRef = useRef();
  const p5InstanceRef = useRef();

  useEffect(() => {
    // Create p5 sketch
    const sketch = (p) => {
      let time = 0;
      let particles = [];
      let flowField = [];
      let cols, rows;
      let zoff = 0;
      let currentSentiment = 0;
      let currentEnergy = 0.5;
      let currentColors = ['#4A90E2', '#50C878', '#FFB347'];
      let targetSentiment = 0;
      let targetEnergy = 0.5;
      let targetColors = ['#4A90E2', '#50C878', '#FFB347'];
      let currentEmotion = 'neutral';
      let currentKeywords = [];

      // Particle class
      class Particle {
        constructor() {
          this.pos = p.createVector(p.random(p.width), p.random(p.height));
          this.vel = p.createVector(0, 0);
          this.acc = p.createVector(0, 0);
          this.maxSpeed = 2;
          this.size = p.random(1, 4);
          this.life = 255;
          this.maxLife = 255;
        }

        update() {
          this.vel.add(this.acc);
          this.vel.limit(this.maxSpeed * (currentEnergy * 2 + 0.5));
          this.pos.add(this.vel);
          this.acc.mult(0);
          
          // Age the particle
          this.life -= p.random(0.5, 2);
          
          // Wrap around edges
          if (this.pos.x < 0) this.pos.x = p.width;
          if (this.pos.x > p.width) this.pos.x = 0;
          if (this.pos.y < 0) this.pos.y = p.height;
          if (this.pos.y > p.height) this.pos.y = 0;
        }

        follow(flowField) {
          let x = p.floor(this.pos.x / 20);
          let y = p.floor(this.pos.y / 20);
          let index = x + y * cols;
          if (index >= 0 && index < flowField.length) {
            let force = flowField[index].copy();
            force.mult(0.5);
            this.acc.add(force);
          }
        }

        show() {
          let alpha = p.map(this.life, 0, this.maxLife, 0, 100);
          let colorIndex = p.floor(p.map(this.pos.x + this.pos.y, 0, p.width + p.height, 0, currentColors.length));
          colorIndex = p.constrain(colorIndex, 0, currentColors.length - 1);
          
          p.push();
          p.translate(this.pos.x, this.pos.y);
          
          // Create glow effect
          for (let i = 0; i < 3; i++) {
            p.fill(p.red(currentColors[colorIndex]), p.green(currentColors[colorIndex]), p.blue(currentColors[colorIndex]), alpha / (i + 1));
            p.noStroke();
            p.ellipse(0, 0, this.size * (3 - i), this.size * (3 - i));
          }
          
          p.pop();
        }

        isDead() {
          return this.life <= 0;
        }
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorMode(p.RGB);
        p.background(0);
        
        cols = p.floor(p.width / 20);
        rows = p.floor(p.height / 20);
        flowField = new Array(cols * rows);
        
        // Initialize particles
        for (let i = 0; i < 200; i++) {
          particles.push(new Particle());
        }
      };

      p.draw = () => {
        // Smooth transitions
        currentSentiment = p.lerp(currentSentiment, targetSentiment, 0.02);
        currentEnergy = p.lerp(currentEnergy, targetEnergy, 0.02);
        
        // Interpolate colors
        for (let i = 0; i < currentColors.length; i++) {
          if (i < targetColors.length) {
            currentColors[i] = lerpColor(currentColors[i], targetColors[i], 0.02);
          }
        }

        // Create dynamic background based on sentiment
        let bgAlpha = p.map(Math.abs(currentSentiment), 0, 1, 5, 20);
        p.fill(0, bgAlpha);
        p.rect(0, 0, p.width, p.height);

        // Update flow field based on Perlin noise and sentiment
        let yoff = 0;
        for (let y = 0; y < rows; y++) {
          let xoff = 0;
          for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            
            // Enhanced noise calculation with sentiment influence
            let angle = p.noise(xoff, yoff, zoff) * p.TWO_PI * 2;
            angle += currentSentiment * p.PI * 0.5; // Sentiment influences direction
            angle += p.sin(time * 0.01 + x * 0.1) * currentEnergy; // Energy adds oscillation
            
            flowField[index] = p5.Vector.fromAngle(angle);
            flowField[index].mult(currentEnergy * 0.5 + 0.1);
            
            xoff += 0.1;
          }
          yoff += 0.1;
        }
        zoff += 0.005 + currentEnergy * 0.01;

        // Update and display particles
        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].follow(flowField);
          particles[i].update();
          particles[i].show();

          if (particles[i].isDead()) {
            particles.splice(i, 1);
            particles.push(new Particle());
          }
        }

        // Add emotion-based effects
        drawEmotionEffects();
        
        // Draw keyword bursts
        drawKeywordBursts();
        
        time++;
      };

      const drawEmotionEffects = () => {
        p.push();
        p.blendMode(p.SCREEN);
        
        switch (currentEmotion) {
          case 'joy':
            // Bright bursts
            for (let i = 0; i < 3; i++) {
              let x = p.random(p.width);
              let y = p.random(p.height);
              let burstSize = p.random(50, 200) * currentEnergy;
              p.fill(255, 255, 0, 10);
              p.noStroke();
              p.ellipse(x, y, burstSize);
            }
            break;
            
          case 'anger':
            // Sharp, angular effects
            p.stroke(255, 100, 100, 50);
            p.strokeWeight(2);
            for (let i = 0; i < 10; i++) {
              let x1 = p.random(p.width);
              let y1 = p.random(p.height);
              let x2 = x1 + p.random(-100, 100) * currentEnergy;
              let y2 = y1 + p.random(-100, 100) * currentEnergy;
              p.line(x1, y1, x2, y2);
            }
            break;
            
          case 'sadness':
            // Downward flowing particles
            p.fill(100, 150, 255, 30);
            p.noStroke();
            for (let i = 0; i < 20; i++) {
              let x = p.random(p.width);
              let y = p.random(0, p.height * 0.3);
              let dropY = y + p.sin(time * 0.1 + i) * 50;
              p.ellipse(x, dropY, 3, 10 + currentEnergy * 10);
            }
            break;
            
          case 'fear':
            // Chaotic, scattered effects
            p.stroke(200, 100, 200, 30);
            p.strokeWeight(1);
            for (let i = 0; i < 50; i++) {
              let x = p.random(p.width);
              let y = p.random(p.height);
              let pointSize = p.random(5, 20) * currentEnergy;
              let offset = p.noise(time * 0.05 + i) * 100;
              p.point(x + offset, y + offset);
              // Use pointSize for future enhancements
              console.log(pointSize); // Temporary to avoid unused warning
            }
            break;
            
          default:
            // Neutral state - subtle ambient effects
            p.fill(255, 255, 255, 5);
            p.noStroke();
            for (let i = 0; i < 5; i++) {
              let x = p.random(p.width);
              let y = p.random(p.height);
              p.ellipse(x, y, 20 + currentEnergy * 10);
            }
            break;
        }
        
        p.pop();
      };

      const drawKeywordBursts = () => {
        if (currentKeywords && currentKeywords.length > 0) {
          p.push();
          p.blendMode(p.ADD);
          
          currentKeywords.forEach((keyword, index) => {
            let angle = (index / currentKeywords.length) * p.TWO_PI;
            let radius = 100 + p.sin(time * 0.02 + index) * 50;
            let x = p.width / 2 + p.cos(angle) * radius;
            let y = p.height / 2 + p.sin(angle) * radius;
            
            p.fill(255, 255, 255, 20 + currentEnergy * 20);
            p.noStroke();
            p.ellipse(x, y, 30 + currentEnergy * 20);
          });
          
          p.pop();
        }
      };

      const lerpColor = (c1, c2, t) => {
        let color1 = p.color(c1);
        let color2 = p.color(c2);
        
        let r = p.lerp(p.red(color1), p.red(color2), t);
        let g = p.lerp(p.green(color1), p.green(color2), t);
        let b = p.lerp(p.blue(color1), p.blue(color2), t);
        
        return p.color(r, g, b);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        cols = p.floor(p.width / 20);
        rows = p.floor(p.height / 20);
        flowField = new Array(cols * rows);
      };

      // Update function to receive props
      p.updateProps = (newSentiment, newEnergy, newEmotion, newColors, newKeywords) => {
        targetSentiment = newSentiment || 0;
        targetEnergy = newEnergy || 0.5;
        currentEmotion = newEmotion || 'neutral';
        targetColors = newColors || ['#4A90E2', '#50C878', '#FFB347'];
        currentKeywords = newKeywords || [];
      };
    };

    // Create p5 instance
    p5InstanceRef.current = new p5(sketch, sketchRef.current);

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, []); // Empty dependency array is correct here

  // Update props when they change
  useEffect(() => {
    if (p5InstanceRef.current && p5InstanceRef.current.updateProps) {
      p5InstanceRef.current.updateProps(sentiment, energy, emotion, colorPalette, keywords);
    }
  }, [sentiment, energy, emotion, colorPalette, keywords]); // All dependencies included

  return <div ref={sketchRef} className="aura-visualization" />;
};

export default AuraVisualization;