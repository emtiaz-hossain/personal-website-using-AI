import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { doc, getDoc, updateDoc, setDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  ExternalLink, 
  Code2, 
  Menu, 
  X, 
  ChevronRight,
  Globe,
  Sun,
  Moon,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Save,
  LogIn,
  MapPin,
  ArrowRight,
  Instagram,
  Facebook,
  SquareTerminal,
  Palette,
  Timer,
  Sparkles
} from 'lucide-react';

// Types
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  github: string;
  live: string;
}

interface Skill {
  category: string;
  items: string[];
  icon: any;
}

interface Education {
  id: number;
  institution: string;
  degree: string;
  period: string;
  gpa: string;
}

interface Hobby {
  id: number;
  name: string;
  description: string;
  image: string;
  icon: any;
}

// Data
const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    title: "Personal Portfolio",
    description: "A comprehensive digital showcase of my development journey, built with modern frontend tools and a focus on UX.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    tags: ["React", "Motion", "Tailwind"],
    github: "https://github.com/emtiaz-hossain",
    live: "https://emtiazportfolio.netlify.app/"
  },
  {
    id: 2,
    title: "Fylo Landing Page",
    description: "Responsive component-based landing page with secure file access features and complex layout structures.",
    image: "https://images.unsplash.com/photo-1481487196290-c152efe083f5?auto=format&fit=crop&q=80&w=800",
    tags: ["CSS Grid", "Flexbox", "Responsive"],
    github: "https://github.com/emtiaz-hossain",
    live: "https://fylo-landing-page-createdbyemtiaz.netlify.app/"
  },
  {
    id: 3,
    title: "Testimonial Grid Section",
    description: "A clean grid section showcasing user feedback with a focus on social proof and mobile-first responsive architecture.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
    tags: ["Grid", "UI Design", "Clean"],
    github: "https://github.com/emtiaz-hossain",
    live: "https://emtiaz-testimonial-grid-section.netlify.app/"
  },
  {
    id: 4,
    title: "Frontend Mentor Project",
    description: "A functional challenge implementation demonstrating advanced design patterns and mobile-first strategy.",
    image: "/src/assets/images/regenerated_image_1779228782204.png",
    tags: ["Frontend", "Layout", "Interactions"],
    github: "https://github.com/emtiaz-hossain",
    live: "https://frontend-mentor-1st-project.netlify.app/"
  },
  {
    id: 5,
    title: "Four Card Feature Section",
    description: "Visually balanced feature grid demonstrating clean card architecture and brand styling consistency.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    tags: ["Layout", "Bento Grid", "Typography"],
    github: "https://github.com/emtiaz-hossain",
    live: "https://emtiaz-four-card.netlify.app/"
  }
];

const SKILLS_DATA: Skill[] = [
  {
    category: "Languages",
    icon: ({ className }: any) => <Code2 className={className} />,
    items: ["HTML5", "CSS3", "JavaScript (ES6+)"]
  },
  {
    category: "Frontend & UI",
    icon: ({ className }: any) => <Palette className={className} />,
    items: ["Responsive Design", "DOM Manipulation", "Figma", "Pixso"]
  },
  {
    category: "Tools",
    icon: ({ className }: any) => <SquareTerminal className={className} />,
    items: ["Git", "GitHub", "VS Code", "Basic SEO"]
  }
];

const EDUCATION_DATA: Education[] = [
  {
    id: 1,
    institution: "Duaripara Government College",
    degree: "Higher Secondary Certificate (HSC)",
    period: "2023 - 2024",
    gpa: "4.42"
  },
  {
    id: 2,
    institution: "Gonobhabon Govt. High School",
    degree: "Secondary School Certificate (SSC)",
    period: "2021 - 2022",
    gpa: "4.44"
  }
];

const HOBBIES_DATA: Hobby[] = [
  {
    id: 1,
    name: "Speedcubing",
    description: "Focusing on rapid problem-solving and algorithmic thinking with a speed of sub-20 seconds.",
    image: "/src/assets/images/speedcube_sharp_1779221164351.png",
    icon: Timer
  },
  {
    id: 2,
    name: "Card Magic",
    description: "Exploring creativity and psychology through sleight of hand and mathematical card tricks.",
    image: "/src/assets/images/hobby_card_magic_1779219460290.png",
    icon: Sparkles
  }
];

