import React, { useState } from 'react';
import { Search } from 'lucide-react'; // Imports a magnifying glass icon

function SearchBar() {
  // 'State' is how React remembers what the user types into the input box
  const [url, setUrl] = useState('');

  // This function runs when the user clicks the "Scan" button
  const handleScan = () => {
    if (!url) return; // If the box is empty, do nothing
    alert(`Scanning this link: ${url}`); 
    // Later, we will replace this alert with real AI backend logic!
  };

  return (
    
      {/* The Magnifying Glass Icon */}
      
      
      {/* The Text Input Area */}
       setUrl(e.target.value)} // Updates the 'state' as they type
        className="flex-1 bg-transparent text-white px-3 py-2 outline-none w-full placeholder-gray-500"
      />
      
      {/* The Scan Button */}
      
        Scan
      
    
  );
}

export default SearchBar;