import type React from "react"

interface StudioLogoIconProps extends React.SVGProps<SVGSVGElement> {}

const StudioLogoIcon: React.FC<StudioLogoIconProps> = (props) => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Flowing 'S' shape */}
      <path
        d="M 75,20 C 75,30 60,30 50,40 C 40,50 25,50 25,60 C 25,70 40,70 50,80 C 60,90 75,90 75,100"
        transform="translate(0 -10) scale(1)"
      />
      {/* Energy node/spark at the start of the flow */}
      <circle cx="75" cy="18" r="5" fill="currentColor" stroke="none" transform="translate(0 -10) scale(1)" />
      {/* Optional small accent dot at the end */}
      <circle
        cx="75"
        cy="92"
        r="3"
        fill="currentColor"
        stroke="none"
        transform="translate(0 -10) scale(1)"
        opacity="0.7"
      />
    </svg>
  )
}

export default StudioLogoIcon