// Animation Variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  
  const projects = PROJECTS_DATA;
  const skills = SKILLS_DATA;
  const hobbies = HOBBIES_DATA;
  const education = EDUCATION_DATA;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yRange = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'skills', 'projects', 'education', 'hobbies', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Visitor Counter Logic
  useEffect(() => {
    const statsDocRef = doc(db, 'stats', 'visitors');
    
    const incrementVisitorCount = async () => {
      const visited = sessionStorage.getItem('hasVisited');
      if (!visited) {
        try {
          const docSnap = await getDoc(statsDocRef);
          if (docSnap.exists()) {
            await updateDoc(statsDocRef, {
              visitorCount: increment(1)
            });
          } else {
            await setDoc(statsDocRef, {
              visitorCount: 1
            });
          }
          sessionStorage.setItem('hasVisited', 'true');
        } catch (error) {
          console.error("Error updating visitor count:", error);
        }
      }
    };

    incrementVisitorCount();

    const unsubscribe = onSnapshot(statsDocRef, (doc) => {
      if (doc.exists()) {
        setVisitorCount(doc.data().visitorCount);
      }
    });

    return () => unsubscribe();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Create a FormData object to ensure compatibility with all Formspree submission methods
      const formData = new FormData();
      formData.append('name', formState.name);
      formData.append('email', formState.email);
      formData.append('message', formState.message);
      formData.append('_subject', `New Portfolio Inquiry from ${formState.name}`);
      formData.append('_replyto', formState.email);

      const response = await fetch("https://formspree.io/emtiaz.shimanta@gmail.com", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormState({ name: '', email: '', message: '' });
      } else {
        if (data.error && data.error.includes("isn't set up yet")) {
          setSubmitStatus('error');
          setSubmitErrorMessage("Formspree activation required! Please check emtiaz.shimanta@gmail.com and click the 'Activate' link in the email from Formspree.");
        } else {
          setSubmitStatus('error');
          setSubmitErrorMessage(data.error || "Oops! Something went wrong. Please try again or email me directly.");
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitErrorMessage("Network error! Please check your connection or email me directly.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-violet-500/30 selection:text-violet-400 ${
      theme === 'dark' ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        theme === 'dark' ? 'bg-[#0b0f19]/80 border-white/5' : 'bg-white/80 border-gray-200 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => scrollTo('home')}
          >
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Portfolio
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['About', 'Skills', 'Projects', 'Education', 'Hobbies', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className={`relative transition-colors hover:text-violet-500 ${
                  activeSection === item.toLowerCase() 
                    ? 'text-violet-500' 
                    : (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                }`}
              >
                {item}
                {activeSection === item.toLowerCase() && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-violet-500 rounded-full"
                  />
                )}
              </button>
            ))}
            
            {visitorCount !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-violet-400' : 'bg-violet-50 border-violet-100 text-violet-600'
              }`}>
                <Globe size={14} className="animate-pulse" />
                {visitorCount.toLocaleString()} Visitors
              </div>
            )}
            
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-yellow-400' 
                  : 'border-gray-200 bg-gray-100 hover:bg-gray-200 text-violet-600'
              }`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <button onClick={toggleTheme} className="text-violet-500">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-b overflow-hidden ${
                theme === 'dark' ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-gray-100'
              }`}
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {['About', 'Skills', 'Projects', 'Education', 'Hobbies', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollTo(item.toLowerCase())}
                    className={`text-2xl font-bold transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-violet-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section id="home" ref={heroRef} style={{ height: '686.172px' }} className="relative flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            style={{ y: yRange, opacity: opacityRange }}
            className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-1000 ${
              theme === 'dark' ? 'bg-violet-600/10 opacity-100' : 'bg-violet-600/5 opacity-50'
            }`} 
          />
          <motion.div 
            style={{ y: useTransform(yRange, (v) => -v), opacity: opacityRange }}
            className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] transition-opacity duration-1000 ${
              theme === 'dark' ? 'bg-cyan-600/10 opacity-100' : 'bg-cyan-600/5 opacity-50'
            }`} 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-500 text-sm font-bold mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available for Projects
              </motion.div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8 leading-[0.9]">
                Md. Emtiaz <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500">
                  Hossain Shimanta
                </span>
              </h1>
              <p className={`max-w-xl text-xl mb-12 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Frontend Web Developer transforming complex ideas into pixel-perfect and highly interactive web experiences.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollTo('projects')} 
                  className="w-full sm:w-auto px-10 py-5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-violet-500/20"
                >
                  View Projects <ChevronRight size={20} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollTo('contact')} 
                  className={`w-full sm:w-auto px-10 py-5 border rounded-2xl font-bold ${
                    theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-700 shadow-sm shadow-gray-200'
                  }`}
                >
                  Contact Me
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }} 
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-cyan-600 rounded-[80px] rotate-12 opacity-20 blur-3xl" />
                <div className={`relative rounded-[60px] overflow-hidden border-2 p-1 ${theme === 'dark' ? 'border-white/10 bg-[#161b27]' : 'border-gray-100 bg-white shadow-2xl'}`}>
                  <img 
                    src="/src/assets/images/regenerated_image_1779142485594.png" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';
                    }}
                    referrerPolicy="no-referrer"
                    alt="Md. Emtiaz" 
                    className="w-full h-full object-cover rounded-[58px]" 
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 opacity-50"
        >
          <div className="w-[1px] h-20 bg-gradient-to-b from-gray-400 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* About */}
      <section id="about" className={`py-24 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-0.5 w-12 bg-violet-600" />
                <span className="text-violet-500 font-bold tracking-widest uppercase text-sm">Background</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Passionate about Web Technologies</h2>
              <p className={`text-lg leading-relaxed mb-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                I'm Emtiaz, based in Dhaka. I specialize in building responsive architectures using HTML, CSS, and modern JavaScript. I enjoy solving complex layout challenges and optimizing web performance.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h4 className="text-violet-500 font-bold text-3xl mb-1">60+</h4>
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Typing WPM</p>
                </div>
                <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h4 className="text-cyan-500 font-bold text-3xl mb-1">A+</h4>
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Result Score</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="grid gap-6"
            >
              {skills.slice(0, 3).map((skill, index) => (
                <div key={index} className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#161b27] border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-600"><skill.icon size={22} /></div>
                    <h3 className="font-bold text-lg">{skill.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map(item => (
                      <span key={item} className={`px-4 py-2 rounded-xl text-xs font-bold ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills Expansion */}
      <section id="skills" className={`py-32 ${theme === 'dark' ? 'bg-white/[0.01]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-violet-500 font-bold tracking-widest uppercase text-sm mb-4 inline-block">Capabilities</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold">Tech Stack & Expertise</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className={`p-10 rounded-[40px] border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-[#161b27] border-white/5 shadow-2xl shadow-black/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/20'}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-600 mb-8">
                  <skill.icon size={28} />
                </div>
                <h3 className="font-bold text-2xl mb-6">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map(item => (
                    <span key={item} className={`px-5 py-2.5 rounded-2xl text-sm font-bold ${theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{item}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 text-center md:text-left">
            <div className="max-w-2xl">
              <span className="text-violet-500 font-bold tracking-widest uppercase text-sm mb-4 inline-block">Portfolio</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold">Latest Works</h2>
            </div>
            <motion.a 
              whileHover={{ x: 5 }}
              href="https://github.com/emtiaz-hossain" target="_blank" 
              className={`flex items-center gap-2 font-bold hover:text-violet-500 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Github Repository <ArrowRight size={18} />
            </motion.a>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.map((project) => (
              <motion.div 
                key={project.id} 
                variants={fadeIn}
                className={`group rounded-[50px] border overflow-hidden transition-all ${theme === 'dark' ? 'bg-[#161b27] border-white/5 shadow-2xl shadow-black/80' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'}`}
              >
                <div className="aspect-[1.5] overflow-hidden m-4 rounded-[36px] relative">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-violet-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <motion.a 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={project.live} target="_blank" className="p-4 rounded-3xl bg-white text-violet-600 shadow-xl"
                    >
                      <ExternalLink size={24} />
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={project.github} target="_blank" className="p-4 rounded-3xl bg-black text-white shadow-xl"
                    >
                      <Github size={24} />
                    </motion.a>
                  </div>
                </div>
                <div className="px-10 pb-10 pt-4">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-violet-500 transition-colors">{project.title}</h3>
                  <p className={`text-base mb-8 line-clamp-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-bold uppercase tracking-wider text-violet-500 px-3 py-1.5 bg-violet-500/10 rounded-xl">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className={`py-24 ${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-display font-bold">Education</h2></div>
          <div className="grid md:grid-cols-2 gap-8">
            {education.map((edu) => (
              <div key={edu.id} className={`p-10 rounded-[40px] border ${theme === 'dark' ? 'bg-[#161b27] border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
                <span className="text-violet-500 font-bold text-sm mb-4 block">{edu.period}</span>
                <h3 className="text-2xl font-bold mb-2">{edu.degree}</h3>
                <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{edu.institution}</p>
                <div className={`p-4 rounded-2xl inline-flex gap-4 items-center ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <div className="text-violet-600 font-bold text-xl">{edu.gpa}</div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">Grade Point Average</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hobbies */}
      <section id="hobbies" className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="grid md:grid-cols-2 gap-8">
              {hobbies.map((hobby) => (
                <motion.div 
                  key={hobby.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  className="group rounded-[50px] overflow-hidden border border-transparent shadow-2xl relative aspect-[4/5]"
                >
                  <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white mb-6 font-bold shadow-xl">
                      <hobby.icon size={28} />
                    </div>
                    <h4 className="text-white text-3xl font-bold mb-2">{hobby.name}</h4>
                    <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">{hobby.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-center lg:text-left"
            >
              <span className="text-violet-500 font-bold tracking-widest uppercase text-sm mb-4 inline-block">Off-Duty</span>
              <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">Personal Passions</h2>
              <p className={`text-xl leading-relaxed mb-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Beyond lines of code, I find balance in mental gymnastics. Speedcubing sharpens my reaction time, while card magic allows me to craft wonder through presentation.
              </p>
              <div className="flex justify-center lg:justify-start gap-12">
                 <div className="text-center">
                    <p className="text-3xl font-bold text-violet-500">Sub-20</p>
                    <p className="text-sm font-bold uppercase text-gray-500">Avg Solve</p>
                 </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-500">100+</p>
                    <p className="text-sm font-bold uppercase text-gray-500">Tricks Mastered</p>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`rounded-[80px] p-8 md:p-16 lg:p-24 transition-all ${theme === 'dark' ? 'bg-[#161b27] border border-white/5 shadow-3xl' : 'bg-white border shadow-2xl shadow-gray-200/50'}`}
          >
            <div className="grid lg:grid-cols-2 gap-20">
              <div className="text-center lg:text-left">
                <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">Let's <br />Connect</h2>
                <p className={`text-lg mb-12 max-w-sm mx-auto lg:mx-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Have a vision for a project? I'm currently accepting new opportunities and collaborations.
                </p>
                <div className="space-y-6 mb-12 hidden md:block">
                   <div className="flex items-center gap-4 justify-center lg:justify-start">
                     <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center text-violet-500"><Mail size={20} /></div>
                     <span className="font-bold text-lg">emtiaz.shimanta@gmail.com</span>
                   </div>
                   <div className="flex items-center gap-4 justify-center lg:justify-start">
                     <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 flex items-center justify-center text-cyan-500"><MapPin size={20} /></div>
                     <span className="font-bold text-lg">Dhaka, Bangladesh</span>
                   </div>
                </div>
                <div className="flex gap-4 justify-center lg:justify-start">
                  {[
                    { icon: Github, href: "https://github.com/emtiaz-hossain" },
                    { icon: Linkedin, href: "https://www.linkedin.com/in/undefinedshimanta/" },
                    { icon: Instagram, href: "https://www.instagram.com/undefined.shimanta/" },
                    { icon: Facebook, href: "https://facebook.com/emtiaz.shimanta" }
                  ].map((s, i) => (
                    <motion.a 
                      key={i} 
                      whileHover={{ y: -5, scale: 1.1 }}
                      href={s.href} 
                      target="_blank"
                      className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl ${theme === 'dark' ? 'bg-white/5 hover:bg-violet-600' : 'bg-gray-100 hover:bg-violet-600 hover:text-white'} transition-all`}
                    >
                      <s.icon size={26} />
                    </motion.a>
                  ))}
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6" method="POST">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-gray-500 px-1 uppercase tracking-widest">Full Name</label>
                    <input name="name" required placeholder="Emtiaz Shimanta" value={formState.name} onChange={e => setFormState(p => ({...p, name: e.target.value}))} className={`w-full p-5 rounded-3xl border outline-none focus:ring-2 focus:ring-violet-500 transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`} />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-bold text-gray-500 px-1 uppercase tracking-widest">Email Address</label>
                    <input name="email" required type="email" placeholder="example@gmail.com" value={formState.email} onChange={e => setFormState(p => ({...p, email: e.target.value}))} className={`w-full p-5 rounded-3xl border outline-none focus:ring-2 focus:ring-violet-500 transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`} />
                  </div>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-bold text-gray-500 px-1 uppercase tracking-widest">Message</label>
                  <textarea name="message" required rows={6} placeholder="How can I help you?" value={formState.message} onChange={e => setFormState(p => ({...p, message: e.target.value}))} className={`w-full p-5 rounded-3xl border outline-none focus:ring-2 focus:ring-violet-500 transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`} />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting} 
                  className="w-full py-6 bg-violet-600 text-white font-bold rounded-[32px] hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-xl shadow-violet-500/20"
                >
                  {isSubmitting ? 'Transmitting...' : (submitStatus === 'success' ? 'Sent Successfully!' : 'Send Message')} 
                  <MessageSquare size={22} />
                </motion.button>
                {submitStatus === 'success' && (
                  <p className="text-emerald-500 font-bold text-center animate-bounce">
                    Thank you! Your message has been sent.
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-500 font-bold text-center">
                    {submitErrorMessage}
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-32 ${theme === 'dark' ? 'bg-[#060910] border-t border-white/5' : 'bg-white border-t border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg">
                  <Code2 size={24} />
                </div>
                <span className="text-2xl font-bold tracking-tight">Portfolio</span>
              </div>
              <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Crafting digital experiences with a focus on performance, accessibility, and modern aesthetics.
              </p>
              <div className="flex gap-4">
                  {[
                    { icon: Github, href: "https://github.com/emtiaz-hossain" },
                    { icon: Linkedin, href: "https://www.linkedin.com/in/undefinedshimanta/" },
                    { icon: Instagram, href: "https://www.instagram.com/undefined.shimanta/" },
                    { icon: Facebook, href: "https://facebook.com/emtiaz.shimanta" }
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all">
                      <s.icon size={18} />
                    </a>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 text-violet-500">Navigation</h4>
              <ul className="space-y-4 font-bold">
                {['About', 'Skills', 'Projects', 'Education'].map(item => (
                  <li key={item}>
                    <button onClick={() => scrollTo(item.toLowerCase())} className={`hover:text-violet-500 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 text-cyan-500">Contact</h4>
              <ul className="space-y-4 font-bold">
                <li className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Dhaka, Bangladesh</li>
                <li><a href="mailto:emtiaz.shimanta@gmail.com" className="text-violet-500 hover:underline">Email Me</a></li>
                <li className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>+880 (Unavailable)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-10 text-emerald-500">Quick Links</h4>
              <ul className="space-y-4 font-bold">
                <li><a href="https://github.com/emtiaz-hossain" target="_blank" className={`hover:text-violet-500 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Source Code</a></li>
                <li><a href="#" className={`hover:text-violet-500 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Resume PDF</a></li>
              </ul>
            </div>
          </div>

          <div className={`pt-12 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              © {new Date().getFullYear()} Md. Emtiaz Hossain Shimanta. All Rights Reserved.
            </p>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" /> Production</span>
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500" /> React 18</span>
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500 shadow-sm shadow-violet-500" /> Framer Motion</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
