"use client";
import React, { createContext, useState, useContext } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, setResults }}>
      {children}
    </SearchContext.Provider>
  );
};

// ✅ Custom hook
export const useSearch = () => useContext(SearchContext);
