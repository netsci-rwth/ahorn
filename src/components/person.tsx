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
        className="rounded-full"
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
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-gray-500">
        <span className="font-medium text-white">{initials}</span>
      </span>
    );
  }

  return (
    <div className={classnames("flex items-center gap-x-6", className)}>
      {avatar_element}
      <div>
        <h3 className="text-base/7 font-semibold tracking-tight text-gray-900">
          {name}
        </h3>
        <p className="text-sm/6 font-semibold text-primary">{role}</p>
      </div>
    </div>
  );
}
