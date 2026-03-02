<template>
  <!-- Invisible SVG defining hand-drawn filter — mount once at page level -->
  <svg width="0" height="0" style="position: absolute; overflow: hidden;">
    <defs>
      <filter id="hand-drawn" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="4" seed="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="hand-drawn-subtle" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="5" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
</template>
