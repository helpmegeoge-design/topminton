"use client";

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
  filled?: boolean;
}

// Home Icon - Custom minimalist design
export function HomeIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Court/Map Pin Icon
export function CourtIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
          fill="currentColor"
        />
      ) : (
        <>
          <path
            d="M12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="9"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

// Shuttlecock/Party Icon
export function ShuttlecockIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M12 2C10.8954 2 10 2.89543 10 4V6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6V4C14 2.89543 13.1046 2 12 2ZM8 9L4 13V16L8 12V9ZM16 9V12L20 16V13L16 9ZM12 10C10.3431 10 9 11.3431 9 13V17L12 22L15 17V13C15 11.3431 13.6569 10 12 10Z"
          fill="currentColor"
        />
      ) : (
        <>
          <ellipse
            cx="12"
            cy="5"
            rx="2"
            ry="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 8V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8 10L4 14V17L8 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 10L20 14V17L16 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13V17L12 22L9 17V13Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

// Trophy Icon
export function TrophyIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M6 4H18V7C18 10.3137 15.3137 13 12 13C8.68629 13 6 10.3137 6 7V4ZM4 5V8C4 9.10457 4.89543 10 6 10V7C6 6.44772 5.55228 6 5 6H4V5ZM20 5V6H19C18.4477 6 18 6.44772 18 7V10C19.1046 10 20 9.10457 20 8V5ZM12 15C13.1046 15 14 15.8954 14 17V19H10V17C10 15.8954 10.8954 15 12 15ZM8 21H16V19H8V21Z"
          fill="currentColor"
        />
      ) : (
        <>
          <path
            d="M6 4H18V7C18 10.3137 15.3137 13 12 13C8.68629 13 6 10.3137 6 7V4Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6 7C6 7 4 7 4 8.5C4 10 6 10 6 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M18 7C18 7 20 7 20 8.5C20 10 18 10 18 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 13V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M8 21H16V19C16 17.8954 15.1046 17 14 17H10C8.89543 17 8 17.8954 8 19V21Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

// Blog/Community Icon
export function BlogIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M4 4H20C20.5523 4 21 4.44772 21 5V15C21 15.5523 20.5523 16 20 16H13L8 20V16H4C3.44772 16 3 15.5523 3 15V5C3 4.44772 3.44772 4 4 4ZM7 8H17V9.5H7V8ZM7 11H14V12.5H7V11Z"
          fill="currentColor"
        />
      ) : (
        <>
          <rect
            x="3"
            y="4"
            width="18"
            height="12"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 16V20L13 16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 8H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 11H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// More/Menu Icon
export function MoreIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <>
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </>
      ) : (
        <>
          <circle
            cx="5"
            cy="12"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="12"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="19"
            cy="12"
            r="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

// Profile/User Icon
export function ProfileIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <>
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path
            d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21H4V20Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <circle
            cx="12"
            cy="8"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M5 20C5 17.2386 7.23858 15 10 15H14C16.7614 15 19 17.2386 19 20V21H5V20Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

// Plus Icon for FAB
export function PlusIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Bell/Notification Icon
export function BellIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M12 2C8.68629 2 6 4.68629 6 8V13L4 15V16H20V15L18 13V8C18 4.68629 15.3137 2 12 2ZM12 22C10.3431 22 9 20.6569 9 19H15C15 20.6569 13.6569 22 12 22Z"
          fill="currentColor"
        />
      ) : (
        <>
          <path
            d="M6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V13L20 15V16H4V15L6 13V8Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M9 19C9 20.6569 10.3431 22 12 22C13.6569 22 15 20.6569 15 19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// Search Icon
export function SearchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 16L20 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Heart Icon
export function HeartIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M12 19.5L10.55 18.18C5.4 13.51 2 10.43 2 6.5C2 3.42 4.42 1 7.5 1C9.24 1 10.91 1.81 12 3.09C13.09 1.81 14.76 1 16.5 1C19.58 1 22 3.42 22 6.5C22 10.43 18.6 13.51 13.45 18.19L12 19.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Star Icon
export function StarIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Dice/Random Icon
export function DiceIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            fill="currentColor"
          />
          <circle cx="8" cy="8" r="1.5" fill="white" />
          <circle cx="16" cy="8" r="1.5" fill="white" />
          <circle cx="12" cy="12" r="1.5" fill="white" />
          <circle cx="8" cy="16" r="1.5" fill="white" />
          <circle cx="16" cy="16" r="1.5" fill="white" />
        </>
      ) : (
        <>
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

// Scoreboard Icon
export function ScoreboardIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <>
          <rect x="2" y="5" width="9" height="14" rx="2" fill="currentColor" />
          <rect x="13" y="5" width="9" height="14" rx="2" fill="currentColor" />
          <path d="M6.5 10V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M17.5 10V14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect
            x="2"
            y="5"
            width="9"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="13"
            y="5"
            width="9"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.5 10V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M17.5 10V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// Calendar Icon
export function CalendarIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M8 2V4H16V2H18V4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4H6V2H8ZM5 10V20H19V10H5Z"
          fill="currentColor"
        />
      ) : (
        <>
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 2V6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 2V6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// Phone Icon
export function PhoneIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Share Icon
export function ShareIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.34066C7.54305 8.81906 6.80891 8.5 6 8.5C4.34315 8.5 3 9.84315 3 11.5C3 13.1569 4.34315 14.5 6 14.5C6.80891 14.5 7.54305 14.1809 8.08261 13.6593L15.0227 17.6294C15.0077 17.7508 15 17.8745 15 18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C17.1911 15 16.457 15.3191 15.9174 15.8407L8.97733 11.8706C8.99229 11.7492 9 11.6255 9 11.5C9 11.3745 8.99229 11.2508 8.97733 11.1294L15.9174 7.15934C16.457 7.68094 17.1911 8 18 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Arrow Left Icon
export function ArrowLeftIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M15 19L8 12L15 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Check Icon
export function CheckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M5 13L9 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Clock Icon
export function ClockIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <>
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <path
            d="M12 6V12L16 14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 6V12L16 14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

// Users Icon
export function UsersIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <>
          <circle cx="9" cy="7" r="3" fill="currentColor" />
          <path
            d="M3 18C3 15.2386 5.23858 13 8 13H10C12.7614 13 15 15.2386 15 18V19H3V18Z"
            fill="currentColor"
          />
          <circle cx="17" cy="8" r="2.5" fill="currentColor" />
          <path
            d="M15 19V18C15 16.3644 14.4123 14.8691 13.4445 13.699C14.1389 13.2533 14.9636 13 15.8462 13H17.1538C19.277 13 21 14.7909 21 17V19H15Z"
            fill="currentColor"
          />
        </>
      ) : (
        <>
          <circle
            cx="9"
            cy="7"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M4 18C4 15.7909 5.79086 14 8 14H10C12.2091 14 14 15.7909 14 18V19H4V18Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="17"
            cy="8"
            r="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M15 19V18C15 16.3644 14.4123 14.8691 13.4445 13.699C14.1389 13.2533 14.9636 13 15.8462 13H17.1538C19.277 13 21 14.7909 21 17V19H15Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

// Edit/Pencil Icon
export function EditIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M16.475 5.40804L18.592 7.52504M17.836 3.54304C18.5755 4.28254 18.5755 5.48604 17.836 6.22554L6.109 17.9525L2 19L3.048 14.891L14.775 3.16404C15.5145 2.42454 16.7175 2.42454 17.457 3.16404L17.836 3.54304Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Camera Icon
export function CameraIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path
          d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
          fill="currentColor"
        />
      ) : (
        <>
          <path
            d="M9 3L7.17 5H4C2.9 5 2 5.9 2 7V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V7C22 5.9 21.1 5 20 5H16.83L15 3H9Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="12"
            cy="13"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      )}
    </svg>
  );
}

