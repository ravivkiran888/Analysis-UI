import Header from "@/components/header/Header";
import UsdInrWidget from "@/components/UsdInrWidget";

const Hero = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Dashboard Content */}
      <div className="flex gap-6 p-6">
        {/* Left Widgets */}
        <div className="w-[340px]">
          <UsdInrWidget />
        </div>

        {/* Main Area */}
        <div className="flex-1">
          {/* charts / tables later */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
