const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About Bald Foodie Guy
        </h1>
        <div className="w-32 h-32 mx-auto mb-6">
          <img
            src="https://via.placeholder.com/128x128?text=BFG"
            alt="Bald Foodie Guy"
            className="w-full h-full rounded-full object-cover border-4 border-primary-500"
          />
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
            Your Supermarket Food Guide
          </h2>
          <p className="text-gray-700 mb-4">
            Hey there, food lovers! I'm the Bald Foodie Guy, and I'm passionate about helping you 
            make smart choices when shopping for food. I test products from local supermarkets so 
            you don't have to waste your money on disappointing purchases.
          </p>
          <p className="text-gray-700 mb-4">
            This site provides easy-to-browse video summaries of my honest supermarket food reviews. 
            Whether you're looking for quick meals, snacks, or ingredients, I'll tell you what's 
            worth your hard-earned cash and what to skip.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
              What You'll Find Here
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Honest supermarket product reviews</li>
              <li>• Ready meal and convenience food tests</li>
              <li>• Snack and treat evaluations</li>
              <li>• Value-for-money assessments</li>
              <li>• Video summaries for quick browsing</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
              My Philosophy
            </h3>
            <p className="text-gray-700">
              Food is more than sustenance—it's culture, memory, and connection. 
              I believe in making great food accessible to everyone, regardless of 
              skill level or budget. Let's cook, learn, and grow together!
            </p>
          </div>
        </div>

        <div className="bg-primary-50 rounded-lg p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-gray-900 mb-4">
            Join the Community
          </h3>
          <p className="text-gray-700 mb-6">
            Subscribe to stay updated with my latest adventures and never miss a recipe!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
              Subscribe on YouTube
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors">
              Follow on Instagram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;