// Settings Icon
export function SettingsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23H11.92C10.8154 23 9.92 22.1046 9.92 21V20.91C9.90343 20.2327 9.47883 19.6339 8.84 19.4C8.22289 19.1277 7.50217 19.2583 7.02 19.73L6.96 19.79C6.58493 20.1656 6.07582 20.3766 5.545 20.3766C5.01418 20.3766 4.50507 20.1656 4.13 19.79C3.75438 19.4149 3.54345 18.9058 3.54345 18.375C3.54345 17.8442 3.75438 17.3351 4.13 16.96L4.19 16.9C4.66166 16.4178 4.79231 15.6971 4.52 15.08C4.26086 14.4755 3.66757 14.0826 3.01 14.08H2.84C1.73543 14.08 0.84 13.1846 0.84 12.08V11.92C0.84 10.8154 1.73543 9.92 2.84 9.92H2.93C3.60729 9.90343 4.20612 9.47883 4.44 8.84C4.71231 8.22289 4.58166 7.50217 4.11 7.02L4.05 6.96C3.67438 6.58493 3.46345 6.07582 3.46345 5.545C3.46345 5.01418 3.67438 4.50507 4.05 4.13C4.42507 3.75438 4.93418 3.54345 5.465 3.54345C5.99582 3.54345 6.50493 3.75438 6.88 4.13L6.94 4.19C7.42217 4.66166 8.14289 4.79231 8.76 4.52H8.84C9.44448 4.26086 9.83739 3.66757 9.84 3.01V2.84C9.84 1.73543 10.7354 0.84 11.84 0.84H12C13.1046 0.84 14 1.73543 14 2.84V2.93C14.0026 3.58757 14.3955 4.18086 15 4.44C15.6171 4.71231 16.3378 4.58166 16.82 4.11L16.88 4.05C17.2551 3.67438 17.7642 3.46345 18.295 3.46345C18.8258 3.46345 19.3349 3.67438 19.71 4.05C20.0856 4.42507 20.2966 4.93418 20.2966 5.465C20.2966 5.99582 20.0856 6.50493 19.71 6.88L19.65 6.94C19.1783 7.42217 19.0477 8.14289 19.32 8.76V8.84C19.5791 9.44448 20.1724 9.83739 20.83 9.84H21C22.1046 9.84 23 10.7354 23 11.84V12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Filter Icon
export function FilterIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M4 6H20M7 12H17M10 18H14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// QR Code Icon
export function QRCodeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="5" y="5" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="16" y="5" width="3" height="3" rx="0.5" fill="currentColor" />
      <rect x="5" y="16" width="3" height="3" rx="0.5" fill="currentColor" />
      <path
        d="M14 14H16V16H14V14Z"
        fill="currentColor"
      />
      <path
        d="M18 14H21V17H18V14Z"
        fill="currentColor"
      />
      <path
        d="M14 18H17V21H14V18Z"
        fill="currentColor"
      />
      <path
        d="M18 18H21V21H18V18Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Navigation Icon
