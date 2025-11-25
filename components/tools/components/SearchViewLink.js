import SearchView from '../../nav/SearchView';
import NavLink from './NavLink';
import {View,Text,TouchableOpacity,Modal} from "react-native";
import {useState} from 'react'

export default function SearchViewLink(props){
  console.log("SEARCH VIEW LINK");
  const [show_modal,setShowModal] = useState(false);
  return (
    <NavLink 
      icon="search" 
      onPress={()=>{
        setShowModal(true);
      }}
      theme={props.theme}
    >
    <Modal 
      visible={show_modal}
      onRequestClose={()=>{
        setShowModal(false);
      }}
      transparent
    >
      <SearchView />
    </Modal>
  </NavLink>);
}