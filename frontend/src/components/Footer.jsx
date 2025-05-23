import React from 'react';
import { Heart, Code, Shield, Mail, AppWindow, Globe, GithubIcon, Linkedin } from 'lucide-react';

const Footer = () => {
    const socialLinks = [
        { icon: GithubIcon, href: "https://github.com/ProgrammerSohail", label: "GitHub" },
        { icon: Globe, href: "https://devsohail.netlify.app/", label: "Website" },
        { icon: Mail, href: "programmersohail.dev@gmail.com", label: "Email" },
        {icon: Linkedin, href: "https://www.linkedin.com/in/sohail-khan-8b0a1b1b4/", label: "LinkedIn" },
    ];

    return (
        <footer className="relative bg-gradient-to-br from-slate-900 to-purple-900 text-white overflow-hidden mt-8">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-12 h-12 bg-purple-500 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-12 h-12 bg-blue-500 rounded-full blur-xl animate-pulse delay-700"></div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Brand and Social */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Code className="w-5 h-5 text-purple-400 mr-2" />
                            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                YTVideoMax
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            {socialLinks.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors group"
                                    aria-label={label}
                                >
                                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Center Info */}
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center">
                            <Shield className="w-4 h-4 text-yellow-400 mr-1" />
                            <span>Educational Use Only</span>
                        </div>
                        <div className="flex items-center">
                            <AppWindow className="w-4 h-4 text-purple-400 mr-1" />
                            <span>v2.0</span>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>© 2024</span>
                        <Heart className="w-3 h-3 text-red-500" fill="currentColor" />
                        <span>Sohail Khan</span>
                    </div>
                </div>
            </div>
            
            {/* Bottom Gradient Line */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50"></div>
        </footer>
    );
};

export default Footer;