export function NavigateIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M3 11L22 2L13 21L11 13L3 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Eye Icon
export function EyeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Comment Icon
export function CommentIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M21 11.5C21 16.1944 16.9706 20 12 20C10.4607 20 9.01172 19.6257 7.74467 18.9665L3 20L4.04333 15.7541C3.38562 14.5018 3 13.0547 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Image Icon
export function ImageIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path
        d="M21 15L16 10L5 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Trash Icon
export function TrashIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Copy Icon
export function CopyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Info Icon
export function InfoIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 16V12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

// Post Icon
export function PostIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 21V9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Ranking Icon
export function RankingIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <rect x="3" y="14" width="5" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="8" width="5" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Document Icon
export function DocumentIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 17H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Shield Icon
export function ShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M12 2L3 6V12C3 17.5228 7.47715 22 13 22C16.866 22 20.1651 19.7377 21.6044 16.4314" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Crown Icon
export function CrownIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M2 17L4.5 7L9 11L12 4L15 11L19.5 7L22 17H2Z" fill="currentColor" />
      <path d="M2 20H22V17H2V20Z" fill="currentColor" />
    </svg>
  );
}

// Maximize Icon
export function MaximizeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 8V5C21 3.89543 20.1046 3 19 3H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 21H19C20.1046 21 21 20.1046 21 19V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Send Icon
export function SendIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Broadcast Icon
export function BroadcastIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M8.46 15.54C7.56 14.64 7 13.39 7 12C7 10.61 7.56 9.36 8.46 8.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.54 8.46C16.44 9.36 17 10.61 17 12C17 13.39 16.44 14.64 15.54 15.54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.64 18.36C3.98 16.7 3 14.47 3 12C3 9.53 3.98 7.3 5.64 5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18.36 5.64C20.02 7.3 21 9.53 21 12C21 14.47 20.02 16.7 18.36 18.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Monitor Icon
export function MonitorIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Gamepad Icon
export function GamepadIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M6 11H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <circle cx="17" cy="12" r="1" fill="currentColor" />
      <rect x="2" y="6" width="20" height="12" rx="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// Undo Icon
