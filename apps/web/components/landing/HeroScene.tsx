import styles from './landing.module.css';

export default function HeroScene() {
  return (
    <div
      aria-label="Illustration of a delivery vehicle moving through a local town"
      className={styles.heroScene}
      role="img"
    >
      <svg aria-hidden="true" viewBox="0 0 760 470">
        <path
          className={styles.cloud}
          d="M75 127c0-25 20-45 45-45 8 0 16 2 22 6 8-23 30-39 56-39 31 0 56 24 59 54h8c22 0 40 18 40 40H93c-10-3-18-8-18-16Z"
        />
        <path
          className={styles.cloud}
          d="M480 95c0-18 15-33 33-33 6 0 12 2 17 5 6-17 23-29 42-29 24 0 42 18 44 41h6c16 0 30 13 30 29H494c-8-2-14-6-14-13Z"
        />
        <circle className={styles.sun} cx="622" cy="142" r="44" />
        <path
          className={styles.hillBack}
          d="M0 315c105-82 194-88 302-14s207 61 458-14v183H0Z"
        />
        <path
          className={styles.hillFront}
          d="M0 361c113-59 214-43 317 12 124 66 252-5 443-52v149H0Z"
        />
        <path
          className={styles.road}
          d="M0 407c178-47 292-42 412 0s227 45 348 11v52H0Z"
        />
        <path
          className={styles.roadLine}
          d="M77 433c60-8 100-8 145-4m270 3c42 7 76 8 119 5"
        />
        <g className={styles.town} aria-hidden="true">
          <path d="M95 305h94v89H95z" />
          <path d="M109 276h66v29h-66z" />
          <path d="M213 293h74v101h-74z" />
          <path d="M222 266h56v27h-56z" />
          <path d="M516 294h99v102h-99z" />
          <path d="M532 266h67v28h-67z" />
          <path d="M626 315h58v79h-58z" />
          <path d="M638 291h34v24h-34z" />
        </g>
        <g className={styles.windows} aria-hidden="true">
          <path d="M111 324h15v19h-15zm27 0h15v19h-15zm-27 31h15v19h-15zm27 0h15v19h-15zm68-44h14v18h-14zm27 0h14v18h-14zm-27 30h14v18h-14zm27 0h14v18h-14zm293-28h15v19h-15zm28 0h15v19h-15zm-28 32h15v19h-15zm28 0h15v19h-15zm82-11h13v17h-13zm0 28h13v17h-13z" />
        </g>
        <g className={styles.tree} aria-hidden="true">
          <path d="M341 364h10v38h-10z" />
          <circle cx="346" cy="347" r="25" />
          <circle cx="329" cy="359" r="17" />
          <circle cx="364" cy="359" r="17" />
          <path d="M696 359h8v36h-8z" />
          <circle cx="700" cy="346" r="20" />
        </g>
        <g className={styles.vehicle} aria-hidden="true">
          <path d="M300 351h109v48H300z" />
          <path d="M409 366h35l24 26v7h-59z" />
          <path className={styles.vehicleWindow} d="M417 372h22l14 16h-36z" />
          <circle className={styles.wheel} cx="327" cy="400" r="13" />
          <circle className={styles.wheel} cx="429" cy="400" r="13" />
          <circle className={styles.wheelHub} cx="327" cy="400" r="5" />
          <circle className={styles.wheelHub} cx="429" cy="400" r="5" />
          <path className={styles.vehicleMark} d="M348 365h16v16h-16zm8-4v24" />
        </g>
      </svg>
      <span className={styles.sceneSparkle} aria-hidden="true">
        +
      </span>
    </div>
  );
}
