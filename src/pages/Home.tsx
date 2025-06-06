
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-krishi-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Heading 
            as="h1" 
            size="3xl" 
            className="text-krishi-800 mb-6 max-w-3xl mx-auto"
          >
            Connecting Farmers with Experts & Resources
          </Heading>
          <Text 
            size="lg" 
            className="mb-8 max-w-2xl mx-auto text-gray-600"
          >
            Krishi-Samadhan is your one-stop platform for agricultural solutions, expert advice, and resource management for sustainable farming.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-krishi-600 hover:bg-krishi-700">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Heading as="h2" size="xl" className="text-center mb-12 text-krishi-800">
            How Krishi-Samadhan Works
          </Heading>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* For Farmers */}
            <div className="bg-krishi-50 p-6 rounded-lg border border-krishi-100">
              <div className="h-12 w-12 bg-krishi-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🌾</span>
              </div>
              <Heading as="h3" size="md" className="text-center mb-3">
                For Farmers
              </Heading>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-krishi-500 mr-2">✓</span>
                  <span>Get real-time weather updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-krishi-500 mr-2">✓</span>
                  <span>Ask questions to agricultural experts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-krishi-500 mr-2">✓</span>
                  <span>Track your questions and get timely solutions</span>
                </li>
              </ul>
            </div>
            
            {/* For Experts */}
            <div className="bg-sky-50 p-6 rounded-lg border border-sky-100">
              <div className="h-12 w-12 bg-sky-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <Heading as="h3" size="md" className="text-center mb-3">
                For Experts
              </Heading>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">✓</span>
                  <span>Answer farmer queries and provide guidance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">✓</span>
                  <span>Share your agricultural expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">✓</span>
                  <span>Track your contributions and help history</span>
                </li>
              </ul>
            </div>
            
            {/* For Vendors */}
            <div className="bg-earth-50 p-6 rounded-lg border border-earth-100">
              <div className="h-12 w-12 bg-earth-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🏪</span>
              </div>
              <Heading as="h3" size="md" className="text-center mb-3">
                For Vendors
              </Heading>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-earth-500 mr-2">✓</span>
                  <span>Manage and list your warehouses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-earth-500 mr-2">✓</span>
                  <span>Connect with farmers for storage solutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-earth-500 mr-2">✓</span>
                  <span>Streamline your agricultural business</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-krishi-700 to-krishi-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <Heading as="h2" size="xl" className="mb-6">
            Join Krishi-Samadhan Today
          </Heading>
          <Text size="lg" className="mb-8 max-w-2xl mx-auto">
            Whether you're a farmer seeking advice, an expert willing to share knowledge,
            or a vendor providing resources – we have solutions tailored for you.
          </Text>
          <Button asChild size="lg" className="bg-white text-krishi-800 hover:bg-gray-100">
            <Link to="/register">Sign Up Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
