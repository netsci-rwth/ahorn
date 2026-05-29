import Image from "next/image";
import classnames from "classnames";

type PersonProps = {
  avatar?: string;
  name: string;
  role: string;
  className?: string;
};

export default function Person({ avatar, name, role, className }: PersonProps) {
  let avatar_element: React.ReactNode;
  if (avatar) {
    avatar_element = (
      <Image
        src={avatar}
        width={64}
        height={64}
        alt=""
        className="rounded-full shadow-md ring-4 ring-white"
        role="presentation"
      />
    );
  } else {
    const initials =
      name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0]?.toUpperCase())
        .join("") || "?";
    avatar_element = (
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-black-50 ring-4 ring-white dark:bg-black-75">
        <span className="font-medium text-white">{initials}</span>
      </span>
    );
  }

  return (
    <div className={classnames("flex items-center gap-x-5", className)}>
      {avatar_element}
      <div>
        <h3 className="text-base/7 font-semibold tracking-tight text-black-100 dark:text-white">
          {name}
        </h3>
        <p className="text-sm/6 font-semibold text-blue-100">{role}</p>
      </div>
    </div>
  );
}
