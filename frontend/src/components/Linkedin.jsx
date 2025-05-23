import { Github, Linkedin } from "lucide-react";
import Link from "next/link";

const LinkedIn = () => {

    return (
        <>
        <Link  href="https://www.linkedin.com/in/sohail-khan-8b0a1b1b4" className="fixed top-0  left-0 h-20 w-20 bg-blue-500 hover:bg-sky-500 duration-300 z-50  corner">
            <div className="relative flex items-center justify-center h-full"></div>
        <div className="absolute top-3 left-3">
        <div
           
            className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors group"
            aria-label="LinkedIn"
        >
            <Linkedin className="w-11 h-11 text-white" />
        </div>
        </div>
        </Link>
         <Link  href="https://github.com/ProgrammerSohail" className="fixed top-0  right-0 h-20 w-20 bg-gray-950 hover:bg-gray-900 duration-300 z-50  corner-right">
            <div className="relative flex items-center justify-center h-full"></div>
        <div className="absolute top-3 right-3">
        <div
           
            className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors group"
            aria-label="LinkedIn"
        >
            <Github className="w-11 h-11 text-white" />
        </div>
        </div>
        </Link>
     </>
    );
}
export default LinkedIn;