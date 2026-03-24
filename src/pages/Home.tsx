import { Link } from "react-router-dom";
import { PawPrint, Search, Map as MapIcon, PlusCircle, ShieldCheck, Heart, Users } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=2000"
            alt="Happy pets"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              Helping Lost Pets <br />
              <span className="text-orange-500">Find Their Way Home</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              PetFinder is a community-driven platform connecting lost pets with their families using smart matching and real-time alerts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/report/lost"
                className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/20"
              >
                I Lost a Pet
              </Link>
              <Link
                to="/report/found"
                className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                I Found a Pet
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-wider">How PetFinder Works</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Search className="w-10 h-10 text-orange-500" />,
                title: "Smart Search",
                desc: "Filter by breed, color, and location to find potential matches quickly."
              },
              {
                icon: <MapIcon className="w-10 h-10 text-orange-500" />,
                title: "Live Map",
                desc: "Visualize reports in your area with our interactive map integration."
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-orange-500" />,
                title: "Secure Platform",
                desc: "Verified user accounts and encrypted communication for your safety."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
              >
                <div className="mb-6 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <Heart className="w-6 h-6" />, label: "Pets Reunited", value: "1,200+" },
              { icon: <Users className="w-6 h-6" />, label: "Community Members", value: "5,000+" },
              { icon: <PawPrint className="w-6 h-6" />, label: "Active Reports", value: "450+" },
              { icon: <ShieldCheck className="w-6 h-6" />, label: "Success Rate", value: "85%" }
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-center text-orange-500">{stat.icon}</div>
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            Every Second Counts. <br />
            Join the Community Today.
          </h2>
          <p className="text-orange-100 mb-10 text-lg font-medium">
            Help us build a safer world for our furry friends. Sign up to receive alerts and report sightings.
          </p>
          <Link
            to="/auth"
            className="bg-white text-orange-500 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
