import React, { useState, useEffect, useRef, useCallback } from 'react';
import Jigglypuff from './Jigglypuff';

// Game Constants
const GRAVITY = 0.4;
const DAMPING = 0.992; // Air resistance (friction)
const PUSH_FORCE = 0.35; // Keep low sensitivity
const MAX_ANGLE = 85; // Max swing angle in degrees

type GameState = 'start' | 'low' | 'fun' | 'high' | 'max';

const GameScene: React.FC = () => {
  // Physics State (using refs for smooth loop)
  const angleRef = useRef(0); // Current angle in radians
  const velocityRef = useRef(0); // Angular velocity
  const requestRef = useRef<number>(0);
  
  // React State for rendering
  const [displayAngle, setDisplayAngle] = useState(0); // Degrees for UI
  const [gameState, setGameState] = useState<GameState>('start');
  const [message, setMessage] = useState("点击屏幕推一下！");
  const [pushEffect, setPushEffect] = useState(false);

  // Determine game state based on ESTIMATED AMPLITUDE (Max potential angle of current swing)
  // This prevents the mood from flickering when the swing passes through the center (0 degrees).
  const updateGameState = (amplitude: number) => {
    // Add a small threshold for "stopped"
    if (amplitude < 2) {
      setGameState('start');
      setMessage("点击屏幕推一下！");
      return;
    }

    // Logic based on requirements:
    // 1. Max height (approx 85)
    if (amplitude >= MAX_ANGLE - 2) { 
         setGameState('max');
         setMessage("已经最高了！");
         return;
    }

    // 2. Too fast (> 75)
    if (amplitude > 75) {
      setGameState('high');
      setMessage("太快了太快了！");
      return;
    }

    // 3. Happy Zone (30 - 75)
    // Even if current angle is 0, if amplitude is > 30, we stay happy.
    if (amplitude >= 30) {
      setGameState('fun');
      setMessage("好开心！再快点！");
      return;
    }

    // 4. Low Zone (< 30)
    setGameState('low');
    setMessage("再快点！");
  };

  // Main Physics Loop
  const animate = useCallback(() => {
    // 1. Update Physics
    // Angular Acceleration = -(g / L) * sin(theta)
    // k represents g/L factor in our simulation
    const k = GRAVITY / 100;
    const acceleration = -1 * k * Math.sin(angleRef.current);
    
    velocityRef.current += acceleration;
    velocityRef.current *= DAMPING; // Apply friction
    
    angleRef.current += velocityRef.current;

    // 2. Clamp physics to MAX_ANGLE
    const maxRad = MAX_ANGLE * (Math.PI / 180);
    if (angleRef.current > maxRad) {
        angleRef.current = maxRad;
        if (velocityRef.current > 0) velocityRef.current = 0; 
    } else if (angleRef.current < -maxRad) {
        angleRef.current = -maxRad;
        if (velocityRef.current < 0) velocityRef.current = 0;
    }

    // 3. Calculate Energy-based Amplitude
    // This predicts how high the swing goes based on current speed and position.
    // Conservation of Energy approx: 1 - cos(MaxTheta) = (1 - cos(CurrentTheta)) + 0.5 * v^2 / k
    const currentTheta = angleRef.current;
    const currentV = velocityRef.current;
    
    // Calculate cosine of the max angle
    let cosMaxTheta = Math.cos(currentTheta) - (0.5 * currentV * currentV) / k;
    // Clamp to valid cosine range [-1, 1]
    cosMaxTheta = Math.max(-1, Math.min(1, cosMaxTheta));
    
    const amplitudeRad = Math.acos(cosMaxTheta);
    const amplitudeDeg = amplitudeRad * (180 / Math.PI);

    // 4. Render
    setDisplayAngle(currentTheta * (180 / Math.PI));
    updateGameState(amplitudeDeg);

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Interaction Handler
  const handlePush = useCallback(() => {
    // Logic: Push in the direction of current movement, or start moving if stopped
    if (Math.abs(velocityRef.current) < 0.01) {
       velocityRef.current = PUSH_FORCE / 10;
    } else {
       const direction = velocityRef.current > 0 ? 1 : -1;
       velocityRef.current += (PUSH_FORCE / 10) * direction;
    }

    // Visual feedback
    setPushEffect(true);
    setTimeout(() => setPushEffect(false), 200);
  }, []);

  // Calculate mood based on state
  const getMood = (): 'normal' | 'happy' | 'scared' => {
    if (gameState === 'max') return 'scared';
    if (gameState === 'high') return 'scared';
    if (gameState === 'fun') return 'happy';
    return 'normal';
  };

  // Dynamic Background Colors based on height
  const getSkyColor = () => {
    if (gameState === 'max') return 'from-purple-800 to-red-500'; // Max intensity
    if (gameState === 'high') return 'from-orange-300 to-red-300'; // Intense/sunset
    if (gameState === 'fun') return 'from-cyan-300 to-blue-400'; // Bright clear sky
    return 'from-blue-200 to-green-100'; // Calm morning
  };

  return (
    <div 
      className={`relative w-full h-full bg-gradient-to-b ${getSkyColor()} transition-colors duration-1000 flex flex-col overflow-hidden select-none touch-manipulation`}
      onMouseDown={handlePush}
      onTouchStart={handlePush}
      role="button"
      tabIndex={0}
      aria-label="Push the swing"
    >
      {/* Dynamic Clouds Layer */}
      <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute top-10 left-10 w-32 h-16 bg-white rounded-full blur-xl animate-pulse" />
        <div className="absolute top-24 right-20 w-48 h-20 bg-white rounded-full blur-xl" style={{ opacity: 0.7 }} />
      </div>

      {/* Top Branch/Frame */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-12 bg-none flex justify-center z-20">
         {/* Tree Branch Visual */}
         <div className="w-[120%] h-32 -mt-20 bg-amber-800 rounded-full shadow-lg border-b-4 border-amber-900" />
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative flex justify-center items-start pt-10">
        
        {/* The Swing Container */}
        <div 
          className="absolute origin-top"
          style={{ 
            transform: `rotate(${displayAngle}deg)`,
            top: '0px', 
            height: '220px', 
            width: '10px' 
          }}
        >
          {/* Ropes */}
          <div className="absolute top-[-50px] left-[-40px] w-1 h-[270px] bg-amber-700 opacity-80" />
          <div className="absolute top-[-50px] right-[-40px] w-1 h-[270px] bg-amber-700 opacity-80" />

          {/* Seat & Character Container */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[80%] w-32 h-32">
            {/* The Seat */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-3 bg-amber-800 rounded shadow-md z-0" />
            
            {/* Jigglypuff */}
            <div className="relative w-full h-full z-10 -mt-8">
               <Jigglypuff mood={getMood()} />
            </div>
          </div>
        </div>

      </div>

      {/* Environment / Ground */}
      <div className="relative h-1/5 w-full z-10">
         <div className="absolute bottom-0 w-full h-full bg-green-300 rounded-t-[100%] scale-150 translate-y-4" />
         <div className="absolute bottom-0 w-full h-3/4 bg-green-400 rounded-t-[50%] scale-125 translate-x-20 translate-y-2" />
         
         <div className="absolute bottom-10 left-10 w-4 h-4 bg-yellow-300 rounded-full drop-shadow-md" />
         <div className="absolute bottom-16 left-24 w-4 h-4 bg-pink-400 rounded-full drop-shadow-md" />
         <div className="absolute bottom-8 right-20 w-5 h-5 bg-purple-400 rounded-full drop-shadow-md" />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-24 w-full flex flex-col items-center pointer-events-none z-30">
        <div 
          className={`
            px-4 py-2 rounded-xl backdrop-blur-md bg-white/70 shadow-lg border-2 border-white
            transition-all duration-300 transform
            ${pushEffect ? 'scale-105' : 'scale-100'}
          `}
        >
          <p className={`text-lg md:text-xl font-bold tracking-wider ${
            gameState === 'max' ? 'text-purple-700 animate-pulse' :
            gameState === 'high' ? 'text-red-500 animate-bounce' :
            gameState === 'fun' ? 'text-pink-600' :
            'text-gray-700'
          }`}>
            {message}
          </p>
        </div>
        
        <p className="mt-2 text-white/90 text-xs font-medium drop-shadow-md bg-black/20 px-3 py-1 rounded-full">
          点击屏幕任何位置推秋千
        </p>
      </div>

      {/* Visual Feedback Effect for Click */}
      {pushEffect && (
        <div className="absolute inset-0 bg-white/10 pointer-events-none animate-ping" />
      )}

    </div>
  );
};

export default GameScene;