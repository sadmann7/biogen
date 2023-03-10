// external imports
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer aria-label="footer">
      <div className="container mx-auto flex max-w-screen-lg items-center justify-between gap-4 border-t-2 border-t-gray-500 px-4 py-5">
        <h1 className="text-white ">Made with OpenAI</h1>
        <a
          aria-label="navigate to github"
          href="https://github.com/sadmann7"
          target="_blank"
          rel="noreferrer"
          className="text-white transition-opacity hover:text-opacity-80 active:text-opacity-90"
        >
          <FaGithub
            className="text-gray-400 transition-colors hover:text-gray-200 active:text-gray-400"
            size={22}
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
