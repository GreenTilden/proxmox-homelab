import{d as t,c as l,a as o,n as r,b as i}from"./index-Cb9bHEfA.js";import{_ as c}from"./_plugin-vue_export-helper-DlAUqK2U.js";const s=t({__name:"ScanlineOverlay",props:{opacity:{default:.08},color:{default:"#ffffff"},lineHeight:{default:8},enable:{type:Boolean,default:!0}},setup(n){const e=n,a=l(()=>e.enable?{background:`repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${e.lineHeight-1}px,
      ${e.color} ${e.lineHeight-1}px,
      ${e.color} ${e.lineHeight}px
    )`,opacity:e.opacity.toString(),mixBlendMode:"overlay",animation:"scanline-flicker 3s ease-in-out infinite alternate"}:{display:"none"});return(p,d)=>(i(),o("div",{class:"scanline-overlay",style:r(a.value)},null,4))}}),m=c(s,[["__scopeId","data-v-235cdad6"]]);export{m as S};
