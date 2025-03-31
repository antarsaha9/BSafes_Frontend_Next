// Breadcrumb.js

import Link from "next/link";
import { useRouter } from "next/router";

const Breadcrumb = () => {
  const router = useRouter();
  const currentPath = router.asPath.replace(/\/$/, ""); // Remove trailing slash
  const currentRoute = currentPath.split("/").filter(Boolean);

  // Check if there are segments in the currentRoute
  const hasRoute = currentRoute.length > 0;

  return (
    <div className="breadcrumb-section">
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link legacyBehavior href="/">
                <a>Home</a>
              </Link>
            </li>
            {hasRoute &&
              currentRoute.map((route, index) => (
                <li
                  key={index}
                  className={`breadcrumb-item ${
                    index === currentRoute.length - 1 ? "active" : ""
                  }`}
                >
                  {index === currentRoute.length - 1 ? (
                    <span>{route}</span>
                  ) : (
                    <Link
                      legacyBehavior
                      href={`/${currentRoute.slice(0, index + 1).join("/")}`}
                    >
                      <a>{route}</a>
                    </Link>
                  )}
                </li>
              ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
