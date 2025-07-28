import React,{createContext,useState} from "react"

export const AppContext = createContext();

export const AppWrapper = (props)=>{
  [user,setUser] = useState();
  return (
  <AppContext.Provider value={{user,setUser}}>
    {props.children}
  </AppContext.Provider>);
}