export function UndoIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M3 7V13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13C3 13 6.5 6 14 6C18.4183 6 22 9.58172 22 14C22 18.4183 18.4183 22 14 22C10.4317 22 7.425 19.6043 6.35 16.33" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Refresh Icon
export function RefreshIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M21 2V8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 22V16H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10C5.83 6.55 9.02 4 12.7 4C17.19 4 20.83 7.58 20.83 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 14C18.17 17.45 14.98 20 11.3 20C6.81 20 3.17 16.42 3.17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Lightbulb Icon
export function LightbulbIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Shuffle Icon
export function ShuffleIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M16 3H21V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 16V21H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 15L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Logout Icon
export function LogoutIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Bookmark Icon
export function BookmarkIcon({ className, size = 24, filled }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {filled ? (
        <path d="M5 3H19C19.5523 3 20 3.44772 20 4V21L12 17L4 21V4C4 3.44772 4.44772 3 5 3Z" fill="currentColor" />
      ) : (
        <path d="M5 3H19C19.5523 3 20 3.44772 20 4V21L12 17L4 21V4C4 3.44772 4.44772 3 5 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// ThumbsUp Icon
export function ThumbsUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.382 9.90629 21.1919 9.68751C21.0019 9.46873 20.7668 9.29393 20.5028 9.17522C20.2388 9.0565 19.9527 8.99672 19.664 9H14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Close Icon
export function CloseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Chevron Left Icon (named export alias)
export function ChevronLeftIconAlias({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Check Circle Icon
export function CheckCircleIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Money/Cash Icon (Banknote & Coin)
export function MoneyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      {/* Banknote */}
      <rect x="2" y="6" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 11V11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Coin overlapping */}
      <circle cx="17" cy="16" r="4" fill="currentColor" className="text-background" /> {/* Mask bg */}
      <circle cx="17" cy="16" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 14.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 15H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 17H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Coins Icon
export function CoinsIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 9C15 5.68629 12.3137 3 9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="15" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9L9 9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 15L15 15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Bag Icon
export function BagIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Consolidated Icons Export - All icons used in the app
// Receipt Icon
export function ReceiptIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-current", className)}
    >
      <path
        d="M4 2V22L8 20L12 22L16 20L20 22V2L16 4L12 2L8 4L4 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 14H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Icons = {
  // Navigation
  home: HomeIcon,
  chevronLeft: ArrowLeftIcon,
  chevronRight: function ChevronRightIcon({ className, size = 24 }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
        <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  },
  chevronDown: function ChevronDownIcon({ className, size = 24 }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  },
  chevronUp: function ChevronUpIcon({ className, size = 24 }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
        <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  },
  close: CloseIcon,
  more: MoreIcon,
  navigate: NavigateIcon,

  // Core features
  court: CourtIcon,
  mapPin: CourtIcon,
  shuttlecock: ShuttlecockIcon,
  party: ShuttlecockIcon,
  trophy: TrophyIcon,
  scoreboard: ScoreboardIcon,
  ranking: RankingIcon,

  // User & profile
  profile: ProfileIcon,
  users: UsersIcon,
  bell: BellIcon,
  settings: SettingsIcon,
  logout: LogoutIcon,

  // Actions
  plus: PlusIcon,
  minus: function MinusIcon({ className, size = 24 }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
        <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  },
  search: SearchIcon,
  filter: FilterIcon,
  edit: EditIcon,
  copy: CopyIcon,
  trash: TrashIcon,
  share: ShareIcon,
  send: SendIcon,
  refresh: RefreshIcon,
  shuffle: ShuffleIcon,
  undo: UndoIcon,
  maximize: MaximizeIcon,
  camera: CameraIcon,

  // Status & feedback
  check: CheckIcon,
  star: StarIcon,
  heart: HeartIcon,
  thumbsUp: ThumbsUpIcon,
  info: InfoIcon,
  eye: EyeIcon,
  clock: ClockIcon,
  calendar: CalendarIcon,

  // Content
  blog: BlogIcon,
  post: PostIcon,
  message: CommentIcon,
  image: ImageIcon,
  document: DocumentIcon,
  qrCode: QRCodeIcon,
  bookmark: BookmarkIcon,

  // Commerce
  coins: CoinsIcon,
  bag: BagIcon,
  phone: PhoneIcon,
  crown: CrownIcon,
  shield: ShieldIcon,
  receipt: ReceiptIcon,
  money: MoneyIcon,

  // Tools
  store: BagIcon, // Alias store to BagIcon or create new
  dice: DiceIcon,
  broadcast: BroadcastIcon,
  monitor: MonitorIcon,
  gamepad: GamepadIcon,
  lightbulb: LightbulbIcon,

  // Aliases for compatibility
  eyeOff: EyeIcon,
  download: RefreshIcon,
  gift: StarIcon,
  moreVertical: MoreIcon,
  moreHorizontal: MoreIcon,
  smile: HeartIcon,
  warning: InfoIcon,
  alertCircle: InfoIcon,
  loader: RefreshIcon,
  verified: CheckIcon,
  swords: TrophyIcon,
  play: PlayIcon,
};

// Additional named exports for compatibility
export function ChevronLeftIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
      <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={cn("text-current", className)}>
      <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={cn("text-current", className)}>
      <path d="M8 5V19L19 12L8 5Z" />
    </svg>
  );
}
