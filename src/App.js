// 
// 
// Barış Önurme 29 Ekim 2022
// Telefon: 507 336 30 96
// Email: barisonurme@icloud.com
// 
// 

import { useState } from "react";
import Login from "./components/Login";
import TCMB from "./components/TCMB";

function App() {
  // Login state kontrolü
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const loginHandler = (state) => {
    setIsLoggedIn(state);
  };

  return (
    <div className="flex justify-center items-center">
      {!isLoggedIn && <Login onLogin={loginHandler} />}
      {isLoggedIn && <TCMB />}
    </div>
  );
}

export default App;
