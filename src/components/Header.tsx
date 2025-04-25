import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSeedling } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
    return (
      <header className="fixed top-0 left-0 w-full py-4 bg-transparent text-center border-b-2 border-green-500 z-10">
        <div className="flex justify-center items-center space-x-3">
          <h1 className="text-4xl text-green-500 pixel-font">Sprout-Found</h1>
          <FontAwesomeIcon icon={faSeedling} className="text-green-500 text-4xl" />
        </div>
      </header>
    );
  }